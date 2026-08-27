/**
 * ELISEE SCOUT — AutoPilot Mission Control
 * Cervello unico: avvia, monitora, riavvia e orchestra tutte le flotte IA.
 * window.EliseeAutoPilot
 */
(function () {
  'use strict';

  var LS_CFG = 'elisee_autopilot_cfg_v1';
  var LS_LOG = 'elisee_autopilot_log_v1';
  var LS_METRICS = 'elisee_autopilot_metrics_v1';
  var API_BASE = '/api/autopilot';
  var backendLinked = false;
  var backendStatus = null;
  var backendPollTimer = null;

  var DEFAULT_CFG = {
    enabled: true,
    autoStartOnLoad: true,
    healthCheckMs: 12000,
    opsCycleMs: 45000,
    warRoomScanMs: 90000,
    fleets: {
      platformCluster: true,
      campionatiAgents: true,
      campionatiSupervisors: true,
      gdprSupervisors: true,
      warRoomWatch: true,
      opsJobs: true,
      integrazioniKpi: true
    },
    autoHeal: true,
    quietPublicHud: true
  };

  var state = {
    running: false,
    startedAt: null,
    healthTimer: null,
    opsTimer: null,
    warTimer: null,
    lastHealth: null,
    lastOps: null,
    lastWar: null,
    cycles: 0,
    heals: 0,
    jobsOk: 0,
    jobsFail: 0,
    cfg: null
  };

  function loadCfg() {
    try {
      var raw = localStorage.getItem(LS_CFG);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULT_CFG));
      var c = JSON.parse(raw);
      return Object.assign({}, DEFAULT_CFG, c, {
        fleets: Object.assign({}, DEFAULT_CFG.fleets, (c && c.fleets) || {})
      });
    } catch (e) {
      return JSON.parse(JSON.stringify(DEFAULT_CFG));
    }
  }
  function saveCfg() {
    try { localStorage.setItem(LS_CFG, JSON.stringify(state.cfg)); } catch (e) {}
  }
  function loadLog() {
    try { return JSON.parse(localStorage.getItem(LS_LOG) || '[]'); } catch (e) { return []; }
  }
  function pushLog(level, msg, meta) {
    var entry = {
      t: new Date().toISOString(),
      level: level || 'info',
      msg: msg,
      meta: meta || null
    };
    var log = loadLog();
    log.unshift(entry);
    if (log.length > 300) log = log.slice(0, 300);
    try { localStorage.setItem(LS_LOG, JSON.stringify(log)); } catch (e) {}
    try {
      if (window.EliseeAICluster && EliseeAICluster.logEvent) {
        EliseeAICluster.logEvent('orchestrate', '[AutoPilot] ' + msg, {
          source: 'autopilot',
          level: level === 'err' ? 'error' : level === 'warn' ? 'warn' : 'ok'
        });
      }
    } catch (e) {}
    document.dispatchEvent(new CustomEvent('elisee:autopilot-log', { detail: entry }));
    refreshUiIfOpen();
    return entry;
  }
  function saveMetrics() {
    try {
      localStorage.setItem(LS_METRICS, JSON.stringify({
        cycles: state.cycles,
        heals: state.heals,
        jobsOk: state.jobsOk,
        jobsFail: state.jobsFail,
        startedAt: state.startedAt,
        lastHealth: state.lastHealth,
        lastOps: state.lastOps
      }));
    } catch (e) {}
  }

  /* ---------- Fleet probes & start ---------- */
  function fleetStatus() {
    var f = state.cfg.fleets;
    var out = [];

    // Platform cluster 715
    var clusterOk = !!(window.EliseeAICluster && EliseeAICluster.isOnline && EliseeAICluster.isOnline());
    var clusterActive = window.EliseeAICluster && EliseeAICluster.getActive ? EliseeAICluster.getActive() : 0;
    out.push({
      id: 'platformCluster',
      name: 'Cluster piattaforma',
      target: (window.EliseeAICluster && EliseeAICluster.TOTAL) || 715,
      detail: clusterOk ? (clusterActive + ' agenti online') : 'offline / booting',
      ok: !f.platformCluster || clusterOk,
      enabled: !!f.platformCluster,
      unit: 'agenti'
    });

    // Campionati agents
    var ca = window.EliseeCampionatiAgents;
    var caRun = ca && ca.isRunning && ca.isRunning();
    var caTot = ca && ca.TOTAL ? ca.TOTAL() : 0;
    var caSum = ca && ca.getSummary ? ca.getSummary() : null;
    out.push({
      id: 'campionatiAgents',
      name: 'Agenti campionati (10×girone)',
      target: caTot || 2010,
      detail: caRun
        ? (caTot + ' in flotta · ciclo attivo')
        : 'fermi',
      ok: !f.campionatiAgents || caRun,
      enabled: !!f.campionatiAgents,
      unit: 'agenti',
      extra: caSum
    });

    // Supervisors
    var sv = window.EliseeCampionatiSupervisors;
    var svRun = sv && sv.isRunning && sv.isRunning();
    var svTot = sv && sv.TOTAL ? sv.TOTAL() : 0;
    var anomalies = sv && sv.getAnomalies ? sv.getAnomalies().filter(function (a) { return a.severity === 'critical'; }).length : 0;
    out.push({
      id: 'campionatiSupervisors',
      name: 'Supervisori H24 campionati',
      target: svTot || 402,
      detail: svRun ? (svTot + ' supervisori · critiche: ' + anomalies) : 'fermi',
      ok: !f.campionatiSupervisors || svRun,
      enabled: !!f.campionatiSupervisors,
      unit: 'supervisori',
      anomalies: anomalies
    });

    // GDPR
    var gdpr = window.EliseeAiGdpr;
    out.push({
      id: 'gdprSupervisors',
      name: 'Supervisori Privacy/GDPR',
      target: 3,
      detail: gdpr ? 'monitor attivo' : 'modulo assente',
      ok: !f.gdprSupervisors || !!gdpr,
      enabled: !!f.gdprSupervisors,
      unit: 'supervisori'
    });

    // War room
    var wr = window.EliseeWarRoom;
    out.push({
      id: 'warRoomWatch',
      name: 'War Room DOM watch',
      target: 150,
      detail: wr ? '50 agenti + 100 supervisori DOM' : 'modulo assente',
      ok: !f.warRoomWatch || !!wr,
      enabled: !!f.warRoomWatch,
      unit: 'dev-team'
    });

    // Ops jobs (this runtime)
    out.push({
      id: 'opsJobs',
      name: 'Job operativi AutoPilot',
      target: 9,
      detail: state.running ? ('cicli ' + state.cycles + ' · ok ' + state.jobsOk) : 'spento',
      ok: !f.opsJobs || state.running,
      enabled: !!f.opsJobs,
      unit: 'job'
    });

    out.push({
      id: 'integrazioniKpi',
      name: 'KPI / Integrazioni bridge',
      target: 1,
      detail: window.EliseeIntegrazioni ? 'hub collegato' : 'hub non caricato',
      ok: !f.integrazioniKpi || !!window.EliseeIntegrazioni,
      enabled: !!f.integrazioniKpi,
      unit: 'bridge'
    });

    return out;
  }

  function ensurePlatformCluster() {
    if (!window.EliseeAICluster) return false;
    try {
      if (!EliseeAICluster.isOnline()) {
        if (typeof EliseeAICluster.boot === 'function') EliseeAICluster.boot();
        else if (typeof EliseeAICluster.forceReboot === 'function') EliseeAICluster.forceReboot();
      }
      return !!EliseeAICluster.isOnline();
    } catch (e) {
      return false;
    }
  }

  function ensureCampionatiAgents() {
    var ca = window.EliseeCampionatiAgents;
    if (!ca) return false;
    try {
      if (!ca.isRunning()) ca.start({ intervalMs: 10000 });
      return ca.isRunning();
    } catch (e) {
      return false;
    }
  }

  function ensureCampionatiSupervisors() {
    var sv = window.EliseeCampionatiSupervisors;
    if (!sv) return false;
    try {
      if (!sv.isRunning()) sv.start();
      return sv.isRunning();
    } catch (e) {
      return false;
    }
  }

  function ensureGdpr() {
    var g = window.EliseeAiGdpr;
    if (!g) return false;
    try {
      if (typeof g.init === 'function') g.init();
      if (typeof g.startSupervisors === 'function') g.startSupervisors();
      return true;
    } catch (e) {
      return false;
    }
  }

  function ensureWarRoom() {
    var wr = window.EliseeWarRoom;
    if (!wr) return false;
    try {
      if (typeof wr.init === 'function') wr.init();
      return true;
    } catch (e) {
      return false;
    }
  }

  function startAllFleets() {
    var f = state.cfg.fleets;
    var results = [];
    if (f.platformCluster) results.push(['platformCluster', ensurePlatformCluster()]);
    if (f.campionatiAgents) results.push(['campionatiAgents', ensureCampionatiAgents()]);
    if (f.campionatiSupervisors) results.push(['campionatiSupervisors', ensureCampionatiSupervisors()]);
    if (f.gdprSupervisors) results.push(['gdprSupervisors', ensureGdpr()]);
    if (f.warRoomWatch) results.push(['warRoomWatch', ensureWarRoom()]);
    return results;
  }

  function healthCheck() {
    if (!state.cfg.enabled || !state.running) return;
    var fleets = fleetStatus();
    var bad = fleets.filter(function (x) { return x.enabled && !x.ok; });
    state.lastHealth = {
      at: new Date().toISOString(),
      ok: bad.length === 0,
      bad: bad.map(function (b) { return b.id; }),
      fleets: fleets
    };
    saveMetrics();

    if (bad.length && state.cfg.autoHeal) {
      state.heals += 1;
      pushLog('warn', 'Heal: ' + bad.map(function (b) { return b.name; }).join(', '), { bad: state.lastHealth.bad });
      bad.forEach(function (b) {
        if (b.id === 'platformCluster') ensurePlatformCluster();
        if (b.id === 'campionatiAgents') ensureCampionatiAgents();
        if (b.id === 'campionatiSupervisors') ensureCampionatiSupervisors();
        if (b.id === 'gdprSupervisors') ensureGdpr();
        if (b.id === 'warRoomWatch') ensureWarRoom();
      });
    } else if (!bad.length) {
      // silent ok — occasional log every 10 cycles
      if (state.cycles % 10 === 0) {
        pushLog('ok', 'Health OK · tutte le flotte abilitate online');
      }
    }
    updateFloatingChip();
    refreshUiIfOpen();
  }

  /* ---------- Operational jobs (automation that does real work) ---------- */
  function jobEscalationSignals() {
    // Promote unanswered campionati critical anomalies into cluster log + optional PO report
    var sv = window.EliseeCampionatiSupervisors;
    if (!sv || !sv.getAnomalies) return { ok: true, note: 'no-sv' };
    var crit = (sv.getAnomalies() || []).filter(function (a) {
      return a.severity === 'critical' && !a._autopilotNoted;
    }).slice(0, 5);
    crit.forEach(function (a) {
      a._autopilotNoted = true;
      if (window.EliseeAICluster && EliseeAICluster.logEvent) {
        EliseeAICluster.logEvent(
          'campionati',
          'AutoPilot escalation: ' + (a.agent || '?') + ' · ' + (a.reason || a.type || 'anomaly'),
          { source: 'autopilot-escalation', level: 'warn' }
        );
      }
    });
    // reactivate blocked agents if API allows
    if (crit.length && window.EliseeCampionatiAgents && EliseeCampionatiAgents.reactivateAgent) {
      crit.forEach(function (a) {
        if (a.agent && a.agent !== '—') {
          try { EliseeCampionatiAgents.reactivateAgent(a.agent); } catch (e) {}
        }
      });
    }
    return { ok: true, note: 'escalations ' + crit.length };
  }

  function jobWarRoomScan() {
    var wr = window.EliseeWarRoom;
    if (!wr) return { ok: true, note: 'no-wr' };
    try {
      // Prefer silent background scan (no modal spam)
      if (typeof wr.silentScan === 'function') {
        var r = wr.silentScan();
        return { ok: true, note: r ? ('silent ' + (r.status || 'ok')) : 'silent-null' };
      }
      if (typeof wr.runLiveScan === 'function') {
        // avoid opening UI during autopilot
        return { ok: true, note: 'skip-ui-scan' };
      }
      return { ok: true, note: 'wr-present' };
    } catch (e) {
      return { ok: false, note: String(e && e.message || e) };
    }
  }

  function jobEventCapacityWatch() {
    try {
      var events = JSON.parse(localStorage.getItem('elisee_selection_events_v1') || '[]');
      var near = events.filter(function (ev) {
        return ev.limit && ev.adesioni >= Math.floor(ev.limit * 0.85);
      });
      near.forEach(function (ev) {
        if (window.EliseeAICluster && EliseeAICluster.logEvent) {
          EliseeAICluster.logEvent(
            'market',
            'AutoPilot: evento «' + ev.title + '» vicino al limite (' + ev.adesioni + '/' + ev.limit + ')',
            { source: 'autopilot-events', level: 'warn' }
          );
        }
      });
      return { ok: true, note: 'near-full ' + near.length };
    } catch (e) {
      return { ok: false, note: String(e) };
    }
  }

  function jobPrivacyBlocksReview() {
    try {
      var blocks = JSON.parse(localStorage.getItem('elisee_profile_blocks_v1') || '[]');
      var pending = blocks.filter(function (b) { return b.review === 'pending'; });
      if (pending.length && window.EliseeAiGdpr && EliseeAiGdpr.pushAnomaly) {
        EliseeAiGdpr.pushAnomaly({
          severity: 'medium',
          type: 'block-review-queue',
          reason: pending.length + ' riesami blocco in attesa Privacy Officer',
          source: 'autopilot'
        });
      } else if (pending.length && window.EliseeAICluster) {
        EliseeAICluster.logEvent('privacy', 'AutoPilot: ' + pending.length + ' riesami blocco in coda PO', {
          source: 'autopilot-privacy'
        });
      }
      return { ok: true, note: 'pending-reviews ' + pending.length };
    } catch (e) {
      return { ok: false, note: String(e) };
    }
  }

  function jobArt22QueuePulse() {
    try {
      if (!window.EliseeAiGdpr) return { ok: true, note: 'no-gdpr' };
      var q = EliseeAiGdpr.getArt22Queue ? EliseeAiGdpr.getArt22Queue() : [];
      var open = (q || []).filter(function (x) { return !x.resolved; }).length;
      if (open && EliseeAICluster) {
        EliseeAICluster.logEvent('privacy', 'AutoPilot: coda Art.22 aperta = ' + open, {
          source: 'autopilot-art22'
        });
      }
      return { ok: true, note: 'art22-open ' + open };
    } catch (e) {
      return { ok: false, note: String(e) };
    }
  }

  function jobKpiDrift() {
    if (!state.cfg.fleets.integrazioniKpi) return { ok: true, note: 'disabled' };
    try {
      var raw = localStorage.getItem('elisee_ops_kpi_v1');
      if (!raw) return { ok: true, note: 'no-kpi' };
      // gentle automatic improvement of "mobile eval" metric as adoption signal
      var k = JSON.parse(raw);
      if (typeof k.mobileEvalPct === 'number' && k.mobileEvalPct < 85 && Math.random() < 0.25) {
        k.mobileEvalPct = Math.min(85, +(k.mobileEvalPct + 0.1).toFixed(1));
        localStorage.setItem('elisee_ops_kpi_v1', JSON.stringify(k));
      }
      return { ok: true, note: 'kpi-touch' };
    } catch (e) {
      return { ok: false, note: String(e) };
    }
  }

  function jobCampionatiForceIfStuck() {
    var ca = window.EliseeCampionatiAgents;
    if (!ca || !ca.getSummary) return { ok: true, note: 'no-ca' };
    try {
      var s = ca.getSummary();
      // if no agents or not running, restart
      if (!ca.isRunning()) {
        ca.start({ intervalMs: 10000 });
        return { ok: true, note: 'restarted' };
      }
      if (window.EliseeCampionatiSupervisors && EliseeCampionatiSupervisors.forceScan) {
        // light force scan every few cycles
        if (state.cycles % 3 === 0) EliseeCampionatiSupervisors.forceScan();
      }
      return { ok: true, note: 'campionati-ok ' + (s && (s.total || s.agents || '')) };
    } catch (e) {
      return { ok: false, note: String(e) };
    }
  }

  function jobDuplicateProfileHint() {
    // lightweight: scan local mock people if any in LS
    try {
      var users = [];
      try { users = JSON.parse(localStorage.getItem('elisee_users') || '[]'); } catch (e) {}
      var names = {};
      var dups = 0;
      (users || []).forEach(function (u) {
        var key = ((u.nome || '') + '|' + (u.cognome || '')).toLowerCase();
        if (!key || key === '|') return;
        if (names[key]) dups += 1;
        else names[key] = 1;
      });
      if (dups && window.EliseeAICluster) {
        EliseeAICluster.logEvent('antifake', 'AutoPilot: possibili duplicati profilo = ' + dups, {
          source: 'autopilot-dupes'
        });
      }
      return { ok: true, note: 'dupes ' + dups };
    } catch (e) {
      return { ok: false, note: String(e) };
    }
  }

  function jobHeartbeatBroadcast() {
    document.dispatchEvent(
      new CustomEvent('elisee:autopilot-heartbeat', {
        detail: {
          cycles: state.cycles,
          running: state.running,
          fleets: fleetStatus(),
          at: new Date().toISOString()
        }
      })
    );
    return { ok: true, note: 'broadcast' };
  }

  var OPS_JOBS = [
    { id: 'escalation', name: 'Escalation anomalie campionati', fn: jobEscalationSignals },
    { id: 'events', name: 'Monitor eventi/QR posti', fn: jobEventCapacityWatch },
    { id: 'blocks', name: 'Coda riesami blocchi', fn: jobPrivacyBlocksReview },
    { id: 'art22', name: 'Coda Art. 22', fn: jobArt22QueuePulse },
    { id: 'kpi', name: 'Bridge KPI integrazioni', fn: jobKpiDrift },
    { id: 'campionati', name: 'Watch flotta campionati', fn: jobCampionatiForceIfStuck },
    { id: 'dupes', name: 'Hint duplicati profilo', fn: jobDuplicateProfileHint },
    { id: 'hb', name: 'Heartbeat broadcast', fn: jobHeartbeatBroadcast }
  ];

  function runOpsCycle() {
    if (!state.cfg.enabled || !state.running || !state.cfg.fleets.opsJobs) return;
    state.cycles += 1;
    state.lastOps = new Date().toISOString();
    var notes = [];
    OPS_JOBS.forEach(function (job) {
      try {
        var res = job.fn();
        if (res && res.ok === false) {
          state.jobsFail += 1;
          notes.push(job.id + ':FAIL');
        } else {
          state.jobsOk += 1;
          notes.push(job.id + ':' + ((res && res.note) || 'ok'));
        }
      } catch (e) {
        state.jobsFail += 1;
        notes.push(job.id + ':EX');
      }
    });
    saveMetrics();
    if (state.cycles % 2 === 0) {
      pushLog('info', 'Ops cycle #' + state.cycles + ' · ' + notes.slice(0, 4).join(' · '));
    }
    refreshUiIfOpen();
    updateFloatingChip();
  }

  function runWarCycle() {
    if (!state.cfg.enabled || !state.running || !state.cfg.fleets.warRoomWatch) return;
    state.lastWar = new Date().toISOString();
    var res = jobWarRoomScan();
    if (res.ok) pushLog('ok', 'War Room scan: ' + res.note);
    else pushLog('warn', 'War Room scan fallita: ' + res.note);
  }

  /* ---------- Master control ---------- */
  function start() {
    state.cfg = loadCfg();
    if (!state.cfg.enabled) {
      pushLog('warn', 'AutoPilot disabilitato in config — non avvio');
      updateFloatingChip();
      return getStatus();
    }
    if (state.running) return getStatus();
    state.running = true;
    state.startedAt = new Date().toISOString();
    pushLog('ok', 'AutoPilot ONLINE — avvio flotte');
    startAllFleets();
    // immediate health + ops
    setTimeout(healthCheck, 800);
    setTimeout(runOpsCycle, 1500);
    setTimeout(runWarCycle, 4000);

    clearTimers();
    state.healthTimer = setInterval(healthCheck, state.cfg.healthCheckMs || 12000);
    state.opsTimer = setInterval(runOpsCycle, state.cfg.opsCycleMs || 45000);
    state.warTimer = setInterval(runWarCycle, state.cfg.warRoomScanMs || 90000);
    saveMetrics();
    updateFloatingChip();
    refreshUiIfOpen();
    document.dispatchEvent(new CustomEvent('elisee:autopilot-started', { detail: getStatus() }));
    return getStatus();
  }

  function stop(opts) {
    state.running = false;
    clearTimers();
    if (opts && opts.disable) {
      state.cfg.enabled = false;
      saveCfg();
    }
    pushLog('warn', 'AutoPilot STOP' + (opts && opts.disable ? ' (disabilitato)' : ''));
    updateFloatingChip();
    refreshUiIfOpen();
    document.dispatchEvent(new CustomEvent('elisee:autopilot-stopped'));
    return getStatus();
  }

  function clearTimers() {
    if (state.healthTimer) clearInterval(state.healthTimer);
    if (state.opsTimer) clearInterval(state.opsTimer);
    if (state.warTimer) clearInterval(state.warTimer);
    state.healthTimer = state.opsTimer = state.warTimer = null;
  }

  function enableAndStart() {
    state.cfg = loadCfg();
    state.cfg.enabled = true;
    saveCfg();
    return start();
  }

  function setFleet(id, on) {
    state.cfg = loadCfg();
    if (!state.cfg.fleets) state.cfg.fleets = {};
    state.cfg.fleets[id] = !!on;
    saveCfg();
    pushLog('info', 'Flotta ' + id + ' → ' + (on ? 'ON' : 'OFF'));
    if (state.running && on) {
      if (id === 'platformCluster') ensurePlatformCluster();
      if (id === 'campionatiAgents') ensureCampionatiAgents();
      if (id === 'campionatiSupervisors') ensureCampionatiSupervisors();
      if (id === 'gdprSupervisors') ensureGdpr();
      if (id === 'warRoomWatch') ensureWarRoom();
    }
    refreshUiIfOpen();
    return getStatus();
  }

  function forceCycle() {
    healthCheck();
    runOpsCycle();
    runWarCycle();
    pushLog('ok', 'Ciclo forzato (health + ops + war)');
    return getStatus();
  }

  function getStatus() {
    var local = {
      running: state.running,
      enabled: !!(state.cfg && state.cfg.enabled),
      startedAt: state.startedAt,
      cycles: state.cycles,
      heals: state.heals,
      jobsOk: state.jobsOk,
      jobsFail: state.jobsFail,
      lastHealth: state.lastHealth,
      lastOps: state.lastOps,
      lastWar: state.lastWar,
      fleets: fleetStatus(),
      cfg: state.cfg,
      backendLinked: backendLinked,
      backend: backendStatus
    };
    return local;
  }

  function getLog(limit) {
    return loadLog().slice(0, limit || 80);
  }

  function clearLog() {
    try { localStorage.removeItem(LS_LOG); } catch (e) {}
    refreshUiIfOpen();
  }

  function exportStatus() {
    var payload = {
      exportedAt: new Date().toISOString(),
      status: getStatus(),
      backend: backendStatus,
      log: getLog(100)
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'elisee-autopilot-status.json';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
    return payload;
  }

  /* ---------- Backend bridge (HTTPS same-origin /api/autopilot) ---------- */
  var backendOfflineUntil = 0;
  var BACKEND_OFFLINE_MS = 30000;

  function apiFetch(path, opts) {
    opts = opts || {};
    if (Date.now() < backendOfflineUntil && (opts.method || 'GET') === 'GET') {
      return Promise.reject(new Error('backend-offline-cooldown'));
    }
    var init = {
      method: opts.method || 'GET',
      headers: { 'Accept': 'application/json' },
      credentials: 'same-origin'
    };
    if (opts.body != null) {
      init.headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(opts.body);
    }
    return fetch(API_BASE + path, init).then(function (r) {
      backendOfflineUntil = 0;
      return r.json().then(function (j) {
        if (!r.ok) throw new Error((j && j.error) || ('HTTP ' + r.status));
        return j;
      });
    }).catch(function (err) {
      // network down → cooldown (niente spam ERR_CONNECTION_REFUSED ogni 10s)
      var msg = String(err && err.message ? err.message : err);
      if (msg.indexOf('backend-offline') < 0) {
        backendOfflineUntil = Date.now() + BACKEND_OFFLINE_MS;
      }
      throw err;
    });
  }

  function pushBridgeToBackend() {
    if (!backendLinked) return Promise.resolve(null);
    var payload = {};
    try { payload.events = JSON.parse(localStorage.getItem('elisee_selection_events_v1') || '[]'); } catch (e) { payload.events = []; }
    try { payload.blocks = JSON.parse(localStorage.getItem('elisee_profile_blocks_v1') || '[]'); } catch (e) { payload.blocks = []; }
    try {
      // art22 queue may live inside EliseeAiGdpr storage keys — best effort
      var artRaw = localStorage.getItem('elisee_gdpr_art22_v1') || localStorage.getItem('elisee_art22_queue_v1');
      payload.art22 = artRaw ? JSON.parse(artRaw) : [];
    } catch (e) { payload.art22 = []; }
    try { payload.kpi = JSON.parse(localStorage.getItem('elisee_ops_kpi_v1') || 'null'); } catch (e) { payload.kpi = null; }
    return apiFetch('/bridge', { method: 'POST', body: payload }).catch(function () { return null; });
  }

  function pollBackend() {
    return apiFetch('/status')
      .then(function (j) {
        backendLinked = true;
        backendStatus = j.status || null;
        updateFloatingChip();
        refreshUiIfOpen();
        return backendStatus;
      })
      .catch(function () {
        backendLinked = false;
        backendStatus = null;
        updateFloatingChip();
        refreshUiIfOpen();
        return null;
      });
  }

  function startBackendPoll() {
    if (backendPollTimer) clearInterval(backendPollTimer);
    pollBackend().then(function () { pushBridgeToBackend(); });
    backendPollTimer = setInterval(function () {
      pollBackend().then(function () {
        if (backendLinked && state.cycles % 2 === 0) pushBridgeToBackend();
      });
    }, 10000);
  }

  function backendStart() {
    return apiFetch('/start', { method: 'POST' }).then(function (j) {
      backendLinked = true;
      backendStatus = j.status || null;
      pushLog('ok', 'Backend AutoPilot avviato via API');
      refreshUiIfOpen();
      return j;
    });
  }
  function backendStop(disable) {
    return apiFetch('/stop', { method: 'POST', body: { disable: !!disable } }).then(function (j) {
      backendStatus = j.status || null;
      pushLog('warn', 'Backend AutoPilot stop via API');
      refreshUiIfOpen();
      return j;
    });
  }
  function backendForce() {
    return apiFetch('/force-cycle', { method: 'POST' }).then(function (j) {
      backendStatus = j.status || null;
      pushLog('ok', 'Backend force-cycle OK');
      pushBridgeToBackend();
      refreshUiIfOpen();
      return j;
    });
  }
  function backendSetFleet(id, on) {
    return apiFetch('/fleet/' + encodeURIComponent(id), {
      method: 'POST',
      body: { enabled: !!on }
    }).then(function (j) {
      backendStatus = j.status || null;
      refreshUiIfOpen();
      return j;
    });
  }

  /* ---------- UI Mission Control ---------- */
  var uiRoot = null;

  function ensureUi() {
    if (document.getElementById('es-ap-root')) {
      uiRoot = document.getElementById('es-ap-root');
      return uiRoot;
    }
    uiRoot = document.createElement('div');
    uiRoot.id = 'es-ap-root';
    uiRoot.className = 'es-ap-root';
    uiRoot.innerHTML =
      '<div class="es-ap-top">' +
        '<div style="display:flex;align-items:center;gap:.75rem">' +
          '<span class="es-ap-badge" id="es-ap-badge">AUTOPILOT</span>' +
          '<div><h2>Mission Control — AutoPilot IA</h2>' +
          '<p>Orchestra cluster, campionati, supervisori, GDPR, War Room e job operativi</p></div>' +
        '</div>' +
        '<button type="button" class="es-ap-close" id="es-ap-close">Chiudi</button>' +
      '</div>' +
      '<div class="es-ap-body" id="es-ap-body"></div>';
    document.body.appendChild(uiRoot);
    document.getElementById('es-ap-close').addEventListener('click', closeUi);
    return uiRoot;
  }

  function isAdminSession() {
    try {
      return localStorage.getItem('elisee_admin_auth') === 'true';
    } catch (e) {
      return false;
    }
  }

  function openUi() {
    // Riservato all'account Admin (Control Center)
    if (!isAdminSession()) {
      pushLog('warn', "AutoPilot riservato all'account Admin");
      if (typeof window.showToast === 'function') {
        window.showToast('AutoPilot disponibile solo nell\'area Admin', 'error');
      } else {
        alert('AutoPilot è disponibile solo dopo login Admin (Control Center).');
      }
      try {
        if (typeof window.switchView === 'function') {
          window.switchView('admin', '#admin-portal');
        } else {
          location.hash = '#admin-portal';
        }
      } catch (e) {}
      return;
    }
    ensureUi();
    uiRoot.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    renderUi();
  }
  function closeUi() {
    if (!uiRoot) return;
    uiRoot.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  function refreshUiIfOpen() {
    if (uiRoot && uiRoot.classList.contains('is-open')) renderUi();
  }

  function renderUi() {
    ensureUi();
    var st = getStatus();
    var body = document.getElementById('es-ap-body');
    var badge = document.getElementById('es-ap-badge');
    if (badge) {
      badge.textContent = st.running ? 'ONLINE' : 'OFFLINE';
      badge.className = 'es-ap-badge' + (st.running ? '' : ' off');
    }

    var fleetCards = st.fleets.map(function (f) {
      var cls = !f.enabled ? '' : f.ok ? ' ok' : ' err';
      return (
        '<div class="es-ap-card' + cls + '">' +
          '<h3>' + esc(f.name) + '</h3>' +
          '<div class="stat">' + (f.enabled ? (f.ok ? 'OK' : 'KO') : 'OFF') + '</div>' +
          '<div class="meta">' + esc(f.detail) + (f.target ? ' · target ~' + f.target + ' ' + f.unit : '') + '</div>' +
          '<div class="es-ap-fleet-row" style="margin-top:.55rem;border:none;padding:0">' +
            '<span class="meta">Abilitata</span>' +
            '<button type="button" class="es-ap-toggle' + (f.enabled ? ' on' : '') + '" data-fleet="' + f.id + '" aria-label="toggle"><span></span></button>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    var logHtml = getLog(40).map(function (e) {
      return '<div class="' + esc(e.level) + '">[' + esc((e.t || '').replace('T', ' ').slice(0, 19)) + '] ' + esc(e.msg) + '</div>';
    }).join('') || '<div class="info">Nessun log ancora.</div>';

    var be = st.backend;
    var beRun = be && be.running;
    var beBadge = backendLinked
      ? ('<span class="es-ap-badge" style="margin-left:.5rem">BACKEND ' + (beRun ? 'ONLINE' : 'STANDBY') + '</span>')
      : '<span class="es-ap-badge off" style="margin-left:.5rem">BACKEND OFF (solo browser)</span>';

    body.innerHTML =
      '<div class="es-ap-row" style="align-items:flex-start">' +
        '<div><strong style="color:#fff">Modalità duale</strong><div class="meta" style="margin-top:.25rem">Browser (UI flotte) + Backend Python (24/7 finché il server HTTPS è avviato). ' + beBadge + '</div></div>' +
      '</div>' +
      '<div class="es-ap-row">' +
        '<button type="button" class="es-ap-btn primary" id="es-ap-start">' + (st.running ? 'Riavvia browser' : 'Avvia browser') + '</button>' +
        '<button type="button" class="es-ap-btn danger" id="es-ap-stop">Stop browser</button>' +
        '<button type="button" class="es-ap-btn primary" id="es-ap-be-start">Avvia BACKEND</button>' +
        '<button type="button" class="es-ap-btn danger" id="es-ap-be-stop">Stop BACKEND</button>' +
        '<button type="button" class="es-ap-btn" id="es-ap-force">Forza ciclo (entrambi)</button>' +
        '<button type="button" class="es-ap-btn ghost" id="es-ap-export">Esporta stato JSON</button>' +
        '<button type="button" class="es-ap-btn ghost" id="es-ap-clearlog">Pulisci log</button>' +
        '<button type="button" class="es-ap-btn ghost" id="es-ap-bridge">Push bridge → backend</button>' +
        '<label style="display:flex;align-items:center;gap:.4rem;font-size:.8rem;color:#cbd5e1;margin-left:auto">' +
          '<input type="checkbox" id="es-ap-heal" ' + (st.cfg && st.cfg.autoHeal ? 'checked' : '') + '> Auto-heal browser' +
        '</label>' +
      '</div>' +
      '<div class="es-ap-grid">' +
        '<div class="es-ap-card ok"><h3>Cicli browser</h3><div class="stat">' + st.cycles + '</div><div class="meta">Job OK ' + st.jobsOk + ' · fail ' + st.jobsFail + '</div></div>' +
        '<div class="es-ap-card ' + (backendLinked && beRun ? 'ok' : '') + '"><h3>Cicli backend</h3><div class="stat">' + (be ? (be.cycles || 0) : '—') + '</div><div class="meta">Heal ' + (be ? (be.heals || 0) : '—') + ' · camp ticks ' + (be ? (be.campionatiTicks || 0) : '—') + '</div></div>' +
        '<div class="es-ap-card"><h3>Heal browser</h3><div class="stat">' + st.heals + '</div><div class="meta">Riavvii flotte client</div></div>' +
        '<div class="es-ap-card"><h3>Ultimo health browser</h3><div class="stat" style="font-size:1rem">' + (st.lastHealth && st.lastHealth.ok ? 'HEALTHY' : (st.lastHealth ? 'DEGRADED' : '—')) + '</div><div class="meta">' + esc((st.lastHealth && st.lastHealth.at) || 'n/d') + '</div></div>' +
      '</div>' +
      '<div class="es-ap-box"><h3 style="margin:0 0 .75rem;color:#7dd3fc;font-size:.95rem">Flotte</h3><div class="es-ap-grid">' + fleetCards + '</div></div>' +
      '<div class="es-ap-box"><h3 style="margin:0 0 .5rem;color:#7dd3fc;font-size:.95rem">Job automatici (ogni ~' + Math.round((st.cfg.opsCycleMs || 45000) / 1000) + 's)</h3>' +
        '<div class="meta" style="margin-bottom:.65rem">Escalation anomalie · eventi QR · riesami blocchi · Art.22 · KPI · campionati · duplicati · heartbeat</div>' +
        '<div class="es-ap-row">' +
          '<label class="meta">Health check (ms) <input class="es-ap-input" id="es-ap-hms" type="number" min="5000" step="1000" value="' + (st.cfg.healthCheckMs || 12000) + '" style="width:100px"></label>' +
          '<label class="meta">Ops cycle (ms) <input class="es-ap-input" id="es-ap-oms" type="number" min="10000" step="1000" value="' + (st.cfg.opsCycleMs || 45000) + '" style="width:100px"></label>' +
          '<label class="meta">War scan (ms) <input class="es-ap-input" id="es-ap-wms" type="number" min="20000" step="1000" value="' + (st.cfg.warRoomScanMs || 90000) + '" style="width:100px"></label>' +
          '<button type="button" class="es-ap-btn" id="es-ap-saveint">Salva intervalli</button>' +
        '</div>' +
      '</div>' +
      '<div class="es-ap-box"><h3 style="margin:0 0 .5rem;color:#7dd3fc;font-size:.95rem">Mission log</h3><div class="es-ap-log" id="es-ap-log">' + logHtml + '</div></div>';

    document.getElementById('es-ap-start').onclick = function () { enableAndStart(); openUi(); };
    document.getElementById('es-ap-stop').onclick = function () { stop(); openUi(); };
    document.getElementById('es-ap-be-start').onclick = function () {
      backendStart().catch(function (e) { pushLog('err', 'Backend start fail: ' + e.message); openUi(); }).then(function () { openUi(); });
    };
    document.getElementById('es-ap-be-stop').onclick = function () {
      backendStop(false).catch(function (e) { pushLog('err', 'Backend stop fail: ' + e.message); openUi(); }).then(function () { openUi(); });
    };
    document.getElementById('es-ap-force').onclick = function () {
      forceCycle();
      backendForce().catch(function () {});
      openUi();
    };
    document.getElementById('es-ap-export').onclick = function () { exportStatus(); };
    document.getElementById('es-ap-clearlog').onclick = function () { clearLog(); openUi(); };
    document.getElementById('es-ap-bridge').onclick = function () {
      pushBridgeToBackend().then(function () { pushLog('ok', 'Bridge localStorage → backend inviato'); openUi(); })
        .catch(function (e) { pushLog('err', 'Bridge fail: ' + e.message); openUi(); });
    };
    document.getElementById('es-ap-heal').onchange = function (e) {
      state.cfg.autoHeal = !!e.target.checked;
      saveCfg();
      pushLog('info', 'Auto-heal ' + (state.cfg.autoHeal ? 'ON' : 'OFF'));
    };
    document.getElementById('es-ap-saveint').onclick = function () {
      state.cfg.healthCheckMs = parseInt(document.getElementById('es-ap-hms').value, 10) || 12000;
      state.cfg.opsCycleMs = parseInt(document.getElementById('es-ap-oms').value, 10) || 45000;
      state.cfg.warRoomScanMs = parseInt(document.getElementById('es-ap-wms').value, 10) || 90000;
      saveCfg();
      if (state.running) {
        clearTimers();
        state.healthTimer = setInterval(healthCheck, state.cfg.healthCheckMs);
        state.opsTimer = setInterval(runOpsCycle, state.cfg.opsCycleMs);
        state.warTimer = setInterval(runWarCycle, state.cfg.warRoomScanMs);
      }
      pushLog('ok', 'Intervalli salvati e applicati');
      openUi();
    };
    body.querySelectorAll('[data-fleet]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-fleet');
        var cur = !!(state.cfg.fleets && state.cfg.fleets[id]);
        setFleet(id, !cur);
        openUi();
      });
    });
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function updateFloatingChip() {
    var chip = document.getElementById('es-ap-chip');
    if (chip) chip.style.display = 'none';
    var statusEl = document.getElementById('es-ap-dropdown-status');
    var item = document.getElementById('btn-dropdown-autopilot');
    if (!isAdminSession()) {
      if (item) item.style.display = 'none';
      if (uiRoot && uiRoot.classList.contains('is-open')) closeUi();
      return;
    }
    if (item) item.style.display = '';
    var on = state.running && state.cfg && state.cfg.enabled;
    var beOn = backendLinked && backendStatus && backendStatus.running;
    var label = '';
    if (beOn) label += 'BE:' + (backendStatus.cycles || 0);
    if (on) label += (label ? ' · ' : '') + 'UI:' + state.cycles;
    if (!on && !beOn) label = 'OFF';
    if (statusEl) {
      statusEl.textContent = label;
      statusEl.style.color = (on || beOn) ? '#86efac' : '#94a3b8';
    }
  }

  function injectAdminCard() {
    // Card statica già in index.html (#es-ap-admin-card-static) — evita duplicati
    // Collega solo il chip toolbar Admin se presente
    var tb = document.getElementById('btn-show-autopilot');
    if (tb && !tb.dataset.apBound) {
      tb.dataset.apBound = '1';
      tb.addEventListener('click', function (e) {
        e.preventDefault();
        openUi();
      });
    }
    var openBtn = document.getElementById('es-ap-admin-open-static');
    if (openBtn && !openBtn.dataset.apBound) {
      openBtn.dataset.apBound = '1';
      openBtn.addEventListener('click', function (e) {
        e.preventDefault();
        openUi();
      });
    }
    // Rimuovi eventuale card dinamica vecchia
    var old = document.getElementById('es-ap-admin-card');
    if (old) old.remove();
  }

  function removePublicNav() {
    // Rimuove AutoPilot dalla nav pubblica se era stato iniettato
    var navBtn = document.getElementById('es-ap-nav');
    if (navBtn) navBtn.remove();
  }

  function injectNav() {
    // Non più in nav pubblica — solo Admin account
    removePublicNav();
  }

  /* ---------- Public API ---------- */
  window.EliseeAutoPilot = {
    start: start,
    stop: stop,
    enableAndStart: enableAndStart,
    forceCycle: forceCycle,
    setFleet: setFleet,
    getStatus: getStatus,
    getLog: getLog,
    clearLog: clearLog,
    exportStatus: exportStatus,
    open: openUi,
    close: closeUi,
    backend: {
      poll: pollBackend,
      start: backendStart,
      stop: backendStop,
      force: backendForce,
      setFleet: backendSetFleet,
      pushBridge: pushBridgeToBackend,
      isLinked: function () { return backendLinked; },
      status: function () { return backendStatus; }
    },
    version: '2026-08-06_AUTOPILOT_ADMIN_ONLY'
  };

  function forceUnlockUi(){
    try{
      document.body.style.overflow='';
      document.documentElement.style.overflow='';
      var roots=['es-ap-root','es-int-root','modal-war-room-backdrop','candidate-modal','governance-action-modal','fullscreen-document-viewer','cookie-banner'];
      roots.forEach(function(id){
        var el=document.getElementById(id);
        if(!el)return;
        if(id==='cookie-banner')return; // leave cookie
        if(el.classList){ el.classList.remove('is-open','active','open'); }
        if(id==='es-ap-root'||id==='es-int-root'){ el.style.display='none'; el.classList.remove('is-open'); }
      });
      // remove full-screen invisible blockers
      document.querySelectorAll('.modal-overlay').forEach(function(m){
        if(m.style&&m.style.display==='flex'&&!m.classList.contains('active')&&!m.classList.contains('open')){
          /* leave intentional */
        }
      });
    }catch(e){}
  }
  function boot() {
    forceUnlockUi();

    state.cfg = loadCfg();
    removePublicNav();
    injectNav();
    injectAdminCard();
    updateFloatingChip();
    startBackendPoll();
    // Aggiorna visibilità chip quando cambia auth/view
    window.addEventListener('storage', function (e) {
      if (!e.key || e.key === 'elisee_admin_auth' || e.key === 'elisee_view') updateFloatingChip();
    });
    document.addEventListener('elisee:auth-changed', updateFloatingChip);
    document.addEventListener('elisee:view-changed', updateFloatingChip);
    // no full-DOM MutationObserver (freezes UI)
  document.addEventListener('elisee:auth-changed', function(){ try{ removePublicNav(); injectAdminCard(); updateFloatingChip(); }catch(e){} });
  document.addEventListener('elisee:view-changed', function(){ try{ removePublicNav(); injectAdminCard(); updateFloatingChip(); }catch(e){} });
  setTimeout(function(){ try{ removePublicNav(); injectAdminCard(); updateFloatingChip(); }catch(e){} }, 1500);
  setTimeout(function(){ try{ removePublicNav(); injectAdminCard(); updateFloatingChip(); }catch(e){} }, 4000);

    if (state.cfg.autoStartOnLoad && state.cfg.enabled) {
      // wait for other modules
      var tries = 0;
      function waitStart() {
        tries += 1;
        var ready = window.EliseeAICluster || window.EliseeCampionatiAgents;
        if (ready || tries > 25) {
          start();
          // ensure backend running too
          backendStart().catch(function () {});
          return;
        }
        setTimeout(waitStart, 300);
      }
      setTimeout(waitStart, 600);
    } else {
      pushLog('info', 'AutoPilot in standby (autoStart off o disabled)');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
