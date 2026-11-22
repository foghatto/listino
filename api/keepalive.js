/* ListinoRapido — controllo periodico per tenere attivo il progetto Supabase.
 *
 * I progetti gratuiti di Supabase vanno in pausa dopo circa una settimana senza attività.
 * Vercel chiama questa funzione una volta al giorno (vedi "crons" in vercel.json): fa una piccola
 * lettura sul database, che conta come attività. Usa solo la anon key pubblica.
 *
 * Variabili opzionali su Vercel:
 *   SUPABASE_URL, SUPABASE_ANON_KEY  (se mancano le legge da /assets/config.js)
 *   CRON_SECRET                      (se impostata, la funzione risponde solo a Vercel Cron)
 * Per provarla a mano: apri https://www.listinorapido.it/api/keepalive (con CRON_SECRET non impostata).
 */
let cache = null;

async function getConfig(origin) {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) return { url: process.env.SUPABASE_URL.replace(/\/$/, ''), key: process.env.SUPABASE_ANON_KEY };
  if (cache) return cache;
  const txt = await (await fetch(origin + '/assets/config.js')).text();
  const url = (txt.match(/SUPABASE_URL\s*:\s*['"]([^'"]+)['"]/) || [])[1];
  const key = (txt.match(/SUPABASE_ANON_KEY\s*:\s*['"]([^'"]+)['"]/) || [])[1];
  if (!url || !key) return null;
  return (cache = { url: url.replace(/\/$/, ''), key });
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== 'Bearer ' + secret) return res.status(401).json({ ok: false, error: 'unauthorized' });
  try {
    const origin = 'https://' + (req.headers['x-forwarded-host'] || req.headers.host || 'www.listinorapido.it');
    const cfg = await getConfig(origin);
    if (!cfg) return res.status(500).json({ ok: false, error: 'config' });
    const r = await fetch(cfg.url + '/rest/v1/venues?select=id&limit=1', { headers: { apikey: cfg.key, Authorization: 'Bearer ' + cfg.key } });
    if (!r.ok) {
      console.error('[keepalive] Supabase ha risposto', r.status);
      return res.status(502).json({ ok: false, status: r.status });
    }
    return res.status(200).json({ ok: true, at: new Date().toISOString() });
  } catch (e) {
    console.error('[keepalive] errore', e && e.message);
    return res.status(502).json({ ok: false, error: 'network' });
  }
};
