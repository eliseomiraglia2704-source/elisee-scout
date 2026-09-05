/* Dashboard Osservatore — Scout / Osservatore */
(function () {
  var AXES = [
    'Precisione Valutazioni', 'Partite Visionate', 'Segnalazioni Convertite', 'Copertura Categorie Giovanili',
    'Analisi Video', 'Tempestività Report', 'Rete Contatti Procuratori', 'Conoscenza Mercato'
  ];
  var V2025 = [92, 90, 85, 88, 91, 87, 93, 94];
  var V2023 = [78, 76, 70, 74, 79, 73, 80, 81];

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function userObj() {
    try { return JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {}; } catch (_) { return {}; }
  }
  function isObs(u) {
    u = u || userObj();
    var blob = String(u.staffRole || u.ruoloDettagliato || (u.staffProfile && u.staffProfile.fieldRole) || u.ruolo || u.role || '').trim().toLowerCase();
    if (/match analyst|video analyst/.test(blob) && !/\bosservatore\b/.test(blob) && !/scout\s*\/\s*osservatore/.test(blob)) return false;
    return /scout\s*\/\s*osservatore|\bosservatore\b|\bscout\b/.test(blob);
  }
  function obsName(u) {
    return [u.nome, u.cognome].filter(Boolean).join(' ').trim() || u.username || 'Osservatore';
  }
  function initials(name) {
    var p = String(name || 'OS').trim().split(/\s+/);
    return ((p[0] || 'O').charAt(0) + (p[1] || p[0] || 'S').charAt(0)).toUpperCase();
  }
  function photoOf(u) {
    try {
      if (window.getStoredProfilePhoto) return window.getStoredProfilePhoto(null, u) || u.fotoUrl || '';
    } catch (_) {}
    return u.fotoUrl || '';
  }
  function polar(cx, cy, r, i, n, val) {
    var a = (-Math.PI / 2) + (i * 2 * Math.PI / n);
    var rr = r * (val / 100);
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
  }
  function poly(cx, cy, r, vals) {
    return vals.map(function (v, i) {
      var p = polar(cx, cy, r, i, vals.length, v);
      return p[0].toFixed(1) + ',' + p[1].toFixed(1);
    }).join(' ');
  }
  function wedge(cx, cy, r, start, end, color) {
    var n = 24;
    var pts = [[cx, cy]];
    for (var i = 0; i <= n; i++) {
      var t = start + (end - start) * (i / n);
      pts.push([cx + Math.cos(t) * r, cy + Math.sin(t) * r]);
    }
    return '<path d="M' + pts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L') + ' Z" fill="' + color + '" />';
  }
  function radarSvg() {
    var cx = 220, cy = 210, r = 150, n = AXES.length;
    var html = '<svg viewBox="0 0 440 430" role="img" aria-label="Analisi attività di scouting">';
    html += wedge(cx, cy, r, -Math.PI / 2, 0, 'rgba(74,222,128,0.16)');
    html += wedge(cx, cy, r, 0, Math.PI / 2, 'rgba(248,113,113,0.18)');
    html += wedge(cx, cy, r, Math.PI / 2, Math.PI, 'rgba(250,204,21,0.16)');
    html += wedge(cx, cy, r, Math.PI, Math.PI * 1.5, 'rgba(56,189,248,0.16)');
    for (var ring = 1; ring <= 5; ring++) {
      html += '<polygon points="' + poly(cx, cy, r, AXES.map(function () { return ring * 20; })) +
        '" fill="none" stroke="rgba(148,163,184,0.22)" stroke-width="1"/>';
    }
    for (var i = 0; i < n; i++) {
      var e = polar(cx, cy, r, i, n, 100);
      html += '<line x1="' + cx + '" y1="' + cy + '" x2="' + e[0].toFixed(1) + '" y2="' + e[1].toFixed(1) +
        '" stroke="rgba(148,163,184,0.2)"/>';
      var lab = polar(cx, cy, r + 26, i, n, 100);
      html += '<text x="' + lab[0].toFixed(1) + '" y="' + lab[1].toFixed(1) +
        '" text-anchor="middle" dominant-baseline="middle" fill="#94a3b8" font-size="9">' +
        esc(AXES[i]) + ' ' + V2025[i] + '%</text>';
    }
    html += '<polygon points="' + poly(cx, cy, r, V2023) + '" fill="rgba(148,163,184,0.12)" stroke="#64748b" stroke-width="1.5"/>';
    html += '<polygon points="' + poly(cx, cy, r, V2025) + '" fill="rgba(56,189,248,0.12)" stroke="#38bdf8" stroke-width="2"/>';
    html += '</svg>';
    return html;
  }
  function spark(values, color) {
    var w = 120, h = 36, max = Math.max.apply(null, values), min = Math.min.apply(null, values);
    var pts = values.map(function (v, i) {
      var x = (i / (values.length - 1)) * w;
      var y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
      return x.toFixed(1) + ',' + y.toFixed(1);
    }).join(' ');
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" width="100%" height="36"><polyline fill="none" stroke="' +
      color + '" stroke-width="2" points="' + pts + '"/></svg>';
  }
  function trendSvg() {
    var series = {
      '2023': [58, 64, 68, 72, 76, 80],
      '2024': [70, 74, 78, 82, 86, 90],
      '2025': [78, 82, 86, 90, 94, 97]
    };
    var cols = { '2023': '#38bdf8', '2024': '#4ade80', '2025': '#facc15' };
    var w = 240, h = 90;
    var html = '<svg viewBox="0 0 ' + w + ' ' + h + '" width="100%" height="90">';
    Object.keys(series).forEach(function (k) {
      var vals = series[k];
      var pts = vals.map(function (v, i) {
        return ((i / 5) * (w - 8) + 4).toFixed(1) + ',' + (h - 8 - (v / 100) * (h - 16)).toFixed(1);
      }).join(' ');
      html += '<polyline fill="none" stroke="' + cols[k] + '" stroke-width="2" points="' + pts + '"/>';
    });
    html += '</svg>';
    return html;
  }
  function ico(d) {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">' + d + '</svg>';
  }
  function hideOthers() {
    if (typeof window.unmountAllRoleDashboards === "function") {
      window.unmountAllRoleDashboards('es-od');
    }
  }

  var QUALS = [
    'Osservatore Professionista FIGC',
    'Talent Scout Dilettanti',
    'Match Analyst / Scout'
  ];

  function underContract(u) {
    u = u || userObj();
    var st = String(u.obsContract || u.contractStatus || '').toLowerCase();
    if (st === 'free' || st === 'free-agent' || st === 'indipendente') return false;
    if (st === 'contract' || st === 'under-contract') return true;
    return !!(u.squadra || u.club);
  }
  function qualificaOf(u) {
    return String((u && (u.obsQualifica || u.qualificaScout || u.certificazione)) || '').trim();
  }

  function html(user) {
    return window.EliseeDashReal.shell({
      user: user,
      title: 'Elisee Scout — Dashboard Osservatore',
      roleLabel: 'Osservatore / Scout',
      attr: 'obs',
      extraRail: 'secret',
      radarTitle: 'Quadro scouting',
      workTitle: 'Segnalazioni',
      workEmpty: 'Nessuna segnalazione registrata. I target restano in Secret List stealth.',
      registroTitle: 'Registro osservazioni',
      registroHeaders: ['Data', 'Soggetto', 'Esito']
    });
  }

  function extraHtml(user) {
    var on = underContract(user);
    var club = String(user.squadra || user.club || '').trim();
    var qual = qualificaOf(user) || 'Da indicare';
    var statusLbl = on ? 'Under Contract' : 'Free Agent';
    var statusSub = on
      ? (club ? ('Collegato a ' + club) : 'Collegamento ufficiale con il club')
      : 'Osservatore Indipendente / Consulente';
    var ops = on
      ? '<ul class="es-obs-list">' +
        '<li><b>Inoltro al DS</b> — dalla Secret List seleziona un calciatore e invialo alla Secret List del Direttore Sportivo del club.</li>' +
        '<li><b>Dossier di relazione</b> — l’inoltro genera una scheda tecnica con le tue note, visibile nell’area riservata del DS.</li>' +
        '<li><b>Contatto diretto</b> — chat con il calciatore o il suo entourage per sondaggi e provini per conto del club.</li>' +
        '</ul>'
      : '<ul class="es-obs-list">' +
        '<li><b>Secret List personale</b> — salva e organizza i profili in stealth, senza notifiche.</li>' +
        '<li><b>Chat e network</b> — contatto diretto con il calciatore per approfondimenti e collaborazioni.</li>' +
        '<li><b>Proposta a club terzi</b> — dossier di presentazione ai DS con cui sei in contatto. Senza autorizzazione del DS non entra nell’area riservata del club.</li>' +
        '</ul>';
    return '<div class="es-obs-extra">' +
      '<section class="es-pd-card es-obs-id">' +
        '<div class="es-pd-card-header"><h2>Identità &amp; credenziali</h2>' +
        '<span class="es-obs-badge ' + (on ? 'is-on' : 'is-free') + '">' + esc(statusLbl) + '</span></div>' +
        '<div class="es-obs-id-grid">' +
          '<div class="es-pd-ok"><span>Qualifica / certificazione</span><b>' + esc(qual) + '</b></div>' +
          '<div class="es-pd-ok"><span>Status contrattuale</span><b>' + esc(statusSub) + '</b></div>' +
        '</div>' +
      '</section>' +
      '<section class="es-pd-card es-obs-ops">' +
        '<div class="es-pd-card-header"><h2>Secret List &amp; scouting</h2>' +
        '<span class="es-pd-source-badge">Stealth</span></div>' +
        '<p class="es-obs-lead">Monitori i profili in modalità stealth: nessuna notifica ad atleta, procuratore o club.</p>' +
        ops +
        '<div class="es-obs-actions">' +
          '<button type="button" class="es-obs-btn" data-ob="secret">Apri Secret List</button>' +
          '<button type="button" class="es-obs-btn" data-ob="wall">Wall trattative</button>' +
          '<button type="button" class="es-obs-btn ghost" data-ob="search">Ricerca avanzata</button>' +
          '<button type="button" class="es-obs-btn ghost" data-ob="msgs">Messaggi</button>' +
        '</div>' +
      '</section>' +
      '<section class="es-pd-card es-obs-perm">' +
        '<div class="es-pd-card-header"><h2>Attività e permessi</h2></div>' +
        '<ul class="es-obs-list">' +
          '<li><b>Ricerca avanzata &amp; filtri tattici</b> — Città, Provincia, Regione, ruolo, età e metriche fisiche/GPS.</li>' +
          '<li><b>Wall delle trattative</b> — consultazione dei trasferimenti ufficializzati (senza poterli chiudere tu).</li>' +
          '<li><b>Schede avanzate in Secret List</b> — anagrafica, statistiche, heatmap, GPS (se abilitato) e highlight video.</li>' +
        '</ul>' +
      '</section>' +
      '<section class="es-pd-card es-obs-limits">' +
        '<div class="es-pd-card-header"><h2>Limiti di ruolo</h2></div>' +
        '<ul class="es-obs-list es-obs-limits-list">' +
          '<li>Non puoi pubblicare annunci ufficiali di ricerca calciatori a nome della società (riservato a DS / Presidente).</li>' +
          '<li>Non puoi ufficializzare acquisti sul Wall delle trattative chiuse.</li>' +
          '<li>Senza contratto non puoi inviare schede nell’area riservata dei club senza connessione o autorizzazione del DS.</li>' +
        '</ul>' +
      '</section>' +
    '</div>';
  }

  function fillExtra(host, user) {
    if (!host) return;
    var body = host.querySelector('.es-pd-body');
    if (!body) return;
    var old = body.querySelector('.es-obs-extra');
    if (old) old.remove();
    var wrap = document.createElement('div');
    wrap.innerHTML = extraHtml(user);
    body.appendChild(wrap.firstChild);
    var slot = host.querySelector('#es-pd-actions-slot');
    if (slot) {
      var on = underContract(user);
      slot.innerHTML = '<button type="button" class="es-pd-edit" data-ob="secret">' +
        (on ? 'Inoltra target al DS' : 'Apri Secret List personale') + '</button>';
    }
  }

  function openObsEditModal(user) {
    user = user || userObj();
    var backdrop = document.createElement('div');
    backdrop.className = 'es-edit-modal-backdrop';
    var on = underContract(user);
    var qNow = qualificaOf(user);
    var qOpts = QUALS.map(function (q) {
      return '<option value="' + esc(q) + '"' + (qNow === q ? ' selected' : '') + '>' + esc(q) + '</option>';
    }).join('');
    if (qNow && QUALS.indexOf(qNow) < 0) {
      qOpts = '<option value="' + esc(qNow) + '" selected>' + esc(qNow) + '</option>' + qOpts;
    }

    backdrop.innerHTML = '<div class="es-edit-modal">' +
      '<div class="es-edit-modal-head">' +
      '<h2><span>✏️</span> Modifica Anagrafica Osservatore / Scout</h2>' +
      '<button type="button" class="es-edit-modal-close" title="Chiudi">&times;</button>' +
      '</div>' +
      '<div class="es-edit-grid">' +
      '<div class="es-edit-field"><label>Nome</label><input id="es-obs-nome" value="' + esc(user.nome || '') + '"></div>' +
      '<div class="es-edit-field"><label>Cognome</label><input id="es-obs-cognome" value="' + esc(user.cognome || '') + '"></div>' +
      '<div class="es-edit-field"><label>Ruolo Ufficiale</label><input id="es-obs-role" value="Osservatore / Scout" readonly></div>' +
      '<div class="es-edit-field"><label>Qualifica / certificazione</label><select id="es-obs-qual">' +
        '<option value="">— seleziona —</option>' + qOpts + '</select></div>' +
      '<div class="es-edit-field"><label>Status contrattuale</label><select id="es-obs-contract">' +
        '<option value="contract"' + (on ? ' selected' : '') + '>Under Contract (club)</option>' +
        '<option value="free"' + (!on ? ' selected' : '') + '>Free Agent / Indipendente</option>' +
      '</select></div>' +
      '<div class="es-edit-field"><label>Club / Organizzazione</label><input id="es-obs-club" value="' + esc(user.squadra || user.club || '') + '" placeholder="Vuoto = Osservatore Indipendente"></div>' +
      '<div class="es-edit-field"><label>Collegato a un DS in piattaforma</label><select id="es-obs-dslink">' +
        '<option value="0"' + (user.obsDsLink ? '' : ' selected') + '>No</option>' +
        '<option value="1"' + (user.obsDsLink ? ' selected' : '') + '>Sì, autorizzato dal DS</option>' +
      '</select></div>' +
      '<div class="es-edit-field full"><label>Bio &amp; Note Operative</label><textarea id="es-obs-bio" rows="3">' + esc(user.bio || '') + '</textarea></div>' +
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
      var n = document.getElementById('es-obs-nome').value.trim();
      var c = document.getElementById('es-obs-cognome').value.trim();
      var clb = document.getElementById('es-obs-club').value.trim();
      var bio = document.getElementById('es-obs-bio').value.trim();
      var qual = (document.getElementById('es-obs-qual') || {}).value || '';
      var ctr = (document.getElementById('es-obs-contract') || {}).value || 'free';
      var dsLink = (document.getElementById('es-obs-dslink') || {}).value === '1';
      if (ctr === 'contract' && !clb) {
        if (typeof window.showToast === 'function') {
          window.showToast('Under Contract richiede il club di appartenenza.', 'error');
        }
        return;
      }

      user.nome = n || user.nome;
      user.cognome = c || user.cognome;
      user.fullName = (user.nome + ' ' + user.cognome).trim();
      user.squadra = clb;
      user.club = clb;
      user.bio = bio;
      user.obsQualifica = qual;
      user.qualificaScout = qual;
      user.obsContract = ctr;
      user.contractStatus = ctr;
      user.obsDsLink = dsLink;

      try {
        localStorage.setItem('elisee_active_user', JSON.stringify(user));
        localStorage.setItem('elisee_user_data', JSON.stringify(user));
      } catch (_) {}

      close();
      if (typeof window.showToast === 'function') {
        window.showToast('Anagrafica Osservatore / Scout salvata con successo!', 'success');
      }
      render(user);
    });
  }

  function bind(host) {
    if (!host || host.dataset.obBound === '1') return;
    host.dataset.obBound = '1';
    host.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ob]');
      if (!b) return;
      var k = b.getAttribute('data-ob');
      if (k === 'home' && window.switchView) window.switchView('home', '#hero');
      if (k === 'secret' && window.openSecretList) window.openSecretList();
      if (k === 'wall' && window.openTransferWall) window.openTransferWall();
      if (k === 'search' && window.switchView) window.switchView('scopri', '#scopri-profili');
      if (k === 'msgs' && window.openUserMessages) window.openUserMessages();
      if (k === 'edit') {
        openObsEditModal(userObj());
      }
    });
  }

  function render(user) {
    user = user || userObj();
    if (!isObs(user)) return;
    hideOthers();
    var host = document.getElementById('es-staff-profile');
    var group = document.getElementById('user-dossier-view-group');
    if (!host) return;
    var box = document.getElementById('es-od');
    if (!box) {
      box = document.createElement('div');
      box.id = 'es-od';
      box.className = 'es-pd';
      host.insertBefore(box, host.firstChild);
    }
    box.innerHTML = html(user);
    fillExtra(box, user);
    box.hidden = false;
    box.removeAttribute('hidden');
    box.style.display = 'grid';
    host.classList.add('es-obs-on');
    host.classList.remove('es-pd-on', 'es-ds-on', 'es-pres-on', 'es-vice-on', 'es-fisio-on', 'es-ma-on', 'es-med-on', 'es-tm-on', 'es-gk-on', 'es-at-on', 'es-yg-on');
    if (group) {
      group.classList.add('is-obs-dash');
      group.classList.remove('is-coach-dash', 'is-ds-dash', 'is-pres-dash', 'is-vice-dash', 'is-fisio-dash', 'is-ma-dash', 'is-med-dash', 'is-tm-dash', 'is-gk-dash', 'is-at-dash', 'is-yg-dash');
    }
    bind(host);
  }

  window.EliseeObsDash = {
    render: render,
    isObs: isObs,
    underContract: underContract,
    qualificaOf: qualificaOf
  };

  document.addEventListener('elisee:view-changed', function (e) {
    var d = e && e.detail;
    if (d && d.view === 'user-dossier') {
      try {
        var u = userObj();
        if (isObs(u)) render(u);
      } catch (_) {}
    }
  });
})();
