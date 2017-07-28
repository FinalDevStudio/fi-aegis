/**
 * X-XSS-Protection
 *
 * @see http://blogs.msdn.com/b/ie/archive/2008/07/02/ie8-security-part-iv-the-xss-filter.aspx
 */

'use strict';

const HEADER = 'x-xss-protection';

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

module.exports = options => {

  options = options || {};

  /* IMPORTANT: `enabled` should be either `1` or `0` */
  if (typeof options === 'boolean') {
    value = options ? '1' : '0';
  } else if (typeof options.enabled === 'string') {
    value = options.enabled === '0' ? '0' : '1';
  } else if (options.enabled) {
    value = '1';
  } else {
    value = '0';
  }

  if (value) {
    value += `; mode=${ typeof options.mode === 'string' ? options.mode : 'block' }`;
  }

  return middleware;

};