/**
 * ELISEE SCOUT — Supervisori H24 per girone
 *
 * 2 Supervisori IA per OGNI girone (Primary + Backup).
 * Restano attivi H24, controllano i 10 agenti del girone e
 * riattivano istantaneamente chi si blocca (error / running stuck / warn ripetuto).
 *
 * Totale: 201 gironi × 2 = 402 supervisori.
 */
(function () {
  'use strict';

  var SUPERVISORS_PER_GIRONE = 2;
  var WATCH_MS = 2000; // controllo continuo H24
  var STUCK_RUNNING_MS = 25000; // running troppo a lungo = blocco
  var STORAGE_KEY = 'elisee_campionati_supervisors_v1';
  var ANOMALY_MAX = 150;

  var supervisors = [];
  var anomalies = [];
  var watchTimer = null;
  var running = false;
  var startedAt = null;
  var totalRestarts = 0;
  var totalChecks = 0;

  function codeSv(g, slot) {
    var c = String(g.campionatoId).replace(/[^a-z0-9]/gi, '').slice(0, 4).toUpperCase();
    var gr = String(g.gironeId).replace(/[^a-z0-9]/gi, '').slice(0, 4).toUpperCase();
    return 'SV-' + c + '-' + gr + '-' + String(slot).padStart(2, '0');
  }

  function buildSupervisors() {
    var fleet = window.EliseeCampionatiAgents;
    if (!fleet || !fleet.GIRONI) return [];
    supervisors = [];
    fleet.GIRONI.forEach(function (g) {
      for (var slot = 1; slot <= SUPERVISORS_PER_GIRONE; slot++) {
        supervisors.push({
          id: g.campionatoId + ':' + g.gironeId + ':sv' + slot,
          code: codeSv(g, slot),
          slot: slot,
          role: slot === 1 ? 'primary' : 'backup',
          roleLabel: slot === 1 ? 'Supervisore Primary H24' : 'Supervisore Backup H24',
          campionatoId: g.campionatoId,
          campionato: g.campionato,
          gironeId: g.gironeId,
          gironeTitle: g.title,
          area: g.area,
          status: 'online', // online | degraded | offline
          h24: true,
          lastCheck: null,
          lastHeartbeat: null,
          checks: 0,
          restarts: 0,
          anomalies: 0,
          lastAnomaly: null,
          agentsWatched: 10,
          healthyAgents: 10,
          blockedAgents: 0
        });
      }
    });
    return supervisors;
  }

  function pushAnomaly(entry) {
    anomalies.unshift(
      Object.assign(
        {
          t: new Date().toISOString(),
          tLabel: new Date().toLocaleTimeString('it-IT')
        },
        entry
      )
    );
    if (anomalies.length > ANOMALY_MAX) anomalies.length = ANOMALY_MAX;
    document.dispatchEvent(new CustomEvent('elisee:campionati-anomaly', { detail: entry }));
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          startedAt: startedAt,
          totalRestarts: totalRestarts,
          totalChecks: totalChecks,
          anomalies: anomalies.slice(0, 40),
          ts: Date.now()
        })
      );
    } catch (_) {}
  }

  function isAgentBlocked(agent, now) {
    if (!agent) return { blocked: false };
    if (agent.status === 'error') {
      return { blocked: true, reason: 'status=error' + (agent.lastError ? ' · ' + agent.lastError : '') };
    }
    if (agent.status === 'running' && agent.lastRun) {
      var started = Date.parse(agent.lastRun);
      if (!isNaN(started) && now - started > STUCK_RUNNING_MS) {
        return { blocked: true, reason: 'running-stuck >' + Math.round(STUCK_RUNNING_MS / 1000) + 's' };
      }
    }
    // warn ripetuto dopo fallimenti
    if (agent.status === 'warn' && agent.lastError) {
      return { blocked: true, reason: 'status=warn · ' + agent.lastError };
    }
    return { blocked: false };
  }

  function superviseGirone(sv, now) {
    var fleet = window.EliseeCampionatiAgents;
    if (!fleet) return;

    sv.lastCheck = new Date(now).toISOString();
    sv.lastHeartbeat = sv.lastCheck;
    sv.checks += 1;
    totalChecks += 1;

    var team = fleet.getAgentsForGirone
      ? fleet.getAgentsForGirone(sv.campionatoId, sv.gironeId)
      : [];
    sv.agentsWatched = team.length || 10;

    var blocked = [];
    var healthy = 0;
    team.forEach(function (a) {
      var chk = isAgentBlocked(a, now);
      if (chk.blocked) blocked.push({ agent: a, reason: chk.reason });
      else if (a.status === 'ok' || a.status === 'idle' || a.status === 'running') healthy += 1;
      else healthy += 1;
    });

    sv.blockedAgents = blocked.length;
    sv.healthyAgents = Math.max(0, sv.agentsWatched - blocked.length);

    if (blocked.length === 0) {
      sv.status = 'online';
      return;
    }

    // Solo primary esegue il restart; backup verifica e interviene se primary offline
    var shouldAct = sv.role === 'primary' || sv.role === 'backup';
    if (!shouldAct) return;

    // Backup agisce sempre in parallelo per ridondanza H24 (riavvio idempotente)
    blocked.forEach(function (item) {
      var a = item.agent;
      sv.restarts += 1;
      sv.anomalies += 1;
      sv.lastAnomaly = now;
      totalRestarts += 1;

      pushAnomaly({
        severity: 'critical',
        type: 'agent-blocked',
        supervisor: sv.code,
        supervisorRole: sv.role,
        campionato: sv.campionato,
        girone: sv.gironeTitle,
        agent: a.code,
        agentRole: a.roleName,
        reason: item.reason,
        action: 'Riattivazione istantanea'
      });

      if (typeof fleet.reactivateAgent === 'function') {
        fleet.reactivateAgent(a.id, sv.code + ' · ' + item.reason);
      } else {
        a.status = 'idle';
        a.lastError = null;
      }
    });

    sv.status = blocked.length >= 3 ? 'degraded' : 'online';
    if (fleet.logEvent) {
      /* noop */
    }
    if (window.EliseeAICluster && window.EliseeAICluster.logEvent) {
      window.EliseeAICluster.logEvent(
        'campionati',
        sv.code +
          ' H24 · ' +
          sv.campionato +
          ' · ' +
          sv.gironeTitle +
          ' · riattivati ' +
          blocked.length +
          ' agenti',
        { source: 'supervisor-h24', agent: sv.code }
      );
    }
  }

  function watchCycle() {
    if (!running) return;
    if (!window.EliseeCampionatiAgents) return;
    if (!supervisors.length) buildSupervisors();

    var now = Date.now();
    // Round-robin: controlla un batch di supervisori per ciclo (tutti entro pochi secondi)
    // Per H24 effettivo: processiamo TUTTI i primary ogni ciclo, backup ogni 2 cicli
    supervisors.forEach(function (sv) {
      if (sv.role === 'primary') superviseGirone(sv, now);
      else if (totalChecks % 2 === 0) superviseGirone(sv, now);
    });

    document.dispatchEvent(
      new CustomEvent('elisee:campionati-supervisors-tick', {
        detail: getSummary()
      })
    );
  }

  function start() {
    if (running) return getSummary();
    buildSupervisors();
    running = true;
    startedAt = new Date().toISOString();
    pushAnomaly({
      severity: 'info',
      type: 'boot',
      supervisor: 'SV-SYS',
      campionato: 'Sistema',
      girone: '—',
      agent: '—',
      reason: 'Avvio ' + supervisors.length + ' supervisori H24 (2×' + (supervisors.length / 2) + ' gironi)',
      action: 'Watch loop attivo'
    });
    watchTimer = setInterval(watchCycle, WATCH_MS);
    // primo check immediato
    setTimeout(watchCycle, 400);
    return getSummary();
  }

  function stop() {
    running = false;
    if (watchTimer) {
      clearInterval(watchTimer);
      watchTimer = null;
    }
    supervisors.forEach(function (sv) {
      sv.status = 'offline';
    });
  }

  function getSummary() {
    var online = supervisors.filter(function (s) {
      return s.status === 'online';
    }).length;
    var degraded = supervisors.filter(function (s) {
      return s.status === 'degraded';
    }).length;
    var offline = supervisors.filter(function (s) {
      return s.status === 'offline';
    }).length;
    var openAnomalies = anomalies.filter(function (a) {
      return a.severity === 'critical';
    }).length;

    // health per girone (usa primary)
    var gironeHealth = [];
    var seen = {};
    supervisors.forEach(function (sv) {
      if (sv.role !== 'primary') return;
      var key = sv.campionatoId + '::' + sv.gironeId;
      if (seen[key]) return;
      seen[key] = 1;
      var health =
        sv.blockedAgents > 0 ? 'anomaly' : sv.status === 'degraded' ? 'degraded' : 'ok';
      gironeHealth.push({
        campionato: sv.campionato,
        girone: sv.gironeTitle,
        campionatoId: sv.campionatoId,
        gironeId: sv.gironeId,
        supervisorPrimary: sv.code,
        supervisorBackup: null,
        healthyAgents: sv.healthyAgents,
        blockedAgents: sv.blockedAgents,
        restarts: sv.restarts,
        status: sv.status,
        health: health,
        lastCheck: sv.lastCheck
      });
    });
    // attach backup codes
    supervisors.forEach(function (sv) {
      if (sv.role !== 'backup') return;
      for (var i = 0; i < gironeHealth.length; i++) {
        if (
          gironeHealth[i].campionatoId === sv.campionatoId &&
          gironeHealth[i].gironeId === sv.gironeId
        ) {
          gironeHealth[i].supervisorBackup = sv.code;
          gironeHealth[i].restarts += sv.restarts;
          break;
        }
      }
    });

    return {
      totalSupervisors: supervisors.length,
      supervisorsPerGirone: SUPERVISORS_PER_GIRONE,
      totalGironi: supervisors.length / SUPERVISORS_PER_GIRONE,
      online: online,
      degraded: degraded,
      offline: offline,
      totalRestarts: totalRestarts,
      totalChecks: totalChecks,
      openAnomalies: openAnomalies,
      h24: running,
      startedAt: startedAt,
      gironeHealth: gironeHealth,
      anomalies: anomalies.slice(0, 50)
    };
  }

  function getSupervisors() {
    return supervisors.slice();
  }

  function getAnomalies() {
    return anomalies.slice();
  }

  function forceScan() {
    watchCycle();
    return getSummary();
  }

  /** Simula blocco agente (solo Admin) per test riattivazione */
  function simulateBlock(agentCode) {
    var fleet = window.EliseeCampionatiAgents;
    if (!fleet || !fleet.findAgentById) return null;
    var a = fleet.findAgentById(agentCode);
    if (!a && fleet.getAgents) {
      var list = fleet.getAgents();
      a = list[0];
    }
    if (!a) return null;
    if (fleet.setAgentStatus) fleet.setAgentStatus(a.id, 'error', 'SIMULATED_BLOCK_ADMIN');
    else {
      a.status = 'error';
      a.lastError = 'SIMULATED_BLOCK_ADMIN';
    }
    pushAnomaly({
      severity: 'critical',
      type: 'simulated-block',
      supervisor: 'ADMIN',
      campionato: a.campionato,
      girone: a.gironeTitle,
      agent: a.code,
      reason: 'Blocco simulato da Admin',
      action: 'In attesa supervisore H24'
    });
    setTimeout(watchCycle, 100);
    return a;
  }

  var api = {
    SUPERVISORS_PER_GIRONE: SUPERVISORS_PER_GIRONE,
    start: start,
    stop: stop,
    getSummary: getSummary,
    getSupervisors: getSupervisors,
    getAnomalies: getAnomalies,
    forceScan: forceScan,
    simulateBlock: simulateBlock,
    isRunning: function () {
      return running;
    },
    TOTAL: function () {
      return supervisors.length;
    }
  };

  window.EliseeCampionatiSupervisors = api;

  function boot() {
    // attende flotta agenti
    var tries = 0;
    function wait() {
      if (window.EliseeCampionatiAgents && window.EliseeCampionatiAgents.GIRONI) {
        start();
        return;
      }
      tries += 1;
      if (tries < 40) setTimeout(wait, 250);
    }
    wait();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
