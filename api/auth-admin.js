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

function getSecret() {
  return process.env.ADMIN_SECRET || 'admin123';
}

function getSigningKey() {
  return process.env.TOKEN_SIGNING_KEY || 'elisee-scout-admin-token-key-2026';
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
  
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
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

    if (!providedPin) {
      return sendJson(res, 400, { success: false, error: 'PIN o Password di amministrazione non fornita' });
    }

    const correctSecret = getSecret();
    const isMatch = (providedPin === correctSecret);

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

    const tokenData = generateSignedToken('admin', 7200000); // 2 ore
    return sendJson(res, 200, {
      success: true,
      authenticated: true,
      token: tokenData.token,
      expiresAt: tokenData.expiresAt,
      message: 'Autenticazione Creatore / Admin completata con successo'
    });
  }

  return sendJson(res, 405, { success: false, error: 'Metodo non consentito' });
};
