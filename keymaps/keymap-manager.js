const {readFileSync} = require('fs');
const {resolve} = require('path');
// const CommandRegistry = require('../keymaps/command-registry');

module.exports = class KeymapManager {
  constructor() {
    this.commands = [];
    const path = resolve('keymaps/darwin.json');
    try {
      const commands = JSON.parse(readFileSync(path));
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
