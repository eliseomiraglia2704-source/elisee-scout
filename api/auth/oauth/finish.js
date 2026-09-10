const { finishOAuth, pkceCookie } = require('../../../lib/auth-oauth');

function bodyOf(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch (e) { return {}; }
  }
  return req.body;
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ ok: false, error: 'method' }));
    return;
  }
  const b = bodyOf(req);
  const out = await finishOAuth(String(b.code || ''), String(b.state || b.es_state || ''), req);
  if (out.clearCookie) res.setHeader('Set-Cookie', pkceCookie('', 0));
  res.statusCode = out.status;
  res.end(JSON.stringify(out.body));
};
