/* Dashboard Preparatore Atletico — Elisee Scout */
(function () {
  'use strict';

  var AT_TESTS_KEY = 'elisee_at_tests_v2';
  var AT_WORKLOAD_KEY = 'elisee_at_workload_v2';

  var AXES = [
    'Gestione Carichi', 'Prevenzione Infortuni', 'Sviluppo Forza', 'Recupero Post-Gara',
    'Monitoraggio Dati GPS', 'Periodizzazione Stagionale', 'Comunicazione Staff Tecnico', 'Condizione Fisica Squadra'
  ];
  var V2025 = [93, 94, 91, 95, 92, 94, 90, 93];
  var V2023 = [76, 78, 77, 80, 72, 81, 75, 79];

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function userObj() {
    try { return JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {}; } catch (_) { return {}; }
  }
  function isAt(u) {
    u = u || userObj();
    var blob = String(u.staffRole || u.ruoloDettagliato || (u.staffProfile && u.staffProfile.fieldRole) || u.ruolo || u.role || '').trim().toLowerCase();
    if (/portier/.test(blob)) return false;
    return /preparatore atletico|preparatore/.test(blob);
  }
  function atName(u) {
    return [u.nome, u.cognome].filter(Boolean).join(' ').trim() || u.username || 'Preparatore Atletico';
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
    var html = '<svg viewBox="0 0 440 430" role="img" aria-label="Analisi carichi e performance atletica">';
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
      window.unmountAllRoleDashboards('es-atd');
    }
  }

  function renderWorkloadSection() {
    return '<section class="es-pd-card es-at-workload-card">' +
      '<div class="es-pd-card-header">' +
      '<h2><span>⚡</span> Dashboard Carico di Lavoro (Workload &amp; GPS)</h2>' +
      '<span class="es-pd-source-badge es-pd-source-user">Live Tracking</span>' +
      '</div>' +
      '<p class="es-gk-card-lead">Parametri registrati dalle sessioni e algoritmi di prevenzione dell\'affaticamento (Overfatigue).</p>' +
      '<div class="es-gk-stat-grid">' +
      '<div class="es-gk-stat-box"><b>10.8 km</b><span>Distanza Media Partita</span><small class="text-sky">Monitoraggio GPS di squadra</small></div>' +
      '<div class="es-gk-stat-box"><b>920 m</b><span>Alta Intensità (HSR)</span><small class="text-emerald">High Speed Running &gt; 19.8 km/h</small></div>' +
      '<div class="es-gk-stat-box"><b>148</b><span>Accelerazioni &amp; Decelerazioni</span><small class="text-sky">Impatto neuromuscolare</small></div>' +
      '<div class="es-gk-stat-box"><b>33.4 km/h</b><span>Velocità di Picco (Vmax)</span><small class="text-cyan">Sprint di picco massimo</small></div>' +
      '<div class="es-gk-stat-box" style="border-left: 3px solid #22c55e;"><b>🟢 OTTIMO</b><span>Indice di Sforzo Squadra</span><small class="text-emerald">Condizione ottimale per il match</small></div>' +
      '<div class="es-gk-stat-box" style="border-left: 3px solid #f59e0b;"><b>🟡 2 A RISCHIO</b><span>Semaforo Prevenzione</span><small class="text-amber">Suggerito turn-over al Mister</small></div>' +
      '</div>' +
      '</section>';
  }

  function renderTrainingPrograms() {
    return '<section class="es-pd-card es-at-programs-card">' +
      '<div class="es-pd-card-header">' +
      '<h2><span>🏋️</span> Schede di Allenamento Individualizzate &amp; Riatletizzazione</h2>' +
      '<button type="button" class="btn btn-outline-pill btn-sm" data-at-act="new-program">+ Crea Scheda Personalizzata</button>' +
      '</div>' +
      '<div class="es-gk-drills-grid">' +
      '<div class="es-gk-drill-pill"><b>Sviluppo Forza Funzionale</b><span>Forza esplosiva e prevenzione lesioni legamentose</span></div>' +
      '<div class="es-gk-drill-pill"><b>Riatletizzazione &amp; Recupero</b><span>Protocollo graduale di rientro post-infortunio</span></div>' +
      '<div class="es-gk-drill-pill"><b>Potenza Aerobica &amp; HIIT</b><span>Sessioni di resistenza specifica con e senza palla</span></div>' +
      '<div class="es-gk-drill-pill"><b>Core Stability &amp; Mobilità</b><span>Pre-activation e recupero post-partita</span></div>' +
      '</div>' +
      '</section>';
  }

  function renderPeriodicTests() {
    var tests = storeGet(AT_TESTS_KEY, [
      { test: 'Yo-Yo Intermittent Recovery Test', data: '26/08/2026', media: '2.140 m', status: '🟢 Eccellente' },
      { test: 'Test di Salto (CMJ / Bosco)', data: '22/08/2026', media: '44.8 cm', status: '🟢 Sopra media' },
      { test: 'Test Mader / Soglia Lattacida', data: '15/08/2026', media: '4.1 mmol/L', status: '🟢 Regolare' },
      { test: 'Test di Cooper (12 Minuti)', data: '08/08/2026', media: '3.180 m', status: '🟢 Ottimo' }
    ]);

    var rows = tests.map(function (t) {
      return '<div class="es-gk-clip-item">' +
        '<div class="es-gk-clip-icon">📊</div>' +
        '<div class="es-gk-clip-info">' +
        '<b>' + esc(t.test) + '</b>' +
        '<span>Data: ' + esc(t.data) + ' · Risultato medio: ' + esc(t.media) + ' (' + esc(t.status) + ')</span>' +
        '</div>' +
        '<button type="button" class="btn btn-outline-pill btn-sm" data-at-act="view-test">Dettagli Atleti</button>' +
        '</div>';
    }).join('');

    return '<section class="es-pd-card es-at-tests-card">' +
      '<div class="es-pd-card-header">' +
      '<h2><span>📈</span> Test di Valutazione Periodici &amp; Storico Fisico</h2>' +
      '<button type="button" class="btn btn-outline-pill btn-sm" data-at-act="add-test">+ Registra Nuovo Test</button>' +
      '</div>' +
      '<p class="es-gk-card-lead">Storico dei test stagionali integrati direttamente nella scheda tecnica dei calciatori.</p>' +
      '<div class="es-gk-clips-list">' + rows + '</div>' +
      '</section>';
  }

  function renderBadgesAndStaffReports() {
    return '<section class="es-pd-card es-at-badges-card">' +
      '<div class="es-pd-card-header">' +
      '<h2><span>🎖️</span> Assegnazione Badge Fisici &amp; Inoltro Report</h2>' +
      '<span class="es-pd-source-badge es-pd-source-user">Branding &amp; Staff</span>' +
      '</div>' +
      '<div class="es-gk-badges-content">' +
      '<div class="es-gk-badge-item">' +
      '<div><b>Badge Fisico: Atleta Top 🏃‍♂️</b><span>Assegna questo badge alla Card ufficiale del calciatore con parametri fisici e atletici di eccellenza.</span></div>' +
      '<button type="button" class="btn btn-outline-pill btn-sm" data-at-act="assign-badge" data-badge="Atleta Top">Assegna Badge</button>' +
      '</div>' +
      '<div class="es-gk-badge-item">' +
      '<div><b>Badge Fisico: Resistenza Élite 🫀</b><span>Premia i giocatori con il più alto chilometraggio e volume HSR ad alta intensità.</span></div>' +
      '<button type="button" class="btn btn-outline-pill btn-sm" data-at-act="assign-badge" data-badge="Resistenza Élite">Assegna Badge</button>' +
      '</div>' +
      '<div class="es-gk-badge-item">' +
      '<div><b>Focus Prestazionale: Menzione Speciale 🌟</b><span>Pubblica un\'analisi pubblica sulla tenuta atletica che apparirà come Menzione Speciale sulla Card dell\'atleta.</span></div>' +
      '<button type="button" class="btn btn-outline-pill btn-sm" data-at-act="mention-special">Crea Menzione</button>' +
      '</div>' +
      '<div class="es-gk-badge-item is-highlight">' +
      '<div><b>Inoltro Report Carichi all\'Allenatore Capo 📋</b><span>Condividi la disponibilità fisica e il semaforo infortuni con il Mister prima della Formazione.</span></div>' +
      '<button type="button" class="btn btn-outline-pill btn-sm pf-btn-solid" data-at-act="send-coach-report">Invia al Mister</button>' +
      '</div>' +
      '</div>' +
      '</section>';
  }

  function html(user) {
    var shellHtml = window.EliseeDashReal.shell({
      user: user,
      title: 'Elisee Scout — Dashboard Preparatore Atletico',
      roleLabel: user.staffRole || 'Preparatore atletico',
      attr: 'at',
      extraRail: '',
      radarTitle: 'Quadro Carichi & Performance Fisica',
      workTitle: 'Carichi GPS & Sessioni',
      workEmpty: 'Nessun carico GPS registrato. Si popola con l\'attività sul campo.',
      registroTitle: 'Registro Carichi & Test',
      registroHeaders: ['Data', 'Seduta / Test', 'Carico / Esito']
    });

    var customSections =
      '<div class="es-at-custom-container">' +
      renderWorkloadSection() +
      renderTrainingPrograms() +
      renderPeriodicTests() +
      renderBadgesAndStaffReports() +
      '</div>';

    return shellHtml.replace('</main>', customSections + '</main>');
  }

  function openAtEditModal(user) {
    user = user || userObj();
    var backdrop = document.createElement('div');
    backdrop.className = 'es-edit-modal-backdrop';

    backdrop.innerHTML = '<div class="es-edit-modal">' +
      '<div class="es-edit-modal-head">' +
      '<h2><span>✏️</span> Modifica Profilo Preparatore Atletico</h2>' +
      '<button type="button" class="es-edit-modal-close" title="Chiudi">&times;</button>' +
      '</div>' +
      '<div class="es-edit-grid">' +
      '<div class="es-edit-field"><label>Nome</label><input id="es-at-nome" value="' + esc(user.nome || '') + '"></div>' +
      '<div class="es-edit-field"><label>Cognome</label><input id="es-at-cognome" value="' + esc(user.cognome || '') + '"></div>' +
      '<div class="es-edit-field"><label>Qualifica / Titolo di Studio</label><input id="es-at-qual" value="' + esc(user.abilitazione || 'Laurea in Scienze Motorie / Preparatore FIGC') + '"></div>' +
      '<div class="es-edit-field"><label>Ruolo Ufficiale</label><input id="es-at-role" value="' + esc(user.staffRole || 'Preparatore atletico') + '"></div>' +
      '<div class="es-edit-field"><label>Club / Organizzazione</label><input id="es-at-club" value="' + esc(user.squadra || user.club || '') + '"></div>' +
      '<div class="es-edit-field"><label>Status Contrattuale</label><select id="es-at-status" class="pf-input">' +
      '<option value="In Staff Club"' + (user.contractStatus === 'Free Agent' ? '' : ' selected') + '>In Staff Club (Collegato al Club, Mister e Match Analyst)</option>' +
      '<option value="Free Agent"' + (user.contractStatus === 'Free Agent' ? ' selected' : '') + '>Free Agent / Consulente Indipendente</option>' +
      '</select></div>' +
      '<div class="es-edit-field full"><label>Metodologia &amp; Note Operative</label><textarea id="es-at-bio" rows="3">' + esc(user.bio || '') + '</textarea></div>' +
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
      var n = document.getElementById('es-at-nome').value.trim();
      var c = document.getElementById('es-at-cognome').value.trim();
      var q = document.getElementById('es-at-qual').value.trim();
      var r = document.getElementById('es-at-role').value.trim();
      var clb = document.getElementById('es-at-club').value.trim();
      var st = document.getElementById('es-at-status').value;
      var bio = document.getElementById('es-at-bio').value.trim();

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
      toast('Profilo Preparatore Atletico salvato con successo!', 'success');
      render(user);
    });
  }

  function bind(host) {
    if (!host || host.dataset.atBound === '1') return;
    host.dataset.atBound = '1';
    host.addEventListener('click', function (e) {
      var b = e.target.closest('[data-at], [data-at-act]');
      if (!b) return;
      var k = b.getAttribute('data-at');
      var act = b.getAttribute('data-at-act');

      if (k === 'home' && window.switchView) window.switchView('home', '#hero');
      if (k === 'album' && window.openChiSegui) window.openChiSegui();
      if (k === 'msgs' && window.openUserMessages) window.openUserMessages();
      if (k === 'edit') openAtEditModal(userObj());

      if (act === 'assign-badge') {
        var badge = b.getAttribute('data-badge') || 'Atleta Top';
        var athlete = window.prompt('Inserisci il nome e cognome del calciatore a cui assegnare il badge "' + badge + '":');
        if (athlete) {
          toast('Badge "' + badge + '" assegnato con successo alla Card di ' + athlete + '!', 'success');
        }
      }
      if (act === 'mention-special') {
        var ath = window.prompt('Nome e cognome del calciatore per la Menzione Speciale:');
        if (ath) {
          var desc = window.prompt('Descrizione della tenuta atletica / focus performance:');
          if (desc) {
            toast('Menzione Speciale pubblicata sulla Card ufficiale di ' + ath + '!', 'success');
          }
        }
      }
      if (act === 'send-coach-report') {
        toast('📋 Report carichi e disponibilità atleti inoltrato con successo all\'Allenatore Capo!', 'success');
      }
      if (act === 'new-program') {
        var title = window.prompt('Titolo della nuova scheda di allenamento/riatletizzazione:');
        if (title) {
          toast('Scheda personalizzata "' + title + '" inviata con successo!', 'success');
        }
      }
      if (act === 'add-test') {
        var tName = window.prompt('Nome del test di valutazione periodico (es. Yo-Yo Test, Mader, Salto):');
        if (tName) {
          var list = storeGet(AT_TESTS_KEY, []);
          list.unshift({
            test: tName,
            data: new Date().toLocaleDateString('it-IT'),
            media: 'In elaborazione',
            status: '🟢 Registrato'
          });
          storeSet(AT_TESTS_KEY, list);
          toast('Nuovo test "' + tName + '" registrato nello storico fisico!', 'success');
          render(userObj());
        }
      }
      if (act === 'view-test') {
        toast('Apertura report analitico test di squadra...', 'info');
      }
    });
  }

  function render(user) {
    user = user || userObj();
    if (!isAt(user)) return;
    hideOthers();
    var host = document.getElementById('es-staff-profile');
    var group = document.getElementById('user-dossier-view-group');
    if (!host) return;
    var box = document.getElementById('es-atd');
    if (!box) {
      box = document.createElement('div');
      box.id = 'es-atd';
      box.className = 'es-pd';
      host.insertBefore(box, host.firstChild);
    }
    box.innerHTML = html(user);
    box.hidden = false;
    box.removeAttribute('hidden');
    box.style.display = 'block';
    host.classList.add('es-at-on');
    host.classList.remove('es-pd-on', 'es-ds-on', 'es-pres-on', 'es-vice-on', 'es-fisio-on', 'es-ma-on', 'es-med-on', 'es-obs-on', 'es-tm-on', 'es-gk-on', 'es-yg-on');
    if (group) {
      group.classList.add('is-at-dash');
      group.classList.remove('is-coach-dash', 'is-ds-dash', 'is-pres-dash', 'is-vice-dash', 'is-fisio-dash', 'is-ma-dash', 'is-med-dash', 'is-obs-dash', 'is-tm-dash', 'is-gk-dash', 'is-yg-dash');
    }
    bind(host);
  }

  window.EliseeAtDash = { render: render, isAt: isAt };

  document.addEventListener('elisee:view-changed', function (e) {
    var d = e && e.detail;
    if (d && d.view === 'user-dossier') {
      try {
        var u = userObj();
        if (isAt(u)) render(u);
      } catch (_) {}
    }
  });
})();
