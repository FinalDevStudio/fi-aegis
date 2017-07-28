'use strict';

module.exports = {

  csrf: true,

  xframe: 'SAMEORIGIN',

  p3p: 'MY_P3P_VALUE',

  hsts: {
    maxAge: 31536000
  },

  csp: require('./cspReport'),

  xssProtection: true,

  nosniff: true

};