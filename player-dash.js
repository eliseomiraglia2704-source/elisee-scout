/* Dashboard analitica giocatore v3.0 — replica layout screenshot */
(function () {
  var AXES = [
    'Intercettazioni', 'Tackle', 'Duelli Aerei Vinti', 'Precisione Passaggi',
    'Crossing', 'Passaggi Chiave', 'Dribbling Riusciti', 'Scatti',
    'Accelerazioni', 'Recupero', 'Posizionamento', 'Discipline'
  ];
  var V2025 = [92, 88, 79, 91, 85, 76, 93, 88, 92, 95, 90, 87];
  var V2023 = [78, 80, 70, 82, 74, 68, 84, 76, 80, 86, 81, 79];

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
    var html = '<svg viewBox="0 0 440 430" role="img" aria-label="Radar prestazioni">';
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
      var lab = polar(cx, cy, r + 22, i, n, 100);
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
      '2023': [62, 68, 70, 74, 72, 78],
      '2024': [70, 72, 76, 80, 84, 86],
      '2025': [78, 82, 85, 88, 90, 93]
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

  function html(user) {
    var name = playerName(user);
    var ph = photoOf(user);
    var ava = ph
      ? '<img src="' + esc(ph) + '" alt="">'
      : '<div class="es-pd-ph">' + esc(initials(name)) + '</div>';
    var ico = function (d) {
      return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">' + d + '</svg>';
    };
    return '<aside class="es-pd-rail">' +
      '<button type="button" data-pd="home" title="Home">' + ico('<path d="M4 10.5 12 4l8 6.5V20H4z"/>') + '</button>' +
      '<button type="button" class="is-on" data-pd="dash" title="Dashboard">' + ico('<circle cx="12" cy="8" r="3"/><path d="M5 20c1.5-4 4-6 7-6s5.5 2 7 6"/>') + '</button>' +
      '<button type="button" data-pd="album" title="Album">' + ico('<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 15l4-3 3 2 5-5 4 4"/>') + '</button>' +
      '<button type="button" data-pd="msgs" title="Messaggi">' + ico('<path d="M4 6h16v12H4z"/><path d="m4 7 8 6 8-6"/>') + '</button>' +
      '<button type="button" class="es-pd-rail-end" data-pd="edit" title="Anagrafica">' + ico('<circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>') + '</button>' +
      '</aside><div class="es-pd-body">' +
      '<div class="es-pd-head"><h1>Elisee Scout — Dashboard analitica v3.0</h1>' +
      '<strong>Giocatore: ' + esc(name.toUpperCase()) + '</strong></div>' +
      '<div class="es-pd-grid">' +

      '<section class="es-pd-card es-pd-indice"><h2>Indice Atleta</h2>' +
      '<div class="es-pd-who">' + ava + '<div><b style="color:#fff">' + esc(name) + '</b>' +
      '<div style="font-size:0.72rem;color:#94a3b8">' + esc((user.playerProfile && user.playerProfile.fieldRole) || user.ruoloDettagliato || 'Calciatore') + '</div></div></div>' +
      '<div class="es-pd-metric"><span>Compatibilità Club</span><b>90%</b></div>' +
      '<div class="es-pd-metric"><span>Tackle</span><b>90%</b></div>' +
      '<div class="es-pd-metric"><span>Precisione Passaggi</span><b>91%</b></div>' +
      '<div class="es-pd-metric"><span>Passaggi Chiave</span><b>76%</b></div>' +
      '<div class="es-pd-metric"><span>Cross</span><b>75%</b></div></section>' +

      '<section class="es-pd-card es-pd-radar">' +
      '<div class="es-pd-radar-tools"><span>Seleziona dati radar</span><span>Confronto 2023 vs 2025</span></div>' +
      radarSvg() + '</section>' +

      '<section class="es-pd-card es-pd-comply"><h2>Certificazione &amp; Compliance del Club</h2>' +
      '<div class="es-pd-ok"><span>Consenso trattamento dati (GDPR)</span><b>100%</b></div>' +
      '<div class="es-pd-ok"><span>Liberatoria immagine e video</span><b>100%</b></div>' +
      '<div class="es-pd-ok"><span>Verifica tutela minori (ID)</span><b>100%</b></div>' +
      '<div class="es-pd-ok"><span>Idoneità agonistica</span><b>Valida</b></div>' +
      '<div class="es-pd-ok"><span>Profilo validato dal club</span><b>100%</b></div></section>' +

      '<section class="es-pd-card es-pd-storico"><h2>Prestazioni Storiche</h2>' +
      '<div class="es-pd-sparks">' +
      '<figure>' + spark([40, 48, 45, 62, 70, 78, 88], '#38bdf8') + '<figcaption>Compatibilità</figcaption></figure>' +
      '<figure>' + spark([50, 55, 52, 60, 66, 74, 80], '#4ade80') + '<figcaption>Passaggi chiave</figcaption></figure>' +
      '<figure>' + spark([30, 42, 50, 48, 61, 70, 76], '#facc15') + '<figcaption>Tackle</figcaption></figure>' +
      '<figure>' + spark([44, 40, 55, 58, 63, 72, 84], '#22d3ee') + '<figcaption>Spartine</figcaption></figure>' +
      '</div></section>' +

      '<section class="es-pd-card es-pd-mercato"><h2>Indice di mercato</h2>' +
      '<p class="es-pd-euro">€ 150.000 <small>+5,5%</small></p>' +
      '<div class="es-pd-mrow"><span>Indice di visibilità</span><b>90%</b></div>' +
      '<div class="es-pd-mrow"><span>Trend interesse</span><b>Crescente</b></div>' +
      '<div class="es-pd-mrow"><span>Trattative in corso</span><b>3</b></div>' +
      '<div class="es-pd-mrow"><span>Scadenza contratto</span><b>30/06/2026</b></div>' +
      '<div class="es-pd-mrow"><span>Potenziale rivendita</span><b>Alta</b></div>' +
      '<div class="es-pd-mrow"><span>Richiesta di mercato</span><b>80%</b></div></section>' +

      '<section class="es-pd-card es-pd-registro"><h2>Registro</h2>' +
      '<table class="es-pd-table"><thead><tr><th>Partita</th><th>G</th><th>A</th><th>PGB</th><th></th></tr></thead><tbody>' +
      '<tr><td>vs. Notaresco</td><td>1</td><td>0</td><td>8.6</td><td><i class="es-pd-dot g"></i></td></tr>' +
      '<tr><td>vs. Vastese</td><td>0</td><td>1</td><td>7.0</td><td><i class="es-pd-dot g"></i></td></tr>' +
      '<tr><td>vs. Chieti</td><td>0</td><td>0</td><td>6.5</td><td><i class="es-pd-dot y"></i></td></tr>' +
      '<tr><td>vs. Termoli</td><td>10</td><td>1</td><td>9.0</td><td><i class="es-pd-dot g"></i></td></tr>' +
      '<tr><td>vs. Campobasso</td><td>1</td><td>0</td><td>7.0</td><td><i class="es-pd-dot y"></i></td></tr>' +
      '<tr><td>vs. Castelfidardo</td><td>0</td><td>0</td><td>7.5</td><td><i class="es-pd-dot g"></i></td></tr>' +
      '</tbody></table></section>' +

      '<section class="es-pd-card es-pd-trend"><h2>2023 vs 2024 vs 2025</h2>' +
      trendSvg() +
      '<button type="button" class="es-pd-edit" data-pd="edit">Modifica anagrafica</button>' +
      '</section>' +
      '</div></div>';
  }

  function bind(root) {
    if (!root || root.dataset.bound === '1') return;
    root.dataset.bound = '1';
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-pd]');
      if (!b) return;
      var k = b.getAttribute('data-pd');
      if (k === 'home' && window.switchView) window.switchView('home', '#hero');
      if (k === 'album' && window.openChiSegui) window.openChiSegui();
      if (k === 'msgs' && window.openUserMessages) window.openUserMessages();
      if (k === 'edit') {
        root.classList.remove('es-pd-on');
        var dash = document.getElementById('es-pd');
        if (dash) dash.hidden = true;
      }
    });
  }

  function render(user) {
    user = user || userObj();
    var host = document.getElementById('es-player-profile');
    if (!host) return;
    var box = document.getElementById('es-pd');
    if (!box) {
      box = document.createElement('div');
      box.id = 'es-pd';
      box.className = 'es-pd';
      host.insertBefore(box, host.firstChild);
    }
    box.innerHTML = html(user);
    box.hidden = false;
    host.classList.add('es-pd-on');
    bind(host);
  }

  window.EliseePlayerDash = { render: render };

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
