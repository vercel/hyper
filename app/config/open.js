const {shell} = require('electron');
const {cfgPath} = require('./paths');

module.exports = () => Promise.resolve(shell.openItem(cfgPath));

if (process.platform === 'win32') {
  const Registry = require('winreg');
  const {exec} = require('child_process');

  // Windows opens .js files with  WScript.exe by default
  // If the user hasn't set up an editor for .js files, we fallback to notepad.
  const hasDefaultApp = () => new Promise((resolve, reject) => {
    Registry({
      hive: Registry.HKCU,
      key: '\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\FileExts\\.js'
    })
    .keyExists((error, exists) => {
      if (error) {
        reject(error);
      } else if (exists) {
        resolve(exists);
      } else {
        reject(new Error('No associations for .js exists'));
      }
    });
  });

  // This mimics shell.openItem, true if it worked, false if not.
  const openNotepad = file => new Promise(resolve => {
    exec(`start notepad.exe ${file}`, error => {
      resolve(!error);
    });
  });

  module.exports = () => hasDefaultApp()
    .then(() => shell.openItem(cfgPath))
    .catch(err => {
      console.error('Error opening config with default app:', err);
      openNotepad(cfgPath);
    });
}
