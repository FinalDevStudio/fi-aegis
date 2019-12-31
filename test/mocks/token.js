const Chance = require('chance');
const chance = new Chance();

const value = chance.string();

module.exports = {
  create: () => value,
  validate: (req, token) => token === value,
  value
};
