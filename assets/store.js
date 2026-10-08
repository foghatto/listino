/* ListinoRapido — livello dati della dashboard.
 *
 * Modalità demo     (assets/config.js vuoto):    dati di prova nel localStorage del browser.
 * Modalità Supabase (assets/config.js compilato): account, attività, categorie e servizi reali.
 *
 * La dashboard lavora sempre sullo stesso oggetto di stato:
 *   { mode, plan, email, business:{ id, slug, name, tagline:{it}, whatsapp, cover },
 *     categories:[ { id, name:{it}, items:[ { id, name:{it}, desc:{it}, price, min, img } ] } ] }
 * e chiama le funzioni qui sotto per salvare ogni modifica.
 */
(function () {
  const cfg = window.LR_CONFIG || {};
  const live = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && window.supabase);
  const sb = live ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;

  const KEY = 'lr_demo_data_v1';
  const COVER = (window.LR && LR.DATA.business.cover) || '';
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

  const demoSave = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };

  async function init() {
    if (!live) {
      let saved = null;
      try { saved = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
      const base = saved && saved.categories ? saved : LR.freeData();
      S = {
        mode: 'demo', plan: 'free', email: localStorage.getItem('lr_user') || '',
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
      mode: 'supabase', plan: venue.plan, email: user.email,
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
    live, uuid, init,

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
    async updateService(it) {
      if (!live) return demoSave();
      fail((await sb.from('services').update({
        name: it.name.it, description: it.desc.it || null,
        price_cents: cents(it.price), duration_min: it.min || null
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
        name: b.name, tagline: b.tagline.it || null, whatsapp: b.whatsapp || null, slug: b.slug
      }).eq('id', b.id)).error);
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
