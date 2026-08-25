/* Dashboard Direttore Sportivo — area staff DS */
(function () {
  var AXES = [
    'Trattative Concluse', 'Efficienza Budget', 'Scouting Giovani', 'Rapporti Media',
    'Gestione Rosa', 'Rinnovi Contrattuali', 'Rete Internazionale', 'Visione Strategica'
  ];
  var V2025 = [85, 90, 94, 87, 78, 92, 91, 89];
  var V2023 = [72, 78, 80, 74, 70, 81, 79, 77];

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function userObj() {
    try { return JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {}; } catch (_) { return {}; }
  }
  function isDs(u) {
    u = u || userObj();
    var blob = [u.staffRole, u.ruoloDettagliato, u.ruolo, u.role, u.staffProfile && u.staffProfile.fieldRole]
      .filter(Boolean).join(' ').toLowerCase();
    return /direttore sportivo|\bds\b/.test(blob);
  }
  function dsName(u) {
    return [u.nome, u.cognome].filter(Boolean).join(' ').trim() || u.username || 'Direttore Sportivo';
  }
  function initials(name) {
    var p = String(name || 'DS').trim().split(/\s+/);
    return ((p[0] || 'D').charAt(0) + (p[1] || p[0] || 'S').charAt(0)).toUpperCase();
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
    var html = '<svg viewBox="0 0 440 430" role="img" aria-label="Analisi performance dirigenziale">';
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
      '2023': [58, 64, 70, 68, 74, 80],
      '2024': [70, 72, 78, 82, 86, 88],
      '2025': [76, 82, 85, 90, 93, 96]
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
    var name = dsName(user);
    var ph = photoOf(user);
    var ava = ph
      ? '<img src="' + esc(ph) + '" alt="">'
      : '<div class="es-pd-ph">' + esc(initials(name)) + '</div>';
    return '<aside class="es-pd-rail">' +
      '<button type="button" data-ds="home" title="Home">' + ico('<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>') + '</button>' +
      '<button type="button" class="is-on" data-ds="dash" title="Dashboard">' + ico('<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>') + '</button>' +
      '<button type="button" data-ds="secret" title="Secret List">' + ico('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="11" r="2.5"/>') + '</button>' +
      '<button type="button" data-ds="msgs" title="Messaggi">' + ico('<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>') + '</button>' +
      '<button type="button" class="es-pd-rail-end" data-ds="edit" title="Anagrafica">' + ico('<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>') + '</button>' +
      '</aside><div class="es-pd-body">' +
      '<div class="es-pd-head"><h1>Elisee Scout — Dashboard Direttore Sportivo</h1>' +
      '<strong>Direttore sportivo: ' + esc(name.toUpperCase()) + '</strong></div>' +
      '<div class="es-pd-grid">' +

      '<section class="es-pd-card es-pd-indice"><h2>Profilo DS</h2>' +
      '<div class="es-pd-who">' + ava + '<div><b style="color:#fff">' + esc(name) + '</b>' +
      '<div style="font-size:0.72rem;color:#94a3b8">Direttore sportivo</div></div></div>' +
      '<div class="es-pd-metric"><span>Capacità negoziale</span><b>92%</b></div>' +
      '<div class="es-pd-metric"><span>Visione strategica</span><b>95%</b></div>' +
      '<div class="es-pd-metric"><span>Gestione budget</span><b>88%</b></div>' +
      '<div class="es-pd-metric"><span>Rete di contatti</span><b>90%</b></div>' +
      '<div class="es-pd-metric"><span>Affidabilità trattative</span><b>92%</b></div></section>' +

      '<section class="es-pd-card es-pd-radar">' +
      '<div class="es-pd-radar-tools"><span>Seleziona dati radar</span><span>Analisi performance dirigenziale</span><div class="es-pd-legend-pills"><span class="es-pd-pill-legend" style="color:#38bdf8"><i style="background:#38bdf8"></i> 2025 (Stagione Attuale)</span><span class="es-pd-pill-legend" style="color:#94a3b8"><i style="background:#64748b"></i> 2023 (Benchmark Storico)</span></div></div>' +
      radarSvg() + '</section>' +

      '<section class="es-pd-card es-pd-comply"><h2>Verifica &amp; Compliance dirigenziale</h2>' +
      '<div class="es-pd-ok"><span>Patentino FIGC Direttore Sportivo</span><b>100%</b></div>' +
      '<div class="es-pd-ok"><span>Corso Fair Play finanziario</span><b>100%</b></div>' +
      '<div class="es-pd-ok"><span>Tutela minori (ID)</span><b>100%</b></div>' +
      '<div class="es-pd-ok"><span>Conformità FIFA</span><b>100%</b></div>' +
      '<div class="es-pd-ok"><span>Profilo validato</span><b>100%</b></div></section>' +

      '<section class="es-pd-card es-pd-storico"><h2>Andamento gestionale</h2>' +
      '<div class="es-pd-sparks">' +
      '<figure>' + spark([40, 52, 48, 60, 72, 80, 88], '#38bdf8') + '<figcaption>Trattative</figcaption></figure>' +
      '<figure>' + spark([30, 38, 44, 50, 58, 70, 82], '#f87171') + '<figcaption>Budget impiegato</figcaption></figure>' +
      '<figure>' + spark([42, 50, 55, 52, 64, 74, 86], '#4ade80') + '<figcaption>Stagione</figcaption></figure>' +
      '<figure>' + spark([20, 28, 35, 48, 55, 68, 78], '#facc15') + '<figcaption>Plusvalenze</figcaption></figure>' +
      '</div></section>' +

      '<section class="es-pd-card es-pd-mercato"><h2>Indice di performance DS</h2>' +
      '<p class="es-ds-euro">€ 500.000 <small>+5,5%</small></p>' +
      '<div class="es-pd-mrow"><span>Valore rosa gestito</span><b>Attivo</b></div>' +
      '<div class="es-pd-mrow"><span>Trend plusvalenze</span><b>+5,5%</b></div>' +
      '<div class="es-pd-mrow"><span>Trattative in corso</span><b>5</b></div>' +
      '<div class="es-pd-mrow"><span>Scadenza contratto DS</span><b>30/06/2026</b></div>' +
      '<div class="es-pd-mrow"><span>Richiesta di mercato</span><b>Avanzata</b></div></section>' +

      '<section class="es-pd-card es-pd-registro"><h2>Registro trattative</h2>' +
      '<table class="es-pd-table"><thead><tr><th>Club</th><th>Tipo</th><th>Valore</th><th></th></tr></thead><tbody>' +
      '<tr><td>vs. Notaresco</td><td>Acquisto</td><td>€ 2M</td><td><i class="es-pd-dot g"></i></td></tr>' +
      '<tr><td>vs. Vastese</td><td>Cessione</td><td>€ 1,5M</td><td><i class="es-pd-dot y"></i></td></tr>' +
      '<tr><td>vs. Chieti</td><td>Rinnovo</td><td>€ 0,5M</td><td><i class="es-pd-dot y"></i></td></tr>' +
      '<tr><td>vs. Termoli</td><td>Rinnovo</td><td>€ 0,5M</td><td><i class="es-pd-dot y"></i></td></tr>' +
      '<tr><td>vs. Campobasso</td><td>Acquisto</td><td>€ 2M</td><td><i class="es-pd-dot g"></i></td></tr>' +
      '<tr><td>vs. Castelfidardo</td><td>Prestito</td><td>€ 1M</td><td><i class="es-pd-dot g"></i></td></tr>' +
      '</tbody></table></section>' +

      '<section class="es-pd-card es-pd-trend"><h2>2023 vs 2024 vs 2025</h2>' +
      trendSvg() +
      '<button type="button" class="es-pd-edit" data-ds="edit">Modifica anagrafica</button>' +
      '</section>' +
      '</div></div>';
  }

  function hideCoach() {
    var cd = document.getElementById('es-cd');
    if (cd) cd.hidden = true;
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
    var nu = document.getElementById('es-nu');
    if (nu) nu.hidden = true;
    var eq = document.getElementById('es-eq');
    if (eq) eq.hidden = true;
    var sg = document.getElementById('es-sg');
    if (sg) sg.hidden = true;
    var bt = document.getElementById('es-bt');
    if (bt) bt.hidden = true;
    var g = document.getElementById('user-dossier-view-group');
    if (g) { g.classList.remove('is-coach-dash'); g.classList.remove('is-ma-dash'); g.classList.remove('is-med-dash'); g.classList.remove('is-obs-dash'); g.classList.remove('is-tm-dash'); g.classList.remove('is-gk-dash'); g.classList.remove('is-at-dash'); g.classList.remove('is-yg-dash'); g.classList.remove('is-dg-dash'); }
  }


  function openDsEditModal(user) {
    user = user || userObj();
    var backdrop = document.createElement('div');
    backdrop.className = 'es-edit-modal-backdrop';

    backdrop.innerHTML = '<div class="es-edit-modal">' +
      '<div class="es-edit-modal-head">' +
      '<h2><span>✏️</span> Modifica Anagrafica Direttore Sportivo</h2>' +
      '<button type="button" class="es-edit-modal-close" title="Chiudi">&times;</button>' +
      '</div>' +
      '<div class="es-edit-grid">' +
      '<div class="es-edit-field"><label>Nome</label><input id="es-ds-nome" value="' + esc(user.nome || 'Eliseo') + '"></div>' +
      '<div class="es-edit-field"><label>Cognome</label><input id="es-ds-cognome" value="' + esc(user.cognome || 'Miraglia') + '"></div>' +
      '<div class="es-edit-field"><label>Ruolo Ufficiale</label><input id="es-ds-role" value="Direttore Sportivo" readonly></div>' +
      '<div class="es-edit-field"><label>Club / Organizzazione</label><input id="es-ds-club" value="' + esc(user.squadra || user.club || 'Notaresco Calcio') + '"></div>' +
      '<div class="es-edit-field full"><label>Bio &amp; Note Operative</label><textarea id="es-ds-bio" rows="3">' + esc(user.bio || 'Profilo accreditato e verificato su Elisee Scout per la stagione 2025/2026.') + '</textarea></div>' +
      '</div>' +
      '<div class="es-edit-actions">' +
      '<button type="button" class="es-edit-btn-cancel">Annulla</button>' +
      '<button type="button" class="es-edit-btn-save">💾 Salva Anagrafica</button>' +
      '</div>' +
      '</div>';

    document.body.appendChild(backdrop);

    var close = function () { backdrop.remove(); };
    backdrop.querySelector('.es-edit-modal-close').addEventListener('click', close);
    backdrop.querySelector('.es-edit-btn-cancel').addEventListener('click', close);
    backdrop.addEventListener('click', function (e) { if (e.target === backdrop) close(); });

    backdrop.querySelector('.es-edit-btn-save').addEventListener('click', function () {
      var n = document.getElementById('es-ds-nome').value.trim();
      var c = document.getElementById('es-ds-cognome').value.trim();
      var clb = document.getElementById('es-ds-club').value.trim();
      var bio = document.getElementById('es-ds-bio').value.trim();

      user.nome = n || user.nome;
      user.cognome = c || user.cognome;
      user.fullName = (user.nome + ' ' + user.cognome).trim();
      user.squadra = clb;
      user.club = clb;
      user.bio = bio;

      try {
        localStorage.setItem('elisee_active_user', JSON.stringify(user));
      } catch (_) {}

      close();
      if (typeof window.showToast === 'function') {
        window.showToast('Anagrafica Direttore Sportivo salvata con successo!', 'success');
      }
      render(user);
    });
  }

  function bind(host) {
    if (!host || host.dataset.dsBound === '1') return;
    host.dataset.dsBound = '1';
    host.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ds]');
      if (!b) return;
      var k = b.getAttribute('data-ds');
      if (k === 'home' && window.switchView) window.switchView('home', '#hero');
      if (k === 'secret' && window.openSecretList) window.openSecretList();
      if (k === 'msgs' && window.openUserMessages) window.openUserMessages();
      if (k === 'edit') {
        openDsEditModal(userObj());
      }
    });
  }

  function render(user) {
    user = user || userObj();
    if (!isDs(user)) return;
    hideCoach();
    var host = document.getElementById('es-staff-profile');
    var group = document.getElementById('user-dossier-view-group');
    if (!host) return;
    var box = document.getElementById('es-dsd');
    if (!box) {
      box = document.createElement('div');
      box.id = 'es-dsd';
      box.className = 'es-pd';
      host.insertBefore(box, host.firstChild);
    }
    box.innerHTML = html(user);
    box.hidden = false;
    host.classList.add('es-ds-on');
    host.classList.remove('es-pd-on', 'es-ma-on', 'es-med-on', 'es-obs-on', 'es-tm-on', 'es-gk-on', 'es-at-on', 'es-yg-on', 'es-dg-on', 'es-nu-on');
    if (group) {
      group.classList.add('is-ds-dash');
      group.classList.remove('is-coach-dash', 'is-ma-dash', 'is-med-dash', 'is-obs-dash', 'is-tm-dash', 'is-gk-dash', 'is-at-dash', 'is-yg-dash', 'is-dg-dash', 'is-nu-dash');
    }
    bind(host);
  }

  window.EliseeDsDash = { render: render, isDs: isDs };

  document.addEventListener('elisee:view-changed', function (e) {
    var d = e && e.detail;
    if (d && d.view === 'user-dossier') {
      try {
        var u = userObj();
        if (isDs(u)) render(u);
      } catch (_) {}
    }
  });
})();
