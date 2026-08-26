/* ============================================================
   ELISEE SCOUT — Area Vice Allenatore (Mister Hub)
   5 Macro-aree Attive: CLUB | SQUADRA | ALLENAMENTI | PARTITE | LAVAGNA
   Incluso: Editor Lavagna Tattica, Salvataggio Schemi & Import PDF/JPG/PNG
   ============================================================ */
(function () {
  'use strict';

  var activeTab = 'lavagna'; // default o club | squadra | allenamenti | partite | lavagna
  var currentPitchType = 'full';
  var currentElemSize = 'M';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function userObj() {
    try {
      return JSON.parse(localStorage.getItem('elisee_active_user') || localStorage.getItem('elisee_user_data') || '{}') || {};
    } catch (_) { return {}; }
  }

  function isVice(u) {
    u = u || userObj();
    var blob = [u.staffRole, u.ruoloDettagliato, u.ruolo, u.role, u.siteRoleFamily, u.staffProfile && u.staffProfile.fieldRole]
      .filter(Boolean).join(' ').toLowerCase();
    return /allenatore in seconda|vice allenatore/.test(blob);
  }

  function getViceData() {
    var u = userObj();
    var def = {
      clubName: u.squadra || u.club || 'Foggia',
      matricola: u.matricola || '13923 / FIGC',
      sede: u.sede || 'Viale Giuseppe Mazzini, 35/C Foggia FG',
      stadio: u.stadio || 'Stadio Comunale Pino Zaccheria',
      telefono: u.telefono || '+39 0881 742911',
      viceName: (u.nome ? (u.nome + ' ' + (u.cognome || '')) : (u.name || 'Vice Allenatore')).trim(),
      viceRole: 'Vice Allenatore / Collaboratore Tecnico (UEFA B)',
      viceDoc: 'Verificato',
      viceTessera: 'FIGC-882310',
      viceScadenza: '30/06/2027',
      logoUrl: 'immagini/squadre-loghi/foggia.png',
      teamPhotoUrl: 'immagini/04-workspace-scout/scout-workspace.svg?v=20260730_225504',
      roster: [
        { num: 1, name: 'Marco Fumagalli', role: 'Portiere', birth: '2001', cert: 'Regolare', status: 'disp', app: 26 },
        { num: 2, name: 'Alessandro Silvestro', role: 'Terzino Destro', birth: '2002', cert: 'Regolare', status: 'disp', app: 24 },
        { num: 5, name: 'Luigi Carillo', role: 'Difensore Centrale', birth: '1996', cert: 'Regolare', status: 'disp', app: 28 },
        { num: 6, name: 'Davide Di Pasquale', role: 'Difensore Centrale', birth: '1996', cert: 'Regolare', status: 'disp', app: 25 },
        { num: 3, name: 'Luca Rizzo Pinna', role: 'Terzino Sinistro', birth: '2003', cert: 'Regolare', status: 'disp', app: 22 },
        { num: 8, name: 'Moses Odjer', role: 'Mediano', birth: '1996', cert: 'Regolare', status: 'disp', app: 27 },
        { num: 4, name: 'Jacopo Petermann', role: 'Regista', birth: '1994', cert: 'Regolare', status: 'disp', app: 25 },
        { num: 10, name: 'Diego Peralta', role: 'Trequartista', birth: '1996', cert: 'Regolare', status: 'disp', app: 28 },
        { num: 7, name: 'Eliseo Miraglia', role: 'Ala Sinistra', birth: '2004', cert: 'Regolare', status: 'disp', app: 28 },
        { num: 11, name: 'Roberto Ogunseye', role: 'Attaccante Centrale', birth: '1995', cert: 'Regolare', status: 'disp', app: 26 },
        { num: 9, name: 'Alexis Ferrante', role: 'Seconda Punta', birth: '1995', cert: 'Regolare', status: 'disp', app: 24 }
      ],
      allenamenti: [
        { id: 'all-1', date: 'Oggi · 15:30', title: 'Seduta Tattica &amp; Pressione Alta', focus: 'Riscaldamento a secco, possesso palla 6v6+2, sviluppo catena laterale e partitella 11v11.', presenze: '21 / 22 Presenti' },
        { id: 'all-2', date: 'Domani · 10:00', title: 'Fase Difensiva &amp; Palle Inattive', focus: 'Marcatura a zona su corner avversari, calci di punizione a favore, reattività e rapidità su 10m.', presenze: 'Programmato' }
      ],
      partite: [
        { id: 'match-1', date: 'Domenica · Ore 15:00', opponent: 'Foggia vs Taranto', comp: 'Campionato Serie D · Girone H', stadium: 'Stadio Pino Zaccheria', status: 'Prossima Gara', conv: '22 Convocati' }
      ],
      tacticalSchemes: [
        {
          id: 'tac-1',
          title: 'Contributo Tattico: Sviluppo Catena Dx',
          date: '26/08/2026',
          type: 'Lavagna Tattica',
          preview: 'immagini/04-workspace-scout/scout-workspace.svg?v=20260730_225504'
        },
        {
          id: 'tac-2',
          title: 'Pressing Ultra-Offensivo & Transizioni',
          date: '24/08/2026',
          type: 'Sedute di Campo',
          preview: 'immagini/squadre-loghi/foggia.png'
        }
      ]
    };

    try {
      var stored = localStorage.getItem('elisee_vice_hub_data');
      if (stored) return Object.assign(def, JSON.parse(stored));
    } catch (_) {}
    return def;
  }

  function saveViceData(data) {
    try {
      localStorage.setItem('elisee_vice_hub_data', JSON.stringify(data));
    } catch (_) {}
  }

  var TAB_DESCS = {
    club: 'Organizzazione societaria, dirigenti e staff tecnico.',
    squadra: 'Gestione della rosa, ruoli e dati dei giocatori.',
    allenamenti: 'Pianificazione e gestione degli allenamenti stagionali.',
    partite: 'Calendario, convocazioni e gestione delle partite.',
    lavagna: 'Strumenti tattici per schemi, analisi e strategie.'
  };

  function renderHub() {
    var mount = document.getElementById('es-vd');
    if (!mount) return;

    var data = getViceData();

    var html =
      '<div class="es-mister-hub">' +
        // Top Trial / VIP bar
        '<div class="es-mister-trial-bar">' +
          '<div class="es-mister-trial-text">' +
            '<span>⚠️</span> Stai utilizzando la versione prova Mister (Vice) con funzionalità dedicate.' +
          '</div>' +
          '<button type="button" class="es-mister-btn-sub" onclick="if(window.openAccessoModal){ window.openAccessoModal(\'email\'); } else if(window.showToast){ window.showToast(\'🌟 Abbonamento Staff Tecnico VIP attivo per il tuo account.\', \'success\'); }">Abbonati</button>' +
        '</div>' +

        '<div class="es-mister-wrap">' +
          // Header Club Banner
          '<div class="es-mister-club-header">' +
            '<div class="es-mister-club-main">' +
              '<div class="es-mister-crest-badge">' +
                '<img src="' + esc(data.logoUrl) + '" alt="' + esc(data.clubName) + '" onerror="this.src=\'immagini/squadre-loghi/napoli.png\';">' +
              '</div>' +
              '<div>' +
                '<div class="es-mister-club-tags">' +
                  '<span class="es-mister-tag es-mister-tag-primary">PRIMA SQUADRA</span>' +
                  '<span class="es-mister-tag es-mister-tag-dark">Stagione in corso</span>' +
                  '<span class="es-mister-tag es-mister-tag-gold">Vice Allenatore | Staff Tecnico</span>' +
                '</div>' +
                '<h1 class="es-mister-club-title">' + esc(data.clubName) + '</h1>' +
                '<p class="es-mister-club-desc" id="vice-tab-desc">' + esc(TAB_DESCS[activeTab]) + '</p>' +
              '</div>' +
            '</div>' +
          '</div>' +

          // 5 Nav Tabs
          '<nav class="es-mister-nav-bar" role="tablist">' +
            '<button type="button" class="es-mister-nav-tab ' + (activeTab === 'club' ? 'is-active' : '') + '" data-tab="club">🛡️ Club</button>' +
            '<button type="button" class="es-mister-nav-tab ' + (activeTab === 'squadra' ? 'is-active' : '') + '" data-tab="squadra">👥 Squadra</button>' +
            '<button type="button" class="es-mister-nav-tab ' + (activeTab === 'allenamenti' ? 'is-active' : '') + '" data-tab="allenamenti">🏃‍♂️ Allenamenti</button>' +
            '<button type="button" class="es-mister-nav-tab ' + (activeTab === 'partite' ? 'is-active' : '') + '" data-tab="partite">⚽ Partite</button>' +
            '<button type="button" class="es-mister-nav-tab ' + (activeTab === 'lavagna' ? 'is-active' : '') + '" data-tab="lavagna">🖌️ Lavagna</button>' +
          '</nav>' +

          // Content Tab Container
          '<div id="vice-tab-content">' +
            renderTabContent(activeTab, data) +
          '</div>' +

        '</div>' +
      '</div>';

    mount.innerHTML = html;
    bindHubEvents();
  }

  function renderTabContent(tab, data) {
    if (tab === 'club') {
      return (
        '<div class="es-mister-card-white">' +
          '<div class="es-mister-card-header">' +
            '<div class="es-mister-card-title-wrap">' +
              '<span class="es-mister-card-icon">🛡️</span>' +
              '<div><h3 class="es-mister-card-title">Club</h3><p class="es-mister-card-sub">Dati società e impianto sportivo</p></div>' +
            '</div>' +
            '<button type="button" class="es-mister-circle-btn" id="btn-edit-club-data">✏️</button>' +
          '</div>' +
          '<table class="es-mister-info-table">' +
            '<tr><th>SOCIETÀ</th><td>' + esc(data.clubName) + ' (Admin-716)</td></tr>' +
            '<tr><th>MATRICOLA</th><td>' + esc(data.matricola) + '</td></tr>' +
            '<tr><th>SEDE</th><td>' + esc(data.sede) + '</td></tr>' +
            '<tr><th>STADIO</th><td>' + esc(data.stadio) + '</td></tr>' +
            '<tr><th>TELEFONO</th><td>' + esc(data.telefono) + '</td></tr>' +
          '</table>' +
        '</div>' +
        '<div class="es-mister-card-white">' +
          '<div class="es-mister-card-header">' +
            '<div class="es-mister-card-title-wrap">' +
              '<span class="es-mister-card-icon">🖼️</span>' +
              '<div><h3 class="es-mister-card-title">Immagini</h3><p class="es-mister-card-sub">Stemma e foto squadra</p></div>' +
            '</div>' +
          '</div>' +
          '<div class="es-mister-images-grid">' +
            '<div class="es-mister-img-box">' +
              '<div class="es-mister-img-preview"><img src="' + esc(data.logoUrl) + '" alt="Stemma"></div>' +
              '<div style="display:flex; align-items:center; justify-content:space-between; margin-top:0.4rem;"><span style="font-weight:800; font-size:0.88rem;">Stemma</span><button type="button" class="es-mister-circle-btn" style="width:30px; height:30px; font-size:0.85rem;" onclick="if(window.showToast){ window.showToast(\'🖼️ Modifica stemma aperto\', \'info\'); }">✏️</button></div>' +
            '</div>' +
            '<div class="es-mister-img-box">' +
              '<div class="es-mister-img-preview"><img src="' + esc(data.teamPhotoUrl) + '" alt="Foto squadra"></div>' +
              '<div style="display:flex; align-items:center; justify-content:space-between; margin-top:0.4rem;"><span style="font-weight:800; font-size:0.88rem;">Foto squadra</span><button type="button" class="es-mister-circle-btn" style="width:30px; height:30px; font-size:0.85rem;" onclick="if(window.showToast){ window.showToast(\'📷 Modifica foto squadra aperto\', \'info\'); }">✏️</button></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="es-mister-card-white">' +
          '<div class="es-mister-card-header">' +
            '<div class="es-mister-card-title-wrap"><span class="es-mister-card-icon">⏱️</span><div><h3 class="es-mister-card-title">Staff tecnico</h3><p class="es-mister-card-sub">Allenatori e collaboratori tecnici</p></div></div>' +
            '<button type="button" class="es-mister-circle-btn" id="btn-add-staff">+</button>' +
          '</div>' +
          '<div class="es-mister-staff-box">' +
            '<div class="es-mister-staff-left">' +
              '<div class="es-mister-staff-avatar">👤</div>' +
              '<div><h4 class="es-mister-staff-name">' + esc(data.viceName) + '</h4><div class="es-mister-staff-role">' + esc(data.viceRole) + '</div><div class="es-mister-staff-meta"><span>Doc: <b>' + esc(data.viceDoc) + '</b></span><span>Tessera: <b>' + esc(data.viceTessera) + '</b></span><span>Scad. cert.: <b>' + esc(data.viceScadenza) + '</b></span></div></div>' +
            '</div>' +
            '<button type="button" class="es-mister-circle-btn" style="width:34px; height:34px; font-size:0.9rem;">✏️</button>' +
          '</div>' +
        '</div>'
      );
    }

    if (tab === 'squadra') {
      var playersHtml = (data.roster || []).map(function (p, idx) {
        return (
          '<div class="es-mister-player-card">' +
            '<div class="es-mister-player-num">' + p.num + '</div>' +
            '<div class="es-mister-player-info">' +
              '<h4 class="es-mister-player-name">' + esc(p.name) + '</h4>' +
              '<div class="es-mister-player-role">' + esc(p.role) + ' · Anno ' + esc(p.birth) + '</div>' +
              '<div style="font-size:0.72rem; color:#64748b;">🟢 Disponibile · ' + p.app + ' Presenze</div>' +
            '</div>' +
            '<button type="button" class="es-mister-circle-btn" style="width:30px; height:30px; font-size:0.8rem;" data-edit-player="' + idx + '">✏️</button>' +
          '</div>'
        );
      }).join('');

      return (
        '<div class="es-mister-card-white">' +
          '<div class="es-mister-card-header">' +
            '<div class="es-mister-card-title-wrap"><span class="es-mister-card-icon">👥</span><div><h3 class="es-mister-card-title">Squadra</h3><p class="es-mister-card-sub">' + esc(data.clubName) + ' · Prima Squadra (' + (data.roster || []).length + ' Giocatori in rosa)</p></div></div>' +
            '<div class="es-mister-card-actions">' +
              '<button type="button" class="es-mister-circle-btn" id="btn-stats-roster">📊</button>' +
              '<button type="button" class="es-mister-circle-btn" id="btn-add-player">+</button>' +
            '</div>' +
          '</div>' +
          '<div class="es-mister-roster-grid">' + playersHtml + '</div>' +
        '</div>'
      );
    }

    if (tab === 'allenamenti') {
      var allHtml = (data.allenamenti || []).map(function (a) {
        return (
          '<div class="es-mister-event-card">' +
            '<div class="es-mister-event-date-badge">' + a.date + '</div>' +
            '<div class="es-mister-event-details"><h4 class="es-mister-event-title">' + a.title + '</h4><p class="es-mister-event-sub">' + a.focus + '</p><div style="font-size:0.75rem; color:#0d9488; font-weight:700; margin-top:0.3rem;">📋 Presenze: ' + a.presenze + '</div></div>' +
            '<button type="button" class="es-mister-circle-btn" style="width:34px; height:34px; font-size:0.85rem;">📝</button>' +
          '</div>'
        );
      }).join('');

      return (
        '<div class="es-mister-card-white">' +
          '<div class="es-mister-card-header">' +
            '<div class="es-mister-card-title-wrap"><span class="es-mister-card-icon">🏃‍♂️</span><div><h3 class="es-mister-card-title">Allenamenti</h3><p class="es-mister-card-sub">' + esc(data.clubName) + ' · Prima Squadra</p></div></div>' +
            '<div class="es-mister-card-actions">' +
              '<button type="button" class="es-mister-circle-btn" id="btn-stats-train">📊</button>' +
              '<button type="button" class="es-mister-circle-btn" id="btn-add-training">+</button>' +
            '</div>' +
          '</div>' +
          '<div style="margin-top:1rem;">' + allHtml + '</div>' +
        '</div>'
      );
    }

    if (tab === 'partite') {
      var matchHtml = (data.partite || []).map(function (m) {
        return (
          '<div class="es-mister-event-card">' +
            '<div class="es-mister-event-date-badge">' + m.date + '</div>' +
            '<div class="es-mister-event-details"><h4 class="es-mister-event-title">' + m.opponent + '</h4><p class="es-mister-event-sub">' + m.comp + ' · 🏟️ ' + m.stadium + '</p><div style="font-size:0.75rem; color:#0284c7; font-weight:700; margin-top:0.3rem;">⚽ ' + m.status + ' (' + m.conv + ')</div></div>' +
            '<button type="button" class="es-mister-circle-btn" style="width:34px; height:34px; font-size:0.85rem;">📋</button>' +
          '</div>'
        );
      }).join('');

      return (
        '<div class="es-mister-card-white">' +
          '<div class="es-mister-card-header">' +
            '<div class="es-mister-card-title-wrap"><span class="es-mister-card-icon">⚽</span><div><h3 class="es-mister-card-title">Partite</h3><p class="es-mister-card-sub">' + esc(data.clubName) + ' · Prima Squadra</p></div></div>' +
            '<div class="es-mister-card-actions">' +
              '<button type="button" class="es-mister-circle-btn" id="btn-stats-match">📊</button>' +
              '<button type="button" class="es-mister-circle-btn" id="btn-add-match">+</button>' +
            '</div>' +
          '</div>' +
          '<div style="margin-top:1rem;">' + matchHtml + '</div>' +
        '</div>'
      );
    }

    if (tab === 'lavagna') {
      var schemes = data.tacticalSchemes || [];
      var galleryHtml = schemes.length === 0
        ? '<div style="text-align:center; padding:2rem; color:#94a3b8; font-weight:600;">Nessuna immagine o schema salvato.<br>Clicca su "Crea immagine" o "Carica immagine / PDF" in alto per iniziare.</div>'
        : ('<div class="es-tactical-gallery-grid">' +
            schemes.map(function (s, idx) {
              return (
                '<div class="es-tactical-card-item">' +
                  '<div class="es-tactical-card-thumb">' +
                    '<img src="' + esc(s.preview) + '" alt="' + esc(s.title) + '">' +
                  '</div>' +
                  '<h4 style="font-size:0.95rem; font-weight:800; color:#0f172a; margin:0 0 0.2rem;">' + esc(s.title) + '</h4>' +
                  '<div style="font-size:0.75rem; color:#64748b; margin-bottom:0.75rem;">' + esc(s.type) + ' · ' + esc(s.date) + '</div>' +
                  '<div style="display:flex; gap:0.4rem;">' +
                    '<button type="button" class="btn btn-outline-pill" style="padding:0.3rem 0.65rem; font-size:0.75rem;" onclick="window.viewViceSchemePreview(' + idx + ')">👁️ Apri</button>' +
                    '<button type="button" class="btn btn-outline-pill" style="padding:0.3rem 0.65rem; font-size:0.75rem;" onclick="window.downloadViceSchemePDF(' + idx + ')">📥 PDF</button>' +
                    '<button type="button" class="btn btn-outline-pill" style="padding:0.3rem 0.65rem; font-size:0.75rem; color:#ef4444; border-color:#fca5a5;" onclick="window.deleteViceScheme(' + idx + ')">🗑️</button>' +
                  '</div>' +
                '</div>'
              );
            }).join('') +
          '</div>');

      return (
        '<div class="es-mister-card-white">' +
          '<div class="es-mister-card-header">' +
            '<div class="es-mister-card-title-wrap">' +
              '<span class="es-mister-card-icon">🖌️</span>' +
              '<div>' +
                '<h3 class="es-mister-card-title">Lavagna Tattica</h3>' +
                '<p class="es-mister-card-sub">' + esc(data.clubName) + ' · Prima Squadra (Vice Allenatore)</p>' +
              '</div>' +
            '</div>' +
            '<div class="es-mister-card-actions">' +
              '<input type="file" id="vice-file-upload" accept="image/png,image/jpeg,application/pdf" style="display:none;">' +
              '<button type="button" class="btn btn-outline-pill" id="btn-vice-upload-file" style="background:#f8fafc; border:1.5px solid #cbd5e1; color:#0f172a; padding:0.55rem 1.15rem; font-weight:800; font-size:0.85rem; display:inline-flex; align-items:center; gap:0.45rem;">' +
                '📁 Carica immagine / PDF' +
              '</button>' +
              '<button type="button" class="btn btn-outline-pill pf-btn-solid" id="btn-vice-create-tactic" style="background:#0d9488; color:#ffffff; border:none; padding:0.55rem 1.25rem; font-weight:800; font-size:0.85rem; display:inline-flex; align-items:center; gap:0.45rem;">' +
                '🖌️ Crea immagine' +
              '</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="es-mister-card-white">' +
          '<div class="es-mister-card-header" style="margin-bottom:0.6rem;">' +
            '<div>' +
              '<h3 class="es-mister-card-title" style="font-size:1.15rem;">Libreria immagini</h3>' +
              '<p class="es-mister-card-sub">Immagini create e salvate dalla lavagna tattica o caricate dal vice allenatore.</p>' +
            '</div>' +
          '</div>' +
          galleryHtml +
        '</div>'
      );
    }

    return '';
  }

  // Global methods for scheme gallery
  window.viewViceSchemePreview = function () {
    if (window.EliseeCoachDash && typeof window.EliseeCoachDash.openEditor === 'function') {
      window.EliseeCoachDash.openEditor();
    }
  };

  window.downloadViceSchemePDF = function (idx) {
    var data = getViceData();
    var s = (data.tacticalSchemes || [])[idx];
    if (s) {
      if (window.jspdf && window.jspdf.jsPDF) {
        var doc = new window.jspdf.jsPDF();
        doc.setFontSize(18);
        doc.text('ELISEE SCOUT — VICE ALLENATORE HUB', 14, 20);
        doc.setFontSize(14);
        doc.text('Schema: ' + s.title, 14, 30);
        doc.setFontSize(11);
        doc.text('Club: ' + data.clubName + ' | Vice: ' + data.viceName, 14, 40);
        doc.text('Data creazione: ' + s.date + ' | Categoria: ' + s.type, 14, 48);
        doc.save(s.title.replace(/\s+/g, '_') + '.pdf');
      }
      if (window.showToast) window.showToast('📥 Download PDF schema avviato!', 'success');
    }
  };

  window.deleteViceScheme = function (idx) {
    if (confirm('Vuoi eliminare questo schema dalla libreria?')) {
      var data = getViceData();
      data.tacticalSchemes.splice(idx, 1);
      saveViceData(data);
      renderHub();
      if (window.showToast) window.showToast('🗑️ Schema eliminato', 'info');
    }
  };

  function bindHubEvents() {
    var mount = document.getElementById('es-vd');
    if (!mount) return;

    // Tabs click
    mount.querySelectorAll('.es-mister-nav-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeTab = btn.getAttribute('data-tab');
        renderHub();
      });
    });

    // Crea Immagine -> Apri Editor
    var btnCreate = mount.querySelector('#btn-vice-create-tactic');
    if (btnCreate) {
      btnCreate.onclick = function () {
        if (window.EliseeCoachDash && typeof window.EliseeCoachDash.openEditor === 'function') {
          window.EliseeCoachDash.openEditor();
        }
      };
    }

    // Carica Immagine / PDF
    var btnUpload = mount.querySelector('#btn-vice-upload-file');
    var fileInput = mount.querySelector('#vice-file-upload');
    if (btnUpload && fileInput) {
      btnUpload.onclick = function () {
        fileInput.click();
      };
      fileInput.onchange = function (e) {
        var file = e.target.files && e.target.files[0];
        if (file) {
          var isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
          var reader = new FileReader();
          reader.onload = function (evt) {
            var data = getViceData();
            data.tacticalSchemes = data.tacticalSchemes || [];
            data.tacticalSchemes.unshift({
              id: 'tac-' + Date.now(),
              title: file.name.replace(/\.[^/.]+$/, ''),
              date: new Date().toLocaleDateString('it-IT'),
              type: isPdf ? 'Documento PDF' : 'Immagine Tattica',
              preview: isPdf ? 'immagini/04-workspace-scout/scout-workspace.svg?v=20260730_225504' : evt.target.result
            });
            saveViceData(data);
            renderHub();
            if (window.showToast) {
              window.showToast('✅ File ' + file.name + ' importato nella libreria immagini!', 'success');
            }
          };
          reader.readAsDataURL(file);
        }
      };
    }
  }

  function render(force) {
    var group = document.getElementById('user-dossier-view-group');
    if (!group) return;
    var u = userObj();
    if (!force && !isVice(u)) return;

    group.classList.add('is-vice-dash');
    var staffProfile = document.getElementById('es-staff-profile');
    if (!staffProfile) return;

    var vd = document.getElementById('es-vd');
    if (!vd) {
      vd = document.createElement('div');
      vd.id = 'es-vd';
      staffProfile.appendChild(vd);
    }
    vd.style.display = 'block';
    renderHub();
  }

  function detach() {
    var group = document.getElementById('user-dossier-view-group');
    if (group) group.classList.remove('is-vice-dash');
    var vd = document.getElementById('es-vd');
    if (vd) vd.remove();
  }

  window.EliseeViceDash = {
    render: render,
    detach: detach,
    setTab: function (tab) {
      activeTab = tab;
      renderHub();
    }
  };

  function boot() {
    document.addEventListener('elisee:role-changed', function () {
      if (isVice()) render(true);
      else detach();
    });
    document.addEventListener('elisee:auth-changed', function () {
      if (isVice()) render(true);
      else detach();
    });
    if (isVice()) render(true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
