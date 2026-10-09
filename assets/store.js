/* ListinoRapido — livello dati della dashboard.
 *
 * Modalità demo     (assets/config.js vuoto, oppure dashboard.html?demo=1): dati di prova nel localStorage.
 * Modalità Supabase (assets/config.js compilato): account, attività, categorie, servizi e foto reali.
 *
 * La dashboard lavora sempre sullo stesso oggetto di stato:
 *   { mode, plan, email, userId, business:{ id, slug, name, tagline:{it}, whatsapp, cover },
 *     categories:[ { id, name:{it}, items:[ { id, name:{it}, desc:{it}, price, min, img } ] } ] }
 * e chiama le funzioni qui sotto per salvare ogni modifica.
 */
(function () {
  const cfg = window.LR_CONFIG || {};
  const configured = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);
  const forceDemo = new URLSearchParams(location.search).has('demo');   // dashboard.html?demo=1
  const live = configured && !!window.supabase && !forceDemo;
  const sb = live ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;

  const KEY = 'lr_demo_data_v1';
  const BUCKET = 'service-images';
  const MAX_INPUT = 15 * 1024 * 1024;
  const COVER = (window.LR && LR.DATA.business.cover) || '';   // foto di esempio mostrata finché non ne carichi una tua
  let S = null;

  const uuid = () => (crypto.randomUUID
    ? crypto.randomUUID()
    : '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) =>
        (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)));

  const cents = (p) => Math.round(Number(p) * 100);

  // Traduce gli errori del database in messaggi comprensibili
  function fail(error) {
    if (!error) return;
    const m = String(error.message || '');
    if (/massimo 10 servizi/i.test(m)) throw new Error('Hai raggiunto il limite di 10 servizi del piano Free.');
    if (error.code === '23505') throw new Error('Questo link è già usato da un\'altra attività: scegline un altro.');
    throw new Error(m || 'Operazione non riuscita. Riprova.');
  }

  function makeSlug(email) {
    const base = String(email || 'attivita').split('@')[0].toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 24) || 'attivita';
    return base + '-' + Math.random().toString(36).slice(2, 6);
  }

  const toItem = (r) => ({
    id: r.id,
    name: Object.assign({}, r.name_i18n, { it: r.name }),
    desc: Object.assign({}, r.description_i18n, { it: r.description || '' }),
    price: r.price_cents / 100,
    min: r.duration_min || 0,
    img: r.image_url || '',
    visible: r.visible !== false
  });

  const demoSave = () => {
    try { localStorage.setItem(KEY, JSON.stringify(S)); }
    catch (e) { throw new Error('Spazio del browser esaurito: usa foto più piccole o ripristina i dati di prova.'); }
  };

  // ---------- Foto: ridimensionamento nel browser (JPEG) ----------
  async function toBlob(file, maxSide, quality) {
    if (!file || !/^image\//.test(file.type)) throw new Error('Scegli un file immagine (JPG, PNG o WebP).');
    if (file.size > MAX_INPUT) throw new Error('La foto è troppo pesante (massimo 15 MB).');
    let bmp;
    try { bmp = await createImageBitmap(file); }
    catch (e) {
      bmp = await new Promise((res, rej) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = () => rej(new Error('Impossibile leggere questa immagine. Prova con un JPG o un PNG.'));
        i.src = URL.createObjectURL(file);
      });
    }
    const w = bmp.width || bmp.naturalWidth, h = bmp.height || bmp.naturalHeight;
    const k = Math.min(1, maxSide / Math.max(w, h));
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w * k)); c.height = Math.max(1, Math.round(h * k));
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);   // sfondo per i PNG trasparenti
    ctx.drawImage(bmp, 0, 0, c.width, c.height);
    return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('Impossibile elaborare la foto.'))), 'image/jpeg', quality));
  }
  const toDataUrl = (blob) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = () => rej(new Error('Lettura della foto non riuscita.'));
    r.readAsDataURL(blob);
  });

  async function init() {
    // Configurato ma libreria non caricata: errore, mai demo silenziosa con dati finti
    if (configured && !forceDemo && !live) throw new Error('impossibile contattare Supabase. Ricarica la pagina o disattiva il blocco pubblicità.');
    if (!live) {
      let saved = null;
      try { saved = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
      const base = saved && saved.categories ? saved : LR.freeData();
      S = {
        mode: 'demo', plan: 'free', email: localStorage.getItem('lr_user') || '', userId: 'demo',
        business: Object.assign({ slug: 'demo' }, base.business),
        categories: base.categories
      };
      return S;
    }

    const { data: { session } } = await sb.auth.getSession();
    if (!session) { location.href = 'accedi.html'; return null; }
    const user = session.user;

    let { data: venue, error } = await sb.from('venues').select('*')
      .eq('owner_id', user.id).order('created_at').limit(1).maybeSingle();
    fail(error);
    if (!venue) {            // primo accesso: crea l'attività (sempre piano Free)
      ({ data: venue, error } = await sb.from('venues')
        .insert({ owner_id: user.id, slug: makeSlug(user.email), name: 'La mia attività' }).select().single());
      fail(error);
    }

    const [c, s] = await Promise.all([
      sb.from('categories').select('*').eq('venue_id', venue.id).order('position'),
      sb.from('services').select('*').eq('venue_id', venue.id).order('position')
    ]);
    fail(c.error); fail(s.error);

    S = {
      mode: 'supabase', plan: venue.plan, email: user.email, userId: user.id,
      business: {
        id: venue.id, slug: venue.slug, name: venue.name,
        tagline: { it: venue.tagline || '' }, whatsapp: venue.whatsapp || '', cover: venue.cover_url || COVER
      },
      categories: c.data.map((x) => ({
        id: x.id,
        name: Object.assign({}, x.name_i18n, { it: x.name }),
        items: s.data.filter((y) => y.category_id === x.id).map(toItem)
      }))
    };
    return S;
  }

  const Store = {
    live, uuid, init, defaultCover: COVER,

    async addCategory(cat, position) {
      if (!live) return demoSave();
      fail((await sb.from('categories').insert({ id: cat.id, venue_id: S.business.id, name: cat.name.it, position })).error);
    },
    async renameCategory(cat) {
      if (!live) return demoSave();
      fail((await sb.from('categories').update({ name: cat.name.it }).eq('id', cat.id)).error);
    },
    async deleteCategory(id) {
      if (!live) return demoSave();
      fail((await sb.from('categories').delete().eq('id', id)).error);
    },

    // INSERT esplicito (mai upsert): il limite Free sul database scatta a ogni INSERT
    async addService(catId, it, position) {
      if (!live) return demoSave();
      fail((await sb.from('services').insert({
        id: it.id, venue_id: S.business.id, category_id: catId, name: it.name.it,
        description: it.desc.it || null, price_cents: cents(it.price),
        duration_min: it.min || null, image_url: it.img || null, position
      })).error);
    },
    // Aggiorna tutti i campi modificabili: nome, descrizione, prezzo, durata, foto, categoria
    async updateService(it, catId) {
      if (!live) return demoSave();
      fail((await sb.from('services').update({
        name: it.name.it, description: it.desc.it || null,
        price_cents: cents(it.price), duration_min: it.min || null,
        image_url: it.img || null, category_id: catId
      }).eq('id', it.id)).error);
    },
    async deleteService(id) {
      if (!live) return demoSave();
      fail((await sb.from('services').delete().eq('id', id)).error);
    },

    async updateBusiness() {
      if (!live) return demoSave();
      const b = S.business;
      fail((await sb.from('venues').update({
        name: b.name, tagline: b.tagline.it || null, whatsapp: b.whatsapp || null, slug: b.slug,
        cover_url: b.cover && b.cover !== COVER ? b.cover : null
      }).eq('id', b.id)).error);
    },

    // Carica una foto (kind: 'service' | 'cover') e restituisce l'indirizzo da salvare.
    // Supabase: file ridimensionato e caricato nel bucket "service-images", cartella dell'utente.
    // Demo: foto piccola salvata come testo nel browser.
    async uploadImage(file, kind) {
      const cover = kind === 'cover';
      if (!live) return toDataUrl(await toBlob(file, cover ? 900 : 480, 0.72));
      const blob = await toBlob(file, cover ? 1600 : 1000, 0.82);
      const path = `${S.userId}/${kind}-${uuid()}.jpg`;
      const { error } = await sb.storage.from(BUCKET).upload(path, blob, { contentType: 'image/jpeg', cacheControl: '31536000' });
      if (error) throw new Error('Caricamento foto non riuscito: ' + (error.message || 'riprova.'));
      return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    },
    // Elimina dal bucket la vecchia foto (se è una nostra): errori ignorati, non blocca nulla
    async removeImage(url) {
      if (!live || !url) return;
      const m = String(url).match(/\/object\/public\/service-images\/(.+)$/);
      if (!m) return;
      try { await sb.storage.from(BUCKET).remove([decodeURIComponent(m[1])]); } catch (e) {}
    },

    // Statistiche reali (piano PRO): visite e click WhatsApp registrati dalla pagina pubblica
    async stats() {
      if (!live) return { views: 1248, clicks: 214 };
      const count = async (kind) => {
        const r = await sb.from('page_views').select('id', { count: 'exact', head: true })
          .eq('venue_id', S.business.id).eq('kind', kind);
        fail(r.error);
        return r.count || 0;
      };
      const [views, clicks] = await Promise.all([count('view'), count('whatsapp_click')]);
      return { views, clicks };
    },

    resetDemo() { try { localStorage.removeItem(KEY); } catch (e) {} },

    async logout() {
      if (live) { try { await sb.auth.signOut(); } catch (e) {} }
      try { localStorage.removeItem('lr_user'); } catch (e) {}
      location.href = 'index.html';
    }
  };

  window.LRStore = Store;
})();
