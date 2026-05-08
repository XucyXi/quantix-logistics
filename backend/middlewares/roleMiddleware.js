/**
 * @fileoverview Role-based authorization middleware.
 */

/**
 * Middleware factory that restricts route access to a specific user role.
 * Assumes that `req.user` has been populated by `authMiddleware`.
 *
 * @param {string} role - The required role (e.g., 'admin', 'driver', 'customer').
 * @returns {import('express').RequestHandler} Express middleware function.
 */
export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res
        .status(403)
        .json({error: 'Forbidden: Insufficient permissions'});
    }

    next();
  };
}
