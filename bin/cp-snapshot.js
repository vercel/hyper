const path = require('path');
const fs = require('fs');
const {Arch} = require('electron-builder');

function copySnapshot(pathToElectron, archToCopy) {
  const snapshotFileName = 'snapshot_blob.bin';
  const v8ContextFileName = getV8ContextFileName(archToCopy);
  const pathToBlob = path.resolve(__dirname, '..', 'cache', archToCopy, snapshotFileName);
  const pathToBlobV8 = path.resolve(__dirname, '..', 'cache', archToCopy, v8ContextFileName);

  console.log('Copying v8 snapshots from', pathToBlob, 'to', pathToElectron);
  fs.copyFileSync(pathToBlob, path.join(pathToElectron, snapshotFileName));
  fs.copyFileSync(pathToBlobV8, path.join(pathToElectron, v8ContextFileName));
}

function getPathToElectron() {
  switch (process.platform) {
    case 'darwin':
      return path.resolve(
        __dirname,
        '..',
        'node_modules/electron/dist/Electron.app/Contents/Frameworks/Electron Framework.framework/Versions/A/Resources'
      );
    case 'win32':
    case 'linux':
      return path.resolve(__dirname, '..', 'node_modules', 'electron', 'dist');
  }
}

function getV8ContextFileName(archToCopy) {
  if (process.platform === 'darwin') {
    return `v8_context_snapshot${archToCopy === 'arm64' ? '.arm64' : '.x86_64'}.bin`;
  } else {
    return `v8_context_snapshot.bin`;
  }
}

exports.default = async (context) => {
  const archToCopy = Arch[context.arch];
  const pathToElectron =
    process.platform === 'darwin'
      ? `${context.appOutDir}/Hyper.app/Contents/Frameworks/Electron Framework.framework/Versions/A/Resources`
      : context.appOutDir;
  copySnapshot(pathToElectron, archToCopy);
};

if (require.main === module) {
  const archToCopy = process.env.npm_config_arch;
  const pathToElectron = getPathToElectron();
  if ((process.arch.startsWith('arm') ? 'arm64' : 'x64') === archToCopy) {
    copySnapshot(pathToElectron, archToCopy);
  }
}
