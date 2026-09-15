/* ============================================================
   ELISEE SCOUT — AREA ALLENATORE CAPO (HEAD COACH CONTROL ROOM)
   Technical Staff Operating System — Football Technical Staff OS
   ============================================================ */
(function () {
  'use strict';

  var activeTab = 'dashboard'; // 'dashboard' | 'rosa' | 'formazione' | 'tattica' | 'allenamenti' | 'calendario' | 'analisi_avversario' | 'gps_carichi' | 'report_staff' | 'comunicazioni' | 'impostazioni'
  var activeRosterFilter = 'all';
  var rosterSearchQuery = '';
  var activeTacticalPreset = 'costruzione';
  var calendarViewMode = 'settimana'; // 'giorno' | 'settimana' | 'mese' | 'lista'
  var countdownInterval = null;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function userObj() {
    try {
      var u = JSON.parse(localStorage.getItem('elisee_active_user') || localStorage.getItem('elisee_user_data') || '{}') || {};
      if (!u.squadra || /atalanta/i.test(u.squadra)) u.squadra = 'ASD Carlentini';
      if (!u.club || /atalanta/i.test(u.club)) u.club = 'ASD Carlentini';
      return u;
    } catch (_) { return { squadra: 'ASD Carlentini', club: 'ASD Carlentini' }; }
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
      clubName: u.squadra || 'ASD Carlentini',
      categoria: 'Serie D - Girone I',
      reparto: 'Prima Squadra',
      matricola: u.matricola || '88210',
      scadenzaTesseramento: '30/06/2027',
      sede: 'Carlentini (SR)',
      stadio: 'Stadio Comunale - Carlentini',
      telefono: u.telefono || '+39 340 1234567',
      logoUrl: 'immagini/squadre-loghi/foggia-city.png',

      // Prossima Partita & Countdown
      nextMatch: {
        avversario: 'A.C. RAGUSA',
        data: '15/09/2026',
        orario: '15:00',
        luogo: 'Stadio Comunale - Carlentini',
        competizione: 'Serie D - Girone I',
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
        { id: 'g-1', data: '15/09/2026 15:00', comp: 'Serie D - Girone I', avv: 'A.C. Ragusa', logo: '', status: 'Prossima', isNext: true },
        { id: 'g-2', data: '22/09/2026 15:00', comp: 'Serie D - Girone I', avv: 'Licata', logo: '', status: 'Da preparare', isNext: false },
        { id: 'g-3', data: '29/09/2026 15:00', comp: 'Serie D - Girone I', avv: 'FC Messina', logo: '', status: 'Da preparare', isNext: false },
        { id: 'g-4', data: '06/10/2026 15:00', comp: 'Serie D - Girone I', avv: 'Acireale', logo: '', status: 'Da preparare', isNext: false },
        { id: 'g-5', data: '13/10/2026 15:00', comp: 'Coppa Italia Serie D', avv: 'S. Agata', logo: '', status: 'Da preparare', isNext: false }
      ],

      // Ultima Sessione
      ultimaSessione: {
        tipo: 'Rifinitura',
        data: '14/09/2026 - 10:00',
        durata: '1h 30\'',
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
        { id: 'n-2', dot: 'green', text: 'Approvazione formazione richiesta', sub: 'Bozza 4-3-3 presentata al Mister', date: '14/09/2026 - 16:20', action: 'formazione' },
        { id: 'n-3', dot: 'danger', text: 'Giocatore infortunato', sub: 'C. Russo: risentimento flessori', date: '13/09/2026 - 21:10', action: 'rosa' },
        { id: 'n-4', dot: 'warn', text: 'Aggiornamento carichi GPS', sub: '2 atleti in zona di monitoraggio affaticamento', date: '13/09/2026 - 17:32', action: 'gps' },
        { id: 'n-5', dot: 'cyan', text: 'Nuova scheda workstation', sub: 'Uscita dal pressing basso & scarico terzino', date: '12/09/2026 - 15:44', action: 'workstation' }
      ],

      // Ultimi Log Attività
      logAttivita: [
        { date: '14/09 18:45', text: 'Report dal Vice Allenatore - Palle inattive offensive' },
        { date: '14/09 16:20', text: 'Approvazione formazione - Richiesta al Mister' },
        { date: '13/09 21:10', text: 'Aggiornamento infortunati - 2 giocatori' },
        { date: '12/09 15:44', text: 'Nuova scheda creata - Uscita dal pressing basso' },
        { date: '11/09 10:15', text: 'Pianificazione seduta tattica pre-gara completata' }
      ],

      // Impegni Staff
      prossimiImpegni: [
        { title: 'Seduta di allenamento', time: '15/09/2026 - 10:00', type: 'Rifinitura' },
        { title: 'Riunione tecnica staff', time: '15/09/2026 - 14:30', type: 'Analisi avversario' },
        { title: 'Video analisi pre-partita', time: '16/09/2026 - 15:00', type: 'A.C. Ragusa' }
      ],

      // Sedute Pianificate
      trainingsList: [
        { id: 'tr-1', tipo: 'Rifinitura Pre-Gara', data: '15/09/2026', orario: '10:00 - 11:30', luogo: 'Stadio Comunale (Campo A)', desc: 'Attivazione dinamica, rapidità 10m, schemi su palla inattiva e conclusioni.', carico: 'Medio', presenze: {} },
        { id: 'tr-2', tipo: 'Seduta Tattica Reparti', data: '13/09/2026', orario: '15:30 - 17:15', luogo: 'Stadio Comunale (Campo A)', desc: 'Linea difensiva a 4, pressing orientato e uscite dal basso.', carico: 'Alto', presenze: {} },
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
        nome: 'A.C. Ragusa',
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
        return Object.assign({}, def, parsed);
      }
    } catch (_) {}

    return def;
  }

  function saveCoachData(data) {
    try {
      localStorage.setItem('elisee_coach_data', JSON.stringify(data));
      // Notifica aggiornamento dati cross-tab
      window.dispatchEvent(new CustomEvent('elisee:coach-updated', { detail: { data: data } }));
    } catch (_) {}
  }

  // ============================================================
  // RENDER DELL'OPERATING SYSTEM COMPLETO
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

    var data = getCoachData();

    var html =
      '<div class="es-cos-shell">' +
        // 1. SIDEBAR TECNICA SINISTRA
        '<aside class="es-cos-sidebar">' +
          '<div class="es-cos-sidebar-top">' +
            '<div class="es-cos-sidebar-nav">' +
              renderSideBtn('dashboard', 'Dashboard', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>') +
              renderSideBtn('rosa', 'Rosa', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>') +
              renderSideBtn('formazione', 'Formazione', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>') +
              renderSideBtn('tattica', 'Tattica', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>') +
              renderSideBtn('allenamenti', 'Allenamenti', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>') +
              renderSideBtn('calendario', 'Calendario', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>') +
              renderSideBtn('analisi_avversario', 'Analisi Avversario', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>') +
              renderSideBtn('gps_carichi', 'GPS / Carichi', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>') +
              renderSideBtn('report_staff', 'Report Staff', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>') +
              renderSideBtn('comunicazioni', 'Comunicazioni', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>') +
              renderSideBtn('impostazioni', 'Impostazioni Tecniche', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>') +
            '</div>' +
          '</div>' +

          // Bottom User Pill Card (Fedele all'immagine)
          '<div class="es-cos-sidebar-bottom">' +
            '<div class="es-cos-user-pill-card">' +
              '<div class="es-cos-user-pill-avatar">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>' +
                '<span class="es-cos-user-pill-tag">' + esc(data.patent) + '</span>' +
              '</div>' +
              '<div class="es-cos-user-pill-meta">' +
                '<span class="es-cos-user-pill-name">' + esc(data.coachName) + '</span>' +
                '<span class="es-cos-user-pill-role">' + esc(data.coachRole) + '</span>' +
              '</div>' +
            '</div>' +
            '<div class="es-cos-status-link">Collegamento attivo</div>' +
          '</div>' +
        '</aside>' +

        // 2. MAIN CONTENT AREA
        '<main class="es-cos-main">' +
          // HEADER PROFILO TECNICO (Fedele all'immagine)
          '<header class="es-cos-header-card">' +
            '<div class="es-cos-header-left">' +
              '<div class="es-cos-avatar-shield">' +
                '<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>' +
                '<span class="es-cos-avatar-badge">' + esc(data.patent) + '</span>' +
              '</div>' +
              '<div class="es-cos-header-coach-info">' +
                '<h1 class="es-cos-coach-title-h1">' + esc(data.coachName) + '</h1>' +
                '<div class="es-cos-coach-role-sub">' + esc(data.coachRole) + '</div>' +
                '<div class="es-cos-coach-tessera">' +
                  '<span>Tesseramento FIGC: <b>' + esc(data.matricola) + '</b></span>' +
                  '<span>|</span>' +
                  '<span>Scadenza: <b>' + esc(data.scadenzaTesseramento) + '</b></span>' +
                '</div>' +
              '</div>' +
            '</div>' +

            '<div class="es-cos-header-center">' +
              // Box Club
              '<div class="es-cos-header-club-box">' +
                '<img src="' + esc(data.logoUrl) + '" alt="' + esc(data.clubName) + '" class="es-cos-club-crest" onerror="this.src=\'immagini/squadre-loghi/foggia-city.png\'">' +
                '<div class="es-cos-club-names">' +
                  '<span class="es-cos-club-name">' + esc(data.clubName) + '</span>' +
                  '<span class="es-cos-club-meta">' + esc(data.reparto) + ' · ' + esc(data.categoria) + '</span>' +
                '</div>' +
              '</div>' +

              // Box Prossima Partita
              '<div class="es-cos-header-match-box">' +
                '<div>' +
                  '<div class="es-cos-match-lbl">Prossima Partita</div>' +
                  '<div class="es-cos-match-date">' + esc(data.nextMatch.data) + ' - ' + esc(data.nextMatch.orario) + '</div>' +
                  '<div class="es-cos-match-oppo-row">' +
                    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:#16b9ff;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' +
                    '<span class="es-cos-oppo-name">' + esc(data.nextMatch.avversario) + '</span>' +
                  '</div>' +
                  '<div class="es-cos-oppo-venue">' + esc(data.nextMatch.luogo) + '</div>' +
                '</div>' +
              '</div>' +

              // Box Countdown Dinamico
              '<div class="es-cos-countdown-box">' +
                '<div class="es-cos-countdown-lbl">Mancano</div>' +
                '<div class="es-cos-countdown-digits">' +
                  '<div class="es-cos-cd-block"><span class="es-cos-cd-num" id="cos-cd-days">02</span><span class="es-cos-cd-unit">GIORNI</span></div>' +
                  '<div class="es-cos-cd-block"><span class="es-cos-cd-num" id="cos-cd-hours">15</span><span class="es-cos-cd-unit">ORE</span></div>' +
                  '<div class="es-cos-cd-block"><span class="es-cos-cd-num" id="cos-cd-mins">24</span><span class="es-cos-cd-unit">MIN</span></div>' +
                '</div>' +
              '</div>' +

              // Box Seduta Odierna
              '<div class="es-cos-seduta-today">' +
                '<div class="es-cos-seduta-pill">● Seduta odierna</div>' +
                '<div class="es-cos-seduta-name">' + esc(data.sedutaOdierna.tipo) + '</div>' +
                '<div class="es-cos-seduta-time">' + esc(data.sedutaOdierna.orario) + '</div>' +
              '</div>' +
            '</div>' +

            '<div class="es-cos-header-right">' +
              '<button type="button" class="es-cos-btn-vice-jump" id="btn-goto-vice-area">' +
                '<span>Area Vice Allenatore</span>' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>' +
              '</button>' +
            '</div>' +
          '</header>' +

          // SUB-NAVBAR A 11 SCHEDE
          '<nav class="es-cos-subnavbar" role="tablist">' +
            renderSubNavBtn('dashboard', 'Dashboard', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>') +
            renderSubNavBtn('rosa', 'Rosa', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>') +
            renderSubNavBtn('formazione', 'Formazione', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>') +
            renderSubNavBtn('tattica', 'Tattica', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>') +
            renderSubNavBtn('allenamenti', 'Allenamenti', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>') +
            renderSubNavBtn('calendario', 'Calendario', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>') +
            renderSubNavBtn('analisi_avversario', 'Analisi Avversario', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>') +
            renderSubNavBtn('gps_carichi', 'GPS / Carichi', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>') +
            renderSubNavBtn('report_staff', 'Report Staff', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>') +
            renderSubNavBtn('comunicazioni', 'Comunicazioni', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>') +
            renderSubNavBtn('impostazioni', 'Impostazioni', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>') +
          '</nav>' +

          // 3. TAB CONTENT DEDICATO
          '<div id="es-cos-active-content">' +
            renderActiveTab(activeTab, data) +
          '</div>' +
        '</main>' +
      '</div>';

    mount.innerHTML = html;
    bindAllEvents();
    startCountdown();
  }

  function renderSubNavBtn(tabKey, label, svgIcon) {
    var isAct = activeTab === tabKey;
    return '<button type="button" class="es-cos-subnav-btn ' + (isAct ? 'is-active' : '') + '" data-tab-nav="' + tabKey + '">' +
      svgIcon + '<span>' + esc(label) + '</span>' +
    '</button>';
  }

  function renderSideBtn(tabKey, label, svgIcon) {
    var isAct = activeTab === tabKey;
    return '<button type="button" class="es-cos-side-btn ' + (isAct ? 'is-active' : '') + '" data-tab-nav="' + tabKey + '">' +
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
    return '<div class="es-cos-panel-card">Sezione in caricamento...</div>';
  }

  // ============================================================
  // 1. SEZIONE DASHBOARD (Fedele allo Screenshot di Riferimento)
  // ============================================================
  function renderDashboard(data) {
    return (
      '<div style="display:flex; flex-direction:column; gap:1.25rem;">' +
        // A. RIEPILOGO STAGIONALE (7 KPI Cards Orizzontali)
        '<section class="es-cos-kpi-row-7">' +
          // 1. Prossima Gara
          '<div class="es-cos-kpi-item">' +
            '<div class="es-cos-kpi-header">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
              '<span>Prossima Gara</span>' +
            '</div>' +
            '<div class="es-cos-kpi-val" style="font-size:0.95rem; color:#16b9ff;">' + esc(data.nextMatch.data) + '</div>' +
            '<div style="font-size:0.8rem; font-weight:800; color:#f3f8fc;">' + esc(data.nextMatch.avversario) + '</div>' +
            '<div class="es-cos-badge-pill is-blue">⏱️ ' + data.nextMatch.giorniMancanti + ' giorni</div>' +
          '</div>' +

          // 2. Ultima Seduta
          '<div class="es-cos-kpi-item">' +
            '<div class="es-cos-kpi-header">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' +
              '<span>Ultima Seduta</span>' +
            '</div>' +
            '<div class="es-cos-kpi-val" style="font-size:0.95rem;">14/09/2026</div>' +
            '<div style="font-size:0.8rem; color:#8da8bc;">Rifinitura</div>' +
            '<div class="es-cos-badge-pill is-green">✓ Completata</div>' +
          '</div>' +

          // 3. Carico Squadra
          '<div class="es-cos-kpi-item">' +
            '<div class="es-cos-kpi-header">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' +
              '<span>Carico Squadra</span>' +
            '</div>' +
            '<div class="es-cos-kpi-val">78%</div>' +
            '<div class="es-cos-kpi-bar-track"><div class="es-cos-kpi-bar-fill is-green" style="width:78%;"></div></div>' +
            '<div class="es-cos-badge-pill is-green">Ottimale</div>' +
          '</div>' +

          // 4. Disponibilità Rosa
          '<div class="es-cos-kpi-item">' +
            '<div class="es-cos-kpi-header">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>' +
              '<span>Disponibilità Rosa</span>' +
            '</div>' +
            '<div class="es-cos-kpi-val">24/26 <span style="font-size:0.75rem; color:#00d978;">92%</span></div>' +
            '<div class="es-cos-kpi-bar-track"><div class="es-cos-kpi-bar-fill is-green" style="width:92%;"></div></div>' +
            '<div class="es-cos-badge-pill is-green">Idonei</div>' +
          '</div>' +

          // 5. Infortunati
          '<div class="es-cos-kpi-item">' +
            '<div class="es-cos-kpi-header">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>' +
              '<span>Infortunati</span>' +
            '</div>' +
            '<div class="es-cos-kpi-val" style="color:#ff4d5a;">2 <span style="font-size:0.75rem; color:#8da8bc;">(7.7%)</span></div>' +
            '<div class="es-cos-kpi-bar-track"><div class="es-cos-kpi-bar-fill is-danger" style="width:15%;"></div></div>' +
            '<div class="es-cos-badge-pill is-danger">Da monitorare</div>' +
          '</div>' +

          // 6. Giocatori da Monitorare
          '<div class="es-cos-kpi-item">' +
            '<div class="es-cos-kpi-header">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>' +
              '<span>Da Monitorare</span>' +
            '</div>' +
            '<div class="es-cos-kpi-val" style="color:#ffd21a;">4</div>' +
            '<div class="es-cos-kpi-bar-track"><div class="es-cos-kpi-bar-fill is-warn" style="width:30%;"></div></div>' +
            '<div class="es-cos-badge-pill is-warn">Attenzione</div>' +
          '</div>' +

          // 7. Preparazione Partita
          '<div class="es-cos-kpi-item">' +
            '<div class="es-cos-kpi-header">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>' +
              '<span>Preparazione</span>' +
            '</div>' +
            '<div class="es-cos-kpi-val" style="color:#16b9ff;">80%</div>' +
            '<div class="es-cos-kpi-bar-track"><div class="es-cos-kpi-bar-fill is-cyan" style="width:80%;"></div></div>' +
            '<div class="es-cos-badge-pill is-blue">In corso</div>' +
          '</div>' +
        '</section>' +

        // B. GRIGLIA CENTRALE (Calendario Gare, Ultima Sessione, Notifiche)
        '<section class="es-cos-mid-grid">' +
          // Colonna 1: Calendario Prossime Gare
          '<div class="es-cos-panel-card">' +
            '<div class="es-cos-panel-head">' +
              '<span class="es-cos-panel-title">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
                'Calendario Prossime Gare' +
              '</span>' +
              '<a class="es-cos-panel-link" data-tab-nav="calendario">Visualizza tutto &rarr;</a>' +
            '</div>' +
            '<table class="es-cos-table-compact">' +
              '<thead><tr><th>Data</th><th>Competizione</th><th>Avversario</th><th>Stato</th></tr></thead>' +
              '<tbody>' +
                data.prossimeGare.map(function (g) {
                  return (
                    '<tr>' +
                      '<td style="white-space:nowrap; font-weight:700;">' + esc(g.data) + '</td>' +
                      '<td style="color:#8da8bc;">' + esc(g.comp) + '</td>' +
                      '<td style="font-weight:800; color:#f3f8fc;">' + esc(g.avv) + '</td>' +
                      '<td>' +
                        '<span class="es-cos-badge-pill ' + (g.isNext ? 'is-blue' : 'is-warn') + '" style="font-size:0.65rem; cursor:pointer;" data-tab-nav="analisi_avversario">' +
                          (g.isNext ? '&larr; Prossima' : 'Da preparare') +
                        '</span>' +
                      '</td>' +
                    '</tr>'
                  );
                }).join('') +
              '</tbody>' +
            '</table>' +
          '</div>' +

          // Colonna 2: Ultima Sessione & Report Staff
          '<div class="es-cos-panel-card">' +
            '<div class="es-cos-panel-head">' +
              '<span class="es-cos-panel-title">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
                'Ultima Sessione' +
              '</span>' +
              '<a class="es-cos-panel-link" data-tab-nav="allenamenti">Dettagli &rarr;</a>' +
            '</div>' +
            '<div class="es-cos-session-box">' +
              '<div class="es-cos-session-thumb">' +
                '<div style="color:#00d978; font-size:1.4rem;">⚽</div>' +
              '</div>' +
              '<div class="es-cos-session-info">' +
                '<div class="es-cos-session-title">' + esc(data.ultimaSessione.tipo) + '</div>' +
                '<div class="es-cos-session-meta">' + esc(data.ultimaSessione.data) + ' | ' + esc(data.ultimaSessione.durata) + '</div>' +
                '<div style="font-size:0.75rem; color:#8da8bc;">Carico: <b style="color:#00d978;">' + esc(data.ultimaSessione.carico) + '</b></div>' +
                '<div class="es-cos-session-stats-grid">' +
                  '<div class="es-cos-sstat">Giocatori: <b>' + esc(data.ultimaSessione.giocatori) + '</b></div>' +
                  '<div class="es-cos-sstat">Esercizi: <b>' + esc(data.ultimaSessione.esercizi) + '</b></div>' +
                  '<div class="es-cos-sstat">Obiettivi: <b>' + esc(data.ultimaSessione.obiettivi) + '</b></div>' +
                '</div>' +
              '</div>' +
            '</div>' +

            // Box Report Staff del Vice
            '<div class="es-cos-staff-report-subbox">' +
              '<div class="es-cos-srep-info">' +
                '<div class="es-cos-srep-lbl">Report Staff</div>' +
                '<div class="es-cos-srep-title">Ultimo report dal Vice Allenatore</div>' +
                '<div class="es-cos-srep-time">Schede create: Palle inattive offensive · 14/09/2026 - 18:45</div>' +
              '</div>' +
              '<button type="button" class="es-btn-cos-primary" style="padding:0.45rem 0.85rem; font-size:0.75rem;" data-tab-nav="report_staff">Apri Report &rarr;</button>' +
            '</div>' +
          '</div>' +

          // Colonna 3: Notifiche
          '<div class="es-cos-panel-card">' +
            '<div class="es-cos-panel-head">' +
              '<span class="es-cos-panel-title">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>' +
                'Notifiche' +
              '</span>' +
              '<a class="es-cos-panel-link" id="btn-read-all-notifs">Visualizza tutte &rarr;</a>' +
            '</div>' +
            '<div class="es-cos-notifs-list">' +
              data.notifiche.map(function (n) {
                return (
                  '<div class="es-cos-notif-row" data-notif-action="' + esc(n.action) + '">' +
                    '<div class="es-cos-notif-left">' +
                      '<span class="es-cos-notif-dot is-' + esc(n.dot) + '"></span>' +
                      '<div class="es-cos-notif-text-wrap">' +
                        '<div class="es-cos-notif-text">' + esc(n.text) + '</div>' +
                        '<div class="es-cos-notif-time">' + esc(n.date) + '</div>' +
                      '</div>' +
                    '</div>' +
                    '<span class="es-cos-notif-arrow">&rarr;</span>' +
                  '</div>'
                );
              }).join('') +
            '</div>' +
          '</div>' +
        '</section>' +

        // C. FASCIA INFERIORE (Ultimi Log, Carico Settimanale, Prossimi Impegni)
        '<section class="es-cos-bot-grid">' +
          // 1. Ultimi Log Attività
          '<div class="es-cos-panel-card">' +
            '<div class="es-cos-panel-head">' +
              '<span class="es-cos-panel-title">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
                'Ultimi Log Attività' +
              '</span>' +
              '<a class="es-cos-panel-link">Visualizza tutto &rarr;</a>' +
            '</div>' +
            '<div class="es-cos-log-feed">' +
              data.logAttivita.map(function (l) {
                return (
                  '<div class="es-cos-log-item">' +
                    '<span class="es-cos-log-date">📅 ' + esc(l.date) + '</span>' +
                    '<span style="flex:1;">' + esc(l.text) + '</span>' +
                  '</div>'
                );
              }).join('') +
            '</div>' +
          '</div>' +

          // 2. Carico Settimanale Squadra
          '<div class="es-cos-panel-card">' +
            '<div class="es-cos-panel-head">' +
              '<span class="es-cos-panel-title">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>' +
                'Carico Settimanale Squadra' +
              '</span>' +
            '</div>' +
            '<div class="es-cos-weekly-chart-wrap">' +
              '<div class="es-cos-bar-chart">' +
                '<div class="es-cos-bar-col"><div class="es-cos-bar-stick" style="height:55%;"></div><span class="es-cos-bar-lbl">Lun</span></div>' +
                '<div class="es-cos-bar-col"><div class="es-cos-bar-stick" style="height:70%;"></div><span class="es-cos-bar-lbl">Mar</span></div>' +
                '<div class="es-cos-bar-col"><div class="es-cos-bar-stick" style="height:85%;"></div><span class="es-cos-bar-lbl">Mer</span></div>' +
                '<div class="es-cos-bar-col"><div class="es-cos-bar-stick" style="height:65%;"></div><span class="es-cos-bar-lbl">Gio</span></div>' +
                '<div class="es-cos-bar-col"><div class="es-cos-bar-stick is-green" style="height:90%;"></div><span class="es-cos-bar-lbl">Ven</span></div>' +
                '<div class="es-cos-bar-col"><div class="es-cos-bar-stick is-green" style="height:82%;"></div><span class="es-cos-bar-lbl">Sab</span></div>' +
                '<div class="es-cos-bar-col"><div class="es-cos-bar-stick" style="height:45%;"></div><span class="es-cos-bar-lbl">Dom</span></div>' +
              '</div>' +
              '<div class="es-cos-radial-gauge">' +
                '<div class="es-cos-gauge-circle">78%</div>' +
                '<div style="font-size:0.75rem; font-weight:800; color:#f3f8fc;">Media Settimanale</div>' +
                '<div class="es-cos-gauge-sub">● Ottimale</div>' +
              '</div>' +
            '</div>' +
          '</div>' +

          // 3. Prossimi Impegni Staff
          '<div class="es-cos-panel-card">' +
            '<div class="es-cos-panel-head">' +
              '<span class="es-cos-panel-title">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>' +
                'Prossimi Impegni Staff' +
              '</span>' +
              '<a class="es-cos-panel-link" data-tab-nav="calendario">Visualizza tutto &rarr;</a>' +
            '</div>' +
            '<div class="es-cos-impegni-list">' +
              data.prossimiImpegni.map(function (imp) {
                return (
                  '<div class="es-cos-impegno-item">' +
                    '<div class="es-cos-impegno-left">' +
                      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
                      '<div>' +
                        '<div class="es-cos-impegno-title">' + esc(imp.title) + '</div>' +
                        '<div class="es-cos-impegno-time">' + esc(imp.time) + '</div>' +
                      '</div>' +
                    '</div>' +
                    '<span class="es-cos-impegno-type">' + esc(imp.type) + '</span>' +
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
  // 2. SEZIONE ROSA (Gestione Organico)
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

        // Toolbar Ricerca e Filtri
        '<div class="es-cos-roster-toolbar">' +
          '<input type="text" class="es-cos-search-input" id="inp-roster-search" placeholder="Cerca calciatore per nome o ruolo..." value="' + esc(rosterSearchQuery) + '">' +
          '<div class="es-cos-filter-pills">' +
            '<button type="button" class="es-cos-fpill ' + (activeRosterFilter === 'all' ? 'is-active' : '') + '" data-r-filter="all">Tutti</button>' +
            '<button type="button" class="es-cos-fpill ' + (activeRosterFilter === 'por' ? 'is-active' : '') + '" data-r-filter="por">Portieri</button>' +
            '<button type="button" class="es-cos-fpill ' + (activeRosterFilter === 'dif' ? 'is-active' : '') + '" data-r-filter="dif">Difensori</button>' +
            '<button type="button" class="es-cos-fpill ' + (activeRosterFilter === 'cen' ? 'is-active' : '') + '" data-r-filter="cen">Centrocampisti</button>' +
            '<button type="button" class="es-cos-fpill ' + (activeRosterFilter === 'att' ? 'is-active' : '') + '" data-r-filter="att">Attaccanti</button>' +
            '<button type="button" class="es-cos-fpill ' + (activeRosterFilter === 'disp' ? 'is-active' : '') + '" data-r-filter="disp">Disponibili</button>' +
            '<button type="button" class="es-cos-fpill ' + (activeRosterFilter === 'diff' ? 'is-active' : '') + '" data-r-filter="diff">Differenziati</button>' +
          '</div>' +
        '</div>' +

        // Griglia Giocatori
        '<div class="es-cos-roster-grid">' +
          (list.length ? list.map(function (p, pIdx) {
            var isDisp = p.status === 'disp';
            return (
              '<div class="es-cos-player-card" data-player-card-idx="' + pIdx + '" title="Clicca per aprire scheda dettagliata">' +
                '<div class="es-cos-player-num-badge">#' + esc(p.num) + '</div>' +
                '<div class="es-cos-player-meta-box">' +
                  '<div class="es-cos-player-name">' + esc(p.name) + '</div>' +
                  '<div class="es-cos-player-sub">' + esc(p.role) + ' · Classe ' + esc(p.birth) + '</div>' +
                  '<div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">' +
                    '<span class="es-cos-badge-pill ' + (isDisp ? 'is-green' : 'is-warn') + '">' + (isDisp ? '🟢 Disponibile' : '🟡 Differenziato') + '</span>' +
                    '<span style="font-size:0.72rem; color:#8da8bc;">Presenze: <b>' + (p.app || 0) + '</b></span>' +
                  '</div>' +
                  '<div style="font-size:0.7rem; color:#16b9ff; margin-top:2px;">Carico: ' + esc(p.load || '9.5 km') + ' · ACWR ' + esc(p.acwr || '1.05') + '</div>' +
                '</div>' +
              '</div>'
            );
          }).join('') : '<div style="grid-column:1/-1; text-align:center; padding:3rem; color:#8da8bc;">Nessun calciatore trovato con i criteri selezionati.</div>') +
        '</div>' +
      '</div>'
    );
  }

  // ============================================================
  // 3. SEZIONE FORMAZIONE (Lineup Builder Professionale)
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
            '<select class="es-cos-form-input" id="sel-tactical-modulo" style="padding:0.35rem 0.75rem; font-size:0.82rem; font-weight:800; color:#16b9ff;">' +
              '<option value="4-3-3" ' + (data.moduloPrincipale === '4-3-3' ? 'selected' : '') + '>4-3-3 (Offensivo con Ali Larghe)</option>' +
              '<option value="4-2-3-1" ' + (data.moduloPrincipale === '4-2-3-1' ? 'selected' : '') + '>4-2-3-1 (Doppio Mediano & Trequarti)</option>' +
              '<option value="3-5-2" ' + (data.moduloPrincipale === '3-5-2' ? 'selected' : '') + '>3-5-2 (Ampiezza Quinti & Due Punte)</option>' +
              '<option value="3-4-2-1" ' + (data.moduloPrincipale === '3-4-2-1' ? 'selected' : '') + '>3-4-2-1 (Doppio Trequartista)</option>' +
              '<option value="4-4-2" ' + (data.moduloPrincipale === '4-4-2' ? 'selected' : '') + '>4-4-2 (Lineare Classico)</option>' +
              '<option value="4-1-4-1" ' + (data.moduloPrincipale === '4-1-4-1' ? 'selected' : '') + '>4-1-4-1 (Pressing & Schermo)</option>' +
            '</select>' +
          '</div>' +
          '<div style="display:flex; gap:0.5rem;">' +
            '<button type="button" class="es-btn-cos-sec" id="btn-export-story-modal">📲 Story 9:16</button>' +
            '<button type="button" class="es-btn-cos-primary" id="btn-confirm-official-xi">✓ Conferma Formazione Ufficiale</button>' +
          '</div>' +
        '</div>' +

        '<div class="es-cos-lineup-layout">' +
          // Campo Tattico 2D
          '<div class="es-cos-pitch-wrapper">' +
            '<div class="es-cos-pitch-field"></div>' +
            '<div class="es-cos-pitch-line-center"></div>' +
            '<div class="es-cos-pitch-circle-center"></div>' +
            '<div class="es-cos-pitch-box-top"></div>' +
            '<div class="es-cos-pitch-box-bottom"></div>' +
            renderPitchPins(data.top11, data.moduloPrincipale) +
          '</div>' +

          // Panchina & Convocazioni
          '<div style="display:flex; flex-direction:column; gap:1rem;">' +
            '<div class="es-cos-panel-card" style="background:#070d16; border-color:#12344a;">' +
              '<div style="font-size:0.85rem; font-weight:800; color:#f3f8fc; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:0.5rem; display:flex; justify-content:space-between;">' +
                '<span>A Disposizione (Panchina)</span>' +
                '<span style="color:#16b9ff;">' + (data.panchina ? data.panchina.length : 0) + ' Calciatori</span>' +
              '</div>' +
              '<div style="display:flex; flex-direction:column; gap:0.4rem; max-height:280px; overflow-y:auto;">' +
                (data.panchina && data.panchina.length ? data.panchina.map(function (b) {
                  return (
                    '<div style="display:flex; justify-content:space-between; align-items:center; background:#0a121d; border:1px solid #12344a; border-radius:5px; padding:0.45rem 0.65rem;">' +
                      '<div style="display:flex; align-items:center; gap:0.5rem;">' +
                        '<b style="color:#16b9ff;">#' + esc(b.num) + '</b>' +
                        '<span>' + esc(b.name) + '</span>' +
                      '</div>' +
                      '<span class="es-cos-badge-pill is-blue" style="font-size:0.65rem;">' + esc(b.pos || b.role) + '</span>' +
                    '</div>'
                  );
                }).join('') : '<div style="color:#8da8bc; font-size:0.78rem; text-align:center; padding:1rem;">Panchina vuota</div>') +
              '</div>' +
            '</div>' +

            // Stato Approvazione Ufficiale
            '<div style="background:rgba(0,217,120,0.06); border:1px solid rgba(0,217,120,0.3); border-radius:8px; padding:0.85rem; font-size:0.8rem; line-height:1.45;">' +
              '<b style="color:#00d978;">Stato Ufficiale:</b> Formazione convalidata dal Mister. Sincronizzata in tempo reale con la Bozza del Vice Allenatore.' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function renderPitchPins(players, modulo) {
    var coords = getFormationCoords(modulo);
    return coords.map(function (c, idx) {
      var p = (players || [])[idx] || { num: idx + 1, name: 'Titolare ' + (idx + 1), pos: getSlotRole(idx, modulo), rating: '8.0' };
      return (
        '<div class="es-cos-player-pin" style="left:' + c.x + '%; top:' + c.y + '%;" data-player-pin-idx="' + idx + '">' +
          '<div class="es-cos-pin-circle">#' + esc(p.num) + '</div>' +
          '<div class="es-cos-pin-tag">' + esc(p.name) + ' (' + esc(p.pos) + ')</div>' +
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
    // Default 4-3-3
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
  // 4. SEZIONE TATTICA (Lavagna Tattica Interattiva)
  // ============================================================
  function renderTattica(data) {
    return (
      '<div class="es-cos-panel-card">' +
        '<div class="es-cos-panel-head">' +
          '<span class="es-cos-panel-title">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>' +
            'Lavagna Tattica Digitale Interattiva' +
          '</span>' +
          '<div style="display:flex; gap:0.5rem;">' +
            '<button type="button" class="es-btn-cos-sec" id="btn-reset-board">Reset Pedine</button>' +
            '<button type="button" class="es-btn-cos-primary" id="btn-save-board-scheme">Salva Schema</button>' +
          '</div>' +
        '</div>' +

        // Toolbar Preset Tattici
        '<div class="es-cos-board-toolbar">' +
          '<div class="es-cos-board-btn-group">' +
            '<span style="font-size:0.75rem; font-weight:800; color:#8da8bc; text-transform:uppercase;">Preset Schemi:</span>' +
            '<button type="button" class="es-cos-board-btn ' + (activeTacticalPreset === 'costruzione' ? 'is-active' : '') + '" data-preset="costruzione">Costruzione Bassa</button>' +
            '<button type="button" class="es-cos-board-btn ' + (activeTacticalPreset === 'inattive' ? 'is-active' : '') + '" data-preset="inattive">Palle Inattive (Corner)</button>' +
            '<button type="button" class="es-cos-board-btn ' + (activeTacticalPreset === 'pressing' ? 'is-active' : '') + '" data-preset="pressing">Pressing Alto</button>' +
            '<button type="button" class="es-cos-board-btn ' + (activeTacticalPreset === 'transizioni' ? 'is-active' : '') + '" data-preset="transizioni">Transizioni</button>' +
          '</div>' +
          '<div style="font-size:0.76rem; color:#8da8bc;">' +
            '🔵 Squadra (Blu) · 🔴 Avversario (Rosso) · ⚽ Pallone' +
          '</div>' +
        '</div>' +

        // Pitch Lavagna
        '<div class="es-cos-pitch-wrapper" id="es-tactical-canvas-frame" style="min-height:480px;">' +
          '<div class="es-cos-pitch-field"></div>' +
          '<div class="es-cos-pitch-line-center"></div>' +
          '<div class="es-cos-pitch-circle-center"></div>' +
          '<div class="es-cos-pitch-box-top"></div>' +
          '<div class="es-cos-pitch-box-bottom"></div>' +
          renderBoardPins(data.boardPins) +
        '</div>' +
      '</div>'
    );
  }

  function renderBoardPins(pins) {
    return (pins || []).map(function (p, idx) {
      if (p.type === 'ball') {
        return (
          '<div class="es-cos-player-pin" style="left:' + p.x + '%; top:' + p.y + '%;" data-board-pin-idx="' + idx + '">' +
            '<div style="font-size:1.4rem; filter:drop-shadow(0 2px 5px rgba(0,0,0,0.8));">⚽</div>' +
          '</div>'
        );
      }
      var isBlue = p.type === 'blue';
      return (
        '<div class="es-cos-player-pin" style="left:' + p.x + '%; top:' + p.y + '%;" data-board-pin-idx="' + idx + '">' +
          '<div class="es-cos-pin-circle" style="border-color:' + (isBlue ? '#16b9ff' : '#ff4d5a') + '; background:' + (isBlue ? 'rgba(7,152,209,0.85)' : 'rgba(255,77,90,0.85)') + ';">' + esc(p.num) + '</div>' +
          '<div class="es-cos-pin-tag">' + esc(p.name) + '</div>' +
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
          '<span class="es-cos-panel-title">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
            'Pianificazione Sedute & Rilevazione Presenze' +
          '</span>' +
          '<button type="button" class="es-btn-cos-primary" id="btn-add-training-modal">+ Pianifica Nuova Seduta</button>' +
        '</div>' +

        '<div class="es-cos-trainings-grid">' +
          (data.trainingsList && data.trainingsList.length ? data.trainingsList.map(function (tr, tIdx) {
            return (
              '<div class="es-cos-tr-card">' +
                '<div class="es-cos-tr-head">' +
                  '<div class="es-cos-tr-type">' + esc(tr.tipo) + '</div>' +
                  '<div class="es-cos-tr-date-badge">' + esc(tr.data) + ' · ' + esc(tr.orario) + '</div>' +
                '</div>' +
                '<div style="font-size:0.78rem; color:#8da8bc;">Campo: <b style="color:#f3f8fc;">' + esc(tr.luogo) + '</b></div>' +
                '<p style="font-size:0.8rem; color:#8da8bc; line-height:1.4; margin:0.3rem 0;">' + esc(tr.desc) + '</p>' +
                '<div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.5rem; padding-top:0.6rem; border-top:1px solid rgba(18,52,74,0.6);">' +
                  '<span class="es-cos-badge-pill is-green">Carico: ' + esc(tr.carico || 'Medio') + '</span>' +
                  '<div style="display:flex; gap:0.4rem;">' +
                    '<button type="button" class="es-btn-cos-primary" style="padding:0.35rem 0.75rem; font-size:0.75rem;" data-take-att-idx="' + tIdx + '">Rileva Presenze</button>' +
                    '<button type="button" class="es-btn-cos-sec" style="color:#ff4d5a; padding:0.35rem 0.6rem;" data-del-tr-idx="' + tIdx + '">&times;</button>' +
                  '</div>' +
                '</div>' +
              '</div>'
            );
          }).join('') : '<div style="color:#8da8bc; text-align:center; padding:2rem;">Nessuna seduta programmata.</div>') +
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
          '<span class="es-cos-panel-title">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
            'Calendario Tecnico Staff & Partite' +
          '</span>' +
          '<div class="es-cos-filter-pills">' +
            '<button type="button" class="es-cos-fpill ' + (calendarViewMode === 'giorno' ? 'is-active' : '') + '" data-cal-view="giorno">Giorno</button>' +
            '<button type="button" class="es-cos-fpill ' + (calendarViewMode === 'settimana' ? 'is-active' : '') + '" data-cal-view="settimana">Settimana</button>' +
            '<button type="button" class="es-cos-fpill ' + (calendarViewMode === 'mese' ? 'is-active' : '') + '" data-cal-view="mese">Mese</button>' +
            '<button type="button" class="es-cos-fpill ' + (calendarViewMode === 'lista' ? 'is-active' : '') + '" data-cal-view="lista">Lista Eventi</button>' +
          '</div>' +
        '</div>' +

        '<table class="es-cos-table-compact">' +
          '<thead><tr><th>Data & Orario</th><th>Evento</th><th>Categoria</th><th>Luogo</th><th>Stato</th></tr></thead>' +
          '<tbody>' +
            data.prossimeGare.map(function (g) {
              return '<tr><td><b>' + esc(g.data) + '</b></td><td>Partita: ' + esc(data.clubName) + ' vs ' + esc(g.avv) + '</td><td><span class="es-cos-badge-pill is-blue">' + esc(g.comp) + '</span></td><td>Stadio Comunale</td><td><span class="es-cos-badge-pill is-green">Confermata</span></td></tr>';
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
          '<div class="es-cos-panel-head">' +
            '<span class="es-cos-panel-title">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
              'Dossier Tecnico: ' + esc(a.nome) + ' (' + esc(a.modulo) + ')' +
            '</span>' +
            '<button type="button" class="es-btn-cos-primary" id="btn-share-oppo-vice">Condividi con Vice</button>' +
          '</div>' +
          '<div style="display:flex; flex-direction:column; gap:0.85rem; font-size:0.84rem;">' +
            '<div style="background:#070d16; border:1px solid #12344a; border-radius:6px; padding:0.85rem;">' +
              '<b style="color:#00d978;">Punti di Forza:</b><p style="margin:0.25rem 0 0; color:#8da8bc;">' + esc(a.puntiForza) + '</p>' +
            '</div>' +
            '<div style="background:#070d16; border:1px solid #12344a; border-radius:6px; padding:0.85rem;">' +
              '<b style="color:#ff4d5a;">Punti Deboli & Vulnerabilità:</b><p style="margin:0.25rem 0 0; color:#8da8bc;">' + esc(a.puntiDeboli) + '</p>' +
            '</div>' +
            '<div style="background:#070d16; border:1px solid #12344a; border-radius:6px; padding:0.85rem;">' +
              '<b style="color:#ffd21a;">Giocatori Chiave da Raddoppiare:</b><p style="margin:0.25rem 0 0; color:#8da8bc;">' + esc(a.giocatoriChiave) + '</p>' +
            '</div>' +
            '<div style="background:#070d16; border:1px solid #12344a; border-radius:6px; padding:0.85rem;">' +
              '<b style="color:#16b9ff;">Palle Inattive Avversarie:</b><p style="margin:0.25rem 0 0; color:#8da8bc;">' + esc(a.palleInattive) + '</p>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="es-cos-panel-card">' +
          '<div class="es-cos-panel-head">' +
            '<span class="es-cos-panel-title">Video Report & Match Analysis</span>' +
          '</div>' +
          '<div style="background:#070d16; border:1px solid #12344a; border-radius:8px; padding:1.25rem; display:flex; flex-direction:column; gap:0.75rem; text-align:center;">' +
            '<div style="font-size:2.5rem; color:#16b9ff;">📹</div>' +
            '<div style="font-weight:800; font-size:0.95rem;">' + esc(a.videoReport) + '</div>' +
            '<p style="font-size:0.78rem; color:#8da8bc; margin:0;">Tag clips: Transizioni negative avversario, posizionamento sui corner, uscite del portiere.</p>' +
            '<button type="button" class="es-btn-cos-sec" style="margin-top:0.5rem;" onclick="if(window.showToast)window.showToast(\'Riproduzione clip video analisi\',\'info\')">Avvia Clip Video Analisi</button>' +
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
        '<div class="es-cos-panel-head">' +
          '<span class="es-cos-panel-title">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>' +
            'Dashboard Telemetria GPS & Workload Management' +
          '</span>' +
          '<div class="es-cos-badge-pill is-green">● Sistema GPS Sincronizzato</div>' +
        '</div>' +

        '<div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:1rem; margin-bottom:1.25rem;">' +
          '<div style="background:#070d16; border:1px solid #12344a; border-radius:6px; padding:0.85rem; text-align:center;"><div style="font-size:1.3rem; font-weight:900; color:#16b9ff;">114.8 km</div><div style="font-size:0.72rem; color:#8da8bc;">DISTANZA TOTALE SQUADRA</div></div>' +
          '<div style="background:#070d16; border:1px solid #12344a; border-radius:6px; padding:0.85rem; text-align:center;"><div style="font-size:1.3rem; font-weight:900; color:#00d978;">34.6 km/h</div><div style="font-size:0.72rem; color:#8da8bc;">VELOCITÀ DI PICCO</div></div>' +
          '<div style="background:#070d16; border:1px solid #12344a; border-radius:6px; padding:0.85rem; text-align:center;"><div style="font-size:1.3rem; font-weight:900; color:#ffd21a;">1.08</div><div style="font-size:0.72rem; color:#8da8bc;">ACWR RATIO MEDIO</div></div>' +
          '<div style="background:#070d16; border:1px solid #12344a; border-radius:6px; padding:0.85rem; text-align:center;"><div style="font-size:1.3rem; font-weight:900; color:#00d978;">96.8%</div><div style="font-size:0.72rem; color:#8da8bc;">EFFICIENZA ATLETICA</div></div>' +
        '</div>' +

        '<table class="es-cos-table-compact">' +
          '<thead><tr><th>Calciatore</th><th>Ruolo</th><th>Km Totali</th><th>Sprint >25km/h</th><th>ACWR</th><th>Semaforo Rischio</th></tr></thead>' +
          '<tbody>' +
            data.roster.map(function (p) {
              var isDiff = p.status === 'diff';
              return (
                '<tr>' +
                  '<td><b>' + esc(p.name) + '</b></td>' +
                  '<td>' + esc(p.role) + '</td>' +
                  '<td>' + esc(p.load) + '</td>' +
                  '<td>' + (isDiff ? '12' : '28') + '</td>' +
                  '<td><b>' + esc(p.acwr) + '</b></td>' +
                  '<td>' +
                    '<span class="es-cos-badge-pill ' + (isDiff ? 'is-warn' : 'is-green') + '">' +
                      (isDiff ? '⚠️ Monitorare' : '🟢 Ottimale') +
                    '</span>' +
                  '</td>' +
                '</tr>'
              );
            }).join('') +
          '</tbody>' +
        '</table>' +
      '</div>'
    );
  }

  // ============================================================
  // 9. SEZIONE REPORT STAFF (Integrazione col Vice)
  // ============================================================
  function renderReportStaff(data) {
    return (
      '<div class="es-cos-panel-card">' +
        '<div class="es-cos-panel-head">' +
          '<span class="es-cos-panel-title">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' +
            'Report Staff & Proposte del Vice Allenatore' +
          '</span>' +
          '<button type="button" class="es-btn-cos-primary" id="btn-create-exec-report">+ Redigi Report Direttivo</button>' +
        '</div>' +

        '<div style="display:flex; flex-direction:column; gap:0.85rem;">' +
          '<div style="background:#070d16; border:1px solid #12344a; border-radius:8px; padding:1rem; display:flex; justify-content:space-between; align-items:center;">' +
            '<div>' +
              '<div class="es-cos-badge-pill is-blue" style="margin-bottom:4px;">Workstation Seduta Pre-Campo</div>' +
              '<div style="font-weight:800; font-size:0.95rem;">Uscita dal pressing basso & scarico sul terzino</div>' +
              '<div style="font-size:0.75rem; color:#8da8bc;">Inviato da: <b>' + esc(data.viceLink.name) + '</b> · 14/09/2026 ore 18:45</div>' +
            '</div>' +
            '<div style="display:flex; gap:0.5rem;">' +
              '<button type="button" class="es-btn-cos-sec" onclick="if(window.showToast)window.showToast(\'Report aperto in lettura\',\'info\')">Visualizza Scheda</button>' +
              '<button type="button" class="es-btn-cos-primary" onclick="if(window.showToast)window.showToast(\'Scheda approvata dal Mister!\',\'success\')">✓ Approva Scheda</button>' +
            '</div>' +
          '</div>' +

          '<div style="background:#070d16; border:1px solid #12344a; border-radius:8px; padding:1rem; display:flex; justify-content:space-between; align-items:center;">' +
            '<div>' +
              '<div class="es-cos-badge-pill is-green" style="margin-bottom:4px;">Bozza Formazione Settimanale</div>' +
              '<div style="font-weight:800; font-size:0.95rem;">Proposta XI Titolare 4-3-3 per A.C. Ragusa</div>' +
              '<div style="font-size:0.75rem; color:#8da8bc;">Inviato da: <b>' + esc(data.viceLink.name) + '</b> · 14/09/2026 ore 16:20</div>' +
            '</div>' +
            '<div style="display:flex; gap:0.5rem;">' +
              '<span class="es-cos-badge-pill is-green" style="font-size:0.8rem;">✓ Convalidata dal Mister</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  // ============================================================
  // 10. SEZIONE COMUNICAZIONI (Allenatore <-> Vice)
  // ============================================================
  function renderComunicazioni(data) {
    return (
      '<div class="es-cos-panel-card">' +
        '<div class="es-cos-panel-head">' +
          '<span class="es-cos-panel-title">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
            'Canale Tecnico Diretto: Allenatore Capo &harr; Vice Allenatore' +
          '</span>' +
          '<span class="es-cos-badge-pill is-green">● Connessione Crittografata Attiva</span>' +
        '</div>' +

        '<div style="display:flex; flex-direction:column; gap:0.65rem; max-height:360px; overflow-y:auto; background:#070d16; border:1px solid #12344a; border-radius:8px; padding:1rem; margin-bottom:1rem;">' +
          data.messaggiStaff.map(function (m) {
            var isMister = m.from.indexOf('Mister') >= 0;
            return (
              '<div style="align-self:' + (isMister ? 'flex-end' : 'flex-start') + '; max-width:80%; background:' + (isMister ? 'rgba(7,152,209,0.18)' : 'rgba(255,255,255,0.04)') + '; border:1px solid ' + (isMister ? '#078fd0' : '#12344a') + '; border-radius:8px; padding:0.65rem 0.85rem;">' +
                '<div style="display:flex; justify-content:space-between; gap:1rem; font-size:0.72rem; color:#8da8bc; margin-bottom:3px;">' +
                  '<b style="color:' + (isMister ? '#16b9ff' : '#00d978') + ';">' + esc(m.from) + '</b>' +
                  '<span>' + esc(m.time) + '</span>' +
                '</div>' +
                '<div style="font-size:0.84rem; color:#f3f8fc; line-height:1.4;">' + esc(m.text) + '</div>' +
              '</div>'
            );
          }).join('') +
        '</div>' +

        '<form id="form-send-staff-msg" style="display:flex; gap:0.5rem;">' +
          '<input type="text" class="es-cos-form-input" id="inp-staff-msg" placeholder="Scrivi una comunicazione tecnica per il Vice Allenatore..." style="flex:1;" required>' +
          '<button type="submit" class="es-btn-cos-primary">Invia Messaggio</button>' +
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
        '<div class="es-cos-panel-head">' +
          '<span class="es-cos-panel-title">Impostazioni Tecniche & Configurazione Staff</span>' +
        '</div>' +
        '<form id="form-save-settings" style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
          '<div class="es-cos-form-group">' +
            '<label class="es-cos-form-label">Nome Allenatore</label>' +
            '<input type="text" class="es-cos-form-input" id="cfg-coach-name" value="' + esc(data.coachName) + '">' +
          '</div>' +
          '<div class="es-cos-form-group">' +
            '<label class="es-cos-form-label">Qualifica / Licenza UEFA</label>' +
            '<select class="es-cos-form-input" id="cfg-coach-patent">' +
              '<option ' + (data.patent === 'UEFA Pro' ? 'selected' : '') + '>UEFA Pro</option>' +
              '<option ' + (data.patent === 'UEFA A' ? 'selected' : '') + '>UEFA A</option>' +
              '<option ' + (data.patent === 'UEFA B' ? 'selected' : '') + '>UEFA B</option>' +
            '</select>' +
          '</div>' +
          '<div class="es-cos-form-group">' +
            '<label class="es-cos-form-label">Club Ufficiale</label>' +
            '<input type="text" class="es-cos-form-input" id="cfg-coach-club" value="' + esc(data.clubName) + '">' +
          '</div>' +
          '<div class="es-cos-form-group">' +
            '<label class="es-cos-form-label">Matricola FIGC</label>' +
            '<input type="text" class="es-cos-form-input" id="cfg-coach-matr" value="' + esc(data.matricola) + '">' +
          '</div>' +
          '<div style="grid-column:1/-1; display:flex; justify-content:flex-end;">' +
            '<button type="submit" class="es-btn-cos-primary">Salva Impostazioni</button>' +
          '</div>' +
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
  // GESTIONE EVENTI & INTERAZIONI
  // ============================================================
  function bindAllEvents() {
    var mount = document.getElementById('es-cd');
    if (!mount) return;
    var data = getCoachData();

    // Navigazione Tab (Sidebar + Subnavbar)
    mount.querySelectorAll('[data-tab-nav]').forEach(function (btn) {
      btn.onclick = function () {
        var t = btn.getAttribute('data-tab-nav');
        if (t) {
          activeTab = t;
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

    // Aggiungi Calciatore Modal
    var btnAddP = mount.querySelector('#btn-add-player-modal');
    if (btnAddP) {
      btnAddP.onclick = function () {
        openModal('Tesseramento Nuovo Calciatore',
          '<form id="form-modal-add-p" style="display:flex; flex-direction:column; gap:1rem;">' +
            '<div class="es-cos-form-group"><label class="es-cos-form-label">Nome e Cognome *</label><input type="text" class="es-cos-form-input" id="inp-p-name" required placeholder="Es. Marco Bellini"></div>' +
            '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
              '<div class="es-cos-form-group"><label class="es-cos-form-label">Numero Maglia</label><input type="number" class="es-cos-form-input" id="inp-p-num" value="' + (data.roster.length + 1) + '" min="1" max="99"></div>' +
              '<div class="es-cos-form-group"><label class="es-cos-form-label">Ruolo</label><select class="es-cos-form-input" id="inp-p-role"><option>Portiere</option><option>Difensore Centrale</option><option>Terzino Destro</option><option>Terzino Sinistro</option><option>Mediano</option><option>Mezzala</option><option>Trequartista</option><option>Ala Destra</option><option>Ala Sinistra</option><option>Punta Centrale</option></select></div>' +
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
            renderHub();
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
            '<div class="es-cos-form-group"><label class="es-cos-form-label">Tipologia Seduta *</label><input type="text" class="es-cos-form-input" id="inp-tr-name" required placeholder="Es. Lavoro Tattico & Calci Piazzati"></div>' +
            '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
              '<div class="es-cos-form-group"><label class="es-cos-form-label">Data</label><input type="text" class="es-cos-form-input" id="inp-tr-date" value="16/09/2026"></div>' +
              '<div class="es-cos-form-group"><label class="es-cos-form-label">Orario</label><input type="text" class="es-cos-form-input" id="inp-tr-time" value="15:00 - 17:00"></div>' +
            '</div>' +
            '<div class="es-cos-form-group"><label class="es-cos-form-label">Obiettivi & Descrizione</label><textarea class="es-cos-form-input" id="inp-tr-desc" rows="3" placeholder="Fase di possesso, transizioni e lavoro per reparti..."></textarea></div>' +
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
            renderHub();
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
    modal.className = 'es-cos-modal-backdrop';
    modal.innerHTML =
      '<div class="es-cos-modal-box">' +
        '<button type="button" class="es-cos-modal-close" id="btn-modal-close-x">&times;</button>' +
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
