/* Dashboard Ufficio Stampa — Responsabile Comunicazione */
(function () {
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function userObj() {
    try { return JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {}; } catch (_) { return {}; }
  }
  function isPr(u) {
    u = u || userObj();
    var blob = String(u.staffRole || u.ruoloDettagliato || (u.staffProfile && u.staffProfile.fieldRole) || u.ruolo || u.role || '').trim().toLowerCase();
    return /ufficio stampa|responsabile comunicazione|addetto stampa/.test(blob);
  }
  function prName(u) {
    return [u.nome, u.cognome].filter(Boolean).join(' ').trim() || u.username || 'Responsabile comunicazione';
  }
  function initials(name) {
    var p = String(name || 'PR').trim().split(/\s+/);
    return ((p[0] || 'P').charAt(0) + (p[1] || p[0] || 'R').charAt(0)).toUpperCase();
  }
  function photoOf(u) {
    try {
      if (window.getStoredProfilePhoto) return window.getStoredProfilePhoto(null, u) || u.fotoUrl || '';
    } catch (_) {}
    return u.fotoUrl || '';
  }
  function ico(d) {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">' + d + '</svg>';
  }
  function hideOthers() {
    if (typeof window.unmountAllRoleDashboards === "function") {
      window.unmountAllRoleDashboards('es-pr');
    }
  }

  function html(user) {
    return window.EliseeDashReal.shell({
      user: user,
      title: 'Elisee Scout — Dashboard Ufficio Stampa',
      roleLabel: 'Ufficio stampa',
      attr: 'pr',
      extraRail: '',
      radarTitle: 'Quadro comunicazione',
      workTitle: 'Comunicati',
      workEmpty: 'Nessun comunicato registrato.',
      registroTitle: 'Registro media',
      registroHeaders: ['Data', 'Titolo', 'Stato']
    });
  }

  function openPrEditModal(user) {
    user = user || userObj();
    var backdrop = document.createElement('div');
    backdrop.className = 'es-edit-modal-backdrop';

    backdrop.innerHTML = '<div class="es-edit-modal">' +
      '<div class="es-edit-modal-head">' +
      '<h2><span>✏️</span> Modifica Anagrafica Ufficio Stampa & Comunicazione</h2>' +
      '<button type="button" class="es-edit-modal-close" title="Chiudi">&times;</button>' +
      '</div>' +
      '<div class="es-edit-grid">' +
      '<div class="es-edit-field"><label>Nome</label><input id="es-pr-nome" value="' + esc(user.nome || '') + '"></div>' +
      '<div class="es-edit-field"><label>Cognome</label><input id="es-pr-cognome" value="' + esc(user.cognome || '') + '"></div>' +
      '<div class="es-edit-field"><label>Ruolo Ufficiale</label><input id="es-pr-role" value="Ufficio Stampa & Comunicazione" readonly></div>' +
      '<div class="es-edit-field"><label>Club / Organizzazione</label><input id="es-pr-club" value="' + esc(user.squadra || user.club || '') + '"></div>' +
      '<div class="es-edit-field full"><label>Bio &amp; Note Operative</label><textarea id="es-pr-bio" rows="3">' + esc(user.bio || '') + '</textarea></div>' +
      '</div>' +
      '<div class="es-edit-actions">' +
      '<button type="button" class="es-edit-btn-cancel">Annulla</button>' +
      '<button type="button" class="es-edit-btn-save">💾 Salva Anagrafica</button>' +
      '</div>' +
      '</div>';

    document.body.appendChild(backdrop);

    var close = function () { backdrop.remove(); };
    backdrop.querySelector('.es-edit-modal-close').addEventListener('click', close);
    backdrop.querySelector('.es-edit-btn-cancel').addEventListener('click', close);
    backdrop.addEventListener('click', function (e) { if (e.target === backdrop) close(); });

    backdrop.querySelector('.es-edit-btn-save').addEventListener('click', function () {
      var n = document.getElementById('es-pr-nome').value.trim();
      var c = document.getElementById('es-pr-cognome').value.trim();
      var clb = document.getElementById('es-pr-club').value.trim();
      var bio = document.getElementById('es-pr-bio').value.trim();

      user.nome = n || user.nome;
      user.cognome = c || user.cognome;
      user.fullName = (user.nome + ' ' + user.cognome).trim();
      user.squadra = clb;
      user.club = clb;
      user.bio = bio;

      try {
        localStorage.setItem('elisee_active_user', JSON.stringify(user));
      } catch (_) {}

      close();
      if (typeof window.showToast === 'function') {
        window.showToast('Anagrafica Ufficio Stampa & Comunicazione salvata con successo!', 'success');
      }
      render(user);
    });
  }

  function bind(host) {
    if (!host || host.dataset.prBound === '1') return;
    host.dataset.prBound = '1';
    host.addEventListener('click', function (e) {
      var b = e.target.closest('[data-pr]');
      if (!b) return;
      var k = b.getAttribute('data-pr');
      if (k === 'home' && window.switchView) window.switchView('home', '#hero');
      if (k === 'album' && window.openChiSegui) window.openChiSegui();
      if (k === 'msgs' && window.openUserMessages) window.openUserMessages();
      if (k === 'edit') {
        openPrEditModal(userObj());
      }
    });
  }

  function render(user) {
    user = user || userObj();
    if (!isPr(user)) return;
    hideOthers();
    var host = document.getElementById('es-staff-profile');
    var group = document.getElementById('user-dossier-view-group');
    if (!host) return;
    var box = document.getElementById('es-pr');
    if (!box) {
      box = document.createElement('div');
      box.id = 'es-pr';
      box.className = 'es-pd';
      host.insertBefore(box, host.firstChild);
    }
    box.innerHTML = html(user);
    box.hidden = false;
    box.removeAttribute('hidden');
    box.style.display = 'block';
    host.classList.add('es-pr-on');
    host.classList.remove('es-pd-on', 'es-ds-on', 'es-pres-on', 'es-vice-on', 'es-fisio-on', 'es-ma-on', 'es-med-on', 'es-obs-on', 'es-tm-on', 'es-gk-on', 'es-at-on', 'es-yg-on', 'es-dg-on', 'es-ag-on', 'es-mk-on', 'es-nu-on', 'es-eq-on');
    if (group) {
      group.classList.add('is-pr-dash');
      group.classList.remove('is-coach-dash', 'is-ds-dash', 'is-pres-dash', 'is-vice-dash', 'is-fisio-dash', 'is-ma-dash', 'is-med-dash', 'is-obs-dash', 'is-tm-dash', 'is-gk-dash', 'is-at-dash', 'is-yg-dash', 'is-dg-dash', 'is-ag-dash', 'is-mk-dash', 'is-nu-dash', 'is-eq-dash');
    }
    bind(host);
  }

  window.EliseePrDash = { render: render, isPr: isPr };

  document.addEventListener('elisee:view-changed', function (e) {
    var d = e && e.detail;
    if (d && d.view === 'user-dossier') {
      try {
        var u = userObj();
        if (isPr(u)) render(u);
      } catch (_) {}
    }
  });
})();
