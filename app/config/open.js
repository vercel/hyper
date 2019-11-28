import {shell} from 'electron';
import {cfgPath} from './paths';
export default () => Promise.resolve(shell.openItem(cfgPath));

// Windows opens .js files with  WScript.exe by default
// If the user hasn't set up an editor for .js files, we fallback to notepad.
if (process.platform === 'win32') {
  const Registry = require('winreg');
  const {exec} = require('child_process');

  const getUserChoiceKey = async () => {
    // Load FileExts keys for .js files
    const keys = await new Promise((resolve, reject) => {
      new Registry({
        hive: Registry.HKCU,
        key: '\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\FileExts\\.js'
      }).keys((error, items) => {
        if (error) {
          reject(error);
        } else {
          resolve(items || []);
        }
      });
    });

    // Find UserChoice key
    const userChoice = keys.find(k => k.key.endsWith('UserChoice'));
    return userChoice;
  };

  const hasDefaultSet = async () => {
    let userChoice = await getUserChoiceKey();
    if (!userChoice) return false;

    // Load key values
    let values = await new Promise((resolve, reject) => {
      userChoice.values((error, items) => {
        if (error) {
          reject(error);
        }
        resolve(items.map(item => item.value || '') || []);
      });
    });

    // Look for default program
    const hasDefaultProgramConfigured = values.every(
      value => value && typeof value === 'string' && !value.includes('WScript.exe') && !value.includes('JSFile')
    );

    return hasDefaultProgramConfigured;
  };

  // This mimics shell.openItem, true if it worked, false if not.
  const openNotepad = file =>
    new Promise(resolve => {
      exec(`start notepad.exe ${file}`, error => {
        resolve(!error);
      });
    });

  module.exports = () =>
    hasDefaultSet()
      .then(yes => {
        if (yes) {
          return shell.openItem(cfgPath);
        }
        //eslint-disable-next-line no-console
        console.warn('No default app set for .js files, using notepad.exe fallback');
        return openNotepad(cfgPath);
      })
      .catch(err => {
        //eslint-disable-next-line no-console
        console.error('Open config with default app error:', err);
        return openNotepad(cfgPath);
      });
}
