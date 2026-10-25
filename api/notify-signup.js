/* ListinoRapido — email all'amministratore quando un nuovo utente crea il proprio listino.
 *
 * Chi la chiama: un trigger di Supabase (supabase/notifica-admin.sql) subito dopo la creazione del listino.
 * Chi la riceve: l'indirizzo in ADMIN_NOTIFY_EMAIL (variabile su Vercel: per cambiarlo non si tocca il codice).
 * Come invia: API di Resend (resend.com), nessuna libreria da installare.
 *
 * Variabili d'ambiente su Vercel (Settings → Environment Variables):
 *   NOTIFY_WEBHOOK_SECRET  stesso segreto scritto nel trigger SQL (obbligatoria)
 *   RESEND_API_KEY         chiave API di Resend (obbligatoria)
 *   ADMIN_NOTIFY_EMAIL     chi riceve l'avviso; si possono indicare più indirizzi separati da virgola (obbligatoria)
 *   NOTIFY_FROM            mittente, es. "ListinoRapido <avvisi@listinorapido.it>" (facoltativa: default onboarding@resend.dev)
 */
const crypto = require('crypto');

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clean = (s, n) => String(s == null ? '' : s).replace(/[\r\n]+/g, ' ').trim().slice(0, n || 200);

function sameSecret(a, b) {
  const x = Buffer.from(String(a || '')), y = Buffer.from(String(b || ''));
  return x.length === y.length && x.length > 0 && crypto.timingSafeEqual(x, y);
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });

  const { NOTIFY_WEBHOOK_SECRET: secret, RESEND_API_KEY: key, ADMIN_NOTIFY_EMAIL: to } = process.env;
  if (!secret || !key || !to) return res.status(500).json({ error: 'not configured' });
  if (!sameSecret(req.headers['x-webhook-secret'], secret)) return res.status(401).json({ error: 'unauthorized' });

  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } }
  b = b || {};

  const name = clean(b.name, 80) || '(senza nome)';
  const slug = clean(b.slug, 60);
  const mail = clean(b.email, 120) || '(sconosciuta)';
  const when = b.created_at ? new Date(b.created_at) : new Date();
  const whenTxt = (isNaN(when) ? new Date() : when).toLocaleString('it-IT', { timeZone: 'Europe/Rome', dateStyle: 'short', timeStyle: 'short' });
  const origin = 'https://' + (req.headers['x-forwarded-host'] || req.headers.host || 'www.listinorapido.it');
  const link = slug ? origin + '/' + encodeURIComponent(slug) : '';

  const html = `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.5;color:#0f172a">
<h2 style="margin:0 0 12px;font-size:18px">Nuovo listino su ListinoRapido</h2>
<table style="border-collapse:collapse">
<tr><td style="padding:3px 16px 3px 0;color:#64748b">Attività</td><td><b>${esc(name)}</b></td></tr>
<tr><td style="padding:3px 16px 3px 0;color:#64748b">Email</td><td>${esc(mail)}</td></tr>
<tr><td style="padding:3px 16px 3px 0;color:#64748b">Quando</td><td>${esc(whenTxt)}</td></tr>
${link ? `<tr><td style="padding:3px 16px 3px 0;color:#64748b">Listino</td><td><a href="${esc(link)}">${esc(link)}</a></td></tr>` : ''}
</table></div>`;
  const text = `Nuovo listino su ListinoRapido\nAttività: ${name}\nEmail: ${mail}\nQuando: ${whenTxt}${link ? '\nListino: ' + link : ''}`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.NOTIFY_FROM || 'ListinoRapido <onboarding@resend.dev>',
        to: to.split(',').map((x) => x.trim()).filter(Boolean),
        subject: 'Nuovo listino: ' + name,
        html, text
      })
    });
    if (!r.ok) { console.error('resend', r.status, (await r.text()).slice(0, 300)); return res.status(502).json({ error: 'mail provider' }); }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('notify-signup', e && e.message);
    return res.status(502).json({ error: 'mail provider' });
  }
};
