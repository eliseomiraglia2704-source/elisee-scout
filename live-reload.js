/**
 * ELISEE SCOUT — Hot Live Auto-Reload
 * Quando version.json cambia dopo un deploy, ricarica la pagina in modo
 * forzato (niente cache SW/HTTP). Nessun badge, toast o avviso visivo.
 */
(function () {
  'use strict';

  var isLocal = location.hostname === '127.0.0.1' || location.hostname === 'localhost' || location.port === '8080';
  var pollInterval = isLocal ? 1000 : 2000;
  var currentVersion = null;
  var isReloading = false;
  var checkTimer = null;
  var APPLIED_KEY = '__elisee_live_ver';
  var AT_KEY = '__elisee_live_at';

  function restoreScrollAndState() {
    try {
      var savedScroll = sessionStorage.getItem('__elisee_scroll_y');
      if (savedScroll !== null) {
        sessionStorage.removeItem('__elisee_scroll_y');
        window.scrollTo(0, parseInt(savedScroll, 10) || 0);
      }
    } catch (_) {}
  }

  function wipeCaches() {
    var jobs = [];
    try {
      if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) {
        jobs.push(
          navigator.serviceWorker.getRegistrations().then(function (regs) {
            return Promise.all(
              (regs || []).map(function (r) {
                try { return r.unregister(); } catch (e) { return null; }
              })
            );
          })
        );
      }
    } catch (_) {}
    try {
      if (window.caches && caches.keys) {
        jobs.push(
          caches.keys().then(function (keys) {
            return Promise.all(
              (keys || []).map(function (k) {
                try { return caches.delete(k); } catch (e) { return null; }
              })
            );
          })
        );
      }
    } catch (_) {}
    return Promise.all(jobs).catch(function () {});
  }

  function goNow() {
    var hash = location.hash || '';
    var path = location.pathname || '/';
    var params = new URLSearchParams(location.search || '');
    params.set('_es', Date.now().toString(36));
    var qs = params.toString();
    location.replace(path + (qs ? '?' + qs : '') + hash);
  }

  function triggerHotReload() {
    if (isReloading) return;
    var last = 0;
    try { last = parseInt(sessionStorage.getItem(AT_KEY) || '0', 10) || 0; } catch (_) {}
    if (last && Date.now() - last < 5000) return;
    isReloading = true;
    try {
      sessionStorage.setItem(AT_KEY, String(Date.now()));
      sessionStorage.setItem('__elisee_scroll_y', String(window.scrollY || window.pageYOffset || 0));
    } catch (_) {}

    var done = false;
    function once() {
      if (done) return;
      done = true;
      goNow();
    }

    wipeCaches().then(once, once);
    setTimeout(once, 350);
  }

  function onNewVersion(v) {
    try { sessionStorage.setItem(APPLIED_KEY, v); } catch (_) {}
    triggerHotReload();
  }

  function checkLiveVersion() {
    if (isReloading) return;
    var endpoint = '/version.json?_t=' + Date.now();

    function handleBody(text) {
      try {
        var data = JSON.parse(text);
        var v = String(data.v || data.version || data.time || data.updatedAt || '');
        if (!v) return;
        if (currentVersion === null) {
          currentVersion = v;
          try { sessionStorage.setItem(APPLIED_KEY, v); } catch (_) {}
          return;
        }
        if (currentVersion !== v) {
          currentVersion = v;
          onNewVersion(v);
        }
      } catch (_) {}
    }

    if (window.fetch) {
      fetch(endpoint, { cache: 'no-store', headers: { Pragma: 'no-cache', 'Cache-Control': 'no-cache' } })
        .then(function (r) { return r.ok ? r.text() : ''; })
        .then(function (t) { if (t) handleBody(t); })
        .catch(function () {});
      return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open('GET', endpoint, true);
    xhr.timeout = 2500;
    try {
      xhr.setRequestHeader('Cache-Control', 'no-cache');
      xhr.setRequestHeader('Pragma', 'no-cache');
    } catch (_) {}
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) handleBody(xhr.responseText);
    };
    xhr.onerror = function () {};
    xhr.send();
  }

  function startWatcher() {
    checkLiveVersion();
    if (checkTimer) clearInterval(checkTimer);
    checkTimer = setInterval(checkLiveVersion, pollInterval);

    window.addEventListener('focus', checkLiveVersion);
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) checkLiveVersion();
    });

    try {
      if (navigator.serviceWorker) {
        navigator.serviceWorker.addEventListener('message', function (e) {
          var d = e && e.data;
          if (d && d.type === 'FORCE_RELOAD') triggerHotReload();
        });
      }
    } catch (_) {}

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', restoreScrollAndState);
    } else {
      restoreScrollAndState();
    }
  }

  startWatcher();
})();
