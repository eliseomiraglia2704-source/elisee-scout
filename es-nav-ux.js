/**
 * ============================================================
 * ES-NAV-UX: Navigation Controller & Fluid View Transitions
 * ============================================================
 * Zero dependencies, native rAF, lerp physics, clean transitions.
 */
(function () {
  'use strict';
  if (window.__esNavUX && window.__esNavUX.ready) return;

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

    var speed = 0.24;
    curX += dx * speed;
    curW += dw * speed;
    curO += do_ * speed;

    applyIndicatorStyle(curX, curW, curO);

    if (Math.abs(dx) > 0.15 || Math.abs(dw) > 0.15 || Math.abs(do_) > 0.008) {
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

  function moveIndicatorTo(target, immediate) {
    if (!indicatorEl || !navEl) return;
    if (target && target.offsetParent !== null) {
      var m = measureLink(target);
      tgtX = m.x;
      tgtW = m.w;
      tgtO = 1;
      indicatorEl.classList.add('is-on');
    } else {
      tgtO = 0;
      indicatorEl.classList.remove('is-on');
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

  function syncActiveLink(view, immediate) {
    if (!navEl) return;
    var cleanView = String(view || 'home').toLowerCase();
    activeLink = null;

    links.forEach(function (l) {
      var v = l.getAttribute('data-view');
      if (v && v === cleanView) {
        l.classList.add('active');
        activeLink = l;
      } else {
        l.classList.remove('active');
      }
    });

    var isInternal = (cleanView !== 'home');
    document.body.classList.toggle('is-internal-view', isInternal);
    document.body.classList.toggle('is-view-mappa', cleanView === 'mappa');
    document.body.classList.toggle('is-view-stampa', cleanView === 'stampa');
    document.body.classList.toggle('is-view-bacheca', cleanView === 'bacheca' || cleanView === 'persone');
    document.body.classList.toggle('is-view-about', cleanView === 'about');
    document.body.classList.toggle('is-view-tc-panel', cleanView === 'tc' || cleanView === 'tc-panel');
    document.body.classList.toggle('is-view-iscrizioni', cleanView === 'iscrizione' || cleanView === 'iscrizioni');
    document.body.classList.toggle('is-view-mercato', cleanView === 'mercato');
    document.body.classList.toggle('is-view-schede', cleanView === 'schede');
    document.body.classList.toggle('is-view-squadre', cleanView === 'squadre');

    if (!isInternal) {
      document.body.classList.remove(
        'is-view-mappa', 'is-view-stampa', 'is-view-bacheca', 'is-view-about',
        'is-view-tc-panel', 'is-view-iscrizioni', 'is-view-mercato', 'is-view-schede', 'is-view-squadre'
      );
    }

    if (indicatorEl) {
      indicatorEl.classList.toggle('is-on', isInternal && !!activeLink);
    }

    if (hoveredLink) {
      moveIndicatorTo(hoveredLink, false);
    } else {
      moveIndicatorTo(activeLink, !!immediate);
    }
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
      moveIndicatorTo(hoveredLink || activeLink, true);
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

      link.addEventListener('click', function () {
        activeLink = link;
        moveIndicatorTo(link, false);
      });

      if (isHoverCapable()) {
        link.addEventListener('mouseenter', function () {
          hoveredLink = link;
          moveIndicatorTo(link, false);
        });
      }
    });

    if (isHoverCapable()) {
      navEl.addEventListener('mouseleave', function () {
        hoveredLink = null;
        moveIndicatorTo(activeLink, false);
      });
    }

    // Gestione Dropdown "Altro ▾" (click, mobile touch e close outside)
    var dropdownEl = document.getElementById('menu-nav-dropdown-more');
    if (dropdownEl) {
      var dropBtn = dropdownEl.querySelector('.es-nav-dropdown-btn');
      if (dropBtn) {
        dropBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          var isOpen = dropdownEl.classList.toggle('is-open');
          dropBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
      }
      document.addEventListener('click', function (e) {
        if (dropdownEl && !dropdownEl.contains(e.target)) {
          dropdownEl.classList.remove('is-open');
          if (dropBtn) dropBtn.setAttribute('aria-expanded', 'false');
        }
      });
      var dropItems = dropdownEl.querySelectorAll('.es-nav-dropdown-item');
      dropItems.forEach(function (item) {
        item.addEventListener('click', function () {
          dropdownEl.classList.remove('is-open');
          if (dropBtn) dropBtn.setAttribute('aria-expanded', 'false');
        });
      });
    }

    // Gestione click esplicito su Logo / Brand -> Reset a Home garantito (Capture Phase)
    var brandLinks = document.querySelectorAll('.site-brand, a[href="#hero"], a[href="#view-home"]');
    brandLinks.forEach(function (b) {
      b.addEventListener('click', function (e) {
        if (e) {
          try { e.preventDefault(); } catch (_) {}
          try { e.stopPropagation(); } catch (_) {}
        }
        // 1. Sincrono: Hash #hero immediato
        try {
          if (window.history && window.history.replaceState) {
            window.history.replaceState(null, '', '#hero');
          }
        } catch (_) {}
        try { location.hash = '#hero'; } catch (_) {}

        // 2. Classi body pulite all'istante
        document.body.classList.remove('is-internal-view', 'is-view-mappa', 'is-view-stampa');

        // 3. Header: drop is-scrolled e trasparenza forzata nello stesso tick
        var header = document.querySelector('header.public-header, header.main-header, .portfolio-header');
        if (header) {
          header.classList.remove('is-scrolled');
          header.style.setProperty('background', 'transparent', 'important');
          header.style.setProperty('backdrop-filter', 'none', 'important');
          header.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
        }

        // 4. Indicatore spento
        var ind = document.querySelector('.nav-indicator');
        if (ind) ind.classList.remove('is-on');
        if (window.__esNavUX && window.__esNavUX.syncActiveLink) {
          window.__esNavUX.syncActiveLink('home', true);
        }

        // 5. Nascondi view-mappa nel DOM se ancora visibile
        var vm = document.getElementById('view-mappa');
        if (vm) vm.style.display = 'none';

        // 6. Esegui switchView('home', '#hero')
        if (window.switchView) {
          window.switchView('home', '#hero');
        }

        // 7. Scroll a 0 immediato senza lag (auto)
        window.scrollTo(0, 0);

        // 8. Pulizia inline styles nello rAF
        requestAnimationFrame(function () {
          document.body.classList.remove('is-internal-view', 'is-view-mappa', 'is-view-stampa');
          var ind2 = document.querySelector('.nav-indicator');
          if (ind2) ind2.classList.remove('is-on');
          if (header) {
            header.classList.remove('is-scrolled');
            header.style.removeProperty('background');
            header.style.removeProperty('backdrop-filter');
            header.style.removeProperty('-webkit-backdrop-filter');
          }
        });
      }, true);
    });

    // Ricava vista iniziale
    var initialView = 'home';
    try {
      var h = (window.location.hash || '').toLowerCase();
      if (h.indexOf('about') >= 0) initialView = 'about';
      else if (h.indexOf('bacheca') >= 0 || h.indexOf('persone') >= 0) initialView = 'bacheca';
      else if (h.indexOf('mappa') >= 0) initialView = 'mappa';
      else initialView = localStorage.getItem('elisee_view') || 'home';
    } catch (_) {}

    syncActiveLink(initialView, true);
  }

  // --- Wrap Zero-Latenza per window.switchView ---
  function wrapSwitchView() {
    var orig = window.switchView;
    if (typeof orig !== 'function') return;

    window.switchView = function (viewType, targetHash, opts) {
      var t0 = (window.performance && window.performance.now) ? performance.now() : 0;
      var targetView = viewType || 'home';
      var reduced = prefersReducedMotion();

      // Cancella eventuali classi di animazione precedenti
      document.querySelectorAll('.es-view-leaving, .es-view-entering, .es-view-entering-start').forEach(function (el) {
        el.classList.remove('es-view-leaving', 'es-view-entering', 'es-view-entering-start');
      });

      // 1. Esecuzione IMMEDIATA (t = 0 ms sincrono)
      var res = orig.apply(this, arguments);

      // 2. Sblocco scroll immediato (evita blocchi iOS)
      try {
        document.body.style.overflow = '';
        if (document.documentElement) document.documentElement.style.overflow = '';
      } catch (_) {}

      // 3. Scroll a inizio pagina secco
      window.scrollTo(0, 0);

      // 4. Gestione stato nav & classi body per la vista
      syncActiveLink(targetView, false);

      if (targetView === 'home') {
        // Drop is-scrolled e trasparenza forzata nello stesso tick
        var header = document.querySelector('header.public-header, header.main-header, .portfolio-header');
        if (header) {
          header.classList.remove('is-scrolled');
          header.style.setProperty('background', 'transparent', 'important');
          header.style.setProperty('backdrop-filter', 'none', 'important');
          header.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
        }
        var ind = document.querySelector('.nav-indicator');
        if (ind) ind.classList.remove('is-on');
        syncActiveLink('home', true);
        requestAnimationFrame(function () {
          var ind2 = document.querySelector('.nav-indicator');
          if (ind2) ind2.classList.remove('is-on');
          if (header) {
            header.classList.remove('is-scrolled');
            header.style.removeProperty('background');
            header.style.removeProperty('backdrop-filter');
            header.style.removeProperty('-webkit-backdrop-filter');
          }
        });
      } else if (!reduced) {
        // Transizione morbida GPU entrante istantanea (zero ritardo di esecuzione)
        var viewGroups = ['#view-home', '#home-views-group', '#view-about', '#view-bacheca', '#view-mappa', '#view-stampa', '#view-squadre', '#view-tc-panel', '#view-mercato', '#view-schede', '#view-account', '#view-iscrizione'];
        for (var j = 0; j < viewGroups.length; j++) {
          var inEl = document.querySelector(viewGroups[j]);
          if (inEl && window.getComputedStyle(inEl).display !== 'none' && inEl.offsetHeight > 0) {
            inEl.classList.add('es-view-entering');
            (function (el) {
              setTimeout(function () {
                el.classList.remove('es-view-entering');
              }, 220);
            })(inEl);
            break;
          }
        }
      }

      if (t0 && window.performance && window.performance.now) {
        var t1 = performance.now();
        console.log('[Zero-Latency Nav] switched to ' + targetView + ' in ' + (t1 - t0).toFixed(2) + 'ms');
      }

      return res;
    };
  }

  // --- Capture Phase Handler Globale per Viste Interne (Bacheca, Stampa, About, TC, Mercato, ecc.) ---
  function bindGlobalNavCapture() {
    document.addEventListener('click', function (e) {
      var target = e.target;
      if (!target) return;
      var link = target.closest('a[href], button[data-view], [data-view-target]');
      if (!link) return;

      var href = (link.getAttribute('href') || '').trim();
      var dataView = link.getAttribute('data-view') || link.getAttribute('data-view-target');

      var targetView = null;
      var targetHash = null;

      if (dataView) {
        targetView = dataView;
        targetHash = href.indexOf('#') === 0 ? href : null;
      } else if (href.indexOf('#') === 0) {
        var h = href.toLowerCase();
        if (h === '#hero' || h === '#view-home' || h === '#home') {
          targetView = 'home';
          targetHash = '#hero';
        } else if (h.indexOf('bacheca') >= 0 || h.indexOf('persone') >= 0) {
          targetView = 'bacheca';
          targetHash = href;
        } else if (h.indexOf('stampa') >= 0) {
          targetView = 'stampa';
          targetHash = '#stampa-portal';
        } else if (h.indexOf('mappa') >= 0) {
          targetView = 'mappa';
          targetHash = '#mappa-portal';
        } else if (h.indexOf('about') >= 0 || h.indexOf('chi-siamo') >= 0) {
          targetView = 'about';
          targetHash = '#about';
        } else if (h.indexOf('tc-') >= 0 || h.indexOf('tc_') >= 0) {
          targetView = 'tc';
          targetHash = href;
        } else if (h.indexOf('iscrizione') >= 0) {
          targetView = 'iscrizione';
          targetHash = href;
        } else if (h.indexOf('mercato') >= 0 || h.indexOf('wall-') >= 0 || h.indexOf('secret-') >= 0) {
          targetView = 'mercato';
          targetHash = href;
        } else if (h.indexOf('schede') >= 0) {
          targetView = 'schede';
          targetHash = href;
        } else if (h.indexOf('squadre') >= 0) {
          targetView = 'squadre';
          targetHash = href;
        }
      }

      if (targetView && typeof window.switchView === 'function') {
        if (window.createRipple && e.clientX && e.clientY) {
          window.createRipple(link, e.clientX, e.clientY);
        }
        try { e.preventDefault(); } catch (_) {}
        try { e.stopPropagation(); } catch (_) {}
        window.switchView(targetView, targetHash || ('#' + targetView));
      }
    }, true);
  }

  // --- Boot Handler ---
  function boot() {
    initNav();
    wrapSwitchView();
    bindGlobalNavCapture();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    onScroll();

    window.addEventListener('hashchange', function () {
      var h = (window.location.hash || '').toLowerCase();
      var v = 'home';
      if (h.indexOf('about') >= 0) v = 'about';
      else if (h.indexOf('bacheca') >= 0 || h.indexOf('persone') >= 0) v = 'bacheca';
      else if (h.indexOf('mappa') >= 0) v = 'mappa';
      syncActiveLink(v, true);
    });

    // Ricalcola al load completo per font caricati
    window.addEventListener('load', function () {
      setTimeout(function () {
        var v = localStorage.getItem('elisee_view') || 'home';
        syncActiveLink(v, true);
      }, 50);
      setTimeout(function () {
        var v = localStorage.getItem('elisee_view') || 'home';
        syncActiveLink(v, true);
      }, 300);
    });

    // Ascolta eventi cambio vista custom
    document.addEventListener('elisee:view-changed', function (ev) {
      if (ev && ev.detail && ev.detail.view) {
        syncActiveLink(ev.detail.view, false);
      }
    });

    window.__esNavUX = {
      ready: true,
      moveIndicatorTo: moveIndicatorTo,
      syncActiveLink: syncActiveLink
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
