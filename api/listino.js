/* ListinoRapido — anteprima nelle chat (WhatsApp, Telegram, Facebook…).
 *
 * I link /listino?s=<link> e /listino?s=<link>&servizio=<id> (e /s/<link>) passano da qui:
 * la funzione legge il listino da Supabase e restituisce la stessa pagina statica `listino`
 * con in più i meta tag Open Graph (titolo, descrizione, foto) che WhatsApp mostra nel riquadro.
 * Per i visitatori la pagina funziona esattamente come prima.
 *
 * Usa solo la anon key pubblica (RLS: lettura pubblica). Variabili opzionali su Vercel:
 * SUPABASE_URL e SUPABASE_ANON_KEY; in mancanza le legge da /assets/config.js.
 */
let cfgCache = null;

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (c) => { const n = c / 100; return (Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ',')) + ' €'; };
const clip = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1).trim() + '…' : s; };

async function getConfig(origin) {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) return { url: process.env.SUPABASE_URL, key: process.env.SUPABASE_ANON_KEY };
  if (cfgCache) return cfgCache;
  const txt = await (await fetch(origin + '/assets/config.js')).text();
  const url = (txt.match(/SUPABASE_URL\s*:\s*['"]([^'"]+)['"]/) || [])[1];
  const key = (txt.match(/SUPABASE_ANON_KEY\s*:\s*['"]([^'"]+)['"]/) || [])[1];
  if (!url || !key) return null;
  return (cfgCache = { url: url.replace(/\/$/, ''), key });
}

async function rest(cfg, path) {
  const r = await fetch(cfg.url + '/rest/v1/' + path, { headers: { apikey: cfg.key, Authorization: 'Bearer ' + cfg.key } });
  if (!r.ok) return null;
  return r.json();
}

// Costruisce i meta tag per l'anteprima; restituisce null se il listino non esiste
async function buildMeta(cfg, slug, serviceId, pageUrl, origin) {
  const rows = await rest(cfg, 'venues?slug=eq.' + encodeURIComponent(slug) + '&select=*&limit=1');
  if (rows && !rows.length) return 'notfound';          // il database ha risposto: questo link non esiste
  const v = rows && rows[0];
  if (!v) return null;
  let title = v.name + ' — Listino', desc = clip(v.about || v.tagline || 'Scopri i servizi e prenota su WhatsApp.', 160), image = v.cover_url || '';
  if (serviceId) {
    const s = (await rest(cfg, 'services?id=eq.' + encodeURIComponent(serviceId) + '&venue_id=eq.' + v.id + '&visible=eq.true&select=*&limit=1') || [])[0];
    if (s) {
      const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' });   // YYYY-MM-DD
      const hasPromo = s.old_price_cents && s.old_price_cents > s.price_cents;
      const expired = hasPromo && s.promo_until && String(s.promo_until).slice(0, 10) < today;
      const price = expired ? s.old_price_cents : s.price_cents;                // promo scaduta: prezzo pieno
      const promo = hasPromo && !expired;
      const until = promo && s.promo_until ? String(s.promo_until).slice(0, 10).split('-').reverse().slice(0, 2).join('/') : '';
      title = s.name + ' · ' + money(price) + (promo ? ' (era ' + money(s.old_price_cents) + ')' : '') + (until ? ' · fino al ' + until : '');
      desc = clip((s.description ? s.description + ' — ' : '') + v.name + '. Prenota su WhatsApp.', 180);
      image = s.image_url || image;
    }
  }
  if (!image) image = origin + '/assets/og-default.png';
  return `
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${esc(v.name)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:image" content="${esc(image)}">
  <meta property="og:url" content="${esc(pageUrl)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(desc)}">
  <meta name="twitter:image" content="${esc(image)}">`;
}

module.exports = async (req, res) => {
  const host = req.headers['x-forwarded-host'] || req.headers.host || '';
  const origin = 'https://' + host;
  let q = req.query;
  if (!q) q = Object.fromEntries(new URL(req.url, origin).searchParams);
  const slug = String(q.s || '').toLowerCase();
  const serviceId = String(q.servizio || '');
  try {
    // Pagina statica (senza parametri, quindi senza passare di nuovo da questa funzione)
    const base = await (await fetch(origin + '/listino')).text();
    let html = base, notFound = false;
    if (/^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/.test(slug) && /^[A-Za-z0-9-]{0,64}$/.test(serviceId)) {
      const cfg = await getConfig(origin);
      const pageUrl = origin + '/' + slug + (serviceId ? '?servizio=' + encodeURIComponent(serviceId) : '');
      const meta = cfg && await buildMeta(cfg, slug, serviceId, pageUrl, origin);
      if (meta === 'notfound') notFound = true;
      else if (meta) html = base.replace(/<title>[\s\S]*?<\/title>/i, '').replace(/<\/head>/i, meta + '\n</head>');
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=600');
    res.status(notFound ? 404 : 200).send(html);
  } catch (e) {
    res.setHeader('Location', '/listino.html?s=' + encodeURIComponent(slug));
    res.status(302).end();
  }
};
