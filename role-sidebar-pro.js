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
    var collapsed = isCollapsed();
    if (collapsed) {
      document.body.classList.add('es-sidebar-is-collapsed');
    } else {
      document.body.classList.remove('es-sidebar-is-collapsed');
    }

    // Aggiorna icone toggle ovunque
    document.querySelectorAll('.es-msb-floating-toggle').forEach(function (btn) {
      btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      btn.title = collapsed ? 'Espandi Sidebar' : 'Riduci Sidebar';
    });
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

  // Iniezione o upgrade di una sidebar esistente
  function upgradeSidebar(sidebar) {
    if (!sidebar || sidebar.getAttribute('data-msb-upgraded') === 'true') return;
    sidebar.setAttribute('data-msb-upgraded', 'true');

    var user = getActiveUser();
    var roleLabel = (user.ruolo || user.role || 'TALENT SCOUT').toUpperCase();
    var nameLabel = ((user.nome || '') + ' ' + (user.cognome || '')).trim() || 'Eliseo Miraglia';
    var avatarUrl = user.fotoUrl || 'immagini/kits-2d/foggia-city/home.png';

    // 1. Aggiungi pulsante Toggle fluttuante se assente
    if (!sidebar.querySelector('.es-msb-floating-toggle')) {
      var toggleBtn = document.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.className = 'es-msb-floating-toggle';
      toggleBtn.title = isCollapsed() ? 'Espandi Sidebar' : 'Riduci Sidebar';
      toggleBtn.setAttribute('aria-label', 'Toggle compatto sidebar');
      toggleBtn.innerHTML =
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
          '<polyline points="15 18 9 12 15 6"></polyline>' +
        '</svg>';

      toggleBtn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      };
      sidebar.appendChild(toggleBtn);
    }

    // 2. Aggiungi Mac OS Dots in testata se assenti
    if (!sidebar.querySelector('.es-msb-mac-dots')) {
      var dotsWrap = document.createElement('div');
      dotsWrap.className = 'es-msb-mac-dots';
      dotsWrap.innerHTML =
        '<span class="es-msb-dot es-msb-dot-close" title="Chiudi"></span>' +
        '<span class="es-msb-dot es-msb-dot-min" title="Riduci"></span>' +
        '<span class="es-msb-dot es-msb-dot-max" title="Espandi"></span>';
      sidebar.insertBefore(dotsWrap, sidebar.firstChild);
    }

    // 3. Aggiungi Profilo Utente compatto in alto se assente
    if (!sidebar.querySelector('.es-msb-user-card')) {
      var userCard = document.createElement('div');
      userCard.className = 'es-msb-user-card';
      userCard.innerHTML =
        '<img class="es-msb-user-avatar" src="' + avatarUrl + '" onerror="this.onerror=null;this.src=\'immagini/squadre-loghi/foggia-city.png\';" alt="User">' +
        '<div class="es-msb-user-info">' +
          '<span class="es-msb-user-role">' + roleLabel + '</span>' +
          '<span class="es-msb-user-name">' + nameLabel + '</span>' +
        '</div>';

      var dots = sidebar.querySelector('.es-msb-mac-dots');
      if (dots && dots.nextSibling) {
        sidebar.insertBefore(userCard, dots.nextSibling);
      } else {
        sidebar.appendChild(userCard);
      }
    }

    // 4. Aggiungi Sezione Messaggi Rapidi / Staff se assente
    if (!sidebar.querySelector('.es-msb-contacts-section')) {
      var contacts = document.createElement('div');
      contacts.className = 'es-msb-contacts-section';
      contacts.innerHTML =
        '<div class="es-msb-section-title">' +
          '<span>MESSAGGI</span>' +
          '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
        '</div>' +
        '<div class="es-msb-contact-row" onclick="if(window.switchView){window.switchView(\'bacheca\');}" title="Chat Direttore Sportivo">' +
          '<img class="es-msb-contact-avatar" src="immagini/squadre-loghi/foggia-city.png" alt="Staff">' +
          '<span class="es-msb-contact-name">Direttore Sportivo</span>' +
        '</div>' +
        '<div class="es-msb-contact-row" onclick="if(window.switchView){window.switchView(\'bacheca\');}" title="Chat Staff Tecnico">' +
          '<img class="es-msb-contact-avatar" src="immagini/kits-2d/foggia-city/home.png" alt="Staff">' +
          '<span class="es-msb-contact-name">Staff Tecnico</span>' +
        '</div>';

      var nav = sidebar.querySelector('.es-obs-sidebar-nav, .es-pro-sidebar-nav, .es-cos-sidebar-nav, nav');
      if (nav) {
        nav.parentNode.insertBefore(contacts, nav.nextSibling);
      }
    }

    // 5. Aggiungi Bottom Action Card "Let's start!" con CTA "+"
    if (!sidebar.querySelector('.es-msb-bottom-action')) {
      var bottomAction = document.createElement('div');
      bottomAction.className = 'es-msb-bottom-action';
      bottomAction.innerHTML =
        '<div class="es-msb-action-card">' +
          '<h4 class="es-msb-action-card-title">Let\'s start!</h4>' +
          '<p class="es-msb-action-card-desc">Crea nuovi report o gestisci le operazioni</p>' +
          '<button type="button" class="es-msb-cta-btn" id="btn-msb-add-task" title="Nuova Operazione">' +
            '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
            '<span>+ Nuova Operazione</span>' +
          '</button>' +
        '</div>';

      bottomAction.querySelector('#btn-msb-add-task').onclick = function (e) {
        e.preventDefault();
        if (typeof window.openPubblicaAnnuncioModal === 'function') {
          window.openPubblicaAnnuncioModal();
        } else if (typeof window.switchView === 'function') {
          window.switchView('bacheca');
        }
      };

      sidebar.appendChild(bottomAction);
    }
  }

  // Scansione e upgrade automatico di tutte le sidebar montate
  function scanAndUpgrade() {
    var sidebars = document.querySelectorAll(
      '.es-obs-sidebar, .es-pro-sidebar, .es-cos-sidebar, .es-modern-sidebar, [id$="-sidebar"]'
    );
    sidebars.forEach(function (sb) {
      if (sb.offsetWidth > 0 || sb.offsetHeight > 0 || window.getComputedStyle(sb).display !== 'none') {
        upgradeSidebar(sb);
      }
    });
  }

  // Inizializzazione
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
