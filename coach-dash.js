/* ============================================================
   ELISEE SCOUT — AREA ALLENATORE CAPO (HEAD COACH CONTROL ROOM)
   Technical Staff Operating System — Football Technical Staff OS
   Navigazione gestionale unificata esclusivamente nella sidebar sinistra
   ============================================================ */
(function () {
  'use strict';

  var activeTab = 'dashboard'; // 'dashboard' | 'rosa' | 'formazione' | 'tattica' | 'allenamenti' | 'calendario' | 'analisi_avversario' | 'gps_carichi' | 'report_staff' | 'comunicazioni' | 'impostazioni'
  var activeRosterFilter = 'all';
  var rosterSearchQuery = '';
  var activeTacticalPreset = 'costruzione';
  var calendarViewMode = 'settimana';
  var countdownInterval = null;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function userObj() {
    try {
      var u = JSON.parse(localStorage.getItem('elisee_active_user') || localStorage.getItem('elisee_user_data') || '{}') || {};
      if (!u.squadra || /atalanta|carlentini/i.test(u.squadra)) u.squadra = 'Foggia City';
      if (!u.club || /atalanta|carlentini/i.test(u.club)) u.club = 'Foggia City';
      return u;
    } catch (_) { return { squadra: 'Foggia City', club: 'Foggia City' }; }
  }

  function isCoach(u) {
    if (typeof u === 'string') {
      var s = u.trim().toLowerCase();
      if (!s || s === 'staff') return false;
      if (/in seconda|vice allenatore|mental coach|collaboratore tecnico|preparatore|match analyst|video analyst|fisioterapista|medico|osservatore|scout|direttore|presidente/.test(s)) {
        return false;
      }
      return s === 'allenatore' || s === 'mister' || s === 'coach' || /\ballenatore capo\b/.test(s) || s === 'tecnico';
    }
    u = u || userObj();
    if (!u || typeof u !== 'object') return false;
    var candidates = [
      u.staffRole,
      u.ruoloDettagliato,
      u.staffProfile && u.staffProfile.fieldRole,
      u.staffProfile && u.staffProfile.staffRole,
      u.ruolo,
      u.role
    ];
    for (var i = 0; i < candidates.length; i++) {
      var val = String(candidates[i] || '').trim().toLowerCase();
      if (!val || val === 'staff') continue;
      if (/in seconda|vice allenatore|mental coach|collaboratore tecnico|preparatore|match analyst|video analyst|fisioterapista|medico|osservatore|scout|direttore|presidente/.test(val)) {
        return false;
      }
      if (val === 'allenatore' || val === 'mister' || val === 'coach' || /\ballenatore capo\b/.test(val) || val === 'tecnico') {
        return true;
      }
    }
    return false;
  }

  function getCoachData() {
    var u = userObj();
    var def = {
      coachName: [u.nome, u.cognome].filter(Boolean).join(' ').trim() || u.username || 'Elisee Miraglia',
      coachRole: u.staffRole || 'Allenatore Capo',
      patent: u.qualifica || (u.staffProfile && u.staffProfile.qualifica) || 'UEFA B',
      status: 'in_carica',
      clubName: u.squadra || 'Foggia City',
      categoria: 'Amatoriale · Foggia',
      reparto: 'Prima Squadra',
      matricola: u.matricola || '88210',
      scadenzaTesseramento: '30/06/2027',
      sede: 'Foggia (FG)',
      stadio: 'Campo Comunale - Foggia',
      telefono: u.telefono || '+39 340 1234567',
      logoUrl: 'immagini/squadre-loghi/foggia-city.png',

      // Prossima Partita & Countdown
      nextMatch: {
        avversario: 'Cerignola Nord',
        data: '15/09/2026',
        orario: '15:00',
        luogo: 'Campo Comunale - Foggia',
        competizione: 'Amatoriale · Girone Foggia',
        giorniMancanti: 2,
        oreMancanti: 15,
        minutiMancanti: 24
      },

      // Seduta Odierna
      sedutaOdierna: {
        tipo: 'Rifinitura',
        orario: '10:00 - 11:30',
        stato: 'In programma'
      },

      // Calendario Prossime Gare
      prossimeGare: [
        { id: 'g-1', data: '15/09/2026 15:00', comp: 'Amatoriale · Girone Foggia', avv: 'Cerignola Nord', stadio: 'Comunale - Foggia', status: 'Prossima', isNext: true },
        { id: 'g-2', data: '22/09/2026 15:00', comp: 'Amatoriale · Girone Foggia', avv: 'Lucera Sport', stadio: 'Comunale - Lucera', status: 'Da preparare', isNext: false },
        { id: 'g-3', data: '29/09/2026 15:00', comp: 'Amatoriale · Girone Foggia', avv: 'Manfredonia 04', stadio: 'Comunale - Manfredonia', status: 'Da preparare', isNext: false },
        { id: 'g-4', data: '06/10/2026 15:00', comp: 'Amatoriale · Girone Foggia', avv: 'San Severo', stadio: 'Comunale - San Severo', status: 'Da preparare', isNext: false },
        { id: 'g-5', data: '13/10/2026 15:00', comp: 'Coppa Amatori', avv: 'Troia Calcio', stadio: 'Comunale - Troia', status: 'Da preparare', isNext: false }
      ],

      // Ultima Sessione
      ultimaSessione: {
        tipo: 'Rifinitura',
        data: '14/09/2026 - 10:00',
        durata: '1h 30m',
        carico: 'Medio',
        giocatori: '24/26',
        esercizi: 6,
        obiettivi: 3
      },

      // Collegamento Diretto Vice Allenatore
      viceLink: {
        id: 'vice-official-1',
        name: 'Paolo Gentile',
        role: 'Vice Allenatore / Staff Tecnico',
        patent: 'UEFA B',
        email: 'paolo.gentile@elisee-scout.it',
        status: 'Collegato',
        lastSync: '14/09/2026 - 18:45'
      },

      // Modulo & Tattica
      moduloPrincipale: '4-3-3',
      moduloSecondario: '4-2-3-1',
      formazioneUfficialeConfermata: true,

      // Top 11 & Panchina
      top11: [
        { num: 1, pos: 'POR', name: 'M. Falcone', rating: '7.8' },
        { num: 2, pos: 'TD', name: 'G. Basile', rating: '7.5' },
        { num: 5, pos: 'DC', name: 'A. De Rosa', rating: '8.2' },
        { num: 6, pos: 'DC', name: 'L. Marotta', rating: '7.9' },
        { num: 3, pos: 'TS', name: 'D. Caruso', rating: '7.4' },
        { num: 4, pos: 'MED', name: 'S. Amato', rating: '8.0' },
        { num: 8, pos: 'CC', name: 'F. Valenti', rating: '7.7' },
        { num: 10, pos: 'CC', name: 'E. Miraglia Jr', rating: '8.5' },
        { num: 7, pos: 'AD', name: 'R. Bonaccorsi', rating: '8.1' },
        { num: 11, pos: 'AS', name: 'C. Russo', rating: '7.9' },
        { num: 9, pos: 'ATT', name: 'M. Santoro', rating: '8.6' }
      ],
      panchina: [
        { num: 12, pos: 'POR', name: 'A. Vitale', role: 'Portiere' },
        { num: 13, pos: 'DIF', name: 'P. Romano', role: 'Difensore Centrale' },
        { num: 14, pos: 'DIF', name: 'M. Pellegrino', role: 'Terzino Destro' },
        { num: 15, pos: 'CEN', name: 'G. Leone', role: 'Mezzala' },
        { num: 16, pos: 'CEN', name: 'N. Ferrara', role: 'Trequartista' },
        { num: 17, pos: 'ATT', name: 'V. Guida', role: 'Ala Sinistra' },
        { num: 18, pos: 'ATT', name: 'F. Longo', role: 'Punta Centrale' }
      ],

      // Rosa Completa
      roster: [
        { num: 1, name: 'M. Falcone', role: 'Portiere', birth: 2001, status: 'disp', app: 4, load: '9.2 km', acwr: '1.04' },
        { num: 2, name: 'G. Basile', role: 'Terzino Destro', birth: 2003, status: 'disp', app: 4, load: '10.5 km', acwr: '1.08' },
        { num: 5, name: 'A. De Rosa', role: 'Difensore Centrale', birth: 1999, status: 'disp', app: 4, load: '9.8 km', acwr: '1.02' },
        { num: 6, name: 'L. Marotta', role: 'Difensore Centrale', birth: 2000, status: 'disp', app: 4, load: '10.1 km', acwr: '1.06' },
        { num: 3, name: 'D. Caruso', role: 'Terzino Sinistro', birth: 2002, status: 'disp', app: 3, load: '11.2 km', acwr: '1.14' },
        { num: 4, name: 'S. Amato', role: 'Mediano', birth: 1998, status: 'disp', app: 4, load: '11.8 km', acwr: '1.09' },
        { num: 8, name: 'F. Valenti', role: 'Mezzala', birth: 2001, status: 'disp', app: 4, load: '11.5 km', acwr: '1.11' },
        { num: 10, name: 'E. Miraglia Jr', role: 'Trequartista', birth: 2002, status: 'disp', app: 4, load: '10.8 km', acwr: '1.05' },
        { num: 7, name: 'R. Bonaccorsi', role: 'Ala Destra', birth: 2003, status: 'disp', app: 4, load: '10.9 km', acwr: '1.12' },
        { num: 11, name: 'C. Russo', role: 'Ala Sinistra', birth: 2000, status: 'diff', app: 2, load: '7.4 km', acwr: '0.88' },
        { num: 9, name: 'M. Santoro', role: 'Punta Centrale', birth: 1999, status: 'disp', app: 4, load: '10.2 km', acwr: '1.07' },
        { num: 12, name: 'A. Vitale', role: 'Portiere', birth: 2004, status: 'disp', app: 0, load: '6.5 km', acwr: '0.95' },
        { num: 13, name: 'P. Romano', role: 'Difensore Centrale', birth: 2002, status: 'disp', app: 2, load: '8.9 km', acwr: '1.01' },
        { num: 14, name: 'M. Pellegrino', role: 'Terzino Destro', birth: 2004, status: 'diff', app: 1, load: '6.8 km', acwr: '0.84' },
        { num: 15, name: 'G. Leone', role: 'Mezzala', birth: 2003, status: 'disp', app: 3, load: '9.4 km', acwr: '1.03' },
        { num: 16, name: 'N. Ferrara', role: 'Trequartista', birth: 2001, status: 'disp', app: 2, load: '8.7 km', acwr: '1.02' },
        { num: 17, name: 'V. Guida', role: 'Ala Sinistra', birth: 2002, status: 'disp', app: 3, load: '9.1 km', acwr: '1.05' },
        { num: 18, name: 'F. Longo', role: 'Punta Centrale', birth: 2003, status: 'disp', app: 2, load: '8.4 km', acwr: '0.99' }
      ],

      // Notifiche Live Staff
      notifiche: [
        { id: 'n-1', dot: 'green', text: 'Nuovo report dal Vice Allenatore', sub: 'Palle inattive offensive', date: '14/09/2026 - 18:45', action: 'report' },
        { id: 'n-2', dot: 'cyan', text: 'Approvazione formazione richiesta', sub: 'Bozza 4-3-3 presentata al Mister', date: '14/09/2026 - 16:20', action: 'formazione' },
        { id: 'n-3', dot: 'danger', text: 'Giocatore infortunato', sub: 'C. Russo: risentimento flessori', date: '13/09/2026 - 21:10', action: 'rosa' },
        { id: 'n-4', dot: 'warn', text: 'Aggiornamento carichi GPS', sub: '2 atleti in zona di monitoraggio affaticamento', date: '13/09/2026 - 17:32', action: 'gps' },
        { id: 'n-5', dot: 'cyan', text: 'Nuova scheda workstation', sub: 'Uscita dal pressing basso & scarico terzino', date: '12/09/2026 - 15:44', action: 'workstation' }
      ],

      // Ultimi Log Attività
      logAttivita: [
        { date: '14/09 18:45', text: 'Report dal Vice Allenatore - Palle inattive offensive' },
        { date: '14/09 16:20', text: 'Approvazione formazione - Richiesta al Mister' },
        { date: '13/09 21:10', text: 'Aggiornamento infortunati - 2 giocatori' },
        { date: '12/09 15:44', text: 'Nuova scheda creata - Uscita dal pressing basso' }
      ],

      // Impegni Staff
      prossimiImpegni: [
        { title: 'Seduta di allenamento', time: '15/09/2026 - 10:00', type: 'Rifinitura' },
        { title: 'Riunione tecnica', time: '15/09/2026 - 14:30', type: 'Analisi avversario' },
        { title: 'Video analisi', time: '16/09/2026 - 16:00', type: 'A.C. Ragusa' }
      ],

      // Sedute Pianificate
      trainingsList: [
        { id: 'tr-1', tipo: 'Rifinitura', data: '15/09/2026', orario: '10:00 - 11:30', luogo: 'Stadio Comunale - Carlentini', desc: 'Attivazione dinamica, rapidità 10m, schemi su palla inattiva e conclusioni.', carico: 'Medio', presenze: {} },
        { id: 'tr-2', tipo: 'Seduta Tattica Reparti', data: '13/09/2026', orario: '15:30 - 17:15', luogo: 'Stadio Comunale - Carlentini', desc: 'Linea difensiva a 4, pressing orientato e uscite dal basso.', carico: 'Alto', presenze: {} },
        { id: 'tr-3', tipo: 'Potenza Aerobica & Rondos', data: '11/09/2026', orario: '15:30 - 17:30', luogo: 'Centro Sportivo', desc: 'Rondos 5v2 ad alta intensità e blocchi di corsa intermittente.', carico: 'Alto', presenze: {} }
      ],

      // Comunicazioni Allenatore <-> Vice
      messaggiStaff: [
        { id: 'm-1', from: 'Paolo Gentile (Vice)', text: 'Mister, ho completato la scheda sui calci d\'angolo dell\'A.C. Ragusa. Lavorano con 2 saltatori sul secondo palo.', time: '14/09 18:45', prio: 'Tattica' },
        { id: 'm-2', from: 'Elisee Miraglia (Mister)', text: 'Ottimo Paolo. Domani mattina in rifinitura dedichiamo 20 minuti al blocco a zona mista.', time: '14/09 19:10', prio: 'Ordinaria' },
        { id: 'm-3', from: 'Paolo Gentile (Vice)', text: 'Ricevuto Mister, preparo già i cinesini e le pettorine per i due gruppi.', time: '14/09 19:15', prio: 'Ordinaria' }
      ],

      // Analisi Avversario
      analisiAvversario: {
        nome: 'A.C. RAGUSA',
        campionato: 'Serie D - Girone I',
        modulo: '4-3-1-2 (Rombo)',
        puntiForza: 'Densità centrale, trequartista abile tra le linee, contropiede rapido.',
        puntiDeboli: 'Vulnerabili sui cambi di gioco, terzini spesso troppo alti in transizione negativa.',
        giocatoriChiave: 'Capocannoniere n.9 (14 gol), Playmaker n.10.',
        palleInattive: 'Corner a uscire battuti col piede invertito, 3 saltatori a rimorchio.',
        videoReport: 'Sintesi video ultimi 3 match (vittoria 2-1, pareggio 0-0, vittoria 3-0).'
      },

      // Pedine Lavagna Tattica
      boardPins: [
        { id: 'bp-1', type: 'blue', num: '1', name: 'Falcone', x: 50, y: 88 },
        { id: 'bp-2', type: 'blue', num: '2', name: 'Basile', x: 84, y: 68 },
        { id: 'bp-3', type: 'blue', num: '5', name: 'De Rosa', x: 62, y: 72 },
        { id: 'bp-4', type: 'blue', num: '6', name: 'Marotta', x: 38, y: 72 },
        { id: 'bp-5', type: 'blue', num: '3', name: 'Caruso', x: 16, y: 68 },
        { id: 'bp-6', type: 'blue', num: '4', name: 'Amato', x: 50, y: 52 },
        { id: 'bp-7', type: 'blue', num: '8', name: 'Valenti', x: 70, y: 44 },
        { id: 'bp-8', type: 'blue', num: '10', name: 'Miraglia', x: 30, y: 44 },
        { id: 'bp-9', type: 'blue', num: '7', name: 'Bonaccorsi', x: 82, y: 24 },
        { id: 'bp-10', type: 'blue', num: '11', name: 'Russo', x: 18, y: 24 },
        { id: 'bp-11', type: 'blue', num: '9', name: 'Santoro', x: 50, y: 16 },
        { id: 'bp-red-1', type: 'red', num: '9', name: 'Punta Avv', x: 48, y: 65 },
        { id: 'bp-red-2', type: 'red', num: '10', name: 'Treq Avv', x: 52, y: 56 },
        { id: 'ball', type: 'ball', num: '', name: 'Palla', x: 50, y: 38 }
      ]
    };

    try {
      var raw = localStorage.getItem('elisee_coach_data');
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && (/carlentini/i.test(parsed.clubName) || !parsed.clubName)) {
          parsed.clubName = 'Foggia City';
        }
        return Object.assign({}, def, parsed);
      }
    } catch (_) {}

    return def;
  }

  function saveCoachData(data) {
    try {
      localStorage.setItem('elisee_coach_data', JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('elisee:coach-updated', { detail: { data: data } }));
    } catch (_) {}
  }

  // ============================================================
  // RENDER PRINCIPALE
  // ============================================================
  function renderHub(user) {
    user = user || userObj();
    if (!isCoach(user)) return;

    if (typeof window.unmountAllRoleDashboards === 'function') {
      try { window.unmountAllRoleDashboards('es-cd'); } catch (_) {}
    }
    var sh = document.getElementById('es-staff-profile');
    if (!sh) return;

    var mount = document.getElementById('es-cd');
    if (!mount) {
      mount = document.createElement('div');
      mount.id = 'es-cd';
      mount.className = 'es-pd';
      sh.insertBefore(mount, sh.firstChild);
    }
    mount.hidden = false;
    mount.removeAttribute('hidden');
    mount.style.display = 'block';
    sh.classList.add('es-cd-on');

    var grp = document.getElementById('user-dossier-view-group');
    if (grp) grp.classList.add('is-coach-dash');
    try { document.body.classList.add('is-coach-mode'); } catch (_) {}

    var data = getCoachData();

    var html =
      '<div class="es-cos-shell">' +
        // 1. SIDEBAR TECNICA SINISTRA (Con Identità Club in Fondo - Immagine 2)
        '<aside class="es-cos-sidebar">' +
          '<div class="es-cos-brand-header">' +
            '<div class="es-cos-brand-title">ELISEE <span>SCOUT</span></div>' +
            '<div class="es-cos-brand-sub">Area Staff Tecnico</div>' +
          '</div>' +
          '<nav class="es-cos-sidebar-nav" id="es-cos-side-nav">' +
            renderSideBtn('dashboard', 'Dashboard', '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>') +
            renderSideBtn('rosa', 'Rosa', '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>') +
            renderSideBtn('formazione', 'Formazione', '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>') +
            renderSideBtn('tattica', 'Tattica', '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg>') +
            renderSideBtn('allenamenti', 'Allenamenti', '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5"/><path d="M12 5V2"/><path d="M10 2h4"/></svg>') +
            renderSideBtn('calendario', 'Calendario', '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>') +
            renderSideBtn('analisi_avversario', 'Analisi Avversario', '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>') +
            renderSideBtn('gps_carichi', 'GPS / Carichi', '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>') +
            renderSideBtn('report_staff', 'Report Staff', '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>') +
            renderSideBtn('comunicazioni', 'Comunicazioni', '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>') +
            renderSideBtn('impostazioni', 'Impostazioni Tecniche', '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06-.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>') +
          '</nav>' +
        '</aside>' +
        '<div class="es-cos-sidebar-overlay" id="es-cos-sidebar-overlay"></div>' +

        // 2. MAIN WORKSPACE
        '<main class="es-cos-main">' +
          // HEADER IDENTITÀ + COUNTDOWN + PARTITA + SEDUTA + PULSANTE VICE (Due Fasce Ordinate)
          '<div class="card es-cos-card es-cos-dash-header">' +
            // Fascia Superiore: Profilo Mister + Club + Tasto Vice
            '<div class="es-cos-header-top-row">' +
              '<button type="button" class="es-cos-mobile-menu-btn" id="btn-toggle-coach-sidebar" aria-label="Menu Staff">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>' +
              '</button>' +
              '<div class="es-cos-header-identity">' +
                '<div class="es-cos-header-block">' +
                  '<div class="licence-badge es-cos-licence-badge"><strong>UEFA B</strong><span>Patentino</span></div>' +
                  '<div class="es-cos-coach-info">' +
                    '<strong>' + esc(data.coachName) + '</strong>' +
                    '<span class="role">Allenatore Capo</span>' +
                    '<p class="sub">Tesseramento FIGC: ' + esc(data.matricola) + ' · Scadenza: 30/06/2027</p>' +
                  '</div>' +
                '</div>' +

                '<div class="es-cos-header-sep"></div>' +

                '<div class="es-cos-header-block es-cos-club-info">' +
                  '<div class="crest es-cos-crest">FGC</div>' +
                  '<div>' +
                    '<strong>' + esc(data.clubName) + '</strong>' +
                    '<span class="sub-team">Prima Squadra</span><br/>' +
                    '<span>' + esc(data.categoria) + '</span>' +
                  '</div>' +
                '</div>' +
              '</div>' +

              '<button type="button" class="es-cos-btn-vice-jump" id="btn-goto-vice-area">' +
                'Area Vice Allenatore &rarr;' +
              '</button>' +
            '</div>' +

            // Fascia Inferiore: Prossima Partita + Countdown + Seduta
            '<div class="es-cos-header-match-row">' +
              '<div class="es-cos-match-target">' +
                '<p class="label">Prossima Partita</p>' +
                '<p class="when" id="match-when">' + esc(data.nextMatch.data) + ' - ' + esc(data.nextMatch.orario) + '</p>' +
                '<div class="opp">' +
                  '<div class="crest crest--sm es-cos-crest--sm">CRG</div>' +
                  '<div>' +
                    '<strong id="match-opp">' + esc(data.nextMatch.avversario) + '</strong>' +
                    '<span id="match-comp">' + esc(data.categoria) + '</span>' +
                    '<span id="match-venue">' + esc(data.nextMatch.luogo) + '</span>' +
                  '</div>' +
                '</div>' +
              '</div>' +

              '<div class="es-cos-countdown">' +
                '<div>' +
                  '<p class="label">Mancano</p>' +
                  '<div class="es-cos-countdown-nums" id="countdown-nums">' +
                    '<div><strong id="cd-days">02</strong><span>Giorni</span></div>' +
                    '<div><strong id="cd-hours">15</strong><span>Ore</span></div>' +
                    '<div><strong id="cd-mins">24</strong><span>Min</span></div>' +
                  '</div>' +
                '</div>' +
              '</div>' +

              '<div class="es-cos-session-pill">' +
                '<strong>● Seduta odierna</strong>' +
                '<span id="today-session">Rifinitura · 10:00 - 11:30</span>' +
              '</div>' +
            '</div>' +
          '</div>' +

          // TAB BAR SUPERIORE (Sincronizzata con la Sidebar)
          '<nav class="es-cos-nav-tabs" id="es-cos-main-tabs">' +
            renderNavTab('dashboard', 'Dashboard', '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>') +
            renderNavTab('rosa', 'Rosa', '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>') +
            renderNavTab('formazione', 'Formazione', '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>') +
            renderNavTab('tattica', 'Tattica', '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg>') +
            renderNavTab('allenamenti', 'Allenamenti', '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5"/><path d="M12 5V2"/><path d="M10 2h4"/></svg>') +
            renderNavTab('calendario', 'Calendario', '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>') +
            renderNavTab('analisi_avversario', 'Analisi Avversario', '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>') +
            renderNavTab('gps_carichi', 'GPS / Carichi', '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>') +
            renderNavTab('report_staff', 'Report Staff', '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>') +
            renderNavTab('comunicazioni', 'Comunicazioni', '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>') +
            renderNavTab('impostazioni', 'Impostazioni', '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06-.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>') +
          '</nav>' +

          // CONTENITORE OPERATIVO DIRETTO
          '<div id="es-cos-active-content">' +
            renderActiveTab(activeTab, data) +
          '</div>' +
        '</main>' +
      '</div>';

    mount.innerHTML = html;
    bindAllEvents();
    startCountdown();
  }

  function renderSideBtn(tabKey, label, svgIcon) {
    var isAct = activeTab === tabKey;
    return '<button type="button" class="es-cos-side-btn ' + (isAct ? 'is-active' : '') + '" data-tab-nav="' + tabKey + '">' +
      svgIcon + '<span>' + esc(label) + '</span>' +
    '</button>';
  }

  function renderNavTab(tabKey, label, svgIcon) {
    var isAct = activeTab === tabKey;
    return '<button type="button" class="' + (isAct ? 'is-active' : '') + '" data-tab-nav="' + tabKey + '">' +
      svgIcon + '<span>' + esc(label) + '</span>' +
    '</button>';
  }

  // ============================================================
  // DISPATCHER SEZIONI
  // ============================================================
  function renderActiveTab(tab, data) {
    if (tab === 'dashboard') return renderDashboard(data);
    if (tab === 'rosa') return renderRosa(data);
    if (tab === 'formazione') return renderFormazione(data);
    if (tab === 'tattica') return renderTattica(data);
    if (tab === 'allenamenti') return renderAllenamenti(data);
    if (tab === 'calendario') return renderCalendario(data);
    if (tab === 'analisi_avversario') return renderAnalisiAvversario(data);
    if (tab === 'gps_carichi') return renderGpsCarichi(data);
    if (tab === 'report_staff') return renderReportStaff(data);
    if (tab === 'comunicazioni') return renderComunicazioni(data);
    if (tab === 'impostazioni') return renderImpostazioni(data);
    return '<div class="es-cos-panel"><div class="es-cos-panel-body">Sezione in caricamento...</div></div>';
  }

  // ============================================================
  // 1. SEZIONE DASHBOARD (Allineata fedelmente a Immagine 2)
  // ============================================================
  function renderDashboard(data) {
    var statItems = [
      { key: "calendar", label: "Prossima Gara", value: "15/09/2026", foot: "Cerignola Nord · 2 giorni", color: "blue", tab: "calendario" },
      { key: "check", label: "Ultima Seduta", value: "14/09/2026", foot: "✓ Rifinitura · Completata", color: "green", tab: "allenamenti" },
      { key: "heart", label: "Carico Squadra", value: "78%", foot: "Ottimale", color: "green", bar: 78, tab: "gps_carichi" },
      { key: "users", label: "Disponibilità Rosa", value: "24/26 · 92%", foot: "Ottimale", color: "blue", bar: 92, tab: "rosa" },
      { key: "alert", label: "Giocatori indisponibili", value: "2 (7.7%)", foot: "⚠ Da monitorare", color: "red", tab: "rosa" },
      { key: "trend", label: "Preparazione Partita", value: "80%", foot: "In corso", color: "blue", bar: 80, tab: "formazione" },
      { key: "file", label: "Report ricevuti", value: "3", foot: "+1 recente", color: "blue", tab: "report_staff" },
      { key: "calcheck", label: "Sedute programmate", value: "5", foot: "Questa settimana", color: "blue", tab: "allenamenti" }
    ];

    var ICONS = {
      calendar: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
      check: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>',
      heart: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>',
      users: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
      alert: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
      trend: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 17 9 11 13 15 21 6"/><polyline points="14 6 21 6 21 13"/></svg>',
      file: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
      calcheck: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M9 14l2 2 4-4"/></svg>'
    };

    var COLOR_MAP = { blue: "var(--cos-blue)", green: "var(--cos-green)", red: "var(--cos-red)", amber: "var(--cos-amber)" };
    var SOFT_MAP = { blue: "var(--cos-blue-soft)", green: "var(--cos-green-soft)", red: "var(--cos-red-soft)", amber: "var(--cos-amber-soft)" };

    return (
      '<div style="display:flex; flex-direction:column; gap:18px;">' +
        // 1. RIEPILOGO STAGIONALE (8 Stat Cards - Immagine 2)
        '<section class="es-cos-card es-cos-stat-grid-8">' +
          statItems.map(function (s) {
            var barHtml = '<div class="es-cos-bar-track' + (s.bar ? '' : ' is-placeholder') + '">' +
              (s.bar ? '<div class="es-cos-bar-fill" style="width:' + s.bar + '%; background:' + COLOR_MAP[s.color] + ';"></div>' : '') +
            '</div>';
            return (
              '<div class="es-cos-stat-card" data-tab-nav="' + esc(s.tab) + '" style="cursor:pointer;" title="Visualizza dettagli ' + esc(s.label) + '">' +
                '<div class="es-cos-stat-card-icon" style="background:' + SOFT_MAP[s.color] + '; color:' + COLOR_MAP[s.color] + ';">' + ICONS[s.key] + '</div>' +
                '<p class="es-cos-stat-card-label">' + esc(s.label) + '</p>' +
                '<p class="es-cos-stat-card-value">' + esc(s.value) + '</p>' +
                barHtml +
                '<span class="es-cos-stat-card-foot" style="color:' + COLOR_MAP[s.color] + ';">' + esc(s.foot) + '</span>' +
              '</div>'
            );
          }).join('') +
        '</section>' +

        // 2. GRIGLIA CENTRALE (Calendario 1.4fr / Ultima Sessione 1.1fr / Notifiche 1fr)
        '<section class="es-cos-grid-main-3">' +
          // Blocco A: Calendario Prossime Gare (con colonna Stadio & Tag Blu "Da preparare")
          '<div class="es-cos-card" style="padding:20px;">' +
            '<div class="es-cos-section-title">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
              '<span>Calendario Prossime Gare</span>' +
              '<a class="es-cos-section-link" data-tab-nav="calendario">Visualizza tutto &rarr;</a>' +
            '</div>' +
            '<table class="es-cos-match-table">' +
              '<thead><tr><th>Data</th><th>Competizione</th><th>Avversario</th><th>Stadio</th><th></th></tr></thead>' +
              '<tbody>' +
                data.prossimeGare.map(function (m) {
                  var isNext = m.status === 'Prossima' || m.isNext || m.avv.indexOf('Cerignola') !== -1;
                  var dotColor = isNext ? 'var(--cos-amber)' : 'var(--cos-blue)';
                  var tagClass = isNext ? 'is-next' : 'is-prep';
                  var tagLabel = isNext ? 'Prossima' : 'Da preparare';
                  var miniCrest = m.avv.slice(0, 3).toUpperCase();
                  return (
                    '<tr data-tab-nav="analisi_avversario" title="Apri analisi tattica ' + esc(m.avv) + '">' +
                      '<td style="white-space:nowrap;"><span class="es-cos-match-dot" style="background:' + dotColor + ';"></span>' + esc(m.data) + '</td>' +
                      '<td style="color:var(--cos-text-muted);">' + esc(m.comp) + '</td>' +
                      '<td><div class="es-cos-opp-cell"><span class="crest crest--sm es-cos-crest--sm">' + esc(miniCrest) + '</span>' + esc(m.avv) + '</div></td>' +
                      '<td style="color:var(--cos-text-muted);">' + esc(m.stadio) + '</td>' +
                      '<td><span class="es-cos-status-tag ' + tagClass + '">' + tagLabel + ' &rsaquo;</span></td>' +
                    '</tr>'
                  );
                }).join('') +
              '</tbody>' +
            '</table>' +
          '</div>' +

          // Blocco B: Ultima Sessione Svolta
          '<div class="es-cos-card" style="padding:20px;">' +
            '<div class="es-cos-section-title">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>' +
              '<span>Ultima Sessione</span>' +
              '<a class="es-cos-section-link" data-tab-nav="allenamenti">Dettagli &rarr;</a>' +
            '</div>' +
            '<div class="es-cos-session-thumb">' +
              '<svg class="es-pitch-svg" viewBox="0 0 300 94" preserveAspectRatio="none">' +
                '<rect x="8" y="7" width="284" height="80" rx="3" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1.5"/>' +
                '<line x1="150" y1="7" x2="150" y2="87" stroke="rgba(255,255,255,0.45)" stroke-width="1.5"/>' +
                '<circle cx="150" cy="47" r="20" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1.5"/>' +
                '<circle cx="150" cy="47" r="2" fill="rgba(255,255,255,0.7)"/>' +
                '<rect x="8" y="24" width="36" height="46" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1.5"/>' +
                '<rect x="8" y="34" width="14" height="26" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1.5"/>' +
                '<circle cx="34" cy="47" r="1.5" fill="rgba(255,255,255,0.7)"/>' +
                '<rect x="256" y="24" width="36" height="46" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1.5"/>' +
                '<rect x="278" y="34" width="14" height="26" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1.5"/>' +
                '<circle cx="266" cy="47" r="1.5" fill="rgba(255,255,255,0.7)"/>' +
              '</svg>' +
              '<span class="es-cos-session-thumb-badge">Seduta Tattica · 11 vs 11</span>' +
            '</div>' +
            '<div class="es-cos-session-meta-row">' +
              '<div>' +
                '<strong>' + esc(data.ultimaSessione.tipo) + '</strong>' +
                '<span>' + esc(data.ultimaSessione.data) + ' - 10:00 · ' + esc(data.ultimaSessione.durata) + '</span>' +
              '</div>' +
              '<span style="color:var(--cos-green); font-size:12px; font-weight:700;">Carico: ' + esc(data.ultimaSessione.carico) + '</span>' +
            '</div>' +
            '<div class="es-cos-session-substats">' +
              '<div><strong>' + esc(data.ultimaSessione.giocatori) + '</strong>Giocatori</div>' +
              '<div><strong>' + esc(data.ultimaSessione.esercizi) + '</strong>Esercizi</div>' +
              '<div><strong>' + esc(data.ultimaSessione.obiettivi) + '</strong>Obiettivi</div>' +
            '</div>' +
            '<div class="es-cos-staff-report-box">' +
              '<div>' +
                '<strong>Report Staff</strong>' +
                '<span>Ultimo report dal Vice Allenatore · Palle inattive</span>' +
              '</div>' +
              '<button type="button" class="es-btn-outline-sm" data-tab-nav="report_staff">Apri Report &rarr;</button>' +
            '</div>' +
          '</div>' +

          // Blocco C: Notifiche Live Staff
          '<div class="es-cos-card" style="padding:20px;">' +
            '<div class="es-cos-section-title">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>' +
              '<span>Notifiche</span>' +
              '<a class="es-cos-section-link" data-tab-nav="comunicazioni">Visualizza tutte &rarr;</a>' +
            '</div>' +
            '<div class="es-cos-notif-list">' +
              data.notifiche.slice(0, 5).map(function (n) {
                var notifIcons = {
                  green: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
                  danger: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
                  warn: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
                  cyan: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'
                };
                var iconKey = n.dot === 'green' ? 'green' : (n.dot === 'danger' ? 'danger' : (n.dot === 'warn' ? 'warn' : 'cyan'));
                var iconColor = n.dot === 'green' ? 'var(--cos-green)' : (n.dot === 'danger' ? 'var(--cos-red)' : (n.dot === 'warn' ? 'var(--cos-amber)' : 'var(--cos-cyan)'));
                var softColor = n.dot === 'green' ? 'var(--cos-green-soft)' : (n.dot === 'danger' ? 'var(--cos-red-soft)' : (n.dot === 'warn' ? 'var(--cos-amber-soft)' : 'var(--cos-cyan-soft)'));
                return (
                  '<div class="es-cos-notif-item" data-notif-action="' + esc(n.action) + '">' +
                    '<span class="es-cos-notif-icon" style="background:' + softColor + '; color:' + iconColor + ';">' + (notifIcons[iconKey] || notifIcons.green) + '</span>' +
                    '<div style="flex:1;">' +
                      '<strong>' + esc(n.text) + '</strong>' +
                      '<span>' + esc(n.date) + '</span>' +
                    '</div>' +
                    '<span style="color:var(--cos-text-faint); font-size:16px;">&rsaquo;</span>' +
                  '</div>'
                );
              }).join('') +
            '</div>' +
          '</div>' +
        '</section>' +

        // 3. GRIGLIA INFERIORE (Ultimi Log 1fr / Carico Settimanale 1.2fr / Prossimi Impegni 1fr)
        '<section class="es-cos-grid-lower-3">' +
          // Blocco 1: Ultimi Log Attività (con icona orologio SVG)
          '<div class="es-cos-card" style="padding:20px;">' +
            '<div class="es-cos-section-title">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2 3 14h9l-1 8 10-12h-9z"/></svg>' +
              '<span>Ultimi Log Attività</span>' +
              '<a class="es-cos-section-link" data-tab-nav="report_staff">Visualizza tutto &rarr;</a>' +
            '</div>' +
            '<div class="es-cos-log-list">' +
              data.logAttivita.map(function (l) {
                return (
                  '<div class="es-cos-log-item">' +
                    '<span class="es-cos-log-time">' +
                      '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg>' +
                      esc(l.date) +
                    '</span>' +
                    '<span class="es-cos-log-text">' + esc(l.text) + '</span>' +
                  '</div>'
                );
              }).join('') +
            '</div>' +
          '</div>' +

          // Blocco 2: Carico Settimanale Squadra (Asse Y + Barre + Gauge ad Anello con Pillola Ottimale)
          '<div class="es-cos-card" style="padding:20px;">' +
            '<div class="es-cos-section-title">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M18 9l-5 5-4-4-4 4"/></svg>' +
              '<span>Carico Settimanale Squadra</span>' +
            '</div>' +
            '<div class="es-cos-weekchart-wrap">' +
              '<div class="es-cos-weekchart-axis"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div>' +
              '<div class="es-cos-weekchart">' +
                '<div class="es-cos-weekchart-bar"><div class="fill" style="height:62%;"></div><span class="day">Lun</span></div>' +
                '<div class="es-cos-weekchart-bar"><div class="fill" style="height:74%;"></div><span class="day">Mar</span></div>' +
                '<div class="es-cos-weekchart-bar"><div class="fill" style="height:55%;"></div><span class="day">Mer</span></div>' +
                '<div class="es-cos-weekchart-bar"><div class="fill" style="height:68%;"></div><span class="day">Gio</span></div>' +
                '<div class="es-cos-weekchart-bar"><div class="fill" style="height:80%;"></div><span class="day">Ven</span></div>' +
                '<div class="es-cos-weekchart-bar"><div class="fill" style="height:78%;"></div><span class="day">Sab</span></div>' +
                '<div class="es-cos-weekchart-bar"><div class="fill" style="height:40%;"></div><span class="day">Dom</span></div>' +
              '</div>' +
            '</div>' +
            '<div class="es-cos-gauge-wrap">' +
              '<div class="es-cos-gauge-circle" style="background: conic-gradient(var(--cos-green) 280deg, rgba(255,255,255,0.08) 280deg);">' +
                '<div class="es-cos-gauge-circle-inner">' +
                  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2 3 14h9l-1 8 10-12h-9z"/></svg>' +
                '</div>' +
              '</div>' +
              '<div class="es-cos-gauge-meta">' +
                '<strong>78%</strong>' +
                '<p class="label">Media Settimanale</p>' +
                '<span class="es-cos-gauge-pill-status">Ottimale</span>' +
              '</div>' +
            '</div>' +
          '</div>' +

          // Blocco 3: Prossimi Impegni Staff
          '<div class="es-cos-card" style="padding:20px;">' +
            '<div class="es-cos-section-title">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/></svg>' +
              '<span>Prossimi Impegni Staff</span>' +
              '<a class="es-cos-section-link" data-tab-nav="calendario">Visualizza tutto &rarr;</a>' +
            '</div>' +
            '<div class="es-cos-impegni-list">' +
              data.prossimiImpegni.map(function (imp) {
                return (
                  '<div class="es-cos-impegno-item">' +
                    '<div>' +
                      '<strong>' + esc(imp.title) + '</strong>' +
                      '<span class="when">' + esc(imp.time) + '</span>' +
                    '</div>' +
                    '<span class="what">' + esc(imp.type) + '</span>' +
                  '</div>'
                );
              }).join('') +
            '</div>' +
          '</div>' +
        '</section>' +
      '</div>'
    );
  }

  // ============================================================
  // 2. SEZIONE ROSA
  // ============================================================
  function renderRosa(data) {
    var list = data.roster || [];
    if (activeRosterFilter !== 'all') {
      list = list.filter(function (p) {
        if (activeRosterFilter === 'por') return /portiere/i.test(p.role);
        if (activeRosterFilter === 'dif') return /difensore|terzino/i.test(p.role);
        if (activeRosterFilter === 'cen') return /mediano|mezzala|centrocampista|trequartista/i.test(p.role);
        if (activeRosterFilter === 'att') return /punta|ala|attaccante/i.test(p.role);
        if (activeRosterFilter === 'disp') return p.status === 'disp';
        if (activeRosterFilter === 'diff') return p.status === 'diff';
        return true;
      });
    }
    if (rosterSearchQuery) {
      list = list.filter(function (p) {
        return p.name.toLowerCase().indexOf(rosterSearchQuery.toLowerCase()) >= 0 ||
               p.role.toLowerCase().indexOf(rosterSearchQuery.toLowerCase()) >= 0;
      });
    }

    return (
      '<div class="es-cos-panel-card">' +
        '<div class="es-cos-panel-head">' +
          '<span class="es-cos-panel-title">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' +
            'Organico Rosa Prima Squadra · ' + esc(data.clubName) + ' (' + list.length + ' Atleti)' +
          '</span>' +
          '<button type="button" class="es-btn-cos-primary" id="btn-add-player-modal">+ Aggiungi Calciatore</button>' +
        '</div>' +

        '<div class="es-cos-roster-toolbar" style="display:flex; justify-content:space-between; align-items:center; gap:1rem; flex-wrap:wrap; margin-bottom:1rem;">' +
          '<input type="text" class="es-cos-search-input" id="inp-roster-search" placeholder="Cerca calciatore per nome o ruolo..." value="' + esc(rosterSearchQuery) + '" style="background:#071522; border:1px solid #12344a; color:#f3f8fc; padding:0.5rem 0.85rem; border-radius:6px; font-size:0.82rem; width:260px;">' +
          '<div style="display:flex; gap:0.35rem; flex-wrap:wrap;">' +
            '<button type="button" class="es-btn-cos-sec ' + (activeRosterFilter === 'all' ? 'is-active' : '') + '" style="padding:0.4rem 0.75rem; font-size:0.75rem;" data-r-filter="all">Tutti</button>' +
            '<button type="button" class="es-btn-cos-sec ' + (activeRosterFilter === 'por' ? 'is-active' : '') + '" style="padding:0.4rem 0.75rem; font-size:0.75rem;" data-r-filter="por">Portieri</button>' +
            '<button type="button" class="es-btn-cos-sec ' + (activeRosterFilter === 'dif' ? 'is-active' : '') + '" style="padding:0.4rem 0.75rem; font-size:0.75rem;" data-r-filter="dif">Difensori</button>' +
            '<button type="button" class="es-btn-cos-sec ' + (activeRosterFilter === 'cen' ? 'is-active' : '') + '" style="padding:0.4rem 0.75rem; font-size:0.75rem;" data-r-filter="cen">Centrocampisti</button>' +
            '<button type="button" class="es-btn-cos-sec ' + (activeRosterFilter === 'att' ? 'is-active' : '') + '" style="padding:0.4rem 0.75rem; font-size:0.75rem;" data-r-filter="att">Attaccanti</button>' +
            '<button type="button" class="es-btn-cos-sec ' + (activeRosterFilter === 'disp' ? 'is-active' : '') + '" style="padding:0.4rem 0.75rem; font-size:0.75rem;" data-r-filter="disp">Disponibili</button>' +
            '<button type="button" class="es-btn-cos-sec ' + (activeRosterFilter === 'diff' ? 'is-active' : '') + '" style="padding:0.4rem 0.75rem; font-size:0.75rem;" data-r-filter="diff">Differenziati</button>' +
          '</div>' +
        '</div>' +

        '<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:1rem;">' +
          (list.length ? list.map(function (p, pIdx) {
            var isDisp = p.status === 'disp';
            return (
              '<div style="background:#071522; border:1px solid #12344a; border-radius:8px; padding:0.9rem; display:flex; gap:0.75rem; align-items:center; cursor:pointer;" data-player-card-idx="' + pIdx + '">' +
                '<div style="width:42px; height:42px; border-radius:8px; background:#040912; border:1px solid #16b9ff; color:#16b9ff; font-size:1.1rem; font-weight:900; display:flex; align-items:center; justify-content:center; flex-shrink:0;">#' + esc(p.num) + '</div>' +
                '<div style="display:flex; flex-direction:column; gap:2px; flex:1 1 auto;">' +
                  '<div style="font-size:0.9rem; font-weight:800; color:#f3f8fc;">' + esc(p.name) + '</div>' +
                  '<div style="font-size:0.72rem; color:#8da8bc;">' + esc(p.role) + ' · Classe ' + esc(p.birth) + '</div>' +
                  '<div style="display:flex; justify-content:space-between; align-items:center; margin-top:3px;">' +
                    '<span class="es-cos-badge-pill ' + (isDisp ? 'is-green' : 'is-warn') + '">' + (isDisp ? '🟢 Disponibile' : '🟡 Differenziato') + '</span>' +
                    '<span style="font-size:0.72rem; color:#8da8bc;">Presenze: <b>' + (p.app || 0) + '</b></span>' +
                  '</div>' +
                '</div>' +
              '</div>'
            );
          }).join('') : '<div style="grid-column:1/-1; text-align:center; padding:3rem; color:#8da8bc;">Nessun calciatore trovato.</div>') +
        '</div>' +
      '</div>'
    );
  }

  // ============================================================
  // 3. SEZIONE FORMAZIONE
  // ============================================================
  function renderFormazione(data) {
    return (
      '<div class="es-cos-panel-card">' +
        '<div class="es-cos-panel-head">' +
          '<div style="display:flex; align-items:center; gap:0.75rem;">' +
            '<span class="es-cos-panel-title">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>' +
              'Lineup Builder Ufficiale · XI Titolare' +
            '</span>' +
            '<select id="sel-tactical-modulo" style="background:#071522; border:1px solid #12344a; color:#16b9ff; padding:0.35rem 0.75rem; border-radius:6px; font-size:0.82rem; font-weight:800;">' +
              '<option value="4-3-3" ' + (data.moduloPrincipale === '4-3-3' ? 'selected' : '') + '>4-3-3 (Offensivo con Ali)</option>' +
              '<option value="4-2-3-1" ' + (data.moduloPrincipale === '4-2-3-1' ? 'selected' : '') + '>4-2-3-1 (Doppio Mediano & Trequarti)</option>' +
              '<option value="3-5-2" ' + (data.moduloPrincipale === '3-5-2' ? 'selected' : '') + '>3-5-2 (Ampiezza Quinti)</option>' +
              '<option value="3-4-2-1" ' + (data.moduloPrincipale === '3-4-2-1' ? 'selected' : '') + '>3-4-2-1 (Doppio Trequarti)</option>' +
              '<option value="4-4-2" ' + (data.moduloPrincipale === '4-4-2' ? 'selected' : '') + '>4-4-2 (Classico Lineare)</option>' +
            '</select>' +
          '</div>' +
          '<div style="display:flex; gap:0.5rem;">' +
            '<button type="button" class="es-btn-cos-sec" id="btn-export-story-modal">📲 Story 9:16</button>' +
            '<button type="button" class="es-btn-cos-primary" id="btn-confirm-official-xi">✓ Conferma Formazione Ufficiale</button>' +
          '</div>' +
        '</div>' +

        '<div style="display:grid; grid-template-columns:1.4fr 1fr; gap:1.25rem;">' +
          '<div style="background:#061e11; border:2px solid #16562f; border-radius:10px; position:relative; aspect-ratio:16/10; overflow:hidden;">' +
            '<div style="position:absolute; inset:0; background:radial-gradient(circle at 50% 50%, rgba(0,217,120,0.08) 0%, transparent 80%);"></div>' +
            renderPitchPins(data.top11, data.moduloPrincipale) +
          '</div>' +

          '<div style="display:flex; flex-direction:column; gap:1rem;">' +
            '<div style="background:#071522; border:1px solid #12344a; border-radius:8px; padding:0.85rem;">' +
              '<div style="font-size:0.85rem; font-weight:800; color:#f3f8fc; text-transform:uppercase; margin-bottom:0.5rem; display:flex; justify-content:space-between;">' +
                '<span>A Disposizione (Panchina)</span>' +
                '<span style="color:#16b9ff;">' + (data.panchina ? data.panchina.length : 0) + ' Calciatori</span>' +
              '</div>' +
              '<div style="display:flex; flex-direction:column; gap:0.4rem; max-height:260px; overflow-y:auto;">' +
                (data.panchina && data.panchina.length ? data.panchina.map(function (b) {
                  return (
                    '<div style="display:flex; justify-content:space-between; align-items:center; background:#040912; border:1px solid #12344a; border-radius:5px; padding:0.45rem 0.65rem;">' +
                      '<div style="display:flex; align-items:center; gap:0.5rem;">' +
                        '<b style="color:#16b9ff;">#' + esc(b.num) + '</b>' +
                        '<span>' + esc(b.name) + '</span>' +
                      '</div>' +
                      '<span class="es-cos-badge-pill is-blue" style="font-size:0.65rem;">' + esc(b.pos || b.role) + '</span>' +
                    '</div>'
                  );
                }).join('') : '') +
              '</div>' +
            '</div>' +
            '<div style="background:rgba(0,217,120,0.06); border:1px solid rgba(0,217,120,0.3); border-radius:8px; padding:0.85rem; font-size:0.8rem; line-height:1.45;">' +
              '<b style="color:#00d978;">Stato Ufficiale:</b> Formazione convalidata dal Mister. Consegne tecniche sincronizzate con la Bozza del Vice Allenatore.' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function renderPitchPins(players, modulo) {
    var coords = getFormationCoords(modulo);
    return coords.map(function (c, idx) {
      var p = (players || [])[idx] || { num: idx + 1, name: 'Titolare ' + (idx + 1), pos: getSlotRole(idx, modulo) };
      return (
        '<div style="position:absolute; left:' + c.x + '%; top:' + c.y + '%; transform:translate(-50%, -50%); display:flex; flex-direction:column; align-items:center; gap:2px; cursor:pointer;" data-player-pin-idx="' + idx + '">' +
          '<div style="width:36px; height:36px; border-radius:50%; background:#071522; border:2px solid #16b9ff; color:#f3f8fc; font-size:0.82rem; font-weight:900; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 10px rgba(0,0,0,0.6);">#' + esc(p.num) + '</div>' +
          '<div style="background:rgba(5,9,16,0.92); border:1px solid #12344a; color:#f3f8fc; font-size:0.65rem; font-weight:800; padding:1px 5px; border-radius:4px; white-space:nowrap;">' + esc(p.name) + ' (' + esc(p.pos) + ')</div>' +
        '</div>'
      );
    }).join('');
  }

  function getFormationCoords(modulo) {
    var m = String(modulo || '4-3-3').trim();
    if (m === '4-2-3-1') {
      return [
        { x: 50, y: 90 }, { x: 86, y: 72 }, { x: 62, y: 74 }, { x: 38, y: 74 }, { x: 14, y: 72 },
        { x: 62, y: 55 }, { x: 38, y: 55 }, { x: 82, y: 35 }, { x: 50, y: 34 }, { x: 18, y: 35 }, { x: 50, y: 15 }
      ];
    }
    if (m === '3-5-2') {
      return [
        { x: 50, y: 90 }, { x: 74, y: 75 }, { x: 50, y: 76 }, { x: 26, y: 75 },
        { x: 90, y: 50 }, { x: 68, y: 52 }, { x: 50, y: 50 }, { x: 32, y: 52 }, { x: 10, y: 50 },
        { x: 62, y: 18 }, { x: 38, y: 18 }
      ];
    }
    if (m === '3-4-2-1') {
      return [
        { x: 50, y: 90 }, { x: 74, y: 75 }, { x: 50, y: 76 }, { x: 26, y: 75 },
        { x: 88, y: 52 }, { x: 62, y: 54 }, { x: 38, y: 54 }, { x: 12, y: 52 },
        { x: 68, y: 32 }, { x: 32, y: 32 }, { x: 50, y: 14 }
      ];
    }
    if (m === '4-4-2') {
      return [
        { x: 50, y: 90 }, { x: 86, y: 72 }, { x: 62, y: 74 }, { x: 38, y: 74 }, { x: 14, y: 72 },
        { x: 86, y: 46 }, { x: 62, y: 48 }, { x: 38, y: 48 }, { x: 14, y: 46 },
        { x: 62, y: 18 }, { x: 38, y: 18 }
      ];
    }
    return [
      { x: 50, y: 88 }, { x: 86, y: 68 }, { x: 62, y: 72 }, { x: 38, y: 72 }, { x: 14, y: 68 },
      { x: 50, y: 52 }, { x: 72, y: 44 }, { x: 28, y: 44 },
      { x: 84, y: 22 }, { x: 16, y: 22 }, { x: 50, y: 14 }
    ];
  }

  function getSlotRole(idx, modulo) {
    var m = String(modulo || '4-3-3').trim();
    if (m === '4-2-3-1') return ['POR', 'TD', 'DC', 'DC', 'TS', 'MED', 'MED', 'TRD', 'TRC', 'TRS', 'ATT'][idx] || 'C';
    if (m === '3-5-2') return ['POR', 'DC', 'DC', 'DC', 'ED', 'CC', 'MED', 'CC', 'ES', 'ATT', 'ATT'][idx] || 'C';
    if (m === '3-4-2-1') return ['POR', 'DC', 'DC', 'DC', 'ED', 'MED', 'MED', 'ES', 'TRQ', 'TRQ', 'ATT'][idx] || 'C';
    if (m === '4-4-2') return ['POR', 'TD', 'DC', 'DC', 'TS', 'ED', 'CC', 'CC', 'ES', 'ATT', 'ATT'][idx] || 'C';
    return ['POR', 'TD', 'DC', 'DC', 'TS', 'MED', 'CC', 'CC', 'AD', 'AS', 'ATT'][idx] || 'C';
  }

  // ============================================================
  // 4. SEZIONE TATTICA
  // ============================================================
  function renderTattica(data) {
    return (
      '<div class="es-cos-panel-card">' +
        '<div class="es-cos-panel-head">' +
          '<span class="es-cos-panel-title">Lavagna Tattica Digitale Interattiva</span>' +
          '<div style="display:flex; gap:0.5rem;">' +
            '<button type="button" class="es-btn-cos-sec" id="btn-reset-board">Reset</button>' +
            '<button type="button" class="es-btn-cos-primary" id="btn-save-board-scheme">Salva Schema</button>' +
          '</div>' +
        '</div>' +
        '<div style="background:#061e11; border:2px solid #16562f; border-radius:10px; position:relative; min-height:440px; overflow:hidden;">' +
          renderBoardPins(data.boardPins) +
        '</div>' +
      '</div>'
    );
  }

  function renderBoardPins(pins) {
    return (pins || []).map(function (p, idx) {
      if (p.type === 'ball') {
        return '<div style="position:absolute; left:' + p.x + '%; top:' + p.y + '%; transform:translate(-50%, -50%); font-size:1.3rem;">⚽</div>';
      }
      var isBlue = p.type === 'blue';
      return (
        '<div style="position:absolute; left:' + p.x + '%; top:' + p.y + '%; transform:translate(-50%, -50%); display:flex; flex-direction:column; align-items:center; gap:2px;" data-board-pin-idx="' + idx + '">' +
          '<div style="width:34px; height:34px; border-radius:50%; background:' + (isBlue ? 'rgba(7,152,209,0.9)' : 'rgba(255,77,90,0.9)') + '; border:2px solid ' + (isBlue ? '#16b9ff' : '#ff4d5a') + '; color:#fff; font-weight:900; font-size:0.8rem; display:flex; align-items:center; justify-content:center;">' + esc(p.num) + '</div>' +
          '<div style="background:#040912; border:1px solid #12344a; color:#fff; font-size:0.62rem; font-weight:800; padding:1px 5px; border-radius:3px;">' + esc(p.name) + '</div>' +
        '</div>'
      );
    }).join('');
  }

  // ============================================================
  // 5. SEZIONE ALLENAMENTI
  // ============================================================
  function renderAllenamenti(data) {
    return (
      '<div class="es-cos-panel-card">' +
        '<div class="es-cos-panel-head">' +
          '<span class="es-cos-panel-title">Pianificazione Sedute di Allenamento</span>' +
          '<button type="button" class="es-btn-cos-primary" id="btn-add-training-modal">+ Pianifica Seduta</button>' +
        '</div>' +
        '<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:1rem;">' +
          (data.trainingsList && data.trainingsList.length ? data.trainingsList.map(function (tr, tIdx) {
            return (
              '<div style="background:#071522; border:1px solid #12344a; border-radius:8px; padding:1rem; display:flex; flex-direction:column; gap:0.5rem;">' +
                '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                  '<b style="font-size:0.95rem; color:#f3f8fc;">' + esc(tr.tipo) + '</b>' +
                  '<span class="es-cos-badge-pill is-blue">' + esc(tr.data) + ' · ' + esc(tr.orario) + '</span>' +
                '</div>' +
                '<div style="font-size:0.75rem; color:#8da8bc;">Campo: <b style="color:#f3f8fc;">' + esc(tr.luogo) + '</b></div>' +
                '<p style="font-size:0.78rem; color:#8da8bc; margin:0.2rem 0;">' + esc(tr.desc) + '</p>' +
                '<div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.4rem; padding-top:0.5rem; border-top:1px solid #12344a;">' +
                  '<span class="es-cos-badge-pill is-green">Carico: ' + esc(tr.carico || 'Medio') + '</span>' +
                  '<button type="button" class="es-btn-cos-primary" style="padding:0.35rem 0.75rem; font-size:0.74rem;" data-take-att-idx="' + tIdx + '">Rileva Presenze</button>' +
                '</div>' +
              '</div>'
            );
          }).join('') : '') +
        '</div>' +
      '</div>'
    );
  }

  // ============================================================
  // 6. SEZIONE CALENDARIO
  // ============================================================
  function renderCalendario(data) {
    return (
      '<div class="es-cos-panel-card">' +
        '<div class="es-cos-panel-head">' +
          '<span class="es-cos-panel-title">Calendario Tecnico Staff & Partite</span>' +
        '</div>' +
        '<table class="es-cos-table-compact">' +
          '<thead><tr><th>Data & Orario</th><th>Evento</th><th>Competizione / Categoria</th><th>Stadio / Luogo</th><th>Stato</th></tr></thead>' +
          '<tbody>' +
            data.prossimeGare.map(function (g) {
              return '<tr><td><b>' + esc(g.data) + '</b></td><td>Partita: ' + esc(data.clubName) + ' vs ' + esc(g.avv) + '</td><td><span class="es-cos-badge-pill is-blue">' + esc(g.comp) + '</span></td><td>' + esc(g.stadio) + '</td><td><span class="es-cos-badge-pill is-green">Confermata</span></td></tr>';
            }).join('') +
            data.trainingsList.map(function (t) {
              return '<tr><td><b>' + esc(t.data) + ' ' + esc(t.orario) + '</b></td><td>Allenamento: ' + esc(t.tipo) + '</td><td><span class="es-cos-badge-pill is-warn">Seduta Campo</span></td><td>' + esc(t.luogo) + '</td><td><span class="es-cos-badge-pill is-green">Programmata</span></td></tr>';
            }).join('') +
          '</tbody>' +
        '</table>' +
      '</div>'
    );
  }

  // ============================================================
  // 7. SEZIONE ANALISI AVVERSARIO
  // ============================================================
  function renderAnalisiAvversario(data) {
    var a = data.analisiAvversario || {};
    return (
      '<div style="display:grid; grid-template-columns:1.2fr 1fr; gap:1.25rem;">' +
        '<div class="es-cos-panel-card">' +
          '<div class="es-cos-panel-head"><span class="es-cos-panel-title">Dossier: ' + esc(a.nome) + ' (' + esc(a.modulo) + ')</span></div>' +
          '<div style="display:flex; flex-direction:column; gap:0.75rem; font-size:0.82rem;">' +
            '<div style="background:#071522; border:1px solid #12344a; border-radius:6px; padding:0.85rem;"><b style="color:#00d978;">Punti di Forza:</b><p style="margin:0.25rem 0 0; color:#8da8bc;">' + esc(a.puntiForza) + '</p></div>' +
            '<div style="background:#071522; border:1px solid #12344a; border-radius:6px; padding:0.85rem;"><b style="color:#ff4d5a;">Punti Deboli:</b><p style="margin:0.25rem 0 0; color:#8da8bc;">' + esc(a.puntiDeboli) + '</p></div>' +
            '<div style="background:#071522; border:1px solid #12344a; border-radius:6px; padding:0.85rem;"><b style="color:#ffd21a;">Giocatori Chiave:</b><p style="margin:0.25rem 0 0; color:#8da8bc;">' + esc(a.giocatoriChiave) + '</p></div>' +
            '<div style="background:#071522; border:1px solid #12344a; border-radius:6px; padding:0.85rem;"><b style="color:#16b9ff;">Palle Inattive:</b><p style="margin:0.25rem 0 0; color:#8da8bc;">' + esc(a.palleInattive) + '</p></div>' +
          '</div>' +
        '</div>' +
        '<div class="es-cos-panel-card">' +
          '<div class="es-cos-panel-head"><span class="es-cos-panel-title">Video Report & Match Analysis</span></div>' +
          '<div style="background:#071522; border:1px solid #12344a; border-radius:8px; padding:1.25rem; text-align:center;">' +
            '<div style="font-size:2.5rem; color:#16b9ff;">📹</div>' +
            '<div style="font-weight:800; font-size:0.95rem; margin-top:0.5rem;">' + esc(a.videoReport) + '</div>' +
            '<button type="button" class="es-btn-cos-sec" style="margin-top:0.75rem;" onclick="if(window.showToast)window.showToast(\'Riproduzione sintesi video avversario\',\'info\')">Guarda Video Report</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  // ============================================================
  // 8. SEZIONE GPS & CARICHI
  // ============================================================
  function renderGpsCarichi(data) {
    return (
      '<div class="es-cos-panel-card">' +
        '<div class="es-cos-panel-head"><span class="es-cos-panel-title">Dashboard Telemetria GPS & Workload Management</span></div>' +
        '<div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:1rem; margin-bottom:1rem;">' +
          '<div style="background:#071522; border:1px solid #12344a; border-radius:6px; padding:0.85rem; text-align:center;"><div style="font-size:1.3rem; font-weight:900; color:#16b9ff;">114.8 km</div><div style="font-size:0.72rem; color:#8da8bc;">DISTANZA TOTALE SQUADRA</div></div>' +
          '<div style="background:#071522; border:1px solid #12344a; border-radius:6px; padding:0.85rem; text-align:center;"><div style="font-size:1.3rem; font-weight:900; color:#00d978;">34.6 km/h</div><div style="font-size:0.72rem; color:#8da8bc;">VELOCITÀ DI PICCO</div></div>' +
          '<div style="background:#071522; border:1px solid #12344a; border-radius:6px; padding:0.85rem; text-align:center;"><div style="font-size:1.3rem; font-weight:900; color:#ffd21a;">1.08</div><div style="font-size:0.72rem; color:#8da8bc;">ACWR RATIO MEDIO</div></div>' +
          '<div style="background:#071522; border:1px solid #12344a; border-radius:6px; padding:0.85rem; text-align:center;"><div style="font-size:1.3rem; font-weight:900; color:#00d978;">96.8%</div><div style="font-size:0.72rem; color:#8da8bc;">EFFICIENZA ATLETICA</div></div>' +
        '</div>' +
        '<table class="es-cos-table-compact">' +
          '<thead><tr><th>Calciatore</th><th>Ruolo</th><th>Km Totali</th><th>Sprint >25km/h</th><th>ACWR</th><th>Semaforo Rischio</th></tr></thead>' +
          '<tbody>' +
            data.roster.map(function (p) {
              var isDiff = p.status === 'diff';
              return '<tr><td><b>' + esc(p.name) + '</b></td><td>' + esc(p.role) + '</td><td>' + esc(p.load) + '</td><td>' + (isDiff ? '12' : '28') + '</td><td><b>' + esc(p.acwr) + '</b></td><td><span class="es-cos-badge-pill ' + (isDiff ? 'is-warn' : 'is-green') + '">' + (isDiff ? '⚠️ Monitorare' : '🟢 Ottimale') + '</span></td></tr>';
            }).join('') +
          '</tbody>' +
        '</table>' +
      '</div>'
    );
  }

  // ============================================================
  // 9. SEZIONE REPORT STAFF
  // ============================================================
  function renderReportStaff(data) {
    return (
      '<div class="es-cos-panel-card">' +
        '<div class="es-cos-panel-head"><span class="es-cos-panel-title">Report Staff & Proposte del Vice Allenatore</span></div>' +
        '<div style="display:flex; flex-direction:column; gap:0.75rem;">' +
          '<div style="background:#071522; border:1px solid #12344a; border-radius:8px; padding:1rem; display:flex; justify-content:space-between; align-items:center;">' +
            '<div>' +
              '<div class="es-cos-badge-pill is-blue" style="margin-bottom:4px;">Workstation Seduta Pre-Campo</div>' +
              '<div style="font-weight:800; font-size:0.95rem;">Uscita dal pressing basso & scarico sul terzino</div>' +
              '<div style="font-size:0.75rem; color:#8da8bc;">Inviato da: <b>' + esc(data.viceLink.name) + '</b> · 14/09/2026 ore 18:45</div>' +
            '</div>' +
            '<button type="button" class="es-btn-cos-primary" onclick="if(window.showToast)window.showToast(\'Scheda approvata dal Mister!\',\'success\')">✓ Approva Scheda</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  // ============================================================
  // 10. SEZIONE COMUNICAZIONI
  // ============================================================
  function renderComunicazioni(data) {
    return (
      '<div class="es-cos-panel-card">' +
        '<div class="es-cos-panel-head"><span class="es-cos-panel-title">Canale Tecnico Diretto: Allenatore Capo &harr; Vice Allenatore</span></div>' +
        '<div style="display:flex; flex-direction:column; gap:0.65rem; max-height:360px; overflow-y:auto; background:#040912; border:1px solid #12344a; border-radius:8px; padding:1rem; margin-bottom:1rem;">' +
          data.messaggiStaff.map(function (m) {
            var isMister = m.from.indexOf('Mister') >= 0;
            return (
              '<div style="align-self:' + (isMister ? 'flex-end' : 'flex-start') + '; max-width:80%; background:' + (isMister ? 'rgba(7,152,209,0.18)' : 'rgba(255,255,255,0.04)') + '; border:1px solid ' + (isMister ? '#078fd0' : '#12344a') + '; border-radius:8px; padding:0.65rem 0.85rem;">' +
                '<div style="display:flex; justify-content:space-between; gap:1rem; font-size:0.72rem; color:#8da8bc; margin-bottom:3px;"><b style="color:' + (isMister ? '#16b9ff' : '#00d978') + ';">' + esc(m.from) + '</b><span>' + esc(m.time) + '</span></div>' +
                '<div style="font-size:0.84rem; color:#f3f8fc;">' + esc(m.text) + '</div>' +
              '</div>'
            );
          }).join('') +
        '</div>' +
        '<form id="form-send-staff-msg" style="display:flex; gap:0.5rem;">' +
          '<input type="text" class="es-cos-form-input" id="inp-staff-msg" placeholder="Scrivi una comunicazione tecnica..." style="flex:1; background:#071522; border:1px solid #12344a; color:#f3f8fc; padding:0.6rem 0.85rem; border-radius:6px;" required>' +
          '<button type="submit" class="es-btn-cos-primary">Invia</button>' +
        '</form>' +
      '</div>'
    );
  }

  // ============================================================
  // 11. SEZIONE IMPOSTAZIONI TECNICHE
  // ============================================================
  function renderImpostazioni(data) {
    return (
      '<div class="es-cos-panel-card">' +
        '<div class="es-cos-panel-head"><span class="es-cos-panel-title">Impostazioni Tecniche & Configurazione Staff</span></div>' +
        '<form id="form-save-settings" style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
          '<div style="display:flex; flex-direction:column; gap:0.3rem;"><label style="font-size:0.78rem; font-weight:800; color:#8da8bc;">Nome Allenatore</label><input type="text" id="cfg-coach-name" value="' + esc(data.coachName) + '" style="background:#071522; border:1px solid #12344a; color:#f3f8fc; padding:0.6rem; border-radius:6px;"></div>' +
          '<div style="display:flex; flex-direction:column; gap:0.3rem;"><label style="font-size:0.78rem; font-weight:800; color:#8da8bc;">Qualifica UEFA</label><input type="text" id="cfg-coach-patent" value="' + esc(data.patent) + '" style="background:#071522; border:1px solid #12344a; color:#f3f8fc; padding:0.6rem; border-radius:6px;"></div>' +
          '<div style="display:flex; flex-direction:column; gap:0.3rem;"><label style="font-size:0.78rem; font-weight:800; color:#8da8bc;">Club</label><input type="text" id="cfg-coach-club" value="' + esc(data.clubName) + '" style="background:#071522; border:1px solid #12344a; color:#f3f8fc; padding:0.6rem; border-radius:6px;"></div>' +
          '<div style="display:flex; flex-direction:column; gap:0.3rem;"><label style="font-size:0.78rem; font-weight:800; color:#8da8bc;">Matricola FIGC</label><input type="text" id="cfg-coach-matr" value="' + esc(data.matricola) + '" style="background:#071522; border:1px solid #12344a; color:#f3f8fc; padding:0.6rem; border-radius:6px;"></div>' +
          '<div style="grid-column:1/-1; display:flex; justify-content:flex-end;"><button type="submit" class="es-btn-cos-primary">Salva Impostazioni</button></div>' +
        '</form>' +
      '</div>'
    );
  }

  // ============================================================
  // COUNTDOWN DINAMICO
  // ============================================================
  function startCountdown() {
    if (countdownInterval) clearInterval(countdownInterval);
    countdownInterval = setInterval(function () {
      var dEl = document.getElementById('cos-cd-days');
      var hEl = document.getElementById('cos-cd-hours');
      var mEl = document.getElementById('cos-cd-mins');
      if (!dEl || !hEl || !mEl) return;
      var mins = parseInt(mEl.textContent) || 0;
      var hours = parseInt(hEl.textContent) || 0;
      var days = parseInt(dEl.textContent) || 0;
      if (mins > 0) {
        mEl.textContent = String(mins - 1).padStart(2, '0');
      } else {
        mEl.textContent = '59';
        if (hours > 0) {
          hEl.textContent = String(hours - 1).padStart(2, '0');
        } else {
          hEl.textContent = '23';
          if (days > 0) dEl.textContent = String(days - 1).padStart(2, '0');
        }
      }
    }, 60000);
  }

  // ============================================================
  // EVENT BINDINGS
  // ============================================================
  function bindAllEvents() {
    var mount = document.getElementById('es-cd');
    if (!mount) return;
    var data = getCoachData();

    // Gestione Drawer Mobile Toggle & Overlay
    var btnToggleSidebar = mount.querySelector('#btn-toggle-coach-sidebar');
    var sidebar = mount.querySelector('.es-cos-sidebar');
    var overlay = mount.querySelector('#es-cos-sidebar-overlay');
    function closeDrawer() {
      if (sidebar) sidebar.classList.remove('is-open');
      if (overlay) overlay.classList.remove('is-active');
    }
    if (btnToggleSidebar && sidebar) {
      btnToggleSidebar.onclick = function (e) {
        e.stopPropagation();
        var isOpen = sidebar.classList.toggle('is-open');
        if (overlay) overlay.classList.toggle('is-active', isOpen);
      };
    }
    if (overlay && sidebar) {
      overlay.onclick = closeDrawer;
    }

    // Navigazione tramite Sidebar (Unica navigazione)
    mount.querySelectorAll('.es-cos-side-btn').forEach(function (btn) {
      btn.onclick = function () {
        closeDrawer();
        var t = btn.getAttribute('data-tab-nav');
        if (t) {
          activeTab = t;
          // Aggiorna classe active sulla sidebar e tabs superiori
          mount.querySelectorAll('.es-cos-side-btn, #es-cos-main-tabs button').forEach(function (b) {
            b.classList.toggle('is-active', b.getAttribute('data-tab-nav') === activeTab);
          });
          var container = document.getElementById('es-cos-active-content');
          if (container) {
            container.innerHTML = renderActiveTab(activeTab, data);
            bindAllEvents();
          } else {
            renderHub();
          }
        }
      };
    });

    // Link interni con data-tab-nav (card cliccabili e bottoni nav)
    mount.querySelectorAll('[data-tab-nav]:not(.es-cos-side-btn)').forEach(function (el) {
      el.onclick = function (e) {
        e.stopPropagation();
        closeDrawer();
        var t = el.getAttribute('data-tab-nav');
        if (t) {
          activeTab = t;
          mount.querySelectorAll('.es-cos-side-btn, #es-cos-main-tabs button').forEach(function (b) {
            b.classList.toggle('is-active', b.getAttribute('data-tab-nav') === activeTab);
          });
          var container = document.getElementById('es-cos-active-content');
          if (container) {
            container.innerHTML = renderActiveTab(activeTab, data);
            bindAllEvents();
          }
        }
      };
    });

    // Pulsante Rapido Salto ad Area Vice Allenatore
    var btnGotoVice = mount.querySelector('#btn-goto-vice-area');
    if (btnGotoVice) {
      btnGotoVice.onclick = function () {
        if (window.EliseeRoleSwitcher && window.EliseeRoleSwitcher.impersonate) {
          window.EliseeRoleSwitcher.impersonate('vice_allenatore');
        } else if (window.EliseeViceDash && window.EliseeViceDash.render) {
          var u = userObj();
          u.staffRole = 'Vice Allenatore';
          try { localStorage.setItem('elisee_active_user', JSON.stringify(u)); } catch (_) {}
          window.EliseeViceDash.render(u);
        }
        if (window.showToast) window.showToast('Accesso all\'Area Vice Allenatore', 'info');
      };
    }

    // Conferma Formazione Ufficiale
    var btnConfirmXI = mount.querySelector('#btn-confirm-official-xi');
    if (btnConfirmXI) {
      btnConfirmXI.onclick = function () {
        data.formazioneUfficialeConfermata = true;
        saveCoachData(data);
        if (window.showToast) window.showToast('🏆 Formazione Ufficiale Confermata dal Mister!', 'success');
      };
    }

    // Invio Messaggio Staff
    var formMsg = mount.querySelector('#form-send-staff-msg');
    if (formMsg) {
      formMsg.onsubmit = function (e) {
        e.preventDefault();
        var inp = document.getElementById('inp-staff-msg');
        if (!inp || !inp.value.trim()) return;
        data.messaggiStaff = data.messaggiStaff || [];
        data.messaggiStaff.push({
          id: 'm-' + Date.now(),
          from: 'Elisee Miraglia (Mister)',
          text: inp.value.trim(),
          time: new Date().toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }) + ' ' + new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
          prio: 'Ordinaria'
        });
        saveCoachData(data);
        inp.value = '';
        var container = document.getElementById('es-cos-active-content');
        if (container && activeTab === 'comunicazioni') {
          container.innerHTML = renderComunicazioni(data);
          bindAllEvents();
        }
        if (window.showToast) window.showToast('Messaggio inviato al Vice!', 'success');
      };
    }

    // Ricerca Roster live
    var inpSearch = mount.querySelector('#inp-roster-search');
    if (inpSearch) {
      inpSearch.oninput = function () {
        rosterSearchQuery = inpSearch.value;
        var container = document.getElementById('es-cos-active-content');
        if (container && activeTab === 'rosa') {
          container.innerHTML = renderRosa(data);
          bindAllEvents();
          var newInp = document.getElementById('inp-roster-search');
          if (newInp) { newInp.focus(); newInp.setSelectionRange(newInp.value.length, newInp.value.length); }
        }
      };
    }

    // Filtri Roster
    mount.querySelectorAll('[data-r-filter]').forEach(function (btn) {
      btn.onclick = function () {
        activeRosterFilter = btn.getAttribute('data-r-filter');
        var container = document.getElementById('es-cos-active-content');
        if (container && activeTab === 'rosa') {
          container.innerHTML = renderRosa(data);
          bindAllEvents();
        }
      };
    });

    // Cambio Modulo Tattico
    var selMod = mount.querySelector('#sel-tactical-modulo');
    if (selMod) {
      selMod.onchange = function () {
        data.moduloPrincipale = selMod.value;
        saveCoachData(data);
        var container = document.getElementById('es-cos-active-content');
        if (container && activeTab === 'formazione') {
          container.innerHTML = renderFormazione(data);
          bindAllEvents();
        }
        if (window.showToast) window.showToast('Modulo aggiornato a ' + selMod.value, 'success');
      };
    }

    // Aggiungi Calciatore Modal
    var btnAddP = mount.querySelector('#btn-add-player-modal');
    if (btnAddP) {
      btnAddP.onclick = function () {
        openModal('Tesseramento Nuovo Calciatore',
          '<form id="form-modal-add-p" style="display:flex; flex-direction:column; gap:1rem;">' +
            '<div style="display:flex; flex-direction:column; gap:0.35rem;"><label style="font-size:0.8rem; font-weight:800; color:#8da8bc;">Nome e Cognome *</label><input type="text" id="inp-p-name" required placeholder="Es. Marco Bellini" style="background:#071522; border:1px solid #12344a; color:#f3f8fc; padding:0.6rem; border-radius:6px;"></div>' +
            '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
              '<div style="display:flex; flex-direction:column; gap:0.35rem;"><label style="font-size:0.8rem; font-weight:800; color:#8da8bc;">Numero Maglia</label><input type="number" id="inp-p-num" value="' + (data.roster.length + 1) + '" min="1" max="99" style="background:#071522; border:1px solid #12344a; color:#f3f8fc; padding:0.6rem; border-radius:6px;"></div>' +
              '<div style="display:flex; flex-direction:column; gap:0.35rem;"><label style="font-size:0.8rem; font-weight:800; color:#8da8bc;">Ruolo</label><select id="inp-p-role" style="background:#071522; border:1px solid #12344a; color:#f3f8fc; padding:0.6rem; border-radius:6px;"><option>Portiere</option><option>Difensore Centrale</option><option>Terzino Destro</option><option>Terzino Sinistro</option><option>Mediano</option><option>Mezzala</option><option>Trequartista</option><option>Ala Destra</option><option>Ala Sinistra</option><option>Punta Centrale</option></select></div>' +
            '</div>' +
            '<div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:0.5rem;">' +
              '<button type="button" class="es-btn-cos-sec" id="btn-close-modal">Annulla</button>' +
              '<button type="submit" class="es-btn-cos-primary">Tessera Calciatore</button>' +
            '</div>' +
          '</form>'
        );
        var f = document.getElementById('form-modal-add-p');
        if (f) {
          f.onsubmit = function (ev) {
            ev.preventDefault();
            var name = document.getElementById('inp-p-name').value.trim();
            var num = parseInt(document.getElementById('inp-p-num').value) || (data.roster.length + 1);
            var role = document.getElementById('inp-p-role').value;
            data.roster.push({ num: num, name: name, role: role, birth: 2003, status: 'disp', app: 0, load: '8.5 km', acwr: '1.02' });
            saveCoachData(data);
            closeModal();
            var container = document.getElementById('es-cos-active-content');
            if (container && activeTab === 'rosa') {
              container.innerHTML = renderRosa(data);
              bindAllEvents();
            } else {
              renderHub();
            }
            if (window.showToast) window.showToast('Calciatore aggiunto alla Rosa!', 'success');
          };
        }
      };
    }

    // Pianifica Seduta Modal
    var btnAddTr = mount.querySelector('#btn-add-training-modal');
    if (btnAddTr) {
      btnAddTr.onclick = function () {
        openModal('Pianifica Seduta di Campo',
          '<form id="form-modal-add-tr" style="display:flex; flex-direction:column; gap:1rem;">' +
            '<div style="display:flex; flex-direction:column; gap:0.35rem;"><label style="font-size:0.8rem; font-weight:800; color:#8da8bc;">Tipologia Seduta *</label><input type="text" id="inp-tr-name" required placeholder="Es. Lavoro Tattico & Calci Piazzati" style="background:#071522; border:1px solid #12344a; color:#f3f8fc; padding:0.6rem; border-radius:6px;"></div>' +
            '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
              '<div style="display:flex; flex-direction:column; gap:0.35rem;"><label style="font-size:0.8rem; font-weight:800; color:#8da8bc;">Data</label><input type="text" id="inp-tr-date" value="16/09/2026" style="background:#071522; border:1px solid #12344a; color:#f3f8fc; padding:0.6rem; border-radius:6px;"></div>' +
              '<div style="display:flex; flex-direction:column; gap:0.35rem;"><label style="font-size:0.8rem; font-weight:800; color:#8da8bc;">Orario</label><input type="text" id="inp-tr-time" value="15:00 - 17:00" style="background:#071522; border:1px solid #12344a; color:#f3f8fc; padding:0.6rem; border-radius:6px;"></div>' +
            '</div>' +
            '<div style="display:flex; flex-direction:column; gap:0.35rem;"><label style="font-size:0.8rem; font-weight:800; color:#8da8bc;">Obiettivi & Descrizione</label><textarea id="inp-tr-desc" rows="3" placeholder="Fase di possesso, transizioni e lavoro per reparti..." style="background:#071522; border:1px solid #12344a; color:#f3f8fc; padding:0.6rem; border-radius:6px;"></textarea></div>' +
            '<div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:0.5rem;">' +
              '<button type="button" class="es-btn-cos-sec" id="btn-close-modal">Annulla</button>' +
              '<button type="submit" class="es-btn-cos-primary">Programma Seduta</button>' +
            '</div>' +
          '</form>'
        );
        var f = document.getElementById('form-modal-add-tr');
        if (f) {
          f.onsubmit = function (ev) {
            ev.preventDefault();
            data.trainingsList.unshift({
              id: 'tr-' + Date.now(),
              tipo: document.getElementById('inp-tr-name').value.trim(),
              data: document.getElementById('inp-tr-date').value.trim(),
              orario: document.getElementById('inp-tr-time').value.trim(),
              luogo: 'Stadio Comunale',
              desc: document.getElementById('inp-tr-desc').value.trim(),
              carico: 'Medio-Alto',
              presenze: {}
            });
            saveCoachData(data);
            closeModal();
            var container = document.getElementById('es-cos-active-content');
            if (container && activeTab === 'allenamenti') {
              container.innerHTML = renderAllenamenti(data);
              bindAllEvents();
            } else {
              renderHub();
            }
            if (window.showToast) window.showToast('Seduta programmata con successo!', 'success');
          };
        }
      };
    }

    // Salvataggio Impostazioni
    var formCfg = mount.querySelector('#form-save-settings');
    if (formCfg) {
      formCfg.onsubmit = function (e) {
        e.preventDefault();
        data.coachName = document.getElementById('cfg-coach-name').value.trim();
        data.patent = document.getElementById('cfg-coach-patent').value;
        data.clubName = document.getElementById('cfg-coach-club').value.trim();
        data.matricola = document.getElementById('cfg-coach-matr').value.trim();
        saveCoachData(data);
        renderHub();
        if (window.showToast) window.showToast('Impostazioni tecniche salvate!', 'success');
      };
    }
  }

  function openModal(title, contentHtml) {
    closeModal();
    var modal = document.createElement('div');
    modal.id = 'es-cos-modal-box';
    modal.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.78); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; z-index:99999; padding:1rem;';
    modal.innerHTML =
      '<div style="background:#071522; border:1px solid #16b9ff; border-radius:10px; max-width:520px; width:100%; padding:1.5rem; position:relative; box-shadow:0 12px 36px rgba(0,0,0,0.8);">' +
        '<button type="button" id="btn-modal-close-x" style="position:absolute; top:12px; right:12px; background:none; border:none; color:#8da8bc; font-size:1.4rem; cursor:pointer;">&times;</button>' +
        '<h3 style="margin:0 0 1.25rem; font-size:1.15rem; font-weight:800; color:#f3f8fc;">' + esc(title) + '</h3>' +
        '<div>' + contentHtml + '</div>' +
      '</div>';
    document.body.appendChild(modal);
    modal.querySelector('#btn-modal-close-x').onclick = closeModal;
    var btnClose = modal.querySelector('#btn-close-modal');
    if (btnClose) btnClose.onclick = closeModal;
    modal.onclick = function (e) { if (e.target === modal) closeModal(); };
  }

  function closeModal() {
    var m = document.getElementById('es-cos-modal-box');
    if (m) m.remove();
  }

  // ============================================================
  // EXPORT GLOBALE
  // ============================================================
  window.EliseeCoachDash = {
    render: renderHub,
    isCoach: isCoach,
    getData: getCoachData
  };

  window.addEventListener('hashchange', function () {
    if (window.location.hash.indexOf('user-dossier') >= 0 && isCoach()) {
      setTimeout(renderHub, 50);
    }
  });

  document.addEventListener('DOMContentLoaded', function () {
    if (window.location.hash.indexOf('user-dossier') >= 0 && isCoach()) {
      setTimeout(renderHub, 100);
    }
  });

  document.addEventListener('elisee:view-changed', function (e) {
    var d = e && e.detail;
    if (d && d.view === 'user-dossier') {
      try {
        var u = userObj();
        if (isCoach(u)) renderHub(u);
      } catch (_) {}
    }
  });

  document.addEventListener('elisee:role-changed', function (e) {
    var d = e && e.detail;
    try {
      var u = (d && d.user) || userObj();
      if (isCoach(u)) renderHub(u);
    } catch (_) {}
  });
})();
