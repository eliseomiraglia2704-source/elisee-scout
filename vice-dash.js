/* Dashboard Vice Allenatore — Allenatore in seconda */
(function () {
  var AXES = [
    'Preparazione Allenamenti', 'Analisi Video', 'Supporto in Panchina', 'Comunicazione con Staff',
    'Gestione Sostituzioni', 'Sviluppo Giovani', 'Coordinamento Preparatori', 'Efficacia Correttivi'
  ];
  var V2025 = [88, 92, 90, 94, 85, 93, 87, 91];
  var V2023 = [74, 78, 76, 80, 70, 82, 73, 77];

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function userObj() {
    try { return JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {}; } catch (_) { return {}; }
  }
  function isVice(u) {
    u = u || userObj();
    var blob = [u.staffRole, u.ruoloDettagliato, u.ruolo, u.role, u.staffProfile && u.staffProfile.fieldRole]
      .filter(Boolean).join(' ').toLowerCase();
    return /allenatore in seconda|vice allenatore/.test(blob);
  }
  function viceName(u) {
    return [u.nome, u.cognome].filter(Boolean).join(' ').trim() || u.username || 'Vice Allenatore';
  }
  function initials(name) {
    var p = String(name || 'VA').trim().split(/\s+/);
    return ((p[0] || 'V').charAt(0) + (p[1] || p[0] || 'A').charAt(0)).toUpperCase();
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
    var html = '<svg viewBox="0 0 440 430" role="img" aria-label="Analisi contributo tecnico">';
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
      '2023': [62, 68, 70, 74, 76, 80],
      '2024': [72, 75, 80, 84, 86, 88],
      '2025': [80, 84, 87, 90, 92, 95]
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
    ['es-cd', 'es-dsd', 'es-prd', 'es-mad', 'es-md', 'es-od', 'es-tmd', 'es-gk', 'es-atd', 'es-yg'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.hidden = true;
    });
    var g = document.getElementById('user-dossier-view-group');
    if (g) g.classList.remove('is-coach-dash', 'is-ds-dash', 'is-pres-dash', 'is-ma-dash', 'is-med-dash', 'is-obs-dash', 'is-tm-dash', 'is-gk-dash', 'is-at-dash', 'is-yg-dash');
  }

  function html(user) {
    var name = viceName(user);
    var ph = photoOf(user);
    var ava = ph
      ? '<img src="' + esc(ph) + '" alt="">'
      : '<div class="es-pd-ph">' + esc(initials(name)) + '</div>';
    return '<aside class="es-pd-rail">' +
      '<button type="button" data-va="home" title="Home">' + ico('<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>') + '</button>' +
      '<button type="button" class="is-on" data-va="dash" title="Dashboard">' + ico('<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>') + '</button>' +
      '<button type="button" data-va="album" title="Album">' + ico('<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>') + '</button>' +
      '<button type="button" data-va="msgs" title="Messaggi">' + ico('<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>') + '</button>' +
      '<button type="button" class="es-pd-rail-end" data-va="edit" title="Anagrafica">' + ico('<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>') + '</button>' +
      '</aside><div class="es-pd-body">' +
      '<div class="es-pd-head"><h1>Elisee Scout — Dashboard Vice Allenatore</h1>' +
      '<strong>Vice allenatore: ' + esc(name.toUpperCase()) + '</strong></div>' +
      '<div class="es-pd-grid">' +

      '<section class="es-pd-card es-pd-indice"><h2>Profilo Vice Allenatore</h2>' +
      '<div class="es-pd-who">' + ava + '<div><b style="color:#fff">' + esc(name) + '</b>' +
      '<div style="font-size:0.72rem;color:#94a3b8">Allenatore in seconda</div></div></div>' +
      '<div class="es-pd-metric"><span>Supporto tattico</span><b>90%</b></div>' +
      '<div class="es-pd-metric"><span>Gestione allenamenti</span><b>94%</b></div>' +
      '<div class="es-pd-metric"><span>Analisi avversari</span><b>96%</b></div>' +
      '<div class="es-pd-metric"><span>Rapporto con lo staff</span><b>85%</b></div>' +
      '<div class="es-pd-metric"><span>Affiancamento giocatori</span><b>78%</b></div></section>' +

      '<section class="es-pd-card es-pd-radar">' +
      '<div class="es-pd-radar-tools"><span>Seleziona dati radar</span><span>Analisi contributo tecnico</span></div>' +
      radarSvg() + '</section>' +

      '<section class="es-pd-card es-pd-comply"><h2>Verifica &amp; Compliance staff tecnico</h2>' +
      '<div class="es-pd-ok"><span>Patentino UEFA Pro</span><b>100%</b></div>' +
      '<div class="es-pd-ok"><span>Corso primo soccorso</span><b>100%</b></div>' +
      '<div class="es-pd-ok"><span>Tutela minori (ID)</span><b>100%</b></div>' +
      '<div class="es-pd-ok"><span>Aggiornamento formativo</span><b>100%</b></div>' +
      '<div class="es-pd-ok"><span>Profilo staff validato</span><b>100%</b></div></section>' +

      '<section class="es-pd-card es-pd-storico"><h2>Andamento collaborazione tecnica</h2>' +
      '<div class="es-pd-sparks">' +
      '<figure>' + spark([42, 50, 55, 60, 70, 78, 86], '#38bdf8') + '<figcaption>Sessioni</figcaption></figure>' +
      '<figure>' + spark([30, 38, 46, 52, 62, 74, 84], '#4ade80') + '<figcaption>Correzioni tattiche</figcaption></figure>' +
      '<figure>' + spark([40, 48, 52, 58, 66, 75, 85], '#facc15') + '<figcaption>Feedback squadra</figcaption></figure>' +
      '<figure>' + spark([50, 54, 58, 64, 70, 80, 88], '#22d3ee') + '<figcaption>Stagione</figcaption></figure>' +
      '</div></section>' +

      '<section class="es-pd-card es-pd-mercato"><h2>Indice di efficacia tecnica</h2>' +
      '<p class="es-vice-grade">8,5/10 <small>+5,5%</small></p>' +
      '<div class="es-pd-mrow"><span>Valutazione staff</span><b>Ottima</b></div>' +
      '<div class="es-pd-mrow"><span>Trend fiducia allenatore capo</span><b>Crescente</b></div>' +
      '<div class="es-pd-mrow"><span>Richieste di conferma ruolo</span><b>Attive</b></div>' +
      '<div class="es-pd-mrow"><span>Scadenza mandato</span><b>30/06/2028</b></div>' +
      '<div class="es-pd-mrow"><span>Trattative aperte</span><b>Nessuna</b></div></section>' +

      '<section class="es-pd-card es-pd-registro"><h2>Registro sessioni</h2>' +
      '<table class="es-pd-table"><thead><tr><th>Partita</th><th>Tipo</th><th>Focus</th><th></th></tr></thead><tbody>' +
      '<tr><td>vs. Notaresco</td><td>Tattica</td><td>Posizionamento</td><td><i class="es-pd-dot g"></i></td></tr>' +
      '<tr><td>vs. Vastese</td><td>Video</td><td>Diffensive</td><td><i class="es-pd-dot g"></i></td></tr>' +
      '<tr><td>vs. Chieti</td><td>Tattica</td><td>Rimesse</td><td><i class="es-pd-dot g"></i></td></tr>' +
      '<tr><td>vs. Termoli</td><td>Tattica</td><td>Possesso</td><td><i class="es-pd-dot g"></i></td></tr>' +
      '<tr><td>vs. Campobasso</td><td>Tattica</td><td>Diffensivo</td><td><i class="es-pd-dot g"></i></td></tr>' +
      '<tr><td>vs. Castelfidardo</td><td>Panchina</td><td>Sostituzioni</td><td><i class="es-pd-dot y"></i></td></tr>' +
      '</tbody></table></section>' +

      '<section class="es-pd-card es-pd-trend"><h2>2023 vs 2024 vs 2025</h2>' +
      trendSvg() +
      '<button type="button" class="es-pd-edit" data-va="edit">Modifica anagrafica</button>' +
      '</section>' +
      '</div></div>';
  }

  function bind(host) {
    if (!host || host.dataset.vaBound === '1') return;
    host.dataset.vaBound = '1';
    host.addEventListener('click', function (e) {
      var b = e.target.closest('[data-va]');
      if (!b) return;
      var k = b.getAttribute('data-va');
      if (k === 'home' && window.switchView) window.switchView('home', '#hero');
      if (k === 'album' && window.openChiSegui) window.openChiSegui();
      if (k === 'msgs' && window.openUserMessages) window.openUserMessages();
      if (k === 'edit') {
        host.classList.remove('es-vice-on');
        var dash = document.getElementById('es-vd');
        if (dash) dash.hidden = true;
        var g = document.getElementById('user-dossier-view-group');
        if (g) g.classList.remove('is-vice-dash');
      }
    });
  }

  function render(user) {
    user = user || userObj();
    if (!isVice(user)) return;
    hideOthers();
    var host = document.getElementById('es-staff-profile');
    var group = document.getElementById('user-dossier-view-group');
    if (!host) return;
    var box = document.getElementById('es-vd');
    if (!box) {
      box = document.createElement('div');
      box.id = 'es-vd';
      box.className = 'es-pd';
      host.insertBefore(box, host.firstChild);
    }
    box.innerHTML = html(user);
    box.hidden = false;
    host.classList.add('es-vice-on');
    host.classList.remove('es-pd-on', 'es-ds-on', 'es-pres-on', 'es-ma-on', 'es-med-on', 'es-obs-on', 'es-tm-on', 'es-gk-on', 'es-at-on', 'es-yg-on');
    if (group) {
      group.classList.add('is-vice-dash');
      group.classList.remove('is-coach-dash', 'is-ds-dash', 'is-pres-dash', 'is-ma-dash', 'is-med-dash', 'is-obs-dash', 'is-tm-dash', 'is-gk-dash', 'is-at-dash', 'is-yg-dash');
    }
    bind(host);
  }

  window.EliseeViceDash = { render: render, isVice: isVice };

  document.addEventListener('elisee:view-changed', function (e) {
    var d = e && e.detail;
    if (d && d.view === 'user-dossier') {
      try {
        var u = userObj();
        if (isVice(u)) render(u);
      } catch (_) {}
    }
  });
})();
