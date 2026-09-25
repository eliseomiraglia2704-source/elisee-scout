// HEROUX28 – Action Menu Zero-Latency (< 40 ms)
window.EliseeActionMenu = {
  activeIndex: 0,
  isOpen: false,
  menuEl: null,
  plateEl: null,
  items: [],

  init: function (containerId) {
    var id = containerId || 'action-menu';
    var root = document.getElementById(id);
    if (!root) return;
    EliseeActionMenu.menuEl = root;
    EliseeActionMenu.plateEl = root.querySelector('.am_plate');

    // Popola item predefiniti se la lista è vuota
    var list = root.querySelector('.am_list');
    if (list && list.children.length === 0) {
      list.innerHTML = [
        '<button type="button" class="am_item" data-action="profile">',
        '  <span class="am_icon">👤</span>',
        '  <span>Profilo Scout</span>',
        '</button>',
        '<button type="button" class="am_item" data-action="sheets">',
        '  <span class="am_icon">⚡</span>',
        '  <span>Schede Tecniche IA</span>',
        '</button>',
        '<button type="button" class="am_item" data-action="secret-list">',
        '  <span class="am_icon">🔒</span>',
        '  <span>Secret List Stealth</span>',
        '</button>',
        '<div class="am_divider"></div>',
        '<button type="button" class="am_item danger" data-action="reset">',
        '  <span class="am_icon">🗑️</span>',
        '  <span>Reset Sessione</span>',
        '</button>'
      ].join('');
    }

    EliseeActionMenu.items = Array.prototype.slice.call(root.querySelectorAll('.am_item'));
    EliseeActionMenu.activeIndex = 0;

    // Pointer events & glide
    root.addEventListener('pointermove', function (e) {
      if (!EliseeActionMenu.isOpen || !EliseeActionMenu.plateEl) return;
      var rect = root.getBoundingClientRect();
      var x = Math.round(e.clientX - rect.left);
      EliseeActionMenu.plateEl.style.setProperty('--glow-x', x + 'px');
    });

    // Hover su singoli item
    EliseeActionMenu.items.forEach(function (item, idx) {
      item.addEventListener('pointerenter', function () {
        EliseeActionMenu.setActive(idx, false);
      });
      item.addEventListener('click', function (e) {
        e.stopPropagation();
        EliseeActionMenu.chooseItem(idx);
      });
    });

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
      if (!EliseeActionMenu.isOpen) return;
      var key = e.key;
      if (!EliseeActionMenu.COMMANDS[key]) return;

      e.preventDefault();
      EliseeActionMenu.COMMANDS[key]();
    });

    // Toggle button
    var trigger = root.querySelector('.am_trigger') || document.getElementById('am-trigger');
    if (trigger) {
      trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        EliseeActionMenu.toggle();
      });
    }

    // Chiudi al click fuori
    document.addEventListener('click', function (e) {
      if (EliseeActionMenu.isOpen && !root.contains(e.target)) {
        EliseeActionMenu.close(false);
      }
    });

    console.log('[HEROUX28] EliseeActionMenu initialized (<40ms glide)');
  },

  COMMANDS: {
    ArrowDown: function () { EliseeActionMenu.moveActive(1); },
    ArrowUp: function () { EliseeActionMenu.moveActive(-1); },
    Home: function () { EliseeActionMenu.setActive(0, true); },
    End: function () { EliseeActionMenu.setActive(EliseeActionMenu.items.length - 1, true); },
    Enter: function () { EliseeActionMenu.chooseItem(EliseeActionMenu.activeIndex); },
    Escape: function () { EliseeActionMenu.close(true); },
    Tab: function () { EliseeActionMenu.close(true); }
  },

  moveActive: function (delta) {
    if (!EliseeActionMenu.items.length) return;
    var next = (EliseeActionMenu.activeIndex + delta + EliseeActionMenu.items.length) % EliseeActionMenu.items.length;
    EliseeActionMenu.setActive(next, true);
  },

  setActive: function (index, focus) {
    if (!EliseeActionMenu.items.length) return;
    EliseeActionMenu.items.forEach(function (el) { el.classList.remove('is-active'); });
    EliseeActionMenu.activeIndex = index;
    var row = EliseeActionMenu.items[index];
    if (!row) return;
    row.classList.add('is-active');

    if (EliseeActionMenu.plateEl) {
      var y = row.offsetTop;
      EliseeActionMenu.plateEl.style.setProperty('--plate-y', y + 'px');
      EliseeActionMenu.plateEl.classList.add('is-visible', 'is-active');
    }
    if (focus) row.focus();
  },

  chooseItem: function (index) {
    var row = EliseeActionMenu.items[index];
    if (!row) return;
    var action = row.getAttribute('data-action') || row.textContent.trim();

    if (row.classList.contains('danger')) {
      if (window.EliseeSuccessSystem) {
        EliseeSuccessSystem.showToast('Sessione resettata con successo (reversibile)', 2500);
      }
    } else {
      if (window.EliseeSuccessSystem) {
        EliseeSuccessSystem.showToast('Azione eseguita: ' + action, 2000);
      }
    }

    EliseeActionMenu.close(true);
  },

  toggle: function () {
    EliseeActionMenu.isOpen = !EliseeActionMenu.isOpen;
    if (EliseeActionMenu.menuEl) {
      EliseeActionMenu.menuEl.classList.toggle('is-visible', EliseeActionMenu.isOpen);
    }
    var trigger = document.getElementById('am-trigger');
    if (trigger) {
      trigger.setAttribute('aria-expanded', String(EliseeActionMenu.isOpen));
    }
    if (EliseeActionMenu.isOpen) {
      EliseeActionMenu.setActive(EliseeActionMenu.activeIndex);
    } else if (EliseeActionMenu.plateEl) {
      EliseeActionMenu.plateEl.classList.remove('is-visible', 'is-active');
    }
  },

  close: function (focusTrigger) {
    EliseeActionMenu.isOpen = false;
    if (EliseeActionMenu.menuEl) {
      EliseeActionMenu.menuEl.classList.remove('is-visible');
    }
    if (EliseeActionMenu.plateEl) {
      EliseeActionMenu.plateEl.classList.remove('is-visible', 'is-active');
    }
    var trigger = document.getElementById('am-trigger');
    if (trigger) {
      trigger.setAttribute('aria-expanded', 'false');
      if (focusTrigger) trigger.focus();
    }
  }
};

// Auto-init
window.addEventListener('DOMContentLoaded', function () {
  EliseeActionMenu.init('action-menu');
});
