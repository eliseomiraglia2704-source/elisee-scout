/* ============================================================
   ELISEE SCOUT — Area Presidente (Presidential Hub)
   5 Macro-aree Attive: CLUB | SQUADRA | ALLENAMENTI | PARTITE | LAVAGNA
   Incluso: Gestione Allenamenti Interattivi con Like (Ci sono), Dislike (Non ci sono) & Modale Votanti
   ============================================================ */
(function () {
  'use strict';

  var activeTab = 'allenamenti';

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

  function isPres(u) {
    u = u || userObj();
    var blob = [u.staffRole, u.ruoloDettagliato, u.ruolo, u.role, u.siteRoleFamily, u.staffProfile && u.staffProfile.fieldRole]
      .filter(Boolean).join(' ').toLowerCase();
    return /presidente|presidenza|club president/.test(blob);
  }

  function getPresData() {
    var u = userObj();
    var def = {
      clubName: u.squadra || u.club || 'Elisee',
      matricola: u.matricola || '13943 / FIGC',
      sede: u.sede || 'Viale Giuseppe Mazzini, 35/C Foggia FG',
      stadio: u.stadio || 'Stadio Comunale Pino Zaccheria',
      telefono: u.telefono || '+39 0881 742911',
      presName: (u.nome ? (u.nome + ' ' + (u.cognome || '')) : (u.name || 'The King')).trim(),
      presRole: 'Presidente &amp; Proprietario Club',
      presDoc: 'Verificato 100%',
      presTessera: 'FIGC-PRES-001',
      presScadenza: 'Vitalizio / Esecutivo',
      logoUrl: 'immagini/squadre-loghi/foggia.png',
      teamPhotoUrl: 'immagini/04-workspace-scout/scout-workspace.svg?v=20260730_225504',
      roster: [
        { id: 'p-1', num: 1, name: 'Marco Fumagalli', role: 'Portiere', birth: '2001', cert: 'Regolare', status: 'disp', app: 28 },
        { id: 'p-2', num: 2, name: 'Alessandro Silvestro', role: 'Terzino Destro', birth: '2002', cert: 'Regolare', status: 'disp', app: 25 },
        { id: 'p-5', num: 5, name: 'Luigi Carillo', role: 'Difensore Centrale', birth: '1996', cert: 'Regolare', status: 'disp', app: 28 },
        { id: 'p-6', num: 6, name: 'Davide Di Pasquale', role: 'Difensore Centrale', birth: '1996', cert: 'Regolare', status: 'disp', app: 26 },
        { id: 'p-3', num: 3, name: 'Luca Rizzo Pinna', role: 'Terzino Sinistro', birth: '2003', cert: 'Regolare', status: 'disp', app: 24 },
        { id: 'p-8', num: 8, name: 'Moses Odjer', role: 'Mediano', birth: '1996', cert: 'Regolare', status: 'disp', app: 27 },
        { id: 'p-4', num: 4, name: 'Jacopo Petermann', role: 'Regista', birth: '1994', cert: 'Regolare', status: 'disp', app: 26 },
        { id: 'p-10', num: 10, name: 'Diego Peralta', role: 'Trequartista', birth: '1996', cert: 'Regolare', status: 'disp', app: 28 },
        { id: 'p-7', num: 7, name: 'Eliseo Miraglia', role: 'Ala Sinistra', birth: '2004', cert: 'Regolare', status: 'disp', app: 28 },
        { id: 'p-11', num: 11, name: 'Roberto Ogunseye', role: 'Attaccante Centrale', birth: '1995', cert: 'Regolare', status: 'disp', app: 27 },
        { id: 'p-9', num: 9, name: 'Alexis Ferrante', role: 'Seconda Punta', birth: '1995', cert: 'Regolare', status: 'disp', app: 25 }
      ],
      staffMembers: [
        { id: 'st-pres', name: 'The King (Eliseo Miraglia)', role: 'Presidente' },
        { id: 'st-coach', name: 'Allenatore Prima Squadra', role: 'Allenatore' },
        { id: 'st-vice', name: 'Vice Allenatore', role: 'Vice Allenatore' },
        { id: 'st-prep', name: 'Luca Rossi', role: 'Preparatore Atletico' },
        { id: 'st-fisio', name: 'Antonio Gentile', role: 'Fisioterapista' }
      ],
      trainingsList: [
        {
          id: 'train-1',
          day: 'mar',
          date: '01/09',
          fullDate: 'Martedì 1 Settembre 2026',
          title: 'Allenamento',
          incontro: '-:-',
          inizio: '19:00',
          fine: '20:30',
          campo: 'Campo A - Stadio Pino Zaccheria',
          focus: 'Seduta Tattica & Pressione Alta',
          votes: {
            'p-1': { id: 'p-1', name: 'Marco Fumagalli', role: 'Portiere', vote: 'yes', isStaff: false },
            'p-7': { id: 'p-7', name: 'Eliseo Miraglia', role: 'Ala Sinistra', vote: 'yes', isStaff: false },
            'p-5': { id: 'p-5', name: 'Luigi Carillo', role: 'Difensore Centrale', vote: 'yes', isStaff: false },
            'p-2': { id: 'p-2', name: 'Alessandro Silvestro', role: 'Terzino Destro', vote: 'maybe', isStaff: false },
            'p-11': { id: 'p-11', name: 'Roberto Ogunseye', role: 'Attaccante Centrale', vote: 'no', isStaff: false },
            'st-prep': { id: 'st-prep', name: 'Luca Rossi', role: 'Preparatore Atletico', vote: 'yes', isStaff: true },
            'st-fisio': { id: 'st-fisio', name: 'Antonio Gentile', role: 'Fisioterapista', vote: 'yes', isStaff: true }
          }
        }
      ],
      partite: [
        { id: 'match-1', date: 'Domenica · Ore 15:00', opponent: 'Elisee vs Taranto', comp: 'Campionato Serie D · Girone H', stadium: 'Stadio Pino Zaccheria', status: 'Prossima Gara', conv: '22 Convocati' }
      ],
      tacticalSchemes: [
        {
          id: 'tac-1',
          title: 'Strategia Presidenziale: Assetto Tecnico 2026/27',
          date: '26/08/2026',
          type: 'Direttiva Presidenziale',
          preview: 'immagini/04-workspace-scout/scout-workspace.svg?v=20260730_225504'
        }
      ],
      stats: {
        torneo: 'Tutti i tornei',
        totale: { giocate: 28, vinte: 19, pareggi: 5, perse: 4, gf: 54, gs: 22, dr: '+32', pt: 62 },
        casa: { giocate: 14, vinte: 11, pareggi: 2, perse: 1, gf: 32, gs: 9, dr: '+23', pt: 35 },
        trasferta: { giocate: 14, vinte: 8, pareggi: 3, perse: 3, gf: 22, gs: 13, dr: '+9', pt: 27 }
      }
    };

    try {
      var stored = localStorage.getItem('elisee_pres_hub_data');
      if (stored) return Object.assign(def, JSON.parse(stored));
    } catch (_) {}
    return def;
  }

  function savePresData(data) {
    try {
      localStorage.setItem('elisee_pres_hub_data', JSON.stringify(data));
      if (data.trainingsList) {
        localStorage.setItem('elisee_club_trainings_shared', JSON.stringify(data.trainingsList));
      }
    } catch (_) {}
  }

  var TAB_DESCS = {
    club: 'Organizzazione societaria, dirigenti e staff tecnico.',
    squadra: 'Gestione della rosa, ruoli e dati dei giocatori.',
    allenamenti: 'Pianificazione e gestione degli allenamenti stagionali.',
    partite: 'Calendario, convocazioni e gestione delle partite.',
    lavagna: 'Strumenti tattici per schemi, analisi e strategie.'
  };

  function renderHub() {
    var mount = document.getElementById('es-prd');
    if (!mount) return;

    var data = getPresData();

    var html =
      '<div class="es-mister-hub">' +
        '<div class="es-mister-trial-bar">' +
          '<div class="es-mister-trial-text"><span>👑</span> Stai operando come Presidente &amp; Vertice Societario.</div>' +
          '<button type="button" class="es-mister-btn-sub" onclick="if(window.showToast){ window.showToast(\'👑 Benvenuto Presidente. Accesso Club Master 100% Attivo.\', \'success\'); }">Abbonati</button>' +
        '</div>' +

        '<div class="es-mister-wrap">' +
          '<div class="es-mister-club-header">' +
            '<div class="es-mister-club-main">' +
              '<div class="es-mister-crest-badge"><img src="' + esc(data.logoUrl) + '" alt="' + esc(data.clubName) + '" onerror="this.src=\'immagini/squadre-loghi/napoli.png\';"></div>' +
              '<div>' +
                '<div class="es-mister-club-tags"><span class="es-mister-tag es-mister-tag-primary">PRIMA SQUADRA</span><span class="es-mister-tag es-mister-tag-dark">Stagione in corso</span><span class="es-mister-tag es-mister-tag-gold">Presidente | Admin Club</span></div>' +
                '<h1 class="es-mister-club-title">' + esc(data.clubName) + '</h1>' +
                '<p class="es-mister-club-desc" id="pres-tab-desc">' + esc(TAB_DESCS[activeTab]) + '</p>' +
              '</div>' +
            '</div>' +
          '</div>' +

          '<nav class="es-mister-nav-bar" role="tablist">' +
            '<button type="button" class="es-mister-nav-tab ' + (activeTab === 'club' ? 'is-active' : '') + '" data-tab="club">🛡️ Club</button>' +
            '<button type="button" class="es-mister-nav-tab ' + (activeTab === 'squadra' ? 'is-active' : '') + '" data-tab="squadra">👥 Squadra</button>' +
            '<button type="button" class="es-mister-nav-tab ' + (activeTab === 'allenamenti' ? 'is-active' : '') + '" data-tab="allenamenti">🏃‍♂️ Allenamenti</button>' +
            '<button type="button" class="es-mister-nav-tab ' + (activeTab === 'partite' ? 'is-active' : '') + '" data-tab="partite">⚽ Partite</button>' +
            '<button type="button" class="es-mister-nav-tab ' + (activeTab === 'lavagna' ? 'is-active' : '') + '" data-tab="lavagna">🖌️ Lavagna</button>' +
          '</nav>' +

          '<div id="pres-tab-content">' +
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
        '<div class="es-mister-card-white">' +
          '<div class="es-mister-card-header">' +
            '<div class="es-mister-card-title-wrap"><span class="es-mister-card-icon">🛡️</span><div><h3 class="es-mister-card-title">Club</h3><p class="es-mister-card-sub">Dati società e impianto sportivo</p></div></div>' +
            '<button type="button" class="es-mister-circle-btn" id="btn-pres-edit-club-data">✏️</button>' +
          '</div>' +
          '<table class="es-mister-info-table">' +
            '<tr><th>SOCIETÀ</th><td>' + esc(data.clubName) + ' (Admin-716)</td></tr>' +
            '<tr><th>MATRICOLA</th><td>' + esc(data.matricola) + '</td></tr>' +
            '<tr><th>SEDE</th><td>' + esc(data.sede) + '</td></tr>' +
            '<tr><th>STADIO</th><td>' + esc(data.stadio) + '</td></tr>' +
            '<tr><th>TELEFONO</th><td>' + esc(data.telefono) + '</td></tr>' +
          '</table>' +
        '</div>' +
        '<div class="es-mister-card-white">' +
          '<div class="es-mister-card-header">' +
            '<div class="es-mister-card-title-wrap"><span class="es-mister-card-icon">🖼️</span><div><h3 class="es-mister-card-title">Immagini</h3><p class="es-mister-card-sub">Stemma e foto squadra</p></div></div>' +
          '</div>' +
          '<div class="es-mister-images-grid">' +
            '<div class="es-mister-img-box"><div class="es-mister-img-preview"><img src="' + esc(data.logoUrl) + '" alt="Stemma"></div><div style="display:flex; align-items:center; justify-content:space-between; margin-top:0.4rem;"><span style="font-weight:800; font-size:0.88rem;">Stemma</span><button type="button" class="es-mister-circle-btn" style="width:30px; height:30px; font-size:0.85rem;" onclick="if(window.showToast){ window.showToast(\'🖼️ Modifica stemma aperto\', \'info\'); }">✏️</button></div></div>' +
            '<div class="es-mister-img-box"><div class="es-mister-img-preview"><img src="' + esc(data.teamPhotoUrl) + '" alt="Foto squadra"></div><div style="display:flex; align-items:center; justify-content:space-between; margin-top:0.4rem;"><span style="font-weight:800; font-size:0.88rem;">Foto squadra</span><button type="button" class="es-mister-circle-btn" style="width:30px; height:30px; font-size:0.85rem;" onclick="if(window.showToast){ window.showToast(\'📷 Modifica foto squadra aperto\', \'info\'); }">✏️</button></div></div>' +
          '</div>' +
        '</div>' +
        '<div class="es-mister-card-white">' +
          '<div class="es-mister-card-header">' +
            '<div class="es-mister-card-title-wrap"><span class="es-mister-card-icon">👑</span><div><h3 class="es-mister-card-title">Staff Tecnico &amp; Presidenza</h3><p class="es-mister-card-sub">Organigramma e nomine del Presidente</p></div></div>' +
            '<button type="button" class="es-mister-circle-btn" id="btn-pres-add-staff">+</button>' +
          '</div>' +
          '<div class="es-mister-staff-box">' +
            '<div class="es-mister-staff-left"><div class="es-mister-staff-avatar" style="background:#facc15; color:#000;">👑</div><div><h4 class="es-mister-staff-name">' + esc(data.presName) + '</h4><div class="es-mister-staff-role">' + esc(data.presRole) + '</div><div class="es-mister-staff-meta"><span>Doc: <b>' + esc(data.presDoc) + '</b></span><span>Tessera: <b>' + esc(data.presTessera) + '</b></span><span>Status: <b>' + esc(data.presScadenza) + '</b></span></div></div></div>' +
            '<button type="button" class="es-mister-circle-btn" style="width:34px; height:34px; font-size:0.9rem;">✏️</button>' +
          '</div>' +
        '</div>'
      );
    }

    if (tab === 'squadra') {
      var playersHtml = (data.roster || []).map(function (p, idx) {
        return (
          '<div class="es-mister-player-card">' +
            '<div class="es-mister-player-num">' + p.num + '</div>' +
            '<div class="es-mister-player-info"><h4 class="es-mister-player-name">' + esc(p.name) + '</h4><div class="es-mister-player-role">' + esc(p.role) + ' · Anno ' + esc(p.birth) + '</div><div style="font-size:0.72rem; color:#64748b;">🟢 Tesserato FIGC · ' + p.app + ' Presenze</div></div>' +
            '<button type="button" class="es-mister-circle-btn" style="width:30px; height:30px; font-size:0.8rem;" data-pres-edit-player="' + idx + '">✏️</button>' +
          '</div>'
        );
      }).join('');

      return (
        '<div class="es-mister-card-white">' +
          '<div class="es-mister-card-header">' +
            '<div class="es-mister-card-title-wrap"><span class="es-mister-card-icon">👥</span><div><h3 class="es-mister-card-title">Squadra</h3><p class="es-mister-card-sub">' + esc(data.clubName) + ' · Prima Squadra (' + (data.roster || []).length + ' Giocatori in rosa)</p></div></div>' +
            '<div class="es-mister-card-actions">' +
              '<button type="button" class="es-mister-circle-btn" id="btn-pres-stats" title="Statistiche partite">📊</button>' +
              '<button type="button" class="es-mister-circle-btn" id="btn-pres-add-player" title="Nuovo calciatore">+</button>' +
            '</div>' +
          '</div>' +
          '<div class="es-mister-roster-grid">' + playersHtml + '</div>' +
        '</div>'
      );
    }

    if (tab === 'allenamenti') {
      var curUser = userObj();
      var myUserId = curUser.id || 'u-me';

      var trainCardsHtml = (data.trainingsList || []).map(function (t) {
        var v = t.votes || {};
        var yesCount = 0;
        var maybeCount = 0;
        var noCount = 0;

        Object.keys(v).forEach(function (k) {
          if (v[k].vote === 'yes') yesCount++;
          else if (v[k].vote === 'maybe') maybeCount++;
          else if (v[k].vote === 'no') noCount++;
        });

        var myVote = (v[myUserId] && v[myUserId].vote) || (v['st-pres'] && v['st-pres'].vote);

        return (
          '<div class="es-training-event-card" id="pres-card-' + t.id + '">' +
            '<div class="es-training-head-banner">' +
              '<div class="es-training-date-block">' +
                '<div class="es-training-day-chip"><span class="es-training-day-txt">' + esc(t.day) + '</span><span class="es-training-date-txt">' + esc(t.date) + '</span></div>' +
                '<div style="border-left:1.5px solid rgba(0,0,0,0.15); height:32px; margin:0 0.5rem;"></div>' +
                '<div><h4 class="es-training-title-txt">' + esc(t.title) + '</h4><div style="font-size:0.75rem; color:#092621; opacity:0.85;">' + esc(t.focus) + '</div></div>' +
              '</div>' +
              '<span style="font-size:1.4rem; font-weight:800; opacity:0.7;">&rsaquo;</span>' +
            '</div>' +

            '<div class="es-training-times-grid">' +
              '<div class="es-training-time-col"><div class="es-training-time-val">' + esc(t.incontro) + '</div><div class="es-training-time-lbl">Incontro</div></div>' +
              '<div class="es-training-time-col"><div class="es-training-time-val">' + esc(t.inizio) + '</div><div class="es-training-time-lbl">Inizio</div></div>' +
              '<div class="es-training-time-col"><div class="es-training-time-val">' + esc(t.fine) + '</div><div class="es-training-time-lbl">Fine</div></div>' +
            '</div>' +

            '<div class="es-training-actions-bar">' +
              '<div class="es-training-vote-group">' +
                '<button type="button" class="es-training-vote-btn ' + (myVote === 'yes' ? 'is-voted-yes' : '') + '" data-train-id="' + t.id + '" data-vote-val="yes" title="Ci sono (Presente)"><span>👍</span> <span>' + yesCount + '</span></button>' +
                '<button type="button" class="es-training-vote-btn ' + (myVote === 'maybe' ? 'is-voted-maybe' : '') + '" data-train-id="' + t.id + '" data-vote-val="maybe" title="In forse"><span>❓</span> <span>' + maybeCount + '</span></button>' +
                '<button type="button" class="es-training-vote-btn ' + (myVote === 'no' ? 'is-voted-no' : '') + '" data-train-id="' + t.id + '" data-vote-val="no" title="Non ci sono (Assente)"><span>👎</span> <span>' + noCount + '</span></button>' +
              '</div>' +
              '<button type="button" class="es-training-participants-btn" data-open-pres-voters-id="' + t.id + '" title="Vedi tutti coloro che hanno risposto">👥</button>' +
            '</div>' +
          '</div>'
        );
      }).join('');

      return (
        '<div class="es-mister-card-white">' +
          '<div class="es-mister-card-header">' +
            '<div class="es-mister-card-title-wrap"><span class="es-mister-card-icon">🏃‍♂️</span><div><h3 class="es-mister-card-title">Prossimi Eventi &amp; Allenamenti</h3><p class="es-mister-card-sub">Controllo presenze prima squadra (Like = Ci sono, Dislike = Non ci sono)</p></div></div>' +
            '<div class="es-mister-card-actions"><button type="button" class="es-mister-circle-btn" id="btn-pres-add-training" title="Nuovo allenamento">+</button></div>' +
          '</div>' +
          '<div style="margin-top:1rem;">' + trainCardsHtml + '</div>' +
        '</div>'
      );
    }

    if (tab === 'partite') {
      var matchHtml = (data.partite || []).map(function (m) {
        return (
          '<div class="es-mister-event-card">' +
            '<div class="es-mister-event-date-badge">' + m.date + '</div>' +
            '<div class="es-mister-event-details"><h4 class="es-mister-event-title">' + m.opponent + '</h4><p class="es-mister-event-sub">' + m.comp + ' · 🏟️ ' + m.stadium + '</p><div style="font-size:0.75rem; color:#0284c7; font-weight:700; margin-top:0.3rem;">⚽ ' + m.status + ' (' + m.conv + ')</div></div>' +
            '<button type="button" class="es-mister-circle-btn" style="width:34px; height:34px; font-size:0.85rem;">📋</button>' +
          '</div>'
        );
      }).join('');

      return (
        '<div class="es-mister-card-white">' +
          '<div class="es-mister-card-header">' +
            '<div class="es-mister-card-title-wrap"><span class="es-mister-card-icon">⚽</span><div><h3 class="es-mister-card-title">Partite</h3><p class="es-mister-card-sub">' + esc(data.clubName) + ' · Prima Squadra</p></div></div>' +
            '<div class="es-mister-card-actions"><button type="button" class="es-mister-circle-btn" id="btn-pres-match-stats">📊</button><button type="button" class="es-mister-circle-btn" id="btn-pres-add-match">+</button></div>' +
          '</div>' +
          '<div style="margin-top:1rem;">' + matchHtml + '</div>' +
        '</div>'
      );
    }

    if (tab === 'lavagna') {
      var schemes = data.tacticalSchemes || [];
      var galleryHtml = schemes.length === 0
        ? '<div style="text-align:center; padding:2rem; color:#94a3b8; font-weight:600;">Nessuna immagine o schema salvato.<br>Clicca su "Crea immagine" o "Carica immagine / PDF" in alto per iniziare.</div>'
        : ('<div class="es-tactical-gallery-grid">' +
            schemes.map(function (s, idx) {
              return (
                '<div class="es-tactical-card-item">' +
                  '<div class="es-tactical-card-thumb"><img src="' + esc(s.preview) + '" alt="' + esc(s.title) + '"></div>' +
                  '<h4 style="font-size:0.95rem; font-weight:800; color:#0f172a; margin:0 0 0.2rem;">' + esc(s.title) + '</h4>' +
                  '<div style="font-size:0.75rem; color:#64748b; margin-bottom:0.75rem;">' + esc(s.type) + ' · ' + esc(s.date) + '</div>' +
                  '<div style="display:flex; gap:0.4rem;">' +
                    '<button type="button" class="btn btn-outline-pill" style="padding:0.3rem 0.65rem; font-size:0.75rem;" onclick="window.viewPresSchemePreview(' + idx + ')">👁️ Apri</button>' +
                    '<button type="button" class="btn btn-outline-pill" style="padding:0.3rem 0.65rem; font-size:0.75rem;" onclick="window.downloadPresSchemePDF(' + idx + ')">📥 PDF</button>' +
                    '<button type="button" class="btn btn-outline-pill" style="padding:0.3rem 0.65rem; font-size:0.75rem; color:#ef4444; border-color:#fca5a5;" onclick="window.deletePresScheme(' + idx + ')">🗑️</button>' +
                  '</div>' +
                '</div>'
              );
            }).join('') +
          '</div>');

      return (
        '<div class="es-mister-card-white">' +
          '<div class="es-mister-card-header">' +
            '<div class="es-mister-card-title-wrap"><span class="es-mister-card-icon">🖌️</span><div><h3 class="es-mister-card-title">Lavagna Tattica</h3><p class="es-mister-card-sub">' + esc(data.clubName) + ' · Prima Squadra (Presidenza)</p></div></div>' +
            '<div class="es-mister-card-actions">' +
              '<input type="file" id="pres-file-upload" accept="image/png,image/jpeg,application/pdf" style="display:none;">' +
              '<button type="button" class="btn btn-outline-pill" id="btn-pres-upload-file" style="background:#f8fafc; border:1.5px solid #cbd5e1; color:#0f172a; padding:0.55rem 1.15rem; font-weight:800; font-size:0.85rem; display:inline-flex; align-items:center; gap:0.45rem;">📁 Carica immagine / PDF</button>' +
              '<button type="button" class="btn btn-outline-pill pf-btn-solid" id="btn-pres-create-tactic" style="background:#0d9488; color:#ffffff; border:none; padding:0.55rem 1.25rem; font-weight:800; font-size:0.85rem; display:inline-flex; align-items:center; gap:0.45rem;">🖌️ Crea immagine</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="es-mister-card-white">' +
          '<div class="es-mister-card-header" style="margin-bottom:0.6rem;"><div><h3 class="es-mister-card-title" style="font-size:1.15rem;">Libreria immagini</h3><p class="es-mister-card-sub">Immagini create e salvate dalla lavagna tattica o caricate dalla presidenza.</p></div></div>' +
          galleryHtml +
        '</div>'
      );
    }

    return '';
  }

  // ============================================================
  // MODALE STATISTICHE PARTITE
  // ============================================================
  function openStatsModal() {
    var old = document.getElementById('es-pres-stats-modal-overlay');
    if (old) old.remove();

    var data = getPresData();
    var s = data.stats;

    var modal = document.createElement('div');
    modal.id = 'es-pres-stats-modal-overlay';
    modal.className = 'es-pres-stats-modal';
    modal.innerHTML =
      '<div class="es-pres-stats-sheet" role="dialog" aria-modal="true">' +
        '<div style="display:flex; align-items:center; justify-content:space-between; padding-bottom:1rem; border-bottom:1.5px solid #f1f5f9;">' +
          '<div style="display:flex; align-items:center; gap:0.75rem;"><span style="font-size:1.6rem; color:#0d9488;">📊</span><div><h2 style="font-size:1.4rem; font-weight:900; margin:0; color:#0f172a;">Statistiche</h2><p style="font-size:0.84rem; color:#64748b; margin:0.1rem 0 0;">Statistiche partite</p></div></div>' +
          '<button type="button" class="es-tactical-btn-close" id="btn-close-stats-modal" style="font-size:1.6rem; cursor:pointer;">&times;</button>' +
        '</div>' +

        '<div class="es-pres-stats-grid">' +
          '<div>' +
            '<h4 style="font-size:0.88rem; font-weight:800; color:#0f172a; margin:0 0 0.45rem;">Filtri</h4>' +
            '<label style="display:block; font-size:0.75rem; font-weight:800; color:#64748b; margin-bottom:0.3rem;">TORNEI</label>' +
            '<select id="pres-filter-tornei" class="es-pres-form-inp" style="padding:0.6rem 0.8rem; font-size:0.88rem; font-weight:700; margin-bottom:1.2rem;">' +
              '<option value="all">Tutti i tornei</option>' +
              '<option value="d">Campionato Serie D</option>' +
              '<option value="coppa">Coppa Italia Serie D</option>' +
            '</select>' +
            '<button type="button" class="btn btn-outline-pill pf-btn-solid" id="btn-print-stats" style="width:100%; background:#0d9488; color:#fff; border:none; padding:0.75rem; font-weight:800; font-size:0.92rem; display:inline-flex; align-items:center; justify-content:center; gap:0.5rem; border-radius:12px;">🖨️ Stampa Statistiche</button>' +
          '</div>' +

          '<div>' +
            '<div class="es-pres-stats-kpi-row">' +
              '<div class="es-pres-kpi-card"><div class="es-pres-kpi-val">' + s.totale.giocate + '</div><div class="es-pres-kpi-lbl">Partite</div></div>' +
              '<div class="es-pres-kpi-card"><div class="es-pres-kpi-val">' + s.totale.pt + '</div><div class="es-pres-kpi-lbl">Punti</div></div>' +
              '<div class="es-pres-kpi-card"><div class="es-pres-kpi-val">' + (s.totale.pt / s.totale.giocate).toFixed(2) + '</div><div class="es-pres-kpi-lbl">Media Punti</div></div>' +
            '</div>' +

            '<div class="es-pres-stats-triple-box">' +
              '<div class="es-pres-split-box">' +
                '<h5 class="es-pres-split-title">Totale</h5>' +
                '<div class="es-pres-mini-stats-grid">' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.totale.giocate + '</div><div class="es-pres-stat-lbl">Giocate</div></div>' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.totale.vinte + '</div><div class="es-pres-stat-lbl">Vinte</div></div>' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.totale.pareggi + '</div><div class="es-pres-stat-lbl">Pareggi</div></div>' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.totale.perse + '</div><div class="es-pres-stat-lbl">Perse</div></div>' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.totale.gf + '</div><div class="es-pres-stat-lbl">GF</div></div>' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.totale.gs + '</div><div class="es-pres-stat-lbl">GS</div></div>' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.totale.dr + '</div><div class="es-pres-stat-lbl">DR</div></div>' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.totale.pt + '</div><div class="es-pres-stat-lbl">PT</div></div>' +
                '</div>' +
              '</div>' +

              '<div class="es-pres-split-box">' +
                '<h5 class="es-pres-split-title">Casa</h5>' +
                '<div class="es-pres-mini-stats-grid">' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.casa.giocate + '</div><div class="es-pres-stat-lbl">Giocate</div></div>' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.casa.vinte + '</div><div class="es-pres-stat-lbl">Vinte</div></div>' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.casa.pareggi + '</div><div class="es-pres-stat-lbl">Pareggi</div></div>' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.casa.perse + '</div><div class="es-pres-stat-lbl">Perse</div></div>' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.casa.gf + '</div><div class="es-pres-stat-lbl">GF</div></div>' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.casa.gs + '</div><div class="es-pres-stat-lbl">GS</div></div>' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.casa.dr + '</div><div class="es-pres-stat-lbl">DR</div></div>' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.casa.pt + '</div><div class="es-pres-stat-lbl">PT</div></div>' +
                '</div>' +
              '</div>' +

              '<div class="es-pres-split-box">' +
                '<h5 class="es-pres-split-title">Trasferta</h5>' +
                '<div class="es-pres-mini-stats-grid">' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.trasferta.giocate + '</div><div class="es-pres-stat-lbl">Giocate</div></div>' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.trasferta.vinte + '</div><div class="es-pres-stat-lbl">Vinte</div></div>' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.trasferta.pareggi + '</div><div class="es-pres-stat-lbl">Pareggi</div></div>' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.trasferta.perse + '</div><div class="es-pres-stat-lbl">Perse</div></div>' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.trasferta.gf + '</div><div class="es-pres-stat-lbl">GF</div></div>' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.trasferta.gs + '</div><div class="es-pres-stat-lbl">GS</div></div>' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.trasferta.dr + '</div><div class="es-pres-stat-lbl">DR</div></div>' +
                  '<div class="es-pres-stat-item"><div class="es-pres-stat-val">' + s.trasferta.pt + '</div><div class="es-pres-stat-lbl">PT</div></div>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);

    modal.querySelector('#btn-close-stats-modal').onclick = function () { modal.remove(); };
    modal.onclick = function (e) { if (e.target === modal) modal.remove(); };
    modal.querySelector('#btn-print-stats').onclick = function () { if (window.print) window.print(); };
  }

  // ============================================================
  // MODALE NUOVO CALCIATORE
  // ============================================================
  function openNewPlayerModal() {
    var old = document.getElementById('es-pres-new-player-overlay');
    if (old) old.remove();

    var modal = document.createElement('div');
    modal.id = 'es-pres-new-player-overlay';
    modal.className = 'es-pres-stats-modal';
    modal.innerHTML =
      '<div class="es-pres-new-player-sheet" role="dialog" aria-modal="true">' +
        '<div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1.4rem;">' +
          '<h2 style="font-size:1.45rem; font-weight:900; margin:0; color:#0f172a;">Nuovo calciatore</h2>' +
          '<button type="button" class="es-tactical-btn-close" id="btn-close-new-player">&times;</button>' +
        '</div>' +

        '<form id="form-new-player">' +
          '<h4 style="font-size:0.82rem; font-weight:800; color:#0d9488; text-transform:uppercase; letter-spacing:0.04em; margin:0 0 1rem;">DATI CALCIATORE</h4>' +

          '<div class="es-pres-form-row">' +
            '<label class="es-pres-form-lbl">NOME</label>' +
            '<input type="text" class="es-pres-form-inp" id="inp-np-nome" placeholder="Nome atleta" required>' +
          '</div>' +

          '<div class="es-pres-form-row">' +
            '<label class="es-pres-form-lbl">COGNOME</label>' +
            '<input type="text" class="es-pres-form-inp" id="inp-np-cognome" placeholder="Cognome atleta" required>' +
          '</div>' +

          '<div class="es-pres-form-row">' +
            '<label class="es-pres-form-lbl">DATA DI NASCITA</label>' +
            '<input type="date" class="es-pres-form-inp" id="inp-np-data" required>' +
          '</div>' +

          '<div class="es-pres-form-row">' +
            '<label class="es-pres-form-lbl">RUOLO</label>' +
            '<select class="es-pres-form-inp" id="inp-np-ruolo" required>' +
              '<option value="">Seleziona ruolo</option>' +
              '<option value="Portiere">Portiere</option>' +
              '<option value="Difensore Centrale">Difensore Centrale</option>' +
              '<option value="Terzino Destro">Terzino Destro</option>' +
              '<option value="Terzino Sinistro">Terzino Sinistro</option>' +
              '<option value="Mediano">Mediano</option>' +
              '<option value="Mezzala">Mezzala</option>' +
              '<option value="Trequartista">Trequartista</option>' +
              '<option value="Ala Destra">Ala Destra</option>' +
              '<option value="Ala Sinistra">Ala Sinistra</option>' +
              '<option value="Attaccante Centrale">Attaccante Centrale</option>' +
              '<option value="Seconda Punta">Seconda Punta</option>' +
            '</select>' +
          '</div>' +

          '<div style="display:flex; align-items:center; justify-content:flex-end; gap:0.75rem; margin-top:1.8rem;">' +
            '<button type="button" class="btn btn-outline-pill" id="btn-cancel-new-player" style="border:1.5px solid #cbd5e1; padding:0.65rem 1.4rem; font-weight:800; font-size:0.92rem;">Annulla</button>' +
            '<button type="submit" class="btn btn-outline-pill pf-btn-solid" style="background:#facc15; color:#0f172a; border:none; padding:0.65rem 1.6rem; font-weight:900; font-size:0.92rem; box-shadow:0 2px 10px rgba(250,204,21,0.4);">Aggiungi calciatore</button>' +
          '</div>' +
        '</form>' +
      '</div>';

    document.body.appendChild(modal);

    function close() { modal.remove(); }
    modal.querySelector('#btn-close-new-player').onclick = close;
    modal.querySelector('#btn-cancel-new-player').onclick = close;
    modal.onclick = function (e) { if (e.target === modal) close(); };

    modal.querySelector('#form-new-player').onsubmit = function (e) {
      e.preventDefault();
      var nome = modal.querySelector('#inp-np-nome').value.trim();
      var cognome = modal.querySelector('#inp-np-cognome').value.trim();
      var dataNascita = modal.querySelector('#inp-np-data').value;
      var ruolo = modal.querySelector('#inp-np-ruolo').value;
      var birthYear = dataNascita ? dataNascita.split('-')[0] : '2004';

      var data = getPresData();
      data.roster = data.roster || [];
      var nextNum = data.roster.length + 1;
      data.roster.push({
        id: 'p-' + nextNum,
        num: nextNum,
        name: nome + ' ' + cognome,
        role: ruolo,
        birth: birthYear,
        cert: 'Regolare',
        status: 'disp',
        app: 0
      });
      savePresData(data);
      close();
      renderHub();
      if (window.showToast) window.showToast('✅ Calciatore ' + nome + ' ' + cognome + ' aggiunto alla rosa!', 'success');
    };
  }

  // Global methods for scheme gallery
  window.viewPresSchemePreview = function () {
    if (window.EliseeCoachDash && typeof window.EliseeCoachDash.openEditor === 'function') {
      window.EliseeCoachDash.openEditor();
    }
  };

  window.downloadPresSchemePDF = function (idx) {
    var data = getPresData();
    var s = (data.tacticalSchemes || [])[idx];
    if (s) {
      if (window.jspdf && window.jspdf.jsPDF) {
        var doc = new window.jspdf.jsPDF();
        doc.setFontSize(18);
        doc.text('ELISEE SCOUT — PRESIDENTIAL HUB', 14, 20);
        doc.setFontSize(14);
        doc.text('Direttiva: ' + s.title, 14, 30);
        doc.setFontSize(11);
        doc.text('Club: ' + data.clubName + ' | Presidente: ' + data.presName, 14, 40);
        doc.text('Data: ' + s.date + ' | Categoria: ' + s.type, 14, 48);
        doc.save(s.title.replace(/\s+/g, '_') + '.pdf');
      }
      if (window.showToast) window.showToast('📥 Download PDF direttiva presidenziale avviato!', 'success');
    }
  };

  window.deletePresScheme = function (idx) {
    if (confirm('Vuoi eliminare questo documento dalla libreria presidenziale?')) {
      var data = getPresData();
      data.tacticalSchemes.splice(idx, 1);
      savePresData(data);
      renderHub();
      if (window.showToast) window.showToast('🗑️ Documento eliminato', 'info');
    }
  };

  function bindHubEvents() {
    var mount = document.getElementById('es-prd');
    if (!mount) return;

    mount.querySelectorAll('.es-mister-nav-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeTab = btn.getAttribute('data-tab');
        renderHub();
      });
    });

    // Interazioni Voti Like / Dislike
    mount.querySelectorAll('.es-training-vote-btn').forEach(function (btn) {
      btn.onclick = function () {
        var trainId = btn.getAttribute('data-train-id');
        var voteVal = btn.getAttribute('data-vote-val');
        var curUser = userObj();
        var myUserId = curUser.id || 'u-me';
        var myUserName = (curUser.nome ? (curUser.nome + ' ' + (curUser.cognome || '')) : (curUser.name || 'Presidente')).trim();
        var myRole = curUser.ruolo || curUser.siteRoleFamily || 'Presidente';

        var data = getPresData();
        var train = (data.trainingsList || []).find(function (t) { return t.id === trainId; });
        if (train) {
          train.votes = train.votes || {};
          train.votes[myUserId] = {
            id: myUserId,
            name: myUserName,
            role: myRole,
            vote: voteVal,
            isStaff: true
          };
          savePresData(data);
          renderHub();

          var msg = voteVal === 'yes'
            ? '👍 Hai confermato la presenza: Ci sono!'
            : (voteVal === 'maybe' ? '❓ Presenza in forse registrata' : '👎 Segnato come non disponibile: Non ci sono');
          if (window.showToast) window.showToast(msg, voteVal === 'yes' ? 'success' : (voteVal === 'maybe' ? 'warning' : 'info'));
        }
      };
    });

    // Apertura Modale Partecipanti (👥)
    mount.querySelectorAll('.es-training-participants-btn').forEach(function (btn) {
      btn.onclick = function () {
        var trainId = btn.getAttribute('data-open-pres-voters-id');
        if (window.EliseeCoachDash && typeof window.EliseeCoachDash.openVoters === 'function') {
          window.EliseeCoachDash.openVoters(trainId);
        }
      };
    });

    var btnStats = mount.querySelector('#btn-pres-stats') || mount.querySelector('#btn-pres-match-stats');
    if (btnStats) btnStats.onclick = openStatsModal;

    var btnAddP = mount.querySelector('#btn-pres-add-player');
    if (btnAddP) btnAddP.onclick = openNewPlayerModal;

    var btnCreate = mount.querySelector('#btn-pres-create-tactic');
    if (btnCreate) {
      btnCreate.onclick = function () {
        if (window.EliseeCoachDash && typeof window.EliseeCoachDash.openEditor === 'function') {
          window.EliseeCoachDash.openEditor();
        }
      };
    }

    var btnUpload = mount.querySelector('#btn-pres-upload-file');
    var fileInput = mount.querySelector('#pres-file-upload');
    if (btnUpload && fileInput) {
      btnUpload.onclick = function () { fileInput.click(); };
      fileInput.onchange = function (e) {
        var file = e.target.files && e.target.files[0];
        if (file) {
          var isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
          var reader = new FileReader();
          reader.onload = function (evt) {
            var data = getPresData();
            data.tacticalSchemes = data.tacticalSchemes || [];
            data.tacticalSchemes.unshift({
              id: 'tac-' + Date.now(),
              title: file.name.replace(/\.[^/.]+$/, ''),
              date: new Date().toLocaleDateString('it-IT'),
              type: isPdf ? 'Documento PDF' : 'Immagine Presidenziale',
              preview: isPdf ? 'immagini/04-workspace-scout/scout-workspace.svg?v=20260730_225504' : evt.target.result
            });
            savePresData(data);
            renderHub();
            if (window.showToast) window.showToast('✅ File ' + file.name + ' importato nella libreria!', 'success');
          };
          reader.readAsDataURL(file);
        }
      };
    }

    var btnEditClub = mount.querySelector('#btn-pres-edit-club-data');
    if (btnEditClub) {
      btnEditClub.onclick = function () {
        var data = getPresData();
        var newSede = prompt('Modifica Sede Operativa Club:', data.sede);
        if (newSede != null) data.sede = newSede;
        var newStadio = prompt('Modifica Stadio Ufficiale:', data.stadio);
        if (newStadio != null) data.stadio = newStadio;
        savePresData(data);
        renderHub();
        if (window.showToast) window.showToast('✅ Dati Club aggiornati!', 'success');
      };
    }
  }

  function render(force) {
    var group = document.getElementById('user-dossier-view-group');
    if (!group) return;
    var u = userObj();
    if (!force && !isPres(u)) return;

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
    renderHub();
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
    openStats: openStatsModal,
    openNewPlayer: openNewPlayerModal,
    setTab: function (tab) {
      activeTab = tab;
      renderHub();
    }
  };

  function boot() {
    document.addEventListener('elisee:role-changed', function () {
      if (isPres()) render(true);
      else detach();
    });
    document.addEventListener('elisee:auth-changed', function () {
      if (isPres()) render(true);
      else detach();
    });
    if (isPres()) render(true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
