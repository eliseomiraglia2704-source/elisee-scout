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
    return '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>';
  };
    return '<aside class="es-pd-rail">' +
      '<button type="button" data-pd="home" title="Home">' + ico('<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>') + '</button>' +
      '<button type="button" class="is-on" data-pd="dash" title="Dashboard">' + ico('<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>') + '</button>' +
      '<button type="button" data-pd="album" title="Album">' + ico('<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>') + '</button>' +
      '<button type="button" data-pd="msgs" title="Messaggi">' + ico('<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>') + '</button>' +
      '<button type="button" class="es-pd-rail-end" data-pd="edit" title="Anagrafica">' + ico('<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>') + '</button>' +
      '</aside><div class="es-pd-body">' +
      '<div class="es-pd-head"><h1>Elisee Scout — Dashboard analitica v3.0</h1>' +
      '<strong>Giocatore: ' + esc(name.toUpperCase()) + '</strong></div>' +
      '<div class="es-pd-grid">' +

      '<section class="es-pd-card es-pd-indice"><h2>Indice Atleta &amp; Parametri</h2>' +
      '<div class="es-pd-who">' + ava + '<div><b style="color:#fff">' + esc(name) + '</b>' +
      '<div style="font-size:0.72rem;color:#38bdf8;font-weight:700">' + esc((user.playerProfile && user.playerProfile.fieldRole) || user.ruoloDettagliato || 'Punta Centrale / Ala') + '</div></div></div>' +
      '<div class="es-pd-tags">' +
      '<span class="es-pd-tag">Età: ' + esc(user.eta || '22') + ' anni</span>' +
      '<span class="es-pd-tag">Piede: ' + esc(user.piede || 'Destro') + '</span>' +
      '<span class="es-pd-tag">Altezza: ' + esc(user.altezza || '1.83 m') + '</span>' +
      '<span class="es-pd-tag">Cat: ' + esc(user.categoria || 'Serie D · Girone F') + '</span>' +
      '</div>' +
      '<div class="es-pd-metric"><span>Compatibilità Tattica Club</span><b>90%</b></div>' +
      '<div class="es-pd-metric"><span>Tackle &amp; Contrasti Vinti</span><b>90%</b></div>' +
      '<div class="es-pd-metric"><span>Precisione Passaggi Chiave</span><b>91%</b></div>' +
      '<div class="es-pd-metric"><span>Dribbling &amp; 1vs1 Riusciti</span><b>93%</b></div>' +
      '<div class="es-pd-metric"><span>Recupero &amp; Aggressione Palla</span><b>95%</b></div>' +
      '<div class="es-pd-metric"><span>Media Voto PGB Stagionale</span><b style="color:#38bdf8">8.1 / 10</b></div></section>' +

      '<section class="es-pd-card es-pd-radar">' +
      '<div class="es-pd-radar-tools">' +
      '<span style="font-weight:800;color:#f8fafc">Radar Prestazioni (12 Parametri)</span>' +
      '<div class="es-pd-legend-pills">' +
      '<span class="es-pd-pill-legend" style="color:#38bdf8"><i style="background:#38bdf8"></i> 2025 (Stagione Attuale)</span>' +
      '<span class="es-pd-pill-legend" style="color:#94a3b8"><i style="background:#64748b"></i> 2023 (Benchmark Storico)</span>' +
      '</div>' +
      '</div>' +
      radarSvg() + '</section>' +

      '<section class="es-pd-card es-pd-comply"><h2>Certificazione &amp; Compliance del Club</h2>' +
      '<div class="es-pd-ok"><span>Consenso trattamento dati (GDPR)</span><b>100%</b></div>' +
      '<div class="es-pd-ok"><span>Liberatoria immagine e video</span><b>100%</b></div>' +
      '<div class="es-pd-ok"><span>Verifica tutela minori (ID)</span><b>100%</b></div>' +
      '<div class="es-pd-ok"><span>Idoneità agonistica FIGC</span><b style="color:#4ade80">Valida (30/06/2026)</b></div>' +
      '<div class="es-pd-ok"><span>Profilo validato dal club</span><b>100% Certificato</b></div>' +
      '<div class="es-pd-ok" style="margin-top:0.4rem;padding-top:0.35rem;border-top:1px solid rgba(148,163,184,0.1)"><span>Anti-Fake &amp; Identità verificata</span><b style="color:#38bdf8">Verificato ✓</b></div></section>' +

      '<section class="es-pd-card es-pd-storico"><h2>Prestazioni Storiche &amp; Trend</h2>' +
      '<div class="es-pd-sparks">' +
      '<figure>' + spark([40, 48, 45, 62, 70, 78, 88], '#38bdf8') + '<figcaption>Compatibilità (+48%)</figcaption></figure>' +
      '<figure>' + spark([50, 55, 52, 60, 66, 74, 80], '#4ade80') + '<figcaption>Passaggi chiave (+30%)</figcaption></figure>' +
      '<figure>' + spark([30, 42, 50, 48, 61, 70, 76], '#facc15') + '<figcaption>Tackle (+46%)</figcaption></figure>' +
      '<figure>' + spark([44, 40, 55, 58, 63, 72, 84], '#22d3ee') + '<figcaption>Minuti &amp; Presenze</figcaption></figure>' +
      '</div></section>' +

      '<section class="es-pd-card es-pd-mercato"><h2>Indice di Mercato &amp; Scouting</h2>' +
      '<p class="es-pd-euro">€ 150.000 <small>+5,5%</small></p>' +
      '<div class="es-pd-mrow"><span>Indice di visibilità scout</span><b>90% (Molto Alto)</b></div>' +
      '<div class="es-pd-mrow"><span>Trend interesse club</span><b>Crescente ↗</b></div>' +
      '<div class="es-pd-mrow"><span>Trattative &amp; Contatti B2B</span><b>3 Club interessati</b></div>' +
      '<div class="es-pd-mrow"><span>Scadenza accordo</span><b>30/06/2026</b></div>' +
      '<div class="es-pd-mrow"><span>Potenziale rivendita futura</span><b style="color:#4ade80">Alta</b></div>' +
      '<div class="es-pd-mrow"><span>Appetibilità di categoria</span><b>80%</b></div></section>' +

      '<section class="es-pd-card es-pd-registro"><h2>Registro Match &amp; Voti PGB</h2>' +
      '<table class="es-pd-table"><thead><tr><th>Partita</th><th>MIN</th><th>G</th><th>A</th><th>PGB</th><th>Esito</th></tr></thead><tbody>' +
      '<tr><td>vs. Notaresco</td><td>90\'</td><td>1</td><td>0</td><td>8.6</td><td><i class="es-pd-dot g" title="Top Performance ≥ 7.5"></i></td></tr>' +
      '<tr><td>vs. Vastese</td><td>85\'</td><td>0</td><td>1</td><td>7.0</td><td><i class="es-pd-dot g" title="Top Performance ≥ 7.5"></i></td></tr>' +
      '<tr><td>vs. Chieti</td><td>72\'</td><td>0</td><td>0</td><td>6.5</td><td><i class="es-pd-dot y" title="Nella Media 6.0-7.4"></i></td></tr>' +
      '<tr><td>vs. Termoli</td><td>90\'</td><td>2</td><td>1</td><td>9.0</td><td><i class="es-pd-dot g" title="Top Performance ≥ 7.5"></i></td></tr>' +
      '<tr><td>vs. Campobasso</td><td>90\'</td><td>1</td><td>0</td><td>7.0</td><td><i class="es-pd-dot y" title="Nella Media 6.0-7.4"></i></td></tr>' +
      '<tr><td>vs. Castelfidardo</td><td>80\'</td><td>0</td><td>0</td><td>7.5</td><td><i class="es-pd-dot g" title="Top Performance ≥ 7.5"></i></td></tr>' +
      '</tbody></table></section>' +

      '<section class="es-pd-card es-pd-trend"><h2>Crescita Stagionale (2023-2025)</h2>' +
      trendSvg() +
      '<button type="button" class="es-pd-edit" data-pd="edit">✏️ Modifica Anagrafica Atleta</button>' +
      '</section>' +

      '<section class="es-pd-card es-pd-guide-card">' +
      '<div class="es-pd-guide-head">' +
      '<h2><span>📘</span> Guida Analitica &amp; Legenda Metriche Elisee Scout</h2>' +
      '<span class="es-pd-guide-badge">Standard Certificato FIGC / GDPR</span>' +
      '</div>' +
      '<div class="es-pd-guide-grid">' +
      '<div class="es-pd-guide-item">' +
      '<h3><span>💎</span> Indice PGB (Performance Global Benchmark)</h3>' +
      '<p>Algoritmo proprietario di <b>Match Analysis IA</b> (scala 1-10) che pesa 48 indicatori biometrici e di gioco (duelli, passaggi chiave, tiri, xG, xA, recuperi palla e incisività tattica).</p>' +
      '</div>' +
      '<div class="es-pd-guide-item">' +
      '<h3><span>🎯</span> Radar Comparativo a 12 Assi</h3>' +
      '<p>Confronta l\'impatto della <b style="color:#38bdf8">Stagione Attuale 2025</b> con il <b style="color:#94a3b8">Benchmark Storico 2023</b> diviso in 4 quadranti: Difesa, Costruzione, Finalizzazione e Dinamismo Atletico.</p>' +
      '</div>' +
      '<div class="es-pd-guide-item">' +
      '<h3><span>🛡️</span> Certificazione &amp; Bollini Anti-Fake</h3>' +
      '<p>Garanzia di conformità: verifica documento d\'identità, tutela minori (ID genitoriale), idoneità medico-sportiva agonistica valida e liberatoria d\'immagine.</p>' +
      '</div>' +
      '<div class="es-pd-guide-item">' +
      '<h3><span>🚦</span> Indicatori Prestazionali (Bollini Registro)</h3>' +
      '<p><i class="es-pd-dot g"></i> <b>Verde (PGB ≥ 7.5)</b>: Prestazione eccellente decisiva.<br>' +
      '<i class="es-pd-dot y"></i> <b>Giallo (PGB 6.0 - 7.4)</b>: Prestazione solida nella media.<br>' +
      '<i class="es-pd-dot r"></i> <b>Rosso (PGB &lt; 6.0)</b>: Sotto standard di categoria.</p>' +
      '</div>' +
      '</div>' +
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
