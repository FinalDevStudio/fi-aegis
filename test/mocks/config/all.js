module.exports = {
  csp: require('./cspReport'),
  xframe: 'SAMEORIGIN',
  xssProtection: true,
  nosniff: true,
  csrf: true,
  hsts: {
    maxAge: 31536000
  }
};
