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
    'Europe/Rome': 'Roma (IT)',
    'Europe/Paris': 'Parigi (FR)',
    'Europe/Berlin': 'Berlino (DE)',
    'Europe/Madrid': 'Madrid (ES)',
    'Europe/London': 'Londra (GB)',
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
    const fmt = new Intl.DateTimeFormat('it-IT', {
      timeZone: tz || 'Europe/Rome',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    return fmt.format(new Date()).replace(',', ' ·');
  } catch (_) {
    return new Date().toLocaleString('it-IT');
  }
}

function detailRow(label, value, first, last) {
  const pt = first ? '14px' : '10px';
  const pb = last ? '14px' : '10px';
  const line = last ? '' : 'border-bottom:1px solid #1E3A5F;';
  return (
    '<tr>' +
    '<td width="46%" valign="middle" style="padding:' + pt + ' 16px ' + pb + ' 16px;' + line + 'font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#7DD3FC;">' + esc(label) + '</td>' +
    '<td valign="middle" style="padding:' + pt + ' 16px ' + pb + ' 16px;' + line + 'font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#F1F5F9;">' + esc(value) + '</td>' +
    '</tr>'
  );
}

function digitCells(digits) {
  let html = '<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto;"><tr>';
  String(digits || '').split('').forEach((ch, i) => {
    if (i) html += '<td width="6" style="width:6px;font-size:1px;line-height:1px;">&nbsp;</td>';
    html +=
      '<td align="center" valign="middle" width="44" style="width:44px;background:#071422;border:1px solid #38BDF8;border-radius:10px;padding:12px 0;font-family:Arial,Helvetica,sans-serif;font-size:24px;line-height:24px;font-weight:800;color:#38BDF8;">' +
      esc(ch) + '</td>';
  });
  html += '</tr></table>';
  return html;
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
  const hello = nome ? ('Ciao ' + nome + ',') : 'Ciao,';
  const subject = 'Codice di verifica Elisee Scout';
  const text =
    hello + '\n\n' +
    'Per confermare il tuo account, inserisci questo codice nella barra in basso su Elisee Scout.\n\n' +
    spaced + '\n\n' +
    'Valido 10 minuti. Non condividerlo con nessuno.\n\n' +
    'Dettagli di questo accesso:\n' +
    'Data                 ' + when + '\n' +
    'Browser              ' + parsed.browser + '\n' +
    'Sistema operativo    ' + parsed.osName + '\n' +
    'Posizione            ' + place + '\n\n' +
    "Se non hai richiesto questo codice, ignora l'email oppure segnalacelo.\n\n" +
    'Il team Elisee Scout';
  const support = 'mailto:eliseomiraglia2704@gmail.com?subject=Accesso%20non%20autorizzato%20Elisee%20Scout';
  const logo = 'https://elisee-scout.vercel.app/immagini/logo/es-logo-icon.png';
  const html =
    '<!DOCTYPE html><html lang="it"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>' + esc(subject) + '</title></head>' +
    '<body style="margin:0;padding:0;background:#05070C;">' +
    '<div style="display:none;max-height:0;overflow:hidden;opacity:0;">Il tuo codice di verifica Elisee Scout</div>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#05070C;">' +
    '<tr><td align="center">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background:#0B1220;">' +
    '<tr><td style="padding:18px 24px;background:#07101C;border-bottom:3px solid #38BDF8;">' +
    '<table role="presentation" cellpadding="0" cellspacing="0"><tr>' +
    '<td valign="middle" style="padding-right:12px;"><img src="' + logo + '" width="36" height="36" alt="Elisee Scout" style="display:block;border:0;width:36px;height:36px;"></td>' +
    '<td valign="middle" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:800;letter-spacing:0.18em;color:#FFFFFF;">ELISEE SCOUT</td>' +
    '</tr></table></td></tr>' +
    '<tr><td style="padding:28px 24px 8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:22px;color:#94A3B8;">' +
    esc(hello) +
    '</td></tr>' +
    '<tr><td style="padding:4px 24px 10px;font-family:Arial,Helvetica,sans-serif;font-size:26px;line-height:32px;font-weight:800;color:#F8FAFC;">Codice di verifica</td></tr>' +
    '<tr><td style="padding:0 24px 22px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:23px;color:#94A3B8;">' +
    'Per confermare il tuo account, inserisci questo codice nella barra in basso sul sito.' +
    '</td></tr>' +
    '<tr><td align="center" style="padding:4px 16px 8px;">' + digitCells(digits) + '</td></tr>' +
    '<tr><td align="center" style="padding:14px 24px 26px;">' +
    '<table role="presentation" cellpadding="0" cellspacing="0" style="background:#082F49;border-radius:999px;"><tr>' +
    '<td style="padding:8px 16px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.04em;color:#7DD3FC;">Valido 10 minuti</td>' +
    '</tr></table></td></tr>' +
    '<tr><td style="padding:0 24px 10px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:#38BDF8;">Dettagli accesso</td></tr>' +
    '<tr><td style="padding:0 24px 22px;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;background:#07101C;border:1px solid #1E3A5F;border-radius:12px;">' +
    detailRow('Data', when, true, false) +
    detailRow('Browser', parsed.browser, false, false) +
    detailRow('Sistema', parsed.osName, false, false) +
    detailRow('Posizione', place, false, true) +
    '</table></td></tr>' +
    '<tr><td style="padding:0 24px 28px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:21px;color:#64748B;">' +
    "Se non hai richiesto questo codice, ignora l'email oppure " +
    '<a href="' + support + '" style="color:#38BDF8;text-decoration:underline;">segnalacelo</a>. ' +
    'Non condividere il codice con nessuno.' +
    '</td></tr>' +
    '<tr><td style="padding:16px 24px 24px;border-top:1px solid #1E3A5F;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#475569;">' +
    'Elisee Scout · <a href="https://elisee-scout.vercel.app" style="color:#7DD3FC;text-decoration:none;">elisee-scout.vercel.app</a>' +
    '</td></tr>' +
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
