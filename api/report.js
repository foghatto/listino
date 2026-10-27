/* ListinoRapido — segnalazione di un listino da parte di un visitatore.
 *
 * Chi la chiama: il link "Segnala questo listino" nella pagina pubblica (listino.html).
 * Cosa fa: invia un'email all'amministratore (stesse variabili di notify-signup.js, nessun segreto nuovo):
 *   RESEND_API_KEY, ADMIN_NOTIFY_EMAIL, NOTIFY_FROM (facoltativa).
 * Difese anti-spam: campo trappola, lunghezze massime, limite di segnalazioni per indirizzo IP.
 */
const REASONS = {
  illegal: 'Contenuti o servizi illegali',
  adult: 'Contenuti per adulti',
  scam: 'Truffa o contenuto ingannevole',
  rights: 'Violazione di diritti (immagini, marchi)',
  other: 'Altro'
};
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clean = (s, n) => String(s == null ? '' : s).replace(/[\r\n]+/g, ' ').trim().slice(0, n);

const hits = new Map();                       // ip → orari recenti (per istanza: basta a fermare i ripetuti)
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
  if (b.website) return res.status(200).json({ ok: true });          // campo trappola compilato: è un bot, si finge successo

  const slug = clean(b.slug, 60).toLowerCase();
  const reason = REASONS[b.reason] ? b.reason : 'other';
  const details = String(b.details == null ? '' : b.details).trim().slice(0, 1000);
  const replyTo = /^[^\s@]{1,64}@[^\s@]{1,120}\.[^\s@]{2,}$/.test(String(b.email || '').trim()) ? String(b.email).trim() : '';
  if (!/^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/.test(slug)) return res.status(400).json({ error: 'slug' });

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'x';
  if (limited(ip)) return res.status(429).json({ error: 'rate' });

  const origin = 'https://' + (req.headers['x-forwarded-host'] || req.headers.host || 'www.listinorapido.it');
  const link = origin + '/' + slug;
  const html = `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.5;color:#0f172a">
<h2 style="margin:0 0 12px;font-size:18px">Segnalazione di un listino</h2>
<table style="border-collapse:collapse">
<tr><td style="padding:3px 16px 3px 0;color:#64748b">Listino</td><td><a href="${esc(link)}">${esc(link)}</a></td></tr>
<tr><td style="padding:3px 16px 3px 0;color:#64748b">Motivo</td><td><b>${esc(REASONS[reason])}</b></td></tr>
<tr><td style="padding:3px 16px 3px 0;color:#64748b">Email di chi segnala</td><td>${esc(replyTo || '(non indicata)')}</td></tr>
<tr><td style="padding:3px 16px 3px 0;color:#64748b;vertical-align:top">Dettagli</td><td>${esc(details || '(nessuno)').replace(/\n/g, '<br>')}</td></tr>
</table>
<p style="margin-top:16px;color:#64748b;font-size:13px">Per sospenderlo: pannello admin → riga dell'account → Sospendi.</p></div>`;
  const text = `Segnalazione di un listino\nListino: ${link}\nMotivo: ${REASONS[reason]}\nEmail di chi segnala: ${replyTo || '(non indicata)'}\nDettagli: ${details || '(nessuno)'}`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.NOTIFY_FROM || 'ListinoRapido <onboarding@resend.dev>',
        to: to.split(',').map((x) => x.trim()).filter(Boolean),
        subject: 'Segnalazione: ' + slug + ' – ' + REASONS[reason],
        html, text,
        ...(replyTo ? { reply_to: replyTo } : {})
      })
    });
    if (!r.ok) return res.status(502).json({ error: 'send' });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(502).json({ error: 'send' });
  }
};
