/* ============================================================
   ELISEE SCOUT — Area Vice Allenatore (Mister Hub)
   5 Macro-aree Attive: CLUB | SQUADRA | ALLENAMENTI | PARTITE | LAVAGNA
   Incluso: Gestione Allenamenti Interattivi con Like (Ci sono), Dislike (Non ci sono) & Modale Votanti
   ============================================================ */
(function () {
  'use strict';

  var activeTab = 'allenamenti';
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

  function isVice(u) {
    u = u || userObj();
    var blob = String(u.staffRole || u.ruoloDettagliato || (u.staffProfile && u.staffProfile.fieldRole) || u.ruolo || u.role || '').trim().toLowerCase();
    return /allenatore in seconda|vice allenatore/.test(blob);
  }

  function getViceData() {
    var u = userObj();
    var def = {
      clubName: u.squadra || u.club || '',
      matricola: u.matricola || '',
      sede: u.sede || u.residenza || '',
      stadio: u.stadio || '',
      telefono: u.telefono || '',
      viceName: [u.nome, u.cognome].filter(Boolean).join(' ').trim() || 'Vice allenatore',
      viceRole: u.staffRole || 'Vice allenatore',
      viceDoc: (u.docsAttachedAt || u.badgeDocumentUrl) ? 'Documenti allegati' : 'Da completare',
      viceTessera: u.tessera || '',
      viceScadenza: u.scadenzaContratto || '',
      logoUrl: u.logoUrl || '',
      teamPhotoUrl: '',
      roster: [],
      staffMembers: [],
      trainingsList: [],
      partite: [],
      tacticalSchemes: []
    };

    try {
      var stored = localStorage.getItem('elisee_vice_hub_data_v3');
      if (stored) return Object.assign(def, JSON.parse(stored));
    } catch (_) {}
    return def;
  }

  function saveViceData(data) {
    try {
      localStorage.setItem('elisee_vice_hub_data_v3', JSON.stringify(data));
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
    var mount = document.getElementById('es-vd');
    if (!mount) return;

    var data = getViceData();

    var html =
      '<div class="es-mister-hub">' +
        '<div class="es-mister-trial-bar">' +
          '<div class="es-mister-trial-text">Area tecnica riservata al vice allenatore</div>' +
          '<button type="button" class="es-mister-btn-sub" onclick="if(window.showToast){ window.showToast(\'🌟 Abbonamento Staff Tecnico VIP attivo.\', \'success\'); }">Abbonati</button>' +
        '</div>' +

        '<div class="es-mister-wrap">' +
          '<div class="es-mister-club-header">' +
            '<div class="es-mister-club-main">' +
              '<div class="es-mister-crest-badge"><img src="' + esc(data.logoUrl) + '" alt="' + esc(data.clubName) + '" onerror="this.src=\'immagini/squadre-loghi/napoli.png\';"></div>' +
              '<div>' +
                '<div class="es-mister-club-tags"><span class="es-mister-tag es-mister-tag-primary">PRIMA SQUADRA</span><span class="es-mister-tag es-mister-tag-dark">Stagione in corso</span><span class="es-mister-tag es-mister-tag-gold">Vice Allenatore | Staff Tecnico</span></div>' +
                '<h1 class="es-mister-club-title">' + esc(data.clubName) + '</h1>' +
                '<p class="es-mister-club-desc" id="vice-tab-desc">' + esc(TAB_DESCS[activeTab]) + '</p>' +
              '</div>' +
            '</div>' +
          '</div>' +

          '<nav class="es-mister-nav-bar" role="tablist">' +
            '<button type="button" class="es-mister-nav-tab ' + (activeTab === 'club' ? 'is-active' : '') + '" data-tab="club">Club</button>' +
            '<button type="button" class="es-mister-nav-tab ' + (activeTab === 'squadra' ? 'is-active' : '') + '" data-tab="squadra">Squadra</button>' +
            '<button type="button" class="es-mister-nav-tab ' + (activeTab === 'allenamenti' ? 'is-active' : '') + '" data-tab="allenamenti">Allenamenti</button>' +
            '<button type="button" class="es-mister-nav-tab ' + (activeTab === 'partite' ? 'is-active' : '') + '" data-tab="partite">Partite</button>' +
            '<button type="button" class="es-mister-nav-tab ' + (activeTab === 'lavagna' ? 'is-active' : '') + '" data-tab="lavagna">Lavagna</button>' +
          '</nav>' +

          '<div id="vice-tab-content">' +
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
            '<button type="button" class="es-mister-circle-btn" id="btn-edit-club-data">✏️</button>' +
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
            '<div class="es-mister-card-title-wrap"><span class="es-mister-card-icon">⏱️</span><div><h3 class="es-mister-card-title">Staff tecnico</h3><p class="es-mister-card-sub">Allenatori e collaboratori tecnici</p></div></div>' +
            '<button type="button" class="es-mister-circle-btn" id="btn-add-staff">+</button>' +
          '</div>' +
          '<div class="es-mister-staff-box">' +
            '<div class="es-mister-staff-left"><div class="es-mister-staff-avatar">👤</div><div><h4 class="es-mister-staff-name">' + esc(data.viceName) + '</h4><div class="es-mister-staff-role">' + esc(data.viceRole) + '</div><div class="es-mister-staff-meta"><span>Doc: <b>' + esc(data.viceDoc) + '</b></span><span>Tessera: <b>' + esc(data.viceTessera) + '</b></span><span>Scad. cert.: <b>' + esc(data.viceScadenza) + '</b></span></div></div></div>' +
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
            '<div class="es-mister-player-info"><h4 class="es-mister-player-name">' + esc(p.name) + '</h4><div class="es-mister-player-role">' + esc(p.role) + ' · Anno ' + esc(p.birth) + '</div><div style="font-size:0.72rem; color:#64748b;">🟢 Disponibile · ' + p.app + ' Presenze</div></div>' +
            '<button type="button" class="es-mister-circle-btn" style="width:30px; height:30px; font-size:0.8rem;" data-edit-player="' + idx + '">✏️</button>' +
          '</div>'
        );
      }).join('');

      return (
        '<div class="es-mister-card-white">' +
          '<div class="es-mister-card-header">' +
            '<div class="es-mister-card-title-wrap"><span class="es-mister-card-icon">👥</span><div><h3 class="es-mister-card-title">Squadra</h3><p class="es-mister-card-sub">' + esc(data.clubName) + ' · Prima Squadra (' + (data.roster || []).length + ' Giocatori in rosa)</p></div></div>' +
            '<div class="es-mister-card-actions">' +
              '<button type="button" class="es-mister-circle-btn" id="btn-stats-roster">📊</button>' +
              '<button type="button" class="es-mister-circle-btn" id="btn-add-player">+</button>' +
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

        var myVote = (v[myUserId] && v[myUserId].vote) || (v['p-7'] && v['p-7'].vote);

        return (
          '<div class="es-training-event-card" id="vice-card-' + t.id + '">' +
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
              '<button type="button" class="es-training-participants-btn" data-open-vice-voters-id="' + t.id + '" title="Vedi tutti coloro che hanno risposto">👥</button>' +
            '</div>' +
          '</div>'
        );
      }).join('');

      return (
        '<div class="es-mister-card-white">' +
          '<div class="es-mister-card-header">' +
            '<div class="es-mister-card-title-wrap"><span class="es-mister-card-icon">🏃‍♂️</span><div><h3 class="es-mister-card-title">Prossimi Eventi &amp; Allenamenti</h3><p class="es-mister-card-sub">Gestione presenze staff e atleti (Like = Ci sono, Dislike = Non ci sono)</p></div></div>' +
            '<div class="es-mister-card-actions"><button type="button" class="es-mister-circle-btn" id="btn-vice-add-training" title="Nuovo allenamento">+</button></div>' +
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
            '<div class="es-mister-card-actions"><button type="button" class="es-mister-circle-btn" id="btn-stats-match">📊</button><button type="button" class="es-mister-circle-btn" id="btn-add-match">+</button></div>' +
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
                    '<button type="button" class="btn btn-outline-pill" style="padding:0.3rem 0.65rem; font-size:0.75rem;" onclick="window.viewViceSchemePreview(' + idx + ')">👁️ Apri</button>' +
                    '<button type="button" class="btn btn-outline-pill" style="padding:0.3rem 0.65rem; font-size:0.75rem;" onclick="window.downloadViceSchemePDF(' + idx + ')">📥 PDF</button>' +
                    '<button type="button" class="btn btn-outline-pill" style="padding:0.3rem 0.65rem; font-size:0.75rem; color:#ef4444; border-color:#fca5a5;" onclick="window.deleteViceScheme(' + idx + ')">🗑️</button>' +
                  '</div>' +
                '</div>'
              );
            }).join('') +
          '</div>');

      return (
        '<div class="es-mister-card-white">' +
          '<div class="es-mister-card-header">' +
            '<div class="es-mister-card-title-wrap"><span class="es-mister-card-icon">🖌️</span><div><h3 class="es-mister-card-title">Lavagna Tattica</h3><p class="es-mister-card-sub">' + esc(data.clubName) + ' · Prima Squadra (Vice Allenatore)</p></div></div>' +
            '<div class="es-mister-card-actions">' +
              '<input type="file" id="vice-file-upload" accept="image/png,image/jpeg,application/pdf" style="display:none;">' +
              '<button type="button" class="btn btn-outline-pill" id="btn-vice-upload-file" style="background:#f8fafc; border:1.5px solid #cbd5e1; color:#0f172a; padding:0.55rem 1.15rem; font-weight:800; font-size:0.85rem; display:inline-flex; align-items:center; gap:0.45rem;">📁 Carica immagine / PDF</button>' +
              '<button type="button" class="btn btn-outline-pill pf-btn-solid" id="btn-vice-create-tactic" style="background:#0d9488; color:#ffffff; border:none; padding:0.55rem 1.25rem; font-weight:800; font-size:0.85rem; display:inline-flex; align-items:center; gap:0.45rem;">🖌️ Crea immagine</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="es-mister-card-white">' +
          '<div class="es-mister-card-header" style="margin-bottom:0.6rem;"><div><h3 class="es-mister-card-title" style="font-size:1.15rem;">Libreria immagini</h3><p class="es-mister-card-sub">Immagini create e salvate dalla lavagna tattica o caricate dal vice allenatore.</p></div></div>' +
          galleryHtml +
        '</div>'
      );
    }

    return '';
  }

  function bindHubEvents() {
    var mount = document.getElementById('es-vd');
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
        var myUserName = (curUser.nome ? (curUser.nome + ' ' + (curUser.cognome || '')) : (curUser.name || 'Membro Staff')).trim();
        var myRole = curUser.ruolo || curUser.siteRoleFamily || 'Vice Allenatore';

        var data = getViceData();
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
          saveViceData(data);
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
        var trainId = btn.getAttribute('data-open-vice-voters-id');
        if (window.EliseeCoachDash && typeof window.EliseeCoachDash.openVoters === 'function') {
          window.EliseeCoachDash.openVoters(trainId);
        }
      };
    });

    var btnCreate = mount.querySelector('#btn-vice-create-tactic');
    if (btnCreate) {
      btnCreate.onclick = function () {
        if (window.EliseeCoachDash && typeof window.EliseeCoachDash.openEditor === 'function') {
          window.EliseeCoachDash.openEditor();
        }
      };
    }

    var btnUpload = mount.querySelector('#btn-vice-upload-file');
    var fileInput = mount.querySelector('#vice-file-upload');
    if (btnUpload && fileInput) {
      btnUpload.onclick = function () { fileInput.click(); };
      fileInput.onchange = function (e) {
        var file = e.target.files && e.target.files[0];
        if (file) {
          var isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
          var reader = new FileReader();
          reader.onload = function (evt) {
            var data = getViceData();
            data.tacticalSchemes = data.tacticalSchemes || [];
            data.tacticalSchemes.unshift({
              id: 'tac-' + Date.now(),
              title: file.name.replace(/\.[^/.]+$/, ''),
              date: new Date().toLocaleDateString('it-IT'),
              type: isPdf ? 'Documento PDF' : 'Immagine Tattica',
              preview: isPdf ? 'immagini/04-workspace-scout/scout-workspace.svg?v=20260730_225504' : evt.target.result
            });
            saveViceData(data);
            renderHub();
            if (window.showToast) window.showToast('✅ File ' + file.name + ' importato nella libreria!', 'success');
          };
          reader.readAsDataURL(file);
        }
      };
    }
  }

  function render(force) {
    var group = document.getElementById('user-dossier-view-group');
    if (!group) return;
    var u = userObj();
    if (!force && !isVice(u)) return;

    group.classList.add('is-vice-dash');
    var staffProfile = document.getElementById('es-staff-profile');
    if (!staffProfile) return;
    staffProfile.classList.add('es-vice-on');

    var vd = document.getElementById('es-vd');
    if (!vd) {
      vd = document.createElement('div');
      vd.id = 'es-vd';
      staffProfile.appendChild(vd);
    }
    vd.hidden = false;
    vd.removeAttribute('hidden');
    vd.style.display = 'block';
    renderHub();
  }

  function detach() {
    var group = document.getElementById('user-dossier-view-group');
    if (group) group.classList.remove('is-vice-dash');
    var staffProfile = document.getElementById('es-staff-profile');
    if (staffProfile) staffProfile.classList.remove('es-vice-on');
    var vd = document.getElementById('es-vd');
    if (vd) {
      vd.hidden = true;
      vd.style.removeProperty('display');
    }
  }

  window.EliseeViceDash = {
    render: render,
    detach: detach,
    isVice: isVice,
    setTab: function (tab) {
      activeTab = tab;
      renderHub();
    }
  };

  function boot() {
    document.addEventListener('elisee:role-changed', function () {
      if (isVice()) render(true);
      else detach();
    });
    document.addEventListener('elisee:auth-changed', function () {
      if (isVice()) render(true);
      else detach();
    });
    if (isVice()) render(true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
