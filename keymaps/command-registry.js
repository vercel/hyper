const {readFileSync} = require('fs');
const {resolve} = require('path');

module.exports = class CommandRegistry {
  constructor() {
    this.commands = null;
    const path = resolve('keymaps/darwin.json');
    try {
      this.commands = JSON.parse(readFileSync(path));
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
