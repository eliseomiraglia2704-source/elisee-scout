/* Elisee Scout — Control Center overview (dati da cluster, GDPR, Autopilot). */
(function () {
  'use strict';

  var lastSyncAt = Date.now();
  var pane = 'admin';

  function $(id) { return document.getElementById(id); }
  function toast(msg, kind) {
    if (typeof window.showToast === 'function') window.showToast(msg, kind || 'info');
  }
  function fmt(n) {
    return Number(n || 0).toLocaleString('it-IT');
  }
  function initials(name) {
    var p = String(name || 'AD').trim().split(/\s+/);
    return ((p[0] || 'A').charAt(0) + (p[1] || p[0] || 'D').charAt(0)).toUpperCase();
  }

  function cluster() {
    return window.EliseeAICluster || null;
  }

  function setText(id, v) {
    var el = $(id);
    if (el) el.textContent = v;
  }

  function showPane(name) {
    pane = name || 'admin';
    var dash = $('admin-authenticated-dashboard');
    if (!dash) return;
    dash.classList.add('es-cc');
    var map = {
      admin: 'es-cc-overview',
      privacy: 'es-cc-privacy-section',
      autopilot: 'es-cc-autopilot-section',
      manager: 'es-mgr-admin-wrap',
      card: 'es-card-admin-wrap'
    };
    Object.keys(map).forEach(function (k) {
      var el = $(map[k]);
      if (!el) return;
      if ((k === 'manager' || k === 'card') && el.parentElement && el.parentElement.id === 'es-cc-overview') {
        dash.appendChild(el);
      }
      if (k === pane) {
        el.hidden = false;
        el.style.display = '';
        el.removeAttribute('hidden');
      } else {
        el.hidden = true;
        el.style.display = 'none';
      }
    });
    document.querySelectorAll('.pf-gov-bar .gov-btn').forEach(function (b) {
      var tab = b.getAttribute('data-cc-tab') || '';
      b.classList.toggle('active', tab === pane || (pane === 'admin' && b.id === 'btn-show-admin'));
    });
    if (pane === 'admin') {
      try { localStorage.setItem('elisee_active_dashboard_tab', 'admin'); } catch (_) {}
      refresh();
    }
    if (pane === 'privacy') {
      try { localStorage.setItem('elisee_active_dashboard_tab', 'privacy'); } catch (_) {}
      var paintPrivacy = function () {
        if (typeof window.renderPrivacyPanel === 'function') window.renderPrivacyPanel();
      };
      if (window.EliseePersist && typeof window.EliseePersist.pullComplaints === 'function') {
        window.EliseePersist.pullComplaints(function () {
          if (window.EliseePersist.pullAmbassador) window.EliseePersist.pullAmbassador(paintPrivacy);
          else paintPrivacy();
        });
      } else paintPrivacy();
    }
    if (pane === 'manager' && window.EliseeManager && typeof window.EliseeManager.renderAdmin === 'function') {
      try { window.EliseeManager.renderAdmin(); } catch (_) {}
    }
    if (pane === 'autopilot' && window.EliseeAutoPilot && typeof window.EliseeAutoPilot.open === 'function') {
      window.EliseeAutoPilot.open();
    }
  }

  function relative(ts) {
    if (!ts) return 'in attesa';
    var s = Math.max(0, Math.round((Date.now() - ts) / 1000));
    if (s < 5) return 'adesso';
    if (s < 60) return s + 's fa';
    if (s < 3600) return Math.round(s / 60) + ' min fa';
    return Math.round(s / 3600) + ' h fa';
  }

  function groupSwarms(swarms) {
    var g = { sync: 0, gdpr: 0, notifiche: 0, altro: 0 };
    (swarms || []).forEach(function (s) {
      var id = String(s.id || '');
      var n = Number(s.active != null ? s.active : s.size) || 0;
      if (/orchestrate|heal|campionati|supervisors|platform_supervisors/.test(id)) g.sync += n;
      else if (/privacy|legal|antifake/.test(id)) g.gdpr += n;
      else if (/comms|support/.test(id)) g.notifiche += n;
      else g.altro += n;
    });
    return g;
  }

  function lineSvg(points) {
    var w = 520, h = 140, pad = 8;
    if (!points.length) points = [0, 0, 0, 0];
    var max = Math.max.apply(null, points.concat([1]));
    var step = (w - pad * 2) / Math.max(points.length - 1, 1);
    var d = points.map(function (v, i) {
      var x = pad + i * step;
      var y = h - pad - (v / max) * (h - pad * 2);
      return (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }).join(' ');
    var area = d + ' L' + (pad + (points.length - 1) * step).toFixed(1) + ' ' + (h - pad) + ' L' + pad + ' ' + (h - pad) + ' Z';
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" aria-hidden="true">' +
      '<path d="' + area + '" fill="rgba(56,189,248,0.12)"></path>' +
      '<path d="' + d + '" fill="none" stroke="#38bdf8" stroke-width="2"></path></svg>';
  }

  function donutSvg(g) {
    var total = g.sync + g.gdpr + g.notifiche + g.altro || 1;
    var segs = [
      { k: 'sync', c: '#38bdf8', n: g.sync },
      { k: 'gdpr', c: '#5eead4', n: g.gdpr },
      { k: 'notifiche', c: '#94a3b8', n: g.notifiche },
      { k: 'altro', c: '#64748b', n: g.altro }
    ];
    var r = 42, c = 2 * Math.PI * r, acc = 0;
    var circles = segs.map(function (s) {
      var len = (s.n / total) * c;
      var dash = len + ' ' + (c - len);
      var el = '<circle cx="60" cy="60" r="' + r + '" fill="none" stroke="' + s.c + '" stroke-width="10" stroke-dasharray="' + dash + '" stroke-dashoffset="' + (-acc) + '" transform="rotate(-90 60 60)"></circle>';
      acc += len;
      return el;
    }).join('');
    return '<svg viewBox="0 0 120 120">' + circles + '</svg>';
  }

  function hourBuckets() {
    var buckets = [];
    for (var i = 0; i < 12; i++) buckets.push(0);
    var cl = cluster();
    var log = cl && typeof cl.getLog === 'function' ? cl.getLog() : [];
    var now = Date.now();
    log.forEach(function (e) {
      var t = e.ts || e.t || 0;
      if (typeof t === 'string') t = Date.parse(t) || 0;
      if (!t && e.tLabel) return;
      var age = now - t;
      if (age < 0 || age > 24 * 3600 * 1000) return;
      var slot = 11 - Math.min(11, Math.floor(age / (2 * 3600 * 1000)));
      buckets[slot] += 1;
    });
    if (!log.length && cl && cl.getOps) {
      var ops = Number(cl.getOps()) || 0;
      buckets[buckets.length - 1] = ops;
    }
    return buckets;
  }

  function refresh() {
    var cl = cluster();
    var total = cl && cl.TOTAL ? cl.TOTAL : 3142;
    var active = cl && typeof cl.getActive === 'function' ? cl.getActive() : 0;
    var pct = total ? Math.round((active / total) * 100) : 0;
    setText('es-cc-stat-jobs', fmt(active) + ' / ' + fmt(total));
    setText('es-cc-stat-jobs-delta', cl && cl.isOnline && cl.isOnline() ? 'cluster online' : 'cluster in avvio');
    setText('es-cc-pct-val', pct + '% operativo');
    var bar = $('es-cc-pct-bar');
    if (bar) bar.style.width = Math.max(0, Math.min(100, pct)) + '%';

    var adminOn = false, privacyOn = false;
    try {
      adminOn = localStorage.getItem('elisee_admin_auth') === 'true';
      privacyOn = localStorage.getItem('elisee_privacy_auth') === 'true';
    } catch (_) {}
    setText('es-cc-stat-admin', adminOn ? 'Online' : 'Offline');
    var ab = $('es-cc-stat-admin-badge');
    if (ab) {
      ab.textContent = adminOn ? 'sessione attiva' : 'non autenticato';
      ab.className = 'es-cc-stat-sub es-cc-badge ' + (adminOn ? 'is-on' : 'is-off');
    }
    setText('es-cc-stat-privacy', privacyOn ? 'Online' : 'Offline');
    var last = 0;
    try { last = parseInt(localStorage.getItem('elisee_last_activity') || '0', 10) || 0; } catch (_) {}
    var seen = last ? new Date(last).toLocaleString('it-IT') : '—';
    setText('es-cc-stat-privacy-seen', 'ultimo accesso ' + (privacyOn ? 'ora' : seen));
    setText('presence-last-seen', 'Ultimo accesso Responsabile Privacy: ' + seen);
    var gb = $('garante-status-badge');
    if (gb) gb.textContent = privacyOn ? 'ONLINE' : 'OFFLINE';

    var log = cl && typeof cl.getLog === 'function' ? cl.getLog() : [];
    if (log.length) {
      var t0 = log[0].ts || log[0].t || lastSyncAt;
      if (typeof t0 === 'string') t0 = Date.parse(t0) || lastSyncAt;
      if (t0) lastSyncAt = t0;
    }
    var lat = cl && typeof cl.getLatency === 'function' ? cl.getLatency() : null;
    setText('es-cc-stat-sync', lat != null ? lat + ' ms' : '—');
    setText('es-telemetry-sec-count', 'ultimo evento ' + relative(lastSyncAt));

    var complaints = 0, anom = 0;
    try {
      var pc = JSON.parse(localStorage.getItem('elisee_platform_complaints') || localStorage.getItem('elisee_complaints') || '[]');
      if (Array.isArray(pc)) complaints = pc.filter(function (c) { return c.stato === 'in_lavorazione' || c.status === 'open'; }).length;
    } catch (_) {}
    if (window.EliseeAiGdpr && typeof window.EliseeAiGdpr.getOpenAnomalies === 'function') {
      try { anom = (window.EliseeAiGdpr.getOpenAnomalies() || []).length; } catch (_) {}
    }
    if (window.EliseeCampionatiSupervisors && window.EliseeCampionatiSupervisors.getAnomalies) {
      try { anom += (window.EliseeCampionatiSupervisors.getAnomalies() || []).length; } catch (_) {}
    }
    var alerts = complaints + anom;
    setText('es-cc-stat-alerts', fmt(alerts));
    setText('es-cc-stat-alerts-sub', complaints + ' reclami · ' + anom + ' anomalie');
    var sc = $('stat-complaints');
    if (sc && !sc.dataset.ccSkip) { /* leave live counters from app.js */ }

    var line = $('es-cc-line');
    if (line) line.innerHTML = lineSvg(hourBuckets());
    var swarms = cl && typeof cl.getSwarms === 'function' ? cl.getSwarms() : [];
    var g = groupSwarms(swarms);
    var donut = $('es-cc-donut');
    if (donut) donut.innerHTML = donutSvg(g);
    var legend = $('es-cc-legend');
    if (legend) {
      legend.innerHTML =
        '<li><i style="background:#38bdf8"></i> Sync / heal · ' + fmt(g.sync) + '</li>' +
        '<li><i style="background:#5eead4"></i> GDPR / trust · ' + fmt(g.gdpr) + '</li>' +
        '<li><i style="background:#94a3b8"></i> Notifiche · ' + fmt(g.notifiche) + '</li>' +
        '<li><i style="background:#64748b"></i> Altro · ' + fmt(g.altro) + '</li>';
    }

    var step = 0;
    try { step = parseInt(localStorage.getItem('elisee_approval_step') || '0', 10) || 0; } catch (_) {}
    setText('es-cc-trust-audit-txt', step >= 2 ? 'Ultimo audit superato' : (step === 1 ? 'DPIA in verifica' : 'In attesa di verifica'));
    var auditB = $('es-cc-trust-audit');
    if (auditB) auditB.textContent = step >= 2 ? 'OK' : 'Audit';

    paintWho(adminOn, privacyOn);
    var cardN = 0;
    try {
      if (window.EliseeCardAtelier && typeof window.EliseeCardAtelier.pendingCount === 'function') {
        cardN = window.EliseeCardAtelier.pendingCount();
      }
    } catch (_) {}
    var dot = $('es-cc-card-dot');
    if (dot) {
      dot.textContent = cardN ? String(cardN) : '';
      dot.hidden = !cardN;
    }
  }

  function paintWho(adminOn, privacyOn) {
    var name = 'Admin';
    var role = adminOn ? 'Amministratore piattaforma' : (privacyOn ? 'Responsabile Privacy GDPR' : 'Staff');
    var club = '';
    var photo = '';
    try {
      var u = JSON.parse(localStorage.getItem('elisee_active_user') || '{}') || {};
      var nm = [u.nome, u.cognome].filter(Boolean).join(' ').trim();
      if (nm) name = nm;
      else if (u.username) name = u.username;
      club = String(u.squadra || u.club || '').trim();
      photo = u.fotoUrl || '';
    } catch (_) {}
    setText('es-cc-who-name', name);
    setText('es-cc-who-role', role);
    setText('es-cc-who-club', club);
    var ava = $('es-cc-ava');
    if (ava) {
      if (photo && photo.length > 8) ava.innerHTML = '<img src="' + photo.replace(/"/g, '') + '" alt="">';
      else ava.textContent = initials(name);
    }
  }

  function forceSync() {
    lastSyncAt = Date.now();
    try {
      if (cluster() && typeof cluster().forceReboot === 'function') cluster().forceReboot();
      else if (cluster() && typeof cluster().runTask === 'function') {
        cluster().runTask('orchestrate', 'Sync manuale Control Center');
      }
    } catch (_) {}
    try {
      if (window.EliseeCampionatiSupervisors && window.EliseeCampionatiSupervisors.forceScan) {
        window.EliseeCampionatiSupervisors.forceScan();
      }
    } catch (_) {}
    try {
      if (window.EliseeAutoPilot && typeof window.EliseeAutoPilot.forceCycle === 'function') {
        window.EliseeAutoPilot.forceCycle();
      }
    } catch (_) {}
    toast('Sync pipeline avviato.', 'success');
    refresh();
  }

  function bind() {
    var dash = $('admin-authenticated-dashboard');
    if (!dash || dash.dataset.ccBound === '1') return;
    dash.dataset.ccBound = '1';
    dash.classList.add('es-cc');

    document.querySelectorAll('[data-cc-open]').forEach(function (b) {
      b.addEventListener('click', function () {
        var t = b.getAttribute('data-cc-open');
        var btn = document.querySelector('[data-cc-tab="' + t + '"]');
        if (btn) btn.click();
        else showPane(t);
      });
    });

    var qaAp = $('es-cc-qa-autopilot');
    if (qaAp) qaAp.addEventListener('click', function () {
      if (window.EliseeAutoPilot && window.EliseeAutoPilot.open) window.EliseeAutoPilot.open();
      else toast('AutoPilot in caricamento…', 'info');
    });
    var qaG = $('es-cc-qa-gdpr');
    if (qaG) qaG.addEventListener('click', function () {
      var b = $('btn-show-privacy');
      if (b) b.click();
      else showPane('privacy');
    });
    var qaS = $('es-cc-qa-sync');
    if (qaS) qaS.addEventListener('click', forceSync);
    var qaW = $('es-cc-qa-war');
    if (qaW) qaW.addEventListener('click', function () {
      if (window.EliseeWarRoom && window.EliseeWarRoom.open) window.EliseeWarRoom.open();
      else toast('War Room in caricamento…', 'info');
    });
    var qaF = $('es-cc-qa-fix');
    if (qaF) qaF.addEventListener('click', function () {
      var b = $('btn-run-autofix-demo');
      if (b) b.click();
    });
    var war = $('btn-open-war-room-admin');
    if (war && !war.dataset.ccBound) {
      war.dataset.ccBound = '1';
      war.addEventListener('click', function () {
        if (window.EliseeWarRoom && window.EliseeWarRoom.open) window.EliseeWarRoom.open();
      });
    }

    ['btn-show-admin', 'btn-show-privacy', 'btn-show-autopilot', 'btn-show-manager', 'btn-show-card-atelier'].forEach(function (id) {
      var el = $(id);
      if (!el || el.dataset.ccPaneBound) return;
      el.dataset.ccPaneBound = '1';
      el.addEventListener('click', function () {
        var t = el.getAttribute('data-cc-tab');
        if (t) showPane(t);
      });
    });
  }

  function boot() {
    bind();
    refresh();
  }

  window.EliseeCC = { showPane: showPane, refresh: refresh };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setInterval(function () {
    if ($('admin-authenticated-dashboard') && $('admin-authenticated-dashboard').style.display !== 'none') refresh();
  }, 4000);
})();
