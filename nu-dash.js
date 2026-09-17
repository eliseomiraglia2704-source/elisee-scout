/* ============================================================
   ELISEE SCOUT — DASHBOARD NUTRIZIONISTA & COMPOSIZIONE CORPOREA (JS)
   Layout Professionale B2B — Sports Nutrition & Body Comp OS
   ============================================================ */
(function () {
  'use strict';

  var NU_DIETS_KEY = 'elisee_nu_diets_history';

  var AXES = [
    'Composizione Corporea / BIA', 'Timing Glucidico & Carb Loading', 'Idratazione Match-Day', 'Integrazione WADA Compliant',
    'Nutrizione Pre & Post Gara', 'Gestione Ritiro / Trasferte', 'Plicometria & Piani Personalizzati', 'Coordinamento Staff Atletico'
  ];
  var V2025 = [96, 94, 93, 97, 95, 91, 95, 94];
  var V2023 = [82, 80, 78, 85, 81, 75, 80, 81];

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

  function isNutrizionista(u) {
    u = u || userObj();
    var blob = String(u.staffRole || u.ruoloDettagliato || (u.staffProfile && u.staffProfile.fieldRole) || u.ruolo || u.role || '').trim().toLowerCase();
    return /nutri|diet|dietista|biologo nutrizionista/.test(blob);
  }

  function nuName(u) {
    return [u.nome, u.cognome].filter(Boolean).join(' ').trim() || u.username || 'Dott. Biologo Nutrizionista';
  }

  function initials(name) {
    var p = String(name || 'NU').trim().split(/\s+/);
    return ((p[0] || 'N').charAt(0) + (p[1] || p[0] || 'U').charAt(0)).toUpperCase();
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
    var html = '<svg viewBox="0 0 440 430" style="width:100%; height:auto; max-height:320px;" role="img" aria-label="Analisi nutrizionale e composizione corporea">';
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
      window.unmountAllRoleDashboards('es-nu');
    }
  }

  function toast(msg, kind) {
    if (typeof window.showToast === 'function') window.showToast(msg, kind || 'success');
  }

  function inStaff(u) {
    u = u || userObj();
    var st = String(u.contractStatus || '').toLowerCase();
    if (st === 'free agent' || st === 'free' || st === 'consulente') return false;
    return !!(u.squadra || u.club);
  }

  function qualificaOf(u) {
    return String((u && (u.abilitazione || u.specializzazione || u.certificazione)) || '').trim() || 'Biologo Nutrizionista dello Sport / ONB';
  }

  function html(user) {
    user = user || userObj();
    var name = nuName(user);
    var ph = photoOf(user);
    var initText = esc(initials(name));
    var on = inStaff(user);
    var club = String(user.squadra || user.club || '').trim();
    var qual = qualificaOf(user);

    var avaHtml;
    if (ph && ph.length > 5 && !/simulated|null|undefined/i.test(ph)) {
      avaHtml = '<img src="' + esc(ph) + '" alt="" class="es-nu-avatar" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\';">' +
        '<div class="es-nu-avatar-fallback" style="display:none;">' + initText + '</div>';
    } else {
      avaHtml = '<div class="es-nu-avatar-fallback">' + initText + '</div>';
    }

    var statusBadge = on
      ? '<span class="es-nu-badge-tag cyan">In Staff Club</span>'
      : '<span class="es-nu-badge-tag emerald">Nutrizionista Indipendente</span>';

    var clubDisplay = club
      ? '<span style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:flex; align-items:center; gap:4px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' + esc(club) + '</span>'
      : '<span style="font-size:0.75rem; color:#94a3b8; font-weight:500;">Consulente Nutrizionale Sportivo</span>';

    return '' +
      // DOCK LATERALE SINISTRO
      '<aside class="es-pd-rail">' +
        '<button type="button" data-nu="home" title="Home">' + ico('<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>') + '</button>' +
        '<button type="button" class="is-on" data-nu="dash" title="Dashboard">' + ico('<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>') + '</button>' +
        '<button type="button" data-nu-act="new-diet" title="Nuovo Piano">' + ico('<path d="M12 2a10 10 0 1 0 10 10H12V2z"/>') + '</button>' +
        '<button type="button" data-nu-act="bia-test" title="BIA &amp; Plicometria">' + ico('<path d="M3 6h18M6 6V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>') + '</button>' +
        '<button type="button" data-nu="msgs" title="Messaggi Staff">' + ico('<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>') + '</button>' +
        '<button type="button" class="es-pd-rail-end" data-nu="edit" title="Modifica Anagrafica">' + ico('<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>') + '</button>' +
      '</aside>' +

      // SHELL PRINCIPALE
      '<div class="es-nu-shell">' +

        // 1. TOP HEADER BAR
        '<div class="es-nu-header-bar">' +
          '<div class="es-nu-title-wrap">' +
            '<div class="es-nu-breadcrumb">Elisee Scout &rsaquo; Area Riservata Professionale &rsaquo; Performance Nutrizionale &amp; Staff</div>' +
            '<h1>Dashboard Nutrizionista &amp; Performance Alimentare</h1>' +
          '</div>' +
          '<div class="es-nu-header-actions">' +
            '<button type="button" class="es-nu-btn-secondary" data-nu-act="bia-test">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M6 6V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>' +
              '<span>Registra BIA / Plicometria</span>' +
            '</button>' +
            '<button type="button" class="es-nu-btn-primary" data-nu-act="new-diet">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
              '<span>Nuovo Piano Alimentare</span>' +
            '</button>' +
          '</div>' +
        '</div>' +

        // 2. RIGA SUPERIORE (2 COLONNE: PROFILO & MONITORAGGIO NUTRIZIONALE)
        '<div class="es-nu-grid-2col">' +

          // CARD 1: PROFILO NUTRIZIONISTA
          '<section class="es-nu-card">' +
            '<div class="es-nu-card-head">' +
              '<h2 class="es-nu-card-title">' +
                '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
                '<span>Profilo Nutrizionale Ufficiale</span>' +
              '</h2>' +
              '<div style="display:flex; gap:6px; align-items:center;">' +
                '<span class="es-nu-badge-tag cyan">Albo ONB</span>' +
                statusBadge +
              '</div>' +
            '</div>' +

            '<div class="es-nu-profile-row">' +
              avaHtml +
              '<div class="es-nu-user-meta">' +
                '<b class="es-nu-user-name">' + esc(name) + '</b>' +
                '<div class="es-nu-user-badges">' +
                  '<span style="font-size:0.72rem; color:#38bdf8; background:rgba(56,189,248,0.12); border:1px solid rgba(56,189,248,0.28); border-radius:4px; padding:2px 6px; font-weight:800; text-transform:uppercase;">Biologo Nutrizionista</span>' +
                  clubDisplay +
                '</div>' +
              '</div>' +
            '</div>' +

            // Barra di completamento anagrafica
            '<div class="es-nu-onboarding-bar-box">' +
              '<div class="es-nu-onboarding-label-row">' +
                '<span>Completamento Anagrafica &amp; Iscrizione Albo</span>' +
                '<span style="color:#38bdf8; font-weight:900;">85%</span>' +
              '</div>' +
              '<div class="es-nu-progress-track">' +
                '<div class="es-nu-progress-fill" style="width:85%;"></div>' +
              '</div>' +
              '<div style="display:flex; justify-content:flex-end; margin-top:6px;">' +
                '<button type="button" class="es-pd-edit" data-nu="edit" style="font-size:0.72rem; color:#38bdf8; background:none; border:none; cursor:pointer; font-weight:700; padding:0;">✏️ Modifica Anagrafica</button>' +
              '</div>' +
            '</div>' +

            // Credenziali in grid compatta
            '<div class="es-nu-cred-grid">' +
              '<div class="es-nu-cred-item">' +
                '<span>Specializzazione</span>' +
                '<b>' + esc(qual) + '</b>' +
              '</div>' +
              '<div class="es-nu-cred-item">' +
                '<span>Coordinamento Tecnico</span>' +
                '<b>' + (on ? 'In Staff con Medico e Preparatore' : 'Consulente Esterno') + '</b>' +
              '</div>' +
            '</div>' +
          '</section>' +

          // CARD 2: MONITORAGGIO NUTRIZIONALE & COMPOSIZIONE CORPOREA ROSA
          '<section class="es-nu-card">' +
            '<div class="es-nu-card-head">' +
              '<h2 class="es-nu-card-title">' +
                '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/></svg>' +
                '<span>Composizione Corporea &amp; Rosa BIA</span>' +
              '</h2>' +
              '<span class="es-nu-badge-tag emerald">Target Peso 100%</span>' +
            '</div>' +

            '<div class="es-nu-stats-grid">' +
              '<div class="es-nu-stat-box"><strong style="color:#4ade80;">9.4%</strong><span>Massa Grassa Rosa 🟢</span></div>' +
              '<div class="es-nu-stat-box"><strong style="color:#38bdf8;">78.2%</strong><span>Massa Magra (FFM) 🟢</span></div>' +
              '<div class="es-nu-stat-box"><strong>64.5%</strong><span>Idratazione Media (TBW)</span></div>' +
              '<div class="es-nu-stat-box"><strong style="color:#4ade80;">24 / 24</strong><span>Piani Attivi Rosa</span></div>' +
              '<div class="es-nu-stat-box"><strong style="color:#4ade80;">0</strong><span>Carenze Elettrolitiche</span></div>' +
              '<div class="es-nu-stat-box"><strong>100%</strong><span>WADA Compliant</span></div>' +
            '</div>' +

            '<div class="es-nu-quick-actions">' +
              '<button type="button" class="es-nu-quick-btn" data-nu-act="new-diet">🥗 Nuovo Piano</button>' +
              '<button type="button" class="es-nu-quick-btn" data-nu-act="bia-test">⚖️ Test BIA / Plico</button>' +
              '<button type="button" class="es-nu-quick-btn" data-nu-act="hydration">💧 Idratazione Match</button>' +
              '<button type="button" class="es-nu-quick-btn" data-nu-act="menu-hotel">🏨 Menu Trasferta</button>' +
            '</div>' +
          '</section>' +

        '</div>' + // Fine riga 1

        // 3. STRUMENTI OPERATIVI — AZIONI NUTRIZIONISTA (GRID A 3 COLONNE)
        '<section class="es-nu-card" style="padding:1.25rem 1.35rem;">' +
          '<div class="es-nu-card-head">' +
            '<h2 class="es-nu-card-title">' +
              '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>' +
              '<span>Strumenti Operativi — Azioni Nutrizionista</span>' +
            '</h2>' +
            '<span class="es-nu-badge-tag cyan">Nutrition Suite v3.0</span>' +
          '</div>' +

          '<div class="es-nu-actions-grid">' +
            '<button type="button" class="es-nu-action-card" data-nu-act="new-diet">' +
              '<div class="es-nu-action-icon">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/></svg>' +
              '</div>' +
              '<div class="es-nu-action-text">' +
                '<b>Crea Piano Alimentare</b>' +
                '<span>Fabbisogno energetico, macronutrienti e carichi di lavoro.</span>' +
              '</div>' +
            '</button>' +

            '<button type="button" class="es-nu-action-card" data-nu-act="bia-test">' +
              '<div class="es-nu-action-icon">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M6 6V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>' +
              '</div>' +
              '<div class="es-nu-action-text">' +
                '<b>Esame BIA &amp; Plicometria</b>' +
                '<span>Monitoraggio massa magra, massa grassa e idratazione.</span>' +
              '</div>' +
            '</button>' +

            '<button type="button" class="es-nu-action-card" data-nu-act="hydration">' +
              '<div class="es-nu-action-icon">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>' +
              '</div>' +
              '<div class="es-nu-action-text">' +
                '<b>Protocollo Idratazione Match</b>' +
                '<span>Strategia pre-gara, carboidrati intervallo e recovery drink.</span>' +
              '</div>' +
            '</button>' +

            '<button type="button" class="es-nu-action-card" data-nu-act="supplements">' +
              '<div class="es-nu-action-icon">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.5 20.5 3 13a9 9 0 0 1 12.73-12.73l7.5 7.5a9 9 0 0 1-12.73 12.73Z"/></svg>' +
              '</div>' +
              '<div class="es-nu-action-text">' +
                '<b>Integrazione Certificata WADA</b>' +
                '<span>Piani integrativi controllati conformi alle norme antidoping.</span>' +
              '</div>' +
            '</button>' +

            '<button type="button" class="es-nu-action-card" data-nu-act="menu-hotel">' +
              '<div class="es-nu-action-icon">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>' +
              '</div>' +
              '<div class="es-nu-action-text">' +
                '<b>Pianificazione Menu Trasferta</b>' +
                '<span>Linee guida per hotel, catering e nutrizione da viaggio.</span>' +
              '</div>' +
            '</button>' +

            '<button type="button" class="es-nu-action-card" data-nu-act="send-diet-report">' +
              '<div class="es-nu-action-icon">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>' +
              '</div>' +
              '<div class="es-nu-action-text">' +
                '<b>Report Nutrizionale allo Staff</b>' +
                '<span>Condivisione dati con Preparatore Atletico e Medico Sociale.</span>' +
              '</div>' +
            '</button>' +
          '</div>' +
        '</section>' +

        // 4. RIGA ANALITICA (3 COLONNE: RADAR, PROTOCOLLI, LIMITI DI RUOLO)
        '<div class="es-nu-grid-3col">' +

          // COLONNA 1: QUADRO NUTRIZIONALE ROSA (RADAR)
          '<section class="es-nu-card">' +
            '<div class="es-nu-card-head">' +
              '<h2 class="es-nu-card-title">' +
                '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/></svg>' +
                '<span>Quadro Nutrizionale</span>' +
              '</h2>' +
              '<span class="es-nu-badge-tag cyan">Radar Dieta</span>' +
            '</div>' +
            '<div style="display:flex; justify-content:center; align-items:center; padding:0.5rem 0;">' +
              radarSvg() +
            '</div>' +
            '<div style="display:flex; justify-content:space-between; font-size:0.7rem; color:#94a3b8; border-top:1px solid rgba(148,163,184,0.08); padding-top:0.6rem; margin-top:auto;">' +
              '<span>Media Benchmark Professionisti: <b>80%</b></span>' +
              '<span style="color:#38bdf8;">Indice Nutrizionale Rosa: <b>95%</b></span>' +
            '</div>' +
          '</section>' +

          // COLONNA 2: PROTOCOLLI & METODOLOGIA SCIENTIFICA
          '<section class="es-nu-card">' +
            '<div class="es-nu-card-head">' +
              '<h2 class="es-nu-card-title">' +
                '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>' +
                '<span>Protocolli Scientifici</span>' +
              '</h2>' +
              '<span class="es-nu-badge-tag emerald">Attivo</span>' +
            '</div>' +

            '<ul class="es-nu-checklist">' +
              '<li>' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' +
                '<span><b>Bioimpedenziometria (BIA) vettoriale</b> — analisi idratazione intra ed extracellulare.</span>' +
              '</li>' +
              '<li>' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' +
                '<span><b>Carb loading pre-gara</b> — saturazione delle riserve di glicogeno muscolare 24-36h prima.</span>' +
              '</li>' +
              '<li>' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' +
                '<span><b>Integrazione certificata Informed-Sport</b> — creatina, beta-alanina e sali a zero contaminanti.</span>' +
              '</li>' +
              '<li>' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' +
                '<span><b>Finestra anabolica recovery</b> — apporto 3:1 carbo/proteine entro 30 min dal triplice fischio.</span>' +
              '</li>' +
            '</ul>' +
          '</section>' +

          // COLONNA 3: LIMITI DI RUOLO & DEONTOLOGIA (Rosso Tenue Luxury Desaturato)
          '<section class="es-nu-card es-nu-limits-card">' +
            '<div class="es-nu-card-head">' +
              '<h2 class="es-nu-card-title">' +
                '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fda4af" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' +
                '<span style="color:#fda4af;">Limiti di Ruolo &amp; Deontologia</span>' +
              '</h2>' +
              '<span class="es-nu-badge-tag rose">Compliance</span>' +
            '</div>' +

            '<ul class="es-nu-limits-list">' +
              '<li>' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>' +
                '<span><b>Nessuna prescrizione farmacologica</b> — Riservato esclusivamente al Medico Sociale.</span>' +
              '</li>' +
              '<li>' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>' +
                '<span><b>Nessuna sostanza non certificata WADA</b> — Tolleranza zero per il rischio contaminazione.</span>' +
              '</li>' +
              '<li>' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>' +
                '<span><b>Nessuna modifica della rosa</b> — Riservato alla Direzione Sportiva e alla Presidenza.</span>' +
              '</li>' +
            '</ul>' +
          '</section>' +

        '</div>' + // Fine riga 3

        // 5. REGISTRO PIANI ALIMENTARI & CHECK CORPOREI (EMPTY STATE VISUALE)
        '<section class="es-nu-card">' +
          '<div class="es-nu-card-head">' +
            '<h2 class="es-nu-card-title">' +
              '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
              '<span>Registro Piani Alimentari &amp; Misurazioni Recenti</span>' +
            '</h2>' +
            '<span class="es-nu-badge-tag cyan">Archivio Nutrizione</span>' +
          '</div>' +

          '<div class="es-nu-empty-wrap">' +
            '<div class="es-nu-empty-icon">' +
              '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/></svg>' +
            '</div>' +
            '<div class="es-nu-empty-title">Nessun piano o misurazione registrata di recente</div>' +
            '<div class="es-nu-empty-sub">Crea un nuovo piano alimentare personalizzato o registra un esame BIA per monitorare lo stato di forma della rosa.</div>' +
            '<div style="display:flex; gap:8px; margin-top:0.4rem;">' +
              '<button type="button" class="es-nu-btn-primary" data-nu-act="new-diet" style="font-size:0.75rem; padding:0.45rem 0.85rem;">+ Nuovo Piano Alimentare</button>' +
              '<button type="button" class="es-nu-btn-secondary" data-nu-act="bia-test" style="font-size:0.75rem; padding:0.45rem 0.85rem;">⚖️ Registra BIA</button>' +
            '</div>' +
          '</div>' +
        '</section>' +

      '</div>'; // Fine shell
  }

  function openNuEditModal(user) {
    user = user || userObj();
    var backdrop = document.createElement('div');
    backdrop.className = 'es-edit-modal-backdrop';

    backdrop.innerHTML = '<div class="es-edit-modal">' +
      '<div class="es-edit-modal-head">' +
      '<h2><span>✏️</span> Modifica Anagrafica Nutrizionista</h2>' +
      '<button type="button" class="es-edit-modal-close" title="Chiudi">&times;</button>' +
      '</div>' +
      '<div class="es-edit-grid">' +
      '<div class="es-edit-field"><label>Nome</label><input id="es-nu-nome" value="' + esc(user.nome || '') + '"></div>' +
      '<div class="es-edit-field"><label>Cognome</label><input id="es-nu-cognome" value="' + esc(user.cognome || '') + '"></div>' +
      '<div class="es-edit-field"><label>Specializzazione / Albo</label><input id="es-nu-qual" value="' + esc(user.abilitazione || 'Biologo Nutrizionista dello Sport / ONB') + '"></div>' +
      '<div class="es-edit-field"><label>Ruolo Ufficiale</label><input id="es-nu-role" value="Biologo Nutrizionista dello Sport" readonly></div>' +
      '<div class="es-edit-field"><label>Club / Organizzazione</label><input id="es-nu-club" value="' + esc(user.squadra || user.club || '') + '" placeholder="Vuoto = Consulente Indipendente"></div>' +
      '<div class="es-edit-field"><label>Status Contrattuale</label><select id="es-nu-status">' +
      '<option value="In Staff Club"' + (inStaff(user) ? ' selected' : '') + '>In Staff Club (Collegato allo Staff Medico)</option>' +
      '<option value="Free Agent"' + (!inStaff(user) ? ' selected' : '') + '>Consulente Nutrizionale Esterno</option>' +
      '</select></div>' +
      '<div class="es-edit-field full"><label>Linee Guida &amp; Note Operative</label><textarea id="es-nu-bio" rows="3">' + esc(user.bio || '') + '</textarea></div>' +
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
      var n = document.getElementById('es-nu-nome').value.trim();
      var c = document.getElementById('es-nu-cognome').value.trim();
      var q = document.getElementById('es-nu-qual').value.trim();
      var clb = document.getElementById('es-nu-club').value.trim();
      var st = document.getElementById('es-nu-status').value;
      var bio = document.getElementById('es-nu-bio').value.trim();

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
      toast('Anagrafica Nutrizionista salvata con successo!', 'success');
      render(user);
    });
  }

  function bind(host) {
    if (!host || host.dataset.nuBound === '1') return;
    host.dataset.nuBound = '1';
    host.addEventListener('click', function (e) {
      var b = e.target.closest('[data-nu], [data-nu-act]');
      if (!b) return;
      var k = b.getAttribute('data-nu');
      var act = b.getAttribute('data-nu-act');

      if (k === 'home' && window.switchView) window.switchView('home', '#hero');
      if (k === 'dash' && window.switchView) window.switchView('user-dossier', '#user-dossier-portal');
      if (k === 'msgs' && window.openUserMessages) window.openUserMessages();
      if (k === 'edit') openNuEditModal(userObj());

      if (act === 'new-diet') {
        var ath = window.prompt('Nome e cognome dell\'atleta per il nuovo piano alimentare:');
        if (ath) {
          var cal = window.prompt('Target calorico giornaliero stimato (es. 2850 kcal / match-day 3400 kcal):', '3000 kcal');
          if (cal) {
            toast('Piano alimentare personalizzato da ' + cal + ' assegnato a ' + ath + '!', 'success');
          }
        }
      }
      if (act === 'bia-test') {
        var athB = window.prompt('Nome e cognome dell\'atleta per il test BIA / plicometria:');
        if (athB) {
          var fm = window.prompt('Percentuale di massa grassa misurata (% FM):', '9.2%');
          if (fm) {
            toast('Misurazione BIA registrata per ' + athB + ' (' + fm + ' FM). Dati archiviati.', 'success');
          }
        }
      }
      if (act === 'hydration') {
        toast('💧 Protocollo idratazione match-day e reintegro salino distribuito alla rosa.', 'success');
      }
      if (act === 'supplements') {
        toast('💊 Piano integrazione certificato WADA / Informed-Sport aggiornato.', 'success');
      }
      if (act === 'menu-hotel') {
        toast('🏨 Linee guida nutrizionali e menu trasferta inviati all\'hotel del ritiro.', 'success');
      }
      if (act === 'send-diet-report') {
        toast('📋 Report nutrizionale e stato BIA inoltrato al Preparatore Atletico e al Medico!', 'success');
      }
    });
  }

  function render(user) {
    user = user || userObj();
    if (!isNutrizionista(user)) return;
    hideOthers();
    var host = document.getElementById('es-staff-profile');
    var group = document.getElementById('user-dossier-view-group');
    if (!host) return;

    var box = document.getElementById('es-nu');
    if (!box) {
      box = document.createElement('div');
      box.id = 'es-nu';
      box.className = 'es-pd';
      host.insertBefore(box, host.firstChild);
    }
    box.innerHTML = html(user);
    box.hidden = false;
    box.removeAttribute('hidden');
    box.style.display = 'grid';

    host.classList.add('es-nu-on');
    host.classList.remove('es-pd-on', 'es-ds-on', 'es-pres-on', 'es-vice-on', 'es-med-on', 'es-fisio-on', 'es-ma-on', 'es-obs-on', 'es-tm-on', 'es-gk-on', 'es-at-on', 'es-yg-on');

    if (group) {
      group.classList.add('is-nu-dash');
      group.classList.remove('is-coach-dash', 'is-ds-dash', 'is-pres-dash', 'is-vice-dash', 'is-med-dash', 'is-fisio-dash', 'is-ma-dash', 'is-obs-dash', 'is-tm-dash', 'is-gk-dash', 'is-at-dash', 'is-yg-dash');
    }
    bind(host);
  }

  window.EliseeNuDash = { render: render, isNutrizionista: isNutrizionista };

  document.addEventListener('elisee:view-changed', function (e) {
    var d = e && e.detail;
    if (d && d.view === 'user-dossier') {
      try {
        var u = userObj();
        if (isNutrizionista(u)) render(u);
      } catch (_) {}
    }
  });

  document.addEventListener('elisee:role-changed', function (e) {
    var d = e && e.detail;
    try {
      var u = (d && d.user) || userObj();
      if (isNutrizionista(u)) render(u);
    } catch (_) {}
  });
})();
