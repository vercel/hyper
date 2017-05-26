const {shell} = require('electron');
const {confPath} = require('./paths');

module.exports = () => Promise.resolve(shell.openItem(confPath));

if (process.platform === 'win32') {
  const exec = require('child_process').exec;

  // This mimics shell.openItem, true if it worked, false if not.
  const openNotepad = file => new Promise(resolve => {
    exec(`start notepad.exe ${file}`, error => {
      resolve(!error);
    });
  });

  // Windows opens .js files with  WScript.exe by default
  // If the user hasn't set up an editor for .js files, we fallback to notepad.
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
}
