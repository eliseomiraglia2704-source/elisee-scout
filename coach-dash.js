/* ============================================================
   ELISEE SCOUT — AREA ALLENATORE (MISTER HUB)
   Profilo Ufficiale da Documento di Piattaforma:
   - Identità, Patentino UEFA, Status Disponibile / In carica
   - Collegamento Diretto Bidirezionale con il Vice Allenatore
   - Moduli Preferiti (Principale / Secondario) & Mappa Posizionale FM
   - Formazione della Settimana (Top 11) con apertura Player Card e Condivisione Story Social 9:16 (Instagram / TikTok)
   - Hub Esercitazioni Pre-Partita con toggle Privato (Solo tesserati) vs Pubblico (Personal Branding per Colleghi & DS)
   - Bacheca Digitale Trofei & Palmarès
   - Dashboard GPS Squadra & Analisi Heatmap Tattica Sovrapposta
   - Segnalazione Calciomercato al DS (Wishlist)
   - Rosa, Allenamenti interattivi con Presenze, Partite, Convocazioni e Lavagna Tattica
   - Limiti di Ruolo Ufficiali
   ============================================================ */
(function () {
  'use strict';

  var activeTab = 'identita'; // 'identita' | 'tattica' | 'metodologia' | 'gps_heatmap' | 'segnalazioni_ds' | 'squadra' | 'allenamenti' | 'partite' | 'lavagna'
  var currentPitchType = 'full';
  var currentElemSize = 'M';

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
      coachName: [u.nome, u.cognome].filter(Boolean).join(' ').trim() || u.username || 'Allenatore Capo',
      coachRole: u.staffRole || 'Allenatore',
      patent: u.qualifica || (u.staffProfile && u.staffProfile.qualifica) || 'UEFA A',
      status: u.status || 'in_carica', // 'in_carica' | 'disponibile'
      clubName: u.squadra || u.club || 'Atalanta Bergamasca Calcio',
      matricola: u.matricola || 'FIGC-71829',
      sede: u.sede || 'Bergamo (BG)',
      stadio: u.stadio || 'Gewiss Stadium',
      telefono: u.telefono || '+39 035 123456',
      logoUrl: u.logoUrl || 'immagini/squadre-loghi/foggia.png',
      teamPhotoUrl: '',
      // Collegamento Diretto Vice Allenatore
      viceLink: {
        id: 'vice-official-1',
        name: 'Paolo Gentile',
        role: 'Vice Allenatore / Allenatore in seconda',
        patent: 'UEFA B',
        email: 'paolo.gentile@elisee-scout.it',
        status: 'Collegato'
      },
      // Moduli & Tattica FM
      moduloPrincipale: '4-3-3',
      moduloSecondario: '4-2-3-1',
      filosofiaTattica: 'Costruzione dal basso, ampiezza con ali alte, pressing ultra-offensivo a tutto campo.',
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
        { pos: 'CC', num: 6, name: 'Sulemana', role: 'Centrocampista' },
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
          visibilita: 'public', // 'public' | 'private'
          descrizione: 'Gabbia 15x15m. Circolazione a 2 tocchi massimi, cambio orientamento e ricerca della verticalizzazione immediata appena si recupera palla.',
          data: '26/08/2026'
        },
        {
          id: 'es-2',
          titolo: 'Schema da Calcio d’Angolo: Blocco sul Primo Palo & Inserimento Mezzala',
          categoria: 'Palle Inattive',
          durata: '15 min',
          visibilita: 'private',
          descrizione: 'Movimento a specchio: attaccante blocca il marcatore, taglio sul dischetto della mezzala a rimorchio.',
          data: '25/08/2026'
        },
        {
          id: 'es-3',
          titolo: 'Attivazione Tattica Pre-Gara & Allunghi Progressivi',
          categoria: 'Riscaldamento Pre-Gara',
          durata: '25 min',
          visibilita: 'public',
          descrizione: 'Mobilità articolare dinamica + 3 blocchi da 4 serie di navette con cambi di direzione e scatti a 25m.',
          data: '24/08/2026'
        }
      ],
      // Bacheca Digitale Trofei & Palmarès
      palmares: [
        { id: 'pal-1', titolo: 'Vincitore UEFA Europa League', anno: '2023/2024', tipo: 'Internazionale', note: 'Finale vinta 3-0 a Dublino' },
        { id: 'pal-2', titolo: 'Qualificazione UEFA Champions League', anno: '2024/2025', tipo: 'Campionato Serie A', note: 'Piazzamento nelle prime 4' },
        { id: 'pal-3', titolo: 'Vincitore Campionato Primavera 1', anno: '2019/2020', tipo: 'Titolo Giovanile', note: 'Scudetto Primavera' }
      ],
      // Segnalazioni Calciomercato per il DS
      wishlistDs: [
        { id: 'wl-1', nome: 'Lorenzo Lucca', ruolo: 'Punta Centrale', club: 'Udinese', priorita: 'Alta', note: 'Forte nel gioco aereo, perfetto per il nostro 4-3-3', data: '25/08/2026', stato: 'In valutazione DS' },
        { id: 'wl-2', nome: 'Giovanni Fabbian', ruolo: 'Mezzala Inserimento', club: 'Bologna', priorita: 'Media', note: 'Grande senso del gol e tempi di inserimento', data: '20/08/2026', stato: 'Contattato' }
      ],
      // Rosa per la gestione
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
        { num: 9, name: 'Gianluca Scamacca', role: 'Punta Centrale', birth: 1999, app: 24, status: 'disp' }
      ],
      staffMembers: [
        { name: 'Paolo Gentile', role: 'Vice Allenatore', patent: 'UEFA B', exp: '2027-06-30' },
        { name: 'Marco De Luca', role: 'Preparatore dei Portieri', patent: 'UEFA GK', exp: '2027-06-30' },
        { name: 'Elena Santoro', role: 'Preparatore Atletico', patent: 'FIGC Preparatore', exp: '2027-06-30' },
        { name: 'Davide Colombo', role: 'Match Analyst', patent: 'FIGC Video Analyst', exp: '2027-06-30' }
      ],
      trainingsList: [
        {
          id: 'tr-1',
          data: '28/08/2026',
          orario: '15:30',
          luogo: 'Centro Sportivo Bortolotti - Campo 1',
          tipo: 'Seduta Tattica & Palle Inattive',
          desc: 'Rifinitura pre-partita: schemi d’angolo e movimenti offensivi.',
          voti: { 'user-1': 'yes', 'user-2': 'yes', 'user-3': 'maybe' }
        },
        {
          id: 'tr-2',
          data: '30/08/2026',
          orario: '10:00',
          luogo: 'Palestra & Campo Principale',
          tipo: 'Forza & Lavoro Aerobico',
          desc: 'Lavoro differenziato per reparti + scarico post-partita.',
          voti: { 'user-1': 'yes', 'user-2': 'no' }
        }
      ],
      partite: [
        {
          id: 'part-1',
          avversario: 'Juventus F.C.',
          data: '29/08/2026',
          orario: '20:45',
          luogo: 'Gewiss Stadium (Casa)',
          competizione: 'Serie A 2026/27 - 2ª Giornata',
          convocati: [1, 19, 4, 77, 22, 15, 13, 8, 17, 11, 9, 28, 3, 6, 10, 32]
        }
      ],
      tacticalSchemes: []
    };

    try {
      var stored = localStorage.getItem('elisee_coach_hub_data_v4');
      if (stored) {
        var parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') return Object.assign(def, parsed);
      }
    } catch (_) {}
    return def;
  }

  function saveCoachData(data) {
    try {
      localStorage.setItem('elisee_coach_hub_data_v4', JSON.stringify(data));
      localStorage.setItem('elisee_coach_hub_data_v3', JSON.stringify(data));
      if (data.trainingsList) {
        localStorage.setItem('elisee_club_trainings_shared', JSON.stringify(data.trainingsList));
      }
    } catch (_) {}
  }

  var TAB_DESCS = {
    identita: 'Carta d\'identità professionale, qualifica UEFA, status contrattuale, collegamento diretto con il Vice Allenatore e bacheca trofei.',
    tattica: 'Filosofia di gioco, moduli preferiti, Mappa Posizionale FM e Formazione della Settimana (Top 11) con esportazione Story 9:16 per Instagram/TikTok.',
    metodologia: 'Hub Esercitazioni: schemi, rondos, riscaldamento pre-gara con visibilità Privata (solo tesserati) o Pubblica (personal branding).',
    gps_heatmap: 'Monitoraggio carichi atletici GPS squadra e Analisi Heatmap Tattica sovrapposta per l\'occupazione degli spazi.',
    segnalazioni_ds: 'Segnalazione calciatori d\'interesse e suggerimenti tecnici inviati al Direttore Sportivo per la sessione di mercato.',
    squadra: 'Organico della rosa, numeri di maglia, stato di forma e convocazioni ufficiali.',
    allenamenti: 'Pianificazione sedute d\'allenamento, orari, presenze interattive con votanti.',
    partite: 'Calendario gare, distinta convocati e gestione della giornata di campionato.',
    lavagna: 'Lavagna tattica interattiva avanzata per schemi animati, disegno lavagna ed esportazione PDF.'
  };

  // ============================================================
  // RENDER DELL'HUB PRINCIPALE ALLENATORE
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

    var isDisp = data.status === 'disponibile';

    var html =
      '<div class="es-coach-hub">' +
        // Top Bar Ufficiale
        '<div class="es-coach-top-bar">' +
          '<div class="es-coach-top-left">' +
            '<span class="es-coach-badge-gold">👑 Mister Hub Ufficiale</span>' +
            '<span class="es-coach-top-title">Profilo Allenatore · ' + esc(data.coachName) + '</span>' +
          '</div>' +
          '<div class="es-coach-top-actions">' +
            '<span class="es-coach-status-tag ' + (isDisp ? 'is-disp' : 'is-busy') + '">' + (isDisp ? '● Disponibile / Cerca Progetto' : '● In carica: ' + esc(data.clubName)) + '</span>' +
            '<button type="button" class="es-coach-btn-guida" id="btn-guida-allenatore">📖 Guida di Ruolo</button>' +
          '</div>' +
        '</div>' +

        '<div class="es-coach-container">' +
          // Header Card Profilo
          '<div class="es-coach-header-card">' +
            '<div class="es-coach-header-main">' +
              '<div class="es-coach-avatar-wrap">' +
                '<div class="es-coach-avatar-box">⚽</div>' +
                '<span class="es-coach-avatar-tag">' + esc(data.patent) + '</span>' +
              '</div>' +
              '<div class="es-coach-header-info">' +
                '<div class="es-coach-tags-row">' +
                  '<span class="es-tag es-tag-blue">QUALIFICA: ' + esc(data.patent) + '</span>' +
                  '<span class="es-tag es-tag-dark">' + esc(data.matricola) + '</span>' +
                  '<span class="es-tag es-tag-green">MODULO: ' + esc(data.moduloPrincipale) + '</span>' +
                '</div>' +
                '<h1 class="es-coach-name-title">' + esc(data.coachName) + '</h1>' +
                '<p class="es-coach-lead-desc" id="coach-tab-desc-text">' + esc(TAB_DESCS[activeTab]) + '</p>' +
              '</div>' +
            '</div>' +
            '<div class="es-coach-header-cta">' +
              '<button type="button" class="es-btn-primary" id="btn-quick-story-export">📲 Esporta Top 11 Story</button>' +
              '<button type="button" class="es-btn-secondary" id="btn-quick-new-exercise">+ Nuova Esercitazione</button>' +
            '</div>' +
          '</div>' +

          // Navbar a 9 Schede / Macro-aree
          '<nav class="es-coach-navbar" role="tablist">' +
            '<button type="button" class="es-coach-navbtn ' + (activeTab === 'identita' ? 'is-active' : '') + '" data-tab="identita">🛡️ Identità & Staff</button>' +
            '<button type="button" class="es-coach-navbtn ' + (activeTab === 'tattica' ? 'is-active' : '') + '" data-tab="tattica">⚽ Tattica & Top 11</button>' +
            '<button type="button" class="es-coach-navbtn ' + (activeTab === 'metodologia' ? 'is-active' : '') + '" data-tab="metodologia">📋 Esercitazioni</button>' +
            '<button type="button" class="es-coach-navbtn ' + (activeTab === 'gps_heatmap' ? 'is-active' : '') + '" data-tab="gps_heatmap">📊 GPS & Heatmap</button>' +
            '<button type="button" class="es-coach-navbtn ' + (activeTab === 'segnalazioni_ds' ? 'is-active' : '') + '" data-tab="segnalazioni_ds">🎯 Segnalazione DS</button>' +
            '<button type="button" class="es-coach-navbtn ' + (activeTab === 'squadra' ? 'is-active' : '') + '" data-tab="squadra">👥 Rosa</button>' +
            '<button type="button" class="es-coach-navbtn ' + (activeTab === 'allenamenti' ? 'is-active' : '') + '" data-tab="allenamenti">⏱️ Sedute & Presenze</button>' +
            '<button type="button" class="es-coach-navbtn ' + (activeTab === 'partite' ? 'is-active' : '') + '" data-tab="partite">🏆 Partite</button>' +
            '<button type="button" class="es-coach-navbtn ' + (activeTab === 'lavagna' ? 'is-active' : '') + '" data-tab="lavagna">📐 Lavagna Tattica</button>' +
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

  // ============================================================
  // RENDER SEZIONI SPECIFICHE TAB
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
            '<div class="es-coach-card-title-wrap"><span class="es-coach-card-icon">🪪</span><div><h3>Dati Identificativi & Licenza</h3><p>Carta d\'identità ufficiale per gestione squadra e mercato</p></div></div>' +
            '<button type="button" class="es-coach-action-btn" id="btn-edit-coach-identity">✏️ Modifica</button>' +
          '</div>' +
          '<table class="es-coach-info-table">' +
            '<tr><th>NOME E COGNOME</th><td><b>' + esc(data.coachName) + '</b></td></tr>' +
            '<tr><th>QUALIFICA / LICENZA</th><td><span class="es-tag es-tag-blue">' + esc(data.patent) + '</span></td></tr>' +
            '<tr><th>STATUS ATTUALE</th><td><span class="' + (isDisp ? 'es-tag es-tag-gold' : 'es-tag es-tag-green') + '">' + (isDisp ? '● Disponibile / Cerca Progetto' : '● In carica presso ' + esc(data.clubName)) + '</span></td></tr>' +
            '<tr><th>SEDE / RESIDENZA</th><td>' + esc(data.sede) + '</td></tr>' +
            '<tr><th>STADIO / CENTRO</th><td>' + esc(data.stadio) + '</td></tr>' +
            '<tr><th>CONTATTO SEGRETERIA</th><td>' + esc(data.telefono) + '</td></tr>' +
          '</table>' +
        '</div>' +

        // Card Collegamento Diretto Vice Allenatore
        '<div class="es-coach-card es-coach-card-highlight">' +
          '<div class="es-coach-card-head">' +
            '<div class="es-coach-card-title-wrap"><span class="es-coach-card-icon">🤝</span><div><h3>Vice Allenatore (Collegamento Diretto)</h3><p>Continuità e legame ufficiale di staff tecnico</p></div></div>' +
            '<button type="button" class="es-coach-action-btn" id="btn-link-vice-modal">🔗 Modifica Vice</button>' +
          '</div>' +
          (v.name ? (
            '<div class="es-coach-vice-box">' +
              '<div class="es-coach-vice-avatar">⏱️</div>' +
              '<div class="es-coach-vice-info">' +
                '<h4 class="es-coach-vice-name">' + esc(v.name) + '</h4>' +
                '<p class="es-coach-vice-sub">' + esc(v.role) + ' · Qualifica: <b>' + esc(v.patent || 'UEFA B') + '</b></p>' +
                '<div style="display:flex; gap:0.5rem; margin-top:0.4rem;">' +
                  '<span class="es-tag es-tag-green">✓ Account Ufficiale Collegato</span>' +
                '</div>' +
              '</div>' +
              '<button type="button" class="es-btn-primary" id="btn-open-vice-profile" style="padding:6px 12px; font-size:0.8rem;">Apri Scheda Vice &rarr;</button>' +
            '</div>'
          ) : (
            '<div class="es-coach-empty-box"><p>Nessun Vice Allenatore collegato ufficialmente.</p><button type="button" class="es-btn-primary" id="btn-link-vice-modal-2">+ Collega Vice Registrato</button></div>'
          )) +
        '</div>' +

        // Card Bacheca Trofei & Palmarès
        '<div class="es-coach-card" style="grid-column:1 / -1;">' +
          '<div class="es-coach-card-head">' +
            '<div class="es-coach-card-title-wrap"><span class="es-coach-card-icon">🏆</span><div><h3>Bacheca Digitale Trofei & Palmarès</h3><p>Storico successi in carriera: campionati, coppe e promozioni</p></div></div>' +
            '<button type="button" class="es-coach-action-btn" id="btn-add-trofeo-modal">+ Aggiungi Titolo</button>' +
          '</div>' +
          '<div class="es-coach-trofei-grid">' +
            (data.palmares && data.palmares.length ? data.palmares.map(function (pal, idx) {
              return (
                '<div class="es-coach-trofeo-card">' +
                  '<div class="es-coach-trofeo-icon">🥇</div>' +
                  '<div class="es-coach-trofeo-content">' +
                    '<h4 class="es-coach-trofeo-title">' + esc(pal.titolo) + '</h4>' +
                    '<div class="es-coach-trofeo-meta"><span class="es-tag es-tag-gold">' + esc(pal.anno) + '</span> <span class="es-tag es-tag-dark">' + esc(pal.tipo) + '</span></div>' +
                    '<p class="es-coach-trofeo-notes">' + esc(pal.note || '') + '</p>' +
                  '</div>' +
                  '<button type="button" class="es-coach-trofeo-del" data-del-pal-idx="' + idx + '" title="Elimina">&times;</button>' +
                '</div>'
              );
            }).join('') : '<p class="es-coach-empty-text">Nessun titolo inserito. Clicca su "+ Aggiungi Titolo" per valorizzare il tuo curriculum.</p>') +
          '</div>' +
        '</div>' +

        // Card Limiti di Ruolo dell'Allenatore
        '<div class="es-coach-card" style="grid-column:1 / -1; background:#070d14; border-color:rgba(148,163,184,0.2);">' +
          '<div class="es-coach-card-head">' +
            '<div class="es-coach-card-title-wrap"><span class="es-coach-card-icon">⚖️</span><div><h3>Limiti di Ruolo e Permessi Istituzionali</h3><p>Conformità organizzativa e gerarchia decisionale societaria</p></div></div>' +
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
            '<div class="es-coach-card-title-wrap"><span class="es-coach-card-icon">🧠</span><div><h3>Identità Tattica & Moduli Preferiti</h3><p>Assetto tattico teorico che alimenta la generazione automatica delle Heatmap</p></div></div>' +
            '<button type="button" class="es-coach-action-btn" id="btn-edit-tactics-modal">✏️ Modifica Moduli</button>' +
          '</div>' +
          '<div style="display:flex; gap:1rem; margin-bottom:1rem;">' +
            '<div class="es-coach-stat-box"><span class="es-coach-stat-num">' + esc(data.moduloPrincipale) + '</span><span class="es-coach-stat-lbl">MODULO PRINCIPALE</span></div>' +
            '<div class="es-coach-stat-box"><span class="es-coach-stat-num">' + esc(data.moduloSecondario) + '</span><span class="es-coach-stat-lbl">MODULO SECONDARIO</span></div>' +
          '</div>' +
          '<div class="es-coach-quote-box"><b>Filosofia di Gioco:</b> ' + esc(data.filosofiaTattica) + '</div>' +
        '</div>' +

        // Card Mappa Posizionale FM
        '<div class="es-coach-card">' +
          '<div class="es-coach-card-head">' +
            '<div class="es-coach-card-title-wrap"><span class="es-coach-card-icon">📌</span><div><h3>Mappa Posizionale stile Football Manager</h3><p>Disposizione teorica dei ruoli sul terreno di gioco</p></div></div>' +
          '</div>' +
          '<div class="es-fm-pitch-wrap">' +
            renderFmPitch(data.moduloPrincipale, data.top11) +
          '</div>' +
        '</div>' +

        // Card Formazione della Settimana (XI Titolare)
        '<div class="es-coach-card" style="grid-column:1 / -1;">' +
          '<div class="es-coach-card-head">' +
            '<div class="es-coach-card-title-wrap"><span class="es-coach-card-icon">⭐</span><div><h3>Formazione della Settimana (XI Titolare / Top 11)</h3><p>Clicca sui calciatori per aprire la Player Card ufficiale. Condividi su Instagram/TikTok in 1 click.</p></div></div>' +
            '<div style="display:flex; gap:0.5rem;">' +
              '<button type="button" class="es-btn-secondary" id="btn-edit-top11-modal">⚙️ Componi XI</button>' +
              '<button type="button" class="es-btn-primary" id="btn-export-story-modal">📲 Condividi Storia Social (9:16)</button>' +
            '</div>' +
          '</div>' +

          '<div class="es-top11-container">' +
            '<div class="es-top11-pitch">' +
              renderInteractiveTop11Pitch(data.top11) +
            '</div>' +
            '<div class="es-top11-bench-panel">' +
              '<h4 style="margin:0 0 0.6rem; font-size:0.95rem; color:#f8fafc; font-weight:800;">A Disposizione (Panchina Ufficiale)</h4>' +
              '<div class="es-top11-bench-list">' +
                (data.panchina || []).map(function (b, bIdx) {
                  return (
                    '<div class="es-top11-bench-item" data-open-player-card="' + esc(b.name) + '" title="Clicca per aprire la Card Ufficiale">' +
                      '<span class="es-top11-bench-num">' + esc(b.num) + '</span>' +
                      '<div style="flex:1;"><b>' + esc(b.name) + '</b><div style="font-size:0.75rem; color:#94a3b8;">' + esc(b.role) + '</div></div>' +
                      '<span class="es-tag es-tag-blue" style="font-size:0.7rem;">Card &rarr;</span>' +
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

  // 3. TAB ESERCITAZIONI & METODOLOGIA
  function renderTabMetodologia(data) {
    return (
      '<div class="es-coach-card">' +
        '<div class="es-coach-card-head">' +
          '<div class="es-coach-card-title-wrap"><span class="es-coach-card-icon">📚</span><div><h3>Hub Esercitazioni Pre-Partita & Metodologia</h3><p>Schemi tattici, rondos e routine di riscaldamento con gestione visibilità Privata / Pubblica</p></div></div>' +
          '<button type="button" class="es-btn-primary" id="btn-create-exercise-modal">+ Nuova Esercitazione</button>' +
        '</div>' +

        '<div class="es-exercises-grid">' +
          (data.esercitazioni && data.esercitazioni.length ? data.esercitazioni.map(function (ex, exIdx) {
            var isPub = ex.visibilita === 'public';
            return (
              '<div class="es-exercise-card ' + (isPub ? 'is-public' : 'is-private') + '">' +
                '<div class="es-exercise-head">' +
                  '<span class="es-tag es-tag-blue">' + esc(ex.categoria) + '</span>' +
                  '<span class="' + (isPub ? 'es-tag es-tag-green' : 'es-tag es-tag-gold') + '">' + (isPub ? '🌐 Pubblico (Branding)' : '🔒 Privato (Solo Squadra)') + '</span>' +
                '</div>' +
                '<h4 class="es-exercise-title">' + esc(ex.titolo) + '</h4>' +
                '<p class="es-exercise-desc">' + esc(ex.descrizione) + '</p>' +
                '<div class="es-exercise-foot">' +
                  '<span style="font-size:0.78rem; color:#94a3b8;">⏱️ Durata: <b>' + esc(ex.durata) + '</b></span>' +
                  '<div style="display:flex; gap:0.4rem;">' +
                    '<button type="button" class="es-btn-secondary" style="padding:4px 8px; font-size:0.75rem;" data-toggle-vis-ex="' + exIdx + '">' + (isPub ? 'Rendi Privato' : 'Rendi Pubblico') + '</button>' +
                    '<button type="button" class="es-coach-action-btn" style="color:#f87171;" data-del-ex="' + exIdx + '">&times;</button>' +
                  '</div>' +
                '</div>' +
              '</div>'
            );
          }).join('') : '<p class="es-coach-empty-text">Nessuna esercitazione caricata nell\'hub metodologico.</p>') +
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
            '<div class="es-coach-card-title-wrap"><span class="es-coach-card-icon">⚡</span><div><h3>Monitoraggio Dashboard GPS Squadra</h3><p>Carichi fisici, velocità di picco, distanze percorse e stato di forma</p></div></div>' +
          '</div>' +
          '<div class="es-gps-metrics-row">' +
            '<div class="es-coach-stat-box"><span class="es-coach-stat-num">112.4 km</span><span class="es-coach-stat-lbl">DISTANZA TOTALE SQUADRA</span></div>' +
            '<div class="es-coach-stat-box"><span class="es-coach-stat-num">34.8 km/h</span><span class="es-coach-stat-lbl">PICCO VELOCITÀ (Lookman)</span></div>' +
            '<div class="es-coach-stat-box"><span class="es-coach-stat-num">98.2%</span><span class="es-coach-stat-lbl">INDEX EFFICIENZA ATLETICA</span></div>' +
          '</div>' +
          '<table class="es-coach-info-table" style="margin-top:1rem;">' +
            '<tr><th>ATLETA</th><th>DISTANZA</th><th>PICCO KM/H</th><th>ACCELERAZIONI</th><th>STATUS FORMA</th></tr>' +
            '<tr><td><b>Éderson</b></td><td>11.8 km</td><td>31.4 km/h</td><td>84</td><td><span class="es-tag es-tag-green">🟢 Ottimale</span></td></tr>' +
            '<tr><td><b>Ademola Lookman</b></td><td>10.4 km</td><td>34.8 km/h</td><td>92</td><td><span class="es-tag es-tag-green">🟢 Picco Top</span></td></tr>' +
            '<tr><td><b>Marten de Roon</b></td><td>11.2 km</td><td>29.8 km/h</td><td>65</td><td><span class="es-tag es-tag-green">🟢 Regolare</span></td></tr>' +
            '<tr><td><b>Gianluca Scamacca</b></td><td>9.5 km</td><td>31.0 km/h</td><td>58</td><td><span class="es-tag es-tag-gold">🟡 In Recupero</span></td></tr>' +
          '</table>' +
        '</div>' +

        // Analisi Heatmap Tattica Sovrapposta
        '<div class="es-coach-card">' +
          '<div class="es-coach-card-head">' +
            '<div class="es-coach-card-title-wrap"><span class="es-coach-card-icon">🔥</span><div><h3>Analisi Heatmap Tattica Sovrapposta</h3><p>Sovrapposizione delle mappe di calore per occupazione spazi e ampiezza</p></div></div>' +
          '</div>' +
          '<div class="es-heatmap-overlay-wrap">' +
            '<div class="es-heatmap-pitch-bg">' +
              '<div class="es-heatmap-glow-zone is-left"></div>' +
              '<div class="es-heatmap-glow-zone is-center"></div>' +
              '<div class="es-heatmap-glow-zone is-right"></div>' +
              '<div class="es-heatmap-badge-text">Densità Tattica 87% · Ampiezza Catene Laterali Top</div>' +
            '</div>' +
          '</div>' +
          '<p style="font-size:0.82rem; color:#94a3b8; margin:0.8rem 0 0;">Le Heatmap confermano la perfetta occupazione dei corridoi esterni sulle catene Zappacosta-Lookman e Ruggeri-De Ketelaere.</p>' +
        '</div>' +
      '</div>'
    );
  }

  // 5. TAB SEGNALAZIONI MERCATO DS
  function renderTabSegnalazioniDs(data) {
    return (
      '<div class="es-coach-card">' +
        '<div class="es-coach-card-head">' +
          '<div class="es-coach-card-title-wrap"><span class="es-coach-card-icon">🎯</span><div><h3>Segnalazione Calciatori al Direttore Sportivo</h3><p>Lista dei desideri e suggerimenti tecnici inviati al DS per la sessione di mercato</p></div></div>' +
          '<button type="button" class="es-btn-primary" id="btn-open-segnala-ds">+ Segnala Calciatore al DS</button>' +
        '</div>' +

        '<table class="es-coach-info-table">' +
          '<thead><tr><th>CALCIATORE</th><th>RUOLO</th><th>CLUB ATTUALE</th><th>PRIORITÀ</th><th>NOTE TATTICHE</th><th>STATO TRATTATIVA DS</th></tr></thead>' +
          '<tbody>' +
            (data.wishlistDs && data.wishlistDs.length ? data.wishlistDs.map(function (w, wIdx) {
              return (
                '<tr>' +
                  '<td><b>' + esc(w.nome) + '</b></td>' +
                  '<td><span class="es-tag es-tag-blue">' + esc(w.ruolo) + '</span></td>' +
                  '<td>' + esc(w.club) + '</td>' +
                  '<td><span class="' + (w.priorita === 'Alta' ? 'es-tag es-tag-red' : 'es-tag es-tag-gold') + '">' + esc(w.priorita) + '</span></td>' +
                  '<td style="max-width:280px; font-size:0.82rem; color:#cbd5e1;">' + esc(w.note) + '</td>' +
                  '<td><span class="es-tag es-tag-green">' + esc(w.stato) + '</span></td>' +
                '</tr>'
              );
            }).join('') : '<tr><td colspan="6" style="text-align:center; padding:2rem; color:#94a3b8;">Nessun calciatore segnalato al Direttore Sportivo.</td></tr>') +
          '</tbody>' +
        '</table>' +
      '</div>'
    );
  }

  // 6. TAB ROSA
  function renderTabSquadra(data) {
    return (
      '<div class="es-coach-card">' +
        '<div class="es-coach-card-head">' +
          '<div class="es-coach-card-title-wrap"><span class="es-coach-card-icon">👥</span><div><h3>Organico Prima Squadra</h3><p>Lista atleti con schede tecniche, presenze e stato disponibilità</p></div></div>' +
          '<button type="button" class="es-btn-primary" id="btn-add-player-coach">+ Aggiungi Giocatore</button>' +
        '</div>' +

        '<div class="es-roster-grid">' +
          (data.roster || []).map(function (p, idx) {
            var stClass = p.status === 'disp' ? 'is-disp' : (p.status === 'diff' ? 'is-diff' : 'is-inj');
            var stText = p.status === 'disp' ? '🟢 Disponibile' : (p.status === 'diff' ? '🟡 Differenziato' : '🔴 Indisponibile');
            return (
              '<div class="es-roster-player-card" data-open-player-card="' + esc(p.name) + '">' +
                '<div class="es-roster-num-box">' + esc(p.num) + '</div>' +
                '<div class="es-roster-player-info">' +
                  '<h4 class="es-roster-player-name">' + esc(p.name) + '</h4>' +
                  '<div class="es-roster-player-meta">' + esc(p.role) + ' · Anno <b>' + esc(p.birth || '2000') + '</b></div>' +
                  '<div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.4rem;">' +
                    '<span class="es-tag ' + stClass + '" style="font-size:0.72rem;">' + stText + '</span>' +
                    '<span style="font-size:0.75rem; color:#94a3b8;">Presenze: <b>' + (p.app || 0) + '</b></span>' +
                  '</div>' +
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
          '<div class="es-coach-card-title-wrap"><span class="es-coach-card-icon">⏱️</span><div><h3>Sedute di Allenamento & Presenze</h3><p>Pianificazione settimanale e rilevazione presenze atleti</p></div></div>' +
          '<button type="button" class="es-btn-primary" id="btn-add-training-coach">+ Pianifica Seduta</button>' +
        '</div>' +

        '<div class="es-trainings-list">' +
          (data.trainingsList || []).map(function (tr, tIdx) {
            return (
              '<div class="es-training-card">' +
                '<div class="es-training-date-box">' +
                  '<span class="es-training-date-d">' + esc(tr.data.split('/')[0] || '28') + '</span>' +
                  '<span class="es-training-date-m">' + esc(tr.data.split('/')[1] || 'AGO') + '</span>' +
                '</div>' +
                '<div class="es-training-main">' +
                  '<div style="display:flex; gap:0.5rem; margin-bottom:0.25rem;">' +
                    '<span class="es-tag es-tag-blue">🕒 ' + esc(tr.orario) + '</span>' +
                    '<span class="es-tag es-tag-dark">📍 ' + esc(tr.luogo) + '</span>' +
                  '</div>' +
                  '<h4 class="es-training-title">' + esc(tr.tipo) + '</h4>' +
                  '<p class="es-training-desc">' + esc(tr.desc) + '</p>' +
                '</div>' +
                '<div class="es-training-actions">' +
                  '<button type="button" class="es-btn-primary" style="padding:6px 12px; font-size:0.8rem;" data-open-training-votanti="' + tIdx + '">👥 Presenze Votanti</button>' +
                  '<button type="button" class="es-coach-action-btn" style="color:#f87171;" data-del-training="' + tIdx + '">&times;</button>' +
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
          '<div class="es-coach-card-title-wrap"><span class="es-coach-card-icon">🏆</span><div><h3>Calendario Gare & Convocazioni Ufficiali</h3><p>Gestione partite ufficiali, distinte e convocati</p></div></div>' +
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
                  '<button type="button" class="es-btn-primary" style="padding:6px 14px; font-size:0.82rem;" data-open-match-convocati="' + mIdx + '">📋 Convocazioni (' + (m.convocati ? m.convocati.length : 0) + ')</button>' +
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
          '<div class="es-coach-card-title-wrap"><span class="es-coach-card-icon">📐</span><div><h3>Lavagna Tattica & Animazione Schemi</h3><p>Disegna schemi, movimenti e transizioni con esportazione PDF ad alta risoluzione</p></div></div>' +
          '<div style="display:flex; gap:0.5rem;">' +
            '<button type="button" class="es-btn-secondary" id="btn-export-pitch-pdf">📄 Esporta PDF</button>' +
            '<button type="button" class="es-btn-primary" id="btn-save-tactical-scheme">💾 Salva Schema</button>' +
          '</div>' +
        '</div>' +
        '<div class="es-tactical-board-frame" id="es-tactical-board-canvas-box">' +
          '<div class="es-tactical-canvas-placeholder">' +
            '<p style="color:#7dd3fc; font-weight:800; font-size:1.1rem; margin:0 0 0.4rem;">Lavagna Tattica Interattiva 3D Attiva</p>' +
            '<p style="color:#94a3b8; font-size:0.85rem; margin:0 0 1rem;">Seleziona pedine, linee di passaggio, frecce di corsa e coni di allenamento.</p>' +
            '<div style="display:flex; gap:0.5rem; justify-content:center;">' +
              '<button type="button" class="es-btn-secondary" onclick="if(window.showToast) window.showToast(\'🔵 Pedina Blu aggiunta sulla lavagna\', \'info\');">+ Pedina Difesa</button>' +
              '<button type="button" class="es-btn-secondary" onclick="if(window.showToast) window.showToast(\'🔴 Pedina Rossa aggiunta sulla lavagna\', \'info\');">+ Pedina Attacco</button>' +
              '<button type="button" class="es-btn-secondary" onclick="if(window.showToast) window.showToast(\'⚽ Pallone posizionato\', \'info\');">+ Pallone</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  // RENDER PITCH HELPERS
  function renderFmPitch(modulo, players) {
    return (
      '<div class="es-fm-pitch">' +
        '<div class="es-fm-pitch-lines"></div>' +
        (players || []).map(function (p, idx) {
          var coords = getPlayerCoords(idx, modulo);
          return (
            '<div class="es-fm-pin" style="left:' + coords.x + '%; top:' + coords.y + '%;" title="' + esc(p.name) + ' (' + esc(p.pos) + ')">' +
              '<span class="es-fm-pin-dot">' + esc(p.pos) + '</span>' +
              '<span class="es-fm-pin-lbl">' + esc(p.name.split(' ').pop()) + '</span>' +
            '</div>'
          );
        }).join('') +
      '</div>'
    );
  }

  function renderInteractiveTop11Pitch(players) {
    return (
      '<div class="es-fm-pitch is-interactive">' +
        '<div class="es-fm-pitch-lines"></div>' +
        (players || []).map(function (p, idx) {
          var coords = getPlayerCoords(idx, '4-3-3');
          return (
            '<div class="es-fm-card-pin" style="left:' + coords.x + '%; top:' + coords.y + '%;" data-open-player-card="' + esc(p.name) + '" title="Clicca per aprire la Player Card">' +
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

  function getPlayerCoords(idx, modulo) {
    // Coordinate percentuali fisse per 4-3-3
    var coords433 = [
      { x: 50, y: 88 },  // POR
      { x: 86, y: 68 },  // TD
      { x: 62, y: 72 },  // DC
      { x: 38, y: 72 },  // DC
      { x: 14, y: 68 },  // TS
      { x: 50, y: 52 },  // MED
      { x: 72, y: 44 },  // CC
      { x: 28, y: 44 },  // CC
      { x: 84, y: 22 },  // AD
      { x: 16, y: 22 },  // AS
      { x: 50, y: 14 }   // ATT
    ];
    return coords433[idx] || { x: 50, y: 50 };
  }

  // ============================================================
  // MODALI B2B INTERATTIVE ALLENATORE
  // ============================================================
  function openCoachModal(title, iconText, contentHtml) {
    var old = document.getElementById('es-coach-modal-overlay');
    if (old) old.remove();

    var modal = document.createElement('div');
    modal.id = 'es-coach-modal-overlay';
    modal.className = 'es-pres-modal-overlay';
    modal.innerHTML =
      '<div class="es-pres-modal-sheet" role="dialog" aria-modal="true" style="border-radius:4px !important; max-width:640px; background:#090e17; border:1px solid rgba(56,189,248,0.3);">' +
        '<button type="button" class="es-pres-modal-close-btn" id="btn-close-coach-modal" aria-label="Chiudi">&times;</button>' +
        '<div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:1.2rem; padding-bottom:0.65rem; border-bottom:1px solid rgba(148,163,184,0.15);">' +
          '<span style="font-size:1.3rem;">' + iconText + '</span>' +
          '<h2 style="font-size:1.2rem; font-weight:800; color:#ffffff; margin:0;">' + esc(title) + '</h2>' +
        '</div>' +
        '<div>' + contentHtml + '</div>' +
      '</div>';

    document.body.appendChild(modal);
    function close() { modal.remove(); }
    modal.querySelector('#btn-close-coach-modal').onclick = close;
    modal.onclick = function (e) { if (e.target === modal) close(); };
  }

  // 1. Modale Modifica Identità Allenatore
  function openEditCoachIdentityModal(data) {
    var isDisp = data.status === 'disponibile';
    var formHtml =
      '<form id="form-edit-identity" style="display:flex; flex-direction:column; gap:1rem;">' +
        '<div class="es-pres-input-group"><label>Nome e Cognome Ufficiale *</label><input type="text" class="es-pres-input-text" id="inp-coach-name" value="' + esc(data.coachName) + '" required></div>' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
          '<div class="es-pres-input-group"><label>Qualifica / Patentino *</label><select class="es-pres-input-text" id="sel-coach-patent" style="background:#040810; color:#fff;"><option ' + (data.patent === 'UEFA Pro' ? 'selected' : '') + '>UEFA Pro</option><option ' + (data.patent === 'UEFA A' ? 'selected' : '') + '>UEFA A</option><option ' + (data.patent === 'UEFA B' ? 'selected' : '') + '>UEFA B</option><option ' + (data.patent === 'UEFA C' ? 'selected' : '') + '>UEFA C</option><option ' + (data.patent === 'Allenatore Dilettante' ? 'selected' : '') + '>Allenatore Dilettante</option></select></div>' +
          '<div class="es-pres-input-group"><label>Status Contrattuale *</label><select class="es-pres-input-text" id="sel-coach-status" style="background:#040810; color:#fff;"><option value="in_carica" ' + (!isDisp ? 'selected' : '') + '>In carica presso società</option><option value="disponibile" ' + (isDisp ? 'selected' : '') + '>● Disponibile / Cerca Progetto</option></select></div>' +
        '</div>' +
        '<div class="es-pres-input-group"><label>Società / Club Attuale</label><input type="text" class="es-pres-input-text" id="inp-coach-club" value="' + esc(data.clubName) + '"></div>' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
          '<div class="es-pres-input-group"><label>Sede / Città</label><input type="text" class="es-pres-input-text" id="inp-coach-sede" value="' + esc(data.sede) + '"></div>' +
          '<div class="es-pres-input-group"><label>Stadio / Centro</label><input type="text" class="es-pres-input-text" id="inp-coach-stadio" value="' + esc(data.stadio) + '"></div>' +
        '</div>' +
        '<div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:0.5rem; padding-top:0.85rem; border-top:1px solid rgba(148,163,184,0.15);">' +
          '<button type="button" class="es-pres-btn-secondary" id="btn-cancel-modal">Annulla</button>' +
          '<button type="submit" class="es-pres-btn-primary">Salva Identità</button>' +
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

  // 2. Modale Collegamento Vice Allenatore
  function openLinkViceModal(data) {
    var v = data.viceLink || {};
    var formHtml =
      '<p style="color:#94a3b8; font-size:0.85rem; margin-bottom:1.2rem;">Inserisci i dati del Vice Allenatore per attivare il collegamento bidirezionale tra i due profili sulla piattaforma:</p>' +
      '<form id="form-link-vice" style="display:flex; flex-direction:column; gap:1rem;">' +
        '<div class="es-pres-input-group"><label>Nome e Cognome Vice Allenatore *</label><input type="text" class="es-pres-input-text" id="inp-vice-name" value="' + esc(v.name || '') + '" required placeholder="Es. Paolo Gentile"></div>' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
          '<div class="es-pres-input-group"><label>Qualifica / Licenza</label><input type="text" class="es-pres-input-text" id="inp-vice-patent" value="' + esc(v.patent || 'UEFA B') + '"></div>' +
          '<div class="es-pres-input-group"><label>Email Account Vice</label><input type="email" class="es-pres-input-text" id="inp-vice-email" value="' + esc(v.email || '') + '" placeholder="vice@elisee-scout.it"></div>' +
        '</div>' +
        '<div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:0.5rem; padding-top:0.85rem; border-top:1px solid rgba(148,163,184,0.15);">' +
          '<button type="button" class="es-pres-btn-secondary" id="btn-cancel-modal">Annulla</button>' +
          '<button type="submit" class="es-pres-btn-primary">Salva & Collega Vice</button>' +
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
          status: 'Collegato'
        };
        saveCoachData(data);
        if (overlay) overlay.remove();
        renderHub();
        if (window.showToast) window.showToast('Vice Allenatore collegato ufficialmente!', 'success');
      };
    }
  }

  // 3. Modale Aggiungi Titolo Palmarès
  function openAddTrofeoModal(data) {
    var formHtml =
      '<form id="form-add-trofeo" style="display:flex; flex-direction:column; gap:1rem;">' +
        '<div class="es-pres-input-group"><label>Titolo / Vittoria *</label><input type="text" class="es-pres-input-text" id="inp-pal-titolo" required placeholder="Es. Vincitore Promozione Girone B"></div>' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
          '<div class="es-pres-input-group"><label>Stagione Sportiva *</label><input type="text" class="es-pres-input-text" id="inp-pal-anno" value="2024/2025" required></div>' +
          '<div class="es-pres-input-group"><label>Tipologia Titolo</label><select class="es-pres-input-text" id="sel-pal-tipo" style="background:#040810; color:#fff;"><option>Campionato</option><option>Coppa Regionale / Provinciale</option><option>Promozione di Categoria</option><option>Titolo Giovanile</option><option>Torneo Nazionale / Internazionale</option></select></div>' +
        '</div>' +
        '<div class="es-pres-input-group"><label>Dettagli & Note</label><input type="text" class="es-pres-input-text" id="inp-pal-note" placeholder="Es. Miglior attacco e difesa del campionato"></div>' +
        '<div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:0.5rem; padding-top:0.85rem; border-top:1px solid rgba(148,163,184,0.15);">' +
          '<button type="button" class="es-pres-btn-secondary" id="btn-cancel-modal">Annulla</button>' +
          '<button type="submit" class="es-pres-btn-primary">Aggiungi a Bacheca</button>' +
        '</div>' +
      '</form>';

    openCoachModal('Aggiungi Titolo a Palmarès', '🏆', formHtml);
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
        if (window.showToast) window.showToast('Titolo aggiunto al palmarès!', 'success');
      };
    }
  }

  // 4. Modale Nuova Esercitazione
  function openNewExerciseModal(data) {
    var formHtml =
      '<form id="form-new-ex" style="display:flex; flex-direction:column; gap:1rem;">' +
        '<div class="es-pres-input-group"><label>Titolo Esercitazione *</label><input type="text" class="es-pres-input-text" id="inp-ex-titolo" required placeholder="Es. Rondos 4v2 ad alta intensità"></div>' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
          '<div class="es-pres-input-group"><label>Categoria *</label><select class="es-pres-input-text" id="sel-ex-cat" style="background:#040810; color:#fff;"><option>Rondos & Possesso</option><option>Palle Inattive</option><option>Riscaldamento Pre-Gara</option><option>Fase Difensiva</option><option>Transizioni & Contropiede</option><option>Tiro in Porta & Finalizzazione</option></select></div>' +
          '<div class="es-pres-input-group"><label>Durata Stimata</label><input type="text" class="es-pres-input-text" id="inp-ex-durata" value="20 min"></div>' +
        '</div>' +
        '<div class="es-pres-input-group"><label>Visibilità della Scheda *</label><select class="es-pres-input-text" id="sel-ex-vis" style="background:#040810; color:#fff;"><option value="public">🌐 Pubblico (Personal Branding per Colleghi & DS)</option><option value="private">🔒 Privato (Visibile solo ai propri Calciatori)</option></select></div>' +
        '<div class="es-pres-input-group"><label>Descrizione & Consegne Tattiche</label><textarea class="es-pres-input-text" id="inp-ex-desc" rows="3" placeholder="Spiega svolgimento, dimensioni del campo e regole..."></textarea></div>' +
        '<div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:0.5rem; padding-top:0.85rem; border-top:1px solid rgba(148,163,184,0.15);">' +
          '<button type="button" class="es-pres-btn-secondary" id="btn-cancel-modal">Annulla</button>' +
          '<button type="submit" class="es-pres-btn-primary">Salva Esercitazione</button>' +
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
        if (window.showToast) window.showToast('Esercitazione salvata nell\'Hub!', 'success');
      };
    }
  }

  // 5. Modale Segnala Calciatore al DS
  function openSegnalaAlDsModal(data) {
    var formHtml =
      '<p style="color:#94a3b8; font-size:0.85rem; margin-bottom:1.2rem;">Invia una segnalazione tecnica riservata direttamente sulla dashboard del Direttore Sportivo:</p>' +
      '<form id="form-segnala-ds" style="display:flex; flex-direction:column; gap:1rem;">' +
        '<div class="es-pres-input-group"><label>Nome Calciatore Target *</label><input type="text" class="es-pres-input-text" id="inp-ds-name" required placeholder="Es. Lorenzo Lucca"></div>' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
          '<div class="es-pres-input-group"><label>Ruolo Tattico</label><input type="text" class="es-pres-input-text" id="inp-ds-ruolo" placeholder="Es. Punta Centrale"></div>' +
          '<div class="es-pres-input-group"><label>Club Attuale</label><input type="text" class="es-pres-input-text" id="inp-ds-club" placeholder="Es. Udinese Calcio"></div>' +
        '</div>' +
        '<div class="es-pres-input-group"><label>Priorità di Mercato *</label><select class="es-pres-input-text" id="sel-ds-prio" style="background:#040810; color:#fff;"><option value="Alta">🔴 Alta (Titolare Immediato)</option><option value="Media" selected>🟡 Media (Rotazione / Opportunità)</option><option value="Bassa">🟢 Bassa (Prospettiva Futura)</option></select></div>' +
        '<div class="es-pres-input-group"><label>Motivazione Tecnica per il DS</label><textarea class="es-pres-input-text" id="inp-ds-note" rows="3" placeholder="Perché questo giocatore è funzionale alla nostra idea di gioco..."></textarea></div>' +
        '<div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:0.5rem; padding-top:0.85rem; border-top:1px solid rgba(148,163,184,0.15);">' +
          '<button type="button" class="es-pres-btn-secondary" id="btn-cancel-modal">Annulla</button>' +
          '<button type="submit" class="es-pres-btn-primary">Invia Segnalazione al DS</button>' +
        '</div>' +
      '</form>';

    openCoachModal('Segnalazione Mercato al Direttore Sportivo', '🎯', formHtml);
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
          club: document.getElementById('inp-ds-club').value.trim() || 'Club Pro',
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

  // 6. Modale Esportazione Social Story 9:16 (Instagram / TikTok)
  function openSocialStoryModal(data) {
    var contentHtml =
      '<div class="es-story-preview-container">' +
        '<div class="es-story-card" id="es-story-card-export">' +
          '<div class="es-story-header">' +
            '<div class="es-story-logo"><img src="' + esc(data.logoUrl) + '" alt="" onerror="this.src=\'immagini/squadre-loghi/foggia.png\';"></div>' +
            '<div>' +
              '<h3 class="es-story-club-title">' + esc(data.clubName) + '</h3>' +
              '<span class="es-story-matchday-tag">MATCHDAY · TOP 11 UFFICIALE</span>' +
            '</div>' +
          '</div>' +
          '<div class="es-story-pitch-box">' +
            '<div class="es-story-modulo-tag">' + esc(data.moduloPrincipale) + '</div>' +
            '<div class="es-story-players-list">' +
              (data.top11 || []).map(function (p) {
                return '<div class="es-story-player-row"><span class="es-story-p-num">#' + esc(p.num) + '</span><span class="es-story-p-name">' + esc(p.name) + '</span><span class="es-story-p-pos">' + esc(p.pos) + '</span></div>';
              }).join('') +
            '</div>' +
          '</div>' +
          '<div class="es-story-footer">' +
            '<span>Mister ' + esc(data.coachName) + '</span>' +
            '<span>ELISEE SCOUT</span>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex; flex-direction:column; gap:0.6rem; margin-top:1rem; width:100%;">' +
          '<button type="button" class="es-btn-primary" id="btn-copy-story-action">📸 Copia / Scarica Grafica Story</button>' +
          '<p style="color:#94a3b8; font-size:0.78rem; text-align:center; margin:0;">Formato verticale 9:16 ottimizzato per Storie Instagram, TikTok e WhatsApp Status.</p>' +
        '</div>' +
      '</div>';

    openCoachModal('Condividi Formazione della Settimana (Story 9:16)', '📲', contentHtml);
    var overlay = document.getElementById('es-coach-modal-overlay');
    var btnCopy = document.getElementById('btn-copy-story-action');
    if (btnCopy) {
      btnCopy.onclick = function () {
        if (window.showToast) window.showToast('✨ Grafica 9:16 generata! Pronta per Instagram & TikTok Stories.', 'success');
        if (overlay) overlay.remove();
      };
    }
  }

  // 7. Modale Guida Operativa di Ruolo
  function openGuidaAllenatoreModal() {
    var contentHtml =
      '<div style="color:#e2e8f0; font-size:0.86rem; line-height:1.6; display:flex; flex-direction:column; gap:0.8rem;">' +
        '<div style="padding:0.75rem; background:#040810; border-left:3px solid #38bdf8; border-radius:4px;">' +
          '<b style="color:#38bdf8;">Filosofia di Piattaforma per l\'Allenatore:</b><br>' +
          'Il profilo Allenatore valorizza la metodologia di campo, i moduli tattici FM, il collegamento bidirezionale con il Vice Allenatore e la gestione fisica tramite dashboard GPS.' +
        '</div>' +
        '<p><b>1. Moduli FM & Heatmap:</b> L\'assetto tattico teorico scelto alimenta direttamente l\'algoritmo per la generazione automatica delle Heatmap dei calciatori.</p>' +
        '<p><b>2. Formazione Top 11 & Social Story:</b> Componi l\'XI settimanale e condividi in 1 click la grafica 9:16 sui social prima del match.</p>' +
        '<p><b>3. Hub Esercitazioni:</b> Scegli tra modalità Privata (riservata ai tuoi atleti) o Pubblica per fare personal branding verso colleghi e DS.</p>' +
        '<p><b>4. Segnalazioni al DS:</b> Comunica direttamente le tue preferenze di mercato per ottimizzare gli acquisti societari.</p>' +
      '</div>';
    openCoachModal('Guida Operativa Ruolo Allenatore', '📖', contentHtml);
  }

  // ============================================================
  // EVENT BINDINGS
  // ============================================================
  function bindHubEvents() {
    var mount = document.getElementById('es-cd');
    if (!mount) return;

    var data = getCoachData();

    // Tab switcher
    mount.querySelectorAll('.es-coach-navbtn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var t = btn.getAttribute('data-tab');
        if (t) {
          activeTab = t;
          renderHub();
        }
      });
    });

    // Top buttons
    var btnGuida = mount.querySelector('#btn-guida-allenatore');
    if (btnGuida) btnGuida.onclick = openGuidaAllenatoreModal;

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
        if (window.showToast) window.showToast('Apertura scheda Vice Allenatore: ' + (data.viceLink ? data.viceLink.name : ''), 'info');
      };
    }

    // Click sui giocatori per aprire la Player Card
    mount.querySelectorAll('[data-open-player-card]').forEach(function (el) {
      el.addEventListener('click', function () {
        var name = el.getAttribute('data-open-player-card');
        if (window.openPlayerCardModal) {
          window.openPlayerCardModal({ name: name, club: data.clubName });
        } else if (window.showToast) {
          window.showToast('👤 Apertura Player Card Ufficiale: ' + name, 'info');
        }
      });
    });

    // Toggle visibilità esercitazioni
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
        if (confirm('Vuoi rimuovere questo titolo dal palmarès?')) {
          data.palmares.splice(idx, 1);
          saveCoachData(data);
          renderHub();
        }
      });
    });
  }

  // ============================================================
  // INIT & REGISTRAZIONE GLOBALE
  // ============================================================
  window.EliseeCoachDash = {
    render: renderHub,
    isCoach: isCoach,
    getData: getCoachData,
    saveData: saveCoachData
  };

  document.addEventListener('DOMContentLoaded', function () {
    var u = userObj();
    if (isCoach(u)) renderHub();
  });
})();
