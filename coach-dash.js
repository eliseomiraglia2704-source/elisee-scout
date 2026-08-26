/* ============================================================
   ELISEE SCOUT — Area Allenatore (Mister Hub)
   5 Macro-aree Attive: CLUB | SQUADRA | ALLENAMENTI | PARTITE | LAVAGNA
   Incluso: Editor Lavagna Tattica, Salvataggio Schemi & Import PDF/JPG/PNG
   ============================================================ */
(function () {
  'use strict';

  var activeTab = 'lavagna'; // default o club | squadra | allenamenti | partite | lavagna
  var currentPitchType = 'full'; // full | half-att | half-def | zones | 3d | cage
  var currentElemSize = 'M'; // S | M | L
  var currentColor = '#22c55e';
  var isDrawing = false;

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

  function isCoach(u) {
    u = u || userObj();
    var blob = [u.staffRole, u.ruoloDettagliato, u.ruolo, u.role, u.siteRoleFamily, u.staffProfile && u.staffProfile.fieldRole]
      .filter(Boolean).join(' ').toLowerCase();
    if (/in seconda|vice allenatore/.test(blob)) return false;
    return /allenatore|coach|mister/.test(blob);
  }

  function getCoachData() {
    var u = userObj();
    var def = {
      clubName: u.squadra || u.club || 'Foggia',
      matricola: u.matricola || '13923 / FIGC',
      sede: u.sede || 'Viale Giuseppe Mazzini, 35/C Foggia FG',
      stadio: u.stadio || 'Stadio Comunale Pino Zaccheria',
      telefono: u.telefono || '+39 0881 742911',
      coachName: (u.nome ? (u.nome + ' ' + (u.cognome || '')) : (u.name || 'Eliseo Miraglia')).trim(),
      coachRole: 'Allenatore (UEFA B / Pro)',
      coachDoc: 'Verificato',
      coachTessera: 'FIGC-741920',
      coachScadenza: '30/06/2027',
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
          title: 'Costruzione 3+2 & Pressione Alta',
          date: '26/08/2026',
          type: 'Lavagna Tattica',
          preview: 'immagini/04-workspace-scout/scout-workspace.svg?v=20260730_225504'
        },
        {
          id: 'tac-2',
          title: 'Schema Corner In-Swinger Primo Palo',
          date: '24/08/2026',
          type: 'Calci Piazzati',
          preview: 'immagini/squadre-loghi/foggia.png'
        }
      ]
    };

    try {
      var stored = localStorage.getItem('elisee_coach_hub_data');
      if (stored) return Object.assign(def, JSON.parse(stored));
    } catch (_) {}
    return def;
  }

  function saveCoachData(data) {
    try {
      localStorage.setItem('elisee_coach_hub_data', JSON.stringify(data));
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
    var mount = document.getElementById('es-cd');
    if (!mount) return;

    var data = getCoachData();

    var html =
      '<div class="es-mister-hub">' +
        // Top Trial / VIP bar
        '<div class="es-mister-trial-bar">' +
          '<div class="es-mister-trial-text">' +
            '<span>⚠️</span> Stai utilizzando la versione prova Mister con funzionalità limitate.' +
          '</div>' +
          '<button type="button" class="es-mister-btn-sub" onclick="if(window.openAccessoModal){ window.openAccessoModal(\'email\'); } else if(window.showToast){ window.showToast(\'🌟 Abbonamento Mister VIP attivo per il tuo account.\', \'success\'); }">Abbonati</button>' +
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
                  '<span class="es-mister-tag es-mister-tag-gold">Allenatore | Admin Club</span>' +
                '</div>' +
                '<h1 class="es-mister-club-title">' + esc(data.clubName) + '</h1>' +
                '<p class="es-mister-club-desc" id="mister-tab-desc">' + esc(TAB_DESCS[activeTab]) + '</p>' +
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
          '<div id="mister-tab-content">' +
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
              '<div><h4 class="es-mister-staff-name">' + esc(data.coachName) + '</h4><div class="es-mister-staff-role">' + esc(data.coachRole) + '</div><div class="es-mister-staff-meta"><span>Doc: <b>' + esc(data.coachDoc) + '</b></span><span>Tessera: <b>' + esc(data.coachTessera) + '</b></span><span>Scad. cert.: <b>' + esc(data.coachScadenza) + '</b></span></div></div>' +
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
                    '<button type="button" class="btn btn-outline-pill" style="padding:0.3rem 0.65rem; font-size:0.75rem;" onclick="window.viewSchemePreview(' + idx + ')">👁️ Apri</button>' +
                    '<button type="button" class="btn btn-outline-pill" style="padding:0.3rem 0.65rem; font-size:0.75rem;" onclick="window.downloadSchemePDF(' + idx + ')">📥 PDF</button>' +
                    '<button type="button" class="btn btn-outline-pill" style="padding:0.3rem 0.65rem; font-size:0.75rem; color:#ef4444; border-color:#fca5a5;" onclick="window.deleteScheme(' + idx + ')">🗑️</button>' +
                  '</div>' +
                '</div>'
              );
            }).join('') +
          '</div>');

      return (
        // Header Card Lavagna
        '<div class="es-mister-card-white">' +
          '<div class="es-mister-card-header">' +
            '<div class="es-mister-card-title-wrap">' +
              '<span class="es-mister-card-icon">🖌️</span>' +
              '<div>' +
                '<h3 class="es-mister-card-title">Lavagna Tattica</h3>' +
                '<p class="es-mister-card-sub">' + esc(data.clubName) + ' · Prima Squadra</p>' +
              '</div>' +
            '</div>' +
            '<div class="es-mister-card-actions">' +
              '<input type="file" id="mister-file-upload" accept="image/png,image/jpeg,application/pdf" style="display:none;">' +
              '<button type="button" class="btn btn-outline-pill" id="btn-upload-file" style="background:#f8fafc; border:1.5px solid #cbd5e1; color:#0f172a; padding:0.55rem 1.15rem; font-weight:800; font-size:0.85rem; display:inline-flex; align-items:center; gap:0.45rem;">' +
                '📁 Carica immagine / PDF' +
              '</button>' +
              '<button type="button" class="btn btn-outline-pill pf-btn-solid" id="btn-create-tactic" style="background:#0d9488; color:#ffffff; border:none; padding:0.55rem 1.25rem; font-weight:800; font-size:0.85rem; display:inline-flex; align-items:center; gap:0.45rem;">' +
                '🖌️ Crea immagine' +
              '</button>' +
            '</div>' +
          '</div>' +
        '</div>' +

        // Card Libreria Immagini
        '<div class="es-mister-card-white">' +
          '<div class="es-mister-card-header" style="margin-bottom:0.6rem;">' +
            '<div>' +
              '<h3 class="es-mister-card-title" style="font-size:1.15rem;">Libreria immagini</h3>' +
              '<p class="es-mister-card-sub">Immagini create e salvate dalla lavagna tattica o caricate dal mister.</p>' +
            '</div>' +
          '</div>' +
          galleryHtml +
        '</div>'
      );
    }

    return '';
  }

  // ============================================================
  // FULLSCREEN TACTICAL EDITOR MODAL
  // ============================================================
  function openTacticalEditor() {
    var old = document.getElementById('es-tactical-editor');
    if (old) old.remove();

    var data = getCoachData();

    var modal = document.createElement('div');
    modal.id = 'es-tactical-editor';
    modal.className = 'es-tactical-editor-modal';
    modal.innerHTML =
      // Top Bar
      '<div class="es-tactical-top-bar">' +
        '<div class="es-tactical-title">Lavagna tattica</div>' +
        '<div class="es-tactical-size-ctrl">' +
          '<span class="es-tactical-size-label">Dimensione iniziale elementi</span>' +
          '<button type="button" class="es-tactical-size-pill ' + (currentElemSize === 'S' ? 'is-active' : '') + '" data-size="S">S</button>' +
          '<button type="button" class="es-tactical-size-pill ' + (currentElemSize === 'M' ? 'is-active' : '') + '" data-size="M">M</button>' +
          '<button type="button" class="es-tactical-size-pill ' + (currentElemSize === 'L' ? 'is-active' : '') + '" data-size="L">L</button>' +
        '</div>' +
        '<div style="display:flex; align-items:center;">' +
          '<button type="button" class="es-tactical-btn-use" id="btn-save-tactical-image">Usa immagine</button>' +
          '<button type="button" class="es-tactical-btn-close" id="btn-close-tactical-editor">&times;</button>' +
        '</div>' +
      '</div>' +

      // 3-Column Workspace
      '<div class="es-tactical-workspace">' +
        // Left Sidebar: Campi, Zone, Frecce, Porte, Tools
        '<div class="es-tactical-side-left">' +
          '<div class="es-tactical-color-row">' +
            '<div class="es-tactical-color-dot is-selected" style="background:#22c55e;" data-color="#22c55e"></div>' +
            '<div class="es-tactical-color-dot" style="background:#ef4444;" data-color="#ef4444"></div>' +
            '<div class="es-tactical-color-dot" style="background:#0284c7;" data-color="#0284c7"></div>' +
            '<div class="es-tactical-color-dot" style="background:#facc15;" data-color="#facc15"></div>' +
          '</div>' +

          '<div class="es-tactical-section-head"><span>CAMPI</span><span>-</span></div>' +
          '<div id="pitch-selectors">' +
            '<div class="es-tactical-pitch-thumb is-active" data-pitch="full" title="Campo Intero Orizzontale">' +
              '<div style="width:100%; height:100%; border:1.5px solid #fff; position:relative;"><div style="position:absolute; left:50%; top:0; bottom:0; width:1px; background:#fff;"></div><div style="position:absolute; left:50%; top:50%; width:16px; height:16px; border:1px solid #fff; border-radius:50%; transform:translate(-50%,-50%);"></div></div>' +
            '</div>' +
            '<div class="es-tactical-pitch-thumb" data-pitch="half-att" title="Mezzo Campo Attacco">' +
              '<div style="width:100%; height:100%; border:1.5px solid #fff; position:relative;"><div style="position:absolute; top:20%; bottom:20%; left:0; width:35%; border:1.5px solid #fff; border-left:none;"></div></div>' +
            '</div>' +
            '<div class="es-tactical-pitch-thumb" data-pitch="half-def" title="Mezzo Campo Difensivo">' +
              '<div style="width:100%; height:100%; border:1.5px solid #fff; position:relative;"><div style="position:absolute; top:20%; bottom:20%; right:0; width:35%; border:1.5px solid #fff; border-right:none;"></div></div>' +
            '</div>' +
            '<div class="es-tactical-pitch-thumb" data-pitch="zones" title="Campo a Zone / Corridoi">' +
              '<div style="width:100%; height:100%; border:1.5px solid #fff; display:grid; grid-template-columns:1fr 2fr 1fr;"><div style="border-right:1px dashed #fff;"></div><div></div><div style="border-left:1px dashed #fff;"></div></div>' +
            '</div>' +
            '<div class="es-tactical-pitch-thumb" data-pitch="cage" title="Gabbia / Partitella">' +
              '<div style="width:100%; height:100%; border:2px solid #fde047;"></div>' +
            '</div>' +
          '</div>' +

          '<div class="es-tactical-section-head" id="head-zones"><span>ZONE</span><span>+</span></div>' +
          '<div class="es-tactical-section-head" id="head-arrows"><span>FRECCE</span><span>+</span></div>' +
          '<div class="es-tactical-section-head" id="head-goals"><span>PORTE</span><span>+</span></div>' +
          '<div class="es-tactical-section-head" id="head-tools"><span>TOOLS</span><span>+</span></div>' +
        '</div>' +

        // Center Pitch Stage
        '<div class="es-tactical-center-stage">' +
          '<div class="es-tactical-canvas-wrap" id="editor-pitch-canvas">' +
            // Pitch markings SVG
            '<svg class="es-tactical-drawing-svg" viewBox="0 0 900 580" id="pitch-svg-lines">' +
              '<rect x="20" y="20" width="860" height="540" fill="none" stroke="#ffffff" stroke-width="3"/>' +
              '<line x1="450" y1="20" x2="450" y2="560" stroke="#ffffff" stroke-width="3"/>' +
              '<circle cx="450" cy="290" r="70" fill="none" stroke="#ffffff" stroke-width="3"/>' +
              '<circle cx="450" cy="290" r="4" fill="#ffffff"/>' +
              // Area sinistra
              '<rect x="20" y="140" width="130" height="300" fill="none" stroke="#ffffff" stroke-width="3"/>' +
              '<rect x="20" y="200" width="45" height="180" fill="none" stroke="#ffffff" stroke-width="3"/>' +
              '<circle cx="100" cy="290" r="3" fill="#ffffff"/>' +
              '<path d="M 150 230 A 70 70 0 0 1 150 350" fill="none" stroke="#ffffff" stroke-width="3"/>' +
              // Area destra
              '<rect x="750" y="140" width="130" height="300" fill="none" stroke="#ffffff" stroke-width="3"/>' +
              '<rect x="835" y="200" width="45" height="180" fill="none" stroke="#ffffff" stroke-width="3"/>' +
              '<circle cx="800" cy="290" r="3" fill="#ffffff"/>' +
              '<path d="M 750 230 A 70 70 0 0 0 750 350" fill="none" stroke="#ffffff" stroke-width="3"/>' +
            '</svg>' +

            // Draggable Interactive Pitch Elements (Pedine 1-11)
            '<div class="es-mister-piece is-gk" style="top:50%; left:7%;" data-num="1" title="Portiere">1</div>' +
            '<div class="es-mister-piece" style="top:22%; left:22%;" data-num="2">2</div>' +
            '<div class="es-mister-piece" style="top:40%; left:18%;" data-num="5">5</div>' +
            '<div class="es-mister-piece" style="top:60%; left:18%;" data-num="6">6</div>' +
            '<div class="es-mister-piece" style="top:78%; left:22%;" data-num="3">3</div>' +
            '<div class="es-mister-piece" style="top:50%; left:36%;" data-num="4">4</div>' +
            '<div class="es-mister-piece" style="top:32%; left:48%;" data-num="8">8</div>' +
            '<div class="es-mister-piece" style="top:68%; left:48%;" data-num="10">10</div>' +
            '<div class="es-mister-piece" style="top:22%; left:70%;" data-num="7">7</div>' +
            '<div class="es-mister-piece" style="top:50%; left:80%;" data-num="9">9</div>' +
            '<div class="es-mister-piece" style="top:78%; left:70%;" data-num="11">11</div>' +

            // Pallone
            '<div class="es-mister-piece" style="top:50%; left:45%; background:#ffffff; color:#000; border-color:#000; width:26px; height:26px; font-size:0.75rem;" title="Pallone">⚽</div>' +
          '</div>' +
        '</div>' +

        // Right Sidebar: Team, Giocatori, Numeri, Ruoli, Maglie
        '<div class="es-tactical-side-right">' +
          '<div class="es-tactical-color-row">' +
            '<div class="es-tactical-color-dot is-selected" style="background:#0d9488;" data-team-color="#0d9488"></div>' +
            '<div class="es-tactical-color-dot" style="background:#ef4444;" data-team-color="#ef4444"></div>' +
            '<div class="es-tactical-color-dot" style="background:#0284c7;" data-team-color="#0284c7"></div>' +
            '<div class="es-tactical-color-dot" style="background:#0f172a;" data-team-color="#0f172a"></div>' +
          '</div>' +

          '<div class="es-tactical-section-head"><span>TEAM</span><span>+</span></div>' +
          '<div class="es-tactical-section-head"><span>GIOCATORI</span><span>-</span></div>' +

          '<div id="player-silhouettes-list">' +
            '<div class="es-tactical-player-item" data-pose="corsa">🏃 Corsa</div>' +
            '<div class="es-tactical-player-item" data-pose="tiro">⚽ Tiro</div>' +
            '<div class="es-tactical-player-item" data-pose="passaggio">👟 Passaggio</div>' +
            '<div class="es-tactical-player-item" data-pose="contrasto">🛡️ Contrasto</div>' +
            '<div class="es-tactical-player-item" data-pose="portiere">🧤 Portiere</div>' +
          '</div>' +

          '<div class="es-tactical-section-head" id="head-numbers"><span>NUMERI</span><span>+</span></div>' +
          '<div class="es-tactical-section-head" id="head-roles"><span>RUOLI</span><span>+</span></div>' +
          '<div class="es-tactical-section-head" id="head-jerseys"><span>MAGLIE</span><span>+</span></div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);

    // Bind Close
    modal.querySelector('#btn-close-tactical-editor').onclick = function () {
      modal.remove();
    };

    // Bind Size Selectors S / M / L
    modal.querySelectorAll('.es-tactical-size-pill').forEach(function (pill) {
      pill.onclick = function () {
        modal.querySelectorAll('.es-tactical-size-pill').forEach(function (p) { p.classList.remove('is-active'); });
        pill.classList.add('is-active');
        currentElemSize = pill.getAttribute('data-size');
        var scale = currentElemSize === 'S' ? '28px' : (currentElemSize === 'L' ? '42px' : '34px');
        modal.querySelectorAll('.es-mister-piece').forEach(function (pc) {
          pc.style.width = scale;
          pc.style.height = scale;
        });
      };
    });

    // Bind Pitch Selectors
    modal.querySelectorAll('.es-tactical-pitch-thumb').forEach(function (thumb) {
      thumb.onclick = function () {
        modal.querySelectorAll('.es-tactical-pitch-thumb').forEach(function (t) { t.classList.remove('is-active'); });
        thumb.classList.add('is-active');
        currentPitchType = thumb.getAttribute('data-pitch');
        var wrap = modal.querySelector('#editor-pitch-canvas');
        if (currentPitchType === 'half-att') {
          wrap.style.background = 'linear-gradient(90deg, #15803d 0%, #14532d 100%)';
        } else if (currentPitchType === 'zones') {
          wrap.style.background = 'repeating-linear-gradient(90deg, #15803d, #15803d 100px, #166534 100px, #166534 200px)';
        } else {
          wrap.style.background = 'radial-gradient(circle at center, #15803d 0%, #166534 100%)';
        }
        if (window.showToast) window.showToast('🏟️ Layout campo aggiornato', 'info');
      };
    });

    // Drag & Drop interactive pieces in editor
    var canvas = modal.querySelector('#editor-pitch-canvas');
    bindCanvasDrag(canvas);

    // Click silhouette to spawn new player
    modal.querySelectorAll('.es-tactical-player-item').forEach(function (item) {
      item.onclick = function () {
        var pose = item.getAttribute('data-pose');
        var newPiece = document.createElement('div');
        newPiece.className = 'es-mister-piece';
        newPiece.style.top = '50%';
        newPiece.style.left = '50%';
        newPiece.style.background = '#0284c7';
        newPiece.style.color = '#ffffff';
        newPiece.textContent = pose === 'portiere' ? '🧤' : (pose === 'tiro' ? '⚡' : '🏃');
        canvas.appendChild(newPiece);
        bindCanvasDrag(canvas);
        if (window.showToast) window.showToast('👤 Elemento aggiunto alla lavagna', 'success');
      };
    });

    // Save Tactical Image Action
    modal.querySelector('#btn-save-tactical-image').onclick = function () {
      var schemeTitle = prompt('Titolo per questo schema tattico:', 'Schema Tattico ' + new Date().toLocaleDateString('it-IT'));
      if (schemeTitle) {
        var data = getCoachData();
        data.tacticalSchemes = data.tacticalSchemes || [];
        data.tacticalSchemes.unshift({
          id: 'tac-' + Date.now(),
          title: schemeTitle,
          date: new Date().toLocaleDateString('it-IT'),
          type: 'Lavagna Tattica',
          preview: 'immagini/04-workspace-scout/scout-workspace.svg?v=20260730_225504'
        });
        saveCoachData(data);
        modal.remove();
        renderHub();
        if (window.showToast) window.showToast('✅ Schema salvato nella libreria immagini!', 'success');
      }
    };
  }

  function bindCanvasDrag(container) {
    if (!container) return;
    var pieces = container.querySelectorAll('.es-mister-piece');
    pieces.forEach(function (p) {
      p.onpointerdown = function (e) {
        e.preventDefault();
        var rect = container.getBoundingClientRect();
        function onMove(ev) {
          var x = Math.max(4, Math.min(rect.width - 4, ev.clientX - rect.left));
          var y = Math.max(4, Math.min(rect.height - 4, ev.clientY - rect.top));
          p.style.left = ((x / rect.width) * 100).toFixed(1) + '%';
          p.style.top = ((y / rect.height) * 100).toFixed(1) + '%';
        }
        function onUp() {
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
        }
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
      };
    });
  }

  // Global methods for scheme gallery
  window.viewSchemePreview = function (idx) {
    var data = getCoachData();
    var s = (data.tacticalSchemes || [])[idx];
    if (s && window.showToast) {
      window.showToast('👁️ Visualizzazione schema: ' + s.title, 'info');
      openTacticalEditor();
    }
  };

  window.downloadSchemePDF = function (idx) {
    var data = getCoachData();
    var s = (data.tacticalSchemes || [])[idx];
    if (s) {
      if (window.jspdf && window.jspdf.jsPDF) {
        var doc = new window.jspdf.jsPDF();
        doc.setFontSize(18);
        doc.text('ELISEE SCOUT — MISTER HUB', 14, 20);
        doc.setFontSize(14);
        doc.text('Schema: ' + s.title, 14, 30);
        doc.setFontSize(11);
        doc.text('Club: ' + data.clubName + ' | Allenatore: ' + data.coachName, 14, 40);
        doc.text('Data creazione: ' + s.date + ' | Categoria: ' + s.type, 14, 48);
        doc.save(s.title.replace(/\s+/g, '_') + '.pdf');
      }
      if (window.showToast) window.showToast('📥 Download PDF schema avviato!', 'success');
    }
  };

  window.deleteScheme = function (idx) {
    if (confirm('Vuoi eliminare questo schema dalla libreria?')) {
      var data = getCoachData();
      data.tacticalSchemes.splice(idx, 1);
      saveCoachData(data);
      renderHub();
      if (window.showToast) window.showToast('🗑️ Schema eliminato', 'info');
    }
  };

  function bindHubEvents() {
    var mount = document.getElementById('es-cd');
    if (!mount) return;

    // Tabs click
    mount.querySelectorAll('.es-mister-nav-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeTab = btn.getAttribute('data-tab');
        renderHub();
      });
    });

    // Crea Immagine -> Apri Editor
    var btnCreateTactic = mount.querySelector('#btn-create-tactic');
    if (btnCreateTactic) {
      btnCreateTactic.onclick = openTacticalEditor;
    }

    // Carica Immagine / PDF
    var btnUpload = mount.querySelector('#btn-upload-file');
    var fileInput = mount.querySelector('#mister-file-upload');
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
            var data = getCoachData();
            data.tacticalSchemes = data.tacticalSchemes || [];
            data.tacticalSchemes.unshift({
              id: 'tac-' + Date.now(),
              title: file.name.replace(/\.[^/.]+$/, ''),
              date: new Date().toLocaleDateString('it-IT'),
              type: isPdf ? 'Documento PDF' : 'Immagine Tattica',
              preview: isPdf ? 'immagini/04-workspace-scout/scout-workspace.svg?v=20260730_225504' : evt.target.result
            });
            saveCoachData(data);
            renderHub();
            if (window.showToast) {
              window.showToast('✅ File ' + file.name + ' importato nella libreria immagini!', 'success');
            }
          };
          reader.readAsDataURL(file);
        }
      };
    }

    // Modifica dati Club
    var btnEditClub = mount.querySelector('#btn-edit-club-data');
    if (btnEditClub) {
      btnEditClub.onclick = function () {
        var data = getCoachData();
        var newSede = prompt('Modifica Sede Operativa:', data.sede);
        if (newSede != null) data.sede = newSede;
        var newStadio = prompt('Modifica Stadio Ufficiale:', data.stadio);
        if (newStadio != null) data.stadio = newStadio;
        saveCoachData(data);
        renderHub();
        if (window.showToast) window.showToast('✅ Dati Club salvati con successo!', 'success');
      };
    }
  }

  function render(force) {
    var group = document.getElementById('user-dossier-view-group');
    if (!group) return;
    var u = userObj();
    if (!force && !isCoach(u)) return;

    group.classList.add('is-coach-dash');
    var staffProfile = document.getElementById('es-staff-profile');
    if (!staffProfile) return;

    var cd = document.getElementById('es-cd');
    if (!cd) {
      cd = document.createElement('div');
      cd.id = 'es-cd';
      staffProfile.appendChild(cd);
    }
    cd.style.display = 'block';
    renderHub();
  }

  function detach() {
    var group = document.getElementById('user-dossier-view-group');
    if (group) group.classList.remove('is-coach-dash');
    var cd = document.getElementById('es-cd');
    if (cd) cd.remove();
  }

  window.EliseeCoachDash = {
    render: render,
    detach: detach,
    openEditor: openTacticalEditor,
    setTab: function (tab) {
      activeTab = tab;
      renderHub();
    }
  };

  function boot() {
    document.addEventListener('elisee:role-changed', function () {
      if (isCoach()) render(true);
      else detach();
    });
    document.addEventListener('elisee:auth-changed', function () {
      if (isCoach()) render(true);
      else detach();
    });
    if (isCoach()) render(true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
