'use strict';

const request = require('supertest');
const mock = require('./mocks/app');
const aegis = require('../index');
const assert = require('assert');

describe('nosniff', function () {

  it('should be a function', function () {
    assert(typeof aegis.nosniff === 'function');
  });

  it('should respond an enabled header', function (done) {
    var config = {
      nosniff: true
    };

    var app = mock(config);

    app.get('/', (req, res) => {
      res.status(200).end();
    });

    request(app).get('/')
      .expect('X-Content-Type-Options', 'nosniff')
      .expect(200, done);
  });

});