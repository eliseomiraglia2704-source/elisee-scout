/**
 * ELISEE SCOUT — Dati della gestione squadra (Allenatore / Vice Allenatore).
 *
 * Un documento per squadra nel database (Upstash Redis via @vercel/kv), chiave
 * `elisee:squadra:<slug>`. Senza database (sviluppo locale) usa un file JSON.
 *
 * Accesso: solo utenti loggati. Il primo utente che apre la squadra ne diventa
 * il titolare; gli altri entrano solo se il titolare li aggiunge tra i membri.
 * L'admin (token firmato) può accedere a tutte le squadre.
 * I dati possono riguardare minori: non esporre mai un documento a chi non è membro.
 */
const fs = require('fs');
const path = require('path');

const COLLECTIONS = [
  'rosa', 'partite', 'allenamenti', 'presenze_allenamento', 'staff', 'report',
  'eventi_log', 'impegni_staff', 'schemi_tattici', 'dossier_tattico', 'file_allegati'
];
// Collezioni che il sito può scrivere oggi. Le altre si leggono e basta.
const WRITABLE = ['rosa', 'schemi_tattici', 'dossier_tattico', 'partite', 'allenamenti', 'report'];
const MAX_ITEMS = 300;
const MAX_ITEM_BYTES = 20000;

// Allegati: il file arriva a pezzi (base64) perché ogni richiesta è al massimo 1 MB.
const FILE_MAX_BYTES = 4 * 1024 * 1024;
const FILE_MAX_PARTS = 8;
const FILE_PART_CHARS = 760000;
const FILE_EXT = /\.(pdf|png|jpe?g|webp|csv|json|txt|gpx|fit|tcx|xlsx?|docx?|pptx?)$/i;
const FILE_ID = /^f-[a-z0-9]{6,32}$/;

function slugOf(name) {
  return String(name || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function fileFor(slug) {
  return process.env.VERCEL
    ? '/tmp/elisee-squadra-' + slug + '.json'
    : path.join(process.cwd(), 'data', 'squadre-dati', slug + '.json');
}

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

async function loadDoc(slug, kvOverride) {
  const kv = kvOverride !== undefined ? kvOverride : await getKv();
  if (kv) {
    const v = await kv.get('elisee:squadra:' + slug);
    return v && typeof v === 'object' ? v : null;
  }
  try {
    return JSON.parse(fs.readFileSync(fileFor(slug), 'utf8'));
  } catch (e) {
    return null;
  }
}

function partKey(slug, fileId, n) {
  return 'elisee:sqfile:' + slug + ':' + fileId + ':' + n;
}
function partFile(slug, fileId, n) {
  return process.env.VERCEL
    ? '/tmp/elisee-sqfile-' + slug + '-' + fileId + '-' + n + '.b64'
    : path.join(process.cwd(), 'data', 'squadre-dati', 'file', slug + '-' + fileId + '-' + n + '.b64');
}
async function savePart(slug, fileId, n, data, kv) {
  if (kv) { await kv.set(partKey(slug, fileId, n), data); return; }
  const f = partFile(slug, fileId, n);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, data);
}
async function loadPart(slug, fileId, n, kv) {
  if (kv) { const v = await kv.get(partKey(slug, fileId, n)); return typeof v === 'string' ? v : null; }
  try { return fs.readFileSync(partFile(slug, fileId, n), 'utf8'); } catch (e) { return null; }
}
async function deletePart(slug, fileId, n, kv) {
  if (kv) { await kv.del(partKey(slug, fileId, n)); return; }
  try { fs.unlinkSync(partFile(slug, fileId, n)); } catch (e) { /* già assente */ }
}

async function saveDoc(slug, doc, kvOverride) {
  const kv = kvOverride !== undefined ? kvOverride : await getKv();
  if (kv) {
    await kv.set('elisee:squadra:' + slug, doc);
    return;
  }
  const f = fileFor(slug);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, JSON.stringify(doc));
}

function emptyDoc(slug, name, owner) {
  const doc = { slug: slug, nome: String(name || '').slice(0, 80), owner: owner, membri: [], createdAt: new Date().toISOString() };
  COLLECTIONS.forEach(function (c) { doc[c] = []; });
  return doc;
}

function canAccess(doc, email, admin) {
  if (admin) return true;
  if (!doc || !email) return false;
  const e = String(email).toLowerCase();
  return doc.owner === e || (Array.isArray(doc.membri) && doc.membri.indexOf(e) >= 0);
}

function cleanItem(raw) {
  const out = {};
  Object.keys(raw || {}).slice(0, 40).forEach(function (k) {
    if (!/^[a-zA-Z0-9_]{1,40}$/.test(k)) return;
    const v = raw[k];
    if (v === null || typeof v === 'number' || typeof v === 'boolean') out[k] = v;
    else if (typeof v === 'string') out[k] = v.slice(0, 4000);
    else if (Array.isArray(v) || typeof v === 'object') out[k] = v;
  });
  return out;
}

/**
 * Gestisce /api/manager?path=squadra.
 * ctx = { method, query: URLSearchParams, body, email, admin, kv? }
 * Ritorna { status, body }.
 */
async function handle(ctx) {
  const email = ctx.email ? String(ctx.email).toLowerCase() : '';
  if (!email && !ctx.admin) return { status: 401, body: { ok: false, error: 'login_richiesto' } };

  const name = String(ctx.query.get('club') || '').trim();
  const slug = slugOf(name);
  if (!slug) return { status: 400, body: { ok: false, error: 'squadra_mancante' } };
  const col = String(ctx.query.get('col') || '').trim();
  const kv = ctx.kv;

  let doc = await loadDoc(slug, kv);
  if (!doc) {
    if (ctx.admin && !email) return { status: 404, body: { ok: false, error: 'squadra_non_trovata' } };
    doc = emptyDoc(slug, name, email);
    await saveDoc(slug, doc, kv);
  }
  if (!canAccess(doc, email, ctx.admin)) {
    return { status: 403, body: { ok: false, error: 'non_membro', message: 'Chiedi al titolare della squadra di aggiungerti.' } };
  }

  if (ctx.method === 'GET') {
    if (!col) {
      return { status: 200, body: { ok: true, club: slug, nome: doc.nome, titolare: doc.owner === email, membri: doc.owner === email || ctx.admin ? doc.membri : undefined } };
    }
    if (COLLECTIONS.indexOf(col) < 0) return { status: 400, body: { ok: false, error: 'collezione' } };
    const fileId = String(ctx.query.get('file') || '');
    if (col === 'file_allegati' && fileId) {
      const meta = (doc.file_allegati || []).find(function (x) { return x && x.id === fileId; });
      const n = parseInt(ctx.query.get('part') || '0', 10);
      if (!meta || !FILE_ID.test(fileId) || !(n >= 0 && n < meta.parts)) return { status: 404, body: { ok: false, error: 'file_non_trovato' } };
      const data = await loadPart(slug, fileId, n, kv);
      if (data == null) return { status: 404, body: { ok: false, error: 'file_non_trovato' } };
      return { status: 200, body: { ok: true, part: n, parts: meta.parts, data: data } };
    }
    return { status: 200, body: { ok: true, club: slug, items: Array.isArray(doc[col]) ? doc[col] : [] } };
  }

  if (ctx.method !== 'POST') return { status: 405, body: { ok: false, error: 'method' } };
  const body = ctx.body || {};

  if (col === 'membri') {
    if (doc.owner !== email && !ctx.admin) return { status: 403, body: { ok: false, error: 'solo_titolare' } };
    const m = String(body.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m)) return { status: 400, body: { ok: false, error: 'email_non_valida' } };
    if (body.remove) doc.membri = doc.membri.filter(function (x) { return x !== m; });
    else if (doc.membri.indexOf(m) < 0 && m !== doc.owner) doc.membri.push(m);
    doc.membri = doc.membri.slice(0, 50);
    await saveDoc(slug, doc, kv);
    return { status: 200, body: { ok: true, membri: doc.membri } };
  }

  if (col === 'file_allegati') return handleFile(slug, doc, body, email, kv);
  if (WRITABLE.indexOf(col) < 0) return { status: 400, body: { ok: false, error: 'collezione_sola_lettura' } };
  if (body.removeId) {
    const rid = String(body.removeId);
    const before = Array.isArray(doc[col]) ? doc[col] : [];
    doc[col] = before.filter(function (x) { return !x || String(x.id) !== rid; });
    await saveDoc(slug, doc, kv);
    return { status: 200, body: { ok: true, removed: before.length - doc[col].length } };
  }
  const item = cleanItem(body.item);
  if (JSON.stringify(item).length > MAX_ITEM_BYTES) return { status: 413, body: { ok: false, error: 'troppo_grande' } };
  item.updated_at = new Date().toISOString();
  item.autore_email = email || 'admin';

  const list = Array.isArray(doc[col]) ? doc[col] : [];
  let idx = -1;
  if (col === 'dossier_tattico') {
    if (!item.partita_id) return { status: 400, body: { ok: false, error: 'partita_mancante' } };
    idx = list.findIndex(function (x) { return x.partita_id === item.partita_id; });
  } else {
    if (!item.id) item.id = col.slice(0, 2) + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    idx = list.findIndex(function (x) { return x.id === item.id; });
  }
  if (idx >= 0) list[idx] = Object.assign({}, list[idx], item);
  else {
    if (!item.created_at) item.created_at = item.updated_at;
    list.push(item);
  }
  doc[col] = list.slice(-MAX_ITEMS);
  await saveDoc(slug, doc, kv);
  return { status: 200, body: { ok: true, item: item } };
}

async function handleFile(slug, doc, body, email, kv) {
  const list = Array.isArray(doc.file_allegati) ? doc.file_allegati : [];
  if (body.removeId) {
    const rid = String(body.removeId);
    const meta = list.find(function (x) { return x && x.id === rid; });
    if (!meta) return { status: 404, body: { ok: false, error: 'file_non_trovato' } };
    for (let i = 0; i < (meta.parts || 0); i++) await deletePart(slug, rid, i, kv);
    doc.file_allegati = list.filter(function (x) { return x !== meta; });
    await saveDoc(slug, doc, kv);
    return { status: 200, body: { ok: true, removed: 1 } };
  }
  const c = body.chunk || {};
  const fileId = String(c.fileId || '');
  const index = parseInt(c.index, 10);
  const total = parseInt(c.total, 10);
  const data = typeof c.data === 'string' ? c.data : '';
  const m = c.meta || {};
  const name = String(m.name || '').replace(/[\\/:*?"<>|]+/g, '_').slice(0, 120);
  const size = Number(m.size) || 0;
  if (!FILE_ID.test(fileId) || !(total >= 1 && total <= FILE_MAX_PARTS) || !(index >= 0 && index < total)) {
    return { status: 400, body: { ok: false, error: 'pezzo_non_valido' } };
  }
  if (!data || data.length > FILE_PART_CHARS || !/^[A-Za-z0-9+/=]+$/.test(data)) {
    return { status: 400, body: { ok: false, error: 'pezzo_non_valido' } };
  }
  if (!FILE_EXT.test(name)) return { status: 415, body: { ok: false, error: 'tipo_non_ammesso' } };
  if (!(size > 0 && size <= FILE_MAX_BYTES)) return { status: 413, body: { ok: false, error: 'file_troppo_grande' } };
  if (list.some(function (x) { return x && x.id === fileId; })) return { status: 409, body: { ok: false, error: 'file_esistente' } };
  await savePart(slug, fileId, index, data, kv);
  if (index < total - 1) return { status: 200, body: { ok: true, received: index } };
  // Ultimo pezzo: controlla che ci siano tutti e registra il file.
  let chars = 0;
  for (let i = 0; i < total; i++) {
    const p = await loadPart(slug, fileId, i, kv);
    if (p == null) return { status: 409, body: { ok: false, error: 'pezzi_mancanti' } };
    chars += p.length;
  }
  if (Math.floor(chars * 3 / 4) > FILE_MAX_BYTES + 3) {
    for (let i = 0; i < total; i++) await deletePart(slug, fileId, i, kv);
    return { status: 413, body: { ok: false, error: 'file_troppo_grande' } };
  }
  const now = new Date().toISOString();
  const item = {
    id: fileId,
    nome: name,
    tipo: String(m.type || '').slice(0, 80),
    size: size,
    parts: total,
    categoria: String(m.categoria || 'altro').slice(0, 40),
    entita_id: String(m.entita_id || '').slice(0, 80),
    visibilita: Array.isArray(m.visibilita) ? m.visibilita.slice(0, 10).map(String) : [],
    autore_email: email || 'admin',
    created_at: now
  };
  list.push(item);
  doc.file_allegati = list.slice(-MAX_ITEMS);
  await saveDoc(slug, doc, kv);
  return { status: 200, body: { ok: true, item: item } };
}

module.exports = { handle, slugOf, loadDoc, COLLECTIONS, WRITABLE };
