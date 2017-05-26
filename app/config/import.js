const {writeFileSync, readFileSync} = require('fs');
const {defaultConfig, confPath} = require('./paths');
const _init = require('./init');
const _keys = require('./keymaps');

const _write = function (path, data) {
  // This method will take text formatted as Unix line endings and transform it
  // to text formatted with DOS line endings. We do this because the default
  // text editor on Windows (notepad) doesn't Deal with LF files. Still. In 2017.
  const crlfify = function (str) {
    return str.replace(/\r?\n/g, '\r\n');
  };
  const format = process.platform === 'win32' ? crlfify(data.toString()) : data;
  writeFileSync(path, format, 'utf8');
};

const _importConf = function () {
  try {
    const defaultConf = readFileSync(defaultConfig, 'utf8');
    try {
      const conf = readFileSync(confPath, 'utf8');
      return {userConf: conf, defaultConf};
    } catch (err) {
      _write(confPath, defaultConf);
      return {userConf: {}, defaultConf};
    }
  } catch (err) {
    console.log(err);
  }
};

const _import = function () {
  const cfg = _init(_importConf());

  if (cfg) {
    cfg.keymaps = _keys.import(cfg.keymaps);
  }
  return cfg;
};

module.exports = _import;
