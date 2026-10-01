/* ==========================================================================
   ELISEE SCOUT — MAIN SEARCH CONTROLLER
   Gestione della barra di ricerca unica in Bacheca annunci (#main-search-input)
   con filtraggio dinamico real-time e pulsante di svuotamento (#clear-search-btn).
   ========================================================================== */

(function () {
  'use strict';

  var WORD_LEXICON = [
    { label: 'Attaccante', kind: 'role' },
    { label: 'Centrocampista', kind: 'role' },
    { label: 'Difensore', kind: 'role' },
    { label: 'Terzino', kind: 'role' },
    { label: 'Portiere', kind: 'role' },
    { label: 'Ala', kind: 'role' },
    { label: 'Mediano', kind: 'role' },
    { label: 'Allenatore', kind: 'role' },
    { label: 'Preparatore atletico', kind: 'role' },
    { label: 'Match Analyst', kind: 'role' },
    { label: 'Direttore sportivo', kind: 'role' },
    { label: 'Scout', kind: 'role' },
    { label: 'Serie A', kind: 'word' },
    { label: 'Serie B', kind: 'word' },
    { label: 'Serie C', kind: 'word' },
    { label: 'Serie D', kind: 'word' },
    { label: 'Eccellenza', kind: 'word' },
    { label: 'Promozione', kind: 'word' },
    { label: 'Prima Categoria', kind: 'word' },
    { label: 'Under 19', kind: 'word' },
    { label: 'Under 17', kind: 'word' },
    { label: 'Primavera', kind: 'word' },
    { label: 'Fuoriquota Under', kind: 'word' },
    { label: 'Vitto e alloggio', kind: 'word' },
    { label: 'Svincolato', kind: 'word' },
    { label: 'Puglia', kind: 'word' },
    { label: 'Lazio', kind: 'word' },
    { label: 'Lombardia', kind: 'word' },
    { label: 'Campania', kind: 'word' },
    { label: 'Sicilia', kind: 'word' },
    { label: 'Veneto', kind: 'word' },
    { label: 'Toscana', kind: 'word' },
    { label: 'Emilia-Romagna', kind: 'word' }
  ];

  var FALLBACK_CITIES = [
    'Foggia (FG)', 'Lucera (FG)', 'San Severo (FG)', 'Manfredonia (FG)', 'Cerignola (FG)',
    'Bari (BA)', 'Roma (RM)', 'Milano (MI)', 'Napoli (NA)', 'Torino (TO)', 'Palermo (PA)',
    'Bologna (BO)', 'Firenze (FI)', 'Genova (GE)', 'Verona (VR)', 'Catania (CT)', 'Lecce (LE)'
  ];

  var comuniLoad = null;

  function norm(value) {
    return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  }

  function esc(value) {
    return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function kindText(kind) {
    var key = 'search.suggest.' + kind;
    if (window.EliseeI18n && typeof window.EliseeI18n.t === 'function') return window.EliseeI18n.t(key);
    if (kind === 'city') return 'Città';
    if (kind === 'role') return 'Ruolo';
    if (kind === 'club') return 'Club';
    return 'Parola';
  }

  function parseComune(raw) {
    var text = String(raw || '').trim();
    var match = text.match(/^(.*)\s+\(([A-Z0-9]{2})\)$/);
    if (!match) return { name: text, prov: '' };
    return { name: match[1].trim(), prov: match[2] };
  }

  function loadComuni() {
    if (window.ELISEE_COMUNI_ITALIANI && window.ELISEE_COMUNI_ITALIANI.length) {
      return Promise.resolve(window.ELISEE_COMUNI_ITALIANI);
    }
    if (!comuniLoad) {
      comuniLoad = new Promise(function (resolve) {
        var script = document.createElement('script');
        script.src = 'comuni-italiani.js?v=20261001_FIX4';
        script.onload = function () { resolve(window.ELISEE_COMUNI_ITALIANI || FALLBACK_CITIES); };
        script.onerror = function () { resolve(FALLBACK_CITIES); };
        document.head.appendChild(script);
      });
    }
    return comuniLoad;
  }

  function rankMatch(name, query) {
    var n = norm(name);
    if (!query) return 0;
    if (n.indexOf(query) === 0) return 2;
    if (n.indexOf(query) > 0) return 1;
    return 0;
  }

  function initMainSearch() {
    const searchInput = document.getElementById('main-search-input') || document.getElementById('scryInput');
    const clearBtn = document.getElementById('clear-search-btn') || document.getElementById('scryBtn');
    const wrapper = searchInput ? searchInput.closest('.search-input-wrapper') : null;
    const suggestBox = document.getElementById('es-search-suggest');
    const suggestHost = searchInput ? searchInput.closest('.search-bar-container') : null;
    var suggestions = [];
    var activeIndex = -1;
    var suggestToken = 0;

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

      // 6. Sincronizzazione debounced asincrona con il backend (/api/bacheca?q=...)
      syncBackendSearch(searchTerm);
    }

    let backendSearchTimer = null;
    function syncBackendSearch(query) {
      clearTimeout(backendSearchTimer);
      if (!query || query.length < 2) return;
      backendSearchTimer = setTimeout(() => {
        fetch('/api/bacheca?q=' + encodeURIComponent(query))
          .then(r => r.json())
          .then(data => {
            if (data && data.ok && Array.isArray(data.items) && data.items.length) {
              if (window.EliseeBacheca && typeof window.EliseeBacheca.mergeRemote === 'function') {
                window.EliseeBacheca.mergeRemote(data.items);
                if (typeof window.filterAndRenderJobs === 'function') window.filterAndRenderJobs();
              }
            }
          })
          .catch(() => {});
      }, 300);
    }

    // Ricerca federata unificata su Annunci, Club e Calciatori (/api/search)
    window.EliseeGlobalSearch = async function (q, type) {
      try {
        const url = '/api/search?q=' + encodeURIComponent(q || '') + (type ? '&type=' + encodeURIComponent(type) : '');
        const res = await fetch(url);
        return await res.json();
      } catch (err) {
        console.error('EliseeGlobalSearch error', err);
        return { ok: false, error: String(err) };
      }
    };

    function boardTerms() {
      var terms = [];
      document.querySelectorAll('#jobs-container .es-card__role').forEach(function (el) {
        var label = (el.textContent || '').trim();
        if (label) terms.push({ label: label, value: label, kind: 'word' });
      });
      document.querySelectorAll('#jobs-container .es-card__club strong').forEach(function (el) {
        var label = (el.textContent || '').trim();
        if (label) terms.push({ label: label, value: label, kind: 'club' });
      });
      document.querySelectorAll('#jobs-container .es-card__meta').forEach(function (el) {
        String(el.textContent || '').split('·').forEach(function (part) {
          var label = part.trim();
          if (label.length >= 3) terms.push({ label: label, value: label, kind: 'word' });
        });
      });
      return terms;
    }

    function collectLocal(query) {
      var found = [];
      var seen = {};
      function push(item, score) {
        var key = norm(item.value || item.label) + '|' + item.kind;
        if (!item.label || seen[key] || score < 1) return;
        seen[key] = true;
        found.push({ label: item.label, value: item.value || item.label, kind: item.kind, score: score });
      }

      WORD_LEXICON.forEach(function (item) {
        push(item, rankMatch(item.label, query));
      });
      boardTerms().forEach(function (item) {
        push(item, rankMatch(item.label, query));
      });

      var cities = (window.ELISEE_COMUNI_ITALIANI && window.ELISEE_COMUNI_ITALIANI.length) ? window.ELISEE_COMUNI_ITALIANI : FALLBACK_CITIES;
      var cityPool = [];
      for (var i = 0; i < cities.length; i++) {
        var parsed = parseComune(cities[i]);
        var score = rankMatch(parsed.name, query);
        if (!score && parsed.prov && norm(parsed.prov) === query) score = 1;
        if (!score) continue;
        var at = norm(parsed.name).indexOf(query);
        cityPool.push({
          label: parsed.prov ? parsed.name + ' (' + parsed.prov + ')' : parsed.name,
          value: parsed.name,
          kind: 'city',
          score: score,
          at: at < 0 ? 99 : at
        });
      }
      cityPool.sort(function (a, b) {
        return b.score - a.score || a.at - b.at || a.label.localeCompare(b.label, 'it');
      });
      cityPool.slice(0, 5).forEach(function (item) { push(item, item.score); });

      found.sort(function (a, b) { return b.score - a.score || a.label.localeCompare(b.label, 'it'); });
      return found.slice(0, 8);
    }

    function closeSuggest() {
      suggestions = [];
      activeIndex = -1;
      if (suggestBox) {
        suggestBox.hidden = true;
        suggestBox.innerHTML = '';
      }
      if (suggestHost) suggestHost.classList.remove('is-suggest-open');
      searchInput.setAttribute('aria-expanded', 'false');
      searchInput.removeAttribute('aria-activedescendant');
    }

    function paintSuggest() {
      if (!suggestBox) return;
      if (!suggestions.length) {
        closeSuggest();
        return;
      }
      var listLabel = (window.EliseeI18n && window.EliseeI18n.t) ? window.EliseeI18n.t('search.suggest.list') : 'Suggerimenti di ricerca';
      suggestBox.setAttribute('aria-label', listLabel);
      suggestBox.innerHTML = suggestions.map(function (item, index) {
        var q = norm(searchInput.value);
        var plain = item.label;
        var n = norm(plain);
        var at = n.indexOf(q);
        var htmlLabel = esc(plain);
        if (q && at >= 0 && n.length === plain.length) {
          htmlLabel = esc(plain.slice(0, at)) + '<mark>' + esc(plain.slice(at, at + q.length)) + '</mark>' + esc(plain.slice(at + q.length));
        }
        return '<button type="button" class="es-search-suggest__item' + (index === activeIndex ? ' is-active' : '') + '" role="option" id="es-search-opt-' + index + '" aria-selected="' + (index === activeIndex ? 'true' : 'false') + '" data-index="' + index + '"><span class="es-search-suggest__label">' + htmlLabel + '</span><span class="es-search-suggest__kind">' + esc(kindText(item.kind)) + '</span></button>';
      }).join('');
      suggestBox.hidden = false;
      if (suggestHost) suggestHost.classList.add('is-suggest-open');
      searchInput.setAttribute('aria-expanded', 'true');
      if (activeIndex >= 0) searchInput.setAttribute('aria-activedescendant', 'es-search-opt-' + activeIndex);
      else searchInput.removeAttribute('aria-activedescendant');
    }

    function applySuggestion(item) {
      if (!item) return;
      searchInput.value = item.value;
      closeSuggest();
      filterOpportunities(item.value);
      document.dispatchEvent(new CustomEvent('elisee:scout-search', {
        detail: { source: 'bacheca', q: item.value }
      }));
    }

    function refreshSuggest(raw) {
      var query = norm(raw);
      if (query.length < 2) {
        closeSuggest();
        return;
      }
      var token = ++suggestToken;
      suggestions = collectLocal(query);
      activeIndex = suggestions.length ? 0 : -1;
      paintSuggest();
      loadComuni().then(function () {
        if (token !== suggestToken || norm(searchInput.value) !== query) return;
        suggestions = collectLocal(query);
        if (activeIndex >= suggestions.length) activeIndex = suggestions.length ? 0 : -1;
        paintSuggest();
      });
      if (window.EliseeGlobalSearch) {
        window.EliseeGlobalSearch(query, 'autocomplete').then(function (res) {
          if (token !== suggestToken || norm(searchInput.value) !== query) return;
          var remote = (((res || {}).data || {}).suggestions) || [];
          remote.forEach(function (item) {
            if (!item || item.type !== 'club' || !item.label) return;
            var exists = suggestions.some(function (s) { return norm(s.value) === norm(item.label); });
            if (exists || suggestions.length >= 8) return;
            suggestions.push({ label: item.label, value: item.label, kind: 'club', score: 1 });
          });
          paintSuggest();
        }).catch(function () {});
      }
    }

    // Evento di digitazione real-time
    searchInput.addEventListener('input', (e) => {
      refreshSuggest(e.target.value);
      filterOpportunities(e.target.value);
    });

    searchInput.addEventListener('focus', function () {
      if (norm(searchInput.value).length >= 2) refreshSuggest(searchInput.value);
    });

    // Evento Invio con feedback visivo d'anello
    let pulseTimer = null;
    searchInput.addEventListener('keydown', (e) => {
      var open = suggestBox && !suggestBox.hidden && suggestions.length;
      if (e.key === 'ArrowDown' && open) {
        e.preventDefault();
        activeIndex = (activeIndex + 1) % suggestions.length;
        paintSuggest();
        return;
      }
      if (e.key === 'ArrowUp' && open) {
        e.preventDefault();
        activeIndex = activeIndex <= 0 ? suggestions.length - 1 : activeIndex - 1;
        paintSuggest();
        return;
      }
      if (e.key === 'Escape') {
        if (open) {
          e.preventDefault();
          closeSuggest();
          return;
        }
        searchInput.value = '';
        filterOpportunities('');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (open && activeIndex >= 0 && suggestions[activeIndex]) {
          applySuggestion(suggestions[activeIndex]);
          return;
        }
        const val = searchInput.value.trim();
        closeSuggest();
        filterOpportunities(val);
        document.dispatchEvent(new CustomEvent('elisee:scout-search', {
          detail: { source: 'bacheca', q: val }
        }));
        if (wrapper && val) {
          wrapper.classList.add('submitted');
          clearTimeout(pulseTimer);
          pulseTimer = setTimeout(() => wrapper.classList.remove('submitted'), 700);
        }
      }
    });

    if (suggestBox) {
      suggestBox.addEventListener('mousedown', function (e) { e.preventDefault(); });
      suggestBox.addEventListener('click', function (e) {
        var btn = e.target.closest('.es-search-suggest__item');
        if (!btn) return;
        var index = Number(btn.getAttribute('data-index'));
        applySuggestion(suggestions[index]);
      });
    }

    document.addEventListener('click', function (e) {
      if (!suggestHost || suggestHost.contains(e.target)) return;
      closeSuggest();
    });

    // Evento pulsante svuota / cancella
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        closeSuggest();
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
