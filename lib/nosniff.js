/**
 * X-Content-Type-Options.
 *
 * @see https://blogs.msdn.microsoft.com/ie/2008/09/02/ie8-security-part-vi-beta-2-update/
 */

'use strict';

const HEADER = 'x-content-type-options';
const VALUE = 'nosniff';

module.exports = () => {

  /**
   * No Sniff Middleware.
   *
   * @param {Object} req Express request object.
   * @param {Object} res Express response object.
   * @param {Function} next Express next callback.
   */
  function middleware(req, res, next) {
    res.header(HEADER, VALUE);

    next();
  }

  return middleware;

};