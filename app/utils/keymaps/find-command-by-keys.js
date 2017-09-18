const normalize = require('./normalize');

module.exports = (keys, commands) => {
  return commands[normalize(keys)];
};
