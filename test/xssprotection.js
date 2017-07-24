'use strict';

const aegis = require('../index');
const request = require('supertest');
const assert = require('assert');
const mock = require('./mocks/app');

describe('xssProtection', function () {

  it('should be a function', function () {
    assert(typeof aegis.xssProtection === 'function');
  });

  it('should respond with an enabled as boolean header', function (done) {
    var config = {
      xssProtection: true
    };

    var app = mock(config);

    app.get('/', (req, res) => {
      res.status(200).end();
    });

    request(app).get('/')
      .expect('X-XSS-Protection', '1; mode=block')
      .expect(200, done);
  });

  it('should respond with an enabled, custom mode header', function (done) {
    var config = {
      xssProtection: {
        enabled: 1,
        mode: 'foo'
      }
    };

    var app = mock(config);

    app.get('/', (req, res) => {
      res.status(200).end();
    });

    request(app).get('/')
      .expect('X-XSS-Protection', '1; mode=foo')
      .expect(200, done);
  });

  it('should respond with an enabled as boolean header', function (done) {
    var config = {
      xssProtection: {
        enabled: true
      }
    };

    var app = mock(config);

    app.get('/', (req, res) => {
      res.status(200).end();
    });

    request(app).get('/')
      .expect('X-XSS-Protection', '1; mode=block')
      .expect(200, done);
  });

  it('should respond with a disabled header', function (done) {
    var config = {
      xssProtection: {
        enabled: 0
      }
    };

    var app = mock(config);

    app.get('/', (req, res) => {
      res.status(200).end();
    });

    request(app).get('/')
      .expect('X-XSS-Protection', '0; mode=block')
      .expect(200, done);
  });

});