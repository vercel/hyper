const KeymapManager = require('./keymaps/keymap-manager');
const config = require('./config');

module.exports = new KeymapManager(config.getKeymaps());