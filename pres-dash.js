/* ============================================================
   ELISEE SCOUT — AREA PRESIDENTE (PRESIDENTIAL DASHBOARD B2B)
   Dashboard gestionale per Presidenti e Alta Dirigenza di club dilettantistici.
   6 Macro-Sezioni:
   1. Header di Stato Club (Logo, Categoria, Posizione, Tesseramento)
   2. Gestione Club (Rating Rosa, Trattative, Staff Tecnico, Settore Giovanile, Sviluppo Atleti)
   3. Ufficio Club (Posta, Sponsor, Centro Sportivo, Store POD, Stadio, Scouting, Finanze RBAC)
   4. Competizioni (Statistiche, Calendario, Classifica Girone)
   5. Conformità e Governance (Tesseramenti, GDPR Under 18, Scadenze Federali, Badge Fiducia)
   6. CTA Finali (Passa a Elisee Scout Pro, Supporto & Compliance)
   ============================================================ */
(function () {
  'use strict';

  var currentView = 'overview'; // 'overview' | 'gestione' | 'ufficio' | 'competizioni' | 'compliance'

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
          { role: 'Allenatore Prima Squadra', name: 'Mister Mario Somma', contractExp: '30/06/2027', status: 'Regolare' },
          { role: 'Vice Allenatore', name: 'Giuseppe Russo', contractExp: '30/06/2027', status: 'Regolare' },
          { role: 'Direttore Sportivo', name: 'Antonio Gentile', contractExp: '15/10/2026', status: '⚠️ In scadenza (45gg)' },
          { role: 'Preparatore Atletico', name: 'Luca Rossi', contractExp: '30/06/2027', status: 'Regolare' },
          { role: 'Preparatore Portieri', name: 'Francesco Mancini', contractExp: '30/06/2027', status: 'Regolare' },
          { role: 'Fisioterapista', name: 'Dott. Alessandro Neri', contractExp: '30/06/2027', status: 'Regolare' },
          { role: 'Medico Sociale', name: 'Dott. Valerio Bianchi', contractExp: '30/06/2027', status: 'Regolare' },
          { role: 'Match Analyst', name: 'Roberto Esposito', contractExp: '30/06/2027', status: 'Regolare' }
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

      // 2. Ufficio Club
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
          items: [
            { name: 'Banca Popolare di Puglia', tier: 'Main Sponsor Maglia', value: '€ 25.000', expiry: '30/06/2027', status: 'Attivo' },
            { name: 'Givova Sport', tier: 'Sponsor Tecnico Ufficiale', value: '€ 12.000 (Fornitura Kit)', expiry: '30/06/2027', status: 'Attivo' },
            { name: 'AutoPuglia Concessionaria', tier: 'Official Mobility Partner', value: '€ 5.000', expiry: '30/09/2026', status: '⚠️ Rinnovo in scadenza' },
            { name: 'Ristorante Il Pomodoro', tier: 'Food & Hospitality Partner', value: '€ 3.000', expiry: '30/06/2027', status: 'Attivo' }
          ]
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
          capacity: '25.085 posti a sedere',
          avgAttendance: '4.850 spettatori / partita',
          safetyCert: 'CPV Vigilanza Prefettizia Valida'
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

      // 3. Competizioni
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
        nextMatch: {
          opponent: 'Taranto FC 1927',
          date: 'Domenica 30 Agosto 2026 · Ore 15:00',
          stadium: 'Stadio Pino Zaccheria (Foggia)',
          referee: 'Sezione AIA Roma 1'
        },
        standingsTop: [
          { pos: 1, team: 'Brindisi', pts: 64, p: 28, w: 20, d: 4, l: 4 },
          { pos: 2, team: 'Foggia Calcio 1920', pts: 62, p: 28, w: 19, d: 5, l: 4 },
          { pos: 3, team: 'Barletta 1922', pts: 58, p: 28, w: 17, d: 7, l: 4 },
          { pos: 4, team: 'Casarano Calcio', pts: 54, p: 28, w: 15, d: 9, l: 4 }
        ]
      },

      // 4. Conformità & Governance
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
  // RENDER PRINCIPALE SUITE PRESIDENTE
  // ============================================================
  function renderPresidentialSuite() {
    var mount = document.getElementById('es-prd');
    if (!mount) return;

    var data = getPresClubData();
    var canSeeFinances = hasFinanceAccess();

    var html =
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

              // Sponsor
              '<div class="es-pres-card" id="card-pres-sponsors">' +
                '<div class="es-pres-card-top"><div class="es-pres-card-icon-wrap">🤝</div>' + (data.office.sponsors.alertExpiring > 0 ? '<span class="es-pres-card-alert-badge">⚠️ 1 Rinnovo</span>' : '<span class="es-pres-badge es-pres-badge-status">4 Attivi</span>') + '</div>' +
                '<div><h4 class="es-pres-card-title">Sponsor</h4><div class="es-pres-card-metric">' + data.office.sponsors.totalIncome + '</div><p class="es-pres-card-desc">' + data.office.sponsors.activeCount + ' Partnership ufficiali attive per la stagione</p></div>' +
                '<div class="es-pres-card-footer"><span>Partnership</span><span>Gestione sponsor &rsaquo;</span></div>' +
              '</div>' +

              // Centro Sportivo
              '<div class="es-pres-card" id="card-pres-facilities">' +
                '<div class="es-pres-card-top"><div class="es-pres-card-icon-wrap">🏟️</div><span class="es-pres-badge es-pres-badge-status">Regolare</span></div>' +
                '<div><h4 class="es-pres-card-title">Centro Sportivo</h4><div class="es-pres-card-metric">2 <span style="font-size:1rem; color:#94a3b8;">Campi</span></div><p class="es-pres-card-desc">Campo Principale in erba naturale + Campo sintetico B</p></div>' +
                '<div class="es-pres-card-footer"><span>Struttura</span><span>Dettagli impianto &rsaquo;</span></div>' +
              '</div>' +

              // Store POD
              '<div class="es-pres-card" id="card-pres-store">' +
                '<div class="es-pres-card-top"><div class="es-pres-card-icon-wrap">🛍️</div><span class="es-pres-badge es-pres-badge-cat">Print-on-Demand</span></div>' +
                '<div><h4 class="es-pres-card-title">Store Ufficiale</h4><div class="es-pres-card-metric">' + data.office.merchandising.ordersCount + ' <span style="font-size:1rem; color:#94a3b8;">ordini</span></div><p class="es-pres-card-desc">Merchandising ufficiale con produzione e spedizione automatica</p></div>' +
                '<div class="es-pres-card-footer"><span>Ricavi ' + data.office.merchandising.revenue + '</span><span>Catalogo store &rsaquo;</span></div>' +
              '</div>' +

              // Stadio
              '<div class="es-pres-card" id="card-pres-stadium">' +
                '<div class="es-pres-card-top"><div class="es-pres-card-icon-wrap">🏟️</div><span class="es-pres-badge es-pres-badge-cat">25.085 Posti</span></div>' +
                '<div><h4 class="es-pres-card-title">Stadio</h4><div class="es-pres-card-metric">' + data.office.stadium.avgAttendance + '</div><p class="es-pres-card-desc">Media spettatori stagionale · Certificazione agibilità valida</p></div>' +
                '<div class="es-pres-card-footer"><span>Pino Zaccheria</span><span>Info impianto &rsaquo;</span></div>' +
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
              // Statistiche
              '<div class="es-pres-card" id="card-pres-comp-stats">' +
                '<div class="es-pres-card-top"><div class="es-pres-card-icon-wrap">📊</div><span class="es-pres-badge es-pres-badge-status">' + data.competitions.stats.won + ' Vinte</span></div>' +
                '<div><h3 class="es-pres-card-title">Rendimento Stagionale</h3><div class="es-pres-card-metric">' + data.competitions.stats.played + ' <span style="font-size:1rem; color:#94a3b8;">Partite</span></div><p class="es-pres-card-desc">' + data.competitions.stats.gf + ' Gol Fatti · ' + data.competitions.stats.ga + ' Gol Subiti (Diff. ' + data.competitions.stats.gd + ') · ' + data.competitions.stats.drawn + ' Pareggi · ' + data.competitions.stats.lost + ' Sconfitte</p></div>' +
                '<div class="es-pres-card-footer"><span>Trend: 🟢 🟢 🟡 🟢 🔴</span><span>Report avanzato &rsaquo;</span></div>' +
              '</div>' +

              // Calendario
              '<div class="es-pres-card" id="card-pres-comp-calendar">' +
                '<div class="es-pres-card-top"><div class="es-pres-card-icon-wrap">📅</div><span class="es-pres-badge es-pres-badge-cat">Prossima Gara</span></div>' +
                '<div><h3 class="es-pres-card-title">' + esc(data.competitions.nextMatch.opponent) + '</h3><div class="es-pres-card-metric" style="font-size:1.4rem;">' + esc(data.competitions.nextMatch.date) + '</div><p class="es-pres-card-desc">🏟️ ' + esc(data.competitions.nextMatch.stadium) + '<br>⚖️ Arbitro: ' + esc(data.competitions.nextMatch.referee) + '</p></div>' +
                '<div class="es-pres-card-footer"><span>Convocazioni aperte</span><span>Calendario completo &rsaquo;</span></div>' +
              '</div>' +

              // Classifica
              '<div class="es-pres-card" id="card-pres-comp-standings">' +
                '<div class="es-pres-card-top"><div class="es-pres-card-icon-wrap">🏆</div><span class="es-pres-badge es-pres-badge-gold">Girone H</span></div>' +
                '<div><h3 class="es-pres-card-title">Classifica Girone</h3><div class="es-pres-card-metric">' + esc(data.position) + ' <span style="font-size:1rem; color:#94a3b8;">(' + data.points + ' Pt)</span></div><p class="es-pres-card-desc">' + esc(data.standingGap) + '<br>1° Brindisi 64 · 2° Foggia 62 · 3° Barletta 58 · 4° Casarano 54</p></div>' +
                '<div class="es-pres-card-footer"><span>Zona Playoff / Promozione</span><span>Classifica integrale &rsaquo;</span></div>' +
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
      '</div>';

    mount.innerHTML = html;
    bindPresidentialEvents();
  }

  // ============================================================
  // MODALE GENERICA DETTAGLIO B2B
  // ============================================================
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

  function bindPresidentialEvents() {
    var mount = document.getElementById('es-prd');
    if (!mount) return;

    var data = getPresClubData();

    // Navigazione
    mount.querySelectorAll('.es-pres-nav-btn').forEach(function (btn) {
      btn.onclick = function () {
        mount.querySelectorAll('.es-pres-nav-btn').forEach(function (b) { b.classList.remove('is-active'); });
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

    // Rating Rosa Card
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

    // Trattative Card
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

    // Staff Tecnico Card
    var cardStaff = mount.querySelector('#card-pres-staff');
    if (cardStaff) {
      cardStaff.onclick = function () {
        var listHtml = data.staff.members.map(function (m) {
          return (
            '<div style="background:rgba(15,23,42,0.7); border:1px solid rgba(148,163,184,0.18); border-radius:14px; padding:0.9rem 1.1rem; margin-bottom:0.6rem; display:flex; justify-content:space-between; align-items:center;">' +
              '<div><h5 style="font-size:0.95rem; font-weight:800; color:#fff; margin:0;">' + esc(m.name) + '</h5><div style="font-size:0.78rem; color:#2dd4bf;">' + esc(m.role) + ' · Scadenza: ' + esc(m.contractExp) + '</div></div>' +
              '<span class="' + (m.status.includes('scadenza') ? 'es-pres-card-alert-badge' : 'es-pres-badge es-pres-badge-status') + '">' + esc(m.status) + '</span>' +
            '</div>'
          );
        }).join('');
        openDetailModal('Organigramma Staff Tecnico', '⏱️', listHtml);
      };
    }

    // Settore Giovanile Card
    var cardYouth = mount.querySelector('#card-pres-youth');
    if (cardYouth) {
      cardYouth.onclick = function () {
        var html =
          '<p style="color:#cbd5e1; font-size:0.9rem;">Riepilogo conformità fuoriquota e atleti Under per i campionati dilettantistici LND:</p>' +
          '<div style="background:rgba(15,23,42,0.8); border:1px solid rgba(45,212,191,0.25); border-radius:14px; padding:1.2rem; margin:1rem 0;">' +
            '<div style="font-size:1.1rem; font-weight:800; color:#ffffff; margin-bottom:0.4rem;">Conformità Regolamento LND: <span style="color:#4ade80;">100% REGOLARE</span></div>' +
            '<div style="font-size:0.85rem; color:#94a3b8; line-height:1.5;">• Under obbligatori da schierare: <b>' + data.youth.mandatoryLnd + '</b><br>• Under presenti in prima squadra: <b>' + data.youth.underInRoster + '</b><br>• Under stabilmente titolari: <b>' + data.youth.underStarters + '</b><br>• Totale giovani nel vivaio: <b>' + data.youth.academyTotal + '</b></div>' +
          '</div>';
        openDetailModal('Settore Giovanile & Obblighi Fuoriquota LND', '🌱', html);
      };
    }

    // Finanze Card
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

    // Sponsor Card
    var cardSponsors = mount.querySelector('#card-pres-sponsors');
    if (cardSponsors) {
      cardSponsors.onclick = function () {
        var listHtml = data.office.sponsors.items.map(function (s) {
          return (
            '<div style="background:rgba(15,23,42,0.7); border:1px solid rgba(148,163,184,0.18); border-radius:14px; padding:1rem; margin-bottom:0.75rem; display:flex; justify-content:space-between; align-items:center;">' +
              '<div><h4 style="font-size:1.05rem; font-weight:800; color:#fff; margin:0;">' + esc(s.name) + '</h4><div style="font-size:0.8rem; color:#94a3b8; margin-top:0.2rem;">' + esc(s.tier) + ' · Valore: ' + esc(s.value) + ' (Scad. ' + esc(s.expiry) + ')</div></div>' +
              '<span class="' + (s.status.includes('scadenza') ? 'es-pres-card-alert-badge' : 'es-pres-badge es-pres-badge-status') + '">' + esc(s.status) + '</span>' +
            '</div>'
          );
        }).join('');
        openDetailModal('Sponsor & Accordi di Partnership', '🤝', listHtml);
      };
    }

    // Posta Card
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
