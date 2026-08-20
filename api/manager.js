/**
 * Vercel serverless — stesso contratto di /api/manager sul server locale.
 * Persistenza su /tmp (ephemeral). In locale usa elisee_up.py.
 */
const fs = require('fs');
const path = require('path');

const FILE = process.env.ELISEE_MANAGER_FILE
  || (process.env.VERCEL ? '/tmp/elisee-manager.json' : path.join(process.cwd(), 'data', 'manager', 'state.json'));

const ALLOWED = ['name', 'city', 'stadium', 'capacity', 'logo', 'year', 'stadiumImage'];

function now() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}
function uid() {
  return now().slice(0, 10).replace(/-/g, '') + '-' + Math.random().toString(16).slice(2, 10);
}
function load() {
  try {
    const st = JSON.parse(fs.readFileSync(FILE, 'utf8')) || {};
    if (!st.applications) st.applications = [];
    if (!st.proposals) st.proposals = [];
    if (!st.managers) st.managers = [];
    if (!st.lineups) st.lineups = [];
    if (!st.officialLineups) st.officialLineups = {};
    return st;
  } catch (e) {
    return { applications: [], proposals: [], managers: [], lineups: [], officialLineups: {} };
  }
}
function save(st) {
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(st, null, 2));
  } catch (e) {}
}
function isAdmin(req) {
  const k = String(req.headers['x-elisee-admin'] || '');
  return k === 'admin123' || k === '1' || k === 'true' || k === 'admin';
}
function send(res, code, body) {
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
    req.on('data', (c) => { raw += c; if (raw.length > 1e6) req.destroy(); });
    req.on('end', () => {
      try { resolve(JSON.parse(raw || '{}')); } catch (e) { resolve({}); }
    });
  });
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    send(res, 204, {});
    return;
  }
  const st = load();
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'GET') {
    const view = url.searchParams.get('view') || 'me';
    if (view === 'admin') {
      if (!isAdmin(req)) return send(res, 401, { ok: false, error: 'admin_richiesto' });
      const pendingA = st.applications.filter((a) => a.status === 'pending').length;
      const pendingP = st.proposals.filter((p) => p.status === 'pending').length;
      const pendingL = (st.lineups || []).filter((p) => p.status === 'pending').length;
      return send(res, 200, {
        ok: true,
        counts: { applicationsPending: pendingA, proposalsPending: pendingP, lineupsPending: pendingL, managers: st.managers.length },
        applications: st.applications,
        proposals: st.proposals,
        lineups: st.lineups || [],
        managers: st.managers
      });
    }
    if (view === 'official') {
      const teamId = String(url.searchParams.get('teamId') || '');
      const official = (st.officialLineups || {})[teamId] || null;
      return send(res, 200, { ok: true, official: official });
    }
    const email = String(url.searchParams.get('email') || '').toLowerCase();
    const mine = (row) => email && String(row.email || '').toLowerCase() === email;
    return send(res, 200, {
      ok: true,
      applications: st.applications.filter(mine),
      proposals: st.proposals.filter(mine),
      lineups: (st.lineups || []).filter(mine),
      teams: st.managers.filter(mine).map((m) => ({ teamId: m.teamId, teamName: m.teamName, league: m.league || '' }))
    });
  }
  if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'method' });
  const body = await readBody(req);
  const action = String(body.action || '');
  const email = String(body.email || '').trim().toLowerCase();
  const name = String(body.name || '').trim();
  if (action === 'apply') {
    if (!body.teamId || !body.teamName) return send(res, 400, { ok: false, error: 'squadra_mancante' });
    if (!email || !name) return send(res, 400, { ok: false, error: 'nome_email_obbligatori' });
    if (String(body.motivation || '').trim().length < 12) return send(res, 400, { ok: false, error: 'motivazione_troppo_corta' });
    const row = {
      id: uid(),
      teamId: body.teamId,
      teamName: body.teamName,
      league: body.league || '',
      name, email,
      phone: body.phone || '',
      roleAtClub: body.roleAtClub || 'Dirigente / collaboratore',
      motivation: String(body.motivation || '').trim(),
      status: 'pending',
      createdAt: now()
    };
    st.applications.unshift(row);
    save(st);
    return send(res, 200, { ok: true, application: row });
  }
  if (action === 'propose') {
    const okMgr = st.managers.some((m) => m.teamId === body.teamId && String(m.email || '').toLowerCase() === email);
    if (!okMgr) return send(res, 403, { ok: false, error: 'non_sei_manager' });
    const changes = {};
    const raw = body.changes || {};
    ALLOWED.forEach((k) => {
      if (raw[k] == null) return;
      const t = String(raw[k]).trim();
      if (t) changes[k] = k === 'capacity' ? parseInt(t.replace(/[^\d]/g, ''), 10) : t;
    });
    if (!Object.keys(changes).length) return send(res, 400, { ok: false, error: 'nessuna_modifica' });
    const row = {
      id: uid(),
      teamId: body.teamId,
      teamName: body.teamName || body.teamId,
      league: body.league || '',
      name, email,
      changes, note: body.note || '',
      status: 'pending',
      createdAt: now(),
      applied: false
    };
    st.proposals.unshift(row);
    save(st);
    return send(res, 200, { ok: true, proposal: row });
  }
  if (action === 'propose-lineup') {
    if (!body.teamId || !body.module) return send(res, 400, { ok: false, error: 'squadra_o_modulo_mancante' });
    if (!email && !name) return send(res, 400, { ok: false, error: 'nome_email_obbligatori' });
    const pendingDup = (st.lineups || []).some((r) =>
      r.status === 'pending' &&
      r.teamId === body.teamId &&
      email && String(r.email || '').toLowerCase() === email
    );
    if (pendingDup) return send(res, 409, { ok: false, error: 'proposta_formazione_gia_inviata' });
    const row = {
      id: uid(),
      teamId: body.teamId,
      teamName: body.teamName || body.teamId,
      league: body.league || '',
      name, email,
      module: String(body.module || ''),
      previousModule: String(body.previousModule || ''),
      slots: body.slots && typeof body.slots === 'object' ? body.slots : {},
      note: body.note || '',
      status: 'pending',
      createdAt: now(),
      applied: false
    };
    st.lineups.unshift(row);
    save(st);
    return send(res, 200, { ok: true, lineup: row });
  }
  if (action === 'decide') {
    if (!isAdmin(req)) return send(res, 401, { ok: false, error: 'admin_richiesto' });
    const bucket = body.kind === 'application' ? st.applications
      : (body.kind === 'lineup' ? st.lineups : st.proposals);
    const row = bucket.find((r) => r.id === body.id);
    if (!row) return send(res, 404, { ok: false, error: 'non_trovata' });
    row.status = body.accept ? 'accepted' : 'declined';
    row.decidedAt = now();
    row.adminComment = body.comment || '';
    if (body.accept && body.kind === 'application') {
      st.managers.push({
        teamId: row.teamId, teamName: row.teamName, league: row.league || '',
        email: row.email, name: row.name, since: now()
      });
    }
    if (body.accept && body.kind === 'lineup') {
      if (!st.officialLineups) st.officialLineups = {};
      st.officialLineups[row.teamId] = {
        teamId: row.teamId,
        teamName: row.teamName,
        module: row.module,
        slots: row.slots || {},
        updatedAt: now(),
        proposalId: row.id
      };
      row.applied = true;
    }
    save(st);
    return send(res, 200, { ok: true, item: row, applied: !!row.applied });
  }
  return send(res, 400, { ok: false, error: 'azione_sconosciuta' });
};
