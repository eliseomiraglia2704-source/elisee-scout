/**
 * ELISEE SCOUT — Verifica token admin HMAC-SHA256 condivisa.
 * Usata da ogni endpoint che richiede privilegi admin (manager.js, ecc.).
 * NON accetta header X-Elisee-Admin in chiaro.
 */
const crypto = require('crypto');

/**
 * Verifica se la richiesta porta un token admin HMAC-SHA256 valido,
 * firmato da auth-admin.js con TOKEN_SIGNING_KEY.
 * Il token è atteso in Authorization: Bearer <token> oppure X-Admin-Token.
 * @param {import('http').IncomingMessage} req
 * @returns {object|null} payload del token (con .role, .exp) o null se non valido
 */
function verifyAdminToken(req) {
  const signingKey = process.env.TOKEN_SIGNING_KEY;
  if (!signingKey) {
    // Fail-closed: senza chiave configurata, nessun accesso admin è possibile
    return null;
  }

  const authHeader = String(req.headers['authorization'] || '');
  const tokenRaw = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : String(req.headers['x-admin-token'] || '').trim();

  if (!tokenRaw || tokenRaw.indexOf('.') < 0) return null;

  const parts = tokenRaw.split('.');
  if (parts.length !== 2) return null;

  const [payloadB64, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', signingKey)
    .update(payloadB64)
    .digest('base64url');

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
    if (!payload || !payload.exp || Date.now() > payload.exp) return null;
    if (payload.role !== 'admin' && payload.role !== 'privacy') return null;
    return payload;
  } catch (_) {
    return null;
  }
}

/**
 * Restituisce true solo se il token appartiene a ruolo 'admin' (non privacy).
 * @param {import('http').IncomingMessage} req
 */
function isAdmin(req) {
  const payload = verifyAdminToken(req);
  return !!(payload && payload.role === 'admin');
}

module.exports = { verifyAdminToken, isAdmin };
