const pify = require('pify');
const fs = require('fs');
const path = require('path');
const Registry = require('winreg');

const notify = require('../notify');

const {cliScriptPath, cliLinkPath} = require('../config/paths');

const readlink = pify(fs.readlink);
const symlink = pify(fs.symlink);

const checkInstall = () => {
  return readlink(cliLinkPath)
    .then(link => link === cliScriptPath)
    .catch(err => {
      if (err.code === 'ENOENT') {
        return false;
      }
      throw err;
    });
};

const addSymlink = () => {
  return checkInstall().then(isInstalled => {
    if (isInstalled) {
      //eslint-disable-next-line no-console
      console.log('Hyper CLI already in PATH');
      return Promise.resolve();
    }
    //eslint-disable-next-line no-console
    console.log('Linking HyperCLI');
    return symlink(cliScriptPath, cliLinkPath);
  });
};

const addBinToUserPath = () => {
  // Can't use pify because of param order of Registry.values callback
  return new Promise((resolve, reject) => {
    const envKey = new Registry({hive: 'HKCU', key: '\\Environment'});
    envKey.values((err, items) => {
      if (err) {
        reject(err);
        return;
      }
      // C:\Users\<user>\AppData\Local\hyper\app-<version>\resources\bin
      const binPath = path.dirname(cliScriptPath);
      // C:\Users\<user>\AppData\Local\hyper
      const basePath = path.resolve(binPath, '../../..');

      const pathItem = items.find(item => item.name.toUpperCase() === 'PATH');

      let newPathValue = binPath;
      const pathItemName = pathItem ? pathItem.name : 'PATH';
      if (pathItem) {
        const pathParts = pathItem.value.split(';');
        const existingPath = pathParts.find(pathPart => pathPart === binPath);
        if (existingPath) {
          //eslint-disable-next-line no-console
          console.log('Hyper CLI already in PATH');
          resolve();
          return;
        }

        // Because version is in path we need to remove old path if present and add current path
        newPathValue = pathParts
          .filter(pathPart => !pathPart.startsWith(basePath))
          .concat([binPath])
          .join(';');
      }
      //eslint-disable-next-line no-console
      console.log('Adding HyperCLI path (registry)');
      envKey.set(pathItemName, Registry.REG_SZ, newPathValue, error => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  });
};

const logNotify = (withNotification, ...args) => {
  //eslint-disable-next-line no-console
  console.log(...args);
  withNotification && notify(...args);
};

exports.installCLI = withNotification => {
  if (process.platform === 'win32') {
    addBinToUserPath()
      .then(() =>
        logNotify(
          withNotification,
          'Hyper CLI installed',
          'You may need to restart your computer to complete this installation process.'
        )
      )
      .catch(err =>
        logNotify(withNotification, 'Hyper CLI installation failed', `Failed to add Hyper CLI path to user PATH ${err}`)
      );
  } else if (process.platform === 'darwin') {
    addSymlink()
      .then(() => logNotify(withNotification, 'Hyper CLI installed', `Symlink created at ${cliLinkPath}`))
      .catch(err => {
        // 'EINVAL' is returned by readlink,
        // 'EEXIST' is returned by symlink
        const error =
          err.code === 'EEXIST' || err.code === 'EINVAL'
            ? `File already exists: ${cliLinkPath}`
            : `Symlink creation failed: ${err.code}`;

        //eslint-disable-next-line no-console
        console.error(err);
        logNotify(withNotification, 'Hyper CLI installation failed', error);
      });
  } else {
    withNotification &&
      notify('Hyper CLI installation', 'Command is added in PATH only at package installation. Please reinstall.');
  }
};
