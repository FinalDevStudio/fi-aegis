/**
 * HSTS module.
 *
 * @module fi-aegis/hsts
 *
 * @see module:fi-aegis/hsts
 * @see http://blogs.msdn.com/b/ie/archive/2008/07/02/ie8-security-part-iv-the-xss-filter.aspx
 */

let value;

/**
 * X-Frame-Options middleware.
 *
 * @param {String} req Express request object.
 * @param {String} res Express response object.
 * @param {Function} next Express next middleware callback.
 */
function middleware (req, res, next) {
  if (value) {
    res.header('X-XSS-Protection', value);
  }

  next();
}

/**
 * Configures the XSSPROTECTION module.
 *
 * @param {Boolean|Object} options Whether to enable this module or an options
 * object.
 * @param {Number|String|Boolean} options.enabled The header value clamped to 1
 * or 0.
 * @param {String} options.mode The mode directive value.
 *
 * @returns {Function} The Express middleware.
 */
module.exports = (options = {}) => {
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

  let mode = 'block';

  if (options && options.mode && typeof options.mode === 'string') {
    mode = options.mode;
  }

  value += `; mode=${mode}`;

  return middleware;
};
