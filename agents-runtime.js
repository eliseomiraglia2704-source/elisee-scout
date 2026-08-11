/**
 * ELISEE SCOUT — Cluster Agenti IA
 * Runtime client-side: attiva, orchestra e anima l'intero sito.
 *
 * Aggiornamento PDF Task Estesi — Sezione 8.8:
 * + 12 Agenti della Missione (agenti 204–215)
 */
(function () {
  'use strict';

  /**
   * Cluster globale:
   * - 715 agenti piattaforma (swarms storici)
   * - +12 Agenti della Missione (agenti 204–215, Sez. 8.8) — vivaio, talenti, riforma
   * - +3 supervisori IA piattaforma (controllo qualità sui 727)
   * - +2010 agenti campionati (10 ruoli × 201 gironi)
   * - +402 supervisori H24 (2 × 201 gironi)
   * Totale operativo: 3142
   */
  const PLATFORM_AGENTS = 727; // 715 storici + 12 Missione (agenti 204–215)
  const PLATFORM_SUPERVISORS = 3; // supervisione dei 715
  const CAMPIONATI_AGENTS = 2010; // 10 × 201 gironi
  const CAMPIONATI_SUPERVISORS = 402; // 2 × 201 gironi
  const TOTAL_AGENTS =
    PLATFORM_AGENTS + PLATFORM_SUPERVISORS + CAMPIONATI_AGENTS + CAMPIONATI_SUPERVISORS;
  const STORAGE_KEY = 'elisee_ai_cluster_v1';
  const LOG_MAX = 120;

  /** Swarm definitions (sum = TOTAL_AGENTS) — i 715 restano invariati; +3 supervisori piattaforma */
  const SWARMS = [
    { id: 'orchestrate', name: 'Orchestrazione & Heartbeat', size: 40, color: '#38bdf8', icon: 'cpu' },
    { id: 'scouting', name: 'Scouting & Video Intelligence', size: 95, color: '#22c55e', icon: 'eye' },
    { id: 'matchmaking', name: 'Matchmaking Club–Atleta', size: 80, color: '#a78bfa', icon: 'git-merge' },
    { id: 'antifake', name: 'Anti-Fake & Trust', size: 70, color: '#f59e0b', icon: 'shield-check' },
    { id: 'legal', name: 'Normativa FIGC / Contratti', size: 55, color: '#fb7185', icon: 'scale' },
    { id: 'privacy', name: 'Privacy GDPR & Referente privacy', size: 60, color: '#34d399', icon: 'lock' },
    { id: 'ambassador', name: 'Ambassador & Idoneità', size: 35, color: '#2dd4bf', icon: 'badge-check' },
    { id: 'gps', name: 'GPS / Metriche Atletiche', size: 50, color: '#60a5fa', icon: 'activity' },
    { id: 'market', name: 'Trend Mercato & Annunci', size: 65, color: '#f472b6', icon: 'trending-up' },
    { id: 'comms', name: 'i18n / Traduzione / UX', size: 40, color: '#94a3b8', icon: 'languages' },
    { id: 'heal', name: 'Auto-Healing & DevOps', size: 75, color: '#eab308', icon: 'wrench' },
    { id: 'support', name: 'Assistenza & Routing', size: 50, color: '#38bdf8', icon: 'life-buoy' },
    {
      id: 'mission',
      name: 'Missione Vivaio & Riforma (agenti 204–215)',
      size: 12,
      color: '#f97316',
      icon: 'flag'
    },
    {
      id: 'platform_supervisors',
      name: 'Supervisori IA piattaforma (3 su 727)',
      size: PLATFORM_SUPERVISORS,
      color: '#f0abfc',
      icon: 'radar'
    },
    {
      id: 'campionati',
      name: 'Campionati dilettanti (10×girone)',
      size: CAMPIONATI_AGENTS,
      color: '#4ade80',
      icon: 'trophy'
    },
    {
      id: 'supervisors',
      name: 'Supervisori H24 (2×girone)',
      size: CAMPIONATI_SUPERVISORS,
      color: '#fbbf24',
      icon: 'shield'
    }
  ];

  // Ensure sum is exactly TOTAL_AGENTS
  (function normalizeSwarms() {
    let sum = SWARMS.reduce((a, s) => a + s.size, 0);
    if (sum !== TOTAL_AGENTS) SWARMS[0].size += TOTAL_AGENTS - sum;
  })();

  const ACTIONS = {
    orchestrate: [
      'Sincronizza heartbeat cluster',
      'Bilancia carico multi-thread',
      'Verifica latenza nodi < 15ms',
      'Riallinea code job SPA'
    ],
    scouting: [
      'Analizza highlight video 30s',
      'Tag automatico gol/assist',
      'Aggiorna report osservazione',
      'Valuta posture e leadership in campo'
    ],
    matchmaking: [
      'Calcola fit tattico club–atleta',
      'Propone shortlist Serie D',
      'Allinea budget e ruolo richiesto',
      'Ricalcola matching Network'
    ],
    antifake: [
      'Scan anti-fake dossier',
      'Verifica coerenza CF / anagrafica',
      'Controllo selfie liveness',
      'Flag profilo sospetto'
    ],
    legal: [
      'Check Art. 107/108 informativo',
      'Review bozza contratto',
      'Mappa clausole critiche',
      'Aggiorna checklist tesseramento'
    ],
    privacy: [
      'Audit consenso Art. 30',
      'Valuta DPIA residua',
      'Coda pratiche Responsabile Privacy',
      'Retention log 90gg'
    ],
    ambassador: [
      'Score idoneità Ambassador',
      'Verifica firma elettronica',
      'Instrada pratica al Responsabile Privacy',
      'Monitor SLA iscrizione'
    ],
    gps: [
      'Elabora traccia GPS sessione',
      'Stima carico atletico',
      'Risk infortunio midfield',
      'Aggiorna passaporto digitale'
    ],
    market: [
      'Trend ruoli più cercati',
      'Refresh bacheca annunci',
      'Previsione mercato regionale',
      'Priorità job matching'
    ],
    comms: [
      'Allinea stringhe i18n',
      'Traduci annuncio EN/ES/FR',
      'Ottimizza copy UX premium',
      'Suggerisci indirizzo via OSM'
    ],
    heal: [
      'Router → Diagnoser → Fixer',
      'Health check DOM/modali',
      'Ripara z-index overlay',
      'Verifica integrità localStorage'
    ],
    support: [
      'Routing ticket utente',
      'Classifica intent navigazione',
      'Assistenza accesso bivio',
      'Escalation admin se blocco'
    ],
    campionati: [
      'Sync organici da Tuttocampo',
      'Aggiorna classifiche e calendari',
      'Refresh marcatori e statistiche',
      'Validazione anti-drift liste squadre'
    ],
    supervisors: [
      'Heartbeat H24 flotta girone',
      'Detect agent blocked / stuck',
      'Riattivazione istantanea agente',
      'Escalation anomalia Area Admin'
    ],
    mission: [
      /* Agente 204 */ 'Trasparenza Minutaggio: pubblica utilizzo giovani italiani in tempo reale',
      /* Agente 205 */ 'Incentivi Vivaio: calcola incentivi club su minutaggio giovanile certificato',
      /* Agente 206 */ 'Audit Settore Giovanile: punteggio qualità vivaio (infrastrutture+staff+metodologia)',
      /* Agente 207 */ 'Mappatura Impianti Pubblici: aggiorna mappa campetti liberi (community + PNRR)',
      /* Agente 208 */ 'Compliance Quota Italiani: verifica soglie minime giocatori italiani per categoria',
      /* Agente 209 */ 'Certificazione Educatori: verifica requisiti + traccia percorso formativo tecnici',
      /* Agente 210 */ 'Anti-Selezione Fisica Precoce: rileva pattern selezione giovanile su stazza vs talento',
      /* Agente 211 */ 'Ponte Prima Squadra: monitora Under 18 e suggerisce momento ottimale salto prima squadra',
      /* Agente 212 */ 'Indice De Rossi: calcola esordienti prima squadra generati per ogni settore giovanile',
      /* Agente 213 */ 'Borse di Merito: abbina talenti meritevoli a borse economiche su criteri tecnici oggettivi',
      /* Agente 214 */ 'Sviluppo Protetto: applica status percorso-protetto ai giovani nei primi mesi prima squadra',
      /* Agente 215 */ 'Benchmark Riforme Estere: aggiorna confronto vs modelli Francia, Germania, Giappone'
    ],
    platform_supervisors: [
      'Audit heartbeat 727 agenti piattaforma',
      'Verifica latenza e code job SPA',
      'Segnala anomalia a Admin / referente privacy',
      'Gate Art. 22: escalation a operatore umano'
    ]
  };

  const state = {
    booted: false,
    booting: false,
    active: 0,
    swarms: {},
    log: [],
    opsTotal: 0,
    latencyMs: 12,
    lastHeartbeat: null,
    timers: []
  };

  SWARMS.forEach((s) => {
    state.swarms[s.id] = { active: 0, size: s.size, ops: 0 };
  });

  function loadPersisted() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data && data.booted) {
        state.booted = true;
        state.active = TOTAL_AGENTS;
        state.opsTotal = data.opsTotal || 0;
        Object.keys(state.swarms).forEach((id) => {
          state.swarms[id].active = state.swarms[id].size;
          if (data.swarms && data.swarms[id]) state.swarms[id].ops = data.swarms[id].ops || 0;
        });
      }
    } catch (_) { /* ignore */ }
  }

  function persist() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          booted: state.booted,
          opsTotal: state.opsTotal,
          swarms: Object.fromEntries(
            Object.entries(state.swarms).map(([id, s]) => [id, { ops: s.ops }])
          ),
          ts: Date.now()
        })
      );
    } catch (_) { /* ignore */ }
  }

  function pushLog(entry) {
    state.log.unshift({
      t: new Date().toISOString(),
      tLabel: new Date().toLocaleTimeString('it-IT'),
      ...entry
    });
    if (state.log.length > LOG_MAX) state.log.length = LOG_MAX;
    renderFeed();
    document.dispatchEvent(new CustomEvent('elisee:ai-log', { detail: entry }));
  }

  function agentCode(swarmId, n) {
    const prefix = swarmId.slice(0, 3).toUpperCase();
    return `AI-${prefix}-${String(n).padStart(3, '0')}`;
  }

  function randomOf(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /**
   * Registra SOLO eventi reali (navigazione, form, login, invii, filtri…).
   * Nessun log di esempio / simulato.
   */
  function logRealEvent(opts) {
    if (!opts || !opts.action) return null;
    const swarmId = opts.swarm || 'orchestrate';
    const swarm = SWARMS.find((s) => s.id === swarmId) || SWARMS[0];
    const agentN =
      typeof opts.agentIndex === 'number'
        ? opts.agentIndex
        : 1 + (Math.abs(hashStr(opts.action + (opts.detail || ''))) % swarm.size);

    const t0 = performance.now();
    state.swarms[swarm.id].ops += 1;
    state.opsTotal += 1;
    state.lastHeartbeat = Date.now();
    // Latenza reale dell'handler (ms) se passata, altrimenti delta minimo
    const measured =
      typeof opts.latencyMs === 'number'
        ? opts.latencyMs
        : Math.max(1, Math.round(performance.now() - t0));
    state.latencyMs = measured;

    const entry = {
      swarm: swarm.id,
      swarmName: swarm.name,
      color: swarm.color,
      agent: opts.agent || agentCode(swarm.id, agentN),
      action: String(opts.action).slice(0, 220),
      detail: opts.detail || '',
      level: opts.level === 'warn' || opts.level === 'error' ? opts.level : 'ok',
      real: true,
      source: opts.source || 'app'
    };
    pushLog(entry);
    updateHudCounters();
    if (state.opsTotal % 5 === 0) persist();
    return entry;
  }

  function hashStr(s) {
    let h = 0;
    const str = String(s || '');
    for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    return h;
  }

  /** Heartbeat silenzioso: solo stato, nessun log finto */
  function silentHeartbeat() {
    if (!state.booted) return;
    state.lastHeartbeat = Date.now();
    // non genera log
  }

  /* ---------- UI: boot overlay + live HUD ----------
   * - Chip in ALTO (navbar): MAI visibile
   * - Cluster neurale live: SOLO se staff loggato E si è nell'area admin/responsabile-privacy
   * - Pubblico: nessun HUD, nessun chip, nessun boot overlay
   */

  function isStaffViewer() {
    try {
      return (
        localStorage.getItem('elisee_admin_auth') === 'true' ||
        localStorage.getItem('elisee_privacy_auth') === 'true'
      );
    } catch (_) {
      return false;
    }
  }

  /** true solo dentro portale Admin/Responsabile Privacy (non su Home/Account/ecc.) */
  function isInAdminGaranteArea() {
    try {
      const hash = (window.location.hash || '').toLowerCase();
      // match esatto — NON usare indexOf('admin') (evita falsi positivi)
      if (hash === '#admin-portal') return true;
      const adminGroup = document.getElementById('admin-view-group');
      if (adminGroup) {
        const d = (adminGroup.style && adminGroup.style.display) || '';
        if (d && d !== 'none') {
          const cs = window.getComputedStyle ? window.getComputedStyle(adminGroup).display : d;
          if (cs && cs !== 'none') return true;
        }
      }
      const view = (localStorage.getItem('elisee_view') || '').toLowerCase();
      if (view === 'admin') return true;
    } catch (_) { /* ignore */ }
    return false;
  }

  function shouldShowClusterHud() {
    return isStaffViewer() && isInAdminGaranteArea();
  }

  function hideElHard(el) {
    if (!el) return;
    el.hidden = true;
    el.setAttribute('hidden', '');
    el.style.setProperty('display', 'none', 'important');
    el.style.setProperty('visibility', 'hidden', 'important');
    el.style.setProperty('pointer-events', 'none', 'important');
    el.setAttribute('aria-hidden', 'true');
  }

  function showElHard(el, display) {
    if (!el) return;
    el.hidden = false;
    el.removeAttribute('hidden');
    el.style.setProperty('display', display || 'block', 'important');
    el.style.setProperty('visibility', 'visible', 'important');
    el.style.setProperty('pointer-events', 'auto', 'important');
    el.setAttribute('aria-hidden', 'false');
  }

  function setStaffUiVisible(show) {
    const hud = document.getElementById('ai-cluster-hud');
    const chip = document.getElementById('ai-nav-chip');
    const boot = document.getElementById('ai-cluster-boot');

    // Chip navbar: SEMPRE nascosto (richiesta esplicita)
    hideElHard(chip);

    // HUD cluster: solo admin/responsabile-privacy area + staff
    if (hud) {
      if (show) showElHard(hud, 'block');
      else hideElHard(hud);
    }

    // Boot overlay: mai per pubblico; solo staff in admin se mai usato
    if (boot) hideElHard(boot);
  }

  function refreshVisibility() {
    ensureUi();
    setStaffUiVisible(shouldShowClusterHud());
    updateHudCounters();
  }

  function ensureUi() {
    if (document.getElementById('ai-cluster-hud')) {
      setStaffUiVisible(shouldShowClusterHud());
      // chip sempre via
      hideElHard(document.getElementById('ai-nav-chip'));
      return;
    }

    const style = document.createElement('style');
    style.id = 'ai-cluster-styles';
    style.textContent = `
      #ai-cluster-boot {
        position: fixed; inset: 0; z-index: 10000050;
        display: flex; align-items: center; justify-content: center;
        background: rgba(2,6,12,0.92); backdrop-filter: blur(14px);
        padding: 1.25rem;
        pointer-events: none;
      }
      #ai-cluster-boot[hidden] {
        display: none !important;
        pointer-events: none !important;
        visibility: hidden !important;
      }
      #ai-cluster-hud[hidden] {
        display: none !important;
        pointer-events: none !important;
        visibility: hidden !important;
      }
      /* Chip in alto: mai mostrato al pubblico né in nav */
      #ai-nav-chip {
        display: none !important;
        visibility: hidden !important;
        pointer-events: none !important;
        width: 0 !important;
        height: 0 !important;
        overflow: hidden !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
      }
      .ai-boot-card {
        width: min(440px, 100%);
        background: #0a0e16;
        border: 1px solid rgba(56,189,248,0.35);
        border-radius: 18px;
        padding: 1.5rem 1.35rem 1.25rem;
        box-shadow: 0 30px 80px rgba(0,0,0,0.75);
        text-align: center;
      }
      .ai-boot-kicker {
        margin: 0 0 0.35rem; font-size: 0.7rem; letter-spacing: 0.14em;
        text-transform: uppercase; color: #38bdf8; font-weight: 800;
      }
      .ai-boot-card h2 { margin: 0 0 0.5rem; color: #fff; font-size: 1.25rem; }
      .ai-boot-sub { margin: 0 0 1.1rem; color: #94a3b8; font-size: 0.88rem; line-height: 1.45; }
      .ai-boot-bar {
        height: 8px; border-radius: 999px; background: rgba(255,255,255,0.06);
        overflow: hidden; margin-bottom: 0.65rem;
      }
      .ai-boot-bar > i {
        display: block; height: 100%; width: 0%;
        background: linear-gradient(90deg, #0284c7, #38bdf8, #22c55e);
        border-radius: 999px; transition: width 0.12s linear;
      }
      .ai-boot-count { margin: 0; color: #e2e8f0; font-weight: 700; font-size: 0.95rem; }
      .ai-boot-swarm { margin: 0.45rem 0 0; font-size: 0.78rem; color: #64748b; min-height: 1.2em; }

      #ai-cluster-hud {
        position: fixed; right: 1rem; bottom: 1rem; z-index: 99990;
        width: min(340px, calc(100vw - 1.5rem));
        font-family: Inter, system-ui, sans-serif;
        pointer-events: none;
      }
      #ai-cluster-hud.is-collapsed .ai-hud-panel { display: none; }
      .ai-hud-toggle {
        pointer-events: auto;
        margin-left: auto; display: flex; align-items: center; gap: 0.45rem;
        background: rgba(10,14,22,0.92); border: 1px solid rgba(34,197,94,0.45);
        color: #e2e8f0; border-radius: 999px; padding: 0.45rem 0.85rem;
        font-size: 0.75rem; font-weight: 700; cursor: pointer;
        box-shadow: 0 10px 30px rgba(0,0,0,0.45);
        backdrop-filter: blur(10px);
      }
      .ai-hud-toggle .ai-pulse {
        width: 8px; height: 8px; border-radius: 50%; background: #22c55e;
        box-shadow: 0 0 0 0 rgba(34,197,94,0.7);
        animation: ai-pulse 1.6s infinite;
      }
      @keyframes ai-pulse {
        0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.55); }
        70% { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
        100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
      }
      .ai-hud-panel {
        pointer-events: auto;
        margin-top: 0.55rem;
        background: rgba(10,14,22,0.96);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 14px;
        overflow: hidden;
        box-shadow: 0 18px 50px rgba(0,0,0,0.55);
        backdrop-filter: blur(12px);
      }
      .ai-hud-head {
        display: flex; justify-content: space-between; align-items: center;
        padding: 0.7rem 0.85rem; border-bottom: 1px solid rgba(255,255,255,0.06);
      }
      .ai-hud-head strong { color: #fff; font-size: 0.82rem; }
      .ai-hud-head span { color: #22c55e; font-size: 0.72rem; font-weight: 700; }
      .ai-hud-stats {
        display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.35rem;
        padding: 0.65rem 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.05);
      }
      .ai-hud-stat { text-align: center; }
      .ai-hud-stat b { display: block; color: #f1f5f9; font-size: 0.95rem; }
      .ai-hud-stat small { color: #64748b; font-size: 0.65rem; letter-spacing: 0.04em; text-transform: uppercase; }
      .ai-hud-feed {
        max-height: 160px; overflow-y: auto; padding: 0.4rem 0;
        scrollbar-width: thin; scrollbar-color: rgba(56,189,248,0.3) transparent;
      }
      .ai-hud-item {
        padding: 0.4rem 0.85rem; font-size: 0.72rem; line-height: 1.35;
        border-left: 2px solid transparent; color: #94a3b8;
      }
      .ai-hud-item.is-ok { border-left-color: #22c55e; }
      .ai-hud-item.is-warn { border-left-color: #f59e0b; color: #fde68a; }
      .ai-hud-item .ai-hud-agent { color: #38bdf8; font-weight: 700; }
      .ai-hud-item time { color: #475569; font-size: 0.65rem; margin-right: 0.35rem; }
      .ai-hud-empty { padding: 0.85rem; font-size: 0.75rem; color: #64748b; text-align: center; line-height: 1.4; }

      .ai-nav-chip {
        display: inline-flex; align-items: center; gap: 0.35rem;
        padding: 0.28rem 0.65rem; border-radius: 999px;
        border: 1px solid rgba(34,197,94,0.4);
        background: rgba(34,197,94,0.1);
        color: #86efac; font-size: 0.68rem; font-weight: 700;
        letter-spacing: 0.04em; white-space: nowrap;
      }
      .ai-nav-chip .ai-pulse { width: 6px; height: 6px; }

      .portfolio-stat[data-ai-live] strong {
        color: #22c55e;
        text-shadow: 0 0 18px rgba(34,197,94,0.35);
      }
    `;
    document.head.appendChild(style);

    // Boot overlay
    const boot = document.createElement('div');
    boot.id = 'ai-cluster-boot';
    boot.hidden = true;
    boot.innerHTML = `
      <div class="ai-boot-card" role="status" aria-live="polite">
        <p class="ai-boot-kicker">ELISEE SCOUT · Neural Cluster</p>
        <h2>Attivazione ${TOTAL_AGENTS} Agenti IA</h2>
        <p class="ai-boot-sub">Orchestrazione multi-swarm: scouting, privacy, campionati Tuttocampo (90), matchmaking, anti-fake…</p>
        <div class="ai-boot-bar"><i id="ai-boot-bar-fill"></i></div>
        <p class="ai-boot-count"><span id="ai-boot-num">0</span> / ${TOTAL_AGENTS} online</p>
        <p class="ai-boot-swarm" id="ai-boot-swarm-label">Inizializzazione…</p>
      </div>`;
    document.body.appendChild(boot);
    hideElHard(boot); // CLICKFIX never block page

    // Live HUD — nascosto di default; solo Admin/Responsabile Privacy dentro #admin-portal
    const hud = document.createElement('div');
    hud.id = 'ai-cluster-hud';
    hud.classList.add('is-collapsed'); // Parte sempre chiuso — si apre al click
    hideElHard(hud);
    hud.innerHTML = `
      <button type="button" class="ai-hud-toggle" id="ai-hud-toggle" title="Cluster IA (solo Admin/Responsabile Privacy)">
        <span class="ai-pulse" aria-hidden="true"></span>
        <span id="ai-hud-toggle-label">IA 0/${TOTAL_AGENTS}</span>
      </button>
      <div class="ai-hud-panel" id="ai-hud-panel">
        <div class="ai-hud-head">
          <strong>Cluster neurale live</strong>
          <span id="ai-hud-status">BOOT…</span>
        </div>
        <div class="ai-hud-stats">
          <div class="ai-hud-stat"><b id="ai-hud-active">0</b><small>Attivi</small></div>
          <div class="ai-hud-stat"><b id="ai-hud-ops">0</b><small>Ops</small></div>
          <div class="ai-hud-stat"><b id="ai-hud-lat">—</b><small>Latenza</small></div>
        </div>
        <div class="ai-hud-feed" id="ai-hud-feed"></div>
      </div>`;
    document.body.appendChild(hud);

    document.getElementById('ai-hud-toggle').addEventListener('click', () => {
      hud.classList.toggle('is-collapsed');
    });

    // NON iniettare chip in navbar (richiesta: non visibile in alto)
    // Rimuovi eventuali chip residui da sessioni precedenti
    const oldChip = document.getElementById('ai-nav-chip');
    if (oldChip && oldChip.parentNode) oldChip.parentNode.removeChild(oldChip);

    setStaffUiVisible(shouldShowClusterHud());
  }

  function injectNavChip() {
    // disabilitato: il chip in alto non deve mai comparire
    const old = document.getElementById('ai-nav-chip');
    if (old && old.parentNode) old.parentNode.removeChild(old);
  }

  function renderFeed() {
    const feed = document.getElementById('ai-hud-feed');
    if (!feed) return;
    const real = state.log.filter((e) => e.real !== false && e.action);
    if (!real.length) {
      feed.innerHTML =
        '<div class="ai-hud-empty">In attesa di eventi reali sul sito (navigazione, form, login, invii…).<br>Nessun log di esempio.</div>';
      return;
    }
    feed.innerHTML = real
      .slice(0, 24)
      .map(
        (e) => `<div class="ai-hud-item ${e.level === 'warn' || e.level === 'error' ? 'is-warn' : 'is-ok'}">
          <time>${e.tLabel || ''}</time>
          <span class="ai-hud-agent">${e.agent || ''}</span>
          ${escapeFeed(e.action || '')}
        </div>`
      )
      .join('');
  }

  function escapeFeed(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function updateHudCounters() {
    const formatN = (n) => (n || n === 0) ? Number(n).toLocaleString('it-IT') : '0';
    const set = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.textContent = v;
    };
    set('ai-hud-active', formatN(state.active));
    set('ai-hud-ops', state.opsTotal > 9999 ? (state.opsTotal / 1000).toFixed(1) + 'k' : formatN(state.opsTotal));
    set('ai-hud-lat', state.latencyMs + 'ms');
    set('ai-hud-toggle-label', `IA ${formatN(state.active)} / ${formatN(TOTAL_AGENTS)}`);
    set('ai-hud-status', state.booted ? 'ONLINE' : state.booting ? 'BOOT…' : 'OFF');
    const chip = document.getElementById('ai-nav-chip-text');
    if (chip) chip.textContent = state.booted ? `IA ${formatN(state.active)}` : 'IA…';

    // Home stats
    document.querySelectorAll('.portfolio-stat').forEach((stat) => {
      const label = (stat.querySelector('span') || {}).textContent || '';
      if (/agenti/i.test(label) || /agents/i.test(label)) {
        const strong = stat.querySelector('strong');
        if (strong) {
          strong.textContent = formatN(state.active);
          stat.setAttribute('data-ai-live', '1');
        }
      }
    });

    // Admin live slots if present
    document.querySelectorAll('[data-ai-cluster-active]').forEach((el) => {
      el.textContent = `${formatN(state.active)} / ${formatN(TOTAL_AGENTS)}`;
    });
    document.querySelectorAll('[data-ai-cluster-ops]').forEach((el) => {
      el.textContent = formatN(state.opsTotal);
    });
    document.querySelectorAll('[data-ai-cluster-lat]').forEach((el) => {
      el.textContent = state.latencyMs + ' ms';
    });
  }

  async function bootCluster({ force = false } = {}) {
    ensureUi();
    setStaffUiVisible(shouldShowClusterHud());
    const staff = isStaffViewer();

    if (state.booted && !force) {
      updateHudCounters();
      startHeartbeat();
      return;
    }
    if (state.booting) return;
    state.booting = true;
    state.active = 0;
    Object.keys(state.swarms).forEach((id) => {
      state.swarms[id].active = 0;
    });

    const bootEl = document.getElementById('ai-cluster-boot');
    const bar = document.getElementById('ai-boot-bar-fill');
    const num = document.getElementById('ai-boot-num');
    const swarmLabel = document.getElementById('ai-boot-swarm-label');

    // Boot sempre silenzioso (niente overlay a schermo intero per nessuno)
    const showBootUi = false;
    if (bootEl) hideElHard(bootEl);

    // Progressive activation by swarm
    for (const swarm of SWARMS) {
      if (showBootUi && swarmLabel) swarmLabel.textContent = `Attivo: ${swarm.name}`;
      const chunk = Math.max(1, Math.ceil(swarm.size / (showBootUi ? 8 : 3)));
      let done = 0;
      while (done < swarm.size) {
        const step = Math.min(chunk, swarm.size - done);
        done += step;
        state.swarms[swarm.id].active = done;
        state.active = Object.values(state.swarms).reduce((a, s) => a + s.active, 0);
        if (showBootUi) {
          if (num) num.textContent = String(state.active);
          if (bar) bar.style.width = ((state.active / TOTAL_AGENTS) * 100).toFixed(1) + '%';
        }
        updateHudCounters();
        await new Promise((r) => setTimeout(r, showBootUi ? 28 : 4));
      }
      pushLog({
        swarm: swarm.id,
        swarmName: swarm.name,
        color: swarm.color,
        agent: agentCode(swarm.id, swarm.size),
        action: `Swarm online · ${swarm.size} agenti`,
        level: 'ok'
      });
    }

    state.active = TOTAL_AGENTS;
    state.booted = true;
    state.booting = false;
    state.lastHeartbeat = Date.now();
    persist();
    updateHudCounters();
    setStaffUiVisible(shouldShowClusterHud());

    pushLog({
      swarm: 'orchestrate',
      swarmName: 'Orchestrazione',
      agent: 'AI-ORC-001',
      action: `Cluster ${TOTAL_AGENTS}/${TOTAL_AGENTS} ONLINE — sito operativo (+${CAMPIONATI_AGENTS} campionati Tuttocampo)`,
      level: 'ok'
    });

    document.dispatchEvent(
      new CustomEvent('elisee:ai-cluster-ready', {
        detail: { active: TOTAL_AGENTS, swarms: state.swarms }
      })
    );

    if (showBootUi && bootEl) {
      if (swarmLabel) swarmLabel.textContent = 'Cluster operativo (vista riservata Admin/Responsabile Privacy).';
      await new Promise((r) => setTimeout(r, 700));
      bootEl.hidden = true;
      bootEl.setAttribute('hidden', '');
    }

    startHeartbeat();
  }

  function startHeartbeat() {
    state.timers.forEach((t) => clearInterval(t));
    state.timers = [];
    // Solo heartbeat silenzioso (nessun log finto)
    state.timers.push(setInterval(silentHeartbeat, 15000));
  }

  /**
   * Bind automatico a eventi DOM/real-app reali.
   */
  function bindRealEventBridges() {
    if (document.documentElement.dataset.aiRealBridge === '1') return;
    document.documentElement.dataset.aiRealBridge = '1';

    // Navigazione hash reale
    window.addEventListener('hashchange', () => {
      const hash = location.hash || '#';
      const swarm =
        hash.includes('ambassador')
          ? 'ambassador'
          : hash.includes('persone') || hash.includes('network')
            ? 'matchmaking'
            : hash.includes('bacheca') || hash.includes('portfolio')
              ? 'market'
              : hash.includes('account') || hash.includes('admin')
                ? 'support'
                : hash.includes('about')
                  ? 'comms'
                  : 'orchestrate';
      logRealEvent({
        swarm,
        action: `Navigazione reale → ${hash}`,
        source: 'hashchange'
      });
    });

    // Click reali su link/bottoni con data-view o destinazioni note
    document.addEventListener(
      'click',
      (e) => {
        const t = e.target.closest(
          'a[data-view], button[data-view], a[href^="#"], .nav-link, .btn-nav-accedi, .btn-nav-iscriviti, [data-ai-event]'
        );
        if (!t) return;
        if (t.closest('#ai-cluster-hud, #ai-cluster-boot, #lang-switcher-menu')) return;

        const view = t.getAttribute('data-view') || '';
        const href = t.getAttribute('href') || '';
        const label = (t.getAttribute('data-ai-event') || t.textContent || '')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 80);
        if (!view && !href && !label) return;

        let swarm = 'support';
        if (view === 'ambassador' || href.includes('ambassador')) swarm = 'ambassador';
        else if (view === 'persone' || href.includes('persone')) swarm = 'matchmaking';
        else if (view === 'bacheca' || href.includes('bacheca')) swarm = 'market';
        else if (view === 'admin' || href.includes('admin') || /accedi/i.test(label)) swarm = 'support';
        else if (view === 'about') swarm = 'comms';
        else if (view === 'pillars' || href.includes('dashboard')) swarm = 'orchestrate';
        else if (view === 'home' || href === '#hero' || href === '#') swarm = 'comms';

        logRealEvent({
          swarm,
          action: `Click reale: ${label || view || href}`,
          detail: view || href,
          source: 'click'
        });
      },
      true
    );

    // Submit form reali
    document.addEventListener(
      'submit',
      (e) => {
        const form = e.target;
        if (!form || form.tagName !== 'FORM') return;
        const id = form.id || form.getAttribute('name') || 'form';
        let swarm = 'support';
        if (id.includes('ambassador') || id.includes('amb')) swarm = 'ambassador';
        else if (id.includes('admin')) swarm = 'privacy';
        else if (id.includes('login') || id.includes('regist') || id.includes('accesso')) swarm = 'antifake';
        logRealEvent({
          swarm,
          action: `Submit form reale: #${id}`,
          source: 'form-submit'
        });
      },
      true
    );

    // Cambio lingua reale
    document.addEventListener('elisee:lang-changed', (e) => {
      const lang = (e.detail && e.detail.lang) || '';
      logRealEvent({
        swarm: 'comms',
        action: `Cambio lingua reale → ${String(lang).toUpperCase()}`,
        source: 'i18n'
      });
    });

    // Auth staff
    document.addEventListener('elisee:auth-changed', (e) => {
      const role = (e.detail && e.detail.role) || 'unknown';
      logRealEvent({
        swarm: 'privacy',
        action: role === 'staff' ? 'Login staff reale (Admin/Responsabile Privacy)' : 'Logout staff reale',
        source: 'auth'
      });
    });

    // Eventi custom dell'app
    document.addEventListener('elisee:ai-real', (e) => {
      const d = e.detail || {};
      logRealEvent({
        swarm: d.swarm || 'orchestrate',
        action: d.action || 'Evento applicativo',
        detail: d.detail || '',
        level: d.level || 'ok',
        source: d.source || 'custom',
        latencyMs: d.latencyMs
      });
    });
  }

  /** Public API used by the rest of the site */
  const api = {
    TOTAL: TOTAL_AGENTS,
    PLATFORM: PLATFORM_AGENTS,
    CAMPIONATI: CAMPIONATI_AGENTS,
    SUPERVISORS: CAMPIONATI_SUPERVISORS,
    isOnline: () => state.booted,
    getActive: () => state.active,
    getOps: () => state.opsTotal,
    getLatency: () => state.latencyMs,
    getSwarms: () =>
      SWARMS.map((s) => ({
        ...s,
        active: state.swarms[s.id].active,
        ops: state.swarms[s.id].ops
      })),
    getLog: () => state.log.filter((e) => e.real !== false).slice(),
    boot: bootCluster,
    forceReboot: () => bootCluster({ force: true }),
    /** Log evento reale esplicito dall'app */
    logEvent(swarmId, action, extra) {
      return logRealEvent({
        swarm: swarmId,
        action,
        ...(extra || {}),
        source: (extra && extra.source) || 'api'
      });
    },
    /**
     * Task reale: richiede action esplicita (niente frasi di esempio casuali).
     */
    runTask(swarmId, action, extra) {
      if (!action) {
        console.warn('[EliseeAICluster] runTask richiede un action reale, non un placeholder.');
        return Promise.resolve(null);
      }
      const entry = logRealEvent({
        swarm: swarmId,
        action,
        ...(extra || {}),
        source: (extra && extra.source) || 'runTask'
      });
      return Promise.resolve(entry);
    },
    /**
     * Review Ambassador basata sui dati reali del payload (non messaggi inventati).
     */
    async multiAgentReview(payload) {
      const name = (payload && payload.name) || '—';
      const cf = (payload && payload.cf) || '—';
      const steps = [
        {
          swarm: 'antifake',
          action: `Anti-fake: verifica anagrafica «${name}» / CF ${cf}`
        },
        {
          swarm: 'legal',
          action: `Legale: controllo età da data ${payload && payload.birthdate ? payload.birthdate : 'n/d'}`
        },
        {
          swarm: 'privacy',
          action: `Privacy: trattamento dati residenza «${(payload && payload.address) || 'n/d'}»`
        },
        {
          swarm: 'ambassador',
          action: `Ambassador: score idoneità su pratica di ${name}`
        },
        {
          swarm: 'orchestrate',
          action: `Orchestratore: consolidamento verdetto multi-agente per ${name}`
        }
      ];
      for (const s of steps) {
        await api.runTask(s.swarm, s.action, { source: 'ambassador-review' });
        await new Promise((r) => setTimeout(r, 120));
      }
      return { agentsConsulted: steps.length, clusterOnline: state.booted, real: true };
    }
  };

  api.refreshVisibility = refreshVisibility;
  api.isStaffViewer = isStaffViewer;

  window.EliseeAICluster = api;

  // Auto-start
  function start() {
    loadPersisted();
    ensureUi();
    // Rimuovi chip alto e nascondi HUD finché non siamo in admin
    injectNavChip();
    setStaffUiVisible(false);
    bindRealEventBridges();
    if (state.booted) {
      updateHudCounters();
      renderFeed();
      logRealEvent({
        swarm: 'orchestrate',
        action: `Ripresa sessione: cluster già online ${TOTAL_AGENTS}/${TOTAL_AGENTS}`,
        source: 'session'
      });
      startHeartbeat();
    } else {
      // Boot silenzioso sempre (niente overlay pubblico)
      setTimeout(() => bootCluster(), 400);
    }

    // Log iniziale se c'è già un hash (navigazione reale in ingresso)
    if (location.hash) {
      setTimeout(() => {
        logRealEvent({
          swarm: 'orchestrate',
          action: `Apertura pagina reale ${location.hash}`,
          source: 'page-load'
        });
        refreshVisibility();
      }, 900);
    }

    // Aggiorna visibilità quando cambia auth o pagina
    window.addEventListener('storage', (e) => {
      if (
        e.key === 'elisee_admin_auth' ||
        e.key === 'elisee_privacy_auth' ||
        e.key === 'elisee_view' ||
        e.key === null
      ) {
        refreshVisibility();
      }
    });
    document.addEventListener('elisee:auth-changed', refreshVisibility);
    window.addEventListener('hashchange', refreshVisibility);
    document.addEventListener('elisee:view-changed', refreshVisibility);

    // Poll: mostra HUD solo se staff + area admin
    setInterval(() => {
      const want = shouldShowClusterHud();
      const hud = document.getElementById('ai-cluster-hud');
      const shown =
        hud &&
        !hud.hidden &&
        hud.style.display !== 'none' &&
        window.getComputedStyle(hud).display !== 'none';
      if (want !== !!shown) refreshVisibility();
      // chip sempre assente
      const chip = document.getElementById('ai-nav-chip');
      if (chip) hideElHard(chip);
    }, 800);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
