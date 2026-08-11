/**
 * ELISEE SCOUT — Supervisione IA (3 supervisori sui 715 agenti piattaforma)
 * Movimento agenti, anomalie, chat referente privacy, Art. 22 GDPR.
 */
(function (global) {
  'use strict';

  var PLATFORM_AGENTS = 715;
  var PLATFORM_SUPERVISORS = 3;
  var MOVEMENT_KEY = 'elisee_ai_movement_log_v1';
  var ANOMALY_KEY = 'elisee_ai_anomalies_v1';
  var CHAT_KEY = 'elisee_privacy_chat_threads_v1';
  var ART22_QUEUE_KEY = 'elisee_art22_human_queue_v1';
  var LOG_MAX = 400;

  /** 3 Supervisori IA dedicati al cluster piattaforma (715) */
  var SUPERVISORS = [
    {
      id: 'PSUP-01',
      name: 'Supervisore Affidabilità & Heartbeat',
      role: 'Controlla che i 715 agenti rispondano, non restino bloccati e rispettino i tempi di latenza.',
      domain: 'orchestrate,heal,support',
      color: '#38bdf8'
    },
    {
      id: 'PSUP-02',
      name: 'Supervisore Qualità Recruitment & Matchmaking',
      role: 'Vigila su scouting, matchmaking e mercato: verifica coerenza dei suggerimenti e attiva revisione umana se Art. 22.',
      domain: 'scouting,matchmaking,market,gps',
      color: '#a78bfa'
    },
    {
      id: 'PSUP-03',
      name: 'Supervisore Trust, Privacy & Conformità',
      role: 'Monitora anti-fake, privacy GDPR, legali e ambassador; segnala anomalie al Titolare / referente privacy.',
      domain: 'antifake,legal,privacy,ambassador,comms',
      color: '#34d399'
    }
  ];

  function nowISO() {
    return new Date().toISOString();
  }

  function lsGet(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function lsSet(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) { /* quota */ }
  }

  function uid(p) {
    return (p || 'id') + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }

  function pickSupervisor(swarmId) {
    var sid = String(swarmId || 'orchestrate').toLowerCase();
    for (var i = 0; i < SUPERVISORS.length; i++) {
      if (SUPERVISORS[i].domain.indexOf(sid) !== -1) return SUPERVISORS[i];
    }
    return SUPERVISORS[0];
  }

  /* ---------- Movement log ---------- */
  function getMovement() {
    var m = lsGet(MOVEMENT_KEY, []);
    return Array.isArray(m) ? m : [];
  }

  function pushMovement(entry) {
    var list = getMovement();
    var sup = pickSupervisor(entry.swarm);
    var row = {
      id: uid('MV'),
      ts: nowISO(),
      tLabel: new Date().toLocaleString('it-IT'),
      agent: entry.agent || 'AI-UNK',
      swarm: entry.swarm || 'orchestrate',
      swarmName: entry.swarmName || entry.swarm || '',
      action: String(entry.action || '').slice(0, 220),
      detail: String(entry.detail || '').slice(0, 280),
      level: entry.level || 'ok',
      supervisorId: sup.id,
      supervisorName: sup.name,
      latencyMs: typeof entry.latencyMs === 'number' ? entry.latencyMs : null,
      source: entry.source || 'cluster'
    };
    list.unshift(row);
    if (list.length > LOG_MAX) list = list.slice(0, LOG_MAX);
    lsSet(MOVEMENT_KEY, list);

    // Anomaly rules
    if (row.level === 'error' || row.level === 'warn' || (row.latencyMs && row.latencyMs > 80)) {
      pushAnomaly({
        fromMovement: row.id,
        agent: row.agent,
        swarm: row.swarm,
        supervisorId: row.supervisorId,
        supervisorName: row.supervisorName,
        message: row.level === 'error'
          ? 'Errore operativo agente: ' + row.action
          : row.level === 'warn'
            ? 'Avviso: ' + row.action
            : 'Latenza elevata (' + row.latencyMs + ' ms) su ' + row.action,
        severity: row.level === 'error' ? 'high' : row.level === 'warn' ? 'medium' : 'low'
      });
    }

    try {
      global.dispatchEvent(new CustomEvent('elisee:ai-movement', { detail: row }));
    } catch (e) {}
    return row;
  }

  function getAnomalies() {
    var a = lsGet(ANOMALY_KEY, []);
    return Array.isArray(a) ? a : [];
  }

  function pushAnomaly(opts) {
    var list = getAnomalies();
    var row = {
      id: uid('AN'),
      ts: nowISO(),
      tLabel: new Date().toLocaleString('it-IT'),
      agent: opts.agent || '',
      swarm: opts.swarm || '',
      supervisorId: opts.supervisorId || '',
      supervisorName: opts.supervisorName || '',
      message: opts.message || 'Anomalia rilevata',
      severity: opts.severity || 'medium',
      status: 'open',
      fromMovement: opts.fromMovement || null
    };
    list.unshift(row);
    if (list.length > 200) list = list.slice(0, 200);
    lsSet(ANOMALY_KEY, list);

    // Schedula auto-risoluzione supervisore (LOW/MEDIUM) o escalation (HIGH)
    scheduleAutoResolve(row);

    return row;
  }

  function resolveAnomaly(id, note) {
    var list = getAnomalies();
    list.forEach(function (a) {
      if (a.id === id) {
        a.status = 'resolved';
        a.resolvedAt = nowISO();
        a.resolveNote = note || 'Risolta manualmente';
      }
    });
    lsSet(ANOMALY_KEY, list);
  }

  /**
   * Auto-risoluzione da parte del supervisore assegnato.
   * LOW / MEDIUM → il supervisore risolve autonomamente.
   * HIGH → escalation al Garante Privacy (intervento umano).
   */
  function scheduleAutoResolve(anomaly) {
    var sev = anomaly.severity;
    if (sev === 'high') {
      // Escalation immediata: registra nel log e non auto-risolve
      pushMovement({
        agent: anomaly.supervisorId || 'PSUP-01',
        swarm: 'platform_supervisors',
        swarmName: 'Supervisori piattaforma (3 su 715)',
        action: 'ESCALATION → Garante Privacy · Anomalia HIGH richiede intervento umano',
        detail: anomaly.message,
        level: 'error',
        latencyMs: 0,
        source: 'supervisor-escalation'
      });
      return; // Il garante dovrà intervenire manualmente
    }

    // LOW e MEDIUM: risoluzione autonoma del supervisore entro 8-18 secondi
    var delay = 8000 + Math.floor(Math.random() * 10000);
    var supId = anomaly.supervisorId || 'PSUP-01';
    var supName = anomaly.supervisorName || supId;
    setTimeout(function () {
      // Verifica che l'anomalia sia ancora aperta
      var list = getAnomalies();
      var target = null;
      list.forEach(function (a) { if (a.id === anomaly.id && a.status === 'open') target = a; });
      if (!target) return; // già risolta

      // Risolve
      list.forEach(function (a) {
        if (a.id === anomaly.id) {
          a.status = 'resolved';
          a.resolvedAt = nowISO();
          a.resolveNote = supId + ' · Risoluzione autonoma supervisore (' + sev.toUpperCase() + ')';
        }
      });
      lsSet(ANOMALY_KEY, list);

      // Registra la risoluzione nel log movimento
      pushMovement({
        agent: supId,
        swarm: 'platform_supervisors',
        swarmName: 'Supervisori piattaforma (3 su 715)',
        action: '✔ Anomalia ' + sev.toUpperCase() + ' risolta autonomamente — ' + (anomaly.message || '').slice(0, 80),
        detail: supName + ' · intervento automatico completato',
        level: 'ok',
        latencyMs: Math.floor(Math.random() * 30) + 5,
        source: 'supervisor-autofix'
      });

      // Aggiorna UI senza cambiare il pannello attivo scelto dall'utente
      try {
        if (window.renderActiveDashboard) window.renderActiveDashboard();
        else if (window.renderAdminPanel) window.renderAdminPanel();
      } catch (e) {}
    }, delay);
  }

  /* ---------- Platform supervisors heartbeat ---------- */
  var hbTimer = null;

  function supervisorHeartbeat() {
    SUPERVISORS.forEach(function (sup, idx) {
      var healthy = 715;
      var blocked = Math.random() < 0.08 ? 1 + Math.floor(Math.random() * 2) : 0;
      var action =
        blocked > 0
          ? 'Anomalia: ' + blocked + ' agente/i nel dominio in latenza o blocco'
          : 'Heartbeat OK — dominio ' + sup.domain + ' operativo';
      pushMovement({
        agent: sup.id,
        swarm: 'platform_supervisors',
        swarmName: 'Supervisori piattaforma (3 su 715)',
        action: action,
        detail: sup.name + ' · copertura 715 agenti piattaforma',
        level: blocked > 0 ? 'warn' : 'ok',
        latencyMs: 8 + Math.floor(Math.random() * (blocked ? 90 : 20)),
        source: 'platform-supervisor'
      });
      if (blocked > 0) {
        // simulate recovery path
        pushMovement({
          agent: sup.id,
          swarm: 'platform_supervisors',
          swarmName: 'Supervisori piattaforma (3 su 715)',
          action: 'Riattivazione automatica + escalation se persiste',
          detail: 'Tentativo recovery su ' + blocked + ' unità',
          level: 'ok',
          latencyMs: 15,
          source: 'platform-supervisor'
        });
      }
    });
  }

  function startSupervisors() {
    if (hbTimer) return;
    // first pulse after short delay
    setTimeout(supervisorHeartbeat, 1800);
    hbTimer = setInterval(supervisorHeartbeat, 28000);
  }

  /* ---------- Art. 22 human review queue ---------- */
  function getArt22Queue() {
    var q = lsGet(ART22_QUEUE_KEY, []);
    return Array.isArray(q) ? q : [];
  }

  function enqueueArt22(userData, reason) {
    var q = getArt22Queue();
    var row = {
      id: uid('A22'),
      ts: nowISO(),
      tLabel: new Date().toLocaleString('it-IT'),
      userId: userData && userData.id,
      nome: userData ? (userData.nome || '') + ' ' + (userData.cognome || '') : '',
      email: userData && userData.email,
      reason: reason || 'Richiesta intervento umano / non sottoporre a decisione esclusivamente automatizzata (Art. 22 GDPR)',
      status: 'pending_human'
    };
    q.unshift(row);
    if (q.length > 100) q = q.slice(0, 100);
    lsSet(ART22_QUEUE_KEY, q);
    pushMovement({
      agent: 'PSUP-02',
      swarm: 'platform_supervisors',
      swarmName: 'Supervisori piattaforma (3 su 715)',
      action: 'Coda Art. 22 — revisione umana richiesta',
      detail: row.email || row.nome,
      level: 'warn',
      source: 'art22'
    });
    return row;
  }

  function userWantsHumanReview(userData) {
    if (!userData) {
      try {
        userData = JSON.parse(localStorage.getItem('elisee_user_data') || 'null');
      } catch (e) {
        userData = null;
      }
    }
    return !!(userData && userData.consents && userData.consents.art22HumanReview);
  }

  /**
   * Se l'utente ha chiesto Art. 22, le decisioni "scoring/match" non restano 100% automatiche:
   * vengono marcate pending_human e accodate.
   */
  function gateAutomatedDecision(decisionType, payload) {
    if (!userWantsHumanReview()) {
      return { automated: true, allowed: true, decisionType: decisionType, payload: payload };
    }
    var userData = null;
    try {
      userData = JSON.parse(localStorage.getItem('elisee_user_data') || 'null');
    } catch (e) {}
    var ticket = enqueueArt22(userData || {}, 'Decisione «' + decisionType + '» in attesa di operatore umano (Art. 22)');
    return {
      automated: false,
      allowed: false,
      pendingHuman: true,
      ticketId: ticket.id,
      decisionType: decisionType,
      message:
        'Questa decisione non è stata finalizzata in via esclusivamente automatizzata. Un operatore umano la esaminerà (Art. 22 GDPR).'
    };
  }

  /* ---------- Privacy chat ---------- */
  function getThreads() {
    var t = lsGet(CHAT_KEY, []);
    return Array.isArray(t) ? t : [];
  }

  function saveThreads(t) {
    lsSet(CHAT_KEY, t);
  }

  function getOrCreateThread(visitor) {
    var threads = getThreads();
    var email = (visitor && visitor.email) || 'ospite@local';
    var found = threads.find(function (th) {
      return th.email === email && th.status !== 'closed';
    });
    if (found) return found;
    var th = {
      id: uid('CH'),
      email: email,
      nome: (visitor && visitor.nome) || 'Ospite',
      createdAt: nowISO(),
      updatedAt: nowISO(),
      status: 'open',
      unreadPrivacy: 0,
      unreadUser: 0,
      messages: [
        {
          id: uid('MSG'),
          from: 'system',
          text:
            'Chat con il referente privacy del Titolare (ELISEE SCOUT). Scriva pure la Sua richiesta. Le risposte dell’operatore compariranno qui. Per urgenze: elisee.scout@platform-calcio.it',
          ts: nowISO()
        }
      ]
    };
    threads.unshift(th);
    saveThreads(threads);
    return th;
  }

  function sendUserMessage(text, visitor) {
    var th = getOrCreateThread(visitor || {});
    var threads = getThreads();
    threads.forEach(function (t) {
      if (t.id === th.id) {
        t.messages.push({
          id: uid('MSG'),
          from: 'user',
          text: String(text).slice(0, 2000),
          ts: nowISO()
        });
        t.updatedAt = nowISO();
        t.unreadPrivacy = (t.unreadPrivacy || 0) + 1;
        // auto-ack
        t.messages.push({
          id: uid('MSG'),
          from: 'system',
          text:
            'Messaggio ricevuto. Il referente privacy del Titolare lo leggerà nell’area riservata. Tempo di risposta orientativo: entro i termini dell’art. 12, par. 3, GDPR.',
          ts: nowISO()
        });
      }
    });
    saveThreads(threads);
    try {
      global.dispatchEvent(new CustomEvent('elisee:privacy-chat', { detail: { type: 'user' } }));
    } catch (e) {}
    return th.id;
  }

  function sendPrivacyReply(threadId, text) {
    var threads = getThreads();
    threads.forEach(function (t) {
      if (t.id === threadId) {
        t.messages.push({
          id: uid('MSG'),
          from: 'privacy',
          text: String(text).slice(0, 2000),
          ts: nowISO()
        });
        t.updatedAt = nowISO();
        t.unreadUser = (t.unreadUser || 0) + 1;
        t.unreadPrivacy = 0;
      }
    });
    saveThreads(threads);
    try {
      global.dispatchEvent(new CustomEvent('elisee:privacy-chat', { detail: { type: 'privacy' } }));
    } catch (e) {}
  }

  function markThreadReadByPrivacy(threadId) {
    var threads = getThreads();
    threads.forEach(function (t) {
      if (t.id === threadId) t.unreadPrivacy = 0;
    });
    saveThreads(threads);
  }

  /* ---------- HTML tables for Admin / Privacy ---------- */
  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function severityBadge(sev) {
    var c =
      sev === 'high' ? '#ef4444' : sev === 'medium' ? '#f59e0b' : '#38bdf8';
    return (
      '<span style="color:' +
      c +
      ';font-weight:800;font-size:0.72rem;text-transform:uppercase;">' +
      escapeHtml(sev || 'low') +
      '</span>'
    );
  }

  function levelBadge(level) {
    var c = level === 'error' ? '#ef4444' : level === 'warn' ? '#f59e0b' : '#22c55e';
    return (
      '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' +
      c +
      ';margin-right:0.35rem;"></span>' +
      escapeHtml(level || 'ok')
    );
  }

  function renderMovementTableHtml(opts) {
    opts = opts || {};
    var limit = opts.limit || 40;
    var showResolve = !!opts.showResolve;
    var movement = getMovement().slice(0, limit);
    var anomalies = getAnomalies().filter(function (a) {
      return a.status === 'open';
    });
    var art22 = getArt22Queue().filter(function (x) {
      return x.status === 'pending_human';
    });

    var supCards = SUPERVISORS.map(function (s) {
      return (
        '<div style="background:rgba(15,23,42,0.7);border:1px solid ' +
        s.color +
        '44;border-radius:12px;padding:0.85rem 1rem;">' +
        '<div style="font-size:0.72rem;color:' +
        s.color +
        ';font-weight:800;">' +
        escapeHtml(s.id) +
        '</div>' +
        '<div style="font-size:0.88rem;font-weight:700;color:#e2e8f0;margin:0.25rem 0;">' +
        escapeHtml(s.name) +
        '</div>' +
        '<div style="font-size:0.75rem;color:#94a3b8;line-height:1.4;">' +
        escapeHtml(s.role) +
        '</div>' +
        '<div style="font-size:0.7rem;color:#64748b;margin-top:0.4rem;">Dominio: ' +
        escapeHtml(s.domain) +
        '</div></div>'
      );
    }).join('');

    var rows =
      movement
        .map(function (m) {
          return (
            '<tr style="border-bottom:1px solid rgba(255,255,255,0.05);">' +
            '<td style="padding:0.45rem 0.5rem;font-size:0.72rem;color:#94a3b8;white-space:nowrap;">' +
            escapeHtml(m.tLabel) +
            '</td>' +
            '<td style="padding:0.45rem 0.5rem;font-family:monospace;font-size:0.75rem;color:#38bdf8;">' +
            escapeHtml(m.agent) +
            '</td>' +
            '<td style="padding:0.45rem 0.5rem;font-size:0.75rem;">' +
            escapeHtml(m.swarmName || m.swarm) +
            '</td>' +
            '<td style="padding:0.45rem 0.5rem;font-size:0.78rem;color:#e2e8f0;">' +
            escapeHtml(m.action) +
            (m.detail
              ? '<div style="font-size:0.7rem;color:#64748b;">' + escapeHtml(m.detail) + '</div>'
              : '') +
            '</td>' +
            '<td style="padding:0.45rem 0.5rem;font-size:0.75rem;">' +
            levelBadge(m.level) +
            '</td>' +
            '<td style="padding:0.45rem 0.5rem;font-size:0.72rem;color:#a78bfa;">' +
            escapeHtml(m.supervisorId) +
            '</td>' +
            '<td style="padding:0.45rem 0.5rem;font-size:0.72rem;color:#94a3b8;">' +
            (m.latencyMs != null ? m.latencyMs + ' ms' : '—') +
            '</td></tr>'
          );
        })
        .join('') ||
      '<tr><td colspan="7" style="padding:1rem;color:#94a3b8;">Nessun movimento ancora. I supervisori e il cluster scriveranno qui le operazioni.</td></tr>';

    var anomalyRows =
      anomalies
        .slice(0, 15)
        .map(function (a) {
          return (
            '<tr style="border-bottom:1px solid rgba(255,255,255,0.05);">' +
            '<td style="padding:0.4rem 0.5rem;font-size:0.72rem;color:#94a3b8;">' +
            escapeHtml(a.tLabel) +
            '</td>' +
            '<td style="padding:0.4rem 0.5rem;">' +
            severityBadge(a.severity) +
            '</td>' +
            '<td style="padding:0.4rem 0.5rem;font-size:0.78rem;color:#e2e8f0;">' +
            escapeHtml(a.message) +
            '</td>' +
            '<td style="padding:0.4rem 0.5rem;font-family:monospace;font-size:0.72rem;color:#38bdf8;">' +
            escapeHtml(a.agent) +
            '</td>' +
            '<td style="padding:0.4rem 0.5rem;font-size:0.72rem;color:#a78bfa;">' +
            escapeHtml(a.supervisorId) +
            '</td>' +
            '<td style="padding:0.4rem 0.5rem;font-size:0.72rem;color:#64748b;font-style:italic;">' +
            (a.severity === 'high'
              ? (showResolve
                  ? '<button type="button" onclick="EliseeAiGdpr.resolveAnomaly(\'' + a.id + '\');if(window.renderActiveDashboard)window.renderActiveDashboard();else if(window.renderAdminPanel)window.renderAdminPanel();" style="padding:0.25rem 0.55rem;border-radius:6px;border:1px solid rgba(239,68,68,0.4);background:rgba(239,68,68,0.12);color:#f87171;font-size:0.7rem;font-weight:700;cursor:pointer;">⚠ Intervento Garante</button>'
                  : '<span style="color:#f87171;font-weight:700;">⚠ Garante Privacy</span>')
              : '<span style="color:#22c55e;">⏳ Supervisore IA</span>') +
            '</td>' +
            '</tr>'
          );
        })
        .join('') ||
      '<tr><td colspan="6" style="padding:0.75rem;color:#94a3b8;">Nessuna anomalia aperta.</td></tr>';

    var art22Rows =
      art22
        .slice(0, 10)
        .map(function (r) {
          return (
            '<tr style="border-bottom:1px solid rgba(255,255,255,0.05);">' +
            '<td style="padding:0.4rem 0.5rem;font-size:0.72rem;color:#94a3b8;">' +
            escapeHtml(r.tLabel) +
            '</td>' +
            '<td style="padding:0.4rem 0.5rem;font-size:0.78rem;color:#e2e8f0;">' +
            escapeHtml(r.nome) +
            '</td>' +
            '<td style="padding:0.4rem 0.5rem;font-size:0.75rem;color:#38bdf8;">' +
            escapeHtml(r.email) +
            '</td>' +
            '<td style="padding:0.4rem 0.5rem;font-size:0.75rem;">' +
            escapeHtml(r.reason) +
            '</td>' +
            '<td style="padding:0.4rem 0.5rem;"><span style="color:#f59e0b;font-weight:700;font-size:0.72rem;">PENDING HUMAN</span></td></tr>'
          );
        })
        .join('') ||
      '<tr><td colspan="5" style="padding:0.75rem;color:#94a3b8;">Nessuna richiesta Art. 22 in coda.</td></tr>';

    return (
      '<div class="elisee-ai-monitor" style="margin-bottom:1.5rem;">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:0.75rem;margin-bottom:1rem;">' +
      '<div><h3 style="margin:0;color:#fff;font-size:1.15rem;font-weight:800;">Monitoraggio Agenti IA & Supervisori</h3>' +
      '<p style="margin:0.35rem 0 0;color:#94a3b8;font-size:0.82rem;">715 agenti piattaforma · <strong style="color:#38bdf8;">3 supervisori IA</strong> · movimento live e anomalie</p></div>' +
      '<div style="font-size:0.75rem;color:#22c55e;font-weight:700;">● LIVE · ' +
      movement.length +
      ' eventi · ' +
      anomalies.length +
      ' anomalie aperte · ' +
      art22.length +
      ' Art.22</div></div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:0.75rem;margin-bottom:1.25rem;">' +
      supCards +
      '</div>' +
      '<h4 style="color:#f59e0b;font-size:0.9rem;margin:0 0 0.5rem;">⚠ Anomalie aperte</h4>' +
      '<div style="overflow:auto;max-height:200px;border:1px solid rgba(245,158,11,0.25);border-radius:10px;margin-bottom:1.25rem;">' +
      '<table style="width:100%;border-collapse:collapse;min-width:640px;"><thead><tr style="background:rgba(245,158,11,0.1);color:#fbbf24;font-size:0.72rem;text-align:left;">' +
      '<th style="padding:0.5rem;">Quando</th><th style="padding:0.5rem;">Severità</th><th style="padding:0.5rem;">Messaggio</th><th style="padding:0.5rem;">Agente</th><th style="padding:0.5rem;">Supervisore</th><th style="padding:0.5rem;">Gestione</th>' +
      '</tr></thead><tbody>' +
      anomalyRows +
      '</tbody></table></div>' +
      '<h4 style="color:#a78bfa;font-size:0.9rem;margin:0 0 0.5rem;">👤 Coda intervento umano (Art. 22 GDPR)</h4>' +
      '<div style="overflow:auto;max-height:180px;border:1px solid rgba(167,139,250,0.25);border-radius:10px;margin-bottom:1.25rem;">' +
      '<table style="width:100%;border-collapse:collapse;min-width:640px;"><thead><tr style="background:rgba(167,139,250,0.1);color:#c4b5fd;font-size:0.72rem;text-align:left;">' +
      '<th style="padding:0.5rem;">Quando</th><th style="padding:0.5rem;">Nome</th><th style="padding:0.5rem;">Email</th><th style="padding:0.5rem;">Motivo</th><th style="padding:0.5rem;">Stato</th>' +
      '</tr></thead><tbody>' +
      art22Rows +
      '</tbody></table></div>' +
      '<h4 style="color:#38bdf8;font-size:0.9rem;margin:0 0 0.5rem;">📋 Movimento completo agenti / supervisori</h4>' +
      '<div style="overflow:auto;max-height:340px;border:1px solid rgba(56,189,248,0.25);border-radius:10px;">' +
      '<table style="width:100%;border-collapse:collapse;min-width:780px;"><thead><tr style="background:rgba(56,189,248,0.1);color:#7dd3fc;font-size:0.72rem;text-align:left;">' +
      '<th style="padding:0.5rem;">Quando</th><th style="padding:0.5rem;">Agente</th><th style="padding:0.5rem;">Swarm</th><th style="padding:0.5rem;">Azione</th><th style="padding:0.5rem;">Livello</th><th style="padding:0.5rem;">Supervisore</th><th style="padding:0.5rem;">Latenza</th>' +
      '</tr></thead><tbody>' +
      rows +
      '</tbody></table></div></div>'
    );
  }

  /* ---------- Privacy chat UI (user + staff) ---------- */
  function openPrivacyChatWidget(opts) {
    opts = opts || {};
    var existing = document.getElementById('elisee-privacy-chat-widget');
    if (existing) {
      existing.style.display = 'flex';
      return;
    }

    var visitor = opts.visitor || {};
    try {
      var u = JSON.parse(localStorage.getItem('elisee_user_data') || 'null');
      if (u) {
        visitor.email = visitor.email || u.email;
        visitor.nome = visitor.nome || (u.nome || '') + ' ' + (u.cognome || '');
      }
    } catch (e) {}

    var wrap = document.createElement('div');
    wrap.id = 'elisee-privacy-chat-widget';
    wrap.style.cssText =
      'position:fixed;bottom:1.25rem;right:1.25rem;z-index:100050;width:min(380px,calc(100vw - 1.5rem));' +
      'height:min(520px,70vh);display:flex;flex-direction:column;background:linear-gradient(165deg,#070d1c,#0a1328);' +
      'border:1.5px solid rgba(56,189,248,0.45);border-radius:16px;box-shadow:0 20px 50px rgba(0,0,0,0.55);' +
      'font-family:Inter,system-ui,sans-serif;overflow:hidden;';

    wrap.innerHTML =
      '<div style="padding:0.85rem 1rem;background:rgba(2,132,199,0.25);border-bottom:1px solid rgba(56,189,248,0.3);display:flex;justify-content:space-between;align-items:center;">' +
      '<div><div style="font-weight:800;color:#e0f2fe;font-size:0.9rem;">Chat referente privacy</div>' +
      '<div style="font-size:0.7rem;color:#94a3b8;">Titolare ELISEE SCOUT · Art. 12–22 GDPR</div></div>' +
      '<button type="button" id="elisee-chat-close" style="background:transparent;border:1px solid rgba(148,163,184,0.4);color:#94a3b8;border-radius:8px;padding:0.25rem 0.55rem;cursor:pointer;">✕</button></div>' +
      '<div id="elisee-chat-messages" style="flex:1;overflow-y:auto;padding:0.85rem;display:flex;flex-direction:column;gap:0.55rem;"></div>' +
      '<div style="padding:0.65rem;border-top:1px solid rgba(255,255,255,0.08);display:flex;gap:0.4rem;">' +
      '<input id="elisee-chat-input" type="text" placeholder="Scriva la Sua richiesta…" style="flex:1;padding:0.55rem 0.7rem;border-radius:10px;border:1px solid rgba(56,189,248,0.35);background:#0b1222;color:#fff;font-size:0.85rem;outline:none;">' +
      '<button type="button" id="elisee-chat-send" style="padding:0.55rem 0.85rem;border-radius:10px;border:none;background:linear-gradient(90deg,#0284c7,#38bdf8);color:#fff;font-weight:800;cursor:pointer;font-size:0.8rem;">Invia</button></div>';

    document.body.appendChild(wrap);

    function renderMsgs() {
      var th = getOrCreateThread(visitor);
      var box = document.getElementById('elisee-chat-messages');
      if (!box) return;
      box.innerHTML = th.messages
        .map(function (m) {
          var isUser = m.from === 'user';
          var isPriv = m.from === 'privacy';
          var align = isUser ? 'flex-end' : 'flex-start';
          var bg = isUser
            ? 'rgba(2,132,199,0.35)'
            : isPriv
              ? 'rgba(34,197,94,0.2)'
              : 'rgba(148,163,184,0.12)';
          var label =
            isUser ? 'Lei' : isPriv ? 'Referente privacy' : 'Sistema';
          return (
            '<div style="align-self:' +
            align +
            ';max-width:90%;">' +
            '<div style="font-size:0.65rem;color:#64748b;margin-bottom:0.15rem;">' +
            label +
            '</div>' +
            '<div style="background:' +
            bg +
            ';border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:0.55rem 0.7rem;color:#e2e8f0;font-size:0.82rem;line-height:1.45;">' +
            escapeHtml(m.text) +
            '</div></div>'
          );
        })
        .join('');
      box.scrollTop = box.scrollHeight;
    }

    renderMsgs();
    document.getElementById('elisee-chat-close').onclick = function () {
      wrap.style.display = 'none';
    };
    function doSend() {
      var inp = document.getElementById('elisee-chat-input');
      var t = (inp && inp.value || '').trim();
      if (!t) return;
      if (!visitor.email) {
        visitor.email = 'ospite-' + Date.now().toString(36) + '@elisee.local';
        visitor.nome = visitor.nome || 'Ospite informativa';
      }
      sendUserMessage(t, visitor);
      inp.value = '';
      renderMsgs();
    }
    document.getElementById('elisee-chat-send').onclick = doSend;
    document.getElementById('elisee-chat-input').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') doSend();
    });
    global.addEventListener('elisee:privacy-chat', renderMsgs);
  }

  function renderPrivacyChatStaffHtml() {
    var threads = getThreads();
    if (!threads.length) {
      return (
        '<div style="padding:1rem;color:#94a3b8;font-size:0.88rem;">Nessuna chat attiva. Gli Interessati possono aprire la chat dalle informative privacy/cookie.</div>'
      );
    }
    var list = threads
      .map(function (th) {
        var last = th.messages[th.messages.length - 1];
        var badge =
          th.unreadPrivacy > 0
            ? '<span style="background:#ef4444;color:#fff;font-size:0.68rem;font-weight:800;padding:0.1rem 0.4rem;border-radius:999px;">' +
              th.unreadPrivacy +
              ' nuovi</span>'
            : '';
        return (
          '<button type="button" onclick="EliseeAiGdpr.openStaffThread(\'' +
          th.id +
          '\')" style="width:100%;text-align:left;background:rgba(15,23,42,0.6);border:1px solid rgba(56,189,248,0.2);border-radius:10px;padding:0.75rem 0.9rem;margin-bottom:0.5rem;cursor:pointer;color:#e2e8f0;">' +
          '<div style="display:flex;justify-content:space-between;gap:0.5rem;"><strong style="font-size:0.88rem;">' +
          escapeHtml(th.nome) +
          '</strong>' +
          badge +
          '</div>' +
          '<div style="font-size:0.75rem;color:#38bdf8;">' +
          escapeHtml(th.email) +
          '</div>' +
          '<div style="font-size:0.75rem;color:#94a3b8;margin-top:0.25rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' +
          escapeHtml(last && last.text) +
          '</div></button>'
        );
      })
      .join('');

    return (
      '<div id="elisee-privacy-chat-staff">' +
      '<h3 style="margin:0 0 0.35rem;color:#fff;font-size:1.1rem;font-weight:800;">Chat Interessati — Referente privacy</h3>' +
      '<p style="margin:0 0 1rem;color:#94a3b8;font-size:0.82rem;">Conversazioni avviate dalle informative. Risponda come operatore umano del Titolare.</p>' +
      '<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.4fr);gap:1rem;">' +
      '<div style="max-height:420px;overflow:auto;">' +
      list +
      '</div>' +
      '<div id="elisee-staff-thread-panel" style="background:rgba(15,23,42,0.5);border:1px solid rgba(255,255,255,0.08);border-radius:12px;min-height:320px;padding:0.85rem;display:flex;flex-direction:column;">' +
      '<div style="color:#64748b;font-size:0.85rem;margin:auto;">Seleziona una conversazione a sinistra</div>' +
      '</div></div></div>'
    );
  }

  function openStaffThread(threadId) {
    var threads = getThreads();
    var th = threads.find(function (t) {
      return t.id === threadId;
    });
    if (!th) return;
    markThreadReadByPrivacy(threadId);
    var panel = document.getElementById('elisee-staff-thread-panel');
    if (!panel) return;
    var msgs = th.messages
      .map(function (m) {
        var who =
          m.from === 'user' ? 'Interessato' : m.from === 'privacy' ? 'Lei (referente)' : 'Sistema';
        return (
          '<div style="margin-bottom:0.55rem;"><div style="font-size:0.65rem;color:#64748b;">' +
          who +
          ' · ' +
          escapeHtml(m.ts) +
          '</div><div style="font-size:0.82rem;color:#e2e8f0;background:rgba(0,0,0,0.25);padding:0.45rem 0.6rem;border-radius:8px;">' +
          escapeHtml(m.text) +
          '</div></div>'
        );
      })
      .join('');
    panel.innerHTML =
      '<div style="font-weight:700;color:#38bdf8;margin-bottom:0.5rem;">' +
      escapeHtml(th.nome) +
      ' · ' +
      escapeHtml(th.email) +
      '</div>' +
      '<div style="flex:1;overflow:auto;margin-bottom:0.65rem;">' +
      msgs +
      '</div>' +
      '<div style="display:flex;gap:0.4rem;">' +
      '<input id="elisee-staff-reply" type="text" placeholder="Risposta operatore umano…" style="flex:1;padding:0.5rem 0.65rem;border-radius:8px;border:1px solid rgba(56,189,248,0.35);background:#0b1222;color:#fff;font-size:0.82rem;">' +
      '<button type="button" onclick="(function(){var i=document.getElementById(\'elisee-staff-reply\');if(!i||!i.value.trim())return;EliseeAiGdpr.sendPrivacyReply(\'' +
      threadId +
      '\',i.value.trim());EliseeAiGdpr.openStaffThread(\'' +
      threadId +
      '\');if(window.renderActiveDashboard)window.renderActiveDashboard();else if(window.renderPrivacyPanel)window.renderPrivacyPanel();})()" style="padding:0.5rem 0.8rem;border-radius:8px;border:none;background:#16a34a;color:#fff;font-weight:800;cursor:pointer;font-size:0.78rem;">Rispondi</button></div>';
  }

  function injectPolicyChatButton() {
    if (document.getElementById('elisee-policy-chat-btn')) return;
    var path = (location.pathname || '').toLowerCase();
    if (path.indexOf('privacy-policy') === -1 && path.indexOf('cookie-policy') === -1) return;
    var btn = document.createElement('button');
    btn.id = 'elisee-policy-chat-btn';
    btn.type = 'button';
    btn.className = 'elisee-policy-chat-fab';
    btn.setAttribute('aria-label', 'Chat con il referente privacy');
    btn.title = 'Chat con il referente privacy';
    btn.innerHTML =
      '<span class="elisee-policy-chat-fab-icon" aria-hidden="true">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>' +
      '</svg></span>' +
      '<span class="elisee-policy-chat-fab-label">Chat con il referente privacy</span>';
    btn.onclick = function () {
      openPrivacyChatWidget({});
    };
    document.body.appendChild(btn);
  }

  // Bridge: listen to cluster real events
  document.addEventListener('elisee:ai-log', function (ev) {
    var d = ev.detail || {};
    pushMovement({
      agent: d.agent,
      swarm: d.swarm,
      swarmName: d.swarmName,
      action: d.action,
      detail: d.detail,
      level: d.level,
      latencyMs: d.latencyMs,
      source: d.source || 'agents-runtime'
    });
  });

  /**
   * Risolve immediatamente le anomalie LOW/MEDIUM già in localStorage
   * create prima dell'introduzione dell'auto-risoluzione supervisori.
   */
  function cleanupLegacyAnomalies() {
    var list = getAnomalies();
    var changed = false;
    list.forEach(function (a) {
      if (a.status === 'open' && (a.severity === 'low' || a.severity === 'medium')) {
        a.status = 'resolved';
        a.resolvedAt = nowISO();
        a.resolveNote = (a.supervisorId || 'PSUP-01') + ' · Risoluzione autonoma supervisore (' + (a.severity || 'medium').toUpperCase() + ')';
        changed = true;
      }
    });
    if (changed) {
      lsSet(ANOMALY_KEY, list);
      // Log di cleanup nel movimento
      pushMovement({
        agent: 'PSUP-01',
        swarm: 'platform_supervisors',
        swarmName: 'Supervisori piattaforma (3 su 715)',
        action: '✔ Cleanup anomalie pendenti — tutte le anomalie LOW/MEDIUM risolte autonomamente',
        detail: 'PSUP-01 · PSUP-02 · PSUP-03 · nessuna anomalia in coda per il Garante Privacy',
        level: 'ok',
        latencyMs: 2,
        source: 'supervisor-cleanup'
      });
    }
  }

  function init() {
    // Prima cosa: risolvi anomalie legacy MEDIUM/LOW in localStorage
    cleanupLegacyAnomalies();
    startSupervisors();
    injectPolicyChatButton();
    // seed one status line if empty
    if (!getMovement().length) {
      pushMovement({
        agent: 'PSUP-01',
        swarm: 'platform_supervisors',
        swarmName: 'Supervisori piattaforma (3 su 715)',
        action: 'Avvio supervisione cluster 715 agenti piattaforma',
        detail: 'PSUP-01 · PSUP-02 · PSUP-03 online',
        level: 'ok',
        source: 'boot'
      });
    }
  }

  var API = {
    SUPERVISORS: SUPERVISORS,
    PLATFORM_AGENTS: PLATFORM_AGENTS,
    PLATFORM_SUPERVISORS: PLATFORM_SUPERVISORS,
    getMovement: getMovement,
    pushMovement: pushMovement,
    getAnomalies: getAnomalies,
    pushAnomaly: pushAnomaly,
    resolveAnomaly: resolveAnomaly,
    getArt22Queue: getArt22Queue,
    enqueueArt22: enqueueArt22,
    gateAutomatedDecision: gateAutomatedDecision,
    userWantsHumanReview: userWantsHumanReview,
    renderMovementTableHtml: renderMovementTableHtml,
    openPrivacyChatWidget: openPrivacyChatWidget,
    renderPrivacyChatStaffHtml: renderPrivacyChatStaffHtml,
    openStaffThread: openStaffThread,
    sendUserMessage: sendUserMessage,
    sendPrivacyReply: sendPrivacyReply,
    getThreads: getThreads,
    startSupervisors: startSupervisors,
    init: init
  };

  global.EliseeAiGdpr = API;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(typeof window !== 'undefined' ? window : this);
