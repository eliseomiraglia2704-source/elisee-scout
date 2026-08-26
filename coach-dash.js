/* ============================================================
   ELISEE SCOUT — Area Allenatore (Mister Hub)
   5 Macro-aree Attive: CLUB | SQUADRA | ALLENAMENTI | PARTITE | LAVAGNA
   Incluso: Gestione Allenamenti Interattivi con Like (Ci sono), Dislike (Non ci sono) & Modale Votanti
   ============================================================ */
(function () {
  'use strict';

  var activeTab = 'allenamenti'; // default o club | squadra | allenamenti | partite | lavagna
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
        { id: 'p-1', num: 1, name: 'Marco Fumagalli', role: 'Portiere', birth: '2001', cert: 'Regolare', status: 'disp', app: 26 },
        { id: 'p-2', num: 2, name: 'Alessandro Silvestro', role: 'Terzino Destro', birth: '2002', cert: 'Regolare', status: 'disp', app: 24 },
        { id: 'p-5', num: 5, name: 'Luigi Carillo', role: 'Difensore Centrale', birth: '1996', cert: 'Regolare', status: 'disp', app: 28 },
        { id: 'p-6', num: 6, name: 'Davide Di Pasquale', role: 'Difensore Centrale', birth: '1996', cert: 'Regolare', status: 'disp', app: 25 },
        { id: 'p-3', num: 3, name: 'Luca Rizzo Pinna', role: 'Terzino Sinistro', birth: '2003', cert: 'Regolare', status: 'disp', app: 22 },
        { id: 'p-8', num: 8, name: 'Moses Odjer', role: 'Mediano', birth: '1996', cert: 'Regolare', status: 'disp', app: 27 },
        { id: 'p-4', num: 4, name: 'Jacopo Petermann', role: 'Regista', birth: '1994', cert: 'Regolare', status: 'disp', app: 25 },
        { id: 'p-10', num: 10, name: 'Diego Peralta', role: 'Trequartista', birth: '1996', cert: 'Regolare', status: 'disp', app: 28 },
        { id: 'p-7', num: 7, name: 'Eliseo Miraglia', role: 'Ala Sinistra', birth: '2004', cert: 'Regolare', status: 'disp', app: 28 },
        { id: 'p-11', num: 11, name: 'Roberto Ogunseye', role: 'Attaccante Centrale', birth: '1995', cert: 'Regolare', status: 'disp', app: 26 },
        { id: 'p-9', num: 9, name: 'Alexis Ferrante', role: 'Seconda Punta', birth: '1995', cert: 'Regolare', status: 'disp', app: 24 }
      ],
      staffMembers: [
        { id: 'st-coach', name: 'Eliseo Miraglia', role: 'Allenatore' },
        { id: 'st-vice', name: 'Vice Allenatore', role: 'Vice Allenatore' },
        { id: 'st-prep', name: 'Luca Rossi', role: 'Preparatore Atletico' },
        { id: 'st-fisio', name: 'Antonio Gentile', role: 'Fisioterapista' },
        { id: 'st-analyst', name: 'Giuseppe Di Stefano', role: 'Match Analyst' }
      ],
      trainingsList: [
        {
          id: 'train-1',
          day: 'mar',
          date: '01/09',
          fullDate: 'Martedì 1 Settembre 2026',
          title: 'Allenamento',
          incontro: '-:-',
          inizio: '19:00',
          fine: '20:30',
          campo: 'Campo A - Stadio Pino Zaccheria',
          focus: 'Seduta Tattica & Pressione Alta',
          votes: {
            'p-1': { id: 'p-1', name: 'Marco Fumagalli', role: 'Portiere', vote: 'yes', isStaff: false },
            'p-7': { id: 'p-7', name: 'Eliseo Miraglia', role: 'Ala Sinistra', vote: 'yes', isStaff: false },
            'p-5': { id: 'p-5', name: 'Luigi Carillo', role: 'Difensore Centrale', vote: 'yes', isStaff: false },
            'p-2': { id: 'p-2', name: 'Alessandro Silvestro', role: 'Terzino Destro', vote: 'maybe', isStaff: false },
            'p-11': { id: 'p-11', name: 'Roberto Ogunseye', role: 'Attaccante Centrale', vote: 'no', isStaff: false },
            'st-prep': { id: 'st-prep', name: 'Luca Rossi', role: 'Preparatore Atletico', vote: 'yes', isStaff: true },
            'st-fisio': { id: 'st-fisio', name: 'Antonio Gentile', role: 'Fisioterapista', vote: 'yes', isStaff: true }
          }
        },
        {
          id: 'train-2',
          day: 'gio',
          date: '03/09',
          fullDate: 'Giovedì 3 Settembre 2026',
          title: 'Allenamento',
          incontro: '14:30',
          inizio: '15:00',
          fine: '17:00',
          campo: 'Campo B - Centro Sportivo',
          focus: 'Fase Difensiva & Palle Inattive',
          votes: {
            'p-7': { id: 'p-7', name: 'Eliseo Miraglia', role: 'Ala Sinistra', vote: 'yes', isStaff: false },
            'p-1': { id: 'p-1', name: 'Marco Fumagalli', role: 'Portiere', vote: 'yes', isStaff: false }
          }
        }
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
      // Sync shared trainings
      if (data.trainingsList) {
        localStorage.setItem('elisee_club_trainings_shared', JSON.stringify(data.trainingsList));
      }
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
            '<span>⚠️</span> Stai utilizzando la versione prova Mister con funzionalità dedicate.' +
          '</div>' +
          '<button type="button" class="es-mister-btn-sub" onclick="if(window.showToast){ window.showToast(\'🌟 Abbonamento Mister VIP attivo per il tuo account.\', \'success\'); }">Abbonati</button>' +
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
            '<div class="es-mister-card-title-wrap"><span class="es-mister-card-icon">🛡️</span><div><h3 class="es-mister-card-title">Club</h3><p class="es-mister-card-sub">Dati società e impianto sportivo</p></div></div>' +
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
            '<div class="es-mister-card-title-wrap"><span class="es-mister-card-icon">🖼️</span><div><h3 class="es-mister-card-title">Immagini</h3><p class="es-mister-card-sub">Stemma e foto squadra</p></div></div>' +
          '</div>' +
          '<div class="es-mister-images-grid">' +
            '<div class="es-mister-img-box"><div class="es-mister-img-preview"><img src="' + esc(data.logoUrl) + '" alt="Stemma"></div><div style="display:flex; align-items:center; justify-content:space-between; margin-top:0.4rem;"><span style="font-weight:800; font-size:0.88rem;">Stemma</span><button type="button" class="es-mister-circle-btn" style="width:30px; height:30px; font-size:0.85rem;" onclick="if(window.showToast){ window.showToast(\'🖼️ Modifica stemma aperto\', \'info\'); }">✏️</button></div></div>' +
            '<div class="es-mister-img-box"><div class="es-mister-img-preview"><img src="' + esc(data.teamPhotoUrl) + '" alt="Foto squadra"></div><div style="display:flex; align-items:center; justify-content:space-between; margin-top:0.4rem;"><span style="font-weight:800; font-size:0.88rem;">Foto squadra</span><button type="button" class="es-mister-circle-btn" style="width:30px; height:30px; font-size:0.85rem;" onclick="if(window.showToast){ window.showToast(\'📷 Modifica foto squadra aperto\', \'info\'); }">✏️</button></div></div>' +
          '</div>' +
        '</div>' +
        '<div class="es-mister-card-white">' +
          '<div class="es-mister-card-header">' +
            '<div class="es-mister-card-title-wrap"><span class="es-mister-card-icon">⏱️</span><div><h3 class="es-mister-card-title">Staff tecnico</h3><p class="es-mister-card-sub">Allenatori e collaboratori tecnici</p></div></div>' +
            '<button type="button" class="es-mister-circle-btn" id="btn-add-staff">+</button>' +
          '</div>' +
          '<div class="es-mister-staff-box">' +
            '<div class="es-mister-staff-left"><div class="es-mister-staff-avatar">👤</div><div><h4 class="es-mister-staff-name">' + esc(data.coachName) + '</h4><div class="es-mister-staff-role">' + esc(data.coachRole) + '</div><div class="es-mister-staff-meta"><span>Doc: <b>' + esc(data.coachDoc) + '</b></span><span>Tessera: <b>' + esc(data.coachTessera) + '</b></span><span>Scad. cert.: <b>' + esc(data.coachScadenza) + '</b></span></div></div></div>' +
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
            '<div class="es-mister-player-info"><h4 class="es-mister-player-name">' + esc(p.name) + '</h4><div class="es-mister-player-role">' + esc(p.role) + ' · Anno ' + esc(p.birth) + '</div><div style="font-size:0.72rem; color:#64748b;">🟢 Disponibile · ' + p.app + ' Presenze</div></div>' +
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
      var curUser = userObj();
      var myUserId = curUser.id || 'u-me';

      var trainCardsHtml = (data.trainingsList || []).map(function (t) {
        var v = t.votes || {};
        var yesCount = 0;
        var maybeCount = 0;
        var noCount = 0;

        Object.keys(v).forEach(function (k) {
          if (v[k].vote === 'yes') yesCount++;
          else if (v[k].vote === 'maybe') maybeCount++;
          else if (v[k].vote === 'no') noCount++;
        });

        var myVote = (v[myUserId] && v[myUserId].vote) || (v['p-7'] && v['p-7'].vote);

        return (
          '<div class="es-training-event-card" id="card-' + t.id + '">' +
            '<div class="es-training-head-banner">' +
              '<div class="es-training-date-block">' +
                '<div class="es-training-day-chip">' +
                  '<span class="es-training-day-txt">' + esc(t.day) + '</span>' +
                  '<span class="es-training-date-txt">' + esc(t.date) + '</span>' +
                '</div>' +
                '<div style="border-left:1.5px solid rgba(0,0,0,0.15); height:32px; margin:0 0.5rem;"></div>' +
                '<div>' +
                  '<h4 class="es-training-title-txt">' + esc(t.title) + '</h4>' +
                  '<div style="font-size:0.75rem; color:#092621; opacity:0.85;">' + esc(t.focus) + '</div>' +
                '</div>' +
              '</div>' +
              '<span style="font-size:1.4rem; font-weight:800; opacity:0.7;">&rsaquo;</span>' +
            '</div>' +

            '<div class="es-training-times-grid">' +
              '<div class="es-training-time-col">' +
                '<div class="es-training-time-val">' + esc(t.incontro) + '</div>' +
                '<div class="es-training-time-lbl">Incontro</div>' +
              '</div>' +
              '<div class="es-training-time-col">' +
                '<div class="es-training-time-val">' + esc(t.inizio) + '</div>' +
                '<div class="es-training-time-lbl">Inizio</div>' +
              '</div>' +
              '<div class="es-training-time-col">' +
                '<div class="es-training-time-val">' + esc(t.fine) + '</div>' +
                '<div class="es-training-time-lbl">Fine</div>' +
              '</div>' +
            '</div>' +

            '<div class="es-training-actions-bar">' +
              '<div class="es-training-vote-group">' +
                '<button type="button" class="es-training-vote-btn ' + (myVote === 'yes' ? 'is-voted-yes' : '') + '" data-train-id="' + t.id + '" data-vote-val="yes" title="Ci sono (Presente)">' +
                  '<span>👍</span> <span>' + yesCount + '</span>' +
                '</button>' +
                '<button type="button" class="es-training-vote-btn ' + (myVote === 'maybe' ? 'is-voted-maybe' : '') + '" data-train-id="' + t.id + '" data-vote-val="maybe" title="In forse">' +
                  '<span>❓</span> <span>' + maybeCount + '</span>' +
                '</button>' +
                '<button type="button" class="es-training-vote-btn ' + (myVote === 'no' ? 'is-voted-no' : '') + '" data-train-id="' + t.id + '" data-vote-val="no" title="Non ci sono (Assente)">' +
                  '<span>👎</span> <span>' + noCount + '</span>' +
                '</button>' +
              '</div>' +

              '<button type="button" class="es-training-participants-btn" data-open-voters-id="' + t.id + '" title="Vedi tutti coloro che hanno risposto">' +
                '👥' +
              '</button>' +
            '</div>' +
          '</div>'
        );
      }).join('');

      return (
        '<div class="es-mister-card-white">' +
          '<div class="es-mister-card-header">' +
            '<div class="es-mister-card-title-wrap">' +
              '<span class="es-mister-card-icon">🏃‍♂️</span>' +
              '<div><h3 class="es-mister-card-title">Prossimi Eventi &amp; Allenamenti</h3><p class="es-mister-card-sub">Gestione presenze del club (Like = Ci sono, Dislike = Non ci sono)</p></div>' +
            '</div>' +
            '<div class="es-mister-card-actions">' +
              '<button type="button" class="es-mister-circle-btn" id="btn-add-training" title="Programma nuovo allenamento">+</button>' +
            '</div>' +
          '</div>' +
          '<div style="margin-top:1rem;">' + trainCardsHtml + '</div>' +
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
  // MODALE VOTANTI / PARTECIPANTI (Icona 👥)
  // ============================================================
  function openVotersModal(trainId) {
    var old = document.getElementById('es-voters-modal-overlay');
    if (old) old.remove();

    var data = getCoachData();
    var train = (data.trainingsList || []).find(function (t) { return t.id === trainId; });
    if (!train) return;

    var votes = train.votes || {};
    var allClubMembers = [];

    // Giocatori
    (data.roster || []).forEach(function (p) {
      var v = votes[p.id] || { vote: 'pending' };
      allClubMembers.push({
        id: p.id,
        name: p.name,
        role: p.role,
        isStaff: false,
        vote: v.vote || 'pending'
      });
    });

    // Staff
    (data.staffMembers || []).forEach(function (st) {
      var v = votes[st.id] || { vote: 'pending' };
      allClubMembers.push({
        id: st.id,
        name: st.name,
        role: st.role,
        isStaff: true,
        vote: v.vote || 'pending'
      });
    });

    var yesList = allClubMembers.filter(function (m) { return m.vote === 'yes'; });
    var maybeList = allClubMembers.filter(function (m) { return m.vote === 'maybe'; });
    var noList = allClubMembers.filter(function (m) { return m.vote === 'no'; });
    var pendingList = allClubMembers.filter(function (m) { return m.vote === 'pending'; });

    var modal = document.createElement('div');
    modal.id = 'es-voters-modal-overlay';
    modal.className = 'es-pres-stats-modal';
    modal.innerHTML =
      '<div class="es-voters-modal-sheet" role="dialog" aria-modal="true">' +
        '<div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1rem;">' +
          '<div>' +
            '<h3 style="font-size:1.3rem; font-weight:900; color:#0f172a; margin:0;">Partecipanti Allenamento</h3>' +
            '<p style="font-size:0.85rem; color:#64748b; margin:0.15rem 0 0;">' + esc(train.fullDate) + ' · Ore ' + esc(train.inizio) + '</p>' +
          '</div>' +
          '<button type="button" class="es-tactical-btn-close" id="btn-close-voters" style="font-size:1.6rem; cursor:pointer;">&times;</button>' +
        '</div>' +

        '<div class="es-voters-tabs-row">' +
          '<button type="button" class="es-voters-tab is-active" data-vfilter="all">Tutti (' + allClubMembers.length + ')</button>' +
          '<button type="button" class="es-voters-tab" data-vfilter="yes">👍 Ci sono (' + yesList.length + ')</button>' +
          '<button type="button" class="es-voters-tab" data-vfilter="maybe">❓ In forse (' + maybeList.length + ')</button>' +
          '<button type="button" class="es-voters-tab" data-vfilter="no">👎 Non ci sono (' + noList.length + ')</button>' +
          '<button type="button" class="es-voters-tab" data-vfilter="pending">⏳ In attesa (' + pendingList.length + ')</button>' +
        '</div>' +

        '<div class="es-voters-list" id="voters-list-container">' +
          renderVotersList(allClubMembers) +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);

    function close() { modal.remove(); }
    modal.querySelector('#btn-close-voters').onclick = close;
    modal.onclick = function (e) { if (e.target === modal) close(); };

    modal.querySelectorAll('.es-voters-tab').forEach(function (tabBtn) {
      tabBtn.onclick = function () {
        modal.querySelectorAll('.es-voters-tab').forEach(function (b) { b.classList.remove('is-active'); });
        tabBtn.classList.add('is-active');
        var f = tabBtn.getAttribute('data-vfilter');
        var filtered = f === 'all' ? allClubMembers : allClubMembers.filter(function (m) { return m.vote === f; });
        modal.querySelector('#voters-list-container').innerHTML = renderVotersList(filtered);
      };
    });
  }

  function renderVotersList(members) {
    if (members.length === 0) {
      return '<div style="text-align:center; padding:1.5rem; color:#94a3b8; font-weight:600;">Nessun membro in questa categoria.</div>';
    }
    return members.map(function (m) {
      var badge = m.vote === 'yes'
        ? '<span class="es-voter-badge is-yes">👍 Ci sono</span>'
        : (m.vote === 'maybe'
          ? '<span class="es-voter-badge is-maybe">❓ In forse</span>'
          : (m.vote === 'no'
            ? '<span class="es-voter-badge is-no">👎 Non ci sono</span>'
            : '<span class="es-voter-badge is-pending">⏳ In attesa</span>'));

      var ava = (m.name || 'A').charAt(0).toUpperCase();

      return (
        '<div class="es-voter-item">' +
          '<div class="es-voter-info">' +
            '<div class="es-voter-avatar">' + ava + '</div>' +
            '<div>' +
              '<h5 class="es-voter-name">' + esc(m.name) + (m.isStaff ? ' <small style="color:#0d9488; font-weight:800;">[Staff]</small>' : '') + '</h5>' +
              '<div class="es-voter-role">' + esc(m.role) + '</div>' +
            '</div>' +
          '</div>' +
          '<div>' + badge + '</div>' +
        '</div>'
      );
    }).join('');
  }

  // ============================================================
  // FULLSCREEN TACTICAL EDITOR
  // ============================================================
  function openTacticalEditor() {
    var old = document.getElementById('es-tactical-editor');
    if (old) old.remove();

    var modal = document.createElement('div');
    modal.id = 'es-tactical-editor';
    modal.className = 'es-tactical-editor-modal';
    modal.innerHTML =
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
      '<div class="es-tactical-workspace">' +
        '<div class="es-tactical-side-left">' +
          '<div class="es-tactical-color-row">' +
            '<div class="es-tactical-color-dot is-selected" style="background:#22c55e;" data-color="#22c55e"></div>' +
            '<div class="es-tactical-color-dot" style="background:#ef4444;" data-color="#ef4444"></div>' +
            '<div class="es-tactical-color-dot" style="background:#0284c7;" data-color="#0284c7"></div>' +
            '<div class="es-tactical-color-dot" style="background:#facc15;" data-color="#facc15"></div>' +
          '</div>' +
          '<div class="es-tactical-section-head"><span>CAMPI</span><span>-</span></div>' +
          '<div id="pitch-selectors">' +
            '<div class="es-tactical-pitch-thumb is-active" data-pitch="full" title="Campo Intero Orizzontale"><div style="width:100%; height:100%; border:1.5px solid #fff; position:relative;"><div style="position:absolute; left:50%; top:0; bottom:0; width:1px; background:#fff;"></div><div style="position:absolute; left:50%; top:50%; width:16px; height:16px; border:1px solid #fff; border-radius:50%; transform:translate(-50%,-50%);"></div></div></div>' +
            '<div class="es-tactical-pitch-thumb" data-pitch="half-att" title="Mezzo Campo Attacco"><div style="width:100%; height:100%; border:1.5px solid #fff; position:relative;"><div style="position:absolute; top:20%; bottom:20%; left:0; width:35%; border:1.5px solid #fff; border-left:none;"></div></div></div>' +
            '<div class="es-tactical-pitch-thumb" data-pitch="half-def" title="Mezzo Campo Difesa"><div style="width:100%; height:100%; border:1.5px solid #fff; position:relative;"><div style="position:absolute; top:20%; bottom:20%; right:0; width:35%; border:1.5px solid #fff; border-right:none;"></div></div></div>' +
            '<div class="es-tactical-pitch-thumb" data-pitch="zones" title="Campo a Zone"><div style="width:100%; height:100%; border:1.5px solid #fff; display:grid; grid-template-columns:1fr 2fr 1fr;"><div style="border-right:1px dashed #fff;"></div><div></div><div style="border-left:1px dashed #fff;"></div></div></div>' +
          '</div>' +
          '<div class="es-tactical-section-head"><span>ZONE</span><span>+</span></div>' +
          '<div class="es-tactical-section-head"><span>FRECCE</span><span>+</span></div>' +
          '<div class="es-tactical-section-head"><span>PORTE</span><span>+</span></div>' +
          '<div class="es-tactical-section-head"><span>TOOLS</span><span>+</span></div>' +
        '</div>' +
        '<div class="es-tactical-center-stage">' +
          '<div class="es-tactical-canvas-wrap" id="editor-pitch-canvas">' +
            '<svg class="es-tactical-drawing-svg" viewBox="0 0 900 580">' +
              '<rect x="20" y="20" width="860" height="540" fill="none" stroke="#ffffff" stroke-width="3"/>' +
              '<line x1="450" y1="20" x2="450" y2="560" stroke="#ffffff" stroke-width="3"/>' +
              '<circle cx="450" cy="290" r="70" fill="none" stroke="#ffffff" stroke-width="3"/>' +
              '<circle cx="450" cy="290" r="4" fill="#ffffff"/>' +
              '<rect x="20" y="140" width="130" height="300" fill="none" stroke="#ffffff" stroke-width="3"/>' +
              '<rect x="20" y="200" width="45" height="180" fill="none" stroke="#ffffff" stroke-width="3"/>' +
              '<rect x="750" y="140" width="130" height="300" fill="none" stroke="#ffffff" stroke-width="3"/>' +
              '<rect x="835" y="200" width="45" height="180" fill="none" stroke="#ffffff" stroke-width="3"/>' +
            '</svg>' +
            '<div class="es-mister-piece is-gk" style="top:50%; left:7%;" data-num="1">1</div>' +
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
            '<div class="es-mister-piece" style="top:50%; left:45%; background:#fff; color:#000; border-color:#000; width:26px; height:26px;">⚽</div>' +
          '</div>' +
        '</div>' +
        '<div class="es-tactical-side-right">' +
          '<div class="es-tactical-color-row">' +
            '<div class="es-tactical-color-dot is-selected" style="background:#0d9488;"></div>' +
            '<div class="es-tactical-color-dot" style="background:#ef4444;"></div>' +
            '<div class="es-tactical-color-dot" style="background:#0284c7;"></div>' +
            '<div class="es-tactical-color-dot" style="background:#0f172a;"></div>' +
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
          '<div class="es-tactical-section-head"><span>NUMERI</span><span>+</span></div>' +
          '<div class="es-tactical-section-head"><span>RUOLI</span><span>+</span></div>' +
          '<div class="es-tactical-section-head"><span>MAGLIE</span><span>+</span></div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);

    modal.querySelector('#btn-close-tactical-editor').onclick = function () { modal.remove(); };

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

    var canvas = modal.querySelector('#editor-pitch-canvas');
    bindCanvasDrag(canvas);

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

    // Interazioni Voti Like / Dislike per gli allenamenti
    mount.querySelectorAll('.es-training-vote-btn').forEach(function (btn) {
      btn.onclick = function () {
        var trainId = btn.getAttribute('data-train-id');
        var voteVal = btn.getAttribute('data-vote-val');
        var curUser = userObj();
        var myUserId = curUser.id || 'u-me';
        var myUserName = (curUser.nome ? (curUser.nome + ' ' + (curUser.cognome || '')) : (curUser.name || 'Membro Club')).trim();
        var myRole = curUser.ruolo || curUser.siteRoleFamily || 'Calciatore';

        var data = getCoachData();
        var train = (data.trainingsList || []).find(function (t) { return t.id === trainId; });
        if (train) {
          train.votes = train.votes || {};
          train.votes[myUserId] = {
            id: myUserId,
            name: myUserName,
            role: myRole,
            vote: voteVal,
            isStaff: !/calciatore|giocatore/.test(myRole.toLowerCase())
          };
          saveCoachData(data);
          renderHub();

          var msg = voteVal === 'yes'
            ? '👍 Hai confermato la presenza: Ci sono!'
            : (voteVal === 'maybe' ? '❓ Presenza in forse registrata' : '👎 Segnato come non disponibile: Non ci sono');
          if (window.showToast) window.showToast(msg, voteVal === 'yes' ? 'success' : (voteVal === 'maybe' ? 'warning' : 'info'));
        }
      };
    });

    // Apertura Modale Partecipanti (👥)
    mount.querySelectorAll('.es-training-participants-btn').forEach(function (btn) {
      btn.onclick = function () {
        var trainId = btn.getAttribute('data-open-voters-id');
        openVotersModal(trainId);
      };
    });

    // Aggiungi nuovo allenamento
    var btnAddTrain = mount.querySelector('#btn-add-training');
    if (btnAddTrain) {
      btnAddTrain.onclick = function () {
        var tTitle = prompt('Titolo evento / allenamento:', 'Allenamento');
        if (tTitle) {
          var tDay = prompt('Giorno (es. mar, gio, sab):', 'mar');
          var tDate = prompt('Data (es. 01/09):', '01/09');
          var tInizio = prompt('Orario inizio (es. 19:00):', '19:00');
          var tFine = prompt('Orario fine (es. 20:30):', '20:30');
          var tFocus = prompt('Focus della seduta:', 'Seduta Tattica & Possesso Palla');

          var data = getCoachData();
          data.trainingsList = data.trainingsList || [];
          data.trainingsList.unshift({
            id: 'train-' + Date.now(),
            day: tDay || 'lun',
            date: tDate || '10/09',
            fullDate: 'Sessione di Allenamento',
            title: tTitle,
            incontro: '-:-',
            inizio: tInizio || '18:30',
            fine: tFine || '20:00',
            campo: 'Stadio Pino Zaccheria',
            focus: tFocus || 'Esercitazioni tecniche',
            votes: {}
          });
          saveCoachData(data);
          renderHub();
          if (window.showToast) window.showToast('✅ Nuovo allenamento programmato con successo!', 'success');
        }
      };
    }

    // Crea Immagine -> Apri Editor
    var btnCreateTactic = mount.querySelector('#btn-create-tactic');
    if (btnCreateTactic) {
      btnCreateTactic.onclick = openTacticalEditor;
    }

    // Carica Immagine / PDF
    var btnUpload = mount.querySelector('#btn-upload-file');
    var fileInput = mount.querySelector('#mister-file-upload');
    if (btnUpload && fileInput) {
      btnUpload.onclick = function () { fileInput.click(); };
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
            if (window.showToast) window.showToast('✅ File ' + file.name + ' importato nella libreria immagini!', 'success');
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
    openVoters: openVotersModal,
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
