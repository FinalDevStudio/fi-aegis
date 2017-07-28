'use strict';

var value = 'tokenAllTheThings';

module.exports = {

  create: () => value,

  validate: (req, token) => token === value,

  value

};