/* Dashboard Responsabile Settore Giovanile */
(function () {
  var AXES = [
    'Sviluppo Talenti', 'Coordinamento Allenatori', 'Percorso Formativo', 'Rapporti con le Famiglie',
    'Passaggio in Prima Squadra', 'Metodologia Didattica', 'Struttura Organizzativa', 'Risultati Sportivi Giovanili'
  ];
  var V2025 = [87, 90, 88, 94, 85, 93, 87, 91];
  var V2023 = [74, 76, 74, 80, 70, 79, 73, 77];

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function userObj() {
    try { return JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {}; } catch (_) { return {}; }
  }
  function isYg(u) {
    u = u || userObj();
    var blob = [u.staffRole, u.ruoloDettagliato, u.ruolo, u.role, u.staffProfile && u.staffProfile.fieldRole]
      .filter(Boolean).join(' ').toLowerCase();
    return /responsabile (del )?settore giovanile|settore giovanile/.test(blob);
  }
  function ygName(u) {
    return [u.nome, u.cognome].filter(Boolean).join(' ').trim() || u.username || 'Responsabile settore giovanile';
  }
  function initials(name) {
    var p = String(name || 'SG').trim().split(/\s+/);
    return ((p[0] || 'S').charAt(0) + (p[1] || p[0] || 'G').charAt(0)).toUpperCase();
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
    var html = '<svg viewBox="0 0 440 430" role="img" aria-label="Analisi gestione settore giovanile">';
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
    if (typeof window.unmountAllRoleDashboards === "function") {
      window.unmountAllRoleDashboards();
    }
  }

  function html(user) {
    var name = ygName(user);
    var ph = photoOf(user);
    var ava = ph
      ? '<img src="' + esc(ph) + '" alt="">'
      : '<div class="es-pd-ph">' + esc(initials(name)) + '</div>';
    return '<aside class="es-pd-rail">' +
      '<button type="button" data-yg="home" title="Home">' + ico('<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>') + '</button>' +
      '<button type="button" class="is-on" data-yg="dash" title="Dashboard">' + ico('<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>') + '</button>' +
      '<button type="button" data-yg="album" title="Album">' + ico('<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>') + '</button>' +
      '<button type="button" data-yg="msgs" title="Messaggi">' + ico('<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>') + '</button>' +
      '<button type="button" class="es-pd-rail-end" data-yg="edit" title="Anagrafica">' + ico('<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>') + '</button>' +
      '</aside><div class="es-pd-body">' +
      '<div class="es-pd-head"><h1>Elisee Scout — Dashboard Settore Giovanile</h1>' +
      '<strong>Responsabile settore giovanile: ' + esc(name.toUpperCase()) + '</strong></div>' +
      '<div class="es-pd-grid">' +

      '<section class="es-pd-card es-pd-indice"><h2>Profilo Responsabile Settore Giovanile</h2>' +
      '<div class="es-pd-who">' + ava + '<div><b style="color:#fff">' + esc(name) + '</b>' +
      '<div style="font-size:0.72rem;color:#94a3b8">Settore giovanile</div></div></div>' +
      '<div class="es-pd-metric"><span>Visione formativa</span><b>92%</b></div>' +
      '<div class="es-pd-metric"><span>Gestione staff tecnico gio.</span><b>85%</b></div>' +
      '<div class="es-pd-metric"><span>Sviluppo talenti</span><b>96%</b></div>' +
      '<div class="es-pd-metric"><span>Rapporto con le famiglie</span><b>94%</b></div>' +
      '<div class="es-pd-metric"><span>Coordinamento categorie</span><b>91%</b></div></section>' +

      '<section class="es-pd-card es-pd-radar">' +
      '<div class="es-pd-radar-tools"><span>Seleziona dati radar</span><span>Analisi gestione settore giovanile</span><div class="es-pd-legend-pills"><span class="es-pd-pill-legend" style="color:#38bdf8"><i style="background:#38bdf8"></i> 2025 (Stagione Attuale)</span><span class="es-pd-pill-legend" style="color:#94a3b8"><i style="background:#64748b"></i> 2023 (Benchmark Storico)</span></div></div>' +
      radarSvg() + '</section>' +

      '<section class="es-pd-card es-pd-comply"><h2>Verifica &amp; Compliance staff tecnico</h2>' +
      '<div class="es-pd-ok"><span>Patentino UEFA Youth</span><b>100%</b></div>' +
      '<div class="es-pd-ok"><span>Corso tutela minori obbligatorio</span><b>100%</b></div>' +
      '<div class="es-pd-ok"><span>Certificazione Scuola Calcio FIGC</span><b>100%</b></div>' +
      '<div class="es-pd-ok"><span>Primo soccorso completo</span><b>100%</b></div>' +
      '<div class="es-pd-ok"><span>Ultima verifica</span><b>10/06/2027</b></div></section>' +

      '<section class="es-pd-card es-pd-storico"><h2>Andamento vivaio</h2>' +
      '<div class="es-pd-sparks">' +
      '<figure>' + spark([18, 22, 28, 34, 40, 48, 58], '#38bdf8') + '<figcaption>Promossi in prima squadra</figcaption></figure>' +
      '<figure>' + spark([40, 48, 52, 58, 66, 74, 82], '#4ade80') + '<figcaption>Risultati categorie</figcaption></figure>' +
      '<figure>' + spark([28, 36, 44, 52, 60, 72, 84], '#facc15') + '<figcaption>Nuovi tesseramenti</figcaption></figure>' +
      '<figure>' + spark([48, 55, 60, 66, 74, 82, 90], '#22d3ee') + '<figcaption>Stagione</figcaption></figure>' +
      '</div></section>' +

      '<section class="es-pd-card es-pd-mercato"><h2>Indice di valore vivaio</h2>' +
      '<p class="es-yg-grade">8,5/10 <small>+5,5%</small></p>' +
      '<div class="es-pd-mrow"><span>Valore stimato talenti</span><b>Alto</b></div>' +
      '<div class="es-pd-mrow"><span>Trend promozioni prima squadra</span><b>Crescente</b></div>' +
      '<div class="es-pd-mrow"><span>Richieste da altri club</span><b>5</b></div>' +
      '<div class="es-pd-mrow"><span>Scadenza incarico</span><b>30/06/2028</b></div>' +
      '<div class="es-pd-mrow"><span>Trattative aperte</span><b>Nessuna</b></div></section>' +

      '<section class="es-pd-card es-pd-registro"><h2>Registro categorie giovanili</h2>' +
      '<table class="es-pd-table"><thead><tr><th>Categoria</th><th>Allenatore</th><th>Tesserati</th><th>Esito</th></tr></thead><tbody>' +
      '<tr><td>Primavera</td><td>vs. Notaresco</td><td>25</td><td>Playoff <i class="es-pd-dot g"></i></td></tr>' +
      '<tr><td>U17</td><td>vs. Vastese</td><td>23</td><td>Titolo <i class="es-pd-dot g"></i></td></tr>' +
      '<tr><td>U16</td><td>vs. Chieti</td><td>23</td><td>Titolo <i class="es-pd-dot g"></i></td></tr>' +
      '<tr><td>U15</td><td>vs. Termoli</td><td>24</td><td>Finalista <i class="es-pd-dot y"></i></td></tr>' +
      '<tr><td>U13</td><td>vs. Campobasso</td><td>24</td><td>Finalista <i class="es-pd-dot y"></i></td></tr>' +
      '<tr><td>U12</td><td>vs. Castelfidardo</td><td>26</td><td>In corso <i class="es-pd-dot y"></i></td></tr>' +
      '</tbody></table></section>' +

      '<section class="es-pd-card es-pd-trend"><h2>2023 vs 2024 vs 2025</h2>' +
      trendSvg() +
      '<button type="button" class="es-pd-edit" data-yg="edit">Modifica anagrafica</button>' +
      '</section>' +
      '</div></div>';
  }


  function openYgEditModal(user) {
    user = user || userObj();
    var backdrop = document.createElement('div');
    backdrop.className = 'es-edit-modal-backdrop';

    backdrop.innerHTML = '<div class="es-edit-modal">' +
      '<div class="es-edit-modal-head">' +
      '<h2><span>✏️</span> Modifica Anagrafica Responsabile Settore Giovanile</h2>' +
      '<button type="button" class="es-edit-modal-close" title="Chiudi">&times;</button>' +
      '</div>' +
      '<div class="es-edit-grid">' +
      '<div class="es-edit-field"><label>Nome</label><input id="es-yg-nome" value="' + esc(user.nome || 'Eliseo') + '"></div>' +
      '<div class="es-edit-field"><label>Cognome</label><input id="es-yg-cognome" value="' + esc(user.cognome || 'Miraglia') + '"></div>' +
      '<div class="es-edit-field"><label>Ruolo Ufficiale</label><input id="es-yg-role" value="Responsabile Settore Giovanile" readonly></div>' +
      '<div class="es-edit-field"><label>Club / Organizzazione</label><input id="es-yg-club" value="' + esc(user.squadra || user.club || 'Notaresco Calcio') + '"></div>' +
      '<div class="es-edit-field full"><label>Bio &amp; Note Operative</label><textarea id="es-yg-bio" rows="3">' + esc(user.bio || 'Profilo accreditato e verificato su Elisee Scout per la stagione 2025/2026.') + '</textarea></div>' +
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
      var n = document.getElementById('es-yg-nome').value.trim();
      var c = document.getElementById('es-yg-cognome').value.trim();
      var clb = document.getElementById('es-yg-club').value.trim();
      var bio = document.getElementById('es-yg-bio').value.trim();

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
        window.showToast('Anagrafica Responsabile Settore Giovanile salvata con successo!', 'success');
      }
      render(user);
    });
  }

  function bind(host) {
    if (!host || host.dataset.ygBound === '1') return;
    host.dataset.ygBound = '1';
    host.addEventListener('click', function (e) {
      var b = e.target.closest('[data-yg]');
      if (!b) return;
      var k = b.getAttribute('data-yg');
      if (k === 'home' && window.switchView) window.switchView('home', '#hero');
      if (k === 'album' && window.openChiSegui) window.openChiSegui();
      if (k === 'msgs' && window.openUserMessages) window.openUserMessages();
      if (k === 'edit') {
        openYgEditModal(userObj());
      }
    });
  }

  function render(user) {
    user = user || userObj();
    if (!isYg(user)) return;
    hideOthers();
    var host = document.getElementById('es-staff-profile');
    var group = document.getElementById('user-dossier-view-group');
    if (!host) return;
    var box = document.getElementById('es-yg');
    if (!box) {
      box = document.createElement('div');
      box.id = 'es-yg';
      box.className = 'es-pd';
      host.insertBefore(box, host.firstChild);
    }
    box.innerHTML = html(user);
    box.hidden = false;
    host.classList.add('es-yg-on');
    host.classList.remove('es-pd-on', 'es-ds-on', 'es-pres-on', 'es-vice-on', 'es-fisio-on', 'es-ma-on', 'es-med-on', 'es-obs-on', 'es-tm-on', 'es-gk-on', 'es-at-on', 'es-dg-on');
    if (group) {
      group.classList.add('is-yg-dash');
      group.classList.remove('is-coach-dash', 'is-ds-dash', 'is-pres-dash', 'is-vice-dash', 'is-fisio-dash', 'is-ma-dash', 'is-med-dash', 'is-obs-dash', 'is-tm-dash', 'is-gk-dash', 'is-at-dash', 'is-dg-dash');
    }
    bind(host);
  }

  window.EliseeYgDash = { render: render, isYg: isYg };

  document.addEventListener('elisee:view-changed', function (e) {
    var d = e && e.detail;
    if (d && d.view === 'user-dossier') {
      try {
        var u = userObj();
        if (isYg(u)) render(u);
      } catch (_) {}
    }
  });
})();
