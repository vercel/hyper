const normalize = require('./keymaps-normalize');

module.exports = (keys, commands) => {
  return commands[normalize(keys)];
};
