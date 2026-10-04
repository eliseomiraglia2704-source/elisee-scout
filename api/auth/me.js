/**
 * GET  /api/auth/me
 * POST /api/auth/register      (rewrite → me?path=register)
 * POST /api/auth/login         (rewrite → me?path=login)
 * POST /api/auth/set-password  (rewrite → me?path=set-password)
 * GET/POST /api/auth/verify-docs (rewrite → me?path=verify-docs)
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { verifyToken, publicUser, signToken } = require('../../lib/auth-oauth');
const { checkPasswordPolicy } = require('../../lib/password-policy');

const SALT = 'elisee-staff-v1';
const ITER = 120000;
// Hash PBKDF2 distinti per ogni account staff — generati il 2026-09-28.
// Tutti e tre hanno mustResetPassword: true: al primo accesso devono scegliere una password personale.
// Per rigenerate: node -e "require('crypto').pbkdf2Sync('NUOVA_PW','elisee-staff-v1',120000,32,'sha256').toString('hex')"
const MANUEL_HASH     = '3aa3b1bbacc051b5823bf78c99a10ddd7933ff021744762bb9a75ed9d6ea731a';
const ALESSANDRO_HASH = '2a497e077a3b9d59d924ef1c42cb8f7c33b81ac64e77812c1f9d49841b79c923';
const ELISEO_HASH     = '769c6f76c7a2aa4464e78e2adbc797a67c18dce552d5fb68966c8ed7aa7d2b46';
// LEGACY_HASH rimosso: era condiviso tra tutti gli account, non usarlo.
const OVERRIDE_FILE = process.env.VERCEL
  ? '/tmp/elisee-password-overrides.json'
  : path.join(process.cwd(), 'data', 'auth', 'password-overrides.json');
const DOCS_FILE = process.env.VERCEL
  ? '/tmp/elisee-verify-docs.json'
  : path.join(process.cwd(), 'data', 'auth', 'verify-docs.json');
const USERS_FILE = process.env.VERCEL
  ? '/tmp/elisee-registered-users.json'
  : path.join(process.cwd(), 'data', 'auth', 'registered-users.json');
const memoryOverrides = {};
const memoryDocs = {};
const memoryUsers = {};
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DOB_RE = /^\d{4}-\d{2}-\d{2}$/;

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
    mustResetPassword: true,
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
    mustResetPassword: true,
    isCreator: true,
    passwordHash: ELISEO_HASH
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
  if (/\/register(?:\?|$)/.test(url)) return 'register';
  if (/\/login(?:\?|$)/.test(url)) return 'login';
  if (/set-password/.test(url)) return 'set-password';
  if (/verify-docs/.test(url)) return 'verify-docs';
  return 'me';
}

function userKey(email) {
  return 'elisee:reguser:' + String(email || '').trim().toLowerCase();
}

function loadUsersFile() {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')) || {};
  } catch (_) {
    return {};
  }
}

function saveUsersFile(map) {
  try {
    fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
    fs.writeFileSync(USERS_FILE, JSON.stringify(map, null, 2));
  } catch (_) {}
}

function publicConsents(src) {
  const c = src && typeof src === 'object' ? src : {};
  return {
    tos: !!c.tos,
    privacy: !!c.privacy,
    cookie: !!c.cookie,
    newsletter: !!c.newsletter,
    art22HumanReview: !!c.art22HumanReview
  };
}

function publicRegisteredUser(rec, extra) {
  const user = publicUser(rec);
  user.dob = rec && rec.dob ? rec.dob : (user.dob || '');
  user.consents = publicConsents(rec && rec.consents);
  user.siteRoleConfirmed = !!(rec && rec.siteRoleConfirmed);
  user.registratoIl = (rec && rec.createdAt) || '';
  if (extra) Object.assign(user, extra);
  return user;
}

async function getUserRecord(email) {
  const em = String(email || '').trim().toLowerCase();
  if (!em) return null;
  if (memoryUsers[em]) return memoryUsers[em];
  const fileMap = loadUsersFile();
  if (fileMap[em]) {
    memoryUsers[em] = fileMap[em];
    return fileMap[em];
  }
  const remote = await redisCall('/get/' + encodeURIComponent(userKey(em)));
  if (remote) {
    try {
      const parsed = typeof remote === 'string' ? JSON.parse(remote) : remote;
      if (parsed && typeof parsed === 'object') {
        memoryUsers[em] = parsed;
        return parsed;
      }
    } catch (_) {}
  }
  return null;
}

async function setUserRecord(email, rec) {
  const em = String(email || '').trim().toLowerCase();
  if (!em || !rec) return rec;
  rec.email = em;
  rec.updatedAt = new Date().toISOString();
  memoryUsers[em] = rec;
  const fileMap = loadUsersFile();
  fileMap[em] = rec;
  saveUsersFile(fileMap);
  await redisCall('/set/' + encodeURIComponent(userKey(em)) + '/' + encodeURIComponent(JSON.stringify(rec)));
  return rec;
}

function docsKey(email) {
  return 'elisee:docs:' + String(email || '').trim().toLowerCase();
}

function loadDocsFile() {
  try {
    return JSON.parse(fs.readFileSync(DOCS_FILE, 'utf8')) || {};
  } catch (_) {
    return {};
  }
}

function saveDocsFile(map) {
  try {
    fs.mkdirSync(path.dirname(DOCS_FILE), { recursive: true });
    fs.writeFileSync(DOCS_FILE, JSON.stringify(map, null, 2));
  } catch (_) {}
}

async function getDocsRecord(email) {
  const em = String(email || '').trim().toLowerCase();
  if (!em) return null;
  if (memoryDocs[em]) return memoryDocs[em];
  const fileMap = loadDocsFile();
  if (fileMap[em]) {
    memoryDocs[em] = fileMap[em];
    return fileMap[em];
  }
  const remote = await redisCall('/get/' + encodeURIComponent(docsKey(em)));
  if (remote) {
    try {
      const parsed = typeof remote === 'string' ? JSON.parse(remote) : remote;
      if (parsed && typeof parsed === 'object') {
        memoryDocs[em] = parsed;
        return parsed;
      }
    } catch (_) {}
  }
  return null;
}

async function setDocsRecord(email, rec) {
  const em = String(email || '').trim().toLowerCase();
  if (!em) return rec;
  rec.email = em;
  rec.updatedAt = new Date().toISOString();
  memoryDocs[em] = rec;
  const fileMap = loadDocsFile();
  fileMap[em] = rec;
  saveDocsFile(fileMap);
  await redisCall('/set/' + encodeURIComponent(docsKey(em)) + '/' + encodeURIComponent(JSON.stringify(rec)));
  return rec;
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

    if (pathName === 'register' && req.method !== 'POST') {
      return json(res, 405, { ok: false, error: 'method' });
    }

    if (req.method === 'POST' && pathName === 'register') {
      const b = bodyOf(req);
      const nome = String(b.nome || '').trim();
      const cognome = String(b.cognome || '').trim();
      const email = String(b.email || '').trim().toLowerCase();
      const password = String(b.password || '');
      const dob = String(b.dob || '').trim();
      const ruolo = String(b.ruolo || b.role || '').trim() || 'Calciatore';
      if (!nome || !cognome) return json(res, 400, { ok: false, error: 'nome_cognome_obbligatori' });
      if (!EMAIL_RE.test(email)) return json(res, 400, { ok: false, error: 'email_non_valida' });
      if (!dob || !DOB_RE.test(dob)) return json(res, 400, { ok: false, error: 'dob_non_valida' });
      const policy = checkPasswordPolicy(password);
      if (!policy.ok) {
        return json(res, 400, { ok: false, error: password.length < 8 ? 'password_corta' : 'password_non_conforme', message: policy.message });
      }
      if (staffOf(email) || await getUserRecord(email)) {
        return json(res, 409, { ok: false, error: 'email_gia_registrata' });
      }
      const rec = {
        id: 'u_' + crypto.randomBytes(8).toString('hex'),
        email: email,
        nome: nome,
        cognome: cognome,
        ruolo: ruolo.slice(0, 80),
        dob: dob,
        provider: 'email',
        passwordHash: hashPassword(password),
        consents: publicConsents(b.consents),
        createdAt: new Date().toISOString(),
        siteRoleConfirmed: false,
        skipDocVerify: false,
        verifiedByAdmin: false,
        badgeVerificaStato: 'none',
        staffRole: '',
        mustResetPassword: false
      };
      await setUserRecord(email, rec);
      const user = publicRegisteredUser(rec);
      return json(res, 200, { ok: true, token: signToken(rec), user: user });
    }

    if (req.method === 'POST' && pathName === 'login') {
      const b = bodyOf(req);
      const email = String(b.email || '').trim().toLowerCase();
      const password = String(b.password || '');
      if (!email || !password) return json(res, 401, { ok: false, error: 'credenziali_non_valide' });
      const computedHash = hashPassword(password);
      const saved = await getOverrideHash(email);
      const okSaved = saved && hashesEqual(computedHash, saved);
      const staff = staffOf(email);
      if (staff) {
        const okDefault = hashesEqual(computedHash, staff.passwordHash);
        if (!okSaved && !okDefault) {
          return json(res, 401, { ok: false, error: 'credenziali_non_valide' });
        }
        const mustReset = okSaved ? false : !!staff.mustResetPassword;
        const user = decorateUser(staff, { mustResetPassword: mustReset });
        return json(res, 200, { ok: true, token: signToken(staff), user: user, mustResetPassword: mustReset });
      }
      const rec = await getUserRecord(email);
      if (!rec) return json(res, 401, { ok: false, error: 'credenziali_non_valide' });
      const okStored = rec.passwordHash && hashesEqual(computedHash, rec.passwordHash);
      if (!okSaved && !okStored) {
        return json(res, 401, { ok: false, error: 'credenziali_non_valide' });
      }
      if (rec.accountClosed) {
        return json(res, 403, { ok: false, error: 'account_chiuso', reason: rec.accountClosedReason || 'docs_timeout' });
      }
      const user = publicRegisteredUser(rec, { mustResetPassword: false });
      return json(res, 200, { ok: true, token: signToken(rec), user: user });
    }

    if (pathName === 'verify-docs') {
      if (req.method !== 'GET' && req.method !== 'POST') return json(res, 405, { ok: false, error: 'method' });
      const h = String(req.headers.authorization || '');
      const tok = h.toLowerCase().startsWith('bearer ') ? h.slice(7).trim() : '';
      const session = verifyToken(tok);
      const b = req.method === 'POST' ? bodyOf(req) : {};
      const qEmail = (req.query && req.query.email) || '';
      const email = session
        ? String(session.email || '').trim().toLowerCase()
        : String(b.email || qEmail || '').trim().toLowerCase();
      if (!email) return json(res, 401, { ok: false, error: 'non_autenticato' });
      if (req.method === 'GET') {
        const rec = await getDocsRecord(email);
        return json(res, 200, { ok: true, record: rec });
      }
      const action = String(b.action || '').trim().toLowerCase();
      if (['start', 'docs', 'close'].indexOf(action) < 0) {
        return json(res, 400, { ok: false, error: 'azione' });
      }
      const prev = (await getDocsRecord(email)) || { email: email };
      const nowIso = new Date().toISOString();
      if (action === 'start') {
        prev.action = 'start';
        prev.ruolo = String(b.ruolo || prev.ruolo || '').slice(0, 80);
        prev.startedAt = prev.startedAt || nowIso;
        prev.badgeVerificaStato = prev.badgeVerificaStato || 'none';
      }
      if (action === 'docs') {
        prev.action = 'docs';
        prev.docsAt = nowIso;
        prev.badgeVerificaStato = String(b.badgeVerificaStato || 'pending').slice(0, 40);
      }
      if (action === 'close') {
        prev.action = 'close';
        prev.closedAt = nowIso;
        prev.reason = String(b.reason || 'docs_timeout').slice(0, 80);
        prev.badgeVerificaStato = 'closed';
      }
      const saved = await setDocsRecord(email, prev);
      return json(res, 200, { ok: true, record: saved });
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
      const nextHash = hashPassword(password);
      await setOverrideHash(email, nextHash);
      session.mustResetPassword = false;
      const staff = staffOf(email);
      if (staff) {
        const user = decorateUser(staff, { mustResetPassword: false, email: email });
        return json(res, 200, { ok: true, user: user, token: signToken(session) });
      }
      const prev = (await getUserRecord(email)) || {};
      const rec = await setUserRecord(email, {
        id: prev.id || session.id || ('u_' + crypto.randomBytes(8).toString('hex')),
        email: email,
        nome: prev.nome || session.nome || '',
        cognome: prev.cognome || session.cognome || '',
        ruolo: prev.ruolo || session.ruolo || 'Calciatore',
        dob: prev.dob || session.dob || '',
        provider: prev.provider || session.provider || 'email',
        passwordHash: nextHash,
        consents: publicConsents(prev.consents),
        createdAt: prev.createdAt || new Date().toISOString(),
        siteRoleConfirmed: !!prev.siteRoleConfirmed,
        skipDocVerify: false,
        verifiedByAdmin: false,
        badgeVerificaStato: prev.badgeVerificaStato || 'none',
        staffRole: prev.staffRole || '',
        mustResetPassword: false
      });
      const user = publicRegisteredUser(rec, { mustResetPassword: false });
      return json(res, 200, { ok: true, user: user, token: signToken(rec) });
    }

    const h = String(req.headers.authorization || '');
    const token = h.toLowerCase().startsWith('bearer ') ? h.slice(7).trim() : '';
    const session = verifyToken(token);
    if (!session) return json(res, 401, { ok: false, error: 'non_autenticato' });
    const stored = await getUserRecord(session.email);
    if (stored) {
      if (stored.accountClosed) {
        return json(res, 403, { ok: false, error: 'account_chiuso', user: publicRegisteredUser(stored) });
      }
      return json(res, 200, { ok: true, user: publicRegisteredUser(stored, {
        nome: stored.nome || session.nome,
        cognome: stored.cognome || session.cognome,
        ruolo: stored.ruolo || session.ruolo
      }) });
    }
    const staff = staffOf(session.email);
    if (staff) return json(res, 200, { ok: true, user: decorateUser(staff) });
    return json(res, 200, { ok: true, user: publicUser(session) });
  } catch (err) {
    return json(res, 500, { ok: false, error: 'errore_server' });
  }
};
