/* ListinoRapido — dati di prova + renderer del listino (usato da landing, dashboard e demo PRO) */
(function () {
  const IMG = (id, w) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w || 400}&q=70`;

  const DATA = {
    business: {
      name: 'Studio Aurora',
      tagline: { it: 'Estetica & Benessere', en: 'Beauty & Wellness', fr: 'Beauté & Bien-être' },
      whatsapp: '393331234567',
      cover: IMG('photo-1560066984-138dadb4c035', 800)
    },
    categories: [
      {
        id: 'viso',
        name: { it: 'Viso', en: 'Face', fr: 'Visage' },
        items: [
          { id: 's1', name: { it: 'Pulizia del viso profonda', en: 'Deep facial cleansing', fr: 'Nettoyage de peau profond' }, desc: { it: 'Detersione, vapore, estrazione e maschera idratante.', en: 'Cleansing, steam, extraction and hydrating mask.', fr: 'Nettoyage, vapeur, extraction et masque hydratant.' }, price: 45, min: 60, img: IMG('photo-1570172619644-dfd03ed5d881', 300) },
          { id: 's2', name: { it: 'Trattamento anti-età', en: 'Anti-aging treatment', fr: 'Soin anti-âge' }, desc: { it: 'Siero attivo, massaggio lifting e maschera rassodante.', en: 'Active serum, lifting massage and firming mask.', fr: 'Sérum actif, massage liftant et masque raffermissant.' }, price: 65, min: 75, img: IMG('photo-1519823551278-64ac92734fb1', 300) },
          { id: 's7', proOnly: true, name: { it: 'Maschera illuminante', en: 'Brightening mask', fr: 'Masque éclat' }, desc: { it: 'Luminosità immediata prima di un evento.', en: 'Instant glow before a special event.', fr: 'Éclat immédiat avant un événement.' }, price: 35, min: 40, img: IMG('photo-1570172619644-dfd03ed5d881', 300) }
        ]
      },
      {
        id: 'mani',
        name: { it: 'Mani & Piedi', en: 'Hands & Feet', fr: 'Mains & Pieds' },
        items: [
          { id: 's3', name: { it: 'Manicure semipermanente', en: 'Gel manicure', fr: 'Manucure semi-permanente' }, desc: { it: 'Cura delle cuticole, forma e smalto semipermanente.', en: 'Cuticle care, shaping and gel polish.', fr: 'Soin des cuticules, forme et vernis semi-permanent.' }, price: 28, min: 45, img: IMG('photo-1604654894610-df63bc536371', 300) },
          { id: 's4', name: { it: 'Pedicure estetica', en: 'Classic pedicure', fr: 'Pédicure esthétique' }, desc: { it: 'Bagno rilassante, scrub, cura e smalto.', en: 'Relaxing soak, scrub, care and polish.', fr: 'Bain relaxant, gommage, soin et vernis.' }, price: 35, min: 50, img: IMG('photo-1519823551278-64ac92734fb1', 300) },
          { id: 's8', proOnly: true, name: { it: 'Ricostruzione unghie', en: 'Nail extensions', fr: "Pose d'ongles" }, desc: { it: 'Gel o acrilico, forma su misura.', en: 'Gel or acrylic, custom shape.', fr: 'Gel ou acrylique, forme sur mesure.' }, price: 55, min: 90, img: IMG('photo-1604654894610-df63bc536371', 300) }
        ]
      },
      {
        id: 'capelli',
        name: { it: 'Capelli', en: 'Hair', fr: 'Cheveux' },
        items: [
          { id: 's5', name: { it: 'Taglio + piega', en: 'Cut & blow-dry', fr: 'Coupe + brushing' }, desc: { it: 'Consulenza, shampoo, taglio su misura e piega.', en: 'Consultation, shampoo, tailored cut and styling.', fr: 'Conseil, shampoing, coupe sur mesure et brushing.' }, price: 40, min: 60, img: IMG('photo-1522337360788-8b13dee7a37e', 300) },
          { id: 's6', name: { it: 'Colore + trattamento', en: 'Colour + treatment', fr: 'Couleur + soin' }, desc: { it: 'Colorazione, trattamento ristrutturante e piega.', en: 'Colouring, restorative treatment and styling.', fr: 'Coloration, soin restructurant et brushing.' }, price: 70, min: 120, img: IMG('photo-1487412947147-5cebf100ffc2', 300) },
          { id: 's9', proOnly: true, name: { it: 'Balayage', en: 'Balayage', fr: 'Balayage' }, desc: { it: 'Sfumature naturali effetto sole.', en: 'Natural, sun-kissed highlights.', fr: 'Reflets naturels effet soleil.' }, price: 120, min: 180, img: IMG('photo-1522337360788-8b13dee7a37e', 300) }
        ]
      }
    ]
  };

  // Categoria extra visibile solo nel piano PRO (dimostra i servizi illimitati)
  DATA.categories.push({
    id: 'corpo',
    name: { it: 'Corpo', en: 'Body', fr: 'Corps' },
    items: [
      { id: 's10', proOnly: true, name: { it: 'Massaggio rilassante', en: 'Relaxing massage', fr: 'Massage relaxant' }, desc: { it: 'Oli caldi e manovre distensive.', en: 'Warm oils and soothing strokes.', fr: 'Huiles chaudes et gestes apaisants.' }, price: 60, min: 50, img: IMG('photo-1544161515-4ab6ce6db874', 300) },
      { id: 's11', proOnly: true, name: { it: 'Ceretta gambe complete', en: 'Full leg waxing', fr: 'Épilation jambes complètes' }, desc: { it: 'Cera delicata, pelle liscia più a lungo.', en: 'Gentle wax, smooth skin for longer.', fr: 'Cire douce, peau lisse plus longtemps.' }, price: 30, min: 40, img: IMG('photo-1519823551278-64ac92734fb1', 300) },
      { id: 's12', proOnly: true, name: { it: 'Scrub corpo al sale marino', en: 'Sea-salt body scrub', fr: 'Gommage corps au sel marin' }, desc: { it: 'Esfoliazione e idratazione profonda.', en: 'Exfoliation and deep hydration.', fr: 'Exfoliation et hydratation profonde.' }, price: 45, min: 45, img: IMG('photo-1540555700478-4be289fbecef', 300) }
    ]
  });

  const T = {
    it: { book: 'Prenota su WhatsApp', short: 'Prenota', min: 'min', powered: 'Creato con ListinoRapido', free: 'Piano Free', all: 'Tutti' },
    en: { book: 'Book on WhatsApp', short: 'Book', min: 'min', powered: 'Made with ListinoRapido', free: 'Free plan', all: 'All' },
    fr: { book: 'Réserver sur WhatsApp', short: 'Réserver', min: 'min', powered: 'Créé avec ListinoRapido', free: 'Offre Free', all: 'Tous' }
  };

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const eur = (n) => Number(n).toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' €';

  /* Disegna il listino in un contenitore. opts: { pro, lang, data, onView } */
  function renderListino(el, opts) {
    const o = Object.assign({ pro: false, lang: 'it', data: DATA }, opts || {});
    const d = o.data, t = T[o.lang] || T.it, lang = T[o.lang] ? o.lang : 'it';
    const wa = (name) => `https://wa.me/${d.business.whatsapp}?text=${encodeURIComponent((lang === 'en' ? 'Hi, I would like to book: ' : lang === 'fr' ? 'Bonjour, je souhaite réserver : ' : 'Ciao, vorrei prenotare: ') + name)}`;
    const nm = (x) => (x && (x[lang] || x.it)) || '';

    // I servizi "proOnly" compaiono solo nel piano PRO (il Free ne mostra max 10)
    const cats = d.categories
      .map((c) => Object.assign({}, c, { items: c.items.filter((i) => o.pro || !i.proOnly) }))
      .filter((c) => c.items.length);
    let html = `
      <div class="relative h-36 img-fallback">
        <img src="${esc(d.business.cover)}" alt="" class="absolute inset-0 w-full h-full object-cover opacity-70" loading="lazy" onerror="this.remove()">
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
        <div class="absolute bottom-3 left-4 right-4">
          <p class="text-[11px] uppercase tracking-widest text-emerald-400">${esc(nm(d.business.tagline))}</p>
          <h3 class="text-xl font-bold text-white">${esc(d.business.name)}</h3>
        </div>
      </div>
      <div class="sticky top-0 z-10 bg-slate-950/95 backdrop-blur px-3 py-2 flex gap-2 overflow-x-auto border-b border-slate-800" style="scrollbar-width:none">
        ${cats.map((c, i) => `<a href="#" data-cat="${esc(c.id)}" class="cat-pill shrink-0 text-xs px-3 py-1.5 rounded-full border ${i === 0 ? 'border-emerald-500 text-emerald-400' : 'border-slate-700 text-slate-300'}">${esc(nm(c.name))}</a>`).join('')}
      </div>
      <div class="px-3 pb-6">`;

    cats.forEach((c) => {
      html += `<h4 id="cat-${esc(c.id)}-${el.id || 'x'}" class="mt-5 mb-2 text-sm font-semibold text-emerald-400">${esc(nm(c.name))}</h4><div class="space-y-3">`;
      c.items.forEach((it) => {
        html += `
        <div class="flex gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-2.5">
          <div class="w-16 h-16 shrink-0 rounded-lg overflow-hidden img-fallback">
            ${it.img ? `<img src="${esc(it.img)}" alt="${esc(nm(it.name))}" class="w-full h-full object-cover" loading="lazy" onerror="this.remove()">` : ''}
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between gap-2">
              <p class="text-[13px] font-semibold text-white leading-tight">${esc(nm(it.name))}</p>
              <p class="text-sm font-bold text-emerald-400 whitespace-nowrap">${eur(it.price)}</p>
            </div>
            <p class="mt-0.5 text-[11px] text-slate-400 leading-snug line-clamp-2">${esc(nm(it.desc))}</p>
            <div class="mt-1.5 flex items-center justify-between">
              <span class="whitespace-nowrap text-[11px] text-slate-500">${esc(it.min)} ${t.min}</span>
              <a href="${wa(nm(it.name))}" target="_blank" rel="noopener" data-book="${esc(it.id)}" title="${esc(t.book)}" class="whitespace-nowrap text-[11px] font-semibold text-emerald-400 hover:text-emerald-300">${esc(t.short)} →</a>
            </div>
          </div>
        </div>`;
      });
      html += `</div>`;
    });

    html += o.pro
      ? `<p class="mt-8 text-center text-[10px] text-slate-600">${esc(d.business.name)} · Listino digitale</p>`
      : `<a href="/" class="mt-8 mx-auto flex w-fit items-center gap-1.5 rounded-full border border-slate-800 px-3 py-1.5 text-[10px] text-slate-400"><span class="text-emerald-400">●</span> ${esc(t.powered)}</a>`;
    html += `</div>`;

    el.innerHTML = html;

    // Click sulle categorie: scroll interno al contenitore
    el.querySelectorAll('.cat-pill').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const target = el.querySelector('#cat-' + a.dataset.cat + '-' + (el.id || 'x'));
        if (target) el.scrollTo({ top: target.offsetTop - 52, behavior: 'smooth' });
        el.querySelectorAll('.cat-pill').forEach((p) => { p.className = p.className.replace('border-emerald-500 text-emerald-400', 'border-slate-700 text-slate-300'); });
        a.className = a.className.replace('border-slate-700 text-slate-300', 'border-emerald-500 text-emerald-400');
      });
    });
    if (o.onView) el.querySelectorAll('[data-book]').forEach((b) => b.addEventListener('click', () => o.onView(b.dataset.book)));
  }

  /* Copia dei dati di prova senza i servizi riservati al PRO (punto di partenza della dashboard Free) */
  function freeData() {
    const d = JSON.parse(JSON.stringify(DATA));
    d.categories = d.categories
      .map((c) => Object.assign(c, { items: c.items.filter((i) => !i.proOnly) }))
      .filter((c) => c.items.length);
    return d;
  }

  window.LR = { DATA, T, renderListino, esc, eur, IMG, freeData };
})();
