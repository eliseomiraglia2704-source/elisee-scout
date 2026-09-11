/**
 * POST /api/auth/login { email, password }
 * Account staff pre-verificato: manueltucci2002@gmail.com (Responsabile Privacy).
 * Password solo come hash PBKDF2 — mai in chiaro.
 */
const crypto = require('crypto');
const { signToken, publicUser, verifyToken } = require('../../lib/auth-oauth');

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

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ ok: false, error: 'method' }));
    return;
  }
  const b = bodyOf(req);
  const email = String(b.email || '').trim().toLowerCase();
  const password = String(b.password || '');
  const rec = STAFF[email];
  if (!rec || !password) {
    res.statusCode = 401;
    res.end(JSON.stringify({ ok: false, error: 'credenziali_non_valide' }));
    return;
  }
  const got = hashPassword(password);
  if (!hashesEqual(got, rec.passwordHash)) {
    res.statusCode = 401;
    res.end(JSON.stringify({ ok: false, error: 'credenziali_non_valide' }));
    return;
  }
  const user = publicUser(rec);
  user.verifiedByAdmin = true;
  user.skipDocVerify = true;
  user.badgeVerificaStato = 'approved';
  user.mustResetPassword = true;
  user.staffRole = rec.staffRole;
  const token = signToken(rec);
  res.statusCode = 200;
  res.end(JSON.stringify({ ok: true, token: token, user: user, needsPassword: false, mustResetPassword: true }));
};
