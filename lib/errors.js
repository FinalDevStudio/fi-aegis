'use strict';

/**
 * Prefixes error string for easier debugging.
 *
 * @param {String} message The error's original message.
 *
 * @returns {String} The prefixed error message.
 */
function msg(message) {
  return `Fi Aegis: ${ message }`;
}

module.exports = {

  SESSION_INVALID: msg('A valid session must be available in order to maintain state!'),

  CSP_INVALID_POLICY: msg('Invalid CSP policy! Must be Array, String, or Object.'),

  CSRF_TOKEN_MISMATCH: msg('CSRF token mismatch!'),
  CSRF_TOKEN_MISSING: msg('CSRF token missing!')

};