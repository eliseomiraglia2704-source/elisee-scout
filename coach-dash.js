/* Dashboard Discorso Allenatore — area staff Allenatore */
(function () {
  var AXES = [
    'Tono', 'Chiarezza Tattica', 'Coinvolgimento Emotivo', 'Focus Obiettivi',
    'Gestione Tempo', 'Linguaggio del Corpo', 'Reazione Squadra', 'Efficacia Messaggio'
  ];
  var V2025 = [85, 90, 94, 87, 78, 92, 91, 89];
  var V2023 = [74, 80, 82, 76, 68, 81, 79, 77];

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function userObj() {
    try { return JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {}; } catch (_) { return {}; }
  }
  function isCoach(u) {
    u = u || userObj();
    var blob = [u.staffRole, u.ruoloDettagliato, u.ruolo, u.role, u.staffProfile && u.staffProfile.fieldRole]
      .filter(Boolean).join(' ').toLowerCase();
    if (/in seconda|vice allenatore/.test(blob)) return false;
    return /allenatore/.test(blob);
  }
  function coachName(u) {
    return [u.nome, u.cognome].filter(Boolean).join(' ').trim() || u.username || 'Allenatore';
  }
  function initials(name) {
    var p = String(name || 'AL').trim().split(/\s+/);
    return ((p[0] || 'A').charAt(0) + (p[1] || p[0] || 'L').charAt(0)).toUpperCase();
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
    var html = '<svg viewBox="0 0 440 430" role="img" aria-label="Analisi discorso pre-partita">';
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
        '" text-anchor="middle" dominant-baseline="middle" fill="#94a3b8" font-size="10">' +
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
      '2023': [64, 70, 68, 74, 76, 80],
      '2024': [72, 74, 78, 82, 85, 88],
      '2025': [80, 84, 86, 90, 91, 94]
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

  function html(user) {
    var name = coachName(user);
    var ph = photoOf(user);
    var ava = ph
      ? '<img src="' + esc(ph) + '" alt="">'
      : '<div class="es-pd-ph">' + esc(initials(name)) + '</div>';
    return '<aside class="es-pd-rail">' +
      '<button type="button" data-cd="home" title="Home">' + ico('<path d="M4 10.5 12 4l8 6.5V20H4z"/>') + '</button>' +
      '<button type="button" class="is-on" data-cd="dash" title="Dashboard">' + ico('<circle cx="12" cy="8" r="3"/><path d="M5 20c1.5-4 4-6 7-6s5.5 2 7 6"/>') + '</button>' +
      '<button type="button" data-cd="album" title="Album">' + ico('<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 15l4-3 3 2 5-5 4 4"/>') + '</button>' +
      '<button type="button" data-cd="msgs" title="Messaggi">' + ico('<path d="M4 6h16v12H4z"/><path d="m4 7 8 6 8-6"/>') + '</button>' +
      '<button type="button" class="es-pd-rail-end" data-cd="edit" title="Anagrafica">' + ico('<circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>') + '</button>' +
      '</aside><div class="es-pd-body">' +
      '<div class="es-pd-head"><h1>Elisee Scout — Discorso allenatore</h1>' +
      '<strong>Allenatore: ' + esc(name.toUpperCase()) + '</strong></div>' +
      '<div class="es-pd-grid">' +

      '<section class="es-pd-card es-pd-indice"><h2>Profilo Allenatore</h2>' +
      '<div class="es-pd-who">' + ava + '<div><b style="color:#fff">' + esc(name) + '</b>' +
      '<div style="font-size:0.72rem;color:#94a3b8">Staff tecnico</div></div></div>' +
      '<div class="es-pd-metric"><span>Stile di comunicazione</span><b>92%</b></div>' +
      '<div class="es-pd-metric"><span>Motivazione squadra</span><b>95%</b></div>' +
      '<div class="es-pd-metric"><span>Gestione pressione</span><b>88%</b></div>' +
      '<div class="es-pd-metric"><span>Chiarezza tattica</span><b>90%</b></div>' +
      '<div class="es-pd-metric"><span>Coinvolgimento giocatori</span><b>93%</b></div></section>' +

      '<section class="es-pd-card es-pd-radar">' +
      '<div class="es-pd-radar-tools"><span>Seleziona dati radar</span><span>Analisi discorso pre-partita</span></div>' +
      radarSvg() + '</section>' +

      '<section class="es-pd-card es-pd-comply"><h2>Verifica &amp; Compliance Staff Tecnico</h2>' +
      '<div class="es-pd-ok"><span>Patentino UEFA Pro</span><b>100%</b></div>' +
      '<div class="es-pd-ok"><span>Corso primo soccorso</span><b>100%</b></div>' +
      '<div class="es-pd-ok"><span>Tutela minori (ID)</span><b>100%</b></div>' +
      '<div class="es-pd-ok"><span>Idoneità tecnica</span><b>Valida</b></div>' +
      '<div class="es-pd-ok"><span>Profilo validato</span><b>100%</b></div></section>' +

      '<section class="es-pd-card es-pd-storico"><h2>Andamento discorsi</h2>' +
      '<div class="es-pd-sparks">' +
      '<figure>' + spark([48, 52, 50, 61, 70, 78, 86], '#38bdf8') + '<figcaption>Partita</figcaption></figure>' +
      '<figure>' + spark([40, 55, 58, 62, 71, 80, 88], '#4ade80') + '<figcaption>Stagione</figcaption></figure>' +
      '<figure>' + spark([35, 44, 52, 50, 63, 72, 81], '#facc15') + '<figcaption>Reazione</figcaption></figure>' +
      '<figure>' + spark([50, 48, 60, 64, 70, 76, 84], '#22d3ee') + '<figcaption>Tono</figcaption></figure>' +
      '</div></section>' +

      '<section class="es-pd-card es-pd-mercato"><h2>Indice di efficacia</h2>' +
      '<p class="es-cd-grade">A+</p>' +
      '<div class="es-pd-mrow"><span>Valutazione staff</span><b>Ottima</b></div>' +
      '<div class="es-pd-mrow"><span>Indice di visibilità</span><b>90%</b></div>' +
      '<div class="es-pd-mrow"><span>Trend fiducia squadra</span><b>Crescente</b></div>' +
      '<div class="es-pd-mrow"><span>Richieste rinnovo</span><b>Crescente</b></div>' +
      '<div class="es-pd-mrow"><span>Indice di reattività</span><b>Alto</b></div>' +
      '<div class="es-pd-mrow"><span>Richiesta di mercato</span><b>80%</b></div></section>' +

      '<section class="es-pd-card es-pd-registro"><h2>Registro discorsi</h2>' +
      '<table class="es-pd-table"><thead><tr><th>Partita</th><th>Durata</th><th>Tono</th><th></th></tr></thead><tbody>' +
      '<tr><td>vs. Notaresco</td><td>15 min</td><td>Motivazionale</td><td><i class="es-pd-dot g"></i></td></tr>' +
      '<tr><td>vs. Vastese</td><td>12 min</td><td>Tattico</td><td><i class="es-pd-dot g"></i></td></tr>' +
      '<tr><td>vs. Chieti</td><td>13 min</td><td>Concentrata</td><td><i class="es-pd-dot g"></i></td></tr>' +
      '<tr><td>vs. Termoli</td><td>12 min</td><td>Tattico</td><td><i class="es-pd-dot g"></i></td></tr>' +
      '<tr><td>vs. Campobasso</td><td>9 min</td><td>Reattiva</td><td><i class="es-pd-dot y"></i></td></tr>' +
      '<tr><td>vs. Castelfidardo</td><td>9 min</td><td>Reattiva</td><td><i class="es-pd-dot g"></i></td></tr>' +
      '</tbody></table></section>' +

      '<section class="es-pd-card es-pd-trend"><h2>2023 vs 2024 vs 2025</h2>' +
      trendSvg() +
      '<button type="button" class="es-pd-edit" data-cd="edit">Modifica anagrafica</button>' +
      '</section>' +
      '</div></div>';
  }

  function bind(host) {
    if (!host || host.dataset.cdBound === '1') return;
    host.dataset.cdBound = '1';
    host.addEventListener('click', function (e) {
      var b = e.target.closest('[data-cd]');
      if (!b) return;
      var k = b.getAttribute('data-cd');
      if (k === 'home' && window.switchView) window.switchView('home', '#hero');
      if (k === 'album' && window.openChiSegui) window.openChiSegui();
      if (k === 'msgs' && window.openUserMessages) window.openUserMessages();
      if (k === 'edit') {
        host.classList.remove('es-pd-on');
        var dash = document.getElementById('es-cd');
        if (dash) dash.hidden = true;
        var g = document.getElementById('user-dossier-view-group');
        if (g) g.classList.remove('is-coach-dash');
      }
    });
  }

  function render(user) {
    user = user || userObj();
    if (!isCoach(user)) return;
    var host = document.getElementById('es-staff-profile');
    var group = document.getElementById('user-dossier-view-group');
    if (!host) return;
    var box = document.getElementById('es-cd');
    if (!box) {
      box = document.createElement('div');
      box.id = 'es-cd';
      box.className = 'es-pd';
      host.insertBefore(box, host.firstChild);
    }
    var vd = document.getElementById('es-vd');
    if (vd) vd.hidden = true;
    var mad = document.getElementById('es-mad');
    if (mad) mad.hidden = true;
    var md = document.getElementById('es-md');
    if (md) md.hidden = true;
    var od = document.getElementById('es-od');
    if (od) od.hidden = true;
    var tmd = document.getElementById('es-tmd');
    if (tmd) tmd.hidden = true;
    var gk = document.getElementById('es-gk');
    if (gk) gk.hidden = true;
    var atd = document.getElementById('es-atd');
    if (atd) atd.hidden = true;
    var yg = document.getElementById('es-yg');
    if (yg) yg.hidden = true;
    var dg = document.getElementById('es-dg');
    if (dg) dg.hidden = true;
    var ag = document.getElementById('es-ag');
    if (ag) ag.hidden = true;
    var mk = document.getElementById('es-mk');
    if (mk) mk.hidden = true;
    var prb = document.getElementById('es-pr');
    if (prb) prb.hidden = true;
    box.innerHTML = html(user);
    box.hidden = false;
    host.classList.add('es-pd-on');
    host.classList.remove('es-vice-on', 'es-ma-on', 'es-med-on', 'es-obs-on', 'es-tm-on', 'es-gk-on', 'es-at-on', 'es-yg-on', 'es-dg-on');
    if (group) {
      group.classList.add('is-coach-dash');
      group.classList.remove('is-vice-dash', 'is-ma-dash', 'is-med-dash', 'is-obs-dash', 'is-tm-dash', 'is-gk-dash', 'is-at-dash', 'is-yg-dash', 'is-dg-dash');
    }
    bind(host);
  }

  window.EliseeCoachDash = { render: render, isCoach: isCoach };

  document.addEventListener('elisee:view-changed', function (e) {
    var d = e && e.detail;
    if (d && d.view === 'user-dossier') {
      try {
        var u = userObj();
        if (isCoach(u)) render(u);
      } catch (_) {}
    }
  });
})();
