'use strict';

const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');
const errorHandler = require('errorhandler');
const session = require('express-session');
const bodyParser = require('body-parser');
const express = require('express');
const aegis = require('../..');

module.exports = (config, sessionType) => {

  var app = express();

  app.use(cookieParser());

  if (!sessionType || sessionType === 'session') {
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

  if (config) {
    app.use(aegis(config));
  } else {
    console.warn('No Fi Aegis!');
  }

  app.use(errorHandler());

  return app;

};