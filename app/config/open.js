const {shell} = require('electron');
const {cfgPath} = require('./paths');

module.exports = () => Promise.resolve(shell.openItem(cfgPath));

if (process.platform === 'win32') {
  const Registry = require('winreg');
  const {exec} = require('child_process');

  // Windows opens .js files with  WScript.exe by default
  // If the user hasn't set up an editor for .js files, we fallback to notepad.
  const hasDefaultSet = () => new Promise((resolve, reject) => {
    Registry({
      hive: Registry.HKCU,
      key: '\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\FileExts\\.js'
    })
    .keyExists((error, exists) => {
      if (error) {
        reject(error);
      } else {
        resolve(exists);
      }
    });
  });

  // This mimics shell.openItem, true if it worked, false if not.
  const openNotepad = file => new Promise(resolve => {
    exec(`start notepad.exe ${file}`, error => {
      resolve(!error);
    });
  });

  module.exports = () => hasDefaultSet()
    .then(yes => {
      if (yes) {
        return shell.openItem(cfgPath);
      }
      console.warn('No default app set for .js files, using notepad.exe fallback');
      return openNotepad(cfgPath);
    })
    .catch(err => {
      console.error('Open config with default app error:', err);
      return openNotepad(cfgPath);
    });
}
