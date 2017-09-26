const {normalize} = require('./normalize');

module.exports = (keys, keymap) => {
  return keymap[normalize(keys)];
};
