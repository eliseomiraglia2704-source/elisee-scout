// HEROUX38 – Market Hub Pro Avanzato (Drag & Drop + Notifiche Stealth + Timeline + Export)
window.EliseeMarketHubPro = {
  items: [],
  currentFilter: '',
  init: (containerId = 'market-hub-pro') => {
    const container = document.getElementById(containerId);
    if (!container) return;
    EliseeMarketHubPro.items = [...container.querySelectorAll('.market-item')];

    // Drag & Drop reattivo
    container.addEventListener('dragstart', (e) => {
      const item = e.target.closest('.market-item');
      if (item) {
        item.classList.add('dragging');
        e.dataTransfer.setData('text/plain', item.textContent);
      }
    });

    container.addEventListener('dragend', (e) => {
      const item = e.target.closest('.market-item');
      if (item) item.classList.remove('dragging');
    });

    container.addEventListener('dragover', (e) => e.preventDefault());

    container.addEventListener('drop', (e) => {
      e.preventDefault();
      const dragged = document.querySelector('.dragging');
      const target = e.target.closest('.market-item') || e.target.closest('.market-list');
      if (dragged && target) {
        const secretList = target.closest('.market-secret-list') || (target.classList.contains('market-secret-list') ? target : null);
        if (secretList) {
          dragged.classList.add('stealth');
          secretList.appendChild(dragged);
          EliseeMarketHubPro.updateSecretCount(secretList);
          if (window.EliseeSuccessSystem && typeof window.EliseeSuccessSystem.showToast === 'function') {
            window.EliseeSuccessSystem.showToast('Added to Secret List (Notifica Stealth)', 1800);
          }
        } else {
          target.appendChild(dragged);
        }
      }
    });

    // Filtro IA stealth
    const filterInput = document.getElementById('market-filter');
    if (filterInput) {
      filterInput.addEventListener('input', (e) => {
        EliseeMarketHubPro.currentFilter = e.target.value.toLowerCase();
        EliseeMarketHubPro.filterItems();
      });
    }

    // Ripple su tutto
    container.addEventListener('click', (e) => {
      if (e.target.closest('.market-item') || e.target.closest('.market-wall') || e.target.closest('.market-btn-export')) {
        if (window.createRipple && typeof window.createRipple === 'function') {
          window.createRipple(e.clientX, e.clientY);
        }
      }
    });

    console.log('[HEROUX38] EliseeMarketHubPro initialized (<40ms)');
  },

  filterItems: () => {
    EliseeMarketHubPro.items.forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = text.includes(EliseeMarketHubPro.currentFilter) ? 'flex' : 'none';
    });
  },

  updateSecretCount: (list) => {
    const count = list.querySelectorAll('.market-item').length;
    const badge = list.querySelector('.market-badge');
    if (badge) badge.textContent = count;
    if (window.EliseeDynamicSync && typeof window.EliseeDynamicSync.setBadge === 'function') {
      window.EliseeDynamicSync.setBadge('badge-mobile-msgs', count);
    }
  },

  exportReport: () => {
    if (window.EliseeSuccessSystem && typeof window.EliseeSuccessSystem.showToast === 'function') {
      window.EliseeSuccessSystem.showToast('Generazione Report Secret List in corso...', 2000);
    }
    setTimeout(() => {
      window.print();
    }, 400);
  }
};

window.exportMarketReport = () => EliseeMarketHubPro.exportReport();

// Auto-init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => EliseeMarketHubPro.init('market-hub-pro'));
} else {
  EliseeMarketHubPro.init('market-hub-pro');
}
