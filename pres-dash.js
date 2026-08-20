/* Dashboard Presidenza — area staff Presidente */
(function () {
  var AXES = [
    'Stabilità Finanziaria', 'Progetto Sportivo', 'Rapporti Media', 'Gestione Stakeholder',
    'Investimenti Infrastructure', 'Consenso Interno', 'Visione a Lungo Termine', 'Reputazione Istituzionale'
  ];
  var V2025 = [85, 90, 94, 87, 78, 92, 91, 89];
  var V2023 = [70, 78, 80, 74, 62, 81, 79, 76];

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function userObj() {
    try { return JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {}; } catch (_) { return {}; }
  }
  function isPres(u) {
    u = u || userObj();
    var blob = [u.staffRole, u.ruoloDettagliato, u.ruolo, u.role, u.staffProfile && u.staffProfile.fieldRole]
      .filter(Boolean).join(' ').toLowerCase();
    return /presidente|presidenza/.test(blob);
  }
  function presName(u) {
    return [u.nome, u.cognome].filter(Boolean).join(' ').trim() || u.username || 'Presidente';
  }
  function initials(name) {
    var p = String(name || 'PR').trim().split(/\s+/);
    return ((p[0] || 'P').charAt(0) + (p[1] || p[0] || 'R').charAt(0)).toUpperCase();
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
    var cx = 220, cy = 210, r = 150, n = AXES.length;
    var html = '<svg viewBox="0 0 440 430" role="img" aria-label="Analisi governance societaria">';
    html += wedge(cx, cy, r, -Math.PI / 2, 0, 'rgba(248,113,113,0.18)');
    html += wedge(cx, cy, r, 0, Math.PI / 2, 'rgba(250,204,21,0.16)');
    html += wedge(cx, cy, r, Math.PI / 2, Math.PI, 'rgba(74,222,128,0.14)');
    html += wedge(cx, cy, r, Math.PI, Math.PI * 1.5, 'rgba(56,189,248,0.16)');
    for (var ring = 1; ring <= 5; ring++) {
      html += '<polygon points="' + poly(cx, cy, r, AXES.map(function () { return ring * 20; })) +
        '" fill="none" stroke="rgba(148,163,184,0.22)" stroke-width="1"/>';
    }
    for (var i = 0; i < n; i++) {
      var e = polar(cx, cy, r, i, n, 100);
      html += '<line x1="' + cx + '" y1="' + cy + '" x2="' + e[0].toFixed(1) + '" y2="' + e[1].toFixed(1) +
        '" stroke="rgba(148,163,184,0.2)"/>';
      var lab = polar(cx, cy, r + 26, i, n, 100);
      html += '<text x="' + lab[0].toFixed(1) + '" y="' + lab[1].toFixed(1) +
        '" text-anchor="middle" dominant-baseline="middle" fill="#94a3b8" font-size="9">' +
        esc(AXES[i]) + ' ' + V2025[i] + '%</text>';
    }
    html += '<polygon points="' + poly(cx, cy, r, V2023) + '" fill="rgba(148,163,184,0.12)" stroke="#64748b" stroke-width="1.5"/>';
    html += '<polygon points="' + poly(cx, cy, r, V2025) + '" fill="rgba(56,189,248,0.12)" stroke="#38bdf8" stroke-width="2"/>';
    html += '</svg>';
    return html;
  }
  function spark(values, color) {
    var w = 120, h = 36, max = Math.max.apply(null, values), min = Math.min.apply(null, values);
    var pts = values.map(function (v, i) {
      var x = (i / (values.length - 1)) * w;
      var y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
      return x.toFixed(1) + ',' + y.toFixed(1);
    }).join(' ');
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" width="100%" height="36"><polyline fill="none" stroke="' +
      color + '" stroke-width="2" points="' + pts + '"/></svg>';
  }
  function trendSvg() {
    var series = {
      '2023': [60, 66, 70, 72, 76, 80],
      '2024': [72, 74, 80, 84, 88, 90],
      '2025': [78, 84, 88, 91, 94, 97]
    };
    var cols = { '2023': '#38bdf8', '2024': '#4ade80', '2025': '#facc15' };
    var w = 240, h = 90;
    var html = '<svg viewBox="0 0 ' + w + ' ' + h + '" width="100%" height="90">';
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
  function ico(d) {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">' + d + '</svg>';
  }
  function hideOthers() {
    var cd = document.getElementById('es-cd');
    var dsd = document.getElementById('es-dsd');
    var mad = document.getElementById('es-mad');
    var md = document.getElementById('es-md');
    var od = document.getElementById('es-od');
    var tmd = document.getElementById('es-tmd');
    if (cd) cd.hidden = true;
    if (dsd) dsd.hidden = true;
    if (mad) mad.hidden = true;
    if (md) md.hidden = true;
    if (od) od.hidden = true;
    if (tmd) tmd.hidden = true;
    var g = document.getElementById('user-dossier-view-group');
    if (g) { g.classList.remove('is-coach-dash'); g.classList.remove('is-ds-dash'); g.classList.remove('is-ma-dash'); g.classList.remove('is-med-dash'); g.classList.remove('is-obs-dash'); g.classList.remove('is-tm-dash'); }
  }

  function html(user) {
    var name = presName(user);
    var ph = photoOf(user);
    var ava = ph
      ? '<img src="' + esc(ph) + '" alt="">'
      : '<div class="es-pd-ph">' + esc(initials(name)) + '</div>';
    return '<aside class="es-pd-rail">' +
      '<button type="button" data-pr="home" title="Home">' + ico('<path d="M4 10.5 12 4l8 6.5V20H4z"/>') + '</button>' +
      '<button type="button" class="is-on" data-pr="dash" title="Dashboard">' + ico('<circle cx="12" cy="8" r="3"/><path d="M5 20c1.5-4 4-6 7-6s5.5 2 7 6"/>') + '</button>' +
      '<button type="button" data-pr="album" title="Album">' + ico('<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 15l4-3 3 2 5-5 4 4"/>') + '</button>' +
      '<button type="button" data-pr="msgs" title="Messaggi">' + ico('<path d="M4 6h16v12H4z"/><path d="m4 7 8 6 8-6"/>') + '</button>' +
      '<button type="button" class="es-pd-rail-end" data-pr="edit" title="Anagrafica">' + ico('<circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>') + '</button>' +
      '</aside><div class="es-pd-body">' +
      '<div class="es-pd-head"><h1>Elisee Scout — Dashboard Presidenza</h1>' +
      '<strong>Presidente: ' + esc(name.toUpperCase()) + '</strong></div>' +
      '<div class="es-pd-grid">' +

      '<section class="es-pd-card es-pd-indice"><h2>Profilo Presidente</h2>' +
      '<div class="es-pd-who">' + ava + '<div><b style="color:#fff">' + esc(name) + '</b>' +
      '<div style="font-size:0.72rem;color:#94a3b8">Presidenza</div></div></div>' +
      '<div class="es-pd-metric"><span>Visione societaria</span><b>92%</b></div>' +
      '<div class="es-pd-metric"><span>Solidità finanziaria</span><b>95%</b></div>' +
      '<div class="es-pd-metric"><span>Rapporti istituzionali</span><b>88%</b></div>' +
      '<div class="es-pd-metric"><span>Gestione crisi</span><b>90%</b></div>' +
      '<div class="es-pd-metric"><span>Consenso tifoseria</span><b>93%</b></div></section>' +

      '<section class="es-pd-card es-pd-radar">' +
      '<div class="es-pd-radar-tools"><span>Seleziona dati radar</span><span>Analisi governance societaria</span></div>' +
      radarSvg() + '</section>' +

      '<section class="es-pd-card es-pd-comply"><h2>Verifica &amp; Compliance societaria</h2>' +
      '<div class="es-pd-ok"><span>Licenza UEFA / FIGC</span><b>100%</b></div>' +
      '<div class="es-pd-ok"><span>Fair Play finanziario</span><b>100%</b></div>' +
      '<div class="es-pd-ok"><span>Conformità normativa</span><b>100%</b></div>' +
      '<div class="es-pd-ok"><span>Tutela minori (ID)</span><b>100%</b></div>' +
      '<div class="es-pd-ok"><span>Profilo societario validato</span><b>100%</b></div></section>' +

      '<section class="es-pd-card es-pd-storico"><h2>Andamento societario</h2>' +
      '<div class="es-pd-sparks">' +
      '<figure>' + spark([45, 52, 50, 62, 74, 82, 90], '#38bdf8') + '<figcaption>Fatturato</figcaption></figure>' +
      '<figure>' + spark([30, 36, 44, 50, 60, 72, 84], '#4ade80') + '<figcaption>Investimenti</figcaption></figure>' +
      '<figure>' + spark([40, 48, 55, 52, 66, 75, 86], '#facc15') + '<figcaption>Risultati sportivi</figcaption></figure>' +
      '<figure>' + spark([50, 54, 58, 64, 70, 78, 88], '#22d3ee') + '<figcaption>Stagione</figcaption></figure>' +
      '</div></section>' +

      '<section class="es-pd-card es-pd-mercato"><h2>Indice di valore del club</h2>' +
      '<p class="es-pr-euro">€ 750.000.000 <small>+8,2%</small></p>' +
      '<div class="es-pd-mrow"><span>Valore stimato club</span><b>Attivo</b></div>' +
      '<div class="es-pd-mrow"><span>Trend di crescita</span><b>+8,2%</b></div>' +
      '<div class="es-pd-mrow"><span>Investimenti in corso</span><b>3</b></div>' +
      '<div class="es-pd-mrow"><span>Scadenza mandato</span><b>30/06/2028</b></div>' +
      '<div class="es-pd-mrow"><span>Livello di fiducia</span><b>Alto</b></div></section>' +

      '<section class="es-pd-card es-pd-registro"><h2>Registro decisioni</h2>' +
      '<table class="es-pd-table"><thead><tr><th>Soggetto</th><th>Decisione</th><th>Ambito</th><th></th></tr></thead><tbody>' +
      '<tr><td>vs. Notaresco</td><td>Approvazione</td><td>Budget</td><td><i class="es-pd-dot g"></i></td></tr>' +
      '<tr><td>vs. Vastese</td><td>Nomina CEO</td><td>Governance</td><td><i class="es-pd-dot g"></i></td></tr>' +
      '<tr><td>vs. Chieti</td><td>Governance</td><td>€ 1M</td><td><i class="es-pd-dot g"></i></td></tr>' +
      '<tr><td>vs. Termoli</td><td>Rinnovo</td><td>€ 0,5M</td><td><i class="es-pd-dot g"></i></td></tr>' +
      '<tr><td>vs. Campobasso</td><td>Acquisto</td><td>€ 2M</td><td><i class="es-pd-dot g"></i></td></tr>' +
      '<tr><td>vs. Castelfidardo</td><td>Progetto</td><td>€ 1M</td><td><i class="es-pd-dot y"></i></td></tr>' +
      '</tbody></table></section>' +

      '<section class="es-pd-card es-pd-trend"><h2>2023 vs 2024 vs 2025</h2>' +
      trendSvg() +
      '<button type="button" class="es-pd-edit" data-pr="edit">Modifica anagrafica</button>' +
      '</section>' +
      '</div></div>';
  }

  function bind(host) {
    if (!host || host.dataset.prBound === '1') return;
    host.dataset.prBound = '1';
    host.addEventListener('click', function (e) {
      var b = e.target.closest('[data-pr]');
      if (!b) return;
      var k = b.getAttribute('data-pr');
      if (k === 'home' && window.switchView) window.switchView('home', '#hero');
      if (k === 'album' && window.openChiSegui) window.openChiSegui();
      if (k === 'msgs' && window.openUserMessages) window.openUserMessages();
      if (k === 'edit') {
        host.classList.remove('es-pres-on');
        var dash = document.getElementById('es-prd');
        if (dash) dash.hidden = true;
        var g = document.getElementById('user-dossier-view-group');
        if (g) g.classList.remove('is-pres-dash');
      }
    });
  }

  function render(user) {
    user = user || userObj();
    if (!isPres(user)) return;
    hideOthers();
    var host = document.getElementById('es-staff-profile');
    var group = document.getElementById('user-dossier-view-group');
    if (!host) return;
    var box = document.getElementById('es-prd');
    if (!box) {
      box = document.createElement('div');
      box.id = 'es-prd';
      box.className = 'es-pd';
      host.insertBefore(box, host.firstChild);
    }
    box.innerHTML = html(user);
    box.hidden = false;
    host.classList.add('es-pres-on');
    host.classList.remove('es-pd-on', 'es-ds-on', 'es-ma-on', 'es-med-on', 'es-obs-on', 'es-tm-on');
    if (group) {
      group.classList.add('is-pres-dash');
      group.classList.remove('is-coach-dash', 'is-ds-dash', 'is-ma-dash', 'is-med-dash', 'is-obs-dash', 'is-tm-dash');
    }
    bind(host);
  }

  window.EliseePresDash = { render: render, isPres: isPres };

  document.addEventListener('elisee:view-changed', function (e) {
    var d = e && e.detail;
    if (d && d.view === 'user-dossier') {
      try {
        var u = userObj();
        if (isPres(u)) render(u);
      } catch (_) {}
    }
  });
})();
