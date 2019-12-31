/**
 * HSTS module.
 *
 * @module fi-aegis/hsts
 *
 * @see module:fi-aegis/hsts
 * @see https://www.owasp.org/index.php/HTTP_Strict_Transport_Security
 */

let value;

/**
 * HSTS Middleware.
 *
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @param {Function} next Express next callback.
 */
function middleware (req, res, next) {
  if (value) {
    res.header('Strict-Transport-Security', value);
  }

  next();
}

/**
 * Configures the HSTS module.
 *
 * @param {Object} options The options object.
 * @param {Number} options.maxAge The `max-age` value.
 * @param {Boolean} options.includeSubDomains Whether to add the
 * `includeSubDomains` directive.
 * @param {Boolean} options.preload Whether to add the `preload` directive.
 *
 * @returns {Function} The Express middleware.
 */
module.exports = (options = {}) => {
  if (typeof options.maxAge !== undefined) {
    options.maxAge = Math.max(0, parseInt(options.maxAge));
  }

  if (options.maxAge > -1) {
    value = `max-age=${options.maxAge}`;

    if (options.includeSubDomains) {
      value += '; includeSubDomains';
    }

    if (options.preload) {
      value += '; preload';
    }
  }

  return middleware;
};
