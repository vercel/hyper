if (process.platform === 'win32') {
  const exec = require('child_process').exec;

  module.exports = () => new Promise((resolve, reject) => {
    exec('ftype JSFile', (error, stdout) => {
      if (error) {
        reject(error);
      } else if (stdout && stdout.includes('WScript.exe')) {
        reject(new Error('WScript is the default editor for .js files'));
      } else {
        resolve();
      }
    });
  });
} else {
  module.exports = () => Promise.resolve();
}
