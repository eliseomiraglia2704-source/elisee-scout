(function () {
  'use strict';

  var PHRASES = [
    "Cerca 'Calciatori'",
    "Cerca 'Serie D'",
    "Cerca 'Portieri'",
    "Cerca 'Club'",
    "Cerca 'Allenatori'",
    "Cerca 'Promesse'"
  ];

  function qs(sel, root) { return (root || document).querySelector(sel); }

  function measureBorder(wrap) {
    var svg = qs('.es-nav-search__border', wrap);
    var rect = qs('.es-nav-search__border rect', wrap);
    var field = qs('.es-nav-search__field', wrap);
    if (!svg || !rect || !field) return;
    try {
      var w = Math.max(40, field.getBoundingClientRect().width);
      var h = Math.max(34, field.getBoundingClientRect().height);
      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      rect.setAttribute('width', String(Math.max(1, w - 2.2)));
      rect.setAttribute('height', String(Math.max(1, h - 2.2)));
      rect.setAttribute('x', '1.1');
      rect.setAttribute('y', '1.1');
      rect.setAttribute('pathLength', '1');
      rect.style.removeProperty('stroke-dasharray');
      rect.style.removeProperty('stroke-dashoffset');
    } catch (e) {}
  }

  function initTypewriter(wrap, input, phEl) {
    var i = 0, ch = 0, deleting = false, timer = null;

    function paint() {
      if (!phEl) return;
      var text = PHRASES[i] || '';
      phEl.innerHTML = text.slice(0, ch) + '<span class="es-nav-search__ph-cursor" aria-hidden="true"></span>';
    }

    function tick() {
      if (wrap.getAttribute('data-state') !== 'open') {
        timer = setTimeout(tick, 400);
        return;
      }
      if (input && input.value) {
        phEl && phEl.classList.remove('is-on');
        timer = setTimeout(tick, 500);
        return;
      }
      phEl && phEl.classList.add('is-on');
      var text = PHRASES[i] || '';
      if (!deleting) {
        ch += 1;
        paint();
        if (ch >= text.length) {
          deleting = true;
          timer = setTimeout(tick, 1400);
          return;
        }
        timer = setTimeout(tick, 70);
      } else {
        ch -= 1;
        paint();
        if (ch <= 0) {
          deleting = false;
          i = (i + 1) % PHRASES.length;
          timer = setTimeout(tick, 380);
          return;
        }
        timer = setTimeout(tick, 38);
      }
    }

    paint();
    timer = setTimeout(tick, 400);
  }

  function initNavSearch() {
    var wrap = qs('#es-nav-search');
    if (!wrap || wrap._esBound) return;
    wrap._esBound = true;
    wrap.setAttribute('data-state', 'closed');

    var input = qs('#es-nav-search-input', wrap);
    var btn = qs('#es-nav-search-btn', wrap);
    var toast = qs('#es-nav-search-toast', wrap);
    var phEl = qs('#es-nav-search-ph', wrap);
    var toastTimer = null;

    measureBorder(wrap);
    window.addEventListener('resize', function () {
      if (wrap.getAttribute('data-state') === 'open') measureBorder(wrap);
    });
    initTypewriter(wrap, input, phEl);

    function isOpen() { return wrap.getAttribute('data-state') === 'open'; }
    function hasText() { return !!(input && String(input.value || '').trim()); }

    function setBtnLabel() {
      if (!btn) return;
      var name = !isOpen() ? 'Apri ricerca' : (hasText() ? 'Cancella ricerca' : 'Chiudi ricerca');
      btn.setAttribute('aria-label', name);
      btn.title = name;
    }

    function setToast(q) {
      if (!toast) return;
      var safe = String(q || '').replace(/</g, '&lt;').replace(/"/g, '&quot;');
      toast.innerHTML = 'Ricerca · <strong>"' + safe + '"</strong>';
      wrap.classList.add('is-toast');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { wrap.classList.remove('is-toast'); }, 2600);
    }

    function open() {
      wrap.setAttribute('data-state', 'open');
      requestAnimationFrame(function () { measureBorder(wrap); });
      setTimeout(function () { try { input && input.focus(); } catch (e) {} }, 280);
      setBtnLabel();
    }

    function clearField() {
      if (input) input.value = '';
      if (phEl) phEl.classList.add('is-on');
      wrap.classList.remove('is-toast');
      try { input && input.focus(); } catch (e) {}
      setBtnLabel();
    }

    function close() {
      wrap.setAttribute('data-state', 'closed');
      wrap.classList.remove('is-toast', 'is-border');
      if (input) input.value = '';
      if (phEl) phEl.classList.add('is-on');
      clearTimeout(toastTimer);
      setBtnLabel();
    }

    function runSearch(q) {
      q = String(q || '').trim();
      if (!q) return;
      setToast(q);
      try {
        if (typeof window.switchView === 'function') {
          window.switchView('bacheca', '#bacheca-network');
        }
      } catch (e) {}
      setTimeout(function () {
        var peopleQ = document.getElementById('search-people-query');
        var clubQ = document.getElementById('club-search');
        var leader = document.getElementById('leaderboard-search');
        if (peopleQ) {
          peopleQ.value = q;
          try { peopleQ.dispatchEvent(new Event('input', { bubbles: true })); } catch (e) {}
          if (typeof window.filterPeopleCards === 'function') window.filterPeopleCards();
        } else if (clubQ) {
          clubQ.value = q;
          try { clubQ.dispatchEvent(new Event('input', { bubbles: true })); } catch (e) {}
        } else if (leader) {
          leader.value = q;
          try { leader.dispatchEvent(new Event('input', { bubbles: true })); } catch (e) {}
        }
      }, 140);
    }

    if (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (!isOpen()) open();
        else if (hasText()) clearField();
        else close();
      });
    }

    if (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          e.preventDefault();
          if (hasText()) clearField();
          else close();
          return;
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          runSearch(input.value);
        }
      });
      input.addEventListener('input', function () {
        var q = (input.value || '').trim();
        if (phEl) phEl.classList.toggle('is-on', !q);
        if (q.length >= 2) setToast(q);
        else wrap.classList.remove('is-toast');
        setBtnLabel();
      });
      input.addEventListener('focus', function () { wrap.classList.add('is-border'); });
      input.addEventListener('blur', function () { wrap.classList.remove('is-border'); });
    }

    document.addEventListener('click', function (e) {
      if (!isOpen()) return;
      if (wrap.contains(e.target)) return;
      if (hasText()) return;
      close();
    });

    setBtnLabel();
    window.openEliseeNavSearch = open;
    window.closeEliseeNavSearch = close;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavSearch);
  } else {
    initNavSearch();
  }
})();
