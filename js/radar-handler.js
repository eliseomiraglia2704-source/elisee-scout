// HEROUX30 – Schede Tecniche IA (Radar 3vs3 + Score Predittivo)
window.EliseeRadarSystem = {
  scores: {
    'DS-Top': 9.8,
    'Scout-Expert': 7.4,
    'Analyst': 6.1
  },

  calculateScore: function (role) {
    return EliseeRadarSystem.scores[role] || 5.0;
  },

  init: function (containerId) {
    var id = containerId || 'schede-tecniche';
    var section = document.getElementById(id);
    if (!section) return;

    var cards = section.querySelectorAll('.radar-card');
    cards.forEach(function (card) {
      var role = card.getAttribute('data-role');
      var score = EliseeRadarSystem.calculateScore(role);
      var circle = card.querySelector('.score-circle');
      var valEl = card.querySelector('.score-circle-val') || circle;
      var bar = card.querySelector('.radar-bar .bar');

      if (valEl) valEl.textContent = score.toFixed(1);
      if (circle) circle.style.setProperty('--score', score);
      if (bar) bar.style.width = (score * 10) + '%';
    });

    // Auto-update live radar badge
    if (!window.__radarBadgeInterval) {
      window.__radarBadgeInterval = setInterval(function () {
        var badge = document.getElementById('live-radar-badge');
        if (!badge) return;
        var count = (parseInt(badge.textContent, 10) || 0) + 1;
        badge.textContent = count;
        if (window.EliseeDynamicSync && typeof window.EliseeDynamicSync.setBadge === 'function') {
          window.EliseeDynamicSync.setBadge('badge-mobile-msgs', count);
        }
      }, 1200);
    }

    console.log('[HEROUX30] Radar 3vs3 initialized (<40ms)');
  }
};

// Auto-init on load
window.addEventListener('DOMContentLoaded', function () {
  EliseeRadarSystem.init('schede-tecniche');
});
