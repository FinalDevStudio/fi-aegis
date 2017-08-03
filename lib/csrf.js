/**
 * CSRF module.
 *
 * @module fi-aegis/csrf
 *
 * @see module:fi-aegis/csrf
 * @see https://www.owasp.org/index.php/Cross-Site_Request_Forgery_(CSRF)
 */

'use strict';

const token = require('./token');

const ERR = require('./errors');

const CONFIG = {
  safeVerbs: null,
  cookie: null,
  header: null,
  secret: null,
  impl: null,
  key: null
};

/**
 * Retrieves CSRF token object from the request.
 *
 * @param {Object} req Express request object.
 * @param {String} secret The secret to check with.
 *
 * @returns {Object} The CSRF token object.
 */
function getCsrf(req, secret) {
  var csrf = CONFIG.impl.create(req, secret);
  var validate = CONFIG.impl.validate || csrf.validate;
  var token = csrf.token || csrf;

  secret = csrf.secret;

  return {
    validate,
    secret,
    token
  };
}

/**
 * Sets the token into the response.
 *
 * @param {Object} res Express response object.
 * @param {String} token The token to set.
 */
function setToken(res, token) {
  res.locals[CONFIG.key] = token;

  if (CONFIG.cookie && CONFIG.cookie.name) {
    res.cookie(CONFIG.cookie.name, token, CONFIG.cookie.options);
  }
}

/**
 * CSRF token middleware.
 *
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @param {Function} next Express next middleware callback.
 *
 * @returns {void}
 */
function middleware(req, res, next) {
  var csrf = getCsrf(req, CONFIG.secret);

  var token;

  setToken(res, csrf.token);

  /**
   * Regenerates the token if necessary and sets it in the response object.
   *
   * @returns {String} The token.
   */
  req.csrfToken = () => {
    var newCsrf = getCsrf(req, CONFIG.secret);

    if (csrf.secret && newCsrf.secret && csrf.secret === newCsrf.secret) {
      return csrf.token;
    }

    csrf = newCsrf;

    setToken(res, csrf.token);

    return csrf.token;
  };

  /* Move along for safe verbs */
  if (CONFIG.safeVerbs.indexOf(req.method) >= 0) {
    return next();
  }

  /* Validate token */
  token = (req.body && req.body[CONFIG.key]) ||
    req.headers[CONFIG.header];

  if (csrf.validate(req, token)) {
    return next();
  }

  console.log(req.body, req.headers[CONFIG.header]);

  res.status(403);

  next(new Error(!token ? ERR.CSRF_TOKEN_MISSING : ERR.CSRF_TOKEN_MISMATCH));
}

/**
 * Confures the CSRF module.
 *
 * @param {Object} options The options object.
 * @param {Boolean} options.angular Whether to use AngularJS defaults.
 * @param {String} options.key The CSRF token key in res locals and req body.
 * @param {Function} options.impl The token generator implementation.
 * @param {String} options.header The HTTP header to use for the CSRF token.
 * @param {String} options.secret The secret property key name to use on the
 * CSRF token object.
 * @param {String|Object} options.cookie The CSRF cookie name or cookie options
 * to use.
 * @param {String} options.cookie.name The CSRF cookie name to use.
 * @param {Object} options.cookie.options A valid Express cookie options
 * object.
 *
 * @returns {Function} The CSRF Express middleware.
 */
module.exports = options => {

  options = options || {};

  /* Initialize defaults */
  CONFIG.header = (options.header || 'csrf-token').toLowerCase(); // https://stackoverflow.com/a/5259004/1970170
  CONFIG.safeVerbs = options.safeVerbs || ['OPTIONS', 'HEAD', 'GET'];
  CONFIG.secret = options.secret || '_csrfSecret';
  CONFIG.impl = options.impl || token;
  CONFIG.key = options.key || '_csrf';
  CONFIG.cookie = {
    options: options.cookie && options.cookie.options,
    name: 'CSRF-TOKEN'
  };

  /* Angular shorthand option should override other options */
  if (options.angular) {
    CONFIG.cookie.name = 'XSRF-TOKEN';
    CONFIG.header = 'x-xsrf-token';
  } else if (typeof options.cookie === 'string') {
    CONFIG.cookie.name = options.cookie;
  } else if (options.cookie && typeof options.cookie.name === 'string') {
    CONFIG.cookie.name = options.cookie.name;
  }

  return middleware;

};