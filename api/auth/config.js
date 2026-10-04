const { publicConfig, providerEnabled } = require('../../lib/auth-oauth');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  const cfg = publicConfig();
  try {
    cfg.facebookEnabled = await providerEnabled('facebook');
    cfg.appleEnabled = await providerEnabled('apple');
  } catch (_) {}
  res.statusCode = 200;
  res.end(JSON.stringify(cfg));
};
