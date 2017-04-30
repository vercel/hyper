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

const _importConfig = function () {
  try {
    const defaultCfg = readFileSync(_paths.dotConfigPath, 'utf8');
    try {
      // read config from ~/.hyper/config.js
      const modified = readFileSync(_paths.preferencesPath, 'utf8');
      return {modified, defaultCfg};
    } catch (err) {
      try {
        // read previous config on ~/.hyper.js and write to ~/.hyper/config.js
        // write cfg to file
        const modified = readFileSync(_paths.previousConfigPath, 'utf8');
        _write(_paths.preferencesPath, modified);
        return {modified, defaultCfg};
      } catch (err) {
        // write cfg to file
        _write(_paths.preferencesPath, defaultCfg);
        return {modified: {}, defaultCfg};
      }
    }
  } catch (err) {
    console.log(err);
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
  if (cfg) {
    cfg.keymaps = _keys.import(cfg.keymaps);
  }
  return cfg;
};

module.exports = _import;
