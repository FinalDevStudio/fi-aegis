/**
 * CSRF module.
 *
 * @module fi-aegis/csrf
 *
 * @see module:fi-aegis/csrf
 * @see https://www.owasp.org/index.php/Cross-Site_Request_Forgery_(CSRF)
 */

const { CSRF_TOKEN_MISSING, CSRF_TOKEN_MISMATCH } = require('./errors');
const token = require('./token');

const config = {
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
function getCsrf (req, secret) {
  const csrf = config.impl.create(req, secret);
  const validate = config.impl.validate || csrf.validate;
  const token = csrf.token || csrf;

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
function setToken (res, token) {
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
 * @returns {void}
 */
function middleware (req, res, next) {
  let csrf = getCsrf(req, config.secret);
  let token;

  setToken(res, csrf.token);

  /**
   * Regenerates the token if necessary and sets it in the response object.
   *
   * @returns {String} The token.
   */
  req.csrfToken = () => {
    let newCsrf = getCsrf(req, config.secret);

    if (csrf.secret && newCsrf.secret && csrf.secret === newCsrf.secret) {
      return csrf.token;
    }

    csrf = newCsrf;

    setToken(res, csrf.token);

    return csrf.token;
  };

  /* Move along for safe verbs */
  if (config.safeVerbs.indexOf(req.method) >= 0) {
    return next();
  }


  /* Validate token */
  token = (req.body && req.body[String(config.key)]) ||
  req.headers[String(config.header)];

  if (!token) {
    console.info(req.headers);
  }

  if (csrf.validate(req, token)) {
    return next();
  }

  res.status(403);

  next(new Error(!token ? CSRF_TOKEN_MISSING : CSRF_TOKEN_MISMATCH));
}

/**
 * Configures the CSRF module.
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
module.exports = (options = {}) => {
  /* Initialize defaults */
  config.header = (options.header || 'csrf-token').toLowerCase();
  config.safeVerbs = options.safeVerbs || ['OPTIONS', 'HEAD', 'GET'];
  config.secret = options.secret || '_csrfSecret';
  config.impl = options.impl || token;
  config.key = options.key || '_csrf';
  config.cookie = {
    options: options.cookie && options.cookie.options,
    name: 'CSRF-TOKEN'
  };

  /* Angular shorthand option should override other options */
  if (options.angular) {
    config.cookie.name = 'XSRF-TOKEN';
    config.header = 'x-xsrf-token';
  } else if (typeof options.cookie === 'string') {
    config.cookie.name = options.cookie;
  } else if (options.cookie && typeof options.cookie.name === 'string') {
    config.cookie.name = options.cookie.name;
  }

  return middleware;
};
