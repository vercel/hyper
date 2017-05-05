const {writeFileSync, readFileSync} = require('fs');
const {sync: mkdirpSync} = require('mkdirp');
const _paths = require('./paths');
const _init = require('./init');
const _keys = require('./keymaps');

const _write = function (path, data) {
  // This method will take text formatted as Unix line endings and transform it
  // to text formatted with DOS line endings. We do this because the default
  // text editor on Windows (notepad) doesn't Deal with LF files. Still. In 2017.
  const crlfify = function (str) {
    return str.replace(/\r?\n/g, '\r\n');
  };
  const format = process.platform === 'win32' ? crlfify(data) : data;
  writeFileSync(path, format, 'utf8');
};

const _importProd = function () {
  try {
    const defaultConf = readFileSync(_paths.defaultConf, 'utf8');
    try {
      // read config from ~/.hyper/config.js
      const prodConf = readFileSync(_paths.prodConf, 'utf8');
      return {userConf: prodConf, defaultConf};
    } catch (err) {
      try {
        // read previous config on ~/.hyper.js and write to ~/.hyper/config.js
        // write cfg to file
        const prodConf = readFileSync(_paths.previousConfig, 'utf8');
        _write(_paths.prodConf, prodConf);
        return {userConf: prodConf, defaultConf};
      } catch (err) {
        // write cfg to file
        _write(_paths.prodConf, defaultConf);
        return {userConf: {}, defaultConf};
      }
    }
  } catch (err) {
    console.log(err);
  }
};

const _makePluginsDir = function () {
  mkdirpSync(_paths.hyperPlugins);
  mkdirpSync(_paths.localPlugins);
};

const _importDev = function () {
  try {
    const defaultConf = readFileSync(_paths.defaultConf, 'utf8');
    try {
      // read config from ~/.hyper/DEV/config.js
      const devConf = readFileSync(_paths.devConfig, 'utf8');
      return {userConf: devConf, defaultConf};
    } catch (err) {
      _write(_paths.devConfig, defaultConf);
      return {userConf: {}, defaultConf};
    }
  } catch (err) {
    console.log(err);
  }
};

const _makeEnv = function () {
  mkdirpSync(_paths.hyperDir);
  _makePluginsDir();
};

const _import = function () {
  _makeEnv();
  let cfg;

  if (_paths.isDev) {
    mkdirpSync(_paths.devDir);
    cfg = _init(_importDev());
  } else {
    cfg = _init(_importProd());
  }

  if (cfg) {
    cfg.keymaps = _keys.import(cfg.keymaps);
  }
  return cfg;
};

module.exports = _import;
