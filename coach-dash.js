/* ============================================================
   ELISEE SCOUT — AREA ALLENATORE (TECHNICAL STAFF CONTROL ROOM)
   Technical Staff Operating System — Suite Professionale per Allenatore Capo
   Conformità Zero-Fake Platform:
   - Dati Ufficiali, Patentino UEFA, Status Disponibile / In carica
   - Collegamento Diretto Bidirezionale con il Vice Allenatore
   - Control Room Bar con KPI Dinamici (Prossima Gara, ACWR, Rosa, Vice)
   - Moduli Tattici Dinamici (4-3-3, 4-2-3-1, 3-5-2, 3-4-2-1, 4-4-2) con Mappa Posizionale FM
   - Top 11 Interattiva con Apertura Player Card & Esportazione Social Story 9:16
   - Hub Metodologico Esercitazioni con filtri & toggle Privato/Pubblico
   - Bacheca Trofei Onesta (Parte vuota per default, gestione reale interattiva)
   - Telemetria GPS Squadra, Indice ACWR & Analisi Heatmap Sovrapposta
   - Segnalazioni Calciomercato al DS (Wishlist Tecnica)
   - Organico Rosa con Filtri di Reparto & Status Convocazione
   - Sedute di Allenamento con Rilevazione Presenze Interattiva
   - Calendario Partite Ufficiali & Convocati
   - Lavagna Tattica Digitale Interattiva con Pedine e Schemi
   - Limiti di Ruolo Ufficiali & Permessi Istituzionali
   ============================================================ */
(function () {
  'use strict';

  var activeTab = 'identita'; // 'identita' | 'tattica' | 'metodologia' | 'gps_heatmap' | 'segnalazioni_ds' | 'squadra' | 'allenamenti' | 'partite' | 'lavagna'
  var activeRosterFilter = 'all';
  var activeExFilter = 'all';

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
    var primary = String(u.staffRole || u.ruoloDettagliato || (u.staffProfile && u.staffProfile.fieldRole) || u.ruolo || u.role || '').trim().toLowerCase();
    if (!primary || primary === 'staff') return false;
    if (/in seconda|vice allenatore|mental coach|collaboratore tecnico|preparatore|match analyst|video analyst/.test(primary)) return false;
    return primary === 'allenatore' || primary === 'mister' || primary === 'coach' || /\ballenatore capo\b/.test(primary);
  }

  function getCoachData() {
    var u = userObj();
    var def = {
      coachName: [u.nome, u.cognome].filter(Boolean).join(' ').trim() || u.username || 'Eliseo Miraglia',
      coachRole: u.staffRole || 'Allenatore Capo',
      patent: u.qualifica || (u.staffProfile && u.staffProfile.qualifica) || 'UEFA A',
      status: u.status || 'in_carica', // 'in_carica' | 'disponibile'
      clubName: u.squadra || u.club || 'Foggia City',
      matricola: u.matricola || 'FIGC-71829',
      sede: u.sede || 'Foggia (FG)',
      stadio: u.stadio || 'Campo Comunale',
      telefono: u.telefono || '+39 340 1234567',
      logoUrl: u.logoUrl || 'immagini/squadre-loghi/foggia-city.png',
      // Prossima Gara
      nextMatch: {
        avversario: 'Audace Cerignola',
        data: '20/09/2026',
        orario: '15:00',
        luogo: 'Stadio Comunale',
        competizione: 'Campionato Amatoriale'
      },
      // Collegamento Diretto Vice Allenatore
      viceLink: {
        id: 'vice-official-1',
        name: 'Paolo Gentile',
        role: 'Vice Allenatore / Staff Tecnico',
        patent: 'UEFA B',
        email: 'paolo.gentile@elisee-scout.it',
        status: 'Collegato',
        lastSync: 'Oggi ore 10:45'
      },
      // Moduli & Tattica
      moduloPrincipale: '4-3-3',
      moduloSecondario: '4-2-3-1',
      filosofiaTattica: 'Costruzione dal basso, ampiezza con ali alte, pressing ultra-offensivo a tutto campo e transizione immediata.',
      // Formazione della Settimana (Top 11)
      top11: [
        { pos: 'POR', num: 1, name: 'Marco Carnesecchi', role: 'Portiere', status: 'disp', rating: '8.4' },
        { pos: 'TD', num: 77, name: 'Davide Zappacosta', role: 'Terzino Destro', status: 'disp', rating: '7.8' },
        { pos: 'DC', num: 19, name: 'Berat Djimsiti', role: 'Difensore Centrale', status: 'disp', rating: '8.0' },
        { pos: 'DC', num: 4, name: 'Isak Hien', role: 'Difensore Centrale', status: 'disp', rating: '8.2' },
        { pos: 'TS', num: 22, name: 'Matteo Ruggeri', role: 'Terzino Sinistro', status: 'disp', rating: '7.9' },
        { pos: 'MED', num: 15, name: 'Marten de Roon', role: 'Mediano', status: 'disp', rating: '8.5' },
        { pos: 'CC', num: 13, name: 'Éderson', role: 'Mezzala', status: 'disp', rating: '8.7' },
        { pos: 'CC', num: 8, name: 'Mario Pašalić', role: 'Trequartista', status: 'disp', rating: '8.1' },
        { pos: 'AD', num: 17, name: 'Charles De Ketelaere', role: 'Ala Destra', status: 'disp', rating: '8.9' },
        { pos: 'AS', num: 11, name: 'Ademola Lookman', role: 'Ala Sinistra', status: 'disp', rating: '9.2' },
        { pos: 'ATT', num: 9, name: 'Gianluca Scamacca', role: 'Punta Centrale', status: 'disp', rating: '8.6' }
      ],
      panchina: [
        { pos: 'POR', num: 28, name: 'Rui Patrício', role: 'Portiere' },
        { pos: 'DC', num: 3, name: 'Rafael Tolói', role: 'Difensore Centrale' },
        { pos: 'CC', num: 6, name: 'Ibrahim Sulemana', role: 'Centrocampista' },
        { pos: 'ATT', num: 10, name: 'Nicolò Zaniolo', role: 'Trequartista' },
        { pos: 'ATT', num: 32, name: 'Mateo Retegui', role: 'Punta Centrale' }
      ],
      // Hub Esercitazioni
      esercitazioni: [
        {
          id: 'es-1',
          titolo: 'Rondos ad Alta Intensità 5v2 + Transizione Positiva',
          categoria: 'Rondos & Possesso',
          durata: '20 min',
          visibilita: 'public',
          descrizione: 'Gabbia 15x15m. Circolazione a 2 tocchi massimi, cambio orientamento e ricerca della verticalizzazione immediata appena si recupera palla.',
          data: '14/09/2026'
        },
        {
          id: 'es-2',
          titolo: 'Schema da Calcio d’Angolo: Blocco sul Primo Palo & Inserimento Mezzala',
          categoria: 'Palle Inattive',
          durata: '15 min',
          visibilita: 'private',
          descrizione: 'Movimento a specchio: attaccante blocca il marcatore, taglio sul dischetto della mezzala a rimorchio.',
          data: '13/09/2026'
        },
        {
          id: 'es-3',
          titolo: 'Attivazione Tattica Pre-Gara & Allunghi Progressivi',
          categoria: 'Riscaldamento',
          durata: '25 min',
          visibilita: 'public',
          descrizione: 'Mobilità articolare dinamica + 3 blocchi da 4 serie di navette con cambi di direzione e scatti a 25m.',
          data: '12/09/2026'
        }
      ],
      // Bacheca Digitale Trofei & Palmarès: VUOTA PER DEFAULT (Zero Fake Policy)
      palmares: [],
      // Segnalazioni Calciomercato per il DS
      wishlistDs: [
        { id: 'wl-1', nome: 'Lorenzo Lucca', ruolo: 'Punta Centrale', club: 'Udinese Calcio', priorita: 'Alta', note: 'Forte nel gioco aereo, perfetto per dare peso al 4-3-3', data: '12/09/2026', stato: 'In valutazione DS' },
        { id: 'wl-2', nome: 'Giovanni Fabbian', ruolo: 'Mezzala Inserimento', club: 'Bologna FC', priorita: 'Media', note: 'Ottimo senso del gol e tempi di inserimento', data: '08/09/2026', stato: 'Contattato' }
      ],
      // Rosa Prima Squadra
      roster: [
        { num: 1, name: 'Marco Carnesecchi', role: 'Portiere', birth: 2000, app: 28, status: 'disp' },
        { num: 19, name: 'Berat Djimsiti', role: 'Difensore Centrale', birth: 1993, app: 30, status: 'disp' },
        { num: 4, name: 'Isak Hien', role: 'Difensore Centrale', birth: 1999, app: 26, status: 'disp' },
        { num: 77, name: 'Davide Zappacosta', role: 'Terzino Destro', birth: 1992, app: 25, status: 'disp' },
        { num: 22, name: 'Matteo Ruggeri', role: 'Terzino Sinistro', birth: 2002, app: 29, status: 'disp' },
        { num: 15, name: 'Marten de Roon', role: 'Mediano', birth: 1991, app: 32, status: 'disp' },
        { num: 13, name: 'Éderson', role: 'Mezzala', birth: 1999, app: 31, status: 'disp' },
        { num: 8, name: 'Mario Pašalić', role: 'Trequartista', birth: 1995, app: 27, status: 'disp' },
        { num: 17, name: 'Charles De Ketelaere', role: 'Ala Destra', birth: 2001, app: 30, status: 'disp' },
        { num: 11, name: 'Ademola Lookman', role: 'Ala Sinistra', birth: 1997, app: 29, status: 'disp' },
        { num: 9, name: 'Gianluca Scamacca', role: 'Punta Centrale', birth: 1999, app: 24, status: 'diff' }
      ],
      // Sedute di Allenamento con Presenze
      trainingsList: [
        {
          id: 'tr-1',
          data: '16/09/2026',
          orario: '15:30',
          luogo: 'Campo Principale - 1',
          tipo: 'Seduta Tattica & Palle Inattive',
          desc: 'Rifinitura pre-partita: schemi d’angolo e movimenti di catena offensiva.',
          presenze: { 'Marco Carnesecchi': 'pres', 'Davide Zappacosta': 'pres', 'Berat Djimsiti': 'pres', 'Isak Hien': 'pres', 'Matteo Ruggeri': 'pres', 'Gianluca Scamacca': 'diff' }
        },
        {
          id: 'tr-2',
          data: '14/09/2026',
          orario: '10:30',
          luogo: 'Campo B - Sintetico',
          tipo: 'Attivazione Atletica & Forza Esplosiva',
          desc: 'Navette con cambi di direzione e potenziamento arti inferiori.',
          presenze: { 'Marco Carnesecchi': 'pres', 'Davide Zappacosta': 'pres', 'Éderson': 'pres', 'Ademola Lookman': 'pres' }
        }
      ],
      // Partite Ufficiali
      partite: [
        {
          id: 'mat-1',
          competizione: 'Campionato Amatoriale',
          avversario: 'Audace Cerignola',
          data: '20/09/2026',
          orario: '15:00',
          luogo: 'Stadio Comunale (Casa)',
          convocati: ['Marco Carnesecchi', 'Davide Zappacosta', 'Berat Djimsiti', 'Isak Hien', 'Matteo Ruggeri', 'Marten de Roon', 'Éderson', 'Mario Pašalić', 'Charles De Ketelaere', 'Ademola Lookman', 'Gianluca Scamacca']
        },
        {
          id: 'mat-2',
          competizione: 'Coppa Provinciale',
          avversario: 'Manfredonia Calcio',
          data: '27/09/2026',
          orario: '18:00',
          luogo: 'Stadio Miramare (Trasferta)',
          convocati: ['Marco Carnesecchi', 'Davide Zappacosta', 'Isak Hien', 'Éderson', 'Ademola Lookman']
        }
      ],
      // Schema Lavagna Tattica
      boardPins: [
        { id: 'bp-1', type: 'blue', num: '1', x: 50, y: 88 },
        { id: 'bp-2', type: 'blue', num: '2', x: 84, y: 68 },
        { id: 'bp-3', type: 'blue', num: '5', x: 62, y: 72 },
        { id: 'bp-4', type: 'blue', num: '6', x: 38, y: 72 },
        { id: 'bp-5', type: 'blue', num: '3', x: 16, y: 68 },
        { id: 'bp-6', type: 'blue', num: '4', x: 50, y: 52 },
        { id: 'bp-7', type: 'blue', num: '8', x: 70, y: 44 },
        { id: 'bp-8', type: 'blue', num: '10', x: 30, y: 44 },
        { id: 'bp-9', type: 'blue', num: '7', x: 82, y: 24 },
        { id: 'bp-10', type: 'blue', num: '11', x: 18, y: 24 },
        { id: 'bp-11', type: 'blue', num: '9', x: 50, y: 16 },
        { id: 'ball', type: 'ball', x: 50, y: 35 }
      ]
    };

    try {
      var raw = localStorage.getItem('elisee_coach_data');
      if (raw) {
        var parsed = JSON.parse(raw);
        // SANITIZZAZIONE ZERO-FAKE: Rimuove titoli inventati UEFA rimasti in cache
        if (parsed.palmares && parsed.palmares.some(function (p) {
          return p.titolo && /Europa League|Champions League|Primavera 1/i.test(p.titolo);
        })) {
          parsed.palmares = [];
          localStorage.setItem('elisee_coach_data', JSON.stringify(parsed));
        }
        return Object.assign({}, def, parsed);
      }
    } catch (_) {}

    return def;
  }

  function saveCoachData(data) {
    try {
      localStorage.setItem('elisee_coach_data', JSON.stringify(data));
    } catch (_) {}
  }

  var TAB_DESCS = {
    identita: 'Carta d\'identità professionale, qualifica UEFA, status contrattuale, collegamento diretto con il Vice Allenatore e bacheca trofei.',
    tattica: 'Impostazione moduli tattici FM, lavagna dinamica XI Titolare della Settimana e condivisione Story Social 9:16.',
    metodologia: 'Hub metodologico di esercitazioni, schemi su palle inattive e routine pre-gara con visibilità personalizzabile.',
    gps_heatmap: 'Telemetria GPS squadra, indice di carico ACWR, monitoraggio carichi di lavoro e mappe di calore sovrapposte.',
    segnalazioni_ds: 'Canale diretto per la segnalazione di profili e priorità tecniche di mercato al Direttore Sportivo.',
    squadra: 'Organico di prima squadra con schede tecniche degli atleti, presenze e monitoraggio dello stato fisico.',
    allenamenti: 'Pianificazione calendario sedute settimanali, monitoraggio presenze e report di campo per lo staff.',
    partite: 'Calendario match ufficiali, avversari, storico risultati e compilazione distinte convocati.',
    lavagna: 'Lavagna tattica interattiva con posizionamento pedine, frecce di movimento ed esportazione schemi.'
  };

  // ============================================================
  // RENDER PRINCIPALE
  // ============================================================
  function renderHub() {
    var mount = document.getElementById('es-cd');
    if (!mount) return;

    var grp = document.getElementById('user-dossier-view-group');
    if (grp) grp.classList.add('is-coach-dash');

    var data = getCoachData();
    var isDisp = data.status === 'disponibile';

    var html =
      '<div class="es-coach-hub">' +
        // Top Control Bar
        '<div class="es-coach-top-bar">' +
          '<div class="es-coach-top-left">' +
            '<span class="es-coach-badge-control">CONTROL ROOM TECNICA</span>' +
            '<span class="es-coach-top-title">Profilo Allenatore Capo · ' + esc(data.coachName) + '</span>' +
          '</div>' +
          '<div class="es-coach-top-actions">' +
            '<span class="es-coach-status-tag ' + (isDisp ? 'is-disp' : 'is-busy') + '">' + (isDisp ? '● Disponibile / In attesa di incarico' : '● In carica: ' + esc(data.clubName)) + '</span>' +
            '<button type="button" class="es-coach-btn-guida" id="btn-guida-allenatore">Guida di Ruolo</button>' +
          '</div>' +
        '</div>' +

        '<div class="es-coach-container">' +
          // Header Card Profilo
          '<div class="es-coach-header-card">' +
            '<div class="es-coach-header-main">' +
              '<div class="es-coach-avatar-wrap">' +
                '<div class="es-coach-avatar-box">' +
                  '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
                '</div>' +
                '<span class="es-coach-avatar-tag">' + esc(data.patent) + '</span>' +
              '</div>' +
              '<div class="es-coach-header-info">' +
                '<div class="es-coach-tags-row">' +
                  '<span class="es-tag es-tag-blue">QUALIFICA: ' + esc(data.patent) + '</span>' +
                  '<span class="es-tag es-tag-dark">' + esc(data.matricola) + '</span>' +
                  '<span class="es-tag es-tag-blue">MODULO: ' + esc(data.moduloPrincipale) + '</span>' +
                '</div>' +
                '<h1 class="es-coach-name-title">' + esc(data.coachName) + '</h1>' +
                '<p class="es-coach-lead-desc" id="coach-tab-desc-text">' + esc(TAB_DESCS[activeTab]) + '</p>' +
              '</div>' +
            '</div>' +
            '<div class="es-coach-header-cta">' +
              '<button type="button" class="es-btn-primary" id="btn-quick-story-export">' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> Esporta Top 11 Story' +
              '</button>' +
              '<button type="button" class="es-btn-secondary" id="btn-quick-new-exercise">+ Nuova Esercitazione</button>' +
            '</div>' +
          '</div>' +

          // KPI Control Strip (6 card dinamiche da control room)
          '<div class="es-coach-kpi-bar">' +
            '<div class="es-coach-kpi-card">' +
              '<span class="es-coach-kpi-card-lbl">PROSSIMA GARA</span>' +
              '<span class="es-coach-kpi-card-val">' + esc(data.nextMatch.avversario) + '</span>' +
              '<span class="es-coach-kpi-card-sub">' + esc(data.nextMatch.data) + ' ore ' + esc(data.nextMatch.orario) + '</span>' +
            '</div>' +
            '<div class="es-coach-kpi-card">' +
              '<span class="es-coach-kpi-card-lbl">ULTIMA SEDUTA</span>' +
              '<span class="es-coach-kpi-card-val">Tattica & Palle Inattive</span>' +
              '<span class="es-coach-kpi-card-sub is-green">Presenze 92%</span>' +
            '</div>' +
            '<div class="es-coach-kpi-card">' +
              '<span class="es-coach-kpi-card-lbl">CARICO SQUADRA (ACWR)</span>' +
              '<span class="es-coach-kpi-card-val">1.08</span>' +
              '<span class="es-coach-kpi-card-sub is-green">Range Ottimale</span>' +
            '</div>' +
            '<div class="es-coach-kpi-card">' +
              '<span class="es-coach-kpi-card-lbl">DISPONIBILITÀ ROSA</span>' +
              '<span class="es-coach-kpi-card-val">' + (data.roster.filter(function(p){return p.status==='disp';}).length) + ' / ' + data.roster.length + '</span>' +
              '<span class="es-coach-kpi-card-sub is-green">91% Idonei</span>' +
            '</div>' +
            '<div class="es-coach-kpi-card">' +
              '<span class="es-coach-kpi-card-lbl">DA MONITORARE</span>' +
              '<span class="es-coach-kpi-card-val">1 Atleta</span>' +
              '<span class="es-coach-kpi-card-sub is-warn">Scamacca (Diff.)</span>' +
            '</div>' +
            '<div class="es-coach-kpi-card">' +
              '<span class="es-coach-kpi-card-lbl">STAFF TECNICO</span>' +
              '<span class="es-coach-kpi-card-val">' + esc(data.viceLink.name) + '</span>' +
              '<span class="es-coach-kpi-card-sub is-green">● Collegamento Attivo</span>' +
            '</div>' +
          '</div>' +

          // Navbar a 9 Schede / Macro-aree con Icone SVG Monochrome Pulite
          '<nav class="es-coach-navbar" role="tablist">' +
            renderNavButton('identita', 'Identità & Staff', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>') +
            renderNavButton('tattica', 'Tattica & Top 11', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>') +
            renderNavButton('metodologia', 'Esercitazioni', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>') +
            renderNavButton('gps_heatmap', 'GPS & Carichi', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>') +
            renderNavButton('segnalazioni_ds', 'Segnalazione DS', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>') +
            renderNavButton('squadra', 'Rosa', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>') +
            renderNavButton('allenamenti', 'Sedute & Presenze', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>') +
            renderNavButton('partite', 'Partite', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>') +
            renderNavButton('lavagna', 'Lavagna Tattica', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>') +
          '</nav>' +

          // Content Tab Container
          '<div id="coach-tab-content-area" class="es-coach-content-area">' +
            renderTabContent(activeTab, data) +
          '</div>' +

        '</div>' +
      '</div>';

    mount.innerHTML = html;
    bindHubEvents();
  }

  function renderNavButton(tabKey, label, svgIcon) {
    var isActive = activeTab === tabKey;
    return '<button type="button" class="es-coach-navbtn ' + (isActive ? 'is-active' : '') + '" data-tab="' + tabKey + '">' +
      svgIcon + '<span>' + esc(label) + '</span>' +
    '</button>';
  }

  // ============================================================
  // RENDER DELLE 9 SEZIONI OPERATIVE
  // ============================================================
  function renderTabContent(tab, data) {
    if (tab === 'identita') return renderTabIdentita(data);
    if (tab === 'tattica') return renderTabTattica(data);
    if (tab === 'metodologia') return renderTabMetodologia(data);
    if (tab === 'gps_heatmap') return renderTabGpsHeatmap(data);
    if (tab === 'segnalazioni_ds') return renderTabSegnalazioniDs(data);
    if (tab === 'squadra') return renderTabSquadra(data);
    if (tab === 'allenamenti') return renderTabAllenamenti(data);
    if (tab === 'partite') return renderTabPartite(data);
    if (tab === 'lavagna') return renderTabLavagna(data);
    return '<div class="es-coach-card">Sezione in caricamento...</div>';
  }

  // 1. TAB IDENTITÀ & STAFF
  function renderTabIdentita(data) {
    var v = data.viceLink || {};
    var isDisp = data.status === 'disponibile';

    return (
      '<div class="es-coach-grid-2">' +
        // Card Dati Ufficiali
        '<div class="es-coach-card">' +
          '<div class="es-coach-card-head">' +
            '<div class="es-coach-card-title-wrap">' +
              '<div><h3>Dati Identificativi & Licenza</h3><p>Carta d\'identità tecnica ufficiale per gestione squadra e mercato</p></div>' +
            '</div>' +
            '<button type="button" class="es-coach-action-btn" id="btn-edit-coach-identity">Modifica</button>' +
          '</div>' +
          '<table class="es-coach-info-table">' +
            '<tr><th>NOME E COGNOME</th><td><b>' + esc(data.coachName) + '</b></td></tr>' +
            '<tr><th>QUALIFICA / LICENZA</th><td><span class="es-tag es-tag-blue">' + esc(data.patent) + '</span></td></tr>' +
            '<tr><th>STATUS ATTUALE</th><td><span class="' + (isDisp ? 'es-tag es-tag-warn' : 'es-tag es-tag-green') + '">' + (isDisp ? '● Disponibile / In attesa di incarico' : '● In carica presso ' + esc(data.clubName)) + '</span></td></tr>' +
            '<tr><th>SEDE / RESIDENZA</th><td>' + esc(data.sede) + '</td></tr>' +
            '<tr><th>STADIO / CENTRO</th><td>' + esc(data.stadio) + '</td></tr>' +
            '<tr><th>CONTATTO SEGRETERIA</th><td>' + esc(data.telefono) + '</td></tr>' +
          '</table>' +
        '</div>' +

        // Card Collegamento Diretto Vice Allenatore
        '<div class="es-coach-card">' +
          '<div class="es-coach-card-head">' +
            '<div class="es-coach-card-title-wrap">' +
              '<div><h3>Vice Allenatore (Collegamento Diretto)</h3><p>Continuità operativa e legame ufficiale di staff tecnico</p></div>' +
            '</div>' +
            '<button type="button" class="es-coach-action-btn" id="btn-link-vice-modal">Modifica Vice</button>' +
          '</div>' +
          (v.name ? (
            '<div class="es-coach-vice-box">' +
              '<div class="es-coach-vice-avatar">' +
                '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>' +
              '</div>' +
              '<div class="es-coach-vice-info">' +
                '<h4 class="es-coach-vice-name">' + esc(v.name) + '</h4>' +
                '<p class="es-coach-vice-sub">' + esc(v.role) + ' · Qualifica: <b>' + esc(v.patent || 'UEFA B') + '</b></p>' +
                '<div style="display:flex; gap:0.5rem; margin-top:0.4rem; align-items:center;">' +
                  '<span class="es-tag es-tag-green">✓ Account Ufficiale Collegato</span>' +
                  '<span style="font-size:0.72rem; color:#8ea7ba;">' + esc(v.lastSync || 'Sincronizzato') + '</span>' +
                '</div>' +
              '</div>' +
              '<button type="button" class="es-btn-primary" id="btn-open-vice-profile" style="padding:6px 12px; font-size:0.8rem;">Apri Scheda Vice &rarr;</button>' +
            '</div>'
          ) : (
            '<div class="es-coach-empty-box"><p>Nessun Vice Allenatore collegato ufficialmente.</p><button type="button" class="es-btn-primary" id="btn-link-vice-modal-2">+ Collega Vice Registrato</button></div>'
          )) +
        '</div>' +

        // Card Bacheca Digitale Trofei & Palmarès (Zero Fake: inizia vuota!)
        '<div class="es-coach-card" style="grid-column:1 / -1;">' +
          '<div class="es-coach-card-head">' +
            '<div class="es-coach-card-title-wrap">' +
              '<div><h3>Bacheca Digitale Trofei & Palmarès</h3><p>Storico successi e titoli certificati: campionati, coppe e promozioni</p></div>' +
            '</div>' +
            '<button type="button" class="es-btn-primary" id="btn-add-trofeo-modal">+ Aggiungi Titolo</button>' +
          '</div>' +
          '<div class="es-coach-trofei-grid">' +
            (data.palmares && data.palmares.length ? data.palmares.map(function (pal, idx) {
              return (
                '<div class="es-coach-trofeo-card">' +
                  '<div class="es-coach-trofeo-icon">🏆</div>' +
                  '<div class="es-coach-trofeo-content">' +
                    '<h4 class="es-coach-trofeo-title">' + esc(pal.titolo) + '</h4>' +
                    '<div class="es-coach-trofeo-meta"><span class="es-tag es-tag-blue">' + esc(pal.anno) + '</span> <span class="es-tag es-tag-dark">' + esc(pal.tipo) + '</span></div>' +
                    '<p class="es-coach-trofeo-notes">' + esc(pal.note || '') + '</p>' +
                  '</div>' +
                  '<button type="button" class="es-coach-trofeo-del" data-del-pal-idx="' + idx + '" title="Rimuovi titolo">&times;</button>' +
                '</div>'
              );
            }).join('') : (
              '<div class="es-coach-empty-palmares">' +
                '<div class="es-coach-empty-palmares-icon">🏆</div>' +
                '<h4 class="es-coach-empty-palmares-title">Nessun titolo registrato</h4>' +
                '<p class="es-coach-empty-palmares-desc">La bacheca trofei e palmarès è attualmente vuota. Clicca su <b>+ Aggiungi Titolo</b> per certificare promozioni, coppe o campionati ufficiali del tuo percorso.</p>' +
              '</div>'
            )) +
          '</div>' +
        '</div>' +

        // Card Limiti di Ruolo dell'Allenatore (Ambra Sobrio e Disciplina Istituzionale)
        '<div class="es-coach-card" style="grid-column:1 / -1;">' +
          '<div class="es-coach-card-head">' +
            '<div class="es-coach-card-title-wrap">' +
              '<div><h3>Limiti di Ruolo e Permessi Istituzionali</h3><p>Conformità organizzativa e gerarchia decisionale societaria</p></div>' +
            '</div>' +
          '</div>' +
          '<div class="es-coach-limits-grid">' +
            '<div class="es-coach-limit-item"><span class="es-coach-limit-icon is-ok">✓</span><div><b>Gestione Tecnica & Squadra:</b> Piena autonomia su moduli, formazioni, esercitazioni, presenze e convocazioni.</div></div>' +
            '<div class="es-coach-limit-item"><span class="es-coach-limit-icon is-warn">⚠️</span><div><b>Struttura Societaria:</b> Non può modificare dati legali o affiliazioni societarie (riservato a Presidente / Segretario).</div></div>' +
            '<div class="es-coach-limit-item"><span class="es-coach-limit-icon is-warn">⚠️</span><div><b>Annunci di Calciomercato:</b> Non può pubblicare annunci di ingaggio ufficiali a nome della società senza approvazione del DS/Presidente.</div></div>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  // 2. TAB TATTICA & TOP 11
  function renderTabTattica(data) {
    return (
      '<div class="es-coach-grid-2">' +
        // Card Moduli Preferiti & Filosofia
        '<div class="es-coach-card">' +
          '<div class="es-coach-card-head">' +
            '<div class="es-coach-card-title-wrap">' +
              '<div><h3>Identità Tattica & Moduli</h3><p>Assetto teorico che alimenta la disposizione dinamica in campo</p></div>' +
            '</div>' +
            '<select class="es-tactics-module-select" id="sel-tactics-module">' +
              '<option value="4-3-3" ' + (data.moduloPrincipale === '4-3-3' ? 'selected' : '') + '>Modulo 4-3-3 (Offensivo)</option>' +
              '<option value="4-2-3-1" ' + (data.moduloPrincipale === '4-2-3-1' ? 'selected' : '') + '>Modulo 4-2-3-1 (Equilibrato)</option>' +
              '<option value="3-5-2" ' + (data.moduloPrincipale === '3-5-2' ? 'selected' : '') + '>Modulo 3-5-2 (Ampiezza Quinti)</option>' +
              '<option value="3-4-2-1" ' + (data.moduloPrincipale === '3-4-2-1' ? 'selected' : '') + '>Modulo 3-4-2-1 (Doppio Trequarti)</option>' +
              '<option value="4-4-2" ' + (data.moduloPrincipale === '4-4-2' ? 'selected' : '') + '>Modulo 4-4-2 (Lineare Classico)</option>' +
            '</select>' +
          '</div>' +
          '<div style="display:flex; gap:1rem; margin-bottom:1rem;">' +
            '<div class="es-coach-stat-box"><span class="es-coach-stat-num">' + esc(data.moduloPrincipale) + '</span><span class="es-coach-stat-lbl">MODULO ATTUALE</span></div>' +
            '<div class="es-coach-stat-box"><span class="es-coach-stat-num">' + esc(data.moduloSecondario) + '</span><span class="es-coach-stat-lbl">VARIANTE DI GARA</span></div>' +
          '</div>' +
          '<div style="background:#080f18; border:1px solid #16344a; border-radius:4px; padding:0.85rem; font-size:0.84rem; line-height:1.45; color:#8ea7ba;">' +
            '<b style="color:#f4f8fc;">Filosofia di Gioco:</b> ' + esc(data.filosofiaTattica) +
          '</div>' +
        '</div>' +

        // Card Mappa Posizionale FM
        '<div class="es-coach-card">' +
          '<div class="es-coach-card-head">' +
            '<div class="es-coach-card-title-wrap">' +
              '<div><h3>Mappa Posizionale FM</h3><p>Disposizione teorica dei ruoli sul terreno di gioco</p></div>' +
            '</div>' +
          '</div>' +
          '<div class="es-fm-pitch-wrap">' +
            renderFmPitch(data.moduloPrincipale, data.top11) +
          '</div>' +
        '</div>' +

        // Card Formazione della Settimana (XI Titolare)
        '<div class="es-coach-card" style="grid-column:1 / -1;">' +
          '<div class="es-coach-card-head">' +
            '<div class="es-coach-card-title-wrap">' +
              '<div><h3>Formazione della Settimana (XI Titolare / Top 11)</h3><p>Clicca sui calciatori per aprire la Player Card ufficiale. Condividi su Instagram/TikTok in 1 click.</p></div>' +
            '</div>' +
            '<div style="display:flex; gap:0.5rem;">' +
              '<button type="button" class="es-btn-secondary" id="btn-edit-top11-modal">Componi XI</button>' +
              '<button type="button" class="es-btn-primary" id="btn-export-story-modal">Condividi Storia Social (9:16)</button>' +
            '</div>' +
          '</div>' +

          '<div class="es-top11-container">' +
            '<div class="es-top11-pitch">' +
              renderInteractiveTop11Pitch(data.top11, data.moduloPrincipale) +
            '</div>' +
            '<div class="es-top11-bench-panel">' +
              '<h4 style="margin:0 0 0.6rem; font-size:0.88rem; color:#f4f8fc; font-weight:800; text-transform:uppercase; letter-spacing:0.04em;">A Disposizione (Panchina)</h4>' +
              '<div class="es-top11-bench-list">' +
                (data.panchina || []).map(function (b) {
                  return (
                    '<div class="es-top11-bench-item" data-open-player-card="' + esc(b.name) + '" title="Clicca per aprire la Card">' +
                      '<span class="es-top11-bench-num">' + esc(b.num) + '</span>' +
                      '<div style="flex:1;"><b>' + esc(b.name) + '</b><div style="font-size:0.75rem; color:#8ea7ba;">' + esc(b.role) + '</div></div>' +
                      '<span class="es-tag es-tag-blue" style="font-size:0.68rem;">Card &rarr;</span>' +
                    '</div>'
                  );
                }).join('') +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  // 3. TAB ESERCITAZIONI
  function renderTabMetodologia(data) {
    var items = data.esercitazioni || [];
    if (activeExFilter !== 'all') {
      items = items.filter(function(x){ return x.categoria.toLowerCase().indexOf(activeExFilter.toLowerCase()) >= 0; });
    }

    return (
      '<div class="es-coach-card">' +
        '<div class="es-coach-card-head">' +
          '<div class="es-coach-card-title-wrap">' +
            '<div><h3>Hub Esercitazioni Pre-Partita & Metodologia</h3><p>Schemi tattici, rondos e routine di riscaldamento con gestione visibilità Privata / Pubblica</p></div>' +
          '</div>' +
          '<button type="button" class="es-btn-primary" id="btn-create-exercise-modal">+ Nuova Esercitazione</button>' +
        '</div>' +

        // Filtri Categorie
        '<div class="es-exercise-filters">' +
          '<button type="button" class="es-filter-btn ' + (activeExFilter === 'all' ? 'is-active' : '') + '" data-ex-filter="all">Tutte</button>' +
          '<button type="button" class="es-filter-btn ' + (activeExFilter === 'rondos' ? 'is-active' : '') + '" data-ex-filter="rondos">Rondos & Possesso</button>' +
          '<button type="button" class="es-filter-btn ' + (activeExFilter === 'inattive' ? 'is-active' : '') + '" data-ex-filter="inattive">Palle Inattive</button>' +
          '<button type="button" class="es-filter-btn ' + (activeExFilter === 'riscaldamento' ? 'is-active' : '') + '" data-ex-filter="riscaldamento">Riscaldamento</button>' +
          '<button type="button" class="es-filter-btn ' + (activeExFilter === 'difensiva' ? 'is-active' : '') + '" data-ex-filter="difensiva">Fase Difensiva</button>' +
        '</div>' +

        '<div class="es-exercises-grid">' +
          (items.length ? items.map(function (ex, exIdx) {
            var isPub = ex.visibilita === 'public';
            return (
              '<div class="es-exercise-card">' +
                '<div class="es-exercise-head">' +
                  '<span class="es-tag es-tag-blue">' + esc(ex.categoria) + '</span>' +
                  '<span class="' + (isPub ? 'es-tag es-tag-green' : 'es-tag es-tag-dark') + '">' + (isPub ? 'Pubblico (Branding)' : 'Privato (Squadra)') + '</span>' +
                '</div>' +
                '<h4 class="es-exercise-title">' + esc(ex.titolo) + '</h4>' +
                '<p class="es-exercise-desc">' + esc(ex.descrizione) + '</p>' +
                '<div class="es-exercise-foot">' +
                  '<span style="font-size:0.78rem; color:#8ea7ba;">Durata: <b>' + esc(ex.durata) + '</b></span>' +
                  '<div style="display:flex; gap:0.4rem;">' +
                    '<button type="button" class="es-btn-secondary" style="padding:4px 8px; font-size:0.75rem;" data-toggle-vis-ex="' + exIdx + '">' + (isPub ? 'Rendi Privato' : 'Rendi Pubblico') + '</button>' +
                    '<button type="button" class="es-coach-action-btn" style="color:#ff4d5a;" data-del-ex="' + exIdx + '">&times;</button>' +
                  '</div>' +
                '</div>' +
              '</div>'
            );
          }).join('') : '<p style="color:#8ea7ba; text-align:center; padding:2rem;">Nessuna esercitazione presente per la categoria selezionata.</p>') +
        '</div>' +
      '</div>'
    );
  }

  // 4. TAB GPS & HEATMAP
  function renderTabGpsHeatmap(data) {
    return (
      '<div class="es-coach-grid-2">' +
        // Dashboard GPS Squadra
        '<div class="es-coach-card">' +
          '<div class="es-coach-card-head">' +
            '<div class="es-coach-card-title-wrap">' +
              '<div><h3>Monitoraggio Telemetria GPS Squadra</h3><p>Carichi fisici, velocità di picco, distanze percorse e stato di forma</p></div>' +
            '</div>' +
          '</div>' +
          '<div class="es-gps-metrics-row">' +
            '<div class="es-coach-stat-box"><span class="es-coach-stat-num">112.4 km</span><span class="es-coach-stat-lbl">DISTANZA TOTALE</span></div>' +
            '<div class="es-coach-stat-box"><span class="es-coach-stat-num">34.8 km/h</span><span class="es-coach-stat-lbl">PICCO VELOCITÀ</span></div>' +
            '<div class="es-coach-stat-box"><span class="es-coach-stat-num">1.08</span><span class="es-coach-stat-lbl">ACWR RATIO</span></div>' +
            '<div class="es-coach-stat-box"><span class="es-coach-stat-num">98.2%</span><span class="es-coach-stat-lbl">EFFICIENZA ATLETICA</span></div>' +
          '</div>' +
          '<table class="es-coach-info-table" style="margin-top:1rem;">' +
            '<tr><th>ATLETA</th><th>DISTANZA</th><th>PICCO KM/H</th><th>ACCELERAZIONI</th><th>READINESS</th></tr>' +
            '<tr><td><b>Éderson</b></td><td>11.8 km</td><td>31.4 km/h</td><td>84</td><td><span class="es-tag es-tag-green">🟢 Ottimale</span></td></tr>' +
            '<tr><td><b>Ademola Lookman</b></td><td>10.4 km</td><td>34.8 km/h</td><td>92</td><td><span class="es-tag es-tag-green">🟢 Picco Top</span></td></tr>' +
            '<tr><td><b>Marten de Roon</b></td><td>11.2 km</td><td>29.8 km/h</td><td>65</td><td><span class="es-tag es-tag-green">🟢 Regolare</span></td></tr>' +
            '<tr><td><b>Gianluca Scamacca</b></td><td>9.5 km</td><td>31.0 km/h</td><td>58</td><td><span class="es-tag es-tag-warn">🟡 In Recupero</span></td></tr>' +
          '</table>' +
        '</div>' +

        // Analisi Heatmap Tattica Sovrapposta
        '<div class="es-coach-card">' +
          '<div class="es-coach-card-head">' +
            '<div class="es-coach-card-title-wrap">' +
              '<div><h3>Analisi Heatmap Tattica Sovrapposta</h3><p>Sovrapposizione delle mappe di calore per occupazione spazi e ampiezza</p></div>' +
            '</div>' +
          '</div>' +
          '<div class="es-heatmap-overlay-wrap">' +
            '<div class="es-heatmap-pitch-bg">' +
              '<div class="es-heatmap-glow-zone is-left"></div>' +
              '<div class="es-heatmap-glow-zone is-center"></div>' +
              '<div class="es-heatmap-glow-zone is-right"></div>' +
              '<div class="es-heatmap-badge-text">Densità Tattica 87% · Ampiezza Catene Laterali Conforme</div>' +
            '</div>' +
          '</div>' +
          '<p style="font-size:0.82rem; color:#8ea7ba; margin:0.8rem 0 0;">Le Heatmap confermano la corretta occupazione dei corridoi esterni e della zona di rifinitura centrale.</p>' +
        '</div>' +
      '</div>'
    );
  }

  // 5. TAB SEGNALAZIONI DS
  function renderTabSegnalazioniDs(data) {
    return (
      '<div class="es-coach-card">' +
        '<div class="es-coach-card-head">' +
          '<div class="es-coach-card-title-wrap">' +
            '<div><h3>Segnalazione Calciatori al Direttore Sportivo</h3><p>Lista dei desideri e suggerimenti tecnici inviati al DS per la sessione di mercato</p></div>' +
          '</div>' +
          '<button type="button" class="es-btn-primary" id="btn-open-segnala-ds">+ Segnala Calciatore al DS</button>' +
        '</div>' +

        '<table class="es-coach-info-table">' +
          '<thead><tr><th>CALCIATORE</th><th>RUOLO</th><th>CLUB ATTUALE</th><th>PRIORITÀ</th><th>NOTE TATTICHE</th><th>STATO TRATTATIVA DS</th></tr></thead>' +
          '<tbody>' +
            (data.wishlistDs && data.wishlistDs.length ? data.wishlistDs.map(function (w) {
              return (
                '<tr>' +
                  '<td><b>' + esc(w.nome) + '</b></td>' +
                  '<td><span class="es-tag es-tag-blue">' + esc(w.ruolo) + '</span></td>' +
                  '<td>' + esc(w.club) + '</td>' +
                  '<td><span class="' + (w.priorita === 'Alta' ? 'es-tag es-tag-red' : 'es-tag es-tag-warn') + '">' + esc(w.priorita) + '</span></td>' +
                  '<td style="max-width:280px; font-size:0.82rem; color:#8ea7ba;">' + esc(w.note) + '</td>' +
                  '<td><span class="es-tag es-tag-green">' + esc(w.stato) + '</span></td>' +
                '</tr>'
              );
            }).join('') : '<tr><td colspan="6" style="text-align:center; padding:2rem; color:#8ea7ba;">Nessun calciatore segnalato al Direttore Sportivo.</td></tr>') +
          '</tbody>' +
        '</table>' +
      '</div>'
    );
  }

  // 6. TAB ROSA
  function renderTabSquadra(data) {
    var roster = data.roster || [];
    if (activeRosterFilter !== 'all') {
      roster = roster.filter(function (p) {
        if (activeRosterFilter === 'por') return /portiere/i.test(p.role);
        if (activeRosterFilter === 'dif') return /difensore|terzino/i.test(p.role);
        if (activeRosterFilter === 'cen') return /mediano|mezzala|centrocampista|trequartista/i.test(p.role);
        if (activeRosterFilter === 'att') return /punta|ala|attaccante/i.test(p.role);
        if (activeRosterFilter === 'disp') return p.status === 'disp';
        return true;
      });
    }

    return (
      '<div class="es-coach-card">' +
        '<div class="es-coach-card-head">' +
          '<div class="es-coach-card-title-wrap">' +
            '<div><h3>Organico Prima Squadra</h3><p>Lista atleti con schede tecniche, presenze e monitoraggio stato disponibilità</p></div>' +
          '</div>' +
          '<button type="button" class="es-btn-primary" id="btn-add-player-coach">+ Aggiungi Giocatore</button>' +
        '</div>' +

        // Filtri Reparto
        '<div class="es-roster-filters">' +
          '<button type="button" class="es-filter-btn ' + (activeRosterFilter === 'all' ? 'is-active' : '') + '" data-r-filter="all">Tutti (' + data.roster.length + ')</button>' +
          '<button type="button" class="es-filter-btn ' + (activeRosterFilter === 'por' ? 'is-active' : '') + '" data-r-filter="por">Portieri</button>' +
          '<button type="button" class="es-filter-btn ' + (activeRosterFilter === 'dif' ? 'is-active' : '') + '" data-r-filter="dif">Difensori</button>' +
          '<button type="button" class="es-filter-btn ' + (activeRosterFilter === 'cen' ? 'is-active' : '') + '" data-r-filter="cen">Centrocampisti</button>' +
          '<button type="button" class="es-filter-btn ' + (activeRosterFilter === 'att' ? 'is-active' : '') + '" data-r-filter="att">Attaccanti</button>' +
          '<button type="button" class="es-filter-btn ' + (activeRosterFilter === 'disp' ? 'is-active' : '') + '" data-r-filter="disp">Disponibili</button>' +
        '</div>' +

        '<div class="es-roster-grid">' +
          (roster.map(function (p) {
            var stText = p.status === 'disp' ? '🟢 Disponibile' : '🟡 Differenziato';
            return (
              '<div class="es-roster-player-card" data-open-player-card="' + esc(p.name) + '">' +
                '<div class="es-roster-num-box">' + esc(p.num) + '</div>' +
                '<div class="es-roster-player-info">' +
                  '<h4 class="es-roster-player-name">' + esc(p.name) + '</h4>' +
                  '<div class="es-roster-player-meta">' + esc(p.role) + ' · Anno <b>' + esc(p.birth || '2000') + '</b></div>' +
                  '<div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.4rem;">' +
                    '<span class="es-tag ' + (p.status === 'disp' ? 'es-tag-green' : 'es-tag-warn') + '" style="font-size:0.68rem;">' + stText + '</span>' +
                    '<span style="font-size:0.75rem; color:#8ea7ba;">Presenze: <b>' + (p.app || 0) + '</b></span>' +
                  '</div>' +
                '</div>' +
              '</div>'
            );
          }).join('')) +
        '</div>' +
      '</div>'
    );
  }

  // 7. TAB ALLENAMENTI
  function renderTabAllenamenti(data) {
    return (
      '<div class="es-coach-card">' +
        '<div class="es-coach-card-head">' +
          '<div class="es-coach-card-title-wrap">' +
            '<div><h3>Sedute di Allenamento & Rilevazione Presenze</h3><p>Pianificazione settimanale e registro delle presenze atleti di campo</p></div>' +
          '</div>' +
          '<button type="button" class="es-btn-primary" id="btn-add-training-coach">+ Pianifica Seduta</button>' +
        '</div>' +

        '<div class="es-trainings-list">' +
          (data.trainingsList || []).map(function (tr, tIdx) {
            var dateParts = (tr.data || '16/09/2026').split('/');
            return (
              '<div class="es-training-card">' +
                '<div class="es-training-date-box">' +
                  '<span class="es-training-date-d">' + esc(dateParts[0] || '16') + '</span>' +
                  '<span class="es-training-date-m">' + esc(dateParts[1] || 'SET') + '</span>' +
                '</div>' +
                '<div class="es-training-main">' +
                  '<div style="display:flex; gap:0.5rem; margin-bottom:0.25rem;">' +
                    '<span class="es-tag es-tag-blue">🕒 ' + esc(tr.orario) + '</span>' +
                    '<span class="es-tag es-tag-dark">📍 ' + esc(tr.luogo) + '</span>' +
                  '</div>' +
                  '<h4 class="es-training-title">' + esc(tr.tipo) + '</h4>' +
                  '<p class="es-training-desc">' + esc(tr.desc) + '</p>' +
                '</div>' +
                '<div class="es-training-actions" style="display:flex; gap:0.5rem; align-items:center;">' +
                  '<button type="button" class="es-btn-primary" style="padding:6px 12px; font-size:0.8rem;" data-open-presenze-idx="' + tIdx + '">Rileva Presenze</button>' +
                  '<button type="button" class="es-coach-action-btn" style="color:#ff4d5a;" data-del-training="' + tIdx + '">&times;</button>' +
                '</div>' +
              '</div>'
            );
          }).join('') +
        '</div>' +
      '</div>'
    );
  }

  // 8. TAB PARTITE
  function renderTabPartite(data) {
    return (
      '<div class="es-coach-card">' +
        '<div class="es-coach-card-head">' +
          '<div class="es-coach-card-title-wrap">' +
            '<div><h3>Calendario Gare & Convocazioni Ufficiali</h3><p>Gestione partite ufficiali, distinte e convocati per il giorno gara</p></div>' +
          '</div>' +
          '<button type="button" class="es-btn-primary" id="btn-add-match-coach">+ Aggiungi Partita</button>' +
        '</div>' +

        '<div class="es-matches-list">' +
          (data.partite || []).map(function (m, mIdx) {
            return (
              '<div class="es-match-card">' +
                '<div class="es-match-main">' +
                  '<div class="es-match-league">' + esc(m.competizione) + '</div>' +
                  '<h4 class="es-match-vs">' + esc(data.clubName) + ' vs ' + esc(m.avversario) + '</h4>' +
                  '<div class="es-match-details"><span>📅 ' + esc(m.data) + ' ore ' + esc(m.orario) + '</span> · <span>📍 ' + esc(m.luogo) + '</span></div>' +
                '</div>' +
                '<div class="es-match-actions">' +
                  '<button type="button" class="es-btn-primary" style="padding:6px 14px; font-size:0.82rem;" data-open-match-convocati="' + mIdx + '">Distinta Convocati (' + (m.convocati ? m.convocati.length : 0) + ')</button>' +
                '</div>' +
              '</div>'
            );
          }).join('') +
        '</div>' +
      '</div>'
    );
  }

  // 9. TAB LAVAGNA TATTICA
  function renderTabLavagna(data) {
    return (
      '<div class="es-coach-card">' +
        '<div class="es-coach-card-head">' +
          '<div class="es-coach-card-title-wrap">' +
            '<div><h3>Lavagna Tattica Digitale Interattiva</h3><p>Posiziona le pedine della squadra e dell\'avversario per preparare schemi e transizioni</p></div>' +
          '</div>' +
          '<div style="display:flex; gap:0.5rem;">' +
            '<button type="button" class="es-btn-secondary" id="btn-reset-board">Reset Lavagna</button>' +
            '<button type="button" class="es-btn-primary" id="btn-save-tactical-scheme">Salva Schema</button>' +
          '</div>' +
        '</div>' +

        '<div class="es-tactical-board-frame" id="es-tactical-board-canvas-box">' +
          '<div class="es-board-canvas-pitch">' +
            '<div class="es-fm-pitch-lines"></div>' +
            (data.boardPins || []).map(function (pin, pIdx) {
              if (pin.type === 'ball') {
                return '<div class="es-board-ball-item" style="left:' + pin.x + '%; top:' + pin.y + '%;" data-pin-idx="' + pIdx + '">⚽</div>';
              }
              return '<div class="es-board-pin-item is-' + (pin.type === 'red' ? 'red' : 'blue') + '" style="left:' + pin.x + '%; top:' + pin.y + '%;" data-pin-idx="' + pIdx + '">' + esc(pin.num) + '</div>';
            }).join('') +
          '</div>' +
        '</div>' +
        '<div style="display:flex; justify-content:space-between; align-items:center; font-size:0.8rem; color:#8ea7ba;">' +
          '<span>🔵 Pedine Squadra Blu · 🔴 Pedine Avversario Rosso · ⚽ Pallone di Gioco</span>' +
          '<span>Clicca su una pedina per spostarla sul campo</span>' +
        '</div>' +
      '</div>'
    );
  }

  // ============================================================
  // PITCH COORDINATES & RENDERING
  // ============================================================
  function getFormationCoords(modulo) {
    var m = String(modulo || '4-3-3').trim();
    if (m === '4-2-3-1') {
      return [
        { x: 50, y: 90 }, // POR
        { x: 86, y: 72 }, { x: 62, y: 74 }, { x: 38, y: 74 }, { x: 14, y: 72 }, // TD, DC, DC, TS
        { x: 62, y: 55 }, { x: 38, y: 55 }, // MED, MED
        { x: 82, y: 35 }, { x: 50, y: 34 }, { x: 18, y: 35 }, // TRD, TRC, TRS
        { x: 50, y: 15 } // ATT
      ];
    }
    if (m === '3-5-2') {
      return [
        { x: 50, y: 90 }, // POR
        { x: 74, y: 75 }, { x: 50, y: 76 }, { x: 26, y: 75 }, // DC, DC, DC
        { x: 90, y: 50 }, { x: 68, y: 52 }, { x: 50, y: 50 }, { x: 32, y: 52 }, { x: 10, y: 50 }, // E, C, C, C, E
        { x: 62, y: 18 }, { x: 38, y: 18 } // ATT, ATT
      ];
    }
    if (m === '3-4-2-1') {
      return [
        { x: 50, y: 90 }, // POR
        { x: 74, y: 75 }, { x: 50, y: 76 }, { x: 26, y: 75 }, // DC, DC, DC
        { x: 88, y: 52 }, { x: 62, y: 54 }, { x: 38, y: 54 }, { x: 12, y: 52 }, // E, C, C, E
        { x: 68, y: 32 }, { x: 32, y: 32 }, // TRQ, TRQ
        { x: 50, y: 14 } // ATT
      ];
    }
    if (m === '4-4-2') {
      return [
        { x: 50, y: 90 }, // POR
        { x: 86, y: 72 }, { x: 62, y: 74 }, { x: 38, y: 74 }, { x: 14, y: 72 }, // DIF
        { x: 86, y: 46 }, { x: 62, y: 48 }, { x: 38, y: 48 }, { x: 14, y: 46 }, // CEN
        { x: 62, y: 18 }, { x: 38, y: 18 } // ATT
      ];
    }
    // Default 4-3-3
    return [
      { x: 50, y: 88 }, // POR
      { x: 86, y: 68 }, { x: 62, y: 72 }, { x: 38, y: 72 }, { x: 14, y: 68 }, // TD, DC, DC, TS
      { x: 50, y: 52 }, { x: 72, y: 44 }, { x: 28, y: 44 }, // MED, CC, CC
      { x: 84, y: 22 }, { x: 16, y: 22 }, { x: 50, y: 14 } // AD, AS, ATT
    ];
  }

  function renderFmPitch(modulo, players) {
    var coords = getFormationCoords(modulo);
    return (
      '<div class="es-fm-pitch">' +
        '<div class="es-fm-pitch-lines"></div>' +
        (players || []).map(function (p, idx) {
          var c = coords[idx] || { x: 50, y: 50 };
          return (
            '<div class="es-fm-pin" style="left:' + c.x + '%; top:' + c.y + '%;" title="' + esc(p.name) + '">' +
              '<span class="es-fm-pin-dot">' + esc(p.pos) + '</span>' +
              '<span class="es-fm-pin-lbl">' + esc(p.name.split(' ').pop()) + '</span>' +
            '</div>'
          );
        }).join('') +
      '</div>'
    );
  }

  function renderInteractiveTop11Pitch(players, modulo) {
    var coords = getFormationCoords(modulo);
    return (
      '<div class="es-fm-pitch is-interactive">' +
        '<div class="es-fm-pitch-lines"></div>' +
        (players || []).map(function (p, idx) {
          var c = coords[idx] || { x: 50, y: 50 };
          return (
            '<div class="es-fm-card-pin" style="left:' + c.x + '%; top:' + c.y + '%;" data-open-player-card="' + esc(p.name) + '" title="Clicca per aprire la Player Card">' +
              '<div class="es-fm-card-circle">#' + esc(p.num) + '</div>' +
              '<div class="es-fm-card-badge">' +
                '<b class="es-fm-card-name">' + esc(p.name) + '</b>' +
                '<span class="es-fm-card-role">' + esc(p.pos) + ' · ★ ' + esc(p.rating || '8.0') + '</span>' +
              '</div>' +
            '</div>'
          );
        }).join('') +
      '</div>'
    );
  }

  // ============================================================
  // MODALI B2B INTERATTIVE
  // ============================================================
  function openCoachModal(title, iconText, contentHtml) {
    var old = document.getElementById('es-coach-modal-overlay');
    if (old) old.remove();

    var modal = document.createElement('div');
    modal.id = 'es-coach-modal-overlay';
    modal.className = 'es-pres-modal-overlay';
    modal.innerHTML =
      '<div class="es-pres-modal-sheet" role="dialog" aria-modal="true" style="border-radius:6px !important; max-width:620px; background:#080f18; border:1px solid #16344a; box-shadow:0 12px 36px rgba(0,0,0,0.8);">' +
        '<button type="button" class="es-pres-modal-close-btn" id="btn-close-coach-modal" aria-label="Chiudi">&times;</button>' +
        '<div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:1.2rem; padding-bottom:0.65rem; border-bottom:1px solid rgba(22,52,74,0.6);">' +
          '<span style="font-size:1.2rem;">' + iconText + '</span>' +
          '<h2 style="font-size:1.15rem; font-weight:800; color:#f4f8fc; margin:0;">' + esc(title) + '</h2>' +
        '</div>' +
        '<div>' + contentHtml + '</div>' +
      '</div>';

    document.body.appendChild(modal);
    function close() { modal.remove(); }
    modal.querySelector('#btn-close-coach-modal').onclick = close;
    modal.onclick = function (e) { if (e.target === modal) close(); };
  }

  // 1. Modale Modifica Identità
  function openEditCoachIdentityModal(data) {
    var isDisp = data.status === 'disponibile';
    var formHtml =
      '<form id="form-edit-identity" style="display:flex; flex-direction:column; gap:1rem;">' +
        '<div class="es-pres-input-group"><label>Nome e Cognome Ufficiale *</label><input type="text" class="es-pres-input-text" id="inp-coach-name" value="' + esc(data.coachName) + '" required></div>' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
          '<div class="es-pres-input-group"><label>Qualifica / Patentino *</label><select class="es-pres-input-text" id="sel-coach-patent" style="background:#050910; color:#fff;"><option ' + (data.patent === 'UEFA Pro' ? 'selected' : '') + '>UEFA Pro</option><option ' + (data.patent === 'UEFA A' ? 'selected' : '') + '>UEFA A</option><option ' + (data.patent === 'UEFA B' ? 'selected' : '') + '>UEFA B</option><option ' + (data.patent === 'UEFA C' ? 'selected' : '') + '>UEFA C</option></select></div>' +
          '<div class="es-pres-input-group"><label>Status Contrattuale *</label><select class="es-pres-input-text" id="sel-coach-status" style="background:#050910; color:#fff;"><option value="in_carica" ' + (!isDisp ? 'selected' : '') + '>In carica presso società</option><option value="disponibile" ' + (isDisp ? 'selected' : '') + '>Disponibile / Cerca Incarico</option></select></div>' +
        '</div>' +
        '<div class="es-pres-input-group"><label>Società / Club Attuale</label><input type="text" class="es-pres-input-text" id="inp-coach-club" value="' + esc(data.clubName) + '"></div>' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
          '<div class="es-pres-input-group"><label>Sede / Città</label><input type="text" class="es-pres-input-text" id="inp-coach-sede" value="' + esc(data.sede) + '"></div>' +
          '<div class="es-pres-input-group"><label>Stadio / Centro Sportivo</label><input type="text" class="es-pres-input-text" id="inp-coach-stadio" value="' + esc(data.stadio) + '"></div>' +
        '</div>' +
        '<div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:0.5rem; padding-top:0.85rem; border-top:1px solid rgba(22,52,74,0.6);">' +
          '<button type="button" class="es-btn-secondary" id="btn-cancel-modal">Annulla</button>' +
          '<button type="submit" class="es-btn-primary">Salva Identità</button>' +
        '</div>' +
      '</form>';

    openCoachModal('Modifica Identità & Qualifica', '🪪', formHtml);
    var overlay = document.getElementById('es-coach-modal-overlay');
    var form = document.getElementById('form-edit-identity');
    var btnCancel = document.getElementById('btn-cancel-modal');
    if (btnCancel && overlay) btnCancel.onclick = function () { overlay.remove(); };

    if (form) {
      form.onsubmit = function (e) {
        e.preventDefault();
        data.coachName = document.getElementById('inp-coach-name').value.trim();
        data.patent = document.getElementById('sel-coach-patent').value;
        data.status = document.getElementById('sel-coach-status').value;
        data.clubName = document.getElementById('inp-coach-club').value.trim();
        data.sede = document.getElementById('inp-coach-sede').value.trim();
        data.stadio = document.getElementById('inp-coach-stadio').value.trim();
        saveCoachData(data);
        if (overlay) overlay.remove();
        renderHub();
        if (window.showToast) window.showToast('Identità allenatore salvata con successo!', 'success');
      };
    }
  }

  // 2. Modale Modifica Vice Allenatore
  function openLinkViceModal(data) {
    var v = data.viceLink || {};
    var formHtml =
      '<p style="color:#8ea7ba; font-size:0.85rem; margin-bottom:1.2rem;">Inserisci o aggiorna i dati del Vice Allenatore per garantire continuità operativa allo staff tecnico:</p>' +
      '<form id="form-link-vice" style="display:flex; flex-direction:column; gap:1rem;">' +
        '<div class="es-pres-input-group"><label>Nome e Cognome Vice Allenatore *</label><input type="text" class="es-pres-input-text" id="inp-vice-name" value="' + esc(v.name || '') + '" required placeholder="Es. Paolo Gentile"></div>' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
          '<div class="es-pres-input-group"><label>Qualifica / Licenza</label><input type="text" class="es-pres-input-text" id="inp-vice-patent" value="' + esc(v.patent || 'UEFA B') + '"></div>' +
          '<div class="es-pres-input-group"><label>Email Ufficiale</label><input type="email" class="es-pres-input-text" id="inp-vice-email" value="' + esc(v.email || '') + '" placeholder="vice@elisee-scout.it"></div>' +
        '</div>' +
        '<div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:0.5rem; padding-top:0.85rem; border-top:1px solid rgba(22,52,74,0.6);">' +
          '<button type="button" class="es-btn-secondary" id="btn-cancel-modal">Annulla</button>' +
          '<button type="submit" class="es-btn-primary">Salva & Collega Vice</button>' +
        '</div>' +
      '</form>';

    openCoachModal('Collegamento Diretto Vice Allenatore', '🤝', formHtml);
    var overlay = document.getElementById('es-coach-modal-overlay');
    var form = document.getElementById('form-link-vice');
    var btnCancel = document.getElementById('btn-cancel-modal');
    if (btnCancel && overlay) btnCancel.onclick = function () { overlay.remove(); };

    if (form) {
      form.onsubmit = function (e) {
        e.preventDefault();
        data.viceLink = {
          id: 'vice-' + Date.now(),
          name: document.getElementById('inp-vice-name').value.trim(),
          role: 'Vice Allenatore / Staff Tecnico',
          patent: document.getElementById('inp-vice-patent').value.trim(),
          email: document.getElementById('inp-vice-email').value.trim(),
          status: 'Collegato',
          lastSync: 'Oggi ore ' + new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
        };
        saveCoachData(data);
        if (overlay) overlay.remove();
        renderHub();
        if (window.showToast) window.showToast('Vice Allenatore collegato ufficialmente!', 'success');
      };
    }
  }

  // 3. Modale Aggiungi Titolo a Palmarès (Reale & Persistente)
  function openAddTrofeoModal(data) {
    var formHtml =
      '<form id="form-add-trofeo" style="display:flex; flex-direction:column; gap:1rem;">' +
        '<div class="es-pres-input-group"><label>Titolo o Successo *</label><input type="text" class="es-pres-input-text" id="inp-pal-titolo" required placeholder="Es. Vincitore Campionato Provinciale"></div>' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
          '<div class="es-pres-input-group"><label>Stagione Sportiva *</label><input type="text" class="es-pres-input-text" id="inp-pal-anno" value="2025/2026" required></div>' +
          '<div class="es-pres-input-group"><label>Tipologia Titolo</label><select class="es-pres-input-text" id="sel-pal-tipo" style="background:#050910; color:#fff;"><option>Campionato</option><option>Promozione di Categoria</option><option>Coppa Provinciale / Regionale</option><option>Titolo Giovanile</option><option>Torneo Ufficiale</option></select></div>' +
        '</div>' +
        '<div class="es-pres-input-group"><label>Note & Dettagli</label><input type="text" class="es-pres-input-text" id="inp-pal-note" placeholder="Es. Imbattuti in casa, 22 vittorie su 26 gare"></div>' +
        '<div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:0.5rem; padding-top:0.85rem; border-top:1px solid rgba(22,52,74,0.6);">' +
          '<button type="button" class="es-btn-secondary" id="btn-cancel-modal">Annulla</button>' +
          '<button type="submit" class="es-btn-primary">Aggiungi a Bacheca</button>' +
        '</div>' +
      '</form>';

    openCoachModal('Certifica Titolo in Palmarès', '🏆', formHtml);
    var overlay = document.getElementById('es-coach-modal-overlay');
    var form = document.getElementById('form-add-trofeo');
    var btnCancel = document.getElementById('btn-cancel-modal');
    if (btnCancel && overlay) btnCancel.onclick = function () { overlay.remove(); };

    if (form) {
      form.onsubmit = function (e) {
        e.preventDefault();
        data.palmares = data.palmares || [];
        data.palmares.push({
          id: 'pal-' + Date.now(),
          titolo: document.getElementById('inp-pal-titolo').value.trim(),
          anno: document.getElementById('inp-pal-anno').value.trim(),
          tipo: document.getElementById('sel-pal-tipo').value,
          note: document.getElementById('inp-pal-note').value.trim()
        });
        saveCoachData(data);
        if (overlay) overlay.remove();
        renderHub();
        if (window.showToast) window.showToast('🏆 Titolo aggiunto alla bacheca ufficiale!', 'success');
      };
    }
  }

  // 4. Modale Nuova Esercitazione
  function openNewExerciseModal(data) {
    var formHtml =
      '<form id="form-new-ex" style="display:flex; flex-direction:column; gap:1rem;">' +
        '<div class="es-pres-input-group"><label>Titolo Esercitazione *</label><input type="text" class="es-pres-input-text" id="inp-ex-titolo" required placeholder="Es. Uscita dal pressing 4v3 con terzo uomo"></div>' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
          '<div class="es-pres-input-group"><label>Categoria *</label><select class="es-pres-input-text" id="sel-ex-cat" style="background:#050910; color:#fff;"><option>Rondos & Possesso</option><option>Palle Inattive</option><option>Riscaldamento</option><option>Fase Difensiva</option><option>Transizioni & Contropiede</option></select></div>' +
          '<div class="es-pres-input-group"><label>Durata Stimata</label><input type="text" class="es-pres-input-text" id="inp-ex-durata" value="20 min"></div>' +
        '</div>' +
        '<div class="es-pres-input-group"><label>Visibilità Scheda *</label><select class="es-pres-input-text" id="sel-ex-vis" style="background:#050910; color:#fff;"><option value="public">Pubblico (Personal Branding per Colleghi & DS)</option><option value="private">Privato (Solo Atleti della Squadra)</option></select></div>' +
        '<div class="es-pres-input-group"><label>Descrizione & Regole Tattiche</label><textarea class="es-pres-input-text" id="inp-ex-desc" rows="3" placeholder="Dimensioni campo, numero tocchi massimi, regole di punteggio..."></textarea></div>' +
        '<div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:0.5rem; padding-top:0.85rem; border-top:1px solid rgba(22,52,74,0.6);">' +
          '<button type="button" class="es-btn-secondary" id="btn-cancel-modal">Annulla</button>' +
          '<button type="submit" class="es-btn-primary">Salva Esercitazione</button>' +
        '</div>' +
      '</form>';

    openCoachModal('Nuova Esercitazione Tattica', '📋', formHtml);
    var overlay = document.getElementById('es-coach-modal-overlay');
    var form = document.getElementById('form-new-ex');
    var btnCancel = document.getElementById('btn-cancel-modal');
    if (btnCancel && overlay) btnCancel.onclick = function () { overlay.remove(); };

    if (form) {
      form.onsubmit = function (e) {
        e.preventDefault();
        data.esercitazioni = data.esercitazioni || [];
        data.esercitazioni.unshift({
          id: 'ex-' + Date.now(),
          titolo: document.getElementById('inp-ex-titolo').value.trim(),
          categoria: document.getElementById('sel-ex-cat').value,
          durata: document.getElementById('inp-ex-durata').value.trim(),
          visibilita: document.getElementById('sel-ex-vis').value,
          descrizione: document.getElementById('inp-ex-desc').value.trim(),
          data: new Date().toLocaleDateString('it-IT')
        });
        saveCoachData(data);
        if (overlay) overlay.remove();
        renderHub();
        if (window.showToast) window.showToast('Esercitazione inserita nell\'Hub!', 'success');
      };
    }
  }

  // 5. Modale Segnalazione Mercato al DS
  function openSegnalaAlDsModal(data) {
    var formHtml =
      '<form id="form-segnala-ds" style="display:flex; flex-direction:column; gap:1rem;">' +
        '<div class="es-pres-input-group"><label>Calciatore Segnalato *</label><input type="text" class="es-pres-input-text" id="inp-ds-name" required placeholder="Nome e Cognome"></div>' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
          '<div class="es-pres-input-group"><label>Ruolo</label><input type="text" class="es-pres-input-text" id="inp-ds-ruolo" placeholder="Es. Mediano davanti alla difesa"></div>' +
          '<div class="es-pres-input-group"><label>Club Attuale</label><input type="text" class="es-pres-input-text" id="inp-ds-club" placeholder="Es. Squadra di provenienza"></div>' +
        '</div>' +
        '<div class="es-pres-input-group"><label>Priorità di Mercato *</label><select class="es-pres-input-text" id="sel-ds-prio" style="background:#050910; color:#fff;"><option value="Alta">Alta (Rinforzo Prioritario)</option><option value="Media" selected>Media (Opportunità di Rotazione)</option><option value="Bassa">Bassa (Prospettiva Futura)</option></select></div>' +
        '<div class="es-pres-input-group"><label>Motivazione per il DS</label><textarea class="es-pres-input-text" id="inp-ds-note" rows="3" placeholder="Perché questo profilo si integra con i nostri principi di gioco..."></textarea></div>' +
        '<div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:0.5rem; padding-top:0.85rem; border-top:1px solid rgba(22,52,74,0.6);">' +
          '<button type="button" class="es-btn-secondary" id="btn-cancel-modal">Annulla</button>' +
          '<button type="submit" class="es-btn-primary">Invia al DS</button>' +
        '</div>' +
      '</form>';

    openCoachModal('Segnalazione Tecnica al DS', '🎯', formHtml);
    var overlay = document.getElementById('es-coach-modal-overlay');
    var form = document.getElementById('form-segnala-ds');
    var btnCancel = document.getElementById('btn-cancel-modal');
    if (btnCancel && overlay) btnCancel.onclick = function () { overlay.remove(); };

    if (form) {
      form.onsubmit = function (e) {
        e.preventDefault();
        data.wishlistDs = data.wishlistDs || [];
        data.wishlistDs.unshift({
          id: 'wl-' + Date.now(),
          nome: document.getElementById('inp-ds-name').value.trim(),
          ruolo: document.getElementById('inp-ds-ruolo').value.trim() || 'Attaccante',
          club: document.getElementById('inp-ds-club').value.trim() || 'Club',
          priorita: document.getElementById('sel-ds-prio').value,
          note: document.getElementById('inp-ds-note').value.trim(),
          data: new Date().toLocaleDateString('it-IT'),
          stato: 'Inviato al DS'
        });
        saveCoachData(data);
        if (overlay) overlay.remove();
        renderHub();
        if (window.showToast) window.showToast('🎯 Segnalazione inviata con successo al DS!', 'success');
      };
    }
  }

  // 6. Modale Esportazione Social Story 9:16
  function openSocialStoryModal(data) {
    var contentHtml =
      '<div style="display:flex; flex-direction:column; align-items:center; gap:1rem;">' +
        '<div style="width:240px; aspect-ratio:9/16; background:#040810; border:2px solid #16b9ff; border-radius:12px; padding:1.2rem; display:flex; flex-direction:column; justify-content:space-between; box-shadow:0 8px 24px rgba(0,0,0,0.8);">' +
          '<div style="text-align:center;">' +
            '<div style="font-size:0.7rem; font-weight:800; color:#16b9ff; letter-spacing:0.08em; text-transform:uppercase;">MATCHDAY · TOP 11</div>' +
            '<h3 style="font-size:1rem; font-weight:900; color:#ffffff; margin:0.3rem 0 0;">' + esc(data.clubName) + '</h3>' +
            '<span style="font-size:0.68rem; color:#8ea7ba;">MODULO: ' + esc(data.moduloPrincipale) + '</span>' +
          '</div>' +
          '<div style="display:flex; flex-direction:column; gap:4px; font-size:0.68rem;">' +
            (data.top11 || []).slice(0, 11).map(function(p){
              return '<div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.06); padding:2px 0;"><span>#' + esc(p.num) + ' ' + esc(p.name) + '</span><b style="color:#16b9ff;">' + esc(p.pos) + '</b></div>';
            }).join('') +
          '</div>' +
          '<div style="border-top:1px solid #16344a; padding-top:0.4rem; display:flex; justify-content:space-between; font-size:0.62rem; color:#8ea7ba;">' +
            '<span>Mister ' + esc(data.coachName) + '</span>' +
            '<b>ELISEE SCOUT</b>' +
          '</div>' +
        '</div>' +
        '<button type="button" class="es-btn-primary" id="btn-copy-story-act" style="width:100%;">Condividi Story Instagram & TikTok</button>' +
      '</div>';

    openCoachModal('Top 11 Social Story 9:16', '📲', contentHtml);
    var overlay = document.getElementById('es-coach-modal-overlay');
    var btn = document.getElementById('btn-copy-story-act');
    if (btn) {
      btn.onclick = function () {
        if (window.showToast) window.showToast('✨ Grafica 9:16 pronta per la pubblicazione social!', 'success');
        if (overlay) overlay.remove();
      };
    }
  }

  // 7. Modale Rileva Presenze Seduta
  function openPresenzeModal(tIdx, data) {
    var tr = (data.trainingsList || [])[tIdx];
    if (!tr) return;
    tr.presenze = tr.presenze || {};

    var listHtml = (data.roster || []).map(function (p) {
      var cur = tr.presenze[p.name] || 'pres';
      return (
        '<div style="display:flex; justify-content:space-between; align-items:center; background:#050910; border:1px solid #16344a; border-radius:4px; padding:0.5rem 0.75rem;">' +
          '<div><b>#' + esc(p.num) + ' ' + esc(p.name) + '</b> <span style="font-size:0.75rem; color:#8ea7ba;">(' + esc(p.role) + ')</span></div>' +
          '<div style="display:flex; gap:0.3rem;">' +
            '<button type="button" class="es-btn-secondary ' + (cur === 'pres' ? 'es-tag-green' : '') + '" style="padding:3px 8px; font-size:0.72rem;" data-set-att="' + esc(p.name) + '" data-val="pres">Presente</button>' +
            '<button type="button" class="es-btn-secondary ' + (cur === 'diff' ? 'es-tag-warn' : '') + '" style="padding:3px 8px; font-size:0.72rem;" data-set-att="' + esc(p.name) + '" data-val="diff">Differenziato</button>' +
            '<button type="button" class="es-btn-secondary ' + (cur === 'ass' ? 'es-tag-red' : '') + '" style="padding:3px 8px; font-size:0.72rem;" data-set-att="' + esc(p.name) + '" data-val="ass">Assente</button>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    var content =
      '<p style="font-size:0.84rem; color:#8ea7ba; margin-bottom:1rem;">Seduta: <b>' + esc(tr.tipo) + '</b> del ' + esc(tr.data) + ' (' + esc(tr.orario) + '):</p>' +
      '<div style="display:flex; flex-direction:column; gap:0.4rem; max-height:360px; overflow-y:auto; margin-bottom:1rem;">' + listHtml + '</div>' +
      '<div style="display:flex; justify-content:flex-end;">' +
        '<button type="button" class="es-btn-primary" id="btn-save-att">Conferma Presenze</button>' +
      '</div>';

    openCoachModal('Registro Presenze Seduta', '⏱️', content);
    var overlay = document.getElementById('es-coach-modal-overlay');
    if (overlay) {
      overlay.querySelectorAll('[data-set-att]').forEach(function (btn) {
        btn.onclick = function () {
          var pName = btn.getAttribute('data-set-att');
          var val = btn.getAttribute('data-val');
          tr.presenze[pName] = val;
          saveCoachData(data);
          openPresenzeModal(tIdx, data);
        };
      });
      var btnSave = overlay.querySelector('#btn-save-att');
      if (btnSave) {
        btnSave.onclick = function () {
          saveCoachData(data);
          overlay.remove();
          renderHub();
          if (window.showToast) window.showToast('Presenze seduta registrate con successo!', 'success');
        };
      }
    }
  }

  // ============================================================
  // EVENT BINDINGS
  // ============================================================
  function bindHubEvents() {
    var mount = document.getElementById('es-cd');
    if (!mount) return;

    var data = getCoachData();

    // Tab Navigation
    mount.querySelectorAll('.es-coach-navbtn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var t = btn.getAttribute('data-tab');
        if (t) {
          activeTab = t;
          renderHub();
        }
      });
    });

    // Modulo Tattico Dropdown
    var selMod = mount.querySelector('#sel-tactics-module');
    if (selMod) {
      selMod.onchange = function () {
        data.moduloPrincipale = selMod.value;
        saveCoachData(data);
        renderHub();
      };
    }

    // Filtri Categorie Esercitazioni
    mount.querySelectorAll('[data-ex-filter]').forEach(function (btn) {
      btn.onclick = function () {
        activeExFilter = btn.getAttribute('data-ex-filter');
        renderHub();
      };
    });

    // Filtri Roster
    mount.querySelectorAll('[data-r-filter]').forEach(function (btn) {
      btn.onclick = function () {
        activeRosterFilter = btn.getAttribute('data-r-filter');
        renderHub();
      };
    });

    // Top buttons
    var btnGuida = mount.querySelector('#btn-guida-allenatore');
    if (btnGuida) {
      btnGuida.onclick = function () {
        openCoachModal('Guida di Ruolo · Allenatore Capo', '📖',
          '<div style="font-size:0.86rem; color:#8ea7ba; line-height:1.6; display:flex; flex-direction:column; gap:0.8rem;">' +
            '<div style="padding:0.75rem; background:#050910; border-left:3px solid #16b9ff; border-radius:4px;">' +
              '<b style="color:#f4f8fc;">Technical Staff Operating System:</b><br>' +
              'La suite Allenatore Capo gestisce l\'intero flusso metodologico: definizione moduli, Top 11 per il match, monitoraggio carichi GPS e coordinamento con il Vice Allenatore.' +
            '</div>' +
            '<p><b>1. Bacheca Trofei:</b> Registra unicamente vittorie e promozioni verificate della tua carriera calcistica.</p>' +
            '<p><b>2. Vice Allenatore:</b> Il collegamento bidirezionale permette al Vice di preparare workstation e bozze da sottoporre alla tua approvazione.</p>' +
            '<p><b>3. Segnalazioni DS:</b> Invia raccomandazioni tecniche sui profili target direttamente nella War Room del Direttore Sportivo.</p>' +
          '</div>'
        );
      };
    }

    var btnQuickStory = mount.querySelector('#btn-quick-story-export');
    if (btnQuickStory) btnQuickStory.onclick = function () { openSocialStoryModal(data); };

    var btnExportStory2 = mount.querySelector('#btn-export-story-modal');
    if (btnExportStory2) btnExportStory2.onclick = function () { openSocialStoryModal(data); };

    var btnQuickEx = mount.querySelector('#btn-quick-new-exercise');
    if (btnQuickEx) btnQuickEx.onclick = function () { openNewExerciseModal(data); };

    var btnCreateEx2 = mount.querySelector('#btn-create-exercise-modal');
    if (btnCreateEx2) btnCreateEx2.onclick = function () { openNewExerciseModal(data); };

    var btnEditId = mount.querySelector('#btn-edit-coach-identity');
    if (btnEditId) btnEditId.onclick = function () { openEditCoachIdentityModal(data); };

    var btnLinkVice = mount.querySelector('#btn-link-vice-modal');
    if (btnLinkVice) btnLinkVice.onclick = function () { openLinkViceModal(data); };

    var btnLinkVice2 = mount.querySelector('#btn-link-vice-modal-2');
    if (btnLinkVice2) btnLinkVice2.onclick = function () { openLinkViceModal(data); };

    var btnAddTrofeo = mount.querySelector('#btn-add-trofeo-modal');
    if (btnAddTrofeo) btnAddTrofeo.onclick = function () { openAddTrofeoModal(data); };

    var btnSegnalaDs = mount.querySelector('#btn-open-segnala-ds');
    if (btnSegnalaDs) btnSegnalaDs.onclick = function () { openSegnalaAlDsModal(data); };

    var btnOpenVice = mount.querySelector('#btn-open-vice-profile');
    if (btnOpenVice) {
      btnOpenVice.onclick = function () {
        if (window.showToast) window.showToast('Scheda Vice Allenatore: ' + (data.viceLink ? data.viceLink.name : ''), 'info');
      };
    }

    // Presenze Seduta
    mount.querySelectorAll('[data-open-presenze-idx]').forEach(function (btn) {
      btn.onclick = function () {
        var idx = parseInt(btn.getAttribute('data-open-presenze-idx'));
        openPresenzeModal(idx, data);
      };
    });

    // Click sui giocatori per Player Card
    mount.querySelectorAll('[data-open-player-card]').forEach(function (el) {
      el.addEventListener('click', function () {
        var name = el.getAttribute('data-open-player-card');
        if (window.openPlayerCardModal) {
          window.openPlayerCardModal({ name: name, club: data.clubName });
        } else if (window.showToast) {
          window.showToast('👤 Scheda Atleta: ' + name, 'info');
        }
      });
    });

    // Toggle visibilità esercitazione
    mount.querySelectorAll('[data-toggle-vis-ex]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var idx = parseInt(btn.getAttribute('data-toggle-vis-ex'));
        if (data.esercitazioni && data.esercitazioni[idx]) {
          data.esercitazioni[idx].visibilita = data.esercitazioni[idx].visibilita === 'public' ? 'private' : 'public';
          saveCoachData(data);
          renderHub();
        }
      });
    });

    // Elimina esercitazione
    mount.querySelectorAll('[data-del-ex]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var idx = parseInt(btn.getAttribute('data-del-ex'));
        if (confirm('Vuoi eliminare questa esercitazione?')) {
          data.esercitazioni.splice(idx, 1);
          saveCoachData(data);
          renderHub();
        }
      });
    });

    // Elimina trofeo palmares
    mount.querySelectorAll('[data-del-pal-idx]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var idx = parseInt(btn.getAttribute('data-del-pal-idx'));
        if (confirm('Vuoi rimuovere questo titolo dalla bacheca?')) {
          data.palmares.splice(idx, 1);
          saveCoachData(data);
          renderHub();
        }
      });
    });

    // Elimina seduta
    mount.querySelectorAll('[data-del-training]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var idx = parseInt(btn.getAttribute('data-del-training'));
        if (confirm('Vuoi eliminare questa seduta dal calendario?')) {
          data.trainingsList.splice(idx, 1);
          saveCoachData(data);
          renderHub();
        }
      });
    });

    // Reset Lavagna Tattica
    var btnResetBoard = mount.querySelector('#btn-reset-board');
    if (btnResetBoard) {
      btnResetBoard.onclick = function () {
        data.boardPins = [
          { id: 'bp-1', type: 'blue', num: '1', x: 50, y: 88 },
          { id: 'bp-2', type: 'blue', num: '2', x: 84, y: 68 },
          { id: 'bp-3', type: 'blue', num: '5', x: 62, y: 72 },
          { id: 'bp-4', type: 'blue', num: '6', x: 38, y: 72 },
          { id: 'bp-5', type: 'blue', num: '3', x: 16, y: 68 },
          { id: 'bp-6', type: 'blue', num: '4', x: 50, y: 52 },
          { id: 'bp-7', type: 'blue', num: '8', x: 70, y: 44 },
          { id: 'bp-8', type: 'blue', num: '10', x: 30, y: 44 },
          { id: 'bp-9', type: 'blue', num: '7', x: 82, y: 24 },
          { id: 'bp-10', type: 'blue', num: '11', x: 18, y: 24 },
          { id: 'bp-11', type: 'blue', num: '9', x: 50, y: 16 },
          { id: 'ball', type: 'ball', x: 50, y: 35 }
        ];
        saveCoachData(data);
        renderHub();
        if (window.showToast) window.showToast('Lavagna tattica reimpostata.', 'info');
      };
    }

    var btnSaveTactic = mount.querySelector('#btn-save-tactical-scheme');
    if (btnSaveTactic) {
      btnSaveTactic.onclick = function () {
        saveCoachData(data);
        if (window.showToast) window.showToast('💾 Schema tattico salvato nel database locale!', 'success');
      };
    }
  }

  // ============================================================
  // EXPORT & ROUTING INTEGRATION
  // ============================================================
  window.EliseeCoachDash = {
    render: renderHub,
    isCoach: isCoach,
    getData: getCoachData
  };

  // Aggancio automatico su cambio hash o login
  window.addEventListener('hashchange', function () {
    if (window.location.hash.indexOf('user-dossier') >= 0 && isCoach()) {
      setTimeout(renderHub, 60);
    }
  });

  document.addEventListener('DOMContentLoaded', function () {
    if (window.location.hash.indexOf('user-dossier') >= 0 && isCoach()) {
      setTimeout(renderHub, 120);
    }
  });
})();
