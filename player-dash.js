/* Dashboard analitica calciatore v3.6 — Selettore Stagione & Valutazione Pubblica Multi-Ruolo */
(function () {
  'use strict';

  var currentSeason = '2026/27';

  var AXES = [
    'Intercettazioni', 'Tackle', 'Duelli Aerei Vinti', 'Precisione Passaggi',
    'Crossing', 'Passaggi Chiave', 'Dribbling Riusciti', 'Scatti',
    'Accelerazioni', 'Recupero Palla', 'Posizionamento', 'Discipline'
  ];

  // Dataset per stagione
  var SEASON_DATASETS = {
    '2026/27': {
      hasData: true,
      label: 'Stagione 2026/27 (Corrente)',
      primary: [93, 89, 81, 92, 86, 78, 94, 89, 93, 96, 91, 88],
      benchmark: [92, 88, 79, 91, 85, 76, 93, 88, 92, 95, 90, 87],
      leagueAvg: [82, 80, 75, 81, 78, 73, 83, 82, 84, 85, 83, 81],
      pgbAvg: '8.2 / 10',
      matches: [
        { match: 'vs. Notaresco', min: "90'", g: 1, a: 0, pgb: 8.6, dot: 'g' },
        { match: 'vs. Vastese', min: "85'", g: 0, a: 1, pgb: 7.2, dot: 'g' },
        { match: 'vs. Chieti', min: "90'", g: 1, a: 1, pgb: 8.4, dot: 'g' },
        { match: 'vs. Termoli', min: "90'", g: 2, a: 1, pgb: 9.0, dot: 'g' },
        { match: 'vs. Campobasso', min: "90'", g: 1, a: 0, pgb: 7.8, dot: 'g' },
        { match: 'vs. Castelfidardo', min: "88'", g: 0, a: 1, pgb: 8.0, dot: 'g' }
      ],
      metrics: {
        compatibilita: '92%',
        tackle: '91%',
        passaggi: '92%',
        dribbling: '94%',
        recupero: '96%'
      }
    },
    '2025/26': {
      hasData: true,
      label: 'Stagione 2025/26',
      primary: [92, 88, 79, 91, 85, 76, 93, 88, 92, 95, 90, 87],
      benchmark: [78, 80, 70, 82, 74, 68, 84, 76, 80, 86, 81, 79],
      leagueAvg: [81, 79, 74, 80, 77, 72, 82, 81, 83, 84, 82, 80],
      pgbAvg: '8.1 / 10',
      matches: [
        { match: 'vs. Notaresco', min: "90'", g: 1, a: 0, pgb: 8.6, dot: 'g' },
        { match: 'vs. Vastese', min: "85'", g: 0, a: 1, pgb: 7.0, dot: 'g' },
        { match: 'vs. Chieti', min: "72'", g: 0, a: 0, pgb: 6.5, dot: 'y' },
        { match: 'vs. Termoli', min: "90'", g: 2, a: 1, pgb: 9.0, dot: 'g' },
        { match: 'vs. Campobasso', min: "90'", g: 1, a: 0, pgb: 7.0, dot: 'y' },
        { match: 'vs. Castelfidardo', min: "80'", g: 0, a: 0, pgb: 7.5, dot: 'g' }
      ],
      metrics: {
        compatibilita: '90%',
        tackle: '90%',
        passaggi: '91%',
        dribbling: '93%',
        recupero: '95%'
      }
    },
    '2024/25': {
      hasData: true,
      label: 'Stagione 2024/25',
      primary: [84, 82, 75, 85, 79, 72, 86, 81, 85, 89, 84, 82],
      benchmark: [78, 80, 70, 82, 74, 68, 84, 76, 80, 86, 81, 79],
      leagueAvg: [80, 78, 73, 79, 76, 71, 81, 80, 82, 83, 81, 79],
      pgbAvg: '7.6 / 10',
      matches: [
        { match: 'vs. Avezzano', min: "80'", g: 0, a: 1, pgb: 7.4, dot: 'g' },
        { match: 'vs. Sambenedettese', min: "90'", g: 1, a: 0, pgb: 7.8, dot: 'g' },
        { match: 'vs. Fano', min: "65'", g: 0, a: 0, pgb: 6.8, dot: 'y' },
        { match: 'vs. Senigallia', min: "90'", g: 1, a: 0, pgb: 8.0, dot: 'g' },
        { match: 'vs. Sora', min: "75'", g: 0, a: 0, pgb: 6.9, dot: 'y' }
      ],
      metrics: {
        compatibilita: '84%',
        tackle: '82%',
        passaggi: '85%',
        dribbling: '86%',
        recupero: '89%'
      }
    },
    '2023/24': {
      hasData: true,
      label: 'Stagione 2023/24',
      primary: [78, 80, 70, 82, 74, 68, 84, 76, 80, 86, 81, 79],
      benchmark: [70, 72, 65, 75, 68, 62, 76, 70, 74, 78, 75, 72],
      leagueAvg: [78, 76, 71, 77, 74, 69, 79, 78, 80, 81, 79, 77],
      pgbAvg: '7.1 / 10',
      matches: [
        { match: 'vs. Roma City', min: "70'", g: 0, a: 0, pgb: 6.8, dot: 'y' },
        { match: 'vs. Tivoli', min: "90'", g: 1, a: 0, pgb: 7.5, dot: 'g' },
        { match: 'vs. Sora', min: "60'", g: 0, a: 0, pgb: 6.4, dot: 'y' },
        { match: 'vs. Riccione', min: "85'", g: 1, a: 1, pgb: 7.9, dot: 'g' }
      ],
      metrics: {
        compatibilita: '78%',
        tackle: '80%',
        passaggi: '82%',
        dribbling: '84%',
        recupero: '86%'
      }
    },
    '2022/23': {
      hasData: false,
      label: 'Stagione 2022/23',
      message: 'Nessun dato registrato per la stagione 2022/23 (Tesseramento federale o match analysis non attiva sulla piattaforma).'
    }
  };

  var ICONS = {
    user: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    shield: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    activity: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
    briefcase: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
    heart: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    fileText: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
    video: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>',
    edit: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    info: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    check: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  var SEASONS = ['2026/27', '2025/26', '2024/25', '2023/24'];
  var RICHIESTE_STORAGE_KEY = 'elisee_contact_requests';

  function getRichiesteData() {
    try {
      var d = JSON.parse(localStorage.getItem(RICHIESTE_STORAGE_KEY) || '[]');
      if (Array.isArray(d)) return d;
    } catch (_) {}
    return [];
  }
  function saveRichiesteData(arr) {
    try {
      localStorage.setItem(RICHIESTE_STORAGE_KEY, JSON.stringify(arr));
    } catch (_) {}
  }

  function cardRequestHtml(r) {
    var verifiedTag = r.verificato ? ' <span style="color:var(--es-verified); font-size:11px; font-weight:700;">✓ verificato</span>' : '';
    if (r.stato) {
      var statusLabel = r.stato === 'accepted' ? 'Accettata' : 'Rifiutata';
      var statusClass = r.stato === 'accepted' ? 'accepted' : 'declined';
      return (
        '<div class="es-request-card is-resolved" data-id="' + esc(r.id) + '">' +
          '<div>' +
            '<p class="es-request-card__role">' + esc(r.ruolo) + '</p>' +
            '<p class="es-request-card__name">' + esc(r.nome) + verifiedTag + '</p>' +
          '</div>' +
          '<span class="es-request-card__status ' + statusClass + '">' + statusLabel + '</span>' +
        '</div>'
      );
    }
    return (
      '<div class="es-request-card" data-id="' + esc(r.id) + '">' +
        '<div>' +
          '<p class="es-request-card__role">' + esc(r.ruolo) + '</p>' +
          '<p class="es-request-card__name">' + esc(r.nome) + verifiedTag + '</p>' +
          (r.messaggio ? '<p class="es-request-card__message">' + esc(r.messaggio) + '</p>' : '') +
          '<p class="es-request-card__time">' + esc(r.quando || 'Recente') + '</p>' +
        '</div>' +
        '<div class="es-request-card__actions">' +
          '<button type="button" class="es-request-card__decline" data-action="decline" data-id="' + esc(r.id) + '">Rifiuta</button>' +
          '<button type="button" class="es-request-card__accept" data-action="accept" data-id="' + esc(r.id) + '">Accetta</button>' +
        '</div>' +
      '</div>'
    );
  }

  function renderRequestsList(data) {
    if (!Array.isArray(data) || !data.length) return '';
    return data.map(cardRequestHtml).join('');
  }

  function updateRequestsUI(box, reqList) {
    reqList = reqList || getRichiesteData();
    var list = box ? box.querySelector('#requests-list') : document.getElementById('requests-list');
    var emptyNote = box ? box.querySelector('#requests-empty') : document.getElementById('requests-empty');
    var countBadge = box ? box.querySelector('#requests-count-badge') : document.getElementById('requests-count-badge');
    var pending = reqList.filter(function (r) { return !r.stato; }).length;
    if (countBadge) countBadge.textContent = pending + ' in attesa';
    if (emptyNote) emptyNote.style.display = reqList.length === 0 ? 'block' : 'none';
    if (list) list.innerHTML = renderRequestsList(reqList);

    var bellDot = document.getElementById('es-nav-bell-dot');
    if (bellDot) {
      bellDot.hidden = pending <= 0;
    }
  }

  function userObj() {
    try { return JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {}; } catch (_) { return {}; }
  }

  function playerName(u) {
    return [u.nome, u.cognome].filter(Boolean).join(' ').trim() || u.username || 'Mario Rossi';
  }

  function initials(name) {
    var p = String(name || 'MR').trim().split(/\s+/);
    return ((p[0] || 'M').charAt(0) + (p[1] || p[0] || 'R').charAt(0)).toUpperCase();
  }

  function photoOf(u) {
    try {
      if (window.getStoredProfilePhoto) return window.getStoredProfilePhoto(null, u) || u.fotoUrl || '';
    } catch (_) {}
    return u.fotoUrl || '';
  }

  function isMinorAthlete(u) {
    var age = parseInt(u.eta || '22', 10);
    if (!isNaN(age) && age < 18) return true;
    var cat = String(u.categoria || '').toLowerCase();
    if (cat.includes('giovanissim') || cat.includes('alliev') || cat.includes('under 17') || cat.includes('under 16') || cat.includes('under 15') || cat.includes('esordient')) {
      return true;
    }
    return false;
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

  function radarSvg(dataset) {
    if (!dataset || !dataset.hasData) {
      return '<div style="background:rgba(15,23,42,0.5); border:1px dashed rgba(148,163,184,0.2); border-radius:4px; padding:3rem 1.5rem; text-align:center; color:#94a3b8; font-size:0.82rem;">' +
        '<div style="font-weight:700; color:#38bdf8; margin-bottom:0.4rem;">Nessun dato registrato per la ' + esc(currentSeason) + '</div>' +
        '<div>La rilevazione delle prestazioni e il tracciamento video sono attivi a partire dalle stagioni successive.</div>' +
        '</div>';
    }

    var cx = 220, cy = 210, r = 145, n = AXES.length;
    var primary = dataset.primary;
    var benchmark = dataset.benchmark;
    var league = dataset.leagueAvg;

    var html = '<svg class="es-pd-radar-svg" viewBox="0 0 440 430" role="img" aria-label="Radar prestazioni">';
    html += wedge(cx, cy, r, -Math.PI / 2, 0, 'rgba(56,189,248,0.08)');
    html += wedge(cx, cy, r, 0, Math.PI / 2, 'rgba(52,211,153,0.06)');
    html += wedge(cx, cy, r, Math.PI / 2, Math.PI, 'rgba(251,191,36,0.06)');
    html += wedge(cx, cy, r, Math.PI, Math.PI * 1.5, 'rgba(148,163,184,0.06)');
    
    for (var ring = 1; ring <= 5; ring++) {
      html += '<polygon points="' + poly(cx, cy, r, AXES.map(function () { return ring * 20; })) +
        '" fill="none" stroke="rgba(148,163,184,0.18)" stroke-width="1"/>';
    }
    
    for (var i = 0; i < n; i++) {
      var e = polar(cx, cy, r, i, n, 100);
      html += '<line x1="' + cx + '" y1="' + cy + '" x2="' + e[0].toFixed(1) + '" y2="' + e[1].toFixed(1) +
        '" stroke="rgba(148,163,184,0.18)"/>';
      var lab = polar(cx, cy, r + 20, i, n, 100);
      html += '<text x="' + lab[0].toFixed(1) + '" y="' + lab[1].toFixed(1) +
        '" text-anchor="middle" dominant-baseline="middle" fill="#94a3b8" font-size="8.5" font-family="Outfit,sans-serif" style="cursor:pointer;" class="es-pd-radar-axis-label" data-axis-name="' + esc(AXES[i]) + '">' +
        esc(AXES[i]) + ' ' + primary[i] + '%</text>';
    }
    
    // Serie 3: Media Girone
    html += '<polygon points="' + poly(cx, cy, r, league) + '" fill="rgba(52,211,153,0.08)" stroke="#34d399" stroke-dasharray="3,3" stroke-width="1.5"/>';
    // Serie 2: Benchmark Storico
    html += '<polygon points="' + poly(cx, cy, r, benchmark) + '" fill="rgba(148,163,184,0.08)" stroke="#64748b" stroke-width="1.5"/>';
    // Serie 1: Stagione Selezionata
    html += '<polygon points="' + poly(cx, cy, r, primary) + '" fill="rgba(56,189,248,0.14)" stroke="#38bdf8" stroke-width="2"/>';
    
    html += '</svg>';
    return html;
  }

  function trendSvg() {
    var series = {
      '2023': [62, 68, 70, 74, 72, 78],
      '2024': [70, 72, 76, 80, 84, 86],
      '2025': [78, 82, 85, 88, 90, 93],
      '2026': [84, 88, 89, 92, 94, 96]
    };
    var cols = { '2023': '#64748b', '2024': '#34d399', '2025': '#fbbf24', '2026': '#38bdf8' };
    var w = 240, h = 85;
    var html = '<svg viewBox="0 0 ' + w + ' ' + h + '" width="100%" height="85">';
    Object.keys(series).forEach(function (k) {
      var vals = series[k];
      var pts = vals.map(function (v, i) {
        return ((i / 5) * (w - 8) + 4).toFixed(1) + ',' + (h - 8 - (v / 100) * (h - 16)).toFixed(1);
      }).join(' ');
      html += '<polyline fill="none" stroke="' + cols[k] + '" stroke-width="2" points="' + pts + '"/>';
    });
    html += '</svg>';
    return html;
  }

  function html(user) {
    var name = playerName(user);
    var ph = photoOf(user);
    var isMinor = isMinorAthlete(user);
    var p = user.playerProfile || {};
    var sData = SEASON_DATASETS[currentSeason] || SEASON_DATASETS['2026/27'];

    var ava = ph
      ? '<img src="' + esc(ph) + '" alt="">'
      : '<div class="es-pd-ph">' + esc(initials(name)) + '</div>';

    var ico = function (d) {
      return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>';
    };

    function dashVal(v) {
      v = v == null ? '' : String(v).trim();
      return v;
    }
    function dashAge() {
      if (dashVal(user.eta)) return dashVal(user.eta);
      var y = dashVal(p.birthYear);
      if (!y && user.dataNascita) {
        var ym = String(user.dataNascita).match(/(19|20)\d{2}/);
        if (ym) y = ym[0];
      }
      var n = parseInt(y, 10);
      if (n > 1900) return String(new Date().getFullYear() - n);
      return '';
    }
    var bioText = dashVal(p.bio || user.bio);
    var careerGoals = dashVal(p.careerGoals);
    var secRoles = dashVal(p.secondaryRoles);
    var fieldRole = dashVal(p.fieldRole || user.ruoloDettagliato);
    var foot = dashVal(p.foot || user.piede);
    var height = dashVal(p.heightCm || user.altezza);
    var category = dashVal(user.categoria);
    var clubName = dashVal(user.squadra || user.club || user.squadraCuore);
    var availTransfer = p.availTransfer;
    var contractStatus = dashVal(p.contractStatus);
    var contactPref = dashVal(p.contactPref);
    var marketVal = dashVal(p.marketValue || user.valoreMercato);
    var realMatches = Array.isArray(p.matches) ? p.matches : (Array.isArray(user.matches) ? user.matches : []);
    var hasRadar = !!(p.radar && Array.isArray(p.radar.primary) && p.radar.primary.length);
    if (hasRadar) {
      sData = {
        hasData: true,
        primary: p.radar.primary,
        benchmark: p.radar.benchmark || p.radar.primary,
        leagueAvg: p.radar.leagueAvg || p.radar.primary,
        matches: realMatches,
        metrics: p.metrics || {},
        pgbAvg: dashVal(p.pgbAvg)
      };
    } else {
      sData = { hasData: false, matches: realMatches, metrics: {}, pgbAvg: '' };
    }
    var emailOk = !!(user.emailVerifiedAt || user.isEmailVerified || user.emailVerified);
    var docsOk = !!(user.docsAttachedAt || user.badgeDocumentUrl || user.badgeSelfieUrl);
    var badgeOk = String(user.badgeVerificaStato || '') === 'approved';
    var gdprOk = !!(user.gdprConsent || user.consensoGdpr || user.privacyAccepted || user.consensoTrattamento);
    var imageOk = !!(p.imageRelease || user.liberatoriaImmagine);
    var medOk = !!(user.visitaMedica || p.idoneita);

    var seasonPickerHtml = '<div style="font-size:0.75rem; color:#38bdf8; font-weight:700;">Stagione ' + esc(currentSeason) + '</div>';
    var publicRatingCardHtml = '';
    try {
      if (window.EliseeRatingSystem && window.EliseeRatingSystem.renderSeasonPicker) {
        seasonPickerHtml = window.EliseeRatingSystem.renderSeasonPicker(currentSeason) || seasonPickerHtml;
      }
      if (window.EliseeRatingSystem && window.EliseeRatingSystem.renderRatingCard) {
        publicRatingCardHtml = window.EliseeRatingSystem.renderRatingCard(user, 'giocatore', currentSeason) || '';
      }
    } catch (_) {}

    var matchesRows = '';
    if (realMatches.length) {
      matchesRows = realMatches.map(function (m) {
        return '<tr><td>' + esc(m.match || m.gara || '') + '</td><td>' + esc(m.min || m.minuti || '') + '</td><td>' + (m.g == null ? '' : m.g) + '</td><td>' + (m.a == null ? '' : m.a) + '</td><td>' + (m.pgb == null ? '' : m.pgb) + '</td><td>' + (m.dot ? '<i class="es-pd-dot ' + esc(m.dot) + '"></i>' : '') + '</td></tr>';
      }).join('');
    } else {
      matchesRows = '<tr><td colspan="6" class="es-pd-empty">Nessuna gara registrata per questo profilo</td></tr>';
    }
    function rowKV(label, value, kind) {
      var cls = 'es-pd-ok';
      if (kind === 'warn') cls += ' is-warn';
      if (kind === 'miss') cls += ' is-miss';
      if (kind === 'hi') cls += ' es-pd-metric-hi';
      return '<div class="' + cls + '"><span>' + esc(label) + '</span><b>' + (value || 'Non disponibile') + '</b></div>';
    }
    function miss(label) {
      return '<div class="es-pd-metric-row es-pd-metric-missing"><span>' + esc(label) + '</span><b>Non dichiarato</b></div>';
    }
    function kv(label, value, hi) {
      if (!dashVal(value)) return miss(label);
      return '<div class="es-pd-metric-row' + (hi ? ' es-pd-metric-hi' : '') + '"><span>' + esc(label) + '</span><b>' + esc(value) + '</b></div>';
    }
    return '<aside class="es-pd-rail">' +
      '<button type="button" data-pd="home" title="Home">' + ico('<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>') + '</button>' +
      '<button type="button" class="is-on" data-pd="dash" title="Dashboard">' + ico('<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>') + '</button>' +
      '<button type="button" data-pd="album" title="Album">' + ico('<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>') + '</button>' +
      '<button type="button" data-pd="msgs" title="Messaggi">' + ico('<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>') + '</button>' +
      '<button type="button" class="es-pd-rail-end" data-pd="edit" title="Anagrafica">' + ico('<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>') + '</button>' +
      '</aside><div class="es-pd-body">' +
      
      '<div class="es-dossier__head">' +
        '<h1>' + ICONS.activity + ' Elisee Scout — Report Tecnico &amp; Profilo Atleta</h1>' +
        '<div class="es-dossier__season">' +
          '<strong>' + esc(name) + '</strong>' +
          '<span style="color:var(--es-border); margin:0 4px;">|</span>' +
          '<button type="button" class="es-season-nav" aria-label="Stagione precedente" data-season-step="-1" title="Stagione precedente">‹</button>' +
          '<span>Stagione <strong>' + esc(currentSeason) + '</strong> ' +
            (currentSeason === '2026/27'
              ? '<span style="color:var(--es-accent);">· Attuale</span>'
              : '<span style="color:var(--es-text-muted);">· Storico</span>') +
          '</span>' +
          '<button type="button" class="es-season-nav" aria-label="Stagione successiva" data-season-step="1" title="Stagione successiva">›</button>' +
        '</div>' +
      '</div>' +

      '<div id="es-pc-slot"></div>' +

      '<div class="es-dossier-grid">' +

      // === COLONNA 1 ===
      '<div class="es-dossier-col">' +
        // Card 1: Indice Atleta & Parametri
        '<div class="es-panel-card">' +
          '<div class="es-panel-card__head">' +
            '<h4>Indice Atleta &amp; Parametri</h4>' +
            '<span class="es-badge es-badge--tag">Anagrafica</span>' +
          '</div>' +
          '<div class="es-profile-summary">' +
            '<div class="es-profile-summary__photo">' +
              (user.photoUrl ? '<img src="' + esc(user.photoUrl) + '" alt="' + esc(name) + '">' : '<div class="es-pd-ph" style="width:100%;height:100%;display:grid;place-items:center;background:var(--es-panel-2);color:var(--es-accent);font-weight:800;">' + esc((name || 'EM').slice(0, 2).toUpperCase()) + '</div>') +
            '</div>' +
            '<div>' +
              '<p class="es-profile-summary__name">' + esc(name) + '</p>' +
              '<p class="es-profile-summary__role">' + esc(fieldRole || 'Attaccante') + '</p>' +
              '<p class="es-profile-summary__club">' + esc(clubName || 'Atalanta') + '</p>' +
            '</div>' +
          '</div>' +
          '<span class="es-badge es-badge--active" style="margin-bottom:12px;">Cat. ' + esc(category || 'Iscritto Elisee') + '</span>' +
          (sData.hasData && sData.metrics && (sData.metrics.compatibilita || sData.metrics.tackle) ? (
            kv('Compatibilità tattica', sData.metrics.compatibilita, true) +
            kv('Tackle e contrasti', sData.metrics.tackle) +
            kv('Precisione passaggi', sData.metrics.passaggi) +
            kv('Dribbling 1vs1', sData.metrics.dribbling) +
            kv('Recupero palla', sData.metrics.recupero) +
            (sData.pgbAvg ? kv('Media voto PGB (' + currentSeason + ')', sData.pgbAvg, true) : '')
          ) : (
            '<p class="es-empty-note">Nessuna metrica di prestazione certificata su questo profilo. I valori compariranno dopo match analysis o dati caricati dal club.</p>'
          )) +
        '</div>' +

        // Card 2: Azioni possibili
        '<div class="es-panel-card">' +
          '<div class="es-panel-card__head">' +
            '<h4>Azioni possibili</h4>' +
            '<span class="es-badge es-badge--tag">Strumenti operativi</span>' +
          '</div>' +
          '<p class="es-empty-note" style="margin-bottom:10px;">— Calciatore / Utente</p>' +
          '<div class="es-link-list">' +
            '<a href="#" data-pd="edit"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>Aggiornare anagrafica e preferenze</a>' +
            '<a href="#" data-player-action="behavioral_consent"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>Attivare consenso profilo comportamentale</a>' +
            '<a href="#" data-player-action="human_intervention"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>Richiedere intervento umano (art. 22)</a>' +
            '<a href="#" data-player-action="export_gdpr"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Esportare i propri dati (GDPR)</a>' +
            '<a href="#" data-player-action="career_projection"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>Percorso di Crescita Proiettato (IA Career Projection)</a>' +
          '</div>' +
        '</div>' +
      '</div>' +

      // === COLONNA 2 ===
      '<div class="es-dossier-col">' +
        // Card 3: Radar Prestazioni a 12 Assi
        '<div class="es-panel-card">' +
          '<div class="es-panel-card__head">' +
            '<h4>Radar Prestazioni a 12 Assi (' + esc(currentSeason) + ')</h4>' +
            '<span class="es-badge ' + (sData.hasData ? 'es-badge--active' : 'es-badge--pending') + '">' + (sData.hasData ? 'Dati gara' : 'In attesa') + '</span>' +
          '</div>' +
          '<p class="es-empty-note" style="margin-bottom:14px;">Clicca su un parametro per aprire clip video e contesto gara.</p>' +
          '<div style="display:flex; gap:14px; font-size:11px; color:var(--es-text-muted); margin-bottom:16px;">' +
            '<span><b style="color:var(--es-accent);">■</b> ' + esc(currentSeason) + '</span><span><b style="color:var(--es-text-muted);">■</b> Benchmark</span><span><b style="color:var(--es-verified);">■</b> Media Girone</span>' +
          '</div>' +
          (sData.hasData
            ? radarSvg(sData)
            : '<div style="background:var(--es-panel-2); border:1px solid var(--es-border); border-radius:10px; padding:32px; text-align:center;">' +
                '<p style="font-size:13px; font-weight:700; margin:0 0 6px; color:var(--es-text);">Nessun dato registrato per la ' + esc(currentSeason) + '</p>' +
                '<p class="es-empty-note">La rilevazione delle prestazioni e il tracciamento video sono attivi a partire dalle stagioni successive.</p>' +
              '</div>'
          ) +
        '</div>' +

        // Card 4: Il Mio Profilo & Obiettivi
        '<div class="es-panel-card">' +
          '<div class="es-panel-card__head">' +
            '<h4>Il Mio Profilo &amp; Obiettivi</h4>' +
            '<span class="es-badge es-badge--tag">Dato dichiarato atleta</span>' +
          '</div>' +
          '<dl class="es-field-list">' +
            '<dt>Presentazione personale / bio</dt>' +
            '<dd class="' + (bioText ? '' : 'muted') + '">' + (bioText ? esc(bioText) : 'Non compilata') + '</dd>' +
            '<dt>Obiettivi di carriera</dt>' +
            '<dd class="' + (careerGoals ? '' : 'muted') + '">' + (careerGoals ? esc(careerGoals) : 'Non dichiarati') + '</dd>' +
          '</dl>' +
          '<div class="es-field-row" style="margin-top:14px;">' +
            '<dl class="es-field-list" style="margin:0;">' +
              '<dt>Disponibilità trasferimento</dt>' +
              '<dd class="' + (availTransfer !== null && availTransfer !== undefined ? '' : 'muted') + '">' + (availTransfer === true ? 'Disponibile' : (availTransfer === false ? 'Non disponibile' : 'Non dichiarata')) + '</dd>' +
            '</dl>' +
            '<dl class="es-field-list" style="margin:0;">' +
              '<dt>Stato contrattuale</dt>' +
              '<dd class="' + (contractStatus ? '' : 'muted') + '">' + esc(contractStatus || 'Non dichiarato') + '</dd>' +
            '</dl>' +
          '</div>' +
          '<dl class="es-field-list">' +
            '<dt>Preferenze di contatto</dt>' +
            '<dd class="' + (contactPref ? '' : 'muted') + '">' + esc(contactPref || 'Non dichiarate') + '</dd>' +
          '</dl>' +
          '<button type="button" class="es-btn es-btn--primary" style="width:100%; margin-top:16px;" data-pd="edit">Modifica Profilo &amp; Autovalutazione</button>' +
        '</div>' +
      '</div>' +

      // === COLONNA 3 ===
      '<div class="es-dossier-col">' +
        // Card 5: Certificazione & Compliance
        '<div class="es-panel-card">' +
          '<div class="es-panel-card__head">' +
            '<h4>Certificazione &amp; Compliance</h4>' +
            '<span class="es-badge es-badge--verified">Validato</span>' +
          '</div>' +
          '<ul class="es-checklist">' +
            '<li><span>Email</span><span class="es-badge ' + (emailOk ? 'es-badge--verified' : 'es-badge--pending') + '">' + (emailOk ? 'Verificata' : 'Da verificare') + '</span></li>' +
            '<li><span>Documenti identità</span><span class="es-badge ' + (docsOk ? 'es-badge--active' : 'es-badge--pending') + '">' + (docsOk ? 'Allegati' : 'Mancanti') + '</span></li>' +
            '<li><span>Consenso GDPR</span><span class="es-badge ' + (gdprOk ? 'es-badge--active' : 'es-badge--pending') + '">' + (gdprOk ? 'Presente' : 'Non registrato') + '</span></li>' +
            '<li><span>Liberatoria immagine</span><span class="es-badge ' + (imageOk ? 'es-badge--active' : 'es-badge--pending') + '">' + (imageOk ? 'Presente' : 'Non registrata') + '</span></li>' +
            '<li><span>Idoneità agonistica</span><span class="es-badge ' + (medOk ? 'es-badge--active' : 'es-badge--pending') + '">' + (medOk ? esc(user.visitaMedica || 'Presente') : 'Non caricata') + '</span></li>' +
            '<li><span>Validazione club / badge</span><span class="es-badge ' + (badgeOk ? 'es-badge--verified' : (docsOk ? 'es-badge--active' : 'es-badge--pending')) + '">' + (badgeOk ? 'Approvato' : (docsOk ? 'In revisione' : 'Non richiesto')) + '</span></li>' +
            '<li><span>Anti-fake</span><span class="es-badge ' + (docsOk ? 'es-badge--active' : 'es-badge--pending') + '">' + (docsOk ? 'Documenti ricevuti' : 'In attesa') + '</span></li>' +
          '</ul>' +
        '</div>' +

        // Card 6: Registro Match & Voti PGB
        '<div class="es-panel-card">' +
          '<div class="es-panel-card__head">' +
            '<h4>Registro Match &amp; Voti PGB (' + esc(currentSeason) + ')</h4>' +
            '<span class="es-badge es-badge--pending">' + (realMatches.length ? 'Registro' : 'Vuoto') + '</span>' +
          '</div>' +
          (realMatches.length ? (
            '<table class="es-mini-table"><thead><tr><th>Gara</th><th>MIN</th><th>G</th><th>A</th><th>PGB</th><th>Esito</th></tr></thead><tbody>' +
            matchesRows +
            '</tbody></table>'
          ) : (
            '<table class="es-mini-table"><thead><tr><th>Gara</th><th>MIN</th><th>G</th><th>A</th><th>PGB</th><th>Esito</th></tr></thead></table>' +
            '<p class="es-empty-note" style="margin-top:10px;">Nessuna gara registrata per questo profilo.</p>'
          )) +
        '</div>' +

        // Card 7: Crescita Storica
        '<div class="es-panel-card">' +
          '<div class="es-panel-card__head">' +
            '<h4>Crescita Storica (2023–2027)</h4>' +
            '<span class="es-badge es-badge--pending">' + (sData.hasData ? 'Storico' : 'Vuoto') + '</span>' +
          '</div>' +
          (sData.hasData
            ? (trendSvg() || '')
            : '<p class="es-empty-note">Nessuna serie storica certificata. Il grafico si popola con le stagioni realmente tracciate.</p>'
          ) +
        '</div>' +

        // Card 8: Interesse Scouting & Percorso
        '<div class="es-panel-card">' +
          '<div class="es-panel-card__head">' +
            '<h4>' + (isMinor ? 'Interesse Scouting &amp; Formazione' : 'Interesse Scouting &amp; Percorso') + '</h4>' +
            '<span class="es-badge es-badge--tag">Profilo</span>' +
          '</div>' +
          '<p class="es-empty-note" style="margin-bottom:14px;">' + (marketVal ? ('Valore dichiarato: <strong style="color:var(--es-accent);">' + esc(marketVal) + '</strong>') : 'Nessuna stima di mercato certificata.') + '</p>' +
          '<dl class="es-field-list" style="display:flex; flex-direction:column; gap:0;">' +
            '<div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--es-border);">' +
              '<dt style="margin:0; text-transform:none; font-weight:400; color:var(--es-text-muted); font-size:13px;">Club attuale</dt>' +
              '<dd style="font-weight:700;">' + esc(clubName || 'Atalanta') + '</dd>' +
            '</div>' +
            '<div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--es-border);">' +
              '<dt style="margin:0; text-transform:none; font-weight:400; color:var(--es-text-muted); font-size:13px;">Disponibilità</dt>' +
              '<dd class="' + (availTransfer !== null && availTransfer !== undefined ? '' : 'muted') + '">' + (availTransfer === true ? 'Disponibile' : (availTransfer === false ? 'Non disponibile' : 'Non dichiarato')) + '</dd>' +
            '</div>' +
            '<div style="display:flex; justify-content:space-between; padding:8px 0;">' +
              '<dt style="margin:0; text-transform:none; font-weight:400; color:var(--es-text-muted); font-size:13px;">Scadenza vincolo</dt>' +
              '<dd class="' + (p.contractEnd || user.scadenzaContratto ? '' : 'muted') + '">' + esc(p.contractEnd || user.scadenzaContratto || 'Non dichiarato') + '</dd>' +
            '</div>' +
          '</dl>' +
        '</div>' +
        (publicRatingCardHtml ? '<div class="es-panel-card" style="margin-top:0;">' + publicRatingCardHtml + '</div>' : '') +
      '</div>' +

      '</div>' + // fine es-dossier-grid

      // ===== Richieste di contatto =====
      '<div class="es-panel-card" style="margin-top: 24px;">' +
        '<div class="es-panel-card__head">' +
          '<h4>Richieste di contatto</h4>' +
          '<span class="es-badge es-badge--active" id="requests-count-badge">0 in attesa</span>' +
        '</div>' +
        '<p class="es-empty-note" style="margin-bottom: 16px;">Richieste esplicite di contatto da profili verificati — diverse dal semplice interesse passivo qui sotto: qui c\'è un\'azione da parte tua.</p>' +
        '<div id="requests-list">' + renderRequestsList(getRichiesteData()) + '</div>' +
        '<div class="es-empty-note" id="requests-empty"' + (getRichiesteData().length ? ' style="display:none;"' : '') + '>Nessuna richiesta di contatto in attesa.</div>' +
      '</div>' +

      // ===== Interesse dalla rete =====
      '<div class="es-panel-card" style="margin-top: 24px;">' +
        '<div class="es-panel-card__head">' +
          '<h4>Interesse dalla rete</h4>' +
          '<span class="es-badge es-badge--tag">Solo tu puoi vederlo</span>' +
        '</div>' +
        '<p class="es-empty-note" style="margin-bottom: 18px;">Chi, nella rete Elisee Scout, ha mostrato interesse verso il tuo profilo. Visibile solo a te finché non scegli di condividerlo.</p>' +
        '<div class="es-interest-grid">' +
          '<div class="es-interest-item">' +
            '<span class="es-interest-item__count">0</span>' +
            '<p class="es-interest-item__label">Allenatori interessati</p>' +
          '</div>' +
          '<div class="es-interest-item">' +
            '<span class="es-interest-item__count">0</span>' +
            '<p class="es-interest-item__label">Direttori Sportivi interessati</p>' +
          '</div>' +
          '<div class="es-interest-item">' +
            '<span class="es-interest-item__count">0</span>' +
            '<p class="es-interest-item__label">Club interessati</p>' +
          '</div>' +
          '<div class="es-interest-item">' +
            '<span class="es-interest-item__count">0</span>' +
            '<p class="es-interest-item__label">Procuratori sportivi interessati</p>' +
          '</div>' +
          '<div class="es-interest-item">' +
            '<span class="es-interest-item__count">0</span>' +
            '<p class="es-interest-item__label">Osservatori rappresentative giovanili</p>' +
          '</div>' +
        '</div>' +
        '<p class="es-empty-note" style="margin-top: 16px;">Nessun interesse registrato finora — comparirà qui non appena un profilo verificato visualizza o salva il tuo dossier.</p>' +
      '</div>' +

      '</div>';
  }

  // Modale Edit Profilo
  function openEditModal(user) {
    user = user || userObj();
    var p = user.playerProfile || {};
    var backdrop = document.createElement('div');
    backdrop.className = 'es-edit-modal-backdrop';
    
    var roleVal = p.fieldRole || user.ruoloDettagliato || 'Punta Centrale';
    var roles = [
      'Punta Centrale', 'Seconda Punta', 'Ala Destra', 'Ala Sinistra',
      'Trequartista', 'Mezzala', 'Regista', 'Mediano',
      'Terzino Destro', 'Terzino Sinistro', 'Difensore Centrale', 'Portiere'
    ];
    var rolesOpts = roles.map(function (r) {
      return '<option value="' + esc(r) + '"' + (r === roleVal ? ' selected' : '') + '>' + esc(r) + '</option>';
    }).join('');

    var footVal = p.foot || user.piede || 'Destro';
    var feet = ['Destro', 'Mancino', 'Ambidestro'];
    var feetOpts = feet.map(function (f) {
      return '<option value="' + esc(f) + '"' + (f === footVal ? ' selected' : '') + '>' + esc(f) + '</option>';
    }).join('');

    var contractStatusVal = p.contractStatus || 'Sotto contratto (Accordo Economico)';
    var contracts = [
      'Sotto contratto (Accordo Economico)',
      'Svincolato / In cerca di squadra',
      'In prestito',
      'Tesseramento Giovanile FIGC',
      'In trattativa'
    ];
    var contractOpts = contracts.map(function (c) {
      return '<option value="' + esc(c) + '"' + (c === contractStatusVal ? ' selected' : '') + '>' + esc(c) + '</option>';
    }).join('');

    var contactPrefVal = p.contactPref || 'Club, Direttori Sportivi e Scout Verificati';
    var contactPrefs = [
      'Club, Direttori Sportivi e Scout Verificati',
      'Solo Club e Direttori Sportivi',
      'Solo Scout / Agenti accreditati',
      'Tutti i tesserati della piattaforma'
    ];
    var contactOpts = contactPrefs.map(function (cp) {
      return '<option value="' + esc(cp) + '"' + (cp === contactPrefVal ? ' selected' : '') + '>' + esc(cp) + '</option>';
    }).join('');

    backdrop.innerHTML = '<div class="es-edit-modal" style="max-width:720px; border-radius:6px;">' +
      '<div class="es-edit-modal-head">' +
        '<h2>' + ICONS.edit + ' Il Mio Profilo &amp; Anagrafica Atleta (Dati Dichiarati)</h2>' +
        '<button type="button" class="es-edit-modal-close" title="Chiudi">&times;</button>' +
      '</div>' +
      '<div class="es-edit-grid">' +
        '<div class="es-edit-field"><label>Nome</label><input id="es-ed-nome" value="' + esc(user.nome || '') + '"></div>' +
        '<div class="es-edit-field"><label>Cognome</label><input id="es-ed-cognome" value="' + esc(user.cognome || '') + '"></div>' +
        '<div class="es-edit-field"><label>Ruolo Principale</label><select id="es-ed-role">' + rolesOpts + '</select></div>' +
        '<div class="es-edit-field"><label>Ruoli Secondari Giocabili</label><input id="es-ed-sec-roles" placeholder="es. Ala Sinistra, Trequartista" value="' + esc(p.secondaryRoles || 'Ala Sinistra, Trequartista') + '"></div>' +
        '<div class="es-edit-field"><label>Piede Preferito</label><select id="es-ed-foot">' + feetOpts + '</select></div>' +
        '<div class="es-edit-field"><label>Età (Anni)</label><input type="number" id="es-ed-eta" value="' + esc(user.eta || '22') + '"></div>' +
        '<div class="es-edit-field"><label>Altezza</label><input id="es-ed-altezza" value="' + esc(user.altezza || p.heightCm || '1.83 m') + '"></div>' +
        '<div class="es-edit-field"><label>Peso</label><input id="es-ed-peso" value="' + esc(user.peso || p.weightKg || '76 kg') + '"></div>' +
        '<div class="es-edit-field"><label>Categoria Attuale</label><input id="es-ed-categoria" value="' + esc(user.categoria || 'Serie D · Girone F') + '"></div>' +
        '<div class="es-edit-field"><label>Club / Società Attuale</label><input id="es-ed-club" value="' + esc(user.squadra || user.club || '') + '"></div>' +
        '<div class="es-edit-field"><label>Stato Contrattuale Dichiarato</label><select id="es-ed-contract">' + contractOpts + '</select></div>' +
        '<div class="es-edit-field"><label>Preferenze di Contatto</label><select id="es-ed-contact-pref">' + contactOpts + '</select></div>' +
        '<div class="es-edit-field full"><label>Disponibilità per Provini / Trasferimento</label>' +
          '<div style="display:flex; align-items:center; gap:0.75rem; margin-top:0.25rem;">' +
            '<label style="display:inline-flex; align-items:center; gap:0.4rem; font-size:0.78rem; color:#f1f5f9; cursor:pointer;">' +
              '<input type="checkbox" id="es-ed-avail" ' + (p.availTransfer !== false ? 'checked' : '') + '> Disponibile a valutare nuove proposte' +
            '</label>' +
          '</div>' +
        '</div>' +
        '<div class="es-edit-field full"><label>Obiettivi di Carriera (Dichiarati)</label><textarea id="es-ed-goals" rows="2">' + esc(p.careerGoals || 'Continuità di minutaggio e consolidamento categoria con prospettiva salto nei professionisti.') + '</textarea></div>' +
        '<div class="es-edit-field full"><label>Presentazione Personale / Bio Tecnico-Tattica</label><textarea id="es-ed-bio" rows="3">' + esc(p.bio || user.bio || 'Attaccante rapido con ottima visione di gioco e attacco costante della profondità.') + '</textarea></div>' +
      '</div>' +
      '<div class="es-edit-actions">' +
        '<button type="button" class="es-edit-btn-cancel">Annulla</button>' +
        '<button type="button" class="es-edit-btn-save">Salva Profilo &amp; Dati</button>' +
      '</div>' +
    '</div>';

    document.body.appendChild(backdrop);

    var close = function () { backdrop.remove(); };
    backdrop.querySelector('.es-edit-modal-close').addEventListener('click', close);
    backdrop.querySelector('.es-edit-btn-cancel').addEventListener('click', close);
    backdrop.addEventListener('click', function (e) { if (e.target === backdrop) close(); });

    backdrop.querySelector('.es-edit-btn-save').addEventListener('click', function () {
      var n = document.getElementById('es-ed-nome').value.trim();
      var c = document.getElementById('es-ed-cognome').value.trim();
      var r = document.getElementById('es-ed-role').value;
      var secR = document.getElementById('es-ed-sec-roles').value.trim();
      var f = document.getElementById('es-ed-foot').value;
      var eta = document.getElementById('es-ed-eta').value.trim();
      var alt = document.getElementById('es-ed-altezza').value.trim();
      var peso = document.getElementById('es-ed-peso').value.trim();
      var cat = document.getElementById('es-ed-categoria').value.trim();
      var clb = document.getElementById('es-ed-club').value.trim();
      var bio = document.getElementById('es-ed-bio').value.trim();
      var goals = document.getElementById('es-ed-goals').value.trim();
      var contract = document.getElementById('es-ed-contract').value;
      var contactP = document.getElementById('es-ed-contact-pref').value;
      var avail = document.getElementById('es-ed-avail').checked;

      user.nome = n || user.nome;
      user.cognome = c || user.cognome;
      user.fullName = (user.nome + ' ' + user.cognome).trim();
      user.piede = f;
      user.eta = eta;
      user.altezza = alt;
      user.peso = peso;
      user.categoria = cat;
      user.squadra = clb;
      user.club = clb;
      user.ruoloDettagliato = r;
      user.bio = bio;

      if (!user.playerProfile) user.playerProfile = {};
      user.playerProfile.fieldRole = r;
      user.playerProfile.secondaryRoles = secR;
      user.playerProfile.foot = f;
      user.playerProfile.heightCm = alt;
      user.playerProfile.weightKg = peso;
      user.playerProfile.bio = bio;
      user.playerProfile.careerGoals = goals;
      user.playerProfile.contractStatus = contract;
      user.playerProfile.contactPref = contactP;
      user.playerProfile.availTransfer = avail;

      try {
        localStorage.setItem('elisee_active_user', JSON.stringify(user));
      } catch (_) {}

      close();

      if (typeof window.showToast === 'function') {
        window.showToast('Profilo e dati atleta salvati con successo!', 'success');
      }

      render(user);
    });
  }

  function bind(root) {
    if (!root || root.dataset.bound === '1') return;
    root.dataset.bound = '1';

    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-pd]');
      if (b) {
        var k = b.getAttribute('data-pd');
        if (k === 'home' && window.switchView) window.switchView('home', '#hero');
        if (k === 'album' && window.openChiSegui) window.openChiSegui();
        if (k === 'msgs' && window.openUserMessages) window.openUserMessages();
        if (k === 'edit') {
          openEditModal(userObj());
        }
        return;
      }

      var actLink = e.target.closest('[data-player-action]');
      if (actLink) {
        e.preventDefault();
        var pAct = actLink.getAttribute('data-player-action');
        if (pAct === 'behavioral_consent') {
          var curUser = userObj();
          curUser.consensoProfilazione = true;
          try { localStorage.setItem('elisee_active_user', JSON.stringify(curUser)); } catch(_) {}
          if (typeof window.showToast === 'function') {
            window.showToast('Consenso al profilo comportamentale attivato con successo.', 'success');
          }
        } else if (pAct === 'human_intervention') {
          if (typeof window.showToast === 'function') {
            window.showToast('Richiesta di intervento umano (art. 22 GDPR) presa in carico dal DPO.', 'info');
          }
        } else if (pAct === 'export_gdpr') {
          if (typeof window.showToast === 'function') {
            window.showToast('Esportazione dati personali (GDPR) generata con successo.', 'success');
          }
        } else if (pAct === 'career_projection') {
          if (typeof window.showToast === 'function') {
            window.showToast('Percorso di Crescita Proiettato (IA Career Projection) calcolato sui dati agonistici.', 'info');
          }
        }
        return;
      }

      // Toggle dropdown custom stagione
      var toggleBtn = e.target.closest('.es-season-dropdown-toggle');
      if (toggleBtn) {
        var widget = toggleBtn.closest('.es-season-custom-dropdown');
        if (widget) {
          var popup = widget.querySelector('.es-season-menu-popup');
          var isOpen = widget.classList.contains('is-open');
          // Chiudi eventuali altri dropdown aperti
          document.querySelectorAll('.es-season-custom-dropdown.is-open').forEach(function (w) {
            if (w !== widget) {
              w.classList.remove('is-open');
              var p = w.querySelector('.es-season-menu-popup');
              if (p) p.hidden = true;
              var t = w.querySelector('.es-season-dropdown-toggle');
              if (t) t.setAttribute('aria-expanded', 'false');
            }
          });
          if (isOpen) {
            widget.classList.remove('is-open');
            if (popup) popup.hidden = true;
            toggleBtn.setAttribute('aria-expanded', 'false');
          } else {
            widget.classList.add('is-open');
            if (popup) popup.hidden = false;
            toggleBtn.setAttribute('aria-expanded', 'true');
          }
        }
        return;
      }

      // Selezione item dal menu custom stagione
      var menuItem = e.target.closest('.es-season-menu-item');
      if (menuItem) {
        var targetSeason = menuItem.getAttribute('data-season-val');
        if (targetSeason && targetSeason !== currentSeason) {
          currentSeason = targetSeason;
          render(userObj());
        } else {
          // Chiudi semplicemente
          var parentWidget = menuItem.closest('.es-season-custom-dropdown');
          if (parentWidget) {
            parentWidget.classList.remove('is-open');
            var p = parentWidget.querySelector('.es-season-menu-popup');
            if (p) p.hidden = true;
            var t = parentWidget.querySelector('.es-season-dropdown-toggle');
            if (t) t.setAttribute('aria-expanded', 'false');
          }
        }
        return;
      }

      // Navigazione frecce selettore stagione unificato (‹ / ›)
      var stepBtn = e.target.closest('[data-season-step]');
      if (stepBtn) {
        e.preventDefault();
        var step = parseInt(stepBtn.getAttribute('data-season-step'), 10) || 0;
        var sIdx = SEASONS.indexOf(currentSeason);
        if (sIdx < 0) sIdx = 0;
        var nextIdx = sIdx - step;
        if (nextIdx < 0) nextIdx = 0;
        if (nextIdx >= SEASONS.length) nextIdx = SEASONS.length - 1;
        if (nextIdx !== sIdx) {
          currentSeason = SEASONS[nextIdx];
          try {
            if (window.EliseeRatingSystem && window.EliseeRatingSystem.setSeason) {
              window.EliseeRatingSystem.setSeason(currentSeason);
            }
          } catch (_) {}
          render(userObj());
        }
        return;
      }

      // Azioni richieste di contatto (Accetta / Rifiuta)
      var reqActionBtn = e.target.closest('[data-action="accept"], [data-action="decline"]');
      if (reqActionBtn) {
        e.preventDefault();
        var reqAction = reqActionBtn.getAttribute('data-action');
        var reqId = reqActionBtn.getAttribute('data-id');
        var allReqs = getRichiesteData();
        var targetR = allReqs.find(function (r) { return String(r.id) === String(reqId); });
        if (targetR) {
          targetR.stato = reqAction === 'accept' ? 'accepted' : 'declined';
          saveRichiesteData(allReqs);
          updateRequestsUI(root, allReqs);
          if (typeof window.showToast === 'function') {
            window.showToast(targetR.stato === 'accepted' ? 'Richiesta di contatto accettata.' : 'Richiesta di contatto rifiutata.', 'info');
          }
        }
        return;
      }

      // Navigazione frecce selettore stagione legacy
      var navBtn = e.target.closest('.es-season-nav-btn');
      if (navBtn && !navBtn.disabled) {
        var targetSeason = navBtn.getAttribute('data-nav-season');
        if (targetSeason) {
          currentSeason = targetSeason;
          render(userObj());
        }
        return;
      }

      // Click fuori dal menu a tendina
      if (!e.target.closest('.es-season-custom-dropdown')) {
        document.querySelectorAll('.es-season-custom-dropdown.is-open').forEach(function (w) {
          w.classList.remove('is-open');
          var p = w.querySelector('.es-season-menu-popup');
          if (p) p.hidden = true;
          var t = w.querySelector('.es-season-dropdown-toggle');
          if (t) t.setAttribute('aria-expanded', 'false');
        });
      }

      // Trigger modale valutazione
      var rateBtn = e.target.closest('#btn-trigger-rate-subject');
      if (rateBtn) {
        if (window.EliseeRatingSystem) {
          window.EliseeRatingSystem.openRatingModal(userObj(), 'giocatore', currentSeason, function () {
            render(userObj());
          });
        }
        return;
      }

      // Trigger modale Art. 22 GDPR
      var art22Btn = e.target.closest('#btn-trigger-art22-review');
      if (art22Btn) {
        if (window.EliseeRatingSystem) {
          window.EliseeRatingSystem.openArt22Modal(userObj(), 'giocatore', currentSeason);
        }
        return;
      }
    });

    // Event listener cambio dropdown stagione
    root.addEventListener('change', function (e) {
      if (e.target && e.target.classList.contains('es-season-select-dropdown')) {
        currentSeason = e.target.value;
        render(userObj());
      }
    });
  }

  function revealPlayerShell(host, box) {
    var group = document.getElementById('user-dossier-view-group');
    if (group) {
      group.hidden = false;
      group.removeAttribute('hidden');
      group.style.setProperty('display', 'block', 'important');
      group.style.setProperty('visibility', 'visible', 'important');
      group.style.setProperty('opacity', '1', 'important');
      group.classList.add('is-player-area');
      group.classList.remove('is-staff-area', 'is-tifoso-area', 'is-notifs-area');
    }
    var portal = document.getElementById('user-dossier-portal');
    if (portal) {
      portal.hidden = false;
      portal.removeAttribute('hidden');
      portal.style.setProperty('display', 'block', 'important');
      portal.style.setProperty('visibility', 'visible', 'important');
      portal.style.setProperty('opacity', '1', 'important');
      portal.classList.add('is-player-area');
      portal.classList.remove('is-staff-area', 'is-tifoso-area', 'is-notifs-area');
    }
    if (host) {
      host.hidden = false;
      host.removeAttribute('hidden');
      host.classList.add('es-pd-on');
      host.style.setProperty('display', 'block', 'important');
      host.style.setProperty('visibility', 'visible', 'important');
      host.style.setProperty('opacity', '1', 'important');
    }
    if (box) {
      box.hidden = false;
      box.removeAttribute('hidden');
      box.style.setProperty('display', 'grid', 'important');
      box.style.setProperty('visibility', 'visible', 'important');
      box.style.setProperty('opacity', '1', 'important');
    }
  }

  function render(user) {
    user = user || userObj();
    if (window.applyStaffIdentity) {
      try { user = window.applyStaffIdentity(user) || user; } catch (_) {}
    }
    if (window.isPlayerSiteRole && !window.isPlayerSiteRole(user)) return;
    if (typeof window.unmountAllRoleDashboards === 'function') {
      try { window.unmountAllRoleDashboards('es-pd'); } catch (_) {}
    }

    var host = document.getElementById('es-player-profile');
    if (!host) return;
    var box = document.getElementById('es-pd');
    if (!box) {
      box = document.createElement('div');
      box.id = 'es-pd';
      box.className = 'es-pd';
      host.insertBefore(box, host.firstChild);
    }
    try {
      box.innerHTML = html(user);
    } catch (err) {
      console.error('EliseePlayerDash html', err);
      box.innerHTML = '<div class="es-pd-body"><div class="es-pd-head"><h1>Elisee Scout — Profilo atleta</h1></div></div>';
    }
    revealPlayerShell(host, box);
    try { window.scrollTo(0, 0); } catch (_) {}

    for (var i = 0; i < host.children.length; i++) {
      var child = host.children[i];
      if (child.id !== 'es-pd') {
        child.style.setProperty('display', 'none', 'important');
        child.setAttribute('hidden', '');
      }
    }

    var staffHost = document.getElementById('es-staff-profile');
    if (staffHost) { staffHost.hidden = true; staffHost.style.setProperty('display', 'none', 'important'); }
    var tifosoHost = document.getElementById('es-tifoso-profile');
    if (tifosoHost) { tifosoHost.hidden = true; tifosoHost.style.setProperty('display', 'none', 'important'); }
    var giornHost = document.getElementById('es-giorn-profile');
    if (giornHost) { giornHost.hidden = true; giornHost.style.setProperty('display', 'none', 'important'); }
    var legacyHost = document.getElementById('dossier-legacy');
    if (legacyHost) { legacyHost.hidden = true; legacyHost.style.setProperty('display', 'none', 'important'); }
    var notifsHost = document.getElementById('es-user-notifs');
    if (notifsHost) { notifsHost.hidden = true; notifsHost.style.setProperty('display', 'none', 'important'); }

    bind(host);
    revealPlayerShell(host, box);
    if (window.EliseePlayerCard && typeof window.EliseePlayerCard.mountDash === 'function') {
      try { window.EliseePlayerCard.mountDash(box, user); } catch (_) {}
    }
    updateRequestsUI(box);
  }

  window.EliseePlayerDash = { 
    render: render,
    setSeason: function (s) {
      if (SEASON_DATASETS[s]) {
        currentSeason = s;
        render(userObj());
      }
    },
    getSeason: function () { return currentSeason; }
  };

  document.addEventListener('elisee:view-changed', function (e) {
    var d = e && e.detail;
    if (!d) return;
    if (d.view === 'user-dossier') {
      try {
        var u = userObj();
        if (window.isPlayerSiteRole && window.isPlayerSiteRole(u)) render(u);
      } catch (_) {}
    }
  });
})();
