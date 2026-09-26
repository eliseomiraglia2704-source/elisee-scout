// HEROUX36 – Schede Tecniche IA Pro (Canvas + Radar Live)
window.EliseeRadarPro = {
  scores: {
    'Northwind Labs': 9.8,
    'Halcyon Bank': 7.4,
    'Nova FC': 6.1,
    'Real Madrid': 9.2,
    'Chelsea': 8.1,
    'PSG': 9.5
  },
  init: (containerId = 'schede-tecniche-pro') => {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.querySelectorAll('.radar-card').forEach(card => {
      const role = card.dataset.role || card.querySelector('h3')?.textContent || 'Target';
      const score = EliseeRadarPro.scores[role] || 6.0;

      // Update donut
      const circle = card.querySelector('.score-circle');
      if (circle) {
        circle.style.setProperty('--score', score);
        circle.textContent = score.toFixed(1);
      }

      // Update progress bar
      const bar = card.querySelector('.radar-bar span');
      if (bar) {
        bar.style.width = `${score * 10}%`;
      }

      // Click = live match
      card.addEventListener('click', (e) => {
        if (window.createRipple && typeof window.createRipple === 'function') {
          window.createRipple(e.clientX, e.clientY);
        }
        if (window.EliseeSuccessSystem && typeof window.EliseeSuccessSystem.showToast === 'function') {
          window.EliseeSuccessSystem.showToast(`Predizione IA: ${score}/10 per ${role}`, 2200);
        }
      });
    });

    console.log('[HEROUX36] EliseeRadarPro initialized (<40ms)');
  }
};

// Auto-init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.EliseeRadarPro.init('schede-tecniche-pro');
  });
} else {
  window.EliseeRadarPro.init('schede-tecniche-pro');
}
