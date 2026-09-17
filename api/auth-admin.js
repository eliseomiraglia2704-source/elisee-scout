/**
 * ELISEE SCOUT — Vercel Serverless Function: Admin Authentication & Token Gate
 * Endpoint: POST /api/auth-admin | GET /api/auth-admin?verify=1
 * 
 * Protezione reale del Simulatore Ruoli Creatore e delle funzioni Admin:
 * - Master Secret su variabile d'ambiente (process.env.ADMIN_SECRET)
 * - Rate limiting per IP (max 5 tentativi falliti in 15 minuti)
 * - Rilascio di token crittografico firmato HMAC-SHA256 con scadenza 2 ore
 * - Nessun dato sensibile esposto al client
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const RATE_LIMIT_FILE = process.env.VERCEL
  ? '/tmp/elisee-admin-ratelimit.json'
  : path.join(process.cwd(), 'data', 'auth', 'admin-ratelimit.json');

const memoryRateLimit = {};

const PW_SALT = 'elisee-staff-v1';
const PW_ITER = 120000;
const STAFF_PW_HASH = '21612aefb415ec0957dfd54095eed7fadbeaec288eeca7bf8380989c12919145';
const LEGACY_PW_HASH = 'de134c138f54a18fb10cd0f5fda4699a81326bb1b6a5d47aeadb26bce167270b';
const LOWER_DOT_HASH = 'd582c533c9b7c39b288e4a2410f0569334b4d822099491457769735308f3a9cd';
const LOWER_NODOT_HASH = 'd07e08b28b57c6cf3f0210175fb7e4ce2c50a9d7715196c0d91bf393cc765177';
const STAFF_ROLES = {
  admin: 'admin',
  eliseo: 'admin',
  'eliseomiraglia2704@gmail.com': 'admin',
  alessandro: 'admin',
  'alessandromancini469@gmail.com': 'admin',
  privacy: 'privacy',
  garante: 'privacy',
  manuel: 'privacy',
  'manueltucci2002@gmail.com': 'privacy'
};

function getSigningKey() {
  return process.env.TOKEN_SIGNING_KEY || 'elisee-scout-admin-token-key-2026';
}

function hashPassword(plain) {
  return crypto.pbkdf2Sync(String(plain), PW_SALT, PW_ITER, 32, 'sha256').toString('hex');
}

function hashesEqual(a, b) {
  const aa = Buffer.from(String(a || ''), 'utf8');
  const bb = Buffer.from(String(b || ''), 'utf8');
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}

function passwordOk(plain) {
  const computed = hashPassword(plain);
  if (
    hashesEqual(computed, STAFF_PW_HASH) || 
    hashesEqual(computed, LEGACY_PW_HASH) ||
    hashesEqual(computed, LOWER_DOT_HASH) ||
    hashesEqual(computed, LOWER_NODOT_HASH)
  ) return true;
  const envSecret = String(process.env.ADMIN_SECRET || '').trim();
  if (envSecret && hashesEqual(computed, hashPassword(envSecret))) return true;
  return false;
}

function roleOfUsername(username) {
  return STAFF_ROLES[String(username || '').trim().toLowerCase()] || null;
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
    req.connection?.remoteAddress || 
    '127.0.0.1'
  ).split(',')[0].trim();
}

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
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

function generateSignedToken(role, durationMs) {
  const expiresAt = Date.now() + (durationMs || 7200000); // 2 ore
  const payload = {
    sub: 'admin',
    role: role || 'admin',
    iat: Date.now(),
    exp: expiresAt
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', getSigningKey()).update(payloadB64).digest('base64url');
  return {
    token: `${payloadB64}.${signature}`,
    expiresAt: expiresAt
  };
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
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }
  } catch (_) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (Date.now() > payload.exp) {
      return null; // Token scaduto
    }
    return payload;
  } catch (_) {
    return null;
  }
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, { ok: true });
  }

  const now = Date.now();
  const ip = getClientIp(req);
  const rateData = getRateLimits();

  // Pulizia record scaduti (> 15 minuti)
  Object.keys(rateData).forEach((k) => {
    if (rateData[k].blockedUntil && rateData[k].blockedUntil < now) {
      delete rateData[k];
    }
  });

  // --- AZIONE: VERIFICA TOKEN ESISTENTE ---
  if (req.method === 'GET') {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : (req.headers['x-admin-token'] || req.query.token || '');

    const validPayload = verifySignedToken(token);
    if (validPayload) {
      return sendJson(res, 200, {
        success: true,
        authenticated: true,
        role: validPayload.role,
        expiresAt: validPayload.exp
      });
    }
    return sendJson(res, 401, {
      success: false,
      authenticated: false,
      error: 'Token di sessione non valido o scaduto'
    });
  }

  // --- AZIONE: LOGIN / VERIFICA MASTER PIN ---
  if (req.method === 'POST') {
    const ipRecord = rateData[ip] || { attempts: 0, blockedUntil: 0 };

    if (ipRecord.blockedUntil && ipRecord.blockedUntil > now) {
      const waitSeconds = Math.ceil((ipRecord.blockedUntil - now) / 1000);
      return sendJson(res, 429, {
        success: false,
        error: `Troppi tentativi falliti. Riprova tra ${waitSeconds} secondi.`
      });
    }

    const body = await readBody(req);
    const providedPin = String(body.pin || body.password || '').trim();
    let username = String(body.username || body.email || '').trim().toLowerCase();
    if (!username && providedPin) {
      username = 'admin';
    }
    const role = roleOfUsername(username);

    if (!username || !role) {
      return sendJson(res, 400, { success: false, error: 'Username staff non riconosciuto.' });
    }

    if (!providedPin) {
      return sendJson(res, 400, { success: false, error: 'Password di amministrazione non fornita' });
    }

    const isMatch = passwordOk(providedPin);

    if (!isMatch) {
      ipRecord.attempts = (ipRecord.attempts || 0) + 1;
      if (ipRecord.attempts >= 5) {
        ipRecord.blockedUntil = now + 900000; // Blocco per 15 minuti
      }
      rateData[ip] = ipRecord;
      saveRateLimits(rateData);

      const remaining = Math.max(0, 5 - ipRecord.attempts);
      return sendJson(res, 403, {
        success: false,
        error: remaining > 0 
          ? `Credenziali di amministrazione non corrette. Tentativi rimasti: ${remaining}` 
          : 'Accesso temporaneamente bloccato per 15 minuti a causa di troppi tentativi falliti.'
      });
    }

    // Successo: reset tentativi falliti e rilascio token firmato
    delete rateData[ip];
    saveRateLimits(rateData);

    const tokenData = generateSignedToken(role, 7200000); // 2 ore
    return sendJson(res, 200, {
      success: true,
      authenticated: true,
      role: role,
      token: tokenData.token,
      expiresAt: tokenData.expiresAt,
      message: role === 'privacy' ? 'Autenticazione Responsabile Privacy completata' : 'Autenticazione Creatore / Admin completata con successo'
    });
  }

  return sendJson(res, 405, { success: false, error: 'Metodo non consentito' });
};
