'use strict';

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
var aegis = module.exports = options => {

  const components = [];

  if (options) {
    Object.keys(aegis).forEach(key => {
      let config = options[key];

      if (config) {
        components.push(aegis[key](config));
      }
    });
  }

  /**
   * Fi Aegis middleware.
   *
   * @param {Object} req Express request object.
   * @param {Object} res Express response object.
   * @param {Function} next Express next middleware callback.
   */
  function middleware(req, res, next) {
    var chain = next;

    components.forEach(component => {
      chain = (next => err => {
        if (err) {
          return next(err);
        }

        component(req, res, next);
      })(chain);
    });

    chain();
  }

  return middleware;

};

aegis.csrf = require('./lib/csrf');
aegis.csp = require('./lib/csp');
aegis.hsts = require('./lib/hsts');
aegis.p3p = require('./lib/p3p');
aegis.xframe = require('./lib/xframes');
aegis.xssProtection = require('./lib/xssprotection');
aegis.nosniff = require('./lib/nosniff');