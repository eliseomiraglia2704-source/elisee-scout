/* ============================================================
   ELISEE SCOUT — AREA PRESIDENTE (PRESIDENTIAL DASHBOARD B2B)
   Dashboard gestionale per Presidenti e Alta Dirigenza di club dilettantistici.
   Include le 6 schermate di dettaglio:
   1. Stadio
   2. Statistiche Club (Record di Club & Storico di Lega)
   3. Sponsor (Main, Tecnico, Impianto)
   4. Classifica (Standings con evidenziazione Club)
   5. Calendario (Schedule con designazioni AIA)
   6. Centro Allenamento (Staff qualificato & Piano settimanale)
   ============================================================ */
(function () {
  'use strict';

  var currentView = 'overview'; // 'overview' | 'stadium' | 'club-stats' | 'sponsors' | 'standings' | 'schedule' | 'training-center'
  var statsActiveTab = 'records'; // 'records' | 'history'

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
      clubName: u.squadra || u.club || 'Foggia Calcio 1920',
      category: 'Serie D · Girone H',
      season: 'Stagione 2026/27',
      matchDay: '28ª Giornata',
      position: '2° Posto',
      points: 62,
      standingGap: '-2 pt dalla vetta (1° Brindisi 64 pt)',
      affiliationStatus: 'Attivo / FIGC LND Verified',
      logoUrl: 'immagini/squadre-loghi/foggia.png',
      presName: (u.nome ? (u.nome + ' ' + (u.cognome || '')) : (u.name || 'The King (Eliseo Miraglia)')).trim(),
      presRole: 'Presidente & Amministratore Club',
      
      // 1. Gestione Club
      squadRating: {
        score: '84.6',
        avgAge: '23.4 anni',
        minutesCoverage: '88% minutaggio titolari',
        marketValue: '€ 1.450.000 (Stima tecnica interna)',
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
          { role: 'Allenatore Prima Squadra', name: 'Mister Mario Somma', patent: 'UEFA Pro', contractExp: '30/06/2027', status: 'Regolare' },
          { role: 'Vice Allenatore', name: 'Giuseppe Russo', patent: 'UEFA A', contractExp: '30/06/2027', status: 'Regolare' },
          { role: 'Direttore Sportivo', name: 'Antonio Gentile', patent: 'Dirigente Sportivo FIGC', contractExp: '15/10/2026', status: '⚠️ In scadenza (45gg)' },
          { role: 'Preparatore Atletico', name: 'Luca Rossi', patent: 'Prep. Atletico Prof. FIGC', contractExp: '30/06/2027', status: 'Regolare' },
          { role: 'Preparatore Portieri', name: 'Francesco Mancini', patent: 'Patentino Portieri FIGC', contractExp: '30/06/2027', status: 'Regolare' },
          { role: 'Fisioterapista', name: 'Dott. Alessandro Neri', patent: 'Laurea Fisioterapia / Albo TSRM', contractExp: '30/06/2027', status: 'Regolare' },
          { role: 'Medico Sociale', name: 'Dott. Valerio Bianchi', patent: 'Medico Chirurgo / Spec. Med. Sport', contractExp: '30/06/2027', status: 'Regolare' },
          { role: 'Match Analyst', name: 'Roberto Esposito', patent: 'Corso Match Analysis FIGC Coverciano', contractExp: '30/06/2027', status: 'Regolare' }
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
            main: { name: 'Banca Popolare di Puglia', tier: 'Main Sponsor Maglia', value: '€ 25.000,00', expiry: '30/06/2027', doc: 'Accordo_MainSponsor_2026.pdf', status: 'Attivo' },
            tech: { name: 'Givova Sport', tier: 'Sponsor Tecnico Ufficiale', value: '€ 12.000,00 (Fornitura Kit Gara)', expiry: '30/06/2027', doc: 'Convenzione_Tecnica_Givova.pdf', status: 'Attivo' },
            facility: { name: 'AutoPuglia Concessionaria', tier: 'Official Mobility Partner & Impianto', value: '€ 5.000,00', expiry: '30/09/2026', doc: 'Cartellonistica_Zaccheria.pdf', status: '⚠️ Rinnovo in scadenza' }
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
          capacity: '25.085 posti a sedere certificati',
          avgAttendance: '4.850 spettatori / gara (Registrati nelle ultime 14 gare casalinghe)',
          safetyStatus: 'Valido (Omologazione FIGC Serie D)',
          lastInspectionDate: '12 Agosto 2026 (Verbale CPV Positivo)'
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
          budgetHealth: 'Bilancio in pareggio (+€ 6.300 di margine stagionale)'
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
          { season: '2024/25', league: 'Eccellenza Pugliese', pos: '1° Posto', pts: 72, note: '🏆 Promozione in Serie D' },
          { season: '2023/24', league: 'Eccellenza Pugliese', pos: '2° Posto', pts: 65, note: 'Finalista Playoff' },
          { season: '2022/23', league: 'Serie D · Girone H', pos: '8° Posto', pts: 48, note: 'Salvezza tranquilla' }
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
        { day: 'Martedì (Ripresa)', time: '15:00 - 17:30', pitch: 'Campo A (Erba)', focus: 'Attivazione preventiva, carico aerobico & forza funzionale', attendance: '27/28 Presenti' },
        { day: 'Mercoledì (Doppia Seduta)', time: '10:00 & 15:30', pitch: 'Campo A / Palestra', focus: 'Possesso palla, transizioni veloci & combinazioni offensive', attendance: '28/28 Presenti' },
        { day: 'Giovedì (Tattica & Partitella)', time: '15:00 - 18:00', pitch: 'Campo A (Erba)', focus: 'Partitella a ranghi contrapposti con focus su avversario domenicale', attendance: '26/28 Presenti (2 differenziati)' },
        { day: 'Venerdì (Palle Inattive)', time: '15:00 - 17:00', pitch: 'Campo A (Erba)', focus: 'Schemi da calcio piazzato offensivi/difensivi & reattività', attendance: '28/28 Presenti' },
        { day: 'Sabato (Rifinitura)', time: '10:30 - 12:00', pitch: 'Campo A (Erba)', focus: 'Rifinitura tattica, velocità e lista convocati ufficiale', attendance: '28/28 Presenti' }
      ],

      // 5. Conformità & Governance
      governance: {
        tesseramenti: '28 / 28 Tesserati Attivi (100% in regola con visita medica)',
        gdprUnder18: '100% Consensi Genitoriali depositati con firma digitale',
        federalDeadlines: [
          { task: 'Iscrizione Campionato LND 2026/27', status: 'Regolarizzata', date: 'Completato' },
          { task: 'Deposito Fideiussione Bancaria', status: 'Approvata FIGC', date: 'Completato' },
          { task: 'Rinnovo Idoneità Agonistica 3 Atleti', status: '⚠️ In scadenza entro 20gg', date: '15/09/2026' }
        ],
        trustBadges: [
          { name: 'GDPR Compliance', desc: 'Dati Atleti & Minori Protetti' },
          { name: 'FIGC Legal Verified', desc: 'Matricola e Statuto Conforme' },
          { name: 'Video Scouting Safe', desc: 'Liberatorie Immagini Depositate' },
          { name: '2FA Auth Enabled', desc: 'Protezione Accessi Dirigenziali' }
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
  // SCHERMATE DI DETTAGLIO DEDICATE (6 SCHERMATE)
  // ============================================================

  // 1. Schermata Dettaglio: STADIO
  function renderStadiumScreen(data) {
    return (
      '<div class="es-pres-detail-screen">' +
        '<div class="es-pres-detail-emerald-header">' +
          '<h2>🏟️ Stadio &amp; Impianto Sportivo</h2>' +
          '<p>Gestisci i dati e le condizioni del tuo impianto sportivo</p>' +
        '</div>' +

        '<div class="es-pres-detail-body">' +
          '<div class="es-pres-grid-2">' +
            // Prezzo Biglietto Editabile Reale
            '<div class="es-pres-detail-box">' +
              '<h3>🎟️ Tariffe Biglietteria Ufficiale</h3>' +
              '<p style="color:#94a3b8; font-size:0.85rem; margin-top:-0.5rem; margin-bottom:1.2rem;">Prezzo effettivamente praticato dal club al botteghino per le gare casalinghe.</p>' +
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
              '<button type="button" class="es-pres-btn-pro" id="btn-save-tickets">Salva Tariffe Ufficiali</button>' +
            '</div>' +

            // Capienza Stadio & Agibilità Certificata
            '<div class="es-pres-detail-box">' +
              '<h3>🏛️ Capienza &amp; Omologazione Impianto</h3>' +
              '<div style="background:#090e17; border:1px solid rgba(148,163,184,0.2); border-radius:14px; padding:1.1rem; margin-bottom:1.2rem;">' +
                '<div style="font-size:0.75rem; color:#94a3b8; font-weight:800; text-transform:uppercase;">CAPIENZA UFFICIALE CERTIFICATA</div>' +
                '<div style="font-size:1.8rem; font-weight:900; color:#38bdf8; margin:0.3rem 0;">' + esc(data.office.stadium.capacity) + '</div>' +
                '<p style="font-size:0.8rem; color:#64748b; margin:0;">Dato anagrafico non modificabile arbitrariamente: aggiornabile solo previa delibera CPV / FIGC.</p>' +
              '</div>' +
              '<button type="button" class="es-pres-btn-compliance" id="btn-req-capacity-update">Richiedi variazione con verbale CPV</button>' +
            '</div>' +
          '</div>' +

          '<div class="es-pres-grid-2">' +
            // Media Spettatori Stagionale Reale
            '<div class="es-pres-detail-box">' +
              '<h3>👥 Media Spettatori Stagionale</h3>' +
              '<div style="font-size:2.2rem; font-weight:900; color:#2dd4bf; margin-bottom:0.4rem;">4.850 <span style="font-size:1rem; color:#94a3b8;">spettatori / gara</span></div>' +
              '<p style="color:#cbd5e1; font-size:0.88rem; line-height:1.5;">Calcolata su presenze e biglietti reali registrati nelle 14 partite casalinghe ufficiali.</p>' +
              '<div style="font-size:0.82rem; color:#94a3b8; margin-top:0.8rem;">• Record stagionale: <b>12.450 spettatori</b> (Derby di Puglia)<br>• Tasso di riempimento medio: <b>19.3% capienza massima</b></div>' +
            '</div>' +

            // Stato Agibilità & Sicurezza
            '<div class="es-pres-detail-box">' +
              '<h3>🛡️ Stato Agibilità &amp; Controlli Sicurezza</h3>' +
              '<div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.8rem;">' +
                '<span class="es-pres-badge es-pres-badge-status" style="font-size:0.85rem; padding:0.35rem 0.85rem;">🟢 ' + esc(data.office.stadium.safetyStatus) + '</span>' +
              '</div>' +
              '<p style="color:#cbd5e1; font-size:0.88rem; line-height:1.5;">• <b>Ultimo Controllo di Sicurezza:</b> ' + esc(data.office.stadium.lastInspectionDate) + '<br>• <b>Impianto di Videosorveglianza:</b> Conforme alle direttive prefettizie<br>• <b>Servizio DAE &amp; Medico:</b> 2 Postazioni BLSD omologate</p>' +
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
        '<div class="es-pres-detail-emerald-header">' +
          '<h2>📊 Statistiche Club &amp; Record Storici</h2>' +
          '<p>Rendimento statistico ufficiale, record societari e storico di campionato</p>' +
        '</div>' +

        '<div style="display:flex; justify-content:center; gap:0.8rem; margin-bottom:1.8rem;">' +
          '<button type="button" class="es-pres-nav-btn ' + (statsActiveTab === 'records' ? 'is-active' : '') + '" id="btn-tab-records">⭐ Record di Club</button>' +
          '<button type="button" class="es-pres-nav-btn ' + (statsActiveTab === 'history' ? 'is-active' : '') + '" id="btn-tab-history">📜 Storico di Lega</button>' +
        '</div>' +

        '<div class="es-pres-detail-body">' +
          (statsActiveTab === 'records' ? (
            '<div class="es-pres-grid-3">' +
              '<div class="es-pres-detail-box">' +
                '<h3>🏃 Presenze Record</h3>' +
                '<div style="font-size:1.6rem; font-weight:900; color:#38bdf8;">' + esc(data.competitions.clubRecords.mostAppearances.player) + '</div>' +
                '<p style="color:#94a3b8; font-size:0.88rem; margin-top:0.3rem;">' + esc(data.competitions.clubRecords.mostAppearances.count) + '</p>' +
              '</div>' +

              '<div class="es-pres-detail-box">' +
                '<h3>⚽ Gol in una Stagione</h3>' +
                '<div style="font-size:1.6rem; font-weight:900; color:#2dd4bf;">' + esc(data.competitions.clubRecords.mostGoalsSeason.player) + '</div>' +
                '<p style="color:#94a3b8; font-size:0.88rem; margin-top:0.3rem;">' + esc(data.competitions.clubRecords.mostGoalsSeason.count) + '</p>' +
              '</div>' +

              '<div class="es-pres-detail-box">' +
                '<h3>🎯 Assist Record</h3>' +
                '<div style="font-size:1.6rem; font-weight:900; color:#facc15;">' + esc(data.competitions.clubRecords.mostAssists.player) + '</div>' +
                '<p style="color:#94a3b8; font-size:0.88rem; margin-top:0.3rem;">' + esc(data.competitions.clubRecords.mostAssists.count) + '</p>' +
              '</div>' +

              '<div class="es-pres-detail-box">' +
                '<h3>🔥 Striscia Vittorie</h3>' +
                '<div style="font-size:1.6rem; font-weight:900; color:#4ade80;">' + esc(data.competitions.clubRecords.winStreak) + '</div>' +
                '<p style="color:#94a3b8; font-size:0.88rem; margin-top:0.3rem;">Record imbattibilità stagionale</p>' +
              '</div>' +

              '<div class="es-pres-detail-box">' +
                '<h3>🏆 Miglior Vittoria</h3>' +
                '<div style="font-size:1.6rem; font-weight:900; color:#ffffff;">' + esc(data.competitions.clubRecords.bestWin) + '</div>' +
                '<p style="color:#f87171; font-size:0.88rem; margin-top:0.3rem;">Peggior sconfitta: ' + esc(data.competitions.clubRecords.worstDefeat) + '</p>' +
              '</div>' +

              '<div class="es-pres-detail-box">' +
                '<h3>🏟️ Presenza Record Stadio</h3>' +
                '<div style="font-size:1.6rem; font-weight:900; color:#38bdf8;">12.450</div>' +
                '<p style="color:#94a3b8; font-size:0.88rem; margin-top:0.3rem;">' + esc(data.competitions.clubRecords.recordAttendance) + '</p>' +
              '</div>' +
            '</div>' +

            '<div class="es-pres-detail-box" style="margin-top:1.2rem;">' +
              '<h3>🎖️ Tesseramento più Significativo</h3>' +
              '<p style="color:#cbd5e1; font-size:0.95rem;"><b>' + esc(data.competitions.clubRecords.keySigning) + '</b>: operazione tecnica di rilievo che ha consolidato la leadership dello spogliatoio e l\'identità societaria.</p>' +
            '</div>'
          ) : (
            '<div class="es-pres-detail-box">' +
              '<h3>📜 Storico Posizionamenti in Lega</h3>' +
              '<div class="es-pres-table-wrap">' +
                '<table class="es-pres-table">' +
                  '<thead><tr><th>Stagione</th><th>Campionato</th><th>Posizione</th><th>Punti</th><th>Esito / Note</th></tr></thead>' +
                  '<tbody>' +
                    data.competitions.leagueHistory.map(function (h) {
                      return (
                        '<tr>' +
                          '<td><b>' + esc(h.season) + '</b></td>' +
                          '<td>' + esc(h.league) + '</td>' +
                          '<td style="color:#38bdf8; font-weight:800;">' + esc(h.pos) + '</td>' +
                          '<td><b>' + esc(h.pts) + '</b> pt</td>' +
                          '<td><span class="es-pres-badge es-pres-badge-cat">' + esc(h.note) + '</span></td>' +
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
        '<div class="es-pres-detail-emerald-header">' +
          '<h2>🤝 Sponsor &amp; Partnership Commerciali</h2>' +
          '<p>Gestisci gli accordi commerciali, sponsor di maglia e spazi pubblicitari</p>' +
        '</div>' +

        '<div class="es-pres-detail-body">' +
          '<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; margin-bottom:0.5rem;">' +
            '<div style="font-size:1.1rem; font-weight:800; color:#fff;">3 Categorie di Sponsor Ufficiali</div>' +
            '<div style="display:flex; gap:0.75rem;">' +
              '<button type="button" class="es-pres-btn-pro" id="btn-add-sponsor">+ Inserisci Nuovo Accordo</button>' +
              '<button type="button" class="es-pres-btn-compliance" id="btn-bacheca-sponsor">Bacheca Opportunità B2B</button>' +
            '</div>' +
          '</div>' +

          '<div class="es-pres-grid-3">' +
            // Main Sponsor
            '<div class="es-pres-detail-box">' +
              '<div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem;">' +
                '<span class="es-pres-badge es-pres-badge-gold">Main Sponsor Maglia</span>' +
                '<span class="es-pres-badge es-pres-badge-status">' + esc(sp.main.status) + '</span>' +
              '</div>' +
              '<h4 style="font-size:1.35rem; font-weight:900; color:#fff; margin:0 0 0.4rem;">' + esc(sp.main.name) + '</h4>' +
              '<p style="color:#94a3b8; font-size:0.85rem; margin-bottom:1rem;">' + esc(sp.main.tier) + '</p>' +
              '<div style="background:#090e17; border-radius:12px; padding:0.9rem; margin-bottom:1rem;">' +
                '<div style="font-size:0.75rem; color:#94a3b8;">VALORE CONTRATTUALE</div>' +
                '<div style="font-size:1.4rem; font-weight:800; color:#2dd4bf;">' + (canSeeFinances ? esc(sp.main.value) : '🔒 Riservato') + '</div>' +
              '</div>' +
              '<div style="font-size:0.8rem; color:#cbd5e1;">• Scadenza: <b>' + esc(sp.main.expiry) + '</b><br>• Documento: 📄 <a href="#" style="color:#38bdf8;">' + esc(sp.main.doc) + '</a></div>' +
            '</div>' +

            // Tech Sponsor
            '<div class="es-pres-detail-box">' +
              '<div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem;">' +
                '<span class="es-pres-badge es-pres-badge-cat">Sponsor Tecnico</span>' +
                '<span class="es-pres-badge es-pres-badge-status">' + esc(sp.tech.status) + '</span>' +
              '</div>' +
              '<h4 style="font-size:1.35rem; font-weight:900; color:#fff; margin:0 0 0.4rem;">' + esc(sp.tech.name) + '</h4>' +
              '<p style="color:#94a3b8; font-size:0.85rem; margin-bottom:1rem;">' + esc(sp.tech.tier) + '</p>' +
              '<div style="background:#090e17; border-radius:12px; padding:0.9rem; margin-bottom:1rem;">' +
                '<div style="font-size:0.75rem; color:#94a3b8;">VALORE FORNITURA / ACCORDO</div>' +
                '<div style="font-size:1.4rem; font-weight:800; color:#38bdf8;">' + (canSeeFinances ? esc(sp.tech.value) : '🔒 Riservato') + '</div>' +
              '</div>' +
              '<div style="font-size:0.8rem; color:#cbd5e1;">• Scadenza: <b>' + esc(sp.tech.expiry) + '</b><br>• Documento: 📄 <a href="#" style="color:#38bdf8;">' + esc(sp.tech.doc) + '</a></div>' +
            '</div>' +

            // Facility Sponsor
            '<div class="es-pres-detail-box">' +
              '<div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem;">' +
                '<span class="es-pres-badge es-pres-badge-cat">Sponsor Impianto</span>' +
                '<span class="es-pres-card-alert-badge">' + esc(sp.facility.status) + '</span>' +
              '</div>' +
              '<h4 style="font-size:1.35rem; font-weight:900; color:#fff; margin:0 0 0.4rem;">' + esc(sp.facility.name) + '</h4>' +
              '<p style="color:#94a3b8; font-size:0.85rem; margin-bottom:1rem;">' + esc(sp.facility.tier) + '</p>' +
              '<div style="background:#090e17; border-radius:12px; padding:0.9rem; margin-bottom:1rem;">' +
                '<div style="font-size:0.75rem; color:#94a3b8;">VALORE ANNUO</div>' +
                '<div style="font-size:1.4rem; font-weight:800; color:#facc15;">' + (canSeeFinances ? esc(sp.facility.value) : '🔒 Riservato') + '</div>' +
              '</div>' +
              '<div style="font-size:0.8rem; color:#cbd5e1;">• Scadenza: <b style="color:#fca5a5;">' + esc(sp.facility.expiry) + ' (tra 35 giorni)</b><br>• Documento: 📄 <a href="#" style="color:#38bdf8;">' + esc(sp.facility.doc) + '</a></div>' +
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
        '<div class="es-pres-detail-emerald-header">' +
          '<h2>🏆 Classifica Ufficiale di Campionato</h2>' +
          '<p>Dati e posizionamenti aggiornati ai referti ufficiali FIGC / LND</p>' +
        '</div>' +

        '<div class="es-pres-detail-body">' +
          '<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; margin-bottom:0.5rem;">' +
            '<div style="display:flex; align-items:center; gap:0.6rem;">' +
              '<span style="font-size:0.88rem; font-weight:800; color:#94a3b8;">SELEZIONA CAMPIONATO:</span>' +
              '<select class="es-pres-input-text" style="padding:0.4rem 0.8rem; font-size:0.85rem;">' +
                '<option selected>' + esc(data.category) + '</option>' +
                '<option>Eccellenza Pugliese · Girone Unico</option>' +
                '<option>Juniores Under 19 Nazionale</option>' +
              '</select>' +
            '</div>' +
            '<span class="es-pres-badge es-pres-badge-status">Fonte: Comunicato Ufficiale LND</span>' +
          '</div>' +

          '<div class="es-pres-detail-box" style="padding:1.2rem;">' +
            '<div class="es-pres-table-wrap">' +
              '<table class="es-pres-table">' +
                '<thead>' +
                  '<tr>' +
                    '<th style="width:50px;">Pos</th>' +
                    '<th>Squadra</th>' +
                    '<th style="text-align:center;">G</th>' +
                    '<th style="text-align:center;">V</th>' +
                    '<th style="text-align:center;">P</th>' +
                    '<th style="text-align:center;">S</th>' +
                    '<th style="text-align:center;">GF</th>' +
                    '<th style="text-align:center;">GS</th>' +
                    '<th style="text-align:center;">DR</th>' +
                    '<th style="text-align:center; font-size:0.85rem; color:#38bdf8;">PT</th>' +
                  '</tr>' +
                '</thead>' +
                '<tbody>' +
                  data.competitions.standingsTable.map(function (row) {
                    var isMyTeam = row.isUser;
                    return (
                      '<tr class="' + (isMyTeam ? 'is-my-club' : '') + '">' +
                        '<td style="font-weight:900; font-size:1rem; color:' + (row.pos <= 2 ? '#38bdf8' : (row.pos <= 5 ? '#2dd4bf' : '#94a3b8')) + ';">' + row.pos + '</td>' +
                        '<td>' +
                          '<div style="display:flex; align-items:center; gap:0.6rem;">' +
                            (isMyTeam ? '⭐ ' : '') +
                            '<b>' + esc(row.team) + '</b>' +
                            (isMyTeam ? ' <span class="es-pres-badge es-pres-badge-gold" style="font-size:0.65rem;">IL TUO CLUB</span>' : '') +
                          '</div>' +
                        '</td>' +
                        '<td style="text-align:center;">' + row.played + '</td>' +
                        '<td style="text-align:center; color:#4ade80; font-weight:700;">' + row.won + '</td>' +
                        '<td style="text-align:center; color:#94a3b8;">' + row.drawn + '</td>' +
                        '<td style="text-align:center; color:#f87171;">' + row.lost + '</td>' +
                        '<td style="text-align:center;">' + row.gf + '</td>' +
                        '<td style="text-align:center;">' + row.ga + '</td>' +
                        '<td style="text-align:center; color:' + (row.gd.startsWith('+') ? '#4ade80' : '#f87171') + ';">' + row.gd + '</td>' +
                        '<td style="text-align:center; font-size:1.15rem; font-weight:900; color:#38bdf8;">' + row.pts + '</td>' +
                      '</tr>'
                    );
                  }).join('') +
                '</tbody>' +
              '</table>' +
            '</div>' +
            '<div style="display:flex; gap:1.5rem; margin-top:1rem; font-size:0.75rem; color:#94a3b8;">' +
              '<span>🔵 1° Posto: Promozione Diretta in Serie C</span>' +
              '<span>🟢 2°-5° Posto: Playoff Promozione</span>' +
              '<span>🔴 13°-16° Posto: Playout Salvezza</span>' +
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
        '<div class="es-pres-detail-emerald-header">' +
          '<h2>📅 Calendario Gare &amp; Designazioni AIA</h2>' +
          '<p>Programmazione incontri, esiti ufficiali e designazioni arbitrali</p>' +
        '</div>' +

        '<div class="es-pres-detail-body">' +
          '<div class="es-pres-detail-box" style="padding:1.4rem;">' +
            '<div style="display:flex; flex-direction:column; gap:0.75rem;">' +
              data.competitions.scheduleMatches.map(function (m) {
                var borderCol = m.status === 'W' ? '#4ade80' : (m.status === 'D' ? '#94a3b8' : (m.status === 'L' ? '#ef4444' : '#38bdf8'));
                return (
                  '<div style="background:#090e17; border:1px solid rgba(148,163,184,0.2); border-left:4px solid ' + borderCol + '; border-radius:14px; padding:1rem 1.2rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; cursor:pointer;" class="es-pres-schedule-row">' +
                    '<div style="display:flex; align-items:center; gap:1.2rem;">' +
                      '<span class="es-pres-badge ' + (m.type === 'H' ? 'es-pres-badge-cat' : 'es-pres-badge-status') + '" style="font-size:0.75rem;">' + (m.type === 'H' ? 'CASA (H)' : 'TRASFERTA (A)') + '</span>' +
                      '<div>' +
                        '<div style="font-size:1.05rem; font-weight:800; color:#fff;">' + esc(m.round) + ' · vs ' + esc(m.opponent) + '</div>' +
                        '<div style="font-size:0.78rem; color:#94a3b8; margin-top:0.2rem;">📅 ' + esc(m.date) + (m.referee ? (' · ⚖️ ' + esc(m.referee)) : '') + '</div>' +
                      '</div>' +
                    '</div>' +
                    '<div style="display:flex; align-items:center; gap:1rem;">' +
                      '<div style="font-size:1.35rem; font-weight:900; color:' + (m.status === 'NEXT' ? '#38bdf8' : '#ffffff') + ';">' + esc(m.res) + '</div>' +
                      (m.status === 'W' ? '<span class="es-pres-badge es-pres-badge-status">Vittoria</span>' :
                       m.status === 'D' ? '<span class="es-pres-badge" style="background:rgba(148,163,184,0.2); color:#cbd5e1;">Pareggio</span>' :
                       m.status === 'L' ? '<span class="es-pres-card-alert-badge">Sconfitta</span>' :
                       '<span class="es-pres-badge es-pres-badge-cat">Prossima Gara</span>') +
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
        '<div class="es-pres-detail-emerald-header">' +
          '<h2>⚡ Centro Sportivo &amp; Staff Tecnico</h2>' +
          '<p>Programma settimanale degli allenamenti, presenze atleti e qualifiche federali staff</p>' +
        '</div>' +

        '<div class="es-pres-detail-body">' +
          // Staff Tecnico e Patentini Federali
          '<div class="es-pres-detail-box">' +
            '<h3>👨‍🏫 Staff Tecnico &amp; Qualifiche Ufficiali FIGC</h3>' +
            '<p style="color:#94a3b8; font-size:0.85rem; margin-top:-0.5rem; margin-bottom:1.2rem;">Anagrafica reale e patentini federali omologati per la stagione in corso.</p>' +
            '<div class="es-pres-grid-2">' +
              data.staff.members.map(function (m) {
                return (
                  '<div style="background:#090e17; border:1px solid rgba(148,163,184,0.2); border-radius:14px; padding:0.9rem 1.1rem; display:flex; justify-content:space-between; align-items:center;">' +
                    '<div>' +
                      '<div style="font-size:0.95rem; font-weight:800; color:#fff;">' + esc(m.name) + '</div>' +
                      '<div style="font-size:0.78rem; color:#2dd4bf; margin-top:0.15rem;">' + esc(m.role) + '</div>' +
                      '<div style="font-size:0.72rem; color:#94a3b8; margin-top:0.2rem;">🎖️ Qualifica: <b>' + esc(m.patent || 'Patentino FIGC') + '</b></div>' +
                    '</div>' +
                    '<span class="' + (m.status.includes('scadenza') ? 'es-pres-card-alert-badge' : 'es-pres-badge es-pres-badge-status') + '">' + esc(m.status) + '</span>' +
                  '</div>'
                );
              }).join('') +
            '</div>' +
          '</div>' +

          // Piano di Lavoro Settimanale Reale
          '<div class="es-pres-detail-box">' +
            '<h3>📋 Piano di Lavoro Settimanale &amp; Presenze</h3>' +
            '<div style="display:flex; flex-direction:column; gap:0.75rem;">' +
              data.trainingWeek.map(function (tw) {
                return (
                  '<div style="background:#090e17; border:1px solid rgba(148,163,184,0.18); border-radius:14px; padding:1.1rem 1.3rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">' +
                    '<div>' +
                      '<div style="font-size:1.05rem; font-weight:900; color:#38bdf8;">' + esc(tw.day) + ' <span style="font-size:0.85rem; color:#94a3b8; font-weight:600;">(' + esc(tw.time) + ')</span></div>' +
                      '<div style="font-size:0.88rem; color:#cbd5e1; margin-top:0.35rem;">🎯 <b>Obiettivo seduta:</b> ' + esc(tw.focus) + '</div>' +
                      '<div style="font-size:0.78rem; color:#94a3b8; margin-top:0.2rem;">📍 ' + esc(tw.pitch) + '</div>' +
                    '</div>' +
                    '<div style="text-align:right;">' +
                      '<span class="es-pres-badge es-pres-badge-status">' + esc(tw.attendance) + '</span>' +
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
        // 1. Header di Stato Club
        '<div class="es-pres-header-banner">' +
          '<div class="es-pres-header-inner">' +
            '<div class="es-pres-club-meta-box">' +
              '<div class="es-pres-crest-frame">' +
                '<img src="' + esc(data.logoUrl) + '" alt="' + esc(data.clubName) + '" onerror="this.src=\'immagini/squadre-loghi/foggia.png\';">' +
              '</div>' +
              '<div>' +
                '<h1 class="es-pres-club-name">' + esc(data.clubName) + '</h1>' +
                '<div class="es-pres-badges-row">' +
                  '<span class="es-pres-badge es-pres-badge-cat">🏆 ' + esc(data.category) + '</span>' +
                  '<span class="es-pres-badge es-pres-badge-status">🟢 ' + esc(data.affiliationStatus) + '</span>' +
                  '<span class="es-pres-badge es-pres-badge-gold">👑 ' + esc(data.presRole) + '</span>' +
                '</div>' +
              '</div>' +
            '</div>' +

            '<div class="es-pres-standings-snippet">' +
              '<div class="es-pres-snippet-col">' +
                '<div class="es-pres-snippet-val">' + esc(data.position) + '</div>' +
                '<div class="es-pres-snippet-lbl">' + esc(data.points) + ' Punti</div>' +
              '</div>' +
              '<div style="width:1px; height:32px; background:rgba(148,163,184,0.2);"></div>' +
              '<div class="es-pres-snippet-col">' +
                '<div class="es-pres-snippet-val" style="color:#ffffff; font-size:1.15rem;">' + esc(data.matchDay) + '</div>' +
                '<div class="es-pres-snippet-lbl">' + esc(data.season) + '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +

        // Barra di Navigazione Rapida
        '<div class="es-pres-nav-strip">' +
          '<button type="button" class="es-pres-nav-btn is-active" data-view="overview">👑 Panoramica Presidenziale</button>' +
          '<button type="button" class="es-pres-nav-btn" data-view="gestione">🛡️ Gestione Club</button>' +
          '<button type="button" class="es-pres-nav-btn" data-view="ufficio">🏢 Ufficio &amp; Finanze</button>' +
          '<button type="button" class="es-pres-nav-btn" data-view="competizioni">⚽ Competizioni &amp; Risultati</button>' +
          '<button type="button" class="es-pres-nav-btn" data-view="compliance">⚖️ Conformità &amp; Governance</button>' +
        '</div>' +

        // Contenitore Sezioni
        '<div class="es-pres-container">' +

          // 2. Sezione "Gestione Club"
          '<section id="sec-pres-gestione">' +
            '<div class="es-pres-section-head">' +
              '<div>' +
                '<h2 class="es-pres-section-title"><span class="es-icon-glow">🛡️</span> Gestione Club</h2>' +
                '<p class="es-pres-section-sub">Valutazione della rosa, trattative di mercato e monitoraggio dello staff tecnico</p>' +
              '</div>' +
            '</div>' +

            '<div class="es-pres-grid-3">' +
              // Card Rating Rosa
              '<div class="es-pres-card" id="card-pres-rating">' +
                '<div class="es-pres-card-top">' +
                  '<div class="es-pres-card-icon-wrap">⭐</div>' +
                  '<span class="es-pres-badge es-pres-badge-cat">Indice Reale</span>' +
                '</div>' +
                '<div>' +
                  '<h3 class="es-pres-card-title">Rating Rosa</h3>' +
                  '<div class="es-pres-card-metric">' + data.squadRating.score + ' <span style="font-size:1rem; color:#94a3b8;">/ 100</span></div>' +
                  '<p class="es-pres-card-desc">Età media ' + data.squadRating.avgAge + ' · ' + data.squadRating.minutesCoverage + ' · Valore interno ' + data.squadRating.marketValue + '</p>' +
                '</div>' +
                '<div class="es-pres-card-footer"><span>' + data.squadRating.totalPlayers + ' Atleti in organico</span><span>Apri rosa &rsaquo;</span></div>' +
              '</div>' +

              // Card Trattative
              '<div class="es-pres-card" id="card-pres-transfers">' +
                '<div class="es-pres-card-top">' +
                  '<div class="es-pres-card-icon-wrap">🤝</div>' +
                  '<span class="es-pres-badge es-pres-badge-status">' + data.transfers.activeCount + ' Trattative</span>' +
                '</div>' +
                '<div>' +
                  '<h3 class="es-pres-card-title">Trattative di Mercato</h3>' +
                  '<div class="es-pres-card-metric">' + data.transfers.activeCount + ' <span style="font-size:1rem; color:#94a3b8;">in corso</span></div>' +
                  '<p class="es-pres-card-desc">2 In negoziazione avanzata · 1 accordo raggiunto · 1 prestito in entrata</p>' +
                '</div>' +
                '<div class="es-pres-card-footer"><span>Hub Mercato &amp; Svincoli</span><span>Dettagli trattative &rsaquo;</span></div>' +
              '</div>' +

              // Card Staff Tecnico
              '<div class="es-pres-card" id="card-pres-staff">' +
                '<div class="es-pres-card-top">' +
                  '<div class="es-pres-card-icon-wrap">⏱️</div>' +
                  (data.staff.alertExpiring > 0 ? ('<span class="es-pres-card-alert-badge">⚠️ ' + data.staff.alertExpiring + ' In scadenza</span>') : '<span class="es-pres-badge es-pres-badge-status">Staff OK</span>') +
                '</div>' +
                '<div>' +
                  '<h3 class="es-pres-card-title">Staff Tecnico</h3>' +
                  '<div class="es-pres-card-metric">' + data.staff.total + ' <span style="font-size:1rem; color:#94a3b8;">professionisti</span></div>' +
                  '<p class="es-pres-card-desc">Mister, Vice, DS, Preparatore, Fisio, Medico e Match Analyst in organigramma</p>' +
                '</div>' +
                '<div class="es-pres-card-footer"><span>Verifica contratti</span><span>Gestisci staff &rsaquo;</span></div>' +
              '</div>' +
            '</div>' +

            '<div class="es-pres-grid-2" style="margin-top:1.25rem;">' +
              // Card Settore Giovanile
              '<div class="es-pres-card" id="card-pres-youth">' +
                '<div class="es-pres-card-top">' +
                  '<div class="es-pres-card-icon-wrap">🌱</div>' +
                  '<span class="es-pres-badge es-pres-badge-cat">' + data.youth.underInRoster + ' Under in Prima Squadra</span>' +
                '</div>' +
                '<div>' +
                  '<h3 class="es-pres-card-title">Settore Giovanile &amp; Fuoriquota</h3>' +
                  '<div class="es-pres-card-metric">' + data.youth.underInRoster + ' <span style="font-size:0.95rem; color:#94a3b8;">vs ' + data.youth.mandatoryLnd + ' obbligatori LND</span></div>' +
                  '<p class="es-pres-card-desc">' + data.youth.academyTotal + ' Atleti nel vivaio · ' + data.youth.underStarters + ' Under stabilmente titolari · Conformità regolamento FIGC 100%</p>' +
                '</div>' +
                '<div class="es-pres-card-footer"><span>Vivaio &amp; Primavera</span><span>Apri vivaio &rsaquo;</span></div>' +
              '</div>' +

              // Card Sviluppo Atleti
              '<div class="es-pres-card" id="card-pres-dev">' +
                '<div class="es-pres-card-top">' +
                  '<div class="es-pres-card-icon-wrap">📈</div>' +
                  '<span class="es-pres-badge es-pres-badge-status">' + data.athleteDevelopment.activeCards + ' Schede IA</span>' +
                '</div>' +
                '<div>' +
                  '<h3 class="es-pres-card-title">Sviluppo Atleti</h3>' +
                  '<div class="es-pres-card-metric">' + data.athleteDevelopment.activeCards + ' <span style="font-size:0.95rem; color:#94a3b8;">percorsi attivi</span></div>' +
                  '<p class="es-pres-card-desc">Monitoraggio progressivo delle performance dei giovani e schede di valutazione tecnica periodica</p>' +
                '</div>' +
                '<div class="es-pres-card-footer"><span>Progressione talenti</span><span>Visualizza schede &rsaquo;</span></div>' +
              '</div>' +
            '</div>' +
          '</section>' +

          // 3. Sezione "Ufficio Club"
          '<section id="sec-pres-ufficio">' +
            '<div class="es-pres-section-head">' +
              '<div>' +
                '<h2 class="es-pres-section-title"><span class="es-icon-glow">🏢</span> Ufficio Club</h2>' +
                '<p class="es-pres-section-sub">Posta societaria, sponsor, strutture, stadio, scouting e budget</p>' +
              '</div>' +
            '</div>' +

            '<div class="es-pres-grid-4">' +
              // Posta
              '<div class="es-pres-card" id="card-pres-mail">' +
                '<div class="es-pres-card-top"><div class="es-pres-card-icon-wrap">✉️</div><span class="es-pres-badge es-pres-badge-cat">' + data.office.mail.unread + ' Nuovi</span></div>' +
                '<div><h4 class="es-pres-card-title">Posta</h4><div class="es-pres-card-metric">' + data.office.mail.unread + '</div><p class="es-pres-card-desc">Messaggi da agenti FIFA, staff e comunicati federali LND</p></div>' +
                '<div class="es-pres-card-footer"><span>In arrivo</span><span>Apri posta &rsaquo;</span></div>' +
              '</div>' +

              // Sponsor (Apre Schermata Dettaglio Sponsor)
              '<div class="es-pres-card" id="card-pres-sponsors-screen">' +
                '<div class="es-pres-card-top"><div class="es-pres-card-icon-wrap">🤝</div>' + (data.office.sponsors.alertExpiring > 0 ? '<span class="es-pres-card-alert-badge">⚠️ 1 Rinnovo</span>' : '<span class="es-pres-badge es-pres-badge-status">4 Attivi</span>') + '</div>' +
                '<div><h4 class="es-pres-card-title">Sponsor</h4><div class="es-pres-card-metric">' + data.office.sponsors.totalIncome + '</div><p class="es-pres-card-desc">' + data.office.sponsors.activeCount + ' Partnership ufficiali attive per la stagione</p></div>' +
                '<div class="es-pres-card-footer"><span>Partnership</span><span>Gestione sponsor &rsaquo;</span></div>' +
              '</div>' +

              // Centro Allenamento (Apre Schermata Dettaglio Centro Allenamento)
              '<div class="es-pres-card" id="card-pres-training-screen">' +
                '<div class="es-pres-card-top"><div class="es-pres-card-icon-wrap">⚡</div><span class="es-pres-badge es-pres-badge-status">Regolare</span></div>' +
                '<div><h4 class="es-pres-card-title">Centro Allenamento</h4><div class="es-pres-card-metric">2 <span style="font-size:1rem; color:#94a3b8;">Campi</span></div><p class="es-pres-card-desc">Staff tecnico qualificato e piano settimanale sedute</p></div>' +
                '<div class="es-pres-card-footer"><span>Sedute &amp; Staff</span><span>Dettagli allenamento &rsaquo;</span></div>' +
              '</div>' +

              // Store POD
              '<div class="es-pres-card" id="card-pres-store">' +
                '<div class="es-pres-card-top"><div class="es-pres-card-icon-wrap">🛍️</div><span class="es-pres-badge es-pres-badge-cat">Print-on-Demand</span></div>' +
                '<div><h4 class="es-pres-card-title">Store Ufficiale</h4><div class="es-pres-card-metric">' + data.office.merchandising.ordersCount + ' <span style="font-size:1rem; color:#94a3b8;">ordini</span></div><p class="es-pres-card-desc">Merchandising ufficiale con produzione e spedizione automatica</p></div>' +
                '<div class="es-pres-card-footer"><span>Ricavi ' + data.office.merchandising.revenue + '</span><span>Catalogo store &rsaquo;</span></div>' +
              '</div>' +

              // Stadio (Apre Schermata Dettaglio Stadio)
              '<div class="es-pres-card" id="card-pres-stadium-screen">' +
                '<div class="es-pres-card-top"><div class="es-pres-card-icon-wrap">🏟️</div><span class="es-pres-badge es-pres-badge-cat">25.085 Posti</span></div>' +
                '<div><h4 class="es-pres-card-title">Stadio</h4><div class="es-pres-card-metric">' + data.office.stadium.avgAttendance + '</div><p class="es-pres-card-desc">Tariffe biglietti, capienza certificata e agibilità</p></div>' +
                '<div class="es-pres-card-footer"><span>Pino Zaccheria</span><span>Gestisci impianto &rsaquo;</span></div>' +
              '</div>' +

              // Scouting & Secret List
              '<div class="es-pres-card" id="card-pres-scouting">' +
                '<div class="es-pres-card-top"><div class="es-pres-card-icon-wrap">🔍</div><span class="es-pres-badge es-pres-badge-status">' + data.office.scouting.secretListTalents + ' Talenti</span></div>' +
                '<div><h4 class="es-pres-card-title">Scouting Club</h4><div class="es-pres-card-metric">' + data.office.scouting.secretListTalents + ' <span style="font-size:1rem; color:#94a3b8;">Secret List</span></div><p class="es-pres-card-desc">' + data.office.scouting.analystReports + ' Report match analysis archiviati</p></div>' +
                '<div class="es-pres-card-footer"><span>Osservatori</span><span>Secret list &rsaquo;</span></div>' +
              '</div>' +

              // Finanze & Budget (RBAC Restricted)
              '<div class="es-pres-card" id="card-pres-finances" style="grid-column: span 2;">' +
                '<div class="es-pres-card-top">' +
                  '<div class="es-pres-card-icon-wrap">💰</div>' +
                  '<span class="es-pres-badge es-pres-badge-gold">🔒 Accesso Riservato Presidenza</span>' +
                '</div>' +
                '<div>' +
                  '<h4 class="es-pres-card-title">Finanze &amp; Budget Societario</h4>' +
                  (canSeeFinances ? (
                    '<div class="es-pres-card-metric">' + data.office.finances.cashBalance + ' <span style="font-size:1rem; color:#94a3b8;">saldo cassa</span></div>' +
                    '<p class="es-pres-card-desc">Monte ingaggi mensile: ' + data.office.finances.monthlyPayroll + ' · Budget stagionale: ' + data.office.finances.annualBudget + ' (' + data.office.finances.budgetHealth + ')</p>'
                  ) : (
                    '<div class="es-pres-card-metric" style="font-size:1.2rem; color:#94a3b8;">Dati protetti da autorizzazione RBAC</div>' +
                    '<p class="es-pres-card-desc">I dati finanziari dettagliati sono visibili esclusivamente al ruolo Presidente e Tesoriere.</p>'
                  )) +
                '</div>' +
                '<div class="es-pres-card-footer"><span>Bilancio Club</span><span>' + (canSeeFinances ? 'Apri rendiconto completo &rsaquo;' : 'Richiedi accesso &rsaquo;') + '</span></div>' +
              '</div>' +
            '</div>' +
          '</section>' +

          // 4. Sezione "Competizioni"
          '<section id="sec-pres-competizioni">' +
            '<div class="es-pres-section-head">' +
              '<div>' +
                '<h2 class="es-pres-section-title"><span class="es-icon-glow">⚽</span> Competizioni &amp; Rendimento</h2>' +
                '<p class="es-pres-section-sub">Statistiche reali di campionato, calendario incontri e classifica girone</p>' +
              '</div>' +
            '</div>' +

            '<div class="es-pres-grid-3">' +
              // Statistiche (Apre Schermata Dettaglio Statistiche Club)
              '<div class="es-pres-card" id="card-pres-stats-screen">' +
                '<div class="es-pres-card-top"><div class="es-pres-card-icon-wrap">📊</div><span class="es-pres-badge es-pres-badge-status">' + data.competitions.stats.won + ' Vinte</span></div>' +
                '<div><h3 class="es-pres-card-title">Statistiche Club &amp; Record</h3><div class="es-pres-card-metric">' + data.competitions.stats.played + ' <span style="font-size:1rem; color:#94a3b8;">Partite</span></div><p class="es-pres-card-desc">Record presenze, gol, assist, strisce e storico campionati</p></div>' +
                '<div class="es-pres-card-footer"><span>Trend: 🟢 🟢 🟡 🟢 🔴</span><span>Dettaglio statistiche &rsaquo;</span></div>' +
              '</div>' +

              // Calendario (Apre Schermata Dettaglio Calendario)
              '<div class="es-pres-card" id="card-pres-schedule-screen">' +
                '<div class="es-pres-card-top"><div class="es-pres-card-icon-wrap">📅</div><span class="es-pres-badge es-pres-badge-cat">Prossima Gara</span></div>' +
                '<div><h3 class="es-pres-card-title">' + esc(data.competitions.nextMatch.opponent) + '</h3><div class="es-pres-card-metric" style="font-size:1.4rem;">' + esc(data.competitions.nextMatch.date) + '</div><p class="es-pres-card-desc">Programmazione gare e designazioni arbitrali ufficiali AIA</p></div>' +
                '<div class="es-pres-card-footer"><span>Designazioni AIA</span><span>Calendario completo &rsaquo;</span></div>' +
              '</div>' +

              // Classifica (Apre Schermata Dettaglio Classifica)
              '<div class="es-pres-card" id="card-pres-standings-screen">' +
                '<div class="es-pres-card-top"><div class="es-pres-card-icon-wrap">🏆</div><span class="es-pres-badge es-pres-badge-gold">Girone H</span></div>' +
                '<div><h3 class="es-pres-card-title">Classifica Campionato</h3><div class="es-pres-card-metric">' + esc(data.position) + ' <span style="font-size:1rem; color:#94a3b8;">(' + data.points + ' Pt)</span></div><p class="es-pres-card-desc">' + esc(data.standingGap) + '<br>Tabella federale ufficiale con evidenziazione Club</p></div>' +
                '<div class="es-pres-card-footer"><span>Live Standings</span><span>Classifica integrale &rsaquo;</span></div>' +
              '</div>' +
            '</div>' +
          '</section>' +

          // 5. Sezione "Conformità & Governance"
          '<section id="sec-pres-compliance">' +
            '<div class="es-pres-section-head">' +
              '<div>' +
                '<h2 class="es-pres-section-title"><span class="es-icon-glow">⚖️</span> Conformità &amp; Governance</h2>' +
                '<p class="es-pres-section-sub">Tesseramenti federali, consensi GDPR Under 18 e scadenze legali del Club</p>' +
              '</div>' +
            '</div>' +

            '<div class="es-pres-grid-2">' +
              '<div class="es-pres-card" id="card-pres-gov-status">' +
                '<div class="es-pres-card-top"><div class="es-pres-card-icon-wrap">📋</div><span class="es-pres-badge es-pres-badge-status">100% Conforme</span></div>' +
                '<div><h3 class="es-pres-card-title">Tesseramenti &amp; Privacy</h3><p class="es-pres-card-desc" style="font-size:0.92rem; line-height:1.6;">• <b>Tesseramenti Atleti:</b> ' + esc(data.governance.tesseramenti) + '<br>• <b>GDPR Minori:</b> ' + esc(data.governance.gdprUnder18) + '<br>• <b>Certificati BLSD Staff:</b> Tutti i membri dello staff tecnico abilitati</p></div>' +
                '<div class="es-pres-card-footer"><span>Archivio Documentale</span><span>Verifica tessere &rsaquo;</span></div>' +
              '</div>' +

              '<div class="es-pres-card" id="card-pres-gov-deadlines">' +
                '<div class="es-pres-card-top"><div class="es-pres-card-icon-wrap">🔔</div><span class="es-pres-card-alert-badge">⚠️ 1 Scadenza</span></div>' +
                '<div><h3 class="es-pres-card-title">Scadenziario Federale</h3><div style="font-size:0.85rem; color:#cbd5e1; display:flex; flex-direction:column; gap:0.4rem; margin-top:0.4rem;">' +
                  data.governance.federalDeadlines.map(function (d) {
                    return '<div>• <b>' + esc(d.task) + ':</b> <span style="color:#2dd4bf;">' + esc(d.status) + '</span> (' + esc(d.date) + ')</div>';
                  }).join('') +
                '</div></div>' +
                '<div class="es-pres-card-footer"><span>Monitoraggio Adempimenti</span><span>Dettagli scadenze &rsaquo;</span></div>' +
              '</div>' +
            '</div>' +

            // Badge di Fiducia
            '<div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:1rem; margin-top:1.2rem;">' +
              data.governance.trustBadges.map(function (b) {
                return (
                  '<div style="background:rgba(15,23,42,0.6); border:1px solid rgba(45,212,191,0.2); border-radius:16px; padding:0.9rem; text-align:center;">' +
                    '<div style="font-size:0.88rem; font-weight:800; color:#ffffff; margin-bottom:0.2rem;">' + esc(b.name) + '</div>' +
                    '<div style="font-size:0.75rem; color:#94a3b8;">' + esc(b.desc) + '</div>' +
                  '</div>'
                );
              }).join('') +
            '</div>' +
          '</section>' +

          // 6. Banner CTA Finali
          '<div class="es-pres-cta-banner">' +
            '<div class="es-pres-cta-content">' +
              '<h3>👑 Potenzia la gestione del Club con Elisee Scout Pro</h3>' +
              '<p>Sblocca la firma digitale contratti, report avanzati di Match Analysis e supporto legale federale dedicato.</p>' +
            '</div>' +
            '<div class="es-pres-cta-actions">' +
              '<button type="button" class="es-pres-btn-pro" id="btn-pres-upgrade-pro">Passa a Elisee Scout Pro</button>' +
              '<button type="button" class="es-pres-btn-compliance" id="btn-pres-req-compliance">Richiedi consulenza compliance</button>' +
              '<button type="button" class="es-pres-btn-compliance" id="btn-pres-req-support">Contatta supporto club</button>' +
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

    // Azioni Schermata Stadio
    var btnSaveTickets = mount.querySelector('#btn-save-tickets');
    if (btnSaveTickets) {
      btnSaveTickets.onclick = function () {
        var reg = mount.querySelector('#inp-ticket-regular').value;
        var red = mount.querySelector('#inp-ticket-reduced').value;
        data.office.stadium.ticketPriceRegular = reg;
        data.office.stadium.ticketPriceReduced = red;
        savePresClubData(data);
        if (window.showToast) window.showToast('🎟️ Tariffe biglietteria salvate con successo: € ' + reg + ' / € ' + red, 'success');
      };
    }
    var btnReqCap = mount.querySelector('#btn-req-capacity-update');
    if (btnReqCap) {
      btnReqCap.onclick = function () {
        if (window.showToast) window.showToast('📄 Modulo allegato verbale CPV aperto per la richiesta di variazione capienza', 'info');
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

    // Tab Statistiche
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
        if (window.showToast) window.showToast('📝 Modulo inserimento accordo sponsor aperto!', 'info');
      };
    }
    var btnBacheca = mount.querySelector('#btn-bacheca-sponsor');
    if (btnBacheca) {
      btnBacheca.onclick = function () {
        if (window.showToast) window.showToast('🤝 Bacheca Opportunità Sponsor Locali B2B aperta!', 'info');
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

    // Navigazione Rapida Overview
    mount.querySelectorAll('.es-pres-nav-btn[data-view]').forEach(function (btn) {
      btn.onclick = function () {
        mount.querySelectorAll('.es-pres-nav-btn[data-view]').forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        var view = btn.getAttribute('data-view');
        if (view === 'overview') {
          mount.querySelectorAll('section').forEach(function (s) { s.style.display = 'block'; });
        } else {
          mount.querySelectorAll('section').forEach(function (s) {
            s.style.display = s.id === ('sec-pres-' + view) ? 'block' : 'none';
          });
        }
      };
    });

    // Rating Rosa Card Modal
    var cardRating = mount.querySelector('#card-pres-rating');
    if (cardRating) {
      cardRating.onclick = function () {
        var html =
          '<p style="color:#cbd5e1; font-size:0.9rem;">Analisi analitica e stima tecnica della rosa in base a minutaggio reale e parametri federali:</p>' +
          '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin:1.2rem 0;">' +
            '<div style="background:rgba(15,23,42,0.8); border:1px solid rgba(45,212,191,0.25); border-radius:14px; padding:1rem;">' +
              '<div style="font-size:0.75rem; color:#94a3b8; font-weight:800;">INDICE QUALITÀ COMPLESSIVO</div>' +
              '<div style="font-size:1.8rem; font-weight:900; color:#38bdf8;">' + data.squadRating.score + ' / 100</div>' +
            '</div>' +
            '<div style="background:rgba(15,23,42,0.8); border:1px solid rgba(45,212,191,0.25); border-radius:14px; padding:1rem;">' +
              '<div style="font-size:0.75rem; color:#94a3b8; font-weight:800;">VALORE SCOUTING INTERNO</div>' +
              '<div style="font-size:1.8rem; font-weight:900; color:#2dd4bf;">' + data.squadRating.marketValue + '</div>' +
            '</div>' +
          '</div>' +
          '<div style="color:#94a3b8; font-size:0.85rem;">• Età media: <b>' + data.squadRating.avgAge + '</b><br>• Copertura minutaggio: <b>' + data.squadRating.minutesCoverage + '</b><br>• Totale atleti tesserati in prima squadra: <b>' + data.squadRating.totalPlayers + '</b></div>';
        openDetailModal('Rating Rosa & Parametri Tecnici', '⭐', html);
      };
    }

    // Trattative Card Modal
    var cardTransfers = mount.querySelector('#card-pres-transfers');
    if (cardTransfers) {
      cardTransfers.onclick = function () {
        var listHtml = data.transfers.items.map(function (t) {
          return (
            '<div style="background:rgba(15,23,42,0.7); border:1px solid rgba(148,163,184,0.18); border-radius:14px; padding:1rem; margin-bottom:0.75rem; display:flex; justify-content:space-between; align-items:center;">' +
              '<div><h4 style="font-size:1.05rem; font-weight:800; color:#fff; margin:0;">' + esc(t.player) + ' (' + esc(t.role) + ')</h4><div style="font-size:0.8rem; color:#94a3b8; margin-top:0.2rem;">Club: ' + esc(t.club) + ' · Tipo: ' + esc(t.type) + '</div></div>' +
              '<span class="es-pres-badge es-pres-badge-status">' + esc(t.status) + '</span>' +
            '</div>'
          );
        }).join('');
        openDetailModal('Trattative di Mercato & Svincoli', '🤝', listHtml);
      };
    }

    // Staff Tecnico Card Modal
    var cardStaff = mount.querySelector('#card-pres-staff');
    if (cardStaff) {
      cardStaff.onclick = function () {
        var listHtml = data.staff.members.map(function (m) {
          return (
            '<div style="background:rgba(15,23,42,0.7); border:1px solid rgba(148,163,184,0.18); border-radius:14px; padding:0.9rem 1.1rem; margin-bottom:0.6rem; display:flex; justify-content:space-between; align-items:center;">' +
              '<div><h5 style="font-size:0.95rem; font-weight:800; color:#fff; margin:0;">' + esc(m.name) + '</h5><div style="font-size:0.78rem; color:#2dd4bf;">' + esc(m.role) + ' (' + esc(m.patent) + ') · Scadenza: ' + esc(m.contractExp) + '</div></div>' +
              '<span class="' + (m.status.includes('scadenza') ? 'es-pres-card-alert-badge' : 'es-pres-badge es-pres-badge-status') + '">' + esc(m.status) + '</span>' +
            '</div>'
          );
        }).join('');
        openDetailModal('Organigramma Staff Tecnico', '⏱️', listHtml);
      };
    }

    // Finanze Card Modal
    var cardFinances = mount.querySelector('#card-pres-finances');
    if (cardFinances) {
      cardFinances.onclick = function () {
        if (!hasFinanceAccess()) {
          alert('Accesso Riservato: Questa sezione è protetta e visibile solo al Presidente, Vice e Tesoriere.');
          return;
        }
        var html =
          '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.4rem;">' +
            '<div style="background:rgba(15,23,42,0.8); border:1px solid rgba(45,212,191,0.25); border-radius:14px; padding:1.1rem;">' +
              '<div style="font-size:0.75rem; color:#94a3b8; font-weight:800;">DISPONIBILITÀ CASSA ATTUALE</div>' +
              '<div style="font-size:1.8rem; font-weight:900; color:#2dd4bf;">' + data.office.finances.cashBalance + '</div>' +
            '</div>' +
            '<div style="background:rgba(15,23,42,0.8); border:1px solid rgba(45,212,191,0.25); border-radius:14px; padding:1.1rem;">' +
              '<div style="font-size:0.75rem; color:#94a3b8; font-weight:800;">MONTE INGAGGI MENSILE</div>' +
              '<div style="font-size:1.8rem; font-weight:900; color:#facc15;">' + data.office.finances.monthlyPayroll + '</div>' +
            '</div>' +
          '</div>' +
          '<div style="color:#cbd5e1; font-size:0.88rem; line-height:1.6;">' +
            '• <b>Budget Totale Stagionale:</b> ' + data.office.finances.annualBudget + '<br>' +
            '• <b>Stato di Salute del Bilancio:</b> <span style="color:#4ade80;">' + data.office.finances.budgetHealth + '</span><br>' +
            '• <b>Copertura Sponsor:</b> ' + data.office.sponsors.totalIncome + ' (' + data.office.sponsors.activeCount + ' Sponsor Ufficiali)' +
          '</div>';
        openDetailModal('Finanze & Budget Societario (Area Riservata)', '💰', html);
      };
    }

    // Posta Card Modal
    var cardMail = mount.querySelector('#card-pres-mail');
    if (cardMail) {
      cardMail.onclick = function () {
        var listHtml = data.office.mail.items.map(function (m) {
          return (
            '<div style="background:rgba(15,23,42,0.7); border:1px solid rgba(148,163,184,0.18); border-radius:14px; padding:1rem; margin-bottom:0.75rem;">' +
              '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.3rem;"><span style="font-size:0.78rem; font-weight:800; color:#2dd4bf;">' + esc(m.from) + '</span><span style="font-size:0.75rem; color:#94a3b8;">' + esc(m.date) + '</span></div>' +
              '<h5 style="font-size:0.95rem; font-weight:800; color:#ffffff; margin:0;">' + esc(m.subject) + '</h5>' +
            '</div>'
          );
        }).join('');
        openDetailModal('Posta Societaria Ufficiale', '✉️', listHtml);
      };
    }

    // CTA Bottoni
    var btnUpgrade = mount.querySelector('#btn-pres-upgrade-pro');
    if (btnUpgrade) {
      btnUpgrade.onclick = function () {
        if (window.showToast) window.showToast('👑 Passa a Elisee Scout Pro: Modulo di attivazione aperto!', 'success');
      };
    }
    var btnCompliance = mount.querySelector('#btn-pres-req-compliance');
    if (btnCompliance) {
      btnCompliance.onclick = function () {
        if (window.showToast) window.showToast('⚖️ Richiesta consulenza compliance federale inviata!', 'info');
      };
    }
    var btnSupport = mount.querySelector('#btn-pres-req-support');
    if (btnSupport) {
      btnSupport.onclick = function () {
        if (window.showToast) window.showToast('💬 Apertura canale supporto diretto club...', 'info');
      };
    }
  }

  // Modale Generica
  function openDetailModal(title, icon, contentHtml) {
    var old = document.getElementById('es-pres-detail-overlay');
    if (old) old.remove();

    var modal = document.createElement('div');
    modal.id = 'es-pres-detail-overlay';
    modal.className = 'es-pres-modal-overlay';
    modal.innerHTML =
      '<div class="es-pres-modal-sheet" role="dialog" aria-modal="true">' +
        '<button type="button" class="es-pres-modal-close-btn" id="btn-close-pres-detail">&times;</button>' +
        '<div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1.4rem; padding-bottom:0.8rem; border-bottom:1px solid rgba(148,163,184,0.15);">' +
          '<span style="font-size:1.8rem;">' + icon + '</span>' +
          '<h2 style="font-size:1.45rem; font-weight:900; color:#ffffff; margin:0;">' + esc(title) + '</h2>' +
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
    var prd = document.getElementById('es-prd');
    if (prd) prd.remove();
  }

  window.EliseePresDash = {
    render: render,
    detach: detach,
    openDetail: openDetailModal
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
