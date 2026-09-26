/**
 * ELISEE SCOUT — Glow Cards Mouse Tracking Spotlight
 * Traccia la posizione del cursore per creare il radial glow dinamico su ogni card.
 */
(function () {
  function initGlowCards() {
    var cards = document.querySelectorAll('.glow-card');
    if (!cards || !cards.length) return;

    cards.forEach(function (card) {
      if (card.dataset.glowReady === 'true') return;
      card.dataset.glowReady = 'true';

      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        card.style.setProperty('--x', x + 'px');
        card.style.setProperty('--y', y + 'px');
      });

      card.addEventListener('mouseleave', function () {
        card.style.removeProperty('--x');
        card.style.removeProperty('--y');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGlowCards);
  } else {
    initGlowCards();
  }

  window.initGlowCards = initGlowCards;
})();
