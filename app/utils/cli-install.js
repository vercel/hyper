const pify = require('pify');
const fs = require('fs');
const path = require('path');
const Registry = require('winreg');

const {cliScriptPath} = require('../config/paths');

const lstat = pify(fs.lstat);
const readlink = pify(fs.readlink);
const unlink = pify(fs.unlink);
const symlink = pify(fs.symlink);

const target = '/usr/local/bin/hyper';
const source = cliScriptPath;

const checkInstall = () => {
  return lstat(target)
    .then(stat => stat.isSymbolicLink())
    .then(() => readlink(target))
    .then(link => link === source)
    .catch(err => {
      if (err.code === 'ENOENT') {
        return false;
      }
      throw err;
    });
};

const createSymlink = () => {
  return unlink(target)
    .catch(err => {
      if (err.code === 'ENOENT') {
        return;
      }
      throw err;
    })
    .then(() => symlink(source, target));
};

exports.addSymlink = () => {
  return checkInstall().then(isInstalled => {
    if (isInstalled) {
      return Promise.resolve();
    }
    return createSymlink();
  });
};

exports.addBinToUserPath = () => {
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
          resolve();
          return;
        }

        // Because version is in path we need to remove old path if present and add current path
        newPathValue = pathParts
          .filter(pathPart => !pathPart.startsWith(basePath))
          .concat([binPath])
          .join(';');
      }

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
