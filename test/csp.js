const request = require('supertest');
const assert = require('assert');

const mock = require('./mocks/app');
const aegis = require('../lib');

describe('CSP', function () {
  it('should be a function', function () {
    assert(typeof aegis.csp === 'function');
  });

  it('should throw if misconfigured', function () {
    assert.throws(() => {
      aegis.csp(new Date());
    }, Error);
  });

  it('should respond a report header', function (done) {
    const config = require('./mocks/config/cspReport');

    const app = mock({
      csp: config
    });

    app.get('/', (req, res) => {
      res.status(200).end();
    });

    request(app).get('/')
      .expect('Content-Security-Policy-Report-Only', `default-src *; report-uri ${config.reportUri}`)
      .expect(200, done);
  });

  describe('should respond an enforce header', function () {

    it('object config', function (done) {
      const config = require('./mocks/config/cspEnforce');

      const app = mock({
        csp: config
      });

      app.get('/', (req, res) => {
        res.status(200).end();
      });

      request(app).get('/')
        .expect('Content-Security-Policy', 'default-src *')
        .expect(200, done);
    });

    it('should respond a header via string config', function (done) {
      const config = require('./mocks/config/cspString');

      const app = mock({
        csp: config
      });

      app.get('/', (req, res) => {
        res.status(200).end();
      });

      request(app).get('/')
        .expect('Content-Security-Policy', 'default-src *')
        .expect(200, done);
    });

    it('should respond a header via array config', function (done) {
      const config = require('./mocks/config/cspArray');

      const app = mock({
        csp: config
      });

      app.get('/', (req, res) => {
        res.status(200).end();
      });

      request(app).get('/')
        .expect('Content-Security-Policy', 'default-src *; img-src *')
        .expect(200, done);
    });

    it('should respond a header via nested config', function (done) {
      const config = require('./mocks/config/cspNested');

      const app = mock({
        csp: config
      });

      app.get('/', (req, res) => {
        res.status(200).end();
      });

      request(app).get('/')
        .expect('Content-Security-Policy', 'default-src *; img-src *')
        .expect(200, done);
    });
  });
});
