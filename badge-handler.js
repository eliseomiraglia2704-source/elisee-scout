// HEROUX22 – Badge System Handler
// Zero-Latency (t = 0-40 ms)

(function () {
  'use strict';

  function updateBadge(elementId, newCount) {
    var badge = document.getElementById(elementId);
    if (!badge) return;

    var container = badge.parentElement;

    // Se è la badge principale (count)
    if (container && container.classList.contains('count-badge')) {
      container.classList.remove('capped', 'locked');
    }

    var num = parseInt(newCount, 10);
    if (isNaN(num) || num <= 0) {
      badge.classList.remove('visible');
      return;
    }

    // Aggiorna testo
    badge.textContent = num > 99 ? '99+' : num.toString();

    // Cap automatico (99+)
    if (num > 99) {
      if (container) container.classList.add('capped');
      badge.classList.add('capped');
      setTimeout(function () {
        badge.classList.add('locked');
      }, 40);
    } else {
      if (container) container.classList.remove('capped', 'locked');
      badge.classList.remove('capped', 'locked');
    }

    // Mostra subito (t = 0-40 ms)
    badge.classList.add('visible');
  }

  function clearBadge(elementId) {
    var badge = document.getElementById(elementId);
    if (!badge) return;
    badge.classList.remove('visible');
  }

  function pinToCorner(containerSelector, anchored) {
    var main = document.querySelector(containerSelector || '.badge-container');
    if (!main) return;
    main.classList.toggle('pin-anchored', anchored);
    main.classList.toggle('pin-reflowing', !anchored);
  }

  window.updateBadge = updateBadge;
  window.clearBadge = clearBadge;
  window.pinToCorner = pinToCorner;
  window.EliseeBadgeSystem = {
    updateBadge: updateBadge,
    clearBadge: clearBadge,
    pinToCorner: pinToCorner
  };
})();
