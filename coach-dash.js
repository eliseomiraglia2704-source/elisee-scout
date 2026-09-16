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

  var _coachLiveData = null;
  var _isSyncing = false;

  function formatDateTime(iso) {
    if (!iso) return '--';
    try {
      var d = new Date(iso);
      var day = String(d.getDate()).padStart(2, '0');
      var mon = String(d.getMonth() + 1).padStart(2, '0');
      var yr = d.getFullYear();
      var hr = String(d.getHours()).padStart(2, '0');
      var min = String(d.getMinutes()).padStart(2, '0');
      return day + '/' + mon + '/' + yr + ' ' + hr + ':' + min;
    } catch (_) { return String(iso); }
  }

  function formatDate(iso) {
    if (!iso) return '--';
    try {
      var d = new Date(iso);
      return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
    } catch (_) { return String(iso); }
  }

  function formatTime(iso) {
    if (!iso) return '--';
    try {
      var d = new Date(iso);
      return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    } catch (_) { return '--'; }
  }

  function getCountdownValues(targetIso) {
    if (!targetIso) return { days: 0, hours: 0, mins: 0 };
    var diff = new Date(targetIso).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, mins: 0 };
    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { days: days, hours: hours, mins: mins };
  }

  async function syncLiveCoachData(user, force) {
    if (_isSyncing && !force) return;
    _isSyncing = true;
    user = user || userObj();

    if (!window.EliseeSupabase) {
      _isSyncing = false;
      return;
    }

    try {
      var clubId = await window.EliseeSupabase.resolveClubId(user);
      var staffId = user.staffId || user.id || null;

      var res = await Promise.all([
        window.EliseeSupabase.getProssimaPartita(clubId),
        window.EliseeSupabase.getPartite(clubId),
        window.EliseeSupabase.getUltimaSeduta(clubId),
        window.EliseeSupabase.getSedutaOdierna(clubId),
        window.EliseeSupabase.getAllenamenti(clubId),
        window.EliseeSupabase.getDisponibilitaRosa(clubId),
        window.EliseeSupabase.getRosa(clubId),
        window.EliseeSupabase.getCaricoSettimanale(clubId),
        window.EliseeSupabase.getReportStaff(clubId, staffId, 'allenatore'),
        window.EliseeSupabase.getEventiLog(clubId),
        window.EliseeSupabase.getImpegniStaff(clubId),
        window.EliseeSupabase.getFileAllegati(clubId),
        window.EliseeSupabase.getStaff(clubId, 'vice_allenatore')
      ]);

      var prossima = res[0];
      var partite = res[1] || [];
      var ultima = res[2];
      var odierna = res[3];
      var allenamenti = res[4] || [];
      var dispRosa = res[5] || { totale: 0, disponibili: 0, infortunati: 0, squalificati: 0, differenziati: 0, indisponibiliTotale: 0, percentuale: 0, indisponibiliLista: [] };
      var rosa = res[6] || [];
      var carico = res[7] || { mediaSettimanale: 0, giorni: [], acwr: '1.00', stato: 'In attesa dati GPS' };
      var reports = res[8] || [];
      var logs = res[9] || [];
      var impegni = res[10] || [];
      var allegati = res[11] || [];
      var viceStaff = res[12] || [];

      var cd = getCountdownValues(prossima ? prossima.data_ora : null);

      var liveNextMatch = prossima ? {
        id: prossima.id,
        avversario: prossima.avversario,
        data: formatDate(prossima.data_ora),
        orario: formatTime(prossima.data_ora),
        luogo: prossima.stadio ? (prossima.stadio + (prossima.casa_trasferta === 'casa' ? ' (Casa)' : ' (Trasf.)')) : (prossima.casa_trasferta === 'casa' ? 'In Casa' : 'Fuori Casa'),
        competizione: prossima.competizione || 'Campionato',
        giorniMancanti: cd.days,
        oreMancanti: cd.hours,
        minutiMancanti: cd.mins,
        targetIso: prossima.data_ora
      } : {
        id: null,
        avversario: 'Nessuna gara in programma',
        data: '--',
        orario: '--',
        luogo: 'In attesa di calendario gare',
        competizione: '--',
        giorniMancanti: 0,
        oreMancanti: 0,
        minutiMancanti: 0,
        targetIso: null
      };

      var liveSedutaOdierna = odierna ? {
        id: odierna.id,
        tipo: odierna.tipo || 'Seduta di campo',
        orario: formatTime(odierna.data_ora) + (odierna.durata_minuti ? (' · ' + odierna.durata_minuti + 'm') : ''),
        stato: odierna.stato || 'In programma'
      } : {
        id: null,
        tipo: 'Nessuna seduta oggi',
        orario: '--:--',
        stato: 'Riposo'
      };

      var liveProssimeGare = partite.map(function (p) {
        var isNext = prossima && p.id === prossima.id;
        return {
          id: p.id,
          data: formatDateTime(p.data_ora),
          comp: p.competizione || 'Campionato',
          avv: p.avversario,
          stadio: p.stadio || (p.casa_trasferta === 'casa' ? 'Casa' : 'Trasferta'),
          status: p.stato || (isNext ? 'Prossima' : 'Da preparare'),
          isNext: isNext
        };
      });

      var liveUltimaSessione = ultima ? {
        id: ultima.id,
        tipo: ultima.tipo || 'Seduta di campo',
        data: formatDateTime(ultima.data_ora),
        durata: (ultima.durata_minuti || 90) + ' min',
        carico: ultima.carico_percepito || 'Medio',
        giocatori: dispRosa.totale > 0 ? (dispRosa.disponibili + '/' + dispRosa.totale) : '--',
        esercizi: ultima.n_esercizi || 0,
        obiettivi: Array.isArray(ultima.obiettivi) ? ultima.obiettivi.length : (ultima.obiettivi ? 1 : 0)
      } : {
        id: null,
        tipo: 'Nessuna seduta recente',
        data: '--',
        durata: '--',
        carico: '--',
        giocatori: '0/0',
        esercizi: 0,
        obiettivi: 0
      };

      var liveRoster = rosa.map(function (g, idx) {
        var st = (g.stato || 'disponibile').toLowerCase();
        var isDisp = st === 'disponibile';
        return {
          id: g.id,
          num: g.numero_maglia || String(idx + 1),
          name: (g.cognome ? (g.cognome + ' ' + (g.nome || '')) : (g.nome || 'Calciatore')).trim(),
          role: g.ruolo || 'Calciatore',
          birth: g.data_nascita ? new Date(g.data_nascita).getFullYear() : '--',
          data_nascita: g.data_nascita || '',
          luogo_nascita: g.luogo_nascita || '',
          codice_fiscale: g.codice_fiscale || '',
          email: g.email || '',
          status: isDisp ? 'disp' : 'diff',
          statoDettagliato: st,
          motivo: g.motivo_indisponibilita || '',
          rientro: g.data_rientro_prevista ? formatDate(g.data_rientro_prevista) : '',
          app: 0,
          load: '--',
          acwr: '1.00'
        };
      });

      var liveTrainingsList = allenamenti.map(function (tr) {
        return {
          id: tr.id,
          tipo: tr.tipo || 'Seduta Tecnica',
          data: formatDate(tr.data_ora),
          orario: formatTime(tr.data_ora),
          luogo: 'Centro Sportivo Club',
          desc: Array.isArray(tr.obiettivi) ? tr.obiettivi.join(', ') : (tr.obiettivi || 'Obiettivi tecnici e tattici.'),
          carico: tr.carico_percepito || 'Medio'
        };
      });

      var liveLogs = logs.map(function (l) {
        var d = l.created_at ? new Date(l.created_at) : new Date();
        var dateStr = String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
        return {
          date: dateStr,
          text: l.descrizione || l.tipo_evento || 'Attività registrata'
        };
      });

      var liveImpegni = impegni.map(function (imp) {
        return {
          id: imp.id,
          title: imp.titolo,
          time: formatDateTime(imp.data_ora),
          type: imp.sottotitolo || 'Staff'
        };
      });

      var unreadReports = reports.filter(function (r) { return !r.letto; });

      var prepPct = 0;
      var prepFoot = 'In attesa gara';
      if (prossima) {
        var totalWeeklyTr = allenamenti.length;
        if (totalWeeklyTr > 0) {
          var completedTr = allenamenti.filter(function (a) { return a.stato === 'completata'; }).length;
          prepPct = Math.min(100, Math.round((completedTr / totalWeeklyTr) * 100));
          prepFoot = prepPct >= 80 ? 'Completa' : (prepPct > 0 ? 'In corso (' + prepPct + '%)' : 'Avviata');
        } else {
          prepPct = 0;
          prepFoot = 'Da avviare';
        }
      }

      _coachLiveData = {
        isLiveSupabase: true,
        clubId: clubId,
        clubName: user.squadra || user.club || 'Foggia City',
        categoria: user.categoria || 'Amatoriale · Foggia',
        coachName: [user.nome, user.cognome].filter(Boolean).join(' ').trim() || user.username || 'Elisee Miraglia',
        coachRole: user.staffRole || 'Allenatore Capo',
        matricola: user.matricola || 'FIGC-88210',
        patent: user.qualifica || 'UEFA B',
        nextMatch: liveNextMatch,
        sedutaOdierna: liveSedutaOdierna,
        prossimeGare: liveProssimeGare,
        ultimaSessione: liveUltimaSessione,
        trainingsList: liveTrainingsList,
        roster: liveRoster,
        dispRosa: dispRosa,
        carico: carico,
        prepPartita: { pct: prepPct, foot: prepFoot },
        reports: reports,
        unreadCount: unreadReports.length,
        logAttivita: liveLogs,
        prossimiImpegni: liveImpegni,
        allegati: allegati,
        viceLink: (viceStaff && viceStaff.length > 0) ? {
          id: viceStaff[0].id,
          name: ((viceStaff[0].nome || '') + ' ' + (viceStaff[0].cognome || '')).trim() || 'Vice Allenatore',
          role: 'Vice Allenatore / Staff Tecnico',
          patent: viceStaff[0].patentino || 'UEFA B',
          status: 'Collegato',
          lastSync: 'Sincronizzato'
        } : {
          id: 'vice-none',
          name: 'In attesa associazione Vice',
          role: 'Staff Tecnico',
          patent: 'UEFA B',
          status: 'Non connesso',
          lastSync: '--'
        }
      };

      updateCoachDomWithLiveData(_coachLiveData);
    } catch (err) {
      console.warn('[CoachDash] Errore sync live Supabase:', err);
    } finally {
      _isSyncing = false;
    }
  }

  function updateCoachDomWithLiveData(ld) {
    if (!ld) return;
    var elWhen = document.getElementById('match-when');
    var elOpp = document.getElementById('match-opp');
    var elComp = document.getElementById('match-comp');
    var elVenue = document.getElementById('match-venue');
    var elToday = document.getElementById('today-session');
    var elDays = document.getElementById('cd-days');
    var elHours = document.getElementById('cd-hours');
    var elMins = document.getElementById('cd-mins');

    if (elWhen) elWhen.textContent = ld.nextMatch.data === '--' ? '--' : (ld.nextMatch.data + ' - ' + ld.nextMatch.orario);
    if (elOpp) elOpp.textContent = ld.nextMatch.avversario;
    if (elComp) elComp.textContent = ld.nextMatch.competizione;
    if (elVenue) elVenue.textContent = ld.nextMatch.luogo;
    if (elToday) elToday.textContent = ld.sedutaOdierna.tipo + (ld.sedutaOdierna.orario !== '--:--' ? (' · ' + ld.sedutaOdierna.orario) : '');

    if (elDays) elDays.textContent = String(ld.nextMatch.giorniMancanti).padStart(2, '0');
    if (elHours) elHours.textContent = String(ld.nextMatch.oreMancanti).padStart(2, '0');
    if (elMins) elMins.textContent = String(ld.nextMatch.minutiMancanti).padStart(2, '0');

    var container = document.getElementById('es-cos-active-content');
    if (container) {
      syncLiveCoachData(user);
    var data = getCoachData();
      container.innerHTML = renderActiveTab(activeTab, data);
      bindAllEvents();
    }
  }

  // ============================================================
  // LIBRERIA RUOLI ESTESA & 7 MODULI TATTICI DINAMICI
  // ============================================================
  var LIBRERIA_RUOLI = {
    POR: { sigla: 'POR', nome: 'Portiere', reparto: 'POR', desc: 'Presidio della porta e conduzione difensiva' },
    LIB: { sigla: 'LIB', nome: 'Libero', reparto: 'DIF', desc: 'Copertura alle spalle dei centrali e prima impostazione' },
    DC:  { sigla: 'DC',  nome: 'Difensore Centrale', reparto: 'DIF', desc: 'Marcatura, duelli aerei e anticipo difensivo' },
    BCD: { sigla: 'BCD', nome: 'Braccetto Dx', reparto: 'DIF', desc: 'Centrale destro in difesa a 3 con licenza di sganciamento' },
    BCS: { sigla: 'BCS', nome: 'Braccetto Sx', reparto: 'DIF', desc: 'Centrale sinistro in difesa a 3 con conduzione palla' },
    TD:  { sigla: 'TD',  nome: 'Terzino Dx', reparto: 'DIF', desc: 'Copertura laterale destra e supporto alla catena' },
    TS:  { sigla: 'TS',  nome: 'Terzino Sx', reparto: 'DIF', desc: 'Copertura laterale sinistra e sovrapposizione' },
    EBD: { sigla: 'EBD', nome: 'Esterno Basso Dx', reparto: 'DIF', desc: 'Quinto di destra con compiti difensivi e progressione' },
    EBS: { sigla: 'EBS', nome: 'Esterno Basso Sx', reparto: 'DIF', desc: 'Quinto di sinistra a tutta fascia' },
    MED: { sigla: 'MED', nome: 'Mediano', reparto: 'CEN', desc: 'Interdizione, schermo davanti alla difesa e recupero palla' },
    REG: { sigla: 'REG', nome: 'Regista', reparto: 'CEN', desc: 'Direzione della manovra, tempi di gioco e passaggi chiave' },
    CC:  { sigla: 'CC',  nome: 'Mezzala / Centrocampista', reparto: 'CEN', desc: 'Inserimento, raccordo e dinamismo tra le linee' },
    TRQ: { sigla: 'TRQ', nome: 'Trequartista', reparto: 'CEN', desc: 'Fantasia tra le linee, rifinitura e tiro dalla distanza' },
    EAD: { sigla: 'EAD', nome: 'Esterno Alto Dx', reparto: 'CEN', desc: 'Spinta e cross dalla corsia laterale destra' },
    EAS: { sigla: 'EAS', nome: 'Esterno Alto Sx', reparto: 'CEN', desc: 'Ampiezza e rifinitura dalla fascia sinistra' },
    AD:  { sigla: 'AD',  nome: 'Ala Dx', reparto: 'ATT', desc: 'Dribbling, 1 contro 1 e convergenza sul piede preferito' },
    AS:  { sigla: 'AS',  nome: 'Ala Sx', reparto: 'ATT', desc: 'Isolamento laterale, attacco del secondo palo e tiro a giro' },
    SP:  { sigla: 'SP',  nome: 'Seconda Punta', reparto: 'ATT', desc: 'Attacco della profondità e dialogo tecnico con la prima punta' },
    FN:  { sigla: 'FN',  nome: 'Falso Nueve', reparto: 'ATT', desc: 'Svuotamento dell\'area, discesa a supporto e inserimenti ciechi' },
    ATT: { sigla: 'ATT', nome: 'Centravanti', reparto: 'ATT', desc: 'Finalizzazione d\'area, sponda aerea e profondità offensiva' }
  };

  var MODULI_TATTICI = {
    '4-3-3': {
      nome: '4-3-3 (Offensivo con Ali)',
      desc: 'Tridente largo, vertice basso di regia e due mezzali di inserimento.',
      slots: [
        { idx: 0, ruolo: 'POR', x: 50, y: 88, name: 'Portiere' },
        { idx: 1, ruolo: 'TD',  x: 84, y: 70, name: 'Terzino Dx' },
        { idx: 2, ruolo: 'DC',  x: 62, y: 73, name: 'Difensore Centrale 1' },
        { idx: 3, ruolo: 'DC',  x: 38, y: 73, name: 'Difensore Centrale 2' },
        { idx: 4, ruolo: 'TS',  x: 16, y: 70, name: 'Terzino Sx' },
        { idx: 5, ruolo: 'MED', x: 50, y: 53, name: 'Mediano' },
        { idx: 6, ruolo: 'CC',  x: 70, y: 46, name: 'Mezzala Dx' },
        { idx: 7, ruolo: 'CC',  x: 30, y: 46, name: 'Mezzala Sx' },
        { idx: 8, ruolo: 'AD',  x: 84, y: 22, name: 'Ala Dx' },
        { idx: 9, ruolo: 'AS',  x: 16, y: 22, name: 'Ala Sx' },
        { idx: 10, ruolo: 'ATT', x: 50, y: 15, name: 'Centravanti' }
      ]
    },
    '4-4-2': {
      nome: '4-4-2 (Classico Lineare)',
      desc: 'Doppia linea compatta, corsie esterne bilanciate e tandem d\'attacco complementare.',
      slots: [
        { idx: 0, ruolo: 'POR', x: 50, y: 88, name: 'Portiere' },
        { idx: 1, ruolo: 'TD',  x: 84, y: 70, name: 'Terzino Dx' },
        { idx: 2, ruolo: 'DC',  x: 62, y: 73, name: 'Difensore Centrale 1' },
        { idx: 3, ruolo: 'DC',  x: 38, y: 73, name: 'Difensore Centrale 2' },
        { idx: 4, ruolo: 'TS',  x: 16, y: 70, name: 'Terzino Sx' },
        { idx: 5, ruolo: 'EAD', x: 84, y: 46, name: 'Esterno Alto Dx' },
        { idx: 6, ruolo: 'CC',  x: 62, y: 48, name: 'Mezzala / Mediano' },
        { idx: 7, ruolo: 'REG', x: 38, y: 48, name: 'Regista di Centrocampo' },
        { idx: 8, ruolo: 'EAS', x: 16, y: 46, name: 'Esterno Alto Sx' },
        { idx: 9, ruolo: 'SP',  x: 38, y: 18, name: 'Seconda Punta' },
        { idx: 10, ruolo: 'ATT', x: 62, y: 18, name: 'Centravanti' }
      ]
    },
    '4-2-3-1': {
      nome: '4-2-3-1 (Doppio Mediano & Trequarti)',
      desc: 'Doppio perno difensivo, tridente di rifinitura e punta centrale terminale.',
      slots: [
        { idx: 0, ruolo: 'POR', x: 50, y: 88, name: 'Portiere' },
        { idx: 1, ruolo: 'TD',  x: 84, y: 72, name: 'Terzino Dx' },
        { idx: 2, ruolo: 'DC',  x: 62, y: 74, name: 'Difensore Centrale 1' },
        { idx: 3, ruolo: 'DC',  x: 38, y: 74, name: 'Difensore Centrale 2' },
        { idx: 4, ruolo: 'TS',  x: 16, y: 72, name: 'Terzino Sx' },
        { idx: 5, ruolo: 'MED', x: 62, y: 56, name: 'Mediano Destro' },
        { idx: 6, ruolo: 'REG', x: 38, y: 56, name: 'Regista / Mediano Sx' },
        { idx: 7, ruolo: 'AD',  x: 82, y: 36, name: 'Ala Trequartista Dx' },
        { idx: 8, ruolo: 'TRQ', x: 50, y: 34, name: 'Trequartista Centrale' },
        { idx: 9, ruolo: 'AS',  x: 18, y: 36, name: 'Ala Trequartista Sx' },
        { idx: 10, ruolo: 'ATT', x: 50, y: 15, name: 'Centravanti' }
      ]
    },
    '3-5-2': {
      nome: '3-5-2 (Ampiezza Quinti & Doppio Attacco)',
      desc: 'Difesa a 3 con braccetti, quinti a tutta fascia e due punte d\'attacco.',
      slots: [
        { idx: 0, ruolo: 'POR', x: 50, y: 88, name: 'Portiere' },
        { idx: 1, ruolo: 'BCD', x: 72, y: 74, name: 'Braccetto Dx' },
        { idx: 2, ruolo: 'LIB', x: 50, y: 76, name: 'Libero / Centrale' },
        { idx: 3, ruolo: 'BCS', x: 28, y: 74, name: 'Braccetto Sx' },
        { idx: 4, ruolo: 'EBD', x: 88, y: 50, name: 'Esterno Basso Dx (Quinto)' },
        { idx: 5, ruolo: 'CC',  x: 66, y: 52, name: 'Mezzala Dx' },
        { idx: 6, ruolo: 'REG', x: 50, y: 53, name: 'Regista Basso' },
        { idx: 7, ruolo: 'CC',  x: 34, y: 52, name: 'Mezzala Sx' },
        { idx: 8, ruolo: 'EBS', x: 12, y: 50, name: 'Esterno Basso Sx (Quinto)' },
        { idx: 9, ruolo: 'SP',  x: 38, y: 18, name: 'Seconda Punta' },
        { idx: 10, ruolo: 'ATT', x: 62, y: 18, name: 'Centravanti' }
      ]
    },
    '3-4-3': {
      nome: '3-4-3 (Tridente & Linea Mediana a 4)',
      desc: 'Aggressione alta, tre centrali strutturati, centrocampo a 4 e tridente puro.',
      slots: [
        { idx: 0, ruolo: 'POR', x: 50, y: 88, name: 'Portiere' },
        { idx: 1, ruolo: 'BCD', x: 72, y: 74, name: 'Braccetto Dx' },
        { idx: 2, ruolo: 'DC',  x: 50, y: 75, name: 'Centrale di Difesa' },
        { idx: 3, ruolo: 'BCS', x: 28, y: 74, name: 'Braccetto Sx' },
        { idx: 4, ruolo: 'EAD', x: 86, y: 50, name: 'Esterno Destro' },
        { idx: 5, ruolo: 'MED', x: 62, y: 52, name: 'Mediano Centrale' },
        { idx: 6, ruolo: 'CC',  x: 38, y: 52, name: 'Centrocampista Centrale' },
        { idx: 7, ruolo: 'EAS', x: 14, y: 50, name: 'Esterno Sinistro' },
        { idx: 8, ruolo: 'AD',  x: 82, y: 22, name: 'Ala Dx' },
        { idx: 9, ruolo: 'AS',  x: 18, y: 22, name: 'Ala Sx' },
        { idx: 10, ruolo: 'ATT', x: 50, y: 15, name: 'Centravanti' }
      ]
    },
    '5-3-2': {
      nome: '5-3-2 (Difesa a 5 & Contropiede Rapido)',
      desc: 'Linea difensiva a 5 solidissima, densità centrale e ripartenza veloce delle punte.',
      slots: [
        { idx: 0, ruolo: 'POR', x: 50, y: 88, name: 'Portiere' },
        { idx: 1, ruolo: 'TD',  x: 88, y: 70, name: 'Terzino Dx' },
        { idx: 2, ruolo: 'BCD', x: 69, y: 74, name: 'Braccetto Dx' },
        { idx: 3, ruolo: 'LIB', x: 50, y: 77, name: 'Libero / Centrale' },
        { idx: 4, ruolo: 'BCS', x: 31, y: 74, name: 'Braccetto Sx' },
        { idx: 5, ruolo: 'TS',  x: 12, y: 70, name: 'Terzino Sx' },
        { idx: 6, ruolo: 'CC',  x: 68, y: 50, name: 'Mezzala Dx' },
        { idx: 7, ruolo: 'MED', x: 50, y: 53, name: 'Mediano Centrale' },
        { idx: 8, ruolo: 'CC',  x: 32, y: 50, name: 'Mezzala Sx' },
        { idx: 9, ruolo: 'SP',  x: 38, y: 18, name: 'Seconda Punta' },
        { idx: 10, ruolo: 'ATT', x: 62, y: 18, name: 'Centravanti' }
      ]
    },
    '4-1-4-1': {
      nome: '4-1-4-1 (Vertice Basso & Linea di Trequarti)',
      desc: 'Schermo difensivo di filtro e linea di trequarti a quattro dietro la punta.',
      slots: [
        { idx: 0, ruolo: 'POR', x: 50, y: 88, name: 'Portiere' },
        { idx: 1, ruolo: 'TD',  x: 84, y: 72, name: 'Terzino Dx' },
        { idx: 2, ruolo: 'DC',  x: 62, y: 74, name: 'Difensore Centrale 1' },
        { idx: 3, ruolo: 'DC',  x: 38, y: 74, name: 'Difensore Centrale 2' },
        { idx: 4, ruolo: 'TS',  x: 16, y: 72, name: 'Terzino Sx' },
        { idx: 5, ruolo: 'MED', x: 50, y: 58, name: 'Vertice Basso / Regista' },
        { idx: 6, ruolo: 'EAD', x: 84, y: 38, name: 'Esterno Alto Dx' },
        { idx: 7, ruolo: 'CC',  x: 62, y: 40, name: 'Mezzala Offensiva Dx' },
        { idx: 8, ruolo: 'TRQ', x: 38, y: 40, name: 'Trequartista / Mezzala Sx' },
        { idx: 9, ruolo: 'EAS', x: 16, y: 38, name: 'Esterno Alto Sx' },
        { idx: 10, ruolo: 'ATT', x: 50, y: 15, name: 'Punta Unica / Falso Nueve' }
      ]
    }
  };

  function getDefaultRoster() {
    return [
      { id: 'p-1', num: 1, name: 'Alessandro Fumagalli', role: 'Portiere', status: 'disp', statoDettagliato: 'disponibile', birth: '1998', data_nascita: '1998-04-12', luogo_nascita: 'Foggia', codice_fiscale: 'FMGLSN98D12D643A', email: 'a.fumagalli@foggia.it', app: 14, load: 'Basso', acwr: '0.95' },
      { id: 'p-12', num: 12, name: 'Matteo Dalmasso', role: 'Portiere', status: 'disp', statoDettagliato: 'disponibile', birth: '2001', data_nascita: '2001-09-20', luogo_nascita: 'Torino', codice_fiscale: 'DLMMTT01P20L219F', email: 'm.dalmasso@foggia.it', app: 4, load: 'Basso', acwr: '0.90' },
      { id: 'p-2', num: 2, name: 'Luca Di Pasquale', role: 'Terzino Dx', status: 'disp', statoDettagliato: 'disponibile', birth: '1999', data_nascita: '1999-02-15', luogo_nascita: 'Bari', codice_fiscale: 'DPSLCU99B15A662K', email: 'l.dipasquale@foggia.it', app: 16, load: 'Medio', acwr: '1.02' },
      { id: 'p-3', num: 3, name: 'Simone Rizzo', role: 'Terzino Sx', status: 'disp', statoDettagliato: 'disponibile', birth: '2000', data_nascita: '2000-06-11', luogo_nascita: 'Lecce', codice_fiscale: 'RZZSMN00H11E506J', email: 's.rizzo@foggia.it', app: 15, load: 'Medio', acwr: '1.05' },
      { id: 'p-5', num: 5, name: 'Davide Carillo', role: 'Difensore Centrale', status: 'disp', statoDettagliato: 'disponibile', birth: '1996', data_nascita: '1996-01-28', luogo_nascita: 'Napoli', codice_fiscale: 'CRLDVD96A28F839W', email: 'd.carillo@foggia.it', app: 17, load: 'Alto', acwr: '1.12' },
      { id: 'p-6', num: 6, name: 'Emanuele Salines', role: 'Difensore Centrale', status: 'disp', statoDettagliato: 'disponibile', birth: '2000', data_nascita: '2000-11-04', luogo_nascita: 'Roma', codice_fiscale: 'SLNMNL00S04H501E', email: 'e.salines@foggia.it', app: 16, load: 'Medio', acwr: '1.04' },
      { id: 'p-13', num: 13, name: 'Marco Marzupio', role: 'Braccetto Dx', status: 'disp', statoDettagliato: 'disponibile', birth: '2000', data_nascita: '2000-03-08', luogo_nascita: 'Bergamo', codice_fiscale: 'MRZMRC00C08A794X', email: 'm.marzupio@foggia.it', app: 11, load: 'Medio', acwr: '1.00' },
      { id: 'p-14', num: 14, name: 'Giacomo Riccardi', role: 'Libero', status: 'disp', statoDettagliato: 'disponibile', birth: '1997', data_nascita: '1997-08-19', luogo_nascita: 'Salerno', codice_fiscale: 'RCCGCM97M19H703B', email: 'g.riccardi@foggia.it', app: 9, load: 'Basso', acwr: '0.98' },
      { id: 'p-15', num: 15, name: 'Filippo Antonacci', role: 'Esterno Basso Sx', status: 'disp', statoDettagliato: 'disponibile', birth: '2001', data_nascita: '2001-05-30', luogo_nascita: 'Taranto', codice_fiscale: 'NTNFPP01E30L049G', email: 'f.antonacci@foggia.it', app: 8, load: 'Medio', acwr: '1.01' },
      { id: 'p-4', num: 4, name: 'Moses Odjer', role: 'Mediano', status: 'disp', statoDettagliato: 'disponibile', birth: '1996', data_nascita: '1996-07-04', luogo_nascita: 'Accra', codice_fiscale: 'DJRMSS96L04Z324L', email: 'm.odjer@foggia.it', app: 18, load: 'Alto', acwr: '1.15' },
      { id: 'p-8', num: 8, name: 'Andrea Tascone', role: 'Mezzala Dx', status: 'disp', statoDettagliato: 'disponibile', birth: '1997', data_nascita: '1997-09-29', luogo_nascita: 'Napoli', codice_fiscale: 'TSNNDR97P29F839Z', email: 'a.tascone@foggia.it', app: 17, load: 'Alto', acwr: '1.08' },
      { id: 'p-10', num: 10, name: 'Carlos Embalo', role: 'Trequartista', status: 'disp', statoDettagliato: 'disponibile', birth: '1994', data_nascita: '1994-11-25', luogo_nascita: 'Bissau', codice_fiscale: 'MBLCRL94S25Z323P', email: 'c.embalo@foggia.it', app: 15, load: 'Medio', acwr: '1.03' },
      { id: 'p-16', num: 16, name: 'Federico Frigerio', role: 'Mezzala Sx', status: 'disp', statoDettagliato: 'disponibile', birth: '2001', data_nascita: '2001-01-14', luogo_nascita: 'Milano', codice_fiscale: 'FRGFRC01A14F205R', email: 'f.frigerio@foggia.it', app: 12, load: 'Medio', acwr: '1.02' },
      { id: 'p-18', num: 18, name: 'Mattia Fiorini', role: 'Regista', status: 'disp', statoDettagliato: 'disponibile', birth: '2001', data_nascita: '2001-03-31', luogo_nascita: 'Firenze', codice_fiscale: 'FRNMTT01C31D612E', email: 'm.fiorini@foggia.it', app: 10, load: 'Basso', acwr: '0.96' },
      { id: 'p-7', num: 7, name: 'Diego Peralta', role: 'Ala Dx', status: 'disp', statoDettagliato: 'disponibile', birth: '1996', data_nascita: '1996-09-27', luogo_nascita: 'Livorno', codice_fiscale: 'PRLDGO96P27E625T', email: 'd.peralta@foggia.it', app: 16, load: 'Alto', acwr: '1.10' },
      { id: 'p-11', num: 11, name: 'Andrea Schenetti', role: 'Ala Sx', status: 'disp', statoDettagliato: 'disponibile', birth: '1991', data_nascita: '1991-03-09', luogo_nascita: 'Milano', codice_fiscale: 'SCNNDR91C09F205D', email: 'a.schenetti@foggia.it', app: 18, load: 'Alto', acwr: '1.14' },
      { id: 'p-9', num: 9, name: 'Jacopo Murano', role: 'Centravanti', status: 'disp', statoDettagliato: 'disponibile', birth: '1990', data_nascita: '1990-02-14', luogo_nascita: 'Potenza', codice_fiscale: 'MRNJCP90B14G942J', email: 'j.murano@foggia.it', app: 17, load: 'Alto', acwr: '1.18' },
      { id: 'p-19', num: 19, name: 'Francesco Orlando', role: 'Seconda Punta', status: 'disp', statoDettagliato: 'disponibile', birth: '1996', data_nascita: '1996-10-01', luogo_nascita: 'Taranto', codice_fiscale: 'RLNFNC96R01L049M', email: 'f.orlando@foggia.it', app: 13, load: 'Medio', acwr: '1.06' },
      { id: 'p-20', num: 20, name: 'Gabriel Santaniello', role: 'Falso Nueve', status: 'disp', statoDettagliato: 'disponibile', birth: '1990', data_nascita: '1990-12-19', luogo_nascita: 'Napoli', codice_fiscale: 'SNTGRL90T19F839K', email: 'g.santaniello@foggia.it', app: 11, load: 'Basso', acwr: '0.99' },
      { id: 'p-21', num: 21, name: 'Lorenzo Garattoni', role: 'Esterno Alto Dx', status: 'disp', statoDettagliato: 'disponibile', birth: '1998', data_nascita: '1998-01-23', luogo_nascita: 'Cesena', codice_fiscale: 'GRTLNZ98A23C573V', email: 'l.garattoni@foggia.it', app: 14, load: 'Medio', acwr: '1.04' },
      { id: 'p-22', num: 22, name: 'Alberto Rizzo', role: 'Esterno Alto Sx', status: 'disp', statoDettagliato: 'disponibile', birth: '1997', data_nascita: '1997-04-25', luogo_nascita: 'Trapani', codice_fiscale: 'RZZLRT97D25L331W', email: 'a.rizzo@foggia.it', app: 12, load: 'Medio', acwr: '1.02' }
    ];
  }

  function getShortRole(roleStr) {
    if (!roleStr) return 'CC';
    var r = String(roleStr).trim().toLowerCase();
    if (/portiere/i.test(r)) return 'POR';
    if (/libero/i.test(r)) return 'LIB';
    if (/braccetto d/i.test(r)) return 'BCD';
    if (/braccetto s/i.test(r)) return 'BCS';
    if (/difensore centrale/i.test(r)) return 'DC';
    if (/terzino d/i.test(r)) return 'TD';
    if (/terzino s/i.test(r)) return 'TS';
    if (/esterno b.*d/i.test(r)) return 'EBD';
    if (/esterno b.*s/i.test(r)) return 'EBS';
    if (/regista/i.test(r)) return 'REG';
    if (/mediano/i.test(r)) return 'MED';
    if (/trequartista/i.test(r)) return 'TRQ';
    if (/mezzala d/i.test(r)) return 'CC';
    if (/mezzala s/i.test(r)) return 'CC';
    if (/mezzala|centrocampista/i.test(r)) return 'CC';
    if (/esterno a.*d/i.test(r)) return 'EAD';
    if (/esterno a.*s/i.test(r)) return 'EAS';
    if (/ala d/i.test(r)) return 'AD';
    if (/ala s/i.test(r)) return 'AS';
    if (/seconda punta/i.test(r)) return 'SP';
    if (/falso nueve/i.test(r)) return 'FN';
    if (/centravanti|punta|attaccante/i.test(r)) return 'ATT';
    var clean = roleStr.replace(/[^A-Za-z]/g, '').toUpperCase();
    return clean.length >= 2 ? clean.substring(0, 3) : 'CC';
  }

  function matchRole(playerRole, slotRole) {
    if (!playerRole || !slotRole) return false;
    var pr = String(playerRole).toLowerCase();
    var sr = String(slotRole).toUpperCase();
    if (sr === 'POR' && /portiere|por/i.test(pr)) return true;
    if ((sr === 'DC' || sr === 'LIB' || sr === 'BCD' || sr === 'BCS') && /difensore|centrale|libero|braccetto/i.test(pr)) return true;
    if ((sr === 'TD' || sr === 'EBD') && /terzino d|destro|esterno b.*d/i.test(pr)) return true;
    if ((sr === 'TS' || sr === 'EBS') && /terzino s|sinistro|esterno b.*s/i.test(pr)) return true;
    if ((sr === 'MED' || sr === 'REG') && /mediano|regista|centrocampista d/i.test(pr)) return true;
    if (sr === 'CC' && /mezzala|centrocampista/i.test(pr)) return true;
    if (sr === 'TRQ' && /trequartista|fantasista/i.test(pr)) return true;
    if ((sr === 'AD' || sr === 'EAD') && /ala d|esterno a.*d/i.test(pr)) return true;
    if ((sr === 'AS' || sr === 'EAS') && /ala s|esterno a.*s/i.test(pr)) return true;
    if ((sr === 'ATT' || sr === 'SP' || sr === 'FN') && /punta|centravanti|attaccante|seconda punta|falso/i.test(pr)) return true;
    return false;
  }

  function getRoleBadgeStyle(pos) {
    var p = String(pos || '').toUpperCase();
    if (p === 'POR') return 'background:rgba(234,179,8,0.15); border:1px solid rgba(234,179,8,0.4); color:#facc15;';
    if (['LIB', 'DC', 'BCD', 'BCS', 'TD', 'TS', 'EBD', 'EBS'].indexOf(p) >= 0) {
      return 'background:rgba(59,130,246,0.15); border:1px solid rgba(59,130,246,0.4); color:#93c5fd;';
    }
    if (['MED', 'REG', 'CC', 'TRQ', 'EAD', 'EAS'].indexOf(p) >= 0) {
      return 'background:rgba(16,185,129,0.15); border:1px solid rgba(16,185,129,0.4); color:#6ee7b7;';
    }
    return 'background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.4); color:#fca5a5;';
  }

  function syncFormationWithRoster(data) {
    if (!data) return;
    if (!data.roster || !Array.isArray(data.roster) || data.roster.length === 0) {
      data.roster = getDefaultRoster();
    }

    var modKey = String(data.moduloPrincipale || '4-3-3').trim();
    if (!MODULI_TATTICI[modKey]) modKey = '4-3-3';
    data.moduloPrincipale = modKey;
    var modDef = MODULI_TATTICI[modKey];

    var availableRoster = data.roster.filter(function (p) {
      var st = String(p.statoDettagliato || p.status || 'disponibile').toLowerCase();
      return st === 'disponibile' || st === 'disp';
    });
    if (availableRoster.length < 11) {
      var def = getDefaultRoster();
      for (var d = 0; d < def.length; d++) {
        var found = availableRoster.some(function (r) { return r.id === def[d].id || String(r.num) === String(def[d].num); });
        if (!found) availableRoster.push(def[d]);
      }
    }

    var needsInit = !Array.isArray(data.top11) || data.top11.length !== 11;
    if (!needsInit) {
      var genericCount = data.top11.filter(function (p) { return /Titolare \d+/i.test(p.name); }).length;
      if (genericCount >= 6) needsInit = true;
    }

    if (needsInit) {
      data.top11 = [];
      var usedIds = {};
      modDef.slots.forEach(function (slot) {
        var matched = null;
        for (var i = 0; i < availableRoster.length; i++) {
          var cand = availableRoster[i];
          var key = cand.id || ('num-' + cand.num);
          if (usedIds[key]) continue;
          if (matchRole(cand.role, slot.ruolo)) {
            matched = cand;
            break;
          }
        }
        if (!matched) {
          for (var j = 0; j < availableRoster.length; j++) {
            var c2 = availableRoster[j];
            var key2 = c2.id || ('num-' + c2.num);
            if (!usedIds[key2]) {
              matched = c2;
              break;
            }
          }
        }
        if (matched) {
          usedIds[matched.id || ('num-' + matched.num)] = true;
          data.top11.push({
            id: matched.id || ('p-' + matched.num),
            num: matched.num,
            name: matched.name,
            pos: slot.ruolo,
            roleName: slot.name,
            originalRole: matched.role,
            rating: matched.rating || '--'
          });
        } else {
          data.top11.push({
            id: 'slot-' + slot.idx,
            num: slot.idx + 1,
            name: slot.name,
            pos: slot.ruolo,
            roleName: slot.name,
            originalRole: slot.ruolo,
            rating: '--'
          });
        }
      });
    } else {
      for (var s = 0; s < 11; s++) {
        var slotDef = modDef.slots[s];
        if (data.top11[s] && slotDef) {
          if (!data.top11[s].pos || data.top11[s].pos === 'C') {
            data.top11[s].pos = slotDef.ruolo;
          }
          data.top11[s].roleName = slotDef.name;
        }
      }
    }

    var top11Nums = {};
    var top11Ids = {};
    data.top11.forEach(function (t) {
      if (t.num != null) top11Nums[String(t.num)] = true;
      if (t.id) top11Ids[String(t.id)] = true;
    });

    var panchinaList = [];
    availableRoster.forEach(function (r) {
      var isStarter = (r.id && top11Ids[String(r.id)]) || top11Nums[String(r.num)];
      if (!isStarter) {
        panchinaList.push({
          id: r.id || ('bench-' + r.num),
          num: r.num,
          name: r.name,
          pos: getShortRole(r.role),
          role: r.role,
          status: r.status || 'disp',
          birth: r.birth || '--'
        });
      }
    });

    if (panchinaList.length === 0) {
      var defRoster = getDefaultRoster();
      defRoster.forEach(function (r) {
        if (!top11Nums[String(r.num)]) {
          panchinaList.push({
            id: r.id,
            num: r.num,
            name: r.name,
            pos: getShortRole(r.role),
            role: r.role,
            status: 'disp',
            birth: r.birth || '--'
          });
        }
      });
    }

    data.panchina = panchinaList;
  }

  function syncTacticalBoard(data) {
    if (!data) return;
    if (!data.tacticalBoard || typeof data.tacticalBoard !== 'object') {
      data.tacticalBoard = {};
    }
    var tb = data.tacticalBoard;
    if (!tb.modulo) tb.modulo = '4-3-3';
    var modDef = MODULI_TATTICI[tb.modulo] || MODULI_TATTICI['4-3-3'];

    if (!Array.isArray(tb.arrows)) tb.arrows = [];
    if (!Array.isArray(tb.zones)) tb.zones = [];
    if (!tb.activeTool) tb.activeTool = 'move';

    // Recupera schemi salvati da localStorage se vuoti
    if (!Array.isArray(tb.schemiSalvati) || tb.schemiSalvati.length === 0) {
      try {
        var localSchemi = JSON.parse(localStorage.getItem('elisee_schemi_tattici') || '[]');
        if (Array.isArray(localSchemi)) tb.schemiSalvati = localSchemi;
      } catch (_) { tb.schemiSalvati = []; }
    }

    // Se i pins non sono ancora inizializzati o non hanno 12 elementi (11 giocatori + 1 ball)
    if (!Array.isArray(tb.pins) || tb.pins.length < 11) {
      var pins = [];
      var sourceList = (data.top11 && data.top11.length === 11) ? data.top11 : (data.roster || getDefaultRoster());
      for (var s = 0; s < 11; s++) {
        var slot = modDef.slots[s] || { x: 50, y: 50, ruolo: 'CC', name: 'Giocatore' };
        var p = sourceList[s] || { num: s + 1, name: slot.name, pos: slot.ruolo };
        pins.push({
          id: 'bp-' + (s + 1),
          type: 'blue',
          num: p.num || (s + 1),
          name: p.name || slot.name,
          pos: p.pos || slot.ruolo,
          x: slot.x,
          y: slot.y
        });
      }
      pins.push({
        id: 'ball',
        type: 'ball',
        num: '',
        name: 'Palla',
        pos: '',
        x: 50,
        y: 42
      });
      tb.pins = pins;
    }
  }

  function changeTacticalBoardModulo(data, newModulo) {
    if (!data || !data.tacticalBoard) return;
    var tb = data.tacticalBoard;
    tb.modulo = newModulo;
    var modDef = MODULI_TATTICI[newModulo] || MODULI_TATTICI['4-3-3'];
    for (var s = 0; s < 11; s++) {
      var slot = modDef.slots[s];
      if (tb.pins && tb.pins[s] && slot) {
        tb.pins[s].x = slot.x;
        tb.pins[s].y = slot.y;
        tb.pins[s].pos = slot.ruolo;
      }
    }
    saveCoachData(data);
  }

  function syncBoardFromOfficialXI(data) {
    if (!data) return;
    if (!data.tacticalBoard) data.tacticalBoard = {};
    var tb = data.tacticalBoard;
    tb.modulo = data.moduloPrincipale || '4-3-3';
    var modDef = MODULI_TATTICI[tb.modulo] || MODULI_TATTICI['4-3-3'];
    var starters = (data.top11 && data.top11.length === 11) ? data.top11 : (data.roster || getDefaultRoster());
    var pins = [];
    for (var s = 0; s < 11; s++) {
      var slot = modDef.slots[s] || { x: 50, y: 50, ruolo: 'CC', name: 'Giocatore' };
      var p = starters[s] || { num: s + 1, name: slot.name, pos: slot.ruolo };
      pins.push({
        id: 'bp-' + (s + 1),
        type: 'blue',
        num: p.num || (s + 1),
        name: p.name || slot.name,
        pos: p.pos || slot.ruolo,
        x: slot.x,
        y: slot.y
      });
    }
    pins.push({
      id: 'ball',
      type: 'ball',
      num: '',
      name: 'Palla',
      pos: '',
      x: 50,
      y: 42
    });
    tb.pins = pins;
    saveCoachData(data);
  }

  function getCoachData() {
    var u = userObj();
    var base = {
      coachName: [u.nome, u.cognome].filter(Boolean).join(' ').trim() || u.username || 'Elisee Miraglia',
      coachRole: u.staffRole || 'Allenatore Capo',
      patent: u.qualifica || (u.staffProfile && u.staffProfile.qualifica) || 'UEFA B',
      status: 'in_carica',
      clubName: u.squadra || 'Foggia City',
      categoria: 'Amatoriale · Foggia',
      reparto: 'Prima Squadra',
      matricola: u.matricola || 'FIGC-88210',
      scadenzaTesseramento: '30/06/2027',
      sede: 'Foggia (FG)',
      stadio: 'Campo Comunale - Foggia',
      telefono: u.telefono || '+39 340 1234567',
      logoUrl: 'immagini/squadre-loghi/foggia-city.png',

      nextMatch: {
        id: 'next-cerignola',
        avversario: 'Cerignola Nord',
        data: '18/09/2026',
        orario: '15:30',
        luogo: 'Campo Comunale Cerignola',
        competizione: 'Campionato Foggia',
        giorniMancanti: 2,
        oreMancanti: 15,
        minutiMancanti: 24
      },
      sedutaOdierna: {
        id: null,
        tipo: 'In attesa...',
        orario: '--',
        stato: '--'
      },
      prossimeGare: [
        { id: 'm-cerignola', avv: 'Cerignola Nord', data: '18/09/2026', comp: 'Campionato', stadio: 'Cerignola', status: 'Da preparare' },
        { id: 'm-manfredonia', avv: 'Manfredonia Calcio', data: '25/09/2026', comp: 'Campionato', stadio: 'Foggia', status: 'Programmata' },
        { id: 'm-san-severo', avv: 'San Severo Team', data: '02/10/2026', comp: 'Coppa', stadio: 'San Severo', status: 'Programmata' }
      ],
      ultimaSessione: {
        id: null,
        tipo: 'In attesa...',
        data: '--',
        durata: '--',
        carico: '--',
        giocatori: '0/0',
        esercizi: 0,
        obiettivi: 0
      },
      viceLink: {
        id: 'vice-none',
        name: 'In attesa associazione Vice',
        role: 'Vice Allenatore / Staff Tecnico',
        patent: 'UEFA B',
        email: '',
        status: 'In attesa',
        lastSync: '--'
      },
      moduloPrincipale: '4-3-3',
      moduloSecondario: '4-2-3-1',
      formazioneUfficialeConfermata: true,
      top11: [],
      panchina: [],
      roster: [],
      notifiche: [],
      logAttivita: [],
      prossimiImpegni: [],
      trainingsList: [],
      messaggiStaff: [],
      allegati: [],
      dispRosa: { totale: 0, disponibili: 0, infortunati: 0, squalificati: 0, differenziati: 0, indisponibiliTotale: 0, percentuale: 0, indisponibiliLista: [] },
      carico: { mediaSettimanale: 0, giorni: [], acwr: '1.00', stato: 'In attesa dati GPS' },
      prepPartita: { pct: 0, foot: 'In attesa' },
      reports: [],
      unreadCount: 0,
      analisiAvversario: {
        nome: 'Cerignola Nord',
        campionato: 'Campionato Foggia',
        modulo: '4-4-2',
        puntiForza: 'Transizioni rapide sulle corsie laterali e pericolosità sui calci da fermo.',
        puntiDeboli: 'Spazi concessi dietro i terzini quando salgono in pressione; fatica nel disimpegno sotto pressing.',
        giocatoriChiave: 'Numero 9 (punta strutturata) e numero 10 (regista basso).',
        palleInattive: 'Corner a rientrare sul primo palo con blocchi su difensore centrale.',
        videoReport: 'Nessun video report caricato.'
      },
      selectedDossierMatchId: 'm-cerignola',
      dossierByMatch: {},
      tacticalBoard: {
        modulo: '4-3-3',
        pins: [],
        arrows: [],
        zones: [],
        activeTool: 'move',
        schemiSalvati: []
      },
      boardPins: []
    };

    try {
      var saved = JSON.parse(localStorage.getItem('elisee_coach_data') || '{}');
      if (saved && typeof saved === 'object') {
        if (saved.moduloPrincipale) base.moduloPrincipale = saved.moduloPrincipale;
        if (Array.isArray(saved.top11) && saved.top11.length === 11) base.top11 = saved.top11;
        if (Array.isArray(saved.panchina)) base.panchina = saved.panchina;
        if (Array.isArray(saved.roster) && saved.roster.length > 0) base.roster = saved.roster;
        if (typeof saved.formazioneUfficialeConfermata === 'boolean') base.formazioneUfficialeConfermata = saved.formazioneUfficialeConfermata;
        if (saved.tacticalBoard && typeof saved.tacticalBoard === 'object') base.tacticalBoard = saved.tacticalBoard;
        if (saved.selectedDossierMatchId) base.selectedDossierMatchId = saved.selectedDossierMatchId;
        if (saved.dossierByMatch) base.dossierByMatch = saved.dossierByMatch;
      }
    } catch (_) {}

    if (_coachLiveData) {
      var merged = Object.assign({}, base, _coachLiveData);
      syncFormationWithRoster(merged);
      syncTacticalBoard(merged);
      return merged;
    }

    syncFormationWithRoster(base);
    syncTacticalBoard(base);
    return base;
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
    var portal = document.getElementById('user-dossier-portal');
    if (portal) portal.classList.add('is-coach-dash');
    var inner = portal ? portal.querySelector('.pf-page-inner') : null;
    if (inner) inner.classList.add('is-coach-inner');
    try { document.body.classList.add('is-coach-mode'); } catch (_) {}
    if (typeof window.updatePublicFooterVisibility === 'function') {
      window.updatePublicFooterVisibility('user-dossier', '#user-dossier-portal');
    } else {
      var f = document.getElementById('site-public-footer') || document.querySelector('footer.site-footer');
      if (f) { f.style.setProperty('display', 'none', 'important'); f.setAttribute('hidden', ''); }
    }

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
    return '<button type="button" class="es-cos-nav-tab ' + (isAct ? 'is-active' : '') + '" data-tab-nav="' + tabKey + '">' +
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
    var nextVal = (data.nextMatch && data.nextMatch.id) ? (data.nextMatch.data + ' ' + data.nextMatch.orario) : '--';
    var nextFoot = (data.nextMatch && data.nextMatch.id) ? (data.nextMatch.avversario + ' · ' + data.nextMatch.giorniMancanti + ' giorni') : 'Nessuna gara in programma';

    var ultVal = (data.ultimaSessione && data.ultimaSessione.id) ? data.ultimaSessione.data : '--';
    var ultFoot = (data.ultimaSessione && data.ultimaSessione.id) ? ('✓ ' + data.ultimaSessione.tipo + ' · Completata') : 'Nessuna seduta recente';

    var caricoVal = (data.carico && data.carico.mediaSettimanale > 0) ? (data.carico.mediaSettimanale + '%') : '--';
    var caricoBar = (data.carico && data.carico.mediaSettimanale > 0) ? data.carico.mediaSettimanale : 0;
    var caricoFoot = (data.carico && data.carico.stato) ? data.carico.stato : 'In attesa dati GPS';

    var disp = data.dispRosa || {};
    var dispVal = (disp.totale > 0) ? (disp.disponibili + '/' + disp.totale + ' · ' + disp.percentuale + '%') : '0/0 · --%';
    var dispBar = disp.percentuale || 0;
    var dispFoot = disp.totale > 0 ? (disp.percentuale >= 85 ? 'Ottimale' : (disp.percentuale >= 70 ? 'Attenzione' : 'Critica')) : 'Rosa non inserita';

    var indispVal = (disp.totale > 0) ? (disp.indisponibiliTotale + ' (' + Math.round((disp.indisponibiliTotale / disp.totale) * 100) + '%)') : '0';
    var indispFoot = disp.indisponibiliTotale > 0 ? '⚠ Da monitorare' : '✓ Tutti disponibili';

    var prep = data.prepPartita || {};
    var prepVal = (data.nextMatch && data.nextMatch.id) ? (prep.pct + '%') : '--';
    var prepBar = (data.nextMatch && data.nextMatch.id) ? prep.pct : 0;
    var prepFoot = (data.nextMatch && data.nextMatch.id) ? (prep.foot || 'In corso') : 'Nessuna gara';

    var repVal = String(data.unreadCount != null ? data.unreadCount : (data.reports ? data.reports.length : 0));
    var repFoot = data.unreadCount > 0 ? ('+' + data.unreadCount + ' non letti') : (data.reports && data.reports.length ? (data.reports.length + ' in archivio') : 'Nessun report');

    var sedVal = String(data.trainingsList ? data.trainingsList.length : 0);
    var sedFoot = (data.trainingsList && data.trainingsList.length > 0) ? 'Sedute pianificate' : 'Nessuna seduta programmata';

    var statItems = [
      { key: "calendar", label: "Prossima Gara", value: nextVal, foot: nextFoot, color: "blue", tab: "calendario" },
      { key: "check", label: "Ultima Seduta", value: ultVal, foot: ultFoot, color: "green", tab: "allenamenti" },
      { key: "heart", label: "Carico Squadra", value: caricoVal, foot: caricoFoot, color: "green", bar: caricoBar, tab: "gps_carichi" },
      { key: "users", label: "Disponibilità Rosa", value: dispVal, foot: dispFoot, color: "blue", bar: dispBar, tab: "rosa" },
      { key: "alert", label: "Giocatori indisponibili", value: indispVal, foot: indispFoot, color: disp.indisponibiliTotale > 0 ? "red" : "green", tab: "rosa" },
      { key: "trend", label: "Preparazione Partita", value: prepVal, foot: prepFoot, color: "blue", bar: prepBar, tab: "formazione" },
      { key: "file", label: "Report ricevuti", value: repVal, foot: repFoot, color: "blue", tab: "report_staff" },
      { key: "calcheck", label: "Sedute programmate", value: sedVal, foot: sedFoot, color: "blue", tab: "allenamenti" }
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
        // 1. RIEPILOGO STAGIONALE (8 Stat Cards - Reali da Supabase)
        '<section class="es-cos-card es-cos-stat-grid-8">' +
          statItems.map(function (s) {
            var barHtml = '<div class="es-cos-bar-track' + (s.bar ? '' : ' is-placeholder') + '">' +
              (s.bar ? '<div class="es-cos-bar-fill" style="width:' + Math.min(100, s.bar) + '%; background:' + COLOR_MAP[s.color] + ';"></div>' : '') +
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
          // Blocco A: Calendario Prossime Gare
          '<div class="es-cos-card" style="padding:20px;">' +
            '<div class="es-cos-section-title">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
              '<span>Calendario Prossime Gare</span>' +
              '<a class="es-cos-section-link" data-tab-nav="calendario">Visualizza tutto &rarr;</a>' +
            '</div>' +
            '<table class="es-cos-match-table">' +
              '<thead><tr><th>Data</th><th>Competizione</th><th>Avversario</th><th>Stadio</th><th></th></tr></thead>' +
              '<tbody>' +
                (data.prossimeGare && data.prossimeGare.length ? data.prossimeGare.map(function (m) {
                  var isNext = m.isNext || m.status === 'Prossima';
                  var dotColor = isNext ? 'var(--cos-amber)' : 'var(--cos-blue)';
                  var tagClass = isNext ? 'is-next' : 'is-prep';
                  var tagLabel = isNext ? 'Prossima' : 'Da preparare';
                  var miniCrest = (m.avv || 'AVV').slice(0, 3).toUpperCase();
                  return (
                    '<tr data-tab-nav="calendario" title="Dettagli gara ' + esc(m.avv) + '">' +
                      '<td style="white-space:nowrap;"><span class="es-cos-match-dot" style="background:' + dotColor + ';"></span>' + esc(m.data) + '</td>' +
                      '<td style="color:var(--cos-text-muted);">' + esc(m.comp) + '</td>' +
                      '<td><div class="es-cos-opp-cell"><span class="crest crest--sm es-cos-crest--sm">' + esc(miniCrest) + '</span>' + esc(m.avv) + '</div></td>' +
                      '<td style="color:var(--cos-text-muted);">' + esc(m.stadio) + '</td>' +
                      '<td><span class="es-cos-status-tag ' + tagClass + '">' + tagLabel + ' &rsaquo;</span></td>' +
                    '</tr>'
                  );
                }).join('') : '<tr><td colspan="5" style="text-align:center; padding:2rem 1rem; color:var(--cos-text-muted);"><div style="font-weight:700; color:#f3f8fc; font-size:0.9rem;">Nessuna gara in programma</div><div style="font-size:0.75rem; margin-top:0.25rem;">Nessuna partita registrata su Supabase per questo club.</div></td></tr>') +
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
            (data.ultimaSessione && data.ultimaSessione.id ? (
              '<div class="es-cos-session-thumb">' +
                '<svg class="es-pitch-svg" viewBox="0 0 300 94" preserveAspectRatio="none">' +
                  '<rect x="8" y="7" width="284" height="80" rx="3" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1.5"/>' +
                  '<line x1="150" y1="7" x2="150" y2="87" stroke="rgba(255,255,255,0.45)" stroke-width="1.5"/>' +
                  '<circle cx="150" cy="47" r="20" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1.5"/>' +
                  '<rect x="8" y="24" width="36" height="46" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1.5"/>' +
                  '<rect x="256" y="24" width="36" height="46" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1.5"/>' +
                '</svg>' +
                '<span class="es-cos-session-thumb-badge">' + esc(data.ultimaSessione.tipo) + '</span>' +
              '</div>' +
              '<div class="es-cos-session-meta-row">' +
                '<div>' +
                  '<strong>' + esc(data.ultimaSessione.tipo) + '</strong>' +
                  '<span>' + esc(data.ultimaSessione.data) + ' · ' + esc(data.ultimaSessione.durata) + '</span>' +
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
                  '<span>Verifica referti e schede tecniche dello staff</span>' +
                '</div>' +
                '<button type="button" class="es-btn-outline-sm" data-tab-nav="report_staff">Apri Report &rarr;</button>' +
              '</div>'
            ) : (
              '<div style="text-align:center; padding:2.5rem 1rem; color:var(--cos-text-muted);">' +
                '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="opacity:0.5; margin-bottom:0.5rem;"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>' +
                '<div style="font-weight:700; color:#f3f8fc; font-size:0.9rem;">Nessuna seduta registrata</div>' +
                '<div style="font-size:0.75rem; margin-top:0.25rem;">Le sedute svolte registrate su Supabase appariranno qui.</div>' +
                '<button type="button" class="es-btn-outline-sm" data-tab-nav="allenamenti" style="margin-top:1rem;">Pianifica Seduta &rarr;</button>' +
              '</div>'
            )) +
          '</div>' +

          // Blocco C: Notifiche Live Staff
          '<div class="es-cos-card" style="padding:20px;">' +
            '<div class="es-cos-section-title">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>' +
              '<span>Notifiche & Novità</span>' +
              '<a class="es-cos-section-link" data-tab-nav="report_staff">Visualizza &rarr;</a>' +
            '</div>' +
            '<div class="es-cos-notif-list">' +
              (data.notifiche && data.notifiche.length ? data.notifiche.slice(0, 5).map(function (n) {
                return (
                  '<div class="es-cos-notif-item">' +
                    '<span class="es-cos-notif-icon" style="background:var(--cos-blue-soft); color:var(--cos-blue);"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg></span>' +
                    '<div style="flex:1;">' +
                      '<strong>' + esc(n.text) + '</strong>' +
                      '<span>' + esc(n.date) + '</span>' +
                    '</div>' +
                  '</div>'
                );
              }).join('') : '<div style="text-align:center; padding:2rem 1rem; color:var(--cos-text-muted); font-size:0.8rem;">Nessuna notifica staff presente.</div>') +
            '</div>' +
          '</div>' +
        '</section>' +

        // 3. GRIGLIA INFERIORE (Ultimi Log 1fr / Carico Settimanale 1.2fr / Prossimi Impegni 1fr)
        '<section class="es-cos-grid-lower-3">' +
          // Blocco 1: Ultimi Log Attività
          '<div class="es-cos-card" style="padding:20px;">' +
            '<div class="es-cos-section-title">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2 3 14h9l-1 8 10-12h-9z"/></svg>' +
              '<span>Ultimi Log Attività</span>' +
              '<a class="es-cos-section-link" data-tab-nav="report_staff">Visualizza tutto &rarr;</a>' +
            '</div>' +
            '<div class="es-cos-log-list">' +
              (data.logAttivita && data.logAttivita.length ? data.logAttivita.map(function (l) {
                return (
                  '<div class="es-cos-log-item">' +
                    '<span class="es-cos-log-time">' +
                      '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg>' +
                      esc(l.date) +
                    '</span>' +
                    '<span class="es-cos-log-text">' + esc(l.text) + '</span>' +
                  '</div>'
                );
              }).join('') : '<div style="text-align:center; padding:1.5rem; color:var(--cos-text-muted); font-size:0.8rem;">Nessuna attività registrata di recente.</div>') +
            '</div>' +
          '</div>' +

          // Blocco 2: Carico Settimanale Squadra (Reale aggregato da Supabase)
          '<div class="es-cos-card" style="padding:20px;">' +
            '<div class="es-cos-section-title">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M18 9l-5 5-4-4-4 4"/></svg>' +
              '<span>Carico Settimanale Squadra</span>' +
            '</div>' +
            '<div class="es-cos-weekchart-wrap">' +
              '<div class="es-cos-weekchart-axis"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div>' +
              '<div class="es-cos-weekchart">' +
                ((data.carico && data.carico.giorni && data.carico.giorni.length) ? data.carico.giorni.map(function (g) {
                  return '<div class="es-cos-weekchart-bar"><div class="fill" style="height:' + (g.val || 0) + '%;"></div><span class="day">' + esc(g.day) + '</span></div>';
                }).join('') : ['Lun','Mar','Mer','Gio','Ven','Sab','Dom'].map(function(d){ return '<div class="es-cos-weekchart-bar"><div class="fill" style="height:0%;"></div><span class="day">'+d+'</span></div>'; }).join('')) +
              '</div>' +
            '</div>' +
            '<div class="es-cos-gauge-wrap">' +
              '<div class="es-cos-gauge-circle" style="background: conic-gradient(var(--cos-green) ' + Math.round(((data.carico && data.carico.mediaSettimanale) || 0) * 3.6) + 'deg, rgba(255,255,255,0.08) ' + Math.round(((data.carico && data.carico.mediaSettimanale) || 0) * 3.6) + 'deg);">' +
                '<div class="es-cos-gauge-circle-inner">' +
                  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2 3 14h9l-1 8 10-12h-9z"/></svg>' +
                '</div>' +
              '</div>' +
              '<div class="es-cos-gauge-meta">' +
                '<strong>' + (((data.carico && data.carico.mediaSettimanale) > 0) ? (data.carico.mediaSettimanale + '%') : '--') + '</strong>' +
                '<p class="label">Media Settimanale</p>' +
                '<span class="es-cos-gauge-pill-status">' + esc((data.carico && data.carico.stato) || 'In attesa') + '</span>' +
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
              (data.prossimiImpegni && data.prossimiImpegni.length ? data.prossimiImpegni.map(function (imp) {
                return (
                  '<div class="es-cos-impegno-item">' +
                    '<div>' +
                      '<strong>' + esc(imp.title) + '</strong>' +
                      '<span class="when">' + esc(imp.time) + '</span>' +
                    '</div>' +
                    '<span class="what">' + esc(imp.type) + '</span>' +
                  '</div>'
                );
              }).join('') : '<div style="text-align:center; padding:1.5rem; color:var(--cos-text-muted); font-size:0.8rem;">Nessun impegno staff registrato.</div>') +
            '</div>' +
          '</div>' +
        '</section>' +
      '</div>'
    );
  }

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
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' +
            'Organico Rosa Prima Squadra · ' + esc(data.clubName) + ' (' + list.length + ' Atleti Registrati)' +
          '</span>' +
          '<button type="button" class="es-btn-cos-primary" id="btn-add-player-modal">+ Aggiungi Calciatore</button>' +
        '</div>' +

        '<div class="es-cos-roster-toolbar" style="display:flex; justify-content:space-between; align-items:center; gap:1rem; flex-wrap:wrap; margin-bottom:1rem;">' +
          '<input type="text" class="es-cos-search-input" id="inp-roster-search" placeholder="Cerca calciatore per nome o ruolo..." value="' + esc(rosterSearchQuery) + '" style="background:#071522; border:1px solid #12344a; color:#f3f8fc; padding:0.5rem 0.85rem; border-radius:6px; font-size:0.82rem; width:260px;">' +
          '<div style="display:flex; gap:0.35rem; flex-wrap:wrap;">' +
            '<button type="button" class="es-btn-cos-sec ' + (activeRosterFilter === 'all' ? 'is-active' : '') + '" style="padding:0.4rem 0.75rem; font-size:0.75rem;" data-r-filter="all">Tutti (' + (data.roster ? data.roster.length : 0) + ')</button>' +
            '<button type="button" class="es-btn-cos-sec ' + (activeRosterFilter === 'por' ? 'is-active' : '') + '" style="padding:0.4rem 0.75rem; font-size:0.75rem;" data-r-filter="por">Portieri</button>' +
            '<button type="button" class="es-btn-cos-sec ' + (activeRosterFilter === 'dif' ? 'is-active' : '') + '" style="padding:0.4rem 0.75rem; font-size:0.75rem;" data-r-filter="dif">Difensori</button>' +
            '<button type="button" class="es-btn-cos-sec ' + (activeRosterFilter === 'cen' ? 'is-active' : '') + '" style="padding:0.4rem 0.75rem; font-size:0.75rem;" data-r-filter="cen">Centrocampisti</button>' +
            '<button type="button" class="es-btn-cos-sec ' + (activeRosterFilter === 'att' ? 'is-active' : '') + '" style="padding:0.4rem 0.75rem; font-size:0.75rem;" data-r-filter="att">Attaccanti</button>' +
            '<button type="button" class="es-btn-cos-sec ' + (activeRosterFilter === 'disp' ? 'is-active' : '') + '" style="padding:0.4rem 0.75rem; font-size:0.75rem;" data-r-filter="disp">Disponibili</button>' +
            '<button type="button" class="es-btn-cos-sec ' + (activeRosterFilter === 'diff' ? 'is-active' : '') + '" style="padding:0.4rem 0.75rem; font-size:0.75rem;" data-r-filter="diff">Differenziati / Indisponibili</button>' +
          '</div>' +
        '</div>' +

        '<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:1rem;">' +
          (list.length ? list.map(function (p, pIdx) {
            var isDisp = p.status === 'disp';
            var pillHtml = isDisp ? '<span class="es-cos-badge-pill is-green"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#22c55e;margin-right:4px;"></span>Disponibile</span>' :
              (p.statoDettagliato === 'infortunato' ? '<span class="es-cos-badge-pill is-danger" title="' + esc(p.motivo || 'Infortunio') + '"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#ef4444;margin-right:4px;"></span>Infortunato' + (p.rientro ? (' · Rientro: ' + esc(p.rientro)) : '') + '</span>' :
              (p.statoDettagliato === 'squalificato' ? '<span class="es-cos-badge-pill is-warn"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#eab308;margin-right:4px;"></span>Squalificato</span>' : '<span class="es-cos-badge-pill is-warn"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#f97316;margin-right:4px;"></span>' + esc(p.statoDettagliato || 'Differenziato') + '</span>'));
            
            var birthInfo = esc(p.role) + ((p.birth && p.birth !== '--') ? (' · Classe ' + esc(p.birth)) : (p.data_nascita ? (' · Nato: ' + esc(p.data_nascita)) : '')) + ((p.luogo_nascita || p.pob) ? (' (' + esc(p.luogo_nascita || p.pob) + ')') : '');
            var cfVal = p.codice_fiscale || p.cf || '';
            var emailVal = p.email || '';
            var metaParts = [];
            if (cfVal) metaParts.push('CF: ' + esc(cfVal));
            if (emailVal) metaParts.push(esc(emailVal));
            var metaHtml = metaParts.length ? '<div style="font-size:0.67rem; color:#64748b; font-family:monospace; margin-top:1px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + metaParts.join(' · ') + '</div>' : '';

            return (
              '<div style="background:#071522; border:1px solid #12344a; border-radius:8px; padding:0.9rem; display:flex; gap:0.75rem; align-items:center;" data-player-card-idx="' + pIdx + '">' +
                '<div style="width:42px; height:42px; border-radius:8px; background:#040912; border:1px solid #16b9ff; color:#16b9ff; font-size:1.1rem; font-weight:900; display:flex; align-items:center; justify-content:center; flex-shrink:0;">#' + esc(p.num) + '</div>' +
                '<div style="display:flex; flex-direction:column; gap:2px; flex:1 1 auto; overflow:hidden;">' +
                  '<div style="font-size:0.9rem; font-weight:800; color:#f3f8fc; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + esc(p.name) + '</div>' +
                  '<div style="font-size:0.72rem; color:#8da8bc; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + birthInfo + '</div>' +
                  metaHtml +
                  '<div style="display:flex; justify-content:space-between; align-items:center; margin-top:3px; gap:0.5rem; flex-wrap:wrap;">' +
                    pillHtml +
                    (p.motivo ? '<span style="font-size:0.68rem; color:#f87171; max-width:140px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + esc(p.motivo) + '</span>' : '') +
                  '</div>' +
                '</div>' +
              '</div>'
            );
          }).join('') : (
            '<div class="es-cos-empty-state">' +
              '<svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' +
              '<div class="es-cos-empty-title">Nessun calciatore presente in rosa</div>' +
              '<div class="es-cos-empty-sub">I calciatori inseriti nella tabella rosa su Supabase appariranno qui automaticamente.</div>' +
            '</div>'
          )) +
        '</div>' +
      '</div>'
    );
  }

  // ============================================================
  // 3. SEZIONE FORMAZIONE (LINEUP BUILDER UFFICIALE DINAMICO)
  // ============================================================
  function renderFormazione(data) {
    var modKey = String(data.moduloPrincipale || '4-3-3').trim();
    if (!MODULI_TATTICI[modKey]) modKey = '4-3-3';
    var curMod = MODULI_TATTICI[modKey];

    var panchinaCount = (data.panchina && Array.isArray(data.panchina)) ? data.panchina.length : 0;

    return (
      '<div class="es-cos-panel-card">' +
        // HEADER SEZIONE: TITOLO + SELETTORE MODULO + BOTTONI AZIONE
        '<div class="es-cos-panel-head" style="gap:1rem; flex-wrap:wrap; justify-content:space-between; align-items:center;">' +
          '<div style="display:flex; align-items:center; gap:1.25rem; flex-wrap:wrap;">' +
            '<span class="es-cos-panel-title" style="display:flex; align-items:center; gap:0.5rem; margin:0;">' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>' +
              'Lineup Builder Ufficiale · XI Titolare' +
            '</span>' +
            // SELETTORE MODULO EVIDENTE CON ETICHETTA E FRECCIA SVG
            '<div class="es-modulo-select-wrap" style="display:flex; align-items:center; gap:0.5rem; background:#071522; border:1.5px solid #3b82f6; border-radius:8px; padding:0.3rem 0.65rem; box-shadow:0 2px 8px rgba(59,130,246,0.15);">' +
              '<label for="sel-tactical-modulo" style="font-size:0.75rem; font-weight:800; color:#93c5fd; text-transform:uppercase; letter-spacing:0.04em; cursor:pointer;">Modulo:</label>' +
              '<div style="position:relative; display:inline-flex; align-items:center;">' +
                '<select id="sel-tactical-modulo" style="appearance:none; -webkit-appearance:none; background:transparent; border:none; color:#ffffff; font-size:0.85rem; font-weight:800; cursor:pointer; padding-right:1.4rem; outline:none;">' +
                  '<option value="4-3-3" ' + (modKey === '4-3-3' ? 'selected' : '') + ' style="background:#071522; color:#ffffff;">4-3-3 (Offensivo con Ali)</option>' +
                  '<option value="4-4-2" ' + (modKey === '4-4-2' ? 'selected' : '') + ' style="background:#071522; color:#ffffff;">4-4-2 (Classico Lineare)</option>' +
                  '<option value="4-2-3-1" ' + (modKey === '4-2-3-1' ? 'selected' : '') + ' style="background:#071522; color:#ffffff;">4-2-3-1 (Doppio Mediano &amp; Trequarti)</option>' +
                  '<option value="3-5-2" ' + (modKey === '3-5-2' ? 'selected' : '') + ' style="background:#071522; color:#ffffff;">3-5-2 (Ampiezza Quinti &amp; Doppio Attacco)</option>' +
                  '<option value="3-4-3" ' + (modKey === '3-4-3' ? 'selected' : '') + ' style="background:#071522; color:#ffffff;">3-4-3 (Tridente &amp; Linea Mediana a 4)</option>' +
                  '<option value="5-3-2" ' + (modKey === '5-3-2' ? 'selected' : '') + ' style="background:#071522; color:#ffffff;">5-3-2 (Difesa a 5 &amp; Contropiede Rapido)</option>' +
                  '<option value="4-1-4-1" ' + (modKey === '4-1-4-1' ? 'selected' : '') + ' style="background:#071522; color:#ffffff;">4-1-4-1 (Vertice Basso &amp; Linea di Trequarti)</option>' +
                '</select>' +
                '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="3" style="position:absolute; right:0; pointer-events:none;"><polyline points="6 9 12 15 18 9"/></svg>' +
              '</div>' +
            '</div>' +
          '</div>' +
          // BOTTONI STORY 9:16 E CONFERMA FORMAZIONE AFFIANCATI
          '<div style="display:flex; gap:0.6rem; align-items:center;">' +
            '<button type="button" class="es-btn-cos-sec" id="btn-export-story-modal" title="Genera Anteprima Story Instagram 9:16" style="display:inline-flex; align-items:center; gap:0.4rem; padding:0.5rem 0.9rem; font-size:0.82rem; font-weight:700; border:1px solid rgba(255,255,255,0.18); color:#f3f8fc; background:rgba(255,255,255,0.04); border-radius:7px; cursor:pointer; transition:all 0.15s ease;">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16b9ff" stroke-width="2"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>' +
              'Story 9:16' +
            '</button>' +
            '<button type="button" class="es-btn-cos-primary" id="btn-confirm-official-xi" style="padding:0.5rem 1.15rem; font-size:0.82rem; font-weight:800; border-radius:7px; cursor:pointer;">' +
              'Conferma Formazione Ufficiale' +
            '</button>' +
          '</div>' +
        '</div>' +

        // LAYOUT A DUE COLONNE: CAMPO FLESSIBILE A SINISTRA E PANCHINA FISSA A DESTRA (320px)
        '<div class="es-lineup-layout-grid formazione-layout" style="display:grid; grid-template-columns:minmax(0, 1fr) 320px; gap:20px; align-items:start; margin-top:0.5rem; width:100%;">' +
          // COLONNA SINISTRA: CAMPO DA CALCIO REGOLAMENTARE CON OVERLAY VETTORIALE SVG (ASPECT RATIO 3/4)
          '<div class="es-pitch-container campo-container" style="background:radial-gradient(circle at 50% 50%, #0d3b1f 0%, #061e11 88%); border:2.5px solid #16562f; border-radius:12px; position:relative; min-width:0; width:100%; max-width:540px; margin:0 auto; aspect-ratio:3/4; overflow:hidden; box-shadow:0 12px 30px rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center;">' +
            // LINEE REGOLAMENTARI DEL CAMPO IN OVERLAY VETTORIALE SVG
            '<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute; inset:0; width:100%; height:100%; pointer-events:none; opacity:0.32;">' +
              // Bordo perimetrale
              '<rect x="4" y="3" width="92" height="94" fill="none" stroke="#ffffff" stroke-width="1.2" rx="2"/>' +
              // Linea mediana di centrocampo
              '<line x1="4" y1="50" x2="96" y2="50" stroke="#ffffff" stroke-width="1.2"/>' +
              // Cerchio di centrocampo e punto centrale
              '<circle cx="50" cy="50" r="11" fill="none" stroke="#ffffff" stroke-width="1.2"/>' +
              '<circle cx="50" cy="50" r="1" fill="#ffffff"/>' +
              // Area di rigore alta (porta avversaria)
              '<rect x="26" y="3" width="48" height="17" fill="none" stroke="#ffffff" stroke-width="1.2"/>' +
              '<rect x="36" y="3" width="28" height="6.5" fill="none" stroke="#ffffff" stroke-width="1.2"/>' +
              '<circle cx="50" cy="13.5" r="1" fill="#ffffff"/>' +
              '<path d="M 40 20 A 10 10 0 0 0 60 20" fill="none" stroke="#ffffff" stroke-width="1.2"/>' +
              // Area di rigore bassa (nostra porta)
              '<rect x="26" y="80" width="48" height="17" fill="none" stroke="#ffffff" stroke-width="1.2"/>' +
              '<rect x="36" y="90.5" width="28" height="6.5" fill="none" stroke="#ffffff" stroke-width="1.2"/>' +
              '<circle cx="50" cy="86.5" r="1" fill="#ffffff"/>' +
              '<path d="M 40 80 A 10 10 0 0 1 60 80" fill="none" stroke="#ffffff" stroke-width="1.2"/>' +
              // Porte esterne
              '<rect x="42" y="1" width="16" height="2" fill="rgba(255,255,255,0.2)" stroke="#ffffff" stroke-width="0.8"/>' +
              '<rect x="42" y="97" width="16" height="2" fill="rgba(255,255,255,0.2)" stroke="#ffffff" stroke-width="0.8"/>' +
              // Bandierine d\'angolo
              '<path d="M 4 6 A 3 3 0 0 0 7 3" fill="none" stroke="#ffffff" stroke-width="1.2"/>' +
              '<path d="M 96 6 A 3 3 0 0 1 93 3" fill="none" stroke="#ffffff" stroke-width="1.2"/>' +
              '<path d="M 4 94 A 3 3 0 0 1 7 97" fill="none" stroke="#ffffff" stroke-width="1.2"/>' +
              '<path d="M 96 94 A 3 3 0 0 0 93 97" fill="none" stroke="#ffffff" stroke-width="1.2"/>' +
            '</svg>' +
            // GLOW RADIALE DEL CAMPO
            '<div style="position:absolute; inset:0; background:radial-gradient(circle at 50% 50%, rgba(0,217,120,0.1) 0%, transparent 82%); pointer-events:none;"></div>' +
            // WATERMARK DISCRETO MODULO IN BASSO AL CAMPO
            '<div style="position:absolute; bottom:8px; left:12px; font-size:0.68rem; font-weight:800; color:rgba(255,255,255,0.22); letter-spacing:0.05em; pointer-events:none; text-transform:uppercase;">' + esc(curMod.nome) + '</div>' +
            // 11 PIN TITOLARI DINAMICI
            renderPitchPins(data.top11, modKey) +
          '</div>' +

          // COLONNA DESTRA: PANCHINA A LARGHEZZA FISSA 320PX + STATO CONVALIDA
          '<div class="es-bench-panel-card panchina-panel" style="background:#071522; border:1px solid #12344a; border-radius:12px; padding:0.85rem 0.95rem; display:flex; flex-direction:column; min-width:320px; max-width:320px; width:320px; box-sizing:border-box;">' +
            '<div>' +
              // INTESTAZIONE PANCHINA CON CONTATORE REALE
              '<div style="font-size:0.85rem; font-weight:800; color:#f3f8fc; text-transform:uppercase; margin-bottom:0.55rem; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #12344a; padding-bottom:0.5rem;">' +
                '<div style="display:flex; align-items:center; gap:0.45rem;">' +
                  '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16b9ff" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>' +
                  '<span>A Disposizione (Panchina)</span>' +
                '</div>' +
                '<span class="es-cos-badge-pill is-blue" style="font-size:0.75rem; font-weight:800;">' + panchinaCount + ' Calciatori</span>' +
              '</div>' +

              // SUGGERIMENTO DI INTERAZIONE (DRAG & DROP E CLICK)
              '<div style="font-size:0.72rem; color:#8da8bc; margin-bottom:0.65rem; display:flex; align-items:center; gap:5px; background:rgba(22,185,255,0.06); border:1px dashed rgba(22,185,255,0.25); border-radius:6px; padding:0.4rem 0.55rem;">' +
                '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16b9ff" stroke-width="2" style="flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>' +
                '<span>Trascina sul campo o clicca <b>In Campo &rarr;</b></span>' +
              '</div>' +

              // LISTA SCROLLABILE CARD PANCHINARI CON ATTRIBUTO DRAGGABLE E RUOLO
              '<div class="es-bench-scroll-list" style="display:flex; flex-direction:column; gap:0.45rem; max-height:460px; overflow-y:auto; padding-right:4px;">' +
                (panchinaCount ? data.panchina.map(function (b) {
                  return (
                    '<div class="es-bench-card" draggable="true" data-bench-id="' + esc(b.id) + '" data-bench-num="' + esc(b.num) + '" data-bench-name="' + esc(b.name) + '" data-bench-pos="' + esc(b.pos || b.role) + '" style="display:flex; justify-content:space-between; align-items:center; background:#040912; border:1px solid #12344a; border-radius:6px; padding:0.45rem 0.6rem; cursor:grab; transition:all 0.15s ease; gap:0.4rem;">' +
                      '<div style="display:flex; align-items:center; gap:0.5rem; min-width:0; flex:1 1 auto; overflow:hidden;">' +
                        '<div style="width:28px; height:28px; border-radius:50%; background:#071522; border:1.5px solid #16b9ff; color:#16b9ff; display:flex; align-items:center; justify-content:center; font-size:0.78rem; font-weight:900; flex-shrink:0;">#' + esc(b.num) + '</div>' +
                        '<div style="display:flex; flex-direction:column; gap:1px; overflow:hidden; min-width:0;">' +
                          '<span style="font-size:0.8rem; font-weight:700; color:#f3f8fc; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="' + esc(b.name) + '">' + esc(b.name) + '</span>' +
                          '<span style="font-size:0.67rem; color:#8da8bc;">Classe ' + esc(b.birth || '--') + '</span>' +
                        '</div>' +
                      '</div>' +
                      '<div style="display:flex; align-items:center; gap:0.35rem; flex-shrink:0;">' +
                        '<span style="font-size:0.68rem; font-weight:800; padding:2px 6px; border-radius:4px; ' + getRoleBadgeStyle(b.pos || b.role) + '">' + esc(b.pos || b.role) + '</span>' +
                        '<button type="button" class="es-bench-assign-btn" data-assign-bench-id="' + esc(b.id) + '" style="background:transparent; border:1px solid rgba(255,255,255,0.16); color:rgba(255,255,255,0.85); padding:0.22rem 0.45rem; border-radius:5px; font-size:0.67rem; font-weight:700; cursor:pointer; white-space:nowrap; transition:all 0.15s ease;" title="Schiera titolare nello slot desiderato">' +
                          'In Campo &rarr;' +
                        '</button>' +
                      '</div>' +
                    '</div>'
                  );
                }).join('') : (
                  '<div style="text-align:center; padding:1.5rem; color:#8da8bc; font-size:0.8rem;">' +
                    'Tutti i calciatori disponibili sono attualmente assegnati ai titolari.' +
                  '</div>'
                )) +
              '</div>' +
            '</div>' +

            // BOX STATO UFFICIALE E RIEPILOGO CONVOCATI
            '<div style="margin-top:1rem; background:rgba(0,217,120,0.06); border:1px solid rgba(0,217,120,0.3); border-radius:8px; padding:0.85rem; font-size:0.8rem; line-height:1.45;">' +
              '<div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">' +
                '<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#00d978; box-shadow:0 0 8px #00d978;"></span>' +
                '<b style="color:#00d978;">Stato Ufficiale:</b>' +
                '<span style="color:#f3f8fc; font-weight:700;">Convalidata dal Mister</span>' +
              '</div>' +
              '<div style="color:#8da8bc; font-size:0.75rem;">' +
                'Titolari: <b style="color:#16b9ff;">11</b> · Panchina: <b style="color:#16b9ff;">' + panchinaCount + '</b> · Consegne tecniche sincronizzate con la Bozza del Vice Allenatore.' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function renderPitchPins(players, modulo) {
    var modKey = String(modulo || '4-3-3').trim();
    if (!MODULI_TATTICI[modKey]) modKey = '4-3-3';
    var slots = MODULI_TATTICI[modKey].slots;

    return slots.map(function (slot, idx) {
      var p = (players || [])[idx] || {
        num: idx + 1,
        name: slot.name,
        pos: slot.ruolo
      };
      var roleSigla = p.pos || slot.ruolo;

      return (
        '<div class="es-pitch-pin" ' +
             'style="position:absolute; left:' + slot.x + '%; top:' + slot.y + '%; transform:translate(-50%, -50%); display:flex; flex-direction:column; align-items:center; gap:3px; cursor:pointer; z-index:10; transition:transform 0.15s ease;" ' +
             'data-player-pin-idx="' + idx + '" ' +
             'data-slot-role="' + esc(roleSigla) + '" ' +
             'title="Clicca per sostituire con la panchina o modificare il ruolo">' +
          // BADGE CIRCOLARE NUMERO MAGLIA CON GLOW E TASTO SWAP
          '<div class="es-pitch-pin-badge" style="width:38px; height:38px; border-radius:50%; background:#071522; border:2.5px solid #16b9ff; color:#f3f8fc; font-size:0.85rem; font-weight:900; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(0,0,0,0.7); position:relative; transition:all 0.15s ease;">' +
            '#' + esc(p.num) +
            '<span class="es-pitch-pin-swap-hint" style="position:absolute; top:-3px; right:-3px; width:14px; height:14px; border-radius:50%; background:#16b9ff; color:#040912; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:900; box-shadow:0 2px 4px rgba(0,0,0,0.6);">&#8644;</span>' +
          '</div>' +
          // TARGHETTA NOME GIOCATORE + RUOLO TRA PARENTESI
          '<div class="es-pitch-pin-tag" style="background:rgba(5,9,16,0.94); border:1px solid #12344a; color:#f3f8fc; font-size:0.67rem; font-weight:800; padding:2px 6px; border-radius:5px; white-space:nowrap; box-shadow:0 2px 6px rgba(0,0,0,0.6); display:flex; align-items:center; gap:3px;">' +
            '<span>' + esc(p.name) + '</span>' +
            '<span style="color:#16b9ff; font-weight:900;">(' + esc(roleSigla) + ')</span>' +
          '</div>' +
        '</div>'
      );
    }).join('');
  }

  function getFormationCoords(modulo) {
    var modKey = String(modulo || '4-3-3').trim();
    if (!MODULI_TATTICI[modKey]) modKey = '4-3-3';
    return MODULI_TATTICI[modKey].slots.map(function (s) { return { x: s.x, y: s.y }; });
  }

  function getSlotRole(idx, modulo) {
    var modKey = String(modulo || '4-3-3').trim();
    if (!MODULI_TATTICI[modKey]) modKey = '4-3-3';
    var s = MODULI_TATTICI[modKey].slots[idx];
    return s ? s.ruolo : 'CC';
  }

  // ============================================================
  // MODALE SOSTITUZIONE SLOT / CAMBIO RUOLO TATTICO
  // ============================================================
  function openSlotSwapModal(slotIdx, data) {
    var modKey = String(data.moduloPrincipale || '4-3-3').trim();
    if (!MODULI_TATTICI[modKey]) modKey = '4-3-3';
    var slotDef = MODULI_TATTICI[modKey].slots[slotIdx];
    var currentStarter = data.top11[slotIdx] || { num: slotIdx + 1, name: 'Titolare', pos: slotDef.ruolo };
    var panchina = data.panchina || [];

    var rolesOptions = Object.keys(LIBRERIA_RUOLI).map(function (k) {
      var r = LIBRERIA_RUOLI[k];
      return '<option value="' + k + '" ' + (currentStarter.pos === k ? 'selected' : '') + '>' + r.sigla + ' · ' + r.nome + ' (' + r.reparto + ')</option>';
    }).join('');

    var benchItemsHtml = panchina.length ? panchina.map(function (b, bIdx) {
      return (
        '<div style="display:flex; justify-content:space-between; align-items:center; background:#040912; border:1px solid #12344a; border-radius:6px; padding:0.5rem 0.75rem; margin-bottom:0.45rem;">' +
          '<div style="display:flex; align-items:center; gap:0.6rem;">' +
            '<div style="width:28px; height:28px; border-radius:50%; background:#071522; border:1.5px solid #16b9ff; color:#16b9ff; display:flex; align-items:center; justify-content:center; font-size:0.8rem; font-weight:900;">#' + esc(b.num) + '</div>' +
            '<div>' +
              '<div style="font-size:0.85rem; font-weight:700; color:#f3f8fc;">' + esc(b.name) + '</div>' +
              '<div style="font-size:0.68rem; color:#8da8bc;">' + esc(b.role) + ' · Classe ' + esc(b.birth || '--') + '</div>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex; align-items:center; gap:0.5rem;">' +
            '<span style="font-size:0.7rem; font-weight:800; padding:2px 7px; border-radius:4px; ' + getRoleBadgeStyle(b.pos || b.role) + '">' + esc(b.pos || b.role) + '</span>' +
            '<button type="button" class="es-btn-cos-primary btn-do-swap-player" data-bench-idx="' + bIdx + '" style="padding:0.3rem 0.65rem; font-size:0.75rem; border-radius:5px; cursor:pointer;">' +
              'Schiera in Campo' +
            '</button>' +
          '</div>' +
        '</div>'
      );
    }).join('') : (
      '<div style="text-align:center; color:#8da8bc; padding:1.25rem; font-size:0.82rem;">Nessun calciatore disponibile in panchina.</div>'
    );

    var content =
      '<div style="display:flex; flex-direction:column; gap:1.15rem;">' +
        // SCHEDA TITOLARE ATTUALE
        '<div style="background:#040912; border:1.5px solid #16b9ff; border-radius:8px; padding:0.85rem; display:flex; justify-content:space-between; align-items:center;">' +
          '<div style="display:flex; align-items:center; gap:0.75rem;">' +
            '<div style="width:38px; height:38px; border-radius:50%; background:#071522; border:2px solid #16b9ff; color:#f3f8fc; font-size:0.95rem; font-weight:900; display:flex; align-items:center; justify-content:center;">#' + esc(currentStarter.num) + '</div>' +
            '<div>' +
              '<div style="font-size:0.95rem; font-weight:800; color:#f3f8fc;">' + esc(currentStarter.name) + '</div>' +
              '<div style="font-size:0.72rem; color:#8da8bc;">Titolare Attuale nello Slot #' + (slotIdx + 1) + ' (' + esc(slotDef.name) + ')</div>' +
            '</div>' +
          '</div>' +
          '<span style="font-size:0.75rem; font-weight:800; padding:3px 8px; border-radius:5px; ' + getRoleBadgeStyle(currentStarter.pos) + '">' + esc(currentStarter.pos) + '</span>' +
        '</div>' +

        // CAMBIO RUOLO TATTICO DELLO SLOT
        '<div style="background:#040912; border:1px solid #12344a; border-radius:8px; padding:0.85rem;">' +
          '<label style="font-size:0.78rem; font-weight:800; color:#93c5fd; text-transform:uppercase; margin-bottom:0.4rem; display:block;">Personalizza Ruolo Tattico Slot:</label>' +
          '<div style="display:flex; gap:0.5rem; align-items:center;">' +
            '<select id="sel-slot-custom-role" style="flex:1; background:#071522; border:1px solid #12344a; color:#f3f8fc; padding:0.5rem 0.75rem; border-radius:6px; font-size:0.82rem; font-weight:700;">' +
              rolesOptions +
            '</select>' +
            '<button type="button" id="btn-save-slot-role" class="es-btn-cos-sec" style="padding:0.5rem 0.85rem; font-size:0.78rem; border-color:#3b82f6; color:#93c5fd; cursor:pointer;">Applica Ruolo</button>' +
          '</div>' +
        '</div>' +

        // LISTA PANCHINA PER SOSTITUZIONE
        '<div>' +
          '<div style="font-size:0.82rem; font-weight:800; color:#f3f8fc; text-transform:uppercase; margin-bottom:0.6rem; display:flex; justify-content:space-between;">' +
            '<span>Sostituisci con un Calciatore in Panchina</span>' +
            '<span style="color:#16b9ff;">' + panchina.length + ' Disponibili</span>' +
          '</div>' +
          '<div style="max-height:240px; overflow-y:auto; padding-right:2px;">' +
            benchItemsHtml +
          '</div>' +
        '</div>' +

        '<div style="display:flex; justify-content:flex-end; gap:0.5rem; border-top:1px solid #12344a; padding-top:0.75rem;">' +
          '<button type="button" class="es-btn-cos-sec" id="btn-close-modal">Chiudi</button>' +
        '</div>' +
      '</div>';

    openModal('Gestione Slot Titolare #' + (slotIdx + 1) + ' · ' + currentStarter.name, content);

    // Gestione applicazione nuovo ruolo allo slot
    var btnSaveRole = document.getElementById('btn-save-slot-role');
    if (btnSaveRole) {
      btnSaveRole.onclick = function () {
        var selRole = document.getElementById('sel-slot-custom-role');
        if (selRole && selRole.value) {
          data.top11[slotIdx].pos = selRole.value;
          var roleDef = LIBRERIA_RUOLI[selRole.value];
          if (roleDef) data.top11[slotIdx].roleName = roleDef.nome;
          saveCoachData(data);
          closeModal();
          var container = document.getElementById('es-cos-active-content');
          if (container && activeTab === 'formazione') {
            container.innerHTML = renderFormazione(data);
            bindAllEvents();
          }
          if (window.showToast) window.showToast('Ruolo slot aggiornato a ' + selRole.value, 'success');
        }
      };
    }

    // Gestione sostituzione con giocatore della panchina
    document.querySelectorAll('.btn-do-swap-player').forEach(function (btn) {
      btn.onclick = function () {
        var bIdx = parseInt(btn.getAttribute('data-bench-idx'), 10);
        var subIn = data.panchina[bIdx];
        if (!subIn) return;

        var subOut = data.top11[slotIdx];

        // Scambia: subIn diventa titolare allo slot, subOut va in panchina
        data.top11[slotIdx] = {
          id: subIn.id,
          num: subIn.num,
          name: subIn.name,
          pos: subOut.pos || subIn.pos || slotDef.ruolo,
          roleName: subOut.roleName || slotDef.name,
          originalRole: subIn.role,
          rating: subIn.rating || '--'
        };

        data.panchina.splice(bIdx, 1);
        data.panchina.push({
          id: subOut.id,
          num: subOut.num,
          name: subOut.name,
          pos: getShortRole(subOut.originalRole || subOut.pos),
          role: subOut.originalRole || subOut.pos,
          status: 'disp',
          birth: subOut.birth || '--'
        });

        saveCoachData(data);
        closeModal();
        var container = document.getElementById('es-cos-active-content');
        if (container && activeTab === 'formazione') {
          container.innerHTML = renderFormazione(data);
          bindAllEvents();
        }
        if (window.showToast) window.showToast('Sostituzione effettuata: entra #' + subIn.num + ' ' + subIn.name, 'success');
      };
    });
  }

  // ============================================================
  // MODALE ASSEGNAZIONE GIOCATORE DALLA PANCHINA IN CAMPO
  // ============================================================
  function openBenchAssignModal(benchPlayerId, data) {
    var benchPlayer = null;
    var benchIdx = -1;
    for (var i = 0; i < (data.panchina || []).length; i++) {
      if (String(data.panchina[i].id) === String(benchPlayerId)) {
        benchPlayer = data.panchina[i];
        benchIdx = i;
        break;
      }
    }
    if (!benchPlayer) return;

    var startersHtml = data.top11.map(function (st, sIdx) {
      return (
        '<div style="display:flex; justify-content:space-between; align-items:center; background:#040912; border:1px solid #12344a; border-radius:6px; padding:0.5rem 0.75rem; margin-bottom:0.45rem;">' +
          '<div style="display:flex; align-items:center; gap:0.6rem;">' +
            '<div style="width:28px; height:28px; border-radius:50%; background:#071522; border:1.5px solid #16b9ff; color:#f3f8fc; display:flex; align-items:center; justify-content:center; font-size:0.8rem; font-weight:900;">#' + esc(st.num) + '</div>' +
            '<div>' +
              '<div style="font-size:0.85rem; font-weight:700; color:#f3f8fc;">' + esc(st.name) + '</div>' +
              '<div style="font-size:0.68rem; color:#8da8bc;">Slot #' + (sIdx + 1) + ' · ' + esc(st.roleName || st.pos) + '</div>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex; align-items:center; gap:0.5rem;">' +
            '<span style="font-size:0.7rem; font-weight:800; padding:2px 7px; border-radius:4px; ' + getRoleBadgeStyle(st.pos) + '">' + esc(st.pos) + '</span>' +
            '<button type="button" class="es-btn-cos-primary btn-replace-starter" data-slot-target="' + sIdx + '" style="padding:0.3rem 0.65rem; font-size:0.75rem; border-radius:5px; cursor:pointer;">' +
              'Sostituisci Questo' +
            '</button>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    var content =
      '<div style="display:flex; flex-direction:column; gap:1rem;">' +
        '<div style="background:#040912; border:1px solid #12344a; border-radius:8px; padding:0.85rem; display:flex; align-items:center; gap:0.75rem;">' +
          '<div style="width:36px; height:36px; border-radius:50%; background:#071522; border:2px solid #16b9ff; color:#16b9ff; font-size:0.9rem; font-weight:900; display:flex; align-items:center; justify-content:center;">#' + esc(benchPlayer.num) + '</div>' +
          '<div>' +
            '<div style="font-size:0.92rem; font-weight:800; color:#f3f8fc;">' + esc(benchPlayer.name) + ' (' + esc(benchPlayer.pos || benchPlayer.role) + ')</div>' +
            '<div style="font-size:0.72rem; color:#8da8bc;">Seleziona quale titolare sostituire per schierarlo in campo.</div>' +
          '</div>' +
        '</div>' +
        '<div style="max-height:280px; overflow-y:auto; padding-right:2px;">' +
          startersHtml +
        '</div>' +
        '<div style="display:flex; justify-content:flex-end; gap:0.5rem; border-top:1px solid #12344a; padding-top:0.75rem;">' +
          '<button type="button" class="es-btn-cos-sec" id="btn-close-modal">Annulla</button>' +
        '</div>' +
      '</div>';

    openModal('Schiera Calciatore in Campo: ' + benchPlayer.name, content);

    document.querySelectorAll('.btn-replace-starter').forEach(function (btn) {
      btn.onclick = function () {
        var sIdx = parseInt(btn.getAttribute('data-slot-target'), 10);
        var subOut = data.top11[sIdx];

        data.top11[sIdx] = {
          id: benchPlayer.id,
          num: benchPlayer.num,
          name: benchPlayer.name,
          pos: subOut.pos || benchPlayer.pos,
          roleName: subOut.roleName,
          originalRole: benchPlayer.role,
          rating: benchPlayer.rating || '--'
        };

        data.panchina.splice(benchIdx, 1);
        data.panchina.push({
          id: subOut.id,
          num: subOut.num,
          name: subOut.name,
          pos: getShortRole(subOut.originalRole || subOut.pos),
          role: subOut.originalRole || subOut.pos,
          status: 'disp',
          birth: subOut.birth || '--'
        });

        saveCoachData(data);
        closeModal();
        var container = document.getElementById('es-cos-active-content');
        if (container && activeTab === 'formazione') {
          container.innerHTML = renderFormazione(data);
          bindAllEvents();
        }
        if (window.showToast) window.showToast('Schierato #' + benchPlayer.num + ' ' + benchPlayer.name + ' in campo!', 'success');
      };
    });
  }

  // ============================================================
  // ANTEPRIMA STORY INSTAGRAM 9:16
  // ============================================================
  function openStoryPreviewModal(data) {
    var modKey = String(data.moduloPrincipale || '4-3-3').trim();
    if (!MODULI_TATTICI[modKey]) modKey = '4-3-3';
    var modDef = MODULI_TATTICI[modKey];
    var clubName = data.clubName || 'Foggia City';

    // PIN GIOCATORI: DESIGN PIATTO EDITORIALE SENZA GLOW
    var miniPins = modDef.slots.map(function (slot, idx) {
      var p = (data.top11 || [])[idx] || { num: idx + 1, name: slot.name, pos: slot.ruolo };
      var surname = p.name ? (p.name.split(' ').pop().toUpperCase()) : '';
      return (
        '<div style="position:absolute; left:' + slot.x + '%; top:' + slot.y + '%; transform:translate(-50%, -50%); display:flex; flex-direction:column; align-items:center; gap:2px; pointer-events:none;">' +
          '<div style="width:22px; height:22px; border-radius:50%; background:#071a0e; border:1px solid rgba(255,255,255,0.45); color:#ffffff; font-size:0.65rem; font-weight:600; font-family:\'Inter\',sans-serif; display:flex; align-items:center; justify-content:center;">' +
            esc(p.num) +
          '</div>' +
          '<div style="color:#f1f5f9; font-size:0.52rem; font-weight:600; font-family:\'Inter\',sans-serif; text-transform:uppercase; letter-spacing:0.08em; white-space:nowrap; text-shadow:0 1px 3px rgba(0,0,0,0.95);">' +
            esc(surname) +
          '</div>' +
        '</div>'
      );
    }).join('');

    // PANCHINA: GRIGLIA ORDINATA A 2 COLONNE
    var benchList = (data.panchina || []).slice(0, 10);
    var benchGridHtml = '<div style="display:grid; grid-template-columns:1fr 1fr; gap:3px 12px; margin-bottom:0.75rem;">' +
      benchList.map(function (b) {
        var sname = b.name ? (b.name.split(' ').pop().toUpperCase()) : '';
        return (
          '<div style="display:flex; align-items:baseline; gap:5px; font-size:0.6rem; font-family:\'Inter\',sans-serif; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;">' +
            '<span style="color:#94a3b8; font-weight:500; font-variant-numeric:tabular-nums; min-width:18px;">#' + esc(b.num) + '</span>' +
            '<span style="color:#e2e8f0; font-weight:600; letter-spacing:0.03em; overflow:hidden; text-overflow:ellipsis;">' + esc(sname) + '</span>' +
          '</div>'
        );
      }).join('') +
    '</div>';

    var content =
      '<div style="display:flex; flex-direction:column; align-items:center; gap:1rem;">' +
        // SCHERMO 9:16 SIMULATO (EDITORIAL LUXURY SPORT CARD)
        '<div style="width:315px; min-height:560px; background:#060b11; border:1px solid rgba(255,255,255,0.12); border-radius:18px; overflow:hidden; display:flex; flex-direction:column; justify-content:space-between; padding:1.25rem 1.15rem; position:relative; box-shadow:0 20px 50px rgba(0,0,0,0.85); box-sizing:border-box;">' +
          // HEADER STORY EDITORIALE
          '<div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:0.55rem;">' +
            '<div>' +
              '<div style="font-size:0.58rem; font-weight:600; color:#94a3b8; letter-spacing:0.16em; text-transform:uppercase; font-family:\'Inter\',sans-serif;">Official Matchday Lineup</div>' +
              '<div style="font-size:1.2rem; font-weight:800; color:#ffffff; letter-spacing:0.04em; font-family:\'Outfit\',\'Inter\',sans-serif; text-transform:uppercase; margin-top:2px;">' + esc(clubName) + '</div>' +
            '</div>' +
            '<span style="font-size:0.68rem; font-weight:600; background:transparent; border:1px solid rgba(255,255,255,0.24); color:#e2e8f0; padding:2px 8px; border-radius:4px; letter-spacing:0.06em; font-family:\'Inter\',sans-serif; margin-top:2px;">' + esc(modKey) + '</span>' +
          '</div>' +

          // MINI PITCH 2D: LINEE DESATURATE E PROFONDITÀ NATURALE
          '<div style="position:relative; width:100%; aspect-ratio:16/12; background:radial-gradient(circle at 50% 50%, #0a1f13 0%, #030c07 100%); border:1px solid rgba(255,255,255,0.08); border-radius:8px; overflow:hidden; margin:0.6rem 0;">' +
            '<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute; inset:0; width:100%; height:100%; pointer-events:none; opacity:0.2;">' +
              '<rect x="4" y="3" width="92" height="94" fill="none" stroke="#ffffff" stroke-width="1"/>' +
              '<line x1="4" y1="50" x2="96" y2="50" stroke="#ffffff" stroke-width="1"/>' +
              '<circle cx="50" cy="50" r="11" fill="none" stroke="#ffffff" stroke-width="1"/>' +
              '<rect x="28" y="3" width="44" height="16" fill="none" stroke="#ffffff" stroke-width="1"/>' +
              '<rect x="28" y="81" width="44" height="16" fill="none" stroke="#ffffff" stroke-width="1"/>' +
            '</svg>' +
            miniPins +
          '</div>' +

          // FOOTER STORY CON PANCHINA E WATERMARK EDITORIALE
          '<div>' +
            '<div style="font-size:0.58rem; font-weight:600; color:#94a3b8; letter-spacing:0.16em; text-transform:uppercase; font-family:\'Inter\',sans-serif; margin-bottom:0.45rem; border-bottom:1px solid rgba(255,255,255,0.06); padding-bottom:0.25rem;">A Disposizione (Panchina)</div>' +
            benchGridHtml +
            '<div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.08); padding-top:0.45rem; font-size:0.58rem; color:#64748b; font-family:\'Inter\',sans-serif;">' +
              '<span style="letter-spacing:0.05em;">Formazione Convalidata</span>' +
              '<span style="color:#ffffff; font-weight:800; letter-spacing:0.1em;">ELISEE SCOUT</span>' +
            '</div>' +
          '</div>' +
        '</div>' +

        // BOTTONI AZIONE MODALE
        '<div style="display:flex; gap:0.6rem;">' +
          '<button type="button" class="es-btn-cos-primary" id="btn-copy-story-text" style="font-size:0.8rem; padding:0.5rem 1rem;">' +
            '📋 Copia Formazione Testuale' +
          '</button>' +
          '<button type="button" class="es-btn-cos-sec" id="btn-close-modal" style="font-size:0.8rem; padding:0.5rem 1rem;">' +
            'Chiudi' +
          '</button>' +
        '</div>' +
      '</div>';

    openModal('Anteprima Story 9:16 · ' + clubName, content);

    var btnCopy = document.getElementById('btn-copy-story-text');
    if (btnCopy) {
      btnCopy.onclick = function () {
        var text = '⚽ ' + clubName + ' — FORMAZIONE UFFICIALE (' + modKey + ')\n\n' +
          'XI Titolare:\n' +
          data.top11.map(function (p, i) { return (i + 1) + '. #' + p.num + ' ' + p.name + ' (' + p.pos + ')'; }).join('\n') +
          '\n\nPanchina:\n' +
          (data.panchina || []).map(function (b) { return '#' + b.num + ' ' + b.name + ' (' + (b.pos || b.role) + ')'; }).join(', ') +
          '\n\n#EliseeScout #Matchday #' + clubName.replace(/\s+/g, '');

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () {
            if (window.showToast) window.showToast('Testo formazione copiato negli appunti!', 'success');
          }).catch(function () {
            if (window.showToast) window.showToast('Testo pronto per la condivisione.', 'info');
          });
        }
      };
    }
  }

  // ============================================================
  // 4. SEZIONE TATTICA (LAVAGNA TATTICA DIGITALE INTERATTIVA)
  // ============================================================
  function renderTattica(data) {
    syncTacticalBoard(data);
    var tb = data.tacticalBoard;
    var modKey = tb.modulo || '4-3-3';
    var curMod = MODULI_TATTICI[modKey] || MODULI_TATTICI['4-3-3'];
    var activeTool = tb.activeTool || 'move';
    var schemi = tb.schemiSalvati || [];

    var modOptions = [
      { k: '4-3-3', n: '4-3-3 (Offensivo con Ali)' },
      { k: '4-4-2', n: '4-4-2 (Classico Lineare)' },
      { k: '4-2-3-1', n: '4-2-3-1 (Doppio Mediano & Trequarti)' },
      { k: '3-5-2', n: '3-5-2 (Ampiezza Quinti & Doppio Attacco)' },
      { k: '3-4-3', n: '3-4-3 (Tridente & Linea Mediana a 4)' },
      { k: '5-3-2', n: '5-3-2 (Difesa a 5 & Contropiede Rapido)' },
      { k: '4-1-4-1', n: '4-1-4-1 (Vertice Basso & Linea di Trequarti)' }
    ].map(function (m) {
      return '<option value="' + m.k + '" ' + (m.k === modKey ? 'selected' : '') + ' style="background:#071522; color:#fff;">' + m.n + '</option>';
    }).join('');

    var schemiOptions = '<option value="">-- Schemi Salvati (' + schemi.length + ') --</option>' +
      schemi.map(function (s, sIdx) {
        return '<option value="' + sIdx + '" style="background:#071522; color:#fff;">' + esc(s.nome) + ' (' + esc(s.modulo) + ')</option>';
      }).join('');

    return (
      '<div class="es-cos-panel-card">' +
        // HEADER DELLA LAVAGNA
        '<div class="es-cos-panel-head" style="flex-wrap:wrap; gap:0.75rem; justify-content:space-between; align-items:center;">' +
          '<div style="display:flex; align-items:center; gap:1rem; flex-wrap:wrap;">' +
            '<span class="es-cos-panel-title" style="margin:0; display:flex; align-items:center; gap:0.5rem;">' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16b9ff" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg>' +
              'Lavagna Tattica Digitale Interattiva' +
            '</span>' +
            // SELETTORE MODULO INDIPENDENTE
            '<div style="display:flex; align-items:center; gap:0.4rem; background:#071522; border:1.5px solid #3b82f6; border-radius:8px; padding:0.3rem 0.65rem;">' +
              '<label for="sel-board-modulo" style="font-size:0.75rem; font-weight:800; color:#93c5fd; text-transform:uppercase;">Modulo:</label>' +
              '<select id="sel-board-modulo" style="background:transparent; border:none; color:#ffffff; font-size:0.85rem; font-weight:800; cursor:pointer; outline:none;">' +
                modOptions +
              '</select>' +
            '</div>' +
          '</div>' +
            // BOTTONI AZIONE & STORICO SCHEMI
          '<div style="display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">' +
            '<select id="sel-board-saved-schemes" style="background:#071522; border:1px solid #12344a; color:#8da8bc; font-size:0.75rem; padding:0.45rem 0.65rem; border-radius:6px; max-width:210px; cursor:pointer; outline:none;">' +
              schemiOptions +
            '</select>' +
            '<button type="button" class="es-btn-cos-sec" id="btn-sync-board-xi" title="Importa XI Ufficiale confermato e modulo" style="display:inline-flex; align-items:center; gap:6px; font-size:0.75rem;">' +
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>' +
              '<span>Sincronizza da XI Ufficiale</span>' +
            '</button>' +
            '<button type="button" class="es-btn-cos-sec" id="btn-reset-board" style="display:inline-flex; align-items:center; gap:6px; font-size:0.75rem;" title="Ripristina posizioni base del modulo">' +
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>' +
              '<span>Reset Modulo</span>' +
            '</button>' +
            '<button type="button" class="es-btn-cos-primary" id="btn-save-board-scheme" style="display:inline-flex; align-items:center; gap:6px; font-size:0.75rem; padding:0.45rem 0.85rem;" title="Salva schema tattico attuale">' +
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>' +
              '<span>Salva Schema</span>' +
            '</button>' +
          '</div>' +
        '</div>' +

        // TOOLBAR STRUMENTI TATTICI (ICONE SVG LUCIDE)
        '<div class="es-board-toolbar">' +
          '<span style="font-size:0.72rem; font-weight:800; color:#8da8bc; text-transform:uppercase; margin-right:4px;">Strumenti Tattici:</span>' +
          '<button type="button" class="es-board-tool-btn ' + (activeTool === 'move' ? 'is-active' : '') + '" data-board-tool="move" title="Trascina liberamente calciatori e pallone">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></svg>' +
            '<span>Muovi</span>' +
          '</button>' +
          '<button type="button" class="es-board-tool-btn ' + (activeTool === 'arrow-run' ? 'is-active' : '') + '" data-board-tool="arrow-run" title="Traccia freccia continua di corsa / movimento atleta">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>' +
            '<span>Freccia Corsa</span>' +
          '</button>' +
          '<button type="button" class="es-board-tool-btn ' + (activeTool === 'arrow-pass' ? 'is-active' : '') + '" data-board-tool="arrow-pass" title="Traccia freccia tratteggiata di passaggio pallone">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></svg>' +
            '<span>Passaggio</span>' +
          '</button>' +
          '<button type="button" class="es-board-tool-btn ' + (activeTool === 'zone' ? 'is-active' : '') + '" data-board-tool="zone" title="Evidenzia zona di pressing o superiorità numerica">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' +
            '<span>Zona Pressing</span>' +
          '</button>' +
          '<div style="margin-left:auto; display:flex; gap:6px;">' +
            '<button type="button" class="es-board-tool-btn" id="btn-undo-drawing" title="Annulla ultimo tracciato (Ctrl+Z)">' +
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>' +
              '<span>Annulla Tratto</span>' +
            '</button>' +
            '<button type="button" class="es-board-tool-btn" id="btn-clear-drawings" title="Rimuovi tutte le frecce e zone">' +
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/></svg>' +
              '<span>Pulisci Tracciati</span>' +
            '</button>' +
          '</div>' +
        '</div>' +

        // RETTANGOLO DEL CAMPO INTERATTIVO
        '<div id="es-tactical-pitch" style="background:radial-gradient(circle at 50% 50%, #0d3b1f 0%, #061e11 88%); border:2.5px solid #16562f; border-radius:12px; position:relative; aspect-ratio:16/10; min-height:480px; overflow:hidden; user-select:none; box-shadow:0 12px 30px rgba(0,0,0,0.6);">' +
          // LINEE CAMPO REGOLAMENTARI SVG
          renderTacticalPitchLines() +
          // LAYER SVG PER FRECCE E ZONE
          renderTacticalSvgLayer(tb.arrows, tb.zones) +
          // PEDINE CALCIATORI E PALLONE TRASCINABILI
          renderInteractiveBoardPins(tb.pins) +
          // WATERMARK MODULO IN BASSO
          '<div style="position:absolute; bottom:8px; left:12px; font-size:0.68rem; font-weight:800; color:rgba(255,255,255,0.25); letter-spacing:0.05em; pointer-events:none; text-transform:uppercase;">' + esc(curMod.nome) + ' · STUDIO TATTICO</div>' +
        '</div>' +
      '</div>'
    );
  }

  function renderTacticalPitchLines() {
    return (
      '<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute; inset:0; width:100%; height:100%; pointer-events:none; opacity:0.32;">' +
        '<rect x="4" y="3" width="92" height="94" fill="none" stroke="#ffffff" stroke-width="1.2" rx="2"/>' +
        '<line x1="4" y1="50" x2="96" y2="50" stroke="#ffffff" stroke-width="1.2"/>' +
        '<circle cx="50" cy="50" r="11" fill="none" stroke="#ffffff" stroke-width="1.2"/>' +
        '<circle cx="50" cy="50" r="1" fill="#ffffff"/>' +
        '<rect x="26" y="3" width="48" height="17" fill="none" stroke="#ffffff" stroke-width="1.2"/>' +
        '<rect x="36" y="3" width="28" height="6.5" fill="none" stroke="#ffffff" stroke-width="1.2"/>' +
        '<circle cx="50" cy="13.5" r="1" fill="#ffffff"/>' +
        '<path d="M 40 20 A 10 10 0 0 0 60 20" fill="none" stroke="#ffffff" stroke-width="1.2"/>' +
        '<rect x="26" y="80" width="48" height="17" fill="none" stroke="#ffffff" stroke-width="1.2"/>' +
        '<rect x="36" y="90.5" width="28" height="6.5" fill="none" stroke="#ffffff" stroke-width="1.2"/>' +
        '<circle cx="50" cy="86.5" r="1" fill="#ffffff"/>' +
        '<path d="M 40 80 A 10 10 0 0 1 60 80" fill="none" stroke="#ffffff" stroke-width="1.2"/>' +
        '<rect x="42" y="1" width="16" height="2" fill="rgba(255,255,255,0.2)" stroke="#ffffff" stroke-width="0.8"/>' +
        '<rect x="42" y="97" width="16" height="2" fill="rgba(255,255,255,0.2)" stroke="#ffffff" stroke-width="0.8"/>' +
        '<path d="M 4 6 A 3 3 0 0 0 7 3" fill="none" stroke="#ffffff" stroke-width="1.2"/>' +
        '<path d="M 96 6 A 3 3 0 0 1 93 3" fill="none" stroke="#ffffff" stroke-width="1.2"/>' +
        '<path d="M 4 94 A 3 3 0 0 1 7 97" fill="none" stroke="#ffffff" stroke-width="1.2"/>' +
        '<path d="M 96 94 A 3 3 0 0 0 93 97" fill="none" stroke="#ffffff" stroke-width="1.2"/>' +
      '</svg>'
    );
  }

  function renderTacticalSvgLayer(arrows, zones) {
    var arrowsHtml = (arrows || []).map(function (a) {
      var isRun = a.tipo === 'corsa';
      var col = a.colore || (isRun ? '#ffd21a' : '#38bdf8');
      var markerId = isRun ? 'arr-marker-yellow' : 'arr-marker-blue';
      return '<line x1="' + a.x1 + '%" y1="' + a.y1 + '%" x2="' + a.x2 + '%" y2="' + a.y2 + '%" stroke="' + col + '" stroke-width="3" stroke-linecap="round" marker-end="url(#' + markerId + ')" ' + (isRun ? '' : 'stroke-dasharray="6,4"') + ' />';
    }).join('');

    var zonesHtml = (zones || []).map(function (z) {
      return (
        '<rect x="' + z.x + '%" y="' + z.y + '%" width="' + z.w + '%" height="' + z.h + '%" fill="rgba(239,68,68,0.22)" stroke="#ef4444" stroke-width="2" stroke-dasharray="4,3" rx="6"/>' +
        '<text x="' + (z.x + z.w / 2) + '%" y="' + (z.y + z.h / 2) + '%" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle" dominant-baseline="central" style="filter:drop-shadow(0 1px 2px #000); pointer-events:none;">' + esc(z.label || 'Zona Pressing') + '</text>'
      );
    }).join('');

    return (
      '<svg id="es-tactical-drawings-svg" style="position:absolute; inset:0; width:100%; height:100%; pointer-events:none; z-index:15;">' +
        '<defs>' +
          '<marker id="arr-marker-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">' +
            '<path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />' +
          '</marker>' +
          '<marker id="arr-marker-yellow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">' +
            '<path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ffd21a" />' +
          '</marker>' +
        '</defs>' +
        zonesHtml +
        arrowsHtml +
        '<g id="es-tactical-live-preview"></g>' +
      '</svg>'
    );
  }

  function renderInteractiveBoardPins(pins) {
    return (pins || []).map(function (p, idx) {
      if (p.type === 'ball') {
        return (
          '<div class="es-tactical-pin-drag" data-board-pin-idx="' + idx + '" style="position:absolute; left:' + p.x + '%; top:' + p.y + '%; transform:translate(-50%, -50%); z-index:30; cursor:grab; filter:drop-shadow(0 4px 8px rgba(0,0,0,0.8)); font-size:1.5rem;" title="Trascina il pallone">' +
            '⚽' +
          '</div>'
        );
      }

      var roleBadge = p.pos || 'CC';
      return (
        '<div class="es-tactical-pin-drag" data-board-pin-idx="' + idx + '" style="position:absolute; left:' + p.x + '%; top:' + p.y + '%; transform:translate(-50%, -50%); z-index:25; display:flex; flex-direction:column; align-items:center; gap:2px; cursor:grab;" title="Trascina #' + esc(p.num) + ' ' + esc(p.name) + '">' +
          // PALLINO NUMERATO CON GLOW E BORDO AZZURRO
          '<div style="width:36px; height:36px; border-radius:50%; background:#071522; border:2.5px solid #16b9ff; color:#f3f8fc; font-weight:900; font-size:0.85rem; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(0,0,0,0.7);">' +
            '#' + esc(p.num) +
          '</div>' +
          // TARGHETTA NOME GIOCATORE + RUOLO
          '<div style="background:rgba(4,9,18,0.92); border:1px solid #12344a; color:#fff; font-size:0.65rem; font-weight:800; padding:1px 5px; border-radius:4px; white-space:nowrap; box-shadow:0 2px 6px rgba(0,0,0,0.6); display:flex; align-items:center; gap:3px;">' +
            '<span>' + esc(p.name) + '</span>' +
            '<span style="color:#16b9ff; font-weight:900;">(' + esc(roleBadge) + ')</span>' +
          '</div>' +
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
          '<span class="es-cos-panel-title">Pianificazione Sedute di Allenamento (Tabella: allenamenti)</span>' +
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
                  '<button type="button" class="es-btn-cos-sec" style="padding:0.35rem 0.75rem; font-size:0.74rem;" data-upload-gps-tr="' + tr.id + '"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:3px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>GPS</button>' +
                '</div>' +
              '</div>'
            );
          }).join('') : (
            '<div style="grid-column:1/-1; text-align:center; padding:3.5rem 1rem; color:#8da8bc;">' +
              '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity:0.4; margin-bottom:0.75rem;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
              '<div style="font-size:1rem; font-weight:800; color:#f3f8fc;">Nessuna seduta programmata</div>' +
              '<div style="font-size:0.78rem; margin-top:0.3rem;">Gli allenamenti inseriti a database appariranno qui.</div>' +
            '</div>'
          )) +
        '</div>' +
      '</div>'
    );
  }

  // ============================================================
  // 6. SEZIONE CALENDARIO
  // ============================================================
  function renderCalendario(data) {
    var hasEvents = (data.prossimeGare && data.prossimeGare.length) || (data.trainingsList && data.trainingsList.length);
    return (
      '<div class="es-cos-panel-card">' +
        '<div class="es-cos-panel-head">' +
          '<span class="es-cos-panel-title">Calendario Tecnico Staff & Partite (Tabelle: partite, allenamenti)</span>' +
        '</div>' +
        '<table class="es-cos-table-compact">' +
          '<thead><tr><th>Data & Orario</th><th>Evento</th><th>Competizione / Categoria</th><th>Stadio / Luogo</th><th>Stato</th></tr></thead>' +
          '<tbody>' +
            (hasEvents ? (
              (data.prossimeGare || []).map(function (g) {
                return '<tr><td><b>' + esc(g.data) + '</b></td><td>Partita: ' + esc(data.clubName) + ' vs ' + esc(g.avv) + '</td><td><span class="es-cos-badge-pill is-blue">' + esc(g.comp) + '</span></td><td>' + esc(g.stadio) + '</td><td><span class="es-cos-badge-pill is-green">' + esc(g.status) + '</span></td></tr>';
              }).join('') +
              (data.trainingsList || []).map(function (t) {
                return '<tr><td><b>' + esc(t.data) + ' ' + esc(t.orario) + '</b></td><td>Allenamento: ' + esc(t.tipo) + '</td><td><span class="es-cos-badge-pill is-warn">Seduta Campo</span></td><td>' + esc(t.luogo) + '</td><td><span class="es-cos-badge-pill is-green">Programmata</span></td></tr>';
              }).join('')
            ) : '<tr><td colspan="5" style="text-align:center; padding:2.5rem; color:#8da8bc;">Nessun evento o partita in programma registrato a database.</td></tr>') +
          '</tbody>' +
        '</table>' +
      '</div>'
    );
  }

  // ============================================================
  // 7. SEZIONE ANALISI AVVERSARIO (DOSSIER TATTICO & MATCH ANALYSIS)
  // ============================================================
  function renderAnalisiAvversario(data) {
    // Lista gare disponibili per il selettore
    var matchesList = [];
    if (data.nextMatch && data.nextMatch.avversario && data.nextMatch.avversario !== 'In attesa di gara...') {
      matchesList.push({
        id: data.nextMatch.id || 'next-match',
        avversario: data.nextMatch.avversario,
        data: data.nextMatch.data,
        isNext: true
      });
    } else {
      matchesList.push({
        id: 'next-cerignola',
        avversario: 'Cerignola Nord',
        data: '18/09/2026',
        isNext: true
      });
    }

    if (Array.isArray(data.prossimeGare)) {
      data.prossimeGare.forEach(function (g) {
        if (!matchesList.some(function (m) { return m.avversario === g.avv; })) {
          matchesList.push({
            id: g.id || ('g-' + g.avv.toLowerCase().replace(/\s+/g, '-')),
            avversario: g.avv,
            data: g.data,
            isNext: false
          });
        }
      });
    }

    if (!data.selectedDossierMatchId) {
      data.selectedDossierMatchId = matchesList[0].id;
    }

    var curMatch = matchesList.find(function (m) { return m.id === data.selectedDossierMatchId; }) || matchesList[0];
    var activeOpponent = curMatch.avversario;

    // Recupera note dossier per questa gara (da data.dossierByMatch o default)
    data.dossierByMatch = data.dossierByMatch || {};
    var d = data.dossierByMatch[curMatch.id] || {
      puntiForza: 'Transizioni rapide sulle corsie laterali e pericolosità sui piazzati.',
      puntiDeboli: 'Spazi concessi dietro i terzini quando attaccano alti; difficoltà nel possesso sotto pressing.',
      giocatoriChiave: 'Numero 9 (punta strutturata) e numero 10 (regista di centrocampo).',
      palleInattive: 'Corner a rientrare sul primo palo; schema a blocchi per inserimento del centrale.',
      noteMister: ''
    };

    // File video caricati per questa partita o categoria video_analisi
    var allVideos = (data.allegati || []).filter(function (f) { return f.categoria === 'video_analisi'; });
    var matchVideos = allVideos.filter(function (f) {
      return !f.entita_id || f.entita_id === curMatch.id || f.entita_id === 'match-next' || f.entita_id === 'partita';
    });

    var matchSelectOptions = matchesList.map(function (m) {
      return '<option value="' + esc(m.id) + '" ' + (m.id === data.selectedDossierMatchId ? 'selected' : '') + ' style="background:#071522; color:#fff;">' +
        (m.isNext ? '⚽ Prossima Gara: ' : '📅 Gara: ') + esc(m.avversario) + ' (' + esc(m.data) + ')' +
      '</option>';
    }).join('');

    return (
      '<div style="display:flex; flex-direction:column; gap:1.25rem;">' +
        // BARRA SUPERIORE SELETTORE PARTITA / AVVERSARIO
        '<div class="es-cos-panel-card" style="padding:0.75rem 1.25rem; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem; background:linear-gradient(90deg, #071522 0%, #0a1e30 100%);">' +
          '<div style="display:flex; align-items:center; gap:0.75rem;">' +
            '<div style="width:36px; height:36px; border-radius:8px; background:rgba(22,185,255,0.12); border:1px solid #16b9ff; display:flex; align-items:center; justify-content:center; color:#16b9ff;">' +
              '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
            '</div>' +
            '<div>' +
              '<div style="font-size:0.72rem; font-weight:800; color:#8da8bc; text-transform:uppercase;">Gara & Avversario in Studio:</div>' +
              '<div style="font-size:1.05rem; font-weight:800; color:#f3f8fc;">' + esc(activeOpponent) + '</div>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex; align-items:center; gap:0.6rem;">' +
            '<label for="sel-dossier-match" style="font-size:0.78rem; font-weight:800; color:#93c5fd;">Seleziona Partita:</label>' +
            '<select id="sel-dossier-match" style="background:#040912; border:1.5px solid #3b82f6; color:#ffffff; font-size:0.82rem; font-weight:700; padding:0.45rem 0.75rem; border-radius:6px; cursor:pointer; outline:none;">' +
              matchSelectOptions +
            '</select>' +
          '</div>' +
        '</div>' +

        // GRIGLIA A DUE COLONNE: DOSSIER TATTICO A SINISTRA, MATCH ANALYSIS A DESTRA
        '<div style="display:grid; grid-template-columns:1.2fr 1fr; gap:1.25rem;">' +
          // COLONNA SINISTRA: DOSSIER TATTICO CON 4 CARD EDITABILI
          '<div class="es-cos-panel-card">' +
            '<div class="es-cos-panel-head" style="justify-content:space-between; align-items:center;">' +
              '<span class="es-cos-panel-title">Dossier Tattico: ' + esc(activeOpponent) + '</span>' +
              '<button type="button" class="es-btn-cos-sec" id="btn-edit-all-dossier" style="font-size:0.75rem; display:inline-flex; align-items:center; gap:4px;">' +
                '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>' +
                'Modifica Dossier' +
              '</button>' +
            '</div>' +
            '<div style="display:flex; flex-direction:column; gap:0.75rem; font-size:0.82rem;">' +
              // CARD 1: Punti di Forza
              '<div class="es-dossier-card" data-edit-dossier-field="puntiForza" style="background:#071522; border:1px solid #12344a; border-radius:8px; padding:0.9rem;">' +
                '<span class="es-dossier-edit-hint" style="color:#00d978;">✏️ Modifica</span>' +
                '<b style="color:#00d978; display:block; margin-bottom:0.35rem; font-size:0.85rem;">Punti di Forza:</b>' +
                '<p style="margin:0; color:#e2e8f0; line-height:1.45;">' + esc(d.puntiForza || 'In attesa inserimento report.') + '</p>' +
              '</div>' +
              // CARD 2: Punti Deboli
              '<div class="es-dossier-card" data-edit-dossier-field="puntiDeboli" style="background:#071522; border:1px solid #12344a; border-radius:8px; padding:0.9rem;">' +
                '<span class="es-dossier-edit-hint" style="color:#ff4d5a;">✏️ Modifica</span>' +
                '<b style="color:#ff4d5a; display:block; margin-bottom:0.35rem; font-size:0.85rem;">Punti Deboli:</b>' +
                '<p style="margin:0; color:#e2e8f0; line-height:1.45;">' + esc(d.puntiDeboli || 'In attesa inserimento report.') + '</p>' +
              '</div>' +
              // CARD 3: Giocatori Chiave
              '<div class="es-dossier-card" data-edit-dossier-field="giocatoriChiave" style="background:#071522; border:1px solid #12344a; border-radius:8px; padding:0.9rem;">' +
                '<span class="es-dossier-edit-hint" style="color:#ffd21a;">✏️ Modifica</span>' +
                '<b style="color:#ffd21a; display:block; margin-bottom:0.35rem; font-size:0.85rem;">Giocatori Chiave:</b>' +
                '<p style="margin:0; color:#e2e8f0; line-height:1.45;">' + esc(d.giocatoriChiave || 'In attesa inserimento report.') + '</p>' +
              '</div>' +
              // CARD 4: Palle Inattive
              '<div class="es-dossier-card" data-edit-dossier-field="palleInattive" style="background:#071522; border:1px solid #12344a; border-radius:8px; padding:0.9rem;">' +
                '<span class="es-dossier-edit-hint" style="color:#16b9ff;">✏️ Modifica</span>' +
                '<b style="color:#16b9ff; display:block; margin-bottom:0.35rem; font-size:0.85rem;">Palle Inattive:</b>' +
                '<p style="margin:0; color:#e2e8f0; line-height:1.45;">' + esc(d.palleInattive || 'In attesa inserimento report.') + '</p>' +
              '</div>' +
            '</div>' +
          '</div>' +

          // COLONNA DESTRA: VIDEO REPORT & MATCH ANALYSIS CON CTA UNIFICATO
          '<div class="es-cos-panel-card" style="display:flex; flex-direction:column; justify-content:space-between;">' +
            '<div>' +
              '<div class="es-cos-panel-head">' +
                '<span class="es-cos-panel-title">Video Report & Match Analysis</span>' +
                (matchVideos.length ? (
                  '<button type="button" class="es-btn-cos-primary" id="btn-upload-video-analysis" style="font-size:0.74rem;">' +
                    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>' +
                    '+ Aggiungi Video' +
                  '</button>'
                ) : '') +
              '</div>' +
              (matchVideos.length ? (
                '<div style="display:flex; flex-direction:column; gap:0.6rem; max-height:360px; overflow-y:auto; padding-right:2px;">' +
                  matchVideos.map(function (vf) {
                    return (
                      '<div style="background:#071522; border:1px solid #12344a; border-radius:8px; padding:0.75rem 0.9rem; display:flex; justify-content:space-between; align-items:center;">' +
                        '<div style="display:flex; align-items:center; gap:0.65rem;">' +
                          '<div style="width:32px; height:32px; border-radius:6px; background:rgba(22,185,255,0.12); color:#16b9ff; display:flex; align-items:center; justify-content:center;">' +
                            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>' +
                          '</div>' +
                          '<div>' +
                            '<b style="color:#f3f8fc; font-size:0.84rem; display:block;">' + esc(vf.file_url.split('/').pop()) + '</b>' +
                            '<span style="font-size:0.7rem; color:#8da8bc;">Caricato il ' + formatDate(vf.created_at) + '</span>' +
                          '</div>' +
                        '</div>' +
                        '<a href="' + esc(vf.file_url) + '" target="_blank" rel="noopener noreferrer" class="es-btn-cos-sec" style="font-size:0.72rem; padding:0.35rem 0.65rem;">' +
                          'Riproduci &rarr;' +
                        '</a>' +
                      '</div>'
                    );
                  }).join('') +
                '</div>'
              ) : (
                // STATO VUOTO CON UNICO CTA SOLIDO
                '<div style="background:#071522; border:1px solid #12344a; border-radius:8px; padding:2rem 1.25rem; text-align:center;">' +
                  '<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="color:var(--cos-text-muted, #8da8bc); opacity:0.65; margin:0 auto 0.75rem; display:block;"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>' +
                  '<div style="font-weight:800; font-size:0.95rem; margin-top:0.5rem; color:#f3f8fc;">Nessun video analisi allegato per ' + esc(activeOpponent) + '</div>' +
                  '<p style="font-size:0.75rem; color:#8da8bc; margin:0.4rem 0 1.2rem;">I video caricati vengono conservati nel bucket cloud <code>staff-allegati</code> con accesso riservato allo staff.</p>' +
                  '<button type="button" class="es-btn-cos-primary" id="btn-upload-video-analysis" style="padding:0.6rem 1.2rem; font-size:0.82rem; font-weight:800; border-radius:7px; display:inline-flex; align-items:center; gap:6px;">' +
                    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>' +
                    'Carica Video / Match Analysis' +
                  '</button>' +
                '</div>'
              )) +
            '</div>' +
            // PRO MEMORIA IN FONDO ALLA CARD VIDEO
            '<div style="margin-top:1rem; padding:0.65rem 0.85rem; background:rgba(22,185,255,0.06); border:1px solid rgba(22,185,255,0.22); border-radius:6px; font-size:0.73rem; color:#8da8bc;">' +
              '<b style="color:#16b9ff;">Nota Metodologica:</b> I video-clip associati a questa gara sono visibili in tempo reale anche al Vice Allenatore e al Match Analyst.' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  // ============================================================
  // 8. SEZIONE GPS & CARICHI
  // ============================================================
  function renderGpsCarichi(data) {
    var gpsFiles = (data.allegati || []).filter(function (f) { return f.categoria === 'gps'; });
    var avg = (data.carico && data.carico.mediaSettimanale) || 0;
    var acwr = (data.carico && data.carico.acwr) || '1.00';
    var stato = (data.carico && data.carico.stato) || 'In attesa dati GPS';

    return (
      '<div style="display:flex; flex-direction:column; gap:1.25rem;">' +
        '<div class="es-cos-panel-card">' +
          '<div class="es-cos-panel-head">' +
            '<span class="es-cos-panel-title">Dashboard Telemetria GPS & Workload Management (Supabase)</span>' +
            '<button type="button" class="es-btn-cos-primary" id="btn-upload-gps-modal"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Carica Telemetria GPS (.csv, .json, .fit)</button>' +
          '</div>' +
          '<div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:1rem; margin-bottom:1rem;">' +
            '<div style="background:#071522; border:1px solid #12344a; border-radius:6px; padding:0.85rem; text-align:center;"><div style="font-size:1.3rem; font-weight:900; color:#16b9ff;">' + (avg > 0 ? (avg + '%') : '--') + '</div><div style="font-size:0.72rem; color:#8da8bc;">CARICO MEDIO SETTIMANA</div></div>' +
            '<div style="background:#071522; border:1px solid #12344a; border-radius:6px; padding:0.85rem; text-align:center;"><div style="font-size:1.3rem; font-weight:900; color:#00d978;">' + (avg > 0 ? (Math.round(avg * 1.3) + ' km') : '--') + '</div><div style="font-size:0.72rem; color:#8da8bc;">DISTANZA TOTALE STIMATA</div></div>' +
            '<div style="background:#071522; border:1px solid #12344a; border-radius:6px; padding:0.85rem; text-align:center;"><div style="font-size:1.3rem; font-weight:900; color:#ffd21a;">' + acwr + '</div><div style="font-size:0.72rem; color:#8da8bc;">ACWR RATIO MEDIO</div></div>' +
            '<div style="background:#071522; border:1px solid #12344a; border-radius:6px; padding:0.85rem; text-align:center;"><div style="font-size:1.3rem; font-weight:900; color:#00d978;">' + esc(stato) + '</div><div style="font-size:0.72rem; color:#8da8bc;">STATO DI FORMA</div></div>' +
          '</div>' +
          '<table class="es-cos-table-compact">' +
            '<thead><tr><th>Calciatore</th><th>Ruolo</th><th>Km Totali</th><th>Sprint >25km/h</th><th>ACWR</th><th>Semaforo Rischio</th></tr></thead>' +
            '<tbody>' +
              (data.roster && data.roster.length ? data.roster.map(function (p) {
                var isDiff = p.status === 'diff';
                return '<tr><td><b>' + esc(p.name) + '</b></td><td>' + esc(p.role) + '</td><td>' + esc(p.load) + '</td><td>' + (isDiff ? '--' : '--') + '</td><td><b>' + esc(p.acwr) + '</b></td><td><span class="es-cos-badge-pill ' + (isDiff ? 'is-warn' : 'is-green') + '">' + (isDiff ? 'Differenziato' : 'Regolare') + '</span></td></tr>';
              }).join('') : '<tr><td colspan="6" style="text-align:center; padding:2rem; color:#8da8bc;">Nessun dato di carico o atleta presente.</td></tr>') +
            '</tbody>' +
          '</table>' +
        '</div>' +

        // File GPS Archiviati
        '<div class="es-cos-panel-card">' +
          '<div class="es-cos-panel-head"><span class="es-cos-panel-title">File Telemetria GPS Archiviati (Bucket Cloud: staff-allegati)</span></div>' +
          (gpsFiles.length ? (
            '<div style="display:flex; flex-direction:column; gap:0.5rem;">' +
              gpsFiles.map(function (gf) {
                return (
                  '<div style="display:flex; justify-content:space-between; align-items:center; background:#071522; border:1px solid #12344a; border-radius:6px; padding:0.75rem 1rem;">' +
                    '<div><b style="color:#f3f8fc; font-size:0.85rem;">' + esc(gf.file_url.split('/').pop()) + '</b><div style="font-size:0.72rem; color:#8da8bc;">Caricato il ' + formatDate(gf.created_at) + '</div></div>' +
                    '<a href="' + esc(gf.file_url) + '" target="_blank" rel="noopener noreferrer" class="es-btn-cos-sec" style="font-size:0.74rem;">Scarica File &rarr;</a>' +
                  '</div>'
                );
              }).join('') +
            '</div>'
          ) : '<div style="text-align:center; padding:2rem; color:#8da8bc; font-size:0.82rem;">Nessun tracciato GPS caricato. Clicca su "+ Carica Telemetria GPS" per importare dati.</div>') +
        '</div>' +
      '</div>'
    );
  }

  // ============================================================
  // 9. SEZIONE REPORT STAFF
  // ============================================================
  function renderReportStaff(data) {
    var reports = data.reports || [];
    var allegati = data.allegati || [];

    return (
      '<div style="display:flex; flex-direction:column; gap:1.25rem;">' +
        '<div class="es-cos-panel-card">' +
          '<div class="es-cos-panel-head">' +
            '<span class="es-cos-panel-title">Report Staff Tecnico & Medico (Tabella: report)</span>' +
            '<button type="button" class="es-btn-cos-primary" id="btn-upload-staff-report-modal"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Carica Nuovo Report / Scheda</button>' +
          '</div>' +
          '<div style="display:flex; flex-direction:column; gap:0.75rem;">' +
            (reports.length ? reports.map(function (r) {
              return (
                '<div style="background:#071522; border:1px solid #12344a; border-radius:8px; padding:1rem; display:flex; justify-content:space-between; align-items:center;">' +
                  '<div>' +
                    '<div class="es-cos-badge-pill is-blue" style="margin-bottom:4px;">' + esc(r.tipo || 'Report Staff') + '</div>' +
                    '<div style="font-weight:800; font-size:0.95rem; color:#f3f8fc;">' + esc(r.titolo) + '</div>' +
                    '<div style="font-size:0.75rem; color:#8da8bc;">' + esc(r.contenuto || '') + ' · ' + formatDate(r.created_at) + '</div>' +
                  '</div>' +
                  '<div style="display:flex; gap:0.5rem;">' +
                    (r.file_url ? '<a href="' + esc(r.file_url) + '" target="_blank" rel="noopener noreferrer" class="es-btn-cos-sec" style="font-size:0.74rem;">Allegato &rarr;</a>' : '') +
                  '</div>' +
                '</div>'
              );
            }).join('') : (
              '<div style="text-align:center; padding:2.5rem; color:#8da8bc;">' +
                '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="opacity:0.4; margin-bottom:0.5rem;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>' +
                '<div style="font-size:0.95rem; font-weight:800; color:#f3f8fc;">Nessun report ricevuto dallo staff</div>' +
                '<div style="font-size:0.75rem; margin-top:0.25rem;">Le schede e i report inviati dai collaboratori tecnici appariranno qui.</div>' +
              '</div>'
            )) +
          '</div>' +
        '</div>' +

        // Box Allegati Cloud
        '<div class="es-cos-panel-card">' +
          '<div class="es-cos-panel-head"><span class="es-cos-panel-title">Archivio File & Allegati Cloud (Bucket: staff-allegati)</span></div>' +
          (allegati.length ? (
            '<div style="display:flex; flex-direction:column; gap:0.5rem;">' +
              allegati.map(function (al) {
                return (
                  '<div style="display:flex; justify-content:space-between; align-items:center; background:#071522; border:1px solid #12344a; border-radius:6px; padding:0.75rem 1rem;">' +
                    '<div><b style="color:#f3f8fc; font-size:0.85rem;">' + esc(al.file_url.split('/').pop()) + '</b><div style="font-size:0.72rem; color:#8da8bc;">Categoria: <b>' + esc(al.categoria) + '</b> · ' + formatDate(al.created_at) + '</div></div>' +
                    '<a href="' + esc(al.file_url) + '" target="_blank" rel="noopener noreferrer" class="es-btn-cos-sec" style="font-size:0.74rem;">Apri Documento &rarr;</a>' +
                  '</div>'
                );
              }).join('') +
            '</div>'
          ) : '<div style="text-align:center; padding:1.5rem; color:#8da8bc; font-size:0.8rem;">Nessun documento o referto archiviato.</div>') +
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
          var activeNavBtn = mount.querySelector('#es-cos-main-tabs button.is-active');
          if (activeNavBtn && typeof activeNavBtn.scrollIntoView === 'function') {
            activeNavBtn.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
          }
          var container = document.getElementById('es-cos-active-content');
          if (container) {
            container.innerHTML = renderActiveTab(activeTab, data);
            bindAllEvents();
          }
        }
      };
    });

    // Abilita scroll orizzontale della tab bar con la rotellina del mouse (desktop)
    var mainTabs = mount.querySelector('#es-cos-main-tabs');
    if (mainTabs && !mainTabs._wheelBound) {
      mainTabs._wheelBound = true;
      mainTabs.addEventListener('wheel', function (e) {
        if (e.deltaY !== 0) {
          e.preventDefault();
          mainTabs.scrollLeft += e.deltaY;
        }
      }, { passive: false });
    }
    var initActiveNavBtn = mount.querySelector('#es-cos-main-tabs button.is-active');
    if (initActiveNavBtn && typeof initActiveNavBtn.scrollIntoView === 'function') {
      initActiveNavBtn.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
    }

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

    // Esporta Story 9:16 Anteprima Instagram
    var btnStory = mount.querySelector('#btn-export-story-modal');
    if (btnStory) {
      btnStory.onclick = function () {
        openStoryPreviewModal(data);
      };
    }

    // Cambio Modulo Tattico Dinamico (7 Moduli)
    var selMod = mount.querySelector('#sel-tactical-modulo');
    if (selMod) {
      selMod.onchange = function () {
        data.moduloPrincipale = selMod.value;
        syncFormationWithRoster(data);
        saveCoachData(data);
        var container = document.getElementById('es-cos-active-content');
        if (container && activeTab === 'formazione') {
          container.innerHTML = renderFormazione(data);
          bindAllEvents();
        }
        if (window.showToast) window.showToast('Modulo tattico aggiornato a ' + selMod.value, 'success');
      };
    }

    // Click sui Pin del Campo (Sostituzione o cambio ruolo dello slot)
    mount.querySelectorAll('.es-pitch-pin').forEach(function (pin) {
      pin.onclick = function () {
        var sIdx = parseInt(pin.getAttribute('data-player-pin-idx'), 10);
        if (!isNaN(sIdx)) {
          openSlotSwapModal(sIdx, data);
        }
      };

      // Drag and drop su pin
      pin.ondragover = function (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        pin.style.transform = 'translate(-50%, -50%) scale(1.15)';
        var b = pin.querySelector('.es-pitch-pin-badge');
        if (b) b.style.borderColor = '#00d978';
      };

      pin.ondragleave = function () {
        pin.style.transform = 'translate(-50%, -50%)';
        var b = pin.querySelector('.es-pitch-pin-badge');
        if (b) b.style.borderColor = '#16b9ff';
      };

      pin.ondrop = function (e) {
        e.preventDefault();
        pin.style.transform = 'translate(-50%, -50%)';
        var b = pin.querySelector('.es-pitch-pin-badge');
        if (b) b.style.borderColor = '#16b9ff';

        var benchId = e.dataTransfer.getData('text/plain');
        if (!benchId) return;

        var sIdx = parseInt(pin.getAttribute('data-player-pin-idx'), 10);
        if (isNaN(sIdx) || !data.top11[sIdx]) return;

        var bIdx = -1;
        for (var i = 0; i < (data.panchina || []).length; i++) {
          if (String(data.panchina[i].id) === String(benchId)) {
            bIdx = i;
            break;
          }
        }
        if (bIdx === -1) return;

        var subIn = data.panchina[bIdx];
        var subOut = data.top11[sIdx];

        data.top11[sIdx] = {
          id: subIn.id,
          num: subIn.num,
          name: subIn.name,
          pos: subOut.pos || subIn.pos,
          roleName: subOut.roleName,
          originalRole: subIn.role,
          rating: subIn.rating || '--'
        };

        data.panchina.splice(bIdx, 1);
        data.panchina.push({
          id: subOut.id,
          num: subOut.num,
          name: subOut.name,
          pos: getShortRole(subOut.originalRole || subOut.pos),
          role: subOut.originalRole || subOut.pos,
          status: 'disp',
          birth: subOut.birth || '--'
        });

        saveCoachData(data);
        var container = document.getElementById('es-cos-active-content');
        if (container && activeTab === 'formazione') {
          container.innerHTML = renderFormazione(data);
          bindAllEvents();
        }
        if (window.showToast) window.showToast('Sostituzione rapida: entra #' + subIn.num + ' ' + subIn.name, 'success');
      };
    });

    // Dragstart sulle card della panchina
    mount.querySelectorAll('.es-bench-card').forEach(function (card) {
      card.ondragstart = function (e) {
        var bId = card.getAttribute('data-bench-id');
        e.dataTransfer.setData('text/plain', bId);
        e.dataTransfer.effectAllowed = 'move';
      };
    });

    // Pulsante "In Campo ->" sulle card della panchina
    mount.querySelectorAll('.es-bench-assign-btn').forEach(function (btn) {
      btn.onclick = function (e) {
        e.stopPropagation();
        var bId = btn.getAttribute('data-assign-bench-id');
        if (bId) {
          openBenchAssignModal(bId, data);
        }
      };
    });

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

    // Aggiungi Calciatore Modal
    var btnAddP = mount.querySelector('#btn-add-player-modal');
    if (btnAddP) {
      btnAddP.onclick = function () {
        openModal('Tesseramento Nuovo Calciatore',
          '<form id="form-modal-add-p" style="display:flex; flex-direction:column; gap:0.9rem;">' +
            '<div style="display:flex; flex-direction:column; gap:0.35rem;">' +
              '<label style="font-size:0.8rem; font-weight:800; color:#8da8bc;">Nome e Cognome *</label>' +
              '<input type="text" id="inp-p-name" required placeholder="Es. Marco Bellini" style="background:#071522; border:1px solid #12344a; color:#f3f8fc; padding:0.6rem; border-radius:6px; font-size:0.85rem;">' +
            '</div>' +
            '<div style="display:grid; grid-template-columns:1fr 1fr; gap:0.9rem;">' +
              '<div style="display:flex; flex-direction:column; gap:0.35rem;">' +
                '<label style="font-size:0.8rem; font-weight:800; color:#8da8bc;">Numero Maglia *</label>' +
                '<input type="number" id="inp-p-num" value="' + (data.roster.length + 1) + '" min="1" max="99" required style="background:#071522; border:1px solid #12344a; color:#f3f8fc; padding:0.6rem; border-radius:6px; font-size:0.85rem;">' +
              '</div>' +
              '<div style="display:flex; flex-direction:column; gap:0.35rem;">' +
                '<label style="font-size:0.8rem; font-weight:800; color:#8da8bc;">Ruolo *</label>' +
                '<select id="inp-p-role" style="background:#071522; border:1px solid #12344a; color:#f3f8fc; padding:0.6rem; border-radius:6px; font-size:0.85rem;">' +
                  '<option>Portiere</option>' +
                  '<option>Difensore Centrale</option>' +
                  '<option>Terzino Destro</option>' +
                  '<option>Terzino Sinistro</option>' +
                  '<option>Mediano</option>' +
                  '<option>Mezzala</option>' +
                  '<option>Trequartista</option>' +
                  '<option>Ala Destra</option>' +
                  '<option>Ala Sinistra</option>' +
                  '<option>Punta Centrale</option>' +
                '</select>' +
              '</div>' +
            '</div>' +
            '<div style="display:grid; grid-template-columns:1fr 1fr; gap:0.9rem;">' +
              '<div style="display:flex; flex-direction:column; gap:0.35rem;">' +
                '<label style="font-size:0.8rem; font-weight:800; color:#8da8bc;">Data di nascita *</label>' +
                '<input type="date" id="inp-p-dob" required style="color-scheme:dark; background:#071522; border:1px solid #12344a; color:#f3f8fc; padding:0.6rem; border-radius:6px; font-size:0.85rem;">' +
              '</div>' +
              '<div style="display:flex; flex-direction:column; gap:0.35rem;">' +
                '<label style="font-size:0.8rem; font-weight:800; color:#8da8bc;">Luogo di Nascita *</label>' +
                '<input type="text" id="inp-p-pob" required placeholder="Es. Foggia (FG)" style="background:#071522; border:1px solid #12344a; color:#f3f8fc; padding:0.6rem; border-radius:6px; font-size:0.85rem;">' +
              '</div>' +
            '</div>' +
            '<div style="display:grid; grid-template-columns:1fr 1fr; gap:0.9rem;">' +
              '<div style="display:flex; flex-direction:column; gap:0.35rem;">' +
                '<label style="font-size:0.8rem; font-weight:800; color:#8da8bc;">Codice Fiscale *</label>' +
                '<input type="text" id="inp-p-cf" required placeholder="Es. BLLMRC03D14D643X" maxlength="16" oninput="this.value=this.value.toUpperCase()" style="background:#071522; border:1px solid #12344a; color:#f3f8fc; padding:0.6rem; border-radius:6px; font-size:0.85rem; text-transform:uppercase; font-family:monospace;">' +
              '</div>' +
              '<div style="display:flex; flex-direction:column; gap:0.35rem;">' +
                '<label style="font-size:0.8rem; font-weight:800; color:#8da8bc;">Email ( Opzionale )</label>' +
                '<input type="email" id="inp-p-email" placeholder="Es. calciatore@email.it" style="background:#071522; border:1px solid #12344a; color:#f3f8fc; padding:0.6rem; border-radius:6px; font-size:0.85rem;">' +
              '</div>' +
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
            var dob = document.getElementById('inp-p-dob') ? document.getElementById('inp-p-dob').value : '';
            var pob = document.getElementById('inp-p-pob') ? document.getElementById('inp-p-pob').value.trim() : '';
            var cf = document.getElementById('inp-p-cf') ? document.getElementById('inp-p-cf').value.trim().toUpperCase() : '';
            var email = document.getElementById('inp-p-email') ? document.getElementById('inp-p-email').value.trim() : '';

            var birthYear = 2003;
            if (dob) {
              var d = new Date(dob);
              if (!isNaN(d.getFullYear())) birthYear = d.getFullYear();
            }

            var nameParts = name.split(/\s+/);
            var nome = nameParts[0] || '';
            var cognome = nameParts.slice(1).join(' ') || '';

            var newPlayer = {
              id: 'p-' + Date.now(),
              num: num,
              name: name,
              nome: nome,
              cognome: cognome,
              role: role,
              birth: birthYear,
              data_nascita: dob,
              luogo_nascita: pob,
              codice_fiscale: cf,
              email: email,
              status: 'disp',
              app: 0,
              load: '8.5 km',
              acwr: '1.02'
            };

            data.roster.push(newPlayer);
            saveCoachData(data);

            if (window.EliseeSupabase && typeof window.EliseeSupabase.addCalciatore === 'function') {
              window.EliseeSupabase.addCalciatore(data.clubId || null, newPlayer).catch(function (e) {
                console.warn('[EliseeCoachDash] Salvataggio Supabase:', e);
              });
            }

            closeModal();
            var container = document.getElementById('es-cos-active-content');
            if (container && activeTab === 'rosa') {
              container.innerHTML = renderRosa(data);
              bindAllEvents();
            } else {
              renderHub();
            }
            if (window.showToast) window.showToast('Calciatore tesserato con successo!', 'success');
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

    // Upload GPS Telemetria
    var btnUploadGps = mount.querySelector('#btn-upload-gps-modal');
    if (btnUploadGps) {
      btnUploadGps.onclick = function () {
        var entId = (data.ultimaSessione && data.ultimaSessione.id) || 'allenamento-current';
        openStaffUploadModal('gps', entId, 'allenamento', 'Carica Telemetria GPS (Bucket: staff-allegati)');
      };
    }
    mount.querySelectorAll('[data-upload-gps-tr]').forEach(function (btn) {
      btn.onclick = function () {
        var trId = btn.getAttribute('data-upload-gps-tr') || 'seduta-campo';
        openStaffUploadModal('gps', trId, 'allenamento', 'Carica File GPS per Seduta');
      };
    });

    // ============================================================
    // GESTIONE EVENTI LAVAGNA TATTICA INTERATTIVA
    // ============================================================
    var selBoardMod = mount.querySelector('#sel-board-modulo');
    if (selBoardMod) {
      selBoardMod.onchange = function () {
        changeTacticalBoardModulo(data, selBoardMod.value);
        var container = document.getElementById('es-cos-active-content');
        if (container && activeTab === 'tattica') {
          container.innerHTML = renderTattica(data);
          bindAllEvents();
        }
        if (window.showToast) window.showToast('Modulo lavagna impostato a ' + selBoardMod.value, 'info');
      };
    }

    var btnSyncBoardXi = mount.querySelector('#btn-sync-board-xi');
    if (btnSyncBoardXi) {
      btnSyncBoardXi.onclick = function () {
        var tb = data.tacticalBoard || {};
        var hasDrawings = (tb.arrows && tb.arrows.length > 0) || (tb.zones && tb.zones.length > 0);
        if (hasDrawings) {
          if (!confirm('Sincronizzare dall\'XI Ufficiale sovrascriverà la lavagna e resetterà i tracciati non salvati. Continuare?')) return;
        }
        syncBoardFromOfficialXI(data);
        tb.arrows = [];
        tb.zones = [];
        saveCoachData(data);
        var container = document.getElementById('es-cos-active-content');
        if (container && activeTab === 'tattica') {
          container.innerHTML = renderTattica(data);
          bindAllEvents();
        }
        if (window.showToast) window.showToast('XI Ufficiale e modulo sincronizzati sulla lavagna!', 'success');
      };
    }

    var btnResetBoard = mount.querySelector('#btn-reset-board');
    if (btnResetBoard) {
      btnResetBoard.onclick = function () {
        if (!data.tacticalBoard) data.tacticalBoard = {};
        var tb = data.tacticalBoard;
        var modKey = tb.modulo || '4-3-3';
        var modDef = MODULI_TATTICI[modKey] || MODULI_TATTICI['4-3-3'];
        for (var s = 0; s < 11; s++) {
          var slot = modDef.slots[s];
          if (tb.pins && tb.pins[s] && slot) {
            tb.pins[s].x = slot.x;
            tb.pins[s].y = slot.y;
            tb.pins[s].pos = slot.ruolo;
          }
        }
        if (tb.pins && tb.pins[11]) {
          tb.pins[11].x = 50;
          tb.pins[11].y = 42;
        }
        tb.arrows = [];
        tb.zones = [];
        saveCoachData(data);
        var container = document.getElementById('es-cos-active-content');
        if (container && activeTab === 'tattica') {
          container.innerHTML = renderTattica(data);
          bindAllEvents();
        }
        if (window.showToast) window.showToast('Lavagna ripristinata alle posizioni base del modulo ' + modKey, 'info');
      };
    }

    var btnSaveBoardScheme = mount.querySelector('#btn-save-board-scheme');
    if (btnSaveBoardScheme) {
      btnSaveBoardScheme.onclick = function () {
        var tb = data.tacticalBoard || {};
        var curMod = tb.modulo || '4-3-3';
        var nowStr = new Date().toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }) + ' ' + new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        var defaultName = 'Schema ' + curMod + ' · ' + nowStr;

        openModal('Salva Schema Tattico',
          '<form id="form-save-scheme" style="display:flex; flex-direction:column; gap:1rem;">' +
            '<div style="display:flex; flex-direction:column; gap:0.35rem;">' +
              '<label style="font-size:0.8rem; font-weight:800; color:#8da8bc;">Nome Schema *</label>' +
              '<input type="text" id="inp-scheme-name" value="' + esc(defaultName) + '" required style="background:#071522; border:1px solid #12344a; color:#f3f8fc; padding:0.6rem; border-radius:6px; font-size:0.85rem;">' +
            '</div>' +
            '<div style="font-size:0.75rem; color:#8da8bc; background:#040912; border:1px solid #12344a; padding:0.65rem; border-radius:6px;">' +
              'Verranno memorizzati: modulo <b>' + esc(curMod) + '</b>, posizioni dei calciatori, pallone, ' + (tb.arrows ? tb.arrows.length : 0) + ' frecce e ' + (tb.zones ? tb.zones.length : 0) + ' zone tattiche.' +
            '</div>' +
            '<div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:0.5rem;">' +
              '<button type="button" class="es-btn-cos-sec" id="btn-close-modal">Annulla</button>' +
              '<button type="submit" class="es-btn-cos-primary">Salva Schema</button>' +
            '</div>' +
          '</form>'
        );

        var form = document.getElementById('form-save-scheme');
        if (form) {
          form.onsubmit = function (e) {
            e.preventDefault();
            var name = document.getElementById('inp-scheme-name').value.trim() || defaultName;
            var schemaObj = {
              id: 'sch-' + Date.now(),
              nome: name,
              modulo: curMod,
              pins: JSON.parse(JSON.stringify(tb.pins || [])),
              arrows: JSON.parse(JSON.stringify(tb.arrows || [])),
              zones: JSON.parse(JSON.stringify(tb.zones || [])),
              data: nowStr
            };

            tb.schemiSalvati = tb.schemiSalvati || [];
            tb.schemiSalvati.unshift(schemaObj);
            try {
              localStorage.setItem('elisee_schemi_tattici', JSON.stringify(tb.schemiSalvati));
            } catch (_) {}
            saveCoachData(data);

            if (window.EliseeSupabase && typeof window.EliseeSupabase.saveSchemaTattico === 'function') {
              var clubId = data.clubId || (_coachLiveData && _coachLiveData.clubId) || 'f0661a00-0000-4000-8000-000000000001';
              window.EliseeSupabase.saveSchemaTattico(clubId, schemaObj).catch(function (err) {
                console.warn('[EliseeCoachDash] Salvataggio Supabase schema:', err);
              });
            }

            closeModal();
            var container = document.getElementById('es-cos-active-content');
            if (container && activeTab === 'tattica') {
              container.innerHTML = renderTattica(data);
              bindAllEvents();
            }
            if (window.showToast) window.showToast('Schema "' + name + '" salvato con successo!', 'success');
          };
        }
      };
    }

    var selSavedSchemes = mount.querySelector('#sel-board-saved-schemes');
    if (selSavedSchemes) {
      selSavedSchemes.onchange = function () {
        var sIdx = parseInt(selSavedSchemes.value, 10);
        if (isNaN(sIdx)) return;
        var tb = data.tacticalBoard;
        if (!tb || !tb.schemiSalvati || !tb.schemiSalvati[sIdx]) return;
        var s = tb.schemiSalvati[sIdx];
        tb.modulo = s.modulo;
        if (Array.isArray(s.pins)) tb.pins = JSON.parse(JSON.stringify(s.pins));
        if (Array.isArray(s.arrows)) tb.arrows = JSON.parse(JSON.stringify(s.arrows));
        if (Array.isArray(s.zones)) tb.zones = JSON.parse(JSON.stringify(s.zones));
        saveCoachData(data);

        var container = document.getElementById('es-cos-active-content');
        if (container && activeTab === 'tattica') {
          container.innerHTML = renderTattica(data);
          bindAllEvents();
        }
        if (window.showToast) window.showToast('Caricato schema: ' + s.nome, 'success');
      };
    }

    // Strumenti Tattici
    mount.querySelectorAll('[data-board-tool]').forEach(function (btn) {
      btn.onclick = function () {
        var tool = btn.getAttribute('data-board-tool');
        if (!data.tacticalBoard) data.tacticalBoard = {};
        data.tacticalBoard.activeTool = tool;
        mount.querySelectorAll('[data-board-tool]').forEach(function (b) {
          b.classList.toggle('is-active', b === btn);
        });
        var pitch = document.getElementById('es-tactical-pitch');
        if (pitch) {
          pitch.style.cursor = tool === 'move' ? 'default' : 'crosshair';
        }
      };
    });

    function doUndoTacticalDrawing() {
      var tb = data.tacticalBoard;
      if (!tb) return;
      var hasArrows = tb.arrows && tb.arrows.length > 0;
      var hasZones = tb.zones && tb.zones.length > 0;
      if (!hasArrows && !hasZones) return;

      var lastArrTime = hasArrows ? (tb.arrows[tb.arrows.length - 1].createdAt || 0) : -1;
      var lastZoneTime = hasZones ? (tb.zones[tb.zones.length - 1].createdAt || 0) : -1;

      if (lastArrTime >= lastZoneTime) {
        tb.arrows.pop();
      } else {
        tb.zones.pop();
      }
      saveCoachData(data);
      var container = document.getElementById('es-cos-active-content');
      if (container && activeTab === 'tattica') {
        container.innerHTML = renderTattica(data);
        bindAllEvents();
      }
    }

    var btnUndoDraw = mount.querySelector('#btn-undo-drawing');
    if (btnUndoDraw) {
      btnUndoDraw.onclick = doUndoTacticalDrawing;
    }

    // Scorciatoia da tastiera globale Ctrl+Z per Undo Tratto
    if (!window._esTacticalKeyBound) {
      window._esTacticalKeyBound = true;
      window.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z') && !e.shiftKey) {
          if (activeTab === 'tattica') {
            var tag = (document.activeElement && document.activeElement.tagName) || '';
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
            e.preventDefault();
            doUndoTacticalDrawing();
          }
        }
      });
    }

    var btnClearDraw = mount.querySelector('#btn-clear-drawings');
    if (btnClearDraw) {
      btnClearDraw.onclick = function () {
        var tb = data.tacticalBoard;
        if (!tb) return;
        tb.arrows = [];
        tb.zones = [];
        saveCoachData(data);
        var container = document.getElementById('es-cos-active-content');
        if (container && activeTab === 'tattica') {
          container.innerHTML = renderTattica(data);
          bindAllEvents();
        }
        if (window.showToast) window.showToast('Tracciati e frecce rimossi dalla lavagna', 'info');
      };
    }

    // Interazione su Campo: Drag & Drop Pedine e Tracciamento Frecce/Zone
    var pitchEl = mount.querySelector('#es-tactical-pitch');
    if (pitchEl) {
      var tb = data.tacticalBoard || {};
      var activeTool = tb.activeTool || 'move';
      pitchEl.style.cursor = activeTool === 'move' ? 'default' : 'crosshair';

      var draggingPin = null;
      var dragIdx = null;
      var drawStart = null;

      function getPitchCoords(e) {
        var rect = pitchEl.getBoundingClientRect();
        var clientX = e.clientX != null ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        var clientY = e.clientY != null ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
        var x = ((clientX - rect.left) / rect.width) * 100;
        var y = ((clientY - rect.top) / rect.height) * 100;
        return {
          x: Math.min(96, Math.max(4, Math.round(x * 10) / 10)),
          y: Math.min(96, Math.max(4, Math.round(y * 10) / 10))
        };
      }

      // Pointer down sui Pin (Calciatori e Palla)
      pitchEl.querySelectorAll('.es-tactical-pin-drag').forEach(function (pinEl) {
        pinEl.onpointerdown = function (e) {
          if (data.tacticalBoard && data.tacticalBoard.activeTool !== 'move') return;
          e.stopPropagation();
          draggingPin = pinEl;
          dragIdx = parseInt(pinEl.getAttribute('data-board-pin-idx'), 10);
          pinEl.classList.add('is-dragging');
          if (typeof pinEl.setPointerCapture === 'function') {
            try { pinEl.setPointerCapture(e.pointerId); } catch (_) {}
          }
        };

        pinEl.onpointermove = function (e) {
          if (!draggingPin || draggingPin !== pinEl) return;
          e.preventDefault();
          var coords = getPitchCoords(e);
          pinEl.style.left = coords.x + '%';
          pinEl.style.top = coords.y + '%';
        };

        pinEl.onpointerup = function (e) {
          if (!draggingPin || draggingPin !== pinEl) return;
          e.preventDefault();
          var coords = getPitchCoords(e);
          pinEl.classList.remove('is-dragging');
          if (dragIdx !== null && data.tacticalBoard && data.tacticalBoard.pins && data.tacticalBoard.pins[dragIdx]) {
            data.tacticalBoard.pins[dragIdx].x = coords.x;
            data.tacticalBoard.pins[dragIdx].y = coords.y;
            saveCoachData(data);
          }
          draggingPin = null;
          dragIdx = null;
        };

        pinEl.onpointercancel = function () {
          if (draggingPin === pinEl) {
            pinEl.classList.remove('is-dragging');
            draggingPin = null;
            dragIdx = null;
          }
        };
      });

      // Pointer down per disegnare freccia o zona sul pitch con anteprima live
      pitchEl.onpointerdown = function (e) {
        var curTool = (data.tacticalBoard && data.tacticalBoard.activeTool) || 'move';
        if (curTool === 'move') return;
        drawStart = getPitchCoords(e);
      };

      pitchEl.onpointermove = function (e) {
        if (!drawStart) return;
        var curTool = (data.tacticalBoard && data.tacticalBoard.activeTool) || 'move';
        if (curTool === 'move') return;
        var drawEnd = getPitchCoords(e);
        var previewG = document.getElementById('es-tactical-live-preview');
        if (!previewG) return;
        if (curTool === 'arrow-run' || curTool === 'arrow-pass') {
          var isRun = curTool === 'arrow-run';
          var col = isRun ? '#ffd21a' : '#38bdf8';
          var mId = isRun ? 'arr-marker-yellow' : 'arr-marker-blue';
          previewG.innerHTML = '<line x1="' + drawStart.x + '%" y1="' + drawStart.y + '%" x2="' + drawEnd.x + '%" y2="' + drawEnd.y + '%" stroke="' + col + '" stroke-width="3" stroke-linecap="round" marker-end="url(#' + mId + ')" ' + (isRun ? '' : 'stroke-dasharray="6,4"') + ' />';
        } else if (curTool === 'zone') {
          var zx = Math.min(drawStart.x, drawEnd.x);
          var zy = Math.min(drawStart.y, drawEnd.y);
          var zw = Math.max(2, Math.abs(drawEnd.x - drawStart.x));
          var zh = Math.max(2, Math.abs(drawEnd.y - drawStart.y));
          previewG.innerHTML = '<rect x="' + zx + '%" y="' + zy + '%" width="' + zw + '%" height="' + zh + '%" fill="rgba(239,68,68,0.22)" stroke="#ef4444" stroke-width="2" stroke-dasharray="4,3" rx="6" />';
        }
      };

      pitchEl.onpointerup = function (e) {
        var previewG = document.getElementById('es-tactical-live-preview');
        if (previewG) previewG.innerHTML = '';
        if (!drawStart) return;
        var curTool = (data.tacticalBoard && data.tacticalBoard.activeTool) || 'move';
        if (curTool === 'move') { drawStart = null; return; }
        var drawEnd = getPitchCoords(e);

        var dist = Math.hypot(drawEnd.x - drawStart.x, drawEnd.y - drawStart.y);
        if (dist > 3) {
          var now = Date.now();
          if (curTool === 'arrow-run' || curTool === 'arrow-pass') {
            data.tacticalBoard.arrows = data.tacticalBoard.arrows || [];
            data.tacticalBoard.arrows.push({
              id: 'arr-' + now,
              createdAt: now,
              x1: drawStart.x,
              y1: drawStart.y,
              x2: drawEnd.x,
              y2: drawEnd.y,
              tipo: curTool === 'arrow-run' ? 'corsa' : 'passaggio'
            });
            saveCoachData(data);
          } else if (curTool === 'zone') {
            data.tacticalBoard.zones = data.tacticalBoard.zones || [];
            var zx = Math.min(drawStart.x, drawEnd.x);
            var zy = Math.min(drawStart.y, drawEnd.y);
            var zw = Math.max(8, Math.abs(drawEnd.x - drawStart.x));
            var zh = Math.max(6, Math.abs(drawEnd.y - drawStart.y));
            data.tacticalBoard.zones.push({
              id: 'z-' + now,
              createdAt: now,
              x: zx,
              y: zy,
              w: zw,
              h: zh,
              label: 'Zona Pressing'
            });
            saveCoachData(data);
          }

          var container = document.getElementById('es-cos-active-content');
          if (container && activeTab === 'tattica') {
            container.innerHTML = renderTattica(data);
            bindAllEvents();
          }
        }
        drawStart = null;
      };

      pitchEl.onpointercancel = function () {
        var previewG = document.getElementById('es-tactical-live-preview');
        if (previewG) previewG.innerHTML = '';
        drawStart = null;
      };
    }

    // ============================================================
    // GESTIONE EVENTI ANALISI AVVERSARIO & DOSSIER TATTICO
    // ============================================================
    var selDossierMatch = mount.querySelector('#sel-dossier-match');
    if (selDossierMatch) {
      selDossierMatch.onchange = function () {
        data.selectedDossierMatchId = selDossierMatch.value;
        saveCoachData(data);
        var container = document.getElementById('es-cos-active-content');
        if (container && activeTab === 'analisi_avversario') {
          container.innerHTML = renderAnalisiAvversario(data);
          bindAllEvents();
        }
      };
    }

    mount.querySelectorAll('[data-edit-dossier-field]').forEach(function (card) {
      card.onclick = function () {
        var field = card.getAttribute('data-edit-dossier-field');
        openDossierEditModal(data, data.selectedDossierMatchId || 'next-cerignola', field);
      };
    });

    var btnEditAllDossier = mount.querySelector('#btn-edit-all-dossier');
    if (btnEditAllDossier) {
      btnEditAllDossier.onclick = function () {
        openDossierEditModal(data, data.selectedDossierMatchId || 'next-cerignola', null);
      };
    }

    // Upload Video Analisi (Unico CTA nello stato vuoto o bottone in testata)
    mount.querySelectorAll('#btn-upload-video-analysis, #btn-open-video-upload-direct').forEach(function (btn) {
      btn.onclick = function () {
        var mId = data.selectedDossierMatchId || (data.nextMatch && data.nextMatch.id) || 'match-next';
        openStaffUploadModal('video_analisi', mId, 'partita', 'Carica Video Analisi / Dossier Avversario');
      };
    });

    // Upload GPS Telemetria
    var btnUploadGps = mount.querySelector('#btn-upload-gps-modal');
    if (btnUploadGps) {
      btnUploadGps.onclick = function () {
        var entId = (data.ultimaSessione && data.ultimaSessione.id) || 'allenamento-current';
        openStaffUploadModal('gps', entId, 'allenamento', 'Carica Telemetria GPS (Bucket: staff-allegati)');
      };
    }
    mount.querySelectorAll('[data-upload-gps-tr]').forEach(function (btn) {
      btn.onclick = function () {
        var trId = btn.getAttribute('data-upload-gps-tr') || 'seduta-campo';
        openStaffUploadModal('gps', trId, 'allenamento', 'Carica File GPS per Seduta');
      };
    });

    // Upload Report Staff
    var btnUploadRep = mount.querySelector('#btn-upload-staff-report-modal');
    if (btnUploadRep) {
      btnUploadRep.onclick = function () {
        var cId = (_coachLiveData && _coachLiveData.clubId) || 'club-staff';
        openStaffUploadModal('staff_tecnico', cId, 'club', 'Carica Report Staff su Storage Cloud');
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

  function openDossierEditModal(data, matchId, focusField) {
    data.dossierByMatch = data.dossierByMatch || {};
    var cur = data.dossierByMatch[matchId] || {
      puntiForza: 'Transizioni rapide sulle corsie laterali e pericolosità sui piazzati.',
      puntiDeboli: 'Spazi concessi dietro i terzini quando attaccano alti; difficoltà nel possesso sotto pressing.',
      giocatoriChiave: 'Numero 9 (punta strutturata) e numero 10 (regista di centrocampo).',
      palleInattive: 'Corner a rientrare sul primo palo; schema a blocchi per inserimento del centrale.'
    };

    var content =
      '<form id="form-edit-dossier" style="display:flex; flex-direction:column; gap:0.9rem;">' +
        '<div style="display:flex; justify-content:space-between; align-items:center; background:#040912; border:1px solid #12344a; padding:0.6rem 0.85rem; border-radius:6px;">' +
          '<div style="font-size:0.75rem; color:#8da8bc;">Compilazione Dossier Tattico per Gara</div>' +
          '<button type="button" id="btn-ia-suggest-dossier" style="background:rgba(22,185,255,0.12); border:1px solid #16b9ff; color:#16b9ff; font-size:0.75rem; font-weight:800; padding:0.35rem 0.75rem; border-radius:5px; cursor:pointer;">' +
            '✨ Suggerisci con IA' +
          '</button>' +
        '</div>' +
        '<div style="display:flex; flex-direction:column; gap:0.3rem;">' +
          '<label style="font-size:0.78rem; font-weight:800; color:#00d978;">Punti di Forza</label>' +
          '<textarea id="inp-dos-forza" rows="2" style="background:#071522; border:1px solid #12344a; color:#f3f8fc; padding:0.5rem; border-radius:6px; font-size:0.82rem;">' + esc(cur.puntiForza) + '</textarea>' +
        '</div>' +
        '<div style="display:flex; flex-direction:column; gap:0.3rem;">' +
          '<label style="font-size:0.78rem; font-weight:800; color:#ff4d5a;">Punti Deboli</label>' +
          '<textarea id="inp-dos-deboli" rows="2" style="background:#071522; border:1px solid #12344a; color:#f3f8fc; padding:0.5rem; border-radius:6px; font-size:0.82rem;">' + esc(cur.puntiDeboli) + '</textarea>' +
        '</div>' +
        '<div style="display:flex; flex-direction:column; gap:0.3rem;">' +
          '<label style="font-size:0.78rem; font-weight:800; color:#ffd21a;">Giocatori Chiave</label>' +
          '<textarea id="inp-dos-chiave" rows="2" style="background:#071522; border:1px solid #12344a; color:#f3f8fc; padding:0.5rem; border-radius:6px; font-size:0.82rem;">' + esc(cur.giocatoriChiave) + '</textarea>' +
        '</div>' +
        '<div style="display:flex; flex-direction:column; gap:0.3rem;">' +
          '<label style="font-size:0.78rem; font-weight:800; color:#16b9ff;">Palle Inattive</label>' +
          '<textarea id="inp-dos-piazzati" rows="2" style="background:#071522; border:1px solid #12344a; color:#f3f8fc; padding:0.5rem; border-radius:6px; font-size:0.82rem;">' + esc(cur.palleInattive) + '</textarea>' +
        '</div>' +
        '<div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:0.5rem;">' +
          '<button type="button" class="es-btn-cos-sec" id="btn-close-modal">Annulla</button>' +
          '<button type="submit" class="es-btn-cos-primary">Salva Dossier</button>' +
        '</div>' +
      '</form>';

    openModal('Modifica Dossier Tattico', content);

    if (focusField) {
      var map = { puntiForza: 'inp-dos-forza', puntiDeboli: 'inp-dos-deboli', giocatoriChiave: 'inp-dos-chiave', palleInattive: 'inp-dos-piazzati' };
      var fId = map[focusField];
      if (fId) {
        var el = document.getElementById(fId);
        if (el) el.focus();
      }
    }

    var btnIa = document.getElementById('btn-ia-suggest-dossier');
    if (btnIa) {
      btnIa.onclick = function () {
        document.getElementById('inp-dos-forza').value = 'Densità centrale nel primo tempo; raddoppi sistematici sulla mezzala avversaria e ripartenze a tre.';
        document.getElementById('inp-dos-deboli').value = 'Calo di intensità atletica dopo il 65°; vulnerabili nei cambi di gioco rapidi e nei cross tesi dalla trequarti.';
        document.getElementById('inp-dos-chiave').value = 'Attaccante mancino con spiccata abilità nei tiri dalla distanza e mediano interdittore falloso.';
        document.getElementById('inp-dos-piazzati').value = 'Marcatura a uomo mista a zona sul dischetto; barriera fragile sui tiri a giro da destra.';
        if (window.showToast) window.showToast('Analisi generata dall\'assistente IA!', 'info');
      };
    }

    var form = document.getElementById('form-edit-dossier');
    if (form) {
      form.onsubmit = function (e) {
        e.preventDefault();
        var updated = {
          puntiForza: document.getElementById('inp-dos-forza').value.trim(),
          puntiDeboli: document.getElementById('inp-dos-deboli').value.trim(),
          giocatoriChiave: document.getElementById('inp-dos-chiave').value.trim(),
          palleInattive: document.getElementById('inp-dos-piazzati').value.trim()
        };

        data.dossierByMatch[matchId] = updated;
        saveCoachData(data);

        if (window.EliseeSupabase && typeof window.EliseeSupabase.saveDossierTattico === 'function') {
          var clubId = data.clubId || (_coachLiveData && _coachLiveData.clubId) || 'f0661a00-0000-4000-8000-000000000001';
          window.EliseeSupabase.saveDossierTattico(clubId, matchId, updated).catch(function (err) {
            console.warn('[EliseeCoachDash] Salvataggio Supabase dossier:', err);
          });
        }

        closeModal();
        var container = document.getElementById('es-cos-active-content');
        if (container && activeTab === 'analisi_avversario') {
          container.innerHTML = renderAnalisiAvversario(data);
          bindAllEvents();
        }
        if (window.showToast) window.showToast('Dossier Tattico salvato con successo!', 'success');
      };
    }
  }

  function openStaffUploadModal(categoria, entitaId, entitaTipo, title) {
    categoria = categoria || 'gps';
    entitaId = entitaId || 'default-entity';
    entitaTipo = entitaTipo || (categoria === 'gps' ? 'allenamento' : (categoria === 'video_analisi' ? 'partita' : 'giocatore'));
    title = title || 'Carica File su Supabase Storage (staff-allegati)';

    var acceptMap = {
      gps: '.csv,.json,.fit,.gpx,.txt',
      video_analisi: '.mp4,.webm,.mov,.pdf',
      staff_tecnico: '.pdf,.docx,.doc,.png,.jpg,.jpeg'
    };

    var content =
      '<form id="form-upload-cloud" style="display:flex; flex-direction:column; gap:1rem;">' +
        '<div style="background:#040912; border:1px solid #12344a; border-radius:6px; padding:0.85rem; font-size:0.8rem; color:#8da8bc;">' +
          'I file vengono caricati direttamente nel bucket cloud <b style="color:#16b9ff;">staff-allegati</b> e collegati in tabella <code>file_allegati</code> con permessi di accesso riservati.' +
        '</div>' +
        '<div style="display:flex; flex-direction:column; gap:0.35rem;">' +
          '<label style="font-size:0.8rem; font-weight:800; color:#8da8bc;">Seleziona File *</label>' +
          '<input type="file" id="inp-upload-file" required accept="' + (acceptMap[categoria] || '*/*') + '" style="background:#071522; border:1px solid #12344a; color:#f3f8fc; padding:0.6rem; border-radius:6px;">' +
        '</div>' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
          '<div style="display:flex; flex-direction:column; gap:0.35rem;">' +
            '<label style="font-size:0.8rem; font-weight:800; color:#8da8bc;">Categoria</label>' +
            '<input type="text" id="inp-upload-cat" value="' + esc(categoria) + '" readonly style="background:#040912; border:1px solid #12344a; color:#16b9ff; padding:0.6rem; border-radius:6px; font-weight:700;">' +
          '</div>' +
          '<div style="display:flex; flex-direction:column; gap:0.35rem;">' +
            '<label style="font-size:0.8rem; font-weight:800; color:#8da8bc;">Visibilità</label>' +
            '<select id="inp-upload-vis" style="background:#071522; border:1px solid #12344a; color:#f3f8fc; padding:0.6rem; border-radius:6px;">' +
              '<option value="staff_tecnico">Staff Tecnico (Mister + Vice)</option>' +
              '<option value="tutti">Tutto lo Staff Societario</option>' +
              '<option value="medico">Staff Medico / Sanitario</option>' +
            '</select>' +
          '</div>' +
        '</div>' +
        '<div id="upload-cloud-status" style="display:none; font-size:0.82rem; font-weight:700; color:#16b9ff; text-align:center; padding:0.5rem;"></div>' +
        '<div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:0.5rem;">' +
          '<button type="button" class="es-btn-cos-sec" id="btn-close-modal">Annulla</button>' +
          '<button type="submit" class="es-btn-cos-primary" id="btn-submit-upload"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Avvia Upload Cloud</button>' +
        '</div>' +
      '</form>';

    openModal(title, content);

    var form = document.getElementById('form-upload-cloud');
    if (!form) return;

    form.onsubmit = async function (e) {
      e.preventDefault();
      var fileInput = document.getElementById('inp-upload-file');
      if (!fileInput || !fileInput.files || !fileInput.files[0]) return;
      var file = fileInput.files[0];
      var vis = document.getElementById('inp-upload-vis').value;
      var statusDiv = document.getElementById('upload-cloud-status');
      var submitBtn = document.getElementById('btn-submit-upload');

      if (statusDiv) {
        statusDiv.style.display = 'block';
        statusDiv.textContent = 'Caricamento file ' + file.name + ' nel bucket staff-allegati...';
      }
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.6';
      }

      try {
        var u = userObj();
        var clubId = (_coachLiveData && _coachLiveData.clubId) || (await window.EliseeSupabase.resolveClubId(u));
        var staffId = u.staffId || u.id || null;
        var visArr = vis === 'tutti' ? ['allenatore', 'vice_allenatore', 'medico', 'dirigenza'] : [vis];

        var upRes = await window.EliseeSupabase.uploadFileAllegato(clubId, categoria, entitaId, file, staffId, visArr);
        if (upRes.ok) {
          if (window.showToast) window.showToast('File caricato con successo su Supabase Storage!', 'success');
          closeModal();
          await syncLiveCoachData(null, true);
        } else {
          if (statusDiv) {
            statusDiv.style.color = '#ef4444';
            statusDiv.textContent = 'Errore upload: ' + (upRes.error || 'Impossibile completare');
          }
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
          }
        }
      } catch (err) {
        if (statusDiv) {
          statusDiv.style.color = '#ef4444';
          statusDiv.textContent = 'Errore: ' + err.message;
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.style.opacity = '1';
        }
      }
    };
  }

  function openModal(title, contentHtml) {
    closeModal();
    var modal = document.createElement('div');
    modal.id = 'es-cos-modal-box';
    modal.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.78); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; z-index:99999; padding:1rem;';
    modal.innerHTML =
      '<div style="background:#071522; border:1px solid #16b9ff; border-radius:10px; max-width:540px; width:100%; max-height:92vh; overflow-y:auto; padding:1.5rem; position:relative; box-shadow:0 12px 36px rgba(0,0,0,0.8);">' +
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
