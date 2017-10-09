const {cliScriptPath} = require('../config/paths');

const promisify = require('util.promisify');
const fs = require('fs');

const lstat = promisify(fs.lstat);
const readlink = promisify(fs.readlink);
const unlink = promisify(fs.unlink);
const symlink = promisify(fs.symlink);

const target = process.platform === 'darwin' ? '/usr/local/bin/hyper' : '/usr/bin/hyper';
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
  // TODO
  return Promise.resolve();
};
