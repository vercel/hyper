// Application state fallback upon unexpected quit
const Config = require('electron-config');

// local storage
const rec = new Config();
const recordInterval = 1000;

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

module.exports.load = function (callback) {
  const reccords = rec.get('reccords');
  callback(reccords);
};
