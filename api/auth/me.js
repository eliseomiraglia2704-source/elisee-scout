/**
 * GET  /api/auth/me
 * POST /api/auth/login         (rewrite → me?path=login)
 * POST /api/auth/set-password  (rewrite → me?path=set-password)
 */
const crypto = require('crypto');
const { verifyToken, publicUser, signToken } = require('../../lib/auth-oauth');

const SALT = 'elisee-staff-v1';
const ITER = 120000;
const MANUEL_HASH = 'de134c138f54a18fb10cd0f5fda4699a81326bb1b6a5d47aeadb26bce167270b';

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

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    json(res, 204, {});
    return;
  }
  const path = pathOf(req);

  if (req.method === 'POST' && path === 'login') {
    const b = bodyOf(req);
    const email = String(b.email || '').trim().toLowerCase();
    const password = String(b.password || '');
    const rec = STAFF[email];
    if (!rec || !password) return json(res, 401, { ok: false, error: 'credenziali_non_valide' });
    if (!hashesEqual(hashPassword(password), rec.passwordHash)) {
      return json(res, 401, { ok: false, error: 'credenziali_non_valide' });
    }
    const user = publicUser(rec);
    user.verifiedByAdmin = true;
    user.skipDocVerify = true;
    user.badgeVerificaStato = 'approved';
    user.mustResetPassword = true;
    user.staffRole = rec.staffRole;
    return json(res, 200, { ok: true, token: signToken(rec), user: user, mustResetPassword: true });
  }

  if (req.method === 'POST' && path === 'set-password') {
    const h = String(req.headers.authorization || '');
    const tok = h.toLowerCase().startsWith('bearer ') ? h.slice(7).trim() : '';
    const session = verifyToken(tok);
    if (!session) return json(res, 401, { ok: false, error: 'non_autenticato' });
    const password = String(bodyOf(req).password || '');
    if (password.length < 8) return json(res, 400, { ok: false, error: 'password_troppo_corta' });
    session.mustResetPassword = false;
    const user = publicUser(session);
    user.mustResetPassword = false;
    user.verifiedByAdmin = true;
    user.skipDocVerify = true;
    user.badgeVerificaStato = 'approved';
    return json(res, 200, { ok: true, user: user, token: signToken(session) });
  }

  const h = String(req.headers.authorization || '');
  const token = h.toLowerCase().startsWith('bearer ') ? h.slice(7).trim() : '';
  const user = verifyToken(token);
  if (!user) return json(res, 401, { ok: false, error: 'non_autenticato' });
  return json(res, 200, { ok: true, user: publicUser(user) });
};
