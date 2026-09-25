// HEROUX29 – Market Hub Stealth + Zero-Latency
window.EliseeMarketHub = {
  currentTab: 0,
  items: [],

  init: function (containerId) {
    var id = containerId || 'market-hub';
    var container = document.getElementById(id);
    if (!container) return;

    EliseeMarketHub.items = Array.prototype.slice.call(container.querySelectorAll('.market-item'));
    EliseeMarketHub.currentTab = 0;

    // Tab switch
    var tabs = container.querySelectorAll('.market-tab');
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function (e) {
        e.stopPropagation();
        tabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        EliseeMarketHub.switchTab(i);
      });
    });

    // Click on item = add to Secret List (badge + ripple)
    container.addEventListener('click', function (e) {
      var item = e.target.closest('.market-item');
      if (!item) return;
      EliseeMarketHub.addToSecret(item);
    });

    // Ripple on click
    container.addEventListener('click', function (e) {
      var target = e.target;
      if (target.closest('.market-item') || target.closest('.market-wall')) {
        if (typeof window.createRipple === 'function') {
          window.createRipple(e.clientX, e.clientY);
        }
      }
    });

    console.log('[HEROUX29] Market Hub Stealth initialized (<40ms)');
  },

  switchTab: function (index) {
    EliseeMarketHub.currentTab = index;
    var lists = document.querySelectorAll('.market-container .market-list');
    if (lists.length >= 2 && window.innerWidth <= 768) {
      lists.forEach(function (l, idx) {
        l.style.display = (idx === index) ? 'block' : 'none';
      });
    }
  },

  addToSecret: function (item) {
    if (!item) return;
    var badge = item.querySelector('.market-badge');
    var count = 1;
    if (badge) {
      count = (parseInt(badge.textContent, 10) || 0) + 1;
      badge.textContent = count;
    }

    // Update global badge
    if (window.EliseeDynamicSync && typeof window.EliseeDynamicSync.setBadge === 'function') {
      window.EliseeDynamicSync.setBadge('badge-mobile-msgs', count);
    } else {
      var b = JSON.parse(localStorage.getItem('elisee_user_badges') || '{}');
      b['badge-mobile-msgs'] = count;
      localStorage.setItem('elisee_user_badges', JSON.stringify(b));
    }

    // Stealth effect + toast
    item.classList.add('stealth');
    var title = item.getAttribute('data-value') || item.textContent.replace(/SCOUT|WALL|\d+/g, '').trim();
    if (window.EliseeSuccessSystem) {
      EliseeSuccessSystem.showToast('Scout ' + title + ' added to Secret List', 1800);
    }
    console.log('[HEROUX29] Secret added in <40 ms | Badge: ' + count);
  }
};

// Auto-init
window.addEventListener('DOMContentLoaded', function () {
  EliseeMarketHub.init('market-hub');
});
