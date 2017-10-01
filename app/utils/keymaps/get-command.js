const {getKeymaps} = require('../../config');
const findCommandByKeys = require('./find-command-by-keys');

module.exports = keys => {
  return findCommandByKeys(keys, getKeymaps());
};
