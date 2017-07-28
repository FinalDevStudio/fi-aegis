'use strict';

const request = require('supertest');
const mock = require('./mocks/app');
const aegis = require('../index');
const assert = require('assert');

describe('HSTS', function () {

  it('should be a function', function () {
    assert(typeof aegis.hsts === 'function');
  });

  it('should respond with a custom max age header value', function (done) {
    var config = {
      hsts: {
        maxAge: 31536000
      }
    };

    var app = mock(config);

    app.get('/', (req, res) => {
      res.status(200).end();
    });

    request(app).get('/')
      .expect('Strict-Transport-Security', `max-age=${ config.hsts.maxAge }`)
      .expect(200, done);
  });

  it('should respond with a max age header value of 0', function (done) {
    var config = {
      hsts: {
        maxAge: -3456356356
      }
    };

    var app = mock(config);

    app.get('/', (req, res) => {
      res.status(200).end();
    });

    request(app).get('/')
      .expect('Strict-Transport-Security', `max-age=${ config.hsts.maxAge }`)
      .expect(200, done);
  });

  it('should respond with a custom max age and include sub domains directive header value', function (done) {
    var config = {
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true
      }
    };

    var app = mock(config);

    app.get('/', (req, res) => {
      res.status(200).end();
    });

    request(app).get('/')
      .expect('Strict-Transport-Security', `max-age=${ config.hsts.maxAge }; includeSubDomains`)
      .expect(200, done);
  });

  it('should respond with a custom max age, include sub domains and preload directives header value', function (done) {
    var config = {
      hsts: {
        includeSubDomains: true,
        maxAge: 31536000,
        preload: true
      }
    };

    var app = mock(config);

    app.get('/', (req, res) => {
      res.status(200).end();
    });

    request(app).get('/')
      .expect('Strict-Transport-Security', `max-age=${ config.hsts.maxAge }; includeSubDomains; preload`)
      .expect(200, done);
  });

  it('should not respond with header value if max age is missing', function (done) {
    var config = {
      hsts: {}
    };

    var app = mock(config);

    app.get('/', (req, res) => {
      res.status(200).end();
    });

    request(app).get('/')
      .expect(200)
      .end(function (err, res) {
        assert(res.headers['Strict-Transport-Security'] === undefined);
        done(err);
      });

  });

});