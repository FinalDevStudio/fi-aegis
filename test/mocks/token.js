'use strict';

var tokenModule = module.exports = {

  value: 'tokenAllTheThings',

  create: () => {
    return tokenModule.value;
  },

  validate: (req, token) => {
    return token === tokenModule.value;
  }

};