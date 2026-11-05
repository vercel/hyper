const fs = require('fs');
const path = require('path');
const {devDependencies} = require('../package.json');

if (require('electron-mksnapshot/package.json').version !== devDependencies.electron) {
  throw new Error('electron and electron-mksnapshot must use the same exact version');
}

process.env.ELECTRON_CUSTOM_VERSION = devDependencies.electron;
// Cross-architecture archives have different layouts; do not reuse old binaries.
fs.rmSync(path.join(path.dirname(require.resolve('electron-mksnapshot/package.json')), 'bin'), {
  recursive: true,
  force: true
});
require('electron-mksnapshot/download-mksnapshot');
