const {writeFileSync, readFileSync} = require('fs');
const {sync: mkdirpSync} = require('mkdirp');
const {defaultCfg, cfgPath, plugs, defaultPlatformKeyPath} = require('./paths');
const {_init, _extractDefault} = require('./init');

let defaultConfig;

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
    const _defaultCfg = _extractDefault(readFileSync(defaultCfg, 'utf8'));
    // Importing platform specific keymap
    try {
      const content = readFileSync(defaultPlatformKeyPath(), 'utf8');
      const mapping = JSON.parse(content);
      _defaultCfg.keymaps = mapping;
    } catch (err) {
      //eslint-disable-next-line no-console
      console.error(err);
    }
    // Importing user config
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

exports._import = () => {
  const imported = _importConf();
  defaultConfig = imported.defaultCfg;
  return _init(imported);
};

exports.getDefaultConfig = () => {
  if (!defaultConfig) {
    defaultConfig = _extractDefault(_importConf().defaultCfg);
  }
  return defaultConfig;
};
