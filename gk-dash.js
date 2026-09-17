/* ============================================================
   ELISEE SCOUT — DASHBOARD PREPARATORE DEI PORTIERI (JS)
   Layout Professionale B2B — Goalkeeper Technical OS
   ============================================================ */
(function () {
  'use strict';

  var GK_ROOM_KEY = 'elisee_gk_room_clips';

  var AXES = [
    'Presa & Tuffo', 'Uscite Alte (Traiettorie)', 'Uscite Basse (1v1)', 'Costruzione dal Basso (Piedi)',
    'Reattività Visiva & Riflessi', 'Posizionamento Tra i Pali', 'Comando Vocale Difesa', 'Condizione Atletica GK'
  ];
  var V2025 = [93, 91, 88, 86, 95, 92, 94, 90];
  var V2023 = [80, 78, 73, 70, 82, 80, 81, 77];

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

  function isGk(u) {
    u = u || userObj();
    var blob = String(u.staffRole || u.ruoloDettagliato || (u.staffProfile && u.staffProfile.fieldRole) || u.ruolo || u.role || '').trim().toLowerCase();
    return /portier|preparatore dei portieri|preparatore atletico dei portieri|allenatore dei portieri|gk/.test(blob);
  }

  function gkName(u) {
    return [u.nome, u.cognome].filter(Boolean).join(' ').trim() || u.username || 'Preparatore dei Portieri';
  }

  function initials(name) {
    var p = String(name || 'GK').trim().split(/\s+/);
    return ((p[0] || 'G').charAt(0) + (p[1] || p[0] || 'K').charAt(0)).toUpperCase();
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
    var html = '<svg viewBox="0 0 440 430" style="width:100%; height:auto; max-height:320px;" role="img" aria-label="Analisi attività tecnica e atletica portieri">';
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
      window.unmountAllRoleDashboards('es-gk');
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
    if (st === 'free agent' || st === 'free') return false;
    return !!(u.squadra || u.club);
  }

  function qualificaOf(u) {
    return String((u && (u.abilitazione || u.qualifica || u.certificazione)) || '').trim() || 'Preparatore Portieri FIGC / UEFA GK';
  }

  function html(user) {
    user = user || userObj();
    var name = gkName(user);
    var ph = photoOf(user);
    var initText = esc(initials(name));
    var on = inStaff(user);
    var club = String(user.squadra || user.club || '').trim();
    var qual = qualificaOf(user);

    var avaHtml;
    if (ph && ph.length > 5 && !/simulated|null|undefined/i.test(ph)) {
      avaHtml = '<img src="' + esc(ph) + '" alt="" class="es-gk-avatar" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\';">' +
        '<div class="es-gk-avatar-fallback" style="display:none;">' + initText + '</div>';
    } else {
      avaHtml = '<div class="es-gk-avatar-fallback">' + initText + '</div>';
    }

    var statusBadge = on
      ? '<span class="es-gk-badge-tag cyan">In Staff Club</span>'
      : '<span class="es-gk-badge-tag emerald">Free Agent</span>';

    var clubDisplay = club
      ? '<span style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:flex; align-items:center; gap:4px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' + esc(club) + '</span>'
      : '<span style="font-size:0.75rem; color:#94a3b8; font-weight:500;">Specialista Indipendente</span>';

    return '' +
      // DOCK LATERALE SINISTRO
      '<aside class="es-pd-rail">' +
        '<button type="button" data-gk="home" title="Home">' + ico('<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>') + '</button>' +
        '<button type="button" class="is-on" data-gk="dash" title="Dashboard">' + ico('<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>') + '</button>' +
        '<button type="button" data-gk-act="add-clip" title="Nuova Clip GK">' + ico('<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>') + '</button>' +
        '<button type="button" data-gk-act="new-drill" title="Scheda Sviluppo">' + ico('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>') + '</button>' +
        '<button type="button" data-gk="msgs" title="Messaggi Staff">' + ico('<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>') + '</button>' +
        '<button type="button" class="es-pd-rail-end" data-gk="edit" title="Modifica Anagrafica">' + ico('<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>') + '</button>' +
      '</aside>' +

      // SHELL PRINCIPALE
      '<div class="es-gk-shell">' +

        // 1. TOP HEADER BAR
        '<div class="es-gk-header-bar">' +
          '<div class="es-gk-title-wrap">' +
            '<div class="es-gk-breadcrumb">Elisee Scout &rsaquo; Area Riservata Professionale &rsaquo; Staff Tecnico Portieri</div>' +
            '<h1>Dashboard Preparatore dei Portieri</h1>' +
          '</div>' +
          '<div class="es-gk-header-actions">' +
            '<button type="button" class="es-gk-btn-secondary" data-gk-act="send-coach-report">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></svg>' +
              '<span>Report al Mister</span>' +
            '</button>' +
            '<button type="button" class="es-gk-btn-primary" data-gk-act="new-drill">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
              '<span>Nuova Scheda Portieri</span>' +
            '</button>' +
          '</div>' +
        '</div>' +

        // 2. RIGA SUPERIORE (2 COLONNE: PROFILO & PERFORMANCE GK)
        '<div class="es-gk-grid-2col">' +

          // CARD 1: PROFILO PREPARATORE PORTIERI
          '<section class="es-gk-card">' +
            '<div class="es-gk-card-head">' +
              '<h2 class="es-gk-card-title">' +
                '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
                '<span>Profilo Specialistico Portieri</span>' +
              '</h2>' +
              '<div style="display:flex; gap:6px; align-items:center;">' +
                '<span class="es-gk-badge-tag cyan">UEFA GK</span>' +
                statusBadge +
              '</div>' +
            '</div>' +

            '<div class="es-gk-profile-row">' +
              avaHtml +
              '<div class="es-gk-user-meta">' +
                '<b class="es-gk-user-name">' + esc(name) + '</b>' +
                '<div class="es-gk-user-badges">' +
                  '<span style="font-size:0.72rem; color:#38bdf8; background:rgba(56,189,248,0.12); border:1px solid rgba(56,189,248,0.28); border-radius:4px; padding:2px 6px; font-weight:800; text-transform:uppercase;">Preparatore Portieri</span>' +
                  clubDisplay +
                '</div>' +
              '</div>' +
            '</div>' +

            // Barra di completamento anagrafica
            '<div class="es-gk-onboarding-bar-box">' +
              '<div class="es-gk-onboarding-label-row">' +
                '<span>Completamento Anagrafica &amp; Abilitazione</span>' +
                '<span style="color:#38bdf8; font-weight:900;">85%</span>' +
              '</div>' +
              '<div class="es-gk-progress-track">' +
                '<div class="es-gk-progress-fill" style="width:85%;"></div>' +
              '</div>' +
              '<div style="display:flex; justify-content:flex-end; margin-top:6px;">' +
                '<button type="button" class="es-pd-edit" data-gk="edit" style="font-size:0.72rem; color:#38bdf8; background:none; border:none; cursor:pointer; font-weight:700; padding:0;">✏️ Modifica Anagrafica</button>' +
              '</div>' +
            '</div>' +

            // Credenziali in grid compatta
            '<div class="es-gk-cred-grid">' +
              '<div class="es-gk-cred-item">' +
                '<span>Abilitazione Ufficiale</span>' +
                '<b>' + esc(qual) + '</b>' +
              '</div>' +
              '<div class="es-gk-cred-item">' +
                '<span>Collegamento Staff</span>' +
                '<b>' + (on ? 'In Staff con il Mister' : 'Specialista Indipendente') + '</b>' +
              '</div>' +
            '</div>' +
          '</section>' +

          // CARD 2: PERFORMANCE METRICHE SPECIFICHE GK
          '<section class="es-gk-card">' +
            '<div class="es-gk-card-head">' +
              '<h2 class="es-gk-card-title">' +
                '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' +
                '<span>Metriche &amp; Efficacia Reparto Portieri</span>' +
              '</h2>' +
              '<span class="es-gk-badge-tag emerald">Top 5% Livello</span>' +
            '</div>' +

            '<div class="es-gk-metrics-grid">' +
              '<div class="es-gk-metric-box"><strong>89%</strong><span>Parate Decisive</span></div>' +
              '<div class="es-gk-metric-box"><strong>94%</strong><span>Uscite Alte Riuscite</span></div>' +
              '<div class="es-gk-metric-box"><strong>86%</strong><span>Piede Forte (Basso)</span></div>' +
              '<div class="es-gk-metric-box"><strong>74%</strong><span>Piede Debole</span></div>' +
              '<div class="es-gk-metric-box"><strong>0.28s</strong><span>Reattività GPS</span></div>' +
              '<div class="es-gk-metric-box"><strong>98%</strong><span>Comando Vocale</span></div>' +
            '</div>' +

            '<div class="es-gk-quick-actions">' +
              '<button type="button" class="es-gk-quick-btn" data-gk-act="add-clip">🎬 Stanza dei Portieri</button>' +
              '<button type="button" class="es-gk-quick-btn" data-gk-act="new-drill">📋 Schede Settimanali</button>' +
              '<button type="button" class="es-gk-quick-btn" data-gk-act="assign-badge" data-badge="Saracinesca">🛡️ Badge Saracinesca</button>' +
              '<button type="button" class="es-gk-quick-btn" data-gk-act="mention-special">🌟 Menzione Speciale</button>' +
            '</div>' +
          '</section>' +

        '</div>' + // Fine riga 1

        // 3. STRUMENTI OPERATIVI — AZIONI PREPARATORE DEI PORTIERI (GRID A 3 COLONNE)
        '<section class="es-gk-card" style="padding:1.25rem 1.35rem;">' +
          '<div class="es-gk-card-head">' +
            '<h2 class="es-gk-card-title">' +
              '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>' +
              '<span>Strumenti Operativi — Azioni Preparatore Portieri</span>' +
            '</h2>' +
            '<span class="es-gk-badge-tag cyan">GK Suite v3.0</span>' +
          '</div>' +

          '<div class="es-gk-actions-grid">' +
            '<button type="button" class="es-gk-action-card" data-gk-act="add-clip">' +
              '<div class="es-gk-action-icon">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>' +
              '</div>' +
              '<div class="es-gk-action-text">' +
                '<b>La "Stanza dei Portieri"</b>' +
                '<span>Video hub per clip di parate, uscite basse e posture.</span>' +
              '</div>' +
            '</button>' +

            '<button type="button" class="es-gk-action-card" data-gk-act="new-drill">' +
              '<div class="es-gk-action-icon">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>' +
              '</div>' +
              '<div class="es-gk-action-text">' +
                '<b>Schede di Sviluppo GK</b>' +
                '<span>Drill settimanali su presa, tuffo, uscite e gioco coi piedi.</span>' +
              '</div>' +
            '</button>' +

            '<button type="button" class="es-gk-action-card" data-gk-act="assign-badge" data-badge="Saracinesca">' +
              '<div class="es-gk-action-icon">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' +
              '</div>' +
              '<div class="es-gk-action-text">' +
                '<b>Badge: Saracinesca 🛡️</b>' +
                '<span>Assegna il badge ufficiale al portiere autore di interventi decisivi.</span>' +
              '</div>' +
            '</button>' +

            '<button type="button" class="es-gk-action-card" data-gk-act="assign-badge" data-badge="Piede Educato GK">' +
              '<div class="es-gk-action-icon">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' +
              '</div>' +
              '<div class="es-gk-action-text">' +
                '<b>Badge: Piede Educato GK 🎯</b>' +
                '<span>Certifica precisione nella costruzione e distribuzione dal basso.</span>' +
              '</div>' +
            '</button>' +

            '<button type="button" class="es-gk-action-card" data-gk-act="mention-special">' +
              '<div class="es-gk-action-icon">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' +
              '</div>' +
              '<div class="es-gk-action-text">' +
                '<b>Menzione Speciale sulla Card</b>' +
                '<span>Pubblica un report prestazionale visibile nella Card atleta.</span>' +
              '</div>' +
            '</button>' +

            '<button type="button" class="es-gk-action-card" data-gk-act="send-coach-report">' +
              '<div class="es-gk-action-icon">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>' +
              '</div>' +
              '<div class="es-gk-action-text">' +
                '<b>Report Tecnico al Mister</b>' +
                '<span>Invia lo stato di forma dei portieri prima delle convocazioni.</span>' +
              '</div>' +
            '</button>' +
          '</div>' +
        '</section>' +

        // 4. RIGA ANALITICA (3 COLONNE: RADAR, DRILLS, LIMITI DI RUOLO)
        '<div class="es-gk-grid-3col">' +

          // COLONNA 1: QUADRO TECNICO PORTIERI (RADAR)
          '<section class="es-gk-card">' +
            '<div class="es-gk-card-head">' +
              '<h2 class="es-gk-card-title">' +
                '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/></svg>' +
                '<span>Quadro Tecnico Portieri</span>' +
              '</h2>' +
              '<span class="es-gk-badge-tag cyan">Radar Operativo</span>' +
            '</div>' +
            '<div style="display:flex; justify-content:center; align-items:center; padding:0.5rem 0;">' +
              radarSvg() +
            '</div>' +
            '<div style="display:flex; justify-content:space-between; font-size:0.7rem; color:#94a3b8; border-top:1px solid rgba(148,163,184,0.08); padding-top:0.6rem; margin-top:auto;">' +
              '<span>Media Serie D / C: <b>78%</b></span>' +
              '<span style="color:#38bdf8;">Indice Portieri: <b>91%</b></span>' +
            '</div>' +
          '</section>' +

          // COLONNA 2: DRILLS & METODOLOGIA GK
          '<section class="es-gk-card">' +
            '<div class="es-gk-card-head">' +
              '<h2 class="es-gk-card-title">' +
                '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>' +
                '<span>Drill &amp; Metodologia</span>' +
              '</h2>' +
              '<span class="es-gk-badge-tag emerald">Programma Attivo</span>' +
            '</div>' +

            '<ul class="es-gk-checklist">' +
              '<li>' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' +
                '<span><b>Presa sicura &amp; Tuffo</b> — 3 sessioni/settimana con carichi reattivi.</span>' +
              '</li>' +
              '<li>' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' +
                '<span><b>Uscite Alte &amp; Palle Inattive</b> — Coordinazione aerea e lettura delle traiettorie.</span>' +
              '</li>' +
              '<li>' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' +
                '<span><b>Costruzione con i Piedi</b> — Sviluppo bilaterale e scarico sicuro sui terzini.</span>' +
              '</li>' +
              '<li>' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' +
                '<span><b>Reattività Visiva &amp; Riflessi</b> — Sessioni specifiche con deviazioni ravvicinate.</span>' +
              '</li>' +
            '</ul>' +
          '</section>' +

          // COLONNA 3: LIMITI DI RUOLO & GOVERNANCE (Rosso Tenue Luxury Desaturato)
          '<section class="es-gk-card es-gk-limits-card">' +
            '<div class="es-gk-card-head">' +
              '<h2 class="es-gk-card-title">' +
                '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fda4af" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' +
                '<span style="color:#fda4af;">Limiti di Ruolo &amp; Governance</span>' +
              '</h2>' +
              '<span class="es-gk-badge-tag rose">Compliance</span>' +
            '</div>' +

            '<ul class="es-gk-limits-list">' +
              '<li>' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>' +
                '<span><b>Nessuna modifica della rosa societaria</b> — Riservato al Presidente e al Segretario.</span>' +
              '</li>' +
              '<li>' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>' +
                '<span><b>Nessuna gestione trattative mercato</b> — Gestione acquisti riservata al Direttore Sportivo.</span>' +
              '</li>' +
              '<li>' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>' +
                '<span><b>Coordinamento con Allenatore</b> — La decisione finale sulla titolarità spetta al Mister.</span>' +
              '</li>' +
            '</ul>' +
          '</section>' +

        '</div>' + // Fine riga 3

        // 5. REGISTRO ATTIVITÀ & BRIEFING (EMPTY STATE VISUALE)
        '<section class="es-gk-card">' +
          '<div class="es-gk-card-head">' +
            '<h2 class="es-gk-card-title">' +
              '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
              '<span>Registro Attività &amp; Briefing Portieri</span>' +
            '</h2>' +
            '<span class="es-gk-badge-tag cyan">Archivio GK</span>' +
          '</div>' +

          '<div class="es-gk-empty-wrap">' +
            '<div class="es-gk-empty-icon">' +
              '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>' +
            '</div>' +
            '<div class="es-gk-empty-title">Nessuna sessione registrata di recente</div>' +
            '<div class="es-gk-empty-sub">Registra una nuova scheda di sviluppo tecnico o carica una clip nella Stanza dei Portieri per iniziare a monitorare gli estremi difensori.</div>' +
            '<div style="display:flex; gap:8px; margin-top:0.4rem;">' +
              '<button type="button" class="es-gk-btn-primary" data-gk-act="new-drill" style="font-size:0.75rem; padding:0.45rem 0.85rem;">+ Assegna Scheda Sviluppo</button>' +
              '<button type="button" class="es-gk-btn-secondary" data-gk-act="add-clip" style="font-size:0.75rem; padding:0.45rem 0.85rem;">🎬 Nuova Clip</button>' +
            '</div>' +
          '</div>' +
        '</section>' +

      '</div>'; // Fine shell
  }

  function openGkEditModal(user) {
    user = user || userObj();
    var backdrop = document.createElement('div');
    backdrop.className = 'es-edit-modal-backdrop';

    backdrop.innerHTML = '<div class="es-edit-modal">' +
      '<div class="es-edit-modal-head">' +
      '<h2><span>✏️</span> Modifica Anagrafica Preparatore dei Portieri</h2>' +
      '<button type="button" class="es-edit-modal-close" title="Chiudi">&times;</button>' +
      '</div>' +
      '<div class="es-edit-grid">' +
      '<div class="es-edit-field"><label>Nome</label><input id="es-gk-nome" value="' + esc(user.nome || '') + '"></div>' +
      '<div class="es-edit-field"><label>Cognome</label><input id="es-gk-cognome" value="' + esc(user.cognome || '') + '"></div>' +
      '<div class="es-edit-field"><label>Qualifica / Abilitazione</label><input id="es-gk-qual" value="' + esc(user.abilitazione || 'Preparatore Portieri FIGC / UEFA GK') + '"></div>' +
      '<div class="es-edit-field"><label>Ruolo Ufficiale</label><input id="es-gk-role" value="Preparatore dei portieri" readonly></div>' +
      '<div class="es-edit-field"><label>Club / Organizzazione</label><input id="es-gk-club" value="' + esc(user.squadra || user.club || '') + '" placeholder="Vuoto = Specialista Indipendente"></div>' +
      '<div class="es-edit-field"><label>Status Contrattuale</label><select id="es-gk-status">' +
      '<option value="In Staff Club"' + (inStaff(user) ? ' selected' : '') + '>In Staff Club (Collegato al Mister)</option>' +
      '<option value="Free Agent"' + (!inStaff(user) ? ' selected' : '') + '>Free Agent / Specialista Indipendente</option>' +
      '</select></div>' +
      '<div class="es-edit-field full"><label>Metodologia &amp; Note Tecniche</label><textarea id="es-gk-bio" rows="3">' + esc(user.bio || '') + '</textarea></div>' +
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
      var n = document.getElementById('es-gk-nome').value.trim();
      var c = document.getElementById('es-gk-cognome').value.trim();
      var q = document.getElementById('es-gk-qual').value.trim();
      var clb = document.getElementById('es-gk-club').value.trim();
      var st = document.getElementById('es-gk-status').value;
      var bio = document.getElementById('es-gk-bio').value.trim();

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
      toast('Anagrafica Preparatore dei Portieri salvata con successo!', 'success');
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
      if (k === 'dash' && window.switchView) window.switchView('user-dossier', '#user-dossier-portal');
      if (k === 'msgs' && window.openUserMessages) window.openUserMessages();
      if (k === 'edit') openGkEditModal(userObj());

      if (act === 'assign-badge') {
        var badge = b.getAttribute('data-badge') || 'Saracinesca';
        var athlete = window.prompt('Nome e cognome del portiere a cui assegnare il badge "' + badge + '":');
        if (athlete) {
          toast('Badge "' + badge + '" assegnato con successo alla Card ufficiale di ' + athlete + '!', 'success');
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
        var dTitle = window.prompt('Tema della nuova scheda di sviluppo settimanale (es. Uscite 1v1, Lavoro Coi Piedi):');
        if (dTitle) {
          toast('Scheda di sviluppo "' + dTitle + '" assegnata ai portieri della rosa!', 'success');
        }
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
    box.style.display = 'grid';

    host.classList.add('es-gk-on');
    host.classList.remove('es-pd-on', 'es-ds-on', 'es-pres-on', 'es-vice-on', 'es-fisio-on', 'es-obs-on', 'es-med-on', 'es-tm-on', 'es-at-on', 'es-yg-on');

    if (group) {
      group.classList.add('is-gk-dash');
      group.classList.remove('is-coach-dash', 'is-ds-dash', 'is-pres-dash', 'is-vice-dash', 'is-fisio-dash', 'is-obs-dash', 'is-med-dash', 'is-tm-dash', 'is-at-dash', 'is-yg-dash');
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

  document.addEventListener('elisee:role-changed', function (e) {
    var d = e && e.detail;
    try {
      var u = (d && d.user) || userObj();
      if (isGk(u)) render(u);
    } catch (_) {}
  });
})();
