'use strict';

const request = require('supertest');
const mock = require('./mocks/app');
const aegis = require('../index');
const dd = require('data-driven');
const assert = require('assert');
const Chance = require('chance');

const ERR = require('../lib/errors');

const chance = new Chance();

const SESSION_OPTS = [{
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
  return cookies.map(val => val.replace('; path=/; httponly', '')).join('; ');
}

describe('CSRF', function () {

  it('should be a function', function () {
    assert(typeof aegis.csrf === 'function');
  });

  it('expects a thrown error if no session object', function (done) {
    const app = mock({
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

  dd(SESSION_OPTS, function () {

    it('GET requests should have a CSRF token (session type: {value})', function (ctx, done) {
      const mockConfig = (ctx.value === 'cookie') ? {
        csrf: {
          secret: 'csrfSecret'
        }
      } : {
        csrf: true
      };

      const app = mock(mockConfig, ctx.value);

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

    it('POST requests should be successful with valid token (session type: {value})', function (ctx, done) {
      const mockConfig = (ctx.value === 'cookie') ? {
        csrf: {
          secret: 'csrfSecret'
        }
      } : {
        csrf: true
      };

      const app = mock(mockConfig, ctx.value);

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

    describe('concurrent', function () {

      it('POST requests should be successful with valid token (session type: {value})', function (ctx, done) {
        const mockConfig = (ctx.value === 'cookie') ? {
          csrf: {
            secret: 'csrfSecret'
          }
        } : {
          csrf: true
        };

        const app = mock(mockConfig, ctx.value);
        const concurrency = 100;

        var completed = 0;

        app.all('/', (req, res) => {
          res.status(200).send({
            token: res.locals._csrf
          });
        });

        for (let i = 0, l = concurrency; i < l; i++) {
          request(app).get('/').end((err, res) => {
            request(app).post('/')
              .set('Cookie', mapCookies(res.headers['set-cookie']))
              .send({
                _csrf: res.body.token
              })
              .expect(200, () => {
                if (++completed === concurrency) {
                  done();
                }
              });
          });
        }
      });

    });

    it('POST requests should not be successful with invalid token (session type: {value})', function (ctx, done) {
      const mockConfig = (ctx.value === 'cookie') ? {
        csrf: {
          secret: 'csrfSecret'
        }
      } : {
        csrf: true
      };

      const app = mock(mockConfig, ctx.value);

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

    it('POST requests should not be successful on empty token (session type: {value})', function (ctx, done) {
      const mockConfig = (ctx.value === 'cookie') ? {
        csrf: {
          secret: 'csrfSecret'
        }
      } : {
        csrf: true
      };

      const app = mock(mockConfig, ctx.value);

      app.get('/', (req, res) => {
        res.status(200).end();
      });

      request(app).post('/')
        .expect(403)
        .end((err, res) => done(err)); // eslint-disable-line
    });

    it('Should allow custom keys (session type: {value})', function (ctx, done) {
      const mockConfig = (ctx.value === 'cookie') ? {
        csrf: {
          key: 'foobar',
          secret: 'csrfSecret'
        }
      } : {
        csrf: {
          key: 'foobar'
        }
      };

      const app = mock(mockConfig, ctx.value);

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
      const mockConfig = (ctx.value === 'cookie') ? {
        csrf: {
          secret: 'csrfSecret'
        }
      } : {
        csrf: true
      };

      const app = mock(mockConfig, ctx.value);

      app.all('/', (req, res) => {
        res.status(200).send({
          token: res.locals._csrf
        });
      });

      request(app).get('/')
        .end((err, res) => {
          request(app).post('/')
            .set('cookie', mapCookies(res.headers['set-cookie']))
            .set('csrf-token', res.body.token)
            .send({
              name: 'Test'
            })
            .expect(200, done);
        });
    });

    it('Should allow custom headers (session type: {value})', function (ctx, done) {
      const HEADER = chance.hash({
        length: 10
      });

      const mockConfig = (ctx.value === 'cookie') ? {
        csrf: {
          header: HEADER,
          secret: 'csrfSecret'
        }
      } : {
        csrf: {
          header: HEADER
        }
      };

      const app = mock(mockConfig, ctx.value);

      app.all('/', (req, res) => {
        res.status(200).send({
          token: res.locals._csrf
        });
      });

      request(app).get('/')
        .end((err, res) => {
          request(app).post('/')
            .set('cookie', mapCookies(res.headers['set-cookie']))
            .set(HEADER, res.body.token)
            .send({
              name: 'Test'
            })
            .expect(200, done);
        });
    });

    it('Should be case-insensitive to custom headers', function (ctx, done) {
      const mockConfig = (ctx.value === 'cookie') ? {
        csrf: {
          header: 'x-xsrf-token',
          secret: 'csrfSecret'
        }
      } : {
        csrf: {
          header: 'x-xsrf-token'
        }
      };

      const app = mock(mockConfig, ctx.value);

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
      const mockConfig = (ctx.value === 'cookie') ? {
        csrf: {
          secret: 'csrfSecret'
        }
      } : {
        csrf: {
          secret: '_csrfSecret'
        }
      };

      const app = mock(mockConfig, ctx.value);

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
      const myToken = require('./mocks/token');
      const mockConfig = {
        csrf: {
          impl: myToken
        }
      };

      const app = mock(mockConfig, ctx.value);

      app.all('/', (req, res) => {
        res.status(200).send({
          token: res.locals._csrf
        });
      });

      request(app).get('/')
        .end((err, res) => {
          assert(myToken.value === res.body.token);

          request(app).post('/')
            .send({
              _csrf: res.body.token
            })
            .expect(200, done);
        });
    });
  });

  it('Should set a cookie with the cookie option', function (done) {
    const app = mock({
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
      .end((err, res) => {
        assert(res.headers['set-cookie'].some(cookie => ~decodeURIComponent(cookie)
          .indexOf(res.body.token)));

        done();
      });
  });

  it('Should set a cookie with the cookie as object with name only', function (done) {
    const app = mock({
      csrf: {
        cookie: {
          name: 'COOKIE-NAME-CSRF'
        }
      }
    });

    app.all('/', (req, res) => {
      res.status(200).send({
        token: res.locals._csrf
      });
    });

    request(app).get('/')
      .end((err, res) => {
        assert(res.headers['set-cookie'].some(cookie => ~decodeURIComponent(cookie)
          .indexOf(res.body.token)));

        done();
      });
  });

  it('Should set options correctly with an angular shorthand option', function (done) {
    const cookieKey = 'XSRF-TOKEN';
    const header = 'X-XSRF-TOKEN';
    const app = mock({
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
        assert(res.headers['set-cookie'].some(cookie => ~decodeURIComponent(cookie)
          .indexOf(cookieKey + '=' + res.body.token)));

        request(app).post('/')
          .set('cookie', mapCookies(res.headers['set-cookie']))
          .set(header, res.body.token)
          .send({
            cool: 'stuff'
          })
          .expect(200, done);
      });
  });

  dd(SESSION_OPTS, function () {

    it('Should return the cached token for valid session on req.csrfToken (session type: {value})', function (ctx, done) {
      const key = 'foo';
      const mockConfig = (ctx.value === 'cookie') ? {
        csrf: {
          secret: 'csrfSecret',
          key
        }
      } : {
        csrf: {
          key
        }
      };

      const app = mock(mockConfig, ctx.value);

      app.get('/', (req, res, next) => {
        var token = res.locals[key];

        assert(req.csrfToken() === token, 'req.csrfToken should use cached token');
        assert(res.locals[key] === token, 'req.csrfToken should not mutate token');

        next();
      }, (req, res) => {
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

    it('Should generate a new token for invalid session on req.csrfToken (session type: {value})', function (ctx, done) {
      const key = 'foo';
      const secret = 'csrfSecret';
      const mockConfig = {
        csrf: {
          secret,
          key
        }
      };

      const app = mock(mockConfig, ctx.value);

      app.get('/', (req, res, next) => {
        delete req.session[secret];

        next();
      }, (req, res, next) => {
        var token = res.locals[key];

        assert(req.csrfToken() !== token, 'req.csrfToken should not use cached token');
        assert(res.locals[key] !== token, 'req.csrfToken should mutate token');

        token = res.locals[key];

        assert(req.csrfToken() === token, 'subsequent req.csrfToken should use cached token');

        next();
      }, (req, res) => {
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
          const obj = {};

          obj[key] = res.body.token;

          request(app).post('/')
            .set('Cookie', mapCookies(res.headers['set-cookie']))
            .send(obj)
            .expect(200, done);
        });
    });

  });

  dd(SESSION_OPTS, function () {

    it('Should set a cookie with the cookie as object with name and options.sameSite (session type: {value})', function (ctx, done) {
      const key = 'XSRF';
      const mockConfig = (ctx.value === 'cookie') ? {
        csrf: {
          secret: 'csrfSecret',
          cookie: {
            name: key,
            options: {
              sameSite: true
            }
          },
          key
        }
      } : {
        csrf: {
          cookie: {
            name: key,
            options: {
              sameSite: true
            }
          },
          key
        }
      };

      const app = mock(mockConfig);

      app.all('/', (req, res) => {
        res.status(200).send({
          token: res.locals[key]
        });
      });

      request(app).get('/')
        .end((err, res) => {
          assert(res.headers['set-cookie'].some(cookie => ~decodeURIComponent(cookie)
            .indexOf(res.body.token)));

          assert(res.headers['set-cookie'].some(cookie => ~decodeURIComponent(cookie)
            .indexOf('SameSite=Strict')));

          done();
        });
    });

    it('Should set a cookie with the cookie as object with name and options.secure (session type: {value})', function (ctx, done) {
      const key = 'XSRF';
      const mockConfig = (ctx.value === 'cookie') ? {
        csrf: {
          secret: 'csrfSecret',
          cookie: {
            name: key,
            options: {
              secure: true
            }
          },
          key
        }
      } : {
        csrf: {
          cookie: {
            name: key,
            options: {
              secure: true
            }
          },
          key
        }
      };

      const app = mock(mockConfig);

      app.all('/', (req, res) => {
        res.status(200).send({
          token: res.locals[key]
        });
      });

      request(app).get('/')
        .end((err, res) => {
          assert(res.headers['set-cookie'].some(cookie => ~decodeURIComponent(cookie)
            .indexOf(res.body.token)));

          assert(res.headers['set-cookie'].some(cookie => ~decodeURIComponent(cookie)
            .indexOf('Secure')));

          done();
        });
    });

    it('Should set a cookie with the cookie as object with name and options.httpOnly (session type: {value})', function (ctx, done) {
      const key = 'XSRF';
      const mockConfig = (ctx.value === 'cookie') ? {
        csrf: {
          secret: 'csrfSecret',
          cookie: {
            name: key,
            options: {
              secure: true
            }
          },
          key
        }
      } : {
        csrf: {
          cookie: {
            name: key,
            options: {
              secure: true
            }
          },
          key
        }
      };

      const app = mock(mockConfig);

      app.all('/', (req, res) => {
        res.status(200).send({
          token: res.locals[key]
        });
      });

      request(app).get('/')
        .end((err, res) => {
          assert(res.headers['set-cookie'].some(cookie => ~decodeURIComponent(cookie)
            .indexOf(res.body.token)));

          assert(res.headers['set-cookie'].some(cookie => ~decodeURIComponent(cookie)
            .indexOf('HttpOnly')));

          done();
        });
    });

    it('Should set a cookie with the cookie as object with name and all options (session type: {value})', function (ctx, done) {
      const key = 'XSRF';
      const mockConfig = (ctx.value === 'cookie') ? {
        csrf: {
          secret: 'csrfSecret',
          cookie: {
            name: key,
            options: {
              secure: true,
              httpOnly: true,
              sameSite: true
            }
          },
          key
        }
      } : {
        csrf: {
          cookie: {
            name: key,
            options: {
              secure: true,
              httpOnly: true,
              sameSite: true
            }
          },
          key
        }
      };

      const app = mock(mockConfig);

      app.all('/', (req, res) => {
        res.status(200).send({
          token: res.locals[key]
        });
      });

      request(app).get('/')
        .end((err, res) => {
          assert(res.headers['set-cookie'].some(cookie => ~decodeURIComponent(cookie)
            .indexOf(res.body.token)));

          assert(res.headers['set-cookie'].some(cookie => ~decodeURIComponent(cookie)
            .indexOf('HttpOnly')));

          assert(res.headers['set-cookie'].some(cookie => ~decodeURIComponent(cookie)
            .indexOf('Secure')));

          assert(res.headers['set-cookie'].some(cookie => ~decodeURIComponent(cookie)
            .indexOf('SameSite=Strict')));

          done();
        });
    });

  });

});