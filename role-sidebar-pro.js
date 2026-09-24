/**
 * ELISEE SCOUT — ROLE SIDEBAR PRO CONTROLLER
 * Gestione dello stato di espansione/collasso (252px <-> 72px),
 * supporto navigazione ad albero, flyout popover e bottom card rapida.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'elisee_sidebar_collapsed';

  function isCollapsed() {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  }

  function setCollapsed(val) {
    localStorage.setItem(STORAGE_KEY, val ? 'true' : 'false');
    applyState();
  }

  function toggle() {
    setCollapsed(!isCollapsed());
  }

  function applyState() {
    document.body.classList.remove('es-sidebar-is-collapsed');
  }

  // Lettura dati utente attivo
  function getActiveUser() {
    try {
      if (typeof window.getActiveUser === 'function') return window.getActiveUser();
      var raw = localStorage.getItem('elisee_active_user');
      return raw ? JSON.parse(raw) : {};
    } catch (_) {
      return {};
    }
  }

  function isAvatar3dChrome(sidebar) {
    if (!sidebar || !sidebar.closest) return false;
    if (sidebar.classList && sidebar.classList.contains('es-a3d-sidebar-controls')) return true;
    if (sidebar.getAttribute && sidebar.getAttribute('data-msb-skip') === 'true') return true;
    if (sidebar.closest('#elisee-avatar3d-modal, .es-a3d-modal-overlay, .es-a3d-dialog')) return true;
    var cls = String(sidebar.className || '');
    return cls.indexOf('a3d') !== -1 || cls.indexOf('avatar3d') !== -1;
  }

  var ICO = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
    sun: '<svg class="es-sb-ico-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg class="es-sb-ico-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5z"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.3.6.9 1 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    out: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg>'
  };

  function escAttr(value) {
    return String(value || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  function applyStoredTheme() {
    try {
      var saved = localStorage.getItem('elisee_ui_theme') || '';
      if (saved === 'mimetico-chiaro') document.documentElement.setAttribute('data-theme', saved);
    } catch (_) {}
  }

  function toggleSiteTheme() {
    var light = document.documentElement.getAttribute('data-theme') === 'mimetico-chiaro';
    if (light) {
      document.documentElement.setAttribute('data-theme', 'vault-neon');
      try { localStorage.removeItem('elisee_ui_theme'); } catch (_) {}
    } else {
      document.documentElement.setAttribute('data-theme', 'mimetico-chiaro');
      try { localStorage.setItem('elisee_ui_theme', 'mimetico-chiaro'); } catch (_) {}
    }
  }

  function go(view) {
    if (typeof window.switchView === 'function') window.switchView(view);
  }

  function upgradeSidebar(sidebar) {
    if (!sidebar || isAvatar3dChrome(sidebar)) return;
    if (sidebar.getAttribute('data-msb-upgraded') === 'true') return;
    sidebar.setAttribute('data-msb-upgraded', 'true');
    sidebar.classList.add('es-sb-hover');

    sidebar.querySelectorAll('.es-msb-floating-toggle, .es-msb-mac-dots, .es-msb-contacts-section, .es-msb-bottom-action, .es-msb-user-card').forEach(function (node) {
      node.remove();
    });

    var user = getActiveUser();
    var roleLabel = user.ruolo || user.role || user.ruoloDettagliato || 'Account';
    var nameLabel = ((user.nome || '') + ' ' + (user.cognome || '')).trim() || user.email || 'Account';
    var avatarUrl = user.fotoUrl || user.photo || 'immagini/squadre-loghi/foggia-city.png';

    var profile = document.createElement('div');
    profile.className = 'es-sb-profile';
    profile.innerHTML =
      '<img src="' + escAttr(avatarUrl) + '" alt="" onerror="this.onerror=null;this.src=\'immagini/squadre-loghi/foggia-city.png\';">' +
      '<div class="es-sb-meta"><p class="es-sb-name">' + escAttr(nameLabel) + '</p><p class="es-sb-role">' + escAttr(roleLabel) + '</p></div>' +
      '<button type="button" class="es-sb-chev" aria-label="Apri account">' + ICO.chev + '</button>';
    profile.querySelector('.es-sb-chev').addEventListener('click', function (e) {
      e.preventDefault();
      go('account');
    });
    sidebar.insertBefore(profile, sidebar.firstChild);

    var search = document.createElement('div');
    search.className = 'es-sb-search';
    search.innerHTML = '<input type="search" placeholder="Cerca" aria-label="Cerca nella dashboard">' + ICO.search;
    var input = search.querySelector('input');
    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      sidebar.querySelectorAll('.es-pro-side-btn, .es-msb-btn, nav button, nav a').forEach(function (el) {
        if (el.closest('.es-sb-actions') || el.closest('.es-sb-profile')) return;
        var text = (el.textContent || '').toLowerCase();
        el.hidden = !!(q && text.indexOf(q) === -1);
      });
    });
    input.addEventListener('focus', function () { sidebar.classList.add('es-sb-lock'); });
    input.addEventListener('blur', function () { sidebar.classList.remove('es-sb-lock'); });
    var nav = sidebar.querySelector('.es-obs-sidebar-nav, .es-pro-sidebar-nav, .es-cos-sidebar-nav, nav');
    if (nav) sidebar.insertBefore(search, nav);
    else sidebar.appendChild(search);

    var actions = document.createElement('div');
    actions.className = 'es-sb-actions';
    actions.innerHTML =
      '<button type="button" class="es-sb-action" data-act="theme" title="Tema del sito">' + ICO.sun + ICO.moon + '</button>' +
      '<button type="button" class="es-sb-action" data-act="settings" title="Impostazioni">' + ICO.gear + '</button>' +
      '<button type="button" class="es-sb-action" data-act="add" title="Nuova operazione">' + ICO.plus + '</button>' +
      '<button type="button" class="es-sb-action" data-act="logout" title="Esci">' + ICO.out + '</button>';
    actions.addEventListener('click', function (e) {
      var btn = e.target.closest('.es-sb-action');
      if (!btn) return;
      e.preventDefault();
      var act = btn.getAttribute('data-act');
      if (act === 'theme') toggleSiteTheme();
      else if (act === 'settings') go('account');
      else if (act === 'add') {
        if (typeof window.openPubblicaAnnuncioModal === 'function') window.openPubblicaAnnuncioModal();
        else go('bacheca');
      } else if (act === 'logout' && typeof window.logoutUser === 'function') window.logoutUser();
    });
    sidebar.appendChild(actions);
  }

  // Scansione e upgrade automatico di tutte le sidebar montate
  function scanAndUpgrade() {
    var sidebars = document.querySelectorAll(
      '.es-obs-sidebar, .es-pro-sidebar, .es-cos-sidebar, .es-modern-sidebar, .es-at-sidebar, .es-med-sidebar, .es-gk-sidebar, .es-ma-sidebar, [id$="-sidebar"], [class*="-sidebar"]'
    );
    sidebars.forEach(function (sb) {
      if (isAvatar3dChrome(sb)) return;
      if (sb.tagName === 'NAV') return;
      var cls = String(sb.className || '');
      if (/sidebar-(nav|badge|club|btn)/.test(cls)) return;
      if (sb.parentElement && sb.parentElement.closest('[data-msb-upgraded="true"]')) return;
      if (sb.offsetWidth > 0 || sb.offsetHeight > 0 || window.getComputedStyle(sb).display !== 'none') {
        upgradeSidebar(sb);
      }
    });
  }

  // Inizializzazione
  applyStoredTheme();
  applyState();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      applyState();
      scanAndUpgrade();
    });
  } else {
    applyState();
    scanAndUpgrade();
  }

  // Polling leggero per intercettare i cambi vista
  setInterval(scanAndUpgrade, 1400);

  // API Pubblica
  window.EliseeRoleSidebar = {
    isCollapsed: isCollapsed,
    setCollapsed: setCollapsed,
    toggle: toggle,
    upgrade: upgradeSidebar,
    scan: scanAndUpgrade
  };
})();
