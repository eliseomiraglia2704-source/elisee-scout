/* Dashboard Osservatore — Scout / Osservatore */
(function () {
  var AXES = [
    'Precisione Valutazioni', 'Partite Visionate', 'Segnalazioni Convertite', 'Copertura Categorie Giovanili',
    'Analisi Video', 'Tempestività Report', 'Rete Contatti Procuratori', 'Conoscenza Mercato'
  ];
  var V2025 = [92, 90, 85, 88, 91, 87, 93, 94];
  var V2023 = [78, 76, 70, 74, 79, 73, 80, 81];

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function userObj() {
    try { return JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {}; } catch (_) { return {}; }
  }
  function isObs(u) {
    u = u || userObj();
    var blob = [u.staffRole, u.ruoloDettagliato, u.ruolo, u.role, u.staffProfile && u.staffProfile.fieldRole]
      .filter(Boolean).join(' ').toLowerCase();
    return /scout\s*\/\s*osservatore|\bosservatore\b|\bscout\b/.test(blob);
  }
  function obsName(u) {
    return [u.nome, u.cognome].filter(Boolean).join(' ').trim() || u.username || 'Osservatore';
  }
  function initials(name) {
    var p = String(name || 'OS').trim().split(/\s+/);
    return ((p[0] || 'O').charAt(0) + (p[1] || p[0] || 'S').charAt(0)).toUpperCase();
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
    var html = '<svg viewBox="0 0 440 430" role="img" aria-label="Analisi attività di scouting">';
    html += wedge(cx, cy, r, -Math.PI / 2, 0, 'rgba(74,222,128,0.16)');
    html += wedge(cx, cy, r, 0, Math.PI / 2, 'rgba(248,113,113,0.18)');
    html += wedge(cx, cy, r, Math.PI / 2, Math.PI, 'rgba(250,204,21,0.16)');
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
      '2023': [58, 64, 68, 72, 76, 80],
      '2024': [70, 74, 78, 82, 86, 90],
      '2025': [78, 82, 86, 90, 94, 97]
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
    ['es-cd', 'es-dsd', 'es-prd', 'es-vd', 'es-fd', 'es-mad', 'es-md'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.hidden = true;
    });
    var g = document.getElementById('user-dossier-view-group');
    if (g) g.classList.remove('is-coach-dash', 'is-ds-dash', 'is-pres-dash', 'is-vice-dash', 'is-fisio-dash', 'is-ma-dash', 'is-med-dash');
  }

  function html(user) {
    var name = obsName(user);
    var ph = photoOf(user);
    var ava = ph
      ? '<img src="' + esc(ph) + '" alt="">'
      : '<div class="es-pd-ph">' + esc(initials(name)) + '</div>';
    return '<aside class="es-pd-rail">' +
      '<button type="button" data-ob="home" title="Home">' + ico('<path d="M4 10.5 12 4l8 6.5V20H4z"/>') + '</button>' +
      '<button type="button" class="is-on" data-ob="dash" title="Dashboard">' + ico('<circle cx="12" cy="8" r="3"/><path d="M5 20c1.5-4 4-6 7-6s5.5 2 7 6"/>') + '</button>' +
      '<button type="button" data-ob="secret" title="Secret List">' + ico('<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 15l4-3 3 2 5-5 4 4"/>') + '</button>' +
      '<button type="button" data-ob="msgs" title="Messaggi">' + ico('<path d="M4 6h16v12H4z"/><path d="m4 7 8 6 8-6"/>') + '</button>' +
      '<button type="button" class="es-pd-rail-end" data-ob="edit" title="Anagrafica">' + ico('<circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>') + '</button>' +
      '</aside><div class="es-pd-body">' +
      '<div class="es-pd-head"><h1>Elisee Scout — Dashboard Osservatore</h1>' +
      '<strong>Osservatore: ' + esc(name.toUpperCase()) + '</strong></div>' +
      '<div class="es-pd-grid">' +

      '<section class="es-pd-card es-pd-indice"><h2>Profilo Osservatore</h2>' +
      '<div class="es-pd-who">' + ava + '<div><b style="color:#fff">' + esc(name) + '</b>' +
      '<div style="font-size:0.72rem;color:#94a3b8">Scout / Osservatore</div></div></div>' +
      '<div class="es-pd-metric"><span>Capacità di valutazione</span><b>92%</b></div>' +
      '<div class="es-pd-metric"><span>Copertura territoriale</span><b>85%</b></div>' +
      '<div class="es-pd-metric"><span>Precisione segnalazioni</span><b>88%</b></div>' +
      '<div class="es-pd-metric"><span>Rete di contatti</span><b>94%</b></div>' +
      '<div class="es-pd-metric"><span>Affidabilità report</span><b>91%</b></div></section>' +

      '<section class="es-pd-card es-pd-radar">' +
      '<div class="es-pd-radar-tools"><span>Seleziona dati radar</span><span>Analisi attività di scouting</span></div>' +
      radarSvg() + '</section>' +

      '<section class="es-pd-card es-pd-comply"><h2>Verifica &amp; Compliance Osservatore</h2>' +
      '<div class="es-pd-ok"><span>Tessera FIGC Osservatore</span><b>100%</b></div>' +
      '<div class="es-pd-ok"><span>Corso Scouting completo</span><b>100%</b></div>' +
      '<div class="es-pd-ok"><span>Tutela minori (ID)</span><b>100%</b></div>' +
      '<div class="es-pd-ok"><span>Conformità normativa trasferimenti</span><b>100%</b></div>' +
      '<div class="es-pd-ok"><span>Verifica identità</span><b>100%</b></div></section>' +

      '<section class="es-pd-card es-pd-storico"><h2>Andamento scouting</h2>' +
      '<div class="es-pd-sparks">' +
      '<figure>' + spark([32, 40, 48, 55, 64, 74, 86], '#38bdf8') + '<figcaption>Segnalazioni confermate</figcaption></figure>' +
      '<figure>' + spark([28, 36, 44, 52, 60, 72, 84], '#4ade80') + '<figcaption>Giocatori segnalati</figcaption></figure>' +
      '<figure>' + spark([20, 28, 32, 40, 48, 58, 70], '#facc15') + '<figcaption>Partite visionate</figcaption></figure>' +
      '<figure>' + spark([48, 55, 60, 66, 74, 82, 90], '#22d3ee') + '<figcaption>Stagione</figcaption></figure>' +
      '</div></section>' +

      '<section class="es-pd-card es-pd-mercato"><h2>Indice di efficacia scouting</h2>' +
      '<p class="es-obs-grade">8,5/10 <small>+5,5%</small></p>' +
      '<div class="es-pd-mrow"><span>Valutazione direzione sportiva</span><b>Ottima</b></div>' +
      '<div class="es-pd-mrow"><span>Trend segnalazioni confermate</span><b>Crescente</b></div>' +
      '<div class="es-pd-mrow"><span>Richieste di approfondimento</span><b>5</b></div>' +
      '<div class="es-pd-mrow"><span>Scadenza contratto</span><b>30/06/2028</b></div>' +
      '<div class="es-pd-mrow"><span>Trattative aperte</span><b>Nessuna</b></div></section>' +

      '<section class="es-pd-card es-pd-registro"><h2>Registro segnalazioni</h2>' +
      '<table class="es-pd-table"><thead><tr><th>Giocatore</th><th>Club</th><th>Cat.</th><th>Esito</th></tr></thead><tbody>' +
      '<tr><td>vs. Notaresco</td><td>Notaresco</td><td>U19</td><td>Positivo <i class="es-pd-dot g"></i></td></tr>' +
      '<tr><td>vs. Vastese</td><td>Vastese</td><td>U19</td><td>Positivo <i class="es-pd-dot g"></i></td></tr>' +
      '<tr><td>vs. Chieti</td><td>Chieti</td><td>U17</td><td>Molto positivo <i class="es-pd-dot g"></i></td></tr>' +
      '<tr><td>vs. Termoli</td><td>Chieti</td><td>U17</td><td>Molto positivo <i class="es-pd-dot g"></i></td></tr>' +
      '<tr><td>vs. Campobasso</td><td>Campobasso</td><td>U19</td><td>Positivo <i class="es-pd-dot g"></i></td></tr>' +
      '<tr><td>vs. Castelfidardo</td><td>Castelfidardo</td><td>U18</td><td>In valutazione <i class="es-pd-dot y"></i></td></tr>' +
      '</tbody></table></section>' +

      '<section class="es-pd-card es-pd-trend"><h2>2023 vs 2024 vs 2025</h2>' +
      trendSvg() +
      '<button type="button" class="es-pd-edit" data-ob="edit">Modifica anagrafica</button>' +
      '</section>' +
      '</div></div>';
  }

  function bind(host) {
    if (!host || host.dataset.obBound === '1') return;
    host.dataset.obBound = '1';
    host.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ob]');
      if (!b) return;
      var k = b.getAttribute('data-ob');
      if (k === 'home' && window.switchView) window.switchView('home', '#hero');
      if (k === 'secret' && window.openSecretList) window.openSecretList();
      if (k === 'msgs' && window.openUserMessages) window.openUserMessages();
      if (k === 'edit') {
        host.classList.remove('es-obs-on');
        var dash = document.getElementById('es-od');
        if (dash) dash.hidden = true;
        var g = document.getElementById('user-dossier-view-group');
        if (g) g.classList.remove('is-obs-dash');
      }
    });
  }

  function render(user) {
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
    box.innerHTML = html(user);
    box.hidden = false;
    host.classList.add('es-obs-on');
    host.classList.remove('es-pd-on', 'es-ds-on', 'es-pres-on', 'es-vice-on', 'es-fisio-on', 'es-ma-on', 'es-med-on');
    if (group) {
      group.classList.add('is-obs-dash');
      group.classList.remove('is-coach-dash', 'is-ds-dash', 'is-pres-dash', 'is-vice-dash', 'is-fisio-dash', 'is-ma-dash', 'is-med-dash');
    }
    bind(host);
  }

  window.EliseeObsDash = { render: render, isObs: isObs };

  document.addEventListener('elisee:view-changed', function (e) {
    var d = e && e.detail;
    if (d && d.view === 'user-dossier') {
      try {
        var u = userObj();
        if (isObs(u)) render(u);
      } catch (_) {}
    }
  });
})();
