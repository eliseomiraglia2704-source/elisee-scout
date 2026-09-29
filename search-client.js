/**
 * ELISEE SCOUT — Search Client SDK (Regola 3: Pacchetti & Regola 4: Modello OSI)
 *
 * Fornisce un client di rete unificato con:
 * - Debounce configurabile (default 200ms)
 * - AbortController automatico (cancella richieste obsolete in volo per evitare race conditions)
 * - Client-side micro-cache con TTL (risparmio pacchetti di rete)
 * - Supporto canali multipli per ricerche concorrenti (Navbar, Mappa, Bacheca, Autocomplete)
 */

(function (root) {
  'use strict';

  var DEFAULT_DEBOUNCE_MS = 200;
  var DEFAULT_CACHE_TTL_MS = 30000; // 30s

  function createSearchChannel(channelName, channelOptions) {
    var opts = channelOptions || {};
    var debounceMs = typeof opts.debounce === 'number' ? opts.debounce : DEFAULT_DEBOUNCE_MS;
    var cacheTtl = typeof opts.cacheTtl === 'number' ? opts.cacheTtl : DEFAULT_CACHE_TTL_MS;

    var activeAbortController = null;
    var debounceTimer = null;
    var memoryCache = new Map(); // key -> { timestamp, data }

    function getCached(key) {
      var entry = memoryCache.get(key);
      if (!entry) return null;
      if (Date.now() - entry.timestamp > cacheTtl) {
        memoryCache.delete(key);
        return null;
      }
      return entry.data;
    }

    function setCache(key, data) {
      if (memoryCache.size > 80) {
        var firstKey = memoryCache.keys().next().value;
        if (firstKey) memoryCache.delete(firstKey);
      }
      memoryCache.set(key, { timestamp: Date.now(), data: data });
    }

    /**
     * Esegue una ricerca gestendo automaticamente debounce e aborting.
     * @param {string} query - Parola chiave di ricerca
     * @param {object} params - Parametri aggiuntivi (type, limit, offset, ecc.)
     * @returns {Promise<object|null>} Risultati o null se la richiesta è stata abortita
     */
    function query(queryStr, params) {
      var q = String(queryStr || '').trim();
      var extra = params || {};
      var type = extra.type || 'all';
      var limit = extra.limit || 20;
      var offset = extra.offset || 0;

      var cacheKey = [type, limit, offset, q.toLowerCase()].join(':');

      // Restituisce subito dalla cache se disponibile
      var cached = getCached(cacheKey);
      if (cached) {
        return Promise.resolve(cached);
      }

      return new Promise(function (resolve, reject) {
        // Annulla il debounce precedente se l'utente continua a digitare
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }

        debounceTimer = setTimeout(function () {
          // Se c'è una richiesta precedente ancora in volo, abortiscila istantaneamente
          if (activeAbortController) {
            try {
              activeAbortController.abort();
            } catch (_) {}
          }

          var controller = new AbortController();
          activeAbortController = controller;

          var url = new URL('/api/search', window.location.origin);
          url.searchParams.set('q', q);
          url.searchParams.set('type', type);
          url.searchParams.set('limit', String(limit));
          if (offset > 0) url.searchParams.set('offset', String(offset));

          var headers = {
            'Accept': 'application/json'
          };

          // Aggiunge token se presente
          try {
            var token = localStorage.getItem('elisee_token') || sessionStorage.getItem('elisee_token');
            if (token) headers['Authorization'] = 'Bearer ' + token;
          } catch (_) {}

          fetch(url.toString(), {
            method: 'GET',
            headers: headers,
            signal: controller.signal
          })
            .then(function (res) {
              if (res.status === 304) {
                return cached || { ok: true, notModified: true };
              }
              if (!res.ok) {
                return res.json().then(function (errJson) {
                  throw new Error(errJson.message || 'HTTP ' + res.status);
                });
              }
              return res.json();
            })
            .then(function (data) {
              if (activeAbortController === controller) {
                activeAbortController = null;
              }
              setCache(cacheKey, data);
              resolve(data);
            })
            .catch(function (err) {
              if (err.name === 'AbortError') {
                // Silently ignore aborts, not an error
                resolve(null);
              } else {
                if (activeAbortController === controller) {
                  activeAbortController = null;
                }
                reject(err);
              }
            });
        }, debounceMs);
      });
    }

    function cancel() {
      if (debounceTimer) clearTimeout(debounceTimer);
      if (activeAbortController) {
        try { activeAbortController.abort(); } catch (_) {}
        activeAbortController = null;
      }
    }

    return {
      name: channelName,
      query: query,
      cancel: cancel,
      clearCache: function () { memoryCache.clear(); }
    };
  }

  // Canale globale di default
  var defaultChannel = createSearchChannel('global', { debounce: 200 });

  root.EliseeSearch = {
    query: defaultChannel.query,
    cancel: defaultChannel.cancel,
    createChannel: createSearchChannel
  };

})(typeof window !== 'undefined' ? window : this);
