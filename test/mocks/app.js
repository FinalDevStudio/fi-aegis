'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const session = require('express-session');
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');
const aegis = require('../..');

module.exports = (config, sessionType) => {
  var app = express();

  app.use(cookieParser());

  if (sessionType === undefined || sessionType === 'session') {
    app.use(session({
      secret: 'abc',
      resave: true,
      saveUninitialized: true
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

  (config !== undefined) ? app.use(aegis(config)): console.log('No Fi Aegis!');

  app.use(errorHandler());

  return app;
};