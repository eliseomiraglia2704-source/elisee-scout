/* ==========================================================================
   ELISEE SCOUT — SCRY SEARCH CONTROLLER
   Gestione interattiva della barra di ricerca 3D flip con dispatch su Bacheca
   e Mappa Club.
   ========================================================================== */

(function () {
  'use strict';

  function initScry() {
    const scry = document.getElementById('scry');
    const input = document.getElementById('scryInput');
    const btn = document.getElementById('scryBtn');

    if (!scry || !input || !btn) return;
    if (scry._scryInitialized) return;
    scry._scryInitialized = true;

    const isOpen = () => scry.dataset.state === 'open';
    const hasText = () => input.value.trim().length > 0;

    function open() {
      if (isOpen()) return;
      scry.dataset.state = 'open';
      setTimeout(() => input.focus(), 260);
    }

    function close({ focusBtn = false } = {}) {
      scry.dataset.state = 'closed';
      input.value = '';
      if (focusBtn) btn.focus();
      // Ripristina i filtri quando la ricerca viene chiusa
      if (window._scryQuery) {
        window._scryQuery = '';
        executeLiveSearch('');
      }
    }

    function clear() {
      input.value = '';
      input.focus();
      if (window._scryQuery) {
        window._scryQuery = '';
        executeLiveSearch('');
      }
    }

    btn.addEventListener('click', () => {
      if (!isOpen()) { open(); return; }
      if (hasText()) { clear(); return; }
      close({ focusBtn: true });
    });

    let submitTimer = null;
    function submit(query) {
      scry.classList.add('submitted');
      clearTimeout(submitTimer);
      submitTimer = setTimeout(() => scry.classList.remove('submitted'), 900);

      // COLLEGA QUI: Esecuzione reale del filtro su Bacheca annunci e Mappa Club
      executeLiveSearch(query);

      // Trigger evento Custom standard
      scry.dispatchEvent(new CustomEvent('scry:search', { detail: { query } }));
    }

    function executeLiveSearch(query) {
      const q = String(query || '').trim();
      window._scryQuery = q;

      // 1. Filtro Bacheca Annunci (Vista 1)
      if (typeof window.filterAndRenderJobs === 'function') {
        try { window.filterAndRenderJobs(); } catch (err) { console.error('scry filterAndRenderJobs', err); }
      }

      // 2. Filtro Persone & Squadre (Vista 2)
      const peopleInput = document.getElementById('search-people-query');
      if (peopleInput) {
        peopleInput.value = q;
        try { peopleInput.dispatchEvent(new Event('input', { bubbles: true })); } catch (_) {}
        if (typeof window.filterPeopleCards === 'function') {
          try { window.filterPeopleCards(); } catch (err) { console.error('scry filterPeopleCards', err); }
        }
      }

      // 3. Filtro Mappa Club
      const clubInput = document.getElementById('club-search') || document.getElementById('es-map-search-input');
      if (clubInput) {
        clubInput.value = q;
        try { clubInput.dispatchEvent(new Event('input', { bubbles: true })); } catch (_) {}
      }

      // 4. Feedback visivo
      if (q && typeof window.showToast === 'function') {
        window.showToast('Risultati per: «' + q + '»', 'info');
      }
    }

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close({ focusBtn: true });
      if (e.key === 'Enter') {
        const query = input.value.trim();
        if (!query) return;
        submit(query);
      }
    });

    const KEYS = new Set(['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' ']);
    document.addEventListener('keydown', (e) => {
      if (KEYS.has(e.key)) scry.classList.add('kbd');
    });
    document.addEventListener('mousedown', () => scry.classList.remove('kbd'));

    // Esposizione per controlli esterni (es. quick search dalla nav)
    window.openScrySearch = function (presetQuery) {
      if (typeof window.switchView === 'function') {
        window.switchView('bacheca', '#bacheca-annunci');
      }
      setTimeout(() => {
        open();
        if (presetQuery) {
          input.value = presetQuery;
          submit(presetQuery);
        }
        scry.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 120);
    };

    window.closeScrySearch = close;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScry);
  } else {
    initScry();
  }
})();
