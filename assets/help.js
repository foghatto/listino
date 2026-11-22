/* ListinoRapido — pulsante "Aiuto" (risposte rapide + modulo per scriverci).
 * Uso: <script src="assets/help.js" defer></script> in fondo alla pagina.
 * Facoltativo: window.LR_HELP_CTX = { email, slug } per precompilare l'email e indicare il listino.
 * Il modulo invia a /api/support. Tutto lo stile è qui dentro: nessuna dipendenza.
 */
(function () {
  if (window.__lrHelp) return; window.__lrHelp = true;
  var FAQ = [
    ['Come creo il mio listino?', 'Registrati e conferma la tua email, poi entra in <b>Servizi</b>: aggiungi categorie e servizi con prezzo, durata e foto. In <b>Anteprima</b> vedi subito come lo vedranno i clienti.'],
    ['Dove trovo il QR code e il link?', 'Nella sezione <b>QR code e link</b>: copi il link del tuo listino e scarichi o stampi la locandina con il QR da appendere in negozio.'],
    ['Come cambio un prezzo o faccio una promozione?', 'In <b>Servizi</b> apri il servizio e cambia il prezzo. Per una promozione scrivi in "Prezzo" il prezzo scontato, in "Prezzo prima della promo" quello vecchio e, se vuoi, fino a quando vale.'],
    ['Come cambio nome, WhatsApp o altre informazioni?', 'Nella sezione <b>Profilo</b> puoi modificare il nome dell\'attività, la frase di presentazione, il numero WhatsApp e la copertina.'],
    ['Non mi arriva l\'email di conferma', 'Aspetta qualche minuto e controlla la cartella spam o "Promozioni". Verifica di aver scritto bene l\'indirizzo. Se non arriva, scrivici da qui sotto.'],
    ['Ho dimenticato la password', 'Nella pagina di accesso clicca <b>Password dimenticata?</b>, inserisci la tua email e segui il link che ti arriva.'],
    ['Come elimino il mio account?', 'In <b>Profilo</b>, in fondo, trovi "Elimina il mio account": cancella in modo definitivo account, listino e foto.'],
    ['È gratuito?', 'Sì, per ora il servizio è gratuito. Il piano PRO non è ancora acquistabile.']
  ];
  var css = '' +
    '.lrh-b{position:fixed;right:16px;bottom:16px;bottom:max(16px,env(safe-area-inset-bottom,0px));z-index:2147482000;display:inline-flex;align-items:center;gap:8px;padding:11px 18px;border:1px solid rgba(52,211,153,.5);border-radius:999px;background:#064e3b;color:#ecfdf5;font:600 14px/1 Inter,system-ui,sans-serif;cursor:pointer;box-shadow:0 8px 30px rgba(0,0,0,.45)}' +
    '.lrh-b:hover{background:#047857}.lrh-b:focus-visible,.lrh-x:focus-visible,.lrh-q:focus-visible,.lrh-t:focus-visible,.lrh-f input:focus-visible,.lrh-f textarea:focus-visible,.lrh-s:focus-visible{outline:2px solid #34d399;outline-offset:2px}' +
    '.lrh-o{position:fixed;inset:0;z-index:2147482500;display:none;align-items:flex-end;justify-content:center;padding:12px;background:rgba(2,6,23,.78)}.lrh-o.on{display:flex}' +
    '@media(min-width:640px){.lrh-o{align-items:center}}' +
    '.lrh-p{width:100%;max-width:440px;max-height:88vh;display:flex;flex-direction:column;border:1px solid #334155;border-radius:20px;background:#0f172a;color:#e2e8f0;font:14px/1.5 Inter,system-ui,sans-serif;box-shadow:0 30px 90px rgba(0,0,0,.6)}' +
    '.lrh-h{display:flex;align-items:center;justify-content:space-between;padding:16px 18px 8px}.lrh-h h2{margin:0;font:700 18px Sora,Inter,system-ui,sans-serif;color:#fff}' +
    '.lrh-x{border:0;background:transparent;color:#94a3b8;font-size:22px;line-height:1;cursor:pointer;padding:4px 8px;border-radius:8px}.lrh-x:hover{color:#fff}' +
    '.lrh-tb{display:flex;gap:6px;padding:0 18px 10px}.lrh-t{flex:1;padding:8px 10px;border:1px solid #334155;border-radius:999px;background:transparent;color:#cbd5e1;font:600 13px Inter,system-ui,sans-serif;cursor:pointer}.lrh-t[aria-selected=true]{background:#10b981;border-color:#10b981;color:#022c22}' +
    '.lrh-c{overflow:auto;padding:4px 18px 18px}' +
    '.lrh-i{border:1px solid #1e293b;border-radius:12px;margin-bottom:8px;background:#0b1220}.lrh-q{width:100%;display:flex;justify-content:space-between;gap:10px;text-align:left;padding:12px 14px;border:0;background:transparent;color:#f1f5f9;font:600 14px/1.35 Inter,system-ui,sans-serif;cursor:pointer;border-radius:12px}' +
    '.lrh-a{display:none;padding:0 14px 12px;color:#94a3b8}.lrh-i.on .lrh-a{display:block}.lrh-i.on .lrh-q span:last-child{transform:rotate(45deg)}.lrh-q span:last-child{color:#34d399;transition:transform .15s}' +
    '.lrh-f label{display:block;margin:12px 0 4px;color:#94a3b8;font-size:12px}.lrh-f input,.lrh-f textarea{width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid #334155;border-radius:12px;background:#020617;color:#fff;font:14px Inter,system-ui,sans-serif}.lrh-f textarea{min-height:110px;resize:vertical}' +
    '.lrh-s{margin-top:14px;width:100%;padding:12px;border:0;border-radius:12px;background:#10b981;color:#022c22;font:700 14px Inter,system-ui,sans-serif;cursor:pointer}.lrh-s:disabled{opacity:.55;cursor:default}' +
    '.lrh-m{margin:12px 0 0;font-size:13px}.lrh-m.ok{color:#34d399}.lrh-m.er{color:#fca5a5}.lrh-hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}.lrh-n{margin:12px 0 0;color:#64748b;font-size:12px}.lrh-n a{color:#34d399}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  var btn = el('button', 'lrh-b', '<span aria-hidden="true">?</span> Aiuto'); btn.type = 'button'; btn.setAttribute('aria-haspopup', 'dialog');
  var ov = el('div', 'lrh-o'); ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-labelledby', 'lrh-title');
  var panel = el('div', 'lrh-p');
  var head = el('div', 'lrh-h', '<h2 id="lrh-title">Serve una mano?</h2>');
  var close = el('button', 'lrh-x', '×'); close.type = 'button'; close.setAttribute('aria-label', 'Chiudi'); head.appendChild(close);
  var tabs = el('div', 'lrh-tb'); tabs.setAttribute('role', 'tablist');
  var t1 = el('button', 'lrh-t', 'Risposte rapide'), t2 = el('button', 'lrh-t', 'Scrivici');
  [t1, t2].forEach(function (t) { t.type = 'button'; t.setAttribute('role', 'tab'); tabs.appendChild(t); });
  var body = el('div', 'lrh-c');
  panel.appendChild(head); panel.appendChild(tabs); panel.appendChild(body); ov.appendChild(panel);

  var faq = el('div');
  FAQ.forEach(function (x, i) {
    var it = el('div', 'lrh-i'), q = el('button', 'lrh-q', '<span>' + x[0] + '</span><span aria-hidden="true">+</span>'); q.type = 'button';
    var a = el('div', 'lrh-a', x[1]); a.id = 'lrh-a' + i; q.setAttribute('aria-expanded', 'false'); q.setAttribute('aria-controls', a.id);
    q.addEventListener('click', function () { var on = it.classList.toggle('on'); q.setAttribute('aria-expanded', on ? 'true' : 'false'); });
    it.appendChild(q); it.appendChild(a); faq.appendChild(it);
  });
  faq.appendChild(el('p', 'lrh-n', 'Non hai trovato la risposta? Passa a <b>Scrivici</b>.'));

  var form = el('form', 'lrh-f'); form.noValidate = true;
  form.innerHTML = '<label for="lrh-em">La tua email (per risponderti)</label><input id="lrh-em" type="email" autocomplete="email" maxlength="160" required>' +
    '<label for="lrh-ms">Come possiamo aiutarti?</label><textarea id="lrh-ms" maxlength="2000" required placeholder="Descrivi il problema o la domanda"></textarea>' +
    '<input class="lrh-hp" id="lrh-wb" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
    '<p class="lrh-m" id="lrh-mg" role="status"></p><button class="lrh-s" type="submit">Invia la richiesta</button>' +
    '<p class="lrh-n">Preferisci l\'email? Scrivi a <a href="mailto:info@listinorapido.it">info@listinorapido.it</a>.</p>';

  function show(which) {
    var first = which === 1;
    t1.setAttribute('aria-selected', first ? 'true' : 'false'); t2.setAttribute('aria-selected', first ? 'false' : 'true');
    body.innerHTML = ''; body.appendChild(first ? faq : form);
  }
  t1.addEventListener('click', function () { show(1); }); t2.addEventListener('click', function () { show(2); });

  var lastFocus = null;
  function open(tab) {
    lastFocus = document.activeElement; var c = window.LR_HELP_CTX || {};
    show(tab || 1); var em = form.querySelector('#lrh-em'); if (c.email && !em.value) em.value = c.email;
    ov.classList.add('on'); close.focus();
  }
  function shut() { ov.classList.remove('on'); if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  btn.addEventListener('click', function () { open(1); });
  close.addEventListener('click', shut);
  ov.addEventListener('click', function (e) { if (e.target === ov) shut(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && ov.classList.contains('on')) shut(); });
  document.addEventListener('click', function (e) { var t = e.target.closest && e.target.closest('[data-help-open]'); if (t) { e.preventDefault(); open(t.getAttribute('data-help-open') === 'scrivici' ? 2 : 1); } });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var em = form.querySelector('#lrh-em').value.trim(), ms = form.querySelector('#lrh-ms').value.trim(), mg = form.querySelector('#lrh-mg'), go = form.querySelector('.lrh-s');
    function say(t, ok) { mg.textContent = t; mg.className = 'lrh-m ' + (ok ? 'ok' : 'er'); }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) return say('Controlla l\'indirizzo email.');
    if (ms.length < 10) return say('Scrivi qualche parola in più, così possiamo capire come aiutarti.');
    go.disabled = true; say('Invio in corso…', true);
    var c = window.LR_HELP_CTX || {};
    fetch('/api/support', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: em, message: ms, page: location.pathname, slug: c.slug || '', website: form.querySelector('#lrh-wb').value }) })
      .then(function (r) {
        if (r.status === 429) { say('Hai già inviato diverse richieste: riprova tra un po\'.'); go.disabled = false; return; }
        if (!r.ok) throw new Error(r.status);
        say('Grazie! Abbiamo ricevuto la richiesta e ti risponderemo via email.', true); form.querySelector('#lrh-ms').value = '';
        setTimeout(function () { go.disabled = false; }, 4000);
      })
      .catch(function () { say('Invio non riuscito. Scrivi a info@listinorapido.it.'); go.disabled = false; });
  });

  function mount() { document.body.appendChild(btn); document.body.appendChild(ov); }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();
