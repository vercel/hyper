const {shell} = require('electron');

module.exports = path => Promise.resolve(shell.openItem(path));

if (process.platform === 'win32') {
  const Registry = require('winreg');
  const {exec} = require('child_process');

  // Windows opens .js files with  WScript.exe by default
  // If the user hasn't set up an editor for .js files, we fallback to notepad.
  const getFileExtKeys = () =>
    new Promise((resolve, reject) => {
      Registry({
        hive: Registry.HKCU,
        key: '\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\FileExts\\.js'
      }).keys((error, keys) => {
        if (error) {
          reject(error);
        } else {
          resolve(keys || []);
        }
      });
    });

  const hasDefaultSet = async () => {
    const keys = await getFileExtKeys();

    const valueGroups = await Promise.all(
      keys.map(
        key =>
          new Promise((resolve, reject) => {
            key.values((error, items) => {
              if (error) {
                reject(error);
              }
              resolve(items.map(item => item.value || '') || []);
            });
          })
      )
    );

    const values = valueGroups
      .reduce((allValues, groupValues) => [...allValues, ...groupValues], [])
      .filter(value => value && typeof value === 'string');

    // No default app set
    if (values.length === 0) {
      return false;
    }

    // WScript is in default apps list
    if (values.some(value => value.includes('WScript.exe'))) {
      const userDefaults = values.filter(value => value.endsWith('.exe') && !value.includes('WScript.exe'));

      // WScript.exe is overidden
      return userDefaults.length > 0;
    }

    return true;
  };

  // This mimics shell.openItem, true if it worked, false if not.
  const openNotepad = file =>
    new Promise(resolve => {
      exec(`start notepad.exe ${file}`, error => {
        resolve(!error);
      });
    });

  module.exports = path =>
    hasDefaultSet()
      .then(yes => {
        if (yes) {
          return shell.openItem(path);
        }
        //eslint-disable-next-line no-console
        console.warn('No default app set for .js files, using notepad.exe fallback');
        return openNotepad(path);
      })
      .catch(err => {
        //eslint-disable-next-line no-console
        console.error('Open config with default app error:', err);
        return openNotepad(path);
      });
}
