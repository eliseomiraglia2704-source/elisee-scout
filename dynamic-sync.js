// HEROUX26 – Dynamic Sync: Live Reactive Badges & Mathematical Radius Store
// Zero-Latency Execution (< 40 ms)

(function () {
  'use strict';

  var STORAGE_BADGES_KEY = 'elisee_user_badges';
  var STORAGE_RADIUS_KEY = 'elisee_user_radius';

  // Stato iniziale di default
  var defaultBadges = {
    'badge-mobile-msgs': 3,
    'badge-mobile-notifs': 1,
    'badge-inbox': 3,
    'badge-market': 2
  };

  var defaultRadius = {
    card: 12,
    chip: 8,
    button: 8,
    pill: 9999,
    edges: 16,
    ringGap: 2,
    image: 8
  };

  // Lettura sicura da localStorage
  function loadStoredBadges() {
    try {
      var raw = localStorage.getItem(STORAGE_BADGES_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return Object.assign({}, defaultBadges);
  }

  function loadStoredRadius() {
    try {
      var raw = localStorage.getItem(STORAGE_RADIUS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return Object.assign({}, defaultRadius);
  }

  function saveStoredBadges(data) {
    try {
      localStorage.setItem(STORAGE_BADGES_KEY, JSON.stringify(data));
    } catch (_) {}
  }

  function saveStoredRadius(data) {
    try {
      localStorage.setItem(STORAGE_RADIUS_KEY, JSON.stringify(data));
    } catch (_) {}
  }

  var currentBadges = loadStoredBadges();
  var currentRadius = loadStoredRadius();

  // 1. Aggiornamento Reattivo Badge Zero-Latency
  function syncAllBadges() {
    var t0 = (window.performance && window.performance.now) ? performance.now() : 0;

    if (window.updateBadge) {
      Object.keys(currentBadges).forEach(function (key) {
        var count = currentBadges[key];
        window.updateBadge(key, count);
      });
    }

    if (t0 && window.performance && window.performance.now) {
      var diff = performance.now() - t0;
      console.log('[HEROUX26] Badges synced in ' + diff.toFixed(2) + ' ms');
    }
  }

  // 2. Applicazione Reattiva Radius Zero-Latency
  function syncAllRadius() {
    var t0 = (window.performance && window.performance.now) ? performance.now() : 0;

    if (window.applyRadius && window.applyPill && window.applyEdges && window.applyRing && window.clipImage) {
      // Carte e Box
      document.querySelectorAll('.card, .portfolio-card, .es-card, .radius-card').forEach(function (el) {
        window.applyRadius(el, currentRadius.card || 12);
      });

      // Chip e Tag
      document.querySelectorAll('.chip, .tag, .badge-chip, .radius-chip').forEach(function (el) {
        window.applyRadius(el, currentRadius.chip || 8);
      });

      // Pill Buttons & Avatars
      document.querySelectorAll('.btn-pill, .avatar-pill, .radius-avatar, .radius-pill').forEach(function (el) {
        window.applyPill(el);
      });

      // Edge Sheets
      document.querySelectorAll('.sheet-top, .drawer-content, .radius-share, .radius-edges').forEach(function (el) {
        window.applyEdges(el);
      });

      // Ring Buttons
      document.querySelectorAll('.ring-active, .radius-selected, .radius-ring').forEach(function (el) {
        window.applyRing(el, currentRadius.ringGap || 2);
      });

      // Image Cards
      document.querySelectorAll('.image-clipped, .radius-image-card, .radius-image.clip').forEach(function (el) {
        window.clipImage(el, currentRadius.image || 8);
      });
    }

    if (t0 && window.performance && window.performance.now) {
      var diff = performance.now() - t0;
      console.log('[HEROUX26] Radius applied in ' + diff.toFixed(2) + ' ms');
    }
  }

  // 3. API Pubblica di Sincronizzazione
  function setBadge(key, count) {
    currentBadges[key] = parseInt(count, 10) || 0;
    saveStoredBadges(currentBadges);
    if (window.updateBadge) {
      window.updateBadge(key, currentBadges[key]);
    }
  }

  function updateBadges(newBadges) {
    if (!newBadges || typeof newBadges !== 'object') return;
    Object.assign(currentBadges, newBadges);
    saveStoredBadges(currentBadges);
    syncAllBadges();
  }

  function updateRadius(newRadius) {
    if (!newRadius || typeof newRadius !== 'object') return;
    Object.assign(currentRadius, newRadius);
    saveStoredRadius(currentRadius);
    syncAllRadius();
  }

  function applyAll() {
    var t0 = (window.performance && window.performance.now) ? performance.now() : 0;
    syncAllBadges();
    syncAllRadius();
    if (t0 && window.performance && window.performance.now) {
      var total = performance.now() - t0;
      console.log('[HEROUX26] Full dynamic sync executed in ' + total.toFixed(2) + ' ms (< 40ms target)');
    }
  }

  // Demo Live Trigger
  function triggerLiveUpdateDemo() {
    var msgs = Math.floor(Math.random() * 8) + 1;
    var notifs = Math.floor(Math.random() * 4) + 1;
    setBadge('badge-mobile-msgs', msgs);
    setBadge('badge-mobile-notifs', notifs);
    applyAll();
  }

  // 4. Listeners e Storage Events
  window.addEventListener('storage', function (e) {
    if (e.key === STORAGE_BADGES_KEY) {
      currentBadges = loadStoredBadges();
      syncAllBadges();
    } else if (e.key === STORAGE_RADIUS_KEY) {
      currentRadius = loadStoredRadius();
      syncAllRadius();
    }
  });

  document.addEventListener('elisee:sync-badges', function (e) {
    if (e.detail) updateBadges(e.detail);
    else syncAllBadges();
  });

  document.addEventListener('elisee:sync-radius', function (e) {
    if (e.detail) updateRadius(e.detail);
    else syncAllRadius();
  });

  // Esposizione Globale
  window.EliseeDynamicSync = {
    getBadges: function () { return Object.assign({}, currentBadges); },
    getRadius: function () { return Object.assign({}, currentRadius); },
    setBadge: setBadge,
    updateBadges: updateBadges,
    updateRadius: updateRadius,
    syncAllBadges: syncAllBadges,
    syncAllRadius: syncAllRadius,
    applyAll: applyAll,
    demo: triggerLiveUpdateDemo
  };

  // Auto-run su load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyAll);
  } else {
    applyAll();
  }
})();
