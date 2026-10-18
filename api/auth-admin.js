/**
 * ELISEE SCOUT — Vercel Serverless Function: Admin Authentication & Token Gate
 * Endpoint: POST /api/auth-admin | GET /api/auth-admin (verifica token)
 *
 * Nessun segreto nel codice. Variabili d'ambiente (Vercel → Settings → Environment Variables):
 *   TOKEN_SIGNING_KEY    obbligatoria. Chiave HMAC dei token di sessione.
 *   ADMIN_SECRET         obbligatoria. Password del ruolo admin.
 *   PRIVACY_SECRET       facoltativa. Password del Responsabile Privacy (se assente: ADMIN_SECRET).
 *   STAFF_USERS          facoltativa. JSON { "email o username": "admin" | "privacy" }.
 *                        Senza questa variabile sono accettati solo gli username "admin" e "privacy".
 *   ADMIN_TOTP_SECRET    facoltativa. Chiave base32 del 2FA admin. Se presente il codice è obbligatorio.
 *   PRIVACY_TOTP_SECRET  facoltativa. Chiave base32 del 2FA privacy. Se presente il codice è obbligatorio.
 *
 * Generare una chiave 2FA: node scripts/totp-setup.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const RATE_LIMIT_FILE = process.env.VERCEL
  ? '/tmp/elisee-admin-ratelimit.json'
  : path.join(process.cwd(), 'data', 'auth', 'admin-ratelimit.json');

const MAX_ATTEMPTS = 5;
const BLOCK_MS = 15 * 60 * 1000;
const TOKEN_TTL_MS = 2 * 60 * 60 * 1000;

const memoryRateLimit = {};
const usedTotpSteps = {};

function getSigningKey() {
  const key = process.env.TOKEN_SIGNING_KEY;
  if (!key) {
    throw new Error('[AUTH-ADMIN] TOKEN_SIGNING_KEY non configurata.');
  }
  return key;
}

function env(name) {
  return String(process.env[name] || '').trim();
}

function secretForRole(role) {
  if (role === 'privacy') return env('PRIVACY_SECRET') || env('ADMIN_SECRET');
  return env('ADMIN_SECRET');
}

function totpSecretForRole(role) {
  return role === 'privacy' ? env('PRIVACY_TOTP_SECRET') : env('ADMIN_TOTP_SECRET');
}

function staffUsers() {
  const raw = env('STAFF_USERS');
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      const out = {};
      Object.keys(parsed || {}).forEach((k) => {
        const r = parsed[k];
        if (r === 'admin' || r === 'privacy') out[String(k).trim().toLowerCase()] = r;
      });
      return out;
    } catch (_) {
      console.error('[AUTH-ADMIN] STAFF_USERS non è un JSON valido.');
    }
  }
  return { admin: 'admin', privacy: 'privacy' };
}

function roleOfUsername(username) {
  const u = String(username || '').trim().toLowerCase();
  const map = staffUsers();
  if (map[u]) return map[u];
  // Lo strumento Simulatore Ruoli invia sempre "admin".
  if (u === 'admin') return 'admin';
  return null;
}

/** Confronto a tempo costante tra stringhe di lunghezza qualsiasi. */
function safeEqual(a, b) {
  const k = crypto.randomBytes(32);
  const ha = crypto.createHmac('sha256', k).update(String(a)).digest();
  const hb = crypto.createHmac('sha256', k).update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function base32Decode(input) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const clean = String(input || '').toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = 0;
  let value = 0;
  const out = [];
  for (let i = 0; i < clean.length; i++) {
    value = (value << 5) | alphabet.indexOf(clean[i]);
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

function totpAt(secretBuf, step) {
  const msg = Buffer.alloc(8);
  msg.writeUInt32BE(Math.floor(step / 0x100000000), 0);
  msg.writeUInt32BE(step >>> 0, 4);
  const h = crypto.createHmac('sha1', secretBuf).update(msg).digest();
  const off = h[h.length - 1] & 0xf;
  const bin = ((h[off] & 0x7f) << 24) | (h[off + 1] << 16) | (h[off + 2] << 8) | h[off + 3];
  return String(bin % 1000000).padStart(6, '0');
}

/** RFC 6238 (SHA-1, 30 s, 6 cifre), tolleranza ±1 passo, un codice vale una volta sola. */
function totpOk(secret, code, role) {
  const c = String(code || '').replace(/\s+/g, '');
  if (!/^\d{6}$/.test(c)) return false;
  const key = base32Decode(secret);
  if (!key.length) return false;
  const now = Math.floor(Date.now() / 30000);
  for (let d = -1; d <= 1; d++) {
    const step = now + d;
    if (safeEqual(totpAt(key, step), c)) {
      if (usedTotpSteps[role] && usedTotpSteps[role] >= step) return false;
      usedTotpSteps[role] = step;
      return true;
    }
  }
  return false;
}

function getRateLimits() {
  try {
    if (fs.existsSync(RATE_LIMIT_FILE)) {
      return JSON.parse(fs.readFileSync(RATE_LIMIT_FILE, 'utf8')) || {};
    }
  } catch (_) {}
  return memoryRateLimit;
}

function saveRateLimits(data) {
  try {
    fs.mkdirSync(path.dirname(RATE_LIMIT_FILE), { recursive: true });
    fs.writeFileSync(RATE_LIMIT_FILE, JSON.stringify(data, null, 2));
  } catch (_) {
    Object.assign(memoryRateLimit, data);
  }
}

function getClientIp(req) {
  return String(
    req.headers['x-forwarded-for'] ||
    req.headers['x-real-ip'] ||
    (req.connection && req.connection.remoteAddress) ||
    '127.0.0.1'
  ).split(',')[0].trim();
}

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Token');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.end(JSON.stringify(data));
}

function readBody(req) {
  if (req.body) {
    if (typeof req.body === 'string') {
      try { return Promise.resolve(JSON.parse(req.body)); } catch (_) { return Promise.resolve({}); }
    }
    return Promise.resolve(req.body);
  }
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (c) => {
      raw += c;
      if (raw.length > 5e4) req.destroy();
    });
    req.on('end', () => {
      try { resolve(JSON.parse(raw || '{}')); } catch (e) { resolve({}); }
    });
  });
}

function generateSignedToken(role) {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const payload = { sub: 'staff', role: role, iat: Date.now(), exp: expiresAt };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', getSigningKey()).update(payloadB64).digest('base64url');
  return { token: `${payloadB64}.${signature}`, expiresAt: expiresAt };
}

function verifySignedToken(tokenString) {
  if (!tokenString || typeof tokenString !== 'string') return null;
  const parts = tokenString.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', getSigningKey()).update(payloadB64).digest('base64url');
  try {
    const sigBuf = Buffer.from(String(signature));
    const expBuf = Buffer.from(String(expectedSig));
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return null;
  } catch (_) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (!payload || !payload.exp || Date.now() > payload.exp) return null;
    if (payload.role !== 'admin' && payload.role !== 'privacy') return null;
    return payload;
  } catch (_) {
    return null;
  }
}

function registerFailure(rateData, ip, now) {
  const rec = rateData[ip] || { attempts: 0, blockedUntil: 0 };
  rec.attempts = (rec.attempts || 0) + 1;
  if (rec.attempts >= MAX_ATTEMPTS) rec.blockedUntil = now + BLOCK_MS;
  rateData[ip] = rec;
  saveRateLimits(rateData);
  return Math.max(0, MAX_ATTEMPTS - rec.attempts);
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, { ok: true });
  }

  if (!env('TOKEN_SIGNING_KEY')) {
    return sendJson(res, 503, { success: false, error: 'Accesso staff non configurato sul server.' });
  }

  const now = Date.now();
  const ip = getClientIp(req);
  const rateData = getRateLimits();
  Object.keys(rateData).forEach((k) => {
    if (rateData[k].blockedUntil && rateData[k].blockedUntil < now) delete rateData[k];
  });

  if (req.method === 'GET') {
    const authHeader = String(req.headers['authorization'] || '');
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : String(req.headers['x-admin-token'] || '').trim();
    const payload = verifySignedToken(token);
    if (payload) {
      return sendJson(res, 200, {
        success: true,
        authenticated: true,
        role: payload.role,
        expiresAt: payload.exp,
        totpEnabled: !!totpSecretForRole(payload.role)
      });
    }
    return sendJson(res, 401, { success: false, authenticated: false, error: 'Sessione non valida o scaduta.' });
  }

  if (req.method === 'POST') {
    const ipRecord = rateData[ip] || { attempts: 0, blockedUntil: 0 };
    if (ipRecord.blockedUntil && ipRecord.blockedUntil > now) {
      const waitSeconds = Math.ceil((ipRecord.blockedUntil - now) / 1000);
      return sendJson(res, 429, { success: false, error: `Troppi tentativi falliti. Riprova tra ${waitSeconds} secondi.` });
    }

    const body = await readBody(req);
    const password = String(body.pin || body.password || '').trim();
    const username = String(body.username || body.email || 'admin').trim().toLowerCase();
    const totp = String(body.totp || body.otp || '').trim();

    if (!password) {
      return sendJson(res, 400, { success: false, error: 'Password non inserita.' });
    }

    const role = roleOfUsername(username);
    const expected = role ? secretForRole(role) : '';

    if (role && !expected) {
      return sendJson(res, 503, { success: false, error: 'Accesso staff non configurato sul server.' });
    }

    // Stesso messaggio per utente sconosciuto e password errata: non rivela chi è staff.
    if (!role || !safeEqual(password, expected)) {
      const remaining = registerFailure(rateData, ip, now);
      return sendJson(res, 403, {
        success: false,
        error: remaining > 0
          ? `Credenziali non corrette. Tentativi rimasti: ${remaining}`
          : 'Accesso bloccato per 15 minuti: troppi tentativi falliti.'
      });
    }

    const totpSecret = totpSecretForRole(role);
    if (totpSecret) {
      if (!totp) {
        return sendJson(res, 401, { success: false, needTotp: true, error: 'Inserisci il codice 2FA dell\'app Authenticator.' });
      }
      if (!totpOk(totpSecret, totp, role)) {
        const remaining = registerFailure(rateData, ip, now);
        return sendJson(res, 403, {
          success: false,
          needTotp: true,
          error: remaining > 0
            ? `Codice 2FA non valido. Tentativi rimasti: ${remaining}`
            : 'Accesso bloccato per 15 minuti: troppi tentativi falliti.'
        });
      }
    }

    delete rateData[ip];
    saveRateLimits(rateData);

    const tokenData = generateSignedToken(role);
    return sendJson(res, 200, {
      success: true,
      authenticated: true,
      role: role,
      token: tokenData.token,
      expiresAt: tokenData.expiresAt,
      totpEnabled: !!totpSecret,
      message: role === 'privacy' ? 'Accesso Responsabile Privacy completato.' : 'Accesso Admin completato.'
    });
  }

  return sendJson(res, 405, { success: false, error: 'Metodo non consentito' });
};

module.exports._test = { totpAt, base32Decode, totpOk, verifySignedToken, roleOfUsername };
