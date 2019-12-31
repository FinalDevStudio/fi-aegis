const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');
const errorHandler = require('errorhandler');
const session = require('express-session');
const bodyParser = require('body-parser');
const express = require('express');

const aegis = require('../../lib');

module.exports = (config, sessionType) => {
  const app = express();

  app.use(cookieParser());

  if (!sessionType || sessionType === 'session') {
    app.use(session({
      saveUninitialized: true,
      secret: 'abc',
      resave: false
    }));
  } else if (sessionType === 'cookie') {
    app.use(cookieSession({
      secret: 'abc'
    }));
  }

  app.use(bodyParser.json());

  app.use(bodyParser.urlencoded({
    extended: false
  }));

  if (config) {
    app.use(aegis(config));
  } else {
    console.warn('No Fi Aegis!');
  }

  app.use(errorHandler());

  return app;
};
