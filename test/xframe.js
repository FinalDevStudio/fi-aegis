const request = require('supertest');
const assert = require('assert');

const mock = require('./mocks/app');
const aegis = require('../lib');

describe('XFRAME', function () {
  it('should be a function', function () {
    assert(typeof aegis.xframe === 'function');
  });

  it('should respond with a DENY header', function (done) {
    const config = {
      xframe: 'DENY'
    };

    const app = mock(config);

    app.get('/', (req, res) => {
      res.status(200).end();
    });

    request(app).get('/')
      .expect('X-FRAME-OPTIONS', config.xframe)
      .expect(200, done);
  });

  it('should respond with a SAMEORIGIN header', function (done) {
    const config = {
      xframe: 'SAMEORIGIN'
    };

    const app = mock(config);

    app.get('/', (req, res) => {
      res.status(200).end();
    });

    request(app).get('/')
      .expect('X-FRAME-OPTIONS', config.xframe)
      .expect(200, done);
  });

  describe('on concurrent requests', function () {

    it('should respond with a DENY header', function (done) {
      const config = {
        xframe: 'DENY'
      };

      const app = mock(config);
      const concurrency = 100;
      let completed = 0;

      app.get('/', (req, res) => {
        res.status(200).end();
      });

      /**
       * Done checker.
       */
      function checkIfDone() {
        if (++completed === concurrency) {
          done();
        }
      }

      for (let i = 0, l = concurrency; i < l; i++) {
        request(app).get('/')
          .expect('X-FRAME-OPTIONS', config.xframe)
          .expect(200, checkIfDone);
      }
    });
  });
});
