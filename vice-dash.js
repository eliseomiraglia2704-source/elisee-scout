/* ============================================================
   ELISEE SCOUT — AREA VICE ALLENATORE
   VICE COACH TECHNICAL WORKSTATION — Football Technical Staff OS
   ============================================================ */
(function () {
  'use strict';

  var activeTab = 'identita'; // 'identita' | 'specializzazione' | 'workstation' | 'bozza_top11' | 'gps_heatmap' | 'squadra' | 'allenamenti' | 'lavagna'
  var activeWsFilter = 'all';
  var wsSearchQuery = '';

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

  function isVice(u) {
    u = u || userObj();
    var primary = String(u.staffRole || u.ruoloDettagliato || (u.staffProfile && u.staffProfile.fieldRole) || u.ruolo || u.role || '').trim().toLowerCase();
    return /in seconda|vice allenatore/.test(primary);
  }

  var _viceLiveData = null;
  var _isViceSyncing = false;

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

  async function syncLiveViceData(user, force) {
    if (_isViceSyncing && !force) return;
    _isViceSyncing = true;
    user = user || userObj();

    if (!window.EliseeSupabase) {
      _isViceSyncing = false;
      return;
    }

    try {
      var clubId = await window.EliseeSupabase.resolveClubId(user);
      var staffId = user.staffId || user.id || null;

      var res = await Promise.all([
        window.EliseeSupabase.getStaff(clubId, 'allenatore'),
        window.EliseeSupabase.getCaricoSettimanale(clubId),
        window.EliseeSupabase.getRosa(clubId),
        window.EliseeSupabase.getAllenamenti(clubId),
        window.EliseeSupabase.getReportStaff(clubId, staffId, 'vice_allenatore'),
        window.EliseeSupabase.getFileAllegati(clubId)
      ]);

      var coachStaff = res[0] || [];
      var carico = res[1] || { mediaSettimanale: 0, giorni: [], acwr: '1.00', stato: 'In attesa dati GPS' };
      var rosa = res[2] || [];
      var allenamenti = res[3] || [];
      var reports = res[4] || [];
      var allegati = res[5] || [];

      var liveMisterLink = (coachStaff && coachStaff.length > 0) ? {
        id: coachStaff[0].id,
        name: ((coachStaff[0].nome || '') + ' ' + (coachStaff[0].cognome || '')).trim() || 'Allenatore Capo',
        role: 'Allenatore Capo',
        patent: coachStaff[0].patentino || 'UEFA B',
        email: 'staff@elisee-scout.it',
        status: 'Collegato',
        lastSync: 'Sincronizzato'
      } : {
        id: 'coach-none',
        name: 'In attesa associazione Mister',
        role: 'Allenatore Capo',
        patent: 'UEFA B',
        email: '',
        status: 'Non connesso',
        lastSync: '--'
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
          status: isDisp ? 'disp' : 'diff',
          statoDettagliato: st,
          motivo: g.motivo_indisponibilita || '',
          rientro: g.data_rientro_prevista ? formatDate(g.data_rientro_prevista) : '',
          load: (carico.mediaSettimanale > 0 ? (carico.mediaSettimanale + '%') : '--'),
          acwr: carico.acwr || '1.00'
        };
      });

      var liveTrainings = allenamenti.map(function (tr) {
        return {
          id: tr.id,
          tipo: tr.tipo || 'Seduta Tecnica',
          data: formatDate(tr.data_ora),
          orario: formatTime(tr.data_ora),
          luogo: 'Centro Sportivo',
          desc: Array.isArray(tr.obiettivi) ? tr.obiettivi.join(', ') : (tr.obiettivi || ''),
          stato: tr.stato === 'completata' ? 'Completata' : 'In programma'
        };
      });

      _viceLiveData = {
        isLiveSupabase: true,
        clubId: clubId,
        clubName: user.squadra || user.club || 'Foggia City',
        categoria: user.categoria || 'Amatoriale · Foggia',
        viceName: [user.nome, user.cognome].filter(Boolean).join(' ').trim() || user.username || 'Paolo Gentile',
        viceRole: user.staffRole || 'Vice Allenatore / Staff Tecnico',
        matricola: user.matricola || 'FIGC-88210',
        patent: user.qualifica || 'UEFA B',
        misterLink: liveMisterLink,
        roster: liveRoster,
        trainingsList: liveTrainings,
        carico: carico,
        reports: reports,
        allegati: allegati,
        gpsData: {
          distanzaMedia: carico.mediaSettimanale > 0 ? (Math.round(carico.mediaSettimanale * 1.3) + ' km') : '--',
          piccoKmH: carico.mediaSettimanale > 0 ? '33.8 km/h' : '--',
          acwrSquadra: carico.acwr || '1.00',
          alertAffaticamento: carico.mediaSettimanale > 85 ? 'Rischio sovraccarico rilevato per ' + Math.round(liveRoster.length * 0.2) + ' calciatori. Consigliata seduta di scarico.' : (carico.mediaSettimanale > 0 ? 'Carico di lavoro ottimale e distribuito regolarmente nel microciclo.' : 'In attesa di dati GPS telemetrici registrati su Supabase.')
        }
      };

      var container = document.getElementById('es-vd-active-view');
      if (container) {
        syncLiveViceData(user);
    var data = getViceData();
        container.innerHTML = renderActiveVdTab(activeTab, data);
        bindVdEvents();
      }
    } catch (err) {
      console.warn('[ViceDash] Errore sync live Supabase:', err);
    } finally {
      _isViceSyncing = false;
    }
  }

  function getViceData() {
    var u = userObj();
    var def = {
      viceName: [u.nome, u.cognome].filter(Boolean).join(' ').trim() || u.username || 'Paolo Gentile',
      viceRole: 'Vice Allenatore / Staff Tecnico',
      patent: u.qualifica || (u.staffProfile && u.staffProfile.qualifica) || 'UEFA B',
      status: 'in_carica',
      clubName: u.squadra || 'ASD Carlentini',
      categoria: 'Serie D - Girone I',
      matricola: u.matricola || 'FIGC-88210',
      scadenzaTesseramento: '30/06/2027',
      sede: 'Carlentini (SR)',
      telefono: u.telefono || '+39 340 7654321',
      logoUrl: 'immagini/squadre-loghi/foggia-city.png',

      // Collegamento Diretto con l'Allenatore Capo
      misterLink: {
        id: 'coach-official-1',
        name: 'Elisee Miraglia',
        role: 'Allenatore Capo',
        patent: 'UEFA B',
        email: 'elisee.miraglia@elisee-scout.it',
        status: 'Collegato',
        lastSync: '14/09/2026 - 18:45'
      },

      // 4 Aree di Specializzazione Obbligatorie
      specializzazioni: [
        {
          id: 'sp-1',
          key: 'palle_inattive',
          nome: 'FASE PALLE INATTIVE',
          sub: 'Corner & Punizioni',
          livello: 'Top Specialist UEFA',
          icon: '🎯',
          schedeCreate: 8,
          schedeApprovate: 7,
          seduteCollegate: 5,
          reportProdotti: 6,
          ultimoAgg: 'Oggi ore 18:45'
        },
        {
          id: 'sp-2',
          key: 'fase_difensiva',
          nome: 'FASE DIFENSIVA & LAVORO PER REPARTI',
          sub: 'Linea a 4 & Uscite dal Basso',
          livello: 'Esperto di Reparto',
          icon: '🛡️',
          schedeCreate: 12,
          schedeApprovate: 11,
          seduteCollegate: 8,
          reportProdotti: 9,
          ultimoAgg: 'Ieri ore 15:30'
        },
        {
          id: 'sp-3',
          key: 'match_analysis',
          nome: 'MATCH ANALYSIS & STUDIO AVVERSARIO',
          sub: 'Video Breakdown & Scouting Avversario',
          livello: 'Specialista Certificato',
          icon: '📹',
          schedeCreate: 6,
          schedeApprovate: 6,
          seduteCollegate: 4,
          reportProdotti: 7,
          ultimoAgg: '12/09 ore 19:00'
        },
        {
          id: 'sp-4',
          key: 'riscaldamento',
          nome: 'RISCALDAMENTO PRE-GARA & ATTIVAZIONE',
          sub: 'Routine Dinamica & Reattività',
          livello: 'Operativo di Campo',
          icon: '⚡',
          schedeCreate: 10,
          schedeApprovate: 10,
          seduteCollegate: 10,
          reportProdotti: 5,
          ultimoAgg: '14/09 ore 10:00'
        }
      ],

      // Schede Workstation Pre-Campo (Con Stati Reali)
      workstations: [
        {
          id: 'ws-1',
          titolo: 'Uscita dal pressing basso & scarico sul terzino',
          categoria: 'Fase Difensiva & Costruzione',
          target: '4 Difensori + Mediano',
          durata: '15 min',
          spazio: 'Gabbia 30x20m',
          materiale: 'Pettorine, 10 cinesini, 6 palloni',
          obiettivo: 'Superamento del primo pressing offensivo con terzo uomo libero sul corridoio laterale.',
          stato: 'APPROVATA DAL MISTER',
          data: '14/09/2026'
        },
        {
          id: 'ws-2',
          titolo: 'Palle inattive difensive a zona mista',
          categoria: 'Palle Inattive',
          target: 'Gruppo Titolari Lineup',
          durata: '20 min',
          spazio: 'Metà campo difensiva',
          materiale: 'Barriere sagomate, cinesini',
          obiettivo: 'Disposizione 5 a zona sulla linea d\'area piccola + 3 a uomo sui saltatori più pericolosi.',
          stato: 'IN REVISIONE',
          data: '14/09/2026'
        },
        {
          id: 'ws-3',
          titolo: 'Attivazione dinamica pre-gara & cambi direzione 10m',
          categoria: 'Riscaldamento Pre-Gara',
          target: 'Tutta la Rosa Convocata',
          durata: '25 min',
          spazio: 'Quarto di campo',
          materiale: 'Cinesini, scalette, ostacoli bassi',
          obiettivo: 'Innalzamento temperatura corporea e attivazione neuromuscolare.',
          stato: 'PRONTA PER IL CAMPO',
          data: '12/09/2026'
        }
      ],

      // Bozza Top 11 della Settimana (Supporto Tecnico al Mister)
      bozzaTop11: {
        modulo: '4-3-3',
        statoRevisione: 'Inviata al Mister',
        noteTattiche: 'Consigliata ampiezza elevata con Bonaccorsi e Russo sui corridoi laterali per costringere i terzini avversari ad abbassarsi.',
        titolari: [
          { num: 1, pos: 'POR', name: 'M. Falcone', nota: 'Reattività ottima' },
          { num: 2, pos: 'TD', name: 'G. Basile', nota: 'Spinta costante' },
          { num: 5, pos: 'DC', name: 'A. De Rosa', nota: 'Guida linea a 4' },
          { num: 6, pos: 'DC', name: 'L. Marotta', nota: 'Marcatura uomo' },
          { num: 3, pos: 'TS', name: 'D. Caruso', nota: 'Inserimenti sovrapposizione' },
          { num: 4, pos: 'MED', name: 'S. Amato', nota: 'Schermo centrale' },
          { num: 8, pos: 'CC', name: 'F. Valenti', nota: 'Raccordo pressing' },
          { num: 10, pos: 'CC', name: 'E. Miraglia Jr', nota: 'Qualità tra le linee' },
          { num: 7, pos: 'AD', name: 'R. Bonaccorsi', nota: 'Uno contro uno' },
          { num: 11, pos: 'AS', name: 'C. Russo', nota: 'Taglio verso il centro' },
          { num: 9, pos: 'ATT', name: 'M. Santoro', nota: 'Profondità e attacco porta' }
        ],
        panchina: ['A. Vitale (POR)', 'P. Romano (DC)', 'M. Pellegrino (TD)', 'G. Leone (CC)', 'V. Guida (AS)', 'F. Longo (ATT)']
      },

      // Dati GPS & Alert Dinamico
      gpsData: {
        alertAffaticamento: 'C. Russo ha raggiunto 9.8 km ad alta intensità dopo il rientro. Consigliata gestione minutaggio nella rifinitura (max 20 min).',
        distanzaMedia: '10.4 km',
        piccoKmH: '34.2 km/h',
        acwrSquadra: '1.08',
        atletiSottoMonitoraggio: ['C. Russo (Flessori)', 'M. Pellegrino (Caviglia)']
      },

      // Palmares di Staff Condiviso
      palmares: [
        { titolo: 'Promozione in Serie D (Staff Tecnico)', anno: '2024/2025', tipo: 'Campionato Ufficiale', note: 'Collaboratore tecnico & Vice' }
      ]
    };

    try {
      var raw = localStorage.getItem('elisee_vice_hub_data_v4');
      if (raw) {
        var parsed = JSON.parse(raw);
        return Object.assign({}, def, parsed);
      }
    } catch (_) {}

    if (_viceLiveData) {
      return Object.assign({}, def, _viceLiveData);
    }
    return def;
  }

  function saveViceData(data) {
    try {
      localStorage.setItem('elisee_vice_hub_data_v4', JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('elisee:vice-updated', { detail: { data: data } }));
    } catch (_) {}
  }

  // ============================================================
  // RENDER WORKSTATION VICE ALLENATORE
  // ============================================================
  function renderHub(user) {
    user = user || userObj();
    if (!isVice(user)) return;

    if (typeof window.unmountAllRoleDashboards === 'function') {
      try { window.unmountAllRoleDashboards('es-vd'); } catch (_) {}
    }
    var sh = document.getElementById('es-staff-profile');
    if (!sh) return;

    var mount = document.getElementById('es-vd');
    if (!mount) {
      mount = document.createElement('div');
      mount.id = 'es-vd';
      mount.className = 'es-pd';
      sh.insertBefore(mount, sh.firstChild);
    }
    mount.hidden = false;
    mount.removeAttribute('hidden');
    mount.style.display = 'block';
    sh.classList.add('es-vice-on');

    var grp = document.getElementById('user-dossier-view-group');
    if (grp) grp.classList.add('is-vice-dash');
    try { document.body.classList.add('is-vice-mode'); } catch (_) {}
    if (typeof window.updatePublicFooterVisibility === 'function') {
      window.updatePublicFooterVisibility('user-dossier', '#user-dossier-portal');
    } else {
      var f = document.getElementById('site-public-footer') || document.querySelector('footer.site-footer');
      if (f) { f.style.setProperty('display', 'none', 'important'); f.setAttribute('hidden', ''); }
    }

    syncLiveViceData(user);
    var data = getViceData();

    var html =
      '<div class="es-vd-shell">' +
        '<div class="es-vd-container">' +
          // HEADER PROFILE CARD DEL VICE
          '<header class="es-vd-header-card">' +
            '<div class="es-vd-header-left">' +
              '<div class="es-vd-avatar-shield">' +
                '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>' +
                '<span class="es-vd-avatar-badge">' + esc(data.patent) + '</span>' +
              '</div>' +
              '<div>' +
                '<h1 class="es-vd-coach-title-h1">' + esc(data.viceName) + '</h1>' +
                '<div class="es-vd-coach-role-sub">' + esc(data.viceRole) + ' · ' + esc(data.clubName) + '</div>' +
                '<div style="font-size:0.75rem; color:#8da8bc; margin-top:2px;">Matricola: <b>' + esc(data.matricola) + '</b> | Qualifica: <b style="color:#16b9ff;">' + esc(data.patent) + '</b></div>' +
              '</div>' +
            '</div>' +

            // Box Collegamento Diretto con il Mister
            '<div class="es-vd-connection-card">' +
              '<span class="es-vd-conn-dot"></span>' +
              '<div>' +
                '<div style="font-size:0.7rem; font-weight:800; color:#00d978; text-transform:uppercase;">Collegamento Diretto con Allenatore Capo</div>' +
                '<div style="font-size:0.88rem; font-weight:800; color:#f3f8fc;">Mister ' + esc(data.misterLink.name) + ' (' + esc(data.misterLink.patent) + ')</div>' +
                '<div style="font-size:0.72rem; color:#8da8bc;">Sincronizzazione attiva · ' + esc(data.misterLink.lastSync) + '</div>' +
              '</div>' +
            '</div>' +

            // Pulsante Ritorno Area Allenatore Capo
            '<div>' +
              '<button type="button" class="es-cos-btn-vice-jump" id="btn-goto-coach-control">' +
                '<span>Area Allenatore Capo</span>' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>' +
              '</button>' +
            '</div>' +
          '</header>' +

          // NAVBAR AGLI 8 TAB OBBLIGATORI
          '<nav class="es-vd-navbar" role="tablist">' +
            renderVdTabBtn('identita', 'Identità & Mister', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>') +
            renderVdTabBtn('specializzazione', 'Specializzazione', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>') +
            renderVdTabBtn('workstation', 'Schede Workstation', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>') +
            renderVdTabBtn('bozza_top11', 'Bozza Top 11', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>') +
            renderVdTabBtn('gps_heatmap', 'Co-Gestione GPS', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>') +
            renderVdTabBtn('squadra', 'Rosa', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>') +
            renderVdTabBtn('allenamenti', 'Sedute', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>') +
            renderVdTabBtn('lavagna', 'Lavagna Tattica', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>') +
          '</nav>' +

          // CONTAINER DEL CONTENUTO ATTIVO
          '<div id="es-vd-active-view">' +
            renderActiveVdTab(activeTab, data) +
          '</div>' +
        '</div>' +
      '</div>';

    mount.innerHTML = html;
    bindVdEvents();
  }

  function renderVdTabBtn(tabKey, label, svgIcon) {
    var isAct = activeTab === tabKey;
    return '<button type="button" class="es-vd-navbtn ' + (isAct ? 'is-active' : '') + '" data-vd-tab="' + tabKey + '">' +
      svgIcon + '<span>' + esc(label) + '</span>' +
    '</button>';
  }

  function renderActiveVdTab(tab, data) {
    if (tab === 'identita') return renderVdIdentita(data);
    if (tab === 'specializzazione') return renderVdSpecializzazione(data);
    if (tab === 'workstation') return renderVdWorkstation(data);
    if (tab === 'bozza_top11') return renderVdBozzaTop11(data);
    if (tab === 'gps_heatmap') return renderVdGps(data);
    if (tab === 'squadra') return renderVdRosa(data);
    if (tab === 'allenamenti') return renderVdSedute(data);
    if (tab === 'lavagna') return renderVdLavagna(data);
    return '<div class="es-cos-panel-card">Sezione in caricamento...</div>';
  }

  // 1. IDENTITÀ & MISTER
  function renderVdIdentita(data) {
    return (
      '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1.25rem;">' +
        '<div class="es-cos-panel-card">' +
          '<div class="es-cos-panel-head"><span class="es-cos-panel-title">Dati Identificativi Vice Allenatore</span></div>' +
          '<table class="es-cos-table-compact">' +
            '<tr><th>Nome e Cognome</th><td><b>' + esc(data.viceName) + '</b></td></tr>' +
            '<tr><th>Qualifica / Licenza</th><td><span class="es-cos-badge-pill is-blue">' + esc(data.patent) + '</span></td></tr>' +
            '<tr><th>Società / Club</th><td><b>' + esc(data.clubName) + '</b> (' + esc(data.categoria) + ')</td></tr>' +
            '<tr><th>Tesseramento FIGC</th><td>' + esc(data.matricola) + ' · Scad. ' + esc(data.scadenzaTesseramento) + '</td></tr>' +
            '<tr><th>Contatto Tecnico</th><td>' + esc(data.telefono) + '</td></tr>' +
          '</table>' +
        '</div>' +

        '<div class="es-cos-panel-card">' +
          '<div class="es-cos-panel-head"><span class="es-cos-panel-title">Profilo Mister & Binomio di Staff</span></div>' +
          '<div style="background:#070d16; border:1px solid #12344a; border-radius:8px; padding:1rem; display:flex; flex-direction:column; gap:0.5rem;">' +
            '<div style="display:flex; justify-content:space-between;">' +
              '<div><b style="font-size:1rem; color:#f3f8fc;">' + esc(data.misterLink.name) + '</b><div style="font-size:0.75rem; color:#16b9ff;">' + esc(data.misterLink.role) + '</div></div>' +
              '<span class="es-cos-badge-pill is-green">● Staff Connesso</span>' +
            '</div>' +
            '<p style="font-size:0.8rem; color:#8da8bc; margin:0; line-height:1.4;">Coordinamento quotidiano su moduli, gestione carichi atletici, schede workstation pre-campo e match analysis avversari.</p>' +
          '</div>' +
          '<div style="background:rgba(255,210,26,0.06); border:1px solid rgba(255,210,26,0.3); border-radius:6px; padding:0.75rem; font-size:0.78rem; color:#8da8bc; margin-top:0.65rem;">' +
            '<b style="color:#ffd21a;">Limiti di Ruolo:</b> Le formazioni ufficiali e le approvazioni delle sedute restano riservate alla convalida formale dell\'Allenatore Capo.' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  // 2. SPECIALIZZAZIONE (4 Aree Cliccabili)
  function renderVdSpecializzazione(data) {
    return (
      '<div class="es-cos-panel-card">' +
        '<div class="es-cos-panel-head">' +
          '<span class="es-cos-panel-title">Aree di Specializzazione Tecnica & Contributo di Reparto</span>' +
        '</div>' +
        '<div class="es-vd-spec-grid">' +
          data.specializzazioni.map(function (sp) {
            return (
              '<div class="es-vd-spec-card" data-spec-key="' + esc(sp.key) + '">' +
                '<div style="display:flex; align-items:center; gap:0.75rem;">' +
                  '<div class="es-vd-spec-icon-box">' + sp.icon + '</div>' +
                  '<div>' +
                    '<h4 class="es-vd-spec-title">' + esc(sp.nome) + '</h4>' +
                    '<span style="font-size:0.74rem; color:#16b9ff; font-weight:700;">' + esc(sp.sub) + '</span>' +
                  '</div>' +
                '</div>' +
                '<div class="es-vd-spec-stats">' +
                  '<div>Schede create: <b>' + sp.schedeCreate + '</b></div>' +
                  '<div>Approvate: <b style="color:#00d978;">' + sp.schedeApprovate + '</b></div>' +
                  '<div>Sedute collegate: <b>' + sp.seduteCollegate + '</b></div>' +
                  '<div>Report prodotti: <b>' + sp.reportProdotti + '</b></div>' +
                '</div>' +
                '<div style="font-size:0.7rem; color:#8da8bc; display:flex; justify-content:space-between; align-items:center; margin-top:4px;">' +
                  '<span>Livello: <b>' + esc(sp.livello) + '</b></span>' +
                  '<span>' + esc(sp.ultimoAgg) + '</span>' +
                '</div>' +
              '</div>'
            );
          }).join('') +
        '</div>' +
      '</div>'
    );
  }

  // 3. SCHEDE WORKSTATION
  function renderVdWorkstation(data) {
    return (
      '<div class="es-cos-panel-card">' +
        '<div class="es-cos-panel-head">' +
          '<span class="es-cos-panel-title">SCHEDE WORKSTATION & SEDUTE PRE-CAMPO</span>' +
          '<button type="button" class="es-btn-cos-primary" id="btn-create-ws-modal">+ Nuova Scheda Workstation</button>' +
        '</div>' +

        '<div class="es-vd-ws-grid">' +
          data.workstations.map(function (w, wIdx) {
            var stClass = w.stato === 'APPROVATA DAL MISTER' ? 'is-approved' : (w.stato === 'IN REVISIONE' ? 'is-review' : 'is-ready');
            return (
              '<div class="es-vd-ws-card">' +
                '<div class="es-vd-ws-head">' +
                  '<div>' +
                    '<div style="font-size:0.7rem; font-weight:800; color:#16b9ff; text-transform:uppercase;">' + esc(w.categoria) + '</div>' +
                    '<h4 style="margin:0.25rem 0 0; font-size:0.95rem; font-weight:800; color:#f3f8fc;">' + esc(w.titolo) + '</h4>' +
                  '</div>' +
                  '<span class="es-vd-ws-status-badge ' + stClass + '">' + esc(w.stato) + '</span>' +
                '</div>' +
                '<p style="font-size:0.8rem; color:#8da8bc; line-height:1.45; margin:0;">' + esc(w.obiettivo) + '</p>' +
                '<div style="background:#070d16; border:1px solid #12344a; border-radius:5px; padding:0.5rem 0.65rem; font-size:0.74rem; color:#8da8bc;">' +
                  '<div>Target: <b style="color:#f3f8fc;">' + esc(w.target) + '</b> · Durata: <b style="color:#00d978;">' + esc(w.durata) + '</b></div>' +
                  '<div>Spazio: ' + esc(w.spazio) + '</div>' +
                '</div>' +
                '<div class="es-vd-ws-actions-row">' +
                  '<button type="button" class="es-btn-cos-primary" style="padding:0.4rem 0.75rem; font-size:0.74rem;" data-submit-mister-idx="' + wIdx + '">Invia al Mister per Convalida</button>' +
                  '<button type="button" class="es-btn-cos-sec" style="color:#ff4d5a; padding:0.4rem 0.6rem;" data-del-ws-idx="' + wIdx + '">&times;</button>' +
                '</div>' +
              '</div>'
            );
          }).join('') +
        '</div>' +
      '</div>'
    );
  }

  // 4. BOZZA TOP 11
  function renderVdBozzaTop11(data) {
    var b = data.bozzaTop11 || {};
    return (
      '<div class="es-cos-panel-card">' +
        '<div class="es-cos-panel-head">' +
          '<div style="display:flex; align-items:center; gap:0.75rem;">' +
            '<span class="es-cos-panel-title">BOZZA FORMAZIONE DELLA SETTIMANA (SUPPORTO TECNICO)</span>' +
            '<span class="es-cos-badge-pill is-warn">Stato: ' + esc(b.statoRevisione) + '</span>' +
          '</div>' +
          '<button type="button" class="es-btn-cos-primary" id="btn-send-bozza-mister">Invia Proposta Formazione al Mister &rarr;</button>' +
        '</div>' +

        '<div style="background:#070d16; border:1px solid #12344a; border-radius:8px; padding:0.85rem; font-size:0.82rem; color:#8da8bc; margin-bottom:1rem;">' +
          '<b style="color:#16b9ff;">Nota Tattica di Supporto:</b> ' + esc(b.noteTattiche) +
        '</div>' +

        '<table class="es-cos-table-compact">' +
          '<thead><tr><th>Maglia</th><th>Ruolo</th><th>Calciatore Proposto</th><th>Note Tecniche del Vice</th></tr></thead>' +
          '<tbody>' +
            (b.titolari || []).map(function (t) {
              return (
                '<tr>' +
                  '<td><b style="color:#16b9ff;">#' + esc(t.num) + '</b></td>' +
                  '<td><span class="es-cos-badge-pill is-blue">' + esc(t.pos) + '</span></td>' +
                  '<td style="font-weight:800;">' + esc(t.name) + '</td>' +
                  '<td style="color:#8da8bc;">' + esc(t.nota) + '</td>' +
                '</tr>'
              );
            }).join('') +
          '</tbody>' +
        '</table>' +
      '</div>'
    );
  }

  // 5. CO-GESTIONE GPS
  function renderVdGps(data) {
    var g = data.gpsData || {};
    var gpsFiles = (data.allegati || []).filter(function (f) { return f.categoria === 'gps'; });
    return (
      '<div style="display:flex; flex-direction:column; gap:1.25rem;">' +
        '<div class="es-cos-panel-card">' +
          '<div class="es-cos-panel-head">' +
            '<span class="es-cos-panel-title">CO-GESTIONE DASHBOARD GPS & MONITORAGGIO AFFATICAMENTO</span>' +
            '<button type="button" class="es-btn-cos-primary" id="btn-vd-upload-gps">⬆️ Carica Telemetria GPS (Bucket staff-allegati)</button>' +
          '</div>' +

          // Alert Dinamico di Affaticamento
          '<div style="background:rgba(255,210,26,0.08); border:1px solid #ffd21a; border-radius:8px; padding:1rem; display:flex; align-items:flex-start; gap:0.75rem; margin-bottom:1.25rem;">' +
            '<span style="font-size:1.4rem;">⚠️</span>' +
            '<div>' +
              '<b style="color:#ffd21a; font-size:0.88rem;">Monitoraggio Carico Settimanale:</b>' +
              '<p style="margin:0.25rem 0 0; font-size:0.84rem; color:#f3f8fc;">' + esc(g.alertAffaticamento) + '</p>' +
            '</div>' +
          '</div>' +

          '<div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:1rem;">' +
            '<div style="background:#070d16; border:1px solid #12344a; border-radius:6px; padding:0.85rem; text-align:center;"><div style="font-size:1.2rem; font-weight:900; color:#16b9ff;">' + esc(g.distanzaMedia) + '</div><div style="font-size:0.72rem; color:#8da8bc;">DISTANZA MEDIA TITOLARI</div></div>' +
            '<div style="background:#070d16; border:1px solid #12344a; border-radius:6px; padding:0.85rem; text-align:center;"><div style="font-size:1.2rem; font-weight:900; color:#00d978;">' + esc(g.piccoKmH) + '</div><div style="font-size:0.72rem; color:#8da8bc;">PICCO VELOCITÀ SQUADRA</div></div>' +
            '<div style="background:#070d16; border:1px solid #12344a; border-radius:6px; padding:0.85rem; text-align:center;"><div style="font-size:1.2rem; font-weight:900; color:#ffd21a;">' + esc(g.acwrSquadra) + '</div><div style="font-size:0.72rem; color:#8da8bc;">ACWR GENERALE</div></div>' +
          '</div>' +
        '</div>' +

        // File GPS Archiviati
        '<div class="es-cos-panel-card">' +
          '<div class="es-cos-panel-head"><span class="es-cos-panel-title">Tracciati GPS Cloud (Bucket: staff-allegati)</span></div>' +
          (gpsFiles.length ? (
            '<div style="display:flex; flex-direction:column; gap:0.5rem;">' +
              gpsFiles.map(function (gf) {
                return (
                  '<div style="display:flex; justify-content:space-between; align-items:center; background:#071522; border:1px solid #12344a; border-radius:6px; padding:0.75rem 1rem;">' +
                    '<div><b style="color:#f3f8fc; font-size:0.85rem;">' + esc(gf.file_url.split('/').pop()) + '</b><div style="font-size:0.72rem; color:#8da8bc;">Data upload: ' + formatDate(gf.created_at) + '</div></div>' +
                    '<a href="' + esc(gf.file_url) + '" target="_blank" rel="noopener noreferrer" class="es-btn-cos-sec" style="font-size:0.74rem;">Scarica File &rarr;</a>' +
                  '</div>'
                );
              }).join('') +
            '</div>'
          ) : '<div style="text-align:center; padding:1.5rem; color:#8da8bc; font-size:0.8rem;">Nessun tracciato GPS caricato.</div>') +
        '</div>' +
      '</div>'
    );
  }

  // 6. ROSA ORGANICO
  function renderVdRosa(data) {
    var roster = data.roster || [];
    return (
      '<div class="es-cos-panel-card">' +
        '<div class="es-cos-panel-head">' +
          '<span class="es-cos-panel-title">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' +
            'Organico Rosa Prima Squadra (Consultazione Tecnica Vice · Tabella: rosa)' +
          '</span>' +
        '</div>' +
        '<p style="font-size:0.8rem; color:#8da8bc; margin:0 0 1rem;">Visualizzazione stato fisico e carichi di lavoro incrociati con infortuni e squalifiche.</p>' +
        (roster.length ? (
          '<table class="es-cos-table-compact">' +
            '<thead><tr><th>Maglia</th><th>Calciatore</th><th>Ruolo</th><th>Stato Fisico</th><th>Disponibilità</th></tr></thead>' +
            '<tbody>' +
              roster.map(function(p){
                var isDisp = p.status === 'disp';
                var dispHtml = isDisp ? '<span class="es-cos-badge-pill is-green">🟢 Disponibile</span>' :
                  (p.statoDettagliato === 'infortunato' ? '<span class="es-cos-badge-pill is-danger">🔴 Infortunato' + (p.motivo ? (' - ' + esc(p.motivo)) : '') + '</span>' :
                  '<span class="es-cos-badge-pill is-warn">🟡 ' + esc(p.statoDettagliato || 'Differenziato') + '</span>');
                return '<tr><td><b>#' + esc(p.num) + '</b></td><td style="font-weight:800; color:#f3f8fc;">' + esc(p.name) + '</td><td>' + esc(p.role) + '</td><td>' + esc(p.load) + '</td><td>' + dispHtml + '</td></tr>';
              }).join('') +
            '</tbody>' +
          '</table>'
        ) : (
          '<div class="es-cos-empty-state">' +
            '<svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' +
            '<div class="es-cos-empty-title">Nessun calciatore presente in rosa</div>' +
            '<div class="es-cos-empty-sub">I calciatori inseriti nella tabella rosa su Supabase appariranno qui automaticamente.</div>' +
          '</div>'
        )) +
      '</div>'
    );
  }

  // 7. SEDUTE
  function renderVdSedute(data) {
    var list = data.trainingsList || [];
    return (
      '<div class="es-cos-panel-card">' +
        '<div class="es-cos-panel-head">' +
          '<span class="es-cos-panel-title">SEDUTE DI ALLENAMENTO & WORKSTATION COLLEGATE (Tabella: allenamenti)</span>' +
        '</div>' +
        '<table class="es-cos-table-compact">' +
          '<thead><tr><th>Data & Orario</th><th>Tipologia</th><th>Obiettivi & Reparti</th><th>Stato</th></tr></thead>' +
          '<tbody>' +
            (list.length ? list.map(function(tr){
              return '<tr><td><b>' + esc(tr.data) + ' ' + esc(tr.orario) + '</b></td><td>' + esc(tr.tipo) + '</td><td>' + esc(tr.desc) + '</td><td><span class="es-cos-badge-pill is-green">' + esc(tr.stato) + '</span></td></tr>';
            }).join('') : '<tr><td colspan="4" style="text-align:center; padding:2.5rem; color:#8da8bc;">Nessuna seduta programmata a database.</td></tr>') +
          '</tbody>' +
        '</table>' +
      '</div>'
    );
  }

  // 8. LAVAGNA TATTICA CONDIVISA
  function renderVdLavagna(data) {
    return (
      '<div class="es-cos-panel-card">' +
        '<div class="es-cos-panel-head">' +
          '<span class="es-cos-panel-title">LAVAGNA TATTICA CONDIVISA CON L\'ALLENATORE CAPO</span>' +
          '<button type="button" class="es-btn-cos-primary" onclick="if(window.showToast)window.showToast(\'Schema condiviso direttamente con il Mister!\',\'success\')">Condividi con il Mister</button>' +
        '</div>' +
        '<div class="es-cos-pitch-wrapper" style="min-height:420px;">' +
          '<div class="es-cos-pitch-field"></div>' +
          '<div class="es-cos-pitch-line-center"></div>' +
          '<div class="es-cos-pitch-circle-center"></div>' +
          '<div class="es-cos-pitch-box-top"></div>' +
          '<div class="es-cos-pitch-box-bottom"></div>' +
          '<div class="es-cos-player-pin" style="left:50%; top:88%;"><div class="es-cos-pin-circle">#1</div><div class="es-cos-pin-tag">Falcone</div></div>' +
          '<div class="es-cos-player-pin" style="left:82%; top:25%;"><div class="es-cos-pin-circle">#7</div><div class="es-cos-pin-tag">Bonaccorsi</div></div>' +
          '<div class="es-cos-player-pin" style="left:50%; top:15%;"><div class="es-cos-pin-circle">#9</div><div class="es-cos-pin-tag">Santoro</div></div>' +
          '<div class="es-cos-player-pin" style="left:18%; top:25%;"><div class="es-cos-pin-circle">#11</div><div class="es-cos-pin-tag">Russo</div></div>' +
          '<div class="es-cos-player-pin" style="left:50%; top:45%;"><div style="font-size:1.3rem;">⚽</div></div>' +
        '</div>' +
      '</div>'
    );
  }

  // ============================================================
  // EVENT BINDINGS
  // ============================================================
  function openViceUploadModal(categoria, entitaId, entitaTipo, title) {
    categoria = categoria || 'gps';
    entitaId = entitaId || 'default-entity';
    title = title || 'Carica File su Supabase Storage (staff-allegati)';

    var acceptMap = {
      gps: '.csv,.json,.fit,.gpx,.txt',
      video_analisi: '.mp4,.webm,.mov,.pdf',
      staff_tecnico: '.pdf,.docx,.doc,.png,.jpg,.jpeg'
    };

    var modal = document.createElement('div');
    modal.id = 'es-vd-modal-box';
    modal.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.78); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; z-index:99999; padding:1rem;';
    modal.innerHTML =
      '<div style="background:#071522; border:1px solid #16b9ff; border-radius:10px; max-width:500px; width:100%; padding:1.5rem; position:relative; box-shadow:0 12px 36px rgba(0,0,0,0.8);">' +
        '<button type="button" id="btn-vd-modal-x" style="position:absolute; top:12px; right:12px; background:none; border:none; color:#8da8bc; font-size:1.4rem; cursor:pointer;">&times;</button>' +
        '<h3 style="margin:0 0 1rem; font-size:1.1rem; font-weight:800; color:#f3f8fc;">' + esc(title) + '</h3>' +
        '<form id="form-vd-upload" style="display:flex; flex-direction:column; gap:1rem;">' +
          '<div style="font-size:0.78rem; color:#8da8bc;">Archiviazione diretta nel bucket cloud <code>staff-allegati</code> con associazione a tabella <code>file_allegati</code>.</div>' +
          '<div style="display:flex; flex-direction:column; gap:0.35rem;">' +
            '<label style="font-size:0.8rem; font-weight:800; color:#8da8bc;">Seleziona File *</label>' +
            '<input type="file" id="inp-vd-file" required accept="' + (acceptMap[categoria] || '*/*') + '" style="background:#040912; border:1px solid #12344a; color:#f3f8fc; padding:0.6rem; border-radius:6px;">' +
          '</div>' +
          '<div id="vd-upload-status" style="display:none; font-size:0.82rem; font-weight:700; color:#16b9ff; text-align:center;"></div>' +
          '<div style="display:flex; justify-content:flex-end; gap:0.5rem;">' +
            '<button type="button" class="es-btn-cos-sec" id="btn-vd-modal-cancel">Annulla</button>' +
            '<button type="submit" class="es-btn-cos-primary" id="btn-vd-submit-up">⬆️ Avvia Upload Cloud</button>' +
          '</div>' +
        '</form>' +
      '</div>';

    document.body.appendChild(modal);
    function closeVdModal() { if (modal) modal.remove(); }
    modal.querySelector('#btn-vd-modal-x').onclick = closeVdModal;
    modal.querySelector('#btn-vd-modal-cancel').onclick = closeVdModal;

    var form = modal.querySelector('#form-vd-upload');
    form.onsubmit = async function(e) {
      e.preventDefault();
      var fInp = modal.querySelector('#inp-vd-file');
      if (!fInp || !fInp.files || !fInp.files[0]) return;
      var file = fInp.files[0];
      var stDiv = modal.querySelector('#vd-upload-status');
      var sBtn = modal.querySelector('#btn-vd-submit-up');

      stDiv.style.display = 'block';
      stDiv.textContent = 'Upload in corso su staff-allegati...';
      sBtn.disabled = true;

      var u = userObj();
      var clubId = (_viceLiveData && _viceLiveData.clubId) || (await window.EliseeSupabase.resolveClubId(u));
      var staffId = u.staffId || u.id || null;

      var r = await window.EliseeSupabase.uploadFileAllegato(clubId, categoria, entitaId, file, staffId, ['allenatore', 'vice_allenatore']);
      if (r.ok) {
        if (window.showToast) window.showToast('File caricato su Supabase Storage!', 'success');
        closeVdModal();
        await syncLiveViceData(null, true);
      } else {
        stDiv.style.color = '#ef4444';
        stDiv.textContent = 'Errore: ' + (r.error || 'Upload fallito');
        sBtn.disabled = false;
      }
    };
  }

  function bindVdEvents() {
    var mount = document.getElementById('es-vd');
    if (!mount) return;
    syncLiveViceData(user);
    var data = getViceData();

    // Navigazione Tab del Vice
    mount.querySelectorAll('[data-vd-tab]').forEach(function (btn) {
      btn.onclick = function () {
        var t = btn.getAttribute('data-vd-tab');
        if (t) {
          activeTab = t;
          var container = document.getElementById('es-vd-active-view');
          if (container) {
            container.innerHTML = renderActiveVdTab(activeTab, data);
            bindVdEvents();
          } else {
            renderHub();
          }
        }
      };
    });

    // Pulsante Rapido Ritorno all'Area Allenatore Capo
    var btnVdGps = mount.querySelector('#btn-vd-upload-gps');
    if (btnVdGps) {
      btnVdGps.onclick = function() {
        openViceUploadModal('gps', 'allenamento-vice', 'allenamento', 'Carica Telemetria GPS (Bucket: staff-allegati)');
      };
    }

    var btnGotoCoach = mount.querySelector('#btn-goto-coach-control');
    if (btnGotoCoach) {
      btnGotoCoach.onclick = function () {
        if (window.EliseeRoleSwitcher && window.EliseeRoleSwitcher.impersonate) {
          window.EliseeRoleSwitcher.impersonate('allenatore');
        } else if (window.EliseeCoachDash && window.EliseeCoachDash.render) {
          var u = userObj();
          u.staffRole = 'Allenatore Capo';
          try { localStorage.setItem('elisee_active_user', JSON.stringify(u)); } catch (_) {}
          window.EliseeCoachDash.render(u);
        }
        if (window.showToast) window.showToast('Accesso alla Control Room Allenatore Capo', 'info');
      };
    }

    // Invia Bozza Formazione al Mister
    var btnSendBozza = mount.querySelector('#btn-send-bozza-mister');
    if (btnSendBozza) {
      btnSendBozza.onclick = function () {
        data.bozzaTop11.statoRevisione = 'Inviata al Mister per approvazione';
        saveViceData(data);
        if (window.showToast) window.showToast('📨 Bozza Formazione inviata con successo all\'Allenatore Capo!', 'success');
        renderHub();
      };
    }

    // Invio Workstation al Mister
    mount.querySelectorAll('[data-submit-mister-idx]').forEach(function (btn) {
      btn.onclick = function () {
        var idx = parseInt(btn.getAttribute('data-submit-mister-idx'));
        if (data.workstations && data.workstations[idx]) {
          data.workstations[idx].stato = 'IN REVISIONE';
          saveViceData(data);
          renderHub();
          if (window.showToast) window.showToast('Scheda Workstation inviata al Mister per la convalida!', 'success');
        }
      };
    });

    // Elimina Workstation
    mount.querySelectorAll('[data-del-ws-idx]').forEach(function (btn) {
      btn.onclick = function () {
        var idx = parseInt(btn.getAttribute('data-del-ws-idx'));
        if (confirm('Vuoi eliminare questa scheda workstation?')) {
          data.workstations.splice(idx, 1);
          saveViceData(data);
          renderHub();
        }
      };
    });

    // Modale Nuova Scheda Workstation
    var btnCreateWs = mount.querySelector('#btn-create-ws-modal');
    if (btnCreateWs) {
      btnCreateWs.onclick = function () {
        openVdModal('Crea Nuova Scheda Workstation Pre-Campo',
          '<form id="form-create-ws" style="display:flex; flex-direction:column; gap:1rem;">' +
            '<div class="es-cos-form-group"><label class="es-cos-form-label">Titolo Scheda *</label><input type="text" class="es-cos-form-input" id="inp-ws-title" required placeholder="Es. Rondos 4v2 con transizione rapida"></div>' +
            '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
              '<div class="es-cos-form-group"><label class="es-cos-form-label">Categoria</label><select class="es-cos-form-input" id="inp-ws-cat"><option>Palle Inattive</option><option>Fase Difensiva & Costruzione</option><option>Match Analysis</option><option>Riscaldamento Pre-Gara</option></select></div>' +
              '<div class="es-cos-form-group"><label class="es-cos-form-label">Durata</label><input type="text" class="es-cos-form-input" id="inp-ws-dur" value="15 min"></div>' +
            '</div>' +
            '<div class="es-cos-form-group"><label class="es-cos-form-label">Target Giocatori</label><input type="text" class="es-cos-form-input" id="inp-ws-target" value="Titolari o Reparto Difesa"></div>' +
            '<div class="es-cos-form-group"><label class="es-cos-form-label">Obiettivo Tecnico</label><textarea class="es-cos-form-input" id="inp-ws-obj" rows="3" placeholder="Descrizione delle consegne e correzioni..."></textarea></div>' +
            '<div style="display:flex; justify-content:flex-end; gap:0.5rem;">' +
              '<button type="button" class="es-btn-cos-sec" id="btn-vd-modal-cancel">Annulla</button>' +
              '<button type="submit" class="es-btn-cos-primary">Crea Scheda</button>' +
            '</div>' +
          '</form>'
        );
        var f = document.getElementById('form-create-ws');
        if (f) {
          f.onsubmit = function (e) {
            e.preventDefault();
            data.workstations.unshift({
              id: 'ws-' + Date.now(),
              titolo: document.getElementById('inp-ws-title').value.trim(),
              categoria: document.getElementById('inp-ws-cat').value,
              durata: document.getElementById('inp-ws-dur').value.trim(),
              target: document.getElementById('inp-ws-target').value.trim(),
              spazio: 'Gabbia regolamentare',
              materiale: 'Cinesini, palloni',
              obiettivo: document.getElementById('inp-ws-obj').value.trim(),
              stato: 'PRONTA PER IL CAMPO',
              data: new Date().toLocaleDateString('it-IT')
            });
            saveViceData(data);
            closeVdModal();
            renderHub();
            if (window.showToast) window.showToast('Nuova scheda workstation creata!', 'success');
          };
        }
      };
    }
  }

  function openVdModal(title, contentHtml) {
    closeVdModal();
    var modal = document.createElement('div');
    modal.id = 'es-vd-modal-box';
    modal.className = 'es-cos-modal-backdrop';
    modal.innerHTML =
      '<div class="es-cos-modal-box">' +
        '<button type="button" class="es-cos-modal-close" id="btn-vd-modal-close-x">&times;</button>' +
        '<h3 style="margin:0 0 1.25rem; font-size:1.15rem; font-weight:800; color:#f3f8fc;">' + esc(title) + '</h3>' +
        '<div>' + contentHtml + '</div>' +
      '</div>';
    document.body.appendChild(modal);
    modal.querySelector('#btn-vd-modal-close-x').onclick = closeVdModal;
    var btnCancel = modal.querySelector('#btn-vd-modal-cancel');
    if (btnCancel) btnCancel.onclick = closeVdModal;
    modal.onclick = function (e) { if (e.target === modal) closeVdModal(); };
  }

  function closeVdModal() {
    var m = document.getElementById('es-vd-modal-box');
    if (m) m.remove();
  }

  // ============================================================
  // EXPORT GLOBALE
  // ============================================================
  window.EliseeViceDash = {
    render: renderHub,
    isVice: isVice,
    getData: getViceData
  };

  window.addEventListener('hashchange', function () {
    if (window.location.hash.indexOf('user-dossier') >= 0 && isVice()) {
      setTimeout(renderHub, 50);
    }
  });

  document.addEventListener('DOMContentLoaded', function () {
    if (window.location.hash.indexOf('user-dossier') >= 0 && isVice()) {
      setTimeout(renderHub, 100);
    }
  });

  document.addEventListener('elisee:view-changed', function (e) {
    var d = e && e.detail;
    if (d && d.view === 'user-dossier') {
      try {
        var u = userObj();
        if (isVice(u)) renderHub(u);
      } catch (_) {}
    }
  });

  document.addEventListener('elisee:role-changed', function (e) {
    var d = e && e.detail;
    try {
      var u = (d && d.user) || userObj();
      if (isVice(u)) renderHub(u);
    } catch (_) {}
  });
})();
