/* ============================================================
   ELISEE SCOUT — AREA OSSERVATORE & TALENT SCOUT (CONTROL ROOM)
   Scouting Staff Operating System — Football Talent Scouting OS
   Navigazione gestionale unificata nella sidebar sinistra e tab bar superiore
   ============================================================ */
(function () {
  'use strict';

  var activeTab = 'dashboard'; // 'dashboard' | 'secret_list' | 'dossier' | 'gare' | 'database' | 'radar' | 'canale_ds' | 'impostazioni'
  var countdownInterval = null;

  var AXES = [
    'Precisione Valutazioni', 'Partite Visionate', 'Segnalazioni Convertite', 'Copertura Categorie',
    'Analisi Video', 'Tempestività Report', 'Rete Contatti Procuratori', 'Conoscenza Mercato'
  ];
  var V2025 = [92, 90, 85, 88, 91, 87, 93, 94];
  var V2023 = [78, 76, 70, 74, 79, 73, 80, 81];

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

  function isObs(u) {
    u = u || userObj();
    var blob = String(u.staffRole || u.ruoloDettagliato || (u.staffProfile && u.staffProfile.fieldRole) || u.ruolo || u.role || '').trim().toLowerCase();
    if (/match analyst|video analyst/.test(blob) && !/\bosservatore\b/.test(blob) && !/scout\s*\/\s*osservatore/.test(blob)) return false;
    return /scout\s*\/\s*osservatore|\bosservatore\b|\bscout\b/.test(blob);
  }

  function obsName(u) {
    return [u.nome, u.cognome].filter(Boolean).join(' ').trim() || u.username || 'Eliseo Miraglia';
  }

  function initials(name) {
    var p = String(name || 'OS').trim().split(/\s+/);
    return ((p[0] || 'O').charAt(0) + (p[1] || p[0] || 'S').charAt(0)).toUpperCase();
  }

  function underContract(u) {
    u = u || userObj();
    var st = String(u.obsContract || u.contractStatus || '').toLowerCase();
    if (st === 'free' || st === 'free-agent' || st === 'indipendente') return false;
    if (st === 'contract' || st === 'under-contract') return true;
    return !!(u.squadra || u.club);
  }

  function qualificaOf(u) {
    return String((u && (u.obsQualifica || u.qualificaScout || u.certificazione)) || '').trim() || 'Osservatore Professionista FIGC';
  }

  function getSecretList() {
    try {
      var raw = JSON.parse(localStorage.getItem('elisee_secret_list') || '[]');
      if (Array.isArray(raw) && raw.length > 0) return raw;
    } catch (_) {}
    return [
      { id: 'sl-1', nome: 'Lorenzo De Felice', ruolo: 'Attaccante / Ala', squadra: 'Cerignola Primavera', cat: 'Primavera 3', eta: 18, potenziale: 'A (Top Prospect)', note: 'Rapidità nel breve, ottimo dribbling nell\'1 contro 1. Monitorato dal vivo.' },
      { id: 'sl-2', nome: 'Matteo Vicedomini', ruolo: 'Centrocampista / Regista', squadra: 'Audace Barletta', cat: 'Eccellenza', eta: 20, potenziale: 'B+ (Serie D Pronta)', note: 'Visione di gioco sopra la media, tempi di verticalizzazione eccellenti.' },
      { id: 'sl-3', nome: 'Andrea Esposito', ruolo: 'Difensore Centrale', squadra: 'Svincolato / Ex Taranto', cat: 'Serie D', eta: 22, potenziale: 'B (Affidabile)', note: 'Struttura fisica 1.89m, forte nel gioco aereo e marcatura a uomo.' }
    ];
  }

  function saveSecretList(list) {
    try {
      localStorage.setItem('elisee_secret_list', JSON.stringify(list));
    } catch (_) {}
  }

  function getDossierList() {
    try {
      var raw = JSON.parse(localStorage.getItem('elisee_obs_dossiers') || '[]');
      if (Array.isArray(raw) && raw.length > 0) return raw;
    } catch (_) {}
    return [
      { id: 'dos-1', player: 'Lorenzo De Felice', date: '14/09/2026', match: 'Foggia U19 vs Cerignola U19', rating: '8.5', raccomandazione: 'Ingaggio Immediato', note: 'Prestazione dominante sulla corsia sinistra con 2 assist chiave.' },
      { id: 'dos-2', player: 'Matteo Vicedomini', date: '08/09/2026', match: 'Barletta vs Bisceglie', rating: '7.5', raccomandazione: 'Follow-up Rifinitura', note: 'Precisione nei passaggi 88%, da verificare nei contrasti ad alta intensità.' }
    ];
  }

  function saveDossierList(list) {
    try {
      localStorage.setItem('elisee_obs_dossiers', JSON.stringify(list));
    } catch (_) {}
  }

  function toast(msg, type) {
    if (typeof window.showToast === 'function') {
      window.showToast(msg, type || 'info');
    } else {
      alert(msg);
    }
  }

  // Radar SVG Polar
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
    var html = '<svg viewBox="0 0 440 400" style="width:100%; height:auto; max-height:300px;" role="img" aria-label="Analisi attività di scouting">';
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

  function hideOthers() {
    if (typeof window.unmountAllRoleDashboards === 'function') {
      window.unmountAllRoleDashboards('es-od');
    }
  }

  // Calcolo Countdown
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

  // ============================================================
  // RENDER SEZIONI SPECIFICHE
  // ============================================================

  // 1. Dashboard Generale
  function renderTabDashboard(user, secretList) {
    var name = obsName(user);
    var on = underContract(user);
    var club = String(user.squadra || user.club || 'Foggia City').trim();
    var qual = qualificaOf(user);
    var secretCount = secretList.length;

    return '' +
      // RIGA 1: 2 CARD PRINCIPALI
      '<div class="es-obs-grid-2col">' +
        // CARD 1: PROFILO & ACCREDITAMENTO
        '<section class="es-obs-card">' +
          '<div class="es-obs-card-head">' +
            '<h2 class="es-obs-card-title">' +
              '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
              '<span>Profilo Ufficiale Scout</span>' +
            '</h2>' +
            '<div style="display:flex; gap:6px; align-items:center;">' +
              '<span class="es-obs-badge-tag cyan">Accreditato FIGC</span>' +
              '<span class="es-obs-badge-tag emerald">' + (on ? 'In Staff Club' : 'Free Agent') + '</span>' +
            '</div>' +
          '</div>' +

          '<div class="es-obs-profile-row">' +
            '<div class="es-obs-avatar-fallback">' + esc(initials(name)) + '</div>' +
            '<div class="es-obs-user-meta">' +
              '<b class="es-obs-user-name">' + esc(name) + '</b>' +
              '<div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">' +
                '<span style="font-size:0.72rem; color:#38bdf8; background:rgba(56,189,248,0.12); border:1px solid rgba(56,189,248,0.28); border-radius:4px; padding:2px 6px; font-weight:800; text-transform:uppercase;">Osservatore / Scout</span>' +
                '<span style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:flex; align-items:center; gap:4px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' + esc(club) + '</span>' +
              '</div>' +
            '</div>' +
          '</div>' +

          // Barra completamento
          '<div style="background:#060911; border:1px solid rgba(56,189,248,0.12); border-radius:6px; padding:8px 12px; margin-bottom:10px;">' +
            '<div style="display:flex; justify-content:space-between; font-size:0.72rem; color:#94a3b8; font-weight:700;">' +
              '<span>Completamento Anagrafica &amp; Abilitazione</span>' +
              '<span style="color:#38bdf8; font-weight:900;">85%</span>' +
            '</div>' +
            '<div class="es-obs-progress-track">' +
              '<div class="es-obs-progress-fill" style="width:85%;"></div>' +
            '</div>' +
            '<div style="display:flex; justify-content:flex-end;">' +
              '<button type="button" class="es-obs-side-btn" data-ob-nav="impostazioni" style="font-size:0.72rem; color:#38bdf8; padding:0; background:none; border:none; width:auto; cursor:pointer;">✏️ Modifica Anagrafica</button>' +
            '</div>' +
          '</div>' +

          '<div class="es-obs-cred-grid">' +
            '<div class="es-obs-cred-item">' +
              '<span>Qualifica Ufficiale</span>' +
              '<b>' + esc(qual) + '</b>' +
            '</div>' +
            '<div class="es-obs-cred-item">' +
              '<span>Canale Direttore Sportivo</span>' +
              '<b>' + (on ? 'Collegato al DS' : 'Indipendente') + '</b>' +
            '</div>' +
          '</div>' +
        '</section>' +

        // CARD 2: CENTRO OPERATIVO STEALTH
        '<section class="es-obs-card">' +
          '<div class="es-obs-card-head">' +
            '<h2 class="es-obs-card-title">' +
              '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' +
              '<span>Centro Operativo Stealth Scouting</span>' +
            '</h2>' +
            '<span class="es-obs-badge-tag emerald">100% Stealth Active</span>' +
          '</div>' +

          '<p style="font-size:0.78rem; color:#94a3b8; line-height:1.45; margin:0 0 10px;">' +
            'Monitori i talenti in modalità stealth certificata: le tue note, osservazioni e dossier sono completamente invisibili a calciatori e procuratori finché non li inoltri ufficialmente al Direttore Sportivo.' +
          '</p>' +

          '<div class="es-obs-kpi-grid">' +
            '<div class="es-obs-kpi-box">' +
              '<strong>' + secretCount + '</strong>' +
              '<span>In Secret List</span>' +
            '</div>' +
            '<div class="es-obs-kpi-box">' +
              '<strong>94%</strong>' +
              '<span>Precisione Scout</span>' +
            '</div>' +
            '<div class="es-obs-kpi-box">' +
              '<strong>' + (on ? 'Attivo' : 'Libero') + '</strong>' +
              '<span>Canale DS</span>' +
            '</div>' +
          '</div>' +

          '<div class="es-obs-quick-actions">' +
            '<button type="button" class="es-obs-quick-btn" data-ob-nav="secret_list">📂 Secret List Stealth</button>' +
            '<button type="button" class="es-obs-quick-btn" data-ob-nav="dossier">📋 Dossier &amp; Schede</button>' +
            '<button type="button" class="es-obs-quick-btn" data-ob-nav="gare">📅 Gare da Visionare</button>' +
            '<button type="button" class="es-obs-quick-btn" data-ob-nav="database">🔍 Database Talenti</button>' +
          '</div>' +
        '</section>' +
      '</div>' +

      // RIGA 2: STRUMENTI OPERATIVI SCOUTING SUITE
      '<section class="es-obs-card">' +
        '<div class="es-obs-card-head">' +
          '<h2 class="es-obs-card-title">' +
            '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>' +
            '<span>Strumenti Operativi — Scouting Suite v3.0</span>' +
          '</h2>' +
          '<span class="es-obs-badge-tag cyan">Scouting Engine</span>' +
        '</div>' +

        '<div class="es-obs-actions-grid">' +
          '<button type="button" class="es-obs-action-card" data-ob-nav="secret_list">' +
            '<div class="es-obs-action-icon">' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' +
            '</div>' +
            '<div class="es-obs-action-text">' +
              '<b>Secret List Stealth</b>' +
              '<span>Monitora i calciatori senza inviare notifiche a terzi.</span>' +
            '</div>' +
          '</button>' +

          '<button type="button" class="es-obs-action-card" data-ob-act="forward-ds">' +
            '<div class="es-obs-action-icon">' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>' +
            '</div>' +
            '<div class="es-obs-action-text">' +
              '<b>Inoltra Target al DS</b>' +
              '<span>Invia la scheda direttamente nell\'area riservata del club.</span>' +
            '</div>' +
          '</button>' +

          '<button type="button" class="es-obs-action-card" data-ob-nav="database">' +
            '<div class="es-obs-action-icon">' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
            '</div>' +
            '<div class="es-obs-action-text">' +
              '<b>Ricerca &amp; Filtri Tattici</b>' +
              '<span>Filtra per città, regione, età, piede e ruolo.</span>' +
            '</div>' +
          '</button>' +

          '<button type="button" class="es-obs-action-card" data-ob-nav="dossier">' +
            '<div class="es-obs-action-icon">' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' +
            '</div>' +
            '<div class="es-obs-action-text">' +
              '<b>Dossier Relazione Tecnica</b>' +
              '<span>Compila scheda 4 aree (Tecnica, Tattica, Fisica, Mentale).</span>' +
            '</div>' +
          '</button>' +

          '<button type="button" class="es-obs-action-card" data-ob-nav="radar">' +
            '<div class="es-obs-action-icon">' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/></svg>' +
            '</div>' +
            '<div class="es-obs-action-text">' +
              '<b>Radar Competenze Scout</b>' +
              '<span>Verifica il punteggio di accuratezza a 8 assi.</span>' +
            '</div>' +
          '</button>' +

          '<button type="button" class="es-obs-action-card" data-ob-nav="canale_ds">' +
            '<div class="es-obs-action-icon">' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></svg>' +
            '</div>' +
            '<div class="es-obs-action-text">' +
              '<b>Wall Trattative Chiuse</b>' +
              '<span>Visualizza i trasferimenti ufficializzati dallo staff.</span>' +
            '</div>' +
          '</button>' +
        '</div>' +
      '</section>' +

      // RIGA 3: REGISTRO RECENTE
      '<section class="es-obs-card">' +
        '<div class="es-obs-card-head">' +
          '<h2 class="es-obs-card-title">' +
            '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
            '<span>Ultime Osservazioni &amp; Aggiornamenti Secret List</span>' +
          '</h2>' +
          '<button type="button" class="es-obs-side-btn" data-ob-nav="secret_list" style="font-size:0.75rem; color:#38bdf8; width:auto; padding:0; background:none; border:none; cursor:pointer;">Vedi Tutti &rarr;</button>' +
        '</div>' +

        '<div style="display:flex; flex-direction:column; gap:8px;">' +
          secretList.slice(0, 3).map(function (item) {
            return '<div style="background:#060911; border:1px solid rgba(56,189,248,0.12); border-radius:8px; padding:10px 14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">' +
              '<div>' +
                '<b style="color:#f8fafc; font-size:0.86rem; display:block;">' + esc(item.nome) + ' <span style="font-size:0.72rem; color:#38bdf8; font-weight:600;">(' + esc(item.ruolo) + ')</span></b>' +
                '<span style="color:#94a3b8; font-size:0.74rem;">' + esc(item.squadra) + ' · ' + esc(item.cat) + ' · Potenziale: <strong style="color:#4ade80;">' + esc(item.potenziale) + '</strong></span>' +
              '</div>' +
              '<div style="display:flex; gap:8px;">' +
                '<button type="button" class="es-obs-quick-btn" data-ob-act="forward-single" data-name="' + esc(item.nome) + '">Inoltra al DS</button>' +
              '</div>' +
            '</div>';
          }).join('') +
        '</div>' +
      '</section>';
  }

  // 2. Secret List Tab
  function renderTabSecretList(secretList) {
    return '' +
      '<section class="es-obs-card">' +
        '<div class="es-obs-card-head">' +
          '<h2 class="es-obs-card-title">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' +
            '<span>Secret List — Talenti Monitorati in Modalità Stealth (' + secretList.length + ')</span>' +
          '</h2>' +
          '<button type="button" class="es-obs-btn-primary" data-ob-act="add-secret">+ Aggiungi Talento</button>' +
        '</div>' +

        '<p style="font-size:0.78rem; color:#94a3b8; margin-bottom:14px;">' +
          '🔒 <b>Riservatezza Garantita:</b> Nessuna notifica push o e-mail viene recapitata all\'atleta visionato né al suo club o procuratore. Le valutazioni rimangono salvate esclusivamente nella tua cassaforte finché non le condividi con il DS.' +
        '</p>' +

        (secretList.length === 0 ? (
          '<div class="es-obs-empty-wrap">' +
            '<div class="es-obs-empty-icon">' +
              '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' +
            '</div>' +
            '<div class="es-obs-empty-title">Nessun calciatore presente nella Secret List</div>' +
            '<div class="es-obs-empty-sub">Aggiungi i profili visionati sui campi o dal database per monitorarne la crescita e preparare il report da inoltrare al Direttore Sportivo.</div>' +
            '<button type="button" class="es-obs-btn-primary" data-ob-act="add-secret">+ Aggiungi Primo Calciatore</button>' +
          '</div>'
        ) : (
          '<div style="overflow-x:auto;">' +
            '<table class="es-obs-table">' +
              '<thead>' +
                '<tr>' +
                  '<th>Calciatore</th>' +
                  '<th>Ruolo &amp; Età</th>' +
                  '<th>Club &amp; Categoria</th>' +
                  '<th>Potenziale</th>' +
                  '<th>Note Scout</th>' +
                  '<th style="text-align:right;">Azioni</th>' +
                '</tr>' +
              '</thead>' +
              '<tbody>' +
                secretList.map(function (item, idx) {
                  return '<tr>' +
                    '<td><strong style="color:#f8fafc; font-size:0.86rem;">' + esc(item.nome) + '</strong></td>' +
                    '<td>' + esc(item.ruolo) + ' (' + (item.eta || '--') + ' anni)</td>' +
                    '<td>' + esc(item.squadra) + ' <span style="font-size:0.7rem; color:#94a3b8;">[' + esc(item.cat) + ']</span></td>' +
                    '<td><span class="es-obs-badge-tag emerald">' + esc(item.potenziale) + '</span></td>' +
                    '<td style="max-width:260px; font-size:0.75rem; color:#94a3b8;">' + esc(item.note || '--') + '</td>' +
                    '<td style="text-align:right;">' +
                      '<div style="display:inline-flex; gap:6px;">' +
                        '<button type="button" class="es-obs-quick-btn" data-ob-act="forward-single" data-name="' + esc(item.nome) + '">Inoltra al DS</button>' +
                        '<button type="button" style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); color:#fca5a5; border-radius:6px; padding:4px 8px; font-size:0.72rem; cursor:pointer;" data-ob-act="remove-secret" data-id="' + esc(item.id || idx) + '">Rimuovi</button>' +
                      '</div>' +
                    '</td>' +
                  '</tr>';
                }).join('') +
              '</tbody>' +
            '</table>' +
          '</div>'
        )) +
      '</section>';
  }

  // 3. Dossier & Schede Tecniche Tab
  function renderTabDossier(dossiers) {
    return '' +
      '<section class="es-obs-card">' +
        '<div class="es-obs-card-head">' +
          '<h2 class="es-obs-card-title">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' +
            '<span>Dossier &amp; Relazioni di Scouting (' + dossiers.length + ')</span>' +
          '</h2>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
            '<button type="button" class="es-obs-btn-primary" data-ob-act="generate-sheet">Genera scheda tecnica IA</button>' +
            '<button type="button" class="es-obs-quick-btn" data-ob-act="add-dossier">+ Nuova Relazione</button>' +
          '</div>' +
        '</div>' +

        '<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:12px;">' +
          dossiers.map(function (d) {
            return '<div style="background:#060911; border:1px solid rgba(56,189,248,0.16); border-radius:8px; padding:14px;">' +
              '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">' +
                '<strong style="color:#f8fafc; font-size:0.95rem;">' + esc(d.player) + '</strong>' +
                '<span class="es-obs-badge-tag cyan">Voto: ' + esc(d.rating) + '</span>' +
              '</div>' +
              '<div style="font-size:0.75rem; color:#94a3b8; margin-bottom:6px;">' +
                'Gara visionata: <b>' + esc(d.match) + '</b> (' + esc(d.date) + ')' +
              '</div>' +
              '<div style="font-size:0.75rem; color:#cbd5e1; margin-bottom:10px; line-height:1.4;">' +
                esc(d.note) +
              '</div>' +
              '<div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(148,163,184,0.1); padding-top:8px;">' +
                '<span style="font-size:0.72rem; color:#4ade80; font-weight:700;">Consiglio: ' + esc(d.raccomandazione) + '</span>' +
                '<button type="button" class="es-obs-quick-btn" data-ob-act="forward-single" data-name="' + esc(d.player) + '">Condividi con DS</button>' +
              '</div>' +
            '</div>';
          }).join('') +
        '</div>' +
      '</section>';
  }

  // 4. Gare & Missioni Tab
  function renderTabGare(targetMatch) {
    return '' +
      '<section class="es-obs-card">' +
        '<div class="es-obs-card-head">' +
          '<h2 class="es-obs-card-title">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
            '<span>Missioni di Scouting &amp; Partite da Visionare</span>' +
          '</h2>' +
          '<button type="button" class="es-obs-btn-primary" data-ob-act="add-match">+ Aggiungi Gara a Calendario</button>' +
        '</div>' +

        '<div style="display:flex; flex-direction:column; gap:12px;">' +
          // Gara Prioritaria
          '<div style="background:rgba(2,132,199,0.08); border:1px solid rgba(56,189,248,0.3); border-radius:8px; padding:16px;">' +
            '<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">' +
              '<span class="es-obs-badge-tag cyan">⭐ Gara Prioritaria di Staff</span>' +
              '<span style="font-size:0.75rem; color:#38bdf8; font-weight:700;">' + esc(targetMatch.data) + ' · Ore ' + esc(targetMatch.orario) + '</span>' +
            '</div>' +
            '<h3 style="color:#ffffff; font-size:1.15rem; margin:8px 0 4px; font-weight:800;">' + esc(targetMatch.avversario) + '</h3>' +
            '<div style="font-size:0.78rem; color:#94a3b8; margin-bottom:12px;">' +
              esc(targetMatch.luogo) + ' · ' + esc(targetMatch.competizione) +
            '</div>' +
            '<div style="display:flex; gap:8px;">' +
              '<button type="button" class="es-obs-btn-primary" data-ob-nav="dossier">+ Compila Report dal Vivo</button>' +
              '<button type="button" class="es-obs-quick-btn" data-ob-nav="secret_list">Segna Calciatori da Seguire</button>' +
            '</div>' +
          '</div>' +

          // Altre partite in programma
          '<div style="background:#060911; border:1px solid rgba(56,189,248,0.14); border-radius:8px; padding:14px;">' +
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<strong style="color:#f8fafc; font-size:0.9rem;">Bisceglie vs Manfredonia U19</strong>' +
              '<span class="es-obs-badge-tag amber">26/09/2026</span>' +
            '</div>' +
            '<div style="font-size:0.75rem; color:#94a3b8; margin:4px 0 8px;">Stadio Gustavo Ventura (Bisceglie) · Campionato Juniores Regionali</div>' +
            '<span style="font-size:0.72rem; color:#4ade80;">Focus: Visione 2 esterni offensivi classe 2008</span>' +
          '</div>' +
        '</div>' +
      '</section>';
  }

  // 5. Database Calciatori Tab
  function renderTabDatabase() {
    return '' +
      '<section class="es-obs-card">' +
        '<div class="es-obs-card-head">' +
          '<h2 class="es-obs-card-title">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
            '<span>Database &amp; Motore di Ricerca Talenti</span>' +
          '</h2>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
            '<button type="button" class="es-obs-btn-primary" data-ob-act="generate-sheet">Genera scheda tecnica IA</button>' +
            '<button type="button" class="es-obs-quick-btn" data-ob-act="open-search-global">Apri Discovery Globale</button>' +
          '</div>' +
        '</div>' +

        '<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:10px; margin-bottom:16px;">' +
          '<button type="button" class="es-obs-action-card" data-ob-act="filter-role" data-role="portieri">' +
            '<div class="es-obs-action-text">' +
              '<b>🧤 Portieri U21</b>' +
              '<span>Reattività, uscite alte, gioco con i piedi.</span>' +
            '</div>' +
          '</button>' +
          '<button type="button" class="es-obs-action-card" data-ob-act="filter-role" data-role="difensori">' +
            '<div class="es-obs-action-text">' +
              '<b>🛡️ Difensori Centrali &amp; Terzini</b>' +
              '<span>Under di spinta e braccetti moderni.</span>' +
            '</div>' +
          '</button>' +
          '<button type="button" class="es-obs-action-card" data-ob-act="filter-role" data-role="centrocampisti">' +
            '<div class="es-obs-action-text">' +
              '<b>⚡ Centrocampisti &amp; Mezzali</b>' +
              '<span>Box-to-box, registi e trequartisti.</span>' +
            '</div>' +
          '</button>' +
          '<button type="button" class="es-obs-action-card" data-ob-act="filter-role" data-role="attaccanti">' +
            '<div class="es-obs-action-text">' +
              '<b>⚽ Attaccanti &amp; Ali</b>' +
              '<span>Finalizzatori, seconde punte e frecce.</span>' +
            '</div>' +
          '</button>' +
        '</div>' +

        '<div style="background:#060911; border:1px solid rgba(56,189,248,0.14); border-radius:8px; padding:16px; text-align:center;">' +
          '<div style="color:#f8fafc; font-weight:800; font-size:0.95rem; margin-bottom:6px;">Accedi a oltre 4.500 schede atleti con video e statistiche</div>' +
          '<div style="color:#94a3b8; font-size:0.78rem; max-width:480px; margin:0 auto 12px;">Consulta le schede tecniche, guarda le clip indicizzate e aggiungi con un solo click i profili più promettenti alla tua Secret List.</div>' +
          '<button type="button" class="es-obs-btn-primary" data-ob-act="open-search-global">Esplora Database Completo &rarr;</button>' +
        '</div>' +
      '</section>';
  }

  // 6. Radar & Competenze Tab
  function renderTabRadar() {
    return '' +
      '<section class="es-obs-card">' +
        '<div class="es-obs-card-head">' +
          '<h2 class="es-obs-card-title">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/></svg>' +
            '<span>Quadro Tecnico &amp; Radar Competenze Scout</span>' +
          '</h2>' +
          '<span class="es-obs-badge-tag cyan">Radar Operativo Ufficiale</span>' +
        '</div>' +

        '<div style="display:grid; grid-template-columns:1.2fr 1fr; gap:16px; align-items:center;">' +
          '<div style="display:flex; justify-content:center; align-items:center; background:#060911; border-radius:8px; padding:12px; border:1px solid rgba(56,189,248,0.12);">' +
            radarSvg() +
          '</div>' +

          '<div>' +
            '<h3 style="color:#f8fafc; font-size:1rem; font-weight:800; margin:0 0 8px;">Indicatori di Performance Scout</h3>' +
            '<p style="color:#94a3b8; font-size:0.78rem; line-height:1.45; margin-bottom:12px;">' +
              'Il grafico radar confronta l\'indice di accuratezza attuale dello scout (poligono ciano 2025/26) con il benchmark medio di categoria (poligono grigio 2023/24).' +
            '</p>' +

            '<div style="display:flex; flex-direction:column; gap:8px;">' +
              '<div style="background:#060911; border:1px solid rgba(56,189,248,0.12); border-radius:6px; padding:8px 12px; display:flex; justify-content:space-between;">' +
                '<span style="font-size:0.75rem; color:#94a3b8;">Precisione Valutazioni:</span>' +
                '<strong style="color:#38bdf8; font-size:0.8rem;">92% (Top 5%)</strong>' +
              '</div>' +
              '<div style="background:#060911; border:1px solid rgba(56,189,248,0.12); border-radius:6px; padding:8px 12px; display:flex; justify-content:space-between;">' +
                '<span style="font-size:0.75rem; color:#94a3b8;">Conoscenza del Mercato:</span>' +
                '<strong style="color:#38bdf8; font-size:0.8rem;">94% (Elite)</strong>' +
              '</div>' +
              '<div style="background:#060911; border:1px solid rgba(56,189,248,0.12); border-radius:6px; padding:8px 12px; display:flex; justify-content:space-between;">' +
                '<span style="font-size:0.75rem; color:#94a3b8;">Segnalazioni Convertite:</span>' +
                '<strong style="color:#4ade80; font-size:0.8rem;">85% (8/10 Tesserati)</strong>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>';
  }

  // 7. Canale DS & Governance Tab
  function renderTabCanaleDs(user) {
    var on = underContract(user);
    var club = String(user.squadra || user.club || 'Foggia City').trim();

    return '' +
      '<div class="es-obs-grid-2col">' +
        // Governance
        '<section class="es-obs-card">' +
          '<div class="es-obs-card-head">' +
            '<h2 class="es-obs-card-title">' +
              '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>' +
              '<span>Limiti di Ruolo &amp; Governance FIGC</span>' +
            '</h2>' +
            '<span class="es-obs-badge-tag amber">Compliance</span>' +
          '</div>' +

          '<ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:10px;">' +
            '<li style="display:flex; gap:10px; font-size:0.76rem; color:#cbd5e1; line-height:1.4;">' +
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" style="flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>' +
              '<span><b>Nessuna trattativa economica diretta</b> — Gli accordi contrattuali e i premi di tesseramento sono di competenza esclusiva del Direttore Sportivo e del Presidente.</span>' +
            '</li>' +
            '<li style="display:flex; gap:10px; font-size:0.76rem; color:#cbd5e1; line-height:1.4;">' +
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" style="flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>' +
              '<span><b>Rispetto della privacy federale</b> — I report tecnici e le schede secret rimangono confidenziali e ad uso interno del club.</span>' +
            '</li>' +
            '<li style="display:flex; gap:10px; font-size:0.76rem; color:#4ade80; stroke-width:2; line-height:1.4;">' +
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2" style="flex-shrink:0;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' +
              '<span><b>Canale diretto prioritario</b> — Inoltro immediato dei target con un click al DS di ' + esc(club) + '.</span>' +
            '</li>' +
          '</ul>' +
        '</section>' +

        // Wall Trattative
        '<section class="es-obs-card">' +
          '<div class="es-obs-card-head">' +
            '<h2 class="es-obs-card-title">' +
              '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>' +
              '<span>Wall Trattative Chiuse</span>' +
            '</h2>' +
            '<button type="button" class="es-obs-btn-primary" data-ob-act="open-wall" style="font-size:0.74rem; padding:4px 8px;">Apri Wall &rarr;</button>' +
          '</div>' +

          '<p style="font-size:0.78rem; color:#94a3b8; line-height:1.45; margin-bottom:12px;">' +
            'Visualizza i contratti depositati e le trattative ufficialmente chiuse dai club sulla piattaforma Elisee Scout in stile FIFA/mercato.' +
          '</p>' +

          '<div style="background:#060911; border:1px solid rgba(56,189,248,0.12); border-radius:6px; padding:10px 12px; display:flex; justify-content:space-between; align-items:center;">' +
            '<div>' +
              '<b style="color:#f8fafc; font-size:0.82rem; display:block;">Trattative Ufficiali 2026/27</b>' +
              '<span style="font-size:0.72rem; color:#4ade80;">14 Trasferimenti Registrati nel Girone</span>' +
            '</div>' +
            '<button type="button" class="es-obs-quick-btn" data-ob-act="open-wall">Consulta Wall</button>' +
          '</div>' +
        '</section>' +
      '</div>';
  }

  // ============================================================
  // RENDER PRINCIPALE (SHELL COMPLETA)
  // ============================================================
  function renderHub(user) {
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

    host.classList.add('es-obs-on');
    host.classList.remove('es-pd-on', 'es-ds-on', 'es-pres-on', 'es-vice-on', 'es-fisio-on', 'es-ma-on', 'es-med-on', 'es-tm-on', 'es-gk-on', 'es-at-on', 'es-yg-on');

    if (group) {
      group.classList.add('is-obs-dash');
      group.classList.remove('is-coach-dash', 'is-ds-dash', 'is-pres-dash', 'is-vice-dash', 'is-fisio-dash', 'is-ma-dash', 'is-med-dash', 'is-tm-dash', 'is-gk-dash', 'is-at-dash', 'is-yg-dash');
    }
    document.body.classList.add('is-obs-mode');

    var name = obsName(user);
    var club = String(user.squadra || user.club || 'Foggia City').trim();
    var qual = qualificaOf(user);
    var on = underContract(user);
    var secretList = getSecretList();
    var dossiers = getDossierList();
    var nextMatch = getNextMatchTarget();

    var html =
      '<div class="es-obs-shell">' +
        // 1. SIDEBAR TECNICA GESTIONALE A SINISTRA (240px)
        '<aside class="es-obs-sidebar">' +
          '<div class="es-obs-brand-header">' +
            '<div class="es-obs-brand-title">ELISEE <span>SCOUT</span></div>' +
            '<div class="es-obs-brand-sub">Area Talent Scouting</div>' +
          '</div>' +
          '<nav class="es-obs-sidebar-nav">' +
            renderSideBtn('dashboard', 'Dashboard', '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>') +
            renderSideBtn('secret_list', 'Secret List Stealth (' + secretList.length + ')', '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>') +
            renderSideBtn('dossier', 'Dossier &amp; Schede', '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>') +
            renderSideBtn('gare', 'Gare &amp; Missioni', '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>') +
            renderSideBtn('database', 'Database Calciatori', '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>') +
            renderSideBtn('radar', 'Radar &amp; Competenze', '<circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/>') +
            renderSideBtn('canale_ds', 'Canale DS &amp; Trattative', '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/>') +
            renderSideBtn('impostazioni', 'Profilo &amp; Abilitazione', '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06-.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>') +
          '</nav>' +
          '<div class="es-obs-sidebar-badge">' +
            '<div class="es-obs-sidebar-club-card">' +
              '<img src="immagini/squadre-loghi/foggia-city.png?v=20260917_FGCLIC1" alt="' + esc(club) + '" onerror="this.onerror=null;this.src=\'immagini/squadre-loghi/foggia-city.png\';">' +
              '<div>' +
                '<strong>' + esc(club) + '</strong>' +
                '<span>Staff Scouting Ufficiale</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</aside>' +

        // 2. MAIN WORKSPACE
        '<main class="es-obs-main">' +
          // HEADER A DUE LIVELLI (Identità + Prossima Partita/Missione)
          '<div class="es-obs-dash-header">' +
            // Livello 1: Identità Scout & Club
            '<div class="es-obs-header-top-row">' +
              '<button type="button" class="es-obs-mobile-menu-btn" id="btn-toggle-obs-sidebar" aria-label="Menu">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>' +
              '</button>' +
              '<div class="es-obs-header-identity">' +
                '<div class="es-obs-header-block">' +
                  '<div class="es-obs-licence-badge" title="Patentino FIGC Scout">' +
                    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>' +
                  '</div>' +
                  '<div class="es-obs-scout-info">' +
                    '<strong>' + esc(name) + '</strong>' +
                    '<span class="role">Osservatore / Talent Scout</span>' +
                    '<p class="sub">Tesseramento FIGC: FIGC-SCOUT-7842 · Scadenza: 30/06/2027</p>' +
                  '</div>' +
                '</div>' +
                '<div class="es-obs-header-sep"></div>' +
                '<div class="es-obs-header-block es-obs-club-info">' +
                  '<img class="crest" src="immagini/squadre-loghi/foggia-city.png?v=20260917_FGCLIC1" alt="' + esc(club) + '" onerror="this.onerror=null;this.src=\'immagini/squadre-loghi/foggia-city.png\';">' +
                  '<div>' +
                    '<strong>' + esc(club) + '</strong>' +
                    '<span>Prima Squadra &amp; Settore Giovanile</span>' +
                  '</div>' +
                '</div>' +
              '</div>' +
              '<button type="button" class="es-obs-btn-quick-jump" data-ob-nav="secret_list">' +
                'Secret List Stealth (' + secretList.length + ') &rarr;' +
              '</button>' +
            '</div>' +

            // Livello 2: Prossima Visione + Countdown + Focus di Giornata
            '<div class="es-obs-header-match-row">' +
              '<div class="es-obs-target-box">' +
                '<p class="label">Prossima Gara da Visionare</p>' +
                '<strong>' + esc(nextMatch.avversario) + '</strong>' +
                '<span>' + esc(nextMatch.data) + ' · Ore ' + esc(nextMatch.orario) + ' (' + esc(nextMatch.luogo) + ')</span>' +
              '</div>' +
              '<div class="es-obs-target-box">' +
                '<p class="label">Countdown Calcio d\'Inizio</p>' +
                '<div class="es-obs-countdown-nums">' +
                  '<div><strong>' + String(nextMatch.giorniMancanti || 0).padStart(2, '0') + '</strong><span>Giorni</span></div>' +
                  '<div><strong>' + String(nextMatch.oreMancanti || 0).padStart(2, '0') + '</strong><span>Ore</span></div>' +
                  '<div><strong>' + String(nextMatch.minutiMancanti || 0).padStart(2, '0') + '</strong><span>Min</span></div>' +
                '</div>' +
              '</div>' +
              '<div class="es-obs-target-box">' +
                '<p class="label">Obiettivo di Giornata</p>' +
                '<strong style="color:#38bdf8;">Monitoraggio Under 19 &amp; Svincolati</strong>' +
                '<span>Focus: 2 esterni offensivi con cambio passo nell\'1v1</span>' +
              '</div>' +
            '</div>' +
          '</div>' +

          // 3. TAB BAR SUPERIORE COMPATTA
          '<nav class="es-obs-nav-tabs">' +
            renderNavTab('dashboard', 'Dashboard', '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>') +
            renderNavTab('secret_list', 'Secret List', '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>') +
            renderNavTab('dossier', 'Dossier &amp; Schede', '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>') +
            renderNavTab('gare', 'Gare &amp; Missioni', '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>') +
            renderNavTab('database', 'Database Calciatori', '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>') +
            renderNavTab('radar', 'Radar &amp; Competenze', '<circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/>') +
            renderNavTab('canale_ds', 'Canale DS &amp; Governance', '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/>') +
          '</nav>' +

          // 4. CONTENITORE VISTA ATTIVA
          '<div id="es-obs-active-content">' +
            renderActiveTabContent(activeTab, user, secretList, dossiers, nextMatch) +
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
    return '<button type="button" class="es-obs-side-btn ' + (isActive ? 'is-active' : '') + '" data-ob-nav="' + tabKey + '">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke-width="2">' + svgPath + '</svg>' +
      '<span>' + esc(label) + '</span>' +
    '</button>';
  }

  function renderNavTab(tabKey, label, svgPath) {
    var isActive = activeTab === tabKey;
    return '<button type="button" class="es-obs-tab-btn ' + (isActive ? 'is-active' : '') + '" data-ob-nav="' + tabKey + '">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' + svgPath + '</svg>' +
      '<span>' + esc(label) + '</span>' +
    '</button>';
  }

  function renderActiveTabContent(tabKey, user, secretList, dossiers, nextMatch) {
    switch (tabKey) {
      case 'secret_list':
        return renderTabSecretList(secretList);
      case 'dossier':
        return renderTabDossier(dossiers);
      case 'gare':
        return renderTabGare(nextMatch);
      case 'database':
        return renderTabDatabase();
      case 'radar':
        return renderTabRadar();
      case 'canale_ds':
        return renderTabCanaleDs(user);
      case 'impostazioni':
        return renderTabDashboard(user, secretList);
      case 'dashboard':
      default:
        return renderTabDashboard(user, secretList);
    }
  }

  // ============================================================
  // GESTIONE EVENTI & MODALI
  // ============================================================
  function bindAllEvents(container) {
    if (!container) return;

    // Switch Tab
    container.querySelectorAll('[data-ob-nav]').forEach(function (btn) {
      btn.onclick = function (e) {
        e.preventDefault();
        var t = btn.getAttribute('data-ob-nav');
        if (t === 'impostazioni') {
          openObsEditModal(userObj());
          return;
        }
        if (t) {
          activeTab = t;
          renderHub(userObj());
        }
      };
    });

    // Toggle Sidebar Mobile
    var btnToggle = container.querySelector('#btn-toggle-obs-sidebar');
    var sidebar = container.querySelector('.es-obs-sidebar');
    if (btnToggle && sidebar) {
      btnToggle.onclick = function () {
        sidebar.classList.toggle('is-open');
      };
    }

    // Azioni Operative
    container.querySelectorAll('[data-ob-act]').forEach(function (btn) {
      btn.onclick = function (e) {
        e.preventDefault();
        var act = btn.getAttribute('data-ob-act');

        if (act === 'forward-ds') {
          toast('Tutti i target della Secret List sono stati inoltrati alla casella del Direttore Sportivo di Foggia City.', 'success');
          return;
        }

        if (act === 'forward-single') {
          var name = btn.getAttribute('data-name') || 'Calciatore';
          toast('Scheda e dossier di ' + name + ' inviati con successo al Direttore Sportivo.', 'success');
          return;
        }

        if (act === 'remove-secret') {
          var id = btn.getAttribute('data-id');
          var list = getSecretList();
          var filtered = list.filter(function (x, idx) { return (x.id || idx) != id; });
          saveSecretList(filtered);
          toast('Calciatore rimosso dalla Secret List.', 'info');
          renderHub(userObj());
          return;
        }

        if (act === 'add-secret') {
          var nome = prompt('Nome e Cognome del calciatore da monitorare:');
          if (!nome) return;
          var ruolo = prompt('Ruolo (es. Attaccante / Ala, Mediano, Difensore):', 'Centrocampista');
          var squadra = prompt('Squadra di appartenenza attuale:', 'Svincolato');
          var potenziale = prompt('Valutazione potenziale (es. A, B+, Top Prospect):', 'A (Top Prospect)');
          var note = prompt('Note tecniche stealth:');

          var list2 = getSecretList();
          list2.unshift({
            id: 'sl-' + Date.now(),
            nome: nome.trim(),
            ruolo: (ruolo || 'Calciatore').trim(),
            squadra: (squadra || 'Club').trim(),
            cat: 'Serie D / Eccellenza',
            eta: 19,
            potenziale: (potenziale || 'A').trim(),
            note: note || 'Visionato sul campo'
          });
          saveSecretList(list2);
          toast(nome + ' aggiunto alla Secret List in modalità stealth!', 'success');
          renderHub(userObj());
          return;
        }

        if (act === 'generate-sheet') {
          var qSheet = prompt('Nome, ruolo o società del tesserato per la scheda tecnica IA:');
          if (qSheet && window.EliseeSchede && window.EliseeSchede.generateFor) {
            var shIa = window.EliseeSchede.generateFor(qSheet, 'scout');
            if (shIa) {
              toast('Scheda tecnica IA generata per ' + shIa.name + '.', 'success');
              if (window.EliseeSchede.openViewer) window.EliseeSchede.openViewer(shIa, 'scout');
            }
          }
          return;
        }

        if (act === 'add-dossier') {
          var pl = prompt('Nome del calciatore per il dossier:');
          if (!pl) return;
          var match = prompt('Gara visionata:', 'Partita di Campionato');
          var rating = prompt('Voto prestazione (es. 8.0):', '8.0');
          var noteD = prompt('Sintesi relazione tecnica:');

          var dList = getDossierList();
          dList.unshift({
            id: 'dos-' + Date.now(),
            player: pl.trim(),
            date: 'Oggi',
            match: match || 'Gara visionata',
            rating: rating || '8.0',
            raccomandazione: 'Seguire con attenzione',
            note: noteD || 'Ottima prestazione'
          });
          saveDossierList(dList);
          toast('Relazione tecnica di ' + pl + ' archiviata!', 'success');
          renderHub(userObj());
          return;
        }

        if (act === 'open-wall') {
          if (window.openTransferWall) window.openTransferWall();
          else toast('Wall Trasferimenti aperto.', 'info');
          return;
        }

        if (act === 'open-search-global') {
          if (window.switchView) window.switchView('scopri', '#scopri-profili');
          else toast('Discovery Profili aperto.', 'info');
          return;
        }

        if (act === 'filter-role') {
          var r = btn.getAttribute('data-role');
          if (window.switchView) window.switchView('scopri', '#scopri-profili');
          else toast('Filtro applicato: ' + r, 'info');
          return;
        }
      };
    });
  }

  // Modale Modifica Anagrafica Scout
  function openObsEditModal(user) {
    user = user || userObj();
    var backdrop = document.createElement('div');
    backdrop.className = 'es-edit-modal-backdrop';

    backdrop.innerHTML = '<div class="es-edit-modal">' +
      '<div class="es-edit-modal-head">' +
      '<h2><span>✏️</span> Modifica Anagrafica Osservatore &amp; Scout</h2>' +
      '<button type="button" class="es-edit-modal-close" title="Chiudi">&times;</button>' +
      '</div>' +
      '<div class="es-edit-grid">' +
      '<div class="es-edit-field"><label>Nome</label><input id="es-obs-nome" value="' + esc(user.nome || '') + '"></div>' +
      '<div class="es-edit-field"><label>Cognome</label><input id="es-obs-cognome" value="' + esc(user.cognome || '') + '"></div>' +
      '<div class="es-edit-field"><label>Qualifica FIGC / Certificazione</label><input id="es-obs-qual" value="' + esc(qualificaOf(user)) + '"></div>' +
      '<div class="es-edit-field"><label>Ruolo Ufficiale</label><input id="es-obs-role" value="Osservatore / Talent Scout" readonly></div>' +
      '<div class="es-edit-field"><label>Club Affiliato</label><input id="es-obs-club" value="' + esc(user.squadra || user.club || 'Foggia City') + '"></div>' +
      '<div class="es-edit-field"><label>Status Contrattuale</label><select id="es-obs-status">' +
      '<option value="under-contract"' + (underContract(user) ? ' selected' : '') + '>In Staff Club (Collegato al DS)</option>' +
      '<option value="free-agent"' + (!underContract(user) ? ' selected' : '') + '>Free Agent / Scout Indipendente</option>' +
      '</select></div>' +
      '<div class="es-edit-field full"><label>Metodologia &amp; Categorie Coperte</label><textarea id="es-obs-bio" rows="3">' + esc(user.bio || 'Monitoraggio Serie D, Eccellenza e Campionati Giovanili Nazionali') + '</textarea></div>' +
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
      var nome = backdrop.querySelector('#es-obs-nome').value.trim();
      var cognome = backdrop.querySelector('#es-obs-cognome').value.trim();
      var qual = backdrop.querySelector('#es-obs-qual').value.trim();
      var clb = backdrop.querySelector('#es-obs-club').value.trim();
      var ctr = backdrop.querySelector('#es-obs-status').value;
      var bio = backdrop.querySelector('#es-obs-bio').value.trim();

      user.nome = nome;
      user.cognome = cognome;
      user.squadra = clb || 'Foggia City';
      user.club = clb || 'Foggia City';
      user.obsQualifica = qual;
      user.qualificaScout = qual;
      user.obsContract = ctr;
      user.contractStatus = ctr;
      user.bio = bio;

      try {
        localStorage.setItem('elisee_active_user', JSON.stringify(user));
        localStorage.setItem('elisee_user_data', JSON.stringify(user));
      } catch (_) {}

      close();
      toast('Anagrafica Scout aggiornata con successo!', 'success');
      renderHub(user);
    };
  }

  // ============================================================
  // EXPORT GLOBALE & LISTENER
  // ============================================================
  window.EliseeObsDash = {
    render: renderHub,
    isObs: isObs,
    underContract: underContract,
    qualificaOf: qualificaOf,
    getSecretList: getSecretList
  };

  document.addEventListener('elisee:view-changed', function (e) {
    var d = e && e.detail;
    if (d && d.view === 'user-dossier') {
      try {
        var u = userObj();
        if (isObs(u)) renderHub(u);
      } catch (_) {}
    }
  });

  document.addEventListener('elisee:role-changed', function (e) {
    var d = e && e.detail;
    try {
      var u = (d && d.user) || userObj();
      if (isObs(u)) renderHub(u);
    } catch (_) {}
  });

  window.addEventListener('hashchange', function () {
    if (window.location.hash.indexOf('user-dossier') >= 0 && isObs()) {
      setTimeout(renderHub, 50);
    }
  });

  document.addEventListener('DOMContentLoaded', function () {
    if (window.location.hash.indexOf('user-dossier') >= 0 && isObs()) {
      setTimeout(renderHub, 100);
    }
  });
})();
