/* ============================================================
   ELISEE SCOUT — AREA NUTRIZIONISTA & PERFORMANCE ALIMENTARE
   Sports Nutrition OS — Sidebar 240px + Tab bar + Header 2 livelli
   ============================================================ */
(function () {
  'use strict';

  var activeTab = 'dashboard';
  var AXES = [
    'Composizione Corporea / BIA', 'Timing Glucidico & Carb Loading', 'Idratazione Match-Day', 'Integrazione WADA Compliant',
    'Nutrizione Pre & Post Gara', 'Gestione Ritiro / Trasferte', 'Plicometria & Piani Personalizzati', 'Coordinamento Staff Atletico'
  ];
  var V2025 = [96, 94, 93, 97, 95, 91, 95, 94];
  var V2023 = [82, 80, 78, 85, 81, 75, 80, 81];

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

  function qualificaOf(u) {
    return String((u && (u.nuQualifica || u.qualificaNutri || u.certificazione)) || '').trim() || 'Biologo Nutrizionista FNOB / CSNM';
  }

  function getDiets() {
    try {
      var raw = JSON.parse(localStorage.getItem('elisee_nu_diets') || '[]');
      if (Array.isArray(raw) && raw.length > 0) return raw;
    } catch (_) {}
    return [
      { id: 'd-1', player: 'Jacopo Murano', date: '15/09/2026', tipo: 'Piano Composizione Corporea', kcal: '3200 kcal', obiettivo: 'Massa Magra', status: 'Attivo' },
      { id: 'd-2', player: 'Diego Peralta', date: '12/09/2026', tipo: 'Piano Riatletizzazione', kcal: '2800 kcal', obiettivo: 'Recupero Proteico', status: 'Attivo' },
      { id: 'd-3', player: 'Carlos Embalo', date: '10/09/2026', tipo: 'Match-Day Protocol', kcal: '3500 kcal', obiettivo: 'Carb Loading', status: 'Programmato' }
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
    var html = '<svg viewBox="0 0 440 400" style="width:100%;height:auto;max-height:300px;" role="img" aria-label="Competenze nutrizionista">';
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
    if (typeof window.unmountAllRoleDashboards === 'function') window.unmountAllRoleDashboards('es-nu');
  }

  function renderSideBtn(tab, label, svgInner) {
    var cls = activeTab === tab ? ' is-active' : '';
    return '<button type="button" class="es-med-side-btn' + cls + '" data-nu-nav="' + tab + '">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' + svgInner + '</svg>' +
      '<span>' + label + '</span></button>';
  }

  function renderNavTab(tab, label, svgInner) {
    var cls = activeTab === tab ? ' is-active' : '';
    return '<button type="button" class="es-med-tab-btn' + cls + '" data-nu-nav="' + tab + '">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' + svgInner + '</svg>' +
      label + '</button>';
  }

  /* ---- TAB DASHBOARD ---- */
  function renderTabDashboard(user, diets) {
    var name = nuName(user);
    var on = !!(user.squadra || user.club);
    var club = String(user.squadra || user.club || 'Foggia City').trim();
    var qual = qualificaOf(user);
    return '<div class="es-med-grid-2col">' +
      '<section class="es-med-card">' +
        '<div class="es-med-card-head">' +
          '<h2 class="es-med-card-title"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span>Profilo Ufficiale Nutrizionista</span></h2>' +
          '<div style="display:flex;gap:6px;"><span class="es-med-badge-tag cyan">FNOB</span><span class="es-med-badge-tag emerald">' + (on ? 'In Staff' : 'Free Agent') + '</span></div>' +
        '</div>' +
        '<div class="es-med-profile-row">' +
          '<div class="es-med-avatar-fallback">' + esc(initials(name)) + '</div>' +
          '<div class="es-med-user-meta">' +
            '<b class="es-med-user-name">' + esc(name) + '</b>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
              '<span style="font-size:0.72rem;color:#38bdf8;background:rgba(56,189,248,0.12);border:1px solid rgba(56,189,248,0.28);border-radius:4px;padding:2px 6px;font-weight:800;text-transform:uppercase;">Nutrizionista</span>' +
              '<span style="font-size:0.75rem;color:#cbd5e1;font-weight:600;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" style="vertical-align:middle;margin-right:3px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' + esc(club) + '</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div style="background:#060911;border:1px solid rgba(56,189,248,0.12);border-radius:6px;padding:8px 12px;margin-bottom:10px;">' +
          '<div style="display:flex;justify-content:space-between;font-size:0.72rem;color:#94a3b8;font-weight:700;"><span>Completamento Anagrafica &amp; Abilitazione</span><span style="color:#38bdf8;font-weight:900;">88%</span></div>' +
          '<div class="es-med-progress-track"><div class="es-med-progress-fill" style="width:88%;"></div></div>' +
          '<div style="display:flex;justify-content:flex-end;"><button type="button" data-nu-nav="impostazioni" style="font-size:0.72rem;color:#38bdf8;padding:0;background:none;border:none;cursor:pointer;">&#9999;&#65039; Modifica Anagrafica</button></div>' +
        '</div>' +
        '<div class="es-med-cred-grid">' +
          '<div class="es-med-cred-item"><span>Qualifica Ufficiale</span><b>' + esc(qual) + '</b></div>' +
          '<div class="es-med-cred-item"><span>Iscrizione Ordine</span><b>Ordine Biologi Nazionali #11284</b></div>' +
        '</div>' +
      '</section>' +
      '<section class="es-med-card">' +
        '<div class="es-med-card-head">' +
          '<h2 class="es-med-card-title"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg><span>Monitoraggio Nutrizione &amp; Composizione Corporea</span></h2>' +
          '<span class="es-med-badge-tag amber">2 Attivi</span>' +
        '</div>' +
        '<div class="es-med-kpi-grid">' +
          '<div class="es-med-kpi-box"><strong>24</strong><span>Atleti con Piano Nutrizionale</span></div>' +
          '<div class="es-med-kpi-box"><strong>3</strong><span>Piani Attivi</span></div>' +
          '<div class="es-med-kpi-box"><strong>2</strong><span>BIA Programmati</span></div>' +
          '<div class="es-med-kpi-box"><strong>0</strong><span>Non Conformi WADA</span></div>' +
          '<div class="es-med-kpi-box"><strong>1</strong><span>Match-Day Protocol</span></div>' +
          '<div class="es-med-kpi-box"><strong>95%</strong><span>Aderenza ai Piani</span></div>' +
        '</div>' +
        '<div class="es-med-quick-actions">' +
          '<button type="button" class="es-med-quick-btn" data-nu-nav="piani">&#x1F4CB; Nuovo Piano</button>' +
          '<button type="button" class="es-med-quick-btn" data-nu-nav="composizione">&#x1F9EA; BIA & Plicometria</button>' +
          '<button type="button" class="es-med-quick-btn" data-nu-nav="integrazione">&#x1F48A; Integratori WADA</button>' +
          '<button type="button" class="es-med-quick-btn" data-nu-nav="trasferte">&#x1F697; Gestione Trasferte</button>' +
        '</div>' +
      '</section>' +
    '</div>' +
    '<section class="es-med-card">' +
      '<div class="es-med-card-head">' +
        '<h2 class="es-med-card-title"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg><span>Strumenti Operativi &#8212; Sports Nutrition OS v3.0</span></h2>' +
        '<span class="es-med-badge-tag cyan">Nutrition Engine</span>' +
      '</div>' +
      '<div class="es-med-actions-grid">' +
        '<button type="button" class="es-med-action-card" data-nu-nav="piani"><div class="es-med-action-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div><div class="es-med-action-text"><b>Piani Nutrizionali Personalizzati</b><span>Crea piani giornalieri e settimanali con macros, timing e note cliniche.</span></div></button>' +
        '<button type="button" class="es-med-action-card" data-nu-nav="composizione"><div class="es-med-action-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg></div><div class="es-med-action-text"><b>Composizione Corporea &amp; BIA</b><span>Bioimpedenziometria, plicometria, monitoraggio % massa grassa e magra.</span></div></button>' +
        '<button type="button" class="es-med-action-card" data-nu-nav="integrazione"><div class="es-med-action-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div><div class="es-med-action-text"><b>Integrazione WADA Compliant</b><span>Protocollo integratori verificato con database WADA. Solo supplementi certificati.</span></div></button>' +
        '<button type="button" class="es-med-action-card" data-nu-nav="trasferte"><div class="es-med-action-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></div><div class="es-med-action-text"><b>Gestione Ritiro &amp; Trasferte</b><span>Menu personalizzati per trasferta, ritiro preseason e post-gara. Coordinamento con chef.</span></div></button>' +
        '<button type="button" class="es-med-action-card" data-nu-nav="radar"><div class="es-med-action-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/></svg></div><div class="es-med-action-text"><b>Radar Competenze</b><span>Mappa le tue aree di eccellenza rispetto al benchmark FNOB e CSNM.</span></div></button>' +
        '<button type="button" class="es-med-action-card" data-nu-nav="canale"><div class="es-med-action-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg></div><div class="es-med-action-text"><b>Canale Staff Sanitario</b><span>Coordinamento con Medico Sociale, Fisioterapista e Preparatore Atletico.</span></div></button>' +
      '</div>' +
    '</section>' +
    '<section class="es-med-card">' +
      '<div class="es-med-card-head">' +
        '<h2 class="es-med-card-title"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg><span>Ultimi Piani Nutrizionali Aggiornati</span></h2>' +
        '<button type="button" data-nu-nav="piani" style="font-size:0.75rem;color:#38bdf8;background:none;border:none;cursor:pointer;">Vedi Tutti &#8594;</button>' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;gap:8px;">' +
        diets.map(function (d) {
          var color = d.status === 'Attivo' ? '#4ade80' : '#fbbf24';
          return '<div style="background:#060911;border:1px solid rgba(56,189,248,0.12);border-radius:8px;padding:10px 14px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">' +
            '<div><b style="color:#f8fafc;font-size:0.86rem;display:block;">' + esc(d.player) + ' <span style="font-size:0.72rem;color:#38bdf8;">(' + esc(d.tipo) + ')</span></b>' +
            '<span style="color:#94a3b8;font-size:0.74rem;">' + esc(d.date) + ' &middot; ' + esc(d.kcal) + ' &middot; <strong style="color:' + color + ';">' + esc(d.status) + '</strong></span></div>' +
            '<button type="button" class="es-med-quick-btn">Dettagli</button>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</section>';
  }

  /* ---- TAB PIANI ---- */
  function renderTabPiani(diets) {
    return '<section class="es-med-card">' +
      '<div class="es-med-card-head"><h2 class="es-med-card-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><span>Piani Nutrizionali Personalizzati (' + diets.length + ')</span></h2><button type="button" class="es-med-btn-primary" data-nu-act="new-plan">+ Nuovo Piano</button></div>' +
      '<div style="overflow-x:auto;"><table class="es-med-table"><thead><tr><th>Atleta</th><th>Data</th><th>Tipo Piano</th><th>Kcal</th><th>Obiettivo</th><th>Stato</th><th style="text-align:right;">Azioni</th></tr></thead><tbody>' +
        diets.map(function (d) {
          var ok = d.status === 'Attivo';
          return '<tr><td><strong style="color:#f8fafc;">' + esc(d.player) + '</strong></td><td>' + esc(d.date) + '</td><td>' + esc(d.tipo) + '</td><td><strong style="color:#38bdf8;">' + esc(d.kcal) + '</strong></td><td>' + esc(d.obiettivo) + '</td><td><span class="es-med-badge-tag ' + (ok ? 'emerald' : 'amber') + '">' + esc(d.status) + '</span></td><td style="text-align:right;"><button type="button" class="es-med-quick-btn">Apri</button></td></tr>';
        }).join('') +
      '</tbody></table></div>' +
    '</section>';
  }

  /* ---- TAB COMPOSIZIONE ---- */
  function renderTabComposizione() {
    var atleti = [
      { nome: 'Jacopo Murano', peso: '82.4 kg', masGrassa: '11.2%', masMagra: '73.2 kg', h2o: '62.1%', imc: '22.8', data: '10/09/2026' },
      { nome: 'Carlos Embalo', peso: '78.1 kg', masGrassa: '13.8%', masMagra: '67.3 kg', h2o: '59.8%', imc: '21.9', data: '08/09/2026' },
      { nome: 'Diego Peralta', peso: '85.0 kg', masGrassa: '15.1%', masMagra: '72.2 kg', h2o: '58.3%', imc: '23.5', data: '05/09/2026' }
    ];
    return '<section class="es-med-card">' +
      '<div class="es-med-card-head"><h2 class="es-med-card-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg><span>Composizione Corporea, BIA &amp; Plicometria</span></h2><button type="button" class="es-med-btn-primary" data-nu-act="new-bia">+ Nuova BIA</button></div>' +
      '<p style="font-size:0.78rem;color:#94a3b8;margin-bottom:14px;">&#x1F9EA; I dati di bioimpedenziometria (BIA) e plicometria vengono registrati ogni 2-4 settimane per monitorare le variazioni della composizione corporea e adeguare il piano nutrizionale.</p>' +
      '<div style="overflow-x:auto;"><table class="es-med-table"><thead><tr><th>Atleta</th><th>Data</th><th>Peso</th><th>% Massa Grassa</th><th>Massa Magra</th><th>Idratazione</th><th>IMC</th><th style="text-align:right;">Azioni</th></tr></thead><tbody>' +
        atleti.map(function (a) {
          return '<tr><td><strong style="color:#f8fafc;">' + esc(a.nome) + '</strong></td><td>' + esc(a.data) + '</td><td><strong style="color:#38bdf8;">' + esc(a.peso) + '</strong></td><td>' + esc(a.masGrassa) + '</td><td>' + esc(a.masMagra) + '</td><td>' + esc(a.h2o) + '</td><td>' + esc(a.imc) + '</td><td style="text-align:right;"><button type="button" class="es-med-quick-btn">Dettaglio</button></td></tr>';
        }).join('') +
      '</tbody></table></div>' +
    '</section>';
  }

  /* ---- TAB INTEGRAZIONE ---- */
  function renderTabIntegrazione() {
    var supps = [
      { nome: 'Creatina Monoidrato', dose: '3g/die pre-allenamento', wada: 'Permesso', note: 'Solo marca certificata Informed Sport' },
      { nome: 'Beta-Alanina', dose: '3.2g/die a colazione', wada: 'Permesso', note: 'Attenzione formicolio (parestesia)' },
      { nome: 'Vitamina D3', dose: '2000 UI/die a pranzo', wada: 'Permesso', note: 'Livelli ematici monitorati ogni 3 mesi' },
      { nome: 'Omega-3 EPA+DHA', dose: '2g/die con pasto principale', wada: 'Permesso', note: 'Effetto antinfiammatorio e cardiovascolare' },
      { nome: 'Whey Protein Isolate', dose: '30g post-allenamento', wada: 'Permesso', note: 'Marca: Informed Sport certificata' },
      { nome: 'Caffeina Anidra', dose: '3-6 mg/kg 60 min. pre-gara', wada: 'Permesso (monitorato)', note: 'NON usare >10 mg/kg. Check TUE per dosi alte' }
    ];
    return '<section class="es-med-card">' +
      '<div class="es-med-card-head"><h2 class="es-med-card-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><span>Protocollo Integrazione WADA Compliant</span></h2><span class="es-med-badge-tag emerald">0 Voci a Rischio</span></div>' +
      '<p style="font-size:0.78rem;color:#94a3b8;margin-bottom:14px;">&#x2705; <b>Conformita WADA:</b> Tutti gli integratori in uso sono stati verificati sul database Prohibited List WADA 2026. La responsabilita della verifica e\' del Nutrizionista in coordinamento col Medico Sociale.</p>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px;">' +
        supps.map(function (s) {
          var mon = s.wada.indexOf('monitorato') !== -1;
          return '<div style="background:#060911;border:1px solid rgba(' + (mon ? '251,191,36' : '52,211,153') + ',0.2);border-radius:8px;padding:14px;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><strong style="color:#f8fafc;font-size:0.88rem;">' + esc(s.nome) + '</strong><span class="es-med-badge-tag ' + (mon ? 'amber' : 'emerald') + '">' + esc(s.wada) + '</span></div>' +
            '<div style="font-size:0.78rem;color:#94a3b8;line-height:1.6;"><div>&#x1F48A; <strong style="color:#e2e8f0;">Dosaggio:</strong> ' + esc(s.dose) + '</div><div>&#x1F4DD; <strong style="color:#e2e8f0;">Note:</strong> ' + esc(s.note) + '</div></div>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</section>';
  }

  /* ---- TAB TRASFERTE ---- */
  function renderTabTrasferte() {
    return '<section class="es-med-card">' +
      '<div class="es-med-card-head"><h2 class="es-med-card-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg><span>Gestione Ritiro &amp; Alimentazione in Trasferta</span></h2><span class="es-med-badge-tag cyan">Pianificazione</span></div>' +
      '<p style="font-size:0.78rem;color:#94a3b8;margin-bottom:16px;">&#x1F697; La nutrizione in trasferta richiede pianificazione preventiva dei pasti, coordinamento con strutture alberghiere e protocollo pre-gara standardizzato.</p>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px;">' +
        '<div style="background:#060911;border:1px solid rgba(56,189,248,0.18);border-radius:8px;padding:14px;">' +
          '<strong style="color:#38bdf8;font-size:0.88rem;display:block;margin-bottom:10px;">&#x1F4C5; Prossima Trasferta: 21 Set (Bari)</strong>' +
          '<div style="font-size:0.78rem;color:#94a3b8;line-height:1.8;">' +
            '<div>&#x1F374; <strong style="color:#e2e8f0;">Pranzo pre-partenza:</strong> Pasta/riso in bianco, pollo, verdure cotte</div>' +
            '<div>&#x26BD;&#xFE0F; <strong style="color:#e2e8f0;">Pre-gara (H-3):</strong> Pasta al pomodoro + banana + acqua</div>' +
            '<div>&#x26FD; <strong style="color:#e2e8f0;">Intra-gara:</strong> Gel glucidico 30g/h + elettroliti</div>' +
            '<div>&#x1F35C; <strong style="color:#e2e8f0;">Post-gara:</strong> Proteine whey + carboidrati semplici entro 30 min</div>' +
          '</div>' +
          '<button type="button" class="es-med-btn-primary" data-nu-act="edit-travel" style="width:100%;margin-top:12px;">Modifica Piano Trasferta</button>' +
        '</div>' +
        '<div style="background:#060911;border:1px solid rgba(56,189,248,0.12);border-radius:8px;padding:14px;">' +
          '<strong style="color:#38bdf8;font-size:0.88rem;display:block;margin-bottom:10px;">&#x1F3E8; Linee Guida Strutture Ricettive</strong>' +
          '<div style="font-size:0.78rem;color:#94a3b8;line-height:1.8;">' +
            '<div>&#x2705; Richiesta menu personalizzato 48h prima</div>' +
            '<div>&#x2705; Verifica allergeni e intolleranze per ogni atleta</div>' +
            '<div>&#x2705; Frutta fresca e acqua H24 in camera</div>' +
            '<div>&#x26A0;&#xFE0F; NO buffet libero: porzioni controllate dal Nutrizionista</div>' +
          '</div>' +
          '<button type="button" class="es-med-btn-primary" data-nu-act="new-travel" style="width:100%;margin-top:12px;">+ Piano Nuova Trasferta</button>' +
        '</div>' +
      '</div>' +
    '</section>';
  }

  /* ---- TAB RADAR ---- */
  function renderTabRadar() {
    return '<section class="es-med-card">' +
      '<div class="es-med-card-head"><h2 class="es-med-card-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/></svg><span>Radar Competenze Nutrizionista &amp; Benchmark FNOB</span></h2><span class="es-med-badge-tag emerald">Media 94%</span></div>' +
      radarSvg() +
      '<div class="es-med-cred-grid" style="margin-top:14px;">' +
        AXES.map(function (ax, i) { return '<div class="es-med-cred-item"><span>' + esc(ax) + '</span><b>' + V2025[i] + '% <span style="font-size:0.7rem;color:#64748b;">/ Benchm. ' + V2023[i] + '%</span></b></div>'; }).join('') +
      '</div>' +
    '</section>';
  }

  /* ---- TAB CANALE ---- */
  function renderTabCanale() {
    return '<section class="es-med-card">' +
      '<div class="es-med-card-head"><h2 class="es-med-card-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg><span>Canale Staff Sanitario &amp; Tecnico</span></h2><span class="es-med-badge-tag cyan">Staff Attivo</span></div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;">' +
        '<div style="background:#060911;border:1px solid rgba(56,189,248,0.18);border-radius:8px;padding:14px;"><strong style="color:#38bdf8;font-size:0.88rem;display:block;margin-bottom:8px;">&#x1F4CB; Comunicazioni Recenti</strong><div style="display:flex;flex-direction:column;gap:8px;font-size:0.78rem;color:#94a3b8;"><div style="border-left:2px solid #38bdf8;padding-left:10px;"><b style="color:#f8fafc;">&#8594; Medico Sociale</b> &#8212; Piano riatletizzazione Peralta condiviso (15/09)</div><div style="border-left:2px solid #4ade80;padding-left:10px;"><b style="color:#f8fafc;">&#8594; Preparatore Atletico</b> &#8212; Sincronizzazione carichi/macros settimana (13/09)</div><div style="border-left:2px solid #fbbf24;padding-left:10px;"><b style="color:#f8fafc;">&#8592; Fisioterapista</b> &#8212; Richiesta piano proteico post-lesione Odjer (12/09)</div></div></div>' +
        '<div style="background:#060911;border:1px solid rgba(56,189,248,0.12);border-radius:8px;padding:14px;"><strong style="color:#38bdf8;font-size:0.88rem;display:block;margin-bottom:10px;">&#x1F4E3; Nuovo Aggiornamento Nutrizionale</strong><p style="font-size:0.75rem;color:#94a3b8;margin-bottom:10px;">Invia un report nutrizionale o un aggiornamento sui piani in corso al resto dello staff tecnico-sanitario.</p><button type="button" class="es-med-btn-primary" data-nu-act="send-update" style="width:100%;">Invia Aggiornamento</button></div>' +
      '</div>' +
    '</section>';
  }

  /* ---- TAB IMPOSTAZIONI ---- */
  function renderTabImpostazioni(user) {
    var name = nuName(user), qual = qualificaOf(user);
    return '<section class="es-med-card">' +
      '<div class="es-med-card-head"><h2 class="es-med-card-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="12" cy="12" r="3"/></svg><span>Profilo &amp; Specializzazione Nutrizionista</span></h2></div>' +
      '<div class="es-med-cred-grid">' +
        '<div class="es-med-cred-item"><span>Nome Completo</span><b>' + esc(name) + '</b></div>' +
        '<div class="es-med-cred-item"><span>Qualifica</span><b>' + esc(qual) + '</b></div>' +
        '<div class="es-med-cred-item"><span>Iscrizione FNOB</span><b>FNOB-NU-8843</b></div>' +
        '<div class="es-med-cred-item"><span>Ordine Biologi</span><b>Nazionali #11284 &middot; Scad. 31/12/2026</b></div>' +
        '<div class="es-med-cred-item"><span>Specializzazione</span><b>Nutrizione Sportiva &amp; Metabolismo</b></div>' +
        '<div class="es-med-cred-item"><span>Stato Contratto</span><b style="color:#4ade80;">Under Contract</b></div>' +
      '</div>' +
      '<div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;">' +
        '<button type="button" class="es-med-btn-primary" data-nu-act="edit-profile">Modifica Dati Personali</button>' +
        '<button type="button" class="es-med-btn-secondary" data-nu-act="upload-cert">Carica Certificazioni</button>' +
      '</div>' +
    '</section>';
  }

  function renderActiveTabContent(tab, user, diets) {
    switch (tab) {
      case 'dashboard':   return renderTabDashboard(user, diets);
      case 'piani':       return renderTabPiani(diets);
      case 'composizione':return renderTabComposizione();
      case 'integrazione':return renderTabIntegrazione();
      case 'trasferte':   return renderTabTrasferte();
      case 'radar':       return renderTabRadar();
      case 'canale':      return renderTabCanale();
      case 'impostazioni':return renderTabImpostazioni(user);
      default:            return renderTabDashboard(user, diets);
    }
  }

  /* ---- RENDER PRINCIPALE ---- */
  function renderHub(user) {
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
    host.className = (host.className || '').replace(/\bes-\w+-on\b/g, '').trim() + ' es-nu-on';
    if (group) group.className = (group.className || '').replace(/\bis-\w+-dash\b/g, '').trim() + ' is-nu-dash';
    document.body.classList.add('is-nu-mode');

    var name = nuName(user);
    var club = String(user.squadra || user.club || 'Foggia City').trim();
    var diets = getDiets();

    var html = '<div class="es-med-shell">' +
      '<aside class="es-med-sidebar" id="es-nu-sidebar">' +
        '<div class="es-med-brand-header"><div class="es-med-brand-title">ELISEE <span>SCOUT</span></div><div class="es-med-brand-sub">Area Nutrizionista</div></div>' +
        '<nav class="es-med-sidebar-nav">' +
          renderSideBtn('dashboard',   'Dashboard',                         '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>') +
          renderSideBtn('piani',       'Piani Nutrizionali',                '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>') +
          renderSideBtn('composizione','Composizione Corporea &amp; BIA',   '<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>') +
          renderSideBtn('integrazione','Integrazione WADA',                 '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>') +
          renderSideBtn('trasferte',  'Gestione Trasferte &amp; Ritiro',    '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>') +
          renderSideBtn('radar',      'Radar &amp; Competenze',             '<circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/>') +
          renderSideBtn('canale',     'Canale Staff',                       '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>') +
          renderSideBtn('impostazioni','Profilo &amp; Specializzazione',    '<circle cx="12" cy="12" r="3"/>') +
        '</nav>' +
        '<div class="es-med-sidebar-badge"><div class="es-med-sidebar-club-card">' +
          '<img src="immagini/squadre-loghi/foggia-city.png?v=20260917_FGCLIC1" alt="' + esc(club) + '" onerror="this.onerror=null;this.src=\'immagini/squadre-loghi/foggia-city.png\';">' +
          '<div><strong>' + esc(club) + '</strong><span>Staff Sanitario Ufficiale</span></div>' +
        '</div></div>' +
      '</aside>' +
      '<main class="es-med-main">' +
        '<div class="es-med-dash-header">' +
          '<div class="es-med-header-top-row">' +
            '<button type="button" class="es-med-mobile-menu-btn" id="btn-toggle-nu-sidebar" aria-label="Menu"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>' +
            '<div class="es-med-header-identity">' +
              '<div class="es-med-header-block">' +
                '<div class="es-med-licence-badge" title="FNOB / Ordine Biologi"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div>' +
                '<div class="es-med-doc-info"><strong>' + esc(name) + '</strong><span class="role">Biologo Nutrizionista Sportivo FNOB</span><p class="sub">Iscr. FNOB: FNOB-NU-8843 &middot; Ordine Biologi Nazionali #11284 &middot; Scad. 31/12/2026</p></div>' +
              '</div>' +
              '<div class="es-med-header-sep"></div>' +
              '<div class="es-med-header-block es-med-club-info"><img class="crest" src="immagini/squadre-loghi/foggia-city.png?v=20260917_FGCLIC1" alt="' + esc(club) + '" onerror="this.onerror=null;this.src=\'immagini/squadre-loghi/foggia-city.png\';"><div><strong>' + esc(club) + '</strong><span>Nutrizione Sportiva Ufficiale</span></div></div>' +
            '</div>' +
            '<button type="button" class="es-med-btn-quick-jump" data-nu-nav="piani">Nuovo Piano Nutrizionale &#8594;</button>' +
          '</div>' +
          '<div class="es-med-header-match-row">' +
            '<div class="es-med-target-box"><p class="label">Prossima Sessione BIA</p><strong>Bioimpedenziometria Collettiva</strong><span>22/09/2026 &middot; Ore 08:30 (Digiunato)</span></div>' +
            '<div class="es-med-target-box"><p class="label">Stato Piani Nutrizionali</p><div class="es-med-countdown-nums"><div><strong>24</strong><span>Atleti</span></div><div><strong>3</strong><span>Attivi</span></div><div><strong>95%</strong><span>Aderenza</span></div></div></div>' +
            '<div class="es-med-target-box"><p class="label">Focus Nutrizionale di Giornata</p><strong style="color:#38bdf8;">Carb Loading pre-trasferta Bari (21/09)</strong><span>Coordinare con Chef e Team Manager</span></div>' +
          '</div>' +
        '</div>' +
        '<nav class="es-med-nav-tabs">' +
          renderNavTab('dashboard',    'Dashboard',          '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>') +
          renderNavTab('piani',        'Piani Nutrizionali', '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>') +
          renderNavTab('composizione', 'BIA &amp; Plicometria','<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/>') +
          renderNavTab('integrazione', 'Integrazione WADA',  '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>') +
          renderNavTab('trasferte',    'Trasferte',          '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>') +
          renderNavTab('radar',        'Radar',              '<circle cx="12" cy="12" r="8"/>') +
          renderNavTab('canale',       'Canale Staff',       '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>') +
        '</nav>' +
        '<div id="es-nu-active-content">' + renderActiveTabContent(activeTab, user, diets) + '</div>' +
      '</main>' +
    '</div>';

    box.innerHTML = html;
    box.hidden = false;
    box.removeAttribute('hidden');
    box.style.display = 'block';

    box.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-nu-nav]');
      if (btn) {
        activeTab = btn.dataset.nuNav;
        var ac = box.querySelector('#es-nu-active-content');
        if (ac) ac.innerHTML = renderActiveTabContent(activeTab, user, diets);
        box.querySelectorAll('[data-nu-nav]').forEach(function (b) {
          b.classList.toggle('is-active', b.dataset.nuNav === activeTab);
        });
        var sb = document.getElementById('es-nu-sidebar');
        if (sb) sb.classList.remove('is-open');
        return;
      }
      var ab = e.target.closest('[data-nu-act]');
      if (ab) {
        var act = ab.dataset.nuAct;
        if (act === 'new-plan') toast('Nuovo piano nutrizionale.', 'info');
        else if (act === 'new-bia') toast('Nuova sessione BIA/Plicometria.', 'info');
        else if (act === 'edit-travel') toast('Modifica piano trasferta.', 'info');
        else if (act === 'new-travel') toast('Nuovo piano trasferta.', 'info');
        else if (act === 'send-update') toast('Aggiornamento nutrizionale inviato allo staff.', 'success');
        else if (act === 'edit-profile') toast('Modifica anagrafica.', 'info');
        else if (act === 'upload-cert') toast('Upload certificazioni.', 'info');
      }
    });

    var menuBtn = document.getElementById('btn-toggle-nu-sidebar');
    var sidebarEl = document.getElementById('es-nu-sidebar');
    if (menuBtn && sidebarEl) {
      menuBtn.addEventListener('click', function () { sidebarEl.classList.toggle('is-open'); });
    }
  }

  function boot() {
    var u = userObj();
    if (!isNutrizionista(u)) return;
    renderHub(u);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  document.addEventListener('elisee:roleChanged', function () { var u = userObj(); if (isNutrizionista(u)) renderHub(u); });
  document.addEventListener('elisee:userUpdated', function () { var u = userObj(); if (isNutrizionista(u)) renderHub(u); });
  window.elisee_nuHub = { render: renderHub };
})();
