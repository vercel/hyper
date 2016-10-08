// Application state fallback upon unexpected quit
const Config = require('electron-config');
// const Window = require('./window');

// const wins = new Set([]);

// module.exports.pushWin = function (win) {
//   wins.add(win);
// };

// module.exports.rm = function (win) {
//   wins.delete(win);
// };

// local storage
const rec = new Config();
const recordInterval = 1000;

module.exports.save = function (windows) {
  setInterval(() => {
    const states = [];
    windows.forEach(win => {
      console.log(win.record());
      // states.push({size: win.getSize(), position: win.getPosition()});
    });
    rec.set('reccords', states);
  }, recordInterval);
};

// module.exports.save = function (windows) {
//   setInterval(() => {
//     const states = [];
//     windows.forEach(win => {
//       // console.log(win.rpc);
//           win.sessions.forEach((session, key) => {
//             // console.log(session);
//             // console.log(key);
//             // console.log(Terms.getTermByUid(key));
//           });
//       states.push({size: win.getSize(), position: win.getPosition()});
//     });
//     rec.set('reccords', states);
//   }, recordInterval);
// };
//
// module.exports.load = function (callback) {
//   const reccords = rec.get('reccords');
//   // console.log(reccords);
//   callback(reccords);
// };
