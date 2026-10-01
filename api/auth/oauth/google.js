const { startProviderOAuth } = require('../../../lib/auth-oauth');

function providerFrom(req) {
  if (req.query && req.query.provider) return String(req.query.provider).toLowerCase();
  try {
    const u = new URL(req.url || '/', 'https://elisee-scout.vercel.app');
    return String(u.searchParams.get('provider') || 'google').toLowerCase();
  } catch (e) {
    return 'google';
  }
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: false, error: 'method' }));
    return;
  }
  return startProviderOAuth(req, res, providerFrom(req));
};
