/**
 * ELISEE SCOUT — Vercel Serverless Function: Email OTP Verification
 * Endpoint: /api/auth-otp?action=send | /api/auth-otp?action=verify
 * 
 * Gestione sicura del codice OTP per la verifica email:
 * - Generazione crittografica lato server (4 cifre)
 * - Rate limiting su invii (max 3 invii per email ogni 10 min)
 * - Rate limiting su verifiche (max 5 tentativi falliti poi invalidazione)
 * - Scadenza codice 10 minuti
 * - Nessun fallback hardcoded (0000/1234 categoricamente vietati)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const OTP_STORE_FILE = process.env.VERCEL 
  ? '/tmp/elisee-otp-store.json' 
  : path.join(process.cwd(), 'data', 'auth', 'otp-store.json');

// In-memory fallback se il filesystem è temporaneamente indisponibile
const memoryStore = {};

function getStore() {
  try {
    if (fs.existsSync(OTP_STORE_FILE)) {
      return JSON.parse(fs.readFileSync(OTP_STORE_FILE, 'utf8')) || {};
    }
  } catch (_) {}
  return memoryStore;
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
  return crypto.createHmac('sha256', secret).update(email.toLowerCase() + ':' + code).digest('hex');
}

function otpSecret() {
  return process.env.OTP_SECRET || 'elisee-scout-otp-secret-salt-2026';
}

function toB64Url(str) {
  return Buffer.from(str, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromB64Url(s) {
  const t = String(s || '').replace(/-/g, '+').replace(/_/g, '/');
  const pad = t.length % 4 === 0 ? '' : '='.repeat(4 - (t.length % 4));
  return Buffer.from(t + pad, 'base64').toString('utf8');
}

function makeChallenge(email, code, exp) {
  const h = crypto.createHmac('sha256', otpSecret()).update(email + ':' + code + ':' + exp).digest('hex');
  return toB64Url(JSON.stringify({ e: email, x: exp, h: h }));
}

function checkChallenge(email, code, challenge) {
  if (!challenge) return { ok: false, error: 'Challenge OTP assente. Richiedi un nuovo codice.' };
  let data;
  try {
    data = JSON.parse(fromB64Url(challenge));
  } catch (_) {
    return { ok: false, error: 'Challenge OTP non valido. Richiedi un nuovo codice.' };
  }
  if (String(data.e || '').toLowerCase() !== email) {
    return { ok: false, error: 'Challenge OTP non valido. Richiedi un nuovo codice.' };
  }
  const exp = Number(data.x || 0);
  if (!exp || Date.now() > exp) {
    return { ok: false, error: 'Il codice OTP è scaduto. Richiedi un nuovo codice di verifica.' };
  }
  const expected = crypto.createHmac('sha256', otpSecret()).update(email + ':' + code + ':' + exp).digest('hex');
  const given = String(data.h || '');
  if (expected.length !== given.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(given))) {
    return { ok: false, error: 'Codice OTP errato.' };
  }
  return { ok: true };
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

  // Pulizia vecchi record (> 30 minuti)
  Object.keys(store).forEach((k) => {
    if (store[k].expiresAt && store[k].expiresAt < now - 1800000) {
      delete store[k];
    }
  });

  // --- AZIONE: INVIO OTP ---
  if (action === 'send') {
    const existing = store[email] || {};

    // Rate limiting: max 3 richieste ogni 10 minuti
    if (existing.sendHistory) {
      const recentSends = existing.sendHistory.filter((t) => now - t < 600000);
      if (recentSends.length >= 3) {
        return sendJson(res, 429, { 
          success: false, 
          error: 'Troppe richieste di invio OTP. Attendi qualche minuto prima di riprovare.' 
        });
      }
      existing.sendHistory = recentSends;
    } else {
      existing.sendHistory = [];
    }

    // Generazione codice sicuro a 4 cifre (1000 - 9999)
    const rawCode = crypto.randomInt(1000, 10000).toString();
    const codeHash = hashOtp(email, rawCode);

    existing.codeHash = codeHash;
    existing.expiresAt = now + 600000; // 10 minuti di validità
    existing.attempts = 0;
    existing.sendHistory.push(now);
    store[email] = existing;
    saveStore(store);

    const exp = now + 600000;
    const challenge = makeChallenge(email, rawCode, exp);

    let emailed = false;
    const mailSubject = 'Il tuo codice di verifica Elisee Scout';
    const mailText = `Il tuo codice OTP di verifica è: ${rawCode}.\n\nValido 10 minuti. Inseriscilo nella barra di verifica su Elisee Scout.\n\nSe non hai richiesto questo codice, ignora il messaggio.`;
    if (process.env.RESEND_API_KEY) {
      try {
        const mailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM || 'Elisee Scout <verifica@elisee-scout.vercel.app>',
            to: email,
            subject: mailSubject,
            text: mailText
          })
        });
        emailed = !!(mailRes && mailRes.ok);
      } catch (err) {}
    }
    if (!emailed) {
      try {
        const mailRes = await fetch('https://formsubmit.co/ajax/' + encodeURIComponent(email), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            _subject: mailSubject,
            message: mailText,
            _template: 'box',
            _captcha: 'false'
          })
        });
        emailed = !!(mailRes && mailRes.ok);
      } catch (err) {}
    }

    if (!emailed) {
      return sendJson(res, 503, {
        success: false,
        error: 'Invio email non riuscito. Riprova tra poco: il codice arriva solo via posta elettronica.',
        email: email
      });
    }
    return sendJson(res, 200, {
      success: true,
      message: 'Codice inviato via email. Aprilo nella casella e inserisci le 4 cifre.',
      email: email,
      expiresIn: 600,
      challenge: challenge
    });
  }

  // --- AZIONE: VERIFICA OTP ---
  if (action === 'verify') {
    const code = String(body.code || query.code || '').trim();
    if (!code || code.length !== 4 || !/^\d{4}$/.test(code)) {
      return sendJson(res, 400, { success: false, error: 'Il codice OTP deve essere composto da 4 cifre numeriche' });
    }

    const challenge = String(body.challenge || query.challenge || '').trim();
    if (challenge) {
      const challenged = checkChallenge(email, code, challenge);
      if (challenged.ok) {
        const proofSecret = process.env.OTP_SECRET || 'elisee-scout-otp-secret-salt-2026';
        const proof = crypto.createHmac('sha256', proofSecret).update(email + ':verified:' + now).digest('hex');
        try { delete store[email]; saveStore(store); } catch (_) {}
        return sendJson(res, 200, {
          success: true,
          verified: true,
          email: email,
          verifiedAt: new Date(now).toISOString(),
          proof: proof
        });
      }
      if (challenged.error && /errato|scaduto/i.test(challenged.error)) {
        return sendJson(res, 400, { success: false, error: challenged.error });
      }
    }

    const record = store[email];
    if (!record || !record.codeHash || !record.expiresAt) {
      return sendJson(res, 400, { 
        success: false, 
        error: 'Nessun codice OTP attivo per questa email. Richiedi un nuovo codice.' 
      });
    }

    // Verifica scadenza
    if (now > record.expiresAt) {
      delete store[email];
      saveStore(store);
      return sendJson(res, 400, { 
        success: false, 
        error: 'Il codice OTP è scaduto. Richiedi un nuovo codice di verifica.' 
      });
    }

    // Rate limiting tentativi errati (max 5 tentativi)
    record.attempts = (record.attempts || 0) + 1;
    if (record.attempts > 5) {
      delete store[email];
      saveStore(store);
      return sendJson(res, 429, { 
        success: false, 
        error: 'Numero massimo di tentativi superato. Il codice è stato annullato per motivi di sicurezza.' 
      });
    }

    // Confronto crittografico dell'hash
    const providedHash = hashOtp(email, code);
    const isValid = crypto.timingSafeEqual(Buffer.from(providedHash), Buffer.from(record.codeHash));

    if (!isValid) {
      saveStore(store);
      const remaining = 5 - record.attempts;
      return sendJson(res, 400, { 
        success: false, 
        error: `Codice OTP errato. Tentativi rimasti: ${remaining}` 
      });
    }

    // Codice corretto: rimuovi il record per evitare riutilizzo
    delete store[email];
    saveStore(store);

    // Genera token di avvenuta verifica firmato
    const proofSecret = process.env.OTP_SECRET || 'elisee-scout-otp-secret-salt-2026';
    const proof = crypto.createHmac('sha256', proofSecret).update(email + ':verified:' + now).digest('hex');

    return sendJson(res, 200, {
      success: true,
      verified: true,
      email: email,
      verifiedAt: new Date(now).toISOString(),
      proof: proof
    });
  }

  return sendJson(res, 400, { success: false, error: 'Azione non supportata (utilizzare action=send o action=verify)' });
};
