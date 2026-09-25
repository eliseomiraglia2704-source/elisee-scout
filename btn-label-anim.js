/* Button label animations — salto, fumo, scorrimento (video 2026-09-25 09:35). */
(function () {
  'use strict';

  var MAP = [
    ['#btn-nav-accedi', 'jump'],
    ['.btn-nav-iscriviti', 'drive'],
    ['.es-login-submit', 'jump'],
    ['.es-login-switch', 'smoke'],
    ['#es-otp-continue', 'jump'],
    ['#btn-trigger-otp', 'drive'],
    ['#es-role-continue', 'jump']
  ];

  function reduced() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function split(btn, fx) {
    if (!btn || btn.dataset.gbtnReady === '1') return;
    var node = null;
    var i;
    for (i = 0; i < btn.childNodes.length; i++) {
      var n = btn.childNodes[i];
      if (n.nodeType === 3 && n.textContent.trim()) { node = n; break; }
    }
    if (!node) return;
    var letters = Array.from(node.textContent);
    var glyphs = letters.filter(function (ch) { return ch.trim(); });
    if (!glyphs.length) return;
    var label = document.createElement('span');
    label.className = 'gbtn-label';
    var gi = 0;
    letters.forEach(function (ch) {
      if (!ch.trim()) {
        label.appendChild(document.createTextNode(ch));
        return;
      }
      var s = document.createElement('span');
      s.className = 'g';
      s.textContent = ch;
      s.style.setProperty('--i', String(gi));
      s.style.setProperty('--n', String(glyphs.length));
      gi += 1;
      label.appendChild(s);
    });
    node.replaceWith(label);
    btn.dataset.gbtnReady = '1';
    btn.dataset.fx = fx || btn.dataset.fx || 'jump';
    btn.classList.add('gbtn');
    btn.style.setProperty('--step', '0.045s');
    btn.style.setProperty('--rev', '0');
    btn.addEventListener('pointerenter', onEnter);
  }

  function onEnter(e) {
    var btn = e.currentTarget;
    if (!btn || btn.dataset.busy || reduced()) return;
    var rect = btn.getBoundingClientRect();
    var fromRight = (e.clientX - rect.left) > rect.width / 2;
    btn.style.setProperty('--rev', fromRight ? '1' : '0');
    btn.style.setProperty('--shift', fromRight ? '1.15em' : '-1.15em');
    btn.classList.add('is-go');
    var runs = [];
    if (btn.getAnimations) {
      try { runs = btn.getAnimations({ subtree: true }); } catch (err) { runs = btn.getAnimations(); }
    }
    runs = (runs || []).filter(function (a) { return a.animationName; });
    btn.dataset.busy = '1';
    var done = function () {
      btn.classList.remove('is-go');
      delete btn.dataset.busy;
    };
    if (!runs.length) {
      setTimeout(done, 800);
      return;
    }
    Promise.allSettled(runs.map(function (a) { return a.finished; })).then(done);
  }

  function boot() {
    MAP.forEach(function (pair) {
      document.querySelectorAll(pair[0]).forEach(function (btn) { split(btn, pair[1]); });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 400);
})();
