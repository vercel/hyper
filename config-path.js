const { homedir } = require('os');
const { resolve } = require('path');

module.exports = resolve(homedir(), '.hyperterm.js');
