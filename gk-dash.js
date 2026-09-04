/* Dashboard Preparatore Atletico / Tecnico dei Portieri — Elisee Scout */
(function () {
  'use strict';

  var GK_SESSIONS_KEY = 'elisee_gk_sessions_v2';
  var GK_DRILLS_KEY = 'elisee_gk_drills_v2';
  var GK_BADGES_KEY = 'elisee_gk_assigned_badges_v1';
  var GK_ROOM_KEY = 'elisee_gk_room_clips_v1';

  var AXES = [
    'Parate & Respinte', 'Reattività & Riflessi', 'Uscite Alte/Basse', 'Costruzione coi Piedi',
    'Piede Debole', 'Copertura Area GPS', 'Postura & Posizione', 'Sviluppo Vivaio GK'
  ];
  var V2025 = [92, 95, 89, 88, 84, 91, 93, 94];
  var V2023 = [78, 80, 75, 72, 68, 76, 81, 82];

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function userObj() {
    try { return JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {}; } catch (_) { return {}; }
  }
  function isGk(u) {
    u = u || userObj();
    var blob = String(u.staffRole || u.ruoloDettagliato || (u.staffProfile && u.staffProfile.fieldRole) || u.ruolo || u.role || '').trim().toLowerCase();
    return /preparatore.*portier|portier/.test(blob) || blob === 'preparatore atletico dei portieri';
  }
  function gkName(u) {
    return [u.nome, u.cognome].filter(Boolean).join(' ').trim() || u.username || 'Preparatore Portieri';
  }
  function toast(msg, kind) {
    if (typeof window.showToast === 'function') window.showToast(msg, kind || 'success');
  }

  function storeGet(key, def) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(def || [])); } catch (_) { return def || []; }
  }
  function storeSet(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (_) {}
  }

  function polar(cx, cy, r, i, n, val) {
    var a = (-Math.PI / 2) + (i * 2 * Math.PI / n);
    var rr = r * (val / 100);
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
  }
  function poly(cx, cy, r, vals) {
    return vals.map(function (v, i) {
      var p = polar(cx, cy, r, i, vals.length, v);
      return p[0].toFixed(1) + ',' + p[1].toFixed(1);
    }).join(' ');
  }
  function wedge(cx, cy, r, start, end, color) {
    var n = 24;
    var pts = [[cx, cy]];
    for (var i = 0; i <= n; i++) {
      var t = start + (end - start) * (i / n);
      pts.push([cx + Math.cos(t) * r, cy + Math.sin(t) * r]);
    }
    return '<path d="M' + pts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L') + ' Z" fill="' + color + '" />';
  }
  function radarSvg() {
    var cx = 220, cy = 210, r = 150, n = AXES.length;
    var html = '<svg viewBox="0 0 440 430" role="img" aria-label="Analisi attività tecnica e atletica portieri">';
    html += wedge(cx, cy, r, -Math.PI / 2, 0, 'rgba(74,222,128,0.16)');
    html += wedge(cx, cy, r, 0, Math.PI / 2, 'rgba(248,113,113,0.18)');
    html += wedge(cx, cy, r, Math.PI / 2, Math.PI, 'rgba(250,204,21,0.16)');
    html += wedge(cx, cy, r, Math.PI, Math.PI * 1.5, 'rgba(56,189,248,0.16)');
    for (var ring = 1; ring <= 5; ring++) {
      html += '<polygon points="' + poly(cx, cy, r, AXES.map(function () { return ring * 20; })) +
        '" fill="none" stroke="rgba(148,163,184,0.22)" stroke-width="1"/>';
    }
    for (var i = 0; i < n; i++) {
      var e = polar(cx, cy, r, i, n, 100);
      html += '<line x1="' + cx + '" y1="' + cy + '" x2="' + e[0].toFixed(1) + '" y2="' + e[1].toFixed(1) +
        '" stroke="rgba(148,163,184,0.2)"/>';
      var lab = polar(cx, cy, r + 26, i, n, 100);
      html += '<text x="' + lab[0].toFixed(1) + '" y="' + lab[1].toFixed(1) +
        '" text-anchor="middle" dominant-baseline="middle" fill="#94a3b8" font-size="9">' +
        esc(AXES[i]) + ' ' + V2025[i] + '%</text>';
    }
    html += '<polygon points="' + poly(cx, cy, r, V2023) + '" fill="rgba(148,163,184,0.12)" stroke="#64748b" stroke-width="1.5"/>';
    html += '<polygon points="' + poly(cx, cy, r, V2025) + '" fill="rgba(56,189,248,0.12)" stroke="#38bdf8" stroke-width="2"/>';
    html += '</svg>';
    return html;
  }

  function hideOthers() {
    if (typeof window.unmountAllRoleDashboards === 'function') {
      window.unmountAllRoleDashboards('es-gk');
    }
  }

  function renderPerformanceMetrics() {
    return '<section class="es-pd-card es-gk-metrics-card">' +
      '<div class="es-pd-card-header">' +
      '<h2><span>🧤</span> Performance Analisi Portieri & Metriche Specifiche</h2>' +
      '<span class="es-pd-source-badge es-pd-source-user">Area Tecnica GK</span>' +
      '</div>' +
      '<p class="es-gk-card-lead">Metriche uniche per gli estremi difensori: parate, efficacia nelle uscite e qualità nella costruzione dal basso.</p>' +
      '<div class="es-gk-stat-grid">' +
      '<div class="es-gk-stat-box"><b>89%</b><span>Respinte &amp; Parate Decisive</span><small class="text-emerald">Top 5% di categoria</small></div>' +
      '<div class="es-gk-stat-box"><b>94%</b><span>Uscite Alte / Basse Riuscite</span><small class="text-sky">Presa sicura + respinta aerea</small></div>' +
      '<div class="es-gk-stat-box"><b>86%</b><span>Costruzione dal Basso (Piede Forte)</span><small class="text-cyan">Precisione passaggi</small></div>' +
      '<div class="es-gk-stat-box"><b>74%</b><span>Costruzione (Piede Debole)</span><small class="text-amber">Sviluppo bilaterale</small></div>' +
      '<div class="es-gk-stat-box"><b>0.28s</b><span>Tempo di Reazione Uscita GPS</span><small class="text-emerald">Copertura area di rigore</small></div>' +
      '<div class="es-gk-stat-box"><b>98.4%</b><span>Controllo &amp; Comunicazione Difensiva</span><small class="text-sky">Comando vocale</small></div>' +
      '</div>' +
      '</section>';
  }

  function renderGoalkeeperRoom() {
    var clips = storeGet(GK_ROOM_KEY, [
      { title: 'Analisi Uscite Basse 1v1 — Briefing N.1', date: '28/08/2026', portiere: 'Titolare Prima Squadra', duration: '3m 45s' },
      { title: 'Postura Corporea & Copertura Primo Palo', date: '24/08/2026', portiere: 'Portiere Primavera', duration: '2m 15s' },
      { title: 'Costruzione dal Basso & Scarico su Terzino', date: '19/08/2026', portiere: 'Reparto Portieri', duration: '4m 10s' }
    ]);

    var clipsHtml = clips.map(function (c, idx) {
      return '<div class="es-gk-clip-item">' +
        '<div class="es-gk-clip-icon">🎥</div>' +
        '<div class="es-gk-clip-info">' +
        '<b>' + esc(c.title) + '</b>' +
        '<span>' + esc(c.portiere) + ' · ' + esc(c.date) + ' (' + esc(c.duration) + ')</span>' +
        '</div>' +
        '<button type="button" class="btn btn-outline-pill btn-sm" data-gk-act="view-clip" data-idx="' + idx + '">Apri Video</button>' +
        '</div>';
    }).join('');

    return '<section class="es-pd-card es-gk-room-card">' +
      '<div class="es-pd-card-header">' +
      '<h2><span>🎬</span> La "Stanza dei Portieri" & Video Hub Specialistico</h2>' +
      '<button type="button" class="btn btn-outline-pill btn-sm" data-gk-act="add-clip">+ Nuova Clip / Briefing</button>' +
      '</div>' +
      '<p class="es-gk-card-lead">Community interna, clip video dedicate a parate, posture corporee e briefing individuali per i portieri.</p>' +
      '<div class="es-gk-clips-list">' + clipsHtml + '</div>' +
      '</section>';
  }

  function renderWeeklyDrills() {
    return '<section class="es-pd-card es-gk-drills-card">' +
      '<div class="es-pd-card-header">' +
      '<h2><span>📋</span> Schede di Sviluppo Settimanale GK</h2>' +
      '<button type="button" class="btn btn-outline-pill btn-sm" data-gk-act="new-drill">+ Assegna Scheda Sviluppo</button>' +
      '</div>' +
      '<div class="es-gk-drills-grid">' +
      '<div class="es-gk-drill-pill"><b>Presa &amp; Tuffo</b><span>3 drill / settimana · Prima Squadra</span></div>' +
      '<div class="es-gk-drill-pill"><b>Uscite Alte &amp; Palle Inattive</b><span>2 drill / settimana · Tutta la rosa GK</span></div>' +
      '<div class="es-gk-drill-pill"><b>Lavoro coi Piedi (Bilateralità)</b><span>4 drill / settimana · Settore Giovanile</span></div>' +
      '<div class="es-gk-drill-pill"><b>Reattività Visiva &amp; Riflessi</b><span>Sessioni specifiche con palla deviata</span></div>' +
      '</div>' +
      '</section>';
  }

  function renderBadgeAndReports() {
    return '<section class="es-pd-card es-gk-badges-card">' +
      '<div class="es-pd-card-header">' +
      '<h2><span>⭐</span> Assegnazione Badge Tecnici &amp; Report allo Staff</h2>' +
      '<span class="es-pd-source-badge es-pd-source-user">Branding &amp; Staff</span>' +
      '</div>' +
      '<div class="es-gk-badges-content">' +
      '<div class="es-gk-badge-item">' +
      '<div><b>Badge Tecnico: Saracinesca 🛡️</b><span>Assegna questo badge alla Card ufficiale del portiere che si è distinto per parate decisive.</span></div>' +
      '<button type="button" class="btn btn-outline-pill btn-sm" data-gk-act="assign-badge" data-badge="Saracinesca">Assegna Badge</button>' +
      '</div>' +
      '<div class="es-gk-badge-item">' +
      '<div><b>Badge Tecnico: Piede Educato GK 🎯</b><span>Certifica le abilità tecniche nella costruzione e distribuzione dal basso.</span></div>' +
      '<button type="button" class="btn btn-outline-pill btn-sm" data-gk-act="assign-badge" data-badge="Piede Educato GK">Assegna Badge</button>' +
      '</div>' +
      '<div class="es-gk-badge-item">' +
      '<div><b>Focus Prestazionale: Menzione Speciale 🌟</b><span>Pubblica un report tecnico da numero uno che comparirà come Menzione Speciale sulla Card dell\'atleta.</span></div>' +
      '<button type="button" class="btn btn-outline-pill btn-sm" data-gk-act="mention-special">Crea Menzione</button>' +
      '</div>' +
      '<div class="es-gk-badge-item is-highlight">' +
      '<div><b>Inoltro Report Tecnico all\'Allenatore Capo 📋</b><span>Condividi il report metriche prima della composizione della Formazione della Settimana.</span></div>' +
      '<button type="button" class="btn btn-outline-pill btn-sm pf-btn-solid" data-gk-act="send-coach-report">Invia al Mister</button>' +
      '</div>' +
      '</div>' +
      '</section>';
  }

  function html(user) {
    var shellHtml = window.EliseeDashReal.shell({
      user: user,
      title: 'Elisee Scout — Dashboard Preparatore Atletico / Tecnico Portieri',
      roleLabel: user.staffRole || 'Preparatore dei portieri',
      attr: 'gk',
      extraRail: '',
      radarTitle: 'Quadro Tecnico & Atletico Portieri',
      workTitle: 'Sessioni Tecniche & Carichi',
      workEmpty: 'Nessuna sessione registrata. Si popola con l\'attività sul campo.',
      registroTitle: 'Registro Attività & Briefing',
      registroHeaders: ['Data', 'Tema Sessione', 'Esito']
    });

    var customSections =
      '<div class="es-gk-custom-container">' +
      renderPerformanceMetrics() +
      renderGoalkeeperRoom() +
      renderWeeklyDrills() +
      renderBadgeAndReports() +
      '</div>';

    return shellHtml.replace('</main>', customSections + '</main>');
  }

  function openGkEditModal(user) {
    user = user || userObj();
    var backdrop = document.createElement('div');
    backdrop.className = 'es-edit-modal-backdrop';

    backdrop.innerHTML = '<div class="es-edit-modal">' +
      '<div class="es-edit-modal-head">' +
      '<h2><span>✏️</span> Modifica Profilo Preparatore dei Portieri</h2>' +
      '<button type="button" class="es-edit-modal-close" title="Chiudi">&times;</button>' +
      '</div>' +
      '<div class="es-edit-grid">' +
      '<div class="es-edit-field"><label>Nome</label><input id="es-gk-nome" value="' + esc(user.nome || '') + '"></div>' +
      '<div class="es-edit-field"><label>Cognome</label><input id="es-gk-cognome" value="' + esc(user.cognome || '') + '"></div>' +
      '<div class="es-edit-field"><label>Qualifica / Abilitazione</label><input id="es-gk-qual" value="' + esc(user.abilitazione || 'Preparatore Portieri FIGC / Licenza UEFA GK') + '"></div>' +
      '<div class="es-edit-field"><label>Ruolo Ufficiale</label><input id="es-gk-role" value="' + esc(user.staffRole || 'Preparatore dei portieri') + '"></div>' +
      '<div class="es-edit-field"><label>Club / Organizzazione</label><input id="es-gk-club" value="' + esc(user.squadra || user.club || '') + '"></div>' +
      '<div class="es-edit-field"><label>Status Contrattuale</label><select id="es-gk-status" class="pf-input">' +
      '<option value="In Staff Club"' + (user.contractStatus === 'Free Agent' ? '' : ' selected') + '>In Staff Club (Collegato al Club e al Mister)</option>' +
      '<option value="Free Agent"' + (user.contractStatus === 'Free Agent' ? ' selected' : '') + '>Free Agent / Specialista Indipendente</option>' +
      '</select></div>' +
      '<div class="es-edit-field full"><label>Metodologia &amp; Note Tecniche</label><textarea id="es-gk-bio" rows="3">' + esc(user.bio || '') + '</textarea></div>' +
      '</div>' +
      '<div class="es-edit-actions">' +
      '<button type="button" class="es-edit-btn-cancel">Annulla</button>' +
      '<button type="button" class="es-edit-btn-save">💾 Salva Profilo</button>' +
      '</div>' +
      '</div>';

    document.body.appendChild(backdrop);

    var close = function () { backdrop.remove(); };
    backdrop.querySelector('.es-edit-modal-close').addEventListener('click', close);
    backdrop.querySelector('.es-edit-btn-cancel').addEventListener('click', close);
    backdrop.addEventListener('click', function (e) { if (e.target === backdrop) close(); });

    backdrop.querySelector('.es-edit-btn-save').addEventListener('click', function () {
      var n = document.getElementById('es-gk-nome').value.trim();
      var c = document.getElementById('es-gk-cognome').value.trim();
      var q = document.getElementById('es-gk-qual').value.trim();
      var r = document.getElementById('es-gk-role').value.trim();
      var clb = document.getElementById('es-gk-club').value.trim();
      var st = document.getElementById('es-gk-status').value;
      var bio = document.getElementById('es-gk-bio').value.trim();

      user.nome = n || user.nome;
      user.cognome = c || user.cognome;
      user.fullName = (user.nome + ' ' + user.cognome).trim();
      user.abilitazione = q;
      user.staffRole = r;
      user.squadra = clb;
      user.club = clb;
      user.contractStatus = st;
      user.bio = bio;

      try {
        localStorage.setItem('elisee_active_user', JSON.stringify(user));
      } catch (_) {}

      close();
      toast('Profilo Preparatore dei Portieri salvato con successo!', 'success');
      render(user);
    });
  }

  function bind(host) {
    if (!host || host.dataset.gkBound === '1') return;
    host.dataset.gkBound = '1';
    host.addEventListener('click', function (e) {
      var b = e.target.closest('[data-gk], [data-gk-act]');
      if (!b) return;
      var k = b.getAttribute('data-gk');
      var act = b.getAttribute('data-gk-act');

      if (k === 'home' && window.switchView) window.switchView('home', '#hero');
      if (k === 'album' && window.openChiSegui) window.openChiSegui();
      if (k === 'msgs' && window.openUserMessages) window.openUserMessages();
      if (k === 'edit') openGkEditModal(userObj());

      if (act === 'assign-badge') {
        var badge = b.getAttribute('data-badge') || 'Saracinesca';
        var athlete = window.prompt('Inserisci il nome e cognome del portiere a cui assegnare il badge "' + badge + '":');
        if (athlete) {
          toast('Badge "' + badge + '" assegnato con successo alla Card di ' + athlete + '!', 'success');
        }
      }
      if (act === 'mention-special') {
        var ath = window.prompt('Nome e cognome del portiere per la Menzione Speciale:');
        if (ath) {
          var desc = window.prompt('Descrizione della prestazione / focus tecnico:');
          if (desc) {
            toast('Menzione Speciale pubblicata sulla Card ufficiale di ' + ath + '!', 'success');
          }
        }
      }
      if (act === 'send-coach-report') {
        toast('📋 Report metriche portieri inoltrato con successo all\'Allenatore Capo!', 'success');
      }
      if (act === 'add-clip') {
        var title = window.prompt('Titolo della nuova clip per la Stanza dei Portieri:');
        if (title) {
          var list = storeGet(GK_ROOM_KEY, []);
          list.unshift({
            title: title,
            date: new Date().toLocaleDateString('it-IT'),
            portiere: 'Reparto Portieri',
            duration: '2m 30s'
          });
          storeSet(GK_ROOM_KEY, list);
          toast('Nuova clip aggiunta alla Stanza dei Portieri!', 'success');
          render(userObj());
        }
      }
      if (act === 'new-drill') {
        var dTitle = window.prompt('Tema della nuova scheda di sviluppo settimanale:');
        if (dTitle) {
          toast('Scheda di sviluppo "' + dTitle + '" inviata ai portieri della rosa!', 'success');
        }
      }
      if (act === 'view-clip') {
        toast('Apertura clip video per briefing tecnico...', 'info');
      }
    });
  }

  function render(user) {
    user = user || userObj();
    if (!isGk(user)) return;
    hideOthers();
    var host = document.getElementById('es-staff-profile');
    var group = document.getElementById('user-dossier-view-group');
    if (!host) return;
    var box = document.getElementById('es-gk');
    if (!box) {
      box = document.createElement('div');
      box.id = 'es-gk';
      box.className = 'es-pd';
      host.insertBefore(box, host.firstChild);
    }
    box.innerHTML = html(user);
    box.hidden = false;
    box.removeAttribute('hidden');
    box.style.display = 'block';
    host.classList.add('es-gk-on');
    host.classList.remove('es-pd-on', 'es-ds-on', 'es-pres-on', 'es-vice-on', 'es-fisio-on', 'es-ma-on', 'es-med-on', 'es-obs-on', 'es-tm-on', 'es-at-on', 'es-yg-on');
    if (group) {
      group.classList.add('is-gk-dash');
      group.classList.remove('is-coach-dash', 'is-ds-dash', 'is-pres-dash', 'is-vice-dash', 'is-fisio-dash', 'is-ma-dash', 'is-med-dash', 'is-obs-dash', 'is-tm-dash', 'is-at-dash', 'is-yg-dash');
    }
    bind(host);
  }

  window.EliseeGkDash = { render: render, isGk: isGk };

  document.addEventListener('elisee:view-changed', function (e) {
    var d = e && e.detail;
    if (d && d.view === 'user-dossier') {
      try {
        var u = userObj();
        if (isGk(u)) render(u);
      } catch (_) {}
    }
  });
})();
