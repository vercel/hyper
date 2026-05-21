const {devDependencies} = require('../package.json');

if (!process.env.ELECTRON_CUSTOM_VERSION) {
  process.env.ELECTRON_CUSTOM_VERSION = devDependencies.electron;
}

require('electron-mksnapshot/download-mksnapshot');
