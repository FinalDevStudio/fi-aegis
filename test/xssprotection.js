const request = require('supertest');
const assert = require('assert');

const mock = require('./mocks/app');
const aegis = require('../lib');

describe('xssProtection', function () {
  it('should be a function', function () {
    assert(typeof aegis.xssProtection === 'function');
  });

  it('should respond with an enabled as boolean header', function (done) {
    const config = {
      xssProtection: true
    };

    const app = mock(config);

    app.get('/', (req, res) => {
      res.status(200).end();
    });

    request(app).get('/')
      .expect('X-XSS-Protection', '1; mode=block')
      .expect(200, done);
  });

  it('should respond with an enabled, custom mode header', function (done) {
    const config = {
      xssProtection: {
        enabled: 1,
        mode: 'foo'
      }
    };

    const app = mock(config);

    app.get('/', (req, res) => {
      res.status(200).end();
    });

    request(app).get('/')
      .expect('X-XSS-Protection', '1; mode=foo')
      .expect(200, done);
  });

  it('should respond with an enabled as boolean', function (done) {
    const config = {
      xssProtection: {
        enabled: true
      }
    };

    const app = mock(config);

    app.get('/', (req, res) => {
      res.status(200).end();
    });

    request(app).get('/')
      .expect('X-XSS-Protection', '1; mode=block')
      .expect(200, done);
  });

  it('should respond with an enabled as an object string', function (done) {
    const config = {
      xssProtection: {
        enabled: '1'
      }
    };

    const app = mock(config);

    app.get('/', (req, res) => {
      res.status(200).end();
    });

    request(app).get('/')
      .expect('X-XSS-Protection', '1; mode=block')
      .expect(200, done);
  });

  it('should respond with a disabled header', function (done) {
    const config = {
      xssProtection: {
        enabled: 0
      }
    };

    const app = mock(config);

    app.get('/', (req, res) => {
      res.status(200).end();
    });

    request(app).get('/')
      .expect('X-XSS-Protection', '0; mode=block')
      .expect(200, done);
  });

});
