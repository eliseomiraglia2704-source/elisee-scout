/* ============================================================
   ELISEE SCOUT — AREA FISIOTERAPISTA & RIABILITAZIONE
   Physical Therapy Intelligence OS — Sidebar 240px + Tab bar + Header 2 livelli
   ============================================================ */
(function () {
  'use strict';

  var activeTab = 'dashboard';
  var AXES = [
    'Terapia Manuale', 'Tecarterapia / Elettromedicali', 'Riatletizzazione Funzionale', 'Valutazione ROM & Mobilita',
    'Prevenzione Recidive Muscolari', 'Idroterapia & Crioterapia', 'Kinesiotaping & Bending', 'Comunicazione Staff Medico'
  ];
  var V2025 = [95, 93, 91, 94, 92, 89, 94, 96];
  var V2023 = [81, 78, 76, 80, 79, 74, 82, 83];

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

  function isFisio(u) {
    u = u || userObj();
    var blob = String(u.staffRole || u.ruoloDettagliato || (u.staffProfile && u.staffProfile.fieldRole) || u.ruolo || u.role || '').trim().toLowerCase();
    return /fisio|fisioterap|massagg|osteopat|massofisioterapista/.test(blob);
  }

  function fisioName(u) {
    return [u.nome, u.cognome].filter(Boolean).join(' ').trim() || u.username || 'Dott. Fisioterapista';
  }

  function initials(name) {
    var p = String(name || 'FT').trim().split(/\s+/);
    return ((p[0] || 'F').charAt(0) + (p[1] || p[0] || 'T').charAt(0)).toUpperCase();
  }

  function qualificaOf(u) {
    return String((u && (u.fisioQualifica || u.qualificaFisio || u.certificazione)) || '').trim() || 'Fisioterapista Sportivo AIFI';
  }

  function getTreatments() {
    try {
      var raw = JSON.parse(localStorage.getItem('elisee_fisio_treatments') || '[]');
      if (Array.isArray(raw) && raw.length > 0) return raw;
    } catch (_) {}
    return [
      { id: 't-1', player: 'Diego Peralta', date: '15/09/2026', tipo: 'Riatletizzazione Muscolare', fase: 'Fase 3 / 5', status: 'In Corso' },
      { id: 't-2', player: 'Moses Odjer', date: '13/09/2026', tipo: 'Crioterapia Caviglia', fase: 'Fase 2 / 3', status: 'Attivo' },
      { id: 't-3', player: 'Carlos Embalo', date: '10/09/2026', tipo: 'Tecarterapia Polpaccio', fase: 'Completato', status: 'Chiuso' }
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
    var html = '<svg viewBox="0 0 440 400" style="width:100%;height:auto;max-height:300px;" role="img" aria-label="Competenze fisioterapista">';
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
    if (typeof window.unmountAllRoleDashboards === 'function') window.unmountAllRoleDashboards('es-fisio');
  }

  function renderSideBtn(tab, label, svgInner) {
    var cls = activeTab === tab ? ' is-active' : '';
    return '<button type="button" class="es-med-side-btn' + cls + '" data-fisio-nav="' + tab + '">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' + svgInner + '</svg>' +
      '<span>' + label + '</span></button>';
  }

  function renderNavTab(tab, label, svgInner) {
    var cls = activeTab === tab ? ' is-active' : '';
    return '<button type="button" class="es-med-tab-btn' + cls + '" data-fisio-nav="' + tab + '">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' + svgInner + '</svg>' +
      label + '</button>';
  }

  /* ---- TAB DASHBOARD ---- */
  function renderTabDashboard(user, treats) {
    var name = fisioName(user);
    var on = !!(user.squadra || user.club);
    var club = String(user.squadra || user.club || 'Foggia City').trim();
    var qual = qualificaOf(user);
    return '<div class="es-med-grid-2col">' +
      '<section class="es-med-card">' +
        '<div class="es-med-card-head">' +
          '<h2 class="es-med-card-title"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span>Profilo Ufficiale Fisioterapista</span></h2>' +
          '<div style="display:flex;gap:6px;"><span class="es-med-badge-tag cyan">AIFI</span><span class="es-med-badge-tag emerald">' + (on ? 'In Staff' : 'Free Agent') + '</span></div>' +
        '</div>' +
        '<div class="es-med-profile-row">' +
          '<div class="es-med-avatar-fallback">' + esc(initials(name)) + '</div>' +
          '<div class="es-med-user-meta">' +
            '<b class="es-med-user-name">' + esc(name) + '</b>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
              '<span style="font-size:0.72rem;color:#38bdf8;background:rgba(56,189,248,0.12);border:1px solid rgba(56,189,248,0.28);border-radius:4px;padding:2px 6px;font-weight:800;text-transform:uppercase;">Fisioterapista</span>' +
              '<span style="font-size:0.75rem;color:#cbd5e1;font-weight:600;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" style="vertical-align:middle;margin-right:3px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' + esc(club) + '</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div style="background:#060911;border:1px solid rgba(56,189,248,0.12);border-radius:6px;padding:8px 12px;margin-bottom:10px;">' +
          '<div style="display:flex;justify-content:space-between;font-size:0.72rem;color:#94a3b8;font-weight:700;"><span>Completamento Anagrafica &amp; Abilitazione</span><span style="color:#38bdf8;font-weight:900;">82%</span></div>' +
          '<div class="es-med-progress-track"><div class="es-med-progress-fill" style="width:82%;"></div></div>' +
          '<div style="display:flex;justify-content:flex-end;"><button type="button" data-fisio-nav="impostazioni" style="font-size:0.72rem;color:#38bdf8;padding:0;background:none;border:none;cursor:pointer;">&#9999;&#65039; Modifica Anagrafica</button></div>' +
        '</div>' +
        '<div class="es-med-cred-grid">' +
          '<div class="es-med-cred-item"><span>Qualifica Ufficiale</span><b>' + esc(qual) + '</b></div>' +
          '<div class="es-med-cred-item"><span>Iscrizione Albo</span><b>Albo TSRM PSTRP FG #4421</b></div>' +
        '</div>' +
      '</section>' +
      '<section class="es-med-card">' +
        '<div class="es-med-card-head">' +
          '<h2 class="es-med-card-title"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg><span>Monitoraggio Riabilitazione &amp; Trattamenti Attivi</span></h2>' +
          '<span class="es-med-badge-tag amber">2 Attivi</span>' +
        '</div>' +
        '<div class="es-med-kpi-grid">' +
          '<div class="es-med-kpi-box"><strong>2</strong><span>Trattamenti Attivi &#x1F7E1;</span></div>' +
          '<div class="es-med-kpi-box"><strong>1</strong><span>Completati &#x1F7E2;</span></div>' +
          '<div class="es-med-kpi-box"><strong>8</strong><span>Sedute Settimana</span></div>' +
          '<div class="es-med-kpi-box"><strong>3</strong><span>Prescrizioni dal Medico</span></div>' +
          '<div class="es-med-kpi-box"><strong>0</strong><span>Recidive Ultimo Mese</span></div>' +
          '<div class="es-med-kpi-box"><strong>94%</strong><span>Tasso di Recupero</span></div>' +
        '</div>' +
        '<div class="es-med-quick-actions">' +
          '<button type="button" class="es-med-quick-btn" data-fisio-nav="trattamenti">&#x1FA79; Nuovo Trattamento</button>' +
          '<button type="button" class="es-med-quick-btn" data-fisio-nav="protocolli">&#x1F4CB; Protocolli Riab</button>' +
          '<button type="button" class="es-med-quick-btn" data-fisio-nav="valutazione">&#x1F4CF; Valuta ROM</button>' +
          '<button type="button" class="es-med-quick-btn" data-fisio-nav="canale">&#x1F4E1; Contatta Medico</button>' +
        '</div>' +
      '</section>' +
    '</div>' +
    '<section class="es-med-card">' +
      '<div class="es-med-card-head">' +
        '<h2 class="es-med-card-title"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg><span>Strumenti Operativi &#8212; Rehab Suite v3.0</span></h2>' +
        '<span class="es-med-badge-tag cyan">Rehab Engine</span>' +
      '</div>' +
      '<div class="es-med-actions-grid">' +
        '<button type="button" class="es-med-action-card" data-fisio-nav="trattamenti"><div class="es-med-action-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div><div class="es-med-action-text"><b>Registro Trattamenti</b><span>Nuova seduta di fisioterapia con referto e piano progressivo.</span></div></button>' +
        '<button type="button" class="es-med-action-card" data-fisio-nav="protocolli"><div class="es-med-action-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div><div class="es-med-action-text"><b>Protocolli Riabilitativi</b><span>Gestisci i protocolli personalizzati per lesioni muscolari, articolari e ossee.</span></div></button>' +
        '<button type="button" class="es-med-action-card" data-fisio-nav="valutazione"><div class="es-med-action-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg></div><div class="es-med-action-text"><b>Valutazione ROM &amp; Mobilita</b><span>Goniometria digitale, test Jobe, Thomas, Lasegue, FABER e schede funzionali.</span></div></button>' +
        '<button type="button" class="es-med-action-card" data-fisio-nav="tecniche"><div class="es-med-action-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg></div><div class="es-med-action-text"><b>Tecniche &amp; Strumentali</b><span>Tecar, TENS, US, laserterapia, crioterapia, diatermia. Pianifica le sedute.</span></div></button>' +
        '<button type="button" class="es-med-action-card" data-fisio-nav="radar"><div class="es-med-action-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/></svg></div><div class="es-med-action-text"><b>Radar Competenze</b><span>Mappa le tue competenze tecniche rispetto al benchmark AIFI e FMSI.</span></div></button>' +
        '<button type="button" class="es-med-action-card" data-fisio-nav="canale"><div class="es-med-action-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg></div><div class="es-med-action-text"><b>Canale Staff Sanitario</b><span>Aggiornamenti al Medico Sociale, Preparatore Atletico e Allenatore.</span></div></button>' +
      '</div>' +
    '</section>' +
    '<section class="es-med-card">' +
      '<div class="es-med-card-head">' +
        '<h2 class="es-med-card-title"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg><span>Ultimi Trattamenti &amp; Aggiornamenti Clinici</span></h2>' +
        '<button type="button" data-fisio-nav="trattamenti" style="font-size:0.75rem;color:#38bdf8;background:none;border:none;cursor:pointer;">Vedi Tutti &#8594;</button>' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;gap:8px;">' +
        treats.map(function (t) {
          var ok = t.status === 'Chiuso';
          var color = ok ? '#4ade80' : t.status === 'In Corso' ? '#fbbf24' : '#38bdf8';
          return '<div style="background:#060911;border:1px solid rgba(56,189,248,0.12);border-radius:8px;padding:10px 14px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">' +
            '<div><b style="color:#f8fafc;font-size:0.86rem;display:block;">' + esc(t.player) + ' <span style="font-size:0.72rem;color:#38bdf8;">(' + esc(t.tipo) + ')</span></b>' +
            '<span style="color:#94a3b8;font-size:0.74rem;">' + esc(t.date) + ' &middot; <strong style="color:' + color + ';">' + esc(t.fase) + '</strong></span></div>' +
            '<button type="button" class="es-med-quick-btn">Dettagli</button>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</section>';
  }

  /* ---- TAB TRATTAMENTI ---- */
  function renderTabTrattamenti(treats) {
    return '<section class="es-med-card">' +
      '<div class="es-med-card-head"><h2 class="es-med-card-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><span>Registro Trattamenti (' + treats.length + ')</span></h2><button type="button" class="es-med-btn-primary" data-fisio-act="new-treat">+ Nuovo Trattamento</button></div>' +
      '<div style="overflow-x:auto;"><table class="es-med-table"><thead><tr><th>Atleta</th><th>Data</th><th>Tipo</th><th>Fase</th><th>Stato</th><th style="text-align:right;">Azioni</th></tr></thead><tbody>' +
        treats.map(function (t) {
          var done = t.status === 'Chiuso';
          return '<tr><td><strong style="color:#f8fafc;">' + esc(t.player) + '</strong></td><td>' + esc(t.date) + '</td><td>' + esc(t.tipo) + '</td><td>' + esc(t.fase) + '</td><td><span class="es-med-badge-tag ' + (done ? 'emerald' : 'amber') + '">' + esc(t.status) + '</span></td><td style="text-align:right;"><button type="button" class="es-med-quick-btn">Apri</button></td></tr>';
        }).join('') +
      '</tbody></table></div>' +
    '</section>';
  }

  /* ---- TAB PROTOCOLLI ---- */
  function renderTabProtocolli() {
    var prots = [
      { nome: 'Protocollo Lesione Muscolare II°', fasi: 5, durata: '21-28 giorni', tecnica: 'Tecar + Riatletizzazione + Piscina', atleta: 'Diego Peralta', fase: 3 },
      { nome: 'Protocollo Contusione Caviglia', fasi: 3, durata: '7-10 giorni', tecnica: 'PRICE + TENS + Mobilizzazione', atleta: 'Moses Odjer', fase: 2 },
      { nome: 'Protocollo Tendinopatia Rotulea', fasi: 4, durata: '30-45 giorni', tecnica: 'Eccentrica + Diatermia + Stretching', atleta: 'Disponibile', fase: 0 }
    ];
    return '<section class="es-med-card">' +
      '<div class="es-med-card-head"><h2 class="es-med-card-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><span>Protocolli Riabilitativi Personalizzati</span></h2><button type="button" class="es-med-btn-primary" data-fisio-act="new-prot">+ Nuovo Protocollo</button></div>' +
      '<p style="font-size:0.78rem;color:#94a3b8;margin-bottom:14px;">&#x1F4CB; I protocolli seguono le linee guida UEFA e FMSI. Ogni modifica richiede validazione del Medico Sociale prima dell\'applicazione.</p>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:12px;">' +
        prots.map(function (p) {
          var pct = p.fasi > 0 ? Math.round((p.fase / p.fasi) * 100) : 0;
          return '<div style="background:#060911;border:1px solid rgba(56,189,248,0.18);border-radius:8px;padding:14px;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><strong style="color:#f8fafc;font-size:0.88rem;">' + esc(p.nome) + '</strong><span class="es-med-badge-tag ' + (p.fase === 0 ? 'cyan' : 'amber') + '">' + (p.fase === 0 ? 'Disponibile' : 'Fase ' + p.fase + '/' + p.fasi) + '</span></div>' +
            '<div style="font-size:0.78rem;color:#94a3b8;line-height:1.6;margin-bottom:10px;">' +
              '<div>&#x23F1;&#xFE0F; <strong style="color:#e2e8f0;">Durata:</strong> ' + esc(p.durata) + '</div>' +
              '<div>&#x1F4AA; <strong style="color:#e2e8f0;">Tecnica:</strong> ' + esc(p.tecnica) + '</div>' +
              '<div>&#x26BD;&#xFE0F; <strong style="color:#e2e8f0;">Atleta:</strong> ' + esc(p.atleta) + '</div>' +
            '</div>' +
            (p.fase > 0 ? '<div class="es-med-progress-track" style="margin-bottom:8px;"><div class="es-med-progress-fill" style="width:' + pct + '%;"></div></div>' : '') +
            '<button type="button" class="es-med-quick-btn" style="width:100%;" data-fisio-act="open-prot">Apri Protocollo</button>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</section>';
  }

  /* ---- TAB VALUTAZIONE ROM ---- */
  function renderTabValutazione() {
    var tests = [
      { atleta: 'Diego Peralta', test: 'Straight Leg Raise (SLR)', risultato: '45°', norma: '70-90°', esito: 'Limitato' },
      { atleta: 'Moses Odjer', test: 'Dorsiflession Caviglia', risultato: '12°', norma: '15-20°', esito: 'Nella Norma' },
      { atleta: 'Carlos Embalo', test: 'Flessione Ginocchio', risultato: '135°', norma: '130-150°', esito: 'OK' }
    ];
    return '<section class="es-med-card">' +
      '<div class="es-med-card-head"><h2 class="es-med-card-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg><span>Valutazione ROM, Goniometria &amp; Test Funzionali</span></h2><button type="button" class="es-med-btn-primary" data-fisio-act="new-rom">+ Nuova Valutazione</button></div>' +
      '<p style="font-size:0.78rem;color:#94a3b8;margin-bottom:14px;">&#x1F4CF; Registra le misurazioni di Range of Motion e i test funzionali specifici per ogni atleta. I dati vengono condivisi col Medico Sociale per la validazione del Return to Play.</p>' +
      '<div style="overflow-x:auto;"><table class="es-med-table"><thead><tr><th>Atleta</th><th>Test</th><th>Risultato</th><th>Norma</th><th>Esito</th><th style="text-align:right;">Azioni</th></tr></thead><tbody>' +
        tests.map(function (t) {
          var ok = t.esito === 'OK' || t.esito === 'Nella Norma';
          return '<tr><td><strong style="color:#f8fafc;">' + esc(t.atleta) + '</strong></td><td>' + esc(t.test) + '</td><td><strong style="color:#38bdf8;">' + esc(t.risultato) + '</strong></td><td style="color:#94a3b8;">' + esc(t.norma) + '</td><td><span class="es-med-badge-tag ' + (ok ? 'emerald' : 'amber') + '">' + esc(t.esito) + '</span></td><td style="text-align:right;"><button type="button" class="es-med-quick-btn">Aggiorna</button></td></tr>';
        }).join('') +
      '</tbody></table></div>' +
    '</section>';
  }

  /* ---- TAB TECNICHE ---- */
  function renderTabTecniche() {
    var tecniche = [
      { nome: 'Tecarterapia (TECAR)', desc: 'Correnti capacitive e resistive per riparazione tissutale profonda. Indicata per lesioni muscolari e tendinee.', badge: 'Strumentale', color: 'cyan' },
      { nome: 'TENS & Elettrostimolazione', desc: 'Neuromodulazione del dolore e stimolazione muscolare selettiva. Utilizzo pre e post seduta.', badge: 'Strumentale', color: 'cyan' },
      { nome: 'Ultrasuoni Terapeutici', desc: 'Effetto cavitazionale e termico per patologie tendino-legamentose croniche.', badge: 'Strumentale', color: 'cyan' },
      { nome: 'Kinesiotaping & Bending', desc: 'Taping neuro-muscolare e functional taping per controllo del movimento e decompressione.', badge: 'Manuale', color: 'emerald' },
      { nome: 'Crioterapia & Idroterapia', desc: 'Gestione dell\'infiammazione acuta e riatletizzazione in acqua con resistenza controllata.', badge: 'Fisica', color: 'amber' },
      { nome: 'Terapia Manuale & Mobilizzazioni', desc: 'Tecniche di McKenzie, Mulligan, PNF e manipolazioni articolari certificate.', badge: 'Manuale', color: 'emerald' }
    ];
    return '<section class="es-med-card">' +
      '<div class="es-med-card-head"><h2 class="es-med-card-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg><span>Tecniche &amp; Strumentali in Dotazione</span></h2><span class="es-med-badge-tag emerald">6 Tecniche</span></div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;">' +
        tecniche.map(function (t) {
          return '<div style="background:#060911;border:1px solid rgba(56,189,248,0.12);border-radius:8px;padding:14px;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;"><strong style="color:#f8fafc;font-size:0.88rem;">' + esc(t.nome) + '</strong><span class="es-med-badge-tag ' + t.color + '">' + esc(t.badge) + '</span></div>' +
            '<p style="font-size:0.75rem;color:#94a3b8;margin:0;">' + esc(t.desc) + '</p>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</section>';
  }

  /* ---- TAB RADAR ---- */
  function renderTabRadar() {
    return '<section class="es-med-card">' +
      '<div class="es-med-card-head"><h2 class="es-med-card-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/></svg><span>Radar Competenze Fisioterapista &amp; Benchmark AIFI</span></h2><span class="es-med-badge-tag emerald">Media 93%</span></div>' +
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
        '<div style="background:#060911;border:1px solid rgba(56,189,248,0.18);border-radius:8px;padding:14px;"><strong style="color:#38bdf8;font-size:0.88rem;display:block;margin-bottom:8px;">&#x1F4CB; Comunicazioni Recenti</strong><div style="display:flex;flex-direction:column;gap:8px;font-size:0.78rem;color:#94a3b8;"><div style="border-left:2px solid #38bdf8;padding-left:10px;"><b style="color:#f8fafc;">&#8592; Medico Sociale</b> &#8212; Prescrizione Peralta ricevuta (15/09)</div><div style="border-left:2px solid #4ade80;padding-left:10px;"><b style="color:#f8fafc;">&#8594; Medico Sociale</b> &#8212; Report seduta Odjer inviato (14/09)</div><div style="border-left:2px solid #fbbf24;padding-left:10px;"><b style="color:#f8fafc;">&#8592; Preparatore Atletico</b> &#8212; Richiesta coordinamento carico (13/09)</div></div></div>' +
        '<div style="background:#060911;border:1px solid rgba(56,189,248,0.12);border-radius:8px;padding:14px;"><strong style="color:#38bdf8;font-size:0.88rem;display:block;margin-bottom:10px;">&#x1F4E3; Nuovo Aggiornamento Staff</strong><p style="font-size:0.75rem;color:#94a3b8;margin-bottom:10px;">Invia un aggiornamento sullo stato riabilitativo al Medico Sociale o al resto dello staff tecnico-sanitario.</p><button type="button" class="es-med-btn-primary" data-fisio-act="send-update" style="width:100%;">Invia Aggiornamento</button></div>' +
      '</div>' +
    '</section>';
  }

  /* ---- TAB IMPOSTAZIONI ---- */
  function renderTabImpostazioni(user) {
    var name = fisioName(user), qual = qualificaOf(user);
    return '<section class="es-med-card">' +
      '<div class="es-med-card-head"><h2 class="es-med-card-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="12" cy="12" r="3"/></svg><span>Profilo &amp; Specializzazione Fisioterapista</span></h2></div>' +
      '<div class="es-med-cred-grid">' +
        '<div class="es-med-cred-item"><span>Nome Completo</span><b>' + esc(name) + '</b></div>' +
        '<div class="es-med-cred-item"><span>Qualifica</span><b>' + esc(qual) + '</b></div>' +
        '<div class="es-med-cred-item"><span>Iscrizione AIFI</span><b>AIFI-FT-7731</b></div>' +
        '<div class="es-med-cred-item"><span>Albo TSRM PSTRP</span><b>FG #4421 &middot; Scad. 31/12/2026</b></div>' +
        '<div class="es-med-cred-item"><span>Specializzazione</span><b>Fisioterapia dello Sport &amp; Manuale</b></div>' +
        '<div class="es-med-cred-item"><span>Stato Contratto</span><b style="color:#4ade80;">Under Contract</b></div>' +
      '</div>' +
      '<div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;">' +
        '<button type="button" class="es-med-btn-primary" data-fisio-act="edit-profile">Modifica Dati Personali</button>' +
        '<button type="button" class="es-med-btn-secondary" data-fisio-act="upload-cert">Carica Certificazioni</button>' +
      '</div>' +
    '</section>';
  }

  function renderActiveTabContent(tab, user, treats) {
    switch (tab) {
      case 'dashboard':   return renderTabDashboard(user, treats);
      case 'trattamenti': return renderTabTrattamenti(treats);
      case 'protocolli':  return renderTabProtocolli();
      case 'valutazione': return renderTabValutazione();
      case 'tecniche':    return renderTabTecniche();
      case 'radar':       return renderTabRadar();
      case 'canale':      return renderTabCanale();
      case 'impostazioni':return renderTabImpostazioni(user);
      default:            return renderTabDashboard(user, treats);
    }
  }

  /* ---- RENDER PRINCIPALE ---- */
  function renderHub(user) {
    user = user || userObj();
    if (!isFisio(user)) return;
    hideOthers();
    var host = document.getElementById('es-staff-profile');
    var group = document.getElementById('user-dossier-view-group');
    if (!host) return;
    var box = document.getElementById('es-fisio');
    if (!box) {
      box = document.createElement('div');
      box.id = 'es-fisio';
      box.className = 'es-pd';
      host.insertBefore(box, host.firstChild);
    }
    host.className = (host.className || '').replace(/\bes-\w+-on\b/g, '').trim() + ' es-fisio-on';
    if (group) group.className = (group.className || '').replace(/\bis-\w+-dash\b/g, '').trim() + ' is-fisio-dash';
    document.body.classList.add('is-fisio-mode');

    var name = fisioName(user);
    var club = String(user.squadra || user.club || 'Foggia City').trim();
    var treats = getTreatments();

    var html = '<div class="es-med-shell">' +
      '<aside class="es-med-sidebar" id="es-fisio-sidebar">' +
        '<div class="es-med-brand-header"><div class="es-med-brand-title">ELISEE <span>SCOUT</span></div><div class="es-med-brand-sub">Area Fisioterapista</div></div>' +
        '<nav class="es-med-sidebar-nav">' +
          renderSideBtn('dashboard',   'Dashboard',                      '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>') +
          renderSideBtn('trattamenti', 'Registro Trattamenti',           '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>') +
          renderSideBtn('protocolli',  'Protocolli Riabilitativi',       '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>') +
          renderSideBtn('valutazione', 'Valutazione ROM &amp; Test',     '<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>') +
          renderSideBtn('tecniche',    'Tecniche &amp; Strumentali',     '<circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>') +
          renderSideBtn('radar',       'Radar &amp; Competenze',         '<circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/>') +
          renderSideBtn('canale',      'Canale Staff',                   '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>') +
          renderSideBtn('impostazioni','Profilo &amp; Specializzazione', '<circle cx="12" cy="12" r="3"/>') +
        '</nav>' +
        '<div class="es-med-sidebar-badge"><div class="es-med-sidebar-club-card">' +
          '<img src="immagini/squadre-loghi/foggia-city.png?v=20260917_FGCLIC1" alt="' + esc(club) + '" onerror="this.onerror=null;this.src=\'immagini/squadre-loghi/foggia-city.png\';">' +
          '<div><strong>' + esc(club) + '</strong><span>Staff Sanitario Ufficiale</span></div>' +
        '</div></div>' +
      '</aside>' +
      '<main class="es-med-main">' +
        '<div class="es-med-dash-header">' +
          '<div class="es-med-header-top-row">' +
            '<button type="button" class="es-med-mobile-menu-btn" id="btn-toggle-fisio-sidebar" aria-label="Menu"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>' +
            '<div class="es-med-header-identity">' +
              '<div class="es-med-header-block">' +
                '<div class="es-med-licence-badge" title="AIFI / Albo TSRM PSTRP"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div>' +
                '<div class="es-med-doc-info"><strong>' + esc(name) + '</strong><span class="role">Fisioterapista Sportivo AIFI</span><p class="sub">Iscr. AIFI: AIFI-FT-7731 &middot; Albo TSRM PSTRP FG #4421 &middot; Scad. 31/12/2026</p></div>' +
              '</div>' +
              '<div class="es-med-header-sep"></div>' +
              '<div class="es-med-header-block es-med-club-info"><img class="crest" src="immagini/squadre-loghi/foggia-city.png?v=20260917_FGCLIC1" alt="' + esc(club) + '" onerror="this.onerror=null;this.src=\'immagini/squadre-loghi/foggia-city.png\';"><div><strong>' + esc(club) + '</strong><span>Staff Fisioterapico Ufficiale</span></div></div>' +
            '</div>' +
            '<button type="button" class="es-med-btn-quick-jump" data-fisio-nav="trattamenti">Nuovo Trattamento &#8594;</button>' +
          '</div>' +
          '<div class="es-med-header-match-row">' +
            '<div class="es-med-target-box"><p class="label">Prossima Seduta Programmata</p><strong>Riatletizzazione Peralta &#8212; Fase 3</strong><span>Oggi 14:30 &middot; Palestra + Piscina</span></div>' +
            '<div class="es-med-target-box"><p class="label">Trattamenti in Corso</p><div class="es-med-countdown-nums"><div><strong>2</strong><span>Attivi</span></div><div><strong>1</strong><span>Completati</span></div><div><strong>0</strong><span>Recidive</span></div></div></div>' +
            '<div class="es-med-target-box"><p class="label">Focus Riabilitativo di Giornata</p><strong style="color:#38bdf8;">Peralta: Valutazione Fase 3 &#8594; Fase 4</strong><span>Coordinare con Medico Sociale per RTP</span></div>' +
          '</div>' +
        '</div>' +
        '<nav class="es-med-nav-tabs">' +
          renderNavTab('dashboard',   'Dashboard',       '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>') +
          renderNavTab('trattamenti', 'Trattamenti',     '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>') +
          renderNavTab('protocolli',  'Protocolli',      '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>') +
          renderNavTab('valutazione', 'ROM &amp; Test',  '<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/>') +
          renderNavTab('tecniche',    'Tecniche',        '<circle cx="12" cy="12" r="10"/>') +
          renderNavTab('radar',       'Radar',           '<circle cx="12" cy="12" r="8"/>') +
          renderNavTab('canale',      'Canale Staff',    '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>') +
        '</nav>' +
        '<div id="es-fisio-active-content">' + renderActiveTabContent(activeTab, user, treats) + '</div>' +
      '</main>' +
    '</div>';

    box.innerHTML = html;
    box.hidden = false;
    box.removeAttribute('hidden');
    box.style.display = 'block';

    box.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-fisio-nav]');
      if (btn) {
        activeTab = btn.dataset.fisioNav;
        var ac = box.querySelector('#es-fisio-active-content');
        if (ac) ac.innerHTML = renderActiveTabContent(activeTab, user, treats);
        box.querySelectorAll('[data-fisio-nav]').forEach(function (b) {
          b.classList.toggle('is-active', b.dataset.fisioNav === activeTab);
        });
        var sb = document.getElementById('es-fisio-sidebar');
        if (sb) sb.classList.remove('is-open');
        return;
      }
      var ab = e.target.closest('[data-fisio-act]');
      if (ab) {
        var act = ab.dataset.fisioAct;
        if (act === 'new-treat') toast('Nuova seduta di fisioterapia.', 'info');
        else if (act === 'new-prot') toast('Nuovo protocollo riabilitativo.', 'info');
        else if (act === 'new-rom') toast('Nuova valutazione ROM.', 'info');
        else if (act === 'open-prot') toast('Apertura protocollo.', 'info');
        else if (act === 'send-update') toast('Aggiornamento inviato allo staff.', 'success');
        else if (act === 'edit-profile') toast('Modifica anagrafica.', 'info');
        else if (act === 'upload-cert') toast('Upload certificazioni.', 'info');
      }
    });

    var menuBtn = document.getElementById('btn-toggle-fisio-sidebar');
    var sidebarEl = document.getElementById('es-fisio-sidebar');
    if (menuBtn && sidebarEl) {
      menuBtn.addEventListener('click', function () { sidebarEl.classList.toggle('is-open'); });
    }
  }

  function boot() {
    var u = userObj();
    if (!isFisio(u)) return;
    renderHub(u);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  document.addEventListener('elisee:roleChanged', function () { var u = userObj(); if (isFisio(u)) renderHub(u); });
  document.addEventListener('elisee:userUpdated', function () { var u = userObj(); if (isFisio(u)) renderHub(u); });
  window.elisee_fisioHub = { render: renderHub };
})();
