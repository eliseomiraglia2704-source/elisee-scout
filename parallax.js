/* Parallax: lo sfondo si sposta meno del testo, come nello scroll del video. */
(function () {
  'use strict';
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var sections = [];

  function collect() {
    sections = ['hero', 'about'].map(function (id) { return document.getElementById(id); }).filter(Boolean);
  }

  function ratio(el) {
    return window.innerHeight / (window.innerHeight + el.offsetHeight);
  }

  function paint() {
    var vh = window.innerHeight;
    sections.forEach(function (section, i) {
      var bg = section.querySelector('.es-plx');
      if (!bg) return;
      var rect = section.getBoundingClientRect();
      var start = vh;
      var end = -section.offsetHeight;
      var span = start - end || 1;
      var p = (start - rect.top) / span;
      if (p < 0) p = 0;
      if (p > 1) p = 1;
      var from = i ? -vh * ratio(section) : 0;
      var to = vh * (1 - ratio(section));
      var y = from + (to - from) * p;
      bg.style.backgroundPosition = '50% ' + y.toFixed(1) + 'px';
    });
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { paint(); ticking = false; });
  }

  function boot() {
    collect();
    paint();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', paint);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
