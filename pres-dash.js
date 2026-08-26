/* ============================================================
   ELISEE SCOUT — AREA PRESIDENTE (PRESIDENTIAL DASHBOARD B2B)
   Gestionale Dirigenziale Sobrio & Professionale
   - Navigazione a Tab con Scrollspy in tempo reale & Smooth Scroll
   - Icone lineari outline SVG (Fischietto/Cronometro per Allenamento)
   - Metriche con unità di misura uniformi (.es-pres-unit)
   - Header Identità Club coerente (Foggia Calcio 1920 · Serie D Girone H)
   ============================================================ */
(function () {
  'use strict';

  var currentView = 'overview'; // 'overview' | 'stadium' | 'club-stats' | 'sponsors' | 'standings' | 'schedule' | 'training-center'
  var statsActiveTab = 'records'; // 'records' | 'history'

  var FOGGIA_LOGO_FALLBACK = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 5 L88 20 L88 55 C88 78 50 95 50 95 C50 95 12 78 12 55 L12 20 Z" fill="%23090e17" stroke="%23dc2626" stroke-width="4"/><path d="M32 20 L32 75 M50 20 L50 88 M68 20 L68 75" stroke="%23dc2626" stroke-width="7"/><rect x="22" y="44" width="56" height="20" rx="4" fill="%23040810" stroke="%2338bdf8" stroke-width="1.5"/><text x="50" y="58" font-family="system-ui,sans-serif" font-size="11" font-weight="900" fill="%23ffffff" text-anchor="middle" letter-spacing="1">FOGGIA</text></svg>';

  // Set di icone lineari outline SVG (stile minimale coerente con la navbar)
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
    checkShield: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>'
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

  function getPresClubData() {
    var u = userObj();
    var def = {
      clubName: 'Foggia Calcio 1920',
      category: 'Serie D · Girone H',
      season: 'Stagione 2026/27',
      matchDay: '28ª Giornata',
      position: '2° Posto',
      points: 62,
      standingGap: '-2 pt dalla vetta (1° Brindisi 64 pt)',
      affiliationStatus: 'Tesseramento Attivo FIGC LND',
      logoUrl: 'immagini/squadre-loghi/foggia.png',
      presName: (u.nome ? (u.nome + ' ' + (u.cognome || '')) : (u.name || 'Eliseo Miraglia')).trim(),
      presRole: 'Ruolo: Presidente',
      
      // 1. Gestione Club
      squadRating: {
        score: '84.6',
        scoreSub: 'Indice di rendimento rosa su base 100',
        avgAge: '23.4 anni',
        minutesCoverage: '88% minutaggio titolari',
        marketValue: '€ 1.450.000 (Valore scouting interno)',
        totalPlayers: 28
      },
      transfers: {
        activeCount: 4,
        items: [
          { player: 'Matteo Colombo', role: 'Attaccante', club: 'Taranto', status: 'In negoziazione', type: 'Acquisto definitivo' },
          { player: 'Davide Ferrara', role: 'Terzino Sinistro', club: 'Bari (Primavera)', status: 'In negoziazione', type: 'Prestito secco' },
          { player: 'Lorenzo Gatti', role: 'Difensore Centrale', club: 'Audace Cerignola', status: 'Trattativa aperta', type: 'Svincolato' },
          { player: 'Simone De Rosa', role: 'Ala Destra', club: 'Fidelis Andria', status: 'Accordo raggiunto', type: 'Ufficiale dal 01/09' }
        ]
      },
      staff: {
        total: 8,
        alertExpiring: 1,
        members: [
          { role: 'Allenatore Prima Squadra', name: 'Mario Somma', patent: 'UEFA Pro', contractExp: '30/06/2027', status: 'Regolare', isWarning: false },
          { role: 'Vice Allenatore', name: 'Giuseppe Russo', patent: 'UEFA A', contractExp: '30/06/2027', status: 'Regolare', isWarning: false },
          { role: 'Direttore Sportivo', name: 'Antonio Gentile', patent: 'Dirigente Sportivo FIGC', contractExp: '15/10/2026', status: 'In scadenza (45gg)', isWarning: true },
          { role: 'Preparatore Atletico', name: 'Luca Rossi', patent: 'Prep. Atletico Prof. FIGC', contractExp: '30/06/2027', status: 'Regolare', isWarning: false },
          { role: 'Preparatore Portieri', name: 'Francesco Mancini', patent: 'Patentino Portieri FIGC', contractExp: '30/06/2027', status: 'Regolare', isWarning: false },
          { role: 'Fisioterapista', name: 'Dott. Alessandro Neri', patent: 'Laurea Fisioterapia / Albo TSRM', contractExp: '30/06/2027', status: 'Regolare', isWarning: false },
          { role: 'Medico Sociale', name: 'Dott. Valerio Bianchi', patent: 'Medico Chirurgo / Spec. Med. Sport', contractExp: '30/06/2027', status: 'Regolare', isWarning: false },
          { role: 'Match Analyst', name: 'Roberto Esposito', patent: 'Match Analysis FIGC Coverciano', contractExp: '30/06/2027', status: 'Regolare', isWarning: false }
        ]
      },
      youth: {
        underInRoster: 6,
        mandatoryLnd: 3,
        underStarters: 2,
        academyTotal: 64,
        readinessPct: '92%'
      },
      athleteDevelopment: {
        activeCards: 9,
        topProspects: [
          { name: 'Eliseo Miraglia (2004)', role: 'Ala Sinistra', progress: '+14% KPI Velocità & Tiro' },
          { name: 'Luca Rizzo Pinna (2003)', role: 'Terzino', progress: '+11% Precisione Crossing' },
          { name: 'Alessandro Silvestro (2002)', role: 'Terzino', progress: '+8% Recupero Palla' }
        ]
      },

      // 2. Ufficio Club & Stadio
      office: {
        mail: {
          unread: 3,
          items: [
            { from: 'Agente FIFA (Sport Management)', subject: 'Proposta profilo attaccante Under 2005', date: 'Oggi · 11:20' },
            { from: 'Comitato Regionale FIGC LND', subject: 'Circolare Ufficiale: Orari anticipi 29ª Giornata', date: 'Ieri · 16:45' },
            { from: 'Famiglia De Rosa (Genitore)', subject: 'Richiesta appuntamento settore giovanile', date: '24/08/2026' }
          ]
        },
        sponsors: {
          activeCount: 4,
          totalIncome: '€ 45.000,00',
          alertExpiring: 1,
          categories: {
            main: { name: 'Banca Popolare di Puglia', tier: 'Main Sponsor Maglia', value: '€ 25.000,00', expiry: '30/06/2027', doc: 'Accordo_MainSponsor_2026.pdf', status: 'Attivo', isWarning: false },
            tech: { name: 'Givova Sport', tier: 'Sponsor Tecnico Ufficiale', value: '€ 12.000,00 (Fornitura Kit Gara)', expiry: '30/06/2027', doc: 'Convenzione_Tecnica_Givova.pdf', status: 'Attivo', isWarning: false },
            facility: { name: 'AutoPuglia Concessionaria', tier: 'Official Mobility Partner & Impianto', value: '€ 5.000,00', expiry: '30/09/2026', doc: 'Cartellonistica_Zaccheria.pdf', status: 'In scadenza (35gg)', isWarning: true }
          }
        },
        facilities: {
          name: 'Centro Sportivo Comunale Pino Zaccheria',
          mainPitch: 'Campo A (Erba Naturale - Omologazione FIGC Serie D)',
          secPitch: 'Campo B (Sintetico 4G - Settore Giovanile)',
          ownership: 'Convenzione Comunale Quinquennale (Scad. 2030)',
          status: 'Agibilità 100% Regolare'
        },
        merchandising: {
          ordersCount: 320,
          podModel: 'Print-on-Demand Attivo (Zero Magazzino / Spedizioni Dirette)',
          revenue: '€ 6.420,00'
        },
        stadium: {
          name: 'Stadio Comunale Pino Zaccheria',
          ticketPriceRegular: '10.00',
          ticketPriceReduced: '5.00',
          capacity: '25.085 posti certificati',
          avgAttendance: '4.850 spettatori / gara',
          safetyStatus: 'Omologato FIGC Serie D',
          lastInspectionDate: '12 Agosto 2026 (Verbale CPV Conforme)'
        },
        scouting: {
          secretListTalents: 18,
          analystReports: 12,
          wishlistPositions: 'Punta Centrale, Terzino Destro Under'
        },
        finances: {
          cashBalance: '€ 48.500,00',
          monthlyPayroll: '€ 18.200,00',
          annualBudget: '€ 240.000,00',
          budgetHealth: 'Bilancio in pareggio (+€ 6.300 di margine)'
        }
      },

      // 3. Competizioni & Statistiche Club
      competitions: {
        stats: {
          played: 28,
          won: 19,
          drawn: 5,
          lost: 4,
          gf: 54,
          ga: 22,
          gd: '+32',
          trend: ['W', 'W', 'D', 'W', 'L']
        },
        clubRecords: {
          mostAppearances: { player: 'Antonio Gentile', count: '342 presenze ufficiali' },
          mostGoalsSeason: { player: 'Marco Sau', count: '28 gol (Stagione 2011/12)' },
          mostAssists: { player: 'Lorenzo Insigne', count: '16 assist (Stagione 2010/11)' },
          winStreak: '7 vittorie consecutive',
          bestWin: '5 - 0 vs Nardò',
          worstDefeat: '0 - 3 vs Brindisi',
          recordAttendance: '12.450 spettatori (Derby di Puglia, Maggio 2026)',
          keySigning: 'Arrivo Capitano e Rientro Storico (Estate 2023)'
        },
        leagueHistory: [
          { season: '2025/26', league: 'Serie D · Girone H', pos: '3° Posto', pts: 61, note: 'Semifinale Playoff' },
          { season: '2024/25', league: 'Eccellenza Pugliese', pos: '1° Posto', pts: 72, note: 'Promozione in Serie D' },
          { season: '2023/24', league: 'Eccellenza Pugliese', pos: '2° Posto', pts: 65, note: 'Finalista Playoff' },
          { season: '2022/23', league: 'Serie D · Girone H', pos: '8° Posto', pts: 48, note: 'Salvezza regolare' }
        ],
        nextMatch: {
          opponent: 'Taranto FC 1927',
          date: 'Domenica 30 Agosto 2026 · Ore 15:00',
          stadium: 'Stadio Pino Zaccheria (Foggia)',
          referee: 'Sezione AIA Roma 1 (Arbitro: G. Marchetti)',
          assistants: 'Assistenti: M. Rossi (Lecce), L. Bianchi (Bari)'
        },
        scheduleMatches: [
          { round: '24ª G', date: '02/08/2026', type: 'H', opponent: 'Casarano Calcio', res: '2 - 1', status: 'W' },
          { round: '25ª G', date: '09/08/2026', type: 'A', opponent: 'Fidelis Andria', res: '3 - 0', status: 'W' },
          { round: '26ª G', date: '16/08/2026', type: 'H', opponent: 'Barletta 1922', res: '1 - 1', status: 'D' },
          { round: '27ª G', date: '23/08/2026', type: 'A', opponent: 'Audace Cerignola', res: '2 - 0', status: 'W' },
          { round: '28ª G', date: '26/08/2026', type: 'A', opponent: 'Brindisi', res: '1 - 2', status: 'L' },
          { round: '29ª G', date: '30/08/2026', type: 'H', opponent: 'Taranto FC 1927', res: '- - -', status: 'NEXT', referee: 'Sezione AIA Roma 1' },
          { round: '30ª G', date: '06/09/2026', type: 'A', opponent: 'Matera Calcio', res: '- - -', status: 'UPCOMING', referee: 'In attesa di designazione' }
        ],
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
      },

      // 4. Centro Allenamento Settimanale
      trainingWeek: [
        { day: 'Martedì', time: '15:00 - 17:30', pitch: 'Campo A (Erba)', focus: 'Attivazione preventiva, carico aerobico e forza funzionale', attendance: '27/28 Presenti' },
        { day: 'Mercoledì', time: '10:00 & 15:30', pitch: 'Campo A / Palestra', focus: 'Possesso palla, transizioni veloci e combinazioni offensive', attendance: '28/28 Presenti' },
        { day: 'Giovedì', time: '15:00 - 18:00', pitch: 'Campo A (Erba)', focus: 'Partitella a ranghi contrapposti con focus su avversario domenicale', attendance: '26/28 Presenti (2 differenziati)' },
        { day: 'Venerdì', time: '15:00 - 17:00', pitch: 'Campo A (Erba)', focus: 'Schemi su palle inattive e reattività', attendance: '28/28 Presenti' },
        { day: 'Sabato', time: '10:30 - 12:00', pitch: 'Campo A (Erba)', focus: 'Rifinitura tattica, velocità e lista convocati ufficiale', attendance: '28/28 Presenti' }
      ],

      // 5. Conformità & Governance
      governance: {
        tesseramenti: '28 / 28 Atleti Tesserati (Idoneità agonistica regolare)',
        gdprUnder18: 'Consensi genitoriali depositati con firma digitale',
        federalDeadlines: [
          { task: 'Iscrizione Campionato LND 2026/27', status: 'Regolarizzata', date: 'Completato', isWarning: false },
          { task: 'Deposito Fideiussione Bancaria', status: 'Approvata FIGC', date: 'Completato', isWarning: false },
          { task: 'Rinnovo Idoneità Agonistica 3 Atleti', status: 'In scadenza entro 20gg', date: '15/09/2026', isWarning: true }
        ],
        trustBadges: [
          { name: 'GDPR Compliance', desc: 'Dati atleti e minori protetti' },
          { name: 'FIGC Legal Verified', desc: 'Matricola societaria verificata' },
          { name: 'Video Scouting Safe', desc: 'Liberatorie immagini depositate' },
          { name: '2FA Auth Enabled', desc: 'Accesso dirigenziale protetto' }
        ]
      }
    };

    try {
      var stored = localStorage.getItem('elisee_pres_club_master_data');
      if (stored) return Object.assign(def, JSON.parse(stored));
    } catch (_) {}
    return def;
  }

  function savePresClubData(data) {
    try {
      localStorage.setItem('elisee_pres_club_master_data', JSON.stringify(data));
    } catch (_) {}
  }

  // ============================================================
  // SCHERMATE DI DETTAGLIO (6 SCHERMATE B2B)
  // ============================================================

  // 1. Schermata Dettaglio: STADIO
  function renderStadiumScreen(data) {
    return (
      '<div class="es-pres-detail-screen">' +
        '<div class="es-pres-detail-header">' +
          '<h2>' + ICONS.building + ' Stadio &amp; Impianto Sportivo</h2>' +
          '<p>Gestisci i dati anagrafici, le tariffe e le condizioni di sicurezza del tuo impianto sportivo</p>' +
        '</div>' +

        '<div class="es-pres-detail-body">' +
          '<div class="es-pres-grid-2">' +
            '<div class="es-pres-detail-box">' +
              '<h3>Tariffe Biglietteria Ufficiale</h3>' +
              '<p style="color:#94a3b8; font-size:0.85rem; margin-top:-0.5rem; margin-bottom:1.2rem;">Prezzo praticato dal club per le gare casalinghe.</p>' +
              '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.2rem;">' +
                '<div class="es-pres-input-group">' +
                  '<label>Intero (€)</label>' +
                  '<input type="number" step="0.50" class="es-pres-input-text" id="inp-ticket-regular" value="' + esc(data.office.stadium.ticketPriceRegular) + '">' +
                '</div>' +
                '<div class="es-pres-input-group">' +
                  '<label>Ridotto Under 14 / Over 65 (€)</label>' +
                  '<input type="number" step="0.50" class="es-pres-input-text" id="inp-ticket-reduced" value="' + esc(data.office.stadium.ticketPriceReduced) + '">' +
                '</div>' +
              '</div>' +
              '<button type="button" class="es-pres-btn-primary" id="btn-save-tickets">Salva Tariffe</button>' +
            '</div>' +

            '<div class="es-pres-detail-box">' +
              '<h3>Capienza &amp; Omologazione Impianto</h3>' +
              '<div style="background:#040810; border:1px solid rgba(148,163,184,0.18); border-radius:10px; padding:1rem; margin-bottom:1.2rem;">' +
                '<div style="font-size:0.75rem; color:#94a3b8; font-weight:700; text-transform:uppercase;">Capienza Ufficiale Certificata</div>' +
                '<div style="font-size:1.6rem; font-weight:800; color:#38bdf8; margin:0.3rem 0;">' + esc(data.office.stadium.capacity) + '</div>' +
                '<p style="font-size:0.8rem; color:#64748b; margin:0;">Dato anagrafico modificabile solo previa delibera CPV / FIGC.</p>' +
              '</div>' +
              '<button type="button" class="es-pres-btn-secondary" id="btn-req-capacity-update">Richiedi variazione con verbale CPV</button>' +
            '</div>' +
          '</div>' +

          '<div class="es-pres-grid-2">' +
            '<div class="es-pres-detail-box">' +
              '<h3>Media Spettatori Stagionale</h3>' +
              '<div style="font-size:1.8rem; font-weight:800; color:#38bdf8; margin-bottom:0.4rem;">4.850 <span style="font-size:0.95rem; color:#94a3b8; font-weight:500;">spettatori / gara</span></div>' +
              '<p style="color:#cbd5e1; font-size:0.85rem; line-height:1.5;">Calcolata su presenze e biglietti reali registrati nelle 14 partite casalinghe ufficiali.</p>' +
              '<div style="font-size:0.8rem; color:#94a3b8; margin-top:0.6rem;">• Record stagionale: <b>12.450 spettatori</b><br>• Tasso di riempimento medio: <b>19.3%</b></div>' +
            '</div>' +

            '<div class="es-pres-detail-box">' +
              '<h3>Stato Agibilità &amp; Sicurezza</h3>' +
              '<div style="margin-bottom:0.8rem;">' +
                '<span class="es-pres-badge es-pres-badge-success">' + esc(data.office.stadium.safetyStatus) + '</span>' +
              '</div>' +
              '<p style="color:#cbd5e1; font-size:0.85rem; line-height:1.5;">• <b>Ultimo Controllo:</b> ' + esc(data.office.stadium.lastInspectionDate) + '<br>• <b>Videosorveglianza:</b> Conforme alle direttive prefettizie<br>• <b>Presidio Sanitario:</b> 2 Postazioni BLSD omologate</p>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="es-pres-back-footer">' +
          '<button type="button" class="es-pres-btn-back" data-action="go-back">&larr; Indietro</button>' +
        '</div>' +
      '</div>'
    );
  }

  // 2. Schermata Dettaglio: STATISTICHE CLUB
  function renderClubStatsScreen(data) {
    return (
      '<div class="es-pres-detail-screen">' +
        '<div class="es-pres-detail-header">' +
          '<h2>' + ICONS.barChart + ' Statistiche Club &amp; Storico Campionati</h2>' +
          '<p>Rendimento statistico ufficiale, record societari e storico posizionamenti in lega</p>' +
        '</div>' +

        '<div style="display:flex; gap:0.5rem; margin-bottom:1.5rem;">' +
          '<button type="button" class="es-pres-btn-secondary ' + (statsActiveTab === 'records' ? 'is-active' : '') + '" id="btn-tab-records" style="' + (statsActiveTab === 'records' ? 'background:#0284c7; color:#fff; border-color:#0284c7;' : '') + '">Record di Club</button>' +
          '<button type="button" class="es-pres-btn-secondary ' + (statsActiveTab === 'history' ? 'is-active' : '') + '" id="btn-tab-history" style="' + (statsActiveTab === 'history' ? 'background:#0284c7; color:#fff; border-color:#0284c7;' : '') + '">Storico di Lega</button>' +
        '</div>' +

        '<div class="es-pres-detail-body">' +
          (statsActiveTab === 'records' ? (
            '<div class="es-pres-grid-3">' +
              '<div class="es-pres-detail-box">' +
                '<h3>Presenze Record</h3>' +
                '<div style="font-size:1.4rem; font-weight:800; color:#38bdf8;">' + esc(data.competitions.clubRecords.mostAppearances.player) + '</div>' +
                '<p style="color:#94a3b8; font-size:0.85rem; margin-top:0.3rem;">' + esc(data.competitions.clubRecords.mostAppearances.count) + '</p>' +
              '</div>' +

              '<div class="es-pres-detail-box">' +
                '<h3>Gol in una Stagione</h3>' +
                '<div style="font-size:1.4rem; font-weight:800; color:#38bdf8;">' + esc(data.competitions.clubRecords.mostGoalsSeason.player) + '</div>' +
                '<p style="color:#94a3b8; font-size:0.85rem; margin-top:0.3rem;">' + esc(data.competitions.clubRecords.mostGoalsSeason.count) + '</p>' +
              '</div>' +

              '<div class="es-pres-detail-box">' +
                '<h3>Assist Record</h3>' +
                '<div style="font-size:1.4rem; font-weight:800; color:#38bdf8;">' + esc(data.competitions.clubRecords.mostAssists.player) + '</div>' +
                '<p style="color:#94a3b8; font-size:0.85rem; margin-top:0.3rem;">' + esc(data.competitions.clubRecords.mostAssists.count) + '</p>' +
              '</div>' +

              '<div class="es-pres-detail-box">' +
                '<h3>Striscia Vittorie</h3>' +
                '<div style="font-size:1.4rem; font-weight:800; color:#34d399;">' + esc(data.competitions.clubRecords.winStreak) + '</div>' +
                '<p style="color:#94a3b8; font-size:0.85rem; margin-top:0.3rem;">Record imbattibilità stagionale</p>' +
              '</div>' +

              '<div class="es-pres-detail-box">' +
                '<h3>Miglior Vittoria</h3>' +
                '<div style="font-size:1.4rem; font-weight:800; color:#ffffff;">' + esc(data.competitions.clubRecords.bestWin) + '</div>' +
                '<p style="color:#94a3b8; font-size:0.85rem; margin-top:0.3rem;">Peggior sconfitta: ' + esc(data.competitions.clubRecords.worstDefeat) + '</p>' +
              '</div>' +

              '<div class="es-pres-detail-box">' +
                '<h3>Presenza Record Stadio</h3>' +
                '<div style="font-size:1.4rem; font-weight:800; color:#38bdf8;">12.450</div>' +
                '<p style="color:#94a3b8; font-size:0.85rem; margin-top:0.3rem;">' + esc(data.competitions.clubRecords.recordAttendance) + '</p>' +
              '</div>' +
            '</div>' +

            '<div class="es-pres-detail-box" style="margin-top:1rem;">' +
              '<h3>Tesseramento più Significativo</h3>' +
              '<p style="color:#cbd5e1; font-size:0.9rem; margin:0;"><b>' + esc(data.competitions.clubRecords.keySigning) + '</b>: operazione tecnica di riferimento che ha consolidato la leadership e l\'identità del club.</p>' +
            '</div>'
          ) : (
            '<div class="es-pres-detail-box">' +
              '<h3>Storico Posizionamenti in Campionato</h3>' +
              '<div class="es-pres-table-wrap">' +
                '<table class="es-pres-table">' +
                  '<thead><tr><th>Stagione</th><th>Campionato</th><th>Posizione</th><th>Punti</th><th>Esito / Note</th></tr></thead>' +
                  '<tbody>' +
                    data.competitions.leagueHistory.map(function (h) {
                      return (
                        '<tr>' +
                          '<td><b>' + esc(h.season) + '</b></td>' +
                          '<td>' + esc(h.league) + '</td>' +
                          '<td style="color:#38bdf8; font-weight:700;">' + esc(h.pos) + '</td>' +
                          '<td><b>' + esc(h.pts) + '</b> pt</td>' +
                          '<td><span class="es-pres-badge es-pres-badge-neutral">' + esc(h.note) + '</span></td>' +
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

  // 3. Schermata Dettaglio: SPONSOR
  function renderSponsorsScreen(data) {
    var canSeeFinances = hasFinanceAccess();
    var sp = data.office.sponsors.categories;

    return (
      '<div class="es-pres-detail-screen">' +
        '<div class="es-pres-detail-header">' +
          '<h2>' + ICONS.award + ' Sponsor &amp; Accordi Commerciali</h2>' +
          '<p>Gestione partnership, sponsorizzazioni di maglia e spazi pubblicitari</p>' +
        '</div>' +

        '<div class="es-pres-detail-body">' +
          '<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">' +
            '<div style="font-size:1.05rem; font-weight:700; color:#fff;">3 Categorie di Sponsor Ufficiali</div>' +
            '<div style="display:flex; gap:0.6rem;">' +
              '<button type="button" class="es-pres-btn-primary" id="btn-add-sponsor">+ Inserisci Nuovo Accordo</button>' +
              '<button type="button" class="es-pres-btn-secondary" id="btn-bacheca-sponsor">Bacheca Opportunità B2B</button>' +
            '</div>' +
          '</div>' +

          '<div class="es-pres-grid-3">' +
            // Main Sponsor
            '<div class="es-pres-detail-box">' +
              '<div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.8rem;">' +
                '<span class="es-pres-badge es-pres-badge-neutral">Main Sponsor Maglia</span>' +
                '<span class="es-pres-badge es-pres-badge-success">' + esc(sp.main.status) + '</span>' +
              '</div>' +
              '<h4 style="font-size:1.2rem; font-weight:800; color:#fff; margin:0 0 0.3rem;">' + esc(sp.main.name) + '</h4>' +
              '<p style="color:#94a3b8; font-size:0.82rem; margin-bottom:0.8rem;">' + esc(sp.main.tier) + '</p>' +
              '<div style="background:#040810; border-radius:8px; padding:0.75rem; margin-bottom:0.8rem;">' +
                '<div style="font-size:0.72rem; color:#94a3b8;">Valore Contrattuale</div>' +
                '<div style="font-size:1.3rem; font-weight:800; color:#38bdf8;">' + (canSeeFinances ? esc(sp.main.value) : 'Riservato') + '</div>' +
              '</div>' +
              '<div style="font-size:0.78rem; color:#cbd5e1;">• Scadenza: <b>' + esc(sp.main.expiry) + '</b><br>• Documento: <a href="#" style="color:#38bdf8;">' + esc(sp.main.doc) + '</a></div>' +
            '</div>' +

            // Tech Sponsor
            '<div class="es-pres-detail-box">' +
              '<div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.8rem;">' +
                '<span class="es-pres-badge es-pres-badge-neutral">Sponsor Tecnico</span>' +
                '<span class="es-pres-badge es-pres-badge-success">' + esc(sp.tech.status) + '</span>' +
              '</div>' +
              '<h4 style="font-size:1.2rem; font-weight:800; color:#fff; margin:0 0 0.3rem;">' + esc(sp.tech.name) + '</h4>' +
              '<p style="color:#94a3b8; font-size:0.82rem; margin-bottom:0.8rem;">' + esc(sp.tech.tier) + '</p>' +
              '<div style="background:#040810; border-radius:8px; padding:0.75rem; margin-bottom:0.8rem;">' +
                '<div style="font-size:0.72rem; color:#94a3b8;">Valore Fornitura / Kit</div>' +
                '<div style="font-size:1.3rem; font-weight:800; color:#38bdf8;">' + (canSeeFinances ? esc(sp.tech.value) : 'Riservato') + '</div>' +
              '</div>' +
              '<div style="font-size:0.78rem; color:#cbd5e1;">• Scadenza: <b>' + esc(sp.tech.expiry) + '</b><br>• Documento: <a href="#" style="color:#38bdf8;">' + esc(sp.tech.doc) + '</a></div>' +
            '</div>' +

            // Facility Sponsor
            '<div class="es-pres-detail-box">' +
              '<div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.8rem;">' +
                '<span class="es-pres-badge es-pres-badge-neutral">Sponsor Impianto</span>' +
                '<span class="es-pres-badge es-pres-badge-warning">' + esc(sp.facility.status) + '</span>' +
              '</div>' +
              '<h4 style="font-size:1.2rem; font-weight:800; color:#fff; margin:0 0 0.3rem;">' + esc(sp.facility.name) + '</h4>' +
              '<p style="color:#94a3b8; font-size:0.82rem; margin-bottom:0.8rem;">' + esc(sp.facility.tier) + '</p>' +
              '<div style="background:#040810; border-radius:8px; padding:0.75rem; margin-bottom:0.8rem;">' +
                '<div style="font-size:0.72rem; color:#94a3b8;">Valore Annuo</div>' +
                '<div style="font-size:1.3rem; font-weight:800; color:#38bdf8;">' + (canSeeFinances ? esc(sp.facility.value) : 'Riservato') + '</div>' +
              '</div>' +
              '<div style="font-size:0.78rem; color:#cbd5e1;">• Scadenza: <b style="color:#fbbf24;">' + esc(sp.facility.expiry) + ' (35gg)</b><br>• Documento: <a href="#" style="color:#38bdf8;">' + esc(sp.facility.doc) + '</a></div>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="es-pres-back-footer">' +
          '<button type="button" class="es-pres-btn-back" data-action="go-back">&larr; Indietro</button>' +
        '</div>' +
      '</div>'
    );
  }

  // 4. Schermata Dettaglio: CLASSIFICA (STANDINGS)
  function renderStandingsScreen(data) {
    return (
      '<div class="es-pres-detail-screen">' +
        '<div class="es-pres-detail-header">' +
          '<h2>' + ICONS.layers + ' Classifica Ufficiale di Campionato</h2>' +
          '<p>Dati federali ufficiali LND · Aggiornati all\'ultimo referto di gara</p>' +
        '</div>' +

        '<div class="es-pres-detail-body">' +
          '<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">' +
            '<div style="display:flex; align-items:center; gap:0.6rem;">' +
              '<span style="font-size:0.82rem; font-weight:700; color:#94a3b8;">SELEZIONA CAMPIONATO:</span>' +
              '<select class="es-pres-input-text" style="padding:0.4rem 0.8rem; font-size:0.82rem;">' +
                '<option selected>' + esc(data.category) + '</option>' +
                '<option>Eccellenza Pugliese · Girone Unico</option>' +
                '<option>Juniores Under 19 Nazionale</option>' +
              '</select>' +
            '</div>' +
            '<span class="es-pres-badge es-pres-badge-neutral">Fonte: Comunicato Ufficiale FIGC / LND</span>' +
          '</div>' +

          '<div class="es-pres-detail-box" style="padding:1rem;">' +
            '<div class="es-pres-table-wrap">' +
              '<table class="es-pres-table">' +
                '<thead>' +
                  '<tr>' +
                    '<th style="width:45px;">Pos</th>' +
                    '<th>Squadra</th>' +
                    '<th style="text-align:center;">G</th>' +
                    '<th style="text-align:center;">V</th>' +
                    '<th style="text-align:center;">P</th>' +
                    '<th style="text-align:center;">S</th>' +
                    '<th style="text-align:center;">GF</th>' +
                    '<th style="text-align:center;">GS</th>' +
                    '<th style="text-align:center;">DR</th>' +
                    '<th style="text-align:center; color:#38bdf8;">PT</th>' +
                  '</tr>' +
                '</thead>' +
                '<tbody>' +
                  data.competitions.standingsTable.map(function (row) {
                    var isMyTeam = row.isUser;
                    return (
                      '<tr class="' + (isMyTeam ? 'is-my-club' : '') + '">' +
                        '<td style="font-weight:800; color:' + (row.pos <= 2 ? '#38bdf8' : (row.pos <= 5 ? '#34d399' : '#94a3b8')) + ';">' + row.pos + '</td>' +
                        '<td>' +
                          '<b>' + esc(row.team) + '</b>' +
                          (isMyTeam ? ' <span class="es-pres-badge es-pres-badge-neutral" style="font-size:0.65rem; margin-left:0.4rem;">Il tuo Club</span>' : '') +
                        '</td>' +
                        '<td style="text-align:center;">' + row.played + '</td>' +
                        '<td style="text-align:center; color:#34d399; font-weight:700;">' + row.won + '</td>' +
                        '<td style="text-align:center; color:#94a3b8;">' + row.drawn + '</td>' +
                        '<td style="text-align:center; color:#f87171;">' + row.lost + '</td>' +
                        '<td style="text-align:center;">' + row.gf + '</td>' +
                        '<td style="text-align:center;">' + row.ga + '</td>' +
                        '<td style="text-align:center; color:' + (row.gd.startsWith('+') ? '#34d399' : '#f87171') + ';">' + row.gd + '</td>' +
                        '<td style="text-align:center; font-size:1.05rem; font-weight:800; color:#38bdf8;">' + row.pts + '</td>' +
                      '</tr>'
                    );
                  }).join('') +
                '</tbody>' +
              '</table>' +
            '</div>' +
            '<div style="display:flex; gap:1.5rem; margin-top:0.8rem; font-size:0.75rem; color:#94a3b8;">' +
              '<span>1° Posto: Promozione Diretta in Serie C</span>' +
              '<span>2°-5° Posto: Playoff Promozione</span>' +
              '<span>13°-16° Posto: Playout Salvezza</span>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="es-pres-back-footer">' +
          '<button type="button" class="es-pres-btn-back" data-action="go-back">&larr; Indietro</button>' +
        '</div>' +
      '</div>'
    );
  }

  // 5. Schermata Dettaglio: CALENDARIO (SCHEDULE)
  function renderScheduleScreen(data) {
    return (
      '<div class="es-pres-detail-screen">' +
        '<div class="es-pres-detail-header">' +
          '<h2>' + ICONS.calendar + ' Calendario Gare &amp; Designazioni AIA</h2>' +
          '<p>Programmazione incontri, esiti ufficiali e designazioni arbitrali federali</p>' +
        '</div>' +

        '<div class="es-pres-detail-body">' +
          '<div class="es-pres-detail-box" style="padding:1.2rem;">' +
            '<div style="display:flex; flex-direction:column; gap:0.6rem;">' +
              data.competitions.scheduleMatches.map(function (m) {
                var borderCol = m.status === 'W' ? '#34d399' : (m.status === 'D' ? '#94a3b8' : (m.status === 'L' ? '#ef4444' : '#38bdf8'));
                return (
                  '<div style="background:#040810; border:1px solid rgba(148,163,184,0.15); border-left:3px solid ' + borderCol + '; border-radius:10px; padding:0.85rem 1.1rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.8rem; cursor:pointer;" class="es-pres-schedule-row">' +
                    '<div style="display:flex; align-items:center; gap:1rem;">' +
                      '<span class="es-pres-badge es-pres-badge-neutral" style="font-size:0.72rem;">' + (m.type === 'H' ? 'CASA (H)' : 'TRASFERTA (A)') + '</span>' +
                      '<div>' +
                        '<div style="font-size:0.95rem; font-weight:700; color:#fff;">' + esc(m.round) + ' · vs ' + esc(m.opponent) + '</div>' +
                        '<div style="font-size:0.75rem; color:#94a3b8; margin-top:0.15rem;">' + esc(m.date) + (m.referee ? (' · Arbitro: ' + esc(m.referee)) : '') + '</div>' +
                      '</div>' +
                    '</div>' +
                    '<div style="display:flex; align-items:center; gap:0.8rem;">' +
                      '<div style="font-size:1.2rem; font-weight:800; color:' + (m.status === 'NEXT' ? '#38bdf8' : '#ffffff') + ';">' + esc(m.res) + '</div>' +
                      (m.status === 'W' ? '<span class="es-pres-badge es-pres-badge-success">Vittoria</span>' :
                       m.status === 'D' ? '<span class="es-pres-badge es-pres-badge-neutral">Pareggio</span>' :
                       m.status === 'L' ? '<span class="es-pres-badge es-pres-badge-danger">Sconfitta</span>' :
                       '<span class="es-pres-badge es-pres-badge-neutral">Prossima Gara</span>') +
                    '</div>' +
                  '</div>'
                );
              }).join('') +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="es-pres-back-footer">' +
          '<button type="button" class="es-pres-btn-back" data-action="go-back">&larr; Indietro</button>' +
        '</div>' +
      '</div>'
    );
  }

  // 6. Schermata Dettaglio: CENTRO ALLENAMENTO (TRAINING CENTER)
  function renderTrainingCenterScreen(data) {
    return (
      '<div class="es-pres-detail-screen">' +
        '<div class="es-pres-detail-header">' +
          '<h2>' + ICONS.stopwatch + ' Centro Sportivo &amp; Staff Tecnico</h2>' +
          '<p>Programma settimanale degli allenamenti, presenze atleti e qualifiche federali staff</p>' +
        '</div>' +

        '<div class="es-pres-detail-body">' +
          '<div class="es-pres-detail-box">' +
            '<h3>Staff Tecnico &amp; Qualifiche Ufficiali FIGC</h3>' +
            '<p style="color:#94a3b8; font-size:0.82rem; margin-top:-0.4rem; margin-bottom:1rem;">Anagrafica reale e patentini federali omologati per la stagione in corso.</p>' +
            '<div class="es-pres-grid-2">' +
              data.staff.members.map(function (m) {
                return (
                  '<div style="background:#040810; border:1px solid rgba(148,163,184,0.15); border-radius:10px; padding:0.85rem 1rem; display:flex; justify-content:space-between; align-items:center;">' +
                    '<div>' +
                      '<div style="font-size:0.92rem; font-weight:700; color:#fff;">' + esc(m.name) + '</div>' +
                      '<div style="font-size:0.75rem; color:#38bdf8; margin-top:0.1rem;">' + esc(m.role) + '</div>' +
                      '<div style="font-size:0.72rem; color:#94a3b8; margin-top:0.15rem;">Qualifica: <b>' + esc(m.patent || 'Patentino FIGC') + '</b></div>' +
                    '</div>' +
                    '<span class="' + (m.isWarning ? 'es-pres-badge es-pres-badge-warning' : 'es-pres-badge es-pres-badge-success') + '">' + esc(m.status) + '</span>' +
                  '</div>'
                );
              }).join('') +
            '</div>' +
          '</div>' +

          '<div class="es-pres-detail-box">' +
            '<h3>Piano di Lavoro Settimanale &amp; Presenze</h3>' +
            '<div style="display:flex; flex-direction:column; gap:0.6rem;">' +
              data.trainingWeek.map(function (tw) {
                return (
                  '<div style="background:#040810; border:1px solid rgba(148,163,184,0.15); border-radius:10px; padding:0.9rem 1.1rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.8rem;">' +
                    '<div>' +
                      '<div style="font-size:0.95rem; font-weight:700; color:#38bdf8;">' + esc(tw.day) + ' <span style="font-size:0.8rem; color:#94a3b8; font-weight:400;">(' + esc(tw.time) + ')</span></div>' +
                      '<div style="font-size:0.82rem; color:#cbd5e1; margin-top:0.25rem;"><b>Focus seduta:</b> ' + esc(tw.focus) + '</div>' +
                      '<div style="font-size:0.75rem; color:#94a3b8; margin-top:0.15rem;">Ubicazione: ' + esc(tw.pitch) + '</div>' +
                    '</div>' +
                    '<div style="text-align:right;">' +
                      '<span class="es-pres-badge es-pres-badge-success">' + esc(tw.attendance) + '</span>' +
                    '</div>' +
                  '</div>'
                );
              }).join('') +
            '</div>' +
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

    return (
      '<div class="es-pres-suite">' +
        // 1. Header Identità Club
        '<div class="es-pres-header-banner">' +
          '<div class="es-pres-header-inner">' +
            '<div class="es-pres-club-meta-box">' +
              '<div class="es-pres-crest-frame">' +
                '<img src="' + esc(data.logoUrl) + '" alt="' + esc(data.clubName) + '" onerror="this.onerror=null; this.src=\'' + FOGGIA_LOGO_FALLBACK + '\';">' +
              '</div>' +
              '<div>' +
                '<h1 class="es-pres-club-name">' + esc(data.clubName) + '</h1>' +
                '<div class="es-pres-badges-row">' +
                  '<span class="es-pres-badge es-pres-badge-neutral">' + esc(data.category) + '</span>' +
                  '<span class="es-pres-badge es-pres-badge-success">' + esc(data.affiliationStatus) + '</span>' +
                  '<span class="es-pres-badge es-pres-badge-neutral">' + esc(data.presRole) + '</span>' +
                '</div>' +
              '</div>' +
            '</div>' +

            '<div class="es-pres-standings-snippet">' +
              '<div class="es-pres-snippet-col">' +
                '<div class="es-pres-snippet-val">' + esc(data.position) + '</div>' +
                '<div class="es-pres-snippet-lbl">' + esc(data.points) + ' Punti</div>' +
              '</div>' +
              '<div style="width:1px; height:28px; background:rgba(148,163,184,0.2);"></div>' +
              '<div class="es-pres-snippet-col">' +
                '<div class="es-pres-snippet-val" style="color:#ffffff;">' + esc(data.matchDay) + '</div>' +
                '<div class="es-pres-snippet-lbl">' + esc(data.season) + '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +

        // 2. Barra di Navigazione Interna a Tab (Sequenza Esatta con Sticky & Scrollspy)
        '<div class="es-pres-nav-strip" id="es-pres-navbar">' +
          '<button type="button" class="es-pres-nav-btn is-active" data-tab="panoramica">' + ICONS.shield + ' Panoramica</button>' +
          '<button type="button" class="es-pres-nav-btn" data-tab="gestione">' + ICONS.users + ' Gestione Club</button>' +
          '<button type="button" class="es-pres-nav-btn" data-tab="ufficio">' + ICONS.briefcase + ' Ufficio &amp; Finanze</button>' +
          '<button type="button" class="es-pres-nav-btn" data-tab="competizioni">' + ICONS.barChart + ' Competizioni &amp; Risultati</button>' +
          '<button type="button" class="es-pres-nav-btn" data-tab="governance">' + ICONS.checkShield + ' Conformità &amp; Governance</button>' +
        '</div>' +

        // 3. Contenitore Sezioni
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
              // Card Rating Rosa (KPI Sobria)
              '<div class="es-pres-card" id="card-pres-rating">' +
                '<div class="es-pres-card-top">' +
                  '<div class="es-pres-icon-box">' + ICONS.users + '</div>' +
                  '<span class="es-pres-badge es-pres-badge-neutral">Rendimento Rosa</span>' +
                '</div>' +
                '<div>' +
                  '<h3 class="es-pres-card-title">Rating Rosa</h3>' +
                  '<div class="es-pres-card-metric">' + data.squadRating.score + ' <span class="es-pres-unit">indice / 100</span></div>' +
                  '<p class="es-pres-card-desc" style="font-size:0.75rem; color:#94a3b8; margin-bottom:0.35rem;">' + data.squadRating.scoreSub + '</p>' +
                  '<p class="es-pres-card-desc">Età media ' + data.squadRating.avgAge + ' · ' + data.squadRating.minutesCoverage + '</p>' +
                '</div>' +
                '<div class="es-pres-card-footer"><span>' + data.squadRating.totalPlayers + ' atleti in organico</span><span>Apri rosa &rsaquo;</span></div>' +
              '</div>' +

              // Card Trattative
              '<div class="es-pres-card" id="card-pres-transfers">' +
                '<div class="es-pres-card-top">' +
                  '<div class="es-pres-icon-box">' + ICONS.arrows + '</div>' +
                  '<span class="es-pres-badge es-pres-badge-success">' + data.transfers.activeCount + ' Trattative</span>' +
                '</div>' +
                '<div>' +
                  '<h3 class="es-pres-card-title">Trattative di Mercato</h3>' +
                  '<div class="es-pres-card-metric">' + data.transfers.activeCount + ' <span class="es-pres-unit">trattative attive</span></div>' +
                  '<p class="es-pres-card-desc">2 In negoziazione · 1 accordo raggiunto · 1 prestito in entrata</p>' +
                '</div>' +
                '<div class="es-pres-card-footer"><span>Hub Mercato &amp; Svincoli</span><span>Dettagli trattative &rsaquo;</span></div>' +
              '</div>' +

              // Card Staff Tecnico
              '<div class="es-pres-card" id="card-pres-staff">' +
                '<div class="es-pres-card-top">' +
                  '<div class="es-pres-icon-box">' + ICONS.briefcase + '</div>' +
                  (data.staff.alertExpiring > 0 ? ('<span class="es-pres-badge es-pres-badge-warning">' + data.staff.alertExpiring + ' In scadenza</span>') : '<span class="es-pres-badge es-pres-badge-success">Staff Regolare</span>') +
                '</div>' +
                '<div>' +
                  '<h3 class="es-pres-card-title">Staff Tecnico</h3>' +
                  '<div class="es-pres-card-metric">' + data.staff.total + ' <span class="es-pres-unit">membri staff</span></div>' +
                  '<p class="es-pres-card-desc">Mister, Vice, DS, Preparatore, Fisio, Medico e Match Analyst</p>' +
                '</div>' +
                '<div class="es-pres-card-footer"><span>Verifica contratti</span><span>Gestisci staff &rsaquo;</span></div>' +
              '</div>' +
            '</div>' +

            '<div class="es-pres-grid-2" style="margin-top:1.15rem;">' +
              // Card Settore Giovanile
              '<div class="es-pres-card" id="card-pres-youth">' +
                '<div class="es-pres-card-top">' +
                  '<div class="es-pres-icon-box">' + ICONS.sprout + '</div>' +
                  '<span class="es-pres-badge es-pres-badge-neutral">' + data.youth.underInRoster + ' Under</span>' +
                '</div>' +
                '<div>' +
                  '<h3 class="es-pres-card-title">Settore Giovanile &amp; Fuoriquota</h3>' +
                  '<div class="es-pres-card-metric">' + data.youth.underInRoster + ' <span class="es-pres-unit">under in rosa (min. ' + data.youth.mandatoryLnd + ')</span></div>' +
                  '<p class="es-pres-card-desc">' + data.youth.academyTotal + ' Atleti nel vivaio · ' + data.youth.underStarters + ' Under titolari · Conformità regolamentare 100%</p>' +
                '</div>' +
                '<div class="es-pres-card-footer"><span>Vivaio &amp; Primavera</span><span>Apri vivaio &rsaquo;</span></div>' +
              '</div>' +

              // Card Sviluppo Atleti
              '<div class="es-pres-card" id="card-pres-dev">' +
                '<div class="es-pres-card-top">' +
                  '<div class="es-pres-icon-box">' + ICONS.growth + '</div>' +
                  '<span class="es-pres-badge es-pres-badge-success">' + data.athleteDevelopment.activeCards + ' Schede</span>' +
                '</div>' +
                '<div>' +
                  '<h3 class="es-pres-card-title">Sviluppo Atleti</h3>' +
                  '<div class="es-pres-card-metric">' + data.athleteDevelopment.activeCards + ' <span class="es-pres-unit">schede attive</span></div>' +
                  '<p class="es-pres-card-desc">Monitoraggio progressivo delle performance dei giovani e schede di valutazione tecnica</p>' +
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
                '<div class="es-pres-card-top"><div class="es-pres-icon-box">' + ICONS.mail + '</div><span class="es-pres-badge es-pres-badge-neutral">' + data.office.mail.unread + ' Nuovi</span></div>' +
                '<div><h4 class="es-pres-card-title">Posta</h4><div class="es-pres-card-metric">' + data.office.mail.unread + ' <span class="es-pres-unit">messaggi non letti</span></div><p class="es-pres-card-desc">Messaggi da agenti FIFA, staff e comunicati federali LND</p></div>' +
                '<div class="es-pres-card-footer"><span>In arrivo</span><span>Apri posta &rsaquo;</span></div>' +
              '</div>' +

              // Sponsor
              '<div class="es-pres-card" id="card-pres-sponsors-screen">' +
                '<div class="es-pres-card-top"><div class="es-pres-icon-box">' + ICONS.award + '</div>' + (data.office.sponsors.alertExpiring > 0 ? '<span class="es-pres-badge es-pres-badge-warning">1 In scadenza</span>' : '<span class="es-pres-badge es-pres-badge-success">4 Attivi</span>') + '</div>' +
                '<div><h4 class="es-pres-card-title">Sponsor</h4><div class="es-pres-card-metric">' + data.office.sponsors.totalIncome + ' <span class="es-pres-unit">ricavi annui</span></div><p class="es-pres-card-desc">' + data.office.sponsors.activeCount + ' Partnership commerciali attive per la stagione</p></div>' +
                '<div class="es-pres-card-footer"><span>Partnership</span><span>Gestione sponsor &rsaquo;</span></div>' +
              '</div>' +

              // Centro Allenamento (Fischietto / Cronometro)
              '<div class="es-pres-card" id="card-pres-training-screen">' +
                '<div class="es-pres-card-top"><div class="es-pres-icon-box">' + ICONS.stopwatch + '</div><span class="es-pres-badge es-pres-badge-success">Regolare</span></div>' +
                '<div><h4 class="es-pres-card-title">Centro Allenamento</h4><div class="es-pres-card-metric">2 <span class="es-pres-unit">campi omologati</span></div><p class="es-pres-card-desc">Staff tecnico qualificato e programma settimanale sedute</p></div>' +
                '<div class="es-pres-card-footer"><span>Sedute &amp; Staff</span><span>Dettagli allenamento &rsaquo;</span></div>' +
              '</div>' +

              // Store POD
              '<div class="es-pres-card" id="card-pres-store">' +
                '<div class="es-pres-card-top"><div class="es-pres-icon-box">' + ICONS.bag + '</div><span class="es-pres-badge es-pres-badge-neutral">POD Attivo</span></div>' +
                '<div><h4 class="es-pres-card-title">Store Ufficiale</h4><div class="es-pres-card-metric">' + data.office.merchandising.ordersCount + ' <span class="es-pres-unit">ordini evasi</span></div><p class="es-pres-card-desc">Merchandising con produzione e spedizione automatica</p></div>' +
                '<div class="es-pres-card-footer"><span>Ricavi ' + data.office.merchandising.revenue + '</span><span>Catalogo store &rsaquo;</span></div>' +
              '</div>' +

              // Stadio
              '<div class="es-pres-card" id="card-pres-stadium-screen">' +
                '<div class="es-pres-card-top"><div class="es-pres-icon-box">' + ICONS.building + '</div><span class="es-pres-badge es-pres-badge-neutral">25.085 Posti</span></div>' +
                '<div><h4 class="es-pres-card-title">Stadio</h4><div class="es-pres-card-metric">4.850 <span class="es-pres-unit">spettatori / gara</span></div><p class="es-pres-card-desc">Tariffe biglietti, capienza certificata e agibilità impianto</p></div>' +
                '<div class="es-pres-card-footer"><span>Pino Zaccheria</span><span>Gestisci impianto &rsaquo;</span></div>' +
              '</div>' +

              // Scouting & Secret List
              '<div class="es-pres-card" id="card-pres-scouting">' +
                '<div class="es-pres-card-top"><div class="es-pres-icon-box">' + ICONS.search + '</div><span class="es-pres-badge es-pres-badge-success">' + data.office.scouting.secretListTalents + ' Talenti</span></div>' +
                '<div><h4 class="es-pres-card-title">Scouting Club</h4><div class="es-pres-card-metric">' + data.office.scouting.secretListTalents + ' <span class="es-pres-unit">profili monitorati</span></div><p class="es-pres-card-desc">' + data.office.scouting.analystReports + ' Report di match analysis archiviati</p></div>' +
                '<div class="es-pres-card-footer"><span>Secret List</span><span>Visualizza scouting &rsaquo;</span></div>' +
              '</div>' +

              // Finanze & Budget
              '<div class="es-pres-card" id="card-pres-finances" style="grid-column: span 2;">' +
                '<div class="es-pres-card-top">' +
                  '<div class="es-pres-icon-box">' + ICONS.card + '</div>' +
                  '<span class="es-pres-badge es-pres-badge-neutral">Accesso Riservato Dirigenza</span>' +
                '</div>' +
                '<div>' +
                  '<h4 class="es-pres-card-title">Finanze &amp; Budget Societario</h4>' +
                  (canSeeFinances ? (
                    '<div class="es-pres-card-metric">' + data.office.finances.cashBalance + ' <span class="es-pres-unit">saldo cassa</span></div>' +
                    '<p class="es-pres-card-desc">Monte ingaggi mensile: ' + data.office.finances.monthlyPayroll + ' · Budget stagionale: ' + data.office.finances.annualBudget + ' (' + data.office.finances.budgetHealth + ')</p>'
                  ) : (
                    '<div class="es-pres-card-metric" style="font-size:1.15rem; color:#94a3b8;">Dati protetti da autorizzazione RBAC</div>' +
                    '<p class="es-pres-card-desc">I dati finanziari dettagliati sono visibili esclusivamente al ruolo Presidente e Tesoriere.</p>'
                  )) +
                '</div>' +
                '<div class="es-pres-card-footer"><span>Bilancio Club</span><span>' + (canSeeFinances ? 'Apri rendiconto completo &rsaquo;' : 'Richiedi accesso &rsaquo;') + '</span></div>' +
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
                '<div class="es-pres-card-top"><div class="es-pres-icon-box">' + ICONS.barChart + '</div><span class="es-pres-badge es-pres-badge-success">' + data.competitions.stats.won + ' Vinte</span></div>' +
                '<div><h3 class="es-pres-card-title">Statistiche Club &amp; Record</h3><div class="es-pres-card-metric">' + data.competitions.stats.played + ' <span class="es-pres-unit">gare disputate</span></div><p class="es-pres-card-desc">Record presenze, gol, assist, strisce e storico campionati</p></div>' +
                '<div class="es-pres-card-footer"><span>Trend: 4V · 1N</span><span>Dettaglio statistiche &rsaquo;</span></div>' +
              '</div>' +

              // Calendario
              '<div class="es-pres-card" id="card-pres-schedule-screen">' +
                '<div class="es-pres-card-top"><div class="es-pres-icon-box">' + ICONS.calendar + '</div><span class="es-pres-badge es-pres-badge-neutral">Prossima Gara</span></div>' +
                '<div><h3 class="es-pres-card-title">' + esc(data.competitions.nextMatch.opponent) + '</h3><div class="es-pres-card-metric" style="font-size:1.15rem;">Taranto FC <span class="es-pres-unit" style="display:block; margin-top:0.25rem;">30 Ago · Ore 15:00</span></div><p class="es-pres-card-desc">Programmazione gare e designazioni arbitrali ufficiali AIA</p></div>' +
                '<div class="es-pres-card-footer"><span>Designazioni AIA</span><span>Calendario completo &rsaquo;</span></div>' +
              '</div>' +

              // Classifica
              '<div class="es-pres-card" id="card-pres-standings-screen">' +
                '<div class="es-pres-card-top"><div class="es-pres-icon-box">' + ICONS.layers + '</div><span class="es-pres-badge es-pres-badge-neutral">Girone H</span></div>' +
                '<div><h3 class="es-pres-card-title">Classifica Campionato</h3><div class="es-pres-card-metric">' + esc(data.position) + ' <span class="es-pres-unit">(' + data.points + ' pt)</span></div><p class="es-pres-card-desc">' + esc(data.standingGap) + '<br>Tabella federale ufficiale con evidenziazione Club</p></div>' +
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
                '<div class="es-pres-card-top"><div class="es-pres-icon-box">' + ICONS.fileText + '</div><span class="es-pres-badge es-pres-badge-success">100% Conforme</span></div>' +
                '<div><h3 class="es-pres-card-title">Tesseramenti &amp; Privacy</h3><p class="es-pres-card-desc" style="font-size:0.85rem; line-height:1.6;">• <b>Tesseramenti Atleti:</b> ' + esc(data.governance.tesseramenti) + '<br>• <b>GDPR Minori:</b> ' + esc(data.governance.gdprUnder18) + '<br>• <b>Certificati BLSD Staff:</b> Tutti i membri dello staff tecnico abilitati</p></div>' +
                '<div class="es-pres-card-footer"><span>Archivio Documentale</span><span>Verifica tessere &rsaquo;</span></div>' +
              '</div>' +

              '<div class="es-pres-card" id="card-pres-gov-deadlines">' +
                '<div class="es-pres-card-top"><div class="es-pres-icon-box">' + ICONS.bell + '</div><span class="es-pres-badge es-pres-badge-warning">1 Scadenza</span></div>' +
                '<div><h3 class="es-pres-card-title">Scadenziario Federale</h3><div style="font-size:0.82rem; color:#cbd5e1; display:flex; flex-direction:column; gap:0.35rem; margin-top:0.4rem;">' +
                  data.governance.federalDeadlines.map(function (d) {
                    return '<div>• <b>' + esc(d.task) + ':</b> <span style="color:' + (d.isWarning ? '#fbbf24' : '#34d399') + ';">' + esc(d.status) + '</span> (' + esc(d.date) + ')</div>';
                  }).join('') +
                '</div></div>' +
                '<div class="es-pres-card-footer"><span>Monitoraggio Adempimenti</span><span>Dettagli scadenze &rsaquo;</span></div>' +
              '</div>' +
            '</div>' +

            // Badge di Fiducia Sobri
            '<div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:0.85rem; margin-top:1rem;">' +
              data.governance.trustBadges.map(function (b) {
                return (
                  '<div style="background:#090e17; border:1px solid rgba(148,163,184,0.15); border-radius:10px; padding:0.85rem; text-align:center;">' +
                    '<div style="font-size:0.82rem; font-weight:700; color:#ffffff; margin-bottom:0.15rem;">' + esc(b.name) + '</div>' +
                    '<div style="font-size:0.72rem; color:#94a3b8;">' + esc(b.desc) + '</div>' +
                  '</div>'
                );
              }).join('') +
            '</div>' +
          '</section>' +

          // 6. Card Upsell SaaS Standard & Sobria
          '<div class="es-pres-upsell-card">' +
            '<div class="es-pres-upsell-content">' +
              '<h3>Funzionalità avanzate per la dirigenza con Elisee Scout Pro</h3>' +
              '<p>Firma digitale contratti, report di match analysis approfonditi e supporto dedicato per la governance societaria.</p>' +
            '</div>' +
            '<div class="es-pres-upsell-actions">' +
              '<button type="button" class="es-pres-btn-primary" id="btn-pres-upgrade-pro">Richiedi Elisee Scout Pro</button>' +
              '<button type="button" class="es-pres-btn-secondary" id="btn-pres-req-support">Contatta supporto club</button>' +
            '</div>' +
          '</div>' +

        '</div>' +
      '</div>'
    );
  }

  // ============================================================
  // RENDER PRINCIPALE
  // ============================================================
  function renderPresidentialSuite() {
    var mount = document.getElementById('es-prd');
    if (!mount) return;

    var data = getPresClubData();

    if (currentView === 'stadium') {
      mount.innerHTML = renderStadiumScreen(data);
    } else if (currentView === 'club-stats') {
      mount.innerHTML = renderClubStatsScreen(data);
    } else if (currentView === 'sponsors') {
      mount.innerHTML = renderSponsorsScreen(data);
    } else if (currentView === 'standings') {
      mount.innerHTML = renderStandingsScreen(data);
    } else if (currentView === 'schedule') {
      mount.innerHTML = renderScheduleScreen(data);
    } else if (currentView === 'training-center') {
      mount.innerHTML = renderTrainingCenterScreen(data);
    } else {
      mount.innerHTML = renderPresidentialOverview(data);
    }

    bindPresidentialEvents();
  }

  function bindPresidentialEvents() {
    var mount = document.getElementById('es-prd');
    if (!mount) return;

    var data = getPresClubData();

    // Pulsante Indietro (go-back) presente su tutte le 6 schermate di dettaglio
    mount.querySelectorAll('[data-action="go-back"]').forEach(function (btn) {
      btn.onclick = function () {
        currentView = 'overview';
        renderPresidentialSuite();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
    });

    // 1. Click su Card Stadio -> Apre schermata Dettaglio Stadio
    var cardStadium = mount.querySelector('#card-pres-stadium-screen');
    if (cardStadium) {
      cardStadium.onclick = function () {
        currentView = 'stadium';
        renderPresidentialSuite();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
    }
    var btnSaveTickets = mount.querySelector('#btn-save-tickets');
    if (btnSaveTickets) {
      btnSaveTickets.onclick = function () {
        var reg = mount.querySelector('#inp-ticket-regular').value;
        var red = mount.querySelector('#inp-ticket-reduced').value;
        data.office.stadium.ticketPriceRegular = reg;
        data.office.stadium.ticketPriceReduced = red;
        savePresClubData(data);
        if (window.showToast) window.showToast('Tariffe biglietteria aggiornate: € ' + reg + ' / € ' + red, 'success');
      };
    }
    var btnReqCap = mount.querySelector('#btn-req-capacity-update');
    if (btnReqCap) {
      btnReqCap.onclick = function () {
        if (window.showToast) window.showToast('Modulo allegato verbale CPV aperto per richiesta variazione capienza', 'info');
      };
    }

    // 2. Click su Card Statistiche Club -> Apre schermata Dettaglio Statistiche
    var cardStats = mount.querySelector('#card-pres-stats-screen');
    if (cardStats) {
      cardStats.onclick = function () {
        currentView = 'club-stats';
        renderPresidentialSuite();
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

    // 3. Click su Card Sponsor -> Apre schermata Dettaglio Sponsor
    var cardSponsors = mount.querySelector('#card-pres-sponsors-screen');
    if (cardSponsors) {
      cardSponsors.onclick = function () {
        currentView = 'sponsors';
        renderPresidentialSuite();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
    }
    var btnAddSponsor = mount.querySelector('#btn-add-sponsor');
    if (btnAddSponsor) {
      btnAddSponsor.onclick = function () {
        if (window.showToast) window.showToast('Modulo inserimento accordo sponsor aperto', 'info');
      };
    }
    var btnBacheca = mount.querySelector('#btn-bacheca-sponsor');
    if (btnBacheca) {
      btnBacheca.onclick = function () {
        if (window.showToast) window.showToast('Bacheca Opportunità Sponsor B2B aperta', 'info');
      };
    }

    // 4. Click su Card Classifica -> Apre schermata Dettaglio Classifica
    var cardStandings = mount.querySelector('#card-pres-standings-screen');
    if (cardStandings) {
      cardStandings.onclick = function () {
        currentView = 'standings';
        renderPresidentialSuite();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
    }

    // 5. Click su Card Calendario -> Apre schermata Dettaglio Calendario
    var cardSchedule = mount.querySelector('#card-pres-schedule-screen');
    if (cardSchedule) {
      cardSchedule.onclick = function () {
        currentView = 'schedule';
        renderPresidentialSuite();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
    }

    // 6. Click su Card Centro Allenamento -> Apre schermata Dettaglio Centro Allenamento
    var cardTraining = mount.querySelector('#card-pres-training-screen');
    if (cardTraining) {
      cardTraining.onclick = function () {
        currentView = 'training-center';
        renderPresidentialSuite();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
    }

    // 2. Barra di Navigazione a Tab con Jump Scroll
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

    // Scrollspy in tempo reale
    function updateScrollspy() {
      if (currentView !== 'overview') return;
      var scrollPos = window.scrollY || window.pageYOffset;
      var tabs = mount.querySelectorAll('.es-pres-nav-btn[data-tab]');
      if (!tabs.length) return;

      var sections = [
        { key: 'governance', el: mount.querySelector('#sec-pres-governance') },
        { key: 'competizioni', el: mount.querySelector('#sec-pres-competizioni') },
        { key: 'ufficio', el: mount.querySelector('#sec-pres-ufficio') },
        { key: 'gestione', el: mount.querySelector('#sec-pres-gestione') }
      ];

      if (scrollPos < 260) {
        tabs.forEach(function (t) { t.classList.toggle('is-active', t.getAttribute('data-tab') === 'panoramica'); });
        return;
      }

      var currentSectionKey = 'panoramica';
      for (var i = 0; i < sections.length; i++) {
        if (sections[i].el) {
          var top = sections[i].el.getBoundingClientRect().top;
          if (top <= 190) {
            currentSectionKey = sections[i].key;
            break;
          }
        }
      }

      tabs.forEach(function (t) {
        t.classList.toggle('is-active', t.getAttribute('data-tab') === currentSectionKey);
      });
    }

    window.removeEventListener('scroll', updateScrollspy);
    window.addEventListener('scroll', updateScrollspy, { passive: true });

    // Rating Rosa Card Modal
    var cardRating = mount.querySelector('#card-pres-rating');
    if (cardRating) {
      cardRating.onclick = function () {
        var html =
          '<p style="color:#cbd5e1; font-size:0.88rem; margin-bottom:1rem;">Analisi tecnica della rosa basata su minutaggio effettivo e parametri federali:</p>' +
          '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.2rem;">' +
            '<div style="background:#040810; border:1px solid rgba(148,163,184,0.18); border-radius:10px; padding:1rem;">' +
              '<div style="font-size:0.72rem; color:#94a3b8; font-weight:700;">INDICE RENDIMENTO ROSA</div>' +
              '<div style="font-size:1.6rem; font-weight:800; color:#38bdf8;">' + data.squadRating.score + ' <span class="es-pres-unit">/ 100</span></div>' +
            '</div>' +
            '<div style="background:#040810; border:1px solid rgba(148,163,184,0.18); border-radius:10px; padding:1rem;">' +
              '<div style="font-size:0.72rem; color:#94a3b8; font-weight:700;">VALORE SCOUTING INTERNO</div>' +
              '<div style="font-size:1.6rem; font-weight:800; color:#38bdf8;">' + data.squadRating.marketValue + '</div>' +
            '</div>' +
          '</div>' +
          '<div style="color:#94a3b8; font-size:0.82rem;">• Età media: <b>' + data.squadRating.avgAge + '</b><br>• Copertura minutaggio: <b>' + data.squadRating.minutesCoverage + '</b><br>• Atleti in organico: <b>' + data.squadRating.totalPlayers + '</b></div>';
        openDetailModal('Rating Rosa & Parametri Tecnici', ICONS.users, html);
      };
    }

    // Trattative Card Modal
    var cardTransfers = mount.querySelector('#card-pres-transfers');
    if (cardTransfers) {
      cardTransfers.onclick = function () {
        var listHtml = data.transfers.items.map(function (t) {
          return (
            '<div style="background:#040810; border:1px solid rgba(148,163,184,0.15); border-radius:10px; padding:0.85rem 1rem; margin-bottom:0.6rem; display:flex; justify-content:space-between; align-items:center;">' +
              '<div><h4 style="font-size:0.95rem; font-weight:700; color:#fff; margin:0;">' + esc(t.player) + ' (' + esc(t.role) + ')</h4><div style="font-size:0.78rem; color:#94a3b8; margin-top:0.15rem;">Club: ' + esc(t.club) + ' · Tipo: ' + esc(t.type) + '</div></div>' +
              '<span class="es-pres-badge es-pres-badge-success">' + esc(t.status) + '</span>' +
            '</div>'
          );
        }).join('');
        openDetailModal('Trattative di Mercato & Svincoli', ICONS.arrows, listHtml);
      };
    }

    // Staff Tecnico Card Modal
    var cardStaff = mount.querySelector('#card-pres-staff');
    if (cardStaff) {
      cardStaff.onclick = function () {
        var listHtml = data.staff.members.map(function (m) {
          return (
            '<div style="background:#040810; border:1px solid rgba(148,163,184,0.15); border-radius:10px; padding:0.85rem 1rem; margin-bottom:0.55rem; display:flex; justify-content:space-between; align-items:center;">' +
              '<div><h5 style="font-size:0.92rem; font-weight:700; color:#fff; margin:0;">' + esc(m.name) + '</h5><div style="font-size:0.75rem; color:#38bdf8;">' + esc(m.role) + ' (' + esc(m.patent) + ') · Scadenza: ' + esc(m.contractExp) + '</div></div>' +
              '<span class="' + (m.isWarning ? 'es-pres-badge es-pres-badge-warning' : 'es-pres-badge es-pres-badge-success') + '">' + esc(m.status) + '</span>' +
            '</div>'
          );
        }).join('');
        openDetailModal('Organigramma Staff Tecnico', ICONS.briefcase, listHtml);
      };
    }

    // Finanze Card Modal
    var cardFinances = mount.querySelector('#card-pres-finances');
    if (cardFinances) {
      cardFinances.onclick = function () {
        if (!hasFinanceAccess()) {
          alert('Accesso Riservato: Questa sezione è protetta e visibile solo a Presidente e Tesoriere.');
          return;
        }
        var html =
          '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.2rem;">' +
            '<div style="background:#040810; border:1px solid rgba(148,163,184,0.18); border-radius:10px; padding:1rem;">' +
              '<div style="font-size:0.72rem; color:#94a3b8; font-weight:700;">SALDO CASSA ATTUALE</div>' +
              '<div style="font-size:1.6rem; font-weight:800; color:#38bdf8;">' + data.office.finances.cashBalance + '</div>' +
            '</div>' +
            '<div style="background:#040810; border:1px solid rgba(148,163,184,0.18); border-radius:10px; padding:1rem;">' +
              '<div style="font-size:0.72rem; color:#94a3b8; font-weight:700;">MONTE INGAGGI MENSILE</div>' +
              '<div style="font-size:1.6rem; font-weight:800; color:#cbd5e1;">' + data.office.finances.monthlyPayroll + '</div>' +
            '</div>' +
          '</div>' +
          '<div style="color:#cbd5e1; font-size:0.85rem; line-height:1.6;">' +
            '• <b>Budget Totale Stagionale:</b> ' + data.office.finances.annualBudget + '<br>' +
            '• <b>Stato del Bilancio:</b> <span style="color:#34d399;">' + data.office.finances.budgetHealth + '</span><br>' +
            '• <b>Copertura Sponsor:</b> ' + data.office.sponsors.totalIncome + ' (' + data.office.sponsors.activeCount + ' Sponsor Ufficiali)' +
          '</div>';
        openDetailModal('Finanze & Budget Societario', ICONS.card, html);
      };
    }

    // Posta Card Modal
    var cardMail = mount.querySelector('#card-pres-mail');
    if (cardMail) {
      cardMail.onclick = function () {
        var listHtml = data.office.mail.items.map(function (m) {
          return (
            '<div style="background:#040810; border:1px solid rgba(148,163,184,0.15); border-radius:10px; padding:0.85rem 1rem; margin-bottom:0.6rem;">' +
              '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.25rem;"><span style="font-size:0.75rem; font-weight:700; color:#38bdf8;">' + esc(m.from) + '</span><span style="font-size:0.72rem; color:#94a3b8;">' + esc(m.date) + '</span></div>' +
              '<h5 style="font-size:0.92rem; font-weight:700; color:#ffffff; margin:0;">' + esc(m.subject) + '</h5>' +
            '</div>'
          );
        }).join('');
        openDetailModal('Posta Societaria Ufficiale', ICONS.mail, listHtml);
      };
    }

    // CTA Bottoni
    var btnUpgrade = mount.querySelector('#btn-pres-upgrade-pro');
    if (btnUpgrade) {
      btnUpgrade.onclick = function () {
        if (window.showToast) window.showToast('Modulo di attivazione Elisee Scout Pro aperto', 'success');
      };
    }
    var btnSupport = mount.querySelector('#btn-pres-req-support');
    if (btnSupport) {
      btnSupport.onclick = function () {
        if (window.showToast) window.showToast('Canale di supporto diretto aperto', 'info');
      };
    }
  }

  // Modale Generica
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
    isPres: isExecutive
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
