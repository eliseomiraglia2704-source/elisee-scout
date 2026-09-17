/**
 * GET  /api/bacheca          lista annunci
 * POST /api/bacheca          crea annuncio (validazione server)
 *
 * Persistenza: file locale data/bacheca/annunci.json, /tmp su Vercel.
 */
const fs = require('fs');
const path = require('path');

const FILE = process.env.ELISEE_BACHECA_FILE
  || (process.env.VERCEL ? '/tmp/elisee-bacheca.json' : path.join(process.cwd(), 'data', 'bacheca', 'annunci.json'));

const CATEGORIE = [
  'cerco_squadra', 'cerco_giocatore', 'cerco_allenatore',
  'cerco_arbitro', 'cerco_amichevole', 'cerco_sponsor', 'calciomercato'
];

const REQUIRED_BY_CAT = {
  cerco_squadra: ['ruolo_campo', 'eta', 'categoria_attuale', 'disponibilita'],
  cerco_giocatore: ['ruolo_cercato', 'categoria_club'],
  cerco_allenatore: ['categoria_squadra', 'livello', 'qualifica_richiesta'],
  cerco_arbitro: ['livello_gare'],
  cerco_amichevole: ['categoria_squadra', 'periodo_disponibile'],
  cerco_sponsor: ['tipo_sponsorizzazione', 'club_categoria'],
  calciomercato: ['tipo_operazione', 'ruolo', 'categoria_squadra']
};

function send(res, code, body) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise(function (resolve) {
    if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
      resolve(req.body);
      return;
    }
    if (typeof req.body === 'string') {
      try { resolve(JSON.parse(req.body || '{}')); } catch (e) { resolve({}); }
      return;
    }
    var raw = '';
    req.on('data', function (c) { raw += c; if (raw.length > 5e5) req.destroy(); });
    req.on('end', function () {
      try { resolve(JSON.parse(raw || '{}')); } catch (e) { resolve({}); }
    });
  });
}

function load() {
  try {
    var st = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    if (Array.isArray(st)) return st;
    if (st && Array.isArray(st.items)) return st.items;
  } catch (e) {}
  return [];
}

function save(items) {
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify({ items: items.slice(0, 400) }, null, 2));
  } catch (e) {}
}

function str(v, max) {
  return String(v == null ? '' : v).trim().slice(0, max || 240);
}

function validate(b) {
  var errors = [];
  var cat = str(b.categoria, 40);
  if (CATEGORIE.indexOf(cat) < 0) errors.push('categoria');
  if (!str(b.titolo, 160)) errors.push('titolo');
  if (!str(b.descrizione, 2000) && !str(b.desc, 2000)) errors.push('descrizione');
  if (!str(b.zona_citta, 80) && !str(b.zona, 80) && !str(b.location, 80)) errors.push('zona_citta');
  var req = REQUIRED_BY_CAT[cat] || [];
  req.forEach(function (k) {
    var v = b[k];
    if (v === true || v === false) return;
    if (v === 0) return;
    if (!str(v, 240)) errors.push(k);
  });
  if (cat === 'cerco_squadra') {
    var eta = Number(b.eta);
    if (!Number.isFinite(eta) || eta < 14 || eta > 55) errors.push('eta');
    if (['tesserato', 'svincolato'].indexOf(str(b.disponibilita, 20)) < 0) errors.push('disponibilita');
  }
  if (cat === 'cerco_sponsor' && ['maglia', 'cartellonistica', 'eventi', 'altro'].indexOf(str(b.tipo_sponsorizzazione, 40)) < 0) {
    errors.push('tipo_sponsorizzazione');
  }
  if (cat === 'calciomercato' && ['cessione', 'prestito', 'svincolo'].indexOf(str(b.tipo_operazione, 40)) < 0) {
    errors.push('tipo_operazione');
  }
  return errors;
}

function itemFrom(b) {
  var now = new Date().toISOString();
  return {
    id: str(b.id, 80) || ('ann-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8)),
    categoria: str(b.categoria, 40),
    titolo: str(b.titolo || b.title, 160),
    descrizione: str(b.descrizione || b.desc, 2000),
    autore_id: str(b.autore_id, 80),
    societa: str(b.societa || b.club, 120),
    zona_citta: str(b.zona_citta || b.zona || b.location, 80),
    zona_provincia: str(b.zona_provincia, 80),
    zona_regione: str(b.zona_regione, 80),
    data_creazione: str(b.data_creazione, 40) || now,
    data_scadenza: str(b.data_scadenza, 40) || '',
    stato: ['attivo', 'chiuso', 'scaduto'].indexOf(str(b.stato, 20)) >= 0 ? str(b.stato, 20) : 'attivo',
    ruolo_campo: str(b.ruolo_campo, 80),
    eta: b.eta === '' || b.eta == null ? '' : Number(b.eta),
    categoria_attuale: str(b.categoria_attuale, 80),
    disponibilita: str(b.disponibilita, 20),
    ruolo_cercato: str(b.ruolo_cercato, 80),
    categoria_club: str(b.categoria_club, 80),
    eta_min: b.eta_min === '' || b.eta_min == null ? '' : Number(b.eta_min),
    eta_max: b.eta_max === '' || b.eta_max == null ? '' : Number(b.eta_max),
    esperienza_richiesta: str(b.esperienza_richiesta, 240),
    categoria_squadra: str(b.categoria_squadra, 80),
    livello: str(b.livello, 80),
    qualifica_richiesta: str(b.qualifica_richiesta, 80),
    livello_gare: str(b.livello_gare, 80),
    data_gara: str(b.data_gara, 40),
    ricorrente: !!b.ricorrente,
    rimborso_spese: !!b.rimborso_spese,
    periodo_disponibile: str(b.periodo_disponibile, 120),
    campo_disponibile: !!b.campo_disponibile,
    tipo_sponsorizzazione: str(b.tipo_sponsorizzazione, 40),
    club_categoria: str(b.club_categoria, 80),
    budget_fascia: str(b.budget_fascia, 80),
    tipo_operazione: str(b.tipo_operazione, 40),
    ruolo: str(b.ruolo || b.ruolo_cercato || b.ruolo_campo, 80),
    condizioni: str(b.condizioni, 400),
    ai: b.ai !== false
  };
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  if (req.method === 'GET') {
    return send(res, 200, { ok: true, items: load(), categorie: CATEGORIE });
  }
  if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'method' });
  var body = await readBody(req);
  var errors = validate(body);
  if (errors.length) return send(res, 400, { ok: false, error: 'validazione', fields: errors });
  var item = itemFrom(body);
  var items = load();
  items.unshift(item);
  save(items);
  return send(res, 200, { ok: true, item: item });
};
