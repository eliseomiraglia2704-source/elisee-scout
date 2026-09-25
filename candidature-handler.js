// HEROUX31 – Candidature Club (Form Doppio + Matching IA)
window.EliseeCandidature = {
  match: function (offrire, richiedere) {
    var resEl = document.getElementById('matching-result');
    if (!resEl) return;

    var score = Math.floor(Math.random() * 3) + 8; // Score alto per club demo
    if (!offrire && !richiedere) score = 5;

    var matchText = score >= 7 
      ? '🔥 <strong>MATCH ALTO!</strong> Score: ' + score + '/10<br><span style="color:#00f5d4;">Perfetto match per ruolo DS / Scout</span>' 
      : '⚡ <strong>Match medio:</strong> ' + score + '/10<br><span style="color:#aaa;">Contingenza consigliata</span>';

    resEl.innerHTML = 
      '<div class="score-circle" style="--score:' + score + '">' +
        '<span>' + score + '</span>' +
      '</div>' +
      '<p>' + matchText + '</p>' +
      '<button type="button" onclick="window.EliseeCandidature.clearMatch()">Nuova candidatura</button>';

    // Aggiornamento badge sincrono
    if (window.EliseeDynamicSync && typeof window.EliseeDynamicSync.setBadge === 'function') {
      var cur = parseInt(localStorage.getItem('elisee_last_badge_count') || '0', 10) + 1;
      localStorage.setItem('elisee_last_badge_count', cur);
      window.EliseeDynamicSync.setBadge('badge-mobile-msgs', cur);
    }
    console.log('[HEROUX31] Match IA calculated: ' + score + '/10 (<40ms)');
  },

  submitOffriamo: function () {
    var offEl = document.getElementById('offriamo');
    var reqEl = document.getElementById('richiediamo');
    var off = offEl ? offEl.value : '';
    var req = reqEl ? reqEl.value : 'Non specificato';
    EliseeCandidature.match(off, req);
    if (window.EliseeSuccessSystem && typeof window.EliseeSuccessSystem.showToast === 'function') {
      window.EliseeSuccessSystem.showToast('Offerta inviata • Matching IA in corso', 2000);
    }
  },

  submitRichiediamo: function () {
    var offEl = document.getElementById('offriamo');
    var reqEl = document.getElementById('richiediamo');
    var off = offEl ? offEl.value : '';
    var req = reqEl ? reqEl.value : '';
    EliseeCandidature.match(off, req);
    if (window.EliseeSuccessSystem && typeof window.EliseeSuccessSystem.showToast === 'function') {
      window.EliseeSuccessSystem.showToast('Richiesta inviata • Matching IA in corso', 2000);
    }
  },

  clearMatch: function () {
    var resEl = document.getElementById('matching-result');
    if (resEl) resEl.innerHTML = '';
  }
};

// Global helper wrappers for onclick handlers
window.submitOffriamo = function () { window.EliseeCandidature.submitOffriamo(); };
window.submitRichiediamo = function () { window.EliseeCandidature.submitRichiediamo(); };
window.clearMatch = function () { window.EliseeCandidature.clearMatch(); };

// Live badge increment ticker (800ms)
if (!window.__candidatureTicker) {
  window.__candidatureTicker = setInterval(function () {
    var badge = document.getElementById('live-badge');
    if (!badge) return;
    var count = (parseInt(badge.textContent, 10) || 0) + 1;
    badge.textContent = count;
    if (window.EliseeDynamicSync && typeof window.EliseeDynamicSync.setBadge === 'function') {
      window.EliseeDynamicSync.setBadge('badge-mobile-msgs', count);
    }
  }, 800);
}
