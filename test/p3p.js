'use strict';

const aegis = require('../index');
const request = require('supertest');
const assert = require('assert');
const mock = require('./mocks/app');

describe('P3P', function () {

  it('should be a function', function () {
    assert(typeof aegis.p3p === 'function');
  });

  it('should respond the custom P3P header', function (done) {
    var config = {
      p3p: 'MY_P3P_VALUE'
    };

    var app = mock(config);

    app.get('/', (req, res) => {
      res.status(200).end();
    });

    request(app).get('/')
      .expect('P3P', config.p3p)
      .expect(200, done);
  });

});