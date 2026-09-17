/* ============================================================
   ELISEE SCOUT — DASHBOARD FISIOTERAPISTA & RIABILITAZIONE (JS)
   Layout Professionale B2B — Physical Therapy & Rehab OS
   ============================================================ */
(function () {
  'use strict';

  var FISIO_TREAT_KEY = 'elisee_fisio_treatments_history';

  var AXES = [
    'Terapia Manuale', 'Tecarterapia / Elettromedicali', 'Riatletizzazione Funzionale', 'Valutazione ROM & Mobilità',
    'Prevenzione Recidive Muscolari', 'Idroterapia & Crioterapia', 'Kinesiotaping & Bending', 'Comunicazione Staff Medico'
  ];
  var V2025 = [95, 93, 91, 94, 92, 89, 94, 96];
  var V2023 = [81, 78, 76, 80, 79, 74, 82, 83];

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function userObj() {
    try {
      return JSON.parse(localStorage.getItem('elisee_active_user') || localStorage.getItem('elisee_user_data') || '{}') || {};
    } catch (_) {
      return {};
    }
  }

  function isFisio(u) {
    u = u || userObj();
    var blob = String(u.staffRole || u.ruoloDettagliato || (u.staffProfile && u.staffProfile.fieldRole) || u.ruolo || u.role || '').trim().toLowerCase();
    return /fisio|fisioterap|massagg|osteopat|massofisioterapista/.test(blob);
  }

  function fisioName(u) {
    return [u.nome, u.cognome].filter(Boolean).join(' ').trim() || u.username || 'Dott. Fisioterapista';
  }

  function initials(name) {
    var p = String(name || 'PT').trim().split(/\s+/);
    return ((p[0] || 'P').charAt(0) + (p[1] || p[0] || 'T').charAt(0)).toUpperCase();
  }

  function photoOf(u) {
    try {
      if (window.getStoredProfilePhoto) return window.getStoredProfilePhoto(null, u) || u.fotoUrl || '';
    } catch (_) {}
    return u.fotoUrl || '';
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
    var html = '<svg viewBox="0 0 440 430" style="width:100%; height:auto; max-height:320px;" role="img" aria-label="Analisi attività riabilitativa e terapeutica">';
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

  function ico(d) {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">' + d + '</svg>';
  }

  function hideOthers() {
    if (typeof window.unmountAllRoleDashboards === 'function') {
      window.unmountAllRoleDashboards('es-fd');
    }
  }

  function toast(msg, kind) {
    if (typeof window.showToast === 'function') window.showToast(msg, kind || 'success');
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

  function inStaff(u) {
    u = u || userObj();
    var st = String(u.contractStatus || '').toLowerCase();
    if (st === 'free agent' || st === 'free' || st === 'consulente') return false;
    return !!(u.squadra || u.club);
  }

  function qualificaOf(u) {
    return String((u && (u.abilitazione || u.specializzazione || u.certificazione)) || '').trim() || 'Fisioterapia Sportiva / Albo FNOFI';
  }

  function html(user) {
    user = user || userObj();
    var name = fisioName(user);
    var ph = photoOf(user);
    var initText = esc(initials(name));
    var on = inStaff(user);
    var club = String(user.squadra || user.club || '').trim();
    var qual = qualificaOf(user);

    var avaHtml;
    if (ph && ph.length > 5 && !/simulated|null|undefined/i.test(ph)) {
      avaHtml = '<img src="' + esc(ph) + '" alt="" class="es-fisio-avatar" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\';">' +
        '<div class="es-fisio-avatar-fallback" style="display:none;">' + initText + '</div>';
    } else {
      avaHtml = '<div class="es-fisio-avatar-fallback">' + initText + '</div>';
    }

    var statusBadge = on
      ? '<span class="es-fisio-badge-tag cyan">In Staff Club</span>'
      : '<span class="es-fisio-badge-tag emerald">Specialista Indipendente</span>';

    var clubDisplay = club
      ? '<span style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:flex; align-items:center; gap:4px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' + esc(club) + '</span>'
      : '<span style="font-size:0.75rem; color:#94a3b8; font-weight:500;">Fisioterapista Libero Professionista</span>';

    return '' +
      // DOCK LATERALE SINISTRO
      '<aside class="es-pd-rail">' +
        '<button type="button" data-fd="home" title="Home">' + ico('<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>') + '</button>' +
        '<button type="button" class="is-on" data-fd="dash" title="Dashboard">' + ico('<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>') + '</button>' +
        '<button type="button" data-fd-act="new-treatment" title="Nuovo Trattamento">' + ico('<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>') + '</button>' +
        '<button type="button" data-fd-act="vas" title="Valutazione VAS">' + ico('<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>') + '</button>' +
        '<button type="button" data-fd="msgs" title="Messaggi Staff">' + ico('<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>') + '</button>' +
        '<button type="button" class="es-pd-rail-end" data-fd="edit" title="Modifica Anagrafica">' + ico('<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>') + '</button>' +
      '</aside>' +

      // SHELL PRINCIPALE
      '<div class="es-fisio-shell">' +

        // 1. TOP HEADER BAR
        '<div class="es-fisio-header-bar">' +
          '<div class="es-fisio-title-wrap">' +
            '<div class="es-fisio-breadcrumb">Elisee Scout &rsaquo; Area Riservata Professionale &rsaquo; Staff Sanitario &amp; Fisioterapia</div>' +
            '<h1>Dashboard Fisioterapista &amp; Riabilitazione</h1>' +
          '</div>' +
          '<div class="es-fisio-header-actions">' +
            '<button type="button" class="es-fisio-btn-secondary" data-fd-act="send-rehab-report">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></svg>' +
              '<span>Report Riabilitativo allo Staff</span>' +
            '</button>' +
            '<button type="button" class="es-fisio-btn-primary" data-fd-act="new-treatment">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
              '<span>Registra Trattamento</span>' +
            '</button>' +
          '</div>' +
        '</div>' +

        // 2. RIGA SUPERIORE (2 COLONNE: PROFILO & MONITORAGGIO TERAPIE)
        '<div class="es-fisio-grid-2col">' +

          // CARD 1: PROFILO FISIOTERAPISTA
          '<section class="es-fisio-card">' +
            '<div class="es-fisio-card-head">' +
              '<h2 class="es-fisio-card-title">' +
                '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
                '<span>Profilo Fisioterapico Ufficiale</span>' +
              '</h2>' +
              '<div style="display:flex; gap:6px; align-items:center;">' +
                '<span class="es-fisio-badge-tag cyan">Albo FNOFI</span>' +
                statusBadge +
              '</div>' +
            '</div>' +

            '<div class="es-fisio-profile-row">' +
              avaHtml +
              '<div class="es-fisio-user-meta">' +
                '<b class="es-fisio-user-name">' + esc(name) + '</b>' +
                '<div class="es-fisio-user-badges">' +
                  '<span style="font-size:0.72rem; color:#38bdf8; background:rgba(56,189,248,0.12); border:1px solid rgba(56,189,248,0.28); border-radius:4px; padding:2px 6px; font-weight:800; text-transform:uppercase;">Fisioterapista</span>' +
                  clubDisplay +
                '</div>' +
              '</div>' +
            '</div>' +

            // Barra di completamento anagrafica
            '<div class="es-fisio-onboarding-bar-box">' +
              '<div class="es-fisio-onboarding-label-row">' +
                '<span>Completamento Anagrafica &amp; Iscrizione Albo</span>' +
                '<span style="color:#38bdf8; font-weight:900;">85%</span>' +
              '</div>' +
              '<div class="es-fisio-progress-track">' +
                '<div class="es-fisio-progress-fill" style="width:85%;"></div>' +
              '</div>' +
              '<div style="display:flex; justify-content:flex-end; margin-top:6px;">' +
                '<button type="button" class="es-pd-edit" data-fd="edit" style="font-size:0.72rem; color:#38bdf8; background:none; border:none; cursor:pointer; font-weight:700; padding:0;">✏️ Modifica Anagrafica</button>' +
              '</div>' +
            '</div>' +

            // Credenziali in grid compatta
            '<div class="es-fisio-cred-grid">' +
              '<div class="es-fisio-cred-item">' +
                '<span>Metodologia / Titolo</span>' +
                '<b>' + esc(qual) + '</b>' +
              '</div>' +
              '<div class="es-fisio-cred-item">' +
                '<span>Collegamento Sanitario</span>' +
                '<b>' + (on ? 'In Staff con il Medico Sociale' : 'Specialista Esterno') + '</b>' +
              '</div>' +
            '</div>' +
          '</section>' +

          // CARD 2: CENTRO RIABILITATIVO & STATISTICHE TERAPIE ROSA
          '<section class="es-fisio-card">' +
            '<div class="es-fisio-card-head">' +
              '<h2 class="es-fisio-card-title">' +
                '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>' +
                '<span>Centro Riabilitativo &amp; Terapie Rosa</span>' +
              '</h2>' +
              '<span class="es-fisio-badge-tag emerald">Recuperi 100% On-Track</span>' +
            '</div>' +

            '<div class="es-fisio-stats-grid">' +
              '<div class="es-fisio-stat-box"><strong style="color:#facc15;">1</strong><span>In Terapia Attiva 🟡</span></div>' +
              '<div class="es-fisio-stat-box"><strong style="color:#4ade80;">23</strong><span>Pieno Regime 🟢</span></div>' +
              '<div class="es-fisio-stat-box"><strong>14</strong><span>Sedute Eseguite Sett.</span></div>' +
              '<div class="es-fisio-stat-box"><strong style="color:#4ade80;">0</strong><span>Ricadute Muscolari</span></div>' +
              '<div class="es-fisio-stat-box"><strong>2.1 / 10</strong><span>Scala VAS Media</span></div>' +
              '<div class="es-fisio-stat-box"><strong>100%</strong><span>Aderenza Protocolli</span></div>' +
            '</div>' +

            '<div class="es-fisio-quick-actions">' +
              '<button type="button" class="es-fisio-quick-btn" data-fd-act="new-treatment">🩹 Nuova Terapia</button>' +
              '<button type="button" class="es-fisio-quick-btn" data-fd-act="vas">📊 Scala Dolore VAS</button>' +
              '<button type="button" class="es-fisio-quick-btn" data-fd-act="tecar">⚡ Tecar / Manuale</button>' +
              '<button type="button" class="es-fisio-quick-btn" data-fd-act="send-rehab-report">📋 Sinergia Medico</button>' +
            '</div>' +
          '</section>' +

        '</div>' + // Fine riga 1

        // 3. STRUMENTI OPERATIVI — AZIONI FISIOTERAPISTA (GRID A 3 COLONNE)
        '<section class="es-fisio-card" style="padding:1.25rem 1.35rem;">' +
          '<div class="es-fisio-card-head">' +
            '<h2 class="es-fisio-card-title">' +
              '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>' +
              '<span>Strumenti Operativi — Azioni Fisioterapista</span>' +
            '</h2>' +
            '<span class="es-fisio-badge-tag cyan">Physio Suite v3.0</span>' +
          '</div>' +

          '<div class="es-fisio-actions-grid">' +
            '<button type="button" class="es-fisio-action-card" data-fd-act="new-treatment">' +
              '<div class="es-fisio-action-icon">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>' +
              '</div>' +
              '<div class="es-fisio-action-text">' +
                '<b>Registra Trattamento Terapico</b>' +
                '<span>Tecar, laserterapia, massoterapia decontratturante.</span>' +
              '</div>' +
            '</button>' +

            '<button type="button" class="es-fisio-action-card" data-fd-act="vas">' +
              '<div class="es-fisio-action-icon">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>' +
              '</div>' +
              '<div class="es-fisio-action-text">' +
                '<b>Valutazione Dolore &amp; ROM</b>' +
                '<span>Scala VAS e range di mobilità articolare post-gara.</span>' +
              '</div>' +
            '</button>' +

            '<button type="button" class="es-fisio-action-card" data-fd-act="rehab-plan">' +
              '<div class="es-fisio-action-icon">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>' +
              '</div>' +
              '<div class="es-fisio-action-text">' +
                '<b>Protocollo Riatletizzazione</b>' +
                '<span>Esercizi eccentrici, rinforzo e ripresa del gesto atletico.</span>' +
              '</div>' +
            '</button>' +

            '<button type="button" class="es-fisio-action-card" data-fd-act="taping">' +
              '<div class="es-fisio-action-icon">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' +
              '</div>' +
              '<div class="es-fisio-action-text">' +
                '<b>Kinesiotaping &amp; Bending</b>' +
                '<span>Bendaggi funzionali e stabilizzazione pre-allenamento.</span>' +
              '</div>' +
            '</button>' +

            '<button type="button" class="es-fisio-action-card" data-fd-act="hydro">' +
              '<div class="es-fisio-action-icon">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>' +
              '</div>' +
              '<div class="es-fisio-action-text">' +
                '<b>Idroterapia &amp; Crioterapia</b>' +
                '<span>Vasche di contrasto e protocolli di recupero post-partita.</span>' +
              '</div>' +
            '</button>' +

            '<button type="button" class="es-fisio-action-card" data-fd-act="send-rehab-report">' +
              '<div class="es-fisio-action-icon">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>' +
              '</div>' +
              '<div class="es-fisio-action-text">' +
                '<b>Report Riabilitativo allo Staff</b>' +
                '<span>Allineamento continuo con Medico Sociale e Mister.</span>' +
              '</div>' +
            '</button>' +
          '</div>' +
        '</section>' +

        // 4. RIGA ANALITICA (3 COLONNE: RADAR, PROTOCOLLI, LIMITI DI RUOLO)
        '<div class="es-fisio-grid-3col">' +

          // COLONNA 1: QUADRO RIABILITATIVO ROSA (RADAR)
          '<section class="es-fisio-card">' +
            '<div class="es-fisio-card-head">' +
              '<h2 class="es-fisio-card-title">' +
                '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/></svg>' +
                '<span>Quadro Riabilitativo</span>' +
              '</h2>' +
              '<span class="es-fisio-badge-tag cyan">Radar Terapie</span>' +
            '</div>' +
            '<div style="display:flex; justify-content:center; align-items:center; padding:0.5rem 0;">' +
              radarSvg() +
            '</div>' +
            '<div style="display:flex; justify-content:space-between; font-size:0.7rem; color:#94a3b8; border-top:1px solid rgba(148,163,184,0.08); padding-top:0.6rem; margin-top:auto;">' +
              '<span>Media Benchmark Settore: <b>78%</b></span>' +
              '<span style="color:#38bdf8;">Indice Fisioterapico: <b>93%</b></span>' +
            '</div>' +
          '</section>' +

          // COLONNA 2: PROTOCOLLI & METODOLOGIA RIABILITATIVA
          '<section class="es-fisio-card">' +
            '<div class="es-fisio-card-head">' +
              '<h2 class="es-fisio-card-title">' +
                '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>' +
                '<span>Protocolli &amp; Metodologia</span>' +
              '</h2>' +
              '<span class="es-fisio-badge-tag emerald">Attivo</span>' +
            '</div>' +

            '<ul class="es-fisio-checklist">' +
              '<li>' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' +
                '<span><b>Terapia manuale &amp; decontratturante</b> — trattamento miofasciale pre e post-gara.</span>' +
              '</li>' +
              '<li>' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' +
                '<span><b>Trattamenti strumentali avanzati</b> — tecarterapia a trasferimento energetico capacitivo/resistivo.</span>' +
              '</li>' +
              '<li>' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' +
                '<span><b>Taping neuromuscolare</b> — facilitazione muscolare e drenaggio linfatico post-trauma.</span>' +
              '</li>' +
              '<li>' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' +
                '<span><b>Sinergia costante con lo staff</b> — monitoraggio progressi in accordo col Medico Sociale.</span>' +
              '</li>' +
            '</ul>' +
          '</section>' +

          // COLONNA 3: LIMITI DI RUOLO & DEONTOLOGIA SANITARIA (Rosso Tenue Luxury Desaturato)
          '<section class="es-fisio-card es-fisio-limits-card">' +
            '<div class="es-fisio-card-head">' +
              '<h2 class="es-fisio-card-title">' +
                '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fda4af" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' +
                '<span style="color:#fda4af;">Limiti di Ruolo &amp; Deontologia</span>' +
              '</h2>' +
              '<span class="es-fisio-badge-tag rose">Compliance</span>' +
            '</div>' +

            '<ul class="es-fisio-limits-list">' +
              '<li>' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>' +
                '<span><b>Prescrizione medica vincolante</b> — Le terapie seguono la diagnosi del Medico Sociale.</span>' +
              '</li>' +
              '<li>' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>' +
                '<span><b>Nessun nulla osta autonomo</b> — Il Return to Play ufficiale richiede il via libera del Medico.</span>' +
              '</li>' +
              '<li>' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>' +
                '<span><b>Nessuna modifica rosa o contratti</b> — Riservato al Presidente e al Direttore Sportivo.</span>' +
              '</li>' +
            '</ul>' +
          '</section>' +

        '</div>' + // Fine riga 3

        // 5. REGISTRO TRATTAMENTI & TERAPIE (EMPTY STATE VISUALE)
        '<section class="es-fisio-card">' +
          '<div class="es-fisio-card-head">' +
            '<h2 class="es-fisio-card-title">' +
              '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
              '<span>Registro Trattamenti &amp; Terapie Recenti</span>' +
            '</h2>' +
            '<span class="es-fisio-badge-tag cyan">Archivio Terapie</span>' +
          '</div>' +

          '<div class="es-fisio-empty-wrap">' +
            '<div class="es-fisio-empty-icon">' +
              '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>' +
            '</div>' +
            '<div class="es-fisio-empty-title">Nessun trattamento registrato di recente</div>' +
            '<div class="es-fisio-empty-sub">Registra una nuova seduta di fisioterapia o aggiorna la scala VAS del dolore per monitorare il recupero degli atleti.</div>' +
            '<div style="display:flex; gap:8px; margin-top:0.4rem;">' +
              '<button type="button" class="es-fisio-btn-primary" data-fd-act="new-treatment" style="font-size:0.75rem; padding:0.45rem 0.85rem;">+ Registra Trattamento</button>' +
              '<button type="button" class="es-fisio-btn-secondary" data-fd-act="vas" style="font-size:0.75rem; padding:0.45rem 0.85rem;">📊 Scala Dolore VAS</button>' +
            '</div>' +
          '</div>' +
        '</section>' +

      '</div>'; // Fine shell
  }

  function openFisioEditModal(user) {
    user = user || userObj();
    var backdrop = document.createElement('div');
    backdrop.className = 'es-edit-modal-backdrop';

    backdrop.innerHTML = '<div class="es-edit-modal">' +
      '<div class="es-edit-modal-head">' +
      '<h2><span>✏️</span> Modifica Anagrafica Fisioterapista</h2>' +
      '<button type="button" class="es-edit-modal-close" title="Chiudi">&times;</button>' +
      '</div>' +
      '<div class="es-edit-grid">' +
      '<div class="es-edit-field"><label>Nome</label><input id="es-fisio-nome" value="' + esc(user.nome || '') + '"></div>' +
      '<div class="es-edit-field"><label>Cognome</label><input id="es-fisio-cognome" value="' + esc(user.cognome || '') + '"></div>' +
      '<div class="es-edit-field"><label>Specializzazione / Albo</label><input id="es-fisio-qual" value="' + esc(user.abilitazione || 'Fisioterapia Sportiva / Albo FNOFI') + '"></div>' +
      '<div class="es-edit-field"><label>Ruolo Ufficiale</label><input id="es-fisio-role" value="Fisioterapista / Osteopata" readonly></div>' +
      '<div class="es-edit-field"><label>Club / Organizzazione</label><input id="es-fisio-club" value="' + esc(user.squadra || user.club || '') + '" placeholder="Vuoto = Specialista Esterno"></div>' +
      '<div class="es-edit-field"><label>Status Contrattuale</label><select id="es-fisio-status">' +
      '<option value="In Staff Club"' + (inStaff(user) ? ' selected' : '') + '>In Staff Club (Collegato al Medico)</option>' +
      '<option value="Free Agent"' + (!inStaff(user) ? ' selected' : '') + '>Specialista Esterno / Libero Professionista</option>' +
      '</select></div>' +
      '<div class="es-edit-field full"><label>Metodologia &amp; Note Operative</label><textarea id="es-fisio-bio" rows="3">' + esc(user.bio || '') + '</textarea></div>' +
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
      var n = document.getElementById('es-fisio-nome').value.trim();
      var c = document.getElementById('es-fisio-cognome').value.trim();
      var q = document.getElementById('es-fisio-qual').value.trim();
      var clb = document.getElementById('es-fisio-club').value.trim();
      var st = document.getElementById('es-fisio-status').value;
      var bio = document.getElementById('es-fisio-bio').value.trim();

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
      toast('Anagrafica Fisioterapista salvata con successo!', 'success');
      render(user);
    });
  }

  function bind(host) {
    if (!host || host.dataset.fdBound === '1') return;
    host.dataset.fdBound = '1';
    host.addEventListener('click', function (e) {
      var b = e.target.closest('[data-fd], [data-fd-act]');
      if (!b) return;
      var k = b.getAttribute('data-fd');
      var act = b.getAttribute('data-fd-act');

      if (k === 'home' && window.switchView) window.switchView('home', '#hero');
      if (k === 'dash' && window.switchView) window.switchView('user-dossier', '#user-dossier-portal');
      if (k === 'msgs' && window.openUserMessages) window.openUserMessages();
      if (k === 'edit') openFisioEditModal(userObj());

      if (act === 'new-treatment' || act === 'tecar') {
        var ath = window.prompt('Nome e cognome dell\'atleta trattato:');
        if (ath) {
          var tipo = window.prompt('Tipo di trattamento (es. Tecarterapia bicipite femorale, massoterapia scarico):', 'Tecarterapia + massaggio');
          if (tipo) {
            toast('Trattamento "' + tipo + '" registrato per ' + ath + '!', 'success');
          }
        }
      }
      if (act === 'vas') {
        var athV = window.prompt('Nome e cognome dell\'atleta per valutazione dolore VAS:');
        if (athV) {
          var val = window.prompt('Punteggio scala VAS da 0 (nessun dolore) a 10 (dolore massimo):', '2');
          if (val != null) {
            toast('Scala VAS registrata a ' + val + '/10 per ' + athV + '.', 'success');
          }
        }
      }
      if (act === 'rehab-plan') {
        var athR = window.prompt('Nome e cognome dell\'atleta per il protocollo riabilitativo:');
        if (athR) {
          var tema = window.prompt('Fase del percorso riabilitativo (es. Fase 1 differenziato, Fase 2 corsa rettilinea):', 'Fase 2 riatletizzazione');
          if (tema) {
            toast('Protocollo "' + tema + '" assegnato a ' + athR + '!', 'success');
          }
        }
      }
      if (act === 'taping') {
        var athT = window.prompt('Nome e cognome dell\'atleta per bendaggio funzionale / kinesiotaping:');
        if (athT) {
          toast('Bendaggio stabilizzante registrato per ' + athT + '.', 'success');
        }
      }
      if (act === 'hydro') {
        toast('Protocollo idroterapia & vasche di contrasto avviato per la rosa.', 'info');
      }
      if (act === 'send-rehab-report') {
        toast('📋 Report riabilitativo inoltrato con successo al Medico Sociale e al Mister!', 'success');
      }
    });
  }

  function render(user) {
    user = user || userObj();
    if (!isFisio(user)) return;
    hideOthers();
    var host = document.getElementById('es-staff-profile');
    var group = document.getElementById('user-dossier-view-group');
    if (!host) return;

    var box = document.getElementById('es-fd');
    if (!box) {
      box = document.createElement('div');
      box.id = 'es-fd';
      box.className = 'es-pd';
      host.insertBefore(box, host.firstChild);
    }
    box.innerHTML = html(user);
    box.hidden = false;
    box.removeAttribute('hidden');
    box.style.display = 'grid';

    host.classList.add('es-fisio-on');
    host.classList.remove('es-pd-on', 'es-ds-on', 'es-pres-on', 'es-vice-on', 'es-med-on', 'es-ma-on', 'es-obs-on', 'es-tm-on', 'es-gk-on', 'es-at-on', 'es-yg-on');

    if (group) {
      group.classList.add('is-fisio-dash');
      group.classList.remove('is-coach-dash', 'is-ds-dash', 'is-pres-dash', 'is-vice-dash', 'is-med-dash', 'is-ma-dash', 'is-obs-dash', 'is-tm-dash', 'is-gk-dash', 'is-at-dash', 'is-yg-dash');
    }
    bind(host);
  }

  window.EliseeFisioDash = { render: render, isFisio: isFisio };

  document.addEventListener('elisee:view-changed', function (e) {
    var d = e && e.detail;
    if (d && d.view === 'user-dossier') {
      try {
        var u = userObj();
        if (isFisio(u)) render(u);
      } catch (_) {}
    }
  });

  document.addEventListener('elisee:role-changed', function (e) {
    var d = e && e.detail;
    try {
      var u = (d && d.user) || userObj();
      if (isFisio(u)) render(u);
    } catch (_) {}
  });
})();
