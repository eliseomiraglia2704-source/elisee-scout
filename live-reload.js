/**
 * ELISEE SCOUT — Hot Live Auto-Reload System
 * 
 * Monitora costantemente le modifiche al codice (in locale su elisee_up.py e in produzione via version.json)
 * e ricarica automaticamente la pagina senza bisogno che l'utente prema manualmente F5.
 * Preserva hash di navigazione (#user-dossier-portal, #account-portal, ecc.) e scroll.
 */
(function () {
  'use strict';

  var isLocal = location.hostname === '127.0.0.1' || location.hostname === 'localhost' || location.port === '8080';
  var pollInterval = isLocal ? 1000 : 4000;
  var currentVersion = null;
  var isReloading = false;
  var checkTimer = null;

  function restoreScrollAndState() {
    try {
      var savedScroll = sessionStorage.getItem('__elisee_scroll_y');
      if (savedScroll !== null) {
        sessionStorage.removeItem('__elisee_scroll_y');
        window.scrollTo(0, parseInt(savedScroll, 10) || 0);
      }
    } catch (_) {}
  }

  function triggerHotReload(newVer) {
    if (isReloading) return;
    isReloading = true;
    try {
      sessionStorage.setItem('__elisee_scroll_y', String(window.scrollY || window.pageYOffset || 0));
    } catch (_) {}

    // Feedback visivo elegante e discreto
    var banner = document.createElement('div');
    banner.style.position = 'fixed';
    banner.style.top = '12px';
    banner.style.right = '12px';
    banner.style.zIndex = '99999999';
    banner.style.background = 'rgba(6, 18, 38, 0.95)';
    banner.style.border = '1px solid #38bdf8';
    banner.style.boxShadow = '0 8px 32px rgba(56, 189, 248, 0.35)';
    banner.style.borderRadius = '8px';
    banner.style.padding = '0.55rem 0.95rem';
    banner.style.color = '#ffffff';
    banner.style.fontSize = '0.82rem';
    banner.style.fontWeight = '600';
    banner.style.fontFamily = 'Outfit, Inter, system-ui, sans-serif';
    banner.style.display = 'flex';
    banner.style.alignItems = 'center';
    banner.style.gap = '0.5rem';
    banner.innerHTML = '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#38bdf8;box-shadow:0 0 8px #38bdf8;animation:pulse 1s infinite;"></span>' +
      '<span>Aggiornamento codice applicato · Ricaricamento in corso...</span>';
    document.body.appendChild(banner);

    setTimeout(function () {
      window.location.reload();
    }, 250);
  }

  var pollEndpoint = '/version.json';

  function checkLiveVersion() {
    if (isReloading) return;
    var endpoint = pollEndpoint + '?_t=' + Date.now();

    var xhr = new XMLHttpRequest();
    xhr.open('GET', endpoint, true);
    xhr.timeout = 2500;
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          var data = JSON.parse(xhr.responseText);
          var v = String(data.v || data.version || data.time || data.updatedAt || '');
          if (!v) return;

          if (currentVersion === null) {
            currentVersion = v;
          } else if (currentVersion !== v) {
            triggerHotReload(v);
          }
        } catch (_) {}
      }
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

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', restoreScrollAndState);
    } else {
      restoreScrollAndState();
    }
  }

  startWatcher();
})();
