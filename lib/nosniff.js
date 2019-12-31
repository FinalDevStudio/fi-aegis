/**
 * Nosniff module.
 *
 * @module fi-aegis/nosniff
 *
 * @see module:fi-aegis/nosniff
 * @see https://blogs.msdn.microsoft.com/ie/2008/09/02/ie8-security-part-vi-beta-2-update/
 */

/**
 * Nosniff Middleware.
 *
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @param {Function} next Express next callback.
 */
function middleware (req, res, next) {
  res.header('X-Content-Type-Options', 'nosniff');
  next();
}

/**
 * Configures the NoSniff module.
 *
 * @returns {Function} The Express middleware.
 */
module.exports = () => middleware;
