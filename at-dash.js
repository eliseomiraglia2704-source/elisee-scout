/* ============================================================
   ELISEE SCOUT — AREA PREPARATORE ATLETICO (CONTROL ROOM)
   Athletic Performance OS — Sidebar 240px + Header 2 livelli + Tab bar
   ============================================================ */
(function () {
  'use strict';

  var activeTab = 'dashboard'; // dashboard | gps | schede | test | badge | radar | canale | impostazioni
  var AT_TESTS_KEY = 'elisee_at_tests_history';

  var AXES = [
    'Potenza Aerobica', 'Velocità & Sprint (HSR)', 'Forza Esplosiva', 'Rapporto Carico Acuto/Cronico',
    'Prevenzione Infortuni', 'Recupero Post-Gara', 'Mobilità & Flessibilità', 'Metodologia GPS'
  ];
  var V2025 = [94, 92, 89, 91, 95, 88, 86, 93];
  var V2023 = [81, 79, 74, 76, 80, 75, 72, 80];

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
    } catch (_) {
      return { squadra: 'Foggia City', club: 'Foggia City' };
    }
  }

  function isAt(u) {
    u = u || userObj();
    var blob = String(u.staffRole || u.ruoloDettagliato || (u.staffProfile && u.staffProfile.fieldRole) || u.ruolo || u.role || '').trim().toLowerCase();
    if (/portier/.test(blob)) return false;
    return /preparatore atletico|\batletico\b|\bperformance coach\b/.test(blob);
  }

  function atName(u) {
    return [u.nome, u.cognome].filter(Boolean).join(' ').trim() || u.username || 'Preparatore Atletico';
  }

  function initials(name) {
    var p = String(name || 'AT').trim().split(/\s+/);
    return ((p[0] || 'A').charAt(0) + (p[1] || p[0] || 'T').charAt(0)).toUpperCase();
  }

  function photoOf(u) {
    try {
      if (window.getStoredProfilePhoto) return window.getStoredProfilePhoto(null, u) || u.fotoUrl || '';
    } catch (_) {}
    return u.fotoUrl || '';
  }

  function inStaff(u) {
    u = u || userObj();
    var st = String(u.contractStatus || '').toLowerCase();
    if (st === 'free agent' || st === 'free') return false;
    return !!(u.squadra || u.club);
  }

  function qualificaOf(u) {
    return String((u && (u.abilitazione || u.qualifica || u.certificazione)) || '').trim() || 'Scienze Motorie / Preparatore FIGC';
  }

  function toast(msg, kind) {
    if (typeof window.showToast === 'function') window.showToast(msg, kind || 'success');
    else alert(msg);
  }

  function storeGet(k, def) {
    try {
      var v = localStorage.getItem(k);
      return v ? JSON.parse(v) : def;
    } catch (_) { return def; }
  }
  function storeSet(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {}
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
    var cx = 220, cy = 210, r = 145, n = AXES.length;
    var html = '<svg viewBox="0 0 440 430" style="width:100%; height:auto; max-height:320px;" role="img" aria-label="Analisi carichi e performance fisica">';
    html += wedge(cx, cy, r, -Math.PI / 2, 0, 'rgba(74,222,128,0.12)');
    html += wedge(cx, cy, r, 0, Math.PI / 2, 'rgba(248,113,113,0.12)');
    html += wedge(cx, cy, r, Math.PI / 2, Math.PI, 'rgba(250,204,21,0.12)');
    html += wedge(cx, cy, r, Math.PI, Math.PI * 1.5, 'rgba(56,189,248,0.12)');
    for (var ring = 1; ring <= 5; ring++) {
      html += '<polygon points="' + poly(cx, cy, r, AXES.map(function () { return ring * 20; })) +
        '" fill="none" stroke="rgba(148,163,184,0.18)" stroke-width="1"/>';
    }
    for (var i = 0; i < n; i++) {
      var e = polar(cx, cy, r, i, n, 100);
      html += '<line x1="' + cx + '" y1="' + cy + '" x2="' + e[0].toFixed(1) + '" y2="' + e[1].toFixed(1) +
        '" stroke="rgba(148,163,184,0.18)"/>';
      var lab = polar(cx, cy, r + 24, i, n, 100);
      html += '<text x="' + lab[0].toFixed(1) + '" y="' + lab[1].toFixed(1) +
        '" text-anchor="middle" dominant-baseline="middle" fill="#94a3b8" font-size="8.5" font-weight="600">' +
        esc(AXES[i]) + ' ' + V2025[i] + '%</text>';
    }
    html += '<polygon points="' + poly(cx, cy, r, V2023) + '" fill="rgba(148,163,184,0.10)" stroke="#64748b" stroke-width="1.5"/>';
    html += '<polygon points="' + poly(cx, cy, r, V2025) + '" fill="rgba(56,189,248,0.12)" stroke="#38bdf8" stroke-width="2"/>';
    html += '</svg>';
    return html;
  }

  function getNextMatchTarget() {
    try {
      var coachData = JSON.parse(localStorage.getItem('elisee_coach_data') || '{}');
      if (coachData && coachData.nextMatch && coachData.nextMatch.avversario) {
        return coachData.nextMatch;
      }
    } catch (_) {}
    return {
      avversario: 'Foggia City vs Manfredonia Calcio',
      data: '20/09/2026',
      orario: '15:30',
      luogo: 'Stadio Pino Zaccheria (Foggia)',
      competizione: 'Campionato Eccellenza Pugliese',
      giorniMancanti: 3,
      oreMancanti: 4,
      minutiMancanti: 18
    };
  }

  function hideOthers() {
    if (typeof window.unmountAllRoleDashboards === 'function') {
      window.unmountAllRoleDashboards('es-atd');
    }
  }

  function clubCrest(club) {
    return '<img src="immagini/squadre-loghi/foggia-city.png?v=20260917_FGCLIC1" alt="' + esc(club) + '" onerror="this.onerror=null;this.src=\'immagini/squadre-loghi/foggia-city.png\';">';
  }

  // ============================================================
  // TAB: DASHBOARD (contenuto esistente, senza rail 56px)
  // ============================================================
  function renderTabDashboard(user) {
    var name = atName(user);
    var ph = photoOf(user);
    var initText = esc(initials(name));
    var on = inStaff(user);
    var club = String(user.squadra || user.club || 'Foggia City').trim();
    var qual = qualificaOf(user);

    var avaHtml;
    if (ph && ph.length > 5 && !/simulated|null|undefined/i.test(ph)) {
      avaHtml = '<img src="' + esc(ph) + '" alt="" class="es-at-avatar" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\';">' +
        '<div class="es-at-avatar-fallback" style="display:none;">' + initText + '</div>';
    } else {
      avaHtml = '<div class="es-at-avatar-fallback">' + initText + '</div>';
    }

    var statusBadge = on
      ? '<span class="es-at-badge-tag cyan">In Staff Club</span>'
      : '<span class="es-at-badge-tag emerald">Free Agent</span>';

    var clubDisplay = club
      ? '<span style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:flex; align-items:center; gap:4px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' + esc(club) + '</span>'
      : '<span style="font-size:0.75rem; color:#94a3b8; font-weight:500;">Performance Coach Indipendente</span>';

    return '' +
      '<div class="es-at-grid-2col">' +
        '<section class="es-at-card">' +
          '<div class="es-at-card-head">' +
            '<h2 class="es-at-card-title">' +
              '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
              '<span>Profilo Staff Atletico</span>' +
            '</h2>' +
            '<div style="display:flex; gap:6px; align-items:center;">' +
              '<span class="es-at-badge-tag cyan">Scienze Motorie</span>' +
              statusBadge +
            '</div>' +
          '</div>' +

          '<div class="es-at-profile-row">' +
            avaHtml +
            '<div class="es-at-user-meta">' +
              '<b class="es-at-user-name">' + esc(name) + '</b>' +
              '<div class="es-at-user-badges">' +
                '<span style="font-size:0.72rem; color:#38bdf8; background:rgba(56,189,248,0.12); border:1px solid rgba(56,189,248,0.28); border-radius:4px; padding:2px 6px; font-weight:800; text-transform:uppercase;">Preparatore Atletico</span>' +
                clubDisplay +
              '</div>' +
            '</div>' +
          '</div>' +

          '<div class="es-at-onboarding-bar-box">' +
            '<div class="es-at-onboarding-label-row">' +
              '<span>Completamento Anagrafica &amp; Abilitazione</span>' +
              '<span style="color:#38bdf8; font-weight:900;">85%</span>' +
            '</div>' +
            '<div class="es-at-progress-track">' +
              '<div class="es-at-progress-fill" style="width:85%;"></div>' +
            '</div>' +
            '<div style="display:flex; justify-content:flex-end; margin-top:6px;">' +
              '<button type="button" class="es-pd-edit" data-at="edit" style="font-size:0.72rem; color:#38bdf8; background:none; border:none; cursor:pointer; font-weight:700; padding:0;">✏️ Modifica Anagrafica</button>' +
            '</div>' +
          '</div>' +

          '<div class="es-at-cred-grid">' +
            '<div class="es-at-cred-item">' +
              '<span>Titolo Ufficiale</span>' +
              '<b>' + esc(qual) + '</b>' +
            '</div>' +
            '<div class="es-at-cred-item">' +
              '<span>Collegamento Staff</span>' +
              '<b>' + (on ? 'In Staff con il Mister' : 'Performance Coach Indipendente') + '</b>' +
            '</div>' +
          '</div>' +
        '</section>' +

        '<section class="es-at-card">' +
          '<div class="es-at-card-head">' +
            '<h2 class="es-at-card-title">' +
              '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>' +
              '<span>Workload GPS &amp; Prevenzione Infortuni</span>' +
            '</h2>' +
            '<span class="es-at-badge-tag emerald">ACWR 1.08 Ottimale</span>' +
          '</div>' +

          '<div class="es-at-workload-grid">' +
            '<div class="es-at-workload-box"><strong style="color:#4ade80;">22</strong><span>Disponibili 🟢</span></div>' +
            '<div class="es-at-workload-box"><strong style="color:#facc15;">2</strong><span>Gestione Carichi 🟡</span></div>' +
            '<div class="es-at-workload-box"><strong style="color:#f87171;">0</strong><span>Infortunati 🔴</span></div>' +
            '<div class="es-at-workload-box"><strong>2.850</strong><span>Carico AU Sett.</span></div>' +
            '<div class="es-at-workload-box"><strong>32.8 km/h</strong><span>Top Speed Rosa</span></div>' +
            '<div class="es-at-workload-box"><strong>685 m</strong><span>HSR Medio (&gt;20 km/h)</span></div>' +
          '</div>' +

          '<div class="es-at-quick-actions">' +
            '<button type="button" class="es-at-quick-btn" data-at-act="send-coach-report">📋 Semaforo al Mister</button>' +
            '<button type="button" class="es-at-quick-btn" data-at-act="new-program">🏋️ Schede Riatletizzazione</button>' +
            '<button type="button" class="es-at-quick-btn" data-at-act="add-test">⏱️ Registra Test Fisico</button>' +
            '<button type="button" class="es-at-quick-btn" data-at-act="assign-badge" data-badge="Atleta Top">⭐ Badge Atleta Top</button>' +
          '</div>' +
        '</section>' +
      '</div>' +

      '<section class="es-at-card" style="padding:1.25rem 1.35rem;">' +
        '<div class="es-at-card-head">' +
          '<h2 class="es-at-card-title">' +
            '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>' +
            '<span>Strumenti Operativi — Azioni Preparatore Atletico</span>' +
          '</h2>' +
          '<span class="es-at-badge-tag cyan">Athletic Suite v3.0</span>' +
        '</div>' +

        '<div class="es-at-actions-grid">' +
          '<button type="button" class="es-at-action-card" data-at-act="add-test">' +
            '<div class="es-at-action-icon">' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>' +
            '</div>' +
            '<div class="es-at-action-text">' +
              '<b>Carichi GPS &amp; Workload</b>' +
              '<span>Monitoraggio sprint, HSR, accelerazioni e picchi di fatica.</span>' +
            '</div>' +
          '</button>' +

          '<button type="button" class="es-at-action-card" data-at-act="new-program">' +
            '<div class="es-at-action-icon">' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>' +
            '</div>' +
            '<div class="es-at-action-text">' +
              '<b>Schede Forza &amp; Prevenzione</b>' +
              '<span>Programmi personalizzati di riatletizzazione e scarico.</span>' +
            '</div>' +
          '</button>' +

          '<button type="button" class="es-at-action-card" data-at-act="add-test">' +
            '<div class="es-at-action-icon">' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
            '</div>' +
            '<div class="es-at-action-text">' +
              '<b>Test Fisici Periodici</b>' +
              '<span>Valutazione Yo-Yo Test, Mader e test di salto con storico.</span>' +
            '</div>' +
          '</button>' +

          '<button type="button" class="es-at-action-card" data-at-act="assign-badge" data-badge="Atleta Top">' +
            '<div class="es-at-action-icon">' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' +
            '</div>' +
            '<div class="es-at-action-text">' +
              '<b>Badge: Atleta Top ⭐</b>' +
              '<span>Assegna il riconoscimento alla Card del calciatore più in forma.</span>' +
            '</div>' +
          '</button>' +

          '<button type="button" class="es-at-action-card" data-at-act="assign-badge" data-badge="Resistenza Élite">' +
            '<div class="es-at-action-icon">' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>' +
            '</div>' +
            '<div class="es-at-action-text">' +
              '<b>Badge: Resistenza Élite ⚡</b>' +
              '<span>Certifica il volume aerobico superiore e la resistenza lattacida.</span>' +
            '</div>' +
          '</button>' +

          '<button type="button" class="es-at-action-card" data-at-act="send-coach-report">' +
            '<div class="es-at-action-icon">' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>' +
            '</div>' +
            '<div class="es-at-action-text">' +
              '<b>Semaforo Disponibilità al Mister</b>' +
              '<span>Inoltro indice rischio infortuni prima della formazione.</span>' +
            '</div>' +
          '</button>' +
        '</div>' +
      '</section>' +

      '<div class="es-at-grid-3col">' +
        '<section class="es-at-card">' +
          '<div class="es-at-card-head">' +
            '<h2 class="es-at-card-title">' +
              '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/></svg>' +
              '<span>Quadro Fisico Rosa</span>' +
            '</h2>' +
            '<span class="es-at-badge-tag cyan">Radar Operativo</span>' +
          '</div>' +
          '<div style="display:flex; justify-content:center; align-items:center; padding:0.5rem 0;">' +
            radarSvg() +
          '</div>' +
          '<div style="display:flex; justify-content:space-between; font-size:0.7rem; color:#94a3b8; border-top:1px solid rgba(148,163,184,0.08); padding-top:0.6rem; margin-top:auto;">' +
            '<span>Benchmark Categoria: <b>76%</b></span>' +
            '<span style="color:#38bdf8;">Indice Rosa Attuale: <b>92%</b></span>' +
          '</div>' +
        '</section>' +

        '<section class="es-at-card">' +
          '<div class="es-at-card-head">' +
            '<h2 class="es-at-card-title">' +
              '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>' +
              '<span>Protocolli &amp; Metodologia</span>' +
            '</h2>' +
            '<span class="es-at-badge-tag emerald">Attivo</span>' +
          '</div>' +
          '<ul class="es-at-checklist">' +
            '<li>' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' +
              '<span><b>Workload Management GPS</b> — calcolo automatico del rapporto carico acuto/cronico (ACWR).</span>' +
            '</li>' +
            '<li>' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' +
              '<span><b>Prevenzione &amp; Riatletizzazione</b> — protocolli individuali per atleti in recupero con semaforo giallo.</span>' +
            '</li>' +
            '<li>' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' +
              '<span><b>Test Periodici da Campo</b> — somministrazione e tracciamento Yo-Yo Endurance e Test Mader.</span>' +
            '</li>' +
            '<li>' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' +
              '<span><b>Condivisione continua con lo Staff</b> — allineamento costante con Medico Sociale e Fisioterapista.</span>' +
            '</li>' +
          '</ul>' +
        '</section>' +

        '<section class="es-at-card es-at-limits-card">' +
          '<div class="es-at-card-head">' +
            '<h2 class="es-at-card-title">' +
              '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fda4af" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' +
              '<span style="color:#fda4af;">Limiti di Ruolo &amp; Governance</span>' +
            '</h2>' +
            '<span class="es-at-badge-tag rose">Compliance</span>' +
          '</div>' +
          '<ul class="es-at-limits-list">' +
            '<li>' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>' +
              '<span><b>Nessuna modifica della rosa ufficiale</b> — Competenza esclusiva di Presidente e Segretario.</span>' +
            '</li>' +
            '<li>' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>' +
              '<span><b>Nessuna trattativa di calciomercato</b> — Riservato esclusivamente al Direttore Sportivo.</span>' +
            '</li>' +
            '<li>' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>' +
              '<span><b>Idoneità agonistica vincolante</b> — Il via libera definitivo all\'attività spetta al Medico Sociale.</span>' +
            '</li>' +
          '</ul>' +
        '</section>' +
      '</div>' +

      '<section class="es-at-card">' +
        '<div class="es-at-card-head">' +
          '<h2 class="es-at-card-title">' +
            '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
            '<span>Registro Carichi &amp; Valutazioni Fisiche</span>' +
          '</h2>' +
          '<span class="es-at-badge-tag cyan">Archivio Performance</span>' +
        '</div>' +
        '<div class="es-at-empty-wrap">' +
          '<div class="es-at-empty-icon">' +
            '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>' +
          '</div>' +
          '<div class="es-at-empty-title">Nessun carico o test registrato di recente</div>' +
          '<div class="es-at-empty-sub">Registra una nuova sessione GPS o un test di valutazione periodico per alimentare lo storico carichi e il semaforo infortuni.</div>' +
          '<div style="display:flex; gap:8px; margin-top:0.4rem;">' +
            '<button type="button" class="es-at-btn-primary" data-at-act="add-test" style="font-size:0.75rem; padding:0.45rem 0.85rem;">+ Registra Carico GPS</button>' +
            '<button type="button" class="es-at-btn-secondary" data-at-act="new-program" style="font-size:0.75rem; padding:0.45rem 0.85rem;">🏋️ Nuova Scheda Forza</button>' +
          '</div>' +
        '</div>' +
      '</section>';
  }

  function renderTabGps() {
    return '' +
      '<section class="es-at-card">' +
        '<div class="es-at-card-head">' +
          '<h2 class="es-at-card-title">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>' +
            '<span>Carichi GPS &amp; Workload Management</span>' +
          '</h2>' +
          '<button type="button" class="es-at-btn-primary" data-at-act="add-test">Registra Carico GPS +</button>' +
        '</div>' +
        '<p style="font-size:0.78rem; color:#94a3b8; margin:0 0 14px; line-height:1.45;">' +
          'Monitoraggio del carico acuto/cronico (ACWR), High Speed Running, accelerazioni e picchi di fatica della rosa. I dati alimentano il semaforo infortuni inviato al Mister.' +
        '</p>' +
        '<div class="es-at-workload-grid">' +
          '<div class="es-at-workload-box"><strong style="color:#4ade80;">22</strong><span>Disponibili 🟢</span></div>' +
          '<div class="es-at-workload-box"><strong style="color:#facc15;">2</strong><span>Gestione Carichi 🟡</span></div>' +
          '<div class="es-at-workload-box"><strong style="color:#f87171;">0</strong><span>Infortunati 🔴</span></div>' +
          '<div class="es-at-workload-box"><strong>2.850</strong><span>Carico AU Sett.</span></div>' +
          '<div class="es-at-workload-box"><strong>32.8 km/h</strong><span>Top Speed Rosa</span></div>' +
          '<div class="es-at-workload-box"><strong>685 m</strong><span>HSR Medio (&gt;20 km/h)</span></div>' +
        '</div>' +
        '<div style="background:#060911; border:1px solid rgba(56,189,248,0.12); border-radius:8px; padding:14px;">' +
          '<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">' +
            '<div>' +
              '<b style="color:#f8fafc; font-size:0.88rem; display:block;">Indice ACWR Rosa</b>' +
              '<span style="font-size:0.74rem; color:#4ade80;">1.08 — Zona ottimale (0.80 – 1.30)</span>' +
            '</div>' +
            '<button type="button" class="es-at-quick-btn" data-at-act="send-coach-report">📋 Semaforo al Mister</button>' +
          '</div>' +
        '</div>' +
      '</section>';
  }

  function renderTabSchede() {
    return '' +
      '<section class="es-at-card">' +
        '<div class="es-at-card-head">' +
          '<h2 class="es-at-card-title">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' +
            '<span>Schede Forza &amp; Prevenzione</span>' +
          '</h2>' +
          '<button type="button" class="es-at-btn-primary" data-at-act="new-program">+ Nuova Scheda Forza</button>' +
        '</div>' +
        '<p style="font-size:0.78rem; color:#94a3b8; margin:0 0 14px; line-height:1.45;">' +
          'Programmi personalizzati di riatletizzazione, scarico e prevenzione. Ogni scheda può essere inoltrata allo Staff Medico e al Fisioterapista.' +
        '</p>' +
        '<div class="es-at-empty-wrap">' +
          '<div class="es-at-empty-icon">' +
            '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' +
          '</div>' +
          '<div class="es-at-empty-title">Nessuna scheda forza attiva</div>' +
          '<div class="es-at-empty-sub">Crea un programma di riatletizzazione o prevenzione per un calciatore della rosa.</div>' +
          '<button type="button" class="es-at-btn-primary" data-at-act="new-program" style="font-size:0.75rem; padding:0.45rem 0.85rem;">🏋️ Nuova Scheda Forza</button>' +
        '</div>' +
      '</section>';
  }

  function renderTabTest() {
    var list = storeGet(AT_TESTS_KEY, []);
    if (!Array.isArray(list)) list = [];

    var body;
    if (!list.length) {
      body =
        '<div class="es-at-empty-wrap">' +
          '<div class="es-at-empty-icon">' +
            '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
          '</div>' +
          '<div class="es-at-empty-title">Nessun test fisico registrato</div>' +
          '<div class="es-at-empty-sub">Registra Yo-Yo, Mader, CMJ o un carico GPS per alimentare lo storico valutazioni.</div>' +
          '<button type="button" class="es-at-btn-primary" data-at-act="add-test" style="font-size:0.75rem; padding:0.45rem 0.85rem;">+ Registra Test Fisico</button>' +
        '</div>';
    } else {
      body = '<div style="display:flex; flex-direction:column; gap:8px;">' + list.map(function (t) {
        return '<div style="background:#060911; border:1px solid rgba(56,189,248,0.12); border-radius:8px; padding:10px 14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">' +
          '<div>' +
            '<b style="color:#f8fafc; font-size:0.86rem; display:block;">' + esc(t.test) + '</b>' +
            '<span style="color:#94a3b8; font-size:0.74rem;">' + esc(t.data || '') + ' · ' + esc(t.media || '') + '</span>' +
          '</div>' +
          '<span class="es-at-badge-tag emerald">' + esc(t.status || 'Registrato') + '</span>' +
        '</div>';
      }).join('') + '</div>';
    }

    return '' +
      '<section class="es-at-card">' +
        '<div class="es-at-card-head">' +
          '<h2 class="es-at-card-title">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
            '<span>Test Fisici Periodici (' + list.length + ')</span>' +
          '</h2>' +
          '<button type="button" class="es-at-btn-primary" data-at-act="add-test">+ Registra Test</button>' +
        '</div>' +
        body +
      '</section>';
  }

  function renderTabBadge() {
    return '' +
      '<section class="es-at-card">' +
        '<div class="es-at-card-head">' +
          '<h2 class="es-at-card-title">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' +
            '<span>Badge &amp; Menzioni di Merito Atletico</span>' +
          '</h2>' +
          '<span class="es-at-badge-tag emerald">Riconoscimenti Ufficiali</span>' +
        '</div>' +
        '<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:12px;">' +
          '<div style="background:#060911; border:1px solid rgba(56,189,248,0.16); border-radius:8px; padding:14px;">' +
            '<div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">' +
              '<span style="font-size:1.3rem;">⭐</span>' +
              '<strong style="color:#f8fafc; font-size:0.95rem;">Badge "Atleta Top"</strong>' +
            '</div>' +
            '<p style="color:#94a3b8; font-size:0.75rem; line-height:1.4; margin-bottom:10px;">' +
              'Assegnato al calciatore con i migliori indici di forma, HSR e recupero della settimana.' +
            '</p>' +
            '<button type="button" class="es-at-btn-primary" data-at-act="assign-badge" data-badge="Atleta Top" style="font-size:0.75rem; width:100%; justify-content:center;">Assegna Badge</button>' +
          '</div>' +
          '<div style="background:#060911; border:1px solid rgba(56,189,248,0.16); border-radius:8px; padding:14px;">' +
            '<div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">' +
              '<span style="font-size:1.3rem;">⚡</span>' +
              '<strong style="color:#f8fafc; font-size:0.95rem;">Badge "Resistenza Élite"</strong>' +
            '</div>' +
            '<p style="color:#94a3b8; font-size:0.75rem; line-height:1.4; margin-bottom:10px;">' +
              'Certifica volume aerobico superiore e tenuta lattacida sui test Yo-Yo / Mader.' +
            '</p>' +
            '<button type="button" class="es-at-btn-primary" data-at-act="assign-badge" data-badge="Resistenza Élite" style="font-size:0.75rem; width:100%; justify-content:center;">Assegna Badge</button>' +
          '</div>' +
          '<div style="background:#060911; border:1px solid rgba(56,189,248,0.16); border-radius:8px; padding:14px;">' +
            '<div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">' +
              '<span style="font-size:1.3rem;">🌟</span>' +
              '<strong style="color:#f8fafc; font-size:0.95rem;">Menzione Speciale Card</strong>' +
            '</div>' +
            '<p style="color:#94a3b8; font-size:0.75rem; line-height:1.4; margin-bottom:10px;">' +
              'Nota di merito sulla tenuta atletica, visibile nella scheda ufficiale consultata dagli scout.' +
            '</p>' +
            '<button type="button" class="es-at-btn-primary" data-at-act="mention-special" style="font-size:0.75rem; width:100%; justify-content:center;">Registra Menzione</button>' +
          '</div>' +
        '</div>' +
      '</section>';
  }

  function renderTabRadar() {
    return '' +
      '<section class="es-at-card">' +
        '<div class="es-at-card-head">' +
          '<h2 class="es-at-card-title">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/></svg>' +
            '<span>Radar &amp; Competenze Atletiche</span>' +
          '</h2>' +
          '<span class="es-at-badge-tag cyan">Standard FIGC Coverciano</span>' +
        '</div>' +
        '<div class="es-at-split-radar" style="display:grid; grid-template-columns:1.2fr 1fr; gap:16px; align-items:center;">' +
          '<div style="display:flex; justify-content:center; align-items:center; background:#060911; border-radius:8px; padding:12px; border:1px solid rgba(56,189,248,0.12);">' +
            radarSvg() +
          '</div>' +
          '<div>' +
            '<h3 style="color:#f8fafc; font-size:1rem; font-weight:800; margin:0 0 8px;">Metriche Preparatore Atletico</h3>' +
            '<p style="color:#94a3b8; font-size:0.78rem; line-height:1.45; margin-bottom:12px;">' +
              'Valutazione globale dell\'impatto sul carico, sulla prevenzione infortuni e sulla condizione della rosa.' +
            '</p>' +
            '<div style="display:flex; flex-direction:column; gap:8px;">' +
              '<div style="background:#060911; border:1px solid rgba(56,189,248,0.12); border-radius:6px; padding:8px 12px; display:flex; justify-content:space-between;">' +
                '<span style="font-size:0.75rem; color:#94a3b8;">Prevenzione Infortuni:</span>' +
                '<strong style="color:#38bdf8; font-size:0.8rem;">95% (Top 1%)</strong>' +
              '</div>' +
              '<div style="background:#060911; border:1px solid rgba(56,189,248,0.12); border-radius:6px; padding:8px 12px; display:flex; justify-content:space-between;">' +
                '<span style="font-size:0.75rem; color:#94a3b8;">Potenza Aerobica:</span>' +
                '<strong style="color:#38bdf8; font-size:0.8rem;">94% (Eccellente)</strong>' +
              '</div>' +
              '<div style="background:#060911; border:1px solid rgba(56,189,248,0.12); border-radius:6px; padding:8px 12px; display:flex; justify-content:space-between;">' +
                '<span style="font-size:0.75rem; color:#94a3b8;">Metodologia GPS:</span>' +
                '<strong style="color:#4ade80; font-size:0.8rem;">93% (ACWR 1.08)</strong>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>';
  }

  function renderTabCanale(user) {
    var club = String(user.squadra || user.club || 'Foggia City').trim();
    return '' +
      '<div class="es-at-grid-2col">' +
        '<section class="es-at-card">' +
          '<div class="es-at-card-head">' +
            '<h2 class="es-at-card-title">' +
              '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></svg>' +
              '<span>Semaforo Disponibilità al Mister</span>' +
            '</h2>' +
            '<span class="es-at-badge-tag emerald">Connesso</span>' +
          '</div>' +
          '<p style="font-size:0.78rem; color:#94a3b8; line-height:1.45; margin-bottom:12px;">' +
            'Invia all\'Allenatore Capo di ' + esc(club) + ' il report carichi, l\'indice ACWR e il semaforo infortuni prima della formazione titolare.' +
          '</p>' +
          '<div style="background:#060911; border:1px solid rgba(56,189,248,0.12); border-radius:6px; padding:10px 12px; display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap;">' +
            '<div>' +
              '<b style="color:#f8fafc; font-size:0.82rem; display:block;">Report Carichi &amp; Disponibilità</b>' +
              '<span style="font-size:0.72rem; color:#4ade80;">22 disponibili · 2 gestione carichi · 0 infortunati</span>' +
            '</div>' +
            '<button type="button" class="es-at-btn-primary" data-at-act="send-coach-report" style="font-size:0.75rem; padding:4px 10px;">Inoltra al Mister</button>' +
          '</div>' +
        '</section>' +
        '<section class="es-at-card">' +
          '<div class="es-at-card-head">' +
            '<h2 class="es-at-card-title">' +
              '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>' +
              '<span>Comunicazioni Staff Medico &amp; Fisio</span>' +
            '</h2>' +
            '<button type="button" class="es-at-quick-btn" data-at="msgs">Apri Chat</button>' +
          '</div>' +
          '<p style="font-size:0.78rem; color:#94a3b8; line-height:1.45;">' +
            'Allinea i protocolli di riatletizzazione con Medico Sociale e Fisioterapista prima di riammettere un atleta al carico completo.' +
          '</p>' +
        '</section>' +
      '</div>';
  }

  function renderActiveTabContent(tabKey, user) {
    switch (tabKey) {
      case 'gps':
        return renderTabGps();
      case 'schede':
        return renderTabSchede();
      case 'test':
        return renderTabTest();
      case 'badge':
        return renderTabBadge();
      case 'radar':
        return renderTabRadar();
      case 'canale':
        return renderTabCanale(user);
      case 'impostazioni':
      case 'dashboard':
      default:
        return renderTabDashboard(user);
    }
  }

  function renderSideBtn(tabKey, label, svgPath) {
    var isActive = activeTab === tabKey;
    return '<button type="button" class="es-at-side-btn ' + (isActive ? 'is-active' : '') + '" data-at-nav="' + tabKey + '">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke-width="2">' + svgPath + '</svg>' +
      '<span>' + label + '</span>' +
    '</button>';
  }

  function renderNavTab(tabKey, label, svgPath) {
    var isActive = activeTab === tabKey;
    return '<button type="button" class="es-at-tab-btn ' + (isActive ? 'is-active' : '') + '" data-at-nav="' + tabKey + '">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' + svgPath + '</svg>' +
      '<span>' + label + '</span>' +
    '</button>';
  }

  function openAtEditModal(user) {
    user = user || userObj();
    var backdrop = document.createElement('div');
    backdrop.className = 'es-edit-modal-backdrop';

    backdrop.innerHTML = '<div class="es-edit-modal">' +
      '<div class="es-edit-modal-head">' +
      '<h2><span>✏️</span> Modifica Anagrafica Preparatore Atletico</h2>' +
      '<button type="button" class="es-edit-modal-close" title="Chiudi">&times;</button>' +
      '</div>' +
      '<div class="es-edit-grid">' +
      '<div class="es-edit-field"><label>Nome</label><input id="es-at-nome" value="' + esc(user.nome || '') + '"></div>' +
      '<div class="es-edit-field"><label>Cognome</label><input id="es-at-cognome" value="' + esc(user.cognome || '') + '"></div>' +
      '<div class="es-edit-field"><label>Qualifica / Abilitazione</label><input id="es-at-qual" value="' + esc(user.abilitazione || 'Scienze Motorie / Preparatore FIGC') + '"></div>' +
      '<div class="es-edit-field"><label>Ruolo Ufficiale</label><input id="es-at-role" value="Preparatore atletico" readonly></div>' +
      '<div class="es-edit-field"><label>Club / Organizzazione</label><input id="es-at-club" value="' + esc(user.squadra || user.club || '') + '" placeholder="Vuoto = Performance Coach Indipendente"></div>' +
      '<div class="es-edit-field"><label>Status Contrattuale</label><select id="es-at-status">' +
      '<option value="In Staff Club"' + (inStaff(user) ? ' selected' : '') + '>In Staff Club (Collegato al Mister)</option>' +
      '<option value="Free Agent"' + (!inStaff(user) ? ' selected' : '') + '>Free Agent / Performance Coach Indipendente</option>' +
      '</select></div>' +
      '<div class="es-edit-field full"><label>Metodologia &amp; Note Operative</label><textarea id="es-at-bio" rows="3">' + esc(user.bio || '') + '</textarea></div>' +
      '</div>' +
      '<div class="es-edit-actions">' +
      '<button type="button" class="es-edit-btn-cancel">Annulla</button>' +
      '<button type="button" class="es-edit-btn-save">💾 Salva Anagrafica</button>' +
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
      var clb = document.getElementById('es-at-club').value.trim();
      var st = document.getElementById('es-at-status').value;
      var bio = document.getElementById('es-at-bio').value.trim();

      user.nome = n || user.nome;
      user.cognome = c || user.cognome;
      user.fullName = (user.nome + ' ' + user.cognome).trim();
      user.abilitazione = q;
      user.squadra = clb;
      user.club = clb;
      user.contractStatus = st;
      user.bio = bio;

      try {
        localStorage.setItem('elisee_active_user', JSON.stringify(user));
        localStorage.setItem('elisee_user_data', JSON.stringify(user));
      } catch (_) {}

      close();
      toast('Anagrafica Preparatore Atletico salvata con successo!', 'success');
      render(user);
    });
  }

  function bind(host) {
    if (!host || host.dataset.atBound === '1') return;
    host.dataset.atBound = '1';
    host.addEventListener('click', function (e) {
      var toggle = e.target.closest('#btn-toggle-at-sidebar');
      if (toggle) {
        var sb = host.querySelector('.es-at-sidebar');
        if (sb) sb.classList.toggle('is-open');
        return;
      }

      var b = e.target.closest('[data-at], [data-at-act], [data-at-nav]');
      if (!b) return;
      var k = b.getAttribute('data-at');
      var act = b.getAttribute('data-at-act');
      var nav = b.getAttribute('data-at-nav');

      if (nav === 'impostazioni') {
        openAtEditModal(userObj());
        return;
      }
      if (nav) {
        activeTab = nav;
        render(userObj());
        return;
      }

      if (k === 'home' && window.switchView) window.switchView('home', '#hero');
      if (k === 'dash' && window.switchView) window.switchView('user-dossier', '#user-dossier-portal');
      if (k === 'msgs' && window.openUserMessages) window.openUserMessages();
      if (k === 'edit') openAtEditModal(userObj());

      if (act === 'assign-badge') {
        var badge = b.getAttribute('data-badge') || 'Atleta Top';
        var athlete = window.prompt('Nome e cognome del calciatore a cui assegnare il badge "' + badge + '":');
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
        var tName = window.prompt('Nome del test di valutazione periodico (es. Yo-Yo Test, Mader, Carico GPS):');
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

    host.classList.add('es-at-on');
    host.classList.remove('es-pd-on', 'es-ds-on', 'es-pres-on', 'es-vice-on', 'es-fisio-on', 'es-ma-on', 'es-med-on', 'es-obs-on', 'es-tm-on', 'es-gk-on', 'es-yg-on');

    if (group) {
      group.classList.add('is-at-dash');
      group.classList.remove('is-coach-dash', 'is-ds-dash', 'is-pres-dash', 'is-vice-dash', 'is-fisio-dash', 'is-ma-dash', 'is-med-dash', 'is-obs-dash', 'is-tm-dash', 'is-gk-dash', 'is-yg-dash');
    }
    document.body.classList.add('is-at-mode');
    document.body.classList.remove('is-gk-mode');

    var name = atName(user);
    var club = String(user.squadra || user.club || 'Foggia City').trim();
    var nextMatch = getNextMatchTarget();
    var testsCount = (storeGet(AT_TESTS_KEY, []) || []).length;

    var html =
      '<div class="es-at-shell">' +
        '<aside class="es-at-sidebar">' +
          '<div class="es-at-brand-header">' +
            '<div class="es-at-brand-title">ELISEE <span>SCOUT</span></div>' +
            '<div class="es-at-brand-sub">Area Preparatore Atletico</div>' +
          '</div>' +
          '<nav class="es-at-sidebar-nav">' +
            renderSideBtn('dashboard', 'Dashboard', '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>') +
            renderSideBtn('gps', 'Carichi GPS &amp; Workload', '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>') +
            renderSideBtn('schede', 'Schede Forza &amp; Prevenzione', '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>') +
            renderSideBtn('test', 'Test Fisici Periodici' + (testsCount ? ' (' + testsCount + ')' : ''), '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>') +
            renderSideBtn('badge', 'Badge &amp; Menzioni', '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>') +
            renderSideBtn('radar', 'Radar &amp; Competenze', '<circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/>') +
            renderSideBtn('canale', 'Canale Mister &amp; Staff', '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/>') +
            renderSideBtn('impostazioni', 'Profilo &amp; Abilitazione', '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06-.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>') +
          '</nav>' +
          '<div class="es-at-sidebar-badge">' +
            '<div class="es-at-sidebar-club-card">' +
              clubCrest(club) +
              '<div>' +
                '<strong>' + esc(club) + '</strong>' +
                '<span>Staff Tecnico Ufficiale</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</aside>' +

        '<main class="es-at-main">' +
          '<div class="es-at-dash-header">' +
            '<div class="es-at-header-top-row">' +
              '<button type="button" class="es-at-mobile-menu-btn" id="btn-toggle-at-sidebar" aria-label="Menu">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>' +
              '</button>' +
              '<div class="es-at-header-identity">' +
                '<div class="es-at-header-block">' +
                  '<div class="es-at-licence-badge" title="Patentino UEFA / FIGC">' +
                    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' +
                  '</div>' +
                  '<div class="es-at-coach-info">' +
                    '<strong>' + esc(name) + '</strong>' +
                    '<span class="role">Preparatore Atletico</span>' +
                    '<p class="sub">Tesseramento FIGC: FIGC-AT-4418 · Scadenza: 30/06/2027</p>' +
                  '</div>' +
                '</div>' +
                '<div class="es-at-header-sep"></div>' +
                '<div class="es-at-header-block es-at-club-info">' +
                  '<img class="crest" src="immagini/squadre-loghi/foggia-city.png?v=20260917_FGCLIC1" alt="' + esc(club) + '" onerror="this.onerror=null;this.src=\'immagini/squadre-loghi/foggia-city.png\';">' +
                  '<div>' +
                    '<strong>' + esc(club) + '</strong>' +
                    '<span>Prima Squadra · Preparazione Atletica</span>' +
                  '</div>' +
                '</div>' +
              '</div>' +
              '<button type="button" class="es-at-btn-quick-jump" data-at-act="add-test">' +
                'Registra Carico GPS +' +
              '</button>' +
            '</div>' +

            '<div class="es-at-header-match-row">' +
              '<div class="es-at-target-box">' +
                '<p class="label">Prossima Gara Ufficiale</p>' +
                '<strong>' + esc(nextMatch.avversario) + '</strong>' +
                '<span>' + esc(nextMatch.data) + ' · Ore ' + esc(nextMatch.orario) + ' (' + esc(nextMatch.luogo) + ')</span>' +
              '</div>' +
              '<div class="es-at-target-box">' +
                '<p class="label">Countdown Calcio d\'Inizio</p>' +
                '<div class="es-at-countdown-nums">' +
                  '<div><strong>' + String(nextMatch.giorniMancanti || 0).padStart(2, '0') + '</strong><span>Giorni</span></div>' +
                  '<div><strong>' + String(nextMatch.oreMancanti || 0).padStart(2, '0') + '</strong><span>Ore</span></div>' +
                  '<div><strong>' + String(nextMatch.minutiMancanti || 0).padStart(2, '0') + '</strong><span>Min</span></div>' +
                '</div>' +
              '</div>' +
              '<div class="es-at-target-box">' +
                '<p class="label">Focus di Giornata</p>' +
                '<strong style="color:#38bdf8;">ACWR &amp; Prevenzione Infortuni</strong>' +
                '<span>Semaforo carichi e gestione atleti in zona gialla</span>' +
              '</div>' +
            '</div>' +
          '</div>' +

          '<nav class="es-at-nav-tabs">' +
            renderNavTab('dashboard', 'Dashboard', '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>') +
            renderNavTab('gps', 'Carichi GPS &amp; Workload', '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>') +
            renderNavTab('schede', 'Schede Forza &amp; Prevenzione', '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>') +
            renderNavTab('test', 'Test Fisici Periodici', '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>') +
            renderNavTab('badge', 'Badge &amp; Menzioni', '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>') +
            renderNavTab('radar', 'Radar &amp; Competenze', '<circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/>') +
            renderNavTab('canale', 'Canale Mister &amp; Staff', '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/>') +
          '</nav>' +

          '<div id="es-at-active-content">' +
            renderActiveTabContent(activeTab, user) +
          '</div>' +
        '</main>' +
      '</div>';

    box.innerHTML = html;
    box.hidden = false;
    box.removeAttribute('hidden');
    box.style.display = 'block';

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

  document.addEventListener('elisee:role-changed', function (e) {
    var d = e && e.detail;
    try {
      var u = (d && d.user) || userObj();
      if (isAt(u)) render(u);
    } catch (_) {}
  });

  window.addEventListener('hashchange', function () {
    if (window.location.hash.indexOf('user-dossier') >= 0 && isAt()) {
      setTimeout(render, 50);
    }
  });

  document.addEventListener('DOMContentLoaded', function () {
    if (window.location.hash.indexOf('user-dossier') >= 0 && isAt()) {
      setTimeout(render, 100);
    }
  });
})();
