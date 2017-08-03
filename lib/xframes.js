/**
 * XFRAMES module.
 *
 * @module fi-aegis/xframes
 *
 * @see module:fi-aegis/xframes
 * @see https://www.owasp.org/index.php/Clickjacking
 */

'use strict';

const HEADER = 'x-frame-options';

var value;

/**
 * X-Frame-Options middleware.
 *
 * @param {String} req Express request object.
 * @param {String} res Express response object.
 * @param {Function} next Express next middleware callback.
 */
function middleware(req, res, next) {
  if (value) {
    res.header(HEADER, value);
  }

  next();
}

/**
 * Configures the XFRAMES module.
 *
 * @param {String} val The value for the `xframes` header.
 *
 * @returns {Function} The Express middleware.
 */
module.exports = val => {

  value = val;

  return middleware;

};