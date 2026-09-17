/* ============================================================
   ELISEE SCOUT — DASHBOARD MEDICO SOCIALE & STAFF SANITARIO (JS)
   Layout Professionale B2B — Medical & Health Intelligence OS
   ============================================================ */
(function () {
  'use strict';

  var MED_VISITS_KEY = 'elisee_med_visits_history';

  var AXES = [
    'Idoneità Agonistiche', 'Prevenzione Traumi', 'Cartella Clinica Rosa', 'Monitoraggio Tempi Recupero',
    'Pronto Soccorso Campo', 'Nutrizione & Integrazione', 'Diagnostica / Ecografie', 'Coordinamento Staff Sanitario'
  ];
  var V2025 = [96, 92, 94, 90, 95, 88, 91, 93];
  var V2023 = [82, 79, 81, 76, 84, 75, 78, 80];

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

  function isMedico(u) {
    u = u || userObj();
    var blob = String(u.staffRole || u.ruoloDettagliato || (u.staffProfile && u.staffProfile.fieldRole) || u.ruolo || u.role || '').trim().toLowerCase();
    return /medico|sanitari|dottor|medico sociale|responsabile sanitario|medico dello sport/.test(blob);
  }

  function medName(u) {
    return [u.nome, u.cognome].filter(Boolean).join(' ').trim() || u.username || 'Dott. Medico Sociale';
  }

  function initials(name) {
    var p = String(name || 'MD').trim().split(/\s+/);
    return ((p[0] || 'M').charAt(0) + (p[1] || p[0] || 'D').charAt(0)).toUpperCase();
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
    var html = '<svg viewBox="0 0 440 430" style="width:100%; height:auto; max-height:320px;" role="img" aria-label="Analisi competenze e monitoraggio sanitario">';
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
      window.unmountAllRoleDashboards('es-md');
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
    return String((u && (u.abilitazione || u.specializzazione || u.certificazione)) || '').trim() || 'Specialista in Medicina dello Sport / FMSI';
  }

  function html(user) {
    user = user || userObj();
    var name = medName(user);
    var ph = photoOf(user);
    var initText = esc(initials(name));
    var on = inStaff(user);
    var club = String(user.squadra || user.club || '').trim();
    var qual = qualificaOf(user);

    var avaHtml;
    if (ph && ph.length > 5 && !/simulated|null|undefined/i.test(ph)) {
      avaHtml = '<img src="' + esc(ph) + '" alt="" class="es-med-avatar" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\';">' +
        '<div class="es-med-avatar-fallback" style="display:none;">' + initText + '</div>';
    } else {
      avaHtml = '<div class="es-med-avatar-fallback">' + initText + '</div>';
    }

    var statusBadge = on
      ? '<span class="es-med-badge-tag cyan">In Staff Club</span>'
      : '<span class="es-med-badge-tag emerald">Consulente Sanitario</span>';

    var clubDisplay = club
      ? '<span style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:flex; align-items:center; gap:4px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' + esc(club) + '</span>'
      : '<span style="font-size:0.75rem; color:#94a3b8; font-weight:500;">Medico Specialista Indipendente</span>';

    return '' +
      // DOCK LATERALE SINISTRO
      '<aside class="es-pd-rail">' +
        '<button type="button" data-md="home" title="Home">' + ico('<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>') + '</button>' +
        '<button type="button" class="is-on" data-md="dash" title="Dashboard">' + ico('<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>') + '</button>' +
        '<button type="button" data-md-act="new-visit" title="Nuova Visita Medica">' + ico('<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>') + '</button>' +
        '<button type="button" data-md-act="certify-fit" title="Certificati Idoneità">' + ico('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>') + '</button>' +
        '<button type="button" data-md="msgs" title="Messaggi Staff">' + ico('<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>') + '</button>' +
        '<button type="button" class="es-pd-rail-end" data-md="edit" title="Modifica Anagrafica">' + ico('<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>') + '</button>' +
      '</aside>' +

      // SHELL PRINCIPALE
      '<div class="es-med-shell">' +

        // 1. TOP HEADER BAR
        '<div class="es-med-header-bar">' +
          '<div class="es-med-title-wrap">' +
            '<div class="es-med-breadcrumb">Elisee Scout &rsaquo; Area Riservata Professionale &rsaquo; Staff Sanitario &amp; Medico Sociale</div>' +
            '<h1>Dashboard Medico Sociale &amp; Staff Sanitario</h1>' +
          '</div>' +
          '<div class="es-med-header-actions">' +
            '<button type="button" class="es-med-btn-secondary" data-md-act="certify-fit">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>' +
              '<span>Certifica Idoneità Agonistica</span>' +
            '</button>' +
            '<button type="button" class="es-med-btn-primary" data-md-act="new-visit">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
              '<span>Nuova Visita Medica</span>' +
            '</button>' +
          '</div>' +
        '</div>' +

        // 2. RIGA SUPERIORE (2 COLONNE: PROFILO & MONITORAGGIO SANITARIO)
        '<div class="es-med-grid-2col">' +

          // CARD 1: PROFILO MEDICO SOCIALE
          '<section class="es-med-card">' +
            '<div class="es-med-card-head">' +
              '<h2 class="es-med-card-title">' +
                '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
                '<span>Profilo Medico Ufficiale</span>' +
              '</h2>' +
              '<div style="display:flex; gap:6px; align-items:center;">' +
                '<span class="es-med-badge-tag cyan">FMSI / Ordine Medici</span>' +
                statusBadge +
              '</div>' +
            '</div>' +

            '<div class="es-med-profile-row">' +
              avaHtml +
              '<div class="es-med-user-meta">' +
                '<b class="es-med-user-name">' + esc(name) + '</b>' +
                '<div class="es-med-user-badges">' +
                  '<span style="font-size:0.72rem; color:#38bdf8; background:rgba(56,189,248,0.12); border:1px solid rgba(56,189,248,0.28); border-radius:4px; padding:2px 6px; font-weight:800; text-transform:uppercase;">Medico Sociale</span>' +
                  clubDisplay +
                '</div>' +
              '</div>' +
            '</div>' +

            // Barra di completamento anagrafica
            '<div class="es-med-onboarding-bar-box">' +
              '<div class="es-med-onboarding-label-row">' +
                '<span>Completamento Anagrafica &amp; Iscrizione Albo</span>' +
                '<span style="color:#38bdf8; font-weight:900;">85%</span>' +
              '</div>' +
              '<div class="es-med-progress-track">' +
                '<div class="es-med-progress-fill" style="width:85%;"></div>' +
              '</div>' +
              '<div style="display:flex; justify-content:flex-end; margin-top:6px;">' +
                '<button type="button" class="es-pd-edit" data-md="edit" style="font-size:0.72rem; color:#38bdf8; background:none; border:none; cursor:pointer; font-weight:700; padding:0;">✏️ Modifica Anagrafica</button>' +
              '</div>' +
            '</div>' +

            // Credenziali in grid compatta
            '<div class="es-med-cred-grid">' +
              '<div class="es-med-cred-item">' +
                '<span>Specializzazione</span>' +
                '<b>' + esc(qual) + '</b>' +
              '</div>' +
              '<div class="es-med-cred-item">' +
                '<span>Inquadramento Sanitario</span>' +
                '<b>' + (on ? 'Responsabile Sanitario Club' : 'Consulente Medico Esterno') + '</b>' +
              '</div>' +
            '</div>' +
          '</section>' +

          // CARD 2: STATISTICHE SANITARIE & IDONEITÀ AGONISTICA
          '<section class="es-med-card">' +
            '<div class="es-med-card-head">' +
              '<h2 class="es-med-card-title">' +
                '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>' +
                '<span>Monitoraggio Idoneità &amp; Cartelle Cliniche</span>' +
              '</h2>' +
              '<span class="es-med-badge-tag emerald">Rosa 100% Idonea</span>' +
            '</div>' +

            '<div class="es-med-stats-grid">' +
              '<div class="es-med-stat-box"><strong style="color:#4ade80;">24</strong><span>Idoneità Valide 🟢</span></div>' +
              '<div class="es-med-stat-box"><strong style="color:#facc15;">0</strong><span>In Scadenza (30gg) 🟡</span></div>' +
              '<div class="es-med-stat-box"><strong style="color:#f87171;">0</strong><span>Non Idonei / Sospesi 🔴</span></div>' +
              '<div class="es-med-stat-box"><strong style="color:#38bdf8;">1</strong><span>In Terapia Conservativa</span></div>' +
              '<div class="es-med-stat-box"><strong style="color:#4ade80;">22</strong><span>Piena Disponibilità</span></div>' +
              '<div class="es-med-stat-box"><strong>0</strong><span>Interventi Chirurgici</span></div>' +
            '</div>' +

            '<div class="es-med-quick-actions">' +
              '<button type="button" class="es-med-quick-btn" data-md-act="new-visit">🩺 Nuova Visita</button>' +
              '<button type="button" class="es-med-quick-btn" data-md-act="certify-fit">📋 Certifica Idoneità</button>' +
              '<button type="button" class="es-med-quick-btn" data-md-act="rehab">🩹 Terapie &amp; Fisio</button>' +
              '<button type="button" class="es-med-quick-btn" data-md-act="clearance">✅ Return to Play</button>' +
            '</div>' +
          '</section>' +

        '</div>' + // Fine riga 1

        // 3. STRUMENTI OPERATIVI — AZIONI MEDICO SOCIALE (GRID A 3 COLONNE)
        '<section class="es-med-card" style="padding:1.25rem 1.35rem;">' +
          '<div class="es-med-card-head">' +
            '<h2 class="es-med-card-title">' +
              '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>' +
              '<span>Strumenti Operativi — Azioni Medico Sociale</span>' +
            '</h2>' +
            '<span class="es-med-badge-tag cyan">Medical Suite v3.0</span>' +
          '</div>' +

          '<div class="es-med-actions-grid">' +
            '<button type="button" class="es-med-action-card" data-md-act="new-visit">' +
              '<div class="es-med-action-icon">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>' +
              '</div>' +
              '<div class="es-med-action-text">' +
                '<b>Registra Visita / Controllo</b>' +
                '<span>Visite mediche generali, ECG sotto sforzo ed esami clinici.</span>' +
              '</div>' +
            '</button>' +

            '<button type="button" class="es-med-action-card" data-md-act="certify-fit">' +
              '<div class="es-med-action-icon">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>' +
              '</div>' +
              '<div class="es-med-action-text">' +
                '<b>Certifica Idoneità Agonistica</b>' +
                '<span>Convalida certificato medico sportivo obbligatorio per gara.</span>' +
              '</div>' +
            '</button>' +

            '<button type="button" class="es-med-action-card" data-md-act="injury">' +
              '<div class="es-med-action-icon">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' +
              '</div>' +
              '<div class="es-med-action-text">' +
                '<b>Registro Infortuni &amp; Diagnosi</b>' +
                '<span>Cartella clinica riservata con diagnosi e tempi di recupero.</span>' +
              '</div>' +
            '</button>' +

            '<button type="button" class="es-med-action-card" data-md-act="rehab">' +
              '<div class="es-med-action-icon">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>' +
              '</div>' +
              '<div class="es-med-action-text">' +
                '<b>Prescrizioni &amp; Fisioterapia</b>' +
                '<span>Piani terapeutici e protocolli condivisi col Fisioterapista.</span>' +
              '</div>' +
            '</button>' +

            '<button type="button" class="es-med-action-card" data-md-act="clearance">' +
              '<div class="es-med-action-icon">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' +
              '</div>' +
              '<div class="es-med-action-text">' +
                '<b>Attestazione Return to Play</b>' +
                '<span>Nulla osta medico vincolante per il reintegro con il gruppo.</span>' +
              '</div>' +
            '</button>' +

            '<button type="button" class="es-med-action-card" data-md-act="export-dossier">' +
              '<div class="es-med-action-icon">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>' +
              '</div>' +
              '<div class="es-med-action-text">' +
                '<b>Dossier Sanitario Riservato</b>' +
                '<span>Esportazione cartella clinica per visite specialistiche esterne.</span>' +
              '</div>' +
            '</button>' +
          '</div>' +
        '</section>' +

        // 4. RIGA ANALITICA (3 COLONNE: RADAR, COMPITI MEDICI, LIMITI DI RUOLO)
        '<div class="es-med-grid-3col">' +

          // COLONNA 1: QUADRO SANITARIO ROSA (RADAR)
          '<section class="es-med-card">' +
            '<div class="es-med-card-head">' +
              '<h2 class="es-med-card-title">' +
                '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/></svg>' +
                '<span>Quadro Sanitario Rosa</span>' +
              '</h2>' +
              '<span class="es-med-badge-tag cyan">Radar Medico</span>' +
            '</div>' +
            '<div style="display:flex; justify-content:center; align-items:center; padding:0.5rem 0;">' +
              radarSvg() +
            '</div>' +
            '<div style="display:flex; justify-content:space-between; font-size:0.7rem; color:#94a3b8; border-top:1px solid rgba(148,163,184,0.08); padding-top:0.6rem; margin-top:auto;">' +
              '<span>Media Standard FMSI: <b>80%</b></span>' +
              '<span style="color:#38bdf8;">Indice Sanitario Rosa: <b>93%</b></span>' +
            '</div>' +
          '</section>' +

          // COLONNA 2: ATTIVITÀ & POTERI MEDICO-LEGALI
          '<section class="es-med-card">' +
            '<div class="es-med-card-head">' +
              '<h2 class="es-med-card-title">' +
                '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>' +
                '<span>Attività &amp; Poteri Sanitari</span>' +
              '</h2>' +
              '<span class="es-med-badge-tag emerald">Autorizzato</span>' +
            '</div>' +

            '<ul class="es-med-checklist">' +
              '<li>' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' +
                '<span><b>Rilascio e controllo idoneità agonistica</b> — verifica periodica e blocco automatico scadenze.</span>' +
              '</li>' +
              '<li>' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' +
                '<span><b>Autorizzazione Return to Play vincolante</b> — parere medico insindacabile prima della ripresa attività.</span>' +
              '</li>' +
              '<li>' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' +
                '<span><b>Prescrizione esami specialistici</b> — invio atleti per RMN, ecografie muscolari e visite ortopediche.</span>' +
              '</li>' +
              '<li>' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' +
                '<span><b>Direzione del protocollo sanitario</b> — coordinamento clinico con Fisioterapista e Preparatore.</span>' +
              '</li>' +
            '</ul>' +
          '</section>' +

          // COLONNA 3: LIMITI DI RUOLO & SEGRETO PROFESSIONALE (Rosso Tenue Luxury Desaturato)
          '<section class="es-med-card es-med-limits-card">' +
            '<div class="es-med-card-head">' +
              '<h2 class="es-med-card-title">' +
                '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fda4af" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' +
                '<span style="color:#fda4af;">Limiti di Ruolo &amp; Deontologia</span>' +
              '</h2>' +
              '<span class="es-med-badge-tag rose">Compliance</span>' +
            '</div>' +

            '<ul class="es-med-limits-list">' +
              '<li>' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>' +
                '<span><b>Segreto professionale &amp; Privacy</b> — I dettagli clinici riservati non possono essere divulgati all\'esterno.</span>' +
              '</li>' +
              '<li>' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>' +
                '<span><b>Nessuna influenza tecnica sulle scelte</b> — L\'idoneità medica è autonoma rispetto alle esigenze di gara.</span>' +
              '</li>' +
              '<li>' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>' +
                '<span><b>Nessuna operatività di calciomercato</b> — Riservato al Direttore Sportivo e alla Presidenza.</span>' +
              '</li>' +
            '</ul>' +
          '</section>' +

        '</div>' + // Fine riga 3

        // 5. REGISTRO VISITE & CARTELLE CLINICHE (EMPTY STATE VISUALE)
        '<section class="es-med-card">' +
          '<div class="es-med-card-head">' +
            '<h2 class="es-med-card-title">' +
              '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
              '<span>Registro Visite &amp; Cartelle Cliniche Recenti</span>' +
            '</h2>' +
            '<span class="es-med-badge-tag cyan">Archivio Sanitario</span>' +
          '</div>' +

          '<div class="es-med-empty-wrap">' +
            '<div class="es-med-empty-icon">' +
              '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>' +
            '</div>' +
            '<div class="es-med-empty-title">Nessuna visita registrata di recente</div>' +
            '<div class="es-med-empty-sub">Registra una nuova visita medica di controllo o convalida l\'idoneità agonistica per alimentare la cartella clinica della rosa.</div>' +
            '<div style="display:flex; gap:8px; margin-top:0.4rem;">' +
              '<button type="button" class="es-med-btn-primary" data-md-act="new-visit" style="font-size:0.75rem; padding:0.45rem 0.85rem;">+ Nuova Visita Medica</button>' +
              '<button type="button" class="es-med-btn-secondary" data-md-act="certify-fit" style="font-size:0.75rem; padding:0.45rem 0.85rem;">📋 Certifica Idoneità</button>' +
            '</div>' +
          '</div>' +
        '</section>' +

      '</div>'; // Fine shell
  }

  function openMedEditModal(user) {
    user = user || userObj();
    var backdrop = document.createElement('div');
    backdrop.className = 'es-edit-modal-backdrop';

    backdrop.innerHTML = '<div class="es-edit-modal">' +
      '<div class="es-edit-modal-head">' +
      '<h2><span>✏️</span> Modifica Anagrafica Medico Sociale / Staff Sanitario</h2>' +
      '<button type="button" class="es-edit-modal-close" title="Chiudi">&times;</button>' +
      '</div>' +
      '<div class="es-edit-grid">' +
      '<div class="es-edit-field"><label>Nome</label><input id="es-med-nome" value="' + esc(user.nome || '') + '"></div>' +
      '<div class="es-edit-field"><label>Cognome</label><input id="es-med-cognome" value="' + esc(user.cognome || '') + '"></div>' +
      '<div class="es-edit-field"><label>Specializzazione / Abilitazione</label><input id="es-med-qual" value="' + esc(user.abilitazione || 'Specialista in Medicina dello Sport / FMSI') + '"></div>' +
      '<div class="es-edit-field"><label>Ruolo Ufficiale</label><input id="es-med-role" value="Medico Sociale / Responsabile Sanitario" readonly></div>' +
      '<div class="es-edit-field"><label>Club / Organizzazione</label><input id="es-med-club" value="' + esc(user.squadra || user.club || '') + '" placeholder="Vuoto = Consulente Medico Esterno"></div>' +
      '<div class="es-edit-field"><label>Status Contrattuale</label><select id="es-med-status">' +
      '<option value="In Staff Club"' + (inStaff(user) ? ' selected' : '') + '>In Staff Club (Responsabile Sanitario)</option>' +
      '<option value="Free Agent"' + (!inStaff(user) ? ' selected' : '') + '>Consulente Medico Esterno</option>' +
      '</select></div>' +
      '<div class="es-edit-field full"><label>Bio &amp; Note Operative</label><textarea id="es-med-bio" rows="3">' + esc(user.bio || '') + '</textarea></div>' +
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
      var n = document.getElementById('es-med-nome').value.trim();
      var c = document.getElementById('es-med-cognome').value.trim();
      var q = document.getElementById('es-med-qual').value.trim();
      var clb = document.getElementById('es-med-club').value.trim();
      var st = document.getElementById('es-med-status').value;
      var bio = document.getElementById('es-med-bio').value.trim();

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
      toast('Anagrafica Medico Sociale salvata con successo!', 'success');
      render(user);
    });
  }

  function bind(host) {
    if (!host || host.dataset.mdBound === '1') return;
    host.dataset.mdBound = '1';
    host.addEventListener('click', function (e) {
      var b = e.target.closest('[data-md], [data-md-act]');
      if (!b) return;
      var k = b.getAttribute('data-md');
      var act = b.getAttribute('data-md-act');

      if (k === 'home' && window.switchView) window.switchView('home', '#hero');
      if (k === 'dash' && window.switchView) window.switchView('user-dossier', '#user-dossier-portal');
      if (k === 'msgs' && window.openUserMessages) window.openUserMessages();
      if (k === 'edit') openMedEditModal(userObj());

      if (act === 'new-visit') {
        var ath = window.prompt('Nome e cognome dell\'atleta sottoposto a visita medica:');
        if (ath) {
          var note = window.prompt('Esito e note della visita medica (es. Idoneo, controllo post-infortunio):');
          if (note) {
            toast('Visita medica registrata con successo per ' + ath + '!', 'success');
          }
        }
      }
      if (act === 'certify-fit') {
        var athFit = window.prompt('Nome e cognome dell\'atleta per la certificazione idoneità agonistica:');
        if (athFit) {
          var scad = window.prompt('Data di scadenza della nuova idoneità (GG/MM/AAAA):', '30/06/2027');
          if (scad) {
            toast('Certificato di idoneità agonistica rilasciato e registrato per ' + athFit + ' con scadenza ' + scad + '!', 'success');
          }
        }
      }
      if (act === 'injury') {
        var athInj = window.prompt('Nome e cognome dell\'atleta infortunato:');
        if (athInj) {
          var diag = window.prompt('Diagnosi clinica (es. Distorsione caviglia grado I, lesione bicipite femorale):');
          if (diag) {
            toast('Infortunio e diagnosi clinica registrati nella cartella riservata di ' + athInj + '.', 'success');
          }
        }
      }
      if (act === 'rehab') {
        var athReh = window.prompt('Nome e cognome dell\'atleta per il piano fisioterapico:');
        if (athReh) {
          toast('Prescrizione terapeutica e protocollo riabilitativo inviato al Fisioterapista per ' + athReh + '.', 'success');
        }
      }
      if (act === 'clearance') {
        var athCl = window.prompt('Nome e cognome dell\'atleta pronto per il Return to Play:');
        if (athCl) {
          toast('✅ Nulla osta medico Return to Play approvato! Notifica ufficiale inviata all\'Allenatore per ' + athCl + '.', 'success');
        }
      }
      if (act === 'export-dossier') {
        toast('Generazione cartella sanitaria riservata PDF...', 'info');
      }
    });
  }

  function render(user) {
    user = user || userObj();
    if (!isMedico(user)) return;
    hideOthers();
    var host = document.getElementById('es-staff-profile');
    var group = document.getElementById('user-dossier-view-group');
    if (!host) return;

    var box = document.getElementById('es-md');
    if (!box) {
      box = document.createElement('div');
      box.id = 'es-md';
      box.className = 'es-pd';
      host.insertBefore(box, host.firstChild);
    }
    box.innerHTML = html(user);
    box.hidden = false;
    box.removeAttribute('hidden');
    box.style.display = 'grid';

    host.classList.add('es-med-on');
    host.classList.remove('es-pd-on', 'es-ds-on', 'es-pres-on', 'es-vice-on', 'es-fisio-on', 'es-ma-on', 'es-obs-on', 'es-tm-on', 'es-gk-on', 'es-at-on', 'es-yg-on');

    if (group) {
      group.classList.add('is-med-dash');
      group.classList.remove('is-coach-dash', 'is-ds-dash', 'is-pres-dash', 'is-vice-dash', 'is-fisio-dash', 'is-ma-dash', 'is-obs-dash', 'is-tm-dash', 'is-gk-dash', 'is-at-dash', 'is-yg-dash');
    }
    bind(host);
  }

  window.EliseeMedDash = { render: render, isMedico: isMedico };

  document.addEventListener('elisee:view-changed', function (e) {
    var d = e && e.detail;
    if (d && d.view === 'user-dossier') {
      try {
        var u = userObj();
        if (isMedico(u)) render(u);
      } catch (_) {}
    }
  });

  document.addEventListener('elisee:role-changed', function (e) {
    var d = e && e.detail;
    try {
      var u = (d && d.user) || userObj();
      if (isMedico(u)) render(u);
    } catch (_) {}
  });
})();
