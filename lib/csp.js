/**
 * CSP module.
 *
 * @module fi-aegis/csp
 *
 * @see module:fi-aegis/csp
 * @see https://www.owasp.org/index.php/Content_Security_Policy
 */

const { CSP_INVALID_POLICY } = require('./errors');

let header, value;

/**
 * CSP middleware.
 *
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @param {Object} next Express next callback.
 */
function middleware (req, res, next) {
  res.header(header, value);
  next();
}

/**
 * Creates a CSP policy string.
 *
 * @param {Array|Object|String} policy The policy object to parse.
 *
 * @returns {String} The CSP policy string.
 */
function createPolicyString (policy) {
  if (typeof policy === 'string') {
    return policy;
  }

  if (Array.isArray(policy)) {
    return policy.map(csp.createPolicyString).join('; ');
  }

  if (typeof policy === 'object' && policy !== null) {
    let entries = Object.keys(policy).map(directive => {
      if (policy[String(directive)] === 0 || policy[String(directive)]) {
        directive += ` ${policy[String(directive)]}`;
      }

      return directive;
    });

    return csp.createPolicyString(entries);
  }

  throw new Error(CSP_INVALID_POLICY);
}

/**
 * Configures the CSP module.
 *
 * @param {Object} options The CSP policy options.
 * @param {Boolean} options.reportOnly Whether to only work in report mode.
 * @param {String} options.reportUri The report URI.
 * @param {Object|Array|String} options.policy The CSP policy.
 *
 * @returns {Function} The CSP Express middleware.
 */
function csp (options) {
  let reportUri, policyRules;
  let isReportOnly = false;

  if (options) {
    isReportOnly = options.reportOnly;
    reportUri = options.reportUri;
    policyRules = options.policy;
  }

  header = 'Content-Security-Policy';

  if (isReportOnly) {
    header += '-Report-Only';
  }

  value = createPolicyString(policyRules);

  if (reportUri) {
    console.warn('The `report-uri` directive has been deprecated. See https://developer.mozilla.org/docs/Web/HTTP/Headers/Content-Security-Policy/report-uri');

    if (value !== '') {
      value += '; ';
    }

    value += `report-uri ${reportUri}`;
  }

  return middleware;
}

csp.createPolicyString = createPolicyString;

module.exports = csp;
