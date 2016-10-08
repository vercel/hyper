// Application state fallback upon unexpected quit
const {app} = require('electron');
const Config = require('electron-config');
const wins = require('./windows');

// local storage
const rec = new Config();
const recordInterval = 2000;

module.exports.save = function (windows) {
  setInterval(() => {
    const states = [];
    windows.forEach(win => {
      win.record(state => {
        states.push(state);
      });
    });
    rec.set('reccords', states);
  }, recordInterval);
};

module.exports.load = function () {
  const reccords = rec.get('reccords');
  if (reccords.length > 0) {
    reccords.forEach(rec => {
      app.createWindow(win => {
        win.restore(rec.tabs);
      }, {position: rec.position, size: rec.size, tabs: rec.tabs});
    });
  } else {
    // when no reccords
    // when opening create a new window
    app.createWindow();
  }

  // start save scheduler
  this.save(wins.get());
};
