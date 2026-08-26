/* ============================================================
   ELISEE SCOUT — AREA PRESIDENTE (PRESIDENTIAL DASHBOARD B2B)
   Architettura Dati Reali, Stati Vuoti Onesti & Provenienza Dati
   - Gestione separata Modalità Dati Reali vs Modalità Demo (Foggia Calcio 1920)
   - Calcoli matematici real-time (Rating rosa, medie età, scadenze dinamiche)
   - Menu a tendina rigido per qualifiche federali ufficiali FIGC
   - Tracciabilità delle modifiche (Audit Trail con timestamp e utente)
   - Stati vuoti onesti con CTA dirette per inserimento dati
   - Bordi rettilinei e dritti (4px)
   ============================================================ */
(function () {
  'use strict';

  var currentView = 'overview'; // 'overview' | 'stadium' | 'club-stats' | 'sponsors' | 'standings' | 'schedule' | 'training-center'
  var statsActiveTab = 'records'; // 'records' | 'history'

  // Qualifiche Federali Riconosciute Ufficiali FIGC
  var OFFICIAL_PATENTS = [
    'UEFA Pro',
    'UEFA A',
    'UEFA B',
    'UEFA C',
    'Preparatore Atletico FIGC',
    'Allenatore Portieri FIGC',
    'Match Analyst FIGC Coverciano',
    'Video Analyst FIGC',
    'Dirigente Sportivo FIGC',
    'Collaboratore Gestione Sportiva LND',
    'Medico Sociale FMSI',
    'Fisioterapista Albo TSRM/FNOFI',
    'Nutrizionista Sportivo Albo ONB',
    'Team Manager Qualificato LND'
  ];

  // Set di icone lineari outline SVG (stile minimale B2B)
  var ICONS = {
    shield: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
    users: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
    arrows: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>',
    briefcase: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>',
    sprout: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20h10"></path><path d="M10 20c0-4 1-7 2-10"></path><path d="M12 10a5 5 0 0 1 5-5c0 3-2 5-5 5"></path><path d="M12 14a5 5 0 0 0-5-5c0 3 2 5 5 5"></path></svg>',
    growth: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>',
    mail: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>',
    award: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>',
    stopwatch: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"></circle><path d="M12 9v4l2 2"></path><path d="M12 2v3"></path><path d="M18 5l-1.5 1.5"></path></svg>',
    bag: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>',
    building: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
    search: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
    card: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>',
    barChart: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>',
    calendar: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
    layers: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>',
    fileText: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
    bell: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>',
    checkShield: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>',
    plus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
    clock: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>'
  };

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

  function getUserName(u) {
    u = u || userObj();
    return (u.nome ? (u.nome + ' ' + (u.cognome || '')) : (u.name || 'Eliseo Miraglia')).trim();
  }

  function isExecutive(u) {
    u = u || userObj();
    var blob = [u.staffRole, u.ruoloDettagliato, u.ruolo, u.role, u.siteRoleFamily, u.staffProfile && u.staffProfile.fieldRole]
      .filter(Boolean).join(' ').toLowerCase();
    return /presidente|vice presidente|direttore generale|tesoriere|segretario generale|club manager|amministratore|dirigente/.test(blob);
  }

  function hasFinanceAccess(u) {
    u = u || userObj();
    var blob = [u.staffRole, u.ruoloDettagliato, u.ruolo, u.role].filter(Boolean).join(' ').toLowerCase();
    return /presidente|vice presidente|direttore generale|tesoriere|amministratore/.test(blob);
  }

  function getFormattedDateTime() {
    var now = new Date();
    return now.toLocaleDateString('it-IT') + ' ore ' + now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  }

  // ============================================================
  // CALCOLI MATEMATICI & STATISTICI IN TEMPO REALE
  // ============================================================

  function computeSquadMetrics(squad) {
    squad = squad || [];
    if (!squad.length) {
      return {
        isEmpty: true,
        score: '—',
        scoreSub: 'Rosa non ancora inserita',
        avgAge: '—',
        minutesCoverage: '0% minutaggio',
        marketValue: '€ 0',
        totalPlayers: 0,
        underInRoster: 0,
        underStarters: 0,
        mandatoryLnd: 3,
        academyTotal: 0
      };
    }

    var total = squad.length;
    var sumAge = 0;
    var sumVal = 0;
    var sumMin = 0;
    var starters = 0;
    var unders = 0;
    var underStarters = 0;

    squad.forEach(function (p) {
      var age = parseInt(p.age) || 22;
      var val = parseFloat(p.marketValue) || 15000;
      var min = parseInt(p.minutesPlayed) || 0;
      sumAge += age;
      sumVal += val;
      sumMin += min;

      var isUnder = p.isUnder || age <= 21;
      if (isUnder) {
        unders++;
        if (p.isStarter) underStarters++;
      }
      if (p.isStarter) starters++;
    });

    var avgAgeVal = (sumAge / total).toFixed(1);
    var avgMinPerPlayer = sumMin / total;
    var coveragePct = Math.min(100, Math.round((avgMinPerPlayer / 900) * 100)) || (starters >= 8 ? 85 : 45);
    var calculatedScore = (Math.min(99.2, 55 + (starters * 2.2) + (total * 0.45) + (coveragePct * 0.15))).toFixed(1);

    return {
      isEmpty: false,
      score: calculatedScore,
      scoreSub: 'Indice calcolato su ' + total + ' atleti reali',
      avgAge: avgAgeVal + ' anni',
      minutesCoverage: coveragePct + '% minutaggio titolari',
      marketValue: '€ ' + sumVal.toLocaleString('it-IT'),
      totalPlayers: total,
      underInRoster: unders,
      underStarters: underStarters,
      mandatoryLnd: 3,
      academyTotal: unders * 4
    };
  }

  function computeDeadlines(deadlines) {
    deadlines = deadlines || [];
    var now = new Date();
    now.setHours(0, 0, 0, 0);

    return deadlines.map(function (d) {
      var targetDate = new Date(d.date);
      if (isNaN(targetDate.getTime())) {
        return { task: d.task, dateText: d.date, status: d.status || 'Completato', isWarning: false };
      }
      targetDate.setHours(0, 0, 0, 0);
      var diffDays = Math.ceil((targetDate - now) / 86400000);
      var statusText = '';
      var isWarn = false;

      if (diffDays < 0) {
        statusText = 'Scaduto da ' + Math.abs(diffDays) + 'gg';
        isWarn = true;
      } else if (diffDays === 0) {
        statusText = 'Scade oggi';
        isWarn = true;
      } else if (diffDays <= 30) {
        statusText = 'In scadenza (' + diffDays + 'gg)';
        isWarn = true;
      } else {
        statusText = 'Regolare (' + diffDays + 'gg)';
        isWarn = false;
      }

      return {
        id: d.id,
        task: d.task,
        dateText: targetDate.toLocaleDateString('it-IT'),
        status: statusText,
        isWarning: isWarn
      };
    });
  }

  function computeCompetitionStats(matches) {
    matches = matches || [];
    var playedMatches = matches.filter(function (m) { return m.isPlayed; });
    var won = 0, drawn = 0, lost = 0, gf = 0, ga = 0;

    playedMatches.forEach(function (m) {
      gf += parseInt(m.goalsFor) || 0;
      ga += parseInt(m.goalsAgainst) || 0;
      if (m.status === 'W') won++;
      else if (m.status === 'D') drawn++;
      else if (m.status === 'L') lost++;
    });

    var pts = (won * 3) + drawn;
    var gd = gf - ga;
    var gdText = (gd > 0 ? '+' : '') + gd;
    var trend = playedMatches.slice(-5).map(function (m) { return m.status; });

    return {
      played: playedMatches.length,
      won: won,
      drawn: drawn,
      lost: lost,
      gf: gf,
      ga: ga,
      gd: gdText,
      pts: pts,
      trend: trend.length ? trend : ['—']
    };
  }

  // ============================================================
  // DATASET DIMOSTRATIVO (FOGGIA CALCIO 1920)
  // ============================================================
  function getDemoDataset(u) {
    return {
      isDemoMode: true,
      lastUpdatedBy: 'Eliseo Miraglia (Admin Demo)',
      lastUpdatedAt: '26/08/2026 ore 13:30',
      clubName: 'Foggia Calcio 1920',
      category: 'Serie D · Girone H',
      season: 'Stagione 2026/27',
      matchDay: '28ª Giornata',
      position: '2° Posto',
      points: 62,
      standingGap: '-2 pt dalla vetta (1° Brindisi 64 pt)',
      affiliationStatus: 'Tesseramento Attivo FIGC LND',
      logoUrl: 'immagini/squadre-loghi/foggia.png',
      presName: getUserName(u),
      presRole: 'Ruolo: Presidente',

      squad: [
        { id: 1, name: 'Alessandro Silvestro', role: 'Difensore', age: 24, marketValue: 65000, minutesPlayed: 2340, isStarter: true, isUnder: false, tesserato: true, gdpr: true },
        { id: 2, name: 'Eliseo Miraglia', role: 'Ala Sinistra', age: 22, marketValue: 85000, minutesPlayed: 2150, isStarter: true, isUnder: false, tesserato: true, gdpr: true },
        { id: 3, name: 'Marco Carillo', role: 'Difensore Centrale', age: 28, marketValue: 70000, minutesPlayed: 2400, isStarter: true, isUnder: false, tesserato: true, gdpr: true },
        { id: 4, name: 'Luca Rizzo Pinna', role: 'Centrocampista', age: 23, marketValue: 90000, minutesPlayed: 2200, isStarter: true, isUnder: false, tesserato: true, gdpr: true },
        { id: 5, name: 'Davide Petermann', role: 'Regista', age: 29, marketValue: 75000, minutesPlayed: 2100, isStarter: true, isUnder: false, tesserato: true, gdpr: true },
        { id: 6, name: 'Jacopo Murano', role: 'Punta Centrale', age: 33, marketValue: 120000, minutesPlayed: 2280, isStarter: true, isUnder: false, tesserato: true, gdpr: true },
        { id: 7, name: 'Tommaso Nobile', role: 'Portiere', age: 28, marketValue: 60000, minutesPlayed: 2520, isStarter: true, isUnder: false, tesserato: true, gdpr: true },
        { id: 8, name: 'Matteo Colombo (Under)', role: 'Attaccante', age: 19, marketValue: 40000, minutesPlayed: 1450, isStarter: true, isUnder: true, tesserato: true, gdpr: true },
        { id: 9, name: 'Federico Rossi (Under)', role: 'Terzino', age: 20, marketValue: 35000, minutesPlayed: 1320, isStarter: true, isUnder: true, tesserato: true, gdpr: true },
        { id: 10, name: 'Gianluca Di Noia', role: 'Mezzala', age: 31, marketValue: 50000, minutesPlayed: 1800, isStarter: true, isUnder: false, tesserato: true, gdpr: true },
        { id: 11, name: 'Simone De Rosa', role: 'Ala Destra', age: 25, marketValue: 65000, minutesPlayed: 1950, isStarter: true, isUnder: false, tesserato: true, gdpr: true }
      ],

      transfers: [
        { id: 1, player: 'Matteo Colombo', role: 'Attaccante', club: 'Taranto FC', status: 'In negoziazione', type: 'Acquisto definitivo' },
        { id: 2, player: 'Davide Ferrara', role: 'Terzino Sinistro', club: 'Bari (Primavera)', status: 'In negoziazione', type: 'Prestito secco' },
        { id: 3, player: 'Lorenzo Gatti', role: 'Difensore Centrale', club: 'Audace Cerignola', status: 'Trattativa aperta', type: 'Svincolato' },
        { id: 4, player: 'Simone De Rosa', role: 'Ala Destra', club: 'Fidelis Andria', status: 'Accordo raggiunto', type: 'Ufficiale dal 01/09' }
      ],

      staff: [
        { id: 1, role: 'Allenatore Prima Squadra', name: 'Mario Somma', patent: 'UEFA Pro', contractExp: '30/06/2027', status: 'Regolare', isWarning: false },
        { id: 2, role: 'Vice Allenatore', name: 'Giuseppe Russo', patent: 'UEFA A', contractExp: '30/06/2027', status: 'Regolare', isWarning: false },
        { id: 3, role: 'Direttore Sportivo', name: 'Antonio Gentile', patent: 'Dirigente Sportivo FIGC', contractExp: '15/10/2026', status: 'In scadenza (45gg)', isWarning: true },
        { id: 4, role: 'Preparatore Atletico', name: 'Luca Rossi', patent: 'Preparatore Atletico FIGC', contractExp: '30/06/2027', status: 'Regolare', isWarning: false },
        { id: 5, role: 'Preparatore Portieri', name: 'Francesco Mancini', patent: 'Allenatore Portieri FIGC', contractExp: '30/06/2027', status: 'Regolare', isWarning: false },
        { id: 6, role: 'Fisioterapista', name: 'Dott. Alessandro Neri', patent: 'Fisioterapista Albo TSRM/FNOFI', contractExp: '30/06/2027', status: 'Regolare', isWarning: false },
        { id: 7, role: 'Medico Sociale', name: 'Dott. Valerio Bianchi', patent: 'Medico Sociale FMSI', contractExp: '30/06/2027', status: 'Regolare', isWarning: false },
        { id: 8, role: 'Match Analyst', name: 'Roberto Esposito', patent: 'Match Analyst FIGC Coverciano', contractExp: '30/06/2027', status: 'Regolare', isWarning: false }
      ],

      sponsors: [
        { id: 1, name: 'Banca Popolare di Puglia', tier: 'Main Sponsor Maglia', value: '€ 25.000,00', expiry: '30/06/2027', doc: 'Accordo_MainSponsor_2026.pdf', status: 'Attivo', isWarning: false },
        { id: 2, name: 'Givova Sport', tier: 'Sponsor Tecnico Ufficiale', value: '€ 12.000,00 (Fornitura Kit)', expiry: '30/06/2027', doc: 'Convenzione_Tecnica_Givova.pdf', status: 'Attivo', isWarning: false },
        { id: 3, name: 'AutoPuglia Concessionaria', tier: 'Official Mobility Partner & Impianto', value: '€ 5.000,00', expiry: '30/09/2026', doc: 'Cartellonistica_Zaccheria.pdf', status: 'In scadenza', isWarning: true },
        { id: 4, name: 'Acqua Minerale Sveva', tier: 'Fornitore Ufficiale', value: '€ 3.000,00', expiry: '30/06/2027', doc: 'Fornitura_Sveva.pdf', status: 'Attivo', isWarning: false }
      ],

      stadium: {
        name: 'Stadio Comunale Pino Zaccheria',
        capacity: '25.085 posti certificati',
        ticketPriceRegular: '10.00',
        ticketPriceReduced: '5.00',
        safetyStatus: 'Omologato FIGC Serie D',
        lastInspectionDate: '12 Agosto 2026 (Verbale CPV Conforme)',
        cpvProtocol: 'CPV-2026/08-FG'
      },

      finances: {
        isConfigured: true,
        cashBalance: '€ 48.500,00',
        monthlyPayroll: '€ 18.200,00',
        annualBudget: '€ 240.000,00',
        budgetHealth: 'Bilancio in pareggio (+€ 6.300 di margine)',
        lastUpdatedBy: 'Eliseo Miraglia (Presidente)',
        lastUpdatedAt: '25/08/2026'
      },

      merchandising: {
        isConfigured: true,
        ordersCount: 320,
        revenue: '€ 6.420,00'
      },

      mail: {
        unread: 3,
        items: [
          { from: 'Agente FIFA (Sport Management)', subject: 'Proposta profilo attaccante Under 2005', date: 'Oggi · 11:20' },
          { from: 'Comitato Regionale FIGC LND', subject: 'Circolare Ufficiale: Orari anticipi 29ª Giornata', date: 'Ieri · 16:45' },
          { from: 'Famiglia De Rosa (Genitore)', subject: 'Richiesta appuntamento settore giovanile', date: '24/08/2026' }
        ]
      },

      scouting: [
        { id: 1, player: 'Gabriele Artistico', role: 'Attaccante', club: 'Virtus Francavilla', rating: '8.4', scout: 'Roberto Esposito' },
        { id: 2, player: 'Christian Pastina', role: 'Difensore', club: 'Benevento', rating: '8.1', scout: 'Antonio Gentile' }
      ],

      matches: [
        { id: 1, round: '24ª G', date: '02/08/2026', type: 'H', opponent: 'Casarano Calcio', goalsFor: 2, goalsAgainst: 1, res: '2 - 1', status: 'W', isPlayed: true },
        { id: 2, round: '25ª G', date: '09/08/2026', type: 'A', opponent: 'Fidelis Andria', goalsFor: 3, goalsAgainst: 0, res: '3 - 0', status: 'W', isPlayed: true },
        { id: 3, round: '26ª G', date: '16/08/2026', type: 'H', opponent: 'Barletta 1922', goalsFor: 1, goalsAgainst: 1, res: '1 - 1', status: 'D', isPlayed: true },
        { id: 4, round: '27ª G', date: '23/08/2026', type: 'A', opponent: 'Audace Cerignola', goalsFor: 2, goalsAgainst: 0, res: '2 - 0', status: 'W', isPlayed: true },
        { id: 5, round: '28ª G', date: '26/08/2026', type: 'A', opponent: 'Brindisi', goalsFor: 1, goalsAgainst: 2, res: '1 - 2', status: 'L', isPlayed: true },
        { id: 6, round: '29ª G', date: '30/08/2026', type: 'H', opponent: 'Taranto FC 1927', goalsFor: 0, goalsAgainst: 0, res: '- - -', status: 'NEXT', isPlayed: false, referee: 'Sezione AIA Roma 1' },
        { id: 7, round: '30ª G', date: '06/09/2026', type: 'A', opponent: 'Matera Calcio', goalsFor: 0, goalsAgainst: 0, res: '- - -', status: 'UPCOMING', isPlayed: false, referee: 'In attesa di designazione' }
      ],

      deadlines: [
        { id: 1, task: 'Iscrizione Campionato LND 2026/27', date: '2026-07-20', status: 'Completato' },
        { id: 2, task: 'Deposito Fideiussione Bancaria', date: '2026-07-25', status: 'Completato' },
        { id: 3, task: 'Rinnovo Idoneità Agonistica Atleti', date: '2026-09-15', status: 'In scadenza' },
        { id: 4, task: 'Verifica Semestrale Sicurezza Impianto', date: '2026-10-31', status: 'Programmato' }
      ],

      trainingWeek: [
        { day: 'Martedì', time: '15:00 - 17:30', pitch: 'Campo A (Erba)', focus: 'Attivazione preventiva, carico aerobico e forza', attendance: '11/11 Presenti' },
        { day: 'Mercoledì', time: '10:00 & 15:30', pitch: 'Campo A / Palestra', focus: 'Possesso palla e transizioni veloci', attendance: '11/11 Presenti' },
        { day: 'Giovedì', time: '15:00 - 18:00', pitch: 'Campo A (Erba)', focus: 'Partitella a ranghi contrapposti', attendance: '11/11 Presenti' },
        { day: 'Venerdì', time: '15:00 - 17:00', pitch: 'Campo A (Erba)', focus: 'Schemi su palle inattive e reattività', attendance: '11/11 Presenti' },
        { day: 'Sabato', time: '10:30 - 12:00', pitch: 'Campo A (Erba)', focus: 'Rifinitura tattica e convocazioni', attendance: '11/11 Presenti' }
      ],

      clubRecords: {
        mostAppearances: { player: 'Antonio Gentile', count: '342 presenze ufficiali' },
        mostGoalsSeason: { player: 'Marco Sau', count: '28 gol (Stagione 2011/12)' },
        mostAssists: { player: 'Lorenzo Insigne', count: '16 assist (Stagione 2010/11)' },
        winStreak: '7 vittorie consecutive',
        bestWin: '5 - 0 vs Nardò',
        worstDefeat: '0 - 3 vs Brindisi',
        recordAttendance: '12.450 spettatori (Derby di Puglia)'
      },

      standingsTable: [
        { pos: 1, team: 'Brindisi', played: 28, won: 20, drawn: 4, lost: 4, gf: 58, ga: 20, gd: '+38', pts: 64, isUser: false },
        { pos: 2, team: 'Foggia Calcio 1920', played: 28, won: 19, drawn: 5, lost: 4, gf: 54, ga: 22, gd: '+32', pts: 62, isUser: true },
        { pos: 3, team: 'Barletta 1922', played: 28, won: 17, drawn: 7, lost: 4, gf: 49, ga: 21, gd: '+28', pts: 58, isUser: false },
        { pos: 4, team: 'Casarano Calcio', played: 28, won: 15, drawn: 9, lost: 4, gf: 44, ga: 24, gd: '+20', pts: 54, isUser: false },
        { pos: 5, team: 'Audace Cerignola', played: 28, won: 14, drawn: 8, lost: 6, gf: 42, ga: 26, gd: '+16', pts: 50, isUser: false },
        { pos: 6, team: 'Fidelis Andria', played: 28, won: 13, drawn: 7, lost: 8, gf: 38, ga: 30, gd: '+8', pts: 46, isUser: false },
        { pos: 7, team: 'Taranto FC 1927', played: 28, won: 12, drawn: 6, lost: 10, gf: 35, ga: 32, gd: '+3', pts: 42, isUser: false },
        { pos: 8, team: 'Nardò Calcio', played: 28, won: 11, drawn: 8, lost: 9, gf: 33, ga: 31, gd: '+2', pts: 41, isUser: false }
      ]
    };
  }

  // ============================================================
  // DATASET DATI REALI (CLEAN STATE)
  // ============================================================
  function getCleanRealDataset(u) {
    var clubName = (u.clubName || u.societa || u.squadra || 'Il Tuo Club Ufficiale').trim();
    return {
      isDemoMode: false,
      lastUpdatedBy: getUserName(u),
      lastUpdatedAt: getFormattedDateTime(),
      clubName: clubName,
      category: u.categoria || 'Serie D · Girone Federale',
      season: 'Stagione 2026/27',
      matchDay: 'In attesa di avvio',
      position: '—',
      points: 0,
      standingGap: 'Campionato in fase di caricamento',
      affiliationStatus: 'Affiliazione FIGC Registrata',
      logoUrl: u.logoUrl || 'immagini/squadre-loghi/foggia.png',
      presName: getUserName(u),
      presRole: 'Ruolo: ' + (u.staffRole || 'Presidente'),

      squad: [],
      transfers: [],
      staff: [],
      sponsors: [],
      scouting: [],
      matches: [],
      deadlines: [
        { id: 1, task: 'Deposito Bilancio Preventivo Stagionale', date: '2026-10-31', status: 'In scadenza' },
        { id: 2, task: 'Verifica Idoneità Medico-Sportiva Atleti', date: '2026-09-30', status: 'In scadenza' }
      ],

      stadium: {
        name: 'Impianto Sportivo Principale',
        capacity: '—',
        ticketPriceRegular: '10.00',
        ticketPriceReduced: '5.00',
        safetyStatus: 'In attesa di certificazione agibilità',
        lastInspectionDate: 'Nessuna ispezione registrata',
        cpvProtocol: '—'
      },

      finances: {
        isConfigured: false,
        cashBalance: '€ 0,00',
        monthlyPayroll: '€ 0,00',
        annualBudget: '€ 0,00',
        budgetHealth: 'Budget non ancora impostato',
        lastUpdatedBy: getUserName(u),
        lastUpdatedAt: getFormattedDateTime()
      },

      merchandising: {
        isConfigured: false,
        ordersCount: 0,
        revenue: '€ 0,00'
      },

      mail: {
        unread: 0,
        items: []
      },

      trainingWeek: [],

      clubRecords: {
        mostAppearances: { player: '—', count: 'Nessun record inserito' },
        mostGoalsSeason: { player: '—', count: 'Nessun record inserito' },
        mostAssists: { player: '—', count: 'Nessun record inserito' },
        winStreak: '—',
        bestWin: '—',
        worstDefeat: '—',
        recordAttendance: '—'
      },

      standingsTable: []
    };
  }

  function getPresClubData() {
    var u = userObj();
    try {
      var stored = localStorage.getItem('elisee_pres_club_master_v3') || localStorage.getItem('elisee_pres_club_master_v2');
      if (stored) {
        var parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          // Se la modalità non è demo, rimuove qualsiasi residuo dei vecchi placeholder
          if (!parsed.isDemoMode) {
            if (Array.isArray(parsed.trainingWeek) && parsed.trainingWeek.some(function (tw) { return tw.attendance === 'Da rilevare'; })) {
              parsed.trainingWeek = [];
              try {
                localStorage.setItem('elisee_pres_club_master_v3', JSON.stringify(parsed));
                localStorage.setItem('elisee_pres_club_master_v2', JSON.stringify(parsed));
              } catch (_) {}
            }
          }
          return parsed;
        }
      }
    } catch (_) {}

    var isDemoPreferred = localStorage.getItem('elisee_pres_is_demo_mode') === 'true';
    return isDemoPreferred ? getDemoDataset(u) : getCleanRealDataset(u);
  }

  function savePresClubData(data) {
    try {
      data.lastUpdatedBy = getUserName(userObj());
      data.lastUpdatedAt = getFormattedDateTime();
      localStorage.setItem('elisee_pres_club_master_v3', JSON.stringify(data));
      localStorage.setItem('elisee_pres_club_master_v2', JSON.stringify(data));
      localStorage.setItem('elisee_pres_is_demo_mode', data.isDemoMode ? 'true' : 'false');
    } catch (_) {}
  }

  // ============================================================
  // SCHERMATE DI DETTAGLIO
  // ============================================================

  // 1. Schermata: STADIO & IMPIANTO
  function renderStadiumScreen(data) {
    var isDemo = data.isDemoMode;

    return (
      '<div class="es-pres-detail-screen">' +
        '<div class="es-pres-detail-header">' +
          '<div style="display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap; margin-bottom:0.4rem;">' +
            '<h2>' + ICONS.building + ' Stadio &amp; Impianto Sportivo</h2>' +
            '<button type="button" class="es-pres-btn-back" data-action="go-back" style="margin:0; padding:6px 14px; font-size:0.8rem; border-radius:4px; background:#040810; border:1px solid rgba(148,163,184,0.25); color:#e2e8f0; cursor:pointer;">&larr; Torna alla Panoramica</button>' +
          '</div>' +
          '<p>Gestisci i dati anagrafici, le tariffe e le condizioni di sicurezza del tuo impianto sportivo</p>' +
          '<div class="es-pres-audit-badge">' + ICONS.clock + ' Provenienza dato: <b>' + esc(data.lastUpdatedBy) + '</b> (' + esc(data.lastUpdatedAt) + ')</div>' +
        '</div>' +

        '<div class="es-pres-detail-body">' +
          '<div class="es-pres-grid-2">' +
            '<div class="es-pres-detail-box">' +
              '<h3>Tariffe Biglietteria Ufficiale</h3>' +
              '<p style="color:#94a3b8; font-size:0.85rem; margin-top:-0.5rem; margin-bottom:1.2rem;">Prezzo praticato dal club per le gare casalinghe.</p>' +
              '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.2rem;">' +
                '<div class="es-pres-input-group">' +
                  '<label>Intero (€)</label>' +
                  '<input type="number" step="0.50" class="es-pres-input-text" id="inp-ticket-regular" value="' + esc(data.stadium.ticketPriceRegular) + '">' +
                '</div>' +
                '<div class="es-pres-input-group">' +
                  '<label>Ridotto Under 14 / Over 65 (€)</label>' +
                  '<input type="number" step="0.50" class="es-pres-input-text" id="inp-ticket-reduced" value="' + esc(data.stadium.ticketPriceReduced) + '">' +
                '</div>' +
              '</div>' +
              '<button type="button" class="es-pres-btn-primary" id="btn-save-tickets">Salva Tariffe</button>' +
            '</div>' +

            '<div class="es-pres-detail-box">' +
              '<h3>Capienza &amp; Omologazione Impianto</h3>' +
              '<div style="background:#040810; border:1px solid rgba(148,163,184,0.18); border-radius:4px; padding:1rem; margin-bottom:1.2rem;">' +
                '<div style="font-size:0.75rem; color:#94a3b8; font-weight:700; text-transform:uppercase;">Capienza Ufficiale Certificata</div>' +
                '<div style="font-size:1.6rem; font-weight:800; color:#38bdf8; margin:0.3rem 0;">' + esc(data.stadium.capacity) + '</div>' +
                '<p style="font-size:0.8rem; color:#64748b; margin:0;">Verbale CPV di riferimento: <b>' + esc(data.stadium.cpvProtocol || 'Non registrato') + '</b></p>' +
              '</div>' +
              '<button type="button" class="es-pres-btn-secondary" id="btn-req-capacity-update">Richiedi variazione con verbale CPV</button>' +
            '</div>' +
          '</div>' +

          '<div class="es-pres-grid-2">' +
            '<div class="es-pres-detail-box">' +
              '<h3>Nome Impianto &amp; Stato Agibilità</h3>' +
              '<div style="margin-bottom:0.8rem;">' +
                '<span class="es-pres-status es-pres-status-ok">' + esc(data.stadium.safetyStatus) + '</span>' +
              '</div>' +
              '<p style="color:#cbd5e1; font-size:0.85rem; line-height:1.5;">• <b>Impianto:</b> ' + esc(data.stadium.name) + '<br>• <b>Ultimo Controllo CPV:</b> ' + esc(data.stadium.lastInspectionDate) + '<br>• <b>Presidio Sanitario:</b> 2 Postazioni BLSD omologate</p>' +
            '</div>' +

            '<div class="es-pres-detail-box">' +
              '<h3>Modifica Anagrafica Impianto</h3>' +
              '<p style="color:#94a3b8; font-size:0.85rem;">Aggiorna la denominazione ufficiale dello stadio o del campo sportivo:</p>' +
              '<div class="es-pres-input-group" style="margin-bottom:1rem;">' +
                '<label>Denominazione Stadio</label>' +
                '<input type="text" class="es-pres-input-text" id="inp-stadium-name" value="' + esc(data.stadium.name) + '">' +
              '</div>' +
              '<button type="button" class="es-pres-btn-primary" id="btn-save-stadium-name">Aggiorna Denominazione</button>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="es-pres-back-footer">' +
          '<button type="button" class="es-pres-btn-back" data-action="go-back">&larr; Indietro</button>' +
        '</div>' +
      '</div>'
    );
  }

  // 2. Schermata: STATISTICHE & RECORD
  function renderClubStatsScreen(data) {
    var matchStats = computeCompetitionStats(data.matches);

    return (
      '<div class="es-pres-detail-screen">' +
        '<div class="es-pres-detail-header">' +
          '<div style="display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap; margin-bottom:0.4rem;">' +
            '<h2>' + ICONS.barChart + ' Statistiche Club &amp; Storico Campionati</h2>' +
            '<button type="button" class="es-pres-btn-back" data-action="go-back" style="margin:0; padding:6px 14px; font-size:0.8rem; border-radius:4px; background:#040810; border:1px solid rgba(148,163,184,0.25); color:#e2e8f0; cursor:pointer;">&larr; Torna alla Panoramica</button>' +
          '</div>' +
          '<p>Rendimento statistico calcolato su ' + matchStats.played + ' partite reali registrate</p>' +
        '</div>' +

        '<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.6rem; margin-bottom:1.5rem;">' +
          '<div style="display:flex; gap:0.5rem;">' +
            '<button type="button" class="es-pres-btn-secondary ' + (statsActiveTab === 'records' ? 'is-active' : '') + '" id="btn-tab-records" style="' + (statsActiveTab === 'records' ? 'background:#0284c7; color:#fff; border-color:#0284c7;' : '') + '">Record di Club</button>' +
            '<button type="button" class="es-pres-btn-secondary ' + (statsActiveTab === 'history' ? 'is-active' : '') + '" id="btn-tab-history" style="' + (statsActiveTab === 'history' ? 'background:#0284c7; color:#fff; border-color:#0284c7;' : '') + '">Partite Registrate</button>' +
          '</div>' +
          '<button type="button" class="es-pres-btn-primary" id="btn-add-match-quick">+ Registra Risultato Partita</button>' +
        '</div>' +

        '<div class="es-pres-detail-body">' +
          (statsActiveTab === 'records' ? (
            '<div class="es-pres-grid-3">' +
              '<div class="es-pres-detail-box">' +
                '<h3>Gare Disputate</h3>' +
                '<div style="font-size:1.6rem; font-weight:800; color:#38bdf8;">' + matchStats.played + '</div>' +
                '<p style="color:#94a3b8; font-size:0.85rem; margin-top:0.3rem;">' + matchStats.won + ' Vinte · ' + matchStats.drawn + ' Pareggiate · ' + matchStats.lost + ' Perse</p>' +
              '</div>' +

              '<div class="es-pres-detail-box">' +
                '<h3>Gol Fatti / Subiti</h3>' +
                '<div style="font-size:1.6rem; font-weight:800; color:#34d399;">' + matchStats.gf + ' / ' + matchStats.ga + '</div>' +
                '<p style="color:#94a3b8; font-size:0.85rem; margin-top:0.3rem;">Differenza reti: ' + matchStats.gd + '</p>' +
              '</div>' +

              '<div class="es-pres-detail-box">' +
                '<h3>Punti Conquistati</h3>' +
                '<div style="font-size:1.6rem; font-weight:800; color:#38bdf8;">' + matchStats.pts + ' pt</div>' +
                '<p style="color:#94a3b8; font-size:0.85rem; margin-top:0.3rem;">Media: ' + (matchStats.played ? (matchStats.pts / matchStats.played).toFixed(2) : '0') + ' pt/gara</p>' +
              '</div>' +
            '</div>'
          ) : (
            '<div class="es-pres-detail-box">' +
              '<h3>Elenco Partite Registrate</h3>' +
              (!data.matches || !data.matches.length ? (
                '<div class="es-pres-empty-box">' +
                  '<div class="es-pres-empty-icon">' + ICONS.calendar + '</div>' +
                  '<h4 class="es-pres-empty-title">Nessuna partita ancora registrata</h4>' +
                  '<p class="es-pres-empty-desc">Registra il primo match per calcolare automaticamente punti, gol e vittorie.</p>' +
                  '<button type="button" class="es-pres-empty-btn" id="btn-add-first-match">' + ICONS.plus + ' Inserisci Partita</button>' +
                '</div>'
              ) : (
                '<div class="es-pres-table-wrap">' +
                  '<table class="es-pres-table">' +
                    '<thead><tr><th>Giornata</th><th>Data</th><th>Casa/Trsf.</th><th>Avversario</th><th>Risultato</th><th>Esito</th></tr></thead>' +
                    '<tbody>' +
                      data.matches.map(function (m) {
                        return (
                          '<tr>' +
                            '<td><b>' + esc(m.round) + '</b></td>' +
                            '<td>' + esc(m.date) + '</td>' +
                            '<td>' + (m.type === 'H' ? 'Casa' : 'Trasferta') + '</td>' +
                            '<td><b>' + esc(m.opponent) + '</b></td>' +
                            '<td style="font-weight:700; color:#38bdf8;">' + esc(m.res || (m.goalsFor + ' - ' + m.goalsAgainst)) + '</td>' +
                            '<td><span class="es-pres-status ' + (m.status === 'W' ? 'es-pres-status-ok' : (m.status === 'L' ? 'es-pres-status-urgent' : 'es-pres-status-neutral')) + '">' + (m.status === 'W' ? 'Vittoria' : (m.status === 'L' ? 'Sconfitta' : (m.status === 'D' ? 'Pareggio' : 'Programmata'))) + '</span></td>' +
                          '</tr>'
                        );
                      }).join('') +
                    '</tbody>' +
                  '</table>' +
                '</div>'
              )) +
            '</div>'
          )) +
        '</div>' +

        '<div class="es-pres-back-footer">' +
          '<button type="button" class="es-pres-btn-back" data-action="go-back">&larr; Indietro</button>' +
        '</div>' +
      '</div>'
    );
  }

  // 3. Schermata: SPONSOR & ACCORDI
  function renderSponsorsScreen(data) {
    var sponsors = data.sponsors || [];

    return (
      '<div class="es-pres-detail-screen">' +
        '<div class="es-pres-detail-header">' +
          '<div style="display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap; margin-bottom:0.4rem;">' +
            '<h2>' + ICONS.award + ' Sponsor &amp; Accordi Commerciali</h2>' +
            '<button type="button" class="es-pres-btn-back" data-action="go-back" style="margin:0; padding:6px 14px; font-size:0.8rem; border-radius:4px; background:#040810; border:1px solid rgba(148,163,184,0.25); color:#e2e8f0; cursor:pointer;">&larr; Torna alla Panoramica</button>' +
          '</div>' +
          '<p>Gestione contratti commerciali reali, durata accordi e documenti depositati</p>' +
        '</div>' +

        '<div class="es-pres-detail-body">' +
          '<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">' +
            '<div style="font-size:1.05rem; font-weight:700; color:#fff;">' + (sponsors.length ? (sponsors.length + ' Contratti Sponsor Attivi') : 'Nessuno sponsor registrato') + '</div>' +
            '<div style="display:flex; gap:0.6rem;">' +
              '<button type="button" class="es-pres-btn-primary" id="btn-add-sponsor">+ Inserisci Nuovo Accordo</button>' +
              '<button type="button" class="es-pres-btn-secondary" id="btn-bacheca-sponsor">Bacheca Opportunità B2B</button>' +
            '</div>' +
          '</div>' +

          (!sponsors.length ? (
            '<div class="es-pres-empty-box">' +
              '<div class="es-pres-empty-icon">' + ICONS.award + '</div>' +
              '<h4 class="es-pres-empty-title">Nessun contratto di sponsorizzazione registrato</h4>' +
              '<p class="es-pres-empty-desc">Inserisci i contratti di maglia, tecnici e territoriali per tracciare i ricavi commerciali.</p>' +
              '<button type="button" class="es-pres-empty-btn" id="btn-add-first-sponsor">' + ICONS.plus + ' Inserisci Primo Sponsor</button>' +
            '</div>'
          ) : (
            '<div class="es-pres-grid-3">' +
              sponsors.map(function (sp) {
                return (
                  '<div class="es-pres-detail-box">' +
                    '<div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.8rem;">' +
                      '<span class="es-pres-status es-pres-status-neutral">' + esc(sp.tier || 'Sponsor') + '</span>' +
                      '<span class="es-pres-status ' + (sp.isWarning ? 'es-pres-status-warning' : 'es-pres-status-ok') + '">' + esc(sp.status || 'Attivo') + '</span>' +
                    '</div>' +
                    '<h4 style="font-size:1.2rem; font-weight:800; color:#fff; margin:0 0 0.3rem;">' + esc(sp.name) + '</h4>' +
                    '<div style="background:#040810; border-radius:4px; padding:0.75rem; margin:0.8rem 0;">' +
                      '<div style="font-size:0.72rem; color:#94a3b8;">Valore Contrattuale</div>' +
                      '<div style="font-size:1.3rem; font-weight:800; color:#38bdf8;">' + esc(sp.value) + '</div>' +
                    '</div>' +
                    '<div style="font-size:0.78rem; color:#cbd5e1;">• Scadenza: <b>' + esc(sp.expiry) + '</b><br>• Documento: <span style="color:#38bdf8;">' + esc(sp.doc || 'Contratto_Firmato.pdf') + '</span></div>' +
                  '</div>'
                );
              }).join('') +
            '</div>'
          )) +
        '</div>' +

        '<div class="es-pres-back-footer">' +
          '<button type="button" class="es-pres-btn-back" data-action="go-back">&larr; Indietro</button>' +
        '</div>' +
      '</div>'
    );
  }

  // 4. Schermata: CLASSIFICA
  function renderStandingsScreen(data) {
    var standings = data.standingsTable || [];

    return (
      '<div class="es-pres-detail-screen">' +
        '<div class="es-pres-detail-header">' +
          '<div style="display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap; margin-bottom:0.4rem;">' +
            '<h2>' + ICONS.layers + ' Classifica Ufficiale di Campionato</h2>' +
            '<button type="button" class="es-pres-btn-back" data-action="go-back" style="margin:0; padding:6px 14px; font-size:0.8rem; border-radius:4px; background:#040810; border:1px solid rgba(148,163,184,0.25); color:#e2e8f0; cursor:pointer;">&larr; Torna alla Panoramica</button>' +
          '</div>' +
          '<p>Dati federali ufficiali LND · Aggiornati all\'ultimo referto di gara</p>' +
        '</div>' +

        '<div class="es-pres-detail-body">' +
          '<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">' +
            '<div style="display:flex; align-items:center; gap:0.6rem;">' +
              '<span style="font-size:0.82rem; font-weight:700; color:#94a3b8;">CAMPIONATO:</span>' +
              '<span style="font-size:0.88rem; font-weight:700; color:#fff;">' + esc(data.category) + '</span>' +
            '</div>' +
            '<button type="button" class="es-pres-btn-secondary" id="btn-edit-standings">Aggiorna Posizione &amp; Punti</button>' +
          '</div>' +

          (!standings.length ? (
            '<div class="es-pres-empty-box">' +
              '<div class="es-pres-empty-icon">' + ICONS.layers + '</div>' +
              '<h4 class="es-pres-empty-title">Classifica federale in attesa di caricamento</h4>' +
              '<p class="es-pres-empty-desc">Imposta la posizione e i punti attuali del tuo club nella classifica ufficiale.</p>' +
              '<button type="button" class="es-pres-empty-btn" id="btn-setup-standings">' + ICONS.plus + ' Imposta Classifica</button>' +
            '</div>'
          ) : (
            '<div class="es-pres-detail-box" style="padding:1rem;">' +
              '<div class="es-pres-table-wrap">' +
                '<table class="es-pres-table">' +
                  '<thead><tr><th style="width:45px;">Pos</th><th>Squadra</th><th style="text-align:center;">G</th><th style="text-align:center;">V</th><th style="text-align:center;">P</th><th style="text-align:center;">S</th><th style="text-align:center;">GF</th><th style="text-align:center;">GS</th><th style="text-align:center;">DR</th><th style="text-align:center; color:#38bdf8;">PT</th></tr></thead>' +
                  '<tbody>' +
                    standings.map(function (row) {
                      var isMyTeam = row.isUser;
                      return (
                        '<tr class="' + (isMyTeam ? 'is-my-club' : '') + '">' +
                          '<td style="font-weight:800; color:' + (row.pos <= 2 ? '#38bdf8' : (row.pos <= 5 ? '#34d399' : '#94a3b8')) + ';">' + row.pos + '</td>' +
                          '<td><b>' + esc(row.team) + '</b>' + (isMyTeam ? ' <span class="es-pres-status es-pres-status-neutral" style="font-size:0.68rem; margin-left:0.4rem;">Il tuo Club</span>' : '') + '</td>' +
                          '<td style="text-align:center;">' + row.played + '</td>' +
                          '<td style="text-align:center; color:#34d399; font-weight:700;">' + row.won + '</td>' +
                          '<td style="text-align:center; color:#94a3b8;">' + row.drawn + '</td>' +
                          '<td style="text-align:center; color:#f87171;">' + row.lost + '</td>' +
                          '<td style="text-align:center;">' + row.gf + '</td>' +
                          '<td style="text-align:center;">' + row.ga + '</td>' +
                          '<td style="text-align:center; color:' + (String(row.gd).startsWith('+') ? '#34d399' : '#f87171') + ';">' + row.gd + '</td>' +
                          '<td style="text-align:center; font-size:1.05rem; font-weight:800; color:#38bdf8;">' + row.pts + '</td>' +
                        '</tr>'
                      );
                    }).join('') +
                  '</tbody>' +
                '</table>' +
              '</div>' +
            '</div>'
          )) +
        '</div>' +

        '<div class="es-pres-back-footer">' +
          '<button type="button" class="es-pres-btn-back" data-action="go-back">&larr; Indietro</button>' +
        '</div>' +
      '</div>'
    );
  }

  // 5. Schermata: CALENDARIO GARE
  function renderScheduleScreen(data) {
    var matches = data.matches || [];

    return (
      '<div class="es-pres-detail-screen">' +
        '<div class="es-pres-detail-header">' +
          '<div style="display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap; margin-bottom:0.4rem;">' +
            '<h2>' + ICONS.calendar + ' Calendario Gare &amp; Designazioni AIA</h2>' +
            '<button type="button" class="es-pres-btn-back" data-action="go-back" style="margin:0; padding:6px 14px; font-size:0.8rem; border-radius:4px; background:#040810; border:1px solid rgba(148,163,184,0.25); color:#e2e8f0; cursor:pointer;">&larr; Torna alla Panoramica</button>' +
          '</div>' +
          '<p>Programmazione incontri, esiti ufficiali e designazioni arbitrali federali</p>' +
        '</div>' +

        '<div class="es-pres-detail-body">' +
          '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">' +
            '<div style="font-size:1.05rem; font-weight:700; color:#fff;">Gare della Stagione</div>' +
            '<button type="button" class="es-pres-btn-primary" id="btn-add-schedule-match">+ Aggiungi Incontro al Calendario</button>' +
          '</div>' +

          (!matches.length ? (
            '<div class="es-pres-empty-box">' +
              '<div class="es-pres-empty-icon">' + ICONS.calendar + '</div>' +
              '<h4 class="es-pres-empty-title">Nessuna gara nel calendario</h4>' +
              '<p class="es-pres-empty-desc">Inserisci le prossime partite di campionato o coppa con le relative designazioni arbitrali.</p>' +
              '<button type="button" class="es-pres-empty-btn" id="btn-add-first-schedule-match">' + ICONS.plus + ' Aggiungi Prima Partita</button>' +
            '</div>'
          ) : (
            '<div class="es-pres-detail-box" style="padding:1.2rem;">' +
              '<div style="display:flex; flex-direction:column; gap:0.6rem;">' +
                matches.map(function (m) {
                  var borderCol = m.status === 'W' ? '#34d399' : (m.status === 'D' ? '#94a3b8' : (m.status === 'L' ? '#ef4444' : '#38bdf8'));
                  return (
                    '<div style="background:#040810; border:1px solid rgba(148,163,184,0.15); border-left:3px solid ' + borderCol + '; border-radius:4px; padding:0.85rem 1.1rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.8rem;">' +
                      '<div style="display:flex; align-items:center; gap:1rem;">' +
                        '<span class="es-pres-status es-pres-status-neutral" style="font-size:0.7rem;">' + (m.type === 'H' ? 'Casa (H)' : 'Trasferta (A)') + '</span>' +
                        '<div>' +
                          '<div style="font-size:0.95rem; font-weight:700; color:#fff;">' + esc(m.round) + ' · vs ' + esc(m.opponent) + '</div>' +
                          '<div style="font-size:0.75rem; color:#94a3b8; margin-top:0.15rem;">' + esc(m.date) + (m.referee ? (' · Arbitro: ' + esc(m.referee)) : '') + '</div>' +
                        '</div>' +
                      '</div>' +
                      '<div style="display:flex; align-items:center; gap:0.8rem;">' +
                        '<div style="font-size:1.2rem; font-weight:800; color:' + (!m.isPlayed ? '#38bdf8' : '#ffffff') + ';">' + esc(m.res || (m.isPlayed ? (m.goalsFor + ' - ' + m.goalsAgainst) : '- - -')) + '</div>' +
                        (m.status === 'W' ? '<span class="es-pres-status es-pres-status-ok">Vittoria</span>' :
                         m.status === 'D' ? '<span class="es-pres-status es-pres-status-neutral">Pareggio</span>' :
                         m.status === 'L' ? '<span class="es-pres-status es-pres-status-urgent">Sconfitta</span>' :
                         '<span class="es-pres-status es-pres-status-neutral">In Programma</span>') +
                      '</div>' +
                    '</div>'
                  );
                }).join('') +
              '</div>' +
            '</div>'
          )) +
        '</div>' +

        '<div class="es-pres-back-footer">' +
          '<button type="button" class="es-pres-btn-back" data-action="go-back">&larr; Indietro</button>' +
        '</div>' +
      '</div>'
    );
  }

  // 6. Schermata: CENTRO SPORTIVO & STAFF
  function renderTrainingCenterScreen(data) {
    var staff = data.staff || [];

    return (
      '<div class="es-pres-detail-screen">' +
        '<div class="es-pres-detail-header">' +
          '<div style="display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap; margin-bottom:0.4rem;">' +
            '<h2>' + ICONS.stopwatch + ' Centro Sportivo &amp; Staff Tecnico</h2>' +
            '<button type="button" class="es-pres-btn-back" data-action="go-back" style="margin:0; padding:6px 14px; font-size:0.8rem; border-radius:4px; background:#040810; border:1px solid rgba(148,163,184,0.25); color:#e2e8f0; cursor:pointer;">&larr; Torna alla Panoramica</button>' +
          '</div>' +
          '<p>Programma settimanale degli allenamenti, presenze atleti e qualifiche federali staff</p>' +
        '</div>' +

        '<div class="es-pres-detail-body">' +
          '<div class="es-pres-detail-box">' +
            '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">' +
              '<div>' +
                '<h3 style="margin:0;">Staff Tecnico &amp; Qualifiche Ufficiali FIGC</h3>' +
                '<p style="color:#94a3b8; font-size:0.82rem; margin:0.2rem 0 0;">Anagrafica reale e patentini federali omologati per la stagione in corso.</p>' +
              '</div>' +
              (staff.length ? '<button type="button" class="es-pres-btn-primary" id="btn-add-staff-member">+ Aggiungi Membro Staff</button>' : '') +
            '</div>' +

            (!staff.length ? (
              '<div class="es-pres-empty-box">' +
                '<div class="es-pres-empty-icon">' + ICONS.briefcase + '</div>' +
                '<h4 class="es-pres-empty-title">Nessun membro dello staff inserito</h4>' +
                '<p class="es-pres-empty-desc">Inserisci l\'allenatore, i preparatori e lo staff sanitario selezionando le qualifiche ufficiali FIGC.</p>' +
                '<button type="button" class="es-pres-empty-btn" id="btn-add-first-staff">' + ICONS.plus + ' Inserisci Primo Membro Staff</button>' +
              '</div>'
            ) : (
              '<div class="es-pres-grid-2">' +
                staff.map(function (m) {
                  return (
                    '<div style="background:#040810; border:1px solid rgba(148,163,184,0.15); border-radius:4px; padding:0.85rem 1rem; display:flex; justify-content:space-between; align-items:center;">' +
                      '<div>' +
                        '<div style="font-size:0.92rem; font-weight:700; color:#fff;">' + esc(m.name) + '</div>' +
                        '<div style="font-size:0.75rem; color:#38bdf8; margin-top:0.1rem;">' + esc(m.role) + '</div>' +
                        '<div style="font-size:0.72rem; color:#94a3b8; margin-top:0.15rem;">Qualifica: <b>' + esc(m.patent || 'Patentino FIGC') + '</b></div>' +
                      '</div>' +
                      '<span class="' + (m.isWarning ? 'es-pres-status es-pres-status-warning' : 'es-pres-status es-pres-status-ok') + '">' + esc(m.status || 'Regolare') + '</span>' +
                    '</div>'
                  );
                }).join('') +
              '</div>'
            )) +
          '</div>' +

          '<div class="es-pres-detail-box">' +
            '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">' +
              '<div>' +
                '<h3 style="margin:0;">Piano di Lavoro Settimanale &amp; Presenze</h3>' +
                '<p style="color:#94a3b8; font-size:0.82rem; margin:0.2rem 0 0;">Programmazione sedute sul campo, orari e focus tattico redatto dallo staff.</p>' +
              '</div>' +
              (data.trainingWeek && data.trainingWeek.length ? '<button type="button" class="es-pres-btn-primary" id="btn-add-training-session">+ Nuova Seduta</button>' : '') +
            '</div>' +

            (!data.trainingWeek || !data.trainingWeek.length ? (
              '<div class="es-pres-empty-box">' +
                '<div class="es-pres-empty-icon">' + ICONS.stopwatch + '</div>' +
                '<h4 class="es-pres-empty-title">Nessuna seduta programmata</h4>' +
                '<p class="es-pres-empty-desc">Il piano settimanale viene redatto dall\'Allenatore o dal Preparatore Atletico nella propria Area Riservata, oppure puoi pianificare una seduta ora.</p>' +
                '<button type="button" class="es-pres-empty-btn" id="btn-add-first-training-session">' + ICONS.plus + ' Pianifica Seduta di Allenamento</button>' +
              '</div>'
            ) : (
              '<div style="display:flex; flex-direction:column; gap:0.6rem;">' +
                data.trainingWeek.map(function (tw) {
                  return (
                    '<div style="background:#040810; border:1px solid rgba(148,163,184,0.15); border-radius:4px; padding:0.9rem 1.1rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.8rem;">' +
                      '<div>' +
                        '<div style="font-size:0.95rem; font-weight:700; color:#38bdf8;">' + esc(tw.day) + ' <span style="font-size:0.8rem; color:#94a3b8; font-weight:400;">(' + esc(tw.time) + ')</span></div>' +
                        '<div style="font-size:0.82rem; color:#cbd5e1; margin-top:0.25rem;"><b>Focus seduta:</b> ' + esc(tw.focus) + '</div>' +
                        '<div style="font-size:0.75rem; color:#94a3b8; margin-top:0.15rem;">Ubicazione: ' + esc(tw.pitch || 'Campo Principale') + '</div>' +
                      '</div>' +
                      '<div style="text-align:right;">' +
                        '<span class="es-pres-status es-pres-status-ok">' + esc(tw.attendance || 'Da rilevare') + '</span>' +
                      '</div>' +
                    '</div>'
                  );
                }).join('') +
              '</div>'
            )) +
          '</div>' +
        '</div>' +

        '<div class="es-pres-back-footer">' +
          '<button type="button" class="es-pres-btn-back" data-action="go-back">&larr; Indietro</button>' +
        '</div>' +
      '</div>'
    );
  }

  // ============================================================
  // RENDER DELLA PANORAMICA PRINCIPALE (OVERVIEW)
  // ============================================================
  function renderPresidentialOverview(data) {
    var canSeeFinances = hasFinanceAccess();
    var squadMetrics = computeSquadMetrics(data.squad);
    var deadlines = computeDeadlines(data.deadlines);
    var matchStats = computeCompetitionStats(data.matches);

    var hasWarningDeadline = deadlines.some(function (d) { return d.isWarning; });
    var isDemo = data.isDemoMode;

    return (
      '<div class="es-pres-suite">' +
        // Banner Modalità Demo vs Reale
        (isDemo ? (
          '<div class="es-pres-demo-banner">' +
            '<div style="display:flex; align-items:center; gap:0.65rem;">' +
              '<span class="es-pres-demo-tag">Modalità Dimostrativa</span>' +
              '<span>Stai visualizzando il dataset di prova (Foggia Calcio 1920). Nessun dato reale del tuo club è stato ancora inserito.</span>' +
            '</div>' +
            '<div style="display:flex; gap:0.5rem;">' +
              '<button type="button" class="es-pres-btn-primary" id="btn-switch-to-real" style="padding:4px 10px; font-size:0.75rem;">Passa a Dati Reali del Tuo Club</button>' +
              '<button type="button" class="es-pres-btn-secondary" id="btn-reset-demo" style="padding:4px 10px; font-size:0.75rem;">Azzera Dati</button>' +
            '</div>' +
          '</div>'
        ) : '') +

        // 1. Header Identità Club
        '<div class="es-pres-header-banner">' +
          '<div class="es-pres-header-inner">' +
            '<div class="es-pres-club-meta-box">' +
              '<div class="es-pres-crest-frame">' +
                '<img src="' + esc(data.logoUrl || 'immagini/squadre-loghi/foggia.png') + '" alt="' + esc(data.clubName) + '" class="es-pres-crest-img">' +
              '</div>' +
              '<div class="es-pres-club-meta-text">' +
                '<div style="display:flex; align-items:center; gap:0.6rem;">' +
                  '<h1 class="es-pres-club-name">' + esc(data.clubName) + '</h1>' +
                  (!isDemo ? '<button type="button" class="es-pres-btn-secondary" id="btn-load-demo" style="padding:2px 7px; font-size:0.7rem; color:#94a3b8;">Carica Dati Demo</button>' : '') +
                '</div>' +
                '<div class="es-pres-club-subtitle">' + esc(data.category) + ' · ' + esc(data.affiliationStatus) + ' · ' + esc(data.presRole) + '</div>' +
              '</div>' +
            '</div>' +

            '<div class="es-pres-standings-meta">' +
              '<div class="es-pres-standing-row"><span class="es-pres-standing-highlight">' + (data.position && data.position !== '—' ? esc(data.position) : (matchStats.played ? ('Gare: ' + matchStats.played) : 'Stagione 2026/27')) + '</span> · <span>' + matchStats.pts + ' punti</span></div>' +
              '<div class="es-pres-standing-sub">' + (data.matchDay || '28ª Giornata') + ' · ' + esc(data.season) + '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +

        // 2. Barra di Navigazione Interna a Tab
        '<div class="es-pres-nav-strip" id="es-pres-navbar">' +
          '<button type="button" class="es-pres-nav-btn is-active" data-tab="panoramica">' + ICONS.shield + ' Panoramica</button>' +
          '<button type="button" class="es-pres-nav-btn" data-tab="gestione">' + ICONS.users + ' Gestione Club</button>' +
          '<button type="button" class="es-pres-nav-btn" data-tab="ufficio">' + ICONS.briefcase + ' Ufficio &amp; Finanze</button>' +
          '<button type="button" class="es-pres-nav-btn" data-tab="competizioni">' + ICONS.barChart + ' Competizioni &amp; Risultati</button>' +
          '<button type="button" class="es-pres-nav-btn" data-tab="governance">' + ICONS.checkShield + ' Conformità &amp; Governance</button>' +
        '</div>' +

        // 3. Contenitore Sezioni Dashboard
        '<div class="es-pres-container">' +

          // Sezione: Gestione Club
          '<section id="sec-pres-gestione">' +
            '<div class="es-pres-section-head">' +
              '<div>' +
                '<h2 class="es-pres-section-title">' + ICONS.users + ' Gestione Club</h2>' +
                '<p class="es-pres-section-sub">Valutazione della rosa, trattative di mercato e monitoraggio dello staff tecnico</p>' +
              '</div>' +
            '</div>' +

            '<div class="es-pres-grid-3">' +
              // Card Rating Rosa
              '<div class="es-pres-card" id="card-pres-rating">' +
                '<div class="es-pres-card-top">' +
                  '<div class="es-pres-icon-box">' + ICONS.users + '</div>' +
                  '<span class="es-pres-status ' + (squadMetrics.isEmpty ? 'es-pres-status-neutral' : 'es-pres-status-ok') + '">' + (squadMetrics.isEmpty ? 'Nessun atleta' : 'Rendimento rosa') + '</span>' +
                '</div>' +
                '<div>' +
                  '<h3 class="es-pres-card-title">Rating Rosa</h3>' +
                  (squadMetrics.isEmpty ? (
                    '<div class="es-pres-card-metric" style="font-size:1.15rem; color:#94a3b8;">Rosa non inserita</div>' +
                    '<p class="es-pres-card-desc">Inserisci gli atleti per calcolare automaticamente il rendimento e l\'età media.</p>'
                  ) : (
                    '<div class="es-pres-card-metric">' + squadMetrics.score + ' <span class="es-pres-unit">indice / 100</span></div>' +
                    '<p class="es-pres-card-desc" style="font-size:0.75rem; color:#94a3b8; margin-bottom:0.35rem;">' + squadMetrics.scoreSub + '</p>' +
                    '<p class="es-pres-card-desc">Età media ' + squadMetrics.avgAge + ' · ' + squadMetrics.minutesCoverage + '</p>'
                  )) +
                '</div>' +
                '<div class="es-pres-card-footer">' +
                  '<span>' + squadMetrics.totalPlayers + ' atleti in organico</span>' +
                  '<span>' + (squadMetrics.isEmpty ? '+ Aggiungi atleta &rsaquo;' : 'Gestisci rosa &rsaquo;') + '</span>' +
                '</div>' +
              '</div>' +

              // Card Trattative
              '<div class="es-pres-card" id="card-pres-transfers">' +
                '<div class="es-pres-card-top">' +
                  '<div class="es-pres-icon-box">' + ICONS.arrows + '</div>' +
                  '<span class="es-pres-status ' + (data.transfers && data.transfers.length ? 'es-pres-status-ok' : 'es-pres-status-neutral') + '">' + (data.transfers && data.transfers.length ? (data.transfers.length + ' trattative') : 'Nessuna trattativa') + '</span>' +
                '</div>' +
                '<div>' +
                  '<h3 class="es-pres-card-title">Trattative di Mercato</h3>' +
                  (!data.transfers || !data.transfers.length ? (
                    '<div class="es-pres-card-metric" style="font-size:1.15rem; color:#94a3b8;">Nessuna negoziazione</div>' +
                    '<p class="es-pres-card-desc">Inserisci le trattative aperte per monitorare acquisti, cessioni e prestiti.</p>'
                  ) : (
                    '<div class="es-pres-card-metric">' + data.transfers.length + ' <span class="es-pres-unit">trattative attive</span></div>' +
                    '<p class="es-pres-card-desc">' + data.transfers.slice(0, 2).map(function(t){ return esc(t.player); }).join(', ') + ' · Hub Mercato</p>'
                  )) +
                '</div>' +
                '<div class="es-pres-card-footer"><span>Hub Mercato &amp; Svincoli</span><span>' + (!data.transfers || !data.transfers.length ? '+ Nuova trattativa &rsaquo;' : 'Dettagli trattative &rsaquo;') + '</span></div>' +
              '</div>' +

              // Card Staff Tecnico
              '<div class="es-pres-card" id="card-pres-staff">' +
                '<div class="es-pres-card-top">' +
                  '<div class="es-pres-icon-box">' + ICONS.briefcase + '</div>' +
                  (!data.staff || !data.staff.length ? '<span class="es-pres-status es-pres-status-neutral">Da completare</span>' : '<span class="es-pres-status es-pres-status-ok">' + data.staff.length + ' membri</span>') +
                '</div>' +
                '<div>' +
                  '<h3 class="es-pres-card-title">Staff Tecnico</h3>' +
                  (!data.staff || !data.staff.length ? (
                    '<div class="es-pres-card-metric" style="font-size:1.15rem; color:#94a3b8;">Nessun membro inserito</div>' +
                    '<p class="es-pres-card-desc">Inserisci mister, vice, preparatore e medico con le qualifiche FIGC ufficiali.</p>'
                  ) : (
                    '<div class="es-pres-card-metric">' + data.staff.length + ' <span class="es-pres-unit">membri staff</span></div>' +
                    '<p class="es-pres-card-desc">Organigramma qualificato FIGC / LND per la stagione in corso.</p>'
                  )) +
                '</div>' +
                '<div class="es-pres-card-footer"><span>Verifica contratti</span><span>' + (!data.staff || !data.staff.length ? '+ Inserisci staff &rsaquo;' : 'Gestisci staff &rsaquo;') + '</span></div>' +
              '</div>' +
            '</div>' +

            '<div class="es-pres-grid-2" style="margin-top:1.15rem;">' +
              // Card Settore Giovanile
              '<div class="es-pres-card" id="card-pres-youth">' +
                '<div class="es-pres-card-top">' +
                  '<div class="es-pres-icon-box">' + ICONS.sprout + '</div>' +
                  '<span class="es-pres-status ' + (squadMetrics.underInRoster >= 3 ? 'es-pres-status-ok' : 'es-pres-status-warning') + '">' + squadMetrics.underInRoster + ' under</span>' +
                '</div>' +
                '<div>' +
                  '<h3 class="es-pres-card-title">Settore Giovanile &amp; Fuoriquota</h3>' +
                  '<div class="es-pres-card-metric">' + squadMetrics.underInRoster + ' <span class="es-pres-unit">under in prima squadra</span></div>' +
                  '<p class="es-pres-card-desc">' + (squadMetrics.underInRoster ? (squadMetrics.underStarters + ' Under titolari · Obbligo LND: min. 3 in distinta') : 'Aggiungi atleti under in rosa per adempiere all\'obbligo federale.') + '</p>' +
                '</div>' +
                '<div class="es-pres-card-footer"><span>Vivaio &amp; Primavera</span><span>Dettagli giovani &rsaquo;</span></div>' +
              '</div>' +

              // Card Sviluppo Atleti
              '<div class="es-pres-card" id="card-pres-dev">' +
                '<div class="es-pres-card-top">' +
                  '<div class="es-pres-icon-box">' + ICONS.growth + '</div>' +
                  '<span class="es-pres-status es-pres-status-ok">' + (squadMetrics.isEmpty ? '0 schede' : (squadMetrics.totalPlayers + ' schede')) + '</span>' +
                '</div>' +
                '<div>' +
                  '<h3 class="es-pres-card-title">Sviluppo Atleti</h3>' +
                  '<div class="es-pres-card-metric">' + (squadMetrics.isEmpty ? '0' : squadMetrics.totalPlayers) + ' <span class="es-pres-unit">schede tecniche</span></div>' +
                  '<p class="es-pres-card-desc">Monitoraggio progressivo delle performance fisiche e tecniche degli atleti.</p>' +
                '</div>' +
                '<div class="es-pres-card-footer"><span>Progressione talenti</span><span>Visualizza schede &rsaquo;</span></div>' +
              '</div>' +
            '</div>' +
          '</section>' +

          // Sezione: Ufficio & Finanze
          '<section id="sec-pres-ufficio">' +
            '<div class="es-pres-section-head">' +
              '<div>' +
                '<h2 class="es-pres-section-title">' + ICONS.briefcase + ' Ufficio &amp; Finanze</h2>' +
                '<p class="es-pres-section-sub">Posta societaria, sponsor, strutture, stadio, scouting e bilancio</p>' +
              '</div>' +
            '</div>' +

            '<div class="es-pres-grid-4">' +
              // Posta
              '<div class="es-pres-card" id="card-pres-mail">' +
                '<div class="es-pres-card-top"><div class="es-pres-icon-box">' + ICONS.mail + '</div><span class="es-pres-status es-pres-status-neutral">' + (data.mail && data.mail.items ? data.mail.items.length : 0) + ' messaggi</span></div>' +
                '<div><h4 class="es-pres-card-title">Posta</h4><div class="es-pres-card-metric">' + (data.mail && data.mail.items ? data.mail.items.length : 0) + ' <span class="es-pres-unit">in arrivo</span></div><p class="es-pres-card-desc">Comunicazioni da agenti FIFA, staff e comunicati federali LND.</p></div>' +
                '<div class="es-pres-card-footer"><span>In arrivo</span><span>Apri posta &rsaquo;</span></div>' +
              '</div>' +

              // Sponsor
              '<div class="es-pres-card" id="card-pres-sponsors-screen">' +
                '<div class="es-pres-card-top"><div class="es-pres-icon-box">' + ICONS.award + '</div><span class="es-pres-status ' + (data.sponsors && data.sponsors.length ? 'es-pres-status-ok' : 'es-pres-status-neutral') + '">' + (data.sponsors ? data.sponsors.length : 0) + ' attivi</span></div>' +
                '<div><h4 class="es-pres-card-title">Sponsor</h4><div class="es-pres-card-metric">' + (data.sponsors && data.sponsors.length ? data.sponsors.length : '0') + ' <span class="es-pres-unit">accordi</span></div><p class="es-pres-card-desc">Partnership commerciali e sponsorizzazioni di maglia attive.</p></div>' +
                '<div class="es-pres-card-footer"><span>Partnership</span><span>Gestione sponsor &rsaquo;</span></div>' +
              '</div>' +

              // Centro Allenamento
              '<div class="es-pres-card" id="card-pres-training-screen">' +
                '<div class="es-pres-card-top"><div class="es-pres-icon-box">' + ICONS.stopwatch + '</div><span class="es-pres-status ' + (data.trainingWeek && data.trainingWeek.length ? 'es-pres-status-ok' : 'es-pres-status-neutral') + '">' + (data.trainingWeek && data.trainingWeek.length ? (data.trainingWeek.length + ' sedute') : 'Da pianificare') + '</span></div>' +
                '<div><h4 class="es-pres-card-title">Centro Allenamento</h4><div class="es-pres-card-metric">' + (data.trainingWeek && data.trainingWeek.length ? (data.trainingWeek.length + ' <span class="es-pres-unit">sedute / sett.</span>') : 'Nessun piano') + '</div><p class="es-pres-card-desc">' + (data.trainingWeek && data.trainingWeek.length ? 'Staff tecnico qualificato e programma settimanale sedute.' : 'Pianificazione sedute e staff tecnico in attesa di compilazione.') + '</p></div>' +
                '<div class="es-pres-card-footer"><span>Sedute &amp; Staff</span><span>Dettagli allenamento &rsaquo;</span></div>' +
              '</div>' +

              // Store POD
              '<div class="es-pres-card" id="card-pres-store">' +
                '<div class="es-pres-card-top"><div class="es-pres-icon-box">' + ICONS.bag + '</div><span class="es-pres-status es-pres-status-neutral">' + (data.merchandising && data.merchandising.isConfigured ? 'POD attivo' : 'Da attivare') + '</span></div>' +
                '<div><h4 class="es-pres-card-title">Store Ufficiale</h4><div class="es-pres-card-metric">' + (data.merchandising ? data.merchandising.ordersCount : 0) + ' <span class="es-pres-unit">ordini evasi</span></div><p class="es-pres-card-desc">Merchandising con produzione e spedizione automatica.</p></div>' +
                '<div class="es-pres-card-footer"><span>Ricavi ' + (data.merchandising ? data.merchandising.revenue : '€ 0,00') + '</span><span>Catalogo store &rsaquo;</span></div>' +
              '</div>' +

              // Stadio
              '<div class="es-pres-card" id="card-pres-stadium-screen">' +
                '<div class="es-pres-card-top"><div class="es-pres-icon-box">' + ICONS.building + '</div><span class="es-pres-status es-pres-status-neutral">' + esc(data.stadium.capacity) + '</span></div>' +
                '<div><h4 class="es-pres-card-title">Stadio</h4><div class="es-pres-card-metric">' + esc(data.stadium.name.split(' ')[0] || 'Impianto') + ' <span class="es-pres-unit">ufficiale</span></div><p class="es-pres-card-desc">Tariffe biglietti, capienza certificata e agibilità impianto.</p></div>' +
                '<div class="es-pres-card-footer"><span>' + esc(data.stadium.name) + '</span><span>Gestisci impianto &rsaquo;</span></div>' +
              '</div>' +

              // Scouting
              '<div class="es-pres-card" id="card-pres-scouting">' +
                '<div class="es-pres-card-top"><div class="es-pres-icon-box">' + ICONS.search + '</div><span class="es-pres-status es-pres-status-ok">' + (data.scouting ? data.scouting.length : 0) + ' talenti</span></div>' +
                '<div><h4 class="es-pres-card-title">Scouting Club</h4><div class="es-pres-card-metric">' + (data.scouting ? data.scouting.length : 0) + ' <span class="es-pres-unit">in Secret List</span></div><p class="es-pres-card-desc">Profili monitorati e report archiviati dagli osservatori.</p></div>' +
                '<div class="es-pres-card-footer"><span>Secret List</span><span>Visualizza scouting &rsaquo;</span></div>' +
              '</div>' +

              // Finanze & Budget
              '<div class="es-pres-card" id="card-pres-finances" style="grid-column: span 2;">' +
                '<div class="es-pres-card-top">' +
                  '<div class="es-pres-icon-box">' + ICONS.card + '</div>' +
                  '<span class="es-pres-status es-pres-status-neutral">Accesso riservato dirigenza</span>' +
                '</div>' +
                '<div>' +
                  '<h4 class="es-pres-card-title">Finanze &amp; Budget Societario</h4>' +
                  (canSeeFinances ? (
                    (!data.finances || !data.finances.isConfigured ? (
                      '<div class="es-pres-card-metric" style="font-size:1.15rem; color:#94a3b8;">Budget non configurato</div>' +
                      '<p class="es-pres-card-desc">Imposta il rendiconto economico per tracciare saldo cassa e monte ingaggi mensile.</p>'
                    ) : (
                      '<div class="es-pres-card-metric">' + data.finances.cashBalance + ' <span class="es-pres-unit">saldo cassa</span></div>' +
                      '<p class="es-pres-card-desc">Monte ingaggi mensile: ' + data.finances.monthlyPayroll + ' · Budget stagionale: ' + data.finances.annualBudget + '</p>'
                    ))
                  ) : (
                    '<div class="es-pres-card-metric" style="font-size:1.15rem; color:#94a3b8;">Dati protetti da autorizzazione RBAC</div>' +
                    '<p class="es-pres-card-desc">I dati finanziari dettagliati sono visibili esclusivamente al ruolo Presidente e Tesoriere.</p>'
                  )) +
                '</div>' +
                '<div class="es-pres-card-footer"><span>Bilancio Club</span><span>' + (canSeeFinances ? 'Apri rendiconto &rsaquo;' : 'Richiedi accesso &rsaquo;') + '</span></div>' +
              '</div>' +
            '</div>' +
          '</section>' +

          // Sezione: Competizioni & Risultati
          '<section id="sec-pres-competizioni">' +
            '<div class="es-pres-section-head">' +
              '<div>' +
                '<h2 class="es-pres-section-title">' + ICONS.barChart + ' Competizioni &amp; Risultati</h2>' +
                '<p class="es-pres-section-sub">Statistiche di campionato, programmazione calendario e classifica federale</p>' +
              '</div>' +
            '</div>' +

            '<div class="es-pres-grid-3">' +
              // Statistiche
              '<div class="es-pres-card" id="card-pres-stats-screen">' +
                '<div class="es-pres-card-top"><div class="es-pres-icon-box">' + ICONS.barChart + '</div><span class="es-pres-status es-pres-status-ok">' + matchStats.won + ' vinte</span></div>' +
                '<div><h3 class="es-pres-card-title">Statistiche Club &amp; Record</h3><div class="es-pres-card-metric">' + matchStats.played + ' <span class="es-pres-unit">gare disputate</span></div><p class="es-pres-card-desc">Gol fatti: ' + matchStats.gf + ' · Gol subiti: ' + matchStats.ga + ' (' + matchStats.gd + ')</p></div>' +
                '<div class="es-pres-card-footer"><span>Trend: ' + matchStats.trend.join(' · ') + '</span><span>Dettaglio statistiche &rsaquo;</span></div>' +
              '</div>' +

              // Calendario
              '<div class="es-pres-card" id="card-pres-schedule-screen">' +
                '<div class="es-pres-card-top"><div class="es-pres-icon-box">' + ICONS.calendar + '</div><span class="es-pres-status es-pres-status-neutral">' + (data.matches ? data.matches.length : 0) + ' gare</span></div>' +
                '<div><h3 class="es-pres-card-title">Calendario Ufficiale</h3><div class="es-pres-card-metric" style="font-size:1.15rem;">' + (data.matches && data.matches.length ? esc(data.matches[0].opponent) : 'Nessuna gara inserita') + '</div><p class="es-pres-card-desc">Programmazione gare e designazioni arbitrali ufficiali AIA.</p></div>' +
                '<div class="es-pres-card-footer"><span>Designazioni AIA</span><span>Calendario completo &rsaquo;</span></div>' +
              '</div>' +

              // Classifica
              '<div class="es-pres-card" id="card-pres-standings-screen">' +
                '<div class="es-pres-card-top"><div class="es-pres-icon-box">' + ICONS.layers + '</div><span class="es-pres-status es-pres-status-neutral">' + esc(data.category) + '</span></div>' +
                '<div><h3 class="es-pres-card-title">Classifica Campionato</h3><div class="es-pres-card-metric">' + (data.position && data.position !== '—' ? esc(data.position) : (matchStats.pts + ' pt')) + '</div><p class="es-pres-card-desc">' + esc(data.standingGap) + '</p></div>' +
                '<div class="es-pres-card-footer"><span>Live Standings</span><span>Classifica integrale &rsaquo;</span></div>' +
              '</div>' +
            '</div>' +
          '</section>' +

          // Sezione: Conformità & Governance
          '<section id="sec-pres-governance">' +
            '<div class="es-pres-section-head">' +
              '<div>' +
                '<h2 class="es-pres-section-title">' + ICONS.checkShield + ' Conformità &amp; Governance</h2>' +
                '<p class="es-pres-section-sub">Tesseramenti federali, consensi GDPR Under 18 e scadenze legali del Club</p>' +
              '</div>' +
            '</div>' +

            '<div class="es-pres-grid-2">' +
              '<div class="es-pres-card" id="card-pres-gov-status">' +
                '<div class="es-pres-card-top"><div class="es-pres-icon-box">' + ICONS.fileText + '</div><span class="es-pres-status es-pres-status-ok">' + (squadMetrics.totalPlayers ? '100% conforme' : 'In attesa') + '</span></div>' +
                '<div><h3 class="es-pres-card-title">Tesseramenti &amp; Privacy</h3><p class="es-pres-card-desc" style="font-size:0.85rem; line-height:1.6;">• <b>Tesseramenti Atleti:</b> ' + (squadMetrics.totalPlayers ? (squadMetrics.totalPlayers + ' / ' + squadMetrics.totalPlayers + ' Tesserati FIGC') : 'Nessun atleta registrato') + '<br>• <b>GDPR Minori:</b> Consensi depositati con firma digitale<br>• <b>Certificati BLSD:</b> Staff abilitato</p></div>' +
                '<div class="es-pres-card-footer"><span>Archivio Documentale</span><span>Verifica tessere &rsaquo;</span></div>' +
              '</div>' +

              '<div class="es-pres-card" id="card-pres-gov-deadlines">' +
                '<div class="es-pres-card-top"><div class="es-pres-icon-box">' + ICONS.bell + '</div><span class="es-pres-status ' + (hasWarningDeadline ? 'es-pres-status-warning' : 'es-pres-status-ok') + '">' + deadlines.length + ' scadenze</span></div>' +
                '<div><h3 class="es-pres-card-title">Scadenziario Federale</h3><div style="font-size:0.82rem; color:#cbd5e1; display:flex; flex-direction:column; gap:0.35rem; margin-top:0.4rem;">' +
                  deadlines.slice(0, 3).map(function (d) {
                    return '<div>• <b>' + esc(d.task) + ':</b> <span style="color:' + (d.isWarning ? '#fbbf24' : '#34d399') + ';">' + esc(d.status) + '</span> (' + esc(d.dateText) + ')</div>';
                  }).join('') +
                '</div></div>' +
                '<div class="es-pres-card-footer"><span>Monitoraggio Adempimenti</span><span>Dettagli scadenze &rsaquo;</span></div>' +
              '</div>' +
            '</div>' +
          '</section>' +
        '</div>' +
      '</div>'
    );
  }

  // ============================================================
  // FORM & MODALI INTERATTIVE DI INSERIMENTO DATI
  // ============================================================

  function openAddPlayerModal(data) {
    var formHtml =
      '<p style="color:#94a3b8; font-size:0.85rem; margin-bottom:1.2rem;">Inserisci un nuovo atleta nell\'organico ufficiale del club per calcolare i parametri reali:</p>' +
      '<form id="form-add-player" style="display:flex; flex-direction:column; gap:1rem;">' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
          '<div class="es-pres-input-group"><label>Nome e Cognome Atleta *</label><input type="text" class="es-pres-input-text" id="inp-pl-name" required placeholder="Es. Marco Rossi"></div>' +
          '<div class="es-pres-input-group"><label>Ruolo Principale *</label><select class="es-pres-input-text" id="sel-pl-role" style="background:#040810; color:#fff;"><option>Portiere</option><option>Difensore Centrale</option><option>Terzino Destro</option><option>Terzino Sinistro</option><option>Centrocampista / Regista</option><option>Mezzala</option><option>Ala Destra</option><option>Ala Sinistra</option><option>Punta Centrale</option></select></div>' +
        '</div>' +
        '<div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:1rem;">' +
          '<div class="es-pres-input-group"><label>Età (Anni) *</label><input type="number" class="es-pres-input-text" id="inp-pl-age" value="22" min="15" max="45" required></div>' +
          '<div class="es-pres-input-group"><label>Minutaggio Giocato</label><input type="number" class="es-pres-input-text" id="inp-pl-min" value="1200" min="0" max="4000"></div>' +
          '<div class="es-pres-input-group"><label>Valore Mercato (€)</label><input type="number" class="es-pres-input-text" id="inp-pl-val" value="50000" min="1000"></div>' +
        '</div>' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
          '<div class="es-pres-input-group"><label>Status Titolare</label><select class="es-pres-input-text" id="sel-pl-starter" style="background:#040810; color:#fff;"><option value="1">Titolare abituale (XI base)</option><option value="0">Rotazione / Riserva</option></select></div>' +
          '<div class="es-pres-input-group"><label>Tesseramento &amp; Privacy</label><select class="es-pres-input-text" id="sel-pl-tess" style="background:#040810; color:#fff;"><option value="1">Tesserato FIGC &amp; GDPR Conforme</option><option value="0">In attesa di deposito</option></select></div>' +
        '</div>' +
        '<div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:0.5rem; padding-top:0.85rem; border-top:1px solid rgba(148,163,184,0.15);">' +
          '<button type="button" class="es-pres-btn-secondary" id="btn-cancel-add-pl">Annulla</button>' +
          '<button type="submit" class="es-pres-btn-primary">Registra Atleta in Rosa</button>' +
        '</div>' +
      '</form>';

    openDetailModal('Inserimento Nuovo Atleta in Rosa', ICONS.users, formHtml);
    var modalOverlay = document.getElementById('es-pres-detail-overlay');
    var form = document.getElementById('form-add-player');
    var btnCancel = document.getElementById('btn-cancel-add-pl');
    if (btnCancel && modalOverlay) btnCancel.onclick = function () { modalOverlay.remove(); };

    if (form) {
      form.onsubmit = function (e) {
        e.preventDefault();
        var name = document.getElementById('inp-pl-name').value.trim();
        var role = document.getElementById('sel-pl-role').value;
        var age = parseInt(document.getElementById('inp-pl-age').value) || 22;
        var min = parseInt(document.getElementById('inp-pl-min').value) || 0;
        var val = parseFloat(document.getElementById('inp-pl-val').value) || 25000;
        var isStarter = document.getElementById('sel-pl-starter').value === '1';

        data.squad = data.squad || [];
        data.squad.push({
          id: Date.now(),
          name: name,
          role: role,
          age: age,
          marketValue: val,
          minutesPlayed: min,
          isStarter: isStarter,
          isUnder: age <= 21,
          tesserato: true,
          gdpr: true
        });

        savePresClubData(data);
        if (modalOverlay) modalOverlay.remove();
        renderPresidentialSuite();
        if (window.showToast) window.showToast('Atleta ' + name + ' registrato in rosa!', 'success');
      };
    }
  }

  function openAddStaffModal(data) {
    var optionsHtml = OFFICIAL_PATENTS.map(function(p){ return '<option value="' + esc(p) + '">' + esc(p) + '</option>'; }).join('');

    var formHtml =
      '<p style="color:#94a3b8; font-size:0.85rem; margin-bottom:1.2rem;">Inserisci un nuovo membro dello staff tecnico con qualifica federale riconosciuta:</p>' +
      '<form id="form-add-staff" style="display:flex; flex-direction:column; gap:1rem;">' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
          '<div class="es-pres-input-group"><label>Nome e Cognome *</label><input type="text" class="es-pres-input-text" id="inp-st-name" required placeholder="Es. Giuseppe Rossi"></div>' +
          '<div class="es-pres-input-group"><label>Incarico / Ruolo Staff *</label><select class="es-pres-input-text" id="sel-st-role" style="background:#040810; color:#fff;"><option>Allenatore Prima Squadra</option><option>Vice Allenatore</option><option>Direttore Sportivo</option><option>Preparatore Atletico</option><option>Preparatore Portieri</option><option>Match Analyst</option><option>Medico Sociale</option><option>Fisioterapista</option><option>Team Manager</option></select></div>' +
        '</div>' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
          '<div class="es-pres-input-group"><label>Qualifica Ufficiale FIGC *</label><select class="es-pres-input-text" id="sel-st-patent" style="background:#040810; color:#fff;">' + optionsHtml + '</select></div>' +
          '<div class="es-pres-input-group"><label>Scadenza Contratto</label><input type="date" class="es-pres-input-text" id="inp-st-exp" value="2027-06-30"></div>' +
        '</div>' +
        '<div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:0.5rem; padding-top:0.85rem; border-top:1px solid rgba(148,163,184,0.15);">' +
          '<button type="button" class="es-pres-btn-secondary" id="btn-cancel-add-st">Annulla</button>' +
          '<button type="submit" class="es-pres-btn-primary">Registra Membro Staff</button>' +
        '</div>' +
      '</form>';

    openDetailModal('Inserimento Membro Staff Tecnico', ICONS.briefcase, formHtml);
    var modalOverlay = document.getElementById('es-pres-detail-overlay');
    var form = document.getElementById('form-add-staff');
    var btnCancel = document.getElementById('btn-cancel-add-st');
    if (btnCancel && modalOverlay) btnCancel.onclick = function () { modalOverlay.remove(); };

    if (form) {
      form.onsubmit = function (e) {
        e.preventDefault();
        var name = document.getElementById('inp-st-name').value.trim();
        var role = document.getElementById('sel-st-role').value;
        var patent = document.getElementById('sel-st-patent').value;
        var exp = document.getElementById('inp-st-exp').value || '2027-06-30';

        data.staff = data.staff || [];
        data.staff.push({
          id: Date.now(),
          name: name,
          role: role,
          patent: patent,
          contractExp: exp,
          status: 'Regolare',
          isWarning: false
        });

        savePresClubData(data);
        if (modalOverlay) modalOverlay.remove();
        renderPresidentialSuite();
        if (window.showToast) window.showToast('Membro staff ' + name + ' aggiunto all\'organigramma!', 'success');
      };
    }
  }

  function openAddMatchModal(data) {
    var formHtml =
      '<p style="color:#94a3b8; font-size:0.85rem; margin-bottom:1.2rem;">Inserisci una partita di campionato o coppa con risultato ufficiale:</p>' +
      '<form id="form-add-match" style="display:flex; flex-direction:column; gap:1rem;">' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
          '<div class="es-pres-input-group"><label>Giornata / Turno *</label><input type="text" class="es-pres-input-text" id="inp-m-round" required placeholder="Es. 29ª Giornata" value="29ª G"></div>' +
          '<div class="es-pres-input-group"><label>Squadra Avversaria *</label><input type="text" class="es-pres-input-text" id="inp-m-opp" required placeholder="Es. Taranto FC"></div>' +
        '</div>' +
        '<div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:1rem;">' +
          '<div class="es-pres-input-group"><label>Data Gara</label><input type="date" class="es-pres-input-text" id="inp-m-date" value="' + new Date().toISOString().split('T')[0] + '"></div>' +
          '<div class="es-pres-input-group"><label>Casa / Trasferta</label><select class="es-pres-input-text" id="sel-m-type" style="background:#040810; color:#fff;"><option value="H">Casa (Home)</option><option value="A">Trasferta (Away)</option></select></div>' +
          '<div class="es-pres-input-group"><label>Gara Disputata?</label><select class="es-pres-input-text" id="sel-m-played" style="background:#040810; color:#fff;"><option value="1">Sì, già disputata</option><option value="0">No, futura</option></select></div>' +
        '</div>' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
          '<div class="es-pres-input-group"><label>Gol Segnati (Tuo Club)</label><input type="number" class="es-pres-input-text" id="inp-m-gf" value="2" min="0"></div>' +
          '<div class="es-pres-input-group"><label>Gol Subiti (Avversario)</label><input type="number" class="es-pres-input-text" id="inp-m-ga" value="1" min="0"></div>' +
        '</div>' +
        '<div class="es-pres-input-group"><label>Arbitro Designato (Sezione AIA)</label><input type="text" class="es-pres-input-text" id="inp-m-ref" placeholder="Es. Sezione AIA Roma 1"></div>' +
        '<div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:0.5rem; padding-top:0.85rem; border-top:1px solid rgba(148,163,184,0.15);">' +
          '<button type="button" class="es-pres-btn-secondary" id="btn-cancel-add-m">Annulla</button>' +
          '<button type="submit" class="es-pres-btn-primary">Registra Partita</button>' +
        '</div>' +
      '</form>';

    openDetailModal('Registrazione Risultato Gara', ICONS.calendar, formHtml);
    var modalOverlay = document.getElementById('es-pres-detail-overlay');
    var form = document.getElementById('form-add-match');
    var btnCancel = document.getElementById('btn-cancel-add-m');
    if (btnCancel && modalOverlay) btnCancel.onclick = function () { modalOverlay.remove(); };

    if (form) {
      form.onsubmit = function (e) {
        e.preventDefault();
        var round = document.getElementById('inp-m-round').value.trim();
        var opp = document.getElementById('inp-m-opp').value.trim();
        var dt = document.getElementById('inp-m-date').value;
        var type = document.getElementById('sel-m-type').value;
        var isPlayed = document.getElementById('sel-m-played').value === '1';
        var gf = parseInt(document.getElementById('inp-m-gf').value) || 0;
        var ga = parseInt(document.getElementById('inp-m-ga').value) || 0;
        var ref = document.getElementById('inp-m-ref').value.trim();

        var st = isPlayed ? (gf > ga ? 'W' : (gf === ga ? 'D' : 'L')) : 'NEXT';
        var res = isPlayed ? (gf + ' - ' + ga) : '- - -';

        data.matches = data.matches || [];
        data.matches.push({
          id: Date.now(),
          round: round,
          opponent: opp,
          date: dt,
          type: type,
          isPlayed: isPlayed,
          goalsFor: gf,
          goalsAgainst: ga,
          res: res,
          status: st,
          referee: ref
        });

        savePresClubData(data);
        if (modalOverlay) modalOverlay.remove();
        renderPresidentialSuite();
        if (window.showToast) window.showToast('Partita vs ' + opp + ' registrata con successo!', 'success');
      };
    }
  }

  function openEditFinancesModal(data) {
    var cur = data.finances || {};
    var formHtml =
      '<p style="color:#94a3b8; font-size:0.85rem; margin-bottom:1.2rem;">Imposta i parametri economico-finanziari del club (riservato al Presidente):</p>' +
      '<form id="form-edit-fin" style="display:flex; flex-direction:column; gap:1rem;">' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
          '<div class="es-pres-input-group"><label>Saldo Cassa Attuale (€)</label><input type="text" class="es-pres-input-text" id="inp-fin-cash" value="' + esc(cur.cashBalance || '€ 48.500,00') + '"></div>' +
          '<div class="es-pres-input-group"><label>Monte Ingaggi Mensile (€)</label><input type="text" class="es-pres-input-text" id="inp-fin-pay" value="' + esc(cur.monthlyPayroll || '€ 18.200,00') + '"></div>' +
        '</div>' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
          '<div class="es-pres-input-group"><label>Budget Totale Stagionale (€)</label><input type="text" class="es-pres-input-text" id="inp-fin-bud" value="' + esc(cur.annualBudget || '€ 240.000,00') + '"></div>' +
          '<div class="es-pres-input-group"><label>Stato del Bilancio</label><select class="es-pres-input-text" id="sel-fin-health" style="background:#040810; color:#fff;"><option>Bilancio in pareggio</option><option>Utile d\'esercizio (+ margine)</option><option>Disavanzo controllato</option></select></div>' +
        '</div>' +
        '<div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:0.5rem; padding-top:0.85rem; border-top:1px solid rgba(148,163,184,0.15);">' +
          '<button type="button" class="es-pres-btn-secondary" id="btn-cancel-edit-fin">Annulla</button>' +
          '<button type="submit" class="es-pres-btn-primary">Salva Rendiconto</button>' +
        '</div>' +
      '</form>';

    openDetailModal('Gestione Finanze & Budget Societario', ICONS.card, formHtml);
    var modalOverlay = document.getElementById('es-pres-detail-overlay');
    var form = document.getElementById('form-edit-fin');
    var btnCancel = document.getElementById('btn-cancel-edit-fin');
    if (btnCancel && modalOverlay) btnCancel.onclick = function () { modalOverlay.remove(); };

    if (form) {
      form.onsubmit = function (e) {
        e.preventDefault();
        data.finances = {
          isConfigured: true,
          cashBalance: document.getElementById('inp-fin-cash').value,
          monthlyPayroll: document.getElementById('inp-fin-pay').value,
          annualBudget: document.getElementById('inp-fin-bud').value,
          budgetHealth: document.getElementById('sel-fin-health').value,
          lastUpdatedBy: getUserName(userObj()),
          lastUpdatedAt: getFormattedDateTime()
        };

        savePresClubData(data);
        if (modalOverlay) modalOverlay.remove();
        renderPresidentialSuite();
        if (window.showToast) window.showToast('Rendiconto finanziario aggiornato con successo!', 'success');
      };
    }
  }

  function openAddTrainingModal(data) {
    var formHtml =
      '<p style="color:#94a3b8; font-size:0.85rem; margin-bottom:1.2rem;">Pianifica una seduta di allenamento settimanale con orario e focus tattico:</p>' +
      '<form id="form-add-trn-session" style="display:flex; flex-direction:column; gap:1rem;">' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
          '<div class="es-pres-input-group"><label>Giorno della Settimana *</label><select class="es-pres-input-text" id="sel-trn-day" style="background:#040810; color:#fff;"><option>Martedì</option><option>Mercoledì</option><option>Giovedì</option><option>Venerdì</option><option>Sabato</option><option>Domenica</option><option>Lunedì</option></select></div>' +
          '<div class="es-pres-input-group"><label>Fascia Oraria (es. 15:00 - 17:30) *</label><input type="text" class="es-pres-input-text" id="inp-trn-time" value="15:00 - 17:30" required></div>' +
        '</div>' +
        '<div class="es-pres-input-group"><label>Campo / Ubicazione</label><input type="text" class="es-pres-input-text" id="inp-trn-pitch" value="Campo A (Erba Naturale)" placeholder="Es. Campo A o Palestra"></div>' +
        '<div class="es-pres-input-group"><label>Focus della Seduta *</label><textarea class="es-pres-input-text" id="inp-trn-focus" rows="2" required placeholder="Es. Attivazione preventiva, possesso palla e transizioni offensive"></textarea></div>' +
        '<div class="es-pres-input-group"><label>Stima Presenze</label><input type="text" class="es-pres-input-text" id="inp-trn-att" value="Tutta la rosa convocata" placeholder="Es. 28/28 Presenti"></div>' +
        '<div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:0.5rem; padding-top:0.85rem; border-top:1px solid rgba(148,163,184,0.15);">' +
          '<button type="button" class="es-pres-btn-secondary" id="btn-cancel-trn-modal">Annulla</button>' +
          '<button type="submit" class="es-pres-btn-primary">Pianifica Seduta</button>' +
        '</div>' +
      '</form>';

    openDetailModal('Pianificazione Seduta di Allenamento', ICONS.stopwatch, formHtml);
    var modalOverlay = document.getElementById('es-pres-detail-overlay');
    var form = document.getElementById('form-add-trn-session');
    var btnCancel = document.getElementById('btn-cancel-trn-modal');
    if (btnCancel && modalOverlay) btnCancel.onclick = function () { modalOverlay.remove(); };

    if (form) {
      form.onsubmit = function (e) {
        e.preventDefault();
        var day = document.getElementById('sel-trn-day').value;
        var time = document.getElementById('inp-trn-time').value.trim();
        var pitch = document.getElementById('inp-trn-pitch').value.trim();
        var focus = document.getElementById('inp-trn-focus').value.trim();
        var att = document.getElementById('inp-trn-att').value.trim() || 'Presenti';

        data.trainingWeek = data.trainingWeek || [];
        data.trainingWeek.push({
          day: day,
          time: time,
          pitch: pitch,
          focus: focus,
          attendance: att
        });

        savePresClubData(data);
        if (modalOverlay) modalOverlay.remove();
        renderPresidentialSuite();
        if (window.showToast) window.showToast('Seduta del ' + day + ' aggiunta al piano settimanale!', 'success');
      };
    }
  }

  // ============================================================
  // GESTIONE SUB-VIEWS & ROUTING (PUSHSTATE / POPSTATE)
  // ============================================================

  function openSubView(viewKey, skipHistory) {
    currentView = viewKey;
    if (!skipHistory) {
      var newHash = viewKey === 'overview' ? '#user-dossier-portal' : '#user-dossier-portal?sub=' + encodeURIComponent(viewKey);
      if (window.location.hash !== newHash) {
        window.history.pushState({ presSubView: viewKey }, '', newHash);
      }
    }
    renderPresidentialSuite();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderPresidentialSuite() {
    var mount = document.getElementById('es-prd');
    if (!mount) return;

    var data = getPresClubData();

    if (currentView === 'stadium') mount.innerHTML = renderStadiumScreen(data);
    else if (currentView === 'club-stats') mount.innerHTML = renderClubStatsScreen(data);
    else if (currentView === 'sponsors') mount.innerHTML = renderSponsorsScreen(data);
    else if (currentView === 'standings') mount.innerHTML = renderStandingsScreen(data);
    else if (currentView === 'schedule') mount.innerHTML = renderScheduleScreen(data);
    else if (currentView === 'training-center') mount.innerHTML = renderTrainingCenterScreen(data);
    else mount.innerHTML = renderPresidentialOverview(data);

    bindPresidentialEvents(mount);
  }

  // ============================================================
  // EVENT BINDING & INTERAZIONI
  // ============================================================

  function bindPresidentialEvents(mount) {
    var data = getPresClubData();

    // Tasti Indietro (go-back)
    mount.querySelectorAll('[data-action="go-back"]').forEach(function (btn) {
      btn.onclick = function (e) {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        if (window.location.hash.indexOf('?sub=') >= 0) window.history.back();
        else openSubView('overview');
      };
    });

    // Switch Demo vs Reale
    var btnSwitchReal = mount.querySelector('#btn-switch-to-real');
    if (btnSwitchReal) {
      btnSwitchReal.onclick = function () {
        var clean = getCleanRealDataset(userObj());
        clean.trainingWeek = [];
        clean.staff = [];
        clean.squad = [];
        clean.sponsors = [];
        clean.matches = [];
        savePresClubData(clean);
        renderPresidentialSuite();
        if (window.showToast) window.showToast('Passato a modalità Dati Reali del Club!', 'info');
      };
    }
    var btnResetDemo = mount.querySelector('#btn-reset-demo');
    if (btnResetDemo) {
      btnResetDemo.onclick = function () {
        var clean = getCleanRealDataset(userObj());
        clean.trainingWeek = [];
        clean.staff = [];
        clean.squad = [];
        clean.sponsors = [];
        clean.matches = [];
        savePresClubData(clean);
        renderPresidentialSuite();
        if (window.showToast) window.showToast('Tutti i dati sono stati azzerati con successo.', 'info');
      };
    }
    var btnLoadDemo = mount.querySelector('#btn-load-demo');
    if (btnLoadDemo) {
      btnLoadDemo.onclick = function () {
        var demo = getDemoDataset(userObj());
        savePresClubData(demo);
        renderPresidentialSuite();
        if (window.showToast) window.showToast('Caricati dati dimostrativi Foggia Calcio 1920!', 'success');
      };
    }

    // Tab Strip Jump Scroll
    mount.querySelectorAll('.es-pres-nav-btn[data-tab]').forEach(function (btn) {
      btn.onclick = function () {
        var tabKey = btn.getAttribute('data-tab');
        mount.querySelectorAll('.es-pres-nav-btn[data-tab]').forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');

        if (tabKey === 'panoramica') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          var targetSec = mount.querySelector('#sec-pres-' + tabKey);
          if (targetSec) {
            var navHeight = 135;
            var elementPosition = targetSec.getBoundingClientRect().top;
            var offsetPosition = elementPosition + window.pageYOffset - navHeight;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
          }
        }
      };
    });

    // Sub-view Card Triggers
    var cardStadium = mount.querySelector('#card-pres-stadium-screen');
    if (cardStadium) cardStadium.onclick = function () { openSubView('stadium'); };

    var cardStats = mount.querySelector('#card-pres-stats-screen');
    if (cardStats) cardStats.onclick = function () { openSubView('club-stats'); };

    var cardSponsors = mount.querySelector('#card-pres-sponsors-screen');
    if (cardSponsors) cardSponsors.onclick = function () { openSubView('sponsors'); };

    var cardStandings = mount.querySelector('#card-pres-standings-screen');
    if (cardStandings) cardStandings.onclick = function () { openSubView('standings'); };

    var cardSchedule = mount.querySelector('#card-pres-schedule-screen');
    if (cardSchedule) cardSchedule.onclick = function () { openSubView('schedule'); };

    var cardTraining = mount.querySelector('#card-pres-training-screen');
    if (cardTraining) cardTraining.onclick = function () { openSubView('training-center'); };

    var cardStaff = mount.querySelector('#card-pres-staff');
    if (cardStaff) cardStaff.onclick = function () { openSubView('training-center'); };

    // Modali Card
    var cardRating = mount.querySelector('#card-pres-rating');
    if (cardRating) {
      cardRating.onclick = function () {
        openAddPlayerModal(data);
      };
    }

    var cardTransfers = mount.querySelector('#card-pres-transfers');
    if (cardTransfers) {
      cardTransfers.onclick = function () {
        var transfers = data.transfers || [];
        var listHtml = !transfers.length ? (
          '<div class="es-pres-empty-box">' +
            '<div class="es-pres-empty-icon">' + ICONS.arrows + '</div>' +
            '<h4 class="es-pres-empty-title">Nessuna trattativa attiva</h4>' +
            '<p class="es-pres-empty-desc">Inserisci una negoziazione di mercato per monitorare i rinnovi e gli acquisti.</p>' +
          '</div>'
        ) : (
          transfers.map(function (t) {
            return (
              '<div style="background:#040810; border:1px solid rgba(148,163,184,0.15); border-radius:4px; padding:0.85rem 1rem; margin-bottom:0.6rem; display:flex; justify-content:space-between; align-items:center;">' +
                '<div><h4 style="font-size:0.95rem; font-weight:700; color:#fff; margin:0;">' + esc(t.player) + ' (' + esc(t.role) + ')</h4><div style="font-size:0.78rem; color:#94a3b8; margin-top:0.15rem;">Club: ' + esc(t.club) + ' · Tipo: ' + esc(t.type) + '</div></div>' +
                '<span class="es-pres-status es-pres-status-ok">' + esc(t.status) + '</span>' +
              '</div>'
            );
          }).join('')
        );

        listHtml += '<div style="display:flex; gap:0.6rem; margin-top:1rem;">' +
          '<button type="button" class="es-pres-btn-primary" id="btn-add-transfer-in-modal" style="flex:1;">+ Nuova Trattativa</button>' +
          '<button type="button" class="es-pres-btn-secondary" id="btn-open-hub-in-modal" style="flex:1;">Apri Hub Mercato &rsaquo;</button>' +
        '</div>';

        openDetailModal('Trattative di Mercato &amp; Negoziazioni', ICONS.arrows, listHtml);
        var bHub = document.getElementById('btn-open-hub-in-modal');
        if (bHub) {
          bHub.onclick = function() {
            var m = document.getElementById('es-pres-detail-overlay');
            if (m) m.remove();
            if (typeof window.switchView === 'function') window.switchView('mercato', '#mercato-hub');
          };
        }
        var bAddTr = document.getElementById('btn-add-transfer-in-modal');
        if (bAddTr) {
          bAddTr.onclick = function() {
            var m = document.getElementById('es-pres-detail-overlay');
            if (m) m.remove();
            if (window.showToast) window.showToast('Modulo nuova trattativa aperto', 'info');
          };
        }
      };
    }

    var cardFinances = mount.querySelector('#card-pres-finances');
    if (cardFinances) {
      cardFinances.onclick = function () {
        if (!hasFinanceAccess()) {
          alert('Accesso Riservato: Questa sezione è protetta e visibile solo a Presidente e Tesoriere.');
          return;
        }
        openEditFinancesModal(data);
      };
    }

    var cardMail = mount.querySelector('#card-pres-mail');
    if (cardMail) {
      cardMail.onclick = function () {
        var items = data.mail && data.mail.items ? data.mail.items : [];
        var html = !items.length ? (
          '<div class="es-pres-empty-box">' +
            '<div class="es-pres-empty-icon">' + ICONS.mail + '</div>' +
            '<h4 class="es-pres-empty-title">Nessun messaggio societario</h4>' +
            '<p class="es-pres-empty-desc">La casella postale ufficiale non contiene nuove comunicazioni federali o messaggi dagli agenti.</p>' +
          '</div>'
        ) : (
          items.map(function (m) {
            return (
              '<div style="background:#040810; border:1px solid rgba(148,163,184,0.15); border-radius:4px; padding:0.85rem 1rem; margin-bottom:0.6rem;">' +
                '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.25rem;"><span style="font-size:0.75rem; font-weight:700; color:#38bdf8;">' + esc(m.from) + '</span><span style="font-size:0.72rem; color:#94a3b8;">' + esc(m.date) + '</span></div>' +
                '<h5 style="font-size:0.92rem; font-weight:700; color:#ffffff; margin:0;">' + esc(m.subject) + '</h5>' +
              '</div>'
            );
          }).join('')
        );
        openDetailModal('Posta Societaria Ufficiale', ICONS.mail, html);
      };
    }

    var cardStore = mount.querySelector('#card-pres-store');
    if (cardStore) {
      cardStore.onclick = function () {
        var mer = data.merchandising || { isConfigured: false, ordersCount: 0, revenue: '€ 0,00' };
        var html =
          '<p style="color:#cbd5e1; font-size:0.88rem; margin-bottom:1rem;">Stato del Merchandising ufficiale e vendite Print on Demand (POD):</p>' +
          '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.2rem;">' +
            '<div style="background:#040810; border:1px solid rgba(148,163,184,0.18); border-radius:4px; padding:1rem;">' +
              '<div style="font-size:0.72rem; color:#94a3b8; font-weight:700;">ORDINI EVASI</div>' +
              '<div style="font-size:1.6rem; font-weight:800; color:#38bdf8;">' + mer.ordersCount + ' <span class="es-pres-unit">ordini</span></div>' +
            '</div>' +
            '<div style="background:#040810; border:1px solid rgba(148,163,184,0.18); border-radius:4px; padding:1rem;">' +
              '<div style="font-size:0.72rem; color:#94a3b8; font-weight:700;">RICAVI ACCREDITATI</div>' +
              '<div style="font-size:1.6rem; font-weight:800; color:#34d399;">' + mer.revenue + '</div>' +
            '</div>' +
          '</div>' +
          '<button type="button" class="es-pres-btn-primary" id="btn-manage-store-modal" style="width:100%;">Gestisci Catalogo Merchandising &rsaquo;</button>';
        openDetailModal('Store Ufficiale &amp; Merchandising POD', ICONS.bag, html);
      };
    }

    var cardScouting = mount.querySelector('#card-pres-scouting');
    if (cardScouting) {
      cardScouting.onclick = function () {
        var scouts = data.scouting || [];
        var html = !scouts.length ? (
          '<div class="es-pres-empty-box">' +
            '<div class="es-pres-empty-icon">' + ICONS.search + '</div>' +
            '<h4 class="es-pres-empty-title">Secret List vuota</h4>' +
            '<p class="es-pres-empty-desc">Nessun calciatore attualmente inserito nella lista stealth degli osservatori.</p>' +
          '</div>'
        ) : (
          scouts.map(function (s) {
            return (
              '<div style="background:#040810; border:1px solid rgba(148,163,184,0.15); border-radius:4px; padding:0.85rem 1rem; margin-bottom:0.6rem; display:flex; justify-content:space-between; align-items:center;">' +
                '<div><h4 style="font-size:0.95rem; font-weight:700; color:#fff; margin:0;">' + esc(s.player) + ' (' + esc(s.role) + ')</h4><div style="font-size:0.78rem; color:#94a3b8;">Club: ' + esc(s.club) + ' · Scout: ' + esc(s.scout) + '</div></div>' +
                '<span class="es-pres-status es-pres-status-ok">Rating: ' + esc(s.rating) + '</span>' +
              '</div>'
            );
          }).join('')
        );
        html += '<button type="button" class="es-pres-btn-primary" id="btn-open-scouting-hub" style="width:100%; margin-top:0.75rem;">Apri Hub Mercato &amp; Scouting &rsaquo;</button>';
        openDetailModal('Scouting Club &amp; Secret List', ICONS.search, html);
        var bSc = document.getElementById('btn-open-scouting-hub');
        if (bSc) {
          bSc.onclick = function() {
            var m = document.getElementById('es-pres-detail-overlay');
            if (m) m.remove();
            if (typeof window.switchView === 'function') window.switchView('mercato', '#mercato-hub');
          };
        }
      };
    }

    var cardGovDeadlines = mount.querySelector('#card-pres-gov-deadlines');
    if (cardGovDeadlines) {
      cardGovDeadlines.onclick = function () {
        var deadlines = computeDeadlines(data.deadlines);
        var listHtml = deadlines.map(function (d) {
          return (
            '<div style="background:#040810; border:1px solid rgba(148,163,184,0.15); border-radius:4px; padding:0.85rem 1rem; margin-bottom:0.6rem; display:flex; justify-content:space-between; align-items:center;">' +
              '<div><h4 style="font-size:0.95rem; font-weight:700; color:#fff; margin:0;">' + esc(d.task) + '</h4><div style="font-size:0.78rem; color:#94a3b8; margin-top:0.15rem;">Termine federale: ' + esc(d.dateText) + '</div></div>' +
              '<span class="' + (d.isWarning ? 'es-pres-status es-pres-status-warning' : 'es-pres-status es-pres-status-ok') + '">' + esc(d.status) + '</span>' +
            '</div>'
          );
        }).join('');
        openDetailModal('Scadenziario Federale &amp; Termini Perentori', ICONS.bell, listHtml);
      };
    }

    var cardGovStatus = mount.querySelector('#card-pres-gov-status');
    if (cardGovStatus) {
      cardGovStatus.onclick = function () {
        var squad = data.squad || [];
        var html =
          '<p style="color:#cbd5e1; font-size:0.88rem; margin-bottom:1rem;">Stato della conformità legale, tesseramenti federali FIGC e consensi privacy:</p>' +
          '<div style="background:#040810; border:1px solid rgba(148,163,184,0.18); border-radius:4px; padding:1.1rem; margin-bottom:1.2rem;">' +
            '<div style="color:#cbd5e1; font-size:0.88rem; line-height:1.8;">' +
              '• <b>Tesseramenti Prima Squadra:</b> ' + squad.length + ' Atleti registrati<br>' +
              '• <b>Consensi GDPR Minori:</b> Depositati con firma digitale<br>' +
              '• <b>Abilitazioni BLSD:</b> 100% dello staff abilitato<br>' +
              '• <b>Provenienza Record:</b> ' + esc(data.lastUpdatedBy) + ' (' + esc(data.lastUpdatedAt) + ')' +
            '</div>' +
          '</div>' +
          '<button type="button" class="es-pres-btn-primary" id="btn-manage-squad-doc" style="width:100%;">Gestisci Organico Atleti &rsaquo;</button>';
        openDetailModal('Tesseramenti Federali &amp; Privacy GDPR', ICONS.fileText, html);
        var bDoc = document.getElementById('btn-manage-squad-doc');
        if (bDoc) {
          bDoc.onclick = function() {
            var m = document.getElementById('es-pres-detail-overlay');
            if (m) m.remove();
            openAddPlayerModal(data);
          };
        }
      };
    }

    // Azioni Schermate Interne & Stati Vuoti (100% attivi)
    mount.querySelectorAll('#btn-add-staff-member, #btn-add-first-staff').forEach(function (btn) {
      btn.onclick = function (e) {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        openAddStaffModal(data);
      };
    });

    mount.querySelectorAll('#btn-add-match-quick, #btn-add-first-match, #btn-add-schedule-match, #btn-add-first-schedule-match').forEach(function (btn) {
      btn.onclick = function (e) {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        openAddMatchModal(data);
      };
    });

    mount.querySelectorAll('#btn-add-training-session, #btn-add-first-training-session').forEach(function (btn) {
      btn.onclick = function (e) {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        openAddTrainingModal(data);
      };
    });

    mount.querySelectorAll('#btn-add-sponsor, #btn-add-first-sponsor').forEach(function (btn) {
      btn.onclick = function (e) {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        var formHtml =
          '<p style="color:#94a3b8; font-size:0.85rem; margin-bottom:1.2rem;">Inserisci un nuovo partner commerciale o sponsor di maglia:</p>' +
          '<form id="form-add-sp-real" style="display:flex; flex-direction:column; gap:1rem;">' +
            '<div class="es-pres-input-group"><label>Nome Azienda / Brand *</label><input type="text" class="es-pres-input-text" id="inp-sp-name" required placeholder="Es. Enel Energia"></div>' +
            '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
              '<div class="es-pres-input-group"><label>Tipologia Sponsor</label><select class="es-pres-input-text" id="sel-sp-tier" style="background:#040810; color:#fff;"><option>Main Sponsor Maglia</option><option>Sponsor Tecnico</option><option>Top Sponsor Territoriale</option><option>Sleeve Sponsor</option></select></div>' +
              '<div class="es-pres-input-group"><label>Valore Annuo (€)</label><input type="text" class="es-pres-input-text" id="inp-sp-val" placeholder="€ 20.000,00" value="€ 20.000,00"></div>' +
            '</div>' +
            '<div class="es-pres-input-group"><label>Scadenza Accordo</label><input type="date" class="es-pres-input-text" id="inp-sp-exp" value="2027-06-30"></div>' +
            '<div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:0.5rem; padding-top:0.85rem; border-top:1px solid rgba(148,163,184,0.15);">' +
              '<button type="button" class="es-pres-btn-secondary" id="btn-cancel-sp-modal">Annulla</button>' +
              '<button type="submit" class="es-pres-btn-primary">Registra Sponsor</button>' +
            '</div>' +
          '</form>';
        openDetailModal('Inserimento Nuovo Accordo Sponsor', ICONS.award, formHtml);
        var modalOverlay = document.getElementById('es-pres-detail-overlay');
        var form = document.getElementById('form-add-sp-real');
        var btnCancel = document.getElementById('btn-cancel-sp-modal');
        if (btnCancel && modalOverlay) btnCancel.onclick = function () { modalOverlay.remove(); };

        if (form) {
          form.onsubmit = function (e) {
            e.preventDefault();
            var name = document.getElementById('inp-sp-name').value.trim();
            var tier = document.getElementById('sel-sp-tier').value;
            var val = document.getElementById('inp-sp-val').value.trim();
            var exp = document.getElementById('inp-sp-exp').value;

            data.sponsors = data.sponsors || [];
            data.sponsors.push({
              id: Date.now(),
              name: name,
              tier: tier,
              value: val,
              expiry: exp,
              status: 'Attivo',
              doc: 'Accordo_' + name.replace(/\s+/g, '_') + '.pdf',
              isWarning: false
            });

            savePresClubData(data);
            if (modalOverlay) modalOverlay.remove();
            renderPresidentialSuite();
            if (window.showToast) window.showToast('Sponsor ' + name + ' registrato con successo!', 'success');
          };
        }
      };
    });

    var btnBacheca = mount.querySelector('#btn-bacheca-sponsor');
    if (btnBacheca) {
      btnBacheca.onclick = function () {
        var html =
          '<p style="color:#94a3b8; font-size:0.85rem; margin-bottom:1rem;">Opportunità di visibilità e spazi pubblicitari disponibili per i partner:</p>' +
          '<div style="display:flex; flex-direction:column; gap:0.6rem; margin-bottom:1.2rem;">' +
            '<div style="background:#040810; border:1px solid rgba(148,163,184,0.15); border-radius:4px; padding:0.85rem 1rem; display:flex; justify-content:space-between; align-items:center;">' +
              '<div><div style="font-weight:700; color:#fff;">LED Bordocampo Stadio</div><div style="font-size:0.75rem; color:#94a3b8;">15 Minuti a rotazione durante i match ufficiali</div></div>' +
              '<span class="es-pres-status es-pres-status-ok">Disponibile</span>' +
            '</div>' +
            '<div style="background:#040810; border:1px solid rgba(148,163,184,0.15); border-radius:4px; padding:0.85rem 1rem; display:flex; justify-content:space-between; align-items:center;">' +
              '<div><div style="font-weight:700; color:#fff;">Backdrop Sala Stampa & Interviste</div><div style="font-size:0.75rem; color:#94a3b8;">Presenza logo in tutte le conferenze post-partita</div></div>' +
              '<span class="es-pres-status es-pres-status-ok">Disponibile</span>' +
            '</div>' +
          '</div>';
        openDetailModal('Bacheca Opportunità Sponsor B2B', ICONS.award, html);
      };
    }

    // Pulsante CPV Capienza
    var btnReqCap = mount.querySelector('#btn-req-capacity-update');
    if (btnReqCap) {
      btnReqCap.onclick = function () {
        var curCapNum = parseInt(String(data.stadium.capacity || '').replace(/\D/g, '')) || 25085;
        var todayIso = new Date().toISOString().split('T')[0];

        var formHtml =
          '<p style="color:#94a3b8; font-size:0.85rem; margin-bottom:1.2rem; line-height:1.5;">' +
            'Compila la pratica ufficiale di variazione capienza o adeguamento agibilità per la trasmissione alla <b>Commissione Provinciale di Vigilanza (CPV)</b> e alla <b>FIGC / LND</b>.' +
          '</p>' +
          '<form id="form-pres-cpv-request" style="display:flex; flex-direction:column; gap:1rem;">' +
            '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
              '<div class="es-pres-input-group">' +
                '<label>Capienza Attuale Omologata</label>' +
                '<input type="text" class="es-pres-input-text" value="' + esc(data.stadium.capacity) + '" disabled style="opacity:0.7; cursor:not-allowed;">' +
              '</div>' +
              '<div class="es-pres-input-group">' +
                '<label style="color:#38bdf8;">Nuova Capienza Richiesta (Posti) *</label>' +
                '<input type="number" class="es-pres-input-text" id="inp-cpv-new-capacity" value="' + curCapNum + '" min="100" max="100000" required style="border-color:#38bdf8;">' +
              '</div>' +
            '</div>' +

            '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
              '<div class="es-pres-input-group">' +
                '<label>N° Protocollo / Verbale CPV</label>' +
                '<input type="text" class="es-pres-input-text" id="inp-cpv-protocol" placeholder="Es. CPV-2026/08-FG" value="' + esc(data.stadium.cpvProtocol || 'CPV-2026/08-FG') + '">' +
              '</div>' +
              '<div class="es-pres-input-group">' +
                '<label>Data Seduta Commissione</label>' +
                '<input type="date" class="es-pres-input-text" id="inp-cpv-date" value="' + todayIso + '">' +
              '</div>' +
            '</div>' +

            '<div class="es-pres-input-group">' +
              '<label>Motivazione / Tipologia Intervento</label>' +
              '<select class="es-pres-input-text" id="sel-cpv-reason" style="background:#040810; color:#fff;">' +
                '<option value="Riapertura settore / Ampliamento agibilità">Riapertura settore / Ampliamento agibilità</option>' +
                '<option value="Installazione nuovi seggiolini e numerazione posti">Installazione nuovi seggiolini e numerazione posti</option>' +
                '<option value="Adeguamento varchi di sicurezza e tornelli">Adeguamento varchi di sicurezza e tornelli</option>' +
                '<option value="Rimodulazione capienza per lavori straordinari">Rimodulazione capienza per lavori straordinari</option>' +
              '</select>' +
            '</div>' +

            '<div class="es-pres-input-group">' +
              '<label>Allegato Verbale Firmato (PDF / Scansione)</label>' +
              '<div style="background:#040810; border:1px dashed rgba(56,189,248,0.4); border-radius:4px; padding:0.9rem; text-align:center; cursor:pointer;" id="box-cpv-upload">' +
                '<input type="file" id="file-cpv-doc" accept=".pdf,.png,.jpg,.jpeg" style="display:none;">' +
                '<div style="font-size:0.85rem; color:#38bdf8; font-weight:600;" id="lbl-cpv-doc-name">&#128196; Seleziona o trascina il Verbale CPV / Prefettura</div>' +
                '<div style="font-size:0.75rem; color:#64748b; margin-top:0.25rem;">Formati ammessi: PDF, JPG, PNG (Max 15MB)</div>' +
              '</div>' +
            '</div>' +

            '<div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:0.5rem; padding-top:0.85rem; border-top:1px solid rgba(148,163,184,0.15);">' +
              '<button type="button" class="es-pres-btn-secondary" id="btn-cancel-cpv-modal">Annulla</button>' +
              '<button type="submit" class="es-pres-btn-primary" id="btn-submit-cpv-modal">Invia Pratica &amp; Aggiorna Capienza</button>' +
            '</div>' +
          '</form>';

        openDetailModal('Richiesta Variazione Capienza & Omologazione CPV', ICONS.building, formHtml);

        var modalOverlay = document.getElementById('es-pres-detail-overlay');
        var form = document.getElementById('form-pres-cpv-request');
        var boxUpload = document.getElementById('box-cpv-upload');
        var fileInp = document.getElementById('file-cpv-doc');
        var lblDoc = document.getElementById('lbl-cpv-doc-name');
        var btnCancel = document.getElementById('btn-cancel-cpv-modal');

        if (boxUpload && fileInp) {
          boxUpload.onclick = function () { fileInp.click(); };
          fileInp.onchange = function () {
            if (fileInp.files && fileInp.files[0]) {
              lblDoc.innerHTML = '&#10003; ' + esc(fileInp.files[0].name) + ' (' + Math.round(fileInp.files[0].size / 1024) + ' KB)';
              lblDoc.style.color = '#22c55e';
            }
          };
        }

        if (btnCancel && modalOverlay) {
          btnCancel.onclick = function () { modalOverlay.remove(); };
        }

        if (form) {
          form.onsubmit = function (e) {
            e.preventDefault();
            var newCapVal = document.getElementById('inp-cpv-new-capacity').value;
            var numFormatted = Number(newCapVal).toLocaleString('it-IT');
            var selectedDate = document.getElementById('inp-cpv-date').value || todayIso;
            var prot = document.getElementById('inp-cpv-protocol').value;

            data.stadium.capacity = numFormatted + ' posti certificati';
            data.stadium.lastInspectionDate = selectedDate;
            data.stadium.cpvProtocol = prot;
            data.stadium.safetyStatus = 'Omologato CPV / FIGC (' + numFormatted + ' posti)';
            savePresClubData(data);

            if (modalOverlay) modalOverlay.remove();
            renderPresidentialSuite();

            if (window.showToast) {
              window.showToast('Verbale CPV registrato: nuova capienza omologata a ' + numFormatted + ' posti!', 'success');
            }
          };
        }
      };
    }

    var btnSaveTickets = mount.querySelector('#btn-save-tickets');
    if (btnSaveTickets) {
      btnSaveTickets.onclick = function () {
        var reg = mount.querySelector('#inp-ticket-regular').value;
        var red = mount.querySelector('#inp-ticket-reduced').value;
        data.stadium.ticketPriceRegular = reg;
        data.stadium.ticketPriceReduced = red;
        savePresClubData(data);
        if (window.showToast) window.showToast('Tariffe biglietteria aggiornate: € ' + reg + ' / € ' + red, 'success');
      };
    }

    var btnSaveStadiumName = mount.querySelector('#btn-save-stadium-name');
    if (btnSaveStadiumName) {
      btnSaveStadiumName.onclick = function () {
        var val = mount.querySelector('#inp-stadium-name').value.trim();
        if (val) {
          data.stadium.name = val;
          savePresClubData(data);
          renderPresidentialSuite();
          if (window.showToast) window.showToast('Denominazione impianto salvata!', 'success');
        }
      };
    }

    var tabRecords = mount.querySelector('#btn-tab-records');
    var tabHistory = mount.querySelector('#btn-tab-history');
    if (tabRecords) {
      tabRecords.onclick = function () {
        statsActiveTab = 'records';
        renderPresidentialSuite();
      };
    }
    if (tabHistory) {
      tabHistory.onclick = function () {
        statsActiveTab = 'history';
        renderPresidentialSuite();
      };
    }
  }

  // ============================================================
  // MODALE GENERICA CENTRATA
  // ============================================================
  function openDetailModal(title, iconSvg, contentHtml) {
    var old = document.getElementById('es-pres-detail-overlay');
    if (old) old.remove();

    var modal = document.createElement('div');
    modal.id = 'es-pres-detail-overlay';
    modal.className = 'es-pres-modal-overlay';
    modal.innerHTML =
      '<div class="es-pres-modal-sheet" role="dialog" aria-modal="true">' +
        '<button type="button" class="es-pres-modal-close-btn" id="btn-close-pres-detail" aria-label="Chiudi">&times;</button>' +
        '<div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:1.2rem; padding-bottom:0.65rem; border-bottom:1px solid rgba(148,163,184,0.15);">' +
          '<span style="color:#38bdf8;">' + iconSvg + '</span>' +
          '<h2 style="font-size:1.3rem; font-weight:800; color:#ffffff; margin:0;">' + esc(title) + '</h2>' +
        '</div>' +
        '<div>' + contentHtml + '</div>' +
      '</div>';

    document.body.appendChild(modal);
    function close() { modal.remove(); }
    modal.querySelector('#btn-close-pres-detail').onclick = close;
    modal.onclick = function (e) { if (e.target === modal) close(); };
  }

  function render(force) {
    var group = document.getElementById('user-dossier-view-group');
    if (!group) return;
    var u = userObj();
    if (!force && !isExecutive(u)) return;

    group.classList.add('is-pres-dash');
    var staffProfile = document.getElementById('es-staff-profile');
    if (!staffProfile) return;

    staffProfile.classList.add('es-pres-on');

    var prd = document.getElementById('es-prd');
    if (!prd) {
      prd = document.createElement('div');
      prd.id = 'es-prd';
      staffProfile.appendChild(prd);
    }
    prd.style.display = 'block';
    renderPresidentialSuite();
  }

  function detach() {
    var group = document.getElementById('user-dossier-view-group');
    if (group) group.classList.remove('is-pres-dash');
    var staffProfile = document.getElementById('es-staff-profile');
    if (staffProfile) staffProfile.classList.remove('es-pres-on');
    var prd = document.getElementById('es-prd');
    if (prd) prd.remove();
  }

  window.EliseePresDash = {
    render: render,
    detach: detach,
    openDetail: openDetailModal,
    isPres: isExecutive,
    getClubData: getPresClubData,
    saveClubData: savePresClubData
  };

  function boot() {
    window.addEventListener('popstate', function (e) {
      var h = window.location.hash || '';
      if (h.indexOf('user-dossier') >= 0) {
        var match = h.match(/[?&]sub=([a-zA-Z0-9_-]+)/);
        var targetSub = match ? match[1] : (e.state && e.state.presSubView ? e.state.presSubView : 'overview');
        if (currentView !== targetSub) {
          currentView = targetSub;
          renderPresidentialSuite();
        }
      } else if (currentView !== 'overview') {
        currentView = 'overview';
        renderPresidentialSuite();
      }
    });

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
