/**
 * XFRAMES module.
 *
 * @module fi-aegis/xframes
 *
 * @see module:fi-aegis/xframes
 * @see https://www.owasp.org/index.php/Clickjacking
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
    res.header('X-Frame-Options', value);
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
