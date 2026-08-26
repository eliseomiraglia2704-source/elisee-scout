/* ============================================================
   ELISEE SCOUT — Area Presidente (Presidential Hub)
   5 Macro-aree Attive: CLUB | SQUADRA | ALLENAMENTI | PARTITE | LAVAGNA
   Incluso:
   - Hub Eventi & Tasto + Crea Evento
   - Car Sharing per Genitori, Atleti & Staff (Trasferte / Allenamenti)
   - Gestione Ferie/Malattia & Riepilogo Eventi
   - Gestione Presenze con Like (Ci sono) / Dislike (Non ci sono) & Modale Votanti
   - Modale Statistiche Partite & Modale Nuovo Calciatore + Lavagna Tattica
   ============================================================ */
(function () {
  'use strict';

  var activeTab = 'allenamenti';

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

  function isPres(u) {
    u = u || userObj();
    var blob = [u.staffRole, u.ruoloDettagliato, u.ruolo, u.role, u.siteRoleFamily, u.staffProfile && u.staffProfile.fieldRole]
      .filter(Boolean).join(' ').toLowerCase();
    return /presidente|presidenza|club president/.test(blob);
  }

  function getPresData() {
    var u = userObj();
    var def = {
      clubName: u.squadra || u.club || 'Elisee',
      matricola: u.matricola || '13943 / FIGC',
      sede: u.sede || 'Viale Giuseppe Mazzini, 35/C Foggia FG',
      stadio: u.stadio || 'Stadio Comunale Pino Zaccheria',
      telefono: u.telefono || '+39 0881 742911',
      presName: (u.nome ? (u.nome + ' ' + (u.cognome || '')) : (u.name || 'The King')).trim(),
      presRole: 'Presidente &amp; Proprietario Club',
      presDoc: 'Verificato 100%',
      presTessera: 'FIGC-PRES-001',
      presScadenza: 'Vitalizio / Esecutivo',
      logoUrl: 'immagini/squadre-loghi/foggia.png',
      teamPhotoUrl: 'immagini/04-workspace-scout/scout-workspace.svg?v=20260730_225504',
      roster: [
        { id: 'p-1', num: 1, name: 'Marco Fumagalli', role: 'Portiere', birth: '2001', cert: 'Regolare', status: 'disp', app: 28 },
        { id: 'p-2', num: 2, name: 'Alessandro Silvestro', role: 'Terzino Destro', birth: '2002', cert: 'Regolare', status: 'disp', app: 25 },
        { id: 'p-5', num: 5, name: 'Luigi Carillo', role: 'Difensore Centrale', birth: '1996', cert: 'Regolare', status: 'disp', app: 28 },
        { id: 'p-6', num: 6, name: 'Davide Di Pasquale', role: 'Difensore Centrale', birth: '1996', cert: 'Regolare', status: 'disp', app: 26 },
        { id: 'p-3', num: 3, name: 'Luca Rizzo Pinna', role: 'Terzino Sinistro', birth: '2003', cert: 'Regolare', status: 'disp', app: 24 },
        { id: 'p-8', num: 8, name: 'Moses Odjer', role: 'Mediano', birth: '1996', cert: 'Regolare', status: 'disp', app: 27 },
        { id: 'p-4', num: 4, name: 'Jacopo Petermann', role: 'Regista', birth: '1994', cert: 'Regolare', status: 'disp', app: 26 },
        { id: 'p-10', num: 10, name: 'Diego Peralta', role: 'Trequartista', birth: '1996', cert: 'Regolare', status: 'disp', app: 28 },
        { id: 'p-7', num: 7, name: 'Eliseo Miraglia', role: 'Ala Sinistra', birth: '2004', cert: 'Regolare', status: 'disp', app: 28 },
        { id: 'p-11', num: 11, name: 'Roberto Ogunseye', role: 'Attaccante Centrale', birth: '1995', cert: 'Regolare', status: 'disp', app: 27 },
        { id: 'p-9', num: 9, name: 'Alexis Ferrante', role: 'Seconda Punta', birth: '1995', cert: 'Regolare', status: 'disp', app: 25 }
      ],
      staffMembers: [
        { id: 'st-pres', name: 'The King (Eliseo Miraglia)', role: 'Presidente' },
        { id: 'st-coach', name: 'Allenatore Prima Squadra', role: 'Allenatore' },
        { id: 'st-vice', name: 'Vice Allenatore', role: 'Vice Allenatore' },
        { id: 'st-prep', name: 'Luca Rossi', role: 'Preparatore Atletico' },
        { id: 'st-fisio', name: 'Antonio Gentile', role: 'Fisioterapista' }
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
        }
      ],
      carSharingPool: [
        {
          id: 'car-1',
          driverName: 'Mario Rossi',
          driverRole: 'Genitore (Papà di Luca)',
          carModel: 'Volkswagen Tiguan (Grigio scuro)',
          totalSeats: 4,
          departurePoint: 'Piazzale Centro Comm. Grandapulia',
          departureTime: '18:15',
          destination: 'Stadio Pino Zaccheria (Allenamento)',
          notes: 'Disponibile anche per il ritorno alle 20:45',
          passengers: ['Luca Rossi (2009)', 'Alessandro S. (2009)']
        },
        {
          id: 'car-2',
          driverName: 'Giuseppe Miraglia',
          driverRole: 'Genitore / Socio Club',
          carModel: 'Fiat 500L (Bianca)',
          totalSeats: 3,
          departurePoint: 'Viale Europa 12 (Bar Centrale)',
          departureTime: '18:25',
          destination: 'Stadio Pino Zaccheria',
          notes: 'Passaggio diretto verso il campo A',
          passengers: ['Eliseo Miraglia (2004)']
        }
      ],
      leaveRecords: [
        { name: 'Antonio Gentile', role: 'Fisioterapista', reason: 'Ferie programmate', from: '05/09/2026', to: '08/09/2026', status: 'Approvato' }
      ],
      partite: [
        { id: 'match-1', date: 'Domenica · Ore 15:00', opponent: 'Elisee vs Taranto', comp: 'Campionato Serie D · Girone H', stadium: 'Stadio Pino Zaccheria', status: 'Prossima Gara', conv: '22 Convocati' }
      ],
      tacticalSchemes: [
        {
          id: 'tac-1',
          title: 'Strategia Presidenziale: Assetto Tecnico 2026/27',
          date: '26/08/2026',
          type: 'Direttiva Presidenziale',
          preview: 'immagini/04-workspace-scout/scout-workspace.svg?v=20260730_225504'
        }
      ],
      stats: {
        torneo: 'Tutti i tornei',
        totale: { giocate: 28, vinte: 19, pareggi: 5, perse: 4, gf: 54, gs: 22, dr: '+32', pt: 62 },
        casa: { giocate: 14, vinte: 11, pareggi: 2, perse: 1, gf: 32, gs: 9, dr: '+23', pt: 35 },
        trasferta: { giocate: 14, vinte: 8, pareggi: 3, perse: 3, gf: 22, gs: 13, dr: '+9', pt: 27 }
      }
    };

    try {
      var stored = localStorage.getItem('elisee_pres_hub_data');
      if (stored) return Object.assign(def, JSON.parse(stored));
    } catch (_) {}
    return def;
  }

  function savePresData(data) {
    try {
      localStorage.setItem('elisee_pres_hub_data', JSON.stringify(data));
      if (data.trainingsList) {
        localStorage.setItem('elisee_club_trainings_shared', JSON.stringify(data.trainingsList));
      }
    } catch (_) {}
  }

  var TAB_DESCS = {
    club: 'Organizzazione societaria, dirigenti e staff tecnico.',
    squadra: 'Gestione della rosa, ruoli e dati dei giocatori.',
    allenamenti: 'Pianificazione eventi societari, car sharing genitori e allenamenti.',
    partite: 'Calendario, convocazioni e gestione delle partite.',
    lavagna: 'Strumenti tattici per schemi, analisi e strategie.'
  };

  function renderHub() {
    var mount = document.getElementById('es-prd');
    if (!mount) return;

    var data = getPresData();

    var html =
      '<div class="es-mister-hub">' +
        '<div class="es-mister-trial-bar">' +
          '<div class="es-mister-trial-text"><span>👑</span> Stai operando come Presidente &amp; Vertice Societario.</div>' +
          '<button type="button" class="es-mister-btn-sub" onclick="if(window.showToast){ window.showToast(\'👑 Accesso Club Master 100% Attivo.\', \'success\'); }">Abbonati</button>' +
        '</div>' +

        '<div class="es-mister-wrap">' +
          '<div class="es-mister-club-header">' +
            '<div class="es-mister-club-main">' +
              '<div class="es-mister-crest-badge"><img src="' + esc(data.logoUrl) + '" alt="' + esc(data.clubName) + '" onerror="this.src=\'immagini/squadre-loghi/napoli.png\';"></div>' +
              '<div>' +
                '<div class="es-mister-club-tags"><span class="es-mister-tag es-mister-tag-primary">PRIMA SQUADRA</span><span class="es-mister-tag es-mister-tag-dark">Stagione in corso</span><span class="es-mister-tag es-mister-tag-gold">Presidente | Admin Club</span></div>' +
                '<h1 class="es-mister-club-title">' + esc(data.clubName) + '</h1>' +
                '<p class="es-mister-club-desc" id="pres-tab-desc">' + esc(TAB_DESCS[activeTab]) + '</p>' +
              '</div>' +
            '</div>' +
          '</div>' +

          '<nav class="es-mister-nav-bar" role="tablist">' +
            '<button type="button" class="es-mister-nav-tab ' + (activeTab === 'club' ? 'is-active' : '') + '" data-tab="club">🛡️ Club</button>' +
            '<button type="button" class="es-mister-nav-tab ' + (activeTab === 'squadra' ? 'is-active' : '') + '" data-tab="squadra">👥 Squadra</button>' +
            '<button type="button" class="es-mister-nav-tab ' + (activeTab === 'allenamenti' ? 'is-active' : '') + '" data-tab="allenamenti">📅 Eventi &amp; Allenamenti</button>' +
            '<button type="button" class="es-mister-nav-tab ' + (activeTab === 'partite' ? 'is-active' : '') + '" data-tab="partite">⚽ Partite</button>' +
            '<button type="button" class="es-mister-nav-tab ' + (activeTab === 'lavagna' ? 'is-active' : '') + '" data-tab="lavagna">🖌️ Lavagna</button>' +
          '</nav>' +

          '<div id="pres-tab-content">' +
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
            '<button type="button" class="es-mister-circle-btn" id="btn-pres-edit-club-data">✏️</button>' +
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
            '<div class="es-mister-card-title-wrap"><span class="es-mister-card-icon">👑</span><div><h3 class="es-mister-card-title">Staff Tecnico &amp; Presidenza</h3><p class="es-mister-card-sub">Organigramma e nomine del Presidente</p></div></div>' +
            '<button type="button" class="es-mister-circle-btn" id="btn-pres-add-staff">+</button>' +
          '</div>' +
          '<div class="es-mister-staff-box">' +
            '<div class="es-mister-staff-left"><div class="es-mister-staff-avatar" style="background:#facc15; color:#000;">👑</div><div><h4 class="es-mister-staff-name">' + esc(data.presName) + '</h4><div class="es-mister-staff-role">' + esc(data.presRole) + '</div><div class="es-mister-staff-meta"><span>Doc: <b>' + esc(data.presDoc) + '</b></span><span>Tessera: <b>' + esc(data.presTessera) + '</b></span><span>Status: <b>' + esc(data.presScadenza) + '</b></span></div></div></div>' +
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
            '<div class="es-mister-player-info"><h4 class="es-mister-player-name">' + esc(p.name) + '</h4><div class="es-mister-player-role">' + esc(p.role) + ' · Anno ' + esc(p.birth) + '</div><div style="font-size:0.72rem; color:#64748b;">🟢 Tesserato FIGC · ' + p.app + ' Presenze</div></div>' +
            '<button type="button" class="es-mister-circle-btn" style="width:30px; height:30px; font-size:0.8rem;" data-pres-edit-player="' + idx + '">✏️</button>' +
          '</div>'
        );
      }).join('');

      return (
        '<div class="es-mister-card-white">' +
          '<div class="es-mister-card-header">' +
            '<div class="es-mister-card-title-wrap"><span class="es-mister-card-icon">👥</span><div><h3 class="es-mister-card-title">Squadra</h3><p class="es-mister-card-sub">' + esc(data.clubName) + ' · Prima Squadra (' + (data.roster || []).length + ' Giocatori in rosa)</p></div></div>' +
            '<div class="es-mister-card-actions">' +
              '<button type="button" class="es-mister-circle-btn" id="btn-pres-stats" title="Statistiche partite">📊</button>' +
              '<button type="button" class="es-mister-circle-btn" id="btn-pres-add-player" title="Nuovo calciatore">+</button>' +
            '</div>' +
          '</div>' +
          '<div class="es-mister-roster-grid">' + playersHtml + '</div>' +
        '</div>'
      );
    }

    if (tab === 'allenamenti') {
      var curUser = userObj();
      var myUserId = curUser.id || 'u-me';

      var nextEvent = (data.trainingsList || [])[0] || {
        id: 'train-1',
        day: 'mar',
        date: '01/09',
        title: 'Allenamento',
        focus: 'Seduta Tattica & Pressione Alta',
        incontro: '-:-',
        inizio: '19:00',
        fine: '20:30',
        votes: {}
      };

      var v = nextEvent.votes || {};
      var yesCount = 0, maybeCount = 0, noCount = 0;
      Object.keys(v).forEach(function (k) {
        if (v[k].vote === 'yes') yesCount++;
        else if (v[k].vote === 'maybe') maybeCount++;
        else if (v[k].vote === 'no') noCount++;
      });
      var myVote = (v[myUserId] && v[myUserId].vote) || (v['st-pres'] && v['st-pres'].vote);

      var carsCount = (data.carSharingPool || []).length;
      var leavesCount = (data.leaveRecords || []).length;

      return (
        '<div class="es-mister-card-white">' +
          // Header EVENTI
          '<h2 class="es-events-hub-title"><span style="font-size:1.8rem;">📅</span> EVENTI</h2>' +

          // Grande pulsante nero + Crea evento
          '<button type="button" class="es-btn-create-event-big" id="btn-pres-create-event">' +
            '<span>+</span> Crea evento' +
          '</button>' +

          // Sezione Prossimo Evento
          '<div class="es-events-section-header">' +
            '<h3 class="es-events-section-title">Prossimo evento</h3>' +
            '<a class="es-events-view-all-link" id="link-view-all-events">Visualizza tutto</a>' +
          '</div>' +

          // Card Prossimo Evento (TeamPlus)
          '<div class="es-training-event-card" id="pres-card-' + nextEvent.id + '">' +
            '<div class="es-training-head-banner">' +
              '<div class="es-training-date-block">' +
                '<div class="es-training-day-chip"><span class="es-training-day-txt">' + esc(nextEvent.day) + '</span><span class="es-training-date-txt">' + esc(nextEvent.date) + '</span></div>' +
                '<div style="border-left:1.5px solid rgba(0,0,0,0.15); height:32px; margin:0 0.5rem;"></div>' +
                '<div><h4 class="es-training-title-txt">' + esc(nextEvent.title) + '</h4><div style="font-size:0.75rem; color:#092621; opacity:0.85;">' + esc(nextEvent.focus) + '</div></div>' +
              '</div>' +
              '<span style="font-size:1.4rem; font-weight:800; opacity:0.7;">&rsaquo;</span>' +
            '</div>' +

            '<div class="es-training-times-grid">' +
              '<div class="es-training-time-col"><div class="es-training-time-val">' + esc(nextEvent.incontro) + '</div><div class="es-training-time-lbl">Incontro</div></div>' +
              '<div class="es-training-time-col"><div class="es-training-time-val">' + esc(nextEvent.inizio) + '</div><div class="es-training-time-lbl">Inizio</div></div>' +
              '<div class="es-training-time-col"><div class="es-training-time-val">' + esc(nextEvent.fine) + '</div><div class="es-training-time-lbl">Fine</div></div>' +
            '</div>' +

            '<div class="es-training-actions-bar">' +
              '<div class="es-training-vote-group">' +
                '<button type="button" class="es-training-vote-btn ' + (myVote === 'yes' ? 'is-voted-yes' : '') + '" data-train-id="' + nextEvent.id + '" data-vote-val="yes" title="Ci sono (Presente)"><span>👍</span> <span>' + yesCount + '</span></button>' +
                '<button type="button" class="es-training-vote-btn ' + (myVote === 'maybe' ? 'is-voted-maybe' : '') + '" data-train-id="' + nextEvent.id + '" data-vote-val="maybe" title="In forse"><span>❓</span> <span>' + maybeCount + '</span></button>' +
                '<button type="button" class="es-training-vote-btn ' + (myVote === 'no' ? 'is-voted-no' : '') + '" data-train-id="' + nextEvent.id + '" data-vote-val="no" title="Non ci sono (Assente)"><span>👎</span> <span>' + noCount + '</span></button>' +
              '</div>' +
              '<button type="button" class="es-training-participants-btn" data-open-pres-voters-id="' + nextEvent.id + '" title="Vedi tutti coloro che hanno risposto">👥</button>' +
            '</div>' +
          '</div>' +

          // 3 Quick Action Cards: Riepilogo, Ferie/Malattia, Car Sharing
          '<div class="es-events-quick-grid">' +
            // Card 1: Riepilogo evento
            '<div class="es-events-quick-card" id="card-action-summary">' +
              '<div>' +
                '<div class="es-quick-card-icon">📅</div>' +
                '<h4 class="es-quick-card-title">Riepilogo evento</h4>' +
                '<p class="es-quick-card-sub">' + (data.trainingsList && data.trainingsList.length > 0 ? (data.trainingsList.length + ' eventi in programma') : 'Nessun evento questo mese...') + '</p>' +
              '</div>' +
            '</div>' +

            // Card 2: Ferie/Malattia
            '<div class="es-events-quick-card" id="card-action-leaves">' +
              '<div>' +
                '<div class="es-quick-card-icon">➕</div>' +
                '<h4 class="es-quick-card-title">Ferie/Malattia</h4>' +
                '<p class="es-quick-card-sub">' + (leavesCount > 0 ? (leavesCount + ' assenza registrata') : "Nessun'assenza") + '</p>' +
              '</div>' +
            '</div>' +

            // Card 3: Car sharing
            '<div class="es-events-quick-card" id="card-action-carsharing">' +
              '<div>' +
                '<div class="es-quick-card-icon">🚗</div>' +
                '<h4 class="es-quick-card-title">Car sharing</h4>' +
                '<p class="es-quick-card-sub">' + (carsCount > 0 ? (carsCount + ' auto disponibili questa settimana') : '0 questa settimana') + '</p>' +
              '</div>' +
            '</div>' +
          '</div>' +

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
            '<div class="es-mister-card-actions"><button type="button" class="es-mister-circle-btn" id="btn-pres-match-stats">📊</button><button type="button" class="es-mister-circle-btn" id="btn-pres-add-match">+</button></div>' +
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
                  '<div class="es-tactical-card-thumb"><img src="' + esc(s.preview) + '" alt="' + esc(s.title) + '"></div>' +
                  '<h4 style="font-size:0.95rem; font-weight:800; color:#0f172a; margin:0 0 0.2rem;">' + esc(s.title) + '</h4>' +
                  '<div style="font-size:0.75rem; color:#64748b; margin-bottom:0.75rem;">' + esc(s.type) + ' · ' + esc(s.date) + '</div>' +
                  '<div style="display:flex; gap:0.4rem;">' +
                    '<button type="button" class="btn btn-outline-pill" style="padding:0.3rem 0.65rem; font-size:0.75rem;" onclick="window.viewPresSchemePreview(' + idx + ')">👁️ Apri</button>' +
                    '<button type="button" class="btn btn-outline-pill" style="padding:0.3rem 0.65rem; font-size:0.75rem;" onclick="window.downloadPresSchemePDF(' + idx + ')">📥 PDF</button>' +
                    '<button type="button" class="btn btn-outline-pill" style="padding:0.3rem 0.65rem; font-size:0.75rem; color:#ef4444; border-color:#fca5a5;" onclick="window.deletePresScheme(' + idx + ')">🗑️</button>' +
                  '</div>' +
                '</div>'
              );
            }).join('') +
          '</div>');

      return (
        '<div class="es-mister-card-white">' +
          '<div class="es-mister-card-header">' +
            '<div class="es-mister-card-title-wrap"><span class="es-mister-card-icon">🖌️</span><div><h3 class="es-mister-card-title">Lavagna Tattica</h3><p class="es-mister-card-sub">' + esc(data.clubName) + ' · Prima Squadra (Presidenza)</p></div></div>' +
            '<div class="es-mister-card-actions">' +
              '<input type="file" id="pres-file-upload" accept="image/png,image/jpeg,application/pdf" style="display:none;">' +
              '<button type="button" class="btn btn-outline-pill" id="btn-pres-upload-file" style="background:#f8fafc; border:1.5px solid #cbd5e1; color:#0f172a; padding:0.55rem 1.15rem; font-weight:800; font-size:0.85rem; display:inline-flex; align-items:center; gap:0.45rem;">📁 Carica immagine / PDF</button>' +
              '<button type="button" class="btn btn-outline-pill pf-btn-solid" id="btn-pres-create-tactic" style="background:#0d9488; color:#ffffff; border:none; padding:0.55rem 1.25rem; font-weight:800; font-size:0.85rem; display:inline-flex; align-items:center; gap:0.45rem;">🖌️ Crea immagine</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="es-mister-card-white">' +
          '<div class="es-mister-card-header" style="margin-bottom:0.6rem;"><div><h3 class="es-mister-card-title" style="font-size:1.15rem;">Libreria immagini</h3><p class="es-mister-card-sub">Immagini create e salvate dalla lavagna tattica o caricate dalla presidenza.</p></div></div>' +
          galleryHtml +
        '</div>'
      );
    }

    return '';
  }

  // ============================================================
  // MODALE CAR SHARING PER GENITORI & STAFF (Screenshot)
  // ============================================================
  function openCarSharingModal() {
    var old = document.getElementById('es-pres-carsharing-overlay');
    if (old) old.remove();

    var data = getPresData();
    var cars = data.carSharingPool || [];

    var carsListHtml = cars.length === 0
      ? '<div style="text-align:center; padding:2rem; color:#94a3b8; font-weight:600;">Nessuna auto o passaggio messo a disposizione per questa settimana.<br>I genitori e lo staff possono aggiungere la propria auto cliccando in basso.</div>'
      : cars.map(function (c, idx) {
          var passCount = (c.passengers || []).length;
          var freeSeats = Math.max(0, c.totalSeats - passCount);
          var isFull = freeSeats === 0;

          var passChips = (c.passengers || []).map(function (p) {
            return '<span class="es-passenger-chip">👤 ' + esc(p) + '</span>';
          }).join('');

          return (
            '<div class="es-car-item-card">' +
              '<div class="es-car-header">' +
                '<div>' +
                  '<h4 class="es-car-driver-name">🚗 ' + esc(c.driverName) + ' <span class="es-car-driver-tag">' + esc(c.driverRole) + '</span></h4>' +
                  '<div style="font-size:0.8rem; color:#64748b; margin-top:0.2rem;">🚘 ' + esc(c.carModel) + '</div>' +
                '</div>' +
                '<span class="es-car-seats-badge ' + (isFull ? 'is-full' : '') + '">' +
                  (isFull ? 'Auto al completo (0 posti)' : (freeSeats + ' posti liberi su ' + c.totalSeats)) +
                '</span>' +
              '</div>' +

              '<div class="es-car-details-row">' +
                '<span>📍 <b>Partenza:</b> ' + esc(c.departurePoint) + '</span>' +
                '<span>⏰ <b>Ore:</b> ' + esc(c.departureTime) + '</span>' +
                '<span>🎯 <b>Destinazione:</b> ' + esc(c.destination) + '</span>' +
              '</div>' +

              (c.notes ? ('<div style="font-size:0.8rem; color:#475569; background:#ffffff; border-radius:8px; padding:0.4rem 0.65rem; margin-bottom:0.6rem; border:1px dashed #cbd5e1;">💬 <i>' + esc(c.notes) + '</i></div>') : '') +

              '<div>' +
                '<div style="font-size:0.75rem; font-weight:800; color:#64748b; text-transform:uppercase;">Passeggeri a bordo (' + passCount + '/' + c.totalSeats + '):</div>' +
                '<div class="es-car-passengers-list">' + (passChips || '<span style="font-size:0.75rem; color:#94a3b8; font-style:italic;">Nessun passeggero prenotato ancora</span>') + '</div>' +
              '</div>' +

              '<div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:0.9rem;">' +
                (!isFull ? ('<button type="button" class="btn btn-outline-pill pf-btn-solid" style="background:#0d9488; color:#ffffff; border:none; padding:0.45rem 1.1rem; font-size:0.84rem; font-weight:800;" onclick="window.bookCarSeat(' + idx + ')">🙋‍♂️ Prenota posto a bordo</button>') : '') +
                '<button type="button" class="btn btn-outline-pill" style="color:#ef4444; border-color:#fca5a5; padding:0.45rem 0.75rem; font-size:0.8rem;" onclick="window.deleteCarItem(' + idx + ')">🗑️</button>' +
              '</div>' +
            '</div>'
          );
        }).join('');

    var modal = document.createElement('div');
    modal.id = 'es-pres-carsharing-overlay';
    modal.className = 'es-pres-stats-modal';
    modal.innerHTML =
      '<div class="es-pres-stats-sheet" style="max-width:760px;" role="dialog" aria-modal="true">' +
        '<div style="display:flex; align-items:center; justify-content:space-between; padding-bottom:1rem; border-bottom:1.5px solid #f1f5f9; margin-bottom:1.2rem;">' +
          '<div style="display:flex; align-items:center; gap:0.75rem;">' +
            '<span style="font-size:1.8rem;">🚗</span>' +
            '<div>' +
              '<h2 style="font-size:1.45rem; font-weight:900; margin:0; color:#0f172a;">Car Sharing Club &amp; Genitori</h2>' +
              '<p style="font-size:0.84rem; color:#64748b; margin:0.1rem 0 0;">Condivisione passaggi per allenamenti e trasferte in piena tranquillità</p>' +
            '</div>' +
          '</div>' +
          '<button type="button" class="es-tactical-btn-close" id="btn-close-carsharing" style="font-size:1.6rem; cursor:pointer;">&times;</button>' +
        '</div>' +

        '<div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1rem;">' +
          '<h3 style="font-size:1.1rem; font-weight:900; color:#0f172a; margin:0;">Auto disponibili (' + cars.length + ')</h3>' +
          '<button type="button" class="btn btn-outline-pill pf-btn-solid" id="btn-offer-ride" style="background:#000000; color:#ffffff; border:none; padding:0.55rem 1.25rem; font-weight:800; font-size:0.86rem;">' +
            '🚗 + Offri un passaggio con la tua auto' +
          '</button>' +
        '</div>' +

        '<div style="max-height:55vh; overflow-y:auto; padding-right:0.2rem;">' +
          carsListHtml +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);

    function close() { modal.remove(); }
    modal.querySelector('#btn-close-carsharing').onclick = close;
    modal.onclick = function (e) { if (e.target === modal) close(); };

    modal.querySelector('#btn-offer-ride').onclick = function () {
      openOfferRideModal();
    };
  }

  // ============================================================
  // MODALE OFFRI PASSAGGIO (Genitore / Staff)
  // ============================================================
  function openOfferRideModal() {
    var dName = prompt('Nome del Genitore / Autista (es. Mario Rossi):', 'Genitore Atleta');
    if (!dName) return;
    var dRole = prompt('Ruolo / Relazione (es. Papà di Luca, Staff Tecnico):', 'Genitore');
    var dModel = prompt('Modello e Colore Auto (es. Fiat 500L Bianca):', 'Auto Familiare');
    var dSeats = parseInt(prompt('Quanti posti liberi hai in auto? (es. 3):', '3'), 10) || 3;
    var dDep = prompt('Punto di ritrovo e partenza (es. Piazzale Grandapulia):', 'Piazzale Centrale');
    var dTime = prompt('Orario di ritrovo (es. 18:15):', '18:15');
    var dNotes = prompt('Note (es. Disponibile anche per il ritorno alle 20:45):', 'Passaggio per allenamento');

    var data = getPresData();
    data.carSharingPool = data.carSharingPool || [];
    data.carSharingPool.unshift({
      id: 'car-' + Date.now(),
      driverName: dName,
      driverRole: dRole || 'Genitore',
      carModel: dModel || 'Automobile',
      totalSeats: dSeats,
      departurePoint: dDep || 'Punto di ritrovo',
      departureTime: dTime || '18:00',
      destination: 'Stadio Pino Zaccheria',
      notes: dNotes || '',
      passengers: []
    });
    savePresData(data);
    openCarSharingModal();
    renderHub();
    if (window.showToast) window.showToast('✅ Auto messa a disposizione nel Car Sharing del Club!', 'success');
  }

  // Global methods for car sharing booking
  window.bookCarSeat = function (idx) {
    var pName = prompt('Nome e Cognome del ragazzo / passeggero da prenotare a bordo:', 'Atleta');
    if (pName) {
      var data = getPresData();
      var car = (data.carSharingPool || [])[idx];
      if (car) {
        car.passengers = car.passengers || [];
        if (car.passengers.length < car.totalSeats) {
          car.passengers.push(pName);
          savePresData(data);
          openCarSharingModal();
          renderHub();
          if (window.showToast) window.showToast('🎉 Posto prenotato con successo per ' + pName + '!', 'success');
        } else {
          alert('Questa vettura è già al completo!');
        }
      }
    }
  };

  window.deleteCarItem = function (idx) {
    if (confirm('Vuoi rimuovere questo passaggio dal Car Sharing?')) {
      var data = getPresData();
      data.carSharingPool.splice(idx, 1);
      savePresData(data);
      openCarSharingModal();
      renderHub();
      if (window.showToast) window.showToast('🗑️ Passaggio rimosso', 'info');
    }
  };

  // ============================================================
  // MODALE + CREA EVENTO (Screenshot)
  // ============================================================
  function openCreateEventModal() {
    var old = document.getElementById('es-pres-create-event-overlay');
    if (old) old.remove();

    var modal = document.createElement('div');
    modal.id = 'es-pres-create-event-overlay';
    modal.className = 'es-pres-stats-modal';
    modal.innerHTML =
      '<div class="es-pres-new-player-sheet" style="max-width:540px;" role="dialog" aria-modal="true">' +
        '<div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1.4rem;">' +
          '<h2 style="font-size:1.45rem; font-weight:900; margin:0; color:#0f172a;">📅 Crea nuovo evento</h2>' +
          '<button type="button" class="es-tactical-btn-close" id="btn-close-create-event">&times;</button>' +
        '</div>' +

        '<form id="form-create-event">' +
          '<h4 style="font-size:0.82rem; font-weight:800; color:#0d9488; text-transform:uppercase; letter-spacing:0.04em; margin:0 0 1rem;">DETTAGLI EVENTO CLUB</h4>' +

          '<div class="es-pres-form-row">' +
            '<label class="es-pres-form-lbl">TIPO DI EVENTO</label>' +
            '<select class="es-pres-form-inp" id="inp-ev-tipo" required>' +
              '<option value="Allenamento">🏃‍♂️ Allenamento</option>' +
              '<option value="Partita di Campionato">⚽ Partita di Campionato</option>' +
              '<option value="Amichevole / Torneo">🏆 Amichevole / Torneo</option>' +
              '<option value="Trasferta con Car Sharing">🚗 Trasferta di Squadra</option>' +
              '<option value="Riunione Societaria">📋 Riunione Tecnica / Societaria</option>' +
            '</select>' +
          '</div>' +

          '<div class="es-pres-form-row">' +
            '<label class="es-pres-form-lbl">TITOLO / AVVERSARIO</label>' +
            '<input type="text" class="es-pres-form-inp" id="inp-ev-titolo" placeholder="Es. Allenamento o Taranto vs Elisee" value="Allenamento" required>' +
          '</div>' +

          '<div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">' +
            '<div class="es-pres-form-row">' +
              '<label class="es-pres-form-lbl">GIORNO &amp; DATA</label>' +
              '<input type="text" class="es-pres-form-inp" id="inp-ev-data" placeholder="Es. mar 01/09" value="mar 01/09" required>' +
            '</div>' +
            '<div class="es-pres-form-row">' +
              '<label class="es-pres-form-lbl">CAMPO / LUOGO</label>' +
              '<input type="text" class="es-pres-form-inp" id="inp-ev-luogo" placeholder="Stadio Pino Zaccheria" value="Stadio Comunale Pino Zaccheria" required>' +
            '</div>' +
          '</div>' +

          '<div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:0.6rem;">' +
            '<div class="es-pres-form-row">' +
              '<label class="es-pres-form-lbl">RITROVO</label>' +
              '<input type="text" class="es-pres-form-inp" id="inp-ev-ritrovo" placeholder="-:-" value="-:-">' +
            '</div>' +
            '<div class="es-pres-form-row">' +
              '<label class="es-pres-form-lbl">INIZIO</label>' +
              '<input type="text" class="es-pres-form-inp" id="inp-ev-inizio" placeholder="19:00" value="19:00" required>' +
            '</div>' +
            '<div class="es-pres-form-row">' +
              '<label class="es-pres-form-lbl">FINE</label>' +
              '<input type="text" class="es-pres-form-inp" id="inp-ev-fine" placeholder="20:30" value="20:30" required>' +
            '</div>' +
          '</div>' +

          '<div class="es-pres-form-row">' +
            '<label class="es-pres-form-lbl">FOCUS / DESCRIZIONE</label>' +
            '<input type="text" class="es-pres-form-inp" id="inp-ev-focus" placeholder="Focus tecnico e car sharing abilitato" value="Seduta Tattica &amp; Pressione Alta">' +
          '</div>' +

          '<div style="display:flex; align-items:center; justify-content:flex-end; gap:0.75rem; margin-top:1.5rem;">' +
            '<button type="button" class="btn btn-outline-pill" id="btn-cancel-create-event" style="border:1.5px solid #cbd5e1; padding:0.65rem 1.4rem; font-weight:800; font-size:0.92rem;">Annulla</button>' +
            '<button type="submit" class="btn btn-outline-pill pf-btn-solid" style="background:#000000; color:#ffffff; border:none; padding:0.65rem 1.6rem; font-weight:900; font-size:0.92rem;">Pubblica evento</button>' +
          '</div>' +
        '</form>' +
      '</div>';

    document.body.appendChild(modal);

    function close() { modal.remove(); }
    modal.querySelector('#btn-close-create-event').onclick = close;
    modal.querySelector('#btn-cancel-create-event').onclick = close;
    modal.onclick = function (e) { if (e.target === modal) close(); };

    modal.querySelector('#form-create-event').onsubmit = function (e) {
      e.preventDefault();
      var tipo = modal.querySelector('#inp-ev-tipo').value;
      var titolo = modal.querySelector('#inp-ev-titolo').value.trim();
      var dataStr = modal.querySelector('#inp-ev-data').value.trim();
      var luogo = modal.querySelector('#inp-ev-luogo').value.trim();
      var ritrovo = modal.querySelector('#inp-ev-ritrovo').value.trim();
      var inizio = modal.querySelector('#inp-ev-inizio').value.trim();
      var fine = modal.querySelector('#inp-ev-fine').value.trim();
      var focus = modal.querySelector('#inp-ev-focus').value.trim();

      var parts = dataStr.split(' ');
      var day = parts[0] || 'mar';
      var date = parts[1] || '01/09';

      var data = getPresData();
      data.trainingsList = data.trainingsList || [];
      data.trainingsList.unshift({
        id: 'ev-' + Date.now(),
        day: day,
        date: date,
        fullDate: dataStr,
        title: titolo || tipo,
        incontro: ritrovo || '-:-',
        inizio: inizio || '19:00',
        fine: fine || '20:30',
        campo: luogo,
        focus: focus,
        votes: {}
      });
      savePresData(data);
      close();
      renderHub();
      if (window.showToast) window.showToast('✅ Evento ' + titolo + ' creato e condiviso con il club!', 'success');
    };
  }

  // ============================================================
  // MODALE FERIE / MALATTIA (Screenshot)
  // ============================================================
  function openLeavesModal() {
    var data = getPresData();
    var list = data.leaveRecords || [];

    var listHtml = list.length === 0
      ? '<div style="text-align:center; padding:1.5rem; color:#94a3b8;">Nessun certificato medico o richiesta ferie registrata.</div>'
      : list.map(function (item) {
          return (
            '<div class="es-voter-item" style="margin-bottom:0.6rem;">' +
              '<div class="es-voter-info">' +
                '<div class="es-voter-avatar" style="background:#ef4444;">🏥</div>' +
                '<div>' +
                  '<h5 class="es-voter-name">' + esc(item.name) + ' (' + esc(item.role) + ')</h5>' +
                  '<div class="es-voter-role">' + esc(item.reason) + ' · Dal ' + esc(item.from) + ' al ' + esc(item.to) + '</div>' +
                '</div>' +
              '</div>' +
              '<span class="es-voter-badge is-yes">' + esc(item.status) + '</span>' +
            '</div>'
          );
        }).join('');

    var modal = document.createElement('div');
    modal.id = 'es-pres-leaves-overlay';
    modal.className = 'es-pres-stats-modal';
    modal.innerHTML =
      '<div class="es-voters-modal-sheet" role="dialog" aria-modal="true">' +
        '<div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1.2rem;">' +
          '<div style="display:flex; align-items:center; gap:0.65rem;">' +
            '<span style="font-size:1.6rem; color:#ef4444;">➕</span>' +
            '<div><h3 style="font-size:1.3rem; font-weight:900; margin:0; color:#0f172a;">Registro Ferie &amp; Malattia</h3><p style="font-size:0.82rem; color:#64748b; margin:0;">Certificati medici, infortuni e assenze staff e atleti</p></div>' +
          '</div>' +
          '<button type="button" class="es-tactical-btn-close" id="btn-close-leaves">&times;</button>' +
        '</div>' +
        '<div>' + listHtml + '</div>' +
        '<div style="margin-top:1.2rem; text-align:right;">' +
          '<button type="button" class="btn btn-outline-pill pf-btn-solid" id="btn-add-leave" style="background:#0d9488; color:#fff; border:none; padding:0.55rem 1.25rem; font-weight:800; font-size:0.86rem;">+ Registra Assenza / Malattia</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);
    function close() { modal.remove(); }
    modal.querySelector('#btn-close-leaves').onclick = close;
    modal.onclick = function (e) { if (e.target === modal) close(); };

    modal.querySelector('#btn-add-leave').onclick = function () {
      var n = prompt('Nome persona assente / infortunata:', 'Membro Club');
      if (n) {
        var r = prompt('Motivazione (es. Infortunio caviglia, Influenza, Ferie):', 'Infortunio');
        var d = prompt('Periodo (es. dal 01/09 al 05/09):', 'Prossimi 5 giorni');
        data.leaveRecords = data.leaveRecords || [];
        data.leaveRecords.unshift({
          name: n,
          role: 'Tesserato',
          reason: r || 'Indisponibile',
          from: 'Oggi',
          to: d || 'Prossimi giorni',
          status: 'Registrato'
        });
        savePresData(data);
        modal.remove();
        openLeavesModal();
        renderHub();
        if (window.showToast) window.showToast('✅ Assenza registrata nel dossier medico/societario', 'success');
      }
    };
  }

  // ============================================================
  // MODALE STATISTICHE PARTITE
  // ============================================================
  function openStatsModal() {
    var old = document.getElementById('es-pres-stats-modal-overlay');
    if (old) old.remove();

    var data = getPresData();
    var s = data.stats;

    var modal = document.createElement('div');
    modal.id = 'es-pres-stats-modal-overlay';
    modal.className = 'es-pres-stats-modal';
    modal.innerHTML =
      '<div class="es-pres-stats-sheet" role="dialog" aria-modal="true">' +
        '<div style="display:flex; align-items:center; justify-content:space-between; padding-bottom:1rem; border-bottom:1.5px solid #f1f5f9;">' +
          '<div style="display:flex; align-items:center; gap:0.75rem;"><span style="font-size:1.6rem; color:#0d9488;">📊</span><div><h2 style="font-size:1.4rem; font-weight:900; margin:0; color:#0f172a;">Statistiche</h2><p style="font-size:0.84rem; color:#64748b; margin:0.1rem 0 0;">Statistiche partite</p></div></div>' +
          '<button type="button" class="es-tactical-btn-close" id="btn-close-stats-modal" style="font-size:1.6rem; cursor:pointer;">&times;</button>' +
        '</div>' +

        '<div class="es-pres-stats-grid">' +
          '<div>' +
            '<h4 style="font-size:0.88rem; font-weight:800; color:#0f172a; margin:0 0 0.45rem;">Filtri</h4>' +
            '<label style="display:block; font-size:0.75rem; font-weight:800; color:#64748b; margin-bottom:0.3rem;">TORNEI</label>' +
            '<select id="pres-filter-tornei" class="es-pres-form-inp" style="padding:0.6rem 0.8rem; font-size:0.88rem; font-weight:700; margin-bottom:1.2rem;">' +
              '<option value="all">Tutti i tornei</option>' +
              '<option value="d">Campionato Serie D</option>' +
              '<option value="coppa">Coppa Italia Serie D</option>' +
            '</select>' +
            '<button type="button" class="btn btn-outline-pill pf-btn-solid" id="btn-print-stats" style="width:100%; background:#0d9488; color:#fff; border:none; padding:0.75rem; font-weight:800; font-size:0.92rem; display:inline-flex; align-items:center; justify-content:center; gap:0.5rem; border-radius:12px;">🖨️ Stampa Statistiche</button>' +
          '</div>' +

          '<div>' +
            '<div class="es-pres-stats-kpi-row">' +
              '<div class="es-pres-kpi-card"><div class="es-pres-kpi-val">' + s.totale.giocate + '</div><div class="es-pres-kpi-lbl">Partite</div></div>' +
              '<div class="es-pres-kpi-card"><div class="es-pres-kpi-val">' + s.totale.pt + '</div><div class="es-pres-kpi-lbl">Punti</div></div>' +
              '<div class="es-pres-kpi-card"><div class="es-pres-kpi-val">' + (s.totale.pt / s.totale.giocate).toFixed(2) + '</div><div class="es-pres-kpi-lbl">Media Punti</div></div>' +
            '</div>' +

            '<div class="es-pres-stats-triple-box">' +
              '<div class="es-pres-split-box">' +
                '<h5 class="es-pres-split-title">Totale</h5>' +
                '<div class="es-pres-mini-stats-grid">' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.totale.giocate + '</div><div class="es-pres-stat-lbl">Giocate</div></div>' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.totale.vinte + '</div><div class="es-pres-stat-lbl">Vinte</div></div>' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.totale.pareggi + '</div><div class="es-pres-stat-lbl">Pareggi</div></div>' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.totale.perse + '</div><div class="es-pres-stat-lbl">Perse</div></div>' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.totale.gf + '</div><div class="es-pres-stat-lbl">GF</div></div>' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.totale.gs + '</div><div class="es-pres-stat-lbl">GS</div></div>' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.totale.dr + '</div><div class="es-pres-stat-lbl">DR</div></div>' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.totale.pt + '</div><div class="es-pres-stat-lbl">PT</div></div>' +
                '</div>' +
              '</div>' +

              '<div class="es-pres-split-box">' +
                '<h5 class="es-pres-split-title">Casa</h5>' +
                '<div class="es-pres-mini-stats-grid">' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.casa.giocate + '</div><div class="es-pres-stat-lbl">Giocate</div></div>' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.casa.vinte + '</div><div class="es-pres-stat-lbl">Vinte</div></div>' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.casa.pareggi + '</div><div class="es-pres-stat-lbl">Pareggi</div></div>' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.casa.perse + '</div><div class="es-pres-stat-lbl">Perse</div></div>' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.casa.gf + '</div><div class="es-pres-stat-lbl">GF</div></div>' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.casa.gs + '</div><div class="es-pres-stat-lbl">GS</div></div>' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.casa.dr + '</div><div class="es-pres-stat-lbl">DR</div></div>' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.casa.pt + '</div><div class="es-pres-stat-lbl">PT</div></div>' +
                '</div>' +
              '</div>' +

              '<div class="es-pres-split-box">' +
                '<h5 class="es-pres-split-title">Trasferta</h5>' +
                '<div class="es-pres-mini-stats-grid">' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.trasferta.giocate + '</div><div class="es-pres-stat-lbl">Giocate</div></div>' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.trasferta.vinte + '</div><div class="es-pres-stat-lbl">Vinte</div></div>' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.trasferta.pareggi + '</div><div class="es-pres-stat-lbl">Pareggi</div></div>' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.trasferta.perse + '</div><div class="es-pres-stat-lbl">Perse</div></div>' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.trasferta.gf + '</div><div class="es-pres-stat-lbl">GF</div></div>' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.trasferta.gs + '</div><div class="es-pres-stat-lbl">GS</div></div>' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.trasferta.dr + '</div><div class="es-pres-stat-lbl">DR</div></div>' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.trasferta.pt + '</div><div class="es-pres-stat-lbl">PT</div></div>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);

    modal.querySelector('#btn-close-stats-modal').onclick = function () { modal.remove(); };
    modal.onclick = function (e) { if (e.target === modal) modal.remove(); };
    modal.querySelector('#btn-print-stats').onclick = function () { if (window.print) window.print(); };
  }

  // ============================================================
  // MODALE NUOVO CALCIATORE
  // ============================================================
  function openNewPlayerModal() {
    var old = document.getElementById('es-pres-new-player-overlay');
    if (old) old.remove();

    var modal = document.createElement('div');
    modal.id = 'es-pres-new-player-overlay';
    modal.className = 'es-pres-stats-modal';
    modal.innerHTML =
      '<div class="es-pres-new-player-sheet" role="dialog" aria-modal="true">' +
        '<div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1.4rem;">' +
          '<h2 style="font-size:1.45rem; font-weight:900; margin:0; color:#0f172a;">Nuovo calciatore</h2>' +
          '<button type="button" class="es-tactical-btn-close" id="btn-close-new-player">&times;</button>' +
        '</div>' +

        '<form id="form-new-player">' +
          '<h4 style="font-size:0.82rem; font-weight:800; color:#0d9488; text-transform:uppercase; letter-spacing:0.04em; margin:0 0 1rem;">DATI CALCIATORE</h4>' +

          '<div class="es-pres-form-row">' +
            '<label class="es-pres-form-lbl">NOME</label>' +
            '<input type="text" class="es-pres-form-inp" id="inp-np-nome" placeholder="Nome atleta" required>' +
          '</div>' +

          '<div class="es-pres-form-row">' +
            '<label class="es-pres-form-lbl">COGNOME</label>' +
            '<input type="text" class="es-pres-form-inp" id="inp-np-cognome" placeholder="Cognome atleta" required>' +
          '</div>' +

          '<div class="es-pres-form-row">' +
            '<label class="es-pres-form-lbl">DATA DI NASCITA</label>' +
            '<input type="date" class="es-pres-form-inp" id="inp-np-data" required>' +
          '</div>' +

          '<div class="es-pres-form-row">' +
            '<label class="es-pres-form-lbl">RUOLO</label>' +
            '<select class="es-pres-form-inp" id="inp-np-ruolo" required>' +
              '<option value="">Seleziona ruolo</option>' +
              '<option value="Portiere">Portiere</option>' +
              '<option value="Difensore Centrale">Difensore Centrale</option>' +
              '<option value="Terzino Destro">Terzino Destro</option>' +
              '<option value="Terzino Sinistro">Terzino Sinistro</option>' +
              '<option value="Mediano">Mediano</option>' +
              '<option value="Mezzala">Mezzala</option>' +
              '<option value="Trequartista">Trequartista</option>' +
              '<option value="Ala Destra">Ala Destra</option>' +
              '<option value="Ala Sinistra">Ala Sinistra</option>' +
              '<option value="Attaccante Centrale">Attaccante Centrale</option>' +
              '<option value="Seconda Punta">Seconda Punta</option>' +
            '</select>' +
          '</div>' +

          '<div style="display:flex; align-items:center; justify-content:flex-end; gap:0.75rem; margin-top:1.8rem;">' +
            '<button type="button" class="btn btn-outline-pill" id="btn-cancel-new-player" style="border:1.5px solid #cbd5e1; padding:0.65rem 1.4rem; font-weight:800; font-size:0.92rem;">Annulla</button>' +
            '<button type="submit" class="btn btn-outline-pill pf-btn-solid" style="background:#facc15; color:#0f172a; border:none; padding:0.65rem 1.6rem; font-weight:900; font-size:0.92rem; box-shadow:0 2px 10px rgba(250,204,21,0.4);">Aggiungi calciatore</button>' +
          '</div>' +
        '</form>' +
      '</div>';

    document.body.appendChild(modal);

    function close() { modal.remove(); }
    modal.querySelector('#btn-close-new-player').onclick = close;
    modal.querySelector('#btn-cancel-new-player').onclick = close;
    modal.onclick = function (e) { if (e.target === modal) close(); };

    modal.querySelector('#form-new-player').onsubmit = function (e) {
      e.preventDefault();
      var nome = modal.querySelector('#inp-np-nome').value.trim();
      var cognome = modal.querySelector('#inp-np-cognome').value.trim();
      var dataNascita = modal.querySelector('#inp-np-data').value;
      var ruolo = modal.querySelector('#inp-np-ruolo').value;
      var birthYear = dataNascita ? dataNascita.split('-')[0] : '2004';

      var data = getPresData();
      data.roster = data.roster || [];
      var nextNum = data.roster.length + 1;
      data.roster.push({
        id: 'p-' + nextNum,
        num: nextNum,
        name: nome + ' ' + cognome,
        role: ruolo,
        birth: birthYear,
        cert: 'Regolare',
        status: 'disp',
        app: 0
      });
      savePresData(data);
      close();
      renderHub();
      if (window.showToast) window.showToast('✅ Calciatore ' + nome + ' ' + cognome + ' aggiunto alla rosa!', 'success');
    };
  }

  // Global methods for scheme gallery
  window.viewPresSchemePreview = function () {
    if (window.EliseeCoachDash && typeof window.EliseeCoachDash.openEditor === 'function') {
      window.EliseeCoachDash.openEditor();
    }
  };

  window.downloadPresSchemePDF = function (idx) {
    var data = getPresData();
    var s = (data.tacticalSchemes || [])[idx];
    if (s) {
      if (window.jspdf && window.jspdf.jsPDF) {
        var doc = new window.jspdf.jsPDF();
        doc.setFontSize(18);
        doc.text('ELISEE SCOUT — PRESIDENTIAL HUB', 14, 20);
        doc.setFontSize(14);
        doc.text('Direttiva: ' + s.title, 14, 30);
        doc.setFontSize(11);
        doc.text('Club: ' + data.clubName + ' | Presidente: ' + data.presName, 14, 40);
        doc.text('Data: ' + s.date + ' | Categoria: ' + s.type, 14, 48);
        doc.save(s.title.replace(/\s+/g, '_') + '.pdf');
      }
      if (window.showToast) window.showToast('📥 Download PDF direttiva presidenziale avviato!', 'success');
    }
  };

  window.deletePresScheme = function (idx) {
    if (confirm('Vuoi eliminare questo documento dalla libreria presidenziale?')) {
      var data = getPresData();
      data.tacticalSchemes.splice(idx, 1);
      savePresData(data);
      renderHub();
      if (window.showToast) window.showToast('🗑️ Documento eliminato', 'info');
    }
  };

  function bindHubEvents() {
    var mount = document.getElementById('es-prd');
    if (!mount) return;

    mount.querySelectorAll('.es-mister-nav-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeTab = btn.getAttribute('data-tab');
        renderHub();
      });
    });

    // Grande Tasto + Crea Evento
    var btnCreateEv = mount.querySelector('#btn-pres-create-event');
    if (btnCreateEv) btnCreateEv.onclick = openCreateEventModal;

    // Quick Action Cards
    var cardCar = mount.querySelector('#card-action-carsharing');
    if (cardCar) cardCar.onclick = openCarSharingModal;

    var cardLeaves = mount.querySelector('#card-action-leaves');
    if (cardLeaves) cardLeaves.onclick = openLeavesModal;

    var cardSummary = mount.querySelector('#card-action-summary') || mount.querySelector('#link-view-all-events');
    if (cardSummary) {
      cardSummary.onclick = function () {
        if (window.showToast) window.showToast('📅 Panoramica Eventi: ' + (getPresData().trainingsList || []).length + ' eventi attivi.', 'info');
      };
    }

    // Interazioni Voti Like / Dislike
    mount.querySelectorAll('.es-training-vote-btn').forEach(function (btn) {
      btn.onclick = function () {
        var trainId = btn.getAttribute('data-train-id');
        var voteVal = btn.getAttribute('data-vote-val');
        var curUser = userObj();
        var myUserId = curUser.id || 'u-me';
        var myUserName = (curUser.nome ? (curUser.nome + ' ' + (curUser.cognome || '')) : (curUser.name || 'Presidente')).trim();
        var myRole = curUser.ruolo || curUser.siteRoleFamily || 'Presidente';

        var data = getPresData();
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
          savePresData(data);
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
        var trainId = btn.getAttribute('data-open-pres-voters-id');
        if (window.EliseeCoachDash && typeof window.EliseeCoachDash.openVoters === 'function') {
          window.EliseeCoachDash.openVoters(trainId);
        }
      };
    });

    var btnStats = mount.querySelector('#btn-pres-stats') || mount.querySelector('#btn-pres-match-stats');
    if (btnStats) btnStats.onclick = openStatsModal;

    var btnAddP = mount.querySelector('#btn-pres-add-player');
    if (btnAddP) btnAddP.onclick = openNewPlayerModal;

    var btnCreate = mount.querySelector('#btn-pres-create-tactic');
    if (btnCreate) {
      btnCreate.onclick = function () {
        if (window.EliseeCoachDash && typeof window.EliseeCoachDash.openEditor === 'function') {
          window.EliseeCoachDash.openEditor();
        }
      };
    }

    var btnUpload = mount.querySelector('#btn-pres-upload-file');
    var fileInput = mount.querySelector('#pres-file-upload');
    if (btnUpload && fileInput) {
      btnUpload.onclick = function () { fileInput.click(); };
      fileInput.onchange = function (e) {
        var file = e.target.files && e.target.files[0];
        if (file) {
          var isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
          var reader = new FileReader();
          reader.onload = function (evt) {
            var data = getPresData();
            data.tacticalSchemes = data.tacticalSchemes || [];
            data.tacticalSchemes.unshift({
              id: 'tac-' + Date.now(),
              title: file.name.replace(/\.[^/.]+$/, ''),
              date: new Date().toLocaleDateString('it-IT'),
              type: isPdf ? 'Documento PDF' : 'Immagine Presidenziale',
              preview: isPdf ? 'immagini/04-workspace-scout/scout-workspace.svg?v=20260730_225504' : evt.target.result
            });
            savePresData(data);
            renderHub();
            if (window.showToast) window.showToast('✅ File ' + file.name + ' importato nella libreria!', 'success');
          };
          reader.readAsDataURL(file);
        }
      };
    }

    var btnEditClub = mount.querySelector('#btn-pres-edit-club-data');
    if (btnEditClub) {
      btnEditClub.onclick = function () {
        var data = getPresData();
        var newSede = prompt('Modifica Sede Operativa Club:', data.sede);
        if (newSede != null) data.sede = newSede;
        var newStadio = prompt('Modifica Stadio Ufficiale:', data.stadio);
        if (newStadio != null) data.stadio = newStadio;
        savePresData(data);
        renderHub();
        if (window.showToast) window.showToast('✅ Dati Club aggiornati!', 'success');
      };
    }
  }

  function render(force) {
    var group = document.getElementById('user-dossier-view-group');
    if (!group) return;
    var u = userObj();
    if (!force && !isPres(u)) return;

    group.classList.add('is-pres-dash');
    var staffProfile = document.getElementById('es-staff-profile');
    if (!staffProfile) return;

    var prd = document.getElementById('es-prd');
    if (!prd) {
      prd = document.createElement('div');
      prd.id = 'es-prd';
      staffProfile.appendChild(prd);
    }
    prd.style.display = 'block';
    renderHub();
  }

  function detach() {
    var group = document.getElementById('user-dossier-view-group');
    if (group) group.classList.remove('is-pres-dash');
    var prd = document.getElementById('es-prd');
    if (prd) prd.remove();
  }

  window.EliseePresDash = {
    render: render,
    detach: detach,
    openStats: openStatsModal,
    openNewPlayer: openNewPlayerModal,
    openCarSharing: openCarSharingModal,
    openCreateEvent: openCreateEventModal,
    setTab: function (tab) {
      activeTab = tab;
      renderHub();
    }
  };

  function boot() {
    document.addEventListener('elisee:role-changed', function () {
      if (isPres()) render(true);
      else detach();
    });
    document.addEventListener('elisee:auth-changed', function () {
      if (isPres()) render(true);
      else detach();
    });
    if (isPres()) render(true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
