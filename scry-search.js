/* ==========================================================================
   ELISEE SCOUT — MAIN SEARCH CONTROLLER
   Gestione della barra di ricerca unica in Bacheca annunci (#main-search-input)
   con filtraggio dinamico real-time e pulsante di svuotamento (#clear-search-btn).
   ========================================================================== */

(function () {
  'use strict';

  function initMainSearch() {
    const searchInput = document.getElementById('main-search-input') || document.getElementById('scryInput');
    const clearBtn = document.getElementById('clear-search-btn') || document.getElementById('scryBtn');
    const wrapper = searchInput ? searchInput.closest('.search-input-wrapper') : null;

    if (!searchInput) return;
    if (searchInput._searchBound) return;
    searchInput._searchBound = true;

    // Funzione di filtraggio globale
    function filterOpportunities(query) {
      const searchTerm = String(query || '').toLowerCase().trim();
      window._scryQuery = searchTerm;

      // 1. Esegui il render filtrato nativo dei dati di bacheca
      if (typeof window.filterAndRenderJobs === 'function') {
        try { window.filterAndRenderJobs(); } catch (err) { console.error('filterAndRenderJobs error', err); }
      }

      // 2. Filtro aggiuntivo diretto sulle schede/annunci renderizzati
      const cards = document.querySelectorAll('#jobs-container .es-card, .opportunity-card');
      if (cards && cards.length) {
        cards.forEach(card => {
          const textContent = (card.innerText || card.textContent || '').toLowerCase();
          if (!searchTerm || textContent.includes(searchTerm)) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      }

      // 3. Sincronizzazione Tab Persone & Squadre
      const peopleInput = document.getElementById('search-people-query');
      if (peopleInput && peopleInput !== searchInput) {
        peopleInput.value = searchTerm;
        try { peopleInput.dispatchEvent(new Event('input', { bubbles: true })); } catch (_) {}
        if (typeof window.filterPeopleCards === 'function') {
          try { window.filterPeopleCards(); } catch (err) { console.error('filterPeopleCards error', err); }
        }
      }

      // 4. Sincronizzazione Mappa Club
      const clubInput = document.getElementById('club-search') || document.getElementById('es-map-search-input');
      if (clubInput) {
        clubInput.value = searchTerm;
        try { clubInput.dispatchEvent(new Event('input', { bubbles: true })); } catch (_) {}
      }

      // 5. Trigger CustomEvent standard per integrazioni terze
      document.dispatchEvent(new CustomEvent('opportunities:search', { detail: { query: searchTerm } }));
      document.dispatchEvent(new CustomEvent('scry:search', { detail: { query: searchTerm } }));
    }

    // Evento di digitazione real-time
    searchInput.addEventListener('input', (e) => {
      filterOpportunities(e.target.value);
    });

    // Evento Invio con feedback visivo d'anello
    let pulseTimer = null;
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        filterOpportunities('');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const val = searchInput.value.trim();
        filterOpportunities(val);
        if (wrapper && val) {
          wrapper.classList.add('submitted');
          clearTimeout(pulseTimer);
          pulseTimer = setTimeout(() => wrapper.classList.remove('submitted'), 700);
        }
      }
    });

    // Evento pulsante svuota / cancella
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        filterOpportunities('');
        searchInput.focus();
      });
    }

    // Esposizione globale per controlli esterni (es. quick search dalla navbar)
    window.openScrySearch = function (presetQuery) {
      if (typeof window.switchView === 'function') {
        window.switchView('bacheca', '#bacheca-annunci');
      }
      setTimeout(() => {
        searchInput.focus();
        if (presetQuery) {
          searchInput.value = presetQuery;
          filterOpportunities(presetQuery);
        }
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 120);
    };

    window.closeScrySearch = function () {
      if (searchInput) {
        searchInput.value = '';
        filterOpportunities('');
      }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMainSearch);
  } else {
    initMainSearch();
  }
})();
