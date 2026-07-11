const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'unihub_jwt_secret_change_me_in_prod';

/**
 * Verifies the JWT in the Authorization header.
 * On success, attaches the decoded payload to req.user.
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

/**
 * Role guard factory.
 * Usage: requireRole('canteen_admin', 'faculty')
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${allowedRoles.join(', ')}.`
      });
    }
    next();
  };
}

module.exports = { verifyToken, requireRole };
