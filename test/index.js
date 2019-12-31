const request = require('supertest');
const assert = require('assert');

const mock = require('./mocks/app');
const aegis = require('../lib');

describe('Fi Aegis', function () {
  it('should be a function', function () {
    assert(typeof aegis === 'function');
  });

  it('should set all headers', function (done) {
    const config = require('./mocks/config/all');

    const app = mock(config);

    app.get('/', (req, res) => {
      res.status(200).end();
    });

    request(app).get('/')
      .expect('Content-Security-Policy-Report-Only', `default-src *; report-uri ${ config.csp.reportUri }`) // csp
      .expect('Set-Cookie', /.*CSRF-TOKEN=.*/) // csrf
      .expect('Strict-Transport-Security', `max-age=${ config.hsts.maxAge }`) // hsts
      .expect('X-Content-Type-Options', 'nosniff') // nosniff
      .expect('X-FRAME-OPTIONS', config.xframe) // xframe
      .expect('X-XSS-Protection', '1; mode=block') // xssprotection
      .expect(200, done);
  });

});
