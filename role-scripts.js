/**
 * ELISEE SCOUT — Script delle aree riservate caricati solo quando servono.
 *
 * Le schermate di ruolo (allenatore, presidente, medico…) e i pannelli admin
 * pesano circa 1,8 MB e a un visitatore non servono.
 *
 * - Utente loggato o staff all'apertura della pagina: gli script vengono scritti
 *   nella pagina nello stesso punto e nello stesso ordine di prima
 *   (EliseeRoleScripts.write), quindi il comportamento è identico.
 * - Visitatore: non vengono caricati.
 * - Login senza ricaricare la pagina: EliseeRoleScripts.ensure() li carica in
 *   ordine; i loro listener DOMContentLoaded/load partono subito.
 *
 * Deve essere caricato nel <head>, dopo elisee-admin-guard.js.
 */
(function () {
  'use strict';

  function hasSession() {
    try {
      if (localStorage.getItem('elisee_user_auth') === 'true') return true;
      if (localStorage.getItem('elisee_auth_token')) return true;
    } catch (_) {}
    try {
      if (window.EliseeAdmin && window.EliseeAdmin.isStaff()) return true;
    } catch (_) {}
    return false;
  }

  var active = hasSession();
  var registered = [];
  var registeredStyles = [];
  var loaded = active;
  var pending = null;

  function write(list) {
    list.forEach(function (src) { registered.push(src); });
    if (!active) return;
    for (var i = 0; i < list.length; i++) {
      document.write('<script src="' + list[i] + '"><\/script>');
    }
  }

  // Fogli di stile delle dashboard: stesso principio degli script.
  function writeStyles(list) {
    list.forEach(function (href) { registeredStyles.push(href); });
    if (!active) return;
    for (var i = 0; i < list.length; i++) {
      document.write('<link rel="stylesheet" href="' + list[i] + '">');
    }
  }

  function loadStyle(href) {
    return new Promise(function (resolve) {
      var l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = href;
      l.onload = l.onerror = function () { resolve(); };
      document.head.appendChild(l);
    });
  }

  // Dopo il caricamento della pagina, gli script aggiunti tardi registrano
  // ancora listener DOMContentLoaded/load: li eseguiamo subito.
  var shimmed = false;
  function installLateLoadShim() {
    if (shimmed) return;
    shimmed = true;
    var orig = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (type, fn, opts) {
      var late = (type === 'DOMContentLoaded' && (this === document || this === window) && document.readyState !== 'loading') ||
        (type === 'load' && this === window && document.readyState === 'complete');
      if (late && typeof fn === 'function') {
        var self = this;
        setTimeout(function () {
          try { fn.call(self, new Event(type)); } catch (e) { setTimeout(function () { throw e; }); }
        }, 0);
        return;
      }
      return orig.call(this, type, fn, opts);
    };
  }

  function loadOne(src) {
    return new Promise(function (resolve) {
      var s = document.createElement('script');
      s.src = src;
      s.async = false;
      s.onload = s.onerror = function () { resolve(); };
      document.body.appendChild(s);
    });
  }

  function ensure() {
    if (loaded) return Promise.resolve(true);
    if (pending) return pending;
    installLateLoadShim();
    pending = Promise.all(registeredStyles.map(loadStyle)).then(function () {
      return registered.reduce(function (p, src) {
        return p.then(function () { return loadOne(src); });
      }, Promise.resolve());
    });
    pending = pending.then(function () {
      loaded = true;
      active = true;
      try { document.dispatchEvent(new CustomEvent('elisee:role-scripts-ready')); } catch (_) {}
      try { if (typeof window.updateNavbarUserUI === 'function') window.updateNavbarUserUI(); } catch (_) {}
      try { window.dispatchEvent(new HashChangeEvent('hashchange')); } catch (_) {}
      return true;
    });
    return pending;
  }

  // Login fatto senza ricaricare la pagina: carica gli script di ruolo.
  try {
    var origSet = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      var r = origSet.apply(this, arguments);
      if (!loaded && this === window.localStorage &&
          ((key === 'elisee_user_auth' && String(value) === 'true') ||
           (key === 'elisee_auth_token' && value) ||
           (key === 'elisee_admin_session_token' && value))) {
        setTimeout(ensure, 0);
      }
      return r;
    };
  } catch (_) {}

  window.EliseeRoleScripts = {
    write: write,
    writeStyles: writeStyles,
    ensure: ensure,
    isLoaded: function () { return loaded; }
  };
})();

/**
 * Librerie esterne pesanti caricate solo quando servono (mappa, PDF, carosello).
 * EliseeLibs.load('leaflet' | 'jspdf' | 'swiper') → Promise.
 */
(function () {
  'use strict';
  var LIBS = {
    leaflet: ['https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js'],
    jspdf: ['https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'],
    swiper: ['https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js']
  };
  var pending = {};
  function addScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.async = false;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('Caricamento non riuscito: ' + src)); };
      document.head.appendChild(s);
    });
  }
  function load(name) {
    if (pending[name]) return pending[name];
    var urls = LIBS[name] || [];
    pending[name] = urls.reduce(function (p, u) { return p.then(function () { return addScript(u); }); }, Promise.resolve())
      .catch(function (e) { delete pending[name]; throw e; });
    return pending[name];
  }
  // Minigioco carriera (circa 400 KB): stile e script solo quando si apre.
  function addStyle(href) {
    return new Promise(function (resolve) {
      var l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = href;
      l.onload = l.onerror = function () { resolve(); };
      document.head.appendChild(l);
    });
  }
  function lazyMinigioco(cssHref, jsSrc) {
    var loading = null;
    function ensureMg() {
      if (!loading) {
        loading = addStyle(cssHref).then(function () { return addScript(jsSrc); })
          .catch(function (e) { loading = null; throw e; });
      }
      return loading;
    }
    function open() {
      var args = arguments;
      ensureMg().then(function () {
        var real = window.EliseeMinigioco;
        if (real && !real.__stub && typeof real.open === 'function') real.open.apply(real, args);
      }, function () {
        if (typeof window.showToast === 'function') window.showToast('Minigioco non disponibile, riprova.', 'error');
      });
    }
    window.EliseeMinigioco = { __stub: true, open: open, openHub: open, openCareer: open, close: function () {} };
    window.openMinigiocoCarriera = open;
  }
  window.EliseeLibs = { load: load, lazyMinigioco: lazyMinigioco };
})();
