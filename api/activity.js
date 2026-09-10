/**
 * POST /api/activity        { userId, tipo, ts?, nome? }
 * GET  /api/activity/top    aggregato ultime 24h
 *
 * Persistenza: Vercel KV (Redis). Sorted set `activity:events`
 * score = timestamp, member = JSON evento.
 * Senza KV_REST_API_URL: GET [] / POST { ok:false, kv:false }.
 */
const KEY = 'activity:events';
const DAY_MS = 24 * 60 * 60 * 1000;
const TIPI = { candidatura: 'candidature', visita: 'visite', messaggio: 'messaggi', profilo: 'visite' };

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function isTop(req) {
  const url = String(req.url || '');
  return /\/top(?:\?|$)/.test(url) || (req.query && String(req.query.path || '') === 'top');
}

function bodyOf(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch (e) { return {}; }
  }
  return req.body;
}

async function getKv() {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) return null;
  try {
    const mod = await import('@vercel/kv');
    return mod.kv;
  } catch (e) {
    return null;
  }
}

function tipoLabel(tipo, n) {
  const base = TIPI[tipo] || 'azioni';
  return '+' + n + ' ' + base;
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const kv = await getKv();

  if (req.method === 'POST' && !isTop(req)) {
    if (!kv) return res.status(200).json({ ok: false, kv: false });
    const b = bodyOf(req);
    const userId = String(b.userId || '').trim().slice(0, 80);
    const tipo = String(b.tipo || 'visita').trim().toLowerCase().slice(0, 32);
    const nome = String(b.nome || userId || 'Utente').trim().slice(0, 80);
    const ts = Number(b.ts) > 0 ? Number(b.ts) : Date.now();
    if (!userId) return res.status(400).json({ ok: false, error: 'userId required' });
    const member = JSON.stringify({ userId: userId, tipo: tipo, nome: nome, ts: ts, id: Math.random().toString(36).slice(2, 10) });
    try {
      await kv.zadd(KEY, { score: ts, member: member });
      await kv.zremrangebyscore(KEY, 0, Date.now() - DAY_MS);
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(200).json({ ok: false, kv: false, error: String(e && e.message || e) });
    }
  }

  if (req.method === 'GET' || isTop(req)) {
    if (!kv) return res.status(200).json([]);
    const now = Date.now();
    const cutoff = now - DAY_MS;
    try {
      await kv.zremrangebyscore(KEY, 0, cutoff);
      const events = await kv.zrange(KEY, cutoff, now, { byScore: true });
      const list = Array.isArray(events) ? events : [];
      const agg = {};
      list.forEach(function (raw) {
        var ev;
        try { ev = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch (e) { return; }
        if (!ev || !ev.userId) return;
        if (!agg[ev.userId]) agg[ev.userId] = { nome: ev.nome || ev.userId, n: 0, tipi: {} };
        agg[ev.userId].n += 1;
        var t = String(ev.tipo || 'visita');
        agg[ev.userId].tipi[t] = (agg[ev.userId].tipi[t] || 0) + 1;
        if (ev.nome) agg[ev.userId].nome = ev.nome;
      });
      const top = Object.keys(agg).map(function (id) {
        const a = agg[id];
        var bestTipo = 'visita';
        var bestN = 0;
        Object.keys(a.tipi).forEach(function (t) {
          if (a.tipi[t] > bestN) { bestN = a.tipi[t]; bestTipo = t; }
        });
        return { nome: a.nome, meta: tipoLabel(bestTipo, a.n) };
      }).sort(function (x, y) {
        return parseInt(String(y.meta).replace(/\D/g, ''), 10) - parseInt(String(x.meta).replace(/\D/g, ''), 10);
      }).slice(0, 8);
      return res.status(200).json(top);
    } catch (e) {
      return res.status(200).json([]);
    }
  }

  return res.status(405).json({ ok: false, error: 'method' });
}
