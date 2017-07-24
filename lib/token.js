'use strict';

const crypto = require('crypto');

const ERR = require('./errors');

const LENGTH = 10;

/**
 * Tokenizes a salt whit a secret.
 *
 * @param {String} salt The slat value.
 * @param {String} secret The secret value.
 *
 * @returns {String} Tokenized salt and secret.
 */
function tokenize(salt, secret) {
  return salt + crypto.createHash('sha1').update(salt + secret).digest('base64');
}

/**
 * Generates a salt.
 *
 * @param {Number} len The salt's length.
 *
 * @returns {String} The generated salt.
 */
function salt(len) {
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var str = '';

  for (var i = 0; i < len; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }

  return str;
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
function validate(secretKey, req, token) {
  if (typeof token !== 'string') {
    return false;
  }

  return token === tokenize(token.slice(0, LENGTH), req.session[secretKey]);
}

/**
 * Creates a token.
 *
 * @param {Object} req Express request object.
 * @param {String} secretKey The secret's param name.
 *
 * @returns {Object} The created token object.
 */
function create(req, secretKey) {
  var session = req.session;

  if (session === undefined) {
    throw new Error(ERR.SESSION_INVALID);
  }

  /* Save the secret for validation */
  var secret = session[secretKey];

  if (!secret) {
    session[secretKey] = crypto.pseudoRandomBytes(LENGTH).toString('base64');
    secret = session[secretKey];
  }

  return {
    validate: validate.bind(null, secretKey),
    token: tokenize(salt(LENGTH), secret),
    secret
  };
}

module.exports = {
  create: create
};