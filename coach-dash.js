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
      '<button type="button" data-cd="home" title="Home">' + ico('<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>') + '</button>' +
      '<button type="button" class="is-on" data-cd="dash" title="Dashboard">' + ico('<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>') + '</button>' +
      '<button type="button" data-cd="album" title="Album">' + ico('<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>') + '</button>' +
      '<button type="button" data-cd="msgs" title="Messaggi">' + ico('<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>') + '</button>' +
      '<button type="button" class="es-pd-rail-end" data-cd="edit" title="Anagrafica">' + ico('<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>') + '</button>' +
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

      '<section class="es-pd-card es-pd-trend"><h2>Crescita Stagionale (2023-2025)</h2>' +
      '<div class="es-pd-trend-legend">' +
      '<span style="color:#38bdf8"><i style="background:#38bdf8"></i> 2023 (62-78%)</span>' +
      '<span style="color:#4ade80"><i style="background:#4ade80"></i> 2024 (70-86%)</span>' +
      '<span style="color:#facc15"><i style="background:#facc15"></i> 2025 (78-93%)</span>' +
      '</div>' +
      trendSvg() +
      '<button type="button" class="es-pd-edit" data-cd="edit">✏️ Modifica Anagrafica Allenatore</button>' +
      '</section>' +

      '<section class="es-pd-card es-pd-guide-card">' +
      '<div class="es-pd-guide-head">' +
      '<h2><span>📘</span> Guida Analitica &amp; Legenda Metriche — Area Allenatore</h2>' +
      '<span class="es-pd-guide-badge">Standard Certificato FIGC / UEFA</span>' +
      '</div>' +
      '<div class="es-pd-guide-grid">' +
      '<div class="es-pd-guide-item">' +
      '<h3><span>🎙️</span> Indice Efficacia Discorsi</h3>' +
      '<p>Monitora la reattività emotiva e la concentrazione della squadra pre e post partita.</p>' +
      '</div>' +
      '<div class="es-pd-guide-item">' +
      '<h3><span>📋</span> Assetto Tattico &amp; Modulo</h3>' +
      '<p>Analisi delle distanze tra reparti, baricentro medio (m) e linee di pressione.</p>' +
      '</div>' +
      '<div class="es-pd-guide-item">' +
      '<h3><span>⚡</span> Carichi &amp; Rischio Muscolare</h3>' +
      '<p>Indice ACWR per prevenire l\'overtraining e ottimizzare il picco di forma domenicale.</p>' +
      '</div>' +
      '<div class="es-pd-guide-item">' +
      '<h3><span>🚦</span> Indicatori Registro</h3>' +
      '<p><i class="es-pd-dot g"></i> <b>Verde</b>: Risposta ottimale della squadra.<br>' +
      '<i class="es-pd-dot y"></i> <b>Giallo</b>: Richiesta attenzione / correzione tattica.</p>' +
      '</div>' +
      '</div>' +
      '</section>' +
      '</div></div>';
  }

  function openCoachEditModal(user) {
    user = user || userObj();
    var backdrop = document.createElement('div');
    backdrop.className = 'es-edit-modal-backdrop';

    backdrop.innerHTML = '<div class="es-edit-modal">' +
      '<div class="es-edit-modal-head">' +
      '<h2><span>✏️</span> Modifica Anagrafica Allenatore</h2>' +
      '<button type="button" class="es-edit-modal-close" title="Chiudi">&times;</button>' +
      '</div>' +
      '<div class="es-edit-grid">' +
      '<div class="es-edit-field"><label>Nome</label><input id="es-cd-nome" value="' + esc(user.nome || 'Eliseo') + '"></div>' +
      '<div class="es-edit-field"><label>Cognome</label><input id="es-cd-cognome" value="' + esc(user.cognome || 'Miraglia') + '"></div>' +
      '<div class="es-edit-field"><label>Ruolo Staff</label><input id="es-cd-role" value="Allenatore / Responsabile Tecnico" readonly></div>' +
      '<div class="es-edit-field"><label>Qualifica / Patentino</label><select id="es-cd-lic"><option selected>UEFA Pro</option><option>UEFA A</option><option>UEFA B</option></select></div>' +
      '<div class="es-edit-field"><label>Club Attuale</label><input id="es-cd-club" value="' + esc(user.squadra || user.club || 'Notaresco Calcio') + '"></div>' +
      '<div class="es-edit-field"><label>Modulo Preferito</label><select id="es-cd-mod"><option>4-3-3</option><option>3-5-2</option><option>4-2-3-1</option><option>3-4-2-1</option></select></div>' +
      '<div class="es-edit-field full"><label>Filosofia di Gioco & Bio</label><textarea id="es-cd-bio" rows="3">' + esc(user.bio || 'Allenatore votato a un calcio propositivo, intensità alta, dominio del possesso e rapida riaggressione.') + '</textarea></div>' +
      '</div>' +
      '<div class="es-edit-actions">' +
      '<button type="button" class="es-edit-btn-cancel">Annulla</button>' +
      '<button type="button" class="es-edit-btn-save">💾 Salva Profilo Mister</button>' +
      '</div>' +
      '</div>';

    document.body.appendChild(backdrop);

    var close = function () { backdrop.remove(); };
    backdrop.querySelector('.es-edit-modal-close').addEventListener('click', close);
    backdrop.querySelector('.es-edit-btn-cancel').addEventListener('click', close);
    backdrop.addEventListener('click', function (e) { if (e.target === backdrop) close(); });

    backdrop.querySelector('.es-edit-btn-save').addEventListener('click', function () {
      var n = document.getElementById('es-cd-nome').value.trim();
      var c = document.getElementById('es-cd-cognome').value.trim();
      var clb = document.getElementById('es-cd-club').value.trim();
      var bio = document.getElementById('es-cd-bio').value.trim();

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
        window.showToast('Anagrafica Allenatore salvata con successo!', 'success');
      }
      render(user);
    });
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
        openCoachEditModal(userObj());
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
    var nu = document.getElementById('es-nu');
    if (nu) nu.hidden = true;
    var eq = document.getElementById('es-eq');
    if (eq) eq.hidden = true;
    var sg = document.getElementById('es-sg');
    if (sg) sg.hidden = true;
    var bt = document.getElementById('es-bt');
    if (bt) bt.hidden = true;
    box.innerHTML = html(user);
    box.hidden = false;
    host.classList.add('es-pd-on');
    host.classList.remove('es-vice-on', 'es-ma-on', 'es-med-on', 'es-obs-on', 'es-tm-on', 'es-gk-on', 'es-at-on', 'es-yg-on', 'es-dg-on', 'es-nu-on');
    if (group) {
      group.classList.add('is-coach-dash');
      group.classList.remove('is-vice-dash', 'is-ma-dash', 'is-med-dash', 'is-obs-dash', 'is-tm-dash', 'is-gk-dash', 'is-at-dash', 'is-yg-dash', 'is-dg-dash', 'is-nu-dash');
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
