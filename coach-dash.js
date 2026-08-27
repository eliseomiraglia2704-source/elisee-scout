/* ============================================================
   ELISEE SCOUT — AREA ALLENATORE (MISTER HUB)
   Tutte le Opzioni Attive al 100%: CLUB | SQUADRA | ALLENAMENTI | PARTITE | LAVAGNA
   - Modali B2B per modifica dati società, staff, rosa, sedute e partite
   - Gestione Convocazioni e Formazione Pre-Gara (Icona 📋)
   - Statistiche Rosa & Partite (Icona 📊)
   - Lavagna Tattica interattiva, esportazione PDF, caricamento e anteprime
   - Presenze allenamenti con Like/Dislike/Maybe e Modale Votanti
   - Bordi rettilinei a 4px e persistenza localStorage
   ============================================================ */
(function () {
  'use strict';

  var activeTab = 'allenamenti'; // 'club' | 'squadra' | 'allenamenti' | 'partite' | 'lavagna'
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
      coachName: 'Admin / Staff Tecnico',
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
        { id: 'p-7', num: 7, name: 'Marco Mancosu', role: 'Ala Sinistra', birth: '2004', cert: 'Regolare', status: 'disp', app: 28 },
        { id: 'p-11', num: 11, name: 'Roberto Ogunseye', role: 'Attaccante Centrale', birth: '1995', cert: 'Regolare', status: 'disp', app: 26 },
        { id: 'p-9', num: 9, name: 'Alexis Ferrante', role: 'Seconda Punta', birth: '1995', cert: 'Regolare', status: 'disp', app: 24 }
      ],
      staffMembers: [
        { id: 'st-coach', name: 'Admin / Staff Tecnico', role: 'Allenatore', patent: 'UEFA Pro', exp: '30/06/2027' },
        { id: 'st-vice', name: 'Giuseppe Russo', role: 'Vice Allenatore', patent: 'UEFA A', exp: '30/06/2027' },
        { id: 'st-prep', name: 'Luca Rossi', role: 'Preparatore Atletico', patent: 'Prep. Atletico FIGC', exp: '30/06/2027' },
        { id: 'st-fisio', name: 'Antonio Gentile', role: 'Fisioterapista', patent: 'Albo FNOFI', exp: '30/06/2027' },
        { id: 'st-analyst', name: 'Giuseppe Di Stefano', role: 'Match Analyst', patent: 'Match Analysis Coverciano', exp: '30/06/2027' }
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
        {
          id: 'match-1',
          date: 'Domenica · Ore 15:00',
          fullDate: 'Domenica 6 Settembre 2026',
          opponent: 'Foggia vs Taranto FC 1927',
          comp: 'Campionato Serie D · Girone H',
          stadium: 'Stadio Pino Zaccheria',
          status: 'Prossima Gara',
          conv: '22 Convocati',
          convocatiList: ['Marco Fumagalli', 'Alessandro Silvestro', 'Luigi Carillo', 'Davide Di Pasquale', 'Luca Rizzo Pinna', 'Moses Odjer', 'Jacopo Petermann', 'Diego Peralta', 'Marco Mancosu', 'Roberto Ogunseye', 'Alexis Ferrante']
        }
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
      var stored = localStorage.getItem('elisee_coach_hub_data_v2') || localStorage.getItem('elisee_coach_hub_data');
      if (stored) {
        var parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') return Object.assign(def, parsed);
      }
    } catch (_) {}
    return def;
  }

  function saveCoachData(data) {
    try {
      localStorage.setItem('elisee_coach_hub_data_v2', JSON.stringify(data));
      localStorage.setItem('elisee_coach_hub_data', JSON.stringify(data));
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

  // ============================================================
  // RENDER DELL'HUB PRINCIPALE
  // ============================================================
  function renderHub() {
    var mount = document.getElementById('es-cd');
    if (!mount) return;

    var data = getCoachData();

    var html =
      '<div class="es-mister-hub">' +
        // Top Trial / VIP bar
        '<div class="es-mister-trial-bar">' +
          '<div class="es-mister-trial-text">' +
            'Area tecnica riservata all\'allenatore' +
          '</div>' +
          '<button type="button" class="es-mister-btn-sub" id="btn-coach-vip-status">Profilo Verificato</button>' +
        '</div>' +

        '<div class="es-mister-wrap">' +
          // Header Club Banner
          '<div class="es-mister-club-header">' +
            '<div class="es-mister-club-main">' +
              '<div class="es-mister-crest-badge">' +
                '<img src="' + esc(data.logoUrl) + '" alt="' + esc(data.clubName) + '" onerror="this.src=\'immagini/squadre-loghi/foggia.png\';">' +
              '</div>' +
              '<div>' +
                '<div class="es-mister-club-tags">' +
                  '<span class="es-mister-tag es-mister-tag-primary">PRIMA SQUADRA</span>' +
                  '<span class="es-mister-tag es-mister-tag-dark">Stagione in corso</span>' +
                  '<span class="es-mister-tag es-mister-tag-gold">Allenatore | Gestione Tecnica</span>' +
                '</div>' +
                '<h1 class="es-mister-club-title">' + esc(data.clubName) + '</h1>' +
                '<p class="es-mister-club-desc" id="mister-tab-desc">' + esc(TAB_DESCS[activeTab]) + '</p>' +
              '</div>' +
            '</div>' +
          '</div>' +

          // 5 Nav Tabs
          '<nav class="es-mister-nav-bar" role="tablist">' +
            '<button type="button" class="es-mister-nav-tab ' + (activeTab === 'club' ? 'is-active' : '') + '" data-tab="club">Club</button>' +
            '<button type="button" class="es-mister-nav-tab ' + (activeTab === 'squadra' ? 'is-active' : '') + '" data-tab="squadra">Squadra</button>' +
            '<button type="button" class="es-mister-nav-tab ' + (activeTab === 'allenamenti' ? 'is-active' : '') + '" data-tab="allenamenti">Allenamenti</button>' +
            '<button type="button" class="es-mister-nav-tab ' + (activeTab === 'partite' ? 'is-active' : '') + '" data-tab="partite">Partite</button>' +
            '<button type="button" class="es-mister-nav-tab ' + (activeTab === 'lavagna' ? 'is-active' : '') + '" data-tab="lavagna">Lavagna</button>' +
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
            '<button type="button" class="es-mister-circle-btn" id="btn-edit-club-data" title="Modifica dati societari">✏️</button>' +
          '</div>' +
          '<table class="es-mister-info-table">' +
            '<tr><th>SOCIETÀ</th><td>' + esc(data.clubName) + '</td></tr>' +
            '<tr><th>MATRICOLA</th><td>' + esc(data.matricola) + '</td></tr>' +
            '<tr><th>SEDE</th><td>' + esc(data.sede) + '</td></tr>' +
            '<tr><th>STADIO</th><td>' + esc(data.stadio) + '</td></tr>' +
            '<tr><th>TELEFONO</th><td>' + esc(data.telefono) + '</td></tr>' +
          '</table>' +
        '</div>' +
        '<div class="es-mister-card-white">' +
          '<div class="es-mister-card-header">' +
            '<div class="es-mister-card-title-wrap"><span class="es-mister-card-icon">🖼️</span><div><h3 class="es-mister-card-title">Immagini</h3><p class="es-mister-card-sub">Stemma societario e foto ufficiale rosa</p></div></div>' +
          '</div>' +
          '<div class="es-mister-images-grid">' +
            '<div class="es-mister-img-box"><div class="es-mister-img-preview"><img src="' + esc(data.logoUrl) + '" alt="Stemma"></div><div style="display:flex; align-items:center; justify-content:space-between; margin-top:0.4rem;"><span style="font-weight:800; font-size:0.88rem;">Stemma</span><button type="button" class="es-mister-circle-btn" id="btn-change-crest" style="width:30px; height:30px; font-size:0.85rem;">✏️</button></div></div>' +
            '<div class="es-mister-img-box"><div class="es-mister-img-preview"><img src="' + esc(data.teamPhotoUrl) + '" alt="Foto squadra"></div><div style="display:flex; align-items:center; justify-content:space-between; margin-top:0.4rem;"><span style="font-weight:800; font-size:0.88rem;">Foto squadra</span><button type="button" class="es-mister-circle-btn" id="btn-change-team-photo" style="width:30px; height:30px; font-size:0.85rem;">✏️</button></div></div>' +
          '</div>' +
          '<input type="file" id="inp-file-crest" accept="image/*" style="display:none;">' +
          '<input type="file" id="inp-file-team-photo" accept="image/*" style="display:none;">' +
        '</div>' +
        '<div class="es-mister-card-white">' +
          '<div class="es-mister-card-header">' +
            '<div class="es-mister-card-title-wrap"><span class="es-mister-card-icon">⏱️</span><div><h3 class="es-mister-card-title">Staff Tecnico</h3><p class="es-mister-card-sub">Allenatore, collaboratori e preparatori</p></div></div>' +
            '<button type="button" class="es-mister-circle-btn" id="btn-add-staff-coach" title="Aggiungi collaboratore">+</button>' +
          '</div>' +
          '<div style="display:flex; flex-direction:column; gap:0.6rem;">' +
            (data.staffMembers || []).map(function (st, sIdx) {
              return (
                '<div class="es-mister-staff-box">' +
                  '<div class="es-mister-staff-left">' +
                    '<div class="es-mister-staff-avatar">👤</div>' +
                    '<div>' +
                      '<h4 class="es-mister-staff-name">' + esc(st.name) + '</h4>' +
                      '<div class="es-mister-staff-role">' + esc(st.role) + ' · Qualifica: <b>' + esc(st.patent || 'FIGC') + '</b></div>' +
                      '<div class="es-mister-staff-meta"><span>Scadenza: <b>' + esc(st.exp || '30/06/2027') + '</b></span></div>' +
                    '</div>' +
                  '</div>' +
                  '<button type="button" class="es-mister-circle-btn" style="width:32px; height:32px; font-size:0.85rem;" data-edit-staff-idx="' + sIdx + '">✏️</button>' +
                '</div>'
              );
            }).join('') +
          '</div>' +
        '</div>'
      );
    }

    if (tab === 'squadra') {
      var playersHtml = (data.roster || []).map(function (p, idx) {
        return (
          '<div class="es-mister-player-card">' +
            '<div class="es-mister-player-num">' + p.num + '</div>' +
            '<div class="es-mister-player-info"><h4 class="es-mister-player-name">' + esc(p.name) + '</h4><div class="es-mister-player-role">' + esc(p.role) + ' · Anno ' + esc(p.birth) + '</div><div style="font-size:0.72rem; color:#64748b;">🟢 ' + (p.status === 'disp' ? 'Disponibile' : 'Differenziato') + ' · ' + p.app + ' Presenze</div></div>' +
            '<button type="button" class="es-mister-circle-btn" style="width:30px; height:30px; font-size:0.8rem;" data-edit-player="' + idx + '" title="Modifica atleta">✏️</button>' +
          '</div>'
        );
      }).join('');

      return (
        '<div class="es-mister-card-white">' +
          '<div class="es-mister-card-header">' +
            '<div class="es-mister-card-title-wrap"><span class="es-mister-card-icon">👥</span><div><h3 class="es-mister-card-title">Squadra</h3><p class="es-mister-card-sub">' + esc(data.clubName) + ' · Prima Squadra (' + (data.roster || []).length + ' Giocatori in rosa)</p></div></div>' +
            '<div class="es-mister-card-actions">' +
              '<button type="button" class="es-mister-circle-btn" id="btn-stats-roster" title="Statistiche e ripartizione rosa">📊</button>' +
              '<button type="button" class="es-mister-circle-btn" id="btn-add-player" title="Aggiungi giocatore in rosa">+</button>' +
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
            '<div class="es-training-head-banner" style="cursor:pointer;" data-open-training-details="' + t.id + '">' +
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
      var matchHtml = (data.partite || []).map(function (m, mIdx) {
        return (
          '<div class="es-mister-event-card">' +
            '<div class="es-mister-event-date-badge">' + m.date + '</div>' +
            '<div class="es-mister-event-details"><h4 class="es-mister-event-title">' + m.opponent + '</h4><p class="es-mister-event-sub">' + m.comp + ' · 🏟️ ' + m.stadium + '</p><div style="font-size:0.75rem; color:#8a7a58; font-weight:700; margin-top:0.3rem;">⚽ ' + m.status + ' (' + m.conv + ')</div></div>' +
            '<button type="button" class="es-mister-circle-btn" style="width:34px; height:34px; font-size:0.85rem;" data-match-convocati="' + mIdx + '" title="Convocazioni e Formazione">📋</button>' +
          '</div>'
        );
      }).join('');

      return (
        '<div class="es-mister-card-white">' +
          '<div class="es-mister-card-header">' +
            '<div class="es-mister-card-title-wrap"><span class="es-mister-card-icon">⚽</span><div><h3 class="es-mister-card-title">Partite</h3><p class="es-mister-card-sub">' + esc(data.clubName) + ' · Prima Squadra</p></div></div>' +
            '<div class="es-mister-card-actions">' +
              '<button type="button" class="es-mister-circle-btn" id="btn-stats-match" title="Statistiche Gare">📊</button>' +
              '<button type="button" class="es-mister-circle-btn" id="btn-add-match" title="Aggiungi Partita">+</button>' +
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
              '<button type="button" class="btn btn-outline-pill pf-btn-solid" id="btn-create-tactic" style="background:#a8946c; color:#ffffff; border:none; padding:0.55rem 1.25rem; font-weight:800; font-size:0.85rem; display:inline-flex; align-items:center; gap:0.45rem;">' +
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
  // MODALI B2B CENTRATE (AREA ALLENATORE)
  // ============================================================
  function openCoachModal(title, iconText, contentHtml) {
    var old = document.getElementById('es-coach-modal-overlay');
    if (old) old.remove();

    var modal = document.createElement('div');
    modal.id = 'es-coach-modal-overlay';
    modal.className = 'es-pres-modal-overlay';
    modal.innerHTML =
      '<div class="es-pres-modal-sheet" role="dialog" aria-modal="true" style="border-radius:4px !important; max-width:620px;">' +
        '<button type="button" class="es-pres-modal-close-btn" id="btn-close-coach-modal" aria-label="Chiudi">&times;</button>' +
        '<div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:1.2rem; padding-bottom:0.65rem; border-bottom:1px solid rgba(148,163,184,0.15);">' +
          '<span style="font-size:1.3rem;">' + iconText + '</span>' +
          '<h2 style="font-size:1.25rem; font-weight:800; color:#ffffff; margin:0;">' + esc(title) + '</h2>' +
        '</div>' +
        '<div>' + contentHtml + '</div>' +
      '</div>';

    document.body.appendChild(modal);
    function close() { modal.remove(); }
    modal.querySelector('#btn-close-coach-modal').onclick = close;
    modal.onclick = function (e) { if (e.target === modal) close(); };
  }

  // 1. Modale Modifica Dati Club
  function openEditClubDataModal(data) {
    var formHtml =
      '<p style="color:#94a3b8; font-size:0.85rem; margin-bottom:1.2rem;">Aggiorna le informazioni anagrafiche e logistiche della società:</p>' +
      '<form id="form-edit-club" style="display:flex; flex-direction:column; gap:1rem;">' +
        '<div class="es-pres-input-group"><label>Denominazione Società *</label><input type="text" class="es-pres-input-text" id="inp-c-name" value="' + esc(data.clubName) + '" required></div>' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
          '<div class="es-pres-input-group"><label>Matricola FIGC *</label><input type="text" class="es-pres-input-text" id="inp-c-mat" value="' + esc(data.matricola) + '" required></div>' +
          '<div class="es-pres-input-group"><label>Telefono Segreteria</label><input type="text" class="es-pres-input-text" id="inp-c-tel" value="' + esc(data.telefono) + '"></div>' +
        '</div>' +
        '<div class="es-pres-input-group"><label>Sede Legale / Operativa</label><input type="text" class="es-pres-input-text" id="inp-c-sede" value="' + esc(data.sede) + '"></div>' +
        '<div class="es-pres-input-group"><label>Stadio Ufficiale</label><input type="text" class="es-pres-input-text" id="inp-c-stadio" value="' + esc(data.stadio) + '"></div>' +
        '<div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:0.5rem; padding-top:0.85rem; border-top:1px solid rgba(148,163,184,0.15);">' +
          '<button type="button" class="es-pres-btn-secondary" id="btn-c-cancel">Annulla</button>' +
          '<button type="submit" class="es-pres-btn-primary">Salva Dati Società</button>' +
        '</div>' +
      '</form>';

    openCoachModal('Modifica Dati Società & Impianto', '🛡️', formHtml);
    var overlay = document.getElementById('es-coach-modal-overlay');
    var form = document.getElementById('form-edit-club');
    var btnCancel = document.getElementById('btn-c-cancel');
    if (btnCancel && overlay) btnCancel.onclick = function () { overlay.remove(); };

    if (form) {
      form.onsubmit = function (e) {
        e.preventDefault();
        data.clubName = document.getElementById('inp-c-name').value.trim();
        data.matricola = document.getElementById('inp-c-mat').value.trim();
        data.telefono = document.getElementById('inp-c-tel').value.trim();
        data.sede = document.getElementById('inp-c-sede').value.trim();
        data.stadio = document.getElementById('inp-c-stadio').value.trim();

        saveCoachData(data);
        if (overlay) overlay.remove();
        renderHub();
        if (window.showToast) window.showToast('Dati societari salvati con successo!', 'success');
      };
    }
  }

  // 2. Modale Aggiungi / Modifica Staff
  function openAddStaffModal(data, editIdx) {
    var isEdit = typeof editIdx === 'number' && editIdx >= 0;
    var current = isEdit ? (data.staffMembers[editIdx] || {}) : {};

    var formHtml =
      '<p style="color:#94a3b8; font-size:0.85rem; margin-bottom:1.2rem;">' + (isEdit ? 'Modifica le informazioni del membro dello staff:' : 'Inserisci un nuovo collaboratore tecnico o sanitario:') + '</p>' +
      '<form id="form-staff-coach" style="display:flex; flex-direction:column; gap:1rem;">' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
          '<div class="es-pres-input-group"><label>Nome e Cognome *</label><input type="text" class="es-pres-input-text" id="inp-st-name" value="' + esc(current.name || '') + '" required placeholder="Es. Marco Rossi"></div>' +
          '<div class="es-pres-input-group"><label>Incarico Staff *</label><select class="es-pres-input-text" id="sel-st-role" style="background:#040810; color:#fff;"><option ' + (current.role === 'Vice Allenatore' ? 'selected' : '') + '>Vice Allenatore</option><option ' + (current.role === 'Preparatore Atletico' ? 'selected' : '') + '>Preparatore Atletico</option><option ' + (current.role === 'Preparatore Portieri' ? 'selected' : '') + '>Preparatore Portieri</option><option ' + (current.role === 'Match Analyst' ? 'selected' : '') + '>Match Analyst</option><option ' + (current.role === 'Fisioterapista' ? 'selected' : '') + '>Fisioterapista</option><option ' + (current.role === 'Medico Sociale' ? 'selected' : '') + '>Medico Sociale</option><option ' + (current.role === 'Collaboratore Tecnico' ? 'selected' : '') + '>Collaboratore Tecnico</option></select></div>' +
        '</div>' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
          '<div class="es-pres-input-group"><label>Qualifica FIGC / Patentino</label><input type="text" class="es-pres-input-text" id="inp-st-pat" value="' + esc(current.patent || 'UEFA B') + '"></div>' +
          '<div class="es-pres-input-group"><label>Scadenza Contratto</label><input type="date" class="es-pres-input-text" id="inp-st-exp" value="' + (current.exp ? (current.exp.indexOf('/') >= 0 ? '2027-06-30' : current.exp) : '2027-06-30') + '"></div>' +
        '</div>' +
        '<div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.5rem; padding-top:0.85rem; border-top:1px solid rgba(148,163,184,0.15);">' +
          (isEdit ? '<button type="button" class="es-pres-btn-secondary" id="btn-del-staff" style="color:#f87171; border-color:rgba(239,68,68,0.4);">Rimuovi</button>' : '<div></div>') +
          '<div style="display:flex; gap:0.6rem;">' +
            '<button type="button" class="es-pres-btn-secondary" id="btn-st-cancel">Annulla</button>' +
            '<button type="submit" class="es-pres-btn-primary">' + (isEdit ? 'Salva Modifiche' : 'Aggiungi Staff') + '</button>' +
          '</div>' +
        '</div>' +
      '</form>';

    openCoachModal(isEdit ? 'Modifica Membro Staff' : 'Aggiungi Collaboratore Staff', '⏱️', formHtml);
    var overlay = document.getElementById('es-coach-modal-overlay');
    var form = document.getElementById('form-staff-coach');
    var btnCancel = document.getElementById('btn-st-cancel');
    var btnDel = document.getElementById('btn-del-staff');
    if (btnCancel && overlay) btnCancel.onclick = function () { overlay.remove(); };

    if (btnDel) {
      btnDel.onclick = function () {
        if (confirm('Sei sicuro di voler rimuovere questo membro dello staff?')) {
          data.staffMembers.splice(editIdx, 1);
          saveCoachData(data);
          if (overlay) overlay.remove();
          renderHub();
          if (window.showToast) window.showToast('Membro dello staff rimosso.', 'info');
        }
      };
    }

    if (form) {
      form.onsubmit = function (e) {
        e.preventDefault();
        var name = document.getElementById('inp-st-name').value.trim();
        var role = document.getElementById('sel-st-role').value;
        var pat = document.getElementById('inp-st-pat').value.trim();
        var exp = document.getElementById('inp-st-exp').value;

        data.staffMembers = data.staffMembers || [];
        if (isEdit) {
          data.staffMembers[editIdx] = Object.assign(data.staffMembers[editIdx], {
            name: name,
            role: role,
            patent: pat,
            exp: exp
          });
        } else {
          data.staffMembers.push({
            id: 'st-' + Date.now(),
            name: name,
            role: role,
            patent: pat,
            exp: exp
          });
        }

        saveCoachData(data);
        if (overlay) overlay.remove();
        renderHub();
        if (window.showToast) window.showToast((isEdit ? 'Staff aggiornato!' : 'Nuovo collaboratore aggiunto!'), 'success');
      };
    }
  }

  // 3. Modale Aggiungi / Modifica Giocatore
  function openAddPlayerModal(data, editIdx) {
    var isEdit = typeof editIdx === 'number' && editIdx >= 0;
    var current = isEdit ? (data.roster[editIdx] || {}) : {};

    var formHtml =
      '<p style="color:#94a3b8; font-size:0.85rem; margin-bottom:1.2rem;">' + (isEdit ? 'Modifica scheda calciatore:' : 'Inserisci un nuovo atleta nell\'organico della squadra:') + '</p>' +
      '<form id="form-player-coach" style="display:flex; flex-direction:column; gap:1rem;">' +
        '<div style="display:grid; grid-template-columns:1fr 2fr; gap:1rem;">' +
          '<div class="es-pres-input-group"><label>N° Maglia *</label><input type="number" class="es-pres-input-text" id="inp-p-num" value="' + (current.num || ((data.roster || []).length + 1)) + '" required min="1" max="99"></div>' +
          '<div class="es-pres-input-group"><label>Nome e Cognome *</label><input type="text" class="es-pres-input-text" id="inp-p-name" value="' + esc(current.name || '') + '" required placeholder="Es. Lorenzo Pellegrini"></div>' +
        '</div>' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
          '<div class="es-pres-input-group"><label>Ruolo Tattico *</label><select class="es-pres-input-text" id="sel-p-role" style="background:#040810; color:#fff;"><option ' + (current.role === 'Portiere' ? 'selected' : '') + '>Portiere</option><option ' + (current.role === 'Difensore Centrale' ? 'selected' : '') + '>Difensore Centrale</option><option ' + (current.role === 'Terzino Destro' ? 'selected' : '') + '>Terzino Destro</option><option ' + (current.role === 'Terzino Sinistro' ? 'selected' : '') + '>Terzino Sinistro</option><option ' + (current.role === 'Mediano' ? 'selected' : '') + '>Mediano</option><option ' + (current.role === 'Regista' ? 'selected' : '') + '>Regista</option><option ' + (current.role === 'Mezzala' ? 'selected' : '') + '>Mezzala</option><option ' + (current.role === 'Trequartista' ? 'selected' : '') + '>Trequartista</option><option ' + (current.role === 'Ala Destra' ? 'selected' : '') + '>Ala Destra</option><option ' + (current.role === 'Ala Sinistra' ? 'selected' : '') + '>Ala Sinistra</option><option ' + (current.role === 'Punta Centrale' ? 'selected' : '') + '>Punta Centrale</option><option ' + (current.role === 'Seconda Punta' ? 'selected' : '') + '>Seconda Punta</option></select></div>' +
          '<div class="es-pres-input-group"><label>Anno di Nascita</label><input type="number" class="es-pres-input-text" id="inp-p-birth" value="' + (current.birth || '2004') + '" min="1980" max="2015"></div>' +
        '</div>' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
          '<div class="es-pres-input-group"><label>Presenze Stagionali</label><input type="number" class="es-pres-input-text" id="inp-p-app" value="' + (current.app || 0) + '" min="0"></div>' +
          '<div class="es-pres-input-group"><label>Stato Disponibilità</label><select class="es-pres-input-text" id="sel-p-status" style="background:#040810; color:#fff;"><option value="disp" ' + (current.status === 'disp' ? 'selected' : '') + '>🟢 Disponibile</option><option value="diff" ' + (current.status === 'diff' ? 'selected' : '') + '>🟡 Lavoro Differenziato</option><option value="infortunato" ' + (current.status === 'infortunato' ? 'selected' : '') + '>🔴 Infortunato / Indisponibile</option></select></div>' +
        '</div>' +
        '<div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.5rem; padding-top:0.85rem; border-top:1px solid rgba(148,163,184,0.15);">' +
          (isEdit ? '<button type="button" class="es-pres-btn-secondary" id="btn-del-player" style="color:#f87171; border-color:rgba(239,68,68,0.4);">Rimuovi dalla Rosa</button>' : '<div></div>') +
          '<div style="display:flex; gap:0.6rem;">' +
            '<button type="button" class="es-pres-btn-secondary" id="btn-p-cancel">Annulla</button>' +
            '<button type="submit" class="es-pres-btn-primary">' + (isEdit ? 'Salva Modifiche' : 'Aggiungi Giocatore') + '</button>' +
          '</div>' +
        '</div>' +
      '</form>';

    openCoachModal(isEdit ? 'Modifica Atleta in Rosa' : 'Aggiungi Nuovo Calciatore', '👥', formHtml);
    var overlay = document.getElementById('es-coach-modal-overlay');
    var form = document.getElementById('form-player-coach');
    var btnCancel = document.getElementById('btn-p-cancel');
    var btnDel = document.getElementById('btn-del-player');
    if (btnCancel && overlay) btnCancel.onclick = function () { overlay.remove(); };

    if (btnDel) {
      btnDel.onclick = function () {
        if (confirm('Sei sicuro di voler rimuovere ' + current.name + ' dalla rosa?')) {
          data.roster.splice(editIdx, 1);
          saveCoachData(data);
          if (overlay) overlay.remove();
          renderHub();
          if (window.showToast) window.showToast('Atleta rimosso dalla rosa.', 'info');
        }
      };
    }

    if (form) {
      form.onsubmit = function (e) {
        e.preventDefault();
        var num = parseInt(document.getElementById('inp-p-num').value) || 1;
        var name = document.getElementById('inp-p-name').value.trim();
        var role = document.getElementById('sel-p-role').value;
        var birth = document.getElementById('inp-p-birth').value;
        var app = parseInt(document.getElementById('inp-p-app').value) || 0;
        var status = document.getElementById('sel-p-status').value;

        data.roster = data.roster || [];
        if (isEdit) {
          data.roster[editIdx] = Object.assign(data.roster[editIdx], {
            num: num,
            name: name,
            role: role,
            birth: birth,
            app: app,
            status: status
          });
        } else {
          data.roster.push({
            id: 'p-' + Date.now(),
            num: num,
            name: name,
            role: role,
            birth: birth,
            cert: 'Regolare',
            status: status,
            app: app
          });
        }

        saveCoachData(data);
        if (overlay) overlay.remove();
        renderHub();
        if (window.showToast) window.showToast((isEdit ? 'Scheda atleta salvata!' : 'Giocatore ' + name + ' aggiunto alla rosa!'), 'success');
      };
    }
  }

  // 4. Modale Statistiche Rosa (Icona 📊 in Squadra)
  function openRosterStatsModal(data) {
    var roster = data.roster || [];
    var total = roster.length;
    var gk = 0, def = 0, mid = 0, att = 0, disp = 0;
    var sumAge = 0;

    roster.forEach(function (p) {
      var r = (p.role || '').toLowerCase();
      if (/portiere/.test(r)) gk++;
      else if (/terzino|difensore/.test(r)) def++;
      else if (/mediano|regista|mezzala|trequartista|centro/.test(r)) mid++;
      else att++;

      if (p.status === 'disp') disp++;
      var b = parseInt(p.birth);
      if (b) sumAge += (2026 - b);
    });

    var avgAge = total ? (sumAge / total).toFixed(1) : '—';

    var html =
      '<div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:0.8rem; margin-bottom:1.2rem;">' +
        '<div style="background:#040810; border:1px solid rgba(148,163,184,0.18); border-radius:4px; padding:0.9rem; text-align:center;">' +
          '<div style="font-size:0.72rem; color:#94a3b8; font-weight:700;">ORGANICO TOTALE</div>' +
          '<div style="font-size:1.6rem; font-weight:800; color:#c4b08a;">' + total + ' <span style="font-size:0.8rem; font-weight:400;">atleti</span></div>' +
        '</div>' +
        '<div style="background:#040810; border:1px solid rgba(148,163,184,0.18); border-radius:4px; padding:0.9rem; text-align:center;">' +
          '<div style="font-size:0.72rem; color:#94a3b8; font-weight:700;">ETÀ MEDIA ROSA</div>' +
          '<div style="font-size:1.6rem; font-weight:800; color:#8a9a7a;">' + avgAge + ' <span style="font-size:0.8rem; font-weight:400;">anni</span></div>' +
        '</div>' +
        '<div style="background:#040810; border:1px solid rgba(148,163,184,0.18); border-radius:4px; padding:0.9rem; text-align:center;">' +
          '<div style="font-size:0.72rem; color:#94a3b8; font-weight:700;">DISPONIBILI</div>' +
          '<div style="font-size:1.6rem; font-weight:800; color:#c4b08a;">' + disp + ' / ' + total + '</div>' +
        '</div>' +
      '</div>' +
      '<div style="background:#040810; border:1px solid rgba(148,163,184,0.18); border-radius:4px; padding:1rem; margin-bottom:1.2rem;">' +
        '<h4 style="font-size:0.88rem; font-weight:800; color:#fff; margin:0 0 0.6rem;">Ripartizione Tattica Ruoli</h4>' +
        '<div style="display:flex; flex-direction:column; gap:0.4rem; font-size:0.82rem; color:#cbd5e1;">' +
          '<div style="display:flex; justify-content:space-between;"><span>🧤 Portieri:</span><b>' + gk + '</b></div>' +
          '<div style="display:flex; justify-content:space-between;"><span>🛡️ Difensori:</span><b>' + def + '</b></div>' +
          '<div style="display:flex; justify-content:space-between;"><span>👟 Centrocampisti:</span><b>' + mid + '</b></div>' +
          '<div style="display:flex; justify-content:space-between;"><span>⚽ Attaccanti:</span><b>' + att + '</b></div>' +
        '</div>' +
      '</div>' +
      '<button type="button" class="es-pres-btn-primary" id="btn-close-r-stats" style="width:100%;">Chiudi Statistiche</button>';

    openCoachModal('Analisi Statistica Rosa', '📊', html);
    var overlay = document.getElementById('es-coach-modal-overlay');
    var btnClose = document.getElementById('btn-close-r-stats');
    if (btnClose && overlay) btnClose.onclick = function () { overlay.remove(); };
  }

  // 5. Modale Aggiungi / Dettaglio Allenamento
  function openAddTrainingModal(data) {
    var formHtml =
      '<p style="color:#94a3b8; font-size:0.85rem; margin-bottom:1.2rem;">Pianifica una nuova seduta di allenamento con orario e focus tecnico:</p>' +
      '<form id="form-train-coach" style="display:flex; flex-direction:column; gap:1rem;">' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
          '<div class="es-pres-input-group"><label>Titolo Seduta *</label><input type="text" class="es-pres-input-text" id="inp-t-title" value="Allenamento" required></div>' +
          '<div class="es-pres-input-group"><label>Giorno &amp; Data *</label><input type="text" class="es-pres-input-text" id="inp-t-daydate" value="Martedì · 08/09" required placeholder="Es. Martedì · 08/09"></div>' +
        '</div>' +
        '<div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:0.8rem;">' +
          '<div class="es-pres-input-group"><label>Incontro</label><input type="text" class="es-pres-input-text" id="inp-t-inc" value="18:30"></div>' +
          '<div class="es-pres-input-group"><label>Inizio Campo *</label><input type="text" class="es-pres-input-text" id="inp-t-start" value="19:00" required></div>' +
          '<div class="es-pres-input-group"><label>Fine Campo</label><input type="text" class="es-pres-input-text" id="inp-t-end" value="20:30"></div>' +
        '</div>' +
        '<div class="es-pres-input-group"><label>Campo / Ubicazione</label><input type="text" class="es-pres-input-text" id="inp-t-pitch" value="Campo A - Stadio Pino Zaccheria"></div>' +
        '<div class="es-pres-input-group"><label>Focus Tattico &amp; Obiettivo Seduta *</label><textarea class="es-pres-input-text" id="inp-t-focus" rows="2" required placeholder="Es. Lavoro a secco, possesso palla e transizioni veloci">Seduta Tattica &amp; Pressione Alta</textarea></div>' +
        '<div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:0.5rem; padding-top:0.85rem; border-top:1px solid rgba(148,163,184,0.15);">' +
          '<button type="button" class="es-pres-btn-secondary" id="btn-t-cancel">Annulla</button>' +
          '<button type="submit" class="es-pres-btn-primary">Programma Allenamento</button>' +
        '</div>' +
      '</form>';

    openCoachModal('Programmazione Seduta di Allenamento', '🏃‍♂️', formHtml);
    var overlay = document.getElementById('es-coach-modal-overlay');
    var form = document.getElementById('form-train-coach');
    var btnCancel = document.getElementById('btn-t-cancel');
    if (btnCancel && overlay) btnCancel.onclick = function () { overlay.remove(); };

    if (form) {
      form.onsubmit = function (e) {
        e.preventDefault();
        var title = document.getElementById('inp-t-title').value.trim();
        var dayDate = document.getElementById('inp-t-daydate').value.trim();
        var parts = dayDate.split('·');
        var dayTxt = (parts[0] || 'mar').trim().substring(0, 3).toLowerCase();
        var dateTxt = (parts[1] || '08/09').trim();

        var inc = document.getElementById('inp-t-inc').value.trim();
        var start = document.getElementById('inp-t-start').value.trim();
        var end = document.getElementById('inp-t-end').value.trim();
        var pitch = document.getElementById('inp-t-pitch').value.trim();
        var focus = document.getElementById('inp-t-focus').value.trim();

        data.trainingsList = data.trainingsList || [];
        data.trainingsList.unshift({
          id: 'train-' + Date.now(),
          day: dayTxt,
          date: dateTxt,
          fullDate: dayDate,
          title: title,
          incontro: inc,
          inizio: start,
          fine: end,
          campo: pitch,
          focus: focus,
          votes: {}
        });

        saveCoachData(data);
        if (overlay) overlay.remove();
        renderHub();
        if (window.showToast) window.showToast('Allenamento programmato e condiviso con la squadra!', 'success');
      };
    }
  }

  // 6. Modale Aggiungi Partita
  function openAddMatchModal(data) {
    var formHtml =
      '<p style="color:#94a3b8; font-size:0.85rem; margin-bottom:1.2rem;">Inserisci una nuova partita nel calendario ufficiale:</p>' +
      '<form id="form-match-coach" style="display:flex; flex-direction:column; gap:1rem;">' +
        '<div class="es-pres-input-group"><label>Incontro / Avversario *</label><input type="text" class="es-pres-input-text" id="inp-m-opp" placeholder="Es. Foggia vs Fidelis Andria" required></div>' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
          '<div class="es-pres-input-group"><label>Data &amp; Orario *</label><input type="text" class="es-pres-input-text" id="inp-m-date" value="Domenica · Ore 15:00" required></div>' +
          '<div class="es-pres-input-group"><label>Competizione</label><input type="text" class="es-pres-input-text" id="inp-m-comp" value="Campionato Serie D · Girone H"></div>' +
        '</div>' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
          '<div class="es-pres-input-group"><label>Stadio / Ubicazione</label><input type="text" class="es-pres-input-text" id="inp-m-stad" value="Stadio Comunale Pino Zaccheria"></div>' +
          '<div class="es-pres-input-group"><label>Stato Partita</label><select class="es-pres-input-text" id="sel-m-status" style="background:#040810; color:#fff;"><option>Prossima Gara</option><option>Vinta</option><option>Pareggiata</option><option>Persa</option></select></div>' +
        '</div>' +
        '<div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:0.5rem; padding-top:0.85rem; border-top:1px solid rgba(148,163,184,0.15);">' +
          '<button type="button" class="es-pres-btn-secondary" id="btn-m-cancel">Annulla</button>' +
          '<button type="submit" class="es-pres-btn-primary">Registra Partita</button>' +
        '</div>' +
      '</form>';

    openCoachModal('Inserisci Partita Ufficiale', '⚽', formHtml);
    var overlay = document.getElementById('es-coach-modal-overlay');
    var form = document.getElementById('form-match-coach');
    var btnCancel = document.getElementById('btn-m-cancel');
    if (btnCancel && overlay) btnCancel.onclick = function () { overlay.remove(); };

    if (form) {
      form.onsubmit = function (e) {
        e.preventDefault();
        var opp = document.getElementById('inp-m-opp').value.trim();
        var dt = document.getElementById('inp-m-date').value.trim();
        var comp = document.getElementById('inp-m-comp').value.trim();
        var stad = document.getElementById('inp-m-stad').value.trim();
        var st = document.getElementById('sel-m-status').value;

        data.partite = data.partite || [];
        data.partite.push({
          id: 'match-' + Date.now(),
          date: dt,
          fullDate: dt,
          opponent: opp,
          comp: comp,
          stadium: stad,
          status: st,
          conv: 'In preparazione',
          convocatiList: []
        });

        saveCoachData(data);
        if (overlay) overlay.remove();
        renderHub();
        if (window.showToast) window.showToast('Partita inserita nel calendario ufficiale!', 'success');
      };
    }
  }

  // 7. Modale Convocazioni & Formazione Pre-Gara (Icona 📋 in Partite)
  function openMatchConvocatiModal(match, mIdx, data) {
    var roster = data.roster || [];
    var convList = match.convocatiList || [];

    var checkboxesHtml = roster.map(function (p) {
      var isChecked = convList.indexOf(p.name) >= 0;
      return (
        '<label style="display:flex; align-items:center; justify-content:space-between; background:#040810; border:1px solid rgba(148,163,184,0.15); border-radius:4px; padding:0.6rem 0.8rem; cursor:pointer;">' +
          '<div style="display:flex; align-items:center; gap:0.6rem;">' +
            '<span style="font-weight:800; color:#c4b08a; width:22px;">' + p.num + '</span>' +
            '<span style="font-weight:700; color:#fff;">' + esc(p.name) + '</span>' +
            '<span style="font-size:0.75rem; color:#94a3b8;">(' + esc(p.role) + ')</span>' +
          '</div>' +
          '<input type="checkbox" value="' + esc(p.name) + '" ' + (isChecked ? 'checked' : '') + ' class="chk-conv-player" style="accent-color:#a8946c; transform:scale(1.2);">' +
        '</label>'
      );
    }).join('');

    var formHtml =
      '<p style="color:#94a3b8; font-size:0.85rem; margin-bottom:1rem;">Seleziona i calciatori convocati per <b>' + esc(match.opponent) + '</b>:</p>' +
      '<form id="form-conv-match" style="display:flex; flex-direction:column; gap:1rem;">' +
        '<div style="display:flex; flex-direction:column; gap:0.45rem; max-height:280px; overflow-y:auto; padding-right:0.4rem;">' +
          checkboxesHtml +
        '</div>' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-top:0.5rem;">' +
          '<div class="es-pres-input-group"><label>Modulo Tattico Previsto</label><select class="es-pres-input-text" id="sel-match-mod" style="background:#040810; color:#fff;"><option>4-3-3</option><option>3-5-2</option><option>4-2-3-1</option><option>3-4-2-1</option><option>4-3-1-2</option></select></div>' +
          '<div class="es-pres-input-group"><label>Note Tecniche Pre-Gara</label><input type="text" class="es-pres-input-text" id="inp-match-notes" placeholder="Es. Ritrovo ore 12:30"></div>' +
        '</div>' +
        '<div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:0.5rem; padding-top:0.85rem; border-top:1px solid rgba(148,163,184,0.15);">' +
          '<button type="button" class="es-pres-btn-secondary" id="btn-conv-cancel">Annulla</button>' +
          '<button type="submit" class="es-pres-btn-primary">Salva Distinta &amp; Convocati</button>' +
        '</div>' +
      '</form>';

    openCoachModal('Lista Convocati & Distinta Gara', '📋', formHtml);
    var overlay = document.getElementById('es-coach-modal-overlay');
    var form = document.getElementById('form-conv-match');
    var btnCancel = document.getElementById('btn-conv-cancel');
    if (btnCancel && overlay) btnCancel.onclick = function () { overlay.remove(); };

    if (form) {
      form.onsubmit = function (e) {
        e.preventDefault();
        var selected = [];
        form.querySelectorAll('.chk-conv-player:checked').forEach(function (chk) {
          selected.push(chk.value);
        });

        match.convocatiList = selected;
        match.conv = selected.length + ' Convocati';
        saveCoachData(data);

        if (overlay) overlay.remove();
        renderHub();
        if (window.showToast) window.showToast('Distinta salvata con ' + selected.length + ' convocati!', 'success');
      };
    }
  }

  // 8. Modale Statistiche Partite (Icona 📊 in Partite)
  function openMatchStatsModal(data) {
    var matches = data.partite || [];
    var total = matches.length;

    var html =
      '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.2rem;">' +
        '<div style="background:#040810; border:1px solid rgba(148,163,184,0.18); border-radius:4px; padding:1rem; text-align:center;">' +
          '<div style="font-size:0.72rem; color:#94a3b8; font-weight:700;">PARTITE IN PROGRAMMA</div>' +
          '<div style="font-size:1.8rem; font-weight:800; color:#c4b08a;">' + total + '</div>' +
        '</div>' +
        '<div style="background:#040810; border:1px solid rgba(148,163,184,0.18); border-radius:4px; padding:1rem; text-align:center;">' +
          '<div style="font-size:0.72rem; color:#94a3b8; font-weight:700;">STATO SQUADRA</div>' +
          '<div style="font-size:1.2rem; font-weight:800; color:#8a9a7a; margin-top:0.4rem;">Pronta alla Gara</div>' +
        '</div>' +
      '</div>' +
      '<div style="background:#040810; border:1px solid rgba(148,163,184,0.18); border-radius:4px; padding:1rem; margin-bottom:1.2rem;">' +
        '<div style="font-size:0.85rem; color:#cbd5e1; line-height:1.6;">' +
          '• <b>Prossimo Match:</b> ' + (matches[0] ? esc(matches[0].opponent) : 'Nessuno') + '<br>' +
          '• <b>Impianto:</b> ' + (matches[0] ? esc(matches[0].stadium) : '—') + '<br>' +
          '• <b>Stato Convocazioni:</b> ' + (matches[0] ? esc(matches[0].conv) : '—') +
        '</div>' +
      '</div>' +
      '<button type="button" class="es-pres-btn-primary" id="btn-close-m-stats" style="width:100%;">Chiudi</button>';

    openCoachModal('Riepilogo Gare & Calendario', '📊', html);
    var overlay = document.getElementById('es-coach-modal-overlay');
    var btnClose = document.getElementById('btn-close-m-stats');
    if (btnClose && overlay) btnClose.onclick = function () { overlay.remove(); };
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
    modal.className = 'es-pres-modal-overlay';
    modal.innerHTML =
      '<div class="es-voters-modal-sheet" role="dialog" aria-modal="true" style="border-radius:4px !important;">' +
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
              '<h5 class="es-voter-name">' + esc(m.name) + (m.isStaff ? ' <small style="color:#a8946c; font-weight:800;">[Staff]</small>' : '') + '</h5>' +
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
        '<div class="es-tactical-title">Lavagna Tattica Mister</div>' +
        '<div class="es-tactical-size-ctrl">' +
          '<span class="es-tactical-size-label">Dimensione pedine</span>' +
          '<button type="button" class="es-tactical-size-pill ' + (currentElemSize === 'S' ? 'is-active' : '') + '" data-size="S">S</button>' +
          '<button type="button" class="es-tactical-size-pill ' + (currentElemSize === 'M' ? 'is-active' : '') + '" data-size="M">M</button>' +
          '<button type="button" class="es-tactical-size-pill ' + (currentElemSize === 'L' ? 'is-active' : '') + '" data-size="L">L</button>' +
        '</div>' +
        '<div style="display:flex; align-items:center;">' +
          '<button type="button" class="es-tactical-btn-use" id="btn-save-tactical-image">Salva nella Libreria</button>' +
          '<button type="button" class="es-tactical-btn-close" id="btn-close-tactical-editor">&times;</button>' +
        '</div>' +
      '</div>' +
      '<div class="es-tactical-workspace">' +
        '<div class="es-tactical-side-left">' +
          '<div class="es-tactical-color-row">' +
            '<div class="es-tactical-color-dot is-selected" style="background:#22c55e;" data-color="#22c55e"></div>' +
            '<div class="es-tactical-color-dot" style="background:#ef4444;" data-color="#ef4444"></div>' +
            '<div class="es-tactical-color-dot" style="background:#8a7a58;" data-color="#8a7a58"></div>' +
            '<div class="es-tactical-color-dot" style="background:#c4b08a;" data-color="#c4b08a"></div>' +
          '</div>' +
          '<div class="es-tactical-section-head"><span>CAMPI</span><span>-</span></div>' +
          '<div id="pitch-selectors">' +
            '<div class="es-tactical-pitch-thumb is-active" data-pitch="full" title="Campo Intero Orizzontale"><div style="width:100%; height:100%; border:1.5px solid #fff; position:relative;"><div style="position:absolute; left:50%; top:0; bottom:0; width:1px; background:#fff;"></div><div style="position:absolute; left:50%; top:50%; width:16px; height:16px; border:1px solid #fff; border-radius:50%; transform:translate(-50%,-50%);"></div></div></div>' +
            '<div class="es-tactical-pitch-thumb" data-pitch="half-att" title="Mezzo Campo Attacco"><div style="width:100%; height:100%; border:1.5px solid #fff; position:relative;"><div style="position:absolute; top:20%; bottom:20%; left:0; width:35%; border:1.5px solid #fff; border-left:none;"></div></div></div>' +
            '<div class="es-tactical-pitch-thumb" data-pitch="half-def" title="Mezzo Campo Difesa"><div style="width:100%; height:100%; border:1.5px solid #fff; position:relative;"><div style="position:absolute; top:20%; bottom:20%; right:0; width:35%; border:1.5px solid #fff; border-right:none;"></div></div></div>' +
            '<div class="es-tactical-pitch-thumb" data-pitch="zones" title="Campo a Zone"><div style="width:100%; height:100%; border:1.5px solid #fff; display:grid; grid-template-columns:1fr 2fr 1fr;"><div style="border-right:1px dashed #fff;"></div><div></div><div style="border-left:1px dashed #fff;"></div></div></div>' +
          '</div>' +
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
            '<div class="es-tactical-color-dot is-selected" style="background:#a8946c;"></div>' +
            '<div class="es-tactical-color-dot" style="background:#ef4444;"></div>' +
            '<div class="es-tactical-color-dot" style="background:#8a7a58;"></div>' +
            '<div class="es-tactical-color-dot" style="background:#0f172a;"></div>' +
          '</div>' +
          '<div class="es-tactical-section-head"><span>GIOCATORI TATTICI</span><span>-</span></div>' +
          '<div id="player-silhouettes-list">' +
            '<div class="es-tactical-player-item" data-pose="corsa">🏃 Corsa</div>' +
            '<div class="es-tactical-player-item" data-pose="tiro">⚽ Tiro in porta</div>' +
            '<div class="es-tactical-player-item" data-pose="passaggio">👟 Passaggio corto</div>' +
            '<div class="es-tactical-player-item" data-pose="contrasto">🛡️ Contrasto / Duello</div>' +
            '<div class="es-tactical-player-item" data-pose="portiere">🧤 Presa Portiere</div>' +
          '</div>' +
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

  // ============================================================
  // EVENT BINDING SU TUTTI I COMPONENTI
  // ============================================================
  function bindHubEvents() {
    var mount = document.getElementById('es-cd');
    if (!mount) return;
    var data = getCoachData();

    // Tabs click
    mount.querySelectorAll('.es-mister-nav-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeTab = btn.getAttribute('data-tab');
        renderHub();
      });
    });

    // 1. Modifica dati Club
    var btnEditClub = mount.querySelector('#btn-edit-club-data');
    if (btnEditClub) {
      btnEditClub.onclick = function () { openEditClubDataModal(data); };
    }

    // 2. Modifica Stemma e Foto Squadra
    var btnChangeCrest = mount.querySelector('#btn-change-crest');
    var inpCrest = mount.querySelector('#inp-file-crest');
    if (btnChangeCrest && inpCrest) {
      btnChangeCrest.onclick = function () { inpCrest.click(); };
      inpCrest.onchange = function (e) {
        var file = e.target.files && e.target.files[0];
        if (file) {
          var reader = new FileReader();
          reader.onload = function (evt) {
            data.logoUrl = evt.target.result;
            saveCoachData(data);
            renderHub();
            if (window.showToast) window.showToast('Stemma societario aggiornato!', 'success');
          };
          reader.readAsDataURL(file);
        }
      };
    }

    var btnChangeTeamPhoto = mount.querySelector('#btn-change-team-photo');
    var inpTeamPhoto = mount.querySelector('#inp-file-team-photo');
    if (btnChangeTeamPhoto && inpTeamPhoto) {
      btnChangeTeamPhoto.onclick = function () { inpTeamPhoto.click(); };
      inpTeamPhoto.onchange = function (e) {
        var file = e.target.files && e.target.files[0];
        if (file) {
          var reader = new FileReader();
          reader.onload = function (evt) {
            data.teamPhotoUrl = evt.target.result;
            saveCoachData(data);
            renderHub();
            if (window.showToast) window.showToast('Foto ufficiale squadra aggiornata!', 'success');
          };
          reader.readAsDataURL(file);
        }
      };
    }

    // 3. Aggiungi & Modifica Staff
    var btnAddStaffCoach = mount.querySelector('#btn-add-staff-coach');
    if (btnAddStaffCoach) {
      btnAddStaffCoach.onclick = function () { openAddStaffModal(data); };
    }
    mount.querySelectorAll('[data-edit-staff-idx]').forEach(function (btn) {
      btn.onclick = function () {
        var idx = parseInt(btn.getAttribute('data-edit-staff-idx'));
        openAddStaffModal(data, idx);
      };
    });

    // 4. Squadra (Roster)
    var btnStatsRoster = mount.querySelector('#btn-stats-roster');
    if (btnStatsRoster) {
      btnStatsRoster.onclick = function () { openRosterStatsModal(data); };
    }
    var btnAddPlayer = mount.querySelector('#btn-add-player');
    if (btnAddPlayer) {
      btnAddPlayer.onclick = function () { openAddPlayerModal(data); };
    }
    mount.querySelectorAll('[data-edit-player]').forEach(function (btn) {
      btn.onclick = function () {
        var idx = parseInt(btn.getAttribute('data-edit-player'));
        openAddPlayerModal(data, idx);
      };
    });

    // 5. Allenamenti
    var btnAddTrain = mount.querySelector('#btn-add-training');
    if (btnAddTrain) {
      btnAddTrain.onclick = function () { openAddTrainingModal(data); };
    }
    mount.querySelectorAll('[data-open-training-details]').forEach(function (banner) {
      banner.onclick = function () {
        var tId = banner.getAttribute('data-open-training-details');
        var tr = (data.trainingsList || []).find(function(t){ return t.id === tId; });
        if (tr) {
          var html =
            '<div style="background:#040810; border:1px solid rgba(148,163,184,0.18); border-radius:4px; padding:1rem; margin-bottom:1rem;">' +
              '<h4 style="font-size:1.1rem; font-weight:800; color:#c4b08a; margin:0 0 0.4rem;">' + esc(tr.title) + '</h4>' +
              '<div style="font-size:0.85rem; color:#cbd5e1; line-height:1.7;">' +
                '• <b>Data:</b> ' + esc(tr.fullDate || (tr.day + ' ' + tr.date)) + '<br>' +
                '• <b>Orario:</b> ' + esc(tr.inizio) + ' - ' + esc(tr.fine) + ' (Incontro: ' + esc(tr.incontro) + ')<br>' +
                '• <b>Campo:</b> ' + esc(tr.campo) + '<br>' +
                '• <b>Focus Seduta:</b> ' + esc(tr.focus) +
              '</div>' +
            '</div>' +
            '<div style="display:flex; justify-content:space-between; gap:0.6rem;">' +
              '<button type="button" class="es-pres-btn-secondary" id="btn-del-training" style="color:#f87171; border-color:rgba(239,68,68,0.4);">Elimina Seduta</button>' +
              '<button type="button" class="es-pres-btn-primary" id="btn-close-train-dt">Chiudi</button>' +
            '</div>';
          openCoachModal('Dettaglio Seduta di Allenamento', '🏃‍♂️', html);
          var overlay = document.getElementById('es-coach-modal-overlay');
          var bClose = document.getElementById('btn-close-train-dt');
          var bDel = document.getElementById('btn-del-training');
          if (bClose && overlay) bClose.onclick = function() { overlay.remove(); };
          if (bDel) {
            bDel.onclick = function() {
              if (confirm('Sei sicuro di voler eliminare questa seduta?')) {
                data.trainingsList = data.trainingsList.filter(function(t){ return t.id !== tId; });
                saveCoachData(data);
                if (overlay) overlay.remove();
                renderHub();
                if (window.showToast) window.showToast('Seduta eliminata.', 'info');
              }
            };
          }
        }
      };
    });

    // Interazioni Voti Like / Dislike
    mount.querySelectorAll('.es-training-vote-btn').forEach(function (btn) {
      btn.onclick = function () {
        var trainId = btn.getAttribute('data-train-id');
        var voteVal = btn.getAttribute('data-vote-val');
        var curUser = userObj();
        var myUserId = curUser.id || 'u-me';
        var myUserName = (curUser.nome ? (curUser.nome + ' ' + (curUser.cognome || '')) : (curUser.name || 'Mister')).trim();
        var myRole = curUser.ruolo || curUser.siteRoleFamily || 'Allenatore';

        var train = (data.trainingsList || []).find(function (t) { return t.id === trainId; });
        if (train) {
          train.votes = train.votes || {};
          train.votes[myUserId] = {
            id: myUserId,
            name: myUserName,
            role: myRole,
            vote: voteVal,
            isStaff: true
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

    // 6. Partite
    var btnStatsMatch = mount.querySelector('#btn-stats-match');
    if (btnStatsMatch) {
      btnStatsMatch.onclick = function () { openMatchStatsModal(data); };
    }
    var btnAddMatch = mount.querySelector('#btn-add-match');
    if (btnAddMatch) {
      btnAddMatch.onclick = function () { openAddMatchModal(data); };
    }
    mount.querySelectorAll('[data-match-convocati]').forEach(function (btn) {
      btn.onclick = function () {
        var mIdx = parseInt(btn.getAttribute('data-match-convocati'));
        var match = (data.partite || [])[mIdx];
        if (match) openMatchConvocatiModal(match, mIdx, data);
      };
    });

    // 7. Lavagna Tattica
    var btnCreateTactic = mount.querySelector('#btn-create-tactic');
    if (btnCreateTactic) {
      btnCreateTactic.onclick = openTacticalEditor;
    }
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
  }

  // ============================================================
  // HELPER GLOBALI PER LA LIBRERIA IMMAGINI
  // ============================================================
  window.viewSchemePreview = function (idx) {
    var data = getCoachData();
    var s = (data.tacticalSchemes || [])[idx];
    if (!s) return;
    var html =
      '<div style="text-align:center;">' +
        '<img src="' + esc(s.preview) + '" alt="' + esc(s.title) + '" style="max-width:100%; max-height:60vh; border-radius:4px; border:1px solid rgba(148,163,184,0.2);">' +
        '<div style="font-size:0.85rem; color:#94a3b8; margin-top:0.75rem;">' + esc(s.type) + ' · Creato il ' + esc(s.date) + '</div>' +
      '</div>';
    openCoachModal(s.title, '👁️', html);
  };

  window.downloadSchemePDF = function (idx) {
    var data = getCoachData();
    var s = (data.tacticalSchemes || [])[idx];
    if (!s) return;
    window.print();
    if (window.showToast) window.showToast('Apertura finestra di stampa PDF per ' + s.title, 'info');
  };

  window.deleteScheme = function (idx) {
    var data = getCoachData();
    if (confirm('Sei sicuro di voler eliminare questo schema dalla libreria?')) {
      data.tacticalSchemes.splice(idx, 1);
      saveCoachData(data);
      renderHub();
      if (window.showToast) window.showToast('Schema rimosso dalla libreria.', 'info');
    }
  };

  // ============================================================
  // MOUNT & BOOTSTRAP
  // ============================================================
  function render(force) {
    var group = document.getElementById('user-dossier-view-group');
    if (!group) return;
    var u = userObj();
    if (!force && !isCoach(u)) return;

    group.classList.add('is-coach-dash');
    var staffProfile = document.getElementById('es-staff-profile');
    if (!staffProfile) return;
    staffProfile.classList.add('es-cd-on');
    staffProfile.classList.remove('es-pd-on', 'es-ds-on', 'es-pres-on', 'es-vice-on');

    var cd = document.getElementById('es-cd');
    if (!cd) {
      cd = document.createElement('div');
      cd.id = 'es-cd';
      staffProfile.appendChild(cd);
    }
    cd.hidden = false;
    cd.removeAttribute('hidden');
    cd.style.display = 'block';
    renderHub();
  }

  function detach() {
    var group = document.getElementById('user-dossier-view-group');
    if (group) group.classList.remove('is-coach-dash');
    var staffProfile = document.getElementById('es-staff-profile');
    if (staffProfile) {
      staffProfile.classList.remove('es-cd-on');
      staffProfile.classList.remove('es-pd-on');
    }
    var cd = document.getElementById('es-cd');
    if (cd) {
      cd.hidden = true;
      cd.style.removeProperty('display');
    }
  }

  window.EliseeCoachDash = {
    render: render,
    detach: detach,
    isCoach: isCoach,
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
