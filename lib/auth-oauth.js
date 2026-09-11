/**
 * Auth OAuth Google via Supabase — usato dalle function Vercel.
 * Chiavi anon sono publishable (stesso config.json locale).
 */
const crypto = require('crypto');

const SUPABASE_URL = (process.env.SUPABASE_URL || 'https://uautnlmnpxgbajtucuko.supabase.co').replace(/\/$/, '');
const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || 'sb_publishable_1e-KMVmQHAf9GduUTMKn8Q_9ibW1BK_';
const GOOGLE_CLIENT_ID = String(process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '').trim();
const AUTH_SECRET = process.env.ELISEE_AUTH_SECRET || 'elisee-scout-auth-hmac-2026';

function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function pkcePair() {
  const verifier = crypto.randomBytes(48).toString('base64url');
  const challenge = b64url(crypto.createHash('sha256').update(verifier).digest());
  return { verifier, challenge };
}

function signToken(user) {
  const payload = b64url(JSON.stringify({
    id: user.id,
    email: user.email,
    nome: user.nome || '',
    cognome: user.cognome || '',
    ruolo: user.ruolo || 'Calciatore',
    provider: user.provider || 'google',
    exp: Date.now() + 30 * 86400000
  }));
  const sig = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('base64url');
  return payload + '.' + sig;
}

function verifyToken(token) {
  if (!token || token.indexOf('.') < 0) return null;
  const [payload, sig] = token.split('.');
  const expect = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('base64url');
  const a = Buffer.from(sig || '');
  const b = Buffer.from(expect);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const user = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!user || !user.exp || user.exp < Date.now()) return null;
    return user;
  } catch (e) {
    return null;
  }
}

function safeReturnTo(next) {
  let n = String(next || '/').trim();
  if (!n.startsWith('/') || n.startsWith('//') || n.indexOf('://') >= 0) n = '/';
  n = n.split('#')[0].split('?')[0] || '/';
  return n;
}

function originOf(req) {
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || 'elisee-scout.vercel.app').split(',')[0].trim();
  const proto = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  return proto + '://' + host;
}

function pkceCookie(value, maxAge) {
  const parts = [
    'es_pkce=' + encodeURIComponent(value),
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=' + String(maxAge)
  ];
  if (process.env.VERCEL) parts.push('Secure');
  return parts.join('; ');
}

function readPkceCookie(req) {
  const raw = String(req.headers.cookie || '');
  const m = raw.match(/(?:^|;\s*)es_pkce=([^;]*)/);
  if (!m) return null;
  try {
    return JSON.parse(decodeURIComponent(m[1]));
  } catch (e) {
    return null;
  }
}

function publicConfig() {
  return {
    ok: true,
    googleClientId: GOOGLE_CLIENT_ID,
    googleEnabled: !!GOOGLE_CLIENT_ID,
    supabaseUrl: SUPABASE_URL,
    supabaseAnonKey: SUPABASE_ANON,
    supabaseEnabled: true
  };
}

function publicUser(u) {
  return {
    id: u.id,
    email: u.email,
    nome: u.nome || '',
    cognome: u.cognome || '',
    ruolo: u.ruolo || 'Calciatore',
    role: u.ruolo || 'Calciatore',
    provider: u.provider || 'google',
    status: 'Senza squadra · iscritto ELISEE',
    statoTesserato: 'Svincolato',
    categoria: 'Iscritto ELISEE',
    staffRole: u.staffRole || '',
    verifiedByAdmin: !!u.verifiedByAdmin,
    skipDocVerify: !!u.skipDocVerify,
    mustResetPassword: !!u.mustResetPassword,
    badgeVerificaStato: u.badgeVerificaStato || (u.skipDocVerify ? 'approved' : 'none')
  };
}

async function startGoogleOAuth(req, res) {
  const origin = originOf(req);
  res.statusCode = 302;
  res.setHeader('Location', origin + '/index.html?google_gis=1');
  res.setHeader('Cache-Control', 'no-store');
  res.end();
}

async function exchangeCode(code, verifier) {
  const r = await fetch(SUPABASE_URL + '/auth/v1/token?grant_type=pkce', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON,
      Authorization: 'Bearer ' + SUPABASE_ANON
    },
    body: JSON.stringify({ auth_code: code, code_verifier: verifier })
  });
  const data = await r.json().catch(function () { return null; });
  return data && typeof data === 'object' ? data : null;
}

async function supabaseUser(accessToken) {
  const r = await fetch(SUPABASE_URL + '/auth/v1/user', {
    headers: {
      apikey: SUPABASE_ANON,
      Authorization: 'Bearer ' + accessToken
    }
  });
  const data = await r.json().catch(function () { return null; });
  return data && data.email ? data : null;
}

function userFromSupabase(info) {
  const meta = (info && info.user_metadata) || {};
  const email = String(info.email || meta.email || '').trim().toLowerCase();
  const full = String(meta.full_name || meta.name || '').trim();
  const bits = full ? full.split(/\s+/) : [];
  const isPrivacy = email === 'manueltucci2002@gmail.com';
  const isAdmin = email === 'eliseomiraglia2704@gmail.com' || email.indexOf('eliseomiraglia2704') >= 0;
  const nome = String(meta.given_name || bits[0] || (isPrivacy ? 'Manuel' : 'Utente')).trim();
  const cognome = String(meta.family_name || bits.slice(1).join(' ') || (isPrivacy ? 'Tucci' : 'Google')).trim();
  return {
    id: 'g_' + crypto.createHash('sha256').update(email).digest('hex').slice(0, 16),
    email: email,
    nome: nome,
    cognome: cognome,
    ruolo: isPrivacy ? 'Responsabile Privacy' : (isAdmin ? 'Admin Executive' : 'Calciatore'),
    staffRole: isPrivacy ? 'Responsabile Privacy' : (isAdmin ? 'Admin Executive' : ''),
    provider: 'google'
  };
}

async function finishOAuth(code, state, req) {
  const rec = readPkceCookie(req);
  if (!rec || !rec.verifier) {
    return { status: 400, body: { ok: false, error: 'oauth_state_scaduto' } };
  }
  if (state && rec.state && state !== rec.state) {
    return { status: 400, body: { ok: false, error: 'oauth_state_mismatch' } };
  }
  const payload = await exchangeCode(code, rec.verifier);
  if (!payload || payload.error) {
    return { status: 401, body: { ok: false, error: (payload && payload.error_description) || 'oauth_scambio_fallito' } };
  }
  let info = payload.user && payload.user.email ? payload.user : null;
  if (!info) info = await supabaseUser(String(payload.access_token || ''));
  if (!info || !info.email) {
    return { status: 401, body: { ok: false, error: 'oauth_utente_non_letto' } };
  }
  const user = userFromSupabase(info);
  if (String(user.email).toLowerCase() === 'manueltucci2002@gmail.com') {
    user.ruolo = 'Responsabile Privacy';
    user.staffRole = 'Responsabile Privacy';
    user.nome = user.nome || 'Manuel';
    user.cognome = user.cognome === 'Google' ? 'Tucci' : (user.cognome || 'Tucci');
  }
  const token = signToken(user);
  return {
    status: 200,
    body: {
      ok: true,
      token: token,
      user: publicUser(user),
      needsPassword: false,
      returnTo: rec.returnTo || '/'
    },
    clearCookie: true
  };
}

async function finishGoogleIdToken(idToken) {
  if (!idToken) return { status: 401, body: { ok: false, error: 'google_token_non_valido' } };
  if (!GOOGLE_CLIENT_ID) return { status: 503, body: { ok: false, error: 'google_non_configurato' } };
  var data = null;
  try {
    var lib = require('google-auth-library');
    var client = new lib.OAuth2Client(GOOGLE_CLIENT_ID);
    var ticket = await client.verifyIdToken({ idToken: idToken, audience: GOOGLE_CLIENT_ID });
    data = ticket.getPayload() || null;
  } catch (e) {
    data = null;
  }
  if (!data || !data.email) {
    return { status: 401, body: { ok: false, error: 'google_token_non_valido' } };
  }
  if (data.email_verified !== true && data.email_verified !== 'true') {
    return { status: 401, body: { ok: false, error: 'google_email_non_verificata' } };
  }
  const email = String(data.email).toLowerCase();
  const isPrivacy = email === 'manueltucci2002@gmail.com';
  const isAdmin = email === 'eliseomiraglia2704@gmail.com' || email.indexOf('eliseomiraglia2704') >= 0 || email === 'areaeliseescout@gmail.com' || email === 'elisee.scout@platform-calcio.it';
  const user = {
    id: 'g_' + crypto.createHash('sha256').update(email).digest('hex').slice(0, 16),
    email: email,
    nome: String(data.given_name || (isPrivacy ? 'Manuel' : 'Utente')),
    cognome: String(data.family_name || (isPrivacy ? 'Tucci' : 'Google')),
    ruolo: isPrivacy ? 'Responsabile Privacy' : (isAdmin ? 'Admin Executive' : 'Calciatore'),
    staffRole: isPrivacy ? 'Responsabile Privacy' : (isAdmin ? 'Admin Executive' : ''),
    provider: 'google'
  };
  return {
    status: 200,
    body: { ok: true, token: signToken(user), user: publicUser(user), needsPassword: false }
  };
}

module.exports = {
  publicConfig,
  verifyToken,
  signToken,
  publicUser,
  startGoogleOAuth,
  finishOAuth,
  finishGoogleIdToken,
  pkceCookie,
  originOf
};
