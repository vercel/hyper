const {BrowserWindow} = require('electron');

module.exports = class Window extends BrowserWindow {
  constructor() {
    super();
    console.log('nwin');
  }
}