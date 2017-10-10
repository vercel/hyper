const {cliScriptPath} = require('../config/paths');

const pify = require('pify');
const fs = require('fs');

const lstat = pify(fs.lstat);
const readlink = pify(fs.readlink);
const unlink = pify(fs.unlink);
const symlink = pify(fs.symlink);

const target = process.platform === 'darwin' ? '/usr/local/bin/hyper' : '/usr/bin/hyper';
const source = cliScriptPath;

const checkInstall = () => {
  lstat(target)
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
  unlink(target)
    .catch(err => {
      if (err.code === 'ENOENT') {
        return;
      }
      throw err;
    })
    .then(() => symlink(source, target));
};

exports.addSymlink = () => {
  checkInstall().then(isInstalled => {
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
