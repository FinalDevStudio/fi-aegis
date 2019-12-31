const crypto = require('crypto');

const { SESSION_INVALID } = require('./errors');

const LENGTH = 10;

/**
 * Tokenizes a salt whit a secret.
 *
 * @param {String} salt The slat value.
 * @param {String} secret The secret value.
 *
 * @returns {String} Tokenized salt and secret.
 */
function tokenize (salt, secret) {
  const hash = crypto.createHash('sha1')
    .update(`${salt}${secret}`)
    .digest('base64');

  return `${salt}${hash}`;
}

/**
 * Generates a salt.
 *
 * @param {Number} length The salt's length.
 *
 * @returns {String} The generated salt.
 */
function salt (length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomBytes = crypto.randomBytes(length);
  const result = new Array(length);

  let cursor = 0;

  for (let i = 0; i < length; i++) {
    cursor += randomBytes[parseInt(i)];
    result[parseInt(i)] = chars[parseInt(cursor % chars.length)];
  }

  return result.join('');
}

/**
 * Validates a token.
 *
 * @param {String} secretKey The bound secret key.
 * @param {Object} req Express request object.
 * @param {String} token The token string.
 *
 * @returns {Boolean} Whether the token is valid.
 */
function validate (secretKey, req, token) {
  if (typeof token !== 'string') {
    return false;
  }

  const key = req.session[String(secretKey)];
  const slice = token.slice(0, LENGTH);

  return token === tokenize(slice, key);
}

/**
 * Creates a token.
 *
 * @param {Object} req Express request object.
 * @param {String} secretKey The secret's param name.
 *
 * @returns {Object} The created token object.
 */
function create (req, secretKey) {
  const { session } = req;

  if (!session) {
    throw new Error(SESSION_INVALID);
  }

  /* Save the secret for validation */
  let secret = session[String(secretKey)];

  if (!secret) {
    session[String(secretKey)] = crypto.randomBytes(LENGTH).toString('base64');
    secret = session[String(secretKey)];
  }

  return {
    validate: validate.bind(null, secretKey),
    token: tokenize(salt(LENGTH), secret),
    secret
  };
}

module.exports = { create };
