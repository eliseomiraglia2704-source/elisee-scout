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
  const digits = String(code || '').replace(/\D/g, '').slice(0, 8);
  const subject = 'Codice di verifica Elisee Scout';
  const text =
    'ELISEE SCOUT\n\n' +
    'Il tuo codice di verifica è: ' + digits + '\n\n' +
    'Valido 10 minuti. Aprilo in questa email e inseriscilo nella barra in basso sul sito.\n' +
    'Non è un link di accesso e non è un SMS.\n' +
    'Non condividere il codice con nessuno.\n\n' +
    'Se non hai richiesto questo codice, ignora il messaggio.';
  const html =
    '<!DOCTYPE html><html lang="it"><body style="margin:0;padding:0;background:#0b1220;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b1220;padding:24px 0;">' +
    '<tr><td align="center">' +
    '<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:560px;max-width:560px;background:#111827;border:1px solid #1e3a5f;border-radius:16px;">' +
    '<tr><td style="background:#0284c7;padding:20px 28px;font-family:Arial,Helvetica,sans-serif;color:#ffffff;font-size:13px;font-weight:800;letter-spacing:0.16em;">ELISEE SCOUT</td></tr>' +
    '<tr><td style="padding:28px 28px 8px;font-family:Arial,Helvetica,sans-serif;color:#e2e8f0;font-size:22px;font-weight:800;">Codice di verifica</td></tr>' +
    '<tr><td style="padding:0 28px 20px;font-family:Arial,Helvetica,sans-serif;color:#94a3b8;font-size:15px;line-height:1.55;">Usa questo codice a 6 cifre nella barra in basso sul sito. Non è un link di accesso e non è un SMS.</td></tr>' +
    '<tr><td align="center" style="padding:8px 28px 24px;">' +
    '<table role="presentation" cellpadding="0" cellspacing="0" style="background:#0b1220;border:1px solid #38bdf8;border-radius:14px;">' +
    '<tr><td style="padding:18px 32px;font-family:Consolas,\'Courier New\',monospace;font-size:34px;letter-spacing:10px;font-weight:800;color:#38bdf8;">' + digits + '</td></tr>' +
    '</table></td></tr>' +
    '<tr><td style="padding:0 28px 28px;font-family:Arial,Helvetica,sans-serif;color:#64748b;font-size:13px;line-height:1.5;">Valido 10 minuti. Non condividere il codice con nessuno. Se non hai richiesto questa verifica, ignora l\'email.</td></tr>' +
    '<tr><td style="padding:14px 28px;border-top:1px solid #1e3a5f;font-family:Arial,Helvetica,sans-serif;color:#475569;font-size:11px;">Elisee Scout · verifica account</td></tr>' +
    '</table></td></tr></table></body></html>';
  return { subject, text, html };
}

async function sendResend(email, bodies) {
  const key = (process.env.RESEND_API_KEY || '').trim();
  if (!key) return false;
  try {
    const payload = {
      from: (process.env.RESEND_FROM || 'Elisee Scout <verifica@barberiagarofalo.it>').trim(),
      to: email,
      subject: bodies.subject,
      text: bodies.text,
      html: bodies.html
    };
    const replyTo = (process.env.RESEND_REPLY_TO || '').trim();
    if (replyTo) payload.reply_to = replyTo;
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + key,
        'Content-Type': 'application/json',
        'User-Agent': 'EliseeScout/1.0',
        Accept: 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (r && r.ok) return true;
    try {
      const errBody = await r.text();
      console.error('otp resend fail', r.status, errBody.slice(0, 240));
    } catch (_) {}
    return false;
  } catch (e) {
    console.error('otp resend err', e && e.message);
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
    const rawCode = String(crypto.randomInt(100000, 1000000)).padStart(6, '0');
    const bodies = mailBodies(rawCode);
    let via = '';
    if (await sendResend(email, bodies)) via = 'local';
    if (!via) {
      return sendJson(res, 503, {
        success: false,
        error: 'Invio email non riuscito. Riprova: il codice arriva solo via posta elettronica.',
        email: email
      });
    }
    const rec = {
      expiresAt: now + 600000,
      attempts: 0,
      via: via,
      codeHash: hashOtp(email, rawCode)
    };
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
