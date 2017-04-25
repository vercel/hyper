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
  writeFileSync(path, format);
};

const _importConfig = function () {
  try {
    // read config from ~/.hyper/config.js
    return readFileSync(_paths.preferencesPath, 'utf8');
  } catch (err) {
    try {
      // read previous config on ~/.hyper.js and write to ~/.hyper/config.js
      // write cfg to file
      const cfg = readFileSync(_paths.previousConfigPath);
      _write(_paths.preferencesPath, cfg);
      return cfg;
    } catch (err) {
      // read default config and write cfg to file
      const cfg = readFileSync(_paths.dotConfigPath);
      _write(_paths.preferencesPath, cfg);
      return cfg;
    }
  }
};

const _makePluginsDir = function () {
  mkdirpSync(_paths.pluginsPath);
  mkdirpSync(_paths.localPluginsPath);
};

const _import = function () {
  mkdirpSync(_paths.hyperHomeDirPath);
  _makePluginsDir();
  const cfg = _init(_importConfig());
  cfg.keymaps = _keys.import(cfg.keymaps);
  return cfg;
};

module.exports = _import;
