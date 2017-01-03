// Application state fallback upon unexpected quit
const {app} = require('electron');
const Config = require('electron-config');
const wins = require('./windows');

// local storage
const rec = new Config();
const recordInterval = 2000;
let lastSession;

module.exports.save = function (windows) {
  setInterval(() => {
    const states = [];
    windows.forEach(win => {
      win.record(state => {
        states.push(state);
      });
    });
    rec.set('records', states);
  }, recordInterval);
};

module.exports.store = function (payload) {
  clearTimeout(lastSession);
  rec.set('lastSession', payload);
  console.log(rec.get('lastSession'));
  lastSession = setTimeout(() => {
    console.log('delete session completly');
    rec.delete('lastSession');
  }, 10000);
};

module.exports.restore = function () {
  clearTimeout(lastSession);
  const relst = rec.get('lastSession');
  if (relst) {
    rec.delete('lastSession');
  }
  return relst;
};

module.exports.load = function () {
  const records = rec.get('records');
  if (records && records.length > 0) {
    records.forEach(rec => {
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
