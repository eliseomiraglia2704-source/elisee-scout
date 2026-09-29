/* ============================================= */
/* HEROUX23 – Micro-Interactions Controller      */
/* Zero-Latency, requestAnimationFrame, Ripple   */
/* ============================================= */

(function () {
  'use strict';

  function createRipple(hostEl, clientX, clientY) {
    if (!hostEl) return;
    var rect = hostEl.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height) * 1.5;
    var x = clientX - rect.left;
    var y = clientY - rect.top;

    if (!hostEl.classList.contains('es-ripple-host')) {
      hostEl.classList.add('es-ripple-host');
    }

    var ripple = document.createElement('span');
    ripple.className = 'es-ripple';
    ripple.style.width = size + 'px';
    ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';

    window.requestAnimationFrame(function () {
      hostEl.appendChild(ripple);
    });

    setTimeout(function () {
      if (ripple && ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 240);
  }

  function handlePointerDown(e) {
    // Escludiamo click destri o secondari
    if (e.button && e.button !== 0) return;

    var target = e.target;
    if (!target) return;

    var host = target.closest(
      '.btn, .btn-primary, .btn-secondary, .btn-nav-accedi, .nav-brand, .es-touchable, .es-m-brand, .es-m-btn-icon'
    );

    if (host) {
      createRipple(host, e.clientX, e.clientY);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      document.addEventListener('pointerdown', handlePointerDown, { passive: true });
    });
  } else {
    document.addEventListener('pointerdown', handlePointerDown, { passive: true });
  }

  function showLogoutToast(title, message) {
    var oldToast = document.querySelector('.es-logout-toast');
    if (oldToast && oldToast.parentNode) {
      oldToast.parentNode.removeChild(oldToast);
    }

    var toast = document.createElement('div');
    toast.className = 'es-logout-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');

    var icon = document.createElement('span');
    icon.className = 'es-logout-toast-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = '👋';

    var body = document.createElement('div');
    body.className = 'es-logout-toast-body';

    var tEl = document.createElement('p');
    tEl.className = 'es-logout-toast-title';
    tEl.textContent = title || 'Disconnesso';

    var subEl = document.createElement('p');
    subEl.className = 'es-logout-toast-sub';
    subEl.textContent = message || 'Sessione chiusa con successo.';

    body.appendChild(tEl);
    body.appendChild(subEl);

    var closeBtn = document.createElement('button');
    closeBtn.className = 'es-logout-toast-close';
    closeBtn.setAttribute('type', 'button');
    closeBtn.setAttribute('aria-label', 'Chiudi');
    closeBtn.textContent = '×';
    closeBtn.onclick = function () {
      dismissToast(toast);
    };

    toast.appendChild(icon);
    toast.appendChild(body);
    toast.appendChild(closeBtn);

    document.body.appendChild(toast);

    var timer = setTimeout(function () {
      dismissToast(toast);
    }, 4000);

    function dismissToast(el) {
      clearTimeout(timer);
      if (!el || !el.parentNode) return;
      el.classList.add('is-hiding');
      setTimeout(function () {
        if (el && el.parentNode) el.parentNode.removeChild(el);
      }, 260);
    }
  }

  function logoutWithAnimation(opts) {
    opts = opts || {};
    var role = opts.role || 'all';
    var notify = opts.notify !== false;
    var redirectView = opts.redirectView || 'home';

    var userName = '';
    try {
      var rawUser = localStorage.getItem('elisee_active_user') || localStorage.getItem('elisee_user_data');
      if (rawUser) {
        var parsed = JSON.parse(rawUser);
        userName = ((parsed.nome || '') + ' ' + (parsed.cognome || '')).trim() || parsed.username || '';
      }
    } catch (_) {}

    var targets = [
      document.getElementById('nav-logged-in-actions'),
      document.getElementById('btn-user-profile'),
      document.getElementById('nav-user-container'),
      document.getElementById('user-dropdown-menu'),
      document.getElementById('es-user-dd')
    ].filter(Boolean);

    targets.forEach(function (el) {
      el.classList.add('es-logout-fade-out');
    });

    if (typeof window.closeUserDropdown === 'function') {
      try { window.closeUserDropdown(); } catch (_) {}
    }
    if (window.EliseeActionMenu && typeof EliseeActionMenu.close === 'function') {
      try { EliseeActionMenu.close(false); } catch (_) {}
    }
    if (typeof hideOverlayModal === 'function') {
      try {
        hideOverlayModal('elisee-logout-confirm-modal');
        hideOverlayModal('admin-modal');
      } catch (_) {}
    }

    var animDuration = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 20 : 300;

    setTimeout(function () {
      var keysToRemove = [
        'elisee_user_auth',
        'elisee_active_user',
        'elisee_user_data',
        'elisee_auth_token',
        'elisee_admin_auth',
        'elisee_privacy_auth',
        'elisee_admin_session_token',
        'elisee_site_role_confirmed',
        'elisee_auth_return',
        'elisee_last_activity',
        'elisee_creator_role_override'
      ];

      keysToRemove.forEach(function (k) {
        try { localStorage.removeItem(k); } catch (_) {}
        try { sessionStorage.removeItem(k); } catch (_) {}
      });

      targets.forEach(function (el) {
        el.classList.remove('es-logout-fade-out');
      });

      if (typeof window.updateNavbarUserUI === 'function') {
        try { window.updateNavbarUserUI(); } catch (_) {}
      }

      var out = document.getElementById('nav-logged-out-actions');
      var inn = document.getElementById('nav-logged-in-actions');
      if (out) {
        out.hidden = false;
        out.style.setProperty('display', 'flex', 'important');
      }
      if (inn) {
        inn.hidden = true;
        inn.style.setProperty('display', 'none', 'important');
      }

      if (redirectView && typeof window.switchView === 'function') {
        try {
          var hash = window.location.hash || '';
          if (hash.indexOf('admin') !== -1 || hash.indexOf('dash') !== -1 || hash.indexOf('riservata') !== -1) {
            window.switchView(redirectView, '#hero');
          }
        } catch (_) {}
      }

      if (notify) {
        var lang = (localStorage.getItem('elisee_lang') || navigator.language || 'it').slice(0, 2).toLowerCase();
        var isEn = lang === 'en';
        var title = isEn ? 'Logged out' : 'Disconnesso';
        var msg = role === 'admin'
          ? (isEn ? 'Admin session terminated.' : 'Sessione admin terminata.')
          : (userName
              ? (isEn ? ('See you soon, ' + userName + '!') : ('A presto, ' + userName + '!'))
              : (isEn ? 'Session closed successfully.' : 'Sessione chiusa con successo.'));

        showLogoutToast(title, msg);
      }

      try {
        document.dispatchEvent(new CustomEvent('elisee:logout', {
          detail: { role: role, userName: userName }
        }));
      } catch (_) {}
    }, animDuration);
  }

  window.createRipple = createRipple;
  window.logoutWithAnimation = logoutWithAnimation;
  window.showLogoutToast = showLogoutToast;
  window.EliseeMicroInteractions = {
    createRipple: createRipple,
    logoutWithAnimation: logoutWithAnimation,
    showLogoutToast: showLogoutToast
  };
})();
