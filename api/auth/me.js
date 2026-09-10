const { verifyToken, publicUser } = require('../../lib/auth-oauth');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  const h = String(req.headers.authorization || '');
  const token = h.toLowerCase().startsWith('bearer ') ? h.slice(7).trim() : '';
  const user = verifyToken(token);
  if (!user) {
    res.statusCode = 401;
    res.end(JSON.stringify({ ok: false, error: 'non_autenticato' }));
    return;
  }
  res.statusCode = 200;
  res.end(JSON.stringify({ ok: true, user: publicUser(user) }));
};
