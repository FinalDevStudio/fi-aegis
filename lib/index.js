/**
 * Fi Aegis.
 *
 * @module fi-aegis
 *
 * @see module:fi-aegis
 */

/**
 * Configures the module.
 *
 * @param {Object} options The options object.
 * @param {Object} options.csp The options for the `csp` module.
 * @param {Object} options.csrf The options for the `csrf` module.
 * @param {Object} options.hsts The options for the `hsts` module.
 * @param {Boolean} options.nosniff Whether to activate the `nosniff` module.
 * @param {String} options.p3p The header value for the `p3p` module.
 * @param {String} options.xframes The header value for the `xframe` module.
 * @param {Object} options.xssprotection The options for the `xssprotection`
 * module.
 *
 * @returns {Function} The Express middleware.
 */
const aegis = module.exports = options => {
  const components = [];

  if (options) {
    for (let key of Object.keys(aegis)) {
      const config = options[String(key)];

      if (config) {
        const fn = aegis[String(key)];
        components.push(fn(config));
      }
    }
  }

  /**
   * Fi Aegis middleware.
   *
   * @param {Object} req Express request object.
   * @param {Object} res Express response object.
   * @param {Function} next Express next middleware callback.
   */
  function middleware (req, res, next) {
    let chain = next;

    for (let component of components) {
      chain = (next => err => {
        if (err) {
          return next(err);
        }

        component(req, res, next);
      })(chain);
    }

    chain();
  }

  return middleware;
};

aegis.xssProtection = require('./xssprotection');
aegis.nosniff = require('./nosniff');
aegis.xframe = require('./xframes');
aegis.csrf = require('./csrf');
aegis.hsts = require('./hsts');
aegis.csp = require('./csp');
