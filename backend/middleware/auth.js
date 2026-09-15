/**
 * MediCore HMS - Authentication & authorization middleware.
 *
 * Replaces the PHP session-based requireLogin() / requirePageAccess()
 * with JWT verification + a role/module permission check.
 */
const jwt = require('jsonwebtoken');
const { canAccess } = require('../config/roles');

/** Verifies the Bearer JWT and attaches the decoded user to req.user. */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, username, full_name, email, role_id, role_name }
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired session. Please log in again.' });
  }
}

/**
 * Restricts a route to the roles allowed for a given module key
 * (see config/roles.js), mirroring requirePageAccess($moduleKey).
 */
function requireModuleAccess(moduleKey) {
  return function (req, res, next) {
    if (!req.user || !canAccess(req.user.role_name, moduleKey)) {
      return res.status(403).json({ message: 'Your role does not have permission to access this module.' });
    }
    return next();
  };
}

module.exports = { requireAuth, requireModuleAccess };
