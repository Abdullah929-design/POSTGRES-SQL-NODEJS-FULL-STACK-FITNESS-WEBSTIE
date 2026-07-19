const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_insecure_secret_change_me';

/**
 * Express middleware that verifies the JWT sent in the
 * `Authorization: Bearer <token>` header and attaches the decoded
 * payload to `req.user`.
 *
 *  - 401 Unauthorized : no token provided
 *  - 403 Forbidden    : token present but invalid/expired
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    // payload = { id, email, iat, exp }
    req.user = { id: payload.id, email: payload.email };
    next();
  });
}

module.exports = { authenticateToken, JWT_SECRET };
