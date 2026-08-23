/* Dashboard Nutrizionista */
(function () {
  var AXES = [
    'Piani Alimentari Personalizzati', 'Monitoraggio Peso Forma', 'Idratazione e Recupero', 'Educazione Nutrizionale',
    'Supplementazione', 'Gestione Pre/Post Gara', 'Collaborazione Staff Medico', 'Aderenza Giocatori'
  ];
  var V2025 = [88, 90, 94, 87, 85, 93, 94, 91];
  var V2023 = [74, 76, 80, 73, 70, 79, 80, 77];

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function userObj() {
    try { return JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {}; } catch (_) { return {}; }
  }
  function isNu(u) {
    u = u || userObj();
    var blob = [u.staffRole, u.ruoloDettagliato, u.ruolo, u.role, u.staffProfile && u.staffProfile.fieldRole]
      .filter(Boolean).join(' ').toLowerCase();
    return /nutrizionista/.test(blob);
  }
  function nuName(u) {
    return [u.nome, u.cognome].filter(Boolean).join(' ').trim() || u.username || 'Nutrizionista';
  }
  function initials(name) {
    var p = String(name || 'NU').trim().split(/\s+/);
    return ((p[0] || 'N').charAt(0) + (p[1] || p[0] || 'U').charAt(0)).toUpperCase();
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
    var html = '<svg viewBox="0 0 440 430" role="img" aria-label="Analisi attività nutrizionale">';
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
    ['es-cd', 'es-dsd', 'es-prd', 'es-vd', 'es-fd', 'es-mad', 'es-md', 'es-od', 'es-tmd', 'es-gk', 'es-atd', 'es-yg', 'es-dg', 'es-ag', 'es-mk', 'es-pr', 'es-eq'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.hidden = true;
    });
    var g = document.getElementById('user-dossier-view-group');
    if (g) g.classList.remove('is-coach-dash', 'is-ds-dash', 'is-pres-dash', 'is-vice-dash', 'is-fisio-dash', 'is-ma-dash', 'is-med-dash', 'is-obs-dash', 'is-tm-dash', 'is-gk-dash', 'is-at-dash', 'is-yg-dash', 'is-dg-dash', 'is-ag-dash', 'is-mk-dash', 'is-pr-dash');
  }

  function html(user) {
    var name = nuName(user);
    var ph = photoOf(user);
    var ava = ph
      ? '<img src="' + esc(ph) + '" alt="">'
      : '<div class="es-pd-ph">' + esc(initials(name)) + '</div>';
    return '<aside class="es-pd-rail">' +
      '<button type="button" data-nu="home" title="Home">' + ico('<path d="M4 10.5 12 4l8 6.5V20H4z"/>') + '</button>' +
      '<button type="button" class="is-on" data-nu="dash" title="Dashboard">' + ico('<circle cx="12" cy="8" r="3"/><path d="M5 20c1.5-4 4-6 7-6s5.5 2 7 6"/>') + '</button>' +
      '<button type="button" data-nu="album" title="Album">' + ico('<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 15l4-3 3 2 5-5 4 4"/>') + '</button>' +
      '<button type="button" data-nu="msgs" title="Messaggi">' + ico('<path d="M4 6h16v12H4z"/><path d="m4 7 8 6 8-6"/>') + '</button>' +
      '<button type="button" class="es-pd-rail-end" data-nu="edit" title="Anagrafica">' + ico('<circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>') + '</button>' +
      '</aside><div class="es-pd-body">' +
      '<div class="es-pd-head"><h1>Elisee Scout — Dashboard Nutrizionista</h1>' +
      '<strong>Nutrizionista: ' + esc(name.toUpperCase()) + '</strong></div>' +
      '<div class="es-pd-grid">' +

      '<section class="es-pd-card es-pd-indice"><h2>Profilo Nutrizionista</h2>' +
      '<div class="es-pd-who">' + ava + '<div><b style="color:#fff">' + esc(name) + '</b>' +
      '<div style="font-size:0.72rem;color:#94a3b8">Staff sanitario</div></div></div>' +
      '<div class="es-pd-metric"><span>Competenza scientifica</span><b>92%</b></div>' +
      '<div class="es-pd-metric"><span>Personalizzazione piani alimentari</span><b>85%</b></div>' +
      '<div class="es-pd-metric"><span>Monitoraggio composizione corporea</span><b>96%</b></div>' +
      '<div class="es-pd-metric"><span>Rapporto con staff medico</span><b>94%</b></div>' +
      '<div class="es-pd-metric"><span>Educazione alimentare squadra</span><b>91%</b></div></section>' +

      '<section class="es-pd-card es-pd-radar">' +
      '<div class="es-pd-radar-tools"><span>Seleziona dati radar</span><span>Analisi attività nutrizionale</span></div>' +
      radarSvg() + '</section>' +

      '<div class="es-nu-side">' +
      '<section class="es-pd-card"><h2>Giocatori in gestione</h2><p class="es-nu-num">24</p></section>' +
      '<section class="es-pd-card"><h2>Piani alimentari attivi</h2><p class="es-nu-num">22</p></section>' +
      '<section class="es-pd-card"><h2>Valutazione</h2><p class="es-nu-grade">1,7/10 <small>+5,5%</small></p></section>' +
      '<section class="es-pd-card"><h2>Andamento composizione corporea</h2>' +
      trendSvg() +
      '<div class="es-nu-legend"><span><i style="background:#38bdf8"></i>2023</span>' +
      '<span><i style="background:#4ade80"></i>2024</span>' +
      '<span><i style="background:#facc15"></i>2025</span></div></section>' +
      '</div>' +

      '<div class="es-nu-bottom">' +
      '<section class="es-pd-card"><h2>Compliance sanitaria</h2>' +
      '<div class="es-nu-check"><span>Laurea in Scienze della Nutrizione</span><b>✓</b></div>' +
      '<div class="es-nu-check"><span>Iscrizione all\'Albo</span><b>✓</b></div>' +
      '<div class="es-nu-check"><span>Protocollo antidoping</span><b>✓</b></div>' +
      '<div class="es-nu-check"><span>Tutela minori</span><b>✓</b></div></section>' +

      '<section class="es-pd-card"><h2>Registro giocatori</h2>' +
      '<table class="es-pd-table"><thead><tr><th>Giocatore</th><th>Piano</th><th>Aggiornato</th></tr></thead><tbody>' +
      '<tr><td>Rossi</td><td>Ipercalorico</td><td>15/07 <i class="es-pd-dot g"></i></td></tr>' +
      '<tr><td>Bianchi</td><td>Ipercalorico</td><td>15/07 <i class="es-pd-dot g"></i></td></tr>' +
      '<tr><td>Verdi</td><td>Ipercalorico</td><td>15/07 <i class="es-pd-dot g"></i></td></tr>' +
      '<tr><td>Neri</td><td>Ipercalorico</td><td>22/07 <i class="es-pd-dot g"></i></td></tr>' +
      '<tr><td>Blu</td><td>Ipocalorico</td><td>In corso <i class="es-pd-dot y"></i></td></tr>' +
      '</tbody></table></section>' +

      '<section class="es-pd-card"><h2>Prossimi controlli composizione</h2>' +
      '<div class="es-nu-when"><b>18:00</b><span>DEXA squadra</span></div>' +
      '<div class="es-nu-when"><b>09:30</b><span>Plicometria primavera</span></div></section>' +

      '<section class="es-pd-card"><h2>Alimentazione pre-partita</h2>' +
      '<div class="es-pd-mrow"><span>3h pre-match</span><b>Pasto completo</b></div>' +
      '<div class="es-pd-mrow"><span>60\' pre-match</span><b>Idratazione</b></div>' +
      '<div class="es-pd-mrow"><span>30\' post-match</span><b>Recupero</b></div>' +
      '<button type="button" class="es-pd-edit" data-nu="edit">Modifica anagrafica</button>' +
      '</section>' +
      '</div></div></div>';
  }

  function bind(host) {
    if (!host || host.dataset.nuBound === '1') return;
    host.dataset.nuBound = '1';
    host.addEventListener('click', function (e) {
      var b = e.target.closest('[data-nu]');
      if (!b) return;
      var k = b.getAttribute('data-nu');
      if (k === 'home' && window.switchView) window.switchView('home', '#hero');
      if (k === 'album' && window.openChiSegui) window.openChiSegui();
      if (k === 'msgs' && window.openUserMessages) window.openUserMessages();
      if (k === 'edit') {
        host.classList.remove('es-nu-on');
        var dash = document.getElementById('es-nu');
        if (dash) dash.hidden = true;
        var g = document.getElementById('user-dossier-view-group');
        if (g) g.classList.remove('is-nu-dash');
      }
    });
  }

  function render(user) {
    user = user || userObj();
    if (!isNu(user)) return;
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
    box.innerHTML = html(user);
    box.hidden = false;
    host.classList.add('es-nu-on');
    host.classList.remove('es-pd-on', 'es-ds-on', 'es-pres-on', 'es-vice-on', 'es-fisio-on', 'es-ma-on', 'es-med-on', 'es-obs-on', 'es-tm-on', 'es-gk-on', 'es-at-on', 'es-yg-on', 'es-dg-on', 'es-ag-on', 'es-mk-on', 'es-pr-on', 'es-eq-on');
    if (group) {
      group.classList.add('is-nu-dash');
      group.classList.remove('is-coach-dash', 'is-ds-dash', 'is-pres-dash', 'is-vice-dash', 'is-fisio-dash', 'is-ma-dash', 'is-med-dash', 'is-obs-dash', 'is-tm-dash', 'is-gk-dash', 'is-at-dash', 'is-yg-dash', 'is-dg-dash', 'is-ag-dash', 'is-mk-dash', 'is-pr-dash', 'is-eq-dash');
    }
    bind(host);
  }

  window.EliseeNuDash = { render: render, isNu: isNu };

  document.addEventListener('elisee:view-changed', function (e) {
    var d = e && e.detail;
    if (d && d.view === 'user-dossier') {
      try {
        var u = userObj();
        if (isNu(u)) render(u);
      } catch (_) {}
    }
  });
})();
