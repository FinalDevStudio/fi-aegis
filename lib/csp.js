/**
 * Content Security Policy (CSP).
 *
 * @see https://www.owasp.org/index.php/Content_Security_Policy
 */

'use strict';

const ERR = require('./errors');

var value, name;

/**
 * CSP middleware.
 *
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @param {Object} next Express next callback.
 */
function middleware(req, res, next) {
  res.header(name, value);

  next();
}

/**
 * Module export function.
 *
 * @param {Object} options The CSP policy options.
 *
 * @returns {Function} The CSP middleware.
 */
function csp(options) {
  var isReportOnly = options && options.reportOnly;
  var reportUri = options && options.reportUri;
  var policyRules = options && options.policy;

  name = 'content-security-policy';

  if (isReportOnly) {
    name += '-report-only';
  }

  value = createPolicyString(policyRules);

  if (reportUri) {
    if (value !== '') {
      value += '; ';
    }

    value += 'report-uri ' + reportUri;
  }

  return middleware;
}

/**
 * Creates a CSP policy string.
 *
 * @param {Array|Object|String} policy The policy object to parse.
 *
 * @returns {String} The CSP policy string.
 */
function createPolicyString(policy) {
  var entries;

  if (typeof policy === 'string') {
    return policy;
  }

  if (Array.isArray(policy)) {
    return policy.map(csp.createPolicyString).join('; ');
  }

  if (typeof policy === 'object' && policy !== null) {
    entries = Object.keys(policy).map(directive => {
      if (policy[directive] === 0 || policy[directive]) {
        directive += ' ' + policy[directive];
      }

      return directive;
    });

    return csp.createPolicyString(entries);
  }

  throw new Error(ERR.CSP_INVALID_POLICY);
}

csp.createPolicyString = createPolicyString;

module.exports = csp;