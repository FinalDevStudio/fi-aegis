'use strict';

var aegis = module.exports = options => {
  var headers = [];

  if (options) {
    Object.keys(aegis).forEach(key => {
      var config = options[key];

      if (config) {
        headers.push(aegis[key](config));
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

    headers.forEach(header => {
      chain = (next => {
        return err => {
          if (err) {
            return next(err);
          }

          header(req, res, next);
        };
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