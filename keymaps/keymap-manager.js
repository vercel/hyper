const {readFileSync} = require('fs');
const {resolve} = require('path');
// const CommandRegistry = require('../keymaps/command-registry');

module.exports = class KeymapManager {
  constructor() {
    this.commands = [];
    const path = () => {
      switch (process.platform) {
        case 'darwin': return resolve('keymaps/darwin.json');
        case 'win32': return resolve('keymaps/win32.json');
        case 'linux': return resolve('keymaps/linux.json');
        default: return resolve('keymaps/darwin.json');
      }
    };

    try {
      const commands = JSON.parse(readFileSync(path()));
      for (const command in commands) {
        if (command) {
          this.commands[command] = commands[command];
        }
      }
    } catch (err) {
    }
  }

  attach() {

  }

  destroy() {

  }

  clear() {

  }

  commandRegistered() {

  }

};
