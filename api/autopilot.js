/**
 * Vercel Serverless Function — Elisee AutoPilot Backend Bridge (/api/autopilot/*)
 * Consente la gestione di status, start, stop, config, health, log e bridge su Vercel.
 */
const fs = require('fs');
const path = require('path');

const STATE_FILE = process.env.VERCEL ? '/tmp/elisee-autopilot-state.json' : path.join(process.cwd(), 'data', 'autopilot', 'state.json');

function nowIso() {
  return new Date().toISOString();
}

function getDefaultState() {
  return {
    running: true,
    enabled: true,
    started_at: nowIso(),
    cycles: 1,
    last_cycle: nowIso(),
    fleets: {
      discovery: { enabled: true, count: 12, last_run: nowIso() },
      evaluation: { enabled: true, count: 8, last_run: nowIso() },
      compliance: { enabled: true, count: 24, last_run: nowIso() },
      bridge: { enabled: true, count: 6, last_run: nowIso() }
    },
    cfg: {
      interval_sec: 60,
      auto_bridge: true,
      log_limit: 100
    },
    log: [
      { ts: nowIso(), lvl: 'INFO', msg: 'AutoPilot Vercel Bridge online' }
    ]
  };
}

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
  } catch (e) {}
  return getDefaultState();
}

function saveState(st) {
  try {
    fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(st, null, 2));
  } catch (e) {}
}

function sendJson(res, code, body) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Elisee-Admin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.end(JSON.stringify(body));
}

const AUTOPILOT_ROUTES = {
  '': '/api/autopilot',
  'status': '/api/autopilot/status',
  'health': '/api/autopilot/health',
  'log': '/api/autopilot/log',
  'config': '/api/autopilot/config',
  'start': '/api/autopilot/start',
  'stop': '/api/autopilot/stop',
  'force-cycle': '/api/autopilot/force-cycle',
  'log/clear': '/api/autopilot/log/clear',
  'bridge': '/api/autopilot/bridge'
};
const AUTOPILOT_FLEETS = {
  discovery: true,
  evaluation: true,
  compliance: true,
  bridge: true,
  platformCluster: true,
  campionatiAgents: true,
  campionatiSupervisors: true,
  gdprSupervisors: true,
  warRoomWatch: true,
  opsJobs: true,
  integrazioniKpi: true
};

function autopilotPathFromQuery(raw) {
  const p = String(raw || '').replace(/^\/+/, '').split('?')[0].split('#')[0];
  if (p.indexOf('..') >= 0 || p.indexOf('\\') >= 0) return null;
  if (Object.prototype.hasOwnProperty.call(AUTOPILOT_ROUTES, p)) return AUTOPILOT_ROUTES[p];
  if (p.indexOf('fleet/') === 0) {
    const fid = p.slice('fleet/'.length).split('/')[0];
    if (Object.prototype.hasOwnProperty.call(AUTOPILOT_FLEETS, fid)) return '/api/autopilot/fleet/' + fid;
  }
  return null;
}

function readBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 2e6) req.destroy();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(raw || '{}'));
      } catch (e) {
        resolve({});
      }
    });
  });
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 204, {});
  }

  const url = new URL(req.url, `https://${req.headers.host || 'localhost'}`);
  let pathname = url.pathname;
  const qPath = url.searchParams.get('path');
  if (qPath) {
    const mapped = autopilotPathFromQuery(qPath);
    if (!mapped) return sendJson(res, 404, { ok: false, error: 'percorso' });
    pathname = mapped;
  }

  const method = req.method.toUpperCase();
  const st = loadState();

  // Rotte API Autopilot
  if (pathname === '/api/autopilot' || pathname === '/api/autopilot/status') {
    return sendJson(res, 200, { ok: true, status: st });
  }

  if (pathname === '/api/autopilot/health') {
    return sendJson(res, 200, { ok: true, running: st.running, enabled: st.enabled, backend: true });
  }

  if (pathname === '/api/autopilot/log') {
    let limit = parseInt(url.searchParams.get('limit') || '80', 10);
    if (!Number.isFinite(limit) || limit < 1) limit = 80;
    if (limit > 200) limit = 200;
    const logs = Array.isArray(st.log) ? st.log.slice(-limit) : [];
    return sendJson(res, 200, { ok: true, log: logs });
  }

  if (pathname === '/api/autopilot/config') {
    if (method === 'GET') {
      return sendJson(res, 200, { ok: true, cfg: st.cfg || {} });
    }
    const body = await readBody(req);
    const next = {};
    if (body && body.interval_sec != null) {
      const n = parseInt(body.interval_sec, 10);
      if (Number.isFinite(n)) next.interval_sec = Math.min(3600, Math.max(10, n));
    }
    if (body && typeof body.auto_bridge === 'boolean') next.auto_bridge = body.auto_bridge;
    if (body && body.log_limit != null) {
      const n = parseInt(body.log_limit, 10);
      if (Number.isFinite(n)) next.log_limit = Math.min(200, Math.max(1, n));
    }
    st.cfg = Object.assign({}, st.cfg, next);
    saveState(st);
    return sendJson(res, 200, { ok: true, status: st });
  }

  if (pathname === '/api/autopilot/start') {
    st.running = true;
    st.enabled = true;
    st.last_cycle = nowIso();
    st.log = st.log || [];
    st.log.push({ ts: nowIso(), lvl: 'INFO', msg: 'AutoPilot avviato (Vercel Serverless)' });
    saveState(st);
    return sendJson(res, 200, { ok: true, status: st });
  }

  if (pathname === '/api/autopilot/stop') {
    const body = await readBody(req);
    st.running = false;
    if (body && body.disable) st.enabled = false;
    st.log = st.log || [];
    st.log.push({ ts: nowIso(), lvl: 'INFO', msg: 'AutoPilot arrestato' });
    saveState(st);
    return sendJson(res, 200, { ok: true, status: st });
  }

  if (pathname === '/api/autopilot/force-cycle') {
    st.cycles = (st.cycles || 0) + 1;
    st.last_cycle = nowIso();
    saveState(st);
    return sendJson(res, 200, { ok: true, status: st });
  }

  if (pathname === '/api/autopilot/log/clear') {
    st.log = [];
    saveState(st);
    return sendJson(res, 200, { ok: true });
  }

  if (pathname.startsWith('/api/autopilot/fleet/')) {
    const fid = pathname.slice('/api/autopilot/fleet/'.length).split('/')[0];
    if (!Object.prototype.hasOwnProperty.call(AUTOPILOT_FLEETS, fid)) {
      return sendJson(res, 404, { ok: false, error: 'flotta' });
    }
    const body = await readBody(req);
    const enabled = body.enabled !== undefined ? Boolean(body.enabled) : Boolean(body.on !== false);
    if (!st.fleets) st.fleets = {};
    if (!st.fleets[fid]) st.fleets[fid] = { enabled: true, count: 0 };
    st.fleets[fid].enabled = enabled;
    st.fleets[fid].last_run = nowIso();
    saveState(st);
    return sendJson(res, 200, { ok: true, status: st });
  }

  if (pathname === '/api/autopilot/bridge') {
    const body = await readBody(req);
    st.last_bridge = nowIso();
    const events = body && Array.isArray(body.events) ? body.events.length : 0;
    if (events) st.bridge_events_count = Math.min(events, 5000);
    saveState(st);
    return sendJson(res, 200, { ok: true, events: Math.min(events, 5000) });
  }

  return sendJson(res, 404, { ok: false, error: 'percorso' });
};
