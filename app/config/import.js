const {writeFileSync, readFileSync} = require('fs');
const {sync: mkdirpSync} = require('mkdirp');
const {defaultCfg, cfgPath, plugs} = require('./paths');
const _init = require('./init');
const _keymaps = require('./keymaps');

const _write = function(path, data) {
  // This method will take text formatted as Unix line endings and transform it
  // to text formatted with DOS line endings. We do this because the default
  // text editor on Windows (notepad) doesn't Deal with LF files. Still. In 2017.
  const crlfify = function(str) {
    return str.replace(/\r?\n/g, '\r\n');
  };
  const format = process.platform === 'win32' ? crlfify(data.toString()) : data;
  writeFileSync(path, format, 'utf8');
};

const _importConf = function() {
  // init plugin directories if not present
  mkdirpSync(plugs.base);
  mkdirpSync(plugs.local);

  try {
    const _defaultCfg = readFileSync(defaultCfg, 'utf8');
    try {
      const _cfgPath = readFileSync(cfgPath, 'utf8');
      return {userCfg: _cfgPath, defaultCfg: _defaultCfg};
    } catch (err) {
      _write(cfgPath, _defaultCfg);
      return {userCfg: {}, defaultCfg: _defaultCfg};
    }
  } catch (err) {
    //eslint-disable-next-line no-console
    console.log(err);
  }
};

const _import = function() {
  const cfg = _init(_importConf());

  if (cfg) {
    cfg.keymaps = _keymaps.import(cfg.keymaps);
  }
  return cfg;
};

module.exports = _import;
