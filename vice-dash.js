/* ============================================================
   ELISEE SCOUT — AREA VICE ALLENATORE (MISTER HUB)
   Profilo Ufficiale da Documento di Piattaforma:
   - Identità, Patentino / Licenza (UEFA B, Collaboratore Tecnico)
   - Collegamento Diretto Bidirezionale con l'Allenatore Capo (Mister)
   - Aree di Specializzazione Tecnica (Palle Inattive, Difesa/Reparti, Match Analysis, Riscaldamento)
   - Gestione Esercitazioni & Schede Workstation Pre-Seduta
   - Bacheca Palmarès & Storico Staff (Specificando Ruolo di Vice)
   - Co-Gestione Dashboard GPS Squadra (Alert Picchi di Fatica al Mister)
   - Supporto & Bozza Formazione della Settimana (XI Titolare)
   - Analisi Heatmap Singoli Giocatori (Ampiezza / Densità)
   - Limiti di Ruolo Ufficiali (Ufficializzazione Riservata al Mister)
   ============================================================ */
(function () {
  'use strict';

  var activeTab = 'identita'; // 'identita' | 'specializzazione' | 'workstation' | 'bozza_top11' | 'gps_heatmap' | 'squadra' | 'allenamenti' | 'lavagna'

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

  function isVice(u) {
    u = u || userObj();
    var primary = String(u.staffRole || u.ruoloDettagliato || (u.staffProfile && u.staffProfile.fieldRole) || u.ruolo || u.role || '').trim().toLowerCase();
    return /allenatore in seconda|vice allenatore/.test(primary);
  }

  function getViceData() {
    var u = userObj();
    var def = {
      viceName: [u.nome, u.cognome].filter(Boolean).join(' ').trim() || u.username || 'Vice Allenatore',
      viceRole: u.staffRole || 'Vice Allenatore',
      patent: u.qualifica || (u.staffProfile && u.staffProfile.qualifica) || 'UEFA B',
      status: u.status || 'in_carica', // 'in_carica' | 'disponibile'
      clubName: u.squadra || u.club || 'Atalanta Bergamasca Calcio',
      matricola: u.matricola || 'FIGC-88210',
      sede: u.sede || 'Bergamo (BG)',
      telefono: u.telefono || '+39 035 123456',
      logoUrl: u.logoUrl || 'immagini/squadre-loghi/foggia.png',
      // Collegamento Diretto con l'Allenatore Capo
      misterLink: {
        id: 'coach-official-1',
        name: 'Gian Piero Gasperini',
        role: 'Allenatore Capo',
        patent: 'UEFA Pro',
        email: 'gasperini@atalanta.it',
        status: 'Collegato'
      },
      // Aree di Specializzazione Tecnica
      specializzazioni: [
        { id: 'sp-1', nome: 'Fasi a Palle Inattive (Corner & Punizioni)', livello: 'Top Expert', icon: '🎯', attivo: true },
        { id: 'sp-2', nome: 'Fase Difensiva & Lavoro per Reparti', livello: 'Avanzato', icon: '🛡️', attivo: true },
        { id: 'sp-3', nome: 'Match Analysis & Studio Avversario', livello: 'Specialista', icon: '📹', attivo: true },
        { id: 'sp-4', nome: 'Riscaldamento Pre-Gara & Attivazione Tattica', livello: 'Operativo', icon: '⚡', attivo: true }
      ],
      // Schede Workstation Pre-Seduta
      workstations: [
        {
          id: 'ws-1',
          titolo: 'Workstation 1: Uscita dal Pressing Basso & Scarico sul Terzino',
          categoria: 'Fase Difensiva & Costruzione',
          target: 'Difensori + Mediano',
          durata: '15 min',
          descrizione: 'Gabbia 30x20m. 4 difensori + 1 mediano contro 3 attaccanti. Obiettivo trovare il terzo uomo libero in massimo 3 tocchi.'
        },
        {
          id: 'ws-2',
          titolo: 'Workstation 2: Palle Inattive Difensive a Zona Mista',
          categoria: 'Palle Inattive',
          target: 'Gruppo Titolari',
          durata: '20 min',
          descrizione: 'Disposizione 5 a zona su linea di porta + 3 a uomo sui saltatori più pericolosi + 2 al limite dell\'area per seconde palle.'
        }
      ],
      // Palmarès Condiviso (Ruolo Vice)
      palmares: [
        { id: 'vpal-1', titolo: 'Vincitore UEFA Europa League (Vice Allenatore)', anno: '2023/2024', tipo: 'Staff Tecnico Ufficiale', note: 'Staff Tecnico Prima Squadra' },
        { id: 'vpal-2', titolo: 'Vincitore Coppa Italia Serie C (Vice Allenatore)', anno: '2021/2022', tipo: 'Coppa Nazionale', note: 'Coordinatore Palle Inattive' }
      ],
      // Bozza Formazione Settimana (Supporto al Mister)
      bozzaTop11: [
        { pos: 'POR', num: 1, name: 'Marco Carnesecchi', note: 'Confermato' },
        { pos: 'TD', num: 77, name: 'Davide Zappacosta', note: 'In ballottaggio' },
        { pos: 'DC', num: 19, name: 'Berat Djimsiti', note: 'Titolare' },
        { pos: 'DC', num: 4, name: 'Isak Hien', note: 'Titolare' },
        { pos: 'TS', num: 22, name: 'Matteo Ruggeri', note: 'Titolare' },
        { pos: 'MED', num: 15, name: 'Marten de Roon', note: 'Capitano' },
        { pos: 'CC', num: 13, name: 'Éderson', note: 'Titolare' },
        { pos: 'CC', num: 8, name: 'Mario Pašalić', note: 'Consigliato per inserimenti' },
        { pos: 'AD', num: 17, name: 'Charles De Ketelaere', note: 'Titolare' },
        { pos: 'AS', num: 11, name: 'Ademola Lookman', note: 'Titolare' },
        { pos: 'ATT', num: 9, name: 'Gianluca Scamacca', note: 'Punta di riferimento' }
      ],
      // Rosa
      roster: [
        { num: 1, name: 'Marco Carnesecchi', role: 'Portiere', status: 'disp' },
        { num: 19, name: 'Berat Djimsiti', role: 'Difensore Centrale', status: 'disp' },
        { num: 4, name: 'Isak Hien', role: 'Difensore Centrale', status: 'disp' },
        { num: 77, name: 'Davide Zappacosta', role: 'Terzino Destro', status: 'disp' },
        { num: 22, name: 'Matteo Ruggeri', role: 'Terzino Sinistro', status: 'disp' },
        { num: 15, name: 'Marten de Roon', role: 'Mediano', status: 'disp' },
        { num: 13, name: 'Éderson', role: 'Mezzala', status: 'disp' },
        { num: 8, name: 'Mario Pašalić', role: 'Trequartista', status: 'disp' },
        { num: 17, name: 'Charles De Ketelaere', role: 'Ala Destra', status: 'disp' },
        { num: 11, name: 'Ademola Lookman', role: 'Ala Sinistra', status: 'disp' },
        { num: 9, name: 'Gianluca Scamacca', role: 'Punta Centrale', status: 'disp' }
      ]
    };

    try {
      var stored = localStorage.getItem('elisee_vice_hub_data_v4');
      if (stored) return Object.assign(def, JSON.parse(stored));
    } catch (_) {}
    return def;
  }

  function saveViceData(data) {
    try {
      localStorage.setItem('elisee_vice_hub_data_v4', JSON.stringify(data));
      localStorage.setItem('elisee_vice_hub_data_v3', JSON.stringify(data));
    } catch (_) {}
  }

  var TAB_DESCS = {
    identita: 'Carta d\'identità del Vice Allenatore, tesseramento ufficiale, collegamento diretto con l\'Allenatore Capo e palmarès di staff.',
    specializzazione: 'Aree di competenza tecnica e supporto operativo: palle inattive, fase difensiva per reparti, match analysis e riscaldamento.',
    workstation: 'Schede workstation operative e catalogazione esercitazioni pre-seduta da mostrare ai calciatori.',
    bozza_top11: 'Bozza tattica dell\'XI settimanale preparata come proposta tecnica prima della convalida ufficiale del Mister.',
    gps_heatmap: 'Co-gestione dashboard GPS (alert picchi fatica) e consultazione Heatmap individuali per ampiezza e densità.',
    squadra: 'Organico della rosa con monitoraggio disponibilità e presenze settimanali.',
    allenamenti: 'Consultazione e supporto alla pianificazione delle sedute sul campo.',
    lavagna: 'Lavagna tattica interattiva condivisa con lo staff tecnico.'
  };

  // ============================================================
  // RENDER DELL'HUB PRINCIPALE VICE ALLENATORE
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

    var data = getViceData();
    var isDisp = data.status === 'disponibile';

    var html =
      '<div class="es-coach-hub">' +
        // Top Bar Ufficiale
        '<div class="es-coach-top-bar">' +
          '<div class="es-coach-top-left">' +
            '<span class="es-coach-badge-gold" style="background:rgba(56,189,248,0.2); color:#38bdf8; border-color:rgba(56,189,248,0.4);">⏱️ Staff Tecnico Ufficiale</span>' +
            '<span class="es-coach-top-title">Profilo Vice Allenatore · ' + esc(data.viceName) + '</span>' +
          '</div>' +
          '<div class="es-coach-top-actions">' +
            '<span class="es-coach-status-tag ' + (isDisp ? 'is-disp' : 'is-busy') + '">' + (isDisp ? '● Disponibile / Cerca Staff' : '● In carica: ' + esc(data.clubName)) + '</span>' +
            '<button type="button" class="es-coach-btn-guida" id="btn-guida-vice">📖 Guida Vice</button>' +
          '</div>' +
        '</div>' +

        '<div class="es-coach-container">' +
          // Header Card Profilo
          '<div class="es-coach-header-card">' +
            '<div class="es-coach-header-main">' +
              '<div class="es-coach-avatar-wrap">' +
                '<div class="es-coach-avatar-box" style="background:#082f49; color:#38bdf8;">⏱️</div>' +
                '<span class="es-coach-avatar-tag">' + esc(data.patent) + '</span>' +
              '</div>' +
              '<div class="es-coach-header-info">' +
                '<div class="es-coach-tags-row">' +
                  '<span class="es-tag es-tag-blue">QUALIFICA: ' + esc(data.patent) + '</span>' +
                  '<span class="es-tag es-tag-dark">' + esc(data.matricola) + '</span>' +
                  '<span class="es-tag es-tag-green">SPECIALISTA PALLE INATTIVE & DIFESA</span>' +
                '</div>' +
                '<h1 class="es-coach-name-title">' + esc(data.viceName) + '</h1>' +
                '<p class="es-coach-lead-desc" id="vice-tab-desc-text">' + esc(TAB_DESCS[activeTab]) + '</p>' +
              '</div>' +
            '</div>' +
            '<div class="es-coach-header-cta">' +
              '<button type="button" class="es-btn-primary" id="btn-quick-new-ws">+ Nuova Scheda Workstation</button>' +
              '<button type="button" class="es-btn-secondary" id="btn-open-mister-direct">Mister: ' + esc((data.misterLink && data.misterLink.name) || 'Collega') + ' &rarr;</button>' +
            '</div>' +
          '</div>' +

          // Navbar a 8 Schede
          '<nav class="es-coach-navbar" role="tablist">' +
            '<button type="button" class="es-coach-navbtn ' + (activeTab === 'identita' ? 'is-active' : '') + '" data-tab="identita">🛡️ Identità & Mister</button>' +
            '<button type="button" class="es-coach-navbtn ' + (activeTab === 'specializzazione' ? 'is-active' : '') + '" data-tab="specializzazione">🎯 Specializzazione</button>' +
            '<button type="button" class="es-coach-navbtn ' + (activeTab === 'workstation' ? 'is-active' : '') + '" data-tab="workstation">📋 Schede Workstation</button>' +
            '<button type="button" class="es-coach-navbtn ' + (activeTab === 'bozza_top11' ? 'is-active' : '') + '" data-tab="bozza_top11">⚽ Bozza Top 11</button>' +
            '<button type="button" class="es-coach-navbtn ' + (activeTab === 'gps_heatmap' ? 'is-active' : '') + '" data-tab="gps_heatmap">📊 Co-Gestione GPS</button>' +
            '<button type="button" class="es-coach-navbtn ' + (activeTab === 'squadra' ? 'is-active' : '') + '" data-tab="squadra">👥 Rosa</button>' +
            '<button type="button" class="es-coach-navbtn ' + (activeTab === 'allenamenti' ? 'is-active' : '') + '" data-tab="allenamenti">⏱️ Sedute</button>' +
            '<button type="button" class="es-coach-navbtn ' + (activeTab === 'lavagna' ? 'is-active' : '') + '" data-tab="lavagna">📐 Lavagna Tattica</button>' +
          '</nav>' +

          // Content Tab Container
          '<div id="vice-tab-content-area" class="es-coach-content-area">' +
            renderTabContent(activeTab, data) +
          '</div>' +

        '</div>' +
      '</div>';

    mount.innerHTML = html;
    bindHubEvents();
  }

  function renderTabContent(tab, data) {
    if (tab === 'identita') return renderTabIdentita(data);
    if (tab === 'specializzazione') return renderTabSpecializzazione(data);
    if (tab === 'workstation') return renderTabWorkstation(data);
    if (tab === 'bozza_top11') return renderTabBozzaTop11(data);
    if (tab === 'gps_heatmap') return renderTabGpsHeatmap(data);
    if (tab === 'squadra') return renderTabSquadra(data);
    if (tab === 'allenamenti') return renderTabAllenamenti(data);
    if (tab === 'lavagna') return renderTabLavagna(data);
    return '<div class="es-coach-card">Sezione in caricamento...</div>';
  }

  // 1. TAB IDENTITÀ & MISTER
  function renderTabIdentita(data) {
    var m = data.misterLink || {};
    var isDisp = data.status === 'disponibile';

    return (
      '<div class="es-coach-grid-2">' +
        // Card Dati Vice
        '<div class="es-coach-card">' +
          '<div class="es-coach-card-head">' +
            '<div class="es-coach-card-title-wrap"><span class="es-coach-card-icon">🪪</span><div><h3>Dati Identificativi Vice Allenatore</h3><p>Profilo professionale e abilitazione tecnica FIGC</p></div></div>' +
            '<button type="button" class="es-coach-action-btn" id="btn-edit-vice-identity">✏️ Modifica</button>' +
          '</div>' +
          '<table class="es-coach-info-table">' +
            '<tr><th>NOME E COGNOME</th><td><b>' + esc(data.viceName) + '</b></td></tr>' +
            '<tr><th>QUALIFICA / TESSERAMENTO</th><td><span class="es-tag es-tag-blue">' + esc(data.patent) + '</span></td></tr>' +
            '<tr><th>STATUS ATTUALE</th><td><span class="' + (isDisp ? 'es-tag es-tag-gold' : 'es-tag es-tag-green') + '">' + (isDisp ? '● Disponibile / Cerca Staff' : '● In carica presso ' + esc(data.clubName)) + '</span></td></tr>' +
            '<tr><th>SEDE / CITTÀ</th><td>' + esc(data.sede) + '</td></tr>' +
            '<tr><th>TELEFONO / CONTATTO</th><td>' + esc(data.telefono) + '</td></tr>' +
          '</table>' +
        '</div>' +

        // Card Collegamento Diretto con l'Allenatore Capo
        '<div class="es-coach-card es-coach-card-highlight">' +
          '<div class="es-coach-card-head">' +
            '<div class="es-coach-card-title-wrap"><span class="es-coach-card-icon">👑</span><div><h3>Allenatore Capo (Collegamento Diretto)</h3><p>Link bidirezionale ufficiale con il Mister con cui fai coppia</p></div></div>' +
            '<button type="button" class="es-coach-action-btn" id="btn-link-mister-modal">🔗 Modifica Mister</button>' +
          '</div>' +
          (m.name ? (
            '<div class="es-coach-vice-box">' +
              '<div class="es-coach-vice-avatar" style="background:#1e3a8a; color:#93c5fd;">⚽</div>' +
              '<div class="es-coach-vice-info">' +
                '<h4 class="es-coach-vice-name">' + esc(m.name) + '</h4>' +
                '<p class="es-coach-vice-sub">' + esc(m.role) + ' · Qualifica: <b>' + esc(m.patent || 'UEFA Pro') + '</b></p>' +
                '<div style="display:flex; gap:0.5rem; margin-top:0.4rem;">' +
                  '<span class="es-tag es-tag-green">✓ Binomio di Staff Confermato</span>' +
                '</div>' +
              '</div>' +
              '<button type="button" class="es-btn-primary" id="btn-view-mister-card" style="padding:6px 12px; font-size:0.8rem;">Apri Scheda Mister &rarr;</button>' +
            '</div>'
          ) : (
            '<div class="es-coach-empty-box"><p>Nessun Allenatore Capo collegato.</p><button type="button" class="es-btn-primary" id="btn-link-mister-modal-2">+ Collega Allenatore Capo</button></div>'
          )) +
        '</div>' +

        // Card Palmarès Vice
        '<div class="es-coach-card" style="grid-column:1 / -1;">' +
          '<div class="es-coach-card-head">' +
            '<div class="es-coach-card-title-wrap"><span class="es-coach-card-icon">🏆</span><div><h3>Bacheca Palmarès & Storico Staff</h3><p>Trofei e promozioni conquistati specificando il ruolo di Vice</p></div></div>' +
            '<button type="button" class="es-coach-action-btn" id="btn-add-palmares-vice">+ Aggiungi Titolo</button>' +
          '</div>' +
          '<div class="es-coach-trofei-grid">' +
            (data.palmares && data.palmares.length ? data.palmares.map(function (pal) {
              return (
                '<div class="es-coach-trofeo-card">' +
                  '<div class="es-coach-trofeo-icon">🥈</div>' +
                  '<div class="es-coach-trofeo-content">' +
                    '<h4 class="es-coach-trofeo-title">' + esc(pal.titolo) + '</h4>' +
                    '<div class="es-coach-trofeo-meta"><span class="es-tag es-tag-gold">' + esc(pal.anno) + '</span> <span class="es-tag es-tag-dark">' + esc(pal.tipo) + '</span></div>' +
                    '<p class="es-coach-trofeo-notes">' + esc(pal.note || '') + '</p>' +
                  '</div>' +
                '</div>'
              );
            }).join('') : '<p class="es-coach-empty-text">Nessun titolo inserito.</p>') +
          '</div>' +
        '</div>' +

        // Limiti di Ruolo Vice
        '<div class="es-coach-card" style="grid-column:1 / -1; background:#070d14; border-color:rgba(148,163,184,0.2);">' +
          '<div class="es-coach-card-head">' +
            '<div class="es-coach-card-title-wrap"><span class="es-coach-card-icon">⚖️</span><div><h3>Limiti di Ruolo del Vice Allenatore</h3><p>Conformità gerarchica all\'interno dello staff tecnico</p></div></div>' +
          '</div>' +
          '<div class="es-coach-limits-grid">' +
            '<div class="es-coach-limit-item"><span class="es-coach-limit-icon is-ok">✓</span><div><b>Autonomia Metodologica:</b> Creazione e gestione schede workstation, conduzione riscaldamento e palle inattive.</div></div>' +
            '<div class="es-coach-limit-item"><span class="es-coach-limit-icon is-warn">⚠️</span><div><b>Ufficializzazione Formazione:</b> Può preparare la bozza dell\'XI ma non può ufficializzare la formazione senza la convalida dell\'Allenatore Capo.</div></div>' +
            '<div class="es-coach-limit-item"><span class="es-coach-limit-icon is-warn">⚠️</span><div><b>Struttura Societaria:</b> Non può modificare dati o profili ufficiali del club.</div></div>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  // 2. TAB SPECIALIZZAZIONE
  function renderTabSpecializzazione(data) {
    return (
      '<div class="es-coach-card">' +
        '<div class="es-coach-card-head">' +
          '<div class="es-coach-card-title-wrap"><span class="es-coach-card-icon">🎯</span><div><h3>Aree di Specializzazione Tecnica</h3><p>Competenze operative chiave e valore aggiunto per lo staff del Mister</p></div></div>' +
        '</div>' +

        '<div class="es-vice-specs-grid">' +
          (data.specializzazioni || []).map(function (sp) {
            return (
              '<div class="es-vice-spec-card">' +
                '<div class="es-vice-spec-icon">' + sp.icon + '</div>' +
                '<div class="es-vice-spec-info">' +
                  '<h4 class="es-vice-spec-title">' + esc(sp.nome) + '</h4>' +
                  '<span class="es-tag es-tag-blue">' + esc(sp.livello) + '</span>' +
                '</div>' +
              '</div>'
            );
          }).join('') +
        '</div>' +
      '</div>'
    );
  }

  // 3. TAB WORKSTATION
  function renderTabWorkstation(data) {
    return (
      '<div class="es-coach-card">' +
        '<div class="es-coach-card-head">' +
          '<div class="es-coach-card-title-wrap"><span class="es-coach-card-icon">📋</span><div><h3>Schede Workstation & Sedute Pre-Campo</h3><p>Organizzazione esercitazioni mirate (Rondos, pressione, schemi da fermo) per i calciatori</p></div></div>' +
          '<button type="button" class="es-btn-primary" id="btn-new-workstation-modal">+ Nuova Scheda Workstation</button>' +
        '</div>' +

        '<div class="es-exercises-grid">' +
          (data.workstations && data.workstations.length ? data.workstations.map(function (ws) {
            return (
              '<div class="es-exercise-card is-public">' +
                '<div class="es-exercise-head">' +
                  '<span class="es-tag es-tag-blue">' + esc(ws.categoria) + '</span>' +
                  '<span class="es-tag es-tag-gold">Target: ' + esc(ws.target) + '</span>' +
                '</div>' +
                '<h4 class="es-exercise-title">' + esc(ws.titolo) + '</h4>' +
                '<p class="es-exercise-desc">' + esc(ws.descrizione) + '</p>' +
                '<div class="es-exercise-foot">' +
                  '<span style="font-size:0.78rem; color:#94a3b8;">⏱️ ' + esc(ws.durata) + '</span>' +
                  '<span class="es-tag es-tag-green">Pronta per il campo</span>' +
                '</div>' +
              '</div>'
            );
          }).join('') : '<p class="es-coach-empty-text">Nessuna workstation creata.</p>') +
        '</div>' +
      '</div>'
    );
  }

  // 4. TAB BOZZA TOP 11
  function renderTabBozzaTop11(data) {
    return (
      '<div class="es-coach-card">' +
        '<div class="es-coach-card-head">' +
          '<div class="es-coach-card-title-wrap"><span class="es-coach-card-icon">⚽</span><div><h3>Bozza Formazione della Settimana (Supporto Tecnico)</h3><p>Proposta dell\'XI titolare preparata dal Vice per la revisione e convalida del Mister</p></div></div>' +
          '<button type="button" class="es-btn-primary" id="btn-send-draft-to-mister">📤 Invia Bozza all\'Allenatore Capo</button>' +
        '</div>' +

        '<table class="es-coach-info-table">' +
          '<thead><tr><th>POS</th><th>NUM</th><th>CALCIATORE</th><th>RUOLO</th><th>NOTE TATTICHE DEL VICE</th></tr></thead>' +
          '<tbody>' +
            (data.bozzaTop11 || []).map(function (b) {
              return (
                '<tr>' +
                  '<td><span class="es-tag es-tag-blue">' + esc(b.pos) + '</span></td>' +
                  '<td>#' + esc(b.num) + '</td>' +
                  '<td><b>' + esc(b.name) + '</b></td>' +
                  '<td>' + (b.pos === 'POR' ? 'Portiere' : (b.pos === 'ATT' ? 'Attaccante' : 'Giocatore')) + '</td>' +
                  '<td style="color:#cbd5e1; font-size:0.82rem;">' + esc(b.note) + '</td>' +
                '</tr>'
              );
            }).join('') +
          '</tbody>' +
        '</table>' +
      '</div>'
    );
  }

  // 5. TAB CO-GESTIONE GPS & HEATMAP
  function renderTabGpsHeatmap(data) {
    return (
      '<div class="es-coach-grid-2">' +
        '<div class="es-coach-card">' +
          '<div class="es-coach-card-head">' +
            '<div class="es-coach-card-title-wrap"><span class="es-coach-card-icon">⚡</span><div><h3>Co-Gestione Dashboard GPS</h3><p>Rilevazione affaticamento e picchi atletici da segnalare al Mister</p></div></div>' +
          '</div>' +
          '<div style="padding:0.75rem; background:#040810; border-left:3px solid #facc15; border-radius:4px; margin-bottom:1rem;">' +
            '<b style="color:#facc15;">Alert Affaticamento Settimanale:</b><br>' +
            '<span style="font-size:0.82rem; color:#cbd5e1;">Scamacca ha raggiunto 9.5 km dopo il rientro. Consigliata gestione minutaggio nella rifinitura.</span>' +
          '</div>' +
          '<table class="es-coach-info-table">' +
            '<tr><th>ATLETA</th><th>KM</th><th>PICCO KM/H</th><th>ALERT VICE</th></tr>' +
            '<tr><td><b>Éderson</b></td><td>11.8</td><td>31.4</td><td><span class="es-tag es-tag-green">🟢 OK</span></td></tr>' +
            '<tr><td><b>Lookman</b></td><td>10.4</td><td>34.8</td><td><span class="es-tag es-tag-green">🟢 Top Sprint</span></td></tr>' +
            '<tr><td><b>Scamacca</b></td><td>9.5</td><td>31.0</td><td><span class="es-tag es-tag-gold">🟡 Monitorare</span></td></tr>' +
          '</table>' +
        '</div>' +

        '<div class="es-coach-card">' +
          '<div class="es-coach-card-head">' +
            '<div class="es-coach-card-title-wrap"><span class="es-coach-card-icon">🔥</span><div><h3>Analisi Heatmap Individuali</h3><p>Verifica rispetto consegne individuali (ampiezza e densità)</p></div></div>' +
          '</div>' +
          '<div class="es-heatmap-overlay-wrap">' +
            '<div class="es-heatmap-pitch-bg">' +
              '<div class="es-heatmap-glow-zone is-left"></div>' +
              '<div class="es-heatmap-glow-zone is-right"></div>' +
              '<div class="es-heatmap-badge-text">Consegne Esterne Rispettate (Ampiezza 92%)</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  // 6. TAB SQUADRA
  function renderTabSquadra(data) {
    return (
      '<div class="es-coach-card">' +
        '<div class="es-coach-card-head">' +
          '<div class="es-coach-card-title-wrap"><span class="es-coach-card-icon">👥</span><div><h3>Organico Rosa</h3><p>Consultazione calciatori e disponibilità atletica</p></div></div>' +
        '</div>' +
        '<div class="es-roster-grid">' +
          (data.roster || []).map(function (p) {
            return (
              '<div class="es-roster-player-card">' +
                '<div class="es-roster-num-box">' + esc(p.num) + '</div>' +
                '<div class="es-roster-player-info">' +
                  '<h4 class="es-roster-player-name">' + esc(p.name) + '</h4>' +
                  '<div class="es-roster-player-meta">' + esc(p.role) + '</div>' +
                '</div>' +
              '</div>'
            );
          }).join('') +
        '</div>' +
      '</div>'
    );
  }

  // 7. TAB ALLENAMENTI
  function renderTabAllenamenti(data) {
    return (
      '<div class="es-coach-card">' +
        '<div class="es-coach-card-head">' +
          '<div class="es-coach-card-title-wrap"><span class="es-coach-card-icon">⏱️</span><div><h3>Sedute di Allenamento</h3><p>Supporto alla pianificazione delle workstation sul campo</p></div></div>' +
        '</div>' +
        '<p style="color:#94a3b8; font-size:0.86rem;">Le sedute sono sincronizzate in tempo reale con l\'Hub dell\'Allenatore Capo.</p>' +
      '</div>'
    );
  }

  // 8. TAB LAVAGNA
  function renderTabLavagna(data) {
    return (
      '<div class="es-coach-card">' +
        '<div class="es-coach-card-head">' +
          '<div class="es-coach-card-title-wrap"><span class="es-coach-card-icon">📐</span><div><h3>Lavagna Tattica Condivisa</h3><p>Studio schemi su palle inattive e movimenti difensivi</p></div></div>' +
        '</div>' +
        '<div class="es-tactical-board-frame">' +
          '<div class="es-tactical-canvas-placeholder">' +
            '<p style="color:#7dd3fc; font-weight:800; font-size:1.1rem; margin:0 0 0.4rem;">Lavagna Tattica Staff Attiva</p>' +
            '<p style="color:#94a3b8; font-size:0.85rem; margin:0;">Area di studio condivisa con l\'Allenatore Capo.</p>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  // MODALI B2B VICE
  function openViceModal(title, iconText, contentHtml) {
    var old = document.getElementById('es-vice-modal-overlay');
    if (old) old.remove();

    var modal = document.createElement('div');
    modal.id = 'es-vice-modal-overlay';
    modal.className = 'es-pres-modal-overlay';
    modal.innerHTML =
      '<div class="es-pres-modal-sheet" role="dialog" aria-modal="true" style="border-radius:4px !important; max-width:640px; background:#090e17; border:1px solid rgba(56,189,248,0.3);">' +
        '<button type="button" class="es-pres-modal-close-btn" id="btn-close-vice-modal" aria-label="Chiudi">&times;</button>' +
        '<div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:1.2rem; padding-bottom:0.65rem; border-bottom:1px solid rgba(148,163,184,0.15);">' +
          '<span style="font-size:1.3rem;">' + iconText + '</span>' +
          '<h2 style="font-size:1.2rem; font-weight:800; color:#ffffff; margin:0;">' + esc(title) + '</h2>' +
        '</div>' +
        '<div>' + contentHtml + '</div>' +
      '</div>';

    document.body.appendChild(modal);
    function close() { modal.remove(); }
    modal.querySelector('#btn-close-vice-modal').onclick = close;
    modal.onclick = function (e) { if (e.target === modal) close(); };
  }

  function openEditViceIdentityModal(data) {
    var isDisp = data.status === 'disponibile';
    var formHtml =
      '<form id="form-edit-vice-id" style="display:flex; flex-direction:column; gap:1rem;">' +
        '<div class="es-pres-input-group"><label>Nome e Cognome *</label><input type="text" class="es-pres-input-text" id="inp-v-name" value="' + esc(data.viceName) + '" required></div>' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
          '<div class="es-pres-input-group"><label>Qualifica / Licenza</label><input type="text" class="es-pres-input-text" id="inp-v-patent" value="' + esc(data.patent) + '"></div>' +
          '<div class="es-pres-input-group"><label>Status</label><select class="es-pres-input-text" id="sel-v-status" style="background:#040810; color:#fff;"><option value="in_carica" ' + (!isDisp ? 'selected' : '') + '>In carica</option><option value="disponibile" ' + (isDisp ? 'selected' : '') + '>Disponibile</option></select></div>' +
        '</div>' +
        '<div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:0.5rem; padding-top:0.85rem; border-top:1px solid rgba(148,163,184,0.15);">' +
          '<button type="button" class="es-pres-btn-secondary" id="btn-cancel-modal">Annulla</button>' +
          '<button type="submit" class="es-pres-btn-primary">Salva Dati</button>' +
        '</div>' +
      '</form>';

    openViceModal('Modifica Identità Vice Allenatore', '🪪', formHtml);
    var overlay = document.getElementById('es-vice-modal-overlay');
    var form = document.getElementById('form-edit-vice-id');
    var btnCancel = document.getElementById('btn-cancel-modal');
    if (btnCancel && overlay) btnCancel.onclick = function () { overlay.remove(); };

    if (form) {
      form.onsubmit = function (e) {
        e.preventDefault();
        data.viceName = document.getElementById('inp-v-name').value.trim();
        data.patent = document.getElementById('inp-v-patent').value.trim();
        data.status = document.getElementById('sel-v-status').value;
        saveViceData(data);
        if (overlay) overlay.remove();
        renderHub();
        if (window.showToast) window.showToast('Dati salvati!', 'success');
      };
    }
  }

  function openLinkMisterModal(data) {
    var m = data.misterLink || {};
    var formHtml =
      '<p style="color:#94a3b8; font-size:0.85rem; margin-bottom:1.2rem;">Inserisci i dati dell\'Allenatore Capo con cui fai coppia per attivare il collegamento di staff:</p>' +
      '<form id="form-link-mister" style="display:flex; flex-direction:column; gap:1rem;">' +
        '<div class="es-pres-input-group"><label>Nome Allenatore Capo *</label><input type="text" class="es-pres-input-text" id="inp-m-name" value="' + esc(m.name || '') + '" required></div>' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
          '<div class="es-pres-input-group"><label>Qualifica / Patentino</label><input type="text" class="es-pres-input-text" id="inp-m-patent" value="' + esc(m.patent || 'UEFA Pro') + '"></div>' +
          '<div class="es-pres-input-group"><label>Email Account Mister</label><input type="email" class="es-pres-input-text" id="inp-m-email" value="' + esc(m.email || '') + '"></div>' +
        '</div>' +
        '<div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:0.5rem; padding-top:0.85rem; border-top:1px solid rgba(148,163,184,0.15);">' +
          '<button type="button" class="es-pres-btn-secondary" id="btn-cancel-modal">Annulla</button>' +
          '<button type="submit" class="es-pres-btn-primary">Salva & Collega Mister</button>' +
        '</div>' +
      '</form>';

    openViceModal('Collegamento Diretto con Allenatore Capo', '👑', formHtml);
    var overlay = document.getElementById('es-vice-modal-overlay');
    var form = document.getElementById('form-link-mister');
    var btnCancel = document.getElementById('btn-cancel-modal');
    if (btnCancel && overlay) btnCancel.onclick = function () { overlay.remove(); };

    if (form) {
      form.onsubmit = function (e) {
        e.preventDefault();
        data.misterLink = {
          id: 'mister-' + Date.now(),
          name: document.getElementById('inp-m-name').value.trim(),
          role: 'Allenatore Capo',
          patent: document.getElementById('inp-m-patent').value.trim(),
          email: document.getElementById('inp-m-email').value.trim(),
          status: 'Collegato'
        };
        saveViceData(data);
        if (overlay) overlay.remove();
        renderHub();
        if (window.showToast) window.showToast('Allenatore Capo collegato ufficialmente!', 'success');
      };
    }
  }

  function openNewWorkstationModal(data) {
    var formHtml =
      '<form id="form-new-ws" style="display:flex; flex-direction:column; gap:1rem;">' +
        '<div class="es-pres-input-group"><label>Titolo Workstation *</label><input type="text" class="es-pres-input-text" id="inp-ws-title" required placeholder="Es. Workstation 3: Palle inattive offensive"></div>' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
          '<div class="es-pres-input-group"><label>Categoria</label><select class="es-pres-input-text" id="sel-ws-cat" style="background:#040810; color:#fff;"><option>Palle Inattive</option><option>Fase Difensiva & Reparti</option><option>Rondos & Pressione</option><option>Attivazione Tattica</option></select></div>' +
          '<div class="es-pres-input-group"><label>Target Calciatori</label><input type="text" class="es-pres-input-text" id="inp-ws-target" value="Titolari & Difensori"></div>' +
        '</div>' +
        '<div class="es-pres-input-group"><label>Descrizione Operativa</label><textarea class="es-pres-input-text" id="inp-ws-desc" rows="3" placeholder="Istruzioni per i giocatori..."></textarea></div>' +
        '<div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:0.5rem; padding-top:0.85rem; border-top:1px solid rgba(148,163,184,0.15);">' +
          '<button type="button" class="es-pres-btn-secondary" id="btn-cancel-modal">Annulla</button>' +
          '<button type="submit" class="es-pres-btn-primary">Salva Workstation</button>' +
        '</div>' +
      '</form>';

    openViceModal('Nuova Scheda Workstation', '📋', formHtml);
    var overlay = document.getElementById('es-vice-modal-overlay');
    var form = document.getElementById('form-new-ws');
    var btnCancel = document.getElementById('btn-cancel-modal');
    if (btnCancel && overlay) btnCancel.onclick = function () { overlay.remove(); };

    if (form) {
      form.onsubmit = function (e) {
        e.preventDefault();
        data.workstations = data.workstations || [];
        data.workstations.unshift({
          id: 'ws-' + Date.now(),
          titolo: document.getElementById('inp-ws-title').value.trim(),
          categoria: document.getElementById('sel-ws-cat').value,
          target: document.getElementById('inp-ws-target').value.trim(),
          durata: '20 min',
          descrizione: document.getElementById('inp-ws-desc').value.trim()
        });
        saveViceData(data);
        if (overlay) overlay.remove();
        renderHub();
        if (window.showToast) window.showToast('Scheda workstation salvata!', 'success');
      };
    }
  }

  function openGuidaViceModal() {
    var contentHtml =
      '<div style="color:#e2e8f0; font-size:0.86rem; line-height:1.6; display:flex; flex-direction:column; gap:0.8rem;">' +
        '<div style="padding:0.75rem; background:#040810; border-left:3px solid #38bdf8; border-radius:4px;">' +
          '<b style="color:#38bdf8;">Ruolo Vice Allenatore su Elisee Scout:</b><br>' +
          'Specialista di campo per palle inattive, fase difensiva, studio avversari, preparazione schede workstation e co-gestione della dashboard GPS.' +
        '</div>' +
        '<p><b>1. Collegamento con il Mister:</b> Crea il binomio ufficiale di staff con link diretto al profilo dell\'Allenatore Capo.</p>' +
        '<p><b>2. Schede Workstation:</b> Prepara gli esercizi della settimana prima della seduta sul campo.</p>' +
        '<p><b>3. Bozza Formazione:</b> Suggerisci la formazione ideale al Mister prima dell\'ufficializzazione finale.</p>' +
      '</div>';
    openViceModal('Guida Operativa Vice Allenatore', '📖', contentHtml);
  }

  function bindHubEvents() {
    var mount = document.getElementById('es-vd');
    if (!mount) return;

    var data = getViceData();

    mount.querySelectorAll('.es-coach-navbtn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var t = btn.getAttribute('data-tab');
        if (t) {
          activeTab = t;
          renderHub();
        }
      });
    });

    var btnGuida = mount.querySelector('#btn-guida-vice');
    if (btnGuida) btnGuida.onclick = openGuidaViceModal;

    var btnQuickWs = mount.querySelector('#btn-quick-new-ws');
    if (btnQuickWs) btnQuickWs.onclick = function () { openNewWorkstationModal(data); };

    var btnNewWs2 = mount.querySelector('#btn-new-workstation-modal');
    if (btnNewWs2) btnNewWs2.onclick = function () { openNewWorkstationModal(data); };

    var btnEditViceId = mount.querySelector('#btn-edit-vice-identity');
    if (btnEditViceId) btnEditViceId.onclick = function () { openEditViceIdentityModal(data); };

    var btnLinkMister = mount.querySelector('#btn-link-mister-modal');
    if (btnLinkMister) btnLinkMister.onclick = function () { openLinkMisterModal(data); };

    var btnLinkMister2 = mount.querySelector('#btn-link-mister-modal-2');
    if (btnLinkMister2) btnLinkMister2.onclick = function () { openLinkMisterModal(data); };

    var btnViewMister = mount.querySelector('#btn-view-mister-card');
    if (btnViewMister) {
      btnViewMister.onclick = function () {
        if (window.showToast) window.showToast('Apertura scheda Allenatore Capo: ' + (data.misterLink ? data.misterLink.name : ''), 'info');
      };
    }

    var btnDirectMister = mount.querySelector('#btn-open-mister-direct');
    if (btnDirectMister) {
      btnDirectMister.onclick = function () {
        if (window.showToast) window.showToast('Apertura scheda Allenatore Capo: ' + (data.misterLink ? data.misterLink.name : ''), 'info');
      };
    }

    var btnSendDraft = mount.querySelector('#btn-send-draft-to-mister');
    if (btnSendDraft) {
      btnSendDraft.onclick = function () {
        if (window.showToast) window.showToast('📤 Bozza Top 11 inviata all\'Allenatore Capo per la convalida!', 'success');
      };
    }
  }

  window.EliseeViceDash = {
    render: renderHub,
    isVice: isVice,
    getData: getViceData,
    saveData: saveViceData
  };

  document.addEventListener('DOMContentLoaded', function () {
    var u = userObj();
    if (isVice(u)) renderHub();
  });
})();
