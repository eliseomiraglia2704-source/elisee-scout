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
  var loaded = active;
  var pending = null;

  function write(list) {
    list.forEach(function (src) { registered.push(src); });
    if (!active) return;
    for (var i = 0; i < list.length; i++) {
      document.write('<script src="' + list[i] + '"><\/script>');
    }
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
    pending = registered.reduce(function (p, src) {
      return p.then(function () { return loadOne(src); });
    }, Promise.resolve()).then(function () {
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
    ensure: ensure,
    isLoaded: function () { return loaded; }
  };
})();
