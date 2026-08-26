/* ============================================================
   ELISEE SCOUT — Area Alta Dirigenza (Executive Hub)
   Accesso Riservato a: Presidente, Vice Presidente, Direttore Generale, Tesoriere del Club, Segretario Generale
   6 Macro-aree Attive: CLUB | SQUADRA | ALLENAMENTI | COMUNICAZIONI | PARTITE | LAVAGNA
   Incluso:
   - Modulo COMUNICAZIONI: + Crea Notizia, Sondaggi con voto, Chat di Squadra & Cloud Squadra (0/15 MB)
   - Gestione SQUADRA con + Invita Membri, Membri, Finanze (Contributi), Statistiche
   - Hub Eventi & + Crea Evento + Car Sharing per Genitori & Trasferte
   - Gestione Presenze con Like (Ci sono) / Dislike (Non ci sono) & Modale Votanti
   - Modale Statistiche Partite & Modale Nuovo Calciatore + Lavagna Tattica
   ============================================================ */
(function () {
  'use strict';

  var activeTab = 'comunicazioni'; // default per test o sincronizzazione

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

  function isExecutive(u) {
    u = u || userObj();
    var blob = [u.staffRole, u.ruoloDettagliato, u.ruolo, u.role, u.siteRoleFamily, u.staffProfile && u.staffProfile.fieldRole]
      .filter(Boolean).join(' ').toLowerCase();
    return /presidente|vice presidente|direttore generale|tesoriere|segretario generale|club manager|amministratore|dirigente/.test(blob);
  }

  function getExecutiveRoleTitle(u) {
    u = u || userObj();
    var blob = [u.staffRole, u.ruoloDettagliato, u.ruolo, u.role].filter(Boolean).join(' ').toLowerCase();
    if (/tesoriere/.test(blob)) return 'Tesoriere del Club | Amministrazione';
    if (/direttore generale/.test(blob)) return 'Direttore Generale | Vertice Esecutivo';
    if (/vice presidente/.test(blob)) return 'Vice Presidente | Alta Dirigenza';
    if (/segretario generale|club manager/.test(blob)) return 'Segretario Generale | Club Manager';
    return 'Presidente | Admin Club';
  }

  function getCommData() {
    var def = {
      news: [
        {
          id: 'news-1',
          title: 'Convocazioni Ufficiali e Orari Trasferta Taranto',
          category: 'Ufficiale Club',
          date: '25/08/2026',
          author: 'Direzione Societaria',
          content: 'Si comunica che la partenza per la trasferta è fissata per le ore 11:30 di domenica. Pranzo di squadra alle 12:30. Tutti gli atleti convocati sono pregati di presentarsi con la divisa sociale ufficiale.'
        }
      ],
      polls: [
        {
          id: 'poll-1',
          question: 'Preferenza orario seduta video match analysis di venerdì:',
          author: 'Mister / Staff Tecnico',
          date: '26/08/2026',
          options: [
            { id: 'opt-1', text: 'Ore 17:30 (Prima dell\'allenamento)', votesCount: 14, voters: ['p-1', 'p-7', 'p-5'] },
            { id: 'opt-2', text: 'Ore 19:30 (Subito dopo il campo)', votesCount: 6, voters: ['p-2'] }
          ]
        }
      ],
      chat: [
        { id: 'msg-1', senderName: 'The King (Presidente)', senderRole: 'Presidente', text: 'Ragazzi, massima concentrazione per la prossima gara!', time: '14:30', isStaff: true },
        { id: 'msg-2', senderName: 'Eliseo Miraglia', senderRole: 'Ala Sinistra', text: 'Pronti Presidente, ci faremo trovare prontissimi! 🔥', time: '14:35', isStaff: false }
      ],
      cloudFiles: [
        { id: 'f-1', name: 'Regolamento_Interno_Stagione_2026_27.pdf', size: '2.4 MB', date: '20/08/2026', uploader: 'Segreteria Generale' },
        { id: 'f-2', name: 'Piano_Alimentare_Pre_Gara.pdf', size: '1.1 MB', date: '22/08/2026', uploader: 'Staff Medico / Nutrizione' }
      ]
    };

    try {
      var stored = localStorage.getItem('elisee_club_communications_shared');
      if (stored) return Object.assign(def, JSON.parse(stored));
    } catch (_) {}
    return def;
  }

  function saveCommData(comm) {
    try {
      localStorage.setItem('elisee_club_communications_shared', JSON.stringify(comm));
    } catch (_) {}
  }

  function getPresData() {
    var u = userObj();
    var def = {
      clubName: u.squadra || u.club || 'Foggia',
      teamCategory: 'Squadra-base',
      matricola: u.matricola || '13943 / FIGC',
      sede: u.sede || 'Viale Giuseppe Mazzini, 35/C Foggia FG',
      stadio: u.stadio || 'Stadio Comunale Pino Zaccheria',
      telefono: u.telefono || '+39 0881 742911',
      presName: (u.nome ? (u.nome + ' ' + (u.cognome || '')) : (u.name || 'The King (Eliseo Miraglia)')).trim(),
      presRole: getExecutiveRoleTitle(u),
      presDoc: 'Verificato 100%',
      presTessera: 'FIGC-DIR-001',
      presScadenza: 'Esecutivo / Stagione in corso',
      logoUrl: 'immagini/squadre-loghi/foggia.png',
      teamPhotoUrl: 'immagini/04-workspace-scout/scout-workspace.svg?v=20260730_225504',
      finances: {
        balance: 14850.00,
        feesPaid: 22,
        feesTotal: 24,
        sponsorsIncome: 8500.00,
        monthlyExpenses: 3200.00,
        transactions: [
          { date: '25/08/2026', desc: 'Quota iscrizione stagione - Famiglia Fumagalli', type: 'in', amount: 350.00 },
          { date: '22/08/2026', desc: 'Sponsor Tecnico - Acconto Stagione', type: 'in', amount: 2500.00 },
          { date: '18/08/2026', desc: 'Materiale sportivo & palloni FIGC', type: 'out', amount: 680.00 }
        ]
      },
      roster: [
        { id: 'p-7', num: 7, name: 'Eliseo Miraglia', role: 'Ala Sinistra', birth: '2004', cert: 'Regolare', status: 'disp', app: 28 },
        { id: 'p-1', num: 1, name: 'Marco Fumagalli', role: 'Portiere', birth: '2001', cert: 'Regolare', status: 'disp', app: 28 },
        { id: 'p-2', num: 2, name: 'Alessandro Silvestro', role: 'Terzino Destro', birth: '2002', cert: 'Regolare', status: 'disp', app: 25 },
        { id: 'p-5', num: 5, name: 'Luigi Carillo', role: 'Difensore Centrale', birth: '1996', cert: 'Regolare', status: 'disp', app: 28 },
        { id: 'p-6', num: 6, name: 'Davide Di Pasquale', role: 'Difensore Centrale', birth: '1996', cert: 'Regolare', status: 'disp', app: 26 },
        { id: 'p-3', num: 3, name: 'Luca Rizzo Pinna', role: 'Terzino Sinistro', birth: '2003', cert: 'Regolare', status: 'disp', app: 24 },
        { id: 'p-8', num: 8, name: 'Moses Odjer', role: 'Mediano', birth: '1996', cert: 'Regolare', status: 'disp', app: 27 },
        { id: 'p-4', num: 4, name: 'Jacopo Petermann', role: 'Regista', birth: '1994', cert: 'Regolare', status: 'disp', app: 26 },
        { id: 'p-10', num: 10, name: 'Diego Peralta', role: 'Trequartista', birth: '1996', cert: 'Regolare', status: 'disp', app: 28 },
        { id: 'p-11', num: 11, name: 'Roberto Ogunseye', role: 'Attaccante Centrale', birth: '1995', cert: 'Regolare', status: 'disp', app: 27 },
        { id: 'p-9', num: 9, name: 'Alexis Ferrante', role: 'Seconda Punta', birth: '1995', cert: 'Regolare', status: 'disp', app: 25 }
      ],
      staffMembers: [
        { id: 'st-pres', name: 'The King (Eliseo Miraglia)', role: 'Presidente' },
        { id: 'st-vp', name: 'Vice Presidente', role: 'Vice Presidente' },
        { id: 'st-dg', name: 'Direttore Generale', role: 'Direttore Generale' },
        { id: 'st-tres', name: 'Tesoriere del Club', role: 'Tesoriere & Amministrazione' },
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
        }
      ],
      leaveRecords: [
        { name: 'Antonio Gentile', role: 'Fisioterapista', reason: 'Ferie programmate', from: '05/09/2026', to: '08/09/2026', status: 'Approvato' }
      ],
      partite: [
        { id: 'match-1', date: 'Domenica · Ore 15:00', opponent: 'Foggia vs Taranto', comp: 'Campionato Serie D · Girone H', stadium: 'Stadio Pino Zaccheria', status: 'Prossima Gara', conv: '22 Convocati' }
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
    squadra: 'Gestione esecutiva della squadra, membri, finanze e statistiche.',
    allenamenti: 'Pianificazione eventi societari, car sharing genitori e allenamenti.',
    comunicazioni: 'Comunicazioni ufficiali, sondaggi societari, chat di squadra e cloud file.',
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
          '<div class="es-mister-trial-text"><span>👑</span> Stai operando come <b>Alta Dirigenza Club</b> (Presidente, Vice, DG, Tesoriere).</div>' +
          '<button type="button" class="es-mister-btn-sub" onclick="if(window.showToast){ window.showToast(\'👑 Accesso Amministratore Club 100% Attivo.\', \'success\'); }">Abbonati</button>' +
        '</div>' +

        '<div class="es-mister-wrap">' +
          '<div class="es-mister-club-header">' +
            '<div class="es-mister-club-main">' +
              '<div class="es-mister-crest-badge"><img src="' + esc(data.logoUrl) + '" alt="' + esc(data.clubName) + '" onerror="this.src=\'immagini/squadre-loghi/napoli.png\';"></div>' +
              '<div>' +
                '<div class="es-mister-club-tags"><span class="es-mister-tag es-mister-tag-primary">PRIMA SQUADRA</span><span class="es-mister-tag es-mister-tag-dark">Stagione in corso</span><span class="es-mister-tag es-mister-tag-gold">' + esc(data.presRole) + '</span></div>' +
                '<h1 class="es-mister-club-title">' + esc(data.clubName) + '</h1>' +
                '<p class="es-mister-club-desc" id="pres-tab-desc">' + esc(TAB_DESCS[activeTab]) + '</p>' +
              '</div>' +
            '</div>' +
          '</div>' +

          '<nav class="es-mister-nav-bar" role="tablist">' +
            '<button type="button" class="es-mister-nav-tab ' + (activeTab === 'club' ? 'is-active' : '') + '" data-tab="club">🛡️ Club</button>' +
            '<button type="button" class="es-mister-nav-tab ' + (activeTab === 'squadra' ? 'is-active' : '') + '" data-tab="squadra">👥 Squadra &amp; Finanze</button>' +
            '<button type="button" class="es-mister-nav-tab ' + (activeTab === 'allenamenti' ? 'is-active' : '') + '" data-tab="allenamenti">📅 Eventi &amp; Car Sharing</button>' +
            '<button type="button" class="es-mister-nav-tab ' + (activeTab === 'comunicazioni' ? 'is-active' : '') + '" data-tab="comunicazioni">💬 Comunicazioni</button>' +
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
    var comm = getCommData();

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
            '<div class="es-mister-card-title-wrap"><span class="es-mister-card-icon">👑</span><div><h3 class="es-mister-card-title">Alta Dirigenza &amp; Staff</h3><p class="es-mister-card-sub">Organigramma societario completo</p></div></div>' +
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
      var allMembers = (data.roster || []).concat(data.staffMembers || []);
      var memberThumbsHtml = (data.roster || []).map(function (m) {
        return (
          '<div class="es-member-thumb-card" onclick="if(window.showToast){ window.showToast(\'👤 Scheda atleta: ' + esc(m.name) + ' (' + esc(m.role) + ')\', \'info\'); }">' +
            '<div class="es-member-thumb-avatar">👤</div>' +
            '<h5 class="es-member-thumb-name">' + esc(m.name) + '</h5>' +
            '<div class="es-member-thumb-role">' + esc(m.role) + '</div>' +
          '</div>'
        );
      }).join('');

      return (
        '<div class="es-mister-card-white">' +
          '<div class="es-club-switcher-bar">' +
            '<div class="es-club-switch-info"><span style="font-size:1.1rem;">🛡️</span><div><b style="font-size:0.95rem; color:#0f172a;">' + esc(data.clubName) + '</b> <span class="es-club-switch-badge">' + esc(data.teamCategory) + '</span></div></div>' +
            '<button type="button" class="btn btn-outline-pill" id="btn-switch-team" style="padding:0.25rem 0.65rem; font-size:0.85rem; font-weight:800; border:1px solid #cbd5e1;">⇆</button>' +
          '</div>' +
          '<h2 class="es-events-hub-title"><span style="font-size:1.8rem;">🛡️</span> SQUADRA</h2>' +
          '<button type="button" class="es-btn-create-event-big" id="btn-pres-invite-members"><span>+</span> Invita membri</button>' +
          '<div class="es-events-section-header"><h3 class="es-events-section-title">Membri</h3><a class="es-events-view-all-link" id="link-view-all-members">Visualizza tutto</a></div>' +
          '<div class="es-member-carousel">' + memberThumbsHtml + '</div>' +
          '<div class="es-events-quick-grid" style="margin-top:1.2rem;">' +
            '<div class="es-events-quick-card" id="card-action-members"><div><div class="es-quick-card-icon">👥</div><h4 class="es-quick-card-title">Membri</h4><p class="es-quick-card-sub">' + allMembers.length + ' Membri nel club</p></div></div>' +
            '<div class="es-events-quick-card" id="card-action-finances"><div><div class="es-quick-card-icon">€</div><h4 class="es-quick-card-title">Finanze</h4><p class="es-quick-card-sub">Gestione contributi &amp; cassa</p></div></div>' +
            '<div class="es-events-quick-card" id="card-action-stats"><div><div class="es-quick-card-icon">📊</div><h4 class="es-quick-card-title">Statistiche</h4><p class="es-quick-card-sub">Analizza la tua squadra</p></div></div>' +
          '</div>' +
        '</div>'
      );
    }

    if (tab === 'allenamenti') {
      var curUser = userObj();
      var myUserId = curUser.id || 'u-me';
      var nextEvent = (data.trainingsList || [])[0] || { id: 'train-1', day: 'mar', date: '01/09', title: 'Allenamento', focus: 'Seduta Tattica', incontro: '-:-', inizio: '19:00', fine: '20:30', votes: {} };
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
          '<h2 class="es-events-hub-title"><span style="font-size:1.8rem;">📅</span> EVENTI</h2>' +
          '<button type="button" class="es-btn-create-event-big" id="btn-pres-create-event"><span>+</span> Crea evento</button>' +
          '<div class="es-events-section-header"><h3 class="es-events-section-title">Prossimo evento</h3><a class="es-events-view-all-link" id="link-view-all-events">Visualizza tutto</a></div>' +
          '<div class="es-training-event-card" id="pres-card-' + nextEvent.id + '">' +
            '<div class="es-training-head-banner"><div class="es-training-date-block"><div class="es-training-day-chip"><span class="es-training-day-txt">' + esc(nextEvent.day) + '</span><span class="es-training-date-txt">' + esc(nextEvent.date) + '</span></div><div style="border-left:1.5px solid rgba(0,0,0,0.15); height:32px; margin:0 0.5rem;"></div><div><h4 class="es-training-title-txt">' + esc(nextEvent.title) + '</h4><div style="font-size:0.75rem; color:#092621; opacity:0.85;">' + esc(nextEvent.focus) + '</div></div></div><span style="font-size:1.4rem; font-weight:800; opacity:0.7;">&rsaquo;</span></div>' +
            '<div class="es-training-times-grid"><div class="es-training-time-col"><div class="es-training-time-val">' + esc(nextEvent.incontro) + '</div><div class="es-training-time-lbl">Incontro</div></div><div class="es-training-time-col"><div class="es-training-time-val">' + esc(nextEvent.inizio) + '</div><div class="es-training-time-lbl">Inizio</div></div><div class="es-training-time-col"><div class="es-training-time-val">' + esc(nextEvent.fine) + '</div><div class="es-training-time-lbl">Fine</div></div></div>' +
            '<div class="es-training-actions-bar">' +
              '<div class="es-training-vote-group">' +
                '<button type="button" class="es-training-vote-btn ' + (myVote === 'yes' ? 'is-voted-yes' : '') + '" data-train-id="' + nextEvent.id + '" data-vote-val="yes"><span>👍</span> <span>' + yesCount + '</span></button>' +
                '<button type="button" class="es-training-vote-btn ' + (myVote === 'maybe' ? 'is-voted-maybe' : '') + '" data-train-id="' + nextEvent.id + '" data-vote-val="maybe"><span>❓</span> <span>' + maybeCount + '</span></button>' +
                '<button type="button" class="es-training-vote-btn ' + (myVote === 'no' ? 'is-voted-no' : '') + '" data-train-id="' + nextEvent.id + '" data-vote-val="no"><span>👎</span> <span>' + noCount + '</span></button>' +
              '</div>' +
              '<button type="button" class="es-training-participants-btn" data-open-pres-voters-id="' + nextEvent.id + '">👥</button>' +
            '</div>' +
          '</div>' +
          '<div class="es-events-quick-grid">' +
            '<div class="es-events-quick-card" id="card-action-summary"><div><div class="es-quick-card-icon">📅</div><h4 class="es-quick-card-title">Riepilogo evento</h4><p class="es-quick-card-sub">' + (data.trainingsList && data.trainingsList.length > 0 ? (data.trainingsList.length + ' eventi in programma') : 'Nessun evento...') + '</p></div></div>' +
            '<div class="es-events-quick-card" id="card-action-leaves"><div><div class="es-quick-card-icon">➕</div><h4 class="es-quick-card-title">Ferie/Malattia</h4><p class="es-quick-card-sub">' + (leavesCount > 0 ? (leavesCount + ' assenza registrata') : "Nessun'assenza") + '</p></div></div>' +
            '<div class="es-events-quick-card" id="card-action-carsharing"><div><div class="es-quick-card-icon">🚗</div><h4 class="es-quick-card-title">Car sharing</h4><p class="es-quick-card-sub">' + (carsCount > 0 ? (carsCount + ' auto disponibili questa settimana') : '0 questa settimana') + '</p></div></div>' +
          '</div>' +
        '</div>'
      );
    }

    if (tab === 'comunicazioni') {
      var newsCount = (comm.news || []).length;
      var pollsCount = (comm.polls || []).length;
      var chatCount = (comm.chat || []).length;
      var filesCount = (comm.cloudFiles || []).length;

      var pollsPreviewHtml = pollsCount === 0
        ? ('<div class="es-comm-grey-box">' +
            '<p class="es-comm-empty-text">Attualmente non ci sono sondaggi in corso.</p>' +
            '<button type="button" class="es-comm-btn-action-small" id="btn-create-poll-center">Crea un sondaggio</button>' +
          '</div>')
        : ('<div class="es-poll-item-card" style="margin-bottom:1.4rem;">' +
            '<div style="font-size:0.75rem; font-weight:800; color:#0d9488; text-transform:uppercase; margin-bottom:0.35rem;">Sondaggio Attivo</div>' +
            '<h4 class="es-poll-question">' + esc(comm.polls[0].question) + '</h4>' +
            comm.polls[0].options.map(function (opt) {
              return (
                '<div class="es-poll-option-row" onclick="window.votePoll(\'poll-1\', \'' + opt.id + '\')">' +
                  '<span>' + esc(opt.text) + '</span>' +
                  '<span style="font-weight:900; color:#0d9488;">' + opt.votesCount + ' voti</span>' +
                '</div>'
              );
            }).join('') +
          '</div>');

      return (
        '<div class="es-mister-card-white">' +
          // Header COMUNICAZIONI
          '<h2 class="es-events-hub-title"><span style="font-size:1.8rem;">💬</span> COMUNICAZIONI</h2>' +

          // Grande pulsante nero + Crea notizia (per Staff/Dirigenti)
          '<button type="button" class="es-btn-create-event-big" id="btn-pres-create-news">' +
            '<span>+</span> Crea notizia' +
          '</button>' +

          // Sezione Sondaggi
          '<div class="es-events-section-header">' +
            '<h3 class="es-events-section-title">Sondaggi</h3>' +
            '<a class="es-events-view-all-link" id="link-view-all-polls">Visualizza tutto</a>' +
          '</div>' +

          pollsPreviewHtml +

          // 4 Quick Action Cards: Chat, Notizie, Sondaggi, Cloud Squadra
          '<div class="es-comm-4grid">' +
            // Card 1: Chat
            '<div class="es-events-quick-card" id="card-action-chat">' +
              '<div>' +
                '<div class="es-quick-card-icon">💬</div>' +
                '<h4 class="es-quick-card-title">Chat</h4>' +
                '<p class="es-quick-card-sub">' + (chatCount > 0 ? (chatCount + ' messaggi recenti') : 'Nessun messaggio') + '</p>' +
              '</div>' +
            '</div>' +

            // Card 2: Notizie
            '<div class="es-events-quick-card" id="card-action-news">' +
              '<div>' +
                '<div class="es-quick-card-icon">📢</div>' +
                '<h4 class="es-quick-card-title">Notizie</h4>' +
                '<p class="es-quick-card-sub">' + newsCount + ' notizie importanti</p>' +
              '</div>' +
            '</div>' +

            // Card 3: Sondaggi
            '<div class="es-events-quick-card" id="card-action-polls">' +
              '<div>' +
                '<div class="es-quick-card-icon">⇅</div>' +
                '<h4 class="es-quick-card-title">Sondaggi</h4>' +
                '<p class="es-quick-card-sub">' + (pollsCount > 0 ? (pollsCount + ' sondaggi attivi') : 'Nessun sondaggio attivo') + '</p>' +
              '</div>' +
            '</div>' +

            // Card 4: Cloud squadra
            '<div class="es-events-quick-card" id="card-action-cloud">' +
              '<div>' +
                '<div class="es-quick-card-icon">☁️</div>' +
                '<h4 class="es-quick-card-title">Cloud squadra</h4>' +
                '<p class="es-quick-card-sub">' + filesCount + ' file (3.5/15 MB utilizzati)</p>' +
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
                  '<div class="es-tactical-card-thumb"><img src="' + esc(s.preview) + '" alt="' + esc(s.title) + '">' +
                  '</div><h4 style="font-size:0.95rem; font-weight:800; color:#0f172a; margin:0 0 0.2rem;">' + esc(s.title) + '</h4><div style="font-size:0.75rem; color:#64748b; margin-bottom:0.75rem;">' + esc(s.type) + ' · ' + esc(s.date) + '</div><div style="display:flex; gap:0.4rem;"><button type="button" class="btn btn-outline-pill" style="padding:0.3rem 0.65rem; font-size:0.75rem;" onclick="window.viewPresSchemePreview(' + idx + ')">👁️ Apri</button><button type="button" class="btn btn-outline-pill" style="padding:0.3rem 0.65rem; font-size:0.75rem;" onclick="window.downloadPresSchemePDF(' + idx + ')">📥 PDF</button><button type="button" class="btn btn-outline-pill" style="padding:0.3rem 0.65rem; font-size:0.75rem; color:#ef4444; border-color:#fca5a5;" onclick="window.deletePresScheme(' + idx + ')">🗑️</button></div></div>'
              );
            }).join('') +
          '</div>');

      return (
        '<div class="es-mister-card-white">' +
          '<div class="es-mister-card-header">' +
            '<div class="es-mister-card-title-wrap"><span class="es-mister-card-icon">🖌️</span><div><h3 class="es-mister-card-title">Lavagna Tattica</h3><p class="es-mister-card-sub">' + esc(data.clubName) + ' · Prima Squadra (Alta Dirigenza)</p></div></div>' +
            '<div class="es-mister-card-actions">' +
              '<input type="file" id="pres-file-upload" accept="image/png,image/jpeg,application/pdf" style="display:none;">' +
              '<button type="button" class="btn btn-outline-pill" id="btn-pres-upload-file" style="background:#f8fafc; border:1.5px solid #cbd5e1; color:#0f172a; padding:0.55rem 1.15rem; font-weight:800; font-size:0.85rem; display:inline-flex; align-items:center; gap:0.45rem;">📁 Carica immagine / PDF</button>' +
              '<button type="button" class="btn btn-outline-pill pf-btn-solid" id="btn-pres-create-tactic" style="background:#0d9488; color:#ffffff; border:none; padding:0.55rem 1.25rem; font-weight:800; font-size:0.85rem; display:inline-flex; align-items:center; gap:0.45rem;">🖌️ Crea immagine</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="es-mister-card-white">' +
          '<div class="es-mister-card-header" style="margin-bottom:0.6rem;"><div><h3 class="es-mister-card-title" style="font-size:1.15rem;">Libreria immagini</h3><p class="es-mister-card-sub">Immagini create e salvate dalla lavagna tattica o caricate dai dirigenti.</p></div></div>' +
          galleryHtml +
        '</div>'
      );
    }

    return '';
  }

  // ============================================================
  // MODALE + CREA NOTIZIA
  // ============================================================
  function openCreateNewsModal() {
    var old = document.getElementById('es-pres-news-modal-overlay');
    if (old) old.remove();

    var modal = document.createElement('div');
    modal.id = 'es-pres-news-modal-overlay';
    modal.className = 'es-pres-stats-modal';
    modal.innerHTML =
      '<div class="es-pres-new-player-sheet" style="max-width:540px;" role="dialog" aria-modal="true">' +
        '<div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1.4rem;">' +
          '<h2 style="font-size:1.45rem; font-weight:900; margin:0; color:#0f172a;">📢 Crea nuova notizia</h2>' +
          '<button type="button" class="es-tactical-btn-close" id="btn-close-create-news">&times;</button>' +
        '</div>' +

        '<form id="form-create-news">' +
          '<div class="es-pres-form-row">' +
            '<label class="es-pres-form-lbl">TITOLO NOTIZIA</label>' +
            '<input type="text" class="es-pres-form-inp" id="inp-news-title" placeholder="Es. Comunicazione orari allenamento" required>' +
          '</div>' +

          '<div class="es-pres-form-row">' +
            '<label class="es-pres-form-lbl">CATEGORIA</label>' +
            '<select class="es-pres-form-inp" id="inp-news-cat">' +
              '<option value="Ufficiale Club">📢 Ufficiale Club</option>' +
              '<option value="Convocazione Gara">⚽ Convocazione Gara</option>' +
              '<option value="Orari & Logistica">⏰ Orari & Logistica</option>' +
              '<option value="Comunicazione Medica">🏥 Comunicazione Medica</option>' +
            '</select>' +
          '</div>' +

          '<div class="es-pres-form-row">' +
            '<label class="es-pres-form-lbl">TESTO DELLA COMUNICAZIONE</label>' +
            '<textarea class="es-pres-form-inp" id="inp-news-body" rows="4" placeholder="Scrivi il comunicato per la squadra..." required style="resize:vertical;"></textarea>' +
          '</div>' +

          '<div style="display:flex; align-items:center; justify-content:flex-end; gap:0.75rem; margin-top:1.5rem;">' +
            '<button type="button" class="btn btn-outline-pill" id="btn-cancel-create-news" style="border:1.5px solid #cbd5e1; padding:0.65rem 1.4rem; font-weight:800; font-size:0.92rem;">Annulla</button>' +
            '<button type="submit" class="btn btn-outline-pill pf-btn-solid" style="background:#000000; color:#ffffff; border:none; padding:0.65rem 1.6rem; font-weight:900; font-size:0.92rem;">Pubblica per la squadra</button>' +
          '</div>' +
        '</form>' +
      '</div>';

    document.body.appendChild(modal);

    function close() { modal.remove(); }
    modal.querySelector('#btn-close-create-news').onclick = close;
    modal.querySelector('#btn-cancel-create-news').onclick = close;
    modal.onclick = function (e) { if (e.target === modal) close(); };

    modal.querySelector('#form-create-news').onsubmit = function (e) {
      e.preventDefault();
      var t = modal.querySelector('#inp-news-title').value.trim();
      var c = modal.querySelector('#inp-news-cat').value;
      var b = modal.querySelector('#inp-news-body').value.trim();

      var comm = getCommData();
      comm.news = comm.news || [];
      comm.news.unshift({
        id: 'news-' + Date.now(),
        title: t,
        category: c,
        date: new Date().toLocaleDateString('it-IT'),
        author: getPresData().presName,
        content: b
      });
      saveCommData(comm);
      close();
      renderHub();
      if (window.showToast) window.showToast('✅ Notizia pubblicata e visibile a tutta la squadra!', 'success');
    };
  }

  // ============================================================
  // MODALE CREA SONDAGGIO
  // ============================================================
  function openCreatePollModal() {
    var q = prompt('Domanda del sondaggio per la squadra:', 'Disponibilità seduta tecnica aggiuntiva:');
    if (!q) return;
    var op1 = prompt('Opzione 1:', 'Sì, disponibile');
    var op2 = prompt('Opzione 2:', 'No, assente per impegni');

    var comm = getCommData();
    comm.polls = comm.polls || [];
    comm.polls.unshift({
      id: 'poll-' + Date.now(),
      question: q,
      author: getPresData().presName,
      date: new Date().toLocaleDateString('it-IT'),
      options: [
        { id: 'opt-1', text: op1 || 'Opzione 1', votesCount: 0, voters: [] },
        { id: 'opt-2', text: op2 || 'Opzione 2', votesCount: 0, voters: [] }
      ]
    });
    saveCommData(comm);
    renderHub();
    if (window.showToast) window.showToast('✅ Sondaggio creato e aperto al voto di tutta la squadra!', 'success');
  }

  // Global method to vote in polls
  window.votePoll = function (pollId, optId) {
    var curUser = userObj();
    var myUserId = curUser.id || 'u-me';
    var comm = getCommData();
    var poll = (comm.polls || []).find(function (p) { return p.id === pollId; });
    if (poll) {
      poll.options.forEach(function (opt) {
        if (opt.id === optId) {
          opt.votesCount = (opt.votesCount || 0) + 1;
          opt.voters = opt.voters || [];
          if (!opt.voters.includes(myUserId)) opt.voters.push(myUserId);
        }
      });
      saveCommData(comm);
      renderHub();
      if (window.showToast) window.showToast('🗳️ Il tuo voto è stato registrato!', 'success');
    }
  };

  // ============================================================
  // MODALE CHAT DI SQUADRA
  // ============================================================
  function openChatModal() {
    var old = document.getElementById('es-pres-chat-overlay');
    if (old) old.remove();

    var comm = getCommData();
    var curUser = userObj();
    var myName = (curUser.nome ? (curUser.nome + ' ' + (curUser.cognome || '')) : (curUser.name || 'Dirigente')).trim();

    var messagesHtml = (comm.chat || []).map(function (m) {
      var isMe = m.senderName === myName || m.isMe;
      return (
        '<div class="es-chat-bubble ' + (isMe ? 'is-me' : 'is-other') + '">' +
          '<div class="es-chat-sender">' + esc(m.senderName) + ' (' + esc(m.senderRole) + ')</div>' +
          '<div>' + esc(m.text) + '</div>' +
          '<div class="es-chat-time">' + esc(m.time) + '</div>' +
        '</div>'
      );
    }).join('');

    var modal = document.createElement('div');
    modal.id = 'es-pres-chat-overlay';
    modal.className = 'es-pres-stats-modal';
    modal.innerHTML =
      '<div class="es-pres-stats-sheet" style="max-width:680px;" role="dialog" aria-modal="true">' +
        '<div style="display:flex; align-items:center; justify-content:space-between; padding-bottom:1rem; border-bottom:1.5px solid #f1f5f9; margin-bottom:1rem;">' +
          '<div style="display:flex; align-items:center; gap:0.75rem;">' +
            '<span style="font-size:1.8rem; color:#0d9488;">💬</span>' +
            '<div>' +
              '<h2 style="font-size:1.4rem; font-weight:900; margin:0; color:#0f172a;">Chat Ufficiale Squadra</h2>' +
              '<p style="font-size:0.82rem; color:#64748b; margin:0;">Canale riservato a calciatori, staff tecnico e alta dirigenza</p>' +
            '</div>' +
          '</div>' +
          '<button type="button" class="es-tactical-btn-close" id="btn-close-chat">&times;</button>' +
        '</div>' +

        '<div class="es-chat-messages-container" id="chat-box-stream">' +
          (messagesHtml || '<div style="text-align:center; padding:2rem; color:#94a3b8;">Nessun messaggio nella chat. Scrivi il primo messaggio!</div>') +
        '</div>' +

        '<form id="form-send-chat" style="display:flex; gap:0.5rem;">' +
          '<input type="text" class="es-pres-form-inp" id="inp-chat-msg" placeholder="Scrivi un messaggio alla squadra..." required style="flex:1;">' +
          '<button type="submit" class="btn btn-outline-pill pf-btn-solid" style="background:#0d9488; color:#fff; border:none; padding:0.6rem 1.4rem; font-weight:800;">Invia</button>' +
        '</form>' +
      '</div>';

    document.body.appendChild(modal);

    function close() { modal.remove(); }
    modal.querySelector('#btn-close-chat').onclick = close;
    modal.onclick = function (e) { if (e.target === modal) close(); };

    modal.querySelector('#form-send-chat').onsubmit = function (e) {
      e.preventDefault();
      var txt = modal.querySelector('#inp-chat-msg').value.trim();
      if (txt) {
        comm.chat = comm.chat || [];
        comm.chat.push({
          id: 'msg-' + Date.now(),
          senderName: myName,
          senderRole: curUser.ruolo || 'Dirigenza',
          text: txt,
          time: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
          isMe: true
        });
        saveCommData(comm);
        modal.remove();
        openChatModal();
        renderHub();
      }
    };
  }

  // ============================================================
  // MODALE CLOUD SQUADRA (0/15 MB)
  // ============================================================
  function openCloudModal() {
    var old = document.getElementById('es-pres-cloud-overlay');
    if (old) old.remove();

    var comm = getCommData();
    var filesListHtml = (comm.cloudFiles || []).map(function (f, idx) {
      return (
        '<div class="es-cloud-file-card">' +
          '<div style="display:flex; align-items:center; gap:0.75rem;">' +
            '<span style="font-size:1.6rem; color:#0d9488;">📄</span>' +
            '<div>' +
              '<h5 style="font-size:0.92rem; font-weight:800; color:#0f172a; margin:0;">' + esc(f.name) + '</h5>' +
              '<div style="font-size:0.75rem; color:#64748b;">' + esc(f.size) + ' · Caricato il ' + esc(f.date) + ' da ' + esc(f.uploader) + '</div>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex; gap:0.4rem;">' +
            '<button type="button" class="btn btn-outline-pill" style="padding:0.35rem 0.85rem; font-size:0.8rem;" onclick="if(window.showToast){ window.showToast(\'📥 Download avviato: ' + esc(f.name) + '\', \'success\'); }">📥 Scarica</button>' +
            '<button type="button" class="btn btn-outline-pill" style="padding:0.35rem 0.65rem; font-size:0.8rem; color:#ef4444; border-color:#fca5a5;" onclick="window.deleteCloudFile(' + idx + ')">🗑️</button>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    var modal = document.createElement('div');
    modal.id = 'es-pres-cloud-overlay';
    modal.className = 'es-pres-stats-modal';
    modal.innerHTML =
      '<div class="es-pres-stats-sheet" style="max-width:720px;" role="dialog" aria-modal="true">' +
        '<div style="display:flex; align-items:center; justify-content:space-between; padding-bottom:1rem; border-bottom:1.5px solid #f1f5f9; margin-bottom:1.2rem;">' +
          '<div style="display:flex; align-items:center; gap:0.75rem;">' +
            '<span style="font-size:1.8rem; color:#0d9488;">☁️</span>' +
            '<div>' +
              '<h2 style="font-size:1.45rem; font-weight:900; margin:0; color:#0f172a;">Cloud Squadra (Spazio Condiviso)</h2>' +
              '<p style="font-size:0.82rem; color:#64748b; margin:0;">3.5 / 15 MB utilizzati · Documenti, schede e video accessibili a tutta la squadra</p>' +
            '</div>' +
          '</div>' +
          '<button type="button" class="es-tactical-btn-close" id="btn-close-cloud">&times;</button>' +
        '</div>' +

        '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">' +
          '<h3 style="font-size:1.05rem; font-weight:900; color:#0f172a; margin:0;">File archiviati (' + (comm.cloudFiles || []).length + ')</h3>' +
          '<input type="file" id="inp-cloud-upload" style="display:none;">' +
          '<button type="button" class="btn btn-outline-pill pf-btn-solid" id="btn-trigger-cloud-upload" style="background:#0d9488; color:#fff; border:none; padding:0.5rem 1.2rem; font-weight:800; font-size:0.86rem;">' +
            '☁️ + Carica file nel Cloud' +
          '</button>' +
        '</div>' +

        '<div style="max-height:45vh; overflow-y:auto;">' +
          (filesListHtml || '<div style="text-align:center; padding:2rem; color:#94a3b8;">Nessun documento presente nel Cloud.</div>') +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);

    function close() { modal.remove(); }
    modal.querySelector('#btn-close-cloud').onclick = close;
    modal.onclick = function (e) { if (e.target === modal) close(); };

    modal.querySelector('#btn-trigger-cloud-upload').onclick = function () {
      modal.querySelector('#inp-cloud-upload').click();
    };

    modal.querySelector('#inp-cloud-upload').onchange = function (e) {
      var file = e.target.files && e.target.files[0];
      if (file) {
        comm.cloudFiles = comm.cloudFiles || [];
        comm.cloudFiles.unshift({
          id: 'f-' + Date.now(),
          name: file.name,
          size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
          date: new Date().toLocaleDateString('it-IT'),
          uploader: getPresData().presName
        });
        saveCommData(comm);
        modal.remove();
        openCloudModal();
        renderHub();
        if (window.showToast) window.showToast('✅ File ' + file.name + ' caricato con successo nel Cloud Squadra!', 'success');
      }
    };
  }

  window.deleteCloudFile = function (idx) {
    if (confirm('Vuoi eliminare questo file dal Cloud Squadra?')) {
      var comm = getCommData();
      comm.cloudFiles.splice(idx, 1);
      saveCommData(comm);
      openCloudModal();
      renderHub();
      if (window.showToast) window.showToast('🗑️ File eliminato dal Cloud', 'info');
    }
  };

  // ============================================================
  // MODALI ESISTENTI (Invita, Finanze, Car Sharing, Eventi, Statistiche)
  // ============================================================
  function openInviteMembersModal() {
    var old = document.getElementById('es-pres-invite-overlay');
    if (old) old.remove();
    var data = getPresData();
    var inviteLink = window.location.origin + '/#iscrizione-portal?team=' + encodeURIComponent(data.clubName);
    var modal = document.createElement('div');
    modal.id = 'es-pres-invite-overlay';
    modal.className = 'es-pres-stats-modal';
    modal.innerHTML =
      '<div class="es-pres-new-player-sheet" style="max-width:540px;" role="dialog" aria-modal="true">' +
        '<div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1.4rem;"><h2 style="font-size:1.45rem; font-weight:900; margin:0; color:#0f172a;">👥 Invita membri nel Club</h2><button type="button" class="es-tactical-btn-close" id="btn-close-invite">&times;</button></div>' +
        '<p style="font-size:0.88rem; color:#64748b; margin:0 0 1.2rem; line-height:1.45;">Invia il link di invito ad atleti, genitori, dirigenti o staff per accedere al club ' + esc(data.clubName) + '.</p>' +
        '<div class="es-pres-form-row"><label class="es-pres-form-lbl">RUOLO DA ASSEGNARE</label><select class="es-pres-form-inp" id="inp-inv-role"><option value="Calciatore">⚽ Calciatore / Atleta</option><option value="Genitore">👨‍👩‍👦 Genitore Atleta</option><option value="Staff Tecnico">⏱️ Staff Tecnico</option><option value="Dirigente">👑 Dirigente</option></select></div>' +
        '<div class="es-pres-form-row"><label class="es-pres-form-lbl">LINK INVITO ESCLUSIVO</label><div style="display:flex; gap:0.5rem;"><input type="text" class="es-pres-form-inp" id="inp-inv-link" value="' + esc(inviteLink) + '" readonly style="background:#f8fafc; font-size:0.82rem;"><button type="button" class="btn btn-outline-pill pf-btn-solid" id="btn-copy-inv-link" style="background:#0d9488; color:#fff; border:none; padding:0.6rem 1.1rem; font-size:0.85rem; font-weight:800; white-space:nowrap;">Copia</button></div></div>' +
        '<div style="display:flex; gap:0.6rem; margin-top:1.4rem;"><button type="button" class="btn btn-outline-pill" id="btn-share-wa" style="flex:1; background:#25d366; color:#fff; border:none; padding:0.75rem; font-weight:800; font-size:0.9rem; display:flex; align-items:center; justify-content:center; gap:0.4rem;">📲 WhatsApp</button><button type="button" class="btn btn-outline-pill" id="btn-share-email" style="flex:1; background:#0f172a; color:#fff; border:none; padding:0.75rem; font-weight:800; font-size:0.9rem; display:flex; align-items:center; justify-content:center; gap:0.4rem;">✉️ Email</button></div>' +
      '</div>';
    document.body.appendChild(modal);
    function close() { modal.remove(); }
    modal.querySelector('#btn-close-invite').onclick = close;
    modal.onclick = function (e) { if (e.target === modal) close(); };
    modal.querySelector('#btn-copy-inv-link').onclick = function () {
      if (navigator.clipboard) { navigator.clipboard.writeText(inviteLink); if (window.showToast) window.showToast('📋 Link invito copiato!', 'success'); }
    };
    modal.querySelector('#btn-share-wa').onclick = function () {
      window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent('Unisciti al club ' + data.clubName + ': ' + inviteLink), '_blank');
    };
    modal.querySelector('#btn-share-email').onclick = function () {
      window.location.href = 'mailto:?subject=' + encodeURIComponent('Invito - ' + data.clubName) + '&body=' + encodeURIComponent(inviteLink);
    };
  }

  function openFinancesModal() {
    var old = document.getElementById('es-pres-finances-overlay');
    if (old) old.remove();
    var data = getPresData();
    var fin = data.finances || { balance: 14850.00, feesPaid: 22, feesTotal: 24, transactions: [] };
    var txHtml = (fin.transactions || []).map(function (tx) {
      return (
        '<div class="es-voter-item" style="margin-bottom:0.55rem;"><div class="es-voter-info"><div class="es-voter-avatar" style="background:' + (tx.type === 'in' ? '#dcfce7; color:#15803d;' : '#fee2e2; color:#b91c1c;') + '">' + (tx.type === 'in' ? '↓' : '↑') + '</div><div><h5 class="es-voter-name">' + esc(tx.desc) + '</h5><div class="es-voter-role">Data: ' + esc(tx.date) + '</div></div></div><div style="font-size:1.05rem; font-weight:900; color:' + (tx.type === 'in' ? '#15803d;' : '#b91c1c;') + '">' + (tx.type === 'in' ? '+ € ' : '- € ') + tx.amount.toFixed(2) + '</div></div>'
      );
    }).join('');
    var modal = document.createElement('div');
    modal.id = 'es-pres-finances-overlay';
    modal.className = 'es-pres-stats-modal';
    modal.innerHTML =
      '<div class="es-pres-stats-sheet" style="max-width:740px;" role="dialog" aria-modal="true">' +
        '<div style="display:flex; align-items:center; justify-content:space-between; padding-bottom:1rem; border-bottom:1.5px solid #f1f5f9; margin-bottom:1.2rem;"><div style="display:flex; align-items:center; gap:0.75rem;"><span style="font-size:1.8rem; color:#0d9488;">€</span><div><h2 style="font-size:1.45rem; font-weight:900; margin:0; color:#0f172a;">Finanze &amp; Gestione Contributi</h2><p style="font-size:0.84rem; color:#64748b; margin:0;">Cassa societaria e quote atleti</p></div></div><button type="button" class="es-tactical-btn-close" id="btn-close-finances">&times;</button></div>' +
        '<div class="es-pres-stats-kpi-row" style="margin-bottom:1.4rem;"><div class="es-pres-kpi-card"><div class="es-pres-kpi-val">€ ' + fin.balance.toFixed(2) + '</div><div class="es-pres-kpi-lbl">Saldo Cassa</div></div><div class="es-pres-kpi-card"><div class="es-pres-kpi-val" style="color:#0284c7;">' + fin.feesPaid + ' / ' + fin.feesTotal + '</div><div class="es-pres-kpi-lbl">Quote In Regola</div></div><div class="es-pres-kpi-card"><div class="es-pres-kpi-val" style="color:#f59e0b;">€ ' + (fin.sponsorsIncome || 8500).toFixed(2) + '</div><div class="es-pres-kpi-lbl">Ricavi Sponsor</div></div></div>' +
        '<div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.85rem;"><h3 style="font-size:1.05rem; font-weight:900; color:#0f172a; margin:0;">Movimenti cassa</h3><button type="button" class="btn btn-outline-pill pf-btn-solid" id="btn-add-transaction" style="background:#0d9488; color:#fff; border:none; padding:0.45rem 1.1rem; font-size:0.84rem; font-weight:800;">+ Registra</button></div>' +
        '<div style="max-height:40vh; overflow-y:auto;">' + txHtml + '</div>' +
      '</div>';
    document.body.appendChild(modal);
    function close() { modal.remove(); }
    modal.querySelector('#btn-close-finances').onclick = close;
    modal.onclick = function (e) { if (e.target === modal) close(); };
    modal.querySelector('#btn-add-transaction').onclick = function () {
      var d = prompt('Descrizione movimento:', 'Quota Iscrizione');
      if (d) {
        var a = parseFloat(prompt('Importo in €:', '250')) || 250;
        var t = confirm('Clicca OK per ENTRATA (+), o ANNULLA per USCITA (-)') ? 'in' : 'out';
        data.finances = data.finances || { balance: 14850, transactions: [] };
        data.finances.transactions = data.finances.transactions || [];
        data.finances.transactions.unshift({ date: new Date().toLocaleDateString('it-IT'), desc: d, type: t, amount: a });
        if (t === 'in') data.finances.balance += a; else data.finances.balance -= a;
        savePresData(data);
        openFinancesModal();
        renderHub();
      }
    };
  }

  function openCarSharingModal() {
    var old = document.getElementById('es-pres-carsharing-overlay');
    if (old) old.remove();
    var data = getPresData();
    var cars = data.carSharingPool || [];
    var carsListHtml = cars.map(function (c, idx) {
      var passCount = (c.passengers || []).length;
      var freeSeats = Math.max(0, c.totalSeats - passCount);
      var isFull = freeSeats === 0;
      return (
        '<div class="es-car-item-card"><div class="es-car-header"><div><h4 class="es-car-driver-name">🚗 ' + esc(c.driverName) + ' <span class="es-car-driver-tag">' + esc(c.driverRole) + '</span></h4><div style="font-size:0.8rem; color:#64748b;">🚘 ' + esc(c.carModel) + '</div></div><span class="es-car-seats-badge ' + (isFull ? 'is-full' : '') + '">' + (isFull ? 'Completo' : (freeSeats + ' posti liberi su ' + c.totalSeats)) + '</span></div><div class="es-car-details-row"><span>📍 ' + esc(c.departurePoint) + '</span><span>⏰ ' + esc(c.departureTime) + '</span><span>🎯 ' + esc(c.destination) + '</span></div><div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:0.6rem;">' + (!isFull ? ('<button type="button" class="btn btn-outline-pill pf-btn-solid" style="background:#0d9488; color:#fff; border:none; padding:0.4rem 1rem; font-size:0.82rem;" onclick="window.bookCarSeat(' + idx + ')">🙋‍♂️ Prenota</button>') : '') + '</div></div>'
      );
    }).join('');
    var modal = document.createElement('div');
    modal.id = 'es-pres-carsharing-overlay';
    modal.className = 'es-pres-stats-modal';
    modal.innerHTML =
      '<div class="es-pres-stats-sheet" style="max-width:760px;" role="dialog" aria-modal="true">' +
        '<div style="display:flex; align-items:center; justify-content:space-between; padding-bottom:1rem; border-bottom:1.5px solid #f1f5f9; margin-bottom:1.2rem;"><div style="display:flex; align-items:center; gap:0.75rem;"><span style="font-size:1.8rem;">🚗</span><div><h2 style="font-size:1.45rem; font-weight:900; margin:0; color:#0f172a;">Car Sharing Club</h2><p style="font-size:0.84rem; color:#64748b; margin:0;">Passaggi per allenamenti e trasferte</p></div></div><button type="button" class="es-tactical-btn-close" id="btn-close-carsharing">&times;</button></div>' +
        '<div style="max-height:55vh; overflow-y:auto;">' + carsListHtml + '</div>' +
      '</div>';
    document.body.appendChild(modal);
    function close() { modal.remove(); }
    modal.querySelector('#btn-close-carsharing').onclick = close;
    modal.onclick = function (e) { if (e.target === modal) close(); };
  }

  window.bookCarSeat = function (idx) {
    var pName = prompt('Nome del passeggero:', 'Atleta');
    if (pName) {
      var data = getPresData();
      var car = (data.carSharingPool || [])[idx];
      if (car) {
        car.passengers = car.passengers || [];
        car.passengers.push(pName);
        savePresData(data);
        openCarSharingModal();
        renderHub();
        if (window.showToast) window.showToast('🎉 Posto prenotato per ' + pName, 'success');
      }
    }
  };

  function openCreateEventModal() {
    var t = prompt('Titolo evento:', 'Allenamento');
    if (t) {
      var data = getPresData();
      data.trainingsList = data.trainingsList || [];
      data.trainingsList.unshift({ id: 'ev-' + Date.now(), day: 'mar', date: '01/09', title: t, incontro: '-:-', inizio: '19:00', fine: '20:30', campo: 'Stadio Pino Zaccheria', focus: 'Seduta di campo', votes: {} });
      savePresData(data);
      renderHub();
      if (window.showToast) window.showToast('✅ Evento creato!', 'success');
    }
  }

  function openLeavesModal() {
    if (window.showToast) window.showToast('🏥 Registro Medico & Ferie aperto', 'info');
  }

  function openStatsModal() {
    if (window.showToast) window.showToast('📊 Statistiche Aperte', 'info');
  }

  function bindHubEvents() {
    var mount = document.getElementById('es-prd');
    if (!mount) return;

    mount.querySelectorAll('.es-mister-nav-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeTab = btn.getAttribute('data-tab');
        renderHub();
      });
    });

    // Comunicazioni Tasti
    var btnCreateNews = mount.querySelector('#btn-pres-create-news');
    if (btnCreateNews) btnCreateNews.onclick = openCreateNewsModal;

    var btnCreatePoll = mount.querySelector('#btn-create-poll-center') || mount.querySelector('#link-view-all-polls');
    if (btnCreatePoll) btnCreatePoll.onclick = openCreatePollModal;

    var cardChat = mount.querySelector('#card-action-chat');
    if (cardChat) cardChat.onclick = openChatModal;

    var cardNews = mount.querySelector('#card-action-news');
    if (cardNews) cardNews.onclick = openCreateNewsModal;

    var cardPolls = mount.querySelector('#card-action-polls');
    if (cardPolls) cardPolls.onclick = openCreatePollModal;

    var cardCloud = mount.querySelector('#card-action-cloud');
    if (cardCloud) cardCloud.onclick = openCloudModal;

    // Squadra
    var btnInvite = mount.querySelector('#btn-pres-invite-members');
    if (btnInvite) btnInvite.onclick = openInviteMembersModal;

    var cardFinances = mount.querySelector('#card-action-finances');
    if (cardFinances) cardFinances.onclick = openFinancesModal;

    var cardStats = mount.querySelector('#card-action-stats');
    if (cardStats) cardStats.onclick = openStatsModal;

    // Eventi
    var btnCreateEv = mount.querySelector('#btn-pres-create-event');
    if (btnCreateEv) btnCreateEv.onclick = openCreateEventModal;

    var cardCar = mount.querySelector('#card-action-carsharing');
    if (cardCar) cardCar.onclick = openCarSharingModal;

    var cardLeaves = mount.querySelector('#card-action-leaves');
    if (cardLeaves) cardLeaves.onclick = openLeavesModal;

    // Interazioni Voti Like / Dislike
    mount.querySelectorAll('.es-training-vote-btn').forEach(function (btn) {
      btn.onclick = function () {
        var trainId = btn.getAttribute('data-train-id');
        var voteVal = btn.getAttribute('data-vote-val');
        var curUser = userObj();
        var myUserId = curUser.id || 'u-me';
        var data = getPresData();
        var train = (data.trainingsList || []).find(function (t) { return t.id === trainId; });
        if (train) {
          train.votes = train.votes || {};
          train.votes[myUserId] = { id: myUserId, name: curUser.name || 'Dirigente', role: curUser.ruolo || 'Dirigenza', vote: voteVal, isStaff: true };
          savePresData(data);
          renderHub();
          if (window.showToast) window.showToast(voteVal === 'yes' ? '👍 Presenza confermata' : '👎 Segnato come assente', 'success');
        }
      };
    });

    var btnCreateTactic = mount.querySelector('#btn-pres-create-tactic');
    if (btnCreateTactic) {
      btnCreateTactic.onclick = function () {
        if (window.EliseeCoachDash && typeof window.EliseeCoachDash.openEditor === 'function') {
          window.EliseeCoachDash.openEditor();
        }
      };
    }
  }

  function render(force) {
    var group = document.getElementById('user-dossier-view-group');
    if (!group) return;
    var u = userObj();
    if (!force && !isExecutive(u)) return;

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
    openNews: openCreateNewsModal,
    openPoll: openCreatePollModal,
    openChat: openChatModal,
    openCloud: openCloudModal,
    setTab: function (tab) {
      activeTab = tab;
      renderHub();
    }
  };

  function boot() {
    document.addEventListener('elisee:role-changed', function () {
      if (isExecutive()) render(true);
      else detach();
    });
    document.addEventListener('elisee:auth-changed', function () {
      if (isExecutive()) render(true);
      else detach();
    });
    if (isExecutive()) render(true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
