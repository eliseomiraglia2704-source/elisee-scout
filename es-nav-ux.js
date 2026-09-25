/**
 * ============================================================
 * ES-NAV-UX: Navigation Controller & Fluid View Transitions
 * ============================================================
 * Zero dependencies, native rAF, lerp physics, clean transitions.
 */
(function () {
  'use strict';
  if (window.__esNavUX) return;
  window.__esNavUX = true;

  var prefersReducedMotion = function () {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };
  var isHoverCapable = function () {
    return window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  };

  var navEl = null;
  var indicatorEl = null;
  var links = [];
  var activeLink = null;
  var hoveredLink = null;

  // Coordinate correnti e target per Lerp
  var curX = 0, curW = 0, curO = 0;
  var tgtX = 0, tgtW = 0, tgtO = 0;
  var isLerping = false;
  var rafId = null;

  function measureLink(link) {
    if (!link || !navEl) return { x: 0, w: 0 };
    var nRect = navEl.getBoundingClientRect();
    var lRect = link.getBoundingClientRect();
    return {
      x: lRect.left - nRect.left,
      w: lRect.width
    };
  }

  function applyIndicatorStyle(x, w, o) {
    if (!indicatorEl) return;
    indicatorEl.style.setProperty('--ind-x', x.toFixed(2) + 'px');
    indicatorEl.style.setProperty('--ind-w', w.toFixed(2) + 'px');
    indicatorEl.style.setProperty('--ind-o', o.toFixed(2));
  }

  function lerpStep() {
    var dx = tgtX - curX;
    var dw = tgtW - curW;
    var do_ = tgtO - curO;

    var speed = 0.18;
    curX += dx * speed;
    curW += dw * speed;
    curO += do_ * speed;

    applyIndicatorStyle(curX, curW, curO);

    if (Math.abs(dx) > 0.2 || Math.abs(dw) > 0.2 || Math.abs(do_) > 0.01) {
      rafId = requestAnimationFrame(lerpStep);
    } else {
      curX = tgtX;
      curW = tgtW;
      curO = tgtO;
      applyIndicatorStyle(curX, curW, curO);
      isLerping = false;
      rafId = null;
    }
  }

  function startLerp() {
    if (!isLerping) {
      isLerping = true;
      rafId = requestAnimationFrame(lerpStep);
    }
  }

  function updateIndicatorTarget(immediate) {
    var target = hoveredLink || activeLink;
    if (target && navEl && navEl.offsetParent !== null) {
      var m = measureLink(target);
      tgtX = m.x;
      tgtW = m.w;
      tgtO = 1;
    } else {
      tgtO = 0;
    }

    if (immediate || prefersReducedMotion()) {
      curX = tgtX;
      curW = tgtW;
      curO = tgtO;
      applyIndicatorStyle(curX, curW, curO);
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      isLerping = false;
    } else {
      startLerp();
    }
  }

  function syncActiveLink(view) {
    if (!navEl) return;
    links.forEach(function (l) {
      var v = l.getAttribute('data-view');
      if (v && v === view) {
        l.classList.add('active');
        activeLink = l;
      } else {
        l.classList.remove('active');
      }
    });

    if (view === 'home' || !view) {
      activeLink = null;
    }
    updateIndicatorTarget(false);
  }

  // --- Scroll Header Handling (Throttled rAF, soglia 8px) ---
  var isScrollTicking = false;
  function onScroll() {
    if (isScrollTicking) return;
    isScrollTicking = true;
    requestAnimationFrame(function () {
      var h = document.querySelector('header.public-header');
      if (h) {
        if (window.scrollY > 8) {
          h.classList.add('is-scrolled');
        } else {
          h.classList.remove('is-scrolled');
        }
      }
      isScrollTicking = false;
    });
  }

  // --- Resize Handling (Debounced rAF) ---
  var resizeTimer = null;
  function onResize() {
    if (resizeTimer) cancelAnimationFrame(resizeTimer);
    resizeTimer = requestAnimationFrame(function () {
      updateIndicatorTarget(true);
    });
  }

  // --- Inizializzazione Elementi Nav ---
  function initNav() {
    navEl = document.querySelector('header.public-header .main-nav');
    if (!navEl) return;

    // Crea indicator se non presente
    indicatorEl = navEl.querySelector('.nav-indicator');
    if (!indicatorEl) {
      indicatorEl = document.createElement('span');
      indicatorEl.className = 'nav-indicator';
      indicatorEl.setAttribute('aria-hidden', 'true');
      navEl.prepend(indicatorEl);
    }

    links = Array.prototype.slice.call(navEl.querySelectorAll('a'));
    links.forEach(function (link) {
      link.classList.add('nav-link');
      var href = link.getAttribute('href') || '';
      if (!link.getAttribute('data-view')) {
        if (href.indexOf('about') >= 0) link.setAttribute('data-view', 'about');
        else if (href.indexOf('bacheca') >= 0) link.setAttribute('data-view', 'bacheca');
        else if (href.indexOf('mappa') >= 0) link.setAttribute('data-view', 'mappa');
      }

      if (isHoverCapable()) {
        link.addEventListener('mouseenter', function () {
          hoveredLink = link;
          updateIndicatorTarget(false);
        });
      }
    });

    if (isHoverCapable()) {
      navEl.addEventListener('mouseleave', function () {
        hoveredLink = null;
        updateIndicatorTarget(false);
      });
    }

    // Ricava vista iniziale
    var initialView = 'home';
    try {
      var h = (window.location.hash || '').toLowerCase();
      if (h.indexOf('about') >= 0) initialView = 'about';
      else if (h.indexOf('bacheca') >= 0 || h.indexOf('persone') >= 0) initialView = 'bacheca';
      else if (h.indexOf('mappa') >= 0) initialView = 'mappa';
      else initialView = localStorage.getItem('elisee_view') || 'home';
    } catch (_) {}

    document.body.classList.toggle('is-internal-view', initialView !== 'home');
    syncActiveLink(initialView);
    updateIndicatorTarget(true);
  }

  // --- Wrap Fluido per window.switchView ---
  var currentTransitionTimeout = null;

  function wrapSwitchView() {
    var orig = window.switchView;
    if (typeof orig !== 'function') return;

    window.switchView = function (viewType, targetHash, opts) {
      var targetView = viewType || 'home';
      var reduced = prefersReducedMotion();

      // Cancella transizione in corso se click rapido
      if (currentTransitionTimeout) {
        clearTimeout(currentTransitionTimeout);
        currentTransitionTimeout = null;
        document.querySelectorAll('.es-view-leaving, .es-view-entering, .es-view-entering-start').forEach(function (el) {
          el.classList.remove('es-view-leaving', 'es-view-entering', 'es-view-entering-start');
        });
      }

      // Vista attiva uscente
      var activeOutgoing = null;
      var viewGroups = ['#view-home', '#home-views-group', '#view-about', '#view-bacheca', '#view-mappa', '#view-stampa', '#view-squadre', '#view-tc-panel', '#view-mercato', '#view-schede', '#view-account'];
      for (var i = 0; i < viewGroups.length; i++) {
        var el = document.querySelector(viewGroups[i]);
        if (el && window.getComputedStyle(el).display !== 'none' && el.offsetHeight > 0) {
          activeOutgoing = el;
          break;
        }
      }

      // Aggiorna stato navbar e header background
      document.body.classList.toggle('is-internal-view', targetView !== 'home');
      syncActiveLink(targetView);

      // Se reduced motion o prima home, switch secco ma controllato
      if (reduced || !activeOutgoing) {
        var res = orig.apply(this, arguments);
        updateIndicatorTarget(false);
        return res;
      }

      // Animazione uscente
      activeOutgoing.classList.add('es-view-leaving');

      currentTransitionTimeout = setTimeout(function () {
        activeOutgoing.classList.remove('es-view-leaving');
        var res = orig.call(window, viewType, targetHash, opts);

        // Trova vista entrante
        var incoming = null;
        for (var j = 0; j < viewGroups.length; j++) {
          var inEl = document.querySelector(viewGroups[j]);
          if (inEl && window.getComputedStyle(inEl).display !== 'none' && inEl.offsetHeight > 0) {
            incoming = inEl;
            break;
          }
        }

        if (incoming) {
          incoming.classList.add('es-view-entering-start');
          requestAnimationFrame(function () {
            incoming.classList.remove('es-view-entering-start');
            incoming.classList.add('es-view-entering');
            currentTransitionTimeout = setTimeout(function () {
              incoming.classList.remove('es-view-entering');
              currentTransitionTimeout = null;
            }, 320);
          });
        }

        updateIndicatorTarget(false);
        return res;
      }, 100);

      return true;
    };
  }

  // --- Boot Handler ---
  function boot() {
    initNav();
    wrapSwitchView();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    onScroll();

    // Ricalcola al load completo per font caricati
    window.addEventListener('load', function () {
      setTimeout(function () { updateIndicatorTarget(true); }, 50);
    });

    // Ascolta eventi cambio vista custom
    document.addEventListener('elisee:view-changed', function (ev) {
      if (ev && ev.detail && ev.detail.view) {
        document.body.classList.toggle('is-internal-view', ev.detail.view !== 'home');
        syncActiveLink(ev.detail.view);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
