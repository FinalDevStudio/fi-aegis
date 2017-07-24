'use strict';

const aegis = require('../index');
const request = require('supertest');
const assert = require('assert');
const mock = require('./mocks/app');

const ERR = require('../lib/errors');

describe('CSP', function () {

  it('should be a function', function () {
    assert(typeof aegis.csp === 'function');
  });

  it('should throw if misconfigured', function () {
    assert.throws(function () {
      aegis.csp(new Date());
    }, ERR.CSP_INVALID_POLICY);
  });

  it('should respond a report header', function (done) {
    var config = require('./mocks/config/cspReport'),
      app = mock({
        csp: config
      });

    app.get('/', function (req, res) {
      res.status(200).end();
    });

    request(app).get('/')
      .expect('Content-Security-Policy-Report-Only', 'default-src *; report-uri ' + config.reportUri)
      .expect(200, done);
  });

  describe('should respond an enforce header', function () {
    it('object config', function (done) {
      var config = require('./mocks/config/cspEnforce'),
        app = mock({
          csp: config
        });

      app.get('/', function (req, res) {
        res.status(200).end();
      });

      request(app).get('/')
        .expect('Content-Security-Policy', 'default-src *')
        .expect(200, done);
    });

    it('should respond a header via string config', function (done) {
      var config = require('./mocks/config/cspString'),
        app = mock({
          csp: config
        });

      app.get('/', function (req, res) {
        res.status(200).end();
      });

      request(app).get('/')
        .expect('Content-Security-Policy', 'default-src *')
        .expect(200, done);
    });

    it('should respond a header via array config', function (done) {
      var config = require('./mocks/config/cspArray'),
        app = mock({
          csp: config
        });

      app.get('/', function (req, res) {
        res.status(200).end();
      });

      request(app).get('/')
        .expect('Content-Security-Policy', 'default-src *; img-src *')
        .expect(200, done);
    });

    it('should respond a header via nested config', function (done) {
      var config = require('./mocks/config/cspNested'),
        app = mock({
          csp: config
        });

      app.get('/', function (req, res) {
        res.status(200).end();
      });

      request(app).get('/')
        .expect('Content-Security-Policy', 'default-src *; img-src *')
        .expect(200, done);
    });
  });

});