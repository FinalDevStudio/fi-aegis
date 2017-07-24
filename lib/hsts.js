/**
 * HSTS - Http Strict Transport Security.
 *
 * @see https://www.owasp.org/index.php/HTTP_Strict_Transport_Security
 */

'use strict';

var value;

/**
 * HSTS Middleware.
 *
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @param {Function} next Express next callback.
 */
function middleware(req, res, next) {
  if (value) {
    res.header('strict-transport-security', value);
  }

  next();
}

module.exports = options => {

  options = options || {};

  if (typeof options.maxAge !== undefined) {
    options.maxAge = Math.max(0, parseInt(options.maxAge));
  }

  if (options.maxAge > -1) {
    value = `max-age=${ options.maxAge }`;

    if (options.includeSubDomains) {
      value += '; includeSubDomains';
    }

    if (options.preload) {
      value += '; preload';
    }
  }

  return middleware;

};