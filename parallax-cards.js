/**
 * ELISEE SCOUT — Parallax 3D Cards Controller
 * Tilt 3D reattivo con coordinate relative, parallax opposto dell'elemento centrale,
 * reflex sottile, supporto i18n dinamico e fallback touch / reduced-motion.
 */
(function () {
  'use strict';

  var MAX_ROTATE_DEG = 14; // Massimo tilt ±14°
  var MAX_ELEM_SHIFT_PX = 16; // Massimo spostamento opposto dell'elemento centrale

  function updateWordsLanguage(lang) {
    var l = lang;
    if (!l && window.EliseeI18n && typeof window.EliseeI18n.getLang === 'function') {
      l = window.EliseeI18n.getLang();
    }
    l = l || document.documentElement.getAttribute('data-lang') || 'it';

    document.querySelectorAll('.parallax-card__words').forEach(function (w) {
      var topKey = w.getAttribute('data-i18n-word-top');
      var bottomKey = w.getAttribute('data-i18n-word-bottom');
      if (topKey && window.EliseeI18n && typeof window.EliseeI18n.t === 'function') {
        w.setAttribute('data-word-top', window.EliseeI18n.t(topKey, l));
      }
      if (bottomKey && window.EliseeI18n && typeof window.EliseeI18n.t === 'function') {
        w.setAttribute('data-word-bottom', window.EliseeI18n.t(bottomKey, l));
      }
    });
  }

  function initParallaxCards() {
    var cards = document.querySelectorAll('.parallax-card');
    if (!cards.length) return;

    // Aggiorna parole iniziali con i18n
    updateWordsLanguage();

    var prefersReduced = false;
    try {
      prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (_) {}

    var canHover = true;
    try {
      canHover = window.matchMedia && window.matchMedia('(hover: hover)').matches;
    } catch (_) {}

    if (prefersReduced || !canHover) return;

    cards.forEach(function (card) {
      // Evita doppi listener
      if (card.dataset.parallaxBound === 'true') return;
      card.dataset.parallaxBound = 'true';

      var rafId = null;
      var isMoving = false;

      function onPointerMove(e) {
        if (e.pointerType === 'touch') return;
        var rect = card.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        // Posizione relativa normalizzata (-0.5 ... +0.5)
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;
        var relX = Math.max(-0.5, Math.min(0.5, px - 0.5));
        var relY = Math.max(-0.5, Math.min(0.5, py - 0.5));

        if (!isMoving) {
          isMoving = true;
          card.classList.add('is-moving');
          card.style.willChange = 'transform';
        }

        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(function () {
          // Tilt 3D rotazione max ±14°
          var rotX = (-relY * (MAX_ROTATE_DEG * 2)).toFixed(2);
          var rotY = (relX * (MAX_ROTATE_DEG * 2)).toFixed(2);

          // Spostamento opposto dell'elemento visivo (parallax di profondità)
          var shiftX = (-relX * MAX_ELEM_SHIFT_PX).toFixed(2);
          var shiftY = (-relY * MAX_ELEM_SHIFT_PX).toFixed(2);

          // Posizione del punto luce (glare reflex)
          var glareX = ((relX + 0.5) * 100).toFixed(1);
          var glareY = ((relY + 0.5) * 100).toFixed(1);

          card.style.setProperty('--rx', rotX + 'deg');
          card.style.setProperty('--ry', rotY + 'deg');
          card.style.setProperty('--elem-px', shiftX + 'px');
          card.style.setProperty('--elem-py', shiftY + 'px');
          card.style.setProperty('--mx', glareX + '%');
          card.style.setProperty('--my', glareY + '%');
        });
      }

      function onPointerLeave() {
        if (rafId) cancelAnimationFrame(rafId);
        isMoving = false;
        card.classList.remove('is-moving');
        card.style.willChange = 'auto';

        // Ripristino con transizione a riposo
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
        card.style.setProperty('--elem-px', '0px');
        card.style.setProperty('--elem-py', '0px');
        card.style.setProperty('--mx', '50%');
        card.style.setProperty('--my', '50%');
      }

      card.addEventListener('pointermove', onPointerMove, { passive: true });
      card.addEventListener('pointerleave', onPointerLeave);
      card.addEventListener('pointercancel', onPointerLeave);
    });
  }

  // Ascolta cambi lingua
  document.addEventListener('elisee:lang-changed', function (ev) {
    var lang = (ev.detail && ev.detail.lang) || 'it';
    updateWordsLanguage(lang);
  });

  window.initParallaxCards = initParallaxCards;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initParallaxCards);
  } else {
    initParallaxCards();
  }
})();
