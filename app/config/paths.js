// This module exports paths, names, and other metadata that is referenced

const { homedir, platform } = require('os');
const { statSync } = require('fs');
const { resolve, join } = require('path');

const { app } = require('electron');

const isDev = require('electron-is-dev');

const upgrade = require('./upgrade');

const getCommonPaths = () => {
  const defaultConfigPath = resolve(__dirname, 'config-default.js');
  const devDataRoot = resolve(__dirname, '../..');

  const yarn = resolve(__dirname, '../../bin/yarn-standalone.js');
  const cliScriptPath = resolve(__dirname, '../../bin/hyper');
  const cliLinkPath = '/usr/local/bin/hyper';

  const icon = resolve(__dirname, '../static/icon96x96.png');

  const keymapPath = resolve(__dirname, '../keymaps');
  const darwinKeys = join(keymapPath, 'darwin.json');
  const win32Keys = join(keymapPath, 'win32.json');
  const linuxKeys = join(keymapPath, 'linux.json');

  const getKeymap = () => {
    switch (process.platform) {
      case 'darwin':
        return darwinKeys;
      case 'win32':
        return win32Keys;
      case 'linux':
        return linuxKeys;
      default:
        return darwinKeys;
    }
  };

  return {
    defaultConfigPath,

    devDataRoot,

    yarn,

    cliScriptPath,
    cliLinkPath,

    icon,

    getKeymap,
  };
};

const getCompatPaths = ({ dataRoot, devDataRoot, }) => {
  const configFile = '.hyper.js';
  const pluginsDir = '.hyper_plugins';

  const pluginsRoot = resolve(dataRoot, pluginsDir);
  const pluginsLocal = resolve(pluginsRoot, 'local');
  const pluginsCache = resolve(pluginsRoot, 'cache');
  const configPath = resolve(dataRoot, configFile);

  const devConfigPath = resolve(devDataRoot, configFile);

  const prod = {
    dataRoot,
    pluginsRoot,
    pluginsLocal,
    pluginsCache,
    configFile,
    configPath,
  };

  const dev = {
    dataRoot: devDataRoot,
    pluginsRoot, // TODO: Maybe override plugins paths too.
    pluginsLocal,
    pluginsCache,
    configFile,
    configPath: devConfigPath,
  };

  if (isDev) {
    // if a local config file exists, use it
    try {
      statSync(devConfigPath);

      //eslint-disable-next-line no-console
      console.log('using config file:', devConfigPath);

      return dev;
    } catch (e) {
      return prod;
    }
  } else {
    return prod;
  }
};

const mapToExports = paths => ({
  cfgDir: paths.dataRoot,
  cfgPath: paths.configPath,
  cfgFile: paths.configFile,
  defaultCfg: paths.defaultConfigPath,
  icon: paths.icon,
  defaultPlatformKeyPath: paths.getKeymap,
  plugs: {
    base: paths.pluginsRoot,
    local: paths.pluginsLocal,
    cache: paths.pluginsCache,
  },
  yarn: paths.yarn,
  cliScriptPath: paths.cliScriptPath,
  cliLinkPath: paths.cliLinkPath
});

const commonPaths = getCommonPaths();

const legacyPaths = getCompatPaths({
  dataRoot: homedir(),
  devDataRoot: commonPaths.devDataRoot,
});

const conventionalPaths = getCompatPaths({
  dataRoot: resolve(app.getPath('appData'), app.getName()),
  devDataRoot: commonPaths.devDataRoot,
});

upgrade(legacyPaths, conventionalPaths);

module.exports = mapToExports(Object.assign(
  {},
  commonPaths,
  conventionalPaths,
));
