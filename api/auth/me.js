/**
 * GET  /api/auth/me
 * POST /api/auth/login         (rewrite → me?path=login)
 * POST /api/auth/set-password  (rewrite → me?path=set-password)
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { verifyToken, publicUser, signToken } = require('../../lib/auth-oauth');
const { checkPasswordPolicy } = require('../../lib/password-policy');

const SALT = 'elisee-staff-v1';
const ITER = 120000;
const MANUEL_HASH = '21612aefb415ec0957dfd54095eed7fadbeaec288eeca7bf8380989c12919145';
const ALESSANDRO_HASH = '21612aefb415ec0957dfd54095eed7fadbeaec288eeca7bf8380989c12919145';
const LEGACY_HASH = 'de134c138f54a18fb10cd0f5fda4699a81326bb1b6a5d47aeadb26bce167270b';
const OVERRIDE_FILE = process.env.VERCEL
  ? '/tmp/elisee-password-overrides.json'
  : path.join(process.cwd(), 'data', 'auth', 'password-overrides.json');
const memoryOverrides = {};

const STAFF = {
  'manueltucci2002@gmail.com': {
    id: 'staff_privacy_manuel',
    email: 'manueltucci2002@gmail.com',
    nome: 'Manuel',
    cognome: 'Tucci',
    ruolo: 'Responsabile Privacy',
    staffRole: 'Responsabile Privacy',
    provider: 'email',
    verifiedByAdmin: true,
    skipDocVerify: true,
    badgeVerificaStato: 'approved',
    mustResetPassword: true,
    passwordHash: MANUEL_HASH
  },
  'alessandromancini469@gmail.com': {
    id: 'staff_admin_alessandro',
    email: 'alessandromancini469@gmail.com',
    nome: 'Alessandro',
    cognome: 'Mancini',
    ruolo: 'Admin Executive',
    staffRole: 'Admin Executive',
    provider: 'email',
    verifiedByAdmin: true,
    skipDocVerify: true,
    badgeVerificaStato: 'approved',
    mustResetPassword: false,
    passwordHash: ALESSANDRO_HASH
  },
  'eliseomiraglia2704@gmail.com': {
    id: 'staff_admin_eliseo',
    email: 'eliseomiraglia2704@gmail.com',
    nome: 'Eliseo',
    cognome: 'Miraglia',
    ruolo: 'Admin Executive',
    staffRole: 'Admin Executive',
    provider: 'email',
    verifiedByAdmin: true,
    skipDocVerify: true,
    badgeVerificaStato: 'approved',
    mustResetPassword: false,
    isCreator: true,
    passwordHash: MANUEL_HASH
  }
};

function hashPassword(plain) {
  return crypto.pbkdf2Sync(String(plain), SALT, ITER, 32, 'sha256').toString('hex');
}

function hashesEqual(a, b) {
  const aa = Buffer.from(String(a || ''), 'utf8');
  const bb = Buffer.from(String(b || ''), 'utf8');
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}

function loadFileOverrides() {
  try {
    if (fs.existsSync(OVERRIDE_FILE)) {
      return JSON.parse(fs.readFileSync(OVERRIDE_FILE, 'utf8')) || {};
    }
  } catch (_) {}
  return {};
}

function saveFileOverrides(map) {
  try {
    fs.mkdirSync(path.dirname(OVERRIDE_FILE), { recursive: true });
    fs.writeFileSync(OVERRIDE_FILE, JSON.stringify(map, null, 2));
  } catch (_) {}
}

async function redisCall(cmdPath) {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const tok = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !tok) return null;
  try {
    const r = await fetch(String(url).replace(/\/$/, '') + cmdPath, {
      headers: { Authorization: 'Bearer ' + tok }
    });
    const j = await r.json();
    return j && j.result != null ? j.result : null;
  } catch (_) {
    return null;
  }
}

function overrideKey(email) {
  return 'elisee:pw:' + String(email || '').trim().toLowerCase();
}

async function getOverrideHash(email) {
  const em = String(email || '').trim().toLowerCase();
  if (memoryOverrides[em]) return memoryOverrides[em];
  const fileMap = loadFileOverrides();
  if (fileMap[em]) {
    memoryOverrides[em] = fileMap[em];
    return fileMap[em];
  }
  const remote = await redisCall('/get/' + encodeURIComponent(overrideKey(em)));
  if (remote) {
    memoryOverrides[em] = String(remote);
    return String(remote);
  }
  return null;
}

async function setOverrideHash(email, hash) {
  const em = String(email || '').trim().toLowerCase();
  memoryOverrides[em] = hash;
  const fileMap = loadFileOverrides();
  fileMap[em] = hash;
  saveFileOverrides(fileMap);
  await redisCall('/set/' + encodeURIComponent(overrideKey(em)) + '/' + encodeURIComponent(hash));
}

function staffOf(email) {
  return STAFF[String(email || '').trim().toLowerCase()] || null;
}

function bodyOf(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch (e) { return {}; }
  }
  return req.body;
}

function pathOf(req) {
  const q = (req.query && req.query.path) || '';
  const url = String(req.url || '');
  if (q) return String(q);
  if (/\/login(?:\?|$)/.test(url)) return 'login';
  if (/set-password/.test(url)) return 'set-password';
  return 'me';
}

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.end(JSON.stringify(body));
}

function decorateUser(rec, extra) {
  const user = publicUser(rec);
  user.verifiedByAdmin = true;
  user.skipDocVerify = true;
  user.badgeVerificaStato = 'approved';
  user.staffRole = rec.staffRole;
  if (rec.isCreator) user.isCreator = true;
  if (extra) Object.assign(user, extra);
  return user;
}

module.exports = async function handler(req, res) {
  try {
    if (req.method === 'OPTIONS') {
      json(res, 204, {});
      return;
    }
    const pathName = pathOf(req);

    if (req.method === 'POST' && pathName === 'login') {
      const b = bodyOf(req);
      const email = String(b.email || '').trim().toLowerCase();
      const password = String(b.password || '');
      const rec = staffOf(email);
      if (!rec || !password) return json(res, 401, { ok: false, error: 'credenziali_non_valide' });
      const computedHash = hashPassword(password);
      const saved = await getOverrideHash(email);
      const okSaved = saved && hashesEqual(computedHash, saved);
      const okDefault = hashesEqual(computedHash, rec.passwordHash) || hashesEqual(computedHash, LEGACY_HASH);
      if (!okSaved && !okDefault) {
        return json(res, 401, { ok: false, error: 'credenziali_non_valide' });
      }
      const mustReset = okSaved ? false : !!rec.mustResetPassword;
      const user = decorateUser(rec, { mustResetPassword: mustReset });
      return json(res, 200, { ok: true, token: signToken(rec), user: user, mustResetPassword: mustReset });
    }

    if (req.method === 'POST' && pathName === 'set-password') {
      const h = String(req.headers.authorization || '');
      const tok = h.toLowerCase().startsWith('bearer ') ? h.slice(7).trim() : '';
      const session = verifyToken(tok);
      if (!session) return json(res, 401, { ok: false, error: 'non_autenticato' });
      const password = String(bodyOf(req).password || '');
      const policy = checkPasswordPolicy(password);
      if (!policy.ok) {
        return json(res, 400, { ok: false, error: 'password_non_conforme', message: policy.message });
      }
      const email = String(session.email || '').trim().toLowerCase();
      await setOverrideHash(email, hashPassword(password));
      session.mustResetPassword = false;
      const rec = staffOf(email) || session;
      const user = decorateUser(rec, { mustResetPassword: false, email: email });
      return json(res, 200, { ok: true, user: user, token: signToken(session) });
    }

    const h = String(req.headers.authorization || '');
    const token = h.toLowerCase().startsWith('bearer ') ? h.slice(7).trim() : '';
    const user = verifyToken(token);
    if (!user) return json(res, 401, { ok: false, error: 'non_autenticato' });
    return json(res, 200, { ok: true, user: publicUser(user) });
  } catch (err) {
    return json(res, 500, { ok: false, error: 'errore_server', message: (err && err.message) || 'Errore interno del server' });
  }
};
