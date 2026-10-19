/* Dashboard Direttore Sportivo — area staff DS */
(function () {
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function userObj() {
    try { return JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {}; } catch (_) { return {}; }
  }
  function isDs(u) {
    u = u || userObj();
    var primary = String(u.staffRole || u.ruoloDettagliato || (u.staffProfile && u.staffProfile.fieldRole) || u.ruolo || u.role || '').trim().toLowerCase();
    if (/vice\s*presidente|presidente|direttore generale|segretario generale/.test(primary) && !/direttore sportivo|\bds\b/.test(primary)) return false;
    return /direttore sportivo|\bds\b/.test(primary);
  }
  function dsName(u) {
    return [u.nome, u.cognome].filter(Boolean).join(' ').trim() || u.username || 'Direttore Sportivo';
  }
  function initials(name) {
    var p = String(name || 'DS').trim().split(/\s+/);
    return ((p[0] || 'D').charAt(0) + (p[1] || p[0] || 'S').charAt(0)).toUpperCase();
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

  function html(user) {
    return window.EliseeDashReal.shell({
      user: user,
      title: 'Elisee Scout — Dashboard Direttore Sportivo',
      roleLabel: 'Direttore sportivo',
      attr: 'ds',
      extraRail: 'secret',
      radarTitle: 'Quadro dirigenziale',
      workTitle: 'Operativita mercato',
      workEmpty: 'Nessuna trattativa o rosa caricata su questo profilo.',
      registroTitle: 'Registro trattative',
      registroHeaders: ['Club', 'Tipo', 'Stato']
    });
  }

  function hideCoach() {
    if (typeof window.unmountAllRoleDashboards === "function") {
      window.unmountAllRoleDashboards('es-dsd');
    }
  }


  function openDsEditModal(user) {
    user = user || userObj();
    var backdrop = document.createElement('div');
    backdrop.className = 'es-edit-modal-backdrop';

    backdrop.innerHTML = '<div class="es-edit-modal">' +
      '<div class="es-edit-modal-head">' +
      '<h2><span>✏️</span> Modifica Anagrafica Direttore Sportivo</h2>' +
      '<button type="button" class="es-edit-modal-close" title="Chiudi">&times;</button>' +
      '</div>' +
      '<div class="es-edit-grid">' +
      '<div class="es-edit-field"><label>Nome</label><input id="es-ds-nome" value="' + esc(user.nome || '') + '"></div>' +
      '<div class="es-edit-field"><label>Cognome</label><input id="es-ds-cognome" value="' + esc(user.cognome || '') + '"></div>' +
      '<div class="es-edit-field"><label>Ruolo Ufficiale</label><input id="es-ds-role" value="Direttore Sportivo" readonly></div>' +
      '<div class="es-edit-field"><label>Club / Organizzazione</label><input id="es-ds-club" value="' + esc(user.squadra || user.club || '') + '" placeholder="Vuoto = consulente indipendente"></div>' +
      '<div class="es-edit-field"><label>Città operativa</label><input id="es-ds-city" value="' + esc(user.citta || user.city || '') + '"></div>' +
      '<div class="es-edit-field"><label>Provincia</label><input id="es-ds-prov" value="' + esc(user.provincia || '') + '"></div>' +
      '<div class="es-edit-field"><label>Regione</label><input id="es-ds-reg" value="' + esc(user.regione || '') + '"></div>' +
      '<div class="es-edit-field full"><label>Bio &amp; Note Operative</label><textarea id="es-ds-bio" rows="3">' + esc(user.bio || '') + '</textarea></div>' +
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
      var n = document.getElementById('es-ds-nome').value.trim();
      var c = document.getElementById('es-ds-cognome').value.trim();
      var clb = document.getElementById('es-ds-club').value.trim();
      var bio = document.getElementById('es-ds-bio').value.trim();
      var city = (document.getElementById('es-ds-city') || {}).value || '';
      var prov = (document.getElementById('es-ds-prov') || {}).value || '';
      var reg = (document.getElementById('es-ds-reg') || {}).value || '';

      user.nome = n || user.nome;
      user.cognome = c || user.cognome;
      user.fullName = (user.nome + ' ' + user.cognome).trim();
      user.squadra = clb;
      user.club = clb;
      user.bio = bio;
      user.citta = String(city).trim();
      user.city = user.citta;
      user.provincia = String(prov).trim();
      user.regione = String(reg).trim();
      user.dsStatus = clb ? 'club' : 'In cerca di progetto / Consulente indipendente';

      try {
        localStorage.setItem('elisee_active_user', JSON.stringify(user));
      } catch (_) {}

      close();
      if (typeof window.showToast === 'function') {
        window.showToast('Anagrafica Direttore Sportivo salvata con successo!', 'success');
      }
      render(user);
    });
  }

  function fillMaInbox(host, user) {
    if (!host) return;
    var body = host.querySelector('#es-pd-actions-slot') || host.querySelector('.es-pro-main') || host.querySelector('.es-pd-body');
    if (!body) return;
    var old = host.querySelector('.es-ma-staff-inbox');
    if (old) old.remove();
    var club = String((user && (user.squadra || user.club)) || '').trim();
    var items = [];
    if (window.EliseeMaDash && typeof window.EliseeMaDash.inboxForClub === 'function') {
      items = window.EliseeMaDash.inboxForClub(club).filter(function (x) {
        return !x.to || x.to.indexOf('ds') >= 0;
      }).slice(0, 6);
    }
    var wrap = document.createElement('div');
    wrap.className = 'es-ma-staff-inbox';
    wrap.innerHTML = '<section class="es-pd-card">' +
      '<div class="es-pd-card-header"><h2>Report Match Analyst</h2>' +
      '<span class="es-pd-source-badge">In-house</span></div>' +
      (items.length
        ? '<ul style="margin:0;padding-left:1.1rem;color:#cbd5e1;font-size:0.82rem;line-height:1.5;">' +
          items.map(function (x) {
            return '<li><b>' + esc(x.title) + '</b> — ' + esc(x.kind || 'report') +
              (x.fromName ? ' · ' + esc(x.fromName) : '') + '</li>';
          }).join('') + '</ul>'
        : '<p style="color:#94a3b8;font-size:0.82rem;margin:0;">Nessun report tattico inoltrato dal Match Analyst per valutare la crescita in ottica calciomercato.</p>') +
      '</section>';
    body.appendChild(wrap);
  }

  function bind(host) {
    if (!host || host.dataset.dsBound === '1') return;
    host.dataset.dsBound = '1';
    host.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ds]');
      if (!b) return;
      var k = b.getAttribute('data-ds');
      if (k === 'home' && window.switchView) window.switchView('home', '#hero');
      if (k === 'schede' && window.EliseeSchede && window.EliseeSchede.requestPanelHtml) {
        var q = window.prompt('Nome, ruolo o società del tesserato per la scheda tecnica IA:');
        if (q && window.EliseeSchede.generateFor) {
          var sh = window.EliseeSchede.generateFor(q, 'ds');
          if (sh && window.EliseeSchede.openViewer) window.EliseeSchede.openViewer(sh, 'ds');
        }
      }
      if (k === 'secret' && window.openSecretList) window.openSecretList();
      if (k === 'wall' && window.openTransferWall) window.openTransferWall();
      if (k === 'album' && window.openChiSegui) {
        if (window.EliseeChiSegui) window.EliseeChiSegui.kind = 'player';
        window.openChiSegui();
      }
      if (k === 'msgs' && window.openUserMessages) window.openUserMessages();
      if (k === 'edit') {
        openDsEditModal(userObj());
      }
    });
  }

  function render(user) {
    user = user || userObj();
    if (!isDs(user)) return;
    hideCoach();
    var host = document.getElementById('es-staff-profile');
    var group = document.getElementById('user-dossier-view-group');
    if (!host) return;
    var box = document.getElementById('es-dsd');
    if (!box) {
      box = document.createElement('div');
      box.id = 'es-dsd';
      box.className = 'es-pd';
      host.insertBefore(box, host.firstChild);
    }
    box.innerHTML = html(user);
    fillMaInbox(box, user);
    box.hidden = false;
    box.removeAttribute('hidden');
    box.style.display = 'block';
    if (window.EliseeDsHub && typeof window.EliseeDsHub.mount === 'function') {
      try { window.EliseeDsHub.mount(box, user); } catch (_) {}
    }
    host.classList.add('es-ds-on');
    host.classList.remove('es-pd-on', 'es-ma-on', 'es-med-on', 'es-obs-on', 'es-tm-on', 'es-gk-on', 'es-at-on', 'es-yg-on', 'es-dg-on', 'es-nu-on');
    if (group) {
      group.classList.add('is-ds-dash');
      group.classList.remove('is-coach-dash', 'is-ma-dash', 'is-med-dash', 'is-obs-dash', 'is-tm-dash', 'is-gk-dash', 'is-at-dash', 'is-yg-dash', 'is-dg-dash', 'is-nu-dash');
    }
    bind(host);
  }

  window.EliseeDsDash = { render: render, isDs: isDs };

  document.addEventListener('elisee:view-changed', function (e) {
    var d = e && e.detail;
    if (d && d.view === 'user-dossier') {
      try {
        var u = userObj();
        if (isDs(u)) render(u);
      } catch (_) {}
    }
  });
})();
