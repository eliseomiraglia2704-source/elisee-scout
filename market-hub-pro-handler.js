// HEROUX32 – Market Hub Pro Zero-Latency
window.EliseeMarketHubPro = {
  items: [],
  currentFilter: '',

  init: function (containerId) {
    if (!containerId) containerId = 'market-hub-pro';
    var container = document.getElementById(containerId);
    if (!container) return;

    EliseeMarketHubPro.items = Array.prototype.slice.call(container.querySelectorAll('.market-item'));

    // Drag & Drop
    container.addEventListener('dragstart', function (e) {
      var item = e.target.closest('.market-item');
      if (item) {
        item.classList.add('dragging');
        if (e.dataTransfer) {
          e.dataTransfer.setData('text/plain', item.textContent);
        }
      }
    });

    container.addEventListener('dragend', function (e) {
      var item = e.target.closest('.market-item');
      if (item) item.classList.remove('dragging');
    });

    container.addEventListener('dragover', function (e) {
      e.preventDefault();
    });

    container.addEventListener('drop', function (e) {
      e.preventDefault();
      var dragged = document.querySelector('.dragging');
      var secretList = container.querySelector('.market-secret-list') || container.querySelectorAll('.market-list')[1];
      if (dragged && secretList) {
        dragged.classList.add('stealth');
        secretList.appendChild(dragged);
        EliseeMarketHubPro.updateSecretCount(secretList);
        if (window.EliseeSuccessSystem && typeof window.EliseeSuccessSystem.showToast === 'function') {
          window.EliseeSuccessSystem.showToast('Added to Secret List', 1800);
        }
      }
    });

    // Filter IA stealth
    var filterInput = document.getElementById('market-filter');
    if (filterInput) {
      filterInput.addEventListener('input', function (e) {
        EliseeMarketHubPro.currentFilter = (e.target.value || '').toLowerCase();
        EliseeMarketHubPro.filterItems();
      });
    }

    // Ripple on all interactive elements
    container.addEventListener('click', function (e) {
      if (e.target.closest('.market-item') || e.target.closest('.market-wall')) {
        if (window.createRipple && typeof window.createRipple === 'function') {
          window.createRipple(e.clientX, e.clientY);
        }
      }
    });

    console.log('[HEROUX32] Market Hub Pro initialized (<40ms)');
  },

  filterItems: function () {
    EliseeMarketHubPro.items.forEach(function (item) {
      var text = (item.textContent || '').toLowerCase();
      item.style.display = text.indexOf(EliseeMarketHubPro.currentFilter) !== -1 ? 'flex' : 'none';
    });
  },

  updateSecretCount: function (list) {
    if (!list) return;
    var count = list.querySelectorAll('.market-item').length;
    var badge = list.querySelector('.market-badge');
    if (badge) badge.textContent = count;
    if (window.EliseeDynamicSync && typeof window.EliseeDynamicSync.setBadge === 'function') {
      window.EliseeDynamicSync.setBadge('badge-mobile-msgs', count);
    }
  },

  exportReport: function () {
    if (window.EliseeSuccessSystem && typeof window.EliseeSuccessSystem.showToast === 'function') {
      window.EliseeSuccessSystem.showToast('Generazione Report Secret List...', 2000);
    }
    setTimeout(function () {
      window.print();
    }, 600);
  }
};

// Global export helper
window.exportMarketReport = function () {
  window.EliseeMarketHubPro.exportReport();
};

// Auto-init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () {
    window.EliseeMarketHubPro.init('market-hub-pro');
  });
} else {
  window.EliseeMarketHubPro.init('market-hub-pro');
}
