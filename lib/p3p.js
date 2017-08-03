/**
 * P3P module.
 *
 * @module fi-aegis/p3p
 *
 * @see module:fi-aegis/p3p
 * @see https://www.w3.org/P3P/Overview.html
 *
 * @deprecated
 */

'use strict';

const HEADER = 'p3p';

var value;

/**
 * P3P middleware.
 *
 * @param {String} req Express request object.
 * @param {String} res Express response object.
 * @param {Function} next Express next middleware callback.
 *
 * @deprecated
 */
function middleware(req, res, next) {
  if (value) {
    res.header(HEADER, value);
  }

  next();
}

/**
 * Configures the P3P module.
 *
 * @param {String} val The value for the `p3p` header.
 *
 * @returns {Function} The Express middleware.
 */
module.exports = val => {

  value = val;

  return middleware;

};