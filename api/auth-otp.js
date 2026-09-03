/**
 * ELISEE SCOUT — Email OTP
 * /api/auth-otp?action=send | /api/auth-otp?action=verify
 *
 * Flusso classico: il codice nasce sul server, arriva SOLO via email,
 * l'utente lo digita a mano. Mai in risposta HTTP, mai in auto-fill.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const OTP_STORE_FILE = process.env.VERCEL
  ? '/tmp/elisee-otp-store.json'
  : path.join(process.cwd(), 'data', 'auth', 'otp-store.json');

const memoryStore = {};
const SUPABASE_URL = (process.env.SUPABASE_URL || 'https://uautnlmnpxgbajtucuko.supabase.co').replace(/\/$/, '');
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || 'sb_publishable_1e-KMVmQHAf9GduUTMKn8Q_9ibW1BK_';

function getStore() {
  try {
    if (fs.existsSync(OTP_STORE_FILE)) {
      return JSON.parse(fs.readFileSync(OTP_STORE_FILE, 'utf8')) || {};
    }
  } catch (_) {}
  return Object.assign({}, memoryStore);
}

function saveStore(store) {
  try {
    fs.mkdirSync(path.dirname(OTP_STORE_FILE), { recursive: true });
    fs.writeFileSync(OTP_STORE_FILE, JSON.stringify(store, null, 2));
  } catch (_) {
    Object.assign(memoryStore, store);
  }
}

function hashOtp(email, code) {
  const secret = process.env.OTP_SECRET || 'elisee-scout-otp-secret-salt-2026';
  return crypto.createHmac('sha256', secret).update(String(email).toLowerCase() + ':' + code).digest('hex');
}

function mailBodies(code) {
  const subject = 'Il tuo codice di verifica Elisee Scout';
  const text =
    'Il tuo codice OTP di verifica è: ' + code + '\n\n' +
    'Valido 10 minuti. Aprilo in questa email e inseriscilo nella barra di verifica su Elisee Scout.\n' +
    'Non condividere il codice con nessuno.\n\n' +
    'Se non hai richiesto questo codice, ignora il messaggio.';
  const html =
    '<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;color:#0f172a">' +
    '<p>Ciao,</p><p>Il tuo codice OTP di verifica per <strong>Elisee Scout</strong> è:</p>' +
    '<p style="font-size:32px;letter-spacing:10px;font-weight:800;color:#0284c7">' + code + '</p>' +
    '<p>Valido 10 minuti. Inseriscilo nella barra in basso sul sito. Non è un SMS: arriva solo via email.</p>' +
    '<p style="color:#64748b;font-size:13px">Se non hai richiesto questo codice, ignora il messaggio.</p></div>';
  return { subject, text, html };
}

async function sendResend(email, bodies) {
  const key = (process.env.RESEND_API_KEY || '').trim();
  if (!key) return false;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || 'Elisee Scout <verifica@elisee-scout.vercel.app>',
        to: email,
        subject: bodies.subject,
        text: bodies.text,
        html: bodies.html
      })
    });
    return !!(r && r.ok);
  } catch (_) {
    return false;
  }
}

async function sendSupabaseOtp(email) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return false;
  try {
    const r = await fetch(SUPABASE_URL + '/auth/v1/otp', {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: email, create_user: true })
    });
    return !!(r && r.ok);
  } catch (_) {
    return false;
  }
}

async function verifySupabaseOtp(email, code) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return false;
  try {
    const r = await fetch(SUPABASE_URL + '/auth/v1/verify', {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type: 'email', email: email, token: code })
    });
    return !!(r && r.ok);
  } catch (_) {
    return false;
  }
}

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (c) => {
      raw += c;
      if (raw.length > 1e5) req.destroy();
    });
    req.on('end', () => {
      try { resolve(JSON.parse(raw || '{}')); } catch (e) { resolve({}); }
    });
  });
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, { ok: true });
  }

  const query = req.query || {};
  let action = query.action;
  const body = req.method === 'POST' ? await readBody(req) : {};
  if (!action && body.action) action = body.action;

  const email = String(body.email || query.email || '').trim().toLowerCase();
  if (!email || !email.includes('@')) {
    return sendJson(res, 400, { success: false, error: 'Indirizzo email non valido' });
  }

  const now = Date.now();
  const store = getStore();
  Object.keys(store).forEach((k) => {
    if (store[k].expiresAt && store[k].expiresAt < now - 1800000) delete store[k];
  });

  if (action === 'send') {
    const existing = store[email] || {};
    const recentSends = (existing.sendHistory || []).filter((t) => now - t < 600000);
    if (recentSends.length >= 3) {
      return sendJson(res, 429, {
        success: false,
        error: 'Troppe richieste. Attendi qualche minuto e riprova.',
        email: email
      });
    }
    const rawCode = String(crypto.randomInt(100000, 1000000)).padStart(6, '0');
    const bodies = mailBodies(rawCode);
    let via = '';
    if (await sendResend(email, bodies)) via = 'local';
    else if (await sendSupabaseOtp(email)) via = 'supabase';
    if (!via) {
      return sendJson(res, 503, {
        success: false,
        error: 'Invio email non riuscito. Riprova tra poco: il codice arriva solo via posta elettronica.',
        email: email
      });
    }
    const rec = {
      expiresAt: now + 600000,
      attempts: 0,
      sendHistory: recentSends.concat([now]),
      via: via
    };
    if (via === 'local') rec.codeHash = hashOtp(email, rawCode);
    store[email] = rec;
    saveStore(store);
    return sendJson(res, 200, {
      success: true,
      message: 'Codice inviato via email. Aprilo nella casella e inserisci le 6 cifre.',
      email: email,
      digits: 6,
      expiresIn: 600
    });
  }

  if (action === 'verify') {
    const code = String(body.code || query.code || '').trim();
    if (!code || !/^\d{4,8}$/.test(code)) {
      return sendJson(res, 400, { success: false, error: 'Inserisci il codice numerico ricevuto via email.' });
    }
    const record = store[email];
    if (!record) {
      return sendJson(res, 400, { success: false, error: 'Nessun codice attivo per questa email. Premi Invia codice.' });
    }
    if (now > record.expiresAt) {
      delete store[email];
      saveStore(store);
      return sendJson(res, 400, { success: false, error: 'Il codice OTP è scaduto. Richiedi un nuovo codice.' });
    }
    record.attempts = (record.attempts || 0) + 1;
    if (record.attempts > 5) {
      delete store[email];
      saveStore(store);
      return sendJson(res, 429, { success: false, error: 'Troppi tentativi. Richiedi un nuovo codice.' });
    }
    let ok = false;
    if (record.via === 'supabase' || !record.codeHash) {
      ok = await verifySupabaseOtp(email, code);
    }
    if (!ok && record.codeHash) {
      const provided = hashOtp(email, code);
      try {
        ok = crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(record.codeHash));
      } catch (_) {
        ok = false;
      }
    }
    if (!ok) {
      saveStore(store);
      return sendJson(res, 400, {
        success: false,
        error: 'Codice OTP errato. Tentativi rimasti: ' + Math.max(0, 5 - record.attempts)
      });
    }
    delete store[email];
    saveStore(store);
    return sendJson(res, 200, {
      success: true,
      verified: true,
      email: email,
      verifiedAt: new Date(now).toISOString()
    });
  }

  return sendJson(res, 400, { success: false, error: 'Azione non supportata (action=send o action=verify)' });
};
