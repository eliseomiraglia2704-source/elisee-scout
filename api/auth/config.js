const { publicConfig } = require('../../lib/auth-oauth');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  res.statusCode = 200;
  res.end(JSON.stringify(publicConfig()));
};
