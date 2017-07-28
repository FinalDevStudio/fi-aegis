/**
 * X-Frame-Options
 *
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

module.exports = val => {

  value = val;

  return middleware;

};