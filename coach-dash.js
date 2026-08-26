/* ============================================================
   ELISEE SCOUT — Area Allenatore (Mister Hub)
   5 Macro-aree Attive: CLUB | SQUADRA | ALLENAMENTI | PARTITE | LAVAGNA
   ============================================================ */
(function () {
  'use strict';

  var activeTab = 'club'; // club | squadra | allenamenti | partite | lavagna

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

  function saveUser(u) {
    try {
      localStorage.setItem('elisee_active_user', JSON.stringify(u));
      localStorage.setItem('elisee_user_data', JSON.stringify(u));
    } catch (_) {}
    return u;
  }

  function isCoach(u) {
    u = u || userObj();
    var blob = [u.staffRole, u.ruoloDettagliato, u.ruolo, u.role, u.siteRoleFamily, u.staffProfile && u.staffProfile.fieldRole]
      .filter(Boolean).join(' ').toLowerCase();
    if (/in seconda|vice allenatore/.test(blob)) return false;
    return /allenatore|coach|mister/.test(blob);
  }

  function getCoachData() {
    var u = userObj();
    var def = {
      clubName: u.squadra || u.club || 'Foggia',
      matricola: u.matricola || '13923 / FIGC',
      sede: u.sede || 'Viale Giuseppe Mazzini, 35/C Foggia FG',
      stadio: u.stadio || 'Stadio Comunale Pino Zaccheria',
      telefono: u.telefono || '+39 0881 742911',
      coachName: (u.nome ? (u.nome + ' ' + (u.cognome || '')) : (u.name || 'Eliseo Miraglia')).trim(),
      coachRole: 'Allenatore (UEFA B / Pro)',
      coachDoc: 'Verificato',
      coachTessera: 'FIGC-741920',
      coachScadenza: '30/06/2027',
      logoUrl: 'immagini/squadre-loghi/foggia.png',
      teamPhotoUrl: 'immagini/04-workspace-scout/scout-workspace.svg?v=20260730_225504',
      roster: [
        { num: 1, name: 'Marco Fumagalli', role: 'Portiere', birth: '2001', cert: 'Regolare', status: 'disp', app: 26 },
        { num: 2, name: 'Alessandro Silvestro', role: 'Terzino Destro', birth: '2002', cert: 'Regolare', status: 'disp', app: 24 },
        { num: 5, name: 'Luigi Carillo', role: 'Difensore Centrale', birth: '1996', cert: 'Regolare', status: 'disp', app: 28 },
        { num: 6, name: 'Davide Di Pasquale', role: 'Difensore Centrale', birth: '1996', cert: 'Regolare', status: 'disp', app: 25 },
        { num: 3, name: 'Luca Rizzo Pinna', role: 'Terzino Sinistro', birth: '2003', cert: 'Regolare', status: 'disp', app: 22 },
        { num: 8, name: 'Moses Odjer', role: 'Mediano', birth: '1996', cert: 'Regolare', status: 'disp', app: 27 },
        { num: 4, name: 'Jacopo Petermann', role: 'Regista', birth: '1994', cert: 'Regolare', status: 'disp', app: 25 },
        { num: 10, name: 'Diego Peralta', role: 'Trequartista', birth: '1996', cert: 'Regolare', status: 'disp', app: 28 },
        { num: 7, name: 'Eliseo Miraglia', role: 'Ala Sinistra', birth: '2004', cert: 'Regolare', status: 'disp', app: 28 },
        { num: 11, name: 'Roberto Ogunseye', role: 'Attaccante Centrale', birth: '1995', cert: 'Regolare', status: 'disp', app: 26 },
        { num: 9, name: 'Alexis Ferrante', role: 'Seconda Punta', birth: '1995', cert: 'Regolare', status: 'disp', app: 24 },
        { num: 12, name: 'Tommaso Nobile', role: 'Secondo Portiere', birth: '2003', cert: 'Regolare', status: 'disp', app: 4 },
        { num: 14, name: 'Manuel Garattoni', role: 'Esterno Destro', birth: '1998', cert: 'Regolare', status: 'diff', app: 19 },
        { num: 18, name: 'Andrea Schenetti', role: 'Mezzala Offensiva', birth: '1991', cert: 'Regolare', status: 'disp', app: 23 }
      ],
      allenamenti: [
        { id: 'all-1', date: 'Oggi · 15:30', title: 'Seduta Tattica &amp; Pressione Alta', focus: 'Riscaldamento a secco, possesso palla 6v6+2, sviluppo catena laterale e partitella 11v11.', presenze: '21 / 22 Presenti' },
        { id: 'all-2', date: 'Domani · 10:00', title: 'Fase Difensiva &amp; Palle Inattive', focus: 'Marcatura a zona su corner avversari, calci di punizione a favore, reattività e rapidità su 10m.', presenze: 'Programmato' },
        { id: 'all-3', date: 'Venerdì · 15:00', title: 'Rifinitura Pre-Gara &amp; Tiri in Porta', focus: 'Attivazione neuromuscolare, schemi offensivi finali e rigori.', presenze: 'Programmato' }
      ],
      partite: [
        { id: 'match-1', date: 'Domenica · Ore 15:00', opponent: 'Foggia vs Taranto', comp: 'Campionato Serie D · Girone H', stadium: 'Stadio Pino Zaccheria', status: 'Prossima Gara', conv: '22 Convocati' },
        { id: 'match-2', date: 'Domenica scorsa', opponent: 'Nardò 1 - 2 Foggia', comp: 'Campionato Serie D', stadium: 'Stadio Giovanni Paolo II', status: 'Vittoria (3 Punti)', conv: 'Marcatori: Miraglia (34\'), Peralta (78\')' },
        { id: 'match-3', date: '2 Settimane fa', opponent: 'Foggia 3 - 0 Fidelis Andria', comp: 'Campionato Serie D', stadium: 'Stadio Pino Zaccheria', status: 'Vittoria (Clean Sheet)', conv: 'Marcatori: Ogunseye (12\'), Miraglia (55\', 82\')' }
      ],
      tacticalNotes: 'Costruzione dal basso 3+2 con terzino sinistro che stringe. Pressione ultra-offensiva sulle seconde palle.'
    };

    try {
      var stored = localStorage.getItem('elisee_coach_hub_data');
      if (stored) return Object.assign(def, JSON.parse(stored));
    } catch (_) {}
    return def;
  }

  function saveCoachData(data) {
    try {
      localStorage.setItem('elisee_coach_hub_data', JSON.stringify(data));
    } catch (_) {}
  }

  // Descrizioni dinamiche per tab
  var TAB_DESCS = {
    club: 'Organizzazione societaria, dirigenti e staff tecnico.',
    squadra: 'Gestione della rosa, ruoli e dati dei giocatori.',
    allenamenti: 'Pianificazione e gestione degli allenamenti stagionali.',
    partite: 'Calendario, convocazioni e gestione delle partite.',
    lavagna: 'Lavagna tattica interattiva per schemi, moduli e movimenti di squadra.'
  };

  function renderHub() {
    var mount = document.getElementById('es-cd');
    if (!mount) return;

    var data = getCoachData();

    var html =
      '<div class="es-mister-hub">' +
        // Top Trial / VIP bar
        '<div class="es-mister-trial-bar">' +
          '<div class="es-mister-trial-text">' +
            '<span>⚠️</span> Stai utilizzando la versione prova Mister con funzionalità dedicate.' +
          '</div>' +
          '<button type="button" class="es-mister-btn-sub" onclick="if(window.openAccessoModal){ window.openAccessoModal(\'email\'); } else if(window.showToast){ window.showToast(\'🌟 Accesso Elisee Manager VIP attivo per il tuo account.\', \'success\'); }">Abbonati VIP</button>' +
        '</div>' +

        '<div class="es-mister-wrap">' +
          // Header Club Banner
          '<div class="es-mister-club-header">' +
            '<div class="es-mister-club-main">' +
              '<div class="es-mister-crest-badge">' +
                '<img src="' + esc(data.logoUrl) + '" alt="' + esc(data.clubName) + '" onerror="this.src=\'immagini/squadre-loghi/napoli.png\';">' +
              '</div>' +
              '<div>' +
                '<div class="es-mister-club-tags">' +
                  '<span class="es-mister-tag es-mister-tag-primary">PRIMA SQUADRA</span>' +
                  '<span class="es-mister-tag es-mister-tag-dark">Stagione in corso</span>' +
                  '<span class="es-mister-tag es-mister-tag-gold">Allenatore | Admin Club</span>' +
                '</div>' +
                '<h1 class="es-mister-club-title">' + esc(data.clubName) + '</h1>' +
                '<p class="es-mister-club-desc" id="mister-tab-desc">' + esc(TAB_DESCS[activeTab]) + '</p>' +
              '</div>' +
            '</div>' +
          '</div>' +

          // 5 Nav Tabs
          '<nav class="es-mister-nav-bar" role="tablist">' +
            '<button type="button" class="es-mister-nav-tab ' + (activeTab === 'club' ? 'is-active' : '') + '" data-tab="club">🛡️ Club</button>' +
            '<button type="button" class="es-mister-nav-tab ' + (activeTab === 'squadra' ? 'is-active' : '') + '" data-tab="squadra">👥 Squadra</button>' +
            '<button type="button" class="es-mister-nav-tab ' + (activeTab === 'allenamenti' ? 'is-active' : '') + '" data-tab="allenamenti">🏃‍♂️ Allenamenti</button>' +
            '<button type="button" class="es-mister-nav-tab ' + (activeTab === 'partite' ? 'is-active' : '') + '" data-tab="partite">⚽ Partite</button>' +
            '<button type="button" class="es-mister-nav-tab ' + (activeTab === 'lavagna' ? 'is-active' : '') + '" data-tab="lavagna">📋 Lavagna</button>' +
          '</nav>' +

          // Content Tab Container
          '<div id="mister-tab-content">' +
            renderTabContent(activeTab, data) +
          '</div>' +

        '</div>' +
      '</div>';

    mount.innerHTML = html;
    bindHubEvents();
  }

  function renderTabContent(tab, data) {
    if (tab === 'club') {
      return (
        // Card 1: Club
        '<div class="es-mister-card-white">' +
          '<div class="es-mister-card-header">' +
            '<div class="es-mister-card-title-wrap">' +
              '<span class="es-mister-card-icon">🛡️</span>' +
              '<div>' +
                '<h3 class="es-mister-card-title">Club</h3>' +
                '<p class="es-mister-card-sub">Dati società e impianto sportivo</p>' +
              '</div>' +
            '</div>' +
            '<button type="button" class="es-mister-circle-btn" id="btn-edit-club-data" title="Modifica dati club">✏️</button>' +
          '</div>' +
          '<table class="es-mister-info-table">' +
            '<tr><th>SOCIETÀ</th><td>' + esc(data.clubName) + ' (Admin-716)</td></tr>' +
            '<tr><th>MATRICOLA</th><td>' + esc(data.matricola) + '</td></tr>' +
            '<tr><th>SEDE</th><td>' + esc(data.sede) + '</td></tr>' +
            '<tr><th>STADIO</th><td>' + esc(data.stadio) + '</td></tr>' +
            '<tr><th>TELEFONO</th><td>' + esc(data.telefono) + '</td></tr>' +
          '</table>' +
        '</div>' +

        // Card 2: Immagini
        '<div class="es-mister-card-white">' +
          '<div class="es-mister-card-header">' +
            '<div class="es-mister-card-title-wrap">' +
              '<span class="es-mister-card-icon">🖼️</span>' +
              '<div>' +
                '<h3 class="es-mister-card-title">Immagini</h3>' +
                '<p class="es-mister-card-sub">Stemma e foto squadra</p>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="es-mister-images-grid">' +
            '<div class="es-mister-img-box">' +
              '<div class="es-mister-img-preview">' +
                '<img src="' + esc(data.logoUrl) + '" alt="Stemma">' +
              '</div>' +
              '<div style="display:flex; align-items:center; justify-content:space-between; margin-top:0.4rem;">' +
                '<span style="font-weight:800; font-size:0.88rem;">Stemma</span>' +
                '<button type="button" class="es-mister-circle-btn" style="width:30px; height:30px; font-size:0.85rem;" onclick="if(window.showToast){ window.showToast(\'🖼️ Modifica stemma club aperto\', \'info\'); }">✏️</button>' +
              '</div>' +
            '</div>' +
            '<div class="es-mister-img-box">' +
              '<div class="es-mister-img-preview">' +
                '<img src="' + esc(data.teamPhotoUrl) + '" alt="Foto squadra">' +
              '</div>' +
              '<div style="display:flex; align-items:center; justify-content:space-between; margin-top:0.4rem;">' +
                '<span style="font-weight:800; font-size:0.88rem;">Foto squadra</span>' +
                '<button type="button" class="es-mister-circle-btn" style="width:30px; height:30px; font-size:0.85rem;" onclick="if(window.showToast){ window.showToast(\'📷 Modifica foto squadra aperto\', \'info\'); }">✏️</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +

        // Card 3: Staff Tecnico
        '<div class="es-mister-card-white">' +
          '<div class="es-mister-card-header">' +
            '<div class="es-mister-card-title-wrap">' +
              '<span class="es-mister-card-icon">⏱️</span>' +
              '<div>' +
                '<h3 class="es-mister-card-title">Staff tecnico</h3>' +
                '<p class="es-mister-card-sub">Allenatori e collaboratori tecnici</p>' +
              '</div>' +
            '</div>' +
            '<button type="button" class="es-mister-circle-btn" id="btn-add-staff" title="Aggiungi membro staff">+</button>' +
          '</div>' +
          '<div class="es-mister-staff-box">' +
            '<div class="es-mister-staff-left">' +
              '<div class="es-mister-staff-avatar">👤</div>' +
              '<div>' +
                '<h4 class="es-mister-staff-name">' + esc(data.coachName) + '</h4>' +
                '<div class="es-mister-staff-role">' + esc(data.coachRole) + '</div>' +
                '<div class="es-mister-staff-meta">' +
                  '<span>Doc: <b>' + esc(data.coachDoc) + '</b></span>' +
                  '<span>Tessera: <b>' + esc(data.coachTessera) + '</b></span>' +
                  '<span>Scad. cert.: <b>' + esc(data.coachScadenza) + '</b></span>' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<button type="button" class="es-mister-circle-btn" style="width:34px; height:34px; font-size:0.9rem;" id="btn-edit-coach-staff">✏️</button>' +
          '</div>' +
        '</div>' +

        // Card 4: Dirigenti
        '<div class="es-mister-card-white">' +
          '<div class="es-mister-card-header">' +
            '<div class="es-mister-card-title-wrap">' +
              '<span class="es-mister-card-icon">👔</span>' +
              '<div>' +
                '<h3 class="es-mister-card-title">Dirigenti</h3>' +
                '<p class="es-mister-card-sub">Organigramma societario</p>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<p style="color:#64748b; font-size:0.9rem; margin:0.4rem 0 0;">La sezione dirigenti è disponibile con accesso Club &amp; Governance verificata.</p>' +
        '</div>'
      );
    }

    if (tab === 'squadra') {
      var playersHtml = (data.roster || []).map(function (p, idx) {
        var statusBadge = p.status === 'disp'
          ? '<span style="color:#16a34a; font-size:0.75rem; font-weight:700;">🟢 Disponibile</span>'
          : (p.status === 'diff'
            ? '<span style="color:#d97706; font-size:0.75rem; font-weight:700;">🟡 Differenziato</span>'
            : '<span style="color:#dc2626; font-size:0.75rem; font-weight:700;">🔴 Indisponibile</span>');

        return (
          '<div class="es-mister-player-card">' +
            '<div class="es-mister-player-num">' + p.num + '</div>' +
            '<div class="es-mister-player-info">' +
              '<h4 class="es-mister-player-name">' + esc(p.name) + '</h4>' +
              '<div class="es-mister-player-role">' + esc(p.role) + ' · Anno ' + esc(p.birth) + '</div>' +
              '<div style="font-size:0.72rem; color:#64748b;">' + statusBadge + ' · ' + p.app + ' Presenze</div>' +
            '</div>' +
            '<button type="button" class="es-mister-circle-btn" style="width:30px; height:30px; font-size:0.8rem;" data-edit-player="' + idx + '">✏️</button>' +
          '</div>'
        );
      }).join('');

      return (
        '<div class="es-mister-card-white">' +
          '<div class="es-mister-card-header">' +
            '<div class="es-mister-card-title-wrap">' +
              '<span class="es-mister-card-icon">👥</span>' +
              '<div>' +
                '<h3 class="es-mister-card-title">Squadra</h3>' +
                '<p class="es-mister-card-sub">' + esc(data.clubName) + ' · Prima Squadra (' + (data.roster || []).length + ' Giocatori in rosa)</p>' +
              '</div>' +
            '</div>' +
            '<div class="es-mister-card-actions">' +
              '<button type="button" class="es-mister-circle-btn" id="btn-stats-roster" title="Statistiche rosa">📊</button>' +
              '<button type="button" class="es-mister-circle-btn" id="btn-add-player" title="Aggiungi giocatore in rosa">+</button>' +
            '</div>' +
          '</div>' +
          '<div class="es-mister-roster-grid">' +
            playersHtml +
          '</div>' +
        '</div>'
      );
    }

    if (tab === 'allenamenti') {
      var allHtml = (data.allenamenti || []).map(function (a, idx) {
        return (
          '<div class="es-mister-event-card">' +
            '<div class="es-mister-event-date-badge">' + a.date + '</div>' +
            '<div class="es-mister-event-details">' +
              '<h4 class="es-mister-event-title">' + a.title + '</h4>' +
              '<p class="es-mister-event-sub">' + a.focus + '</p>' +
              '<div style="font-size:0.75rem; color:#0d9488; font-weight:700; margin-top:0.3rem;">📋 Presenze: ' + a.presenze + '</div>' +
            '</div>' +
            '<button type="button" class="es-mister-circle-btn" style="width:34px; height:34px; font-size:0.85rem;" data-toggle-presenze="' + idx + '" title="Appello presenze">📝</button>' +
          '</div>'
        );
      }).join('');

      return (
        '<div class="es-mister-card-white">' +
          '<div class="es-mister-card-header">' +
            '<div class="es-mister-card-title-wrap">' +
              '<span class="es-mister-card-icon">🏃‍♂️</span>' +
              '<div>' +
                '<h3 class="es-mister-card-title">Allenamenti</h3>' +
                '<p class="es-mister-card-sub">' + esc(data.clubName) + ' · Prima Squadra</p>' +
              '</div>' +
            '</div>' +
            '<div class="es-mister-card-actions">' +
              '<button type="button" class="es-mister-circle-btn" id="btn-stats-train" title="Statistiche carichi GPS">📊</button>' +
              '<button type="button" class="es-mister-circle-btn" id="btn-add-training" title="Programma nuovo allenamento">+</button>' +
            '</div>' +
          '</div>' +
          '<div style="margin-top:1rem;">' +
            allHtml +
          '</div>' +
        '</div>'
      );
    }

    if (tab === 'partite') {
      var matchHtml = (data.partite || []).map(function (m, idx) {
        return (
          '<div class="es-mister-event-card">' +
            '<div class="es-mister-event-date-badge">' + m.date + '</div>' +
            '<div class="es-mister-event-details">' +
              '<h4 class="es-mister-event-title">' + m.opponent + '</h4>' +
              '<p class="es-mister-event-sub">' + m.comp + ' · 🏟️ ' + m.stadium + '</p>' +
              '<div style="font-size:0.75rem; color:#0284c7; font-weight:700; margin-top:0.3rem;">⚽ ' + m.status + ' (' + m.conv + ')</div>' +
            '</div>' +
            '<button type="button" class="es-mister-circle-btn" style="width:34px; height:34px; font-size:0.85rem;" data-match-formazione="' + idx + '" title="Gestisci formazioni">📋</button>' +
          '</div>'
        );
      }).join('');

      return (
        '<div class="es-mister-card-white">' +
          '<div class="es-mister-card-header">' +
            '<div class="es-mister-card-title-wrap">' +
              '<span class="es-mister-card-icon">⚽</span>' +
              '<div>' +
                '<h3 class="es-mister-card-title">Partite</h3>' +
                '<p class="es-mister-card-sub">' + esc(data.clubName) + ' · Prima Squadra</p>' +
              '</div>' +
            '</div>' +
            '<div class="es-mister-card-actions">' +
              '<button type="button" class="es-mister-circle-btn" id="btn-stats-match" title="Report match analysis">📊</button>' +
              '<button type="button" class="es-mister-circle-btn" id="btn-add-match" title="Aggiungi partita">+</button>' +
            '</div>' +
          '</div>' +
          '<div style="margin-top:1rem;">' +
            matchHtml +
          '</div>' +
        '</div>'
      );
    }

    if (tab === 'lavagna') {
      return (
        '<div class="es-mister-card-white">' +
          '<div class="es-mister-card-header">' +
            '<div class="es-mister-card-title-wrap">' +
              '<span class="es-mister-card-icon">📋</span>' +
              '<div>' +
                '<h3 class="es-mister-card-title">Lavagna Tattica</h3>' +
                '<p class="es-mister-card-sub">Trascina le pedine in campo per impostare schemi e formazioni</p>' +
              '</div>' +
            '</div>' +
            '<div style="display:flex; align-items:center; gap:0.5rem;">' +
              '<select id="board-formation-select" style="background:#0f172a; color:#fff; border:1px solid #2dd4bf; border-radius:8px; padding:0.4rem 0.75rem; font-weight:700; font-size:0.82rem;">' +
                '<option value="433">Modulo 4-3-3</option>' +
                '<option value="352">Modulo 3-5-2</option>' +
                '<option value="4231">Modulo 4-2-3-1</option>' +
                '<option value="442">Modulo 4-4-2</option>' +
              '</select>' +
              '<button type="button" class="btn btn-outline-pill" id="btn-reset-board" style="padding:0.4rem 0.8rem; font-size:0.78rem;">Reset</button>' +
            '</div>' +
          '</div>' +

          '<div class="es-mister-board-wrap" id="tactical-board">' +
            '<div class="es-mister-pitch-lines">' +
              '<div class="es-mister-pitch-center-line"></div>' +
              '<div class="es-mister-pitch-center-circle"></div>' +
              '<div class="es-mister-pitch-box-left"></div>' +
              '<div class="es-mister-pitch-box-right"></div>' +
            '</div>' +
            // Pedine 11 titolari (Default 4-3-3)
            '<div class="es-mister-piece is-gk" style="top:50%; left:8%;" data-num="1" title="Portiere">1</div>' +
            '<div class="es-mister-piece" style="top:20%; left:26%;" data-num="2" title="Terzino Dx">2</div>' +
            '<div class="es-mister-piece" style="top:40%; left:22%;" data-num="5" title="Centrale Dx">5</div>' +
            '<div class="es-mister-piece" style="top:60%; left:22%;" data-num="6" title="Centrale Sx">6</div>' +
            '<div class="es-mister-piece" style="top:80%; left:26%;" data-num="3" title="Terzino Sx">3</div>' +
            '<div class="es-mister-piece" style="top:50%; left:42%;" data-num="4" title="Regista">4</div>' +
            '<div class="es-mister-piece" style="top:30%; left:54%;" data-num="8" title="Mezzala Dx">8</div>' +
            '<div class="es-mister-piece" style="top:70%; left:54%;" data-num="10" title="Mezzala Sx">10</div>' +
            '<div class="es-mister-piece" style="top:22%; left:75%;" data-num="7" title="Ala Dx">7</div>' +
            '<div class="es-mister-piece" style="top:50%; left:82%;" data-num="9" title="Punta">9</div>' +
            '<div class="es-mister-piece" style="top:78%; left:75%;" data-num="11" title="Ala Sx">11</div>' +
          '</div>' +

          '<div style="margin-top:1.2rem;">' +
            '<label style="display:block; font-weight:800; font-size:0.85rem; color:#0f172a; margin-bottom:0.35rem;">Note Tattiche del Mister</label>' +
            '<textarea id="mister-tactical-notes" rows="3" placeholder="Scrivi indicazioni su palle inattive, uscite dal basso, transizioni..." style="width:100%; box-sizing:border-box; border:1.5px solid #cbd5e1; border-radius:12px; padding:0.75rem; font-family:inherit; font-size:0.88rem;">' + esc(data.tacticalNotes) + '</textarea>' +
            '<button type="button" class="btn btn-outline-pill pf-btn-solid" id="btn-save-notes" style="margin-top:0.5rem; background:#0d9488; color:#fff; border:none; padding:0.45rem 1.1rem; font-weight:800; font-size:0.82rem;">Salva Note Tattiche</button>' +
          '</div>' +
        '</div>'
      );
    }

    return '';
  }

  function bindHubEvents() {
    var mount = document.getElementById('es-cd');
    if (!mount) return;

    // Tab buttons click
    mount.querySelectorAll('.es-mister-nav-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeTab = btn.getAttribute('data-tab');
        renderHub();
      });
    });

    // Modale Modifica Dati Club
    var btnEditClub = mount.querySelector('#btn-edit-club-data');
    if (btnEditClub) {
      btnEditClub.onclick = function () {
        var data = getCoachData();
        var newSede = prompt('Modifica Sede Operativa:', data.sede);
        if (newSede != null) data.sede = newSede;
        var newStadio = prompt('Modifica Stadio Ufficiale:', data.stadio);
        if (newStadio != null) data.stadio = newStadio;
        saveCoachData(data);
        renderHub();
        if (window.showToast) window.showToast('✅ Dati Club salvati con successo!', 'success');
      };
    }

    // Modale Aggiungi Membro Staff
    var btnAddStaff = mount.querySelector('#btn-add-staff');
    if (btnAddStaff) {
      btnAddStaff.onclick = function () {
        var name = prompt('Nome e Cognome Collaboratore Staff:');
        if (name) {
          var role = prompt('Ruolo Staff (es. Vice Allenatore, Preparatore Atletico, Match Analyst):', 'Vice Allenatore');
          if (window.showToast) window.showToast('✅ Membro Staff ' + name + ' (' + role + ') aggiunto!', 'success');
        }
      };
    }

    // Modale Aggiungi Giocatore
    var btnAddPlayer = mount.querySelector('#btn-add-player');
    if (btnAddPlayer) {
      btnAddPlayer.onclick = function () {
        var pName = prompt('Nome e Cognome Atleta:');
        if (pName) {
          var pRole = prompt('Ruolo in campo (Portiere, Difensore, Centrocampista, Attaccante):', 'Attaccante');
          var pNum = parseInt(prompt('Numero di maglia:', '99'), 10) || 99;
          var data = getCoachData();
          data.roster.push({
            num: pNum,
            name: pName,
            role: pRole || 'Calciatore',
            birth: '2004',
            cert: 'Regolare',
            status: 'disp',
            app: 0
          });
          saveCoachData(data);
          renderHub();
          if (window.showToast) window.showToast('✅ Calciatore ' + pName + ' aggiunto in rosa!', 'success');
        }
      };
    }

    // Modale Aggiungi Allenamento
    var btnAddTrain = mount.querySelector('#btn-add-training');
    if (btnAddTrain) {
      btnAddTrain.onclick = function () {
        var tTitle = prompt('Titolo seduta di allenamento:');
        if (tTitle) {
          var tDate = prompt('Data e orario (es. Sabato · 10:30):', 'Sabato · 10:30');
          var tFocus = prompt('Focus della seduta:', 'Tiri in porta, schemi su corner e partitella');
          var data = getCoachData();
          data.allenamenti.unshift({
            id: 'all-' + Date.now(),
            date: tDate || 'Da definire',
            title: tTitle,
            focus: tFocus || 'Esercitazioni tecniche',
            presenze: 'Programmato'
          });
          saveCoachData(data);
          renderHub();
          if (window.showToast) window.showToast('✅ Seduta di allenamento programmata!', 'success');
        }
      };
    }

    // Modale Aggiungi Partita
    var btnAddMatch = mount.querySelector('#btn-add-match');
    if (btnAddMatch) {
      btnAddMatch.onclick = function () {
        var mOpp = prompt('Squadra avversaria (es. Foggia vs Fidelis Andria):');
        if (mOpp) {
          var mDate = prompt('Data e orario gara:', 'Domenica prossima · Ore 15:00');
          var data = getCoachData();
          data.partite.unshift({
            id: 'match-' + Date.now(),
            date: mDate || 'Domenica ore 15:00',
            opponent: mOpp,
            comp: 'Campionato Serie D',
            stadium: 'Stadio Comunale',
            status: 'In programma',
            conv: '22 Convocati'
          });
          saveCoachData(data);
          renderHub();
          if (window.showToast) window.showToast('✅ Gara aggiunta al calendario!', 'success');
        }
      };
    }

    // Salva Note Tattiche
    var btnSaveNotes = mount.querySelector('#btn-save-notes');
    if (btnSaveNotes) {
      btnSaveNotes.onclick = function () {
        var data = getCoachData();
        var txt = mount.querySelector('#mister-tactical-notes').value;
        data.tacticalNotes = txt;
        saveCoachData(data);
        if (window.showToast) window.showToast('💾 Note tattiche del Mister salvate!', 'success');
      };
    }

    // Cambio Modulo Lavagna
    var selFormation = mount.querySelector('#board-formation-select');
    if (selFormation) {
      selFormation.onchange = function () {
        var f = this.value;
        if (window.showToast) window.showToast('📋 Modulo impostato su ' + f, 'info');
      };
    }

    // Interattività Drag & Drop pedine sulla lavagna tattica
    var board = mount.querySelector('#tactical-board');
    if (board) {
      var pieces = board.querySelectorAll('.es-mister-piece');
      pieces.forEach(function (p) {
        p.onpointerdown = function (e) {
          e.preventDefault();
          var rect = board.getBoundingClientRect();
          function onMove(ev) {
            var x = Math.max(4, Math.min(rect.width - 4, ev.clientX - rect.left));
            var y = Math.max(4, Math.min(rect.height - 4, ev.clientY - rect.top));
            var px = (x / rect.width * 100).toFixed(1);
            var py = (y / rect.height * 100).toFixed(1);
            p.style.left = px + '%';
            p.style.top = py + '%';
          }
          function onUp() {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
          }
          window.addEventListener('pointermove', onMove);
          window.addEventListener('pointerup', onUp);
        };
      });
    }
  }

  function render(force) {
    var group = document.getElementById('user-dossier-view-group');
    if (!group) return;
    var u = userObj();
    if (!force && !isCoach(u)) return;

    group.classList.add('is-coach-dash');
    var staffProfile = document.getElementById('es-staff-profile');
    if (!staffProfile) return;

    var cd = document.getElementById('es-cd');
    if (!cd) {
      cd = document.createElement('div');
      cd.id = 'es-cd';
      staffProfile.appendChild(cd);
    }
    cd.style.display = 'block';
    renderHub();
  }

  function detach() {
    var group = document.getElementById('user-dossier-view-group');
    if (group) group.classList.remove('is-coach-dash');
    var cd = document.getElementById('es-cd');
    if (cd) cd.remove();
  }

  window.EliseeCoachDash = {
    render: render,
    detach: detach,
    setTab: function (tab) {
      activeTab = tab;
      renderHub();
    }
  };

  function boot() {
    document.addEventListener('elisee:role-changed', function () {
      if (isCoach()) render(true);
      else detach();
    });
    document.addEventListener('elisee:auth-changed', function () {
      if (isCoach()) render(true);
      else detach();
    });
    if (isCoach()) render(true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
