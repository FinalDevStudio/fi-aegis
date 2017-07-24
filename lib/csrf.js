/**
 * CSRF
 *
 * @see https://www.owasp.org/index.php/Cross-Site_Request_Forgery_(CSRF)
 */

'use strict';

const token = require('./token');

const ERR = require('./errors');

var config = {
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
  var csrf = config.impl.create(req, secret);
  var validate = config.impl.validate || csrf.validate;
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
  res.locals[config.key] = token;

  if (config.cookie && config.cookie.name) {
    res.cookie(config.cookie.name, token, config.cookie.options);
  }
}

/**
 * CSRF token middleware.
 *
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @param {Function} next Express next middleware callback.
 *
 * @returns {undefined}
 */
function middleware(req, res, next) {
  var csrf = getCsrf(req, config.secret);

  var token, errmsg;

  setToken(res, csrf.token);

  /**
   * Sets the CSRF token into the response.
   *
   * @returns {String} The CSRF token.
   */
  function csrfToken() {
    var newCsrf = getCsrf(req, config.secret);

    if (csrf.secret && newCsrf.secret && csrf.secret === newCsrf.secret) {
      return csrf.token;
    }

    csrf = newCsrf;

    setToken(res, csrf.token);

    return csrf.token;
  }

  req.csrfToken = csrfToken;

  /* Move along for safe verbs */
  switch (req.method) {
  case 'OPTIONS':
  case 'HEAD':
  case 'GET':
    return next();
  }

  /* Validate token */
  token = (req.body && req.body[config.key]) ||
    req.headers[config.header.toLowerCase()];

  if (csrf.validate(req, token)) {
    return next();
  }

  res.statusCode = 403;

  if (!token) {
    errmsg = ERR.CSRF_TOKEN_MISSING;
  } else {
    errmsg = ERR.CSRF_TOKEN_MISMATCH;
  }

  next(new Error(errmsg));
}

module.exports = options => {

  options = options || {};

  if (options.angular) {
    options.header = 'x-xsrf-token';
    options.cookie = {
      name: 'XSRF-TOKEN'
    };
  }

  config.key = options.key || '_csrf';
  config.impl = options.impl || token;
  config.header = options.header || 'x-csrf-token';
  config.secret = options.secret || '_csrfSecret';
  config.cookie = {
    name: 'csrf-token',
    options: {}
  };

  /* Check if cookie is string or object */
  if (typeof options.cookie === 'string') {
    config.cookie = {
      name: options.cookie,
    };
  } else if (options && options.cookie) {
    config.cookie = {
      name: options.cookie.name
    };
  }

  /* Set cookie options */
  config.cookie.options = options.cookie && options.cookie.options ?
    options.cookie.options : {};

  return middleware;

};