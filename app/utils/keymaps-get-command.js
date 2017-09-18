const {getKeymaps} = require('../config');
const findCommandByKeys = require('./keymaps-find-command-by-keys');

module.exports = keys => {
  return findCommandByKeys(keys, getKeymaps().keys);
};
