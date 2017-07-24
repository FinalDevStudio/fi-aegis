'use strict';

const aegis = require('../index');
const request = require('supertest');
const assert = require('assert');
const mock = require('./mocks/app');
const dd = require('data-driven');

const ERR = require('../lib/errors');

const sessionOptions = [{
  value: 'session'
}, {
  value: 'cookie'
}];

/**
 * Maps cookie values.
 *
 * @param {Array} cookies Cookies array.
 *
 * @returns {String} Mapped cookies.
 */
function mapCookies(cookies) {
  return cookies.map(function (r) {
    return r.replace('; path=/; httponly', '');
  }).join('; ');
}

describe('CSRF', function () {

  it('should be a function', function () {
    assert(typeof aegis.csrf === 'function');
  });

  it('expects a thrown error if no session object', function (done) {
    var app = mock({
      csrf: true
    }, 'none');

    app.get('/', (req, res) => {
      res.send(200, {
        token: res.locals._csrf
      });
    });

    request(app).get('/')
      .expect(500)
      .end((err, res) => {
        assert(res.text.match(ERR.SESSION_INVALID));
        done(err);
      });
  });

  dd(sessionOptions, function () {
    it('GETs have a CSRF token (session type: {value})', function (ctx, done) {
      var mockConfig = (ctx.value === 'cookie') ? {
        csrf: {
          secret: 'csrfSecret'
        }
      } : {
        csrf: true
      };

      var app = mock(mockConfig, ctx.value);

      app.get('/', (req, res) => {
        res.status(200).send({
          token: res.locals._csrf
        });
      });

      request(app).get('/')
        .expect(200)
        .end((err, res) => {
          assert(res.body.token);
          done(err);
        });
    });

    it('POST (200 OK with token) (session type: {value})', function (ctx, done) {
      var mockConfig = (ctx.value === 'cookie') ? {
        csrf: {
          secret: 'csrfSecret'
        }
      } : {
        csrf: true
      };

      var app = mock(mockConfig, ctx.value);

      app.all('/', (req, res) => {
        res.status(200).send({
          token: res.locals._csrf
        });
      });

      request(app).get('/').end((err, res) => {
        request(app).post('/')
          .set('Cookie', mapCookies(res.headers['set-cookie']))
          .send({
            _csrf: res.body.token
          })
          .expect(200, done);
      });
    });

    describe('concurrent requests', function () {
      it('POST (200 OK with token) (session type: {value})', function (ctx, done) {
        var mockConfig = (ctx.value === 'cookie') ? {
          csrf: {
            secret: 'csrfSecret'
          }
        } : {
          csrf: true
        };

        var app = mock(mockConfig, ctx.value);
        var concurrency = 100;
        var completed = 0;

        app.all('/', (req, res) => {
          res.status(200).send({
            token: res.locals._csrf
          });
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
          request(app).get('/').end((err, res) => {
            request(app).post('/')
              .set('Cookie', mapCookies(res.headers['set-cookie']))
              .send({
                _csrf: res.body.token
              })
              .expect(200, checkIfDone);
          });
        }
      });
    });

    it('POST (403 Forbidden on invalid token) (session type: {value})', function (ctx, done) {
      var mockConfig = (ctx.value === 'cookie') ? {
        csrf: {
          secret: 'csrfSecret'
        }
      } : {
        csrf: true
      };

      var app = mock(mockConfig, ctx.value);

      app.all('/', (req, res) => {
        res.status(200).send({
          token: Math.random()
        });
      });

      request(app).get('/').end((err, res) => {
        request(app).post('/')
          .set('Cookie', mapCookies(res.headers['set-cookie']))
          .send({
            _csrf: res.body.token
          })
          .expect(403)
          .end((err, res) => done(err)); // eslint-disable-line
      });
    });

    it('POST (403 Forbidden on no token) (session type: {value})', function (ctx, done) {
      var mockConfig = (ctx.value === 'cookie') ? {
        csrf: {
          secret: 'csrfSecret'
        }
      } : {
        csrf: true
      };

      var app = mock(mockConfig, ctx.value);

      app.get('/', (req, res) => {
        res.status(200).end();
      });

      request(app).post('/')
        .expect(403)
        .end((err, res) => done(err)); // eslint-disable-line
    });

    it('Should allow custom keys (session type: {value})', function (ctx, done) {
      var mockConfig = (ctx.value === 'cookie') ? {
        csrf: {
          key: 'foobar',
          secret: 'csrfSecret'
        }
      } : {
        csrf: {
          key: 'foobar'
        }
      };

      var app = mock(mockConfig, ctx.value);

      app.all('/', (req, res) => {
        res.status(200).send({
          token: res.locals.foobar
        });
      });

      request(app).get('/')
        .end((err, res) => {
          request(app).post('/')
            .set('cookie', mapCookies(res.headers['set-cookie']))
            .send({
              foobar: res.body.token
            })
            .expect(200, done);
        });
    });

    it('Token can be sent through header instead of post body (session type: {value})', function (ctx, done) {
      var mockConfig = (ctx.value === 'cookie') ? {
        csrf: {
          secret: 'csrfSecret'
        }
      } : {
        csrf: true
      };

      var app = mock(mockConfig, ctx.value);

      app.all('/', (req, res) => {
        res.status(200).send({
          token: res.locals._csrf
        });
      });

      request(app).get('/')
        .end((err, res) => {
          request(app).post('/')
            .set('cookie', mapCookies(res.headers['set-cookie']))
            .set('x-csrf-token', res.body.token)
            .send({
              name: 'Test'
            })
            .expect(200, done);
        });
    });

    it('Should allow custom headers (session type: {value})', function (ctx, done) {
      var mockConfig = (ctx.value === 'cookie') ? {
        csrf: {
          header: 'x-xsrf-token',
          secret: 'csrfSecret'
        }
      } : {
        csrf: {
          header: 'x-xsrf-token'
        }
      };

      var app = mock(mockConfig, ctx.value);

      app.all('/', (req, res) => {
        res.status(200).send({
          token: res.locals._csrf
        });
      });

      request(app).get('/')
        .end((err, res) => {
          request(app).post('/')
            .set('cookie', mapCookies(res.headers['set-cookie']))
            .set('x-xsrf-token', res.body.token)
            .send({
              name: 'Test'
            })
            .expect(200, done);
        });
    });

    it('Should be case-insensitive to custom headers', function (ctx, done) {
      var mockConfig = (ctx.value === 'cookie') ? {
        csrf: {
          header: 'x-xsrf-token',
          secret: 'csrfSecret'
        }
      } : {
        csrf: {
          header: 'x-xsrf-token'
        }
      };

      var app = mock(mockConfig, ctx.value);

      app.all('/', (req, res) => {
        res.status(200).send({
          token: res.locals._csrf
        });
      });

      request(app).get('/')
        .end((err, res) => {
          request(app).post('/')
            .set('cookie', mapCookies(res.headers['set-cookie']))
            .set('X-xsrf-token', res.body.token)
            .send({
              name: 'Test'
            })
            .expect(200, done);
        });
    });

    it('Should allow custom secret key (session type: {value})', function (ctx, done) {
      var mockConfig = (ctx.value === 'cookie') ? {
        csrf: {
          secret: 'csrfSecret'
        }
      } : {
        csrf: {
          secret: '_csrfSecret'
        }
      };

      var app = mock(mockConfig, ctx.value);

      app.all('/', (req, res) => {
        res.status(200).send({
          token: res.locals._csrf
        });
      });

      request(app).get('/')
        .end((err, res) => {
          request(app).post('/')
            .set('cookie', mapCookies(res.headers['set-cookie']))
            .send({
              _csrf: res.body.token
            })
            .expect(200, done);
        });
    });

    it('Should allow custom functions (session type: {value})', function (ctx, done) {
      var myToken = require('./mocks/token');
      var mockConfig = {
        csrf: {
          impl: myToken
        }
      };

      var app = mock(mockConfig, ctx.value);

      app.all('/', (req, res) => {
        res.status(200).send({
          token: res.locals._csrf
        });
      });

      request(app).get('/')
        .end((err, res) => {
          assert(myToken.value === res.body.token);

          request(app).post('/')
            //.set('cookie', mapCookies(res.headers['set-cookie']))
            .send({
              _csrf: res.body.token
            })
            .expect(200, done);
        });
    });
  });

  it('Should set a cookie with the cookie option', function (done) {
    var app = mock({
      csrf: {
        cookie: 'CSRF'
      }
    });

    app.all('/', (req, res) => {
      res.status(200).send({
        token: res.locals._csrf
      });
    });

    request(app).get('/')
      .end(function (err, res) {
        /**
         * Finds the token value inside a cookie.
         *
         * @param {String} cookie The cookie string.
         *
         * @returns {String} The token value.
         */
        function findToken(cookie) {
          cookie = decodeURIComponent(cookie);

          return ~cookie.indexOf(res.body.token);
        }

        assert(res.headers['set-cookie'].some(findToken));

        done();
      });
  });

  it('Should set options correctly with an angular shorthand option', function (done) {
    var cookieKey = 'XSRF-TOKEN';
    var header = 'X-XSRF-TOKEN';
    var app = mock({
      csrf: {
        secret: '_csrfSecret',
        angular: true
      }
    });

    app.all('/', (req, res) => {
      res.status(200).send({
        token: res.locals._csrf
      });
    });

    request(app).get('/')
      .end(function (err, res) {
        /**
         * Finds the token value inside a cookie.
         *
         * @param {String} cookie The cookie string.
         *
         * @returns {String} The token value.
         */
        function findToken(cookie) {
          cookie = decodeURIComponent(cookie);

          return ~cookie.indexOf(cookieKey + '=' + res.body.token);
        }

        assert(res.headers['set-cookie'].some(findToken));

        request(app).post('/')
          .set('cookie', mapCookies(res.headers['set-cookie']))
          .set(header, res.body.token)
          .send({
            cool: 'stuff'
          })
          .expect(200, done);
      });
  });

  dd(sessionOptions, function () {
    it('Should return the cached token for valid session on req.csrfToken', function (ctx, done) {
      var key = 'foo';
      var mockConfig = (ctx.value === 'cookie') ? {
        csrf: {
          secret: 'csrfSecret',
          key
        }
      } : {
        csrf: {
          key
        }
      };

      var app = mock(mockConfig, ctx.value);

      /**
       * Calls the CSRF token.
       *
       * @param {String} req Express request object.
       * @param {String} res Express response object.
       * @param {Function} next Express next middleware callback.
       */
      function callCsrfToken(req, res, next) {
        var token = res.locals[key];

        assert(req.csrfToken() === token, 'req.csrfToken should use cached token');
        assert(res.locals[key] === token, 'req.csrfToken should not mutate token');

        next();
      }

      app.get('/', callCsrfToken, (req, res) => {
        res.status(200).send({
          token: res.locals[key]
        });
      });

      app.post('/', (req, res) => {
        res.status(200).send({
          token: res.locals[key]
        });
      });

      request(app).get('/')
        .end(function (err, res) {
          var obj = {};
          obj[key] = res.body.token;

          request(app).post('/')
            .set('Cookie', mapCookies(res.headers['set-cookie']))
            .send(obj)
            .expect(200, done);
        });
    });

    it('Should generate a new token for invalid session on req.csrfToken', function (ctx, done) {
      var key = 'foo';
      var secret = 'csrfSecret';
      var mockConfig = {
        csrf: {
          secret,
          key
        }
      };

      var app = mock(mockConfig, ctx.value);

      /**
       * Destroys the session secret.
       *
       * @param {String} req Express request object.
       * @param {String} res Express response object.
       * @param {Function} next Express next middleware callback.
       */
      function destroy(req, res, next) {
        delete req.session[secret];

        next();
      }

      /**
       * Calls the CSRF token.
       *
       * @param {String} req Express request object.
       * @param {String} res Express response object.
       * @param {Function} next Express next middleware callback.
       */
      function callCsrfToken(req, res, next) {
        var token = res.locals[key];

        assert(req.csrfToken() !== token, 'req.csrfToken should not use cached token');
        assert(res.locals[key] !== token, 'req.csrfToken should mutate token');

        token = res.locals[key];

        assert(req.csrfToken() === token, 'subsequent req.csrfToken should use cached token');

        next();
      }

      app.get('/', destroy, callCsrfToken, (req, res) => {
        res.status(200).send({
          token: res.locals[key]
        });
      });

      app.post('/', (req, res) => {
        res.status(200).send({
          token: res.locals[key]
        });
      });

      request(app).get('/')
        .end((err, res) => {
          var obj = {};

          obj[key] = res.body.token;

          request(app).post('/')
            .set('Cookie', mapCookies(res.headers['set-cookie']))
            .send(obj)
            .expect(200, done);
        });
    });
  });

});