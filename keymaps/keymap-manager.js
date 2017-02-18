const {readFileSync} = require('fs');
const {resolve} = require('path');
// const CommandRegistry = require('../keymaps/command-registry');

module.exports = class KeymapManager {
  constructor() {
    this.platform = process.platform;
    this.commands = {};
    this.keys = {};
    const path = () => {
      switch (this.platform) {
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
          this.keys[commands[command]] = command;
        }
      }
    } catch (err) {}
  }

  // decides if a keybard event is in Hyper keymap
  isCommands(e) {
    let keys = [];
    if (e.metaKey && this.platform === 'darwin') {
      keys.push('Cmd');
    } else if (e.metaKey) {
      keys.push(e.key);
    }

    if (e.ctrlKey) {
      keys.push('Ctrl');
    }

    if (e.shiftKey) {
      keys.push('Shift');
    }

    if (e.altKey) {
      keys.push('Alt');
    }
    if (e.key === ' ') {
      keys.push('space');
    } else if (e.key !== 'Meta' && e.key !== 'Control' && e.key !== 'Shift' && e.key !== 'Alt') {
      keys.push(e.key.replace('Arrow', ''));
    }

    keys = keys.join('+');

    return this.keys[keys];
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
