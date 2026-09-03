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

function esc(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function parseUa(ua) {
  const low = String(ua || '').toLowerCase();
  let browser = 'Sconosciuto';
  if (low.includes('edg/') || low.includes('edg ')) browser = 'Edge';
  else if (low.includes('opr/') || low.includes('opera')) browser = 'Opera';
  else if (low.includes('chrome/') && !low.includes('chromium')) browser = 'Chrome';
  else if (low.includes('firefox/') || low.includes('fxios')) browser = 'Firefox';
  else if (low.includes('safari/')) browser = 'Safari';
  let osName = 'Sconosciuto';
  if (low.includes('windows')) osName = 'Windows';
  else if (low.includes('android')) osName = 'Android';
  else if (low.includes('iphone') || low.includes('ipad') || low.includes('ios')) osName = 'iOS';
  else if (low.includes('mac os') || low.includes('macintosh')) osName = 'macOS';
  else if (low.includes('linux')) osName = 'Linux';
  return { browser, osName };
}

function locationFromTz(tz) {
  const name = String(tz || '').trim();
  const known = {
    'Europe/Rome': 'Rome (IT)',
    'Europe/Paris': 'Paris (FR)',
    'Europe/Berlin': 'Berlin (DE)',
    'Europe/Madrid': 'Madrid (ES)',
    'Europe/London': 'London (GB)',
    'Europe/Amsterdam': 'Amsterdam (NL)',
    'America/New_York': 'New York (US)',
    'America/Los_Angeles': 'Los Angeles (US)',
    'America/Chicago': 'Chicago (US)'
  };
  if (known[name]) return known[name];
  if (name.includes('/')) return name.split('/').pop().replace(/_/g, ' ');
  return 'Non disponibile';
}

function formatWhen(tz) {
  try {
    const now = new Date();
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: tz || 'Europe/Rome',
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    const parts = fmt.formatToParts(now);
    const get = (t) => (parts.find((p) => p.type === t) || {}).value || '';
    return get('month') + '/' + get('day') + '/' + get('year') + ' ' + get('hour') + ':' + get('minute') + ':' + get('second') + ' ' + get('dayPeriod');
  } catch (_) {
    return new Date().toLocaleString('en-US');
  }
}

function detailRow(label, value, first, last) {
  const pt = first ? '16px' : '7px';
  const pb = last ? '16px' : '7px';
  return (
    '<tr>' +
    '<td width="170" valign="top" style="padding:' + pt + ' 20px ' + pb + ' 20px;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:20px;color:#8B8B98;">' + esc(label) + '</td>' +
    '<td valign="top" style="padding:' + pt + ' 20px ' + pb + ' 20px;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:20px;color:#232333;">' + esc(value) + '</td>' +
    '</tr>'
  );
}

function mailBodies(code, meta) {
  const digits = String(code || '').replace(/\D/g, '').slice(0, 8);
  const spaced = digits.split('').join(' ') || digits;
  const info = meta && typeof meta === 'object' ? meta : {};
  const nome = String(info.nome || '').trim();
  const parsed = parseUa(info.ua || '');
  const tz = String(info.tz || '');
  const when = formatWhen(tz);
  const place = locationFromTz(tz);
  const hello = nome ? ('Hi ' + nome + ',') : 'Hi,';
  const subject = 'Your Elisee Scout verification code';
  const text =
    hello + '\n\n' +
    "We detected an unusual login from a device or location you don't usually use. " +
    'If this was you please input the code below to log into Elisee Scout\n\n' +
    spaced + '\n\n' +
    'The code will be expired in 10 minutes.\n\n' +
    'Please review the sign in activity details below:\n' +
    'Date                 ' + when + '\n' +
    'Browser              ' + parsed.browser + '\n' +
    'Operating System     ' + parsed.osName + '\n' +
    'Location             ' + place + '\n\n' +
    "If this wasn't you, please let us know here. We recommend you update your password " +
    'and enable Two-factor authentication to secure your account.\n\n' +
    'Thank you,\n' +
    'The Elisee Scout Team';
  const support = 'mailto:eliseomiraglia2704@gmail.com?subject=Accesso%20non%20autorizzato%20Elisee%20Scout';
  const html =
    '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>' + esc(subject) + '</title></head>' +
    '<body style="margin:0;padding:0;background:#ffffff;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;">' +
    '<tr><td>' +
    '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#ffffff;">' +
    '<tr><td style="padding:28px 32px 8px;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;color:#232333;">' +
    esc(hello) +
    '</td></tr>' +
    '<tr><td style="padding:12px 32px 8px;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;color:#232333;">' +
    "We detected an unusual login from a device or location you don't usually use. " +
    'If this was you please input the code below to log into Elisee Scout' +
    '</td></tr>' +
    '<tr><td style="padding:20px 32px 8px;font-family:Helvetica,Arial,sans-serif;font-size:32px;line-height:40px;font-weight:700;letter-spacing:6px;color:#000000;">' +
    esc(spaced) +
    '</td></tr>' +
    '<tr><td style="padding:12px 32px 8px;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;color:#232333;">' +
    'The code will be expired in 10 minutes.' +
    '</td></tr>' +
    '<tr><td style="padding:16px 32px 10px;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;color:#232333;">' +
    'Please review the sign in activity details below:' +
    '</td></tr>' +
    '<tr><td style="padding:4px 32px 18px;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;background:#F4F4F8;border-radius:8px;">' +
    detailRow('Date', when, true, false) +
    detailRow('Browser', parsed.browser, false, false) +
    detailRow('Operating System', parsed.osName, false, false) +
    detailRow('Location', place, false, true) +
    '</table></td></tr>' +
    '<tr><td style="padding:8px 32px 8px;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;color:#232333;">' +
    "If this wasn't you, please let us know " +
    '<a href="' + support + '" style="color:#0E71EB;text-decoration:underline;">here</a>. ' +
    'We recommend you update your password and enable Two-factor authentication to secure your account.' +
    '</td></tr>' +
    '<tr><td style="padding:20px 32px 4px;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;color:#232333;">Thank you,</td></tr>' +
    '<tr><td style="padding:0 32px 36px;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;color:#232333;">The Elisee Scout Team</td></tr>' +
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
    const bodies = mailBodies(rawCode, {
      nome: body.nome || query.nome || '',
      ua: body.ua || req.headers['user-agent'] || '',
      tz: body.tz || ''
    });
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
