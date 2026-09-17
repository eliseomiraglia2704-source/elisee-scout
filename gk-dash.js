/* ============================================================
   ELISEE SCOUT — AREA PREPARATORE DEI PORTIERI (CONTROL ROOM)
   Technical Staff Operating System — Goalkeeper Technical OS
   Navigazione gestionale unificata nella sidebar sinistra e tab bar superiore
   ============================================================ */
(function () {
  'use strict';

  var activeTab = 'dashboard'; // 'dashboard' | 'gk_room' | 'schede' | 'reattivita' | 'badge' | 'radar' | 'canale_mister' | 'impostazioni'

  var AXES = [
    'Presa & Tuffo', 'Uscite Alte (Traiettorie)', 'Uscite Basse (1v1)', 'Costruzione dal Basso (Piedi)',
    'Reattività Visiva & Riflessi', 'Posizionamento Tra i Pali', 'Comando Vocale Difesa', 'Condizione Atletica GK'
  ];
  var V2025 = [93, 91, 88, 86, 95, 92, 94, 90];
  var V2023 = [80, 78, 73, 70, 82, 80, 81, 77];

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

  function inStaff(u) {
    u = u || userObj();
    var st = String(u.contractStatus || '').toLowerCase();
    if (st === 'free agent' || st === 'free') return false;
    return !!(u.squadra || u.club);
  }

  function qualificaOf(u) {
    return String((u && (u.abilitazione || u.qualifica || u.certificazione)) || '').trim() || 'Preparatore Portieri FIGC / UEFA GK';
  }

  function toast(msg, kind) {
    if (typeof window.showToast === 'function') window.showToast(msg, kind || 'success');
    else alert(msg);
  }

  function getDrillsList() {
    try {
      var raw = JSON.parse(localStorage.getItem('elisee_gk_drills') || '[]');
      if (Array.isArray(raw) && raw.length > 0) return raw;
    } catch (_) {}
    return [
      { id: 'gk-d1', titolo: 'Microciclo Uscite Alte su Palla Inattiva & Traiettorie a Rientrare', focus: 'Uscite Alte', portieri: 'Titolare + 12', data: '16/09/2026', note: 'Lavoro sui tempi di stacco con sagome e disturbo passivo; 18 uscite completate con presa sicura.' },
      { id: 'gk-d2', titolo: 'Reattività Visiva al Tiro Ravvicinato & Ribattute', focus: 'Riflessi & Tuffo', portieri: 'Tutto il Reparto', data: '14/09/2026', note: 'Lavoro con palline da tennis e tiri deviati a 7 metri; tempo medio di reazione 0.28s.' }
    ];
  }

  function saveDrillsList(list) {
    try { localStorage.setItem('elisee_gk_drills', JSON.stringify(list)); } catch (_) {}
  }

  function getGkClips() {
    try {
      var raw = JSON.parse(localStorage.getItem('elisee_gk_room_clips') || '[]');
      if (Array.isArray(raw) && raw.length > 0) return raw;
    } catch (_) {}
    return [
      { id: 'gkc-1', titolo: 'Analisi 1v1: Chiusura dello Specchio & Posizione a Muro', cat: 'Uscite Basse', durata: '0:55' },
      { id: 'gkc-2', titolo: 'Studio Rigori: Angoli Preferiti Attaccanti Manfredonia', cat: 'Rigori & Avversario', durata: '1:20' }
    ];
  }

  function saveGkClips(list) {
    try { localStorage.setItem('elisee_gk_room_clips', JSON.stringify(list)); } catch (_) {}
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
    var html = '<svg viewBox="0 0 440 400" style="width:100%; height:auto; max-height:300px;" role="img" aria-label="Analisi attività tecnica e atletica portieri">';
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
      window.unmountAllRoleDashboards('es-gk');
    }
  }

  // ============================================================
  // RENDER SEZIONI SPECIFICHE
  // ============================================================

  // 1. Dashboard Tab
  function renderTabDashboard(user, drills, clips) {
    var name = gkName(user);
    var on = inStaff(user);
    var club = String(user.squadra || user.club || 'Foggia City').trim();
    var qual = qualificaOf(user);

    return '' +
      '<div class="es-gk-grid-2col">' +
        // Profilo Preparatore Portieri
        '<section class="es-gk-card">' +
          '<div class="es-gk-card-head">' +
            '<h2 class="es-gk-card-title">' +
              '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
              '<span>Profilo Specialistico Portieri</span>' +
            '</h2>' +
            '<div style="display:flex; gap:6px; align-items:center;">' +
              '<span class="es-gk-badge-tag cyan">UEFA GK / FIGC</span>' +
              '<span class="es-gk-badge-tag emerald">' + (on ? 'In Staff Club' : 'Free Agent') + '</span>' +
            '</div>' +
          '</div>' +

          '<div class="es-gk-profile-row">' +
            '<div class="es-gk-avatar-fallback">' + esc(initials(name)) + '</div>' +
            '<div>' +
              '<b class="es-gk-user-name">' + esc(name) + '</b>' +
              '<div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">' +
                '<span style="font-size:0.72rem; color:#38bdf8; background:rgba(56,189,248,0.12); border:1px solid rgba(56,189,248,0.28); border-radius:4px; padding:2px 6px; font-weight:800; text-transform:uppercase;">Preparatore Portieri</span>' +
                '<span style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:flex; align-items:center; gap:4px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' + esc(club) + '</span>' +
              '</div>' +
            '</div>' +
          '</div>' +

          '<div style="background:#060911; border:1px solid rgba(56,189,248,0.12); border-radius:6px; padding:8px 12px; margin-bottom:10px;">' +
            '<div style="display:flex; justify-content:space-between; font-size:0.72rem; color:#94a3b8; font-weight:700;">' +
              '<span>Completamento Anagrafica &amp; Abilitazione</span>' +
              '<span style="color:#38bdf8; font-weight:900;">85%</span>' +
            '</div>' +
            '<div class="es-gk-progress-track">' +
              '<div class="es-gk-progress-fill" style="width:85%;"></div>' +
            '</div>' +
            '<div style="display:flex; justify-content:flex-end;">' +
              '<button type="button" class="es-gk-side-btn" data-gk-nav="impostazioni" style="font-size:0.72rem; color:#38bdf8; padding:0; background:none; border:none; width:auto; cursor:pointer;">✏️ Modifica Anagrafica</button>' +
            '</div>' +
          '</div>' +

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

        // Metriche Reparto Portieri
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
            '<button type="button" class="es-gk-quick-btn" data-gk-nav="gk_room">🎬 Stanza dei Portieri</button>' +
            '<button type="button" class="es-gk-quick-btn" data-gk-nav="schede">📋 Schede Settimanali</button>' +
            '<button type="button" class="es-gk-quick-btn" data-gk-act="assign-badge" data-badge="Saracinesca Insuperabile">🛡️ Badge Saracinesca</button>' +
            '<button type="button" class="es-gk-quick-btn" data-gk-act="mention-special">🌟 Menzione Speciale</button>' +
          '</div>' +
        '</section>' +
      '</div>' +

      // GK Suite v3.0
      '<section class="es-gk-card">' +
        '<div class="es-gk-card-head">' +
          '<h2 class="es-gk-card-title">' +
            '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>' +
            '<span>Strumenti Operativi — GK Suite v3.0</span>' +
          '</h2>' +
          '<span class="es-gk-badge-tag cyan">Goalkeeper OS</span>' +
        '</div>' +

        '<div class="es-gk-actions-grid">' +
          '<button type="button" class="es-gk-action-card" data-gk-nav="schede">' +
            '<div class="es-gk-action-icon">' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' +
            '</div>' +
            '<div class="es-gk-action-text">' +
              '<b>Scheda Sviluppo Tecnico</b>' +
              '<span>Compila gli obiettivi su presa, uscite e gioco con i piedi.</span>' +
            '</div>' +
          '</button>' +

          '<button type="button" class="es-gk-action-card" data-gk-nav="gk_room">' +
            '<div class="es-gk-action-icon">' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 8 6 4-6 4Z"/></svg>' +
            '</div>' +
            '<div class="es-gk-action-text">' +
              '<b>Video Tagging &amp; Uscite Alte</b>' +
              '<span>Seziona le clip per il video briefing nella Stanza dei Portieri.</span>' +
            '</div>' +
          '</button>' +

          '<button type="button" class="es-gk-action-card" data-gk-nav="reattivita">' +
            '<div class="es-gk-action-icon">' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/></svg>' +
            '</div>' +
            '<div class="es-gk-action-text">' +
              '<b>Convalida Reattività GPS</b>' +
              '<span>Certifica i tempi di reazione e l\'esplosività negli stacchi.</span>' +
            '</div>' +
          '</button>' +

          '<button type="button" class="es-gk-action-card" data-gk-act="assign-badge" data-badge="Saracinesca Insuperabile">' +
            '<div class="es-gk-action-icon">' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' +
            '</div>' +
            '<div class="es-gk-action-text">' +
              '<b>Assegna Badge "Saracinesca"</b>' +
              '<span>Attribuisci il riconoscimento ufficiale al portiere meritevole.</span>' +
            '</div>' +
          '</button>' +

          '<button type="button" class="es-gk-action-card" data-gk-act="mention-special">' +
            '<div class="es-gk-action-icon">' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' +
            '</div>' +
            '<div class="es-gk-action-text">' +
              '<b>Menzione Speciale Card</b>' +
              '<span>Inserisci un encomio visibile nella scheda pubblica del portiere.</span>' +
            '</div>' +
          '</button>' +

          '<button type="button" class="es-gk-action-card" data-gk-nav="canale_mister">' +
            '<div class="es-gk-action-icon">' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></svg>' +
            '</div>' +
            '<div class="es-gk-action-text">' +
              '<b>Inoltra Report al Mister</b>' +
              '<span>Invia le gerarchie e lo stato di forma alla guida tecnica.</span>' +
            '</div>' +
          '</button>' +
        '</div>' +
      '</section>' +

      // Ultime Sedute
      '<section class="es-gk-card">' +
        '<div class="es-gk-card-head">' +
          '<h2 class="es-gk-card-title">' +
            '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
            '<span>Ultime Sedute Specifiche Reparto Portieri</span>' +
          '</h2>' +
          '<button type="button" class="es-gk-side-btn" data-gk-nav="schede" style="font-size:0.75rem; color:#38bdf8; width:auto; padding:0; background:none; border:none; cursor:pointer;">Vedi Tutte &rarr;</button>' +
        '</div>' +

        '<div style="display:flex; flex-direction:column; gap:8px;">' +
          drills.slice(0, 2).map(function (d) {
            return '<div style="background:#060911; border:1px solid rgba(56,189,248,0.12); border-radius:8px; padding:10px 14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">' +
              '<div>' +
                '<b style="color:#f8fafc; font-size:0.86rem; display:block;">' + esc(d.titolo) + '</b>' +
                '<span style="color:#94a3b8; font-size:0.74rem;">' + esc(d.data) + ' · Focus: <strong style="color:#38bdf8;">' + esc(d.focus) + '</strong> (' + esc(d.portieri) + ')</span>' +
              '</div>' +
              '<div style="display:flex; gap:8px;">' +
                '<button type="button" class="es-gk-quick-btn" data-gk-act="forward-mister" data-title="' + esc(d.titolo) + '">Invia al Mister</button>' +
              '</div>' +
            '</div>';
          }).join('') +
        '</div>' +
      '</section>';
  }

  // 2. Stanza dei Portieri Tab
  function renderTabGkRoom(clips) {
    return '' +
      '<section class="es-gk-card">' +
        '<div class="es-gk-card-head">' +
          '<h2 class="es-gk-card-title">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 8 6 4-6 4Z"/></svg>' +
            '<span>Stanza dei Portieri — Video Briefing &amp; Studio Traiettorie (' + clips.length + ')</span>' +
          '</h2>' +
          '<button type="button" class="es-gk-btn-primary" data-gk-act="add-clip">+ Nuova Clip Portieri</button>' +
        '</div>' +

        '<p style="font-size:0.78rem; color:#94a3b8; margin-bottom:14px;">' +
          'Spazio multimediale riservato ai portieri della rosa: video analisi su uscite alte, posizionamento tra i pali, e studio dei rigoristi avversari.' +
        '</p>' +

        '<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:12px;">' +
          clips.map(function (c) {
            return '<div style="background:#060911; border:1px solid rgba(56,189,248,0.16); border-radius:8px; padding:12px;">' +
              '<div style="height:110px; background:#0f172a; border-radius:6px; display:flex; align-items:center; justify-content:center; margin-bottom:10px; border:1px solid rgba(56,189,248,0.1);">' +
                '<button type="button" class="es-gk-quick-btn" data-gk-act="play-clip" data-title="' + esc(c.titolo) + '" style="display:flex; align-items:center; gap:6px;">' +
                  '<span>▶ Avvia Briefing (' + esc(c.durata) + ')</span>' +
                '</button>' +
              '</div>' +
              '<strong style="color:#f8fafc; font-size:0.88rem; display:block; margin-bottom:4px;">' + esc(c.titolo) + '</strong>' +
              '<span class="es-gk-badge-tag cyan">' + esc(c.cat) + '</span>' +
            '</div>';
          }).join('') +
        '</div>' +
      '</section>';
  }

  // 3. Schede Tecniche Tab
  function renderTabSchede(drills) {
    return '' +
      '<section class="es-gk-card">' +
        '<div class="es-gk-card-head">' +
          '<h2 class="es-gk-card-title">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' +
            '<span>Schede Settimanali di Sviluppo Tecnico (' + drills.length + ')</span>' +
          '</h2>' +
          '<button type="button" class="es-gk-btn-primary" data-gk-act="new-drill">+ Nuova Scheda</button>' +
        '</div>' +

        '<div style="display:flex; flex-direction:column; gap:12px;">' +
          drills.map(function (d) {
            return '<div style="background:#060911; border:1px solid rgba(56,189,248,0.16); border-radius:8px; padding:14px;">' +
              '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; flex-wrap:wrap; gap:8px;">' +
                '<strong style="color:#f8fafc; font-size:0.95rem;">' + esc(d.titolo) + '</strong>' +
                '<span class="es-gk-badge-tag cyan">' + esc(d.data) + '</span>' +
              '</div>' +
              '<div style="font-size:0.75rem; color:#94a3b8; margin-bottom:8px;">' +
                'Focus: <b style="color:#38bdf8;">' + esc(d.focus) + '</b> · Portieri coinvolti: <b style="color:#cbd5e1;">' + esc(d.portieri) + '</b>' +
              '</div>' +
              '<div style="font-size:0.76rem; color:#cbd5e1; line-height:1.45; margin-bottom:12px;">' +
                esc(d.note) +
              '</div>' +
              '<div style="display:flex; justify-content:flex-end; gap:8px; border-top:1px solid rgba(148,163,184,0.1); padding-top:10px;">' +
                '<button type="button" class="es-gk-btn-primary" data-gk-act="forward-mister" data-title="' + esc(d.titolo) + '" style="font-size:0.75rem; padding:4px 10px;">Invia al Mister</button>' +
              '</div>' +
            '</div>';
          }).join('') +
        '</div>' +
      '</section>';
  }

  // 4. Reattività & GPS Tab
  function renderTabReattivita() {
    return '' +
      '<section class="es-gk-card">' +
        '<div class="es-gk-card-head">' +
          '<h2 class="es-gk-card-title">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/></svg>' +
            '<span>Reattività Visiva, Riflessi &amp; Dati GPS</span>' +
          '</h2>' +
          '<button type="button" class="es-gk-btn-primary" data-gk-act="test-reattivita">+ Registra Nuovo Test</button>' +
        '</div>' +

        '<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:12px; margin-bottom:16px;">' +
          '<div style="background:#060911; border:1px solid rgba(56,189,248,0.14); border-radius:8px; padding:14px; text-align:center;">' +
            '<span style="font-size:0.72rem; color:#94a3b8; text-transform:uppercase;">Tempo di Reazione al Tiro</span>' +
            '<strong style="display:block; font-size:1.6rem; color:#38bdf8; margin:6px 0;">0.28 sec</strong>' +
            '<span style="font-size:0.72rem; color:#4ade80;">Livello Serie C / Eccellenza Top</span>' +
          '</div>' +
          '<div style="background:#060911; border:1px solid rgba(56,189,248,0.14); border-radius:8px; padding:14px; text-align:center;">' +
            '<span style="font-size:0.72rem; color:#94a3b8; text-transform:uppercase;">Elevazione Stacco Verticale</span>' +
            '<strong style="display:block; font-size:1.6rem; color:#facc15; margin:6px 0;">64 cm</strong>' +
            '<span style="font-size:0.72rem; color:#cbd5e1;">Test di Bosco / CMJ</span>' +
          '</div>' +
          '<div style="background:#060911; border:1px solid rgba(56,189,248,0.14); border-radius:8px; padding:14px; text-align:center;">' +
            '<span style="font-size:0.72rem; color:#94a3b8; text-transform:uppercase;">Efficacia Uscita 1v1</span>' +
            '<strong style="display:block; font-size:1.6rem; color:#4ade80; margin:6px 0;">88%</strong>' +
            '<span style="font-size:0.72rem; color:#38bdf8;">Chiusura Specchio a Croce</span>' +
          '</div>' +
        '</div>' +

        '<div style="background:#060911; border:1px solid rgba(56,189,248,0.12); border-radius:8px; padding:14px;">' +
          '<strong style="color:#f8fafc; font-size:0.9rem; display:block; margin-bottom:6px;">Integrazione con il Preparatore Atletico</strong>' +
          '<p style="color:#94a3b8; font-size:0.76rem; line-height:1.45; margin:0 0 10px;">' +
            'I dati di potenza ed esplosività vengono sincronizzati con il modulo Workload GPS del Preparatore Atletico per prevenire sovraccarichi a livello di adduttori e tendine rotuleo.' +
          '</p>' +
          '<button type="button" class="es-gk-quick-btn" data-gk-act="sync-gps">Sincronizza con Preparatore Atletico</button>' +
        '</div>' +
      '</section>';
  }

  // 5. Badge & Menzioni Tab
  function renderTabBadge() {
    return '' +
      '<section class="es-gk-card">' +
        '<div class="es-gk-card-head">' +
          '<h2 class="es-gk-card-title">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' +
            '<span>Attribuzione Badge &amp; Menzioni di Merito Portieri</span>' +
          '</h2>' +
          '<span class="es-gk-badge-tag emerald">Riconoscimenti Ufficiali</span>' +
        '</div>' +

        '<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:12px;">' +
          '<div style="background:#060911; border:1px solid rgba(56,189,248,0.16); border-radius:8px; padding:14px;">' +
            '<div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">' +
              '<span style="font-size:1.3rem;">🛡️</span>' +
              '<strong style="color:#f8fafc; font-size:0.95rem;">Badge "Saracinesca"</strong>' +
            '</div>' +
            '<p style="color:#94a3b8; font-size:0.75rem; line-height:1.4; margin-bottom:10px;">' +
              'Assegnato al portiere che mantiene la porta inviolata e compie parate decisive nell\'1v1.' +
            '</p>' +
            '<button type="button" class="es-gk-btn-primary" data-gk-act="assign-badge" data-badge="Saracinesca Insuperabile" style="font-size:0.75rem; width:100%; justify-content:center;">Assegna Badge</button>' +
          '</div>' +

          '<div style="background:#060911; border:1px solid rgba(56,189,248,0.16); border-radius:8px; padding:14px;">' +
            '<div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">' +
              '<span style="font-size:1.3rem;">👟</span>' +
              '<strong style="color:#f8fafc; font-size:0.95rem;">Badge "Piede Educato GK"</strong>' +
            '</div>' +
            '<p style="color:#94a3b8; font-size:0.75rem; line-height:1.4; margin-bottom:10px;">' +
              'Riconoscimento per l\'efficacia nella costruzione dal basso e precisione nei lanci oltre i 40m.' +
            '</p>' +
            '<button type="button" class="es-gk-btn-primary" data-gk-act="assign-badge" data-badge="Piede Educato GK" style="font-size:0.75rem; width:100%; justify-content:center;">Assegna Badge</button>' +
          '</div>' +

          '<div style="background:#060911; border:1px solid rgba(56,189,248,0.16); border-radius:8px; padding:14px;">' +
            '<div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">' +
              '<span style="font-size:1.3rem;">🌟</span>' +
              '<strong style="color:#f8fafc; font-size:0.95rem;">Menzione Speciale Card</strong>' +
            '</div>' +
            '<p style="color:#94a3b8; font-size:0.75rem; line-height:1.4; margin-bottom:10px;">' +
              'Nota di merito e plauso visibile nella scheda ufficiale del portiere consultata dagli scout.' +
            '</p>' +
            '<button type="button" class="es-gk-btn-primary" data-gk-act="mention-special" style="font-size:0.75rem; width:100%; justify-content:center;">Registra Menzione</button>' +
          '</div>' +
        '</div>' +
      '</section>';
  }

  // 6. Radar Competenze Tab
  function renderTabRadar() {
    return '' +
      '<section class="es-gk-card">' +
        '<div class="es-gk-card-head">' +
          '<h2 class="es-gk-card-title">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/></svg>' +
            '<span>Quadro Competenze UEFA GK / FIGC</span>' +
          '</h2>' +
          '<span class="es-gk-badge-tag cyan">Standard Federale Coverciano</span>' +
        '</div>' +

        '<div style="display:grid; grid-template-columns:1.2fr 1fr; gap:16px; align-items:center;">' +
          '<div style="display:flex; justify-content:center; align-items:center; background:#060911; border-radius:8px; padding:12px; border:1px solid rgba(56,189,248,0.12);">' +
            radarSvg() +
          '</div>' +

          '<div>' +
            '<h3 style="color:#f8fafc; font-size:1rem; font-weight:800; margin:0 0 8px;">Metriche Preparatore Portieri</h3>' +
            '<p style="color:#94a3b8; font-size:0.78rem; line-height:1.45; margin-bottom:12px;">' +
              'Valutazione globale dell\'impatto tecnico, tattico e atletico sul reparto estremi difensori di Foggia City.' +
            '</p>' +

            '<div style="display:flex; flex-direction:column; gap:8px;">' +
              '<div style="background:#060911; border:1px solid rgba(56,189,248,0.12); border-radius:6px; padding:8px 12px; display:flex; justify-content:space-between;">' +
                '<span style="font-size:0.75rem; color:#94a3b8;">Presa &amp; Tuffo:</span>' +
                '<strong style="color:#38bdf8; font-size:0.8rem;">93% (Eccellente)</strong>' +
              '</div>' +
              '<div style="background:#060911; border:1px solid rgba(56,189,248,0.12); border-radius:6px; padding:8px 12px; display:flex; justify-content:space-between;">' +
                '<span style="font-size:0.75rem; color:#94a3b8;">Reattività Visiva &amp; Riflessi:</span>' +
                '<strong style="color:#38bdf8; font-size:0.8rem;">95% (Top 1%)</strong>' +
              '</div>' +
              '<div style="background:#060911; border:1px solid rgba(56,189,248,0.12); border-radius:6px; padding:8px 12px; display:flex; justify-content:space-between;">' +
                '<span style="font-size:0.75rem; color:#94a3b8;">Comando Vocale Difesa:</span>' +
                '<strong style="color:#4ade80; font-size:0.8rem;">94% (Leader Guida)</strong>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>';
  }

  // 7. Canale Mister Tab
  function renderTabCanaleMister(user) {
    var club = String(user.squadra || user.club || 'Foggia City').trim();

    return '' +
      '<div class="es-gk-grid-2col">' +
        '<section class="es-gk-card">' +
          '<div class="es-gk-card-head">' +
            '<h2 class="es-gk-card-title">' +
              '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></svg>' +
              '<span>Relazione Tecnica Diretta con il Mister</span>' +
            '</h2>' +
            '<span class="es-gk-badge-tag emerald">Connesso</span>' +
          '</div>' +

          '<p style="font-size:0.78rem; color:#94a3b8; line-height:1.45; margin-bottom:12px;">' +
            'Invia al Mister e al Vice Allenatore di ' + esc(club) + ' il resoconto settimanale con le gerarchie per la gara, la reattività ai tiri e i suggerimenti per la formazione titolare.' +
          '</p>' +

          '<div style="background:#060911; border:1px solid rgba(56,189,248,0.12); border-radius:6px; padding:10px 12px; display:flex; justify-content:space-between; align-items:center;">' +
            '<div>' +
              '<b style="color:#f8fafc; font-size:0.82rem; display:block;">Report Gerarchie Portieri</b>' +
              '<span style="font-size:0.72rem; color:#4ade80;">1° e 2° Portiere Pronti per la Gara</span>' +
            '</div>' +
            '<button type="button" class="es-gk-btn-primary" data-gk-act="forward-mister" style="font-size:0.75rem; padding:4px 10px;">Inoltra al Mister</button>' +
          '</div>' +
        '</section>' +

        '<section class="es-gk-card">' +
          '<div class="es-gk-card-head">' +
            '<h2 class="es-gk-card-title">' +
              '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>' +
              '<span>Comunicazioni Staff &amp; Fisioterapista</span>' +
            '</h2>' +
            '<button type="button" class="es-gk-quick-btn" data-gk-act="open-msgs">Apri Chat</button>' +
          '</div>' +

          '<p style="font-size:0.78rem; color:#94a3b8; line-height:1.45;">' +
            'Coordina con lo Staff Medico e il Fisioterapista i protocolli di prevenzione per gomiti, polsi e spalle dei portieri.' +
          '</p>' +
        '</section>' +
      '</div>';
  }

  // ============================================================
  // RENDER PRINCIPALE SHELL
  // ============================================================
  function renderHub(user) {
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

    host.classList.add('es-gk-on');
    host.classList.remove('es-pd-on', 'es-ds-on', 'es-pres-on', 'es-vice-on', 'es-fisio-on', 'es-obs-on', 'es-med-on', 'es-tm-on', 'es-ma-on', 'es-at-on', 'es-yg-on');

    if (group) {
      group.classList.add('is-gk-dash');
      group.classList.remove('is-coach-dash', 'is-ds-dash', 'is-pres-dash', 'is-vice-dash', 'is-fisio-dash', 'is-obs-dash', 'is-med-dash', 'is-tm-dash', 'is-ma-dash', 'is-at-dash', 'is-yg-dash');
    }
    document.body.classList.add('is-gk-mode');

    var name = gkName(user);
    var club = String(user.squadra || user.club || 'Foggia City').trim();
    var drills = getDrillsList();
    var clips = getGkClips();
    var nextMatch = getNextMatchTarget();

    var html =
      '<div class="es-gk-shell">' +
        // 1. SIDEBAR TECNICA GESTIONALE (240px)
        '<aside class="es-gk-sidebar">' +
          '<div class="es-gk-brand-header">' +
            '<div class="es-gk-brand-title">ELISEE <span>SCOUT</span></div>' +
            '<div class="es-gk-brand-sub">Area Preparatore Portieri</div>' +
          '</div>' +
          '<nav class="es-gk-sidebar-nav">' +
            renderSideBtn('dashboard', 'Dashboard', '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>') +
            renderSideBtn('gk_room', 'Stanza dei Portieri', '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 8 6 4-6 4Z"/>') +
            renderSideBtn('schede', 'Schede Tecniche GK (' + drills.length + ')', '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>') +
            renderSideBtn('reattivita', 'Reattività &amp; GPS', '<circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/>') +
            renderSideBtn('badge', 'Badge &amp; Menzioni', '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>') +
            renderSideBtn('radar', 'Radar Competenze GK', '<circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/>') +
            renderSideBtn('canale_mister', 'Canale Mister &amp; Staff', '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/>') +
            renderSideBtn('impostazioni', 'Profilo &amp; Abilitazione', '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06-.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>') +
          '</nav>' +
          '<div class="es-gk-sidebar-badge">' +
            '<div class="es-gk-sidebar-club-card">' +
              '<img src="immagini/squadre-loghi/foggia-city.png?v=20260917_FGCLIC1" alt="' + esc(club) + '" onerror="this.onerror=null;this.src=\'immagini/squadre-loghi/foggia-city.png\';">' +
              '<div>' +
                '<strong>' + esc(club) + '</strong>' +
                '<span>Staff Tecnico Ufficiale</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</aside>' +

        // 2. MAIN WORKSPACE
        '<main class="es-gk-main">' +
          // HEADER A DUE LIVELLI
          '<div class="es-gk-dash-header">' +
            // Riga 1: Identità & Qualifica
            '<div class="es-gk-header-top-row">' +
              '<button type="button" class="es-gk-mobile-menu-btn" id="btn-toggle-gk-sidebar" aria-label="Menu">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>' +
              '</button>' +
              '<div class="es-gk-header-identity">' +
                '<div class="es-gk-header-block">' +
                  '<div class="es-gk-licence-badge" title="Patentino UEFA GK">' +
                    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' +
                  '</div>' +
                  '<div class="es-gk-coach-info">' +
                    '<strong>' + esc(name) + '</strong>' +
                    '<span class="role">Preparatore dei Portieri</span>' +
                    '<p class="sub">Tesseramento FIGC: FIGC-GK-6631 · Scadenza: 30/06/2027</p>' +
                  '</div>' +
                '</div>' +
                '<div class="es-gk-header-sep"></div>' +
                '<div class="es-gk-header-block es-gk-club-info">' +
                  '<img class="crest" src="immagini/squadre-loghi/foggia-city.png?v=20260917_FGCLIC1" alt="' + esc(club) + '" onerror="this.onerror=null;this.src=\'immagini/squadre-loghi/foggia-city.png\';">' +
                  '<div>' +
                    '<strong>' + esc(club) + '</strong>' +
                    '<span>Prima Squadra · Reparto Portieri</span>' +
                  '</div>' +
                '</div>' +
              '</div>' +
              '<button type="button" class="es-gk-btn-quick-jump" data-gk-nav="schede">' +
                'Nuova Scheda Portieri +' +
              '</button>' +
            '</div>' +

            // Riga 2: Prossima Visione + Countdown + Focus Portieri
            '<div class="es-gk-header-match-row">' +
              '<div class="es-gk-target-box">' +
                '<p class="label">Prossima Gara Ufficiale</p>' +
                '<strong>' + esc(nextMatch.avversario) + '</strong>' +
                '<span>' + esc(nextMatch.data) + ' · Ore ' + esc(nextMatch.orario) + ' (' + esc(nextMatch.luogo) + ')</span>' +
              '</div>' +
              '<div class="es-gk-target-box">' +
                '<p class="label">Countdown Calcio d\'Inizio</p>' +
                '<div class="es-gk-countdown-nums">' +
                  '<div><strong>' + String(nextMatch.giorniMancanti || 0).padStart(2, '0') + '</strong><span>Giorni</span></div>' +
                  '<div><strong>' + String(nextMatch.oreMancanti || 0).padStart(2, '0') + '</strong><span>Ore</span></div>' +
                  '<div><strong>' + String(nextMatch.minutiMancanti || 0).padStart(2, '0') + '</strong><span>Min</span></div>' +
                '</div>' +
              '</div>' +
              '<div class="es-gk-target-box">' +
                '<p class="label">Focus Reparto Portieri</p>' +
                '<strong style="color:#38bdf8;">Uscite Alte su Palle Inattive &amp; 1v1</strong>' +
                '<span>Seduta di rifinitura specifica con disturbo</span>' +
              '</div>' +
            '</div>' +
          '</div>' +

          // 3. TAB BAR SUPERIORE
          '<nav class="es-gk-nav-tabs">' +
            renderNavTab('dashboard', 'Dashboard', '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>') +
            renderNavTab('gk_room', 'Stanza dei Portieri', '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 8 6 4-6 4Z"/>') +
            renderNavTab('schede', 'Schede Tecniche GK', '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>') +
            renderNavTab('reattivita', 'Reattività &amp; GPS', '<circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/>') +
            renderNavTab('badge', 'Badge &amp; Menzioni', '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>') +
            renderNavTab('radar', 'Radar Competenze GK', '<circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/>') +
            renderNavTab('canale_mister', 'Canale Mister &amp; Staff', '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/>') +
          '</nav>' +

          // 4. CONTENITORE VISTA ATTIVA
          '<div id="es-gk-active-content">' +
            renderActiveTabContent(activeTab, user, drills, clips) +
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
    return '<button type="button" class="es-gk-side-btn ' + (isActive ? 'is-active' : '') + '" data-gk-nav="' + tabKey + '">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke-width="2">' + svgPath + '</svg>' +
      '<span>' + esc(label) + '</span>' +
    '</button>';
  }

  function renderNavTab(tabKey, label, svgPath) {
    var isActive = activeTab === tabKey;
    return '<button type="button" class="es-gk-tab-btn ' + (isActive ? 'is-active' : '') + '" data-gk-nav="' + tabKey + '">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' + svgPath + '</svg>' +
      '<span>' + esc(label) + '</span>' +
    '</button>';
  }

  function renderActiveTabContent(tabKey, user, drills, clips) {
    switch (tabKey) {
      case 'gk_room':
        return renderTabGkRoom(clips);
      case 'schede':
        return renderTabSchede(drills);
      case 'reattivita':
        return renderTabReattivita();
      case 'badge':
        return renderTabBadge();
      case 'radar':
        return renderTabRadar();
      case 'canale_mister':
        return renderTabCanaleMister(user);
      case 'impostazioni':
        return renderTabDashboard(user, drills, clips);
      case 'dashboard':
      default:
        return renderTabDashboard(user, drills, clips);
    }
  }

  // ============================================================
  // GESTIONE EVENTI & MODALI
  // ============================================================
  function bindAllEvents(container) {
    if (!container) return;

    // Switch Tab
    container.querySelectorAll('[data-gk-nav]').forEach(function (btn) {
      btn.onclick = function (e) {
        e.preventDefault();
        var t = btn.getAttribute('data-gk-nav');
        if (t === 'impostazioni') {
          openGkEditModal(userObj());
          return;
        }
        if (t) {
          activeTab = t;
          renderHub(userObj());
        }
      };
    });

    // Toggle Sidebar Mobile
    var btnToggle = container.querySelector('#btn-toggle-gk-sidebar');
    var sidebar = container.querySelector('.es-gk-sidebar');
    if (btnToggle && sidebar) {
      btnToggle.onclick = function () {
        sidebar.classList.toggle('is-open');
      };
    }

    // Azioni Operative
    container.querySelectorAll('[data-gk-act]').forEach(function (btn) {
      btn.onclick = function (e) {
        e.preventDefault();
        var act = btn.getAttribute('data-gk-act');

        if (act === 'forward-mister') {
          var title = btn.getAttribute('data-title') || 'Scheda Reparto Portieri';
          toast('Relazione tecnica "' + title + '" inoltrata con successo al Mister.', 'success');
          return;
        }

        if (act === 'new-drill') {
          var t = prompt('Titolo della Seduta Tecnica Portieri:');
          if (!t) return;
          var focus = prompt('Focus principale (es. Uscite Alte, Presa a Terra, 1v1):', 'Uscite Alte');
          var gkNames = prompt('Portieri coinvolti:', 'Titolare + Riserva');
          var note = prompt('Dettagli e progressione dell\'esercizio:');

          var list = getDrillsList();
          list.unshift({
            id: 'gk-d' + Date.now(),
            titolo: t.trim(),
            focus: (focus || 'Presa & Uscite').trim(),
            portieri: (gkNames || 'Reparto Portieri').trim(),
            data: 'Oggi',
            note: note || 'Seduta tecnica programmata dal Preparatore Portieri'
          });
          saveDrillsList(list);
          toast('Scheda tecnica "' + t + '" registrata con successo!', 'success');
          renderHub(userObj());
          return;
        }

        if (act === 'add-clip') {
          var ct = prompt('Titolo del Video Briefing:');
          if (!ct) return;
          var cat = prompt('Categoria (es. Uscite Alte, 1v1, Rigori):', 'Uscite Alte');
          var dur = prompt('Durata (es. 1:10):', '1:00');

          var cList = getGkClips();
          cList.unshift({
            id: 'gkc-' + Date.now(),
            titolo: ct.trim(),
            cat: (cat || 'Video Briefing').trim(),
            durata: dur || '1:00'
          });
          saveGkClips(cList);
          toast('Clip "' + ct + '" aggiunta alla Stanza dei Portieri!', 'success');
          renderHub(userObj());
          return;
        }

        if (act === 'play-clip') {
          var pt = btn.getAttribute('data-title') || 'Video Briefing';
          toast('Riproduzione clip: ' + pt, 'info');
          return;
        }

        if (act === 'assign-badge') {
          var badgeName = btn.getAttribute('data-badge') || 'Saracinesca Insuperabile';
          var plName = prompt('Nome del Portiere a cui assegnare il badge "' + badgeName + '":', 'Portiere Titolare');
          if (!plName) return;
          toast('Badge "' + badgeName + '" conferito a ' + plName + ' con successo!', 'success');
          return;
        }

        if (act === 'mention-special') {
          var pl2 = prompt('Nome del Portiere per la Menzione Speciale:');
          if (!pl2) return;
          var text = prompt('Motivazione della Menzione di Merito:');
          if (!text) return;
          toast('Menzione di Merito inserita nella scheda di ' + pl2 + '!', 'success');
          return;
        }

        if (act === 'test-reattivita') {
          toast('Modulo test reattività balistica avviato.', 'info');
          return;
        }

        if (act === 'sync-gps') {
          toast('Dati di reattività e carico sincronizzati con il Preparatore Atletico.', 'success');
          return;
        }

        if (act === 'open-msgs') {
          if (window.openUserMessages) window.openUserMessages();
          else toast('Chat interna staff aperta.', 'info');
          return;
        }
      };
    });
  }

  // Modale Modifica Anagrafica Preparatore Portieri
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
      '<div class="es-edit-field"><label>Abilitazione FIGC / UEFA GK</label><input id="es-gk-qual" value="' + esc(qualificaOf(user)) + '"></div>' +
      '<div class="es-edit-field"><label>Ruolo Ufficiale</label><input id="es-gk-role" value="Preparatore dei Portieri" readonly></div>' +
      '<div class="es-edit-field"><label>Club Affiliato</label><input id="es-gk-club" value="' + esc(user.squadra || user.club || 'Foggia City') + '"></div>' +
      '<div class="es-edit-field"><label>Status Contrattuale</label><select id="es-gk-status">' +
      '<option value="in-staff"' + (inStaff(user) ? ' selected' : '') + '>In Staff Club (Collegato al Mister)</option>' +
      '<option value="free"' + (!inStaff(user) ? ' selected' : '') + '>Free Agent / Specialista Indipendente</option>' +
      '</select></div>' +
      '<div class="es-edit-field full"><label>Metodologia di Allenamento Reparto Portieri</label><textarea id="es-gk-bio" rows="3">' + esc(user.bio || 'Metodologia integrata: tecnica di base, uscite alte con disturbo e costruzione dal basso') + '</textarea></div>' +
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
      var nome = backdrop.querySelector('#es-gk-nome').value.trim();
      var cognome = backdrop.querySelector('#es-gk-cognome').value.trim();
      var qual = backdrop.querySelector('#es-gk-qual').value.trim();
      var clb = backdrop.querySelector('#es-gk-club').value.trim();
      var ctr = backdrop.querySelector('#es-gk-status').value;
      var bio = backdrop.querySelector('#es-gk-bio').value.trim();

      user.nome = nome;
      user.cognome = cognome;
      user.squadra = clb || 'Foggia City';
      user.club = clb || 'Foggia City';
      user.abilitazione = qual;
      user.qualifica = qual;
      user.contractStatus = ctr;
      user.bio = bio;

      try {
        localStorage.setItem('elisee_active_user', JSON.stringify(user));
        localStorage.setItem('elisee_user_data', JSON.stringify(user));
      } catch (_) {}

      close();
      toast('Anagrafica Preparatore Portieri aggiornata!', 'success');
      renderHub(user);
    };
  }

  // ============================================================
  // EXPORT GLOBALE & LISTENER
  // ============================================================
  window.EliseeGkDash = {
    render: renderHub,
    isGk: isGk,
    inStaff: inStaff,
    qualificaOf: qualificaOf
  };

  document.addEventListener('elisee:view-changed', function (e) {
    var d = e && e.detail;
    if (d && d.view === 'user-dossier') {
      try {
        var u = userObj();
        if (isGk(u)) renderHub(u);
      } catch (_) {}
    }
  });

  document.addEventListener('elisee:role-changed', function (e) {
    var d = e && e.detail;
    try {
      var u = (d && d.user) || userObj();
      if (isGk(u)) renderHub(u);
    } catch (_) {}
  });

  window.addEventListener('hashchange', function () {
    if (window.location.hash.indexOf('user-dossier') >= 0 && isGk()) {
      setTimeout(renderHub, 50);
    }
  });

  document.addEventListener('DOMContentLoaded', function () {
    if (window.location.hash.indexOf('user-dossier') >= 0 && isGk()) {
      setTimeout(renderHub, 100);
    }
  });
})();
