/* ============================================================
   ELISEE SCOUT — AREA MATCH ANALYST & VIDEO ANALYST (CONTROL ROOM)
   Technical Staff Operating System — Tactical Intelligence OS
   Navigazione gestionale unificata nella sidebar sinistra e tab bar superiore
   ============================================================ */
(function () {
  'use strict';

  var activeTab = 'dashboard'; // 'dashboard' | 'reports' | 'heatmap' | 'clips' | 'comparatore' | 'radar' | 'canale_staff' | 'impostazioni'

  var LAB_KEY = 'elisee_ma_lab';
  var INBOX_KEY = 'elisee_ma_inbox';
  var TAGS_KEY = 'elisee_player_ma_tags';

  var AXES = [
    'Lettura Tattica', 'Analisi Video', 'Tagging Palle Inattive', 'Heatmap & Occupazione Spazi',
    'Report Post-Gara', 'Studio Avversario', 'Integrazione GPS / Fisico', 'Comunicazione Staff'
  ];
  var V2025 = [93, 91, 88, 90, 92, 89, 87, 94];
  var V2023 = [79, 78, 72, 75, 78, 74, 73, 82];

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

  function isMa(u) {
    u = u || userObj();
    var blob = String(u.staffRole || u.ruoloDettagliato || (u.staffProfile && u.staffProfile.fieldRole) || u.ruolo || u.role || '').trim().toLowerCase();
    return /match analyst|video analyst/.test(blob);
  }

  function maName(u) {
    return [u.nome, u.cognome].filter(Boolean).join(' ').trim() || u.username || 'Match Analyst';
  }

  function initials(name) {
    var p = String(name || 'MA').trim().split(/\s+/);
    return ((p[0] || 'M').charAt(0) + (p[1] || p[0] || 'A').charAt(0)).toUpperCase();
  }

  function inStaff(u) {
    u = u || userObj();
    var st = String(u.maContract || u.contractStatus || '').toLowerCase();
    if (st === 'free' || st === 'free-agent' || st === 'consulente') return false;
    if (st === 'staff' || st === 'in-staff' || st === 'contract') return true;
    return !!(u.squadra || u.club);
  }

  function qualificaOf(u) {
    return String((u && (u.maQualifica || u.qualificaMa || u.certificazione)) || '').trim() || 'Match Analyst FIGC / Coverciano';
  }

  function toast(msg, kind) {
    if (typeof window.showToast === 'function') window.showToast(msg, kind || 'success');
    else alert(msg);
  }

  function slug(s) {
    return String(s || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function getReportsList() {
    try {
      var raw = JSON.parse(localStorage.getItem('elisee_ma_reports') || '[]');
      if (Array.isArray(raw) && raw.length > 0) return raw;
    } catch (_) {}
    return [
      { id: 'rep-1', titolo: 'Studio Tattico Manfredonia Calcio (Costruzione 4-3-3 & Palle Inattive)', avv: 'Manfredonia Calcio', date: '15/09/2026', modulo: '4-3-3', note: 'Difesa alta con vulnerabilità sul cambio gioco rapido; forte densità centrale.' },
      { id: 'rep-2', titolo: 'Analisi Post-Gara Seduta Tattica Foggia City', avv: 'Report Interno', date: '12/09/2026', modulo: '4-3-3 vs 3-5-2', note: 'Verificata catena di destra: 6 sovrapposizioni del terzino con rifinitura sul fondo.' }
    ];
  }

  function saveReportsList(list) {
    try { localStorage.setItem('elisee_ma_reports', JSON.stringify(list)); } catch (_) {}
  }

  function getClipsList() {
    try {
      var raw = JSON.parse(localStorage.getItem('elisee_ma_clips') || '[]');
      if (Array.isArray(raw) && raw.length > 0) return raw;
    } catch (_) {}
    return [
      { id: 'clip-1', title: 'Corner a Favore: Blocco & Taglio Primo Palo', category: 'Palle Inattive', duration: '0:42', tags: '#corner #schemi' },
      { id: 'clip-2', title: 'Uscita dal Pressing Basso con Terzo Uomo', category: 'Costruzione', duration: '1:15', tags: '#costruzione #terzouomo' }
    ];
  }

  function saveClipsList(list) {
    try { localStorage.setItem('elisee_ma_clips', JSON.stringify(list)); } catch (_) {}
  }

  // Radar SVG
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

  function radarSvg() {
    var cx = 220, cy = 200, r = 135, n = AXES.length;
    var html = '<svg viewBox="0 0 440 400" style="width:100%; height:auto; max-height:300px;" role="img" aria-label="Analisi competenze tattiche e video">';
    for (var ring = 1; ring <= 5; ring++) {
      html += '<polygon points="' + poly(cx, cy, r, AXES.map(function () { return ring * 20; })) +
        '" fill="none" stroke="rgba(148,163,184,0.16)" stroke-width="1"/>';
    }
    for (var i = 0; i < n; i++) {
      var e = polar(cx, cy, r, i, n, 100);
      html += '<line x1="' + cx + '" y1="' + cy + '" x2="' + e[0].toFixed(1) + '" y2="' + e[1].toFixed(1) +
        '" stroke="rgba(148,163,184,0.16)"/>';
      var lab = polar(cx, cy, r + 24, i, n, 100);
      html += '<text x="' + lab[0].toFixed(1) + '" y="' + lab[1].toFixed(1) +
        '" text-anchor="middle" dominant-baseline="middle" fill="#94a3b8" font-size="8.5" font-weight="600">' +
        esc(AXES[i]) + ' ' + V2025[i] + '%</text>';
    }
    html += '<polygon points="' + poly(cx, cy, r, V2023) + '" fill="rgba(148,163,184,0.10)" stroke="#64748b" stroke-width="1.5"/>';
    html += '<polygon points="' + poly(cx, cy, r, V2025) + '" fill="rgba(56,189,248,0.14)" stroke="#38bdf8" stroke-width="2"/>';
    html += '</svg>';
    return html;
  }

  function pitchSvg() {
    var html = '<svg class="es-ma-pitch" viewBox="0 0 360 210" role="img" aria-label="Sovrapposizione heatmap di squadra">';
    html += '<rect width="360" height="210" rx="8" fill="#0c1f16"/>';
    html += '<rect x="8" y="8" width="344" height="194" fill="none" stroke="rgba(56,189,248,0.3)" stroke-width="1.5"/>';
    html += '<line x1="180" y1="8" x2="180" y2="202" stroke="rgba(56,189,248,0.3)" stroke-width="1"/>';
    html += '<circle cx="180" cy="105" r="26" fill="none" stroke="rgba(56,189,248,0.3)"/>';
    html += '<rect x="8" y="65" width="34" height="80" fill="none" stroke="rgba(56,189,248,0.3)"/>';
    html += '<rect x="318" y="65" width="34" height="80" fill="none" stroke="rgba(56,189,248,0.3)"/>';
    // Zone termiche di occupazione
    html += '<ellipse cx="80" cy="105" rx="42" ry="55" fill="rgba(56,189,248,0.28)"/>';
    html += '<ellipse cx="180" cy="95" rx="38" ry="44" fill="rgba(250,204,21,0.22)"/>';
    html += '<ellipse cx="280" cy="115" rx="44" ry="50" fill="rgba(74,222,128,0.28)"/>';
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
      window.unmountAllRoleDashboards('es-mad');
    }
  }

  // ============================================================
  // RENDER SEZIONI SPECIFICHE
  // ============================================================

  // 1. Dashboard Tab
  function renderTabDashboard(user, reports, clips) {
    var name = maName(user);
    var on = inStaff(user);
    var club = String(user.squadra || user.club || 'Foggia City').trim();
    var qual = qualificaOf(user);

    return '' +
      '<div class="es-ma-grid-2col">' +
        // Profilo Analyst
        '<section class="es-ma-card">' +
          '<div class="es-ma-card-head">' +
            '<h2 class="es-ma-card-title">' +
              '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
              '<span>Profilo Match Analyst Ufficiale</span>' +
            '</h2>' +
            '<div style="display:flex; gap:6px; align-items:center;">' +
              '<span class="es-ma-badge-tag cyan">Coverciano FIGC</span>' +
              '<span class="es-ma-badge-tag emerald">' + (on ? 'In Staff Club' : 'Free Agent') + '</span>' +
            '</div>' +
          '</div>' +

          '<div class="es-ma-profile-row">' +
            '<div class="es-ma-avatar-fallback">' + esc(initials(name)) + '</div>' +
            '<div>' +
              '<b class="es-ma-user-name">' + esc(name) + '</b>' +
              '<div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">' +
                '<span style="font-size:0.72rem; color:#38bdf8; background:rgba(56,189,248,0.12); border:1px solid rgba(56,189,248,0.28); border-radius:4px; padding:2px 6px; font-weight:800; text-transform:uppercase;">Match &amp; Video Analyst</span>' +
                '<span style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:flex; align-items:center; gap:4px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' + esc(club) + '</span>' +
              '</div>' +
            '</div>' +
          '</div>' +

          '<div style="background:#060911; border:1px solid rgba(56,189,248,0.12); border-radius:6px; padding:8px 12px; margin-bottom:10px;">' +
            '<div style="display:flex; justify-content:space-between; font-size:0.72rem; color:#94a3b8; font-weight:700;">' +
              '<span>Completamento Scheda Tecnica &amp; Abilitazione</span>' +
              '<span style="color:#38bdf8; font-weight:900;">85%</span>' +
            '</div>' +
            '<div class="es-ma-progress-track">' +
              '<div class="es-ma-progress-fill" style="width:85%;"></div>' +
            '</div>' +
            '<div style="display:flex; justify-content:flex-end;">' +
              '<button type="button" class="es-ma-side-btn" data-ma-nav="impostazioni" style="font-size:0.72rem; color:#38bdf8; padding:0; background:none; border:none; width:auto; cursor:pointer;">✏️ Modifica Anagrafica</button>' +
            '</div>' +
          '</div>' +

          '<div class="es-ma-cred-grid">' +
            '<div class="es-ma-cred-item">' +
              '<span>Qualifica Ufficiale</span>' +
              '<b>' + esc(qual) + '</b>' +
            '</div>' +
            '<div class="es-ma-cred-item">' +
              '<span>Collegamento Staff Tecnico</span>' +
              '<b>' + (on ? 'Inoltro Diretto al Mister' : 'Indipendente') + '</b>' +
            '</div>' +
          '</div>' +
        '</section>' +

        // Centro Operativo Tattico
        '<section class="es-ma-card">' +
          '<div class="es-ma-card-head">' +
            '<h2 class="es-ma-card-title">' +
              '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>' +
              '<span>Centro Operativo Tactical OS</span>' +
            '</h2>' +
            '<span class="es-ma-badge-tag cyan">Coverciano Certified</span>' +
          '</div>' +

          '<p style="font-size:0.78rem; color:#94a3b8; line-height:1.45; margin:0 0 10px;">' +
            'Gestisci la video analisi di squadra e individuale: sezioni clip, generi heatmap di occupazione spazi e inoltri dossier tattici riservati direttamente al Mister e al DS.' +
          '</p>' +

          '<div class="es-ma-kpi-grid">' +
            '<div class="es-ma-kpi-box">' +
              '<strong>' + reports.length + '</strong>' +
              '<span>Report Archiviati</span>' +
            '</div>' +
            '<div class="es-ma-kpi-box">' +
              '<strong>92%</strong>' +
              '<span>Lettura Tattica</span>' +
            '</div>' +
            '<div class="es-ma-kpi-box">' +
              '<strong>' + (on ? 'Attivo' : 'Libero') + '</strong>' +
              '<span>Canale Mister</span>' +
            '</div>' +
          '</div>' +

          '<div class="es-ma-quick-actions">' +
            '<button type="button" class="es-ma-quick-btn" data-ma-nav="reports">📋 Archivio Report</button>' +
            '<button type="button" class="es-ma-quick-btn" data-ma-nav="heatmap">🗺️ Heatmap Tattiche</button>' +
            '<button type="button" class="es-ma-quick-btn" data-ma-nav="clips">🎬 Video Clip Hub</button>' +
            '<button type="button" class="es-ma-quick-btn" data-ma-nav="comparatore">⚖️ Comparatore IA</button>' +
          '</div>' +
        '</section>' +
      '</div>' +

      // Strumenti Operativi
      '<section class="es-ma-card">' +
        '<div class="es-ma-card-head">' +
          '<h2 class="es-ma-card-title">' +
            '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>' +
            '<span>Strumenti Operativi — Tactical Suite v3.0</span>' +
          '</h2>' +
          '<span class="es-ma-badge-tag cyan">Tactical Tools</span>' +
        '</div>' +

        '<div class="es-ma-actions-grid">' +
          '<button type="button" class="es-ma-action-card" data-ma-nav="reports">' +
            '<div class="es-ma-action-icon">' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>' +
            '</div>' +
            '<div class="es-ma-action-text">' +
              '<b>Report 8 Blocchi</b>' +
              '<span>Analisi pre-gara, post-gara, studio avversario e palle inattive.</span>' +
            '</div>' +
          '</button>' +

          '<button type="button" class="es-ma-action-card" data-ma-nav="heatmap">' +
            '<div class="es-ma-action-icon">' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/></svg>' +
            '</div>' +
            '<div class="es-ma-action-text">' +
              '<b>Heatmap &amp; Mappa di Calore</b>' +
              '<span>Sovrapponi posizioni medie, baricentro e corsie di spinta.</span>' +
            '</div>' +
          '</button>' +

          '<button type="button" class="es-ma-action-card" data-ma-nav="comparatore">' +
            '<div class="es-ma-action-icon">' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 21v-8"/><path d="m9 16 3-3 3 3"/></svg>' +
            '</div>' +
            '<div class="es-ma-action-text">' +
              '<b>Comparatore Giocatori IA</b>' +
              '<span>Confronto testa a testa radar su due profili dello stesso ruolo.</span>' +
            '</div>' +
          '</button>' +

          '<button type="button" class="es-ma-action-card" data-ma-nav="clips">' +
            '<div class="es-ma-action-icon">' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 8 6 4-6 4Z"/></svg>' +
            '</div>' +
            '<div class="es-ma-action-text">' +
              '<b>Clip Hub &amp; Video Tagging</b>' +
              '<span>Indicizza palle inattive, transizioni e uscite basse.</span>' +
            '</div>' +
          '</button>' +

          '<button type="button" class="es-ma-action-card" data-ma-nav="canale_staff">' +
            '<div class="es-ma-action-icon">' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></svg>' +
            '</div>' +
            '<div class="es-ma-action-text">' +
              '<b>Inoltro Dossier a DS &amp; Mister</b>' +
              '<span>Condivisione riservata dello studio avversario con lo staff.</span>' +
            '</div>' +
          '</button>' +

          '<button type="button" class="es-ma-action-card" data-ma-nav="radar">' +
            '<div class="es-ma-action-icon">' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/></svg>' +
            '</div>' +
            '<div class="es-ma-action-text">' +
              '<b>Radar Competenze Coverciano</b>' +
              '<span>Analisi ad 8 assi con benchmark federale FIGC.</span>' +
            '</div>' +
          '</button>' +
        '</div>' +
      '</section>' +

      // Ultime Attività
      '<section class="es-ma-card">' +
        '<div class="es-ma-card-head">' +
          '<h2 class="es-ma-card-title">' +
            '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
            '<span>Ultimi Report &amp; Clip Catalogate</span>' +
          '</h2>' +
          '<button type="button" class="es-ma-side-btn" data-ma-nav="reports" style="font-size:0.75rem; color:#38bdf8; width:auto; padding:0; background:none; border:none; cursor:pointer;">Vedi Tutti &rarr;</button>' +
        '</div>' +

        '<div style="display:flex; flex-direction:column; gap:8px;">' +
          reports.slice(0, 2).map(function (r) {
            return '<div style="background:#060911; border:1px solid rgba(56,189,248,0.12); border-radius:8px; padding:10px 14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">' +
              '<div>' +
                '<b style="color:#f8fafc; font-size:0.86rem; display:block;">' + esc(r.titolo) + '</b>' +
                '<span style="color:#94a3b8; font-size:0.74rem;">' + esc(r.date) + ' · Modulo: <strong style="color:#38bdf8;">' + esc(r.modulo) + '</strong></span>' +
              '</div>' +
              '<div style="display:flex; gap:8px;">' +
                '<button type="button" class="es-ma-quick-btn" data-ma-act="forward-mister" data-title="' + esc(r.titolo) + '">Inoltra al Mister</button>' +
              '</div>' +
            '</div>';
          }).join('') +
        '</div>' +
      '</section>';
  }

  // 2. Report Tab
  function renderTabReports(reports) {
    return '' +
      '<section class="es-ma-card">' +
        '<div class="es-ma-card-head">' +
          '<h2 class="es-ma-card-title">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>' +
            '<span>Archivio Report Tattici a 8 Blocchi (' + reports.length + ')</span>' +
          '</h2>' +
          '<button type="button" class="es-ma-btn-primary" data-ma-act="new-report">+ Nuovo Report Tattico</button>' +
        '</div>' +

        '<div style="display:flex; flex-direction:column; gap:12px;">' +
          reports.map(function (r) {
            return '<div style="background:#060911; border:1px solid rgba(56,189,248,0.16); border-radius:8px; padding:14px;">' +
              '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:8px;">' +
                '<strong style="color:#f8fafc; font-size:0.95rem;">' + esc(r.titolo) + '</strong>' +
                '<span class="es-ma-badge-tag cyan">' + esc(r.date) + '</span>' +
              '</div>' +
              '<div style="font-size:0.75rem; color:#94a3b8; margin-bottom:8px;">' +
                'Avversario: <b style="color:#cbd5e1;">' + esc(r.avv) + '</b> · Assetto analizzato: <b style="color:#38bdf8;">' + esc(r.modulo) + '</b>' +
              '</div>' +
              '<div style="font-size:0.76rem; color:#cbd5e1; line-height:1.45; margin-bottom:12px;">' +
                esc(r.note) +
              '</div>' +
              '<div style="display:flex; justify-content:flex-end; gap:8px; border-top:1px solid rgba(148,163,184,0.1); padding-top:10px;">' +
                '<button type="button" class="es-ma-btn-primary" data-ma-act="forward-mister" data-title="' + esc(r.titolo) + '" style="font-size:0.75rem; padding:4px 10px;">Invia al Mister</button>' +
                '<button type="button" class="es-ma-quick-btn" data-ma-act="forward-ds" data-title="' + esc(r.titolo) + '">Invia al DS</button>' +
              '</div>' +
            '</div>';
          }).join('') +
        '</div>' +
      '</section>';
  }

  // 3. Heatmap Tab
  function renderTabHeatmap() {
    return '' +
      '<section class="es-ma-card">' +
        '<div class="es-ma-card-head">' +
          '<h2 class="es-ma-card-title">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/></svg>' +
            '<span>Heatmap Tattica &amp; Occupazione Spazi</span>' +
          '</h2>' +
          '<button type="button" class="es-ma-btn-primary" data-ma-act="add-heat">+ Carica Nuova Heatmap</button>' +
        '</div>' +

        '<div style="display:grid; grid-template-columns:1.2fr 1fr; gap:16px; align-items:center;">' +
          '<div style="display:flex; justify-content:center; align-items:center; background:#060911; border-radius:8px; padding:12px; border:1px solid rgba(56,189,248,0.12);">' +
            pitchSvg() +
          '</div>' +

          '<div>' +
            '<h3 style="color:#f8fafc; font-size:1rem; font-weight:800; margin:0 0 8px;">Analisi Baricentro &amp; Ampiezza</h3>' +
            '<p style="color:#94a3b8; font-size:0.78rem; line-height:1.45; margin-bottom:12px;">' +
              'La mappa di calore aggrega i tocchi palla e la densità posizionale della squadra durante la fase di possesso e non possesso.' +
            '</p>' +

            '<div style="display:flex; flex-direction:column; gap:8px;">' +
              '<div style="background:#060911; border:1px solid rgba(56,189,248,0.12); border-radius:6px; padding:8px 12px; display:flex; justify-content:space-between;">' +
                '<span style="font-size:0.75rem; color:#94a3b8;">Baricentro Medio:</span>' +
                '<strong style="color:#38bdf8; font-size:0.8rem;">54.8 metri (Medio-Alto)</strong>' +
              '</div>' +
              '<div style="background:#060911; border:1px solid rgba(56,189,248,0.12); border-radius:6px; padding:8px 12px; display:flex; justify-content:space-between;">' +
                '<span style="font-size:0.75rem; color:#94a3b8;">Indice di Ampiezza:</span>' +
                '<strong style="color:#4ade80; font-size:0.8rem;">68% (Utilizzo Corsie Esterne)</strong>' +
              '</div>' +
              '<div style="background:#060911; border:1px solid rgba(56,189,248,0.12); border-radius:6px; padding:8px 12px; display:flex; justify-content:space-between;">' +
                '<span style="font-size:0.75rem; color:#94a3b8;">Densità Recupero Palla:</span>' +
                '<strong style="color:#facc15; font-size:0.8rem;">Centrocampo Destro</strong>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>';
  }

  // 4. Clips Tab
  function renderTabClips(clips) {
    return '' +
      '<section class="es-ma-card">' +
        '<div class="es-ma-card-head">' +
          '<h2 class="es-ma-card-title">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 8 6 4-6 4Z"/></svg>' +
            '<span>Video Tagging &amp; Clip Hub (' + clips.length + ')</span>' +
          '</h2>' +
          '<button type="button" class="es-ma-btn-primary" data-ma-act="add-clip">+ Nuova Clip Tagged</button>' +
        '</div>' +

        '<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:12px;">' +
          clips.map(function (c) {
            return '<div style="background:#060911; border:1px solid rgba(56,189,248,0.16); border-radius:8px; padding:12px;">' +
              '<div style="height:110px; background:#0f172a; border-radius:6px; display:flex; align-items:center; justify-content:center; margin-bottom:10px; border:1px solid rgba(56,189,248,0.1);">' +
                '<button type="button" class="es-ma-quick-btn" data-ma-act="play-clip" data-title="' + esc(c.title) + '" style="display:flex; align-items:center; gap:6px;">' +
                  '<span>▶ Riproduci (' + esc(c.duration) + ')</span>' +
                '</button>' +
              '</div>' +
              '<strong style="color:#f8fafc; font-size:0.88rem; display:block; margin-bottom:4px;">' + esc(c.title) + '</strong>' +
              '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                '<span class="es-ma-badge-tag cyan">' + esc(c.category) + '</span>' +
                '<span style="font-size:0.72rem; color:#94a3b8;">' + esc(c.tags) + '</span>' +
              '</div>' +
            '</div>';
          }).join('') +
        '</div>' +
      '</section>';
  }

  // 5. Comparatore IA Tab
  function renderTabComparatore() {
    return '' +
      '<section class="es-ma-card">' +
        '<div class="es-ma-card-head">' +
          '<h2 class="es-ma-card-title">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 21v-8"/><path d="m9 16 3-3 3 3"/></svg>' +
            '<span>Comparatore Giocatori IA (Head to Head)</span>' +
          '</h2>' +
          '<span class="es-ma-badge-tag emerald">Metric AI Engine</span>' +
        '</div>' +

        '<div style="background:#060911; border:1px solid rgba(56,189,248,0.14); border-radius:8px; padding:16px; text-align:center;">' +
          '<div style="display:grid; grid-template-columns:1fr auto 1fr; gap:16px; align-items:center; margin-bottom:16px;">' +
            '<div style="background:#0b1120; padding:12px; border-radius:6px; border:1px solid rgba(56,189,248,0.2);">' +
              '<strong style="color:#38bdf8; display:block;">Calciatore A</strong>' +
              '<span style="font-size:0.75rem; color:#94a3b8;">Seleziona da Rosa o Database</span>' +
            '</div>' +
            '<span style="font-weight:900; color:#64748b; font-size:1.2rem;">VS</span>' +
            '<div style="background:#0b1120; padding:12px; border-radius:6px; border:1px solid rgba(56,189,248,0.2);">' +
              '<strong style="color:#facc15; display:block;">Calciatore B</strong>' +
              '<span style="font-size:0.75rem; color:#94a3b8;">Seleziona da Rosa o Database</span>' +
            '</div>' +
          '</div>' +

          '<button type="button" class="es-ma-btn-primary" data-ma-act="open-compare-modal">⚡ Avvia Confronto Parametrico</button>' +
        '</div>' +
      '</section>';
  }

  // 6. Radar Competenze Tab
  function renderTabRadar() {
    return '' +
      '<section class="es-ma-card">' +
        '<div class="es-ma-card-head">' +
          '<h2 class="es-ma-card-title">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/></svg>' +
            '<span>Quadro Competenze Coverciano FIGC</span>' +
          '</h2>' +
          '<span class="es-ma-badge-tag cyan">Accreditamento Ufficiale</span>' +
        '</div>' +

        '<div style="display:grid; grid-template-columns:1.2fr 1fr; gap:16px; align-items:center;">' +
          '<div style="display:flex; justify-content:center; align-items:center; background:#060911; border-radius:8px; padding:12px; border:1px solid rgba(56,189,248,0.12);">' +
            radarSvg() +
          '</div>' +

          '<div>' +
            '<h3 style="color:#f8fafc; font-size:1rem; font-weight:800; margin:0 0 8px;">Metriche Match Analyst FIGC</h3>' +
            '<p style="color:#94a3b8; font-size:0.78rem; line-height:1.45; margin-bottom:12px;">' +
              'Indice di tempestività e accuratezza della lettura tattica a supporto dello staff tecnico di Foggia City.' +
            '</p>' +

            '<div style="display:flex; flex-direction:column; gap:8px;">' +
              '<div style="background:#060911; border:1px solid rgba(56,189,248,0.12); border-radius:6px; padding:8px 12px; display:flex; justify-content:space-between;">' +
                '<span style="font-size:0.75rem; color:#94a3b8;">Lettura Tattica:</span>' +
                '<strong style="color:#38bdf8; font-size:0.8rem;">93% (Top 3%)</strong>' +
              '</div>' +
              '<div style="background:#060911; border:1px solid rgba(56,189,248,0.12); border-radius:6px; padding:8px 12px; display:flex; justify-content:space-between;">' +
                '<span style="font-size:0.75rem; color:#94a3b8;">Comunicazione con lo Staff:</span>' +
                '<strong style="color:#4ade80; font-size:0.8rem;">94% (Sincronia Totale)</strong>' +
              '</div>' +
              '<div style="background:#060911; border:1px solid rgba(56,189,248,0.12); border-radius:6px; padding:8px 12px; display:flex; justify-content:space-between;">' +
                '<span style="font-size:0.75rem; color:#94a3b8;">Studio Avversario:</span>' +
                '<strong style="color:#38bdf8; font-size:0.8rem;">89% (Dossier Completo)</strong>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>';
  }

  // 7. Canale Staff Tab
  function renderTabCanaleStaff(user) {
    var club = String(user.squadra || user.club || 'Foggia City').trim();

    return '' +
      '<div class="es-ma-grid-2col">' +
        '<section class="es-ma-card">' +
          '<div class="es-ma-card-head">' +
            '<h2 class="es-ma-card-title">' +
              '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></svg>' +
              '<span>Canale Riservato con il Mister</span>' +
            '</h2>' +
            '<span class="es-ma-badge-tag emerald">Connesso</span>' +
          '</div>' +

          '<p style="font-size:0.78rem; color:#94a3b8; line-height:1.45; margin-bottom:12px;">' +
            'I tuoi report e le clip tagged vengono sincronizzati direttamente nell\'Area Riservata dell\'Allenatore Capo e del Vice Allenatore di ' + esc(club) + ' per la riunione tecnica.' +
          '</p>' +

          '<div style="background:#060911; border:1px solid rgba(56,189,248,0.12); border-radius:6px; padding:10px 12px; display:flex; justify-content:space-between; align-items:center;">' +
            '<div>' +
              '<b style="color:#f8fafc; font-size:0.82rem; display:block;">Dossier Avversario Consegna</b>' +
              '<span style="font-size:0.72rem; color:#4ade80;">Pronto per Briefing Pre-Gara</span>' +
            '</div>' +
            '<button type="button" class="es-ma-btn-primary" data-ma-act="forward-mister" style="font-size:0.75rem; padding:4px 10px;">Invia Aggiornamento</button>' +
          '</div>' +
        '</section>' +

        '<section class="es-ma-card">' +
          '<div class="es-ma-card-head">' +
            '<h2 class="es-ma-card-title">' +
              '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>' +
              '<span>Messaggistica Interna Staff</span>' +
            '</h2>' +
            '<button type="button" class="es-ma-quick-btn" data-ma-act="open-msgs">Apri Chat</button>' +
          '</div>' +

          '<p style="font-size:0.78rem; color:#94a3b8; line-height:1.45;">' +
            'Comunica in tempo reale con il Preparatore Atletico per i carichi GPS e con il Preparatore Portieri per i video sulle palle inattive.' +
          '</p>' +
        '</section>' +
      '</div>';
  }

  // ============================================================
  // RENDER PRINCIPALE SHELL
  // ============================================================
  function renderHub(user) {
    user = user || userObj();
    if (!isMa(user)) return;
    hideOthers();

    var host = document.getElementById('es-staff-profile');
    var group = document.getElementById('user-dossier-view-group');
    if (!host) return;

    var box = document.getElementById('es-mad');
    if (!box) {
      box = document.createElement('div');
      box.id = 'es-mad';
      box.className = 'es-pd';
      host.insertBefore(box, host.firstChild);
    }

    host.classList.add('es-ma-on');
    host.classList.remove('es-pd-on', 'es-ds-on', 'es-pres-on', 'es-vice-on', 'es-fisio-on', 'es-obs-on', 'es-med-on', 'es-tm-on', 'es-gk-on', 'es-at-on', 'es-yg-on');

    if (group) {
      group.classList.add('is-ma-dash');
      group.classList.remove('is-coach-dash', 'is-ds-dash', 'is-pres-dash', 'is-vice-dash', 'is-fisio-dash', 'is-obs-dash', 'is-med-dash', 'is-tm-dash', 'is-gk-dash', 'is-at-dash', 'is-yg-dash');
    }
    document.body.classList.add('is-ma-mode');

    var name = maName(user);
    var club = String(user.squadra || user.club || 'Foggia City').trim();
    var reports = getReportsList();
    var clips = getClipsList();
    var nextMatch = getNextMatchTarget();

    var html =
      '<div class="es-ma-shell">' +
        // 1. SIDEBAR TECNICA GESTIONALE (240px)
        '<aside class="es-ma-sidebar">' +
          '<div class="es-ma-brand-header">' +
            '<div class="es-ma-brand-title">ELISEE <span>SCOUT</span></div>' +
            '<div class="es-ma-brand-sub">Area Match &amp; Video Analysis</div>' +
          '</div>' +
          '<nav class="es-ma-sidebar-nav">' +
            renderSideBtn('dashboard', 'Dashboard', '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>') +
            renderSideBtn('reports', 'Report Tattici (' + reports.length + ')', '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>') +
            renderSideBtn('heatmap', 'Heatmap &amp; Spazi', '<circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/>') +
            renderSideBtn('clips', 'Video Tagging &amp; Clip', '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 8 6 4-6 4Z"/>') +
            renderSideBtn('comparatore', 'Comparatore IA', '<path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 21v-8"/><path d="m9 16 3-3 3 3"/>') +
            renderSideBtn('radar', 'Radar Competenze', '<circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/>') +
            renderSideBtn('canale_staff', 'Canale Staff &amp; Mister', '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/>') +
            renderSideBtn('impostazioni', 'Profilo &amp; Abilitazione', '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06-.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>') +
          '</nav>' +
          '<div class="es-ma-sidebar-badge">' +
            '<div class="es-ma-sidebar-club-card">' +
              '<img src="immagini/squadre-loghi/1000345699.png?v=20260916_FGCLOGO2" alt="' + esc(club) + '" onerror="this.onerror=null;this.src=\'immagini/squadre-loghi/foggia-city.png\';">' +
              '<div>' +
                '<strong>' + esc(club) + '</strong>' +
                '<span>Staff Tecnico Ufficiale</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</aside>' +

        // 2. MAIN WORKSPACE
        '<main class="es-ma-main">' +
          // HEADER A DUE LIVELLI
          '<div class="es-ma-dash-header">' +
            // Riga 1: Identità & Qualifica
            '<div class="es-ma-header-top-row">' +
              '<button type="button" class="es-ma-mobile-menu-btn" id="btn-toggle-ma-sidebar" aria-label="Menu">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>' +
              '</button>' +
              '<div class="es-ma-header-identity">' +
                '<div class="es-ma-header-block">' +
                  '<div class="es-ma-licence-badge" title="Patentino Match Analyst FIGC">' +
                    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>' +
                  '</div>' +
                  '<div class="es-ma-analyst-info">' +
                    '<strong>' + esc(name) + '</strong>' +
                    '<span class="role">Match Analyst &amp; Video Analyst</span>' +
                    '<p class="sub">Tesseramento FIGC: FIGC-MA-4512 · Scadenza: 30/06/2027</p>' +
                  '</div>' +
                '</div>' +
                '<div class="es-ma-header-sep"></div>' +
                '<div class="es-ma-header-block es-ma-club-info">' +
                  '<img class="crest" src="immagini/squadre-loghi/1000345699.png?v=20260916_FGCLOGO2" alt="' + esc(club) + '" onerror="this.onerror=null;this.src=\'immagini/squadre-loghi/foggia-city.png\';">' +
                  '<div>' +
                    '<strong>' + esc(club) + '</strong>' +
                    '<span>Prima Squadra · Staff Tecnico</span>' +
                  '</div>' +
                '</div>' +
              '</div>' +
              '<button type="button" class="es-ma-btn-quick-jump" data-ma-nav="reports">' +
                'Nuovo Report Tattico +' +
              '</button>' +
            '</div>' +

            // Riga 2: Prossima Visione + Countdown + Focus Tattico
            '<div class="es-ma-header-match-row">' +
              '<div class="es-ma-target-box">' +
                '<p class="label">Prossimo Avversario da Analizzare</p>' +
                '<strong>' + esc(nextMatch.avversario) + '</strong>' +
                '<span>' + esc(nextMatch.data) + ' · Ore ' + esc(nextMatch.orario) + ' (' + esc(nextMatch.luogo) + ')</span>' +
              '</div>' +
              '<div class="es-ma-target-box">' +
                '<p class="label">Countdown Calcio d\'Inizio</p>' +
                '<div class="es-ma-countdown-nums">' +
                  '<div><strong>' + String(nextMatch.giorniMancanti || 0).padStart(2, '0') + '</strong><span>Giorni</span></div>' +
                  '<div><strong>' + String(nextMatch.oreMancanti || 0).padStart(2, '0') + '</strong><span>Ore</span></div>' +
                  '<div><strong>' + String(nextMatch.minutiMancanti || 0).padStart(2, '0') + '</strong><span>Min</span></div>' +
                '</div>' +
              '</div>' +
              '<div class="es-ma-target-box">' +
                '<p class="label">Focus Tattico di Giornata</p>' +
                '<strong style="color:#38bdf8;">Studio Palle Inattive &amp; Transizioni Negative</strong>' +
                '<span>Consegna clip al Mister entro la rifinitura</span>' +
              '</div>' +
            '</div>' +
          '</div>' +

          // 3. TAB BAR SUPERIORE
          '<nav class="es-ma-nav-tabs">' +
            renderNavTab('dashboard', 'Dashboard', '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>') +
            renderNavTab('reports', 'Report Tattici', '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>') +
            renderNavTab('heatmap', 'Heatmap &amp; Spazi', '<circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/>') +
            renderNavTab('clips', 'Video Tagging &amp; Clip', '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 8 6 4-6 4Z"/>') +
            renderNavTab('comparatore', 'Comparatore IA', '<path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 21v-8"/><path d="m9 16 3-3 3 3"/>') +
            renderNavTab('radar', 'Radar Competenze', '<circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/>') +
            renderNavTab('canale_staff', 'Canale Staff &amp; Mister', '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/>') +
          '</nav>' +

          // 4. CONTENITORE VISTA ATTIVA
          '<div id="es-ma-active-content">' +
            renderActiveTabContent(activeTab, user, reports, clips) +
          '</div>' +
        '</main>' +
      '</div>';

    box.innerHTML = html;
    box.hidden = false;
    box.removeAttribute('hidden');
    box.style.display = 'block';

    bindAllEvents(box);
  }

  function renderSideBtn(tabKey, label, svgPath) {
    var isActive = activeTab === tabKey;
    return '<button type="button" class="es-ma-side-btn ' + (isActive ? 'is-active' : '') + '" data-ma-nav="' + tabKey + '">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke-width="2">' + svgPath + '</svg>' +
      '<span>' + esc(label) + '</span>' +
    '</button>';
  }

  function renderNavTab(tabKey, label, svgPath) {
    var isActive = activeTab === tabKey;
    return '<button type="button" class="es-ma-tab-btn ' + (isActive ? 'is-active' : '') + '" data-ma-nav="' + tabKey + '">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' + svgPath + '</svg>' +
      '<span>' + esc(label) + '</span>' +
    '</button>';
  }

  function renderActiveTabContent(tabKey, user, reports, clips) {
    switch (tabKey) {
      case 'reports':
        return renderTabReports(reports);
      case 'heatmap':
        return renderTabHeatmap();
      case 'clips':
        return renderTabClips(clips);
      case 'comparatore':
        return renderTabComparatore();
      case 'radar':
        return renderTabRadar();
      case 'canale_staff':
        return renderTabCanaleStaff(user);
      case 'impostazioni':
        return renderTabDashboard(user, reports, clips);
      case 'dashboard':
      default:
        return renderTabDashboard(user, reports, clips);
    }
  }

  // ============================================================
  // GESTIONE EVENTI & MODALI
  // ============================================================
  function bindAllEvents(container) {
    if (!container) return;

    // Switch Tab
    container.querySelectorAll('[data-ma-nav]').forEach(function (btn) {
      btn.onclick = function (e) {
        e.preventDefault();
        var t = btn.getAttribute('data-ma-nav');
        if (t === 'impostazioni') {
          openMaEditModal(userObj());
          return;
        }
        if (t) {
          activeTab = t;
          renderHub(userObj());
        }
      };
    });

    // Toggle Sidebar Mobile
    var btnToggle = container.querySelector('#btn-toggle-ma-sidebar');
    var sidebar = container.querySelector('.es-ma-sidebar');
    if (btnToggle && sidebar) {
      btnToggle.onclick = function () {
        sidebar.classList.toggle('is-open');
      };
    }

    // Azioni Operative
    container.querySelectorAll('[data-ma-act]').forEach(function (btn) {
      btn.onclick = function (e) {
        e.preventDefault();
        var act = btn.getAttribute('data-ma-act');

        if (act === 'forward-mister') {
          var title = btn.getAttribute('data-title') || 'Dossier Tattico';
          toast('Report "' + title + '" inoltrato con successo nella dashboard del Mister.', 'success');
          return;
        }

        if (act === 'forward-ds') {
          var title2 = btn.getAttribute('data-title') || 'Dossier Tattico';
          toast('Report "' + title2 + '" inviato alla casella del Direttore Sportivo.', 'success');
          return;
        }

        if (act === 'new-report') {
          var t = prompt('Titolo del Report Tattico:');
          if (!t) return;
          var avv = prompt('Avversario o Squadra esaminata:', 'Manfredonia Calcio');
          var mod = prompt('Modulo Tattico esaminato:', '4-3-3');
          var note = prompt('Punti chiave emersi dalla video analisi:');

          var list = getReportsList();
          list.unshift({
            id: 'rep-' + Date.now(),
            titolo: t.trim(),
            avv: (avv || 'Avversario').trim(),
            date: 'Oggi',
            modulo: (mod || '4-3-3').trim(),
            note: note || 'Report tattico compilato dal Match Analyst'
          });
          saveReportsList(list);
          toast('Report "' + t + '" salvato e archiviato con successo!', 'success');
          renderHub(userObj());
          return;
        }

        if (act === 'add-clip') {
          var ct = prompt('Titolo della Clip video:');
          if (!ct) return;
          var cat = prompt('Categoria (es. Palle Inattive, Costruzione Bassa, Transizione):', 'Palle Inattive');
          var dur = prompt('Durata (es. 0:45):', '0:45');

          var cList = getClipsList();
          cList.unshift({
            id: 'clip-' + Date.now(),
            title: ct.trim(),
            category: (cat || 'Tattica').trim(),
            duration: dur || '0:30',
            tags: '#video #analisi'
          });
          saveClipsList(cList);
          toast('Clip "' + ct + '" aggiunta al Video Hub!', 'success');
          renderHub(userObj());
          return;
        }

        if (act === 'play-clip') {
          var pt = btn.getAttribute('data-title') || 'Clip Video';
          toast('Riproduzione clip: ' + pt, 'info');
          return;
        }

        if (act === 'add-heat') {
          toast('Nuova heatmap caricata dal tracciamento GPS.', 'success');
          return;
        }

        if (act === 'open-compare-modal') {
          toast('Comparatore IA aperto: seleziona i calciatori per il confronto metrico.', 'info');
          return;
        }

        if (act === 'open-msgs') {
          if (window.openUserMessages) window.openUserMessages();
          else toast('Messaggistica aperta.', 'info');
          return;
        }
      };
    });
  }

  // Modale Modifica Anagrafica Match Analyst
  function openMaEditModal(user) {
    user = user || userObj();
    var backdrop = document.createElement('div');
    backdrop.className = 'es-edit-modal-backdrop';

    backdrop.innerHTML = '<div class="es-edit-modal">' +
      '<div class="es-edit-modal-head">' +
      '<h2><span>✏️</span> Modifica Anagrafica Match Analyst</h2>' +
      '<button type="button" class="es-edit-modal-close" title="Chiudi">&times;</button>' +
      '</div>' +
      '<div class="es-edit-grid">' +
      '<div class="es-edit-field"><label>Nome</label><input id="es-ma-nome" value="' + esc(user.nome || '') + '"></div>' +
      '<div class="es-edit-field"><label>Cognome</label><input id="es-ma-cognome" value="' + esc(user.cognome || '') + '"></div>' +
      '<div class="es-edit-field"><label>Qualifica FIGC / Coverciano</label><input id="es-ma-qual" value="' + esc(qualificaOf(user)) + '"></div>' +
      '<div class="es-edit-field"><label>Ruolo Ufficiale</label><input id="es-ma-role" value="Match Analyst &amp; Video Analyst" readonly></div>' +
      '<div class="es-edit-field"><label>Club Affiliato</label><input id="es-ma-club" value="' + esc(user.squadra || user.club || 'Foggia City') + '"></div>' +
      '<div class="es-edit-field"><label>Status Contrattuale</label><select id="es-ma-status">' +
      '<option value="in-staff"' + (inStaff(user) ? ' selected' : '') + '>In Staff Club (Collegato al Mister)</option>' +
      '<option value="free-agent"' + (!inStaff(user) ? ' selected' : '') + '>Free Agent / Consulente Indipendente</option>' +
      '</select></div>' +
      '<div class="es-edit-field full"><label>Metodologia Video &amp; Note Tattiche</label><textarea id="es-ma-bio" rows="3">' + esc(user.bio || 'Analisi tattica su base LongoMatch / Wyscout con tagging avanzato') + '</textarea></div>' +
      '</div>' +
      '<div class="es-edit-actions">' +
      '<button type="button" class="btn-cancel">Annulla</button>' +
      '<button type="button" class="btn-save">Salva Modifiche</button>' +
      '</div>' +
      '</div>';

    document.body.appendChild(backdrop);

    function close() {
      if (backdrop && backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
    }

    backdrop.querySelector('.es-edit-modal-close').onclick = close;
    backdrop.querySelector('.btn-cancel').onclick = close;

    backdrop.querySelector('.btn-save').onclick = function () {
      var nome = backdrop.querySelector('#es-ma-nome').value.trim();
      var cognome = backdrop.querySelector('#es-ma-cognome').value.trim();
      var qual = backdrop.querySelector('#es-ma-qual').value.trim();
      var clb = backdrop.querySelector('#es-ma-club').value.trim();
      var ctr = backdrop.querySelector('#es-ma-status').value;
      var bio = backdrop.querySelector('#es-ma-bio').value.trim();

      user.nome = nome;
      user.cognome = cognome;
      user.squadra = clb || 'Foggia City';
      user.club = clb || 'Foggia City';
      user.maQualifica = qual;
      user.qualificaMa = qual;
      user.maContract = ctr;
      user.contractStatus = ctr;
      user.bio = bio;

      try {
        localStorage.setItem('elisee_active_user', JSON.stringify(user));
        localStorage.setItem('elisee_user_data', JSON.stringify(user));
      } catch (_) {}

      close();
      toast('Anagrafica Match Analyst salvata con successo!', 'success');
      renderHub(user);
    };
  }

  // ============================================================
  // EXPORT GLOBALE & LISTENER
  // ============================================================
  window.EliseeMaDash = {
    render: renderHub,
    isMa: isMa,
    inStaff: inStaff,
    qualificaOf: qualificaOf
  };

  document.addEventListener('elisee:view-changed', function (e) {
    var d = e && e.detail;
    if (d && d.view === 'user-dossier') {
      try {
        var u = userObj();
        if (isMa(u)) renderHub(u);
      } catch (_) {}
    }
  });

  document.addEventListener('elisee:role-changed', function (e) {
    var d = e && e.detail;
    try {
      var u = (d && d.user) || userObj();
      if (isMa(u)) renderHub(u);
    } catch (_) {}
  });

  window.addEventListener('hashchange', function () {
    if (window.location.hash.indexOf('user-dossier') >= 0 && isMa()) {
      setTimeout(renderHub, 50);
    }
  });

  document.addEventListener('DOMContentLoaded', function () {
    if (window.location.hash.indexOf('user-dossier') >= 0 && isMa()) {
      setTimeout(renderHub, 100);
    }
  });
})();
