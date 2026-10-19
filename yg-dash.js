/* Dashboard Responsabile Settore Giovanile */
(function () {
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function userObj() {
    try { return JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {}; } catch (_) { return {}; }
  }
  function isYg(u) {
    u = u || userObj();
    var blob = String(u.staffRole || u.ruoloDettagliato || (u.staffProfile && u.staffProfile.fieldRole) || u.ruolo || u.role || '').trim().toLowerCase();
    return /responsabile (del )?settore giovanile|settore giovanile/.test(blob);
  }
  function ygName(u) {
    return [u.nome, u.cognome].filter(Boolean).join(' ').trim() || u.username || 'Responsabile settore giovanile';
  }
  function initials(name) {
    var p = String(name || 'SG').trim().split(/\s+/);
    return ((p[0] || 'S').charAt(0) + (p[1] || p[0] || 'G').charAt(0)).toUpperCase();
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
      window.unmountAllRoleDashboards('es-yg');
    }
  }

  function html(user) {
    return window.EliseeDashReal.shell({
      user: user,
      title: 'Elisee Scout — Dashboard Settore Giovanile',
      roleLabel: 'Responsabile settore giovanile',
      attr: 'yg',
      extraRail: '',
      radarTitle: 'Quadro vivaio',
      workTitle: 'Categorie',
      workEmpty: 'Nessuna categoria o promozione registrata.',
      registroTitle: 'Registro vivaio',
      registroHeaders: ['Categoria', 'Evento', 'Stato']
    });
  }

  function openYgEditModal(user) {
    user = user || userObj();
    var backdrop = document.createElement('div');
    backdrop.className = 'es-edit-modal-backdrop';

    backdrop.innerHTML = '<div class="es-edit-modal">' +
      '<div class="es-edit-modal-head">' +
      '<h2><span>✏️</span> Modifica Anagrafica Responsabile Settore Giovanile</h2>' +
      '<button type="button" class="es-edit-modal-close" title="Chiudi">&times;</button>' +
      '</div>' +
      '<div class="es-edit-grid">' +
      '<div class="es-edit-field"><label>Nome</label><input id="es-yg-nome" value="' + esc(user.nome || '') + '"></div>' +
      '<div class="es-edit-field"><label>Cognome</label><input id="es-yg-cognome" value="' + esc(user.cognome || '') + '"></div>' +
      '<div class="es-edit-field"><label>Ruolo Ufficiale</label><input id="es-yg-role" value="Responsabile Settore Giovanile" readonly></div>' +
      '<div class="es-edit-field"><label>Club / Organizzazione</label><input id="es-yg-club" value="' + esc(user.squadra || user.club || '') + '"></div>' +
      '<div class="es-edit-field full"><label>Bio &amp; Note Operative</label><textarea id="es-yg-bio" rows="3">' + esc(user.bio || '') + '</textarea></div>' +
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
      var n = document.getElementById('es-yg-nome').value.trim();
      var c = document.getElementById('es-yg-cognome').value.trim();
      var clb = document.getElementById('es-yg-club').value.trim();
      var bio = document.getElementById('es-yg-bio').value.trim();

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
        window.showToast('Anagrafica Responsabile Settore Giovanile salvata con successo!', 'success');
      }
      render(user);
    });
  }

  function bind(host) {
    if (!host || host.dataset.ygBound === '1') return;
    host.dataset.ygBound = '1';
    host.addEventListener('click', function (e) {
      var b = e.target.closest('[data-yg]');
      if (!b) return;
      var k = b.getAttribute('data-yg');
      if (k === 'home' && window.switchView) window.switchView('home', '#hero');
      if (k === 'album' && window.openChiSegui) window.openChiSegui();
      if (k === 'msgs' && window.openUserMessages) window.openUserMessages();
      if (k === 'edit') {
        openYgEditModal(userObj());
      }
    });
  }

  function render(user) {
    user = user || userObj();
    if (!isYg(user)) return;
    hideOthers();
    var host = document.getElementById('es-staff-profile');
    var group = document.getElementById('user-dossier-view-group');
    if (!host) return;
    var box = document.getElementById('es-yg');
    if (!box) {
      box = document.createElement('div');
      box.id = 'es-yg';
      box.className = 'es-pd';
      host.insertBefore(box, host.firstChild);
    }
    box.innerHTML = html(user);
    box.hidden = false;
    box.removeAttribute('hidden');
    box.style.display = 'block';
    host.classList.add('es-yg-on');
    host.classList.remove('es-pd-on', 'es-ds-on', 'es-pres-on', 'es-vice-on', 'es-fisio-on', 'es-ma-on', 'es-med-on', 'es-obs-on', 'es-tm-on', 'es-gk-on', 'es-at-on', 'es-dg-on');
    if (group) {
      group.classList.add('is-yg-dash');
      group.classList.remove('is-coach-dash', 'is-ds-dash', 'is-pres-dash', 'is-vice-dash', 'is-fisio-dash', 'is-ma-dash', 'is-med-dash', 'is-obs-dash', 'is-tm-dash', 'is-gk-dash', 'is-at-dash', 'is-dg-dash');
    }
    bind(host);
  }

  window.EliseeYgDash = { render: render, isYg: isYg };

  document.addEventListener('elisee:view-changed', function (e) {
    var d = e && e.detail;
    if (d && d.view === 'user-dossier') {
      try {
        var u = userObj();
        if (isYg(u)) render(u);
      } catch (_) {}
    }
  });
})();
