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
  // Handle rewrite subpath if present (?path=status o /api/autopilot/status)
  const qPath = url.searchParams.get('path');
  if (qPath) {
    pathname = '/api/autopilot/' + qPath.replace(/^\//, '');
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
    const limit = parseInt(url.searchParams.get('limit') || '80', 10);
    const logs = Array.isArray(st.log) ? st.log.slice(-limit) : [];
    return sendJson(res, 200, { ok: true, log: logs });
  }

  if (pathname === '/api/autopilot/config') {
    if (method === 'GET') {
      return sendJson(res, 200, { ok: true, cfg: st.cfg || {} });
    }
    const body = await readBody(req);
    st.cfg = Object.assign({}, st.cfg, body);
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
    const fid = pathname.replace('/api/autopilot/fleet/', '').split('/')[0];
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
    if (body.events) st.bridge_events_count = (body.events || []).length;
    saveState(st);
    return sendJson(res, 200, { ok: true, received: Object.keys(body) });
  }

  // Fallback per rotte status
  return sendJson(res, 200, { ok: true, status: st });
};
