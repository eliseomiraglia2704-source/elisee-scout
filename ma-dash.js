/* ============================================================
   ELISEE SCOUT — DASHBOARD MATCH ANALYST & VIDEO ANALYST (JS)
   Layout Professionale B2B — Tactical Intelligence OS
   ============================================================ */
(function () {
  'use strict';

  var LAB_KEY = 'elisee_ma_lab';
  var FEED_KEY = 'elisee_ma_public_feed';
  var INBOX_KEY = 'elisee_ma_inbox';
  var TAGS_KEY = 'elisee_player_ma_tags';

  var AXES = [
    'Lettura Tattica', 'Analisi Video', 'Tagging Palle Inattive', 'Heatmap & Occupazione Spazi',
    'Report Post-Gara', 'Studio Avversario', 'Integrazione GPS / Fisico', 'Comunicazione Staff'
  ];
  var V2025 = [93, 91, 88, 90, 92, 89, 87, 94];
  var V2023 = [79, 78, 72, 75, 78, 74, 73, 82];

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
    var html = '<svg viewBox="0 0 440 430" style="width:100%; height:auto; max-height:320px;" role="img" aria-label="Analisi competenze tattiche e video">';
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
      window.unmountAllRoleDashboards('es-mad');
    }
  }

  var QUALS = [
    'Match Analyst FIGC / Coverciano',
    'Video Analyst Professionista',
    'Tactical Analyst UEFA'
  ];

  function inStaff(u) {
    u = u || userObj();
    var st = String(u.maContract || u.contractStatus || '').toLowerCase();
    if (st === 'free' || st === 'free-agent' || st === 'consulente') return false;
    if (st === 'staff' || st === 'in-staff' || st === 'contract') return true;
    return !!(u.squadra || u.club);
  }

  function qualificaOf(u) {
    return String((u && (u.maQualifica || u.qualificaMa || u.certificazione)) || '').trim() || 'Match Analyst Coverciano';
  }

  function slug(s) {
    return String(s || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function meKey() {
    var u = userObj();
    return slug(u.email || u.username || u.nome || 'me');
  }

  function loadLab() {
    try {
      var raw = localStorage.getItem(LAB_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (_) { return {}; }
  }
  function saveLab(data) {
    try { localStorage.setItem(LAB_KEY, JSON.stringify(data || {})); } catch (_) {}
  }
  function myLab() {
    var all = loadLab();
    var k = meKey();
    if (!all[k] || typeof all[k] !== 'object') {
      all[k] = { reports: [], clips: [], heatmaps: [], gps: [], tags: [] };
    }
    return all[k];
  }
  function persistLab(lab) {
    var all = loadLab();
    all[meKey()] = lab;
    saveLab(all);
  }

  function toast(msg, kind) {
    if (typeof window.showToast === 'function') window.showToast(msg, kind || 'success');
  }

  function loadMap(k) {
    try { var raw = localStorage.getItem(k); return raw ? JSON.parse(raw) : {}; } catch (_) { return {}; }
  }
  function saveMap(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v || {})); } catch (_) {}
  }

  function pushInbox(item) {
    var u = userObj();
    var club = String(u.squadra || u.club || '').trim();
    if (!club) return false;
    var map = loadMap(INBOX_KEY);
    var k = slug(club);
    if (!map[k] || !Array.isArray(map[k].items)) map[k] = { items: [] };
    map[k].items.unshift(item);
    map[k].updatedAt = new Date().toISOString();
    saveMap(INBOX_KEY, map);
    return true;
  }

  function savePlayerTag(name, patch) {
    if (!name) return;
    var map = loadMap(TAGS_KEY);
    var k = slug(name);
    var cur = map[k] || { badges: [], mention: null, adaptedRole: '', clips: [] };
    if (patch.badge) {
      cur.badges = Array.isArray(cur.badges) ? cur.badges : [];
      cur.badges.unshift(patch.badge);
      cur.badges = cur.badges.slice(0, 8);
    }
    if (patch.mention) cur.mention = patch.mention;
    if (patch.adaptedRole) cur.adaptedRole = patch.adaptedRole;
    if (patch.clip) {
      cur.clips = Array.isArray(cur.clips) ? cur.clips : [];
      cur.clips.unshift(patch.clip);
      cur.clips = cur.clips.slice(0, 8);
    }
    map[k] = cur;
    saveMap(TAGS_KEY, map);
  }

  function pushPublic(item) {
    var list = [];
    try { list = JSON.parse(localStorage.getItem(FEED_KEY) || '[]') || []; } catch (_) { list = []; }
    if (!Array.isArray(list)) list = [];
    list.unshift(item);
    try { localStorage.setItem(FEED_KEY, JSON.stringify(list.slice(0, 40))); } catch (_) {}
  }

  function overlayPitch(heatmaps) {
    var colors = ['#38bdf8', '#facc15', '#4ade80', '#f472b6', '#fb923c'];
    var html = '<svg class="es-ma-pitch" viewBox="0 0 360 210" role="img" aria-label="Sovrapposizione heatmap di squadra">';
    html += '<rect width="360" height="210" rx="8" fill="#0f291e"/>';
    html += '<rect x="8" y="8" width="344" height="194" fill="none" stroke="rgba(56,189,248,0.25)" stroke-width="1.5"/>';
    html += '<line x1="180" y1="8" x2="180" y2="202" stroke="rgba(56,189,248,0.25)" stroke-width="1"/>';
    html += '<circle cx="180" cy="105" r="26" fill="none" stroke="rgba(56,189,248,0.25)"/>';
    html += '<rect x="8" y="65" width="34" height="80" fill="none" stroke="rgba(56,189,248,0.25)"/>';
    html += '<rect x="318" y="65" width="34" height="80" fill="none" stroke="rgba(56,189,248,0.25)"/>';
    var items = (heatmaps || []).filter(function (h) { return !h.overlay; }).slice(0, 5);
    if (!items.length) {
      html += '<ellipse cx="70" cy="105" rx="46" ry="60" fill="rgba(56,189,248,0.28)"/>';
      html += '<ellipse cx="180" cy="105" rx="38" ry="48" fill="rgba(250,204,21,0.22)"/>';
      html += '<ellipse cx="290" cy="105" rx="46" ry="60" fill="rgba(74,222,128,0.28)"/>';
    } else {
      items.forEach(function (h, i) {
        var col = colors[i % colors.length];
        var x = 70 + (i * 52) % 220;
        var y = 75 + (i % 3) * 26;
        html += '<ellipse cx="' + x + '" cy="' + y + '" rx="48" ry="40" fill="' + col + '" opacity="0.35"/>';
      });
    }
    html += '</svg>';
    return html;
  }

  function html(user) {
    user = user || userObj();
    var name = maName(user);
    var ph = photoOf(user);
    var initText = esc(initials(name));
    var on = inStaff(user);
    var club = String(user.squadra || user.club || '').trim();
    var qual = qualificaOf(user);
    var lab = myLab();
    var nReps = (lab.reports || []).length;
    var nClips = (lab.clips || []).length;
    var nHeat = (lab.heatmaps || []).length;

    // Avatar sicuro
    var avaHtml;
    if (ph && ph.length > 5 && !/simulated|null|undefined/i.test(ph)) {
      avaHtml = '<img src="' + esc(ph) + '" alt="" class="es-ma-avatar" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\';">' +
        '<div class="es-ma-avatar-fallback" style="display:none;">' + initText + '</div>';
    } else {
      avaHtml = '<div class="es-ma-avatar-fallback">' + initText + '</div>';
    }

    var statusBadge = on
      ? '<span class="es-ma-badge-tag cyan">In Staff Club</span>'
      : '<span class="es-ma-badge-tag emerald">Free Agent</span>';

    var clubDisplay = club
      ? '<span style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:flex; align-items:center; gap:4px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' + esc(club) + '</span>'
      : '<span style="font-size:0.75rem; color:#94a3b8; font-weight:500;">Consulente Esterno Indipendente</span>';

    return '' +
      // DOCK LATERALE SINISTRO
      '<aside class="es-pd-rail">' +
        '<button type="button" data-ma="home" title="Home">' + ico('<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>') + '</button>' +
        '<button type="button" class="is-on" data-ma="dash" title="Dashboard">' + ico('<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>') + '</button>' +
        '<button type="button" data-ma="rep-priv" title="Report Privato">' + ico('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>') + '</button>' +
        '<button type="button" data-ma="heatmap" title="Heatmap Tattica">' + ico('<circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/>') + '</button>' +
        '<button type="button" data-ma="msgs" title="Messaggi Staff">' + ico('<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>') + '</button>' +
        '<button type="button" class="es-pd-rail-end" data-ma="edit" title="Modifica Anagrafica">' + ico('<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>') + '</button>' +
      '</aside>' +

      // SHELL PRINCIPALE
      '<div class="es-ma-shell">' +

        // 1. TOP HEADER BAR
        '<div class="es-ma-header-bar">' +
          '<div class="es-ma-title-wrap">' +
            '<div class="es-ma-breadcrumb">Elisee Scout &rsaquo; Area Riservata Professionale &rsaquo; Match &amp; Video Analysis</div>' +
            '<h1>Dashboard Match Analyst &amp; Video Analyst</h1>' +
          '</div>' +
          '<div class="es-ma-header-actions">' +
            '<button type="button" class="es-ma-btn-secondary" data-ma="send-staff">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></svg>' +
              '<span>Inoltra a DS e Mister</span>' +
            '</button>' +
            '<button type="button" class="es-ma-btn-primary" data-ma="rep-priv">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
              '<span>Nuovo Report Tattico</span>' +
            '</button>' +
          '</div>' +
        '</div>' +

        // 2. RIGA SUPERIORE (2 COLONNE: PROFILO & LABORATORIO TATTICO)
        '<div class="es-ma-grid-2col">' +

          // CARD 1: PROFILO MATCH ANALYST
          '<section class="es-ma-card">' +
            '<div class="es-ma-card-head">' +
              '<h2 class="es-ma-card-title">' +
                '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
                '<span>Profilo Ufficiale Analyst</span>' +
              '</h2>' +
              '<div style="display:flex; gap:6px; align-items:center;">' +
                '<span class="es-ma-badge-tag cyan">Coverciano FIGC</span>' +
                statusBadge +
              '</div>' +
            '</div>' +

            '<div class="es-ma-profile-row">' +
              avaHtml +
              '<div class="es-ma-user-meta">' +
                '<b class="es-ma-user-name">' + esc(name) + '</b>' +
                '<div class="es-ma-user-badges">' +
                  '<span style="font-size:0.72rem; color:#38bdf8; background:rgba(56,189,248,0.12); border:1px solid rgba(56,189,248,0.28); border-radius:4px; padding:2px 6px; font-weight:800; text-transform:uppercase;">Match Analyst</span>' +
                  clubDisplay +
                '</div>' +
              '</div>' +
            '</div>' +

            // Barra di completamento anagrafica
            '<div class="es-ma-onboarding-bar-box">' +
              '<div class="es-ma-onboarding-label-row">' +
                '<span>Completamento Anagrafica &amp; Abilitazione</span>' +
                '<span style="color:#38bdf8; font-weight:900;">85%</span>' +
              '</div>' +
              '<div class="es-ma-progress-track">' +
                '<div class="es-ma-progress-fill" style="width:85%;"></div>' +
              '</div>' +
              '<div style="display:flex; justify-content:flex-end; margin-top:6px;">' +
                '<button type="button" class="es-pd-edit" data-ma="edit" style="font-size:0.72rem; color:#38bdf8; background:none; border:none; cursor:pointer; font-weight:700; padding:0;">✏️ Modifica Anagrafica</button>' +
              '</div>' +
            '</div>' +

            // Credenziali in grid compatta
            '<div class="es-ma-cred-grid">' +
              '<div class="es-ma-cred-item">' +
                '<span>Qualifica Ufficiale</span>' +
                '<b>' + esc(qual) + '</b>' +
              '</div>' +
              '<div class="es-ma-cred-item">' +
                '<span>Collegamento Staff</span>' +
                '<b>' + (on ? 'In Staff con Mister e DS' : 'Consulente Esterno') + '</b>' +
              '</div>' +
            '</div>' +
          '</section>' +

          // CARD 2: LABORATORIO DATI, TATTICA & PITCH HEATMAP
          '<section class="es-ma-card">' +
            '<div class="es-ma-card-head">' +
              '<h2 class="es-ma-card-title">' +
                '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>' +
                '<span>Laboratorio Tattico &amp; Sovrapposizione Heatmap</span>' +
              '</h2>' +
              '<span class="es-ma-badge-tag emerald">Lab Live</span>' +
            '</div>' +

            '<div class="es-ma-pitch-wrap">' +
              overlayPitch(lab.heatmaps) +
              '<div style="font-size:0.72rem; color:#94a3b8; text-align:center;">' +
                'Sovrapposizione squadra: <b>' + nHeat + '</b> heatmap · <b>' + nClips + '</b> clip video · <b>' + nReps + '</b> report archiviati' +
              '</div>' +
            '</div>' +

            '<div class="es-ma-quick-actions">' +
              '<button type="button" class="es-ma-quick-btn" data-ma="heatmap">🔥 Valida Heatmap</button>' +
              '<button type="button" class="es-ma-quick-btn" data-ma="overlay">👥 Sovrapponi Squadra</button>' +
              '<button type="button" class="es-ma-quick-btn" data-ma="clip">🎬 Indicizza Clip</button>' +
              '<button type="button" class="es-ma-quick-btn" data-ma="gps">⚡ Report GPS</button>' +
            '</div>' +
          '</section>' +

        '</div>' + // Fine riga 1

        // 3. STRUMENTI OPERATIVI — AZIONI MATCH ANALYST (GRID A 3 COLONNE)
        '<section class="es-ma-card" style="padding:1.25rem 1.35rem;">' +
          '<div class="es-ma-card-head">' +
            '<h2 class="es-ma-card-title">' +
              '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>' +
              '<span>Strumenti Operativi — Azioni Match Analyst</span>' +
            '</h2>' +
            '<span class="es-ma-badge-tag cyan">Tactical Suite v3.0</span>' +
          '</div>' +

          '<div class="es-ma-actions-grid">' +
            '<button type="button" class="es-ma-action-card" data-ma="rep-priv">' +
              '<div class="es-ma-action-icon">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>' +
              '</div>' +
              '<div class="es-ma-action-text">' +
                '<b>Nuovo Report Privato</b>' +
                '<span>Analisi tattica in-house riservata solo a Mister e DS.</span>' +
              '</div>' +
            '</button>' +

            '<button type="button" class="es-ma-action-card" data-ma="rep-pub">' +
              '<div class="es-ma-action-icon">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' +
              '</div>' +
              '<div class="es-ma-action-text">' +
                '<b>Report Pubblico / Menzione</b>' +
                '<span>Focus prestazionale che alimenta il portfolio e la Card.</span>' +
              '</div>' +
            '</button>' +

            '<button type="button" class="es-ma-action-card" data-ma="tag">' +
              '<div class="es-ma-action-icon">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>' +
              '</div>' +
              '<div class="es-ma-action-text">' +
                '<b>Assegna Badge Tattico</b>' +
                '<span>Certifica ruoli secondari, posizioni adattate e skill speciali.</span>' +
              '</div>' +
            '</button>' +

            '<button type="button" class="es-ma-action-card" data-ma="opponent">' +
              '<div class="es-ma-action-icon">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>' +
              '</div>' +
              '<div class="es-ma-action-text">' +
                '<b>Studio Avversario Pre-Gara</b>' +
                '<span>Analisi palle inattive, punti deboli e uscite in pressione.</span>' +
              '</div>' +
            '</button>' +

            '<button type="button" class="es-ma-action-card" data-ma="clip">' +
              '<div class="es-ma-action-icon">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>' +
              '</div>' +
              '<div class="es-ma-action-text">' +
                '<b>Clip Hub &amp; Video Tagging</b>' +
                '<span>Indicizza azioni chiave collegate alle schede atleti.</span>' +
              '</div>' +
            '</button>' +

            '<button type="button" class="es-ma-action-card" data-ma="send-staff">' +
              '<div class="es-ma-action-icon">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>' +
              '</div>' +
              '<div class="es-ma-action-text">' +
                '<b>Inoltra Dossier a DS &amp; Mister</b>' +
                '<span>Condivisione immediata dei briefing per la rifinitura.</span>' +
              '</div>' +
            '</button>' +
          '</div>' +
        '</section>' +

        // 4. RIGA ANALITICA (3 COLONNE: RADAR, PERMESSI, LIMITI DI RUOLO)
        '<div class="es-ma-grid-3col">' +

          // COLONNA 1: QUADRO TATTICO (RADAR)
          '<section class="es-ma-card">' +
            '<div class="es-ma-card-head">' +
              '<h2 class="es-ma-card-title">' +
                '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/></svg>' +
                '<span>Quadro Tattico</span>' +
              '</h2>' +
              '<span class="es-ma-badge-tag cyan">Radar Operativo</span>' +
            '</div>' +
            '<div style="display:flex; justify-content:center; align-items:center; padding:0.5rem 0;">' +
              radarSvg() +
            '</div>' +
            '<div style="display:flex; justify-content:space-between; font-size:0.7rem; color:#94a3b8; border-top:1px solid rgba(148,163,184,0.08); padding-top:0.6rem; margin-top:auto;">' +
              '<span>Media Benchmark: <b>77%</b></span>' +
              '<span style="color:#38bdf8;">Indice Analyst: <b>91%</b></span>' +
            '</div>' +
          '</section>' +

          // COLONNA 2: ATTIVITÀ & PERMESSI ABILITATI
          '<section class="es-ma-card">' +
            '<div class="es-ma-card-head">' +
              '<h2 class="es-ma-card-title">' +
                '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>' +
                '<span>Attività &amp; Permessi</span>' +
              '</h2>' +
              '<span class="es-ma-badge-tag emerald">Abilitato</span>' +
            '</div>' +

            '<ul class="es-ma-checklist">' +
              '<li>' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' +
                '<span><b>Inoltro report allo staff</b> — briefing tattici per l\'Allenatore e valutazioni al Direttore Sportivo.</span>' +
              '</li>' +
              '<li>' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' +
                '<span><b>Tagging e Menzioni sulle Card</b> — assegnazione badge tattici e menzioni speciali certificate sulla Card atleti.</span>' +
              '</li>' +
              '<li>' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' +
                '<span><b>Laboratorio Heatmap &amp; GPS</b> — convalida occupazione spazi, ampiezza e picchi di intensità.</span>' +
              '</li>' +
              '<li>' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' +
                '<span><b>Export dossier per la squadra</b> — generazione schede per riunioni video e briefing individuale.</span>' +
              '</li>' +
            '</ul>' +
          '</section>' +

          // COLONNA 3: LIMITI DI RUOLO & COMPLIANCE (Rosso Tenue Luxury Desaturato)
          '<section class="es-ma-card es-ma-limits-card">' +
            '<div class="es-ma-card-head">' +
              '<h2 class="es-ma-card-title">' +
                '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fda4af" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' +
                '<span style="color:#fda4af;">Limiti di Ruolo &amp; Governance</span>' +
              '</h2>' +
              '<span class="es-ma-badge-tag rose">Compliance</span>' +
            '</div>' +

            '<ul class="es-ma-limits-list">' +
              '<li>' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>' +
                '<span><b>Nessuna modifica della rosa ufficiale</b> — Modifiche societarie riservate a Presidente e Segretario.</span>' +
              '</li>' +
              '<li>' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>' +
                '<span><b>Nessuna gestione trattative ufficiali</b> — Compravendite e contratti riservati al Direttore Sportivo.</span>' +
              '</li>' +
              '<li>' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>' +
                '<span><b>Inoltro in staff riservato</b> — Report privati in-house accessibili solo a membri autorizzati del club.</span>' +
              '</li>' +
            '</ul>' +
          '</section>' +

        '</div>' + // Fine riga 3

        // 5. REGISTRO ANALISI & DOSSIER RECENTI (EMPTY-STATE O LISTA)
        '<section class="es-ma-card">' +
          '<div class="es-ma-card-head">' +
            '<h2 class="es-ma-card-title">' +
              '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
              '<span>Registro Analisi &amp; Dossier Recenti</span>' +
            '</h2>' +
            '<span class="es-ma-badge-tag cyan">Archivio Tattico</span>' +
          '</div>' +

          ((lab.reports && lab.reports.length)
            ? ('<div style="display:flex; flex-direction:column; gap:0.5rem; padding:0.5rem 0;">' +
                lab.reports.slice(0, 5).map(function (r) {
                  return '<div style="background:#060911; border:1px solid rgba(56,189,248,0.12); border-radius:8px; padding:0.65rem 0.85rem; display:flex; justify-content:space-between; align-items:center;">' +
                    '<div>' +
                      '<b style="color:#f8fafc; font-size:0.82rem; display:block;">' + esc(r.title) + '</b>' +
                      '<span style="color:#94a3b8; font-size:0.72rem;">' + esc(r.note || r.kind) + (r.player ? (' · Atleta: ' + esc(r.player)) : '') + '</span>' +
                    '</div>' +
                    '<span class="es-ma-badge-tag ' + (r.channel === 'public' ? 'emerald' : 'cyan') + '">' + esc(r.channel === 'public' ? 'Pubblico' : 'Privato') + '</span>' +
                  '</div>';
                }).join('') +
              '</div>')
            : ('<div class="es-ma-empty-wrap">' +
                '<div class="es-ma-empty-icon">' +
                  '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>' +
                '</div>' +
                '<div class="es-ma-empty-title">Nessuna analisi archiviata di recente</div>' +
                '<div class="es-ma-empty-sub">Crea un nuovo report tattico in-house o un focus pubblico per arricchire il tuo portfolio professionale e aggiornare la lavagna dello staff.</div>' +
                '<div style="display:flex; gap:8px; margin-top:0.4rem;">' +
                  '<button type="button" class="es-ma-btn-primary" data-ma="rep-priv" style="font-size:0.75rem; padding:0.45rem 0.85rem;">+ Nuovo Report Privato</button>' +
                  '<button type="button" class="es-ma-btn-secondary" data-ma="rep-pub" style="font-size:0.75rem; padding:0.45rem 0.85rem;">🌟 Focus Pubblico</button>' +
                '</div>' +
              '</div>')
          ) +
        '</section>' +

      '</div>'; // Fine shell
  }

  function promptField(label, def) {
    var v = window.prompt(label, def || '');
    return v == null ? null : String(v).trim();
  }

  function addReport(channel) {
    var title = promptField('Titolo del report tattico');
    if (!title) return;
    var kindRaw = promptField('Tipo: focus / post-gara / pillola / avversario', channel === 'public' ? 'focus' : 'post-gara');
    if (kindRaw == null) return;
    var kind = String(kindRaw || 'post-gara').toLowerCase();
    if (/focus/.test(kind)) kind = 'focus';
    else if (/pillola/.test(kind)) kind = 'pillola';
    else if (/avvers/.test(kind)) kind = 'avversario';
    else kind = 'post-gara';
    var note = promptField('Sintesi tattica e note di campo');
    if (note == null) return;
    var player = '';
    if (kind === 'focus') {
      var plFocus = promptField('Calciatore in focus (tag sulla Card)');
      if (plFocus == null) return;
      player = plFocus;
    }
    var rec = {
      id: 'r-' + Date.now(),
      title: title,
      kind: kind,
      channel: channel,
      note: note,
      player: player,
      at: new Date().toISOString()
    };
    var lab = myLab();
    lab.reports.unshift(rec);
    persistLab(lab);
    if (channel === 'public') {
      pushPublic({
        title: title,
        kind: kind,
        note: note,
        player: player,
        from: meKey(),
        fromName: maName(userObj()),
        at: rec.at
      });
      if (player) {
        savePlayerTag(player, {
          mention: {
            title: title,
            note: note,
            analyst: maName(userObj()),
            at: rec.at
          }
        });
      }
    }
    toast(channel === 'public'
      ? (player ? 'Report pubblico: Menzione Speciale sulla Card di ' + player + '.' : 'Report pubblico registrato in portfolio.')
      : 'Report privato in-house registrato con successo (Allenatore / DS).');
    render(userObj());
  }

  function openMaEditModal(user) {
    user = user || userObj();
    var backdrop = document.createElement('div');
    backdrop.className = 'es-edit-modal-backdrop';
    var on = inStaff(user);
    var qNow = qualificaOf(user);
    var qOpts = QUALS.map(function (q) {
      return '<option value="' + esc(q) + '"' + (qNow === q ? ' selected' : '') + '>' + esc(q) + '</option>';
    }).join('');
    if (qNow && QUALS.indexOf(qNow) < 0) {
      qOpts = '<option value="' + esc(qNow) + '" selected>' + esc(qNow) + '</option>' + qOpts;
    }

    backdrop.innerHTML = '<div class="es-edit-modal">' +
      '<div class="es-edit-modal-head">' +
      '<h2><span>✏️</span> Modifica Anagrafica Match Analyst / Video Analyst</h2>' +
      '<button type="button" class="es-edit-modal-close" title="Chiudi">&times;</button>' +
      '</div>' +
      '<div class="es-edit-grid">' +
      '<div class="es-edit-field"><label>Nome</label><input id="es-ma-nome" value="' + esc(user.nome || '') + '"></div>' +
      '<div class="es-edit-field"><label>Cognome</label><input id="es-ma-cognome" value="' + esc(user.cognome || '') + '"></div>' +
      '<div class="es-edit-field"><label>Ruolo Ufficiale</label><input id="es-ma-role" value="Match Analyst / Video Analyst" readonly></div>' +
      '<div class="es-edit-field"><label>Qualifica / certificazione</label><select id="es-ma-qual">' +
        '<option value="">— seleziona —</option>' + qOpts + '</select></div>' +
      '<div class="es-edit-field"><label>Status contrattuale</label><select id="es-ma-contract">' +
        '<option value="staff"' + (on ? ' selected' : '') + '>In Staff Club</option>' +
        '<option value="free"' + (!on ? ' selected' : '') + '>Free Agent / Consulente Esterno</option>' +
      '</select></div>' +
      '<div class="es-edit-field"><label>Club / Organizzazione</label><input id="es-ma-club" value="' + esc(user.squadra || user.club || '') + '" placeholder="Vuoto = Consulente Esterno"></div>' +
      '<div class="es-edit-field full"><label>Bio &amp; Note Operative</label><textarea id="es-ma-bio" rows="3">' + esc(user.bio || '') + '</textarea></div>' +
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
      var n = document.getElementById('es-ma-nome').value.trim();
      var c = document.getElementById('es-ma-cognome').value.trim();
      var clb = document.getElementById('es-ma-club').value.trim();
      var bio = document.getElementById('es-ma-bio').value.trim();
      var qual = (document.getElementById('es-ma-qual') || {}).value || '';
      var ctr = (document.getElementById('es-ma-contract') || {}).value || 'free';
      if (ctr === 'staff' && !clb) {
        toast('In Staff Club richiede il club di appartenenza.', 'error');
        return;
      }

      user.nome = n || user.nome;
      user.cognome = c || user.cognome;
      user.fullName = (user.nome + ' ' + user.cognome).trim();
      user.squadra = clb;
      user.club = clb;
      user.bio = bio;
      user.maQualifica = qual;
      user.qualificaMa = qual;
      user.maContract = ctr;
      user.contractStatus = ctr;

      try {
        localStorage.setItem('elisee_active_user', JSON.stringify(user));
        localStorage.setItem('elisee_user_data', JSON.stringify(user));
      } catch (_) {}

      close();
      toast('Anagrafica Match Analyst salvata con successo!', 'success');
      render(user);
    });
  }

  function bind(host) {
    if (!host || host.dataset.maBound === '1') return;
    host.dataset.maBound = '1';
    host.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ma]');
      if (!b) return;
      var k = b.getAttribute('data-ma');
      if (k === 'home' && window.switchView) window.switchView('home', '#hero');
      if (k === 'dash' && window.switchView) window.switchView('user-dossier', '#user-dossier-portal');
      if (k === 'msgs' && window.openUserMessages) window.openUserMessages();
      if (k === 'edit') { openMaEditModal(userObj()); return; }
      if (k === 'rep-priv' || k === 'new-report') { addReport('private'); return; }
      if (k === 'rep-pub') { addReport('public'); return; }
      if (k === 'heatmap') {
        var pl = promptField('Calciatore della heatmap da validare');
        if (!pl) return;
        var lab = myLab();
        lab.heatmaps.unshift({ title: pl, note: 'Heatmap post-gara validata', at: new Date().toISOString() });
        persistLab(lab);
        toast('Heatmap validata: occupazione spazi e principi di gioco.');
        render(userObj());
        return;
      }
      if (k === 'overlay') {
        var labh = myLab();
        var nHeat = labh.heatmaps.filter(function (h) { return !h.overlay; }).length;
        if (!nHeat) {
          toast('Valida prima almeno una heatmap individuale.', 'error');
          return;
        }
        labh.heatmaps.unshift({
          title: 'Sovrapposizione squadra',
          note: 'Ampiezza, uscite in pressione, densità centrale',
          overlay: true,
          at: new Date().toISOString()
        });
        persistLab(labh);
        toast('Heatmap di squadra sovrapposta: ampiezza, pressione, densità centrale.');
        render(userObj());
        return;
      }
      if (k === 'gps') {
        var t = promptField('Titolo report GPS (picchi fisici / HSR)');
        if (!t) return;
        var noteG = promptField('Velocità max / sprint / accelerazioni / HSR');
        if (noteG == null) return;
        if (!noteG) noteG = 'Picchi fisici incrociati con la tattica';
        var labg = myLab();
        labg.gps.unshift({ title: t, note: noteG, at: new Date().toISOString() });
        persistLab(labg);
        if (inStaff()) {
          var gpsOk = pushInbox({
            id: 'gps-' + Date.now(),
            title: t,
            kind: 'gps',
            channel: 'private',
            note: noteG,
            from: meKey(),
            fromName: maName(userObj()),
            to: ['allenatore', 'preparatore'],
            at: new Date().toISOString()
          });
          toast(gpsOk
            ? 'Report GPS inviato all’Allenatore e al Preparatore atletico.'
            : 'Indica il club in anagrafica per inviare il GPS allo staff.', gpsOk ? 'success' : 'error');
        } else {
          toast('Report GPS salvato nel laboratorio. Passa a In Staff Club per inviarlo ad Allenatore e Preparatore.');
        }
        render(userObj());
        return;
      }
      if (k === 'clip') {
        var ct = promptField('Titolo clip (es. Transizioni positive)');
        if (!ct) return;
        var tag = promptField('Tag: palle inattive / transizioni / costruzione', 'transizioni');
        if (tag == null) return;
        if (!tag) tag = 'transizioni';
        var whoC = promptField('Calciatore collegato alla Card (opzionale)');
        if (whoC == null) return;
        var labc = myLab();
        labc.clips.unshift({ title: ct, kind: tag, player: whoC, at: new Date().toISOString() });
        persistLab(labc);
        if (whoC) {
          savePlayerTag(whoC, {
            clip: { title: ct, kind: tag, analyst: maName(userObj()), at: new Date().toISOString() }
          });
        }
        toast(whoC ? 'Clip indicizzata e collegata alla Card di ' + whoC + '.' : 'Clip indicizzata nel Clip Hub.');
        render(userObj());
        return;
      }
      if (k === 'opponent') {
        var opp = promptField('Squadra avversaria da analizzare');
        if (!opp) return;
        var oppN = promptField('Note tattiche pre-gara (punti deboli, palle inattive)');
        if (oppN == null) return;
        var labo = myLab();
        labo.reports.unshift({
          id: 'opp-' + Date.now(),
          title: 'Dossier avversario: ' + opp,
          kind: 'avversario',
          channel: 'private',
          note: oppN,
          at: new Date().toISOString()
        });
        persistLab(labo);
        toast('Dossier avversario salvato nei report privati.');
        render(userObj());
        return;
      }
      if (k === 'tag') {
        var whoT = promptField('Calciatore da taggare sulla Card');
        if (!whoT) return;
        var bName = promptField('Badge tattico (es. Regista mobile, Mastino, Falso nove, Ala invertita)');
        if (!bName) return;
        savePlayerTag(whoT, { badge: { label: bName, analyst: maName(userObj()), at: new Date().toISOString() } });
        var labt = myLab();
        labt.tags.unshift({ player: whoT, tag: bName, at: new Date().toISOString() });
        persistLab(labt);
        toast('Badge "' + bName + '" applicato alla Card di ' + whoT + '.');
        render(userObj());
        return;
      }
      if (k === 'send-staff') {
        if (!inStaff()) {
          toast('Funzione riservata a Match Analyst in Staff Club.', 'error');
          return;
        }
        var uClb = String(userObj().squadra || userObj().club || '').trim();
        var ok = pushInbox({
          id: 'dossier-' + Date.now(),
          title: 'Dossier tattico completo post-gara',
          kind: 'dossier',
          channel: 'private',
          note: 'Heatmap, metriche GPS e clip condivise con Allenatore e DS',
          from: meKey(),
          fromName: maName(userObj()),
          to: ['allenatore', 'ds'],
          at: new Date().toISOString()
        });
        toast(ok ? 'Dossier inviato ad Allenatore e DS di ' + uClb + '.' : 'Errore durante l\'invio dello staff report.', ok ? 'success' : 'error');
        return;
      }
      if (k === 'export') {
        toast('Generazione export dossier tattico PDF / JSON...', 'info');
        return;
      }
    });
  }

  function render(user) {
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
    box.innerHTML = html(user);
    box.hidden = false;
    box.removeAttribute('hidden');
    box.style.display = 'grid';

    host.classList.add('es-ma-on');
    host.classList.remove('es-pd-on', 'es-ds-on', 'es-pres-on', 'es-vice-on', 'es-fisio-on', 'es-obs-on', 'es-med-on', 'es-tm-on', 'es-gk-on', 'es-at-on', 'es-yg-on');

    if (group) {
      group.classList.add('is-ma-dash');
      group.classList.remove('is-coach-dash', 'is-ds-dash', 'is-pres-dash', 'is-vice-dash', 'is-fisio-dash', 'is-obs-dash', 'is-med-dash', 'is-tm-dash', 'is-gk-dash', 'is-at-dash', 'is-yg-dash');
    }
    bind(host);
  }

  window.EliseeMaDash = {
    render: render,
    isMa: isMa,
    inStaff: inStaff,
    qualificaOf: qualificaOf
  };

  document.addEventListener('elisee:view-changed', function (e) {
    var d = e && e.detail;
    if (d && d.view === 'user-dossier') {
      try {
        var u = userObj();
        if (isMa(u)) render(u);
      } catch (_) {}
    }
  });

  document.addEventListener('elisee:role-changed', function (e) {
    var d = e && e.detail;
    try {
      var u = (d && d.user) || userObj();
      if (isMa(u)) render(u);
    } catch (_) {}
  });
})();
