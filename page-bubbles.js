/* Transizione a bolle fra le sezioni. Non parte al primo caricamento. */
(function () {
  'use strict';
  var ready = false;
  var pending = null;
  var root = null;

  function bubbles() {
    if (root) return root;
    root = document.createElement('div');
    root.className = 'es-bubbles';
    root.innerHTML = '<div class="es-bubbles-first"></div><div class="es-bubbles-second"></div>';
    document.body.appendChild(root);
    root.addEventListener('animationend', function (e) {
      if (!root) return;
      if (e.animationName === 'es-bubble-second' && root.classList.contains('is-covering')) {
        var run = pending;
        pending = null;
        root.classList.remove('is-covering');
        root.classList.add('is-holding');
        if (run) run();
      } else if (e.animationName === 'es-bubble-hold') {
        root.classList.remove('is-holding');
      }
    });
    return root;
  }

  function reduced() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function play(run) {
    if (!ready || reduced()) { run(); return; }
    var box = bubbles();
    if (box.classList.contains('is-covering')) { run(); return; }
    pending = run;
    box.classList.add('is-covering');
  }

  function wrap() {
    if (typeof window.switchView !== 'function' || window.switchView._esBubbles) return;
    var orig = window.switchView;
    function next(viewType, targetHash, opts) {
      if (opts && opts._fromBubble) return orig(viewType, targetHash, opts);
      var here = '';
      try { here = localStorage.getItem('elisee_view') || ''; } catch (e) {}
      if (here && viewType && here === viewType) return orig(viewType, targetHash, opts);
      play(function () {
        orig(viewType, targetHash, Object.assign({}, opts || {}, { _fromBubble: true }));
      });
    }
    next._esBubbles = true;
    window.switchView = next;
  }

  window.addEventListener('load', function () {
    setTimeout(function () { ready = true; wrap(); }, 500);
  });
  setInterval(wrap, 1000);
})();
