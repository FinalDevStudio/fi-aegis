/**
 * P3P - Platform for Privacy Preferences Project
 *
 * @see https://www.w3.org/P3P/Overview.html
 *
 * @deprecated
 */

'use strict';

module.exports = value => {

  /**
   * P3P middleware.
   *
   * @param {String} req Express request object.
   * @param {String} res Express response object.
   * @param {Function} next Express next middleware callback.
   *
   * @deprecated
   */
  function middleware(req, res, next) {
    if (value) {
      res.header('p3p', value);
    }

    next();
  }

  return middleware;

};