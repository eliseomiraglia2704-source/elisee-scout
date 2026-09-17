/* ============================================================
   ELISEE SCOUT — AREA MEDICO SOCIALE & STAFF SANITARIO
   Medical Intelligence OS — Sidebar 240px + Tab bar + Header 2 livelli
   ============================================================ */
(function () {
  'use strict';

  var activeTab = 'dashboard';
  var AXES = [
    'Idoneità Agonistiche', 'Prevenzione Traumi', 'Cartella Clinica Rosa', 'Monitoraggio Recupero',
    'Pronto Soccorso Campo', 'Nutrizione & Integrazione', 'Diagnostica / Ecografie', 'Coordinamento Staff'
  ];
  var V2025 = [96, 92, 94, 90, 95, 88, 91, 93];
  var V2023 = [82, 79, 81, 76, 84, 75, 78, 80];

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
    } catch (_) { return { squadra: 'Foggia City', club: 'Foggia City' }; }
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
    var p = String(name || 'MS').trim().split(/\s+/);
    return ((p[0] || 'M').charAt(0) + (p[1] || p[0] || 'S').charAt(0)).toUpperCase();
  }

  function qualificaOf(u) {
    return String((u && (u.medQualifica || u.qualificaMedico || u.certificazione)) || '').trim() || 'Medico Sociale FMSI / Ordine Medici';
  }

  function getVisits() {
    try {
      var raw = JSON.parse(localStorage.getItem('elisee_med_visits') || '[]');
      if (Array.isArray(raw) && raw.length > 0) return raw;
    } catch (_) {}
    return [
      { id: 'v-1', player: 'Jacopo Murano', date: '15/09/2026', tipo: 'Visita di Controllo', esito: 'Idoneita Confermata', note: 'Parametri cardiovascolari nella norma. ECG negativo.' },
      { id: 'v-2', player: 'Diego Peralta', date: '12/09/2026', tipo: 'Infortunio Muscolare', esito: 'Lesione II grado retto femorale dx', note: 'RMN consigliata. Stop 3-4 settimane.' },
      { id: 'v-3', player: 'Carlos Embalo', date: '10/09/2026', tipo: 'Visita Idoneita', esito: 'Idoneita Valida', note: 'ECG ok. Visita spirometrica programmata.' }
    ];
  }

  function toast(msg, type) {
    if (typeof window.showToast === 'function') window.showToast(msg, type || 'info');
    else alert(msg);
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

  function radarSvg() {
    var cx = 220, cy = 200, r = 135, n = AXES.length;
    var html = '<svg viewBox="0 0 440 400" style="width:100%;height:auto;max-height:300px;" role="img" aria-label="Competenze medico">';
    for (var ring = 1; ring <= 5; ring++) {
      html += '<polygon points="' + poly(cx, cy, r, AXES.map(function () { return ring * 20; })) + '" fill="none" stroke="rgba(148,163,184,0.16)" stroke-width="1"/>';
    }
    for (var i = 0; i < n; i++) {
      var e = polar(cx, cy, r, i, n, 100);
      html += '<line x1="' + cx + '" y1="' + cy + '" x2="' + e[0].toFixed(1) + '" y2="' + e[1].toFixed(1) + '" stroke="rgba(148,163,184,0.16)"/>';
      var lab = polar(cx, cy, r + 24, i, n, 100);
      html += '<text x="' + lab[0].toFixed(1) + '" y="' + lab[1].toFixed(1) + '" text-anchor="middle" dominant-baseline="middle" fill="#94a3b8" font-size="8.5" font-weight="600">' + esc(AXES[i]) + ' ' + V2025[i] + '%</text>';
    }
    html += '<polygon points="' + poly(cx, cy, r, V2023) + '" fill="rgba(148,163,184,0.10)" stroke="#64748b" stroke-width="1.5"/>';
    html += '<polygon points="' + poly(cx, cy, r, V2025) + '" fill="rgba(56,189,248,0.14)" stroke="#38bdf8" stroke-width="2"/>';
    html += '</svg>';
    return html;
  }

  function hideOthers() {
    if (typeof window.unmountAllRoleDashboards === 'function') window.unmountAllRoleDashboards('es-md');
  }

  function renderSideBtn(tab, label, svgInner) {
    var cls = activeTab === tab ? ' is-active' : '';
    return '<button type="button" class="es-med-side-btn' + cls + '" data-med-nav="' + tab + '">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' + svgInner + '</svg>' +
      '<span>' + label + '</span></button>';
  }

  function renderNavTab(tab, label, svgInner) {
    var cls = activeTab === tab ? ' is-active' : '';
    return '<button type="button" class="es-med-tab-btn' + cls + '" data-med-nav="' + tab + '">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' + svgInner + '</svg>' +
      label + '</button>';
  }

  /* ---- TAB DASHBOARD ---- */
  function renderTabDashboard(user, visits) {
    var name = medName(user), on = !!(user.squadra || user.club);
    var club = String(user.squadra || user.club || 'Foggia City').trim();
    var qual = qualificaOf(user);
    return '<div class="es-med-grid-2col">' +
      '<section class="es-med-card">' +
        '<div class="es-med-card-head">' +
          '<h2 class="es-med-card-title"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span>Profilo Ufficiale Medico Sociale</span></h2>' +
          '<div style="display:flex;gap:6px;"><span class="es-med-badge-tag cyan">FMSI</span><span class="es-med-badge-tag emerald">' + (on ? 'In Staff' : 'Free Agent') + '</span></div>' +
        '</div>' +
        '<div class="es-med-profile-row">' +
          '<div class="es-med-avatar-fallback">' + esc(initials(name)) + '</div>' +
          '<div class="es-med-user-meta">' +
            '<b class="es-med-user-name">' + esc(name) + '</b>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
              '<span style="font-size:0.72rem;color:#38bdf8;background:rgba(56,189,248,0.12);border:1px solid rgba(56,189,248,0.28);border-radius:4px;padding:2px 6px;font-weight:800;text-transform:uppercase;">Medico Sociale</span>' +
              '<span style="font-size:0.75rem;color:#cbd5e1;font-weight:600;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" style="vertical-align:middle;margin-right:3px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' + esc(club) + '</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div style="background:#060911;border:1px solid rgba(56,189,248,0.12);border-radius:6px;padding:8px 12px;margin-bottom:10px;">' +
          '<div style="display:flex;justify-content:space-between;font-size:0.72rem;color:#94a3b8;font-weight:700;"><span>Completamento Anagrafica &amp; Abilitazione</span><span style="color:#38bdf8;font-weight:900;">85%</span></div>' +
          '<div class="es-med-progress-track"><div class="es-med-progress-fill" style="width:85%;"></div></div>' +
          '<div style="display:flex;justify-content:flex-end;"><button type="button" data-med-nav="impostazioni" style="font-size:0.72rem;color:#38bdf8;padding:0;background:none;border:none;cursor:pointer;">&#9999;&#65039; Modifica Anagrafica</button></div>' +
        '</div>' +
        '<div class="es-med-cred-grid">' +
          '<div class="es-med-cred-item"><span>Qualifica Ufficiale</span><b>' + esc(qual) + '</b></div>' +
          '<div class="es-med-cred-item"><span>Iscrizione Ordine</span><b>Ordine Medici FG #7291</b></div>' +
        '</div>' +
      '</section>' +
      '<section class="es-med-card">' +
        '<div class="es-med-card-head">' +
          '<h2 class="es-med-card-title"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg><span>Monitoraggio Sanitario &amp; Idoneita Rosa</span></h2>' +
          '<span class="es-med-badge-tag emerald">100% Valide</span>' +
        '</div>' +
        '<div class="es-med-kpi-grid">' +
          '<div class="es-med-kpi-box"><strong>24</strong><span>Idoneita Valide &#x1F7E2;</span></div>' +
          '<div class="es-med-kpi-box"><strong>0</strong><span>In Scadenza &#x1F7E1;</span></div>' +
          '<div class="es-med-kpi-box"><strong>0</strong><span>Non Idonei &#x1F534;</span></div>' +
          '<div class="es-med-kpi-box"><strong>1</strong><span>In Terapia Conservativa</span></div>' +
          '<div class="es-med-kpi-box"><strong>22</strong><span>Piena Disponibilita</span></div>' +
          '<div class="es-med-kpi-box"><strong>0</strong><span>Interventi Chirurgici</span></div>' +
        '</div>' +
        '<div class="es-med-quick-actions">' +
          '<button type="button" class="es-med-quick-btn" data-med-nav="visite">&#x1FA7A; Nuova Visita</button>' +
          '<button type="button" class="es-med-quick-btn" data-med-nav="idoneita">&#x2705; Idoneita</button>' +
          '<button type="button" class="es-med-quick-btn" data-med-nav="infortuni">&#x1F9B4; Infortuni</button>' +
          '<button type="button" class="es-med-quick-btn" data-med-nav="rtp">&#x1F504; Return to Play</button>' +
        '</div>' +
      '</section>' +
    '</div>' +
    '<section class="es-med-card">' +
      '<div class="es-med-card-head">' +
        '<h2 class="es-med-card-title"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg><span>Strumenti Operativi &#8212; Medical Suite v3.0</span></h2>' +
        '<span class="es-med-badge-tag cyan">Medical Engine</span>' +
      '</div>' +
      '<div class="es-med-actions-grid">' +
        '<button type="button" class="es-med-action-card" data-med-nav="visite"><div class="es-med-action-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div><div class="es-med-action-text"><b>Registra Visita / Controllo</b><span>Nuova visita medica con referto digitale e firma elettronica.</span></div></button>' +
        '<button type="button" class="es-med-action-card" data-med-nav="idoneita"><div class="es-med-action-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div><div class="es-med-action-text"><b>Certifica Idoneita Agonistica</b><span>Emetti certificato FMSI per campionato e coppa con scadenza programmata.</span></div></button>' +
        '<button type="button" class="es-med-action-card" data-med-nav="infortuni"><div class="es-med-action-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20"/></svg></div><div class="es-med-action-text"><b>Registro Infortuni &amp; Diagnosi</b><span>Diagnosi ICD, fascia di rischio e tempi stimati di recupero.</span></div></button>' +
        '<button type="button" class="es-med-action-card" data-med-nav="prescrizioni"><div class="es-med-action-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div><div class="es-med-action-text"><b>Prescrizioni &amp; Fisioterapia</b><span>Invia prescrizione terapeutica al Fisioterapista con piano di trattamento.</span></div></button>' +
        '<button type="button" class="es-med-action-card" data-med-nav="rtp"><div class="es-med-action-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg></div><div class="es-med-action-text"><b>Attestazione Return to Play</b><span>Valida la guarigione e autorizza il rientro in allenamento.</span></div></button>' +
        '<button type="button" class="es-med-action-card" data-med-nav="dossier"><div class="es-med-action-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div><div class="es-med-action-text"><b>Dossier Sanitario Riservato</b><span>Cartella clinica protetta dal segreto professionale. Solo medico.</span></div></button>' +
      '</div>' +
    '</section>' +
    '<section class="es-med-card">' +
      '<div class="es-med-card-head">' +
        '<h2 class="es-med-card-title"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg><span>Ultime Visite &amp; Aggiornamenti Clinici</span></h2>' +
        '<button type="button" data-med-nav="visite" style="font-size:0.75rem;color:#38bdf8;background:none;border:none;cursor:pointer;">Vedi Tutti &#8594;</button>' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;gap:8px;">' +
        visits.slice(0, 3).map(function (v) {
          var ok = v.esito && v.esito.toLowerCase().indexOf('idoneita') !== -1;
          return '<div style="background:#060911;border:1px solid rgba(56,189,248,0.12);border-radius:8px;padding:10px 14px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">' +
            '<div><b style="color:#f8fafc;font-size:0.86rem;display:block;">' + esc(v.player) + ' <span style="font-size:0.72rem;color:#38bdf8;">(' + esc(v.tipo) + ')</span></b>' +
            '<span style="color:#94a3b8;font-size:0.74rem;">' + esc(v.date) + ' &middot; Esito: <strong style="color:' + (ok ? '#4ade80' : '#fbbf24') + ';">' + esc(v.esito) + '</strong></span></div>' +
            '<button type="button" class="es-med-quick-btn">Dettagli</button>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</section>';
  }

  /* ---- TAB VISITE ---- */
  function renderTabVisite(visits) {
    return '<section class="es-med-card">' +
      '<div class="es-med-card-head"><h2 class="es-med-card-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><span>Registro Visite &amp; Certificazioni (' + visits.length + ')</span></h2><button type="button" class="es-med-btn-primary" data-med-act="new-visit">+ Nuova Visita</button></div>' +
      '<div style="overflow-x:auto;"><table class="es-med-table"><thead><tr><th>Atleta</th><th>Data</th><th>Tipo</th><th>Esito</th><th>Note</th><th style="text-align:right;">Azioni</th></tr></thead><tbody>' +
        visits.map(function (v) {
          var ok = v.esito && v.esito.toLowerCase().indexOf('idoneita') !== -1;
          return '<tr><td><strong style="color:#f8fafc;">' + esc(v.player) + '</strong></td><td>' + esc(v.date) + '</td><td>' + esc(v.tipo) + '</td><td><span class="es-med-badge-tag ' + (ok ? 'emerald' : 'amber') + '">' + esc(v.esito) + '</span></td><td style="max-width:240px;font-size:0.75rem;color:#94a3b8;">' + esc(v.note || '--') + '</td><td style="text-align:right;"><button type="button" class="es-med-quick-btn">Apri</button></td></tr>';
        }).join('') +
      '</tbody></table></div>' +
    '</section>';
  }

  /* ---- TAB INFORTUNI ---- */
  function renderTabInfortuni() {
    var injuries = [
      { player: 'Diego Peralta', tipo: 'Lesione Muscolare', distretto: 'Retto femorale dx', grado: 'II', stop: '3-4 settimane', status: 'In terapia' },
      { player: 'Moses Odjer', tipo: 'Contusione', distretto: 'Caviglia sinistra', grado: 'Lieve', stop: '5-7 giorni', status: 'Parzialmente disponibile' }
    ];
    return '<section class="es-med-card">' +
      '<div class="es-med-card-head"><h2 class="es-med-card-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M12 2v20M2 12h20"/></svg><span>Registro Infortuni &amp; Diagnosi ICD</span></h2><button type="button" class="es-med-btn-primary" data-med-act="new-injury">+ Nuovo Infortunio</button></div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:12px;">' +
        injuries.map(function (inj) {
          var grave = inj.grado === 'II' || inj.grado === 'III';
          return '<div style="background:#060911;border:1px solid rgba(' + (grave ? '251,191,36' : '56,189,248') + ',0.2);border-radius:8px;padding:14px;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><strong style="color:#f8fafc;font-size:0.95rem;">' + esc(inj.player) + '</strong><span class="es-med-badge-tag ' + (grave ? 'amber' : 'cyan') + '">' + esc(inj.grado) + '</span></div>' +
            '<div style="font-size:0.78rem;color:#94a3b8;line-height:1.6;"><div>&#x1F9B4; <strong style="color:#e2e8f0;">Tipo:</strong> ' + esc(inj.tipo) + '</div><div>&#x1F4CD; <strong style="color:#e2e8f0;">Distretto:</strong> ' + esc(inj.distretto) + '</div><div>&#x23F1;&#xFE0F; <strong style="color:#e2e8f0;">Stop:</strong> ' + esc(inj.stop) + '</div><div>&#x1F504; <strong style="color:#e2e8f0;">Stato:</strong> ' + esc(inj.status) + '</div></div>' +
            '<div style="margin-top:10px;display:flex;gap:8px;"><button type="button" class="es-med-quick-btn" data-med-act="prescribe">&#x1F4CB; Prescrivi Fisio</button><button type="button" class="es-med-quick-btn" data-med-act="rtp-eval">&#x2705; Eval. RTP</button></div>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</section>';
  }

  /* ---- TAB IDONEITA ---- */
  function renderTabIdoneita() {
    var roster = ['Alessandro Fumagalli','Matteo Dalmasso','Luca Di Pasquale','Simone Rizzo','Davide Carillo','Emanuele Salines','Moses Odjer','Andrea Tascone','Carlos Embalo','Diego Peralta','Jacopo Murano','Andrea Schenetti'];
    return '<section class="es-med-card">' +
      '<div class="es-med-card-head"><h2 class="es-med-card-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg><span>Certificazioni Idoneita Agonistica FMSI</span></h2><button type="button" class="es-med-btn-primary" data-med-act="new-idon">+ Nuova Idoneita</button></div>' +
      '<p style="font-size:0.78rem;color:#94a3b8;margin-bottom:14px;">&#x2705; <b>Normativa FMSI vigente:</b> Le idoneita agonistiche sono obbligatorie per legge. Il Medico Sociale e\' l\'unico soggetto autorizzato a emetterle e revocarle.</p>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px;">' +
        roster.map(function (name, idx) {
          var ok = idx !== 1;
          return '<div style="background:#060911;border:1px solid rgba(' + (ok ? '52,211,153' : '251,191,36') + ',0.22);border-radius:8px;padding:10px 14px;display:flex;justify-content:space-between;align-items:center;">' +
            '<div><b style="color:#f8fafc;font-size:0.84rem;">' + esc(name) + '</b><div style="font-size:0.7rem;color:#94a3b8;margin-top:2px;">Scad. 30/06/2027</div></div>' +
            '<span class="es-med-badge-tag ' + (ok ? 'emerald' : 'amber') + '">' + (ok ? 'Valida' : 'In Rinnovo') + '</span>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</section>';
  }

  /* ---- TAB PRESCRIZIONI ---- */
  function renderTabPrescrizioni() {
    return '<section class="es-med-card">' +
      '<div class="es-med-card-head"><h2 class="es-med-card-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><span>Prescrizioni &amp; Fisioterapia</span></h2><button type="button" class="es-med-btn-primary" data-med-act="new-rx">+ Nuova Prescrizione</button></div>' +
      '<p style="font-size:0.78rem;color:#94a3b8;margin-bottom:16px;">&#x1F4CB; Le prescrizioni di fisioterapia vengono inviate direttamente al Fisioterapista. Nessuna comunicazione autonoma al giocatore senza passare dal Medico.</p>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:12px;">' +
        '<div style="background:#060911;border:1px solid rgba(56,189,248,0.18);border-radius:8px;padding:14px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><strong style="color:#f8fafc;">Diego Peralta &#8212; Fisioterapia</strong><span class="es-med-badge-tag amber">In Corso</span></div><div style="font-size:0.78rem;color:#94a3b8;line-height:1.6;"><div>&#x1F3CB;&#xFE0F; Protocollo: Riatletizzazione muscolare + Tecar</div><div>&#x1F4C5; Durata: 21 giorni | Sedute: 3/sett.</div><div>&#x1F468;&#x200D;&#x2695;&#xFE0F; Inviata a: Fisioterapista Staff</div></div></div>' +
        '<div style="background:#060911;border:1px solid rgba(56,189,248,0.12);border-radius:8px;padding:14px;"><strong style="color:#f8fafc;display:block;margin-bottom:8px;">Nuova Prescrizione</strong><p style="font-size:0.75rem;color:#94a3b8;margin-bottom:10px;">Compila il modulo per emettere una nuova prescrizione di fisioterapia, idroterapia o trattamento conservativo.</p><button type="button" class="es-med-btn-primary" data-med-act="new-rx" style="width:100%;">Compila Prescrizione Medica</button></div>' +
      '</div>' +
    '</section>';
  }

  /* ---- TAB RTP ---- */
  function renderTabRTP() {
    return '<section class="es-med-card">' +
      '<div class="es-med-card-head"><h2 class="es-med-card-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg><span>Return to Play &#8212; Protocollo Rientro in Campo</span></h2><span class="es-med-badge-tag amber">1 In Valutazione</span></div>' +
      '<p style="font-size:0.78rem;color:#94a3b8;margin-bottom:16px;">&#x26A0;&#xFE0F; Il Return to Play deve essere autorizzato esclusivamente dal Medico Sociale dopo verifica clinica e funzionale. L\'attestazione viene inoltrata al Mister e al Preparatore Atletico.</p>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px;">' +
        '<div style="background:#060911;border:1px solid rgba(251,191,36,0.22);border-radius:8px;padding:16px;">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><strong style="color:#f8fafc;font-size:0.95rem;">Diego Peralta</strong><span class="es-med-badge-tag amber">Step 3 / 5</span></div>' +
          '<div style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px;">' +
            ['Fase 1: Riposo e PRICE (OK)', 'Fase 2: Mobilita Passiva (OK)', 'Fase 3: Lavoro in Piscina (IN CORSO)', 'Fase 4: Allenamento Parziale (-)', 'Fase 5: Full Training e Match (-)'].map(function (step, idx) {
              var done = idx < 2, active = idx === 2;
              return '<div style="display:flex;align-items:center;gap:8px;font-size:0.78rem;color:' + (done ? '#4ade80' : active ? '#fbbf24' : '#64748b') + ';"><div style="width:8px;height:8px;border-radius:50%;flex-shrink:0;background:' + (done ? '#4ade80' : active ? '#fbbf24' : '#334155') + ';"></div>' + step + '</div>';
            }).join('') +
          '</div>' +
          '<button type="button" class="es-med-btn-primary" data-med-act="advance-rtp" style="width:100%;">Avanza Step RTP &#8594; Fase 4</button>' +
        '</div>' +
      '</div>' +
    '</section>';
  }

  /* ---- TAB RADAR ---- */
  function renderTabRadar() {
    return '<section class="es-med-card">' +
      '<div class="es-med-card-head"><h2 class="es-med-card-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/></svg><span>Radar Competenze Medico &amp; Benchmark FMSI</span></h2><span class="es-med-badge-tag emerald">Media 93%</span></div>' +
      radarSvg() +
      '<div class="es-med-cred-grid" style="margin-top:14px;">' +
        AXES.map(function (ax, i) { return '<div class="es-med-cred-item"><span>' + esc(ax) + '</span><b>' + V2025[i] + '% <span style="font-size:0.7rem;color:#64748b;">/ Benchm. ' + V2023[i] + '%</span></b></div>'; }).join('') +
      '</div>' +
    '</section>';
  }

  /* ---- TAB DOSSIER ---- */
  function renderTabDossier() {
    return '<section class="es-med-card">' +
      '<div class="es-med-card-head"><h2 class="es-med-card-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg><span>Dossier Sanitario Riservato</span></h2><span class="es-med-badge-tag rose">Solo Medico</span></div>' +
      '<p style="font-size:0.78rem;color:#94a3b8;margin-bottom:16px;">&#x1F512; <b>Segreto Professionale (Art. 326 c.p.):</b> Accessibile esclusivamente al Medico Sociale.</p>' +
      '<div class="es-med-empty-wrap"><div class="es-med-empty-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div><div class="es-med-empty-title">Cartella Clinica Riservata</div><div class="es-med-empty-sub">Documenti medici, esami specialistici, referti e anamnesi completa. Solo visibilita del Medico Sociale.</div><button type="button" class="es-med-btn-primary" data-med-act="new-dossier">+ Apri Nuova Cartella Clinica</button></div>' +
    '</section>';
  }

  /* ---- TAB CANALE ---- */
  function renderTabCanale() {
    return '<section class="es-med-card">' +
      '<div class="es-med-card-head"><h2 class="es-med-card-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg><span>Canale Staff &amp; Comunicazioni Sanitarie</span></h2><span class="es-med-badge-tag cyan">Staff Attivo</span></div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;">' +
        '<div style="background:#060911;border:1px solid rgba(56,189,248,0.18);border-radius:8px;padding:14px;"><strong style="color:#38bdf8;font-size:0.88rem;display:block;margin-bottom:8px;">&#x1F4CB; Comunicazioni Recenti</strong><div style="display:flex;flex-direction:column;gap:8px;font-size:0.78rem;color:#94a3b8;"><div style="border-left:2px solid #4ade80;padding-left:10px;"><b style="color:#f8fafc;">&#8594; Fisioterapista</b> &#8212; Prescrizione Peralta inviata (15/09)</div><div style="border-left:2px solid #38bdf8;padding-left:10px;"><b style="color:#f8fafc;">&#8594; Allenatore</b> &#8212; Report disponibilita rosa aggiornato (14/09)</div><div style="border-left:2px solid #fbbf24;padding-left:10px;"><b style="color:#f8fafc;">&#8594; Prep. Atletico</b> &#8212; Restrizione carico Odjer (12/09)</div></div></div>' +
        '<div style="background:#060911;border:1px solid rgba(56,189,248,0.12);border-radius:8px;padding:14px;"><strong style="color:#38bdf8;font-size:0.88rem;display:block;margin-bottom:10px;">&#x1F4E3; Nuovo Bollettino Sanitario</strong><p style="font-size:0.75rem;color:#94a3b8;margin-bottom:10px;">Invia un aggiornamento ufficiale sullo stato di salute della rosa a tutto lo staff tecnico.</p><button type="button" class="es-med-btn-primary" data-med-act="send-bulletin" style="width:100%;">Invia Bollettino Staff</button></div>' +
      '</div>' +
    '</section>';
  }

  /* ---- TAB IMPOSTAZIONI ---- */
  function renderTabImpostazioni(user) {
    var name = medName(user), qual = qualificaOf(user);
    return '<section class="es-med-card">' +
      '<div class="es-med-card-head"><h2 class="es-med-card-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="12" cy="12" r="3"/></svg><span>Profilo &amp; Specializzazione Medica</span></h2></div>' +
      '<div class="es-med-cred-grid">' +
        '<div class="es-med-cred-item"><span>Nome Completo</span><b>' + esc(name) + '</b></div>' +
        '<div class="es-med-cred-item"><span>Qualifica</span><b>' + esc(qual) + '</b></div>' +
        '<div class="es-med-cred-item"><span>Iscrizione FMSI</span><b>FMSI-MED-3847</b></div>' +
        '<div class="es-med-cred-item"><span>Ordine Medici</span><b>Foggia #7291 &middot; Scad. 31/12/2026</b></div>' +
        '<div class="es-med-cred-item"><span>Specializzazione</span><b>Medicina dello Sport</b></div>' +
        '<div class="es-med-cred-item"><span>Stato Contratto</span><b style="color:#4ade80;">Under Contract</b></div>' +
      '</div>' +
      '<div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;">' +
        '<button type="button" class="es-med-btn-primary" data-med-act="edit-profile">Modifica Dati Personali</button>' +
        '<button type="button" class="es-med-btn-secondary" data-med-act="upload-cert">Carica Certificazioni</button>' +
      '</div>' +
    '</section>';
  }

  function renderActiveTabContent(tab, user, visits) {
    switch (tab) {
      case 'dashboard':    return renderTabDashboard(user, visits);
      case 'visite':       return renderTabVisite(visits);
      case 'infortuni':    return renderTabInfortuni();
      case 'idoneita':     return renderTabIdoneita();
      case 'prescrizioni': return renderTabPrescrizioni();
      case 'rtp':          return renderTabRTP();
      case 'radar':        return renderTabRadar();
      case 'dossier':      return renderTabDossier();
      case 'canale':       return renderTabCanale();
      case 'impostazioni': return renderTabImpostazioni(user);
      default:             return renderTabDashboard(user, visits);
    }
  }

  /* ---- RENDER PRINCIPALE ---- */
  function renderHub(user) {
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
    host.className = (host.className || '').replace(/\bes-\w+-on\b/g, '').trim() + ' es-med-on';
    if (group) group.className = (group.className || '').replace(/\bis-\w+-dash\b/g, '').trim() + ' is-med-dash';
    document.body.classList.add('is-med-mode');

    var name = medName(user);
    var club = String(user.squadra || user.club || 'Foggia City').trim();
    var visits = getVisits();

    var html = '<div class="es-med-shell">' +
      '<aside class="es-med-sidebar" id="es-med-sidebar">' +
        '<div class="es-med-brand-header"><div class="es-med-brand-title">ELISEE <span>SCOUT</span></div><div class="es-med-brand-sub">Area Medico Sociale</div></div>' +
        '<nav class="es-med-sidebar-nav">' +
          renderSideBtn('dashboard',    'Dashboard',                      '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>') +
          renderSideBtn('visite',       'Visite &amp; Controlli',         '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>') +
          renderSideBtn('infortuni',    'Infortuni &amp; Diagnosi',       '<path d="M12 2v20M2 12h20"/>') +
          renderSideBtn('idoneita',     'Idoneita Agonistica',            '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>') +
          renderSideBtn('prescrizioni', 'Prescrizioni &amp; Fisio',       '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>') +
          renderSideBtn('rtp',          'Return to Play',                 '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>') +
          renderSideBtn('radar',        'Radar &amp; Competenze',         '<circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/>') +
          renderSideBtn('dossier',      'Dossier Riservato',              '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>') +
          renderSideBtn('canale',       'Canale Staff',                   '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>') +
          renderSideBtn('impostazioni', 'Profilo &amp; Specializzazione', '<circle cx="12" cy="12" r="3"/>') +
        '</nav>' +
        '<div class="es-med-sidebar-badge"><div class="es-med-sidebar-club-card">' +
          '<img src="immagini/squadre-loghi/1000345699.png?v=20260916_FGCLOGO2" alt="' + esc(club) + '" onerror="this.onerror=null;this.src=\'immagini/squadre-loghi/foggia-city.png\';">' +
          '<div><strong>' + esc(club) + '</strong><span>Staff Sanitario Ufficiale</span></div>' +
        '</div></div>' +
      '</aside>' +
      '<main class="es-med-main">' +
        '<div class="es-med-dash-header">' +
          '<div class="es-med-header-top-row">' +
            '<button type="button" class="es-med-mobile-menu-btn" id="btn-toggle-med-sidebar" aria-label="Menu"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>' +
            '<div class="es-med-header-identity">' +
              '<div class="es-med-header-block">' +
                '<div class="es-med-licence-badge" title="FMSI / Ordine Medici"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div>' +
                '<div class="es-med-doc-info"><strong>' + esc(name) + '</strong><span class="role">Medico Sociale FMSI</span><p class="sub">Tesseramento FMSI: FMSI-MED-3847 &middot; Ordine Medici FG #7291 &middot; Scad. 31/12/2026</p></div>' +
              '</div>' +
              '<div class="es-med-header-sep"></div>' +
              '<div class="es-med-header-block es-med-club-info"><img class="crest" src="immagini/squadre-loghi/1000345699.png?v=20260916_FGCLOGO2" alt="' + esc(club) + '" onerror="this.onerror=null;this.src=\'immagini/squadre-loghi/foggia-city.png\';"><div><strong>' + esc(club) + '</strong><span>Prima Squadra &amp; Settore Giovanile</span></div></div>' +
            '</div>' +
            '<button type="button" class="es-med-btn-quick-jump" data-med-nav="visite">Nuova Visita Medica &#8594;</button>' +
          '</div>' +
          '<div class="es-med-header-match-row">' +
            '<div class="es-med-target-box"><p class="label">Prossima Visita Programmata</p><strong>Visite Periodiche &#8212; Sessione Autunnale</strong><span>22/09/2026 &middot; Ore 09:00 (Centro Medico)</span></div>' +
            '<div class="es-med-target-box"><p class="label">Stato Idoneita Rosa</p><div class="es-med-countdown-nums"><div><strong>24</strong><span>Valide</span></div><div><strong>0</strong><span>Scadute</span></div><div><strong>1</strong><span>Terapia</span></div></div></div>' +
            '<div class="es-med-target-box"><p class="label">Focus Sanitario di Giornata</p><strong style="color:#38bdf8;">Rinnovo Idoneita &amp; Follow-up Peralta</strong><span>Valutazione RTP Fase 3 &#8594; Fase 4</span></div>' +
          '</div>' +
        '</div>' +
        '<nav class="es-med-nav-tabs">' +
          renderNavTab('dashboard',    'Dashboard',        '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>') +
          renderNavTab('visite',       'Visite &amp; Idoneita', '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>') +
          renderNavTab('infortuni',    'Infortuni',        '<path d="M12 2v20M2 12h20"/>') +
          renderNavTab('prescrizioni', 'Prescrizioni',     '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>') +
          renderNavTab('rtp',          'Return to Play',   '<polyline points="23 4 23 10 17 10"/>') +
          renderNavTab('radar',        'Radar',            '<circle cx="12" cy="12" r="10"/>') +
          renderNavTab('canale',       'Canale Staff',     '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>') +
        '</nav>' +
        '<div id="es-med-active-content">' + renderActiveTabContent(activeTab, user, visits) + '</div>' +
      '</main>' +
    '</div>';

    box.innerHTML = html;
    box.hidden = false;
    box.removeAttribute('hidden');
    box.style.display = 'block';

    box.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-med-nav]');
      if (btn) {
        activeTab = btn.dataset.medNav;
        var ac = box.querySelector('#es-med-active-content');
        if (ac) ac.innerHTML = renderActiveTabContent(activeTab, user, visits);
        box.querySelectorAll('[data-med-nav]').forEach(function (b) {
          b.classList.toggle('is-active', b.dataset.medNav === activeTab);
        });
        var sb = document.getElementById('es-med-sidebar');
        if (sb) sb.classList.remove('is-open');
        return;
      }
      var ab = e.target.closest('[data-med-act]');
      if (ab) {
        var act = ab.dataset.medAct;
        if (act === 'new-visit')    toast('Apri modulo Nuova Visita Medica.', 'info');
        else if (act === 'new-injury')  toast('Compila modulo Infortunio/Diagnosi ICD.', 'info');
        else if (act === 'new-idon')    toast('Avvia procedura idoneita agonistica.', 'info');
        else if (act === 'new-rx')      toast('Compila prescrizione fisioterapia.', 'info');
        else if (act === 'advance-rtp') toast('Step RTP aggiornato. Notifica a Mister e Prep. Atletico.', 'success');
        else if (act === 'send-bulletin') toast('Bollettino sanitario inviato allo staff.', 'success');
        else if (act === 'prescribe')   toast('Prescrizione fisioterapia inoltrata.', 'success');
        else if (act === 'rtp-eval')    toast('Avvia valutazione Return to Play.', 'info');
        else if (act === 'edit-profile') toast('Modifica anagrafica.', 'info');
        else if (act === 'upload-cert') toast('Upload certificazioni mediche.', 'info');
        else if (act === 'new-dossier') toast('Nuova cartella clinica riservata.', 'success');
      }
    });

    var menuBtn = document.getElementById('btn-toggle-med-sidebar');
    var sidebarEl = document.getElementById('es-med-sidebar');
    if (menuBtn && sidebarEl) {
      menuBtn.addEventListener('click', function () { sidebarEl.classList.toggle('is-open'); });
    }
  }

  function boot() {
    var u = userObj();
    if (!isMedico(u)) return;
    renderHub(u);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  document.addEventListener('elisee:roleChanged', function () { var u = userObj(); if (isMedico(u)) renderHub(u); });
  document.addEventListener('elisee:userUpdated', function () { var u = userObj(); if (isMedico(u)) renderHub(u); });
  window.elisee_medHub = { render: renderHub };
})();
