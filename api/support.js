/* ListinoRapido — richieste di aiuto dal pulsante "Aiuto" del sito (assets/help.js).
 *
 * Invia una email all'amministratore (RESEND_API_KEY, ADMIN_NOTIFY_EMAIL, NOTIFY_FROM, come notify-signup.js).
 * Rispondendo alla email, la risposta va all'indirizzo indicato dall'utente (reply_to).
 * Difese anti-spam: campo trappola, lunghezze massime, max 5 richieste/ora per IP.
 */
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clean = (s, n) => String(s == null ? '' : s).replace(/[\r\n]+/g, ' ').trim().slice(0, n);
const hits = new Map();
function limited(ip) {
  const now = Date.now(), list = (hits.get(ip) || []).filter((t) => now - t < 3600e3);
  if (list.length >= 5) { hits.set(ip, list); return true; }
  list.push(now); hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return false;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  const { RESEND_API_KEY: key, ADMIN_NOTIFY_EMAIL: to } = process.env;
  if (!key || !to) return res.status(500).json({ error: 'not configured' });

  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } }
  b = b || {};
  if (b.website) return res.status(200).json({ ok: true });                 // campo trappola: è un bot

  const email = String(b.email || '').trim();
  const message = String(b.message || '').trim().slice(0, 2000);
  if (!/^[^\s@]{1,64}@[^\s@]{1,120}\.[^\s@]{2,}$/.test(email)) return res.status(400).json({ error: 'email' });
  if (message.length < 10) return res.status(400).json({ error: 'message' });
  const slug = clean(b.slug, 60), page = clean(b.page, 80);

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'x';
  if (limited(ip)) return res.status(429).json({ error: 'rate' });

  const origin = 'https://' + (req.headers['x-forwarded-host'] || req.headers.host || 'www.listinorapido.it');
  const html = `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.5;color:#0f172a">
<h2 style="margin:0 0 12px;font-size:18px">Richiesta di aiuto</h2>
<table style="border-collapse:collapse">
<tr><td style="padding:3px 16px 3px 0;color:#64748b">Email</td><td><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
<tr><td style="padding:3px 16px 3px 0;color:#64748b">Pagina</td><td>${esc(page || '(non indicata)')}</td></tr>
<tr><td style="padding:3px 16px 3px 0;color:#64748b">Listino</td><td>${slug ? `<a href="${esc(origin + '/' + slug)}">${esc(origin + '/' + slug)}</a>` : '(nessuno)'}</td></tr>
</table>
<p style="margin:14px 0 4px;color:#64748b">Messaggio</p>
<p style="margin:0;padding:12px 14px;background:#f1f5f9;border-radius:10px">${esc(message).replace(/\n/g, '<br>')}</p>
<p style="margin-top:16px;color:#64748b;font-size:13px">Rispondi a questa email: la risposta arriva all'utente.</p></div>`;
  const text = `Richiesta di aiuto\nEmail: ${email}\nPagina: ${page || '-'}\nListino: ${slug ? origin + '/' + slug : '-'}\n\n${message}`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.NOTIFY_FROM || 'ListinoRapido <onboarding@resend.dev>',
        to: to.split(',').map((x) => x.trim()).filter(Boolean),
        reply_to: email,
        subject: 'Supporto: ' + clean(message, 60),
        html, text
      })
    });
    if (!r.ok) return res.status(502).json({ error: 'send' });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(502).json({ error: 'send' });
  }
};
