/* ============================================================
   ELISEE SCOUT — MOBILE WEB APP CONTROLLER
   Gestisce la Bottom Navigation Bar, la Top Bar e l'App Drawer
   esclusivamente per la visualizzazione mobile (<768px).
   ============================================================ */
(function () {
  'use strict';

  function isMobile() {
    return window.innerWidth <= 768;
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {};
    } catch (_) {
      return {};
    }
  }

  function syncActiveTab() {
    var hash = (window.location.hash || '#hero').split('?')[0];
    var tabs = document.querySelectorAll('.es-m-tab-item');
    if (!tabs || !tabs.length) return;

    tabs.forEach(function (tab) {
      tab.classList.remove('is-active');
      var target = tab.getAttribute('data-target');
      if (!target) return;

      if (hash === target || (target === '#hero' && (!hash || hash === '#home' || hash === '#hero'))) {
        tab.classList.add('is-active');
      } else if (target === '#bacheca-annunci' && (hash === '#bacheca' || hash === '#bacheca-annunci')) {
        tab.classList.add('is-active');
      } else if (target === '#stampa-portal' && (hash === '#stampa' || hash === '#stampa-portal')) {
        tab.classList.add('is-active');
      } else if (target === '#mappa-portal' && (hash === '#mappa' || hash === '#mappa-portal')) {
        tab.classList.add('is-active');
      } else if (target === '#user-dossier-portal' && (/user-dossier|account|staff|player|dashboard/.test(hash))) {
        tab.classList.add('is-active');
      }
    });
  }

  function syncUserState() {
    var u = getUser();
    var nameEl = document.getElementById('es-m-user-name');
    var userPill = document.getElementById('es-m-user-pill');
    var loginBtn = document.getElementById('es-m-login-btn');
    var drawerAuthBtn = document.getElementById('es-m-drawer-auth-btn');

    var isAuth = !!(u && (u.id || u.username || u.email));
    var name = isAuth ? (((u.nome || '') + ' ' + (u.cognome || '')).trim() || u.username || 'Account') : 'Accedi';

    if (nameEl) nameEl.textContent = name;

    if (userPill) {
      userPill.style.display = isAuth ? 'inline-flex' : 'none';
    }
    if (loginBtn) {
      loginBtn.style.display = isAuth ? 'none' : 'inline-flex';
    }
    if (drawerAuthBtn) {
      drawerAuthBtn.textContent = isAuth ? 'Profilo & Logout' : 'Accedi / Iscriviti';
    }
  }

  function openDrawer() {
    var backdrop = document.getElementById('es-m-drawer-backdrop');
    if (backdrop) {
      backdrop.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeDrawer() {
    var backdrop = document.getElementById('es-m-drawer-backdrop');
    if (backdrop) {
      backdrop.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  }

  function navigateTo(viewKey, hash) {
    closeDrawer();
    if (typeof window.switchView === 'function') {
      window.switchView(viewKey, hash);
    } else {
      window.location.hash = hash;
    }
    setTimeout(syncActiveTab, 100);
  }

  function bindEvents() {
    // 1. Bottom Bar Tab clicks
    var tabs = document.querySelectorAll('.es-m-tab-item');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function (e) {
        e.preventDefault();
        var target = tab.getAttribute('data-target');
        var view = tab.getAttribute('data-view');
        navigateTo(view, target);
      });
    });

    // 2. Hamburger & Drawer Close
    var burger = document.getElementById('es-m-btn-hamburger');
    if (burger) {
      burger.addEventListener('click', function (e) {
        e.preventDefault();
        openDrawer();
      });
    }

    var closeBtn = document.getElementById('es-m-drawer-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function (e) {
        e.preventDefault();
        closeDrawer();
      });
    }

    var backdrop = document.getElementById('es-m-drawer-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', function (e) {
        if (e.target === backdrop) {
          closeDrawer();
        }
      });
    }

    // 3. Drawer Links
    var drawerLinks = document.querySelectorAll('.es-m-drawer-link');
    drawerLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        var view = link.getAttribute('data-view');
        var target = link.getAttribute('data-target');
        if (view && target) {
          e.preventDefault();
          navigateTo(view, target);
        }
      });
    });

    // 4. User Pill Top Bar
    var userPill = document.getElementById('es-m-user-pill');
    if (userPill) {
      userPill.addEventListener('click', function (e) {
        e.preventDefault();
        var u = getUser();
        if (u && (u.id || u.username)) {
          navigateTo('user-dossier', '#user-dossier-portal');
        } else if (typeof window.openAccessoModal === 'function') {
          window.openAccessoModal('email');
        }
      });
    }

    // 5. Login Button Top Bar
    var loginBtn = document.getElementById('es-m-login-btn');
    if (loginBtn) {
      loginBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (typeof window.openAccessoModal === 'function') {
          window.openAccessoModal('email');
        }
      });
    }

    // 6. Messaggi Top Bar
    var msgBtn = document.getElementById('es-m-btn-msgs');
    if (msgBtn) {
      msgBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (typeof window.openUserMessages === 'function') {
          window.openUserMessages();
        }
      });
    }

    // 7. Notifiche Top Bar
    var notifBtn = document.getElementById('es-m-btn-notifs');
    if (notifBtn) {
      notifBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (typeof window.openUserNotifications === 'function') {
          window.openUserNotifications();
        }
      });
    }

    // 8. Hash change & resize sync
    window.addEventListener('hashchange', syncActiveTab);
    window.addEventListener('resize', function () {
      if (isMobile()) {
        syncActiveTab();
        syncUserState();
      }
    });

    // Hook a switchView globale per sincronizzazione immediata
    var origSwitchView = window.switchView;
    if (typeof origSwitchView === 'function') {
      window.switchView = function () {
        var res = origSwitchView.apply(this, arguments);
        setTimeout(syncActiveTab, 50);
        return res;
      };
    }
  }

  function init() {
    bindEvents();
    syncActiveTab();
    syncUserState();
    setTimeout(function () {
      syncActiveTab();
      syncUserState();
    }, 400);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.EliseeMobileWebApp = {
    syncActiveTab: syncActiveTab,
    syncUserState: syncUserState,
    openDrawer: openDrawer,
    closeDrawer: closeDrawer
  };
})();
