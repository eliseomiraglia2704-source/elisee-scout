/**
 * Vercel serverless — stesso contratto di /api/manager sul server locale.
 * Persistenza: Vercel KV (primario) con fallback /tmp (locale/cold-start).
 * In locale usa elisee_up.py (file data/manager/state.json).
 */
const fs = require('fs');
const path = require('path');
const { isAdmin } = require('../lib/admin-token-verify');
const { verifyToken } = require('../lib/auth-oauth');

function sessionUser(req) {
  const h = String((req.headers && (req.headers.authorization || req.headers.Authorization)) || '');
  const tok = h.toLowerCase().startsWith('bearer ') ? h.slice(7).trim() : '';
  return verifyToken(tok);
}

const FILE = process.env.ELISEE_MANAGER_FILE
  || (process.env.VERCEL ? '/tmp/elisee-manager.json' : path.join(process.cwd(), 'data', 'manager', 'state.json'));

const ALLOWED = ['name', 'city', 'stadium', 'capacity', 'logo', 'year', 'stadiumImage'];

function now() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}
function uid() {
  return now().slice(0, 10).replace(/-/g, '') + '-' + Math.random().toString(16).slice(2, 10);
}
const KV_STATE_KEY = 'elisee:manager:state';

function normalizeState(st) {
  const s = st && typeof st === 'object' ? st : {};
  if (!s.applications) s.applications = [];
  if (!s.proposals) s.proposals = [];
  if (!s.managers) s.managers = [];
  if (!s.lineups) s.lineups = [];
  if (!s.officialLineups) s.officialLineups = {};
  return s;
}

function loadFile() {
  try {
    return normalizeState(JSON.parse(fs.readFileSync(FILE, 'utf8')));
  } catch (e) {
    return normalizeState({});
  }
}

async function load() {
  const kv = await getKv();
  if (kv) {
    try {
      const v = await kv.get(KV_STATE_KEY);
      if (v && typeof v === 'object') return normalizeState(v);
    } catch (e) {}
  }
  return loadFile();
}

async function save(st) {
  const kv = await getKv();
  if (kv) {
    try { await kv.set(KV_STATE_KEY, st); } catch (e) {}
  }
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(st, null, 2));
  } catch (e) {}
}
// isAdmin importato da lib/admin-token-verify — verifica token HMAC-SHA256 firmato
function send(res, code, body) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Token');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.end(JSON.stringify(body));
}
function readBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (c) => { raw += c; if (raw.length > 1e6) req.destroy(); });
    req.on('end', () => {
      try { resolve(JSON.parse(raw || '{}')); } catch (e) { resolve({}); }
    });
  });
}

const BACHECA_FILE = process.env.ELISEE_BACHECA_FILE
  || (process.env.VERCEL ? '/tmp/elisee-bacheca.json' : path.join(process.cwd(), 'data', 'bacheca', 'annunci.json'));
const BACHECA_CATS = [
  'cerco_squadra', 'cerco_giocatore', 'cerco_allenatore',
  'cerco_arbitro', 'cerco_amichevole', 'cerco_sponsor', 'calciomercato'
];
const BACHECA_REQ = {
  cerco_squadra: ['ruolo_campo', 'eta', 'categoria_attuale', 'disponibilita'],
  cerco_giocatore: ['ruolo_cercato', 'categoria_club'],
  cerco_allenatore: ['categoria_squadra', 'livello', 'qualifica_richiesta'],
  cerco_arbitro: ['livello_gare'],
  cerco_amichevole: ['categoria_squadra', 'periodo_disponibile'],
  cerco_sponsor: ['tipo_sponsorizzazione', 'club_categoria'],
  calciomercato: ['tipo_operazione', 'ruolo', 'categoria_squadra']
};

async function getKv() {
  if (!process.env.KV_REST_API_URL && process.env.UPSTASH_REDIS_REST_URL) {
    process.env.KV_REST_API_URL = process.env.UPSTASH_REDIS_REST_URL;
  }
  if (!process.env.KV_REST_API_TOKEN && process.env.UPSTASH_REDIS_REST_TOKEN) {
    process.env.KV_REST_API_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
  }
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) return null;
  try {
    const mod = await import('@vercel/kv');
    return mod.kv;
  } catch (e) {
    return null;
  }
}

function bachecaLoadFile() {
  try {
    const st = JSON.parse(fs.readFileSync(BACHECA_FILE, 'utf8'));
    if (Array.isArray(st)) return st;
    if (st && Array.isArray(st.items)) return st.items;
  } catch (e) {}
  return [];
}
async function bachecaLoad() {
  const kv = await getKv();
  if (kv) {
    try {
      const v = await kv.get('elisee:bacheca:annunci');
      if (Array.isArray(v)) return v;
      if (v && Array.isArray(v.items)) return v.items;
    } catch (e) {}
  }
  return bachecaLoadFile();
}
async function bachecaSave(items) {
  const slice = (items || []).slice(0, 400);
  const kv = await getKv();
  if (kv) {
    try { await kv.set('elisee:bacheca:annunci', slice); } catch (e) {}
  }
  try {
    fs.mkdirSync(path.dirname(BACHECA_FILE), { recursive: true });
    fs.writeFileSync(BACHECA_FILE, JSON.stringify({ items: slice }, null, 2));
  } catch (e) {}
}

const SCHEDE_FILE = process.env.ELISEE_SCHEDE_FILE
  || (process.env.VERCEL ? '/tmp/elisee-schede.json' : path.join(process.cwd(), 'data', 'bacheca', 'schede.json'));

function schedeLoadFile() {
  try {
    const st = JSON.parse(fs.readFileSync(SCHEDE_FILE, 'utf8'));
    if (st && typeof st === 'object' && !Array.isArray(st)) {
      return st.map ? st : (st.jobs || st);
    }
  } catch (e) {}
  return {};
}
async function schedeLoad() {
  const kv = await getKv();
  if (kv) {
    try {
      const v = await kv.get('elisee:schede:jobs');
      if (v && typeof v === 'object' && !Array.isArray(v)) return v;
    } catch (e) {}
  }
  return schedeLoadFile();
}
async function schedeSave(map) {
  const clean = map && typeof map === 'object' ? map : {};
  const kv = await getKv();
  if (kv) {
    try { await kv.set('elisee:schede:jobs', clean); } catch (e) {}
  }
  try {
    fs.mkdirSync(path.dirname(SCHEDE_FILE), { recursive: true });
    fs.writeFileSync(SCHEDE_FILE, JSON.stringify(clean));
  } catch (e) {}
}

const KV_DOC_NAMES = {
  'scout-alerts': true,
  'coach-rosa': true,
  'club-master': true,
  'card-atelier': true,
  'gdpr-queue': true,
  'ambassador-apps': true
};
function kvFile(name) {
  if (!Object.prototype.hasOwnProperty.call(KV_DOC_NAMES, name)) return null;
  return process.env.VERCEL
    ? '/tmp/elisee-' + name + '.json'
    : path.join(process.cwd(), 'data', 'club', name + '.json');
}
async function kvDocLoad(name, fallback) {
  const file = kvFile(name);
  if (!file) return fallback;
  const kv = await getKv();
  if (kv) {
    try {
      const v = await kv.get('elisee:' + name);
      if (v && typeof v === 'object') return v;
    } catch (e) {}
  }
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {}
  return fallback;
}
async function kvDocSave(name, data) {
  const file = kvFile(name);
  if (!file) return;
  const kv = await getKv();
  if (kv) {
    try { await kv.set('elisee:' + name, data); } catch (e) {}
  }
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(data));
  } catch (e) {}
}
function stripHeavyPng(map) {
  const out = {};
  Object.keys(map || {}).forEach(function (k) {
    const row = Object.assign({}, map[k] || {});
    ['originalPng', 'draftPng', 'facePng'].forEach(function (f) {
      const v = row[f];
      if (typeof v === 'string' && v.indexOf('data:') === 0 && v.length > 48000) {
        if (row[f + 'Url'] && String(row[f + 'Url']).indexOf('http') === 0) row[f] = row[f + 'Url'];
        else delete row[f];
      }
    });
    out[k] = row;
  });
  return out;
}
function bachecaStr(v, max) {
  return String(v == null ? '' : v).trim().slice(0, max || 240);
}
function bachecaQuery(raw) {
  return String(raw == null ? '' : raw)
    .slice(0, 120)
    .replace(/[\x00-\x1f\x7f]/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
function bachecaValidate(b) {
  const errors = [];
  const cat = bachecaStr(b.categoria, 40);
  if (BACHECA_CATS.indexOf(cat) < 0) errors.push('categoria');
  if (!bachecaStr(b.titolo, 160) && !bachecaStr(b.title, 160)) errors.push('titolo');
  if (!bachecaStr(b.descrizione, 2000) && !bachecaStr(b.desc, 2000)) errors.push('descrizione');
  if (!bachecaStr(b.zona_citta, 80) && !bachecaStr(b.zona, 80) && !bachecaStr(b.location, 80)) errors.push('zona_citta');
  (BACHECA_REQ[cat] || []).forEach((k) => {
    const v = b[k];
    if (v === true || v === false || v === 0) return;
    if (!bachecaStr(v, 240)) errors.push(k);
  });
  if (cat === 'cerco_squadra') {
    const eta = Number(b.eta);
    if (!Number.isFinite(eta) || eta < 14 || eta > 55) errors.push('eta');
    if (['tesserato', 'svincolato'].indexOf(bachecaStr(b.disponibilita, 20)) < 0) errors.push('disponibilita');
  }
  if (cat === 'cerco_sponsor' && ['maglia', 'cartellonistica', 'eventi', 'altro'].indexOf(bachecaStr(b.tipo_sponsorizzazione, 40)) < 0) {
    errors.push('tipo_sponsorizzazione');
  }
  if (cat === 'calciomercato' && ['cessione', 'prestito', 'svincolo'].indexOf(bachecaStr(b.tipo_operazione, 40)) < 0) {
    errors.push('tipo_operazione');
  }
  return errors;
}
function bachecaItem(b) {
  const now = new Date().toISOString();
  return {
    id: bachecaStr(b.id, 80) || ('ann-' + Date.now()),
    categoria: bachecaStr(b.categoria, 40),
    titolo: bachecaStr(b.titolo || b.title, 160),
    descrizione: bachecaStr(b.descrizione || b.desc, 2000),
    autore_id: bachecaStr(b.autore_id, 80),
    societa: bachecaStr(b.societa || b.club, 120),
    zona_citta: bachecaStr(b.zona_citta || b.zona || b.location, 80),
    zona_provincia: bachecaStr(b.zona_provincia, 80),
    zona_regione: bachecaStr(b.zona_regione, 80),
    data_creazione: bachecaStr(b.data_creazione, 40) || now,
    data_scadenza: bachecaStr(b.data_scadenza, 40) || '',
    stato: ['attivo', 'chiuso', 'scaduto'].indexOf(bachecaStr(b.stato, 20)) >= 0 ? bachecaStr(b.stato, 20) : 'attivo',
    ruolo_campo: bachecaStr(b.ruolo_campo, 80),
    eta: b.eta === '' || b.eta == null ? '' : Number(b.eta),
    categoria_attuale: bachecaStr(b.categoria_attuale, 80),
    disponibilita: bachecaStr(b.disponibilita, 20),
    ruolo_cercato: bachecaStr(b.ruolo_cercato, 80),
    categoria_club: bachecaStr(b.categoria_club, 80),
    eta_min: b.eta_min === '' || b.eta_min == null ? '' : Number(b.eta_min),
    eta_max: b.eta_max === '' || b.eta_max == null ? '' : Number(b.eta_max),
    esperienza_richiesta: bachecaStr(b.esperienza_richiesta, 240),
    categoria_squadra: bachecaStr(b.categoria_squadra, 80),
    livello: bachecaStr(b.livello, 80),
    qualifica_richiesta: bachecaStr(b.qualifica_richiesta, 80),
    livello_gare: bachecaStr(b.livello_gare, 80),
    data_gara: bachecaStr(b.data_gara, 40),
    ricorrente: !!b.ricorrente,
    rimborso_spese: !!b.rimborso_spese,
    periodo_disponibile: bachecaStr(b.periodo_disponibile, 120),
    campo_disponibile: !!b.campo_disponibile,
    tipo_sponsorizzazione: bachecaStr(b.tipo_sponsorizzazione, 40),
    club_categoria: bachecaStr(b.club_categoria, 80),
    budget_fascia: bachecaStr(b.budget_fascia, 80),
    tipo_operazione: bachecaStr(b.tipo_operazione, 40),
    ruolo: bachecaStr(b.ruolo || b.ruolo_cercato || b.ruolo_campo, 80),
    condizioni: bachecaStr(b.condizioni, 400),
    ai: b.ai !== false
  };
}

function computeRelevanceScore(item, q) {
  let score = 0;
  const tit = String(item.titolo || item.title || '').toLowerCase();
  const soc = String(item.societa || item.club || '').toLowerCase();
  const r = String(item.ruolo || item.ruolo_campo || item.ruolo_cercato || '').toLowerCase();
  const loc = String(item.zona_citta || item.location || item.zona || '').toLowerCase();
  const desc = String(item.descrizione || item.desc || '').toLowerCase();

  if (tit === q || soc === q) score += 100;
  else if (tit.startsWith(q) || soc.startsWith(q)) score += 60;
  else if (tit.includes(q) || soc.includes(q)) score += 40;

  if (r.includes(q)) score += 30;
  if (loc.includes(q)) score += 25;
  if (desc.includes(q)) score += 15;
  return score;
}

function bachecaSearch(items, params) {
  const q = bachecaQuery(params.get('q')).toLowerCase();
  const cat = String(params.get('categoria') || params.get('cat') || '').trim();
  const role = String(params.get('ruolo') || params.get('role') || '').trim().toLowerCase();
  const loc = String(params.get('location') || params.get('zona') || params.get('citta') || '').trim().toLowerCase();
  const isUnder = params.get('under') === 'true' || params.get('under') === '1';
  const isHousing = params.get('housing') === 'true' || params.get('housing') === '1';
  const isSvincolato = params.get('svincolato') === 'true' || params.get('svincolato') === '1';
  const limit = Math.min(200, Math.max(1, parseInt(params.get('limit') || '100', 10) || 100));
  const offset = Math.max(0, parseInt(params.get('offset') || '0', 10) || 0);

  let filtered = (items || []).filter((item) => {
    if (!item) return false;
    if (item.stato && item.stato !== 'attivo') return false;

    if (cat && cat !== 'all' && item.categoria !== cat) return false;

    if (role && role !== 'all') {
      const rBlob = [item.ruolo, item.ruolo_campo, item.ruolo_cercato, item.role].filter(Boolean).join(' ').toLowerCase();
      if (!rBlob.includes(role)) return false;
    }

    if (loc && loc !== 'all') {
      const lBlob = [item.zona_citta, item.zona_provincia, item.zona_regione, item.zona, item.location].filter(Boolean).join(' ').toLowerCase();
      if (!lBlob.includes(loc)) return false;
    }

    if (isUnder && !item.under && (Number(item.eta) > 20 || Number(item.eta_max) > 20)) return false;
    if (isHousing && !item.housing && !(item.benefit && /vitto|alloggio/i.test(item.benefit))) return false;
    if (isSvincolato && !item.svincolato && item.disponibilita !== 'svincolato' && item.tipo_operazione !== 'svincolo') return false;

    if (q) {
      const searchBlob = [
        item.titolo, item.title,
        item.societa, item.club,
        item.ruolo, item.ruolo_campo, item.ruolo_cercato, item.role,
        item.zona_citta, item.zona_provincia, item.zona_regione, item.location, item.zona,
        item.categoria, item.categoria_club, item.categoria_squadra, item.categoria_attuale,
        item.descrizione, item.desc, item.condizioni, item.qualifica_richiesta
      ].filter(Boolean).join(' ').toLowerCase();

      const words = q.split(/\s+/).filter(Boolean);
      for (const w of words) {
        if (!searchBlob.includes(w)) return false;
      }
    }
    return true;
  });

  if (q) {
    filtered.sort((a, b) => {
      const sA = computeRelevanceScore(a, q);
      const sB = computeRelevanceScore(b, q);
      if (sB !== sA) return sB - sA;
      const tA = Date.parse(a.data_creazione || a.createdAt || '') || 0;
      const tB = Date.parse(b.data_creazione || b.createdAt || '') || 0;
      return tB - tA;
    });
  } else {
    filtered.sort((a, b) => {
      const tA = Date.parse(a.data_creazione || a.createdAt || '') || 0;
      const tB = Date.parse(b.data_creazione || b.createdAt || '') || 0;
      return tB - tA;
    });
  }

  const total = filtered.length;
  const paged = filtered.slice(offset, offset + limit);
  return { total, items: paged, limit, offset };
}

async function searchGlobal(params) {
  const q = String(params.get('q') || '').trim().toLowerCase();
  const type = String(params.get('type') || 'all').toLowerCase();
  const limit = Math.min(60, Math.max(1, parseInt(params.get('limit') || '20', 10) || 20));

  const results = {
    annunci: [],
    clubs: [],
    players: []
  };

  if (type === 'all' || type === 'annunci') {
    const allAnnunci = await bachecaLoad();
    const searchRes = bachecaSearch(allAnnunci, params);
    results.annunci = searchRes.items.slice(0, limit);
  }

  if ((type === 'all' || type === 'clubs') && q) {
    try {
      const catPath = path.join(process.cwd(), 'data', 'squadre', 'catalog.json');
      if (fs.existsSync(catPath)) {
        const catData = JSON.parse(fs.readFileSync(catPath, 'utf8'));
        const teams = Array.isArray(catData) ? catData : (catData.teams || catData.squadre || []);
        results.clubs = teams
          .filter((t) => {
            if (!t) return false;
            const name = String(t.name || t.nome || '').toLowerCase();
            const city = String(t.city || t.citta || '').toLowerCase();
            return name.includes(q) || city.includes(q);
          })
          .slice(0, limit)
          .map((t) => ({
            id: t.id || t.slug || t.name,
            name: t.name || t.nome,
            category: t.category || t.campionato || '',
            city: t.city || t.citta || '',
            logo: t.logo || ''
          }));
      }
    } catch (_) {}
  }

  // I giocatori non si cercano nell'anagrafica account (email, hash, data di nascita).

  return {
    ok: true,
    q,
    type,
    results,
    counts: {
      annunci: results.annunci.length,
      clubs: results.clubs.length,
      players: results.players.length,
      total: results.annunci.length + results.clubs.length + results.players.length
    }
  };
}

function scoutClip(v, max) {
  return String(v == null ? '' : v).replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, max || 80);
}

function scoutValidate(body) {
  const q = body && typeof body === 'object' ? body : {};
  const out = {
    q: scoutClip(q.q, 120),
    ruolo: scoutClip(q.ruolo, 40).toLowerCase(),
    zona: scoutClip(q.zona, 80),
    piede: scoutClip(q.piede, 20).toLowerCase(),
    passaporto: scoutClip(q.passaporto, 40),
    tratti: scoutClip(q.tratti, 120),
    source: scoutClip(q.source, 24) || 'bacheca',
    under: q.under === true,
    housing: q.housing === true,
    svincolato: q.svincolato === true,
    etaMin: null,
    etaMax: null
  };
  if (out.piede && ['destro', 'sinistro', 'ambidestro'].indexOf(out.piede) < 0) out.piede = '';
  ['etaMin', 'etaMax'].forEach(function (key) {
    if (q[key] == null || q[key] === '') return;
    const n = Number(q[key]);
    if (!Number.isInteger(n) || n < 14 || n > 45) out._bad = out._bad || key;
    else out[key] = n;
  });
  if (out.etaMin != null && out.etaMax != null && out.etaMin > out.etaMax) out._bad = 'eta';
  const hasSignal = out.q.length >= 2 || out.ruolo || out.zona || out.piede || out.passaporto || out.tratti || out.etaMin != null || out.etaMax != null || out.under || out.housing || out.svincolato;
  if (!hasSignal) out._bad = out._bad || 'vuoto';
  return out;
}

function scoutPublic(item) {
  return {
    id: scoutClip(item.id, 80),
    title: scoutClip(item.titolo || item.title || item.ruolo || 'Annuncio', 160),
    role: scoutClip(item.ruolo || item.ruolo_campo || item.ruolo_cercato || item.role || '', 80),
    zone: scoutClip(item.zona_citta || item.zona || item.location || '', 80),
    category: scoutClip(item.categoria || item.category || '', 40),
    club: scoutClip(item.societa || item.club || '', 120)
  };
}

function scoutScore(item, q) {
  if (!item || (item.stato && item.stato !== 'attivo')) return null;
  const roleBlob = [item.ruolo, item.ruolo_campo, item.ruolo_cercato, item.role, item.titolo, item.title].filter(Boolean).join(' ').toLowerCase();
  const text = [
    item.titolo, item.title, item.descrizione, item.desc, item.zona_citta, item.zona, item.location,
    item.categoria, item.category, item.disponibilita, item.condizioni, item.societa, item.club
  ].filter(Boolean).join(' ').toLowerCase();
  let score = 0;
  const reasons = [];
  if (q.ruolo) {
    if (roleBlob.indexOf(q.ruolo) < 0 && text.indexOf(q.ruolo) < 0) return null;
    score += 40;
    reasons.push('ruolo');
  }
  if (q.zona) {
    if (text.indexOf(q.zona.toLowerCase()) < 0) return null;
    score += 16;
    reasons.push('zona');
  }
  if (q.piede) {
    var statedOther = q.piede === 'destro' ? 'sinistro' : (q.piede === 'sinistro' ? 'destro' : '');
    if (text.indexOf(q.piede) >= 0) {
      score += 12;
      reasons.push('piede');
    } else if (statedOther && text.indexOf(statedOther) >= 0) {
      return null;
    } else if (q.piede === 'ambidestro' && text.indexOf('ambidestro') < 0 && (text.indexOf('destro') >= 0 || text.indexOf('sinistro') >= 0)) {
      return null;
    }
  }
  if (q.passaporto && text.indexOf(q.passaporto.toLowerCase()) >= 0) {
    score += 10;
    reasons.push('passaporto');
  }
  if (q.tratti) {
    q.tratti.toLowerCase().split(/[^a-z0-9àèéìòù]+/i).filter(function (w) { return w.length > 2; }).forEach(function (w) {
      if (text.indexOf(w) >= 0) { score += 8; reasons.push('tratto'); }
    });
  }
  if (q.under) {
    if (!item.under && !(Number(item.eta) > 0 && Number(item.eta) <= 20)) return null;
    score += 8;
    reasons.push('under');
  }
  if (q.housing && (item.housing || (item.benefit && /vitto|alloggio/i.test(item.benefit)))) {
    score += 6;
    reasons.push('alloggio');
  }
  if (q.svincolato && (item.svincolato || item.disponibilita === 'svincolato' || item.tipo_operazione === 'svincolo')) {
    score += 6;
    reasons.push('svincolato');
  }
  if (q.etaMin != null || q.etaMax != null) {
    const lo = q.etaMin == null ? 14 : q.etaMin;
    const hi = q.etaMax == null ? 45 : q.etaMax;
    const eta = Number(item.eta);
    if (Number.isFinite(eta) && eta > 0) {
      if (eta < lo || eta > hi) return null;
      score += 18;
      reasons.push('eta');
    }
  }
  if (q.q) {
    const words = q.q.toLowerCase().split(/\s+/).filter(function (w) { return w.length > 1; });
    let hit = 0;
    words.forEach(function (w) { if (text.indexOf(w) >= 0 || roleBlob.indexOf(w) >= 0) hit += 1; });
    if (words.length && hit === 0) return null;
    score += hit * 14;
    if (hit) reasons.push('testo');
  }
  if (score < 12) return null;
  const row = scoutPublic(item);
  row.score = Math.min(98, score);
  row.reasons = reasons.filter(function (r, i) { return reasons.indexOf(r) === i; });
  return row;
}

async function scoutRun(body) {
  const query = scoutValidate(body || {});
  if (query._bad) {
    return { statusCode: 400, body: { ok: false, error: 'validazione', field: query._bad, steps: ['trigger', 'validate'] } };
  }
  let items = [];
  let fallback = false;
  try {
    items = await bachecaLoad();
  } catch (e) {
    fallback = true;
    items = [];
  }
  let profiles = [];
  try {
    profiles = (items || []).map(function (item) { return scoutScore(item, query); }).filter(Boolean);
    profiles.sort(function (a, b) { return b.score - a.score; });
    profiles = profiles.slice(0, 5);
  } catch (e) {
    fallback = true;
    profiles = [];
  }
  const clientMatches = Math.max(0, Math.min(50, parseInt(body && body.clientMatches, 10) || 0));
  let alert = null;
  if (!profiles.length && !clientMatches && !fallback) {
    try {
      const doc = await kvDocLoad('scout-alerts', { items: [] });
      const itemsAlert = Array.isArray(doc.items) ? doc.items : [];
      alert = {
        id: 'al-' + Date.now().toString(36),
        createdAt: new Date().toISOString(),
        status: 'aperto',
        source: query.source,
        ruolo: query.ruolo,
        zona: query.zona,
        q: query.q.slice(0, 80)
      };
      itemsAlert.unshift(alert);
      doc.items = itemsAlert.slice(0, 80);
      doc.updatedAt = alert.createdAt;
      await kvDocSave('scout-alerts', doc);
    } catch (e) {
      fallback = true;
    }
  }
  const status = profiles.length || clientMatches ? 'match' : (fallback ? 'fallback' : 'alert');
  return {
    statusCode: 200,
    body: {
      ok: true,
      status: status,
      fallback: fallback,
      steps: ['trigger', 'validate', 'query', 'decision', 'report', 'deliver'],
      query: { ruolo: query.ruolo, zona: query.zona, piede: query.piede, etaMin: query.etaMin, etaMax: query.etaMax },
      profiles: profiles,
      alert: alert,
      delivery: 'piattaforma'
    }
  };
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    send(res, 204, {});
    return;
  }
  const url = new URL(req.url, 'http://localhost');
  const pathParam = url.searchParams.get('path');

  if (pathParam === 'scout') {
    if (req.method === 'GET') {
      try {
        const doc = await kvDocLoad('scout-alerts', { items: [] });
        const n = Array.isArray(doc.items) ? doc.items.length : 0;
        return send(res, 200, { ok: true, alerts: n });
      } catch (e) {
        return send(res, 200, { ok: true, alerts: 0, fallback: true });
      }
    }
    if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'method' });
    const body = await readBody(req);
    const out = await scoutRun(body);
    return send(res, out.statusCode, out.body);
  }

  if (pathParam === 'search') {
    const searchGateway = require('../lib/search-gateway');
    return searchGateway(req, res);
  }

  if (pathParam === 'bacheca') {
    if (req.method === 'GET') {
      const all = await bachecaLoad();
      const resData = bachecaSearch(all, url.searchParams);
      return send(res, 200, {
        ok: true,
        query: bachecaQuery(url.searchParams.get('q')),
        total: resData.total,
        items: resData.items,
        limit: resData.limit,
        offset: resData.offset,
        categorie: BACHECA_CATS
      });
    }
    if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'method' });
    const session = sessionUser(req);
    if (!session || !session.email) {
      return send(res, 401, { ok: false, error: 'login_richiesto' });
    }
    const body = await readBody(req);
    const errors = bachecaValidate(body);
    if (errors.length) return send(res, 400, { ok: false, error: 'validazione', fields: errors });
    const item = bachecaItem(body);
    item.autore_id = String(session.email || session.id || '').slice(0, 80);
    const items = await bachecaLoad();
    const next = items.filter((x) => x && x.id !== item.id);
    next.unshift(item);
    await bachecaSave(next);
    return send(res, 200, { ok: true, item: item });
  }
  if (url.searchParams.get('path') === 'schede') {
    if (req.method === 'GET') {
      return send(res, 200, { ok: true, jobs: await schedeLoad() });
    }
    if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'method' });
    const body = await readBody(req);
    const current = await schedeLoad();
    if (body && body.jobs && typeof body.jobs === 'object') {
      await schedeSave(body.jobs);
      return send(res, 200, { ok: true, jobs: body.jobs });
    }
    if (body && body.job && body.job.id) {
      current[body.job.id] = body.job;
      await schedeSave(current);
      return send(res, 200, { ok: true, job: body.job });
    }
    return send(res, 400, { ok: false, error: 'payload' });
  }
  if (url.searchParams.get('path') === 'club' || url.searchParams.get('path') === 'coach') {
    const kind = url.searchParams.get('path') === 'coach' ? 'coach-rosa' : 'club-master';
    const map = await kvDocLoad(kind, {});
    const key = String(url.searchParams.get('key') || (req.method === 'POST' ? '' : '') || '').slice(0, 160);
    if (req.method === 'GET') {
      const k = key;
      if (k) {
        const row = map[k] || null;
        return send(res, 200, { ok: true, key: k, data: row && row.data ? row.data : null, updatedAt: row && row.updatedAt });
      }
      return send(res, 200, { ok: true, map: map });
    }
    if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'method' });
    const body = await readBody(req);
    const k = String(body.key || key || '').trim().slice(0, 160);
    if (!k || !body.data || typeof body.data !== 'object') return send(res, 400, { ok: false, error: 'payload' });
    map[k] = { updatedAt: new Date().toISOString(), data: body.data };
    await kvDocSave(kind, map);
    return send(res, 200, { ok: true, key: k, updatedAt: map[k].updatedAt });
  }
  if (url.searchParams.get('path') === 'card') {
    const doc = await kvDocLoad('card-atelier', { inbox: {}, published: {}, stats: {} });
    if (req.method === 'GET') {
      return send(res, 200, { ok: true, inbox: doc.inbox || {}, published: doc.published || {}, stats: doc.stats || {} });
    }
    if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'method' });
    const body = await readBody(req);
    if (body.inbox && typeof body.inbox === 'object') doc.inbox = Object.assign({}, doc.inbox || {}, stripHeavyPng(body.inbox));
    if (body.published && typeof body.published === 'object') doc.published = Object.assign({}, doc.published || {}, stripHeavyPng(body.published));
    if (body.stats && typeof body.stats === 'object') doc.stats = Object.assign({}, doc.stats || {}, body.stats);
    doc.updatedAt = new Date().toISOString();
    await kvDocSave('card-atelier', doc);
    return send(res, 200, { ok: true, updatedAt: doc.updatedAt });
  }
  if (url.searchParams.get('path') === 'gdpr' || url.searchParams.get('path') === 'ambassador') {
    const name = url.searchParams.get('path') === 'gdpr' ? 'gdpr-queue' : 'ambassador-apps';
    const doc = await kvDocLoad(name, { items: [], requests: [] });
    if (req.method === 'GET') {
      return send(res, 200, {
        ok: true,
        items: Array.isArray(doc.items) ? doc.items : [],
        requests: Array.isArray(doc.requests) ? doc.requests : [],
        updatedAt: doc.updatedAt || ''
      });
    }
    if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'method' });
    const body = await readBody(req);
    if (Array.isArray(body.items)) {
      doc.items = body.items.slice(0, 400).map(function (it) {
        const o = Object.assign({}, it || {});
        if (typeof o.signatureDataUrl === 'string' && o.signatureDataUrl.indexOf('data:') === 0 && o.signatureDataUrl.length > 48000) {
          o.signatureDataUrl = o.signatureUrl || '';
        }
        if (typeof o.contractHtml === 'string' && o.contractHtml.length > 24000) {
          o.contractHtml = o.contractHtml.slice(0, 24000);
        }
        return o;
      });
    }
    if (Array.isArray(body.requests)) doc.requests = body.requests.slice(0, 400);
    doc.updatedAt = new Date().toISOString();
    await kvDocSave(name, doc);
    return send(res, 200, { ok: true, updatedAt: doc.updatedAt });
  }
  const st = await load();
  if (req.method === 'GET') {
    const view = url.searchParams.get('view') || 'me';
    if (view === 'admin') {
      if (!isAdmin(req)) return send(res, 401, { ok: false, error: 'admin_richiesto' });
      const pendingA = st.applications.filter((a) => a.status === 'pending').length;
      const pendingP = st.proposals.filter((p) => p.status === 'pending').length;
      const pendingL = (st.lineups || []).filter((p) => p.status === 'pending').length;
      return send(res, 200, {
        ok: true,
        counts: { applicationsPending: pendingA, proposalsPending: pendingP, lineupsPending: pendingL, managers: st.managers.length },
        applications: st.applications,
        proposals: st.proposals,
        lineups: st.lineups || [],
        managers: st.managers
      });
    }
    if (view === 'official') {
      const teamId = String(url.searchParams.get('teamId') || '');
      const official = (st.officialLineups || {})[teamId] || null;
      return send(res, 200, { ok: true, official: official });
    }
    const email = String(url.searchParams.get('email') || '').toLowerCase();
    const mine = (row) => email && String(row.email || '').toLowerCase() === email;
    return send(res, 200, {
      ok: true,
      applications: st.applications.filter(mine),
      proposals: st.proposals.filter(mine),
      lineups: (st.lineups || []).filter(mine),
      teams: st.managers.filter(mine).map((m) => ({ teamId: m.teamId, teamName: m.teamName, league: m.league || '' }))
    });
  }
  if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'method' });
  const body = await readBody(req);
  const action = String(body.action || '');
  const email = String(body.email || '').trim().toLowerCase();
  const name = String(body.name || '').trim();
  if (action === 'apply') {
    if (!body.teamId || !body.teamName) return send(res, 400, { ok: false, error: 'squadra_mancante' });
    if (!email || !name) return send(res, 400, { ok: false, error: 'nome_email_obbligatori' });
    if (String(body.motivation || '').trim().length < 12) return send(res, 400, { ok: false, error: 'motivazione_troppo_corta' });
    const row = {
      id: uid(),
      teamId: body.teamId,
      teamName: body.teamName,
      league: body.league || '',
      name, email,
      phone: body.phone || '',
      roleAtClub: body.roleAtClub || 'Dirigente / collaboratore',
      motivation: String(body.motivation || '').trim(),
      status: 'pending',
      createdAt: now()
    };
    st.applications.unshift(row);
    await save(st);
    return send(res, 200, { ok: true, application: row });
  }
  if (action === 'propose') {
    const okMgr = st.managers.some((m) => m.teamId === body.teamId && String(m.email || '').toLowerCase() === email);
    if (!okMgr) return send(res, 403, { ok: false, error: 'non_sei_manager' });
    const changes = {};
    const raw = body.changes || {};
    ALLOWED.forEach((k) => {
      if (raw[k] == null) return;
      const t = String(raw[k]).trim();
      if (t) changes[k] = k === 'capacity' ? parseInt(t.replace(/[^\d]/g, ''), 10) : t;
    });
    if (!Object.keys(changes).length) return send(res, 400, { ok: false, error: 'nessuna_modifica' });
    const row = {
      id: uid(),
      teamId: body.teamId,
      teamName: body.teamName || body.teamId,
      league: body.league || '',
      name, email,
      changes, note: body.note || '',
      status: 'pending',
      createdAt: now(),
      applied: false
    };
    st.proposals.unshift(row);
    await save(st);
    return send(res, 200, { ok: true, proposal: row });
  }
  if (action === 'propose-lineup') {
    if (!body.teamId || !body.module) return send(res, 400, { ok: false, error: 'squadra_o_modulo_mancante' });
    if (!email && !name) return send(res, 400, { ok: false, error: 'nome_email_obbligatori' });
    const pendingDup = (st.lineups || []).some((r) =>
      r.status === 'pending' &&
      r.teamId === body.teamId &&
      email && String(r.email || '').toLowerCase() === email
    );
    if (pendingDup) return send(res, 409, { ok: false, error: 'proposta_formazione_gia_inviata' });
    const row = {
      id: uid(),
      teamId: body.teamId,
      teamName: body.teamName || body.teamId,
      league: body.league || '',
      name, email,
      module: String(body.module || ''),
      previousModule: String(body.previousModule || ''),
      slots: body.slots && typeof body.slots === 'object' ? body.slots : {},
      note: body.note || '',
      status: 'pending',
      createdAt: now(),
      applied: false
    };
    st.lineups.unshift(row);
    await save(st);
    return send(res, 200, { ok: true, lineup: row });
  }
  if (action === 'decide') {
    if (!isAdmin(req)) return send(res, 401, { ok: false, error: 'admin_richiesto' });
    const bucket = body.kind === 'application' ? st.applications
      : (body.kind === 'lineup' ? st.lineups : st.proposals);
    const row = bucket.find((r) => r.id === body.id);
    if (!row) return send(res, 404, { ok: false, error: 'non_trovata' });
    row.status = body.accept ? 'accepted' : 'declined';
    row.decidedAt = now();
    row.adminComment = body.comment || '';
    if (body.accept && body.kind === 'application') {
      st.managers.push({
        teamId: row.teamId, teamName: row.teamName, league: row.league || '',
        email: row.email, name: row.name, since: now()
      });
    }
    if (body.accept && body.kind === 'lineup') {
      if (!st.officialLineups) st.officialLineups = {};
      st.officialLineups[row.teamId] = {
        teamId: row.teamId,
        teamName: row.teamName,
        module: row.module,
        slots: row.slots || {},
        updatedAt: now(),
        proposalId: row.id
      };
      row.applied = true;
    }
    await save(st);
    return send(res, 200, { ok: true, item: row, applied: !!row.applied });
  }
  return send(res, 400, { ok: false, error: 'azione_sconosciuta' });
};
