/* ============================================================
   ELISEE SCOUT — DASHBOARD OSSERVATORE & TALENT SCOUT (JS)
   Layout Professionale B2B — Stealth Scouting OS
   ============================================================ */
(function () {
  'use strict';

  var AXES = [
    'Precisione Valutazioni', 'Partite Visionate', 'Segnalazioni Convertite', 'Copertura Categorie Giovanili',
    'Analisi Video', 'Tempestività Report', 'Rete Contatti Procuratori', 'Conoscenza Mercato'
  ];
  var V2025 = [92, 90, 85, 88, 91, 87, 93, 94];
  var V2023 = [78, 76, 70, 74, 79, 73, 80, 81];

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

  function isObs(u) {
    u = u || userObj();
    var blob = String(u.staffRole || u.ruoloDettagliato || (u.staffProfile && u.staffProfile.fieldRole) || u.ruolo || u.role || '').trim().toLowerCase();
    if (/match analyst|video analyst/.test(blob) && !/\bosservatore\b/.test(blob) && !/scout\s*\/\s*osservatore/.test(blob)) return false;
    return /scout\s*\/\s*osservatore|\bosservatore\b|\bscout\b/.test(blob);
  }

  function obsName(u) {
    return [u.nome, u.cognome].filter(Boolean).join(' ').trim() || u.username || 'Talent Scout';
  }

  function initials(name) {
    var p = String(name || 'OS').trim().split(/\s+/);
    return ((p[0] || 'O').charAt(0) + (p[1] || p[0] || 'S').charAt(0)).toUpperCase();
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
    var html = '<svg viewBox="0 0 440 430" style="width:100%; height:auto; max-height:320px;" role="img" aria-label="Analisi attività di scouting">';
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
      window.unmountAllRoleDashboards('es-od');
    }
  }

  var QUALS = [
    'Osservatore Professionista FIGC',
    'Talent Scout Dilettanti',
    'Match Analyst / Scout'
  ];

  function underContract(u) {
    u = u || userObj();
    var st = String(u.obsContract || u.contractStatus || '').toLowerCase();
    if (st === 'free' || st === 'free-agent' || st === 'indipendente') return false;
    if (st === 'contract' || st === 'under-contract') return true;
    return !!(u.squadra || u.club);
  }

  function qualificaOf(u) {
    return String((u && (u.obsQualifica || u.qualificaScout || u.certificazione)) || '').trim() || 'Osservatore Accreditato';
  }

  function getSecretListCount() {
    try {
      var arr = JSON.parse(localStorage.getItem('elisee_secret_list') || '[]');
      return Array.isArray(arr) ? arr.length : 0;
    } catch (_) {
      return 0;
    }
  }

  function html(user) {
    user = user || userObj();
    var name = obsName(user);
    var ph = photoOf(user);
    var initText = esc(initials(name));
    var on = underContract(user);
    var club = String(user.squadra || user.club || '').trim();
    var qual = qualificaOf(user);
    var dsLinked = !!(user.obsDsLink || on);
    var secretCount = getSecretListCount();

    // 1. Avatar circolare sicuro
    var avaHtml;
    if (ph && ph.length > 5 && !/simulated|null|undefined/i.test(ph)) {
      avaHtml = '<img src="' + esc(ph) + '" alt="" class="es-obs-avatar" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\';">' +
        '<div class="es-obs-avatar-fallback" style="display:none;">' + initText + '</div>';
    } else {
      avaHtml = '<div class="es-obs-avatar-fallback">' + initText + '</div>';
    }

    // 2. Status contrattuale
    var statusBadge = on
      ? '<span class="es-obs-badge-tag cyan">Under Contract</span>'
      : '<span class="es-obs-badge-tag emerald">Free Agent</span>';

    var clubDisplay = club
      ? '<span style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:flex; align-items:center; gap:4px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' + esc(club) + '</span>'
      : '<span style="font-size:0.75rem; color:#94a3b8; font-weight:500;">Scout Indipendente / Consulente</span>';

    return '' +
      // DOCK LATERALE SINISTRO
      '<aside class="es-pd-rail">' +
        '<button type="button" data-ob="home" title="Home">' + ico('<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>') + '</button>' +
        '<button type="button" class="is-on" data-ob="dash" title="Dashboard">' + ico('<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>') + '</button>' +
        '<button type="button" data-ob="secret" title="Secret List">' + ico('<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>') + '</button>' +
        '<button type="button" data-ob="wall" title="Wall Trasferimenti">' + ico('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>') + '</button>' +
        '<button type="button" data-ob="search" title="Ricerca Calciatori">' + ico('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>') + '</button>' +
        '<button type="button" data-ob="msgs" title="Messaggi">' + ico('<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>') + '</button>' +
        '<button type="button" class="es-pd-rail-end" data-ob="edit" title="Modifica Anagrafica">' + ico('<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>') + '</button>' +
      '</aside>' +

      // SHELL PRINCIPALE
      '<div class="es-obs-shell">' +

        // 1. TOP HEADER BAR
        '<div class="es-obs-header-bar">' +
          '<div class="es-obs-title-wrap">' +
            '<div class="es-obs-breadcrumb">Elisee Scout &rsaquo; Area Riservata Professionale &rsaquo; Talent Scouting</div>' +
            '<h1>Dashboard Osservatore &amp; Scout</h1>' +
          '</div>' +
          '<div class="es-obs-header-actions">' +
            '<button type="button" class="es-obs-btn-secondary" data-ob="secret">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' +
              '<span>Secret List (' + secretCount + ')</span>' +
            '</button>' +
            '<button type="button" class="es-obs-btn-primary" data-ob="secret">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>' +
              '<span>Inoltra Target al DS</span>' +
            '</button>' +
          '</div>' +
        '</div>' +

        // 2. RIGA SUPERIORE (2 COLONNE: PROFILO & STEALTH CONTROL)
        '<div class="es-obs-grid-2col">' +

          // CARD 1: PROFILO SCOUT & ACCREDITAMENTO
          '<section class="es-obs-card">' +
            '<div class="es-obs-card-head">' +
              '<h2 class="es-obs-card-title">' +
                '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
                '<span>Profilo Ufficiale Scout</span>' +
              '</h2>' +
              '<div style="display:flex; gap:6px; align-items:center;">' +
                '<span class="es-obs-badge-tag cyan">Accreditato</span>' +
                statusBadge +
              '</div>' +
            '</div>' +

            '<div class="es-obs-profile-row">' +
              avaHtml +
              '<div class="es-obs-user-meta">' +
                '<b class="es-obs-user-name">' + esc(name) + '</b>' +
                '<div class="es-obs-user-badges">' +
                  '<span style="font-size:0.72rem; color:#38bdf8; background:rgba(56,189,248,0.12); border:1px solid rgba(56,189,248,0.28); border-radius:4px; padding:2px 6px; font-weight:800; text-transform:uppercase;">Osservatore / Scout</span>' +
                  clubDisplay +
                '</div>' +
              '</div>' +
            '</div>' +

            // Barra di completamento anagrafica
            '<div class="es-obs-onboarding-bar-box">' +
              '<div class="es-obs-onboarding-label-row">' +
                '<span>Completamento Anagrafica &amp; Abilitazione</span>' +
                '<span style="color:#38bdf8; font-weight:900;">85%</span>' +
              '</div>' +
              '<div class="es-obs-progress-track">' +
                '<div class="es-obs-progress-fill" style="width:85%;"></div>' +
              '</div>' +
              '<div style="display:flex; justify-content:flex-end; margin-top:6px;">' +
                '<button type="button" class="es-pd-edit" data-ob="edit" style="font-size:0.72rem; color:#38bdf8; background:none; border:none; cursor:pointer; font-weight:700; padding:0;">✏️ Modifica Anagrafica</button>' +
              '</div>' +
            '</div>' +

            // Credenziali in grid compatta
            '<div class="es-obs-cred-grid">' +
              '<div class="es-obs-cred-item">' +
                '<span>Qualifica Ufficiale</span>' +
                '<b>' + esc(qual) + '</b>' +
              '</div>' +
              '<div class="es-obs-cred-item">' +
                '<span>Collegamento DS</span>' +
                '<b>' + (dsLinked ? 'Autorizzato dal DS' : 'Indipendente (No Club)') + '</b>' +
              '</div>' +
            '</div>' +
          '</section>' +

          // CARD 2: CENTRO OPERATIVO STEALTH SCOUTING
          '<section class="es-obs-card">' +
            '<div class="es-obs-card-head">' +
              '<h2 class="es-obs-card-title">' +
                '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' +
                '<span>Centro Operativo Stealth Scouting</span>' +
              '</h2>' +
              '<span class="es-obs-badge-tag emerald">100% Stealth Active</span>' +
            '</div>' +

            '<p class="es-obs-stealth-lead">' +
              'Monitori i talenti in modalità stealth certificata: le tue note, osservazioni e valutazioni sono completamente invisibili a calciatori, procuratori e club terzi finché non inoltri ufficialmente il dossier al Direttore Sportivo.' +
            '</p>' +

            '<div class="es-obs-kpi-grid">' +
              '<div class="es-obs-kpi-box">' +
                '<strong>' + secretCount + '</strong>' +
                '<span>In Secret List</span>' +
              '</div>' +
              '<div class="es-obs-kpi-box">' +
                '<strong>94%</strong>' +
                '<span>Precisione Valutazioni</span>' +
              '</div>' +
              '<div class="es-obs-kpi-box">' +
                '<strong>' + (on ? 'Attivo' : 'Libero') + '</strong>' +
                '<span>Canale DS Club</span>' +
              '</div>' +
            '</div>' +

            '<div class="es-obs-quick-actions">' +
              '<button type="button" class="es-obs-quick-btn" data-ob="secret">📂 Apri Secret List</button>' +
              '<button type="button" class="es-obs-quick-btn" data-ob="wall">🤝 Wall Trattative</button>' +
              '<button type="button" class="es-obs-quick-btn" data-ob="search">🔍 Ricerca Avanzata</button>' +
              '<button type="button" class="es-obs-quick-btn" data-ob="msgs">💬 Messaggi Staff</button>' +
            '</div>' +
          '</section>' +

        '</div>' + // Fine riga 1

        // 3. STRUMENTI OPERATIVI — AZIONI SCOUT (GRID A 3 COLONNE)
        '<section class="es-obs-card" style="padding:1.25rem 1.35rem;">' +
          '<div class="es-obs-card-head">' +
            '<h2 class="es-obs-card-title">' +
              '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>' +
              '<span>Strumenti Operativi — Azioni Possibili</span>' +
            '</h2>' +
            '<span class="es-obs-badge-tag cyan">Scouting Suite v3.0</span>' +
          '</div>' +

          '<div class="es-obs-actions-grid">' +
            '<button type="button" class="es-obs-action-card" data-ob="secret">' +
              '<div class="es-obs-action-icon">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' +
              '</div>' +
              '<div class="es-obs-action-text">' +
                '<b>Secret List Stealth</b>' +
                '<span>Monitora i calciatori senza inviare notifiche a terzi.</span>' +
              '</div>' +
            '</button>' +

            '<button type="button" class="es-obs-action-card" data-ob="secret">' +
              '<div class="es-obs-action-icon">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>' +
              '</div>' +
              '<div class="es-obs-action-text">' +
                '<b>Inoltra Target al DS</b>' +
                '<span>Invia la scheda direttamente nell\'area riservata del club.</span>' +
              '</div>' +
            '</button>' +

            '<button type="button" class="es-obs-action-card" data-ob="search">' +
              '<div class="es-obs-action-icon">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
              '</div>' +
              '<div class="es-obs-action-text">' +
                '<b>Ricerca &amp; Filtri Tattici</b>' +
                '<span>Filtra per città, regione, età, piede e metriche atletiche.</span>' +
              '</div>' +
            '</button>' +

            '<button type="button" class="es-obs-action-card" data-ob="wall">' +
              '<div class="es-obs-action-icon">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></svg>' +
              '</div>' +
              '<div class="es-obs-action-text">' +
                '<b>Wall Trasferimenti Ufficiali</b>' +
                '<span>Consulta tutti i movimenti di mercato conclusi e ratificati.</span>' +
              '</div>' +
            '</button>' +

            '<button type="button" class="es-obs-action-card" data-ob="search">' +
              '<div class="es-obs-action-icon">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' +
              '</div>' +
              '<div class="es-obs-action-text">' +
                '<b>Schede Tecniche IA</b>' +
                '<span>Analisi approfondite, attributi e potenziale di crescita.</span>' +
              '</div>' +
            '</button>' +

            '<button type="button" class="es-obs-action-card" data-ob="msgs">' +
              '<div class="es-obs-action-icon">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>' +
              '</div>' +
              '<div class="es-obs-action-text">' +
                '<b>Note Vocali in Testo</b>' +
                '<span>Registra appunti a bordocampo con trascrizione IA immediata.</span>' +
              '</div>' +
            '</button>' +
          '</div>' +
        '</section>' +

        // 4. RIGA ANALITICA (3 COLONNE: RADAR, PERMESSI, LIMITI DI RUOLO)
        '<div class="es-obs-grid-3col">' +

          // COLONNA 1: QUADRO SCOUTING (RADAR)
          '<section class="es-obs-card">' +
            '<div class="es-obs-card-head">' +
              '<h2 class="es-obs-card-title">' +
                '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/></svg>' +
                '<span>Quadro Scouting</span>' +
              '</h2>' +
              '<span class="es-obs-badge-tag cyan">Radar Operativo</span>' +
            '</div>' +
            '<div style="display:flex; justify-content:center; align-items:center; padding:0.5rem 0;">' +
              radarSvg() +
            '</div>' +
            '<div style="display:flex; justify-content:space-between; font-size:0.7rem; color:#94a3b8; border-top:1px solid rgba(148,163,184,0.08); padding-top:0.6rem; margin-top:auto;">' +
              '<span>Media Categoria: <b>78%</b></span>' +
              '<span style="color:#38bdf8;">Indice Personale: <b>90%</b></span>' +
            '</div>' +
          '</section>' +

          // COLONNA 2: ATTIVITÀ & PERMESSI ABILITATI
          '<section class="es-obs-card">' +
            '<div class="es-obs-card-head">' +
              '<h2 class="es-obs-card-title">' +
                '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>' +
                '<span>Attività &amp; Permessi</span>' +
              '</h2>' +
              '<span class="es-obs-badge-tag emerald">Abilitato</span>' +
            '</div>' +

            '<ul class="es-obs-checklist">' +
              '<li>' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' +
                '<span><b>Ricerca avanzata con filtri tattici</b> — Filtra per città, provincia, regione, età, ruolo e parametri atletici.</span>' +
              '</li>' +
              '<li>' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' +
                '<span><b>Schede in Secret List stealth</b> — Salvataggio profili con anagrafica, statistiche, heatmap e clip video.</span>' +
              '</li>' +
              '<li>' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' +
                '<span><b>Inoltro al Direttore Sportivo</b> — Generazione scheda tecnica con note personali visibile nell\'area riservata del DS.</span>' +
              '</li>' +
              '<li>' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' +
                '<span><b>Consultazione Wall Trasferimenti</b> — Monitoraggio continuo dei movimenti di mercato ratificati.</span>' +
              '</li>' +
            '</ul>' +
          '</section>' +

          // COLONNA 3: LIMITI DI RUOLO & COMPLIANCE (Rosso Tenue Luxury Desaturato)
          '<section class="es-obs-card es-obs-limits-card">' +
            '<div class="es-obs-card-head">' +
              '<h2 class="es-obs-card-title">' +
                '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fda4af" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' +
                '<span style="color:#fda4af;">Limiti di Ruolo &amp; Governance</span>' +
              '</h2>' +
              '<span class="es-obs-badge-tag rose">Compliance</span>' +
            '</div>' +

            '<ul class="es-obs-limits-list">' +
              '<li>' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>' +
                '<span><b>Nessuna pubblicazione annunci societari</b> — Riservato esclusivamente a Direttore Sportivo e Presidente.</span>' +
              '</li>' +
              '<li>' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>' +
                '<span><b>Nessuna chiusura trasferimenti</b> — Non puoi ratificare o chiudere ufficialmente accordi sul Wall.</span>' +
              '</li>' +
              '<li>' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>' +
                '<span><b>Inoltro subordinato al DS</b> — Senza contratto o autorizzazione del DS le schede non entrano nell\'area societaria.</span>' +
              '</li>' +
            '</ul>' +
          '</section>' +

        '</div>' + // Fine riga 3

        // 5. REGISTRO OSSERVAZIONI RECENTI (EMPTY-STATE PULITO)
        '<section class="es-obs-card">' +
          '<div class="es-obs-card-head">' +
            '<h2 class="es-obs-card-title">' +
              '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
              '<span>Registro Osservazioni &amp; Segnalazioni</span>' +
            '</h2>' +
            '<span class="es-obs-badge-tag cyan">Archivio Ufficiale</span>' +
          '</div>' +

          '<div class="es-obs-empty-wrap">' +
            '<div class="es-obs-empty-icon">' +
              '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>' +
            '</div>' +
            '<div class="es-obs-empty-title">Nessuna segnalazione registrata di recente</div>' +
            '<div class="es-obs-empty-sub">I calciatori monitorati e le relazioni tecniche vengono archiviati nella Secret List stealth. Da lì potrai inoltrarli direttamente al Direttore Sportivo.</div>' +
            '<div style="display:flex; gap:8px; margin-top:0.4rem;">' +
              '<button type="button" class="es-obs-btn-primary" data-ob="search" style="font-size:0.75rem; padding:0.45rem 0.85rem;">🔍 Cerca Nuovi Talenti</button>' +
              '<button type="button" class="es-obs-btn-secondary" data-ob="secret" style="font-size:0.75rem; padding:0.45rem 0.85rem;">📂 Apri Secret List</button>' +
            '</div>' +
          '</div>' +
        '</section>' +

      '</div>'; // Fine shell
  }

  function openObsEditModal(user) {
    user = user || userObj();
    var backdrop = document.createElement('div');
    backdrop.className = 'es-edit-modal-backdrop';
    var on = underContract(user);
    var qNow = qualificaOf(user);
    var qOpts = QUALS.map(function (q) {
      return '<option value="' + esc(q) + '"' + (qNow === q ? ' selected' : '') + '>' + esc(q) + '</option>';
    }).join('');
    if (qNow && QUALS.indexOf(qNow) < 0) {
      qOpts = '<option value="' + esc(qNow) + '" selected>' + esc(qNow) + '</option>' + qOpts;
    }

    backdrop.innerHTML = '<div class="es-edit-modal">' +
      '<div class="es-edit-modal-head">' +
      '<h2><span>✏️</span> Modifica Anagrafica Osservatore / Scout</h2>' +
      '<button type="button" class="es-edit-modal-close" title="Chiudi">&times;</button>' +
      '</div>' +
      '<div class="es-edit-grid">' +
      '<div class="es-edit-field"><label>Nome</label><input id="es-obs-nome" value="' + esc(user.nome || '') + '"></div>' +
      '<div class="es-edit-field"><label>Cognome</label><input id="es-obs-cognome" value="' + esc(user.cognome || '') + '"></div>' +
      '<div class="es-edit-field"><label>Ruolo Ufficiale</label><input id="es-obs-role" value="Osservatore / Scout" readonly></div>' +
      '<div class="es-edit-field"><label>Qualifica / certificazione</label><select id="es-obs-qual">' +
        '<option value="">— seleziona —</option>' + qOpts + '</select></div>' +
      '<div class="es-edit-field"><label>Status contrattuale</label><select id="es-obs-contract">' +
        '<option value="contract"' + (on ? ' selected' : '') + '>Under Contract (club)</option>' +
        '<option value="free"' + (!on ? ' selected' : '') + '>Free Agent / Indipendente</option>' +
      '</select></div>' +
      '<div class="es-edit-field"><label>Club / Organizzazione</label><input id="es-obs-club" value="' + esc(user.squadra || user.club || '') + '" placeholder="Vuoto = Osservatore Indipendente"></div>' +
      '<div class="es-edit-field"><label>Collegato a un DS in piattaforma</label><select id="es-obs-dslink">' +
        '<option value="0"' + (user.obsDsLink ? '' : ' selected') + '>No</option>' +
        '<option value="1"' + (user.obsDsLink ? ' selected' : '') + '>Sì, autorizzato dal DS</option>' +
      '</select></div>' +
      '<div class="es-edit-field full"><label>Bio &amp; Note Operative</label><textarea id="es-obs-bio" rows="3">' + esc(user.bio || '') + '</textarea></div>' +
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
      var n = document.getElementById('es-obs-nome').value.trim();
      var c = document.getElementById('es-obs-cognome').value.trim();
      var clb = document.getElementById('es-obs-club').value.trim();
      var bio = document.getElementById('es-obs-bio').value.trim();
      var qual = (document.getElementById('es-obs-qual') || {}).value || '';
      var ctr = (document.getElementById('es-obs-contract') || {}).value || 'free';
      var dsLink = (document.getElementById('es-obs-dslink') || {}).value === '1';
      if (ctr === 'contract' && !clb) {
        if (typeof window.showToast === 'function') {
          window.showToast('Under Contract richiede il club di appartenenza.', 'error');
        }
        return;
      }

      user.nome = n || user.nome;
      user.cognome = c || user.cognome;
      user.fullName = (user.nome + ' ' + user.cognome).trim();
      user.squadra = clb;
      user.club = clb;
      user.bio = bio;
      user.obsQualifica = qual;
      user.qualificaScout = qual;
      user.obsContract = ctr;
      user.contractStatus = ctr;
      user.obsDsLink = dsLink;

      try {
        localStorage.setItem('elisee_active_user', JSON.stringify(user));
        localStorage.setItem('elisee_user_data', JSON.stringify(user));
      } catch (_) {}

      close();
      if (typeof window.showToast === 'function') {
        window.showToast('Anagrafica Osservatore / Scout salvata con successo!', 'success');
      }
      render(user);
    });
  }

  function bind(host) {
    if (!host || host.dataset.obBound === '1') return;
    host.dataset.obBound = '1';
    host.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ob], [data-obs]');
      if (!b) return;
      var k = b.getAttribute('data-ob') || b.getAttribute('data-obs');
      if (k === 'home' && window.switchView) window.switchView('home', '#hero');
      if (k === 'dash' && window.switchView) window.switchView('user-dossier', '#user-dossier-portal');
      if (k === 'secret' && window.openSecretList) window.openSecretList();
      if (k === 'wall' && window.openTransferWall) window.openTransferWall();
      if (k === 'search' && window.switchView) window.switchView('scopri', '#scopri-profili');
      if (k === 'msgs' && window.openUserMessages) window.openUserMessages();
      if (k === 'edit') {
        openObsEditModal(userObj());
      }
    });
  }

  function render(user) {
    user = user || userObj();
    if (!isObs(user)) return;
    hideOthers();
    var host = document.getElementById('es-staff-profile');
    var group = document.getElementById('user-dossier-view-group');
    if (!host) return;

    var box = document.getElementById('es-od');
    if (!box) {
      box = document.createElement('div');
      box.id = 'es-od';
      box.className = 'es-pd';
      host.insertBefore(box, host.firstChild);
    }
    box.innerHTML = html(user);
    box.hidden = false;
    box.removeAttribute('hidden');
    box.style.display = 'grid';

    host.classList.add('es-obs-on');
    host.classList.remove('es-pd-on', 'es-ds-on', 'es-pres-on', 'es-vice-on', 'es-fisio-on', 'es-ma-on', 'es-med-on', 'es-tm-on', 'es-gk-on', 'es-at-on', 'es-yg-on');

    if (group) {
      group.classList.add('is-obs-dash');
      group.classList.remove('is-coach-dash', 'is-ds-dash', 'is-pres-dash', 'is-vice-dash', 'is-fisio-dash', 'is-ma-dash', 'is-med-dash', 'is-tm-dash', 'is-gk-dash', 'is-at-dash', 'is-yg-dash');
    }
    bind(host);
  }

  window.EliseeObsDash = {
    render: render,
    isObs: isObs,
    underContract: underContract,
    qualificaOf: qualificaOf
  };

  document.addEventListener('elisee:view-changed', function (e) {
    var d = e && e.detail;
    if (d && d.view === 'user-dossier') {
      try {
        var u = userObj();
        if (isObs(u)) render(u);
      } catch (_) {}
    }
  });

  document.addEventListener('elisee:role-changed', function (e) {
    var d = e && e.detail;
    try {
      var u = (d && d.user) || userObj();
      if (isObs(u)) render(u);
    } catch (_) {}
  });
})();
