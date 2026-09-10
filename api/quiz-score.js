/**
 * POST /api/quiz-score       { nome, punti, userId? }
 * GET  /api/quiz-score/top   classifica top 10
 *
 * Persistenza: Vercel KV sorted set `quiz:scores` (score = punti, member = nome).
 */
const KEY = 'quiz:scores';

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

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const kv = await getKv();

  if (req.method === 'POST' && !isTop(req)) {
    if (!kv) return res.status(200).json({ ok: false, kv: false });
    const b = bodyOf(req);
    const nome = String(b.nome || b.userId || '').trim().slice(0, 80);
    const punti = Number(b.punti);
    if (!nome || !isFinite(punti) || punti < 0) {
      return res.status(400).json({ ok: false, error: 'nome e punti richiesti' });
    }
    try {
      await kv.zadd(KEY, { score: Math.round(punti), member: nome });
      return res.status(200).json({ ok: true, nome: nome, punti: Math.round(punti) });
    } catch (e) {
      return res.status(200).json({ ok: false, kv: false, error: String(e && e.message || e) });
    }
  }

  if (req.method === 'GET' || isTop(req)) {
    if (!kv) return res.status(200).json([]);
    try {
      const raw = await kv.zrange(KEY, 0, 9, { rev: true, withScores: true });
      const out = [];
      if (Array.isArray(raw)) {
        if (raw.length && typeof raw[0] === 'object' && raw[0] !== null && ('member' in raw[0] || 'score' in raw[0])) {
          raw.forEach(function (row) {
            out.push({ nome: String(row.member || row.value || ''), punti: Number(row.score || 0) });
          });
        } else {
          for (var i = 0; i < raw.length; i += 2) {
            out.push({ nome: String(raw[i]), punti: Number(raw[i + 1] || 0) });
          }
        }
      }
      return res.status(200).json(out.filter(function (x) { return x.nome; }));
    } catch (e) {
      return res.status(200).json([]);
    }
  }

  return res.status(405).json({ ok: false, error: 'method' });
}
