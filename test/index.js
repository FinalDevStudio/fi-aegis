'use strict';

const aegis = require('../index');
const request = require('supertest');
const assert = require('assert');
const mock = require('./mocks/app');

describe('Fi Aegis', function () {

  it('should be a function', function () {
    assert(typeof aegis === 'function');
  });

  it('should set all headers', function (done) {
    var config = require('./mocks/config/all');

    var app = mock(config);

    app.get('/', function (req, res) {
      res.status(200).end();
    });

    request(app).get('/')
      .expect('X-FRAME-OPTIONS', config.xframe)
      .expect('P3P', config.p3p)
      .expect('Strict-Transport-Security', `max-age=${ config.hsts.maxAge }`)
      .expect('Content-Security-Policy-Report-Only', `default-src *; report-uri ${ config.csp.reportUri }`)
      .expect('X-XSS-Protection', '1; mode=block')
      .expect(200, done);
  });

});