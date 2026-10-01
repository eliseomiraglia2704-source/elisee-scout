/**
 * Pillola scorrevole sulle barre di navigazione di ogni ruolo.
 * Stessa fisica della navbar pubblica (lerp 0.24), un indicatore per barra.
 */
(function () {
  'use strict';
  if (window.__eliseeRoleNav) return;

  var NAV_SEL = 'nav.es-pro-nav-tabs, nav.es-at-nav-tabs, nav.es-cos-nav-tabs, nav.es-obs-nav-tabs, nav.es-med-nav-tabs, nav.es-ma-nav-tabs, nav.es-gk-nav-tabs';
  var states = new WeakMap();

  function reducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function firstButton(node) {
    if (!node || !node.children) return null;
    for (var i = 0; i < node.children.length; i++) {
      if (node.children[i].tagName === 'BUTTON') return node.children[i];
    }
    return null;
  }

  function itemsOf(nav) {
    var out = [];
    Array.prototype.forEach.call(nav.children, function (child) {
      if (!child || child.classList.contains('es-role-nav__indicator')) return;
      if (child.tagName === 'BUTTON') out.push(child);
      else {
        var trigger = firstButton(child);
        if (trigger) out.push(trigger);
      }
    });
    return out;
  }

  function activeItem(items) {
    for (var i = 0; i < items.length; i++) {
      if (items[i].classList.contains('is-active') || items[i].classList.contains('active')) return items[i];
    }
    return null;
  }

  function measure(nav, link) {
    var nRect = nav.getBoundingClientRect();
    var lRect = link.getBoundingClientRect();
    return {
      x: lRect.left - nRect.left + nav.scrollLeft - nav.clientLeft,
      w: lRect.width
    };
  }

  function paint(state) {
    state.ind.style.setProperty('--ind-x', state.curX.toFixed(2) + 'px');
    state.ind.style.setProperty('--ind-w', state.curW.toFixed(2) + 'px');
    state.ind.style.setProperty('--ind-o', state.curO.toFixed(3));
  }

  function step(state) {
    if (!state.nav.isConnected) {
      state.raf = null;
      return;
    }
    var dx = state.tgtX - state.curX;
    var dw = state.tgtW - state.curW;
    var dO = state.tgtO - state.curO;
    state.curX += dx * 0.24;
    state.curW += dw * 0.24;
    state.curO += dO * 0.24;
    paint(state);
    if (Math.abs(dx) > 0.15 || Math.abs(dw) > 0.15 || Math.abs(dO) > 0.008) {
      state.raf = requestAnimationFrame(function () { step(state); });
    } else {
      state.curX = state.tgtX;
      state.curW = state.tgtW;
      state.curO = state.tgtO;
      paint(state);
      state.raf = null;
    }
  }

  function move(state, target, immediate) {
    if (!state.ind || !state.nav.isConnected) return;
    if (target && state.nav.offsetWidth > 0 && target.offsetWidth > 0) {
      var m = measure(state.nav, target);
      state.tgtX = m.x;
      state.tgtW = m.w;
      state.tgtO = 1;
    } else {
      state.tgtO = 0;
    }
    if (immediate || reducedMotion()) {
      state.curX = state.tgtX;
      state.curW = state.tgtW;
      state.curO = state.tgtO;
      paint(state);
      if (state.raf) cancelAnimationFrame(state.raf);
      state.raf = null;
      return;
    }
    if (!state.raf) state.raf = requestAnimationFrame(function () { step(state); });
  }

  function placeMenu(menu) {
    var wrap = menu.parentElement;
    var btn = firstButton(wrap);
    if (!btn) return;
    var rect = btn.getBoundingClientRect();
    var width = Math.max(200, menu.offsetWidth || 200);
    var left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
    menu.style.setProperty('--es-role-more-top', Math.round(rect.bottom + 8) + 'px');
    menu.style.setProperty('--es-role-more-left', Math.round(left) + 'px');
  }

  function placeOpenMenus(root) {
    var scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll('.es-cos-tab-more-menu.is-open').forEach(placeMenu);
  }

  function itemFromTarget(nav, node) {
    var btn = node && node.closest ? node.closest('button') : null;
    if (!btn || !nav.contains(btn)) return null;
    if (btn.closest('.es-cos-tab-more-menu')) return null;
    var items = itemsOf(nav);
    return items.indexOf(btn) >= 0 ? btn : null;
  }

  function boot(nav) {
    if (!nav || nav.getAttribute('data-es-role-nav') === '1') return;
    nav.setAttribute('data-es-role-nav', '1');
    nav.classList.add('es-role-nav');

    var ind = document.createElement('span');
    ind.className = 'es-role-nav__indicator';
    ind.setAttribute('aria-hidden', 'true');
    nav.insertBefore(ind, nav.firstChild);

    var state = {
      nav: nav,
      ind: ind,
      curX: 0,
      curW: 0,
      curO: 0,
      tgtX: 0,
      tgtW: 0,
      tgtO: 0,
      raf: null,
      hover: null
    };
    states.set(nav, state);

    nav.addEventListener('mouseover', function (e) {
      var btn = itemFromTarget(nav, e.target);
      if (!btn || btn === state.hover) return;
      state.hover = btn;
      move(state, btn, false);
    });
    nav.addEventListener('mouseleave', function () {
      state.hover = null;
      move(state, activeItem(itemsOf(nav)), false);
    });
    nav.addEventListener('scroll', function () {
      move(state, state.hover || activeItem(itemsOf(nav)), true);
    }, { passive: true });
    nav.addEventListener('keydown', function (e) {
      var key = e.key;
      if (key !== 'ArrowRight' && key !== 'ArrowLeft' && key !== 'Home' && key !== 'End') return;
      var items = itemsOf(nav);
      var index = items.indexOf(document.activeElement);
      if (index < 0) return;
      e.preventDefault();
      var next = index;
      if (key === 'ArrowRight') next = Math.min(items.length - 1, index + 1);
      else if (key === 'ArrowLeft') next = Math.max(0, index - 1);
      else if (key === 'Home') next = 0;
      else next = items.length - 1;
      if (items[next]) items[next].focus();
    });

    var classWatch = new MutationObserver(function () {
      if (!state.hover) move(state, activeItem(itemsOf(nav)), false);
      placeOpenMenus(nav);
    });
    classWatch.observe(nav, { subtree: true, attributes: true, attributeFilter: ['class', 'hidden'] });

    if (window.ResizeObserver) {
      var resizeWatch = new ResizeObserver(function () {
        if (nav.offsetWidth === 0) return;
        move(state, state.hover || activeItem(itemsOf(nav)), true);
      });
      resizeWatch.observe(nav);
    }

    requestAnimationFrame(function () {
      move(state, activeItem(itemsOf(nav)), true);
    });
  }

  function scan() {
    document.querySelectorAll(NAV_SEL).forEach(boot);
    document.querySelectorAll('nav[data-es-role-nav="1"]').forEach(function (nav) {
      var state = states.get(nav);
      if (!state || state.hover || nav.offsetWidth === 0) return;
      move(state, activeItem(itemsOf(nav)), true);
    });
  }

  var scanTimer = 0;
  function scheduleScan() {
    if (scanTimer) return;
    scanTimer = requestAnimationFrame(function () {
      scanTimer = 0;
      scan();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.es-cos-tab-more-menu.is-open').forEach(function (menu) {
      menu.classList.remove('is-open');
      var btn = firstButton(menu.parentElement);
      if (btn) {
        btn.setAttribute('aria-expanded', 'false');
        btn.focus();
      }
    });
  });

  window.addEventListener('resize', function () {
    placeOpenMenus(document);
    scheduleScan();
  });
  document.addEventListener('elisee:view-changed', scheduleScan);
  document.addEventListener('elisee:role-changed', scheduleScan);
  window.addEventListener('hashchange', scheduleScan);

  var domWatch = new MutationObserver(scheduleScan);
  function start() {
    scan();
    if (document.body) domWatch.observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  window.__eliseeRoleNav = { scan: scan };
})();
