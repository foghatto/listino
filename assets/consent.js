/* ListinoRapido — accettazione di Privacy Policy e Termini.
 *
 * Si include con:  <script src="assets/consent.js" data-mode="modal"></script>
 *   data-mode="modal"   finestra al centro che blocca la pagina finché non si accetta (accesso, dashboard)
 *   data-mode="banner"  riquadro in basso che non blocca la lettura (landing, demo)
 *
 * L'accettazione viene salvata nel browser (localStorage, chiave "lr_consent") con data e versione.
 * Se modifichi i testi legali in modo sostanziale, aumenta VERSION: il popup ricompare a tutti.
 * Un link con l'attributo data-consent-open (es. nel footer) riapre il popup.
 * Non va incluso nel listino pubblico (listino.html): chi inquadra il QR non deve essere fermato.
 */
(function () {
  'use strict';
  var VERSION = 2;
  var KEY = 'lr_consent';
  var script = document.currentScript;
  var MODE = (script && script.getAttribute('data-mode')) === 'banner' ? 'banner' : 'modal';
  var LEGAL = (script && script.getAttribute('data-legal')) || 'note-legali.html';

  function read() { try { var v = JSON.parse(localStorage.getItem(KEY) || 'null'); return v && v.v === VERSION ? v : null; } catch (e) { return null; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify({ v: VERSION, at: new Date().toISOString() })); } catch (e) { /* browser senza storage: il popup tornerà alla prossima pagina */ } }
  function clear() { try { localStorage.removeItem(KEY); } catch (e) {} }

  var CSS = '' +
    '.lrc-ov{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(2,6,23,.78);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}' +
    '.lrc-bn{position:fixed;left:0;right:0;bottom:0;z-index:2147483000;display:flex;justify-content:center;padding:12px;padding-bottom:max(12px,env(safe-area-inset-bottom,0px));pointer-events:none}' +
    '.lrc-box{pointer-events:auto;box-sizing:border-box;width:100%;max-width:440px;border:1px solid #1e293b;background:#0f172a;color:#cbd5e1;border-radius:20px;padding:22px;box-shadow:0 24px 70px rgba(2,6,23,.7);font:400 14px/1.55 Inter,system-ui,-apple-system,"Segoe UI",sans-serif}' +
    '.lrc-bn .lrc-box{max-width:720px;display:flex;flex-wrap:wrap;align-items:center;gap:12px 20px;padding:16px 20px;border-radius:16px}' +
    '.lrc-box h2{margin:0;font:700 18px/1.25 Sora,Inter,system-ui,sans-serif;letter-spacing:-.02em;color:#fff}' +
    '.lrc-box p{margin:8px 0 0}' +
    '.lrc-bn .lrc-box p{margin:0;flex:1 1 320px;font-size:13px}' +
    '.lrc-box a{color:#34d399;text-decoration:underline;text-underline-offset:2px}' +
    '.lrc-box a:hover{color:#6ee7b7}' +
    '.lrc-chk{display:flex;gap:10px;align-items:flex-start;margin-top:16px;cursor:pointer;color:#e2e8f0}' +
    '.lrc-chk input{flex:none;width:20px;height:20px;margin:1px 0 0;accent-color:#10b981;cursor:pointer}' +
    '.lrc-btn{appearance:none;border:0;cursor:pointer;border-radius:12px;background:#10b981;color:#022c22;font:700 15px/1 Inter,system-ui,sans-serif;padding:14px 20px;min-height:44px}' +
    '.lrc-btn:hover:not(:disabled){background:#34d399}' +
    '.lrc-btn:disabled{opacity:.45;cursor:not-allowed}' +
    '.lrc-ov .lrc-btn{width:100%;margin-top:16px}' +
    '.lrc-bn .lrc-btn{flex:none}' +
    '.lrc-btn:focus-visible,.lrc-box a:focus-visible,.lrc-chk input:focus-visible{outline:2px solid #6ee7b7;outline-offset:2px}' +
    '.lrc-lock{overflow:hidden!important}' +
    '@media (prefers-reduced-motion:no-preference){.lrc-box{animation:lrc-in .22s ease-out}@keyframes lrc-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}}';

  var root = null, prev = null;

  function links() {
    return '<a href="' + LEGAL + '#privacy" target="_blank" rel="noopener">Privacy Policy</a> e accetti i ' +
           '<a href="' + LEGAL + '#termini" target="_blank" rel="noopener">Termini e condizioni</a>';
  }

  function close() {
    if (!root) return;
    root.remove(); root = null;
    document.documentElement.classList.remove('lrc-lock');
    if (prev && prev.focus) { try { prev.focus(); } catch (e) {} }
  }
  function accept() { save(); close(); document.dispatchEvent(new CustomEvent('lr:consent', { detail: read() })); }

  function open() {
    if (root) return;
    if (!document.getElementById('lrc-style')) { var st = document.createElement('style'); st.id = 'lrc-style'; st.textContent = CSS; document.head.appendChild(st); }
    prev = document.activeElement;
    root = document.createElement('div');

    if (MODE === 'banner') {
      root.className = 'lrc-bn';
      root.innerHTML =
        '<div class="lrc-box" role="region" aria-label="Privacy e termini">' +
          '<p>Usando ListinoRapido prendi visione della ' + links() + '. Usiamo solo strumenti tecnici necessari, senza cookie di profilazione, analisi o pubblicità.</p>' +
          '<button type="button" class="lrc-btn" data-ok>Accetto</button>' +
        '</div>';
      document.body.appendChild(root);
      root.querySelector('[data-ok]').addEventListener('click', accept);
      return;
    }

    root.className = 'lrc-ov';
    root.innerHTML =
      '<div class="lrc-box" role="dialog" aria-modal="true" aria-labelledby="lrc-t" aria-describedby="lrc-d">' +
        '<h2 id="lrc-t">Privacy e termini d’uso</h2>' +
        '<p id="lrc-d">Per usare ListinoRapido prendi visione della ' + links() + '. Usiamo solo strumenti tecnici necessari al funzionamento, senza cookie di profilazione, analisi o pubblicità.</p>' +
        '<label class="lrc-chk"><input type="checkbox" id="lrc-c"><span>Dichiaro di aver preso visione della Privacy Policy e accetto i Termini e condizioni.</span></label>' +
        '<button type="button" class="lrc-btn" id="lrc-ok" disabled>Accetto e continuo</button>' +
      '</div>';
    document.body.appendChild(root);
    document.documentElement.classList.add('lrc-lock');
    var chk = root.querySelector('#lrc-c'), ok = root.querySelector('#lrc-ok');
    chk.addEventListener('change', function () { ok.disabled = !chk.checked; });
    ok.addEventListener('click', function () { if (chk.checked) accept(); });
    chk.focus();
    // Focus intrappato nella finestra finché non si accetta
    root.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = Array.prototype.filter.call(root.querySelectorAll('a,input,button'), function (x) { return !x.disabled; });
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  function init() {
    if (!read()) open();
    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('[data-consent-open]');
      if (!t) return;
      e.preventDefault(); clear(); open();
    });
  }

  window.LRConsent = { accepted: function () { return !!read(); }, open: function () { clear(); open(); } };
  if (document.body) init(); else document.addEventListener('DOMContentLoaded', init);
})();
