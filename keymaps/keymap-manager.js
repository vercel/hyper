const {readFileSync} = require('fs');
const {resolve} = require('path');
// const CommandRegistry = require('../keymaps/command-registry');

module.exports = class KeymapManager {
  constructor() {
    this.commands = [];
    const path = resolve('keymaps/darwin.json');
    try {
      let keys = [];
      const commands = JSON.parse(readFileSync(path));
      for(const command in commands) {
        this.commands[command] = commands[command]; 
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
  
}
