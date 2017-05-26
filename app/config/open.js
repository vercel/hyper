const {shell} = require('electron');
const {confPath} = require('./paths');

if (process.platform === 'win32') {
  const exec = require('child_process').exec;

  const openNotepad = file => new Promise((resolve, reject) => {
    exec(`start notepad.exe ${file}`, error => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });

  const canOpenNative = () => new Promise((resolve, reject) => {
    exec('ftype JSFile', (error, stdout) => {
      if (error) {
        reject(error);
      } else if (stdout && stdout.includes('WScript.exe')) {
        reject(new Error('WScript is the default editor for .js files'));
      } else {
        resolve(true);
      }
    });
  });

  module.exports = () => canOpenNative()
    .then(() => shell.openItem(confPath))
    .catch(() => openNotepad(confPath));
} else {
  module.exports = () => Promise.resolve(shell.openItem(confPath));
}
