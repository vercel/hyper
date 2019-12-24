// This module exports paths, names, and other metadata that is referenced
import {homedir} from 'os';
import {app} from 'electron';
import {statSync} from 'fs';
import {resolve, join} from 'path';
import isDev from 'electron-is-dev';

const cfgFile = '.hyper.js';
const defaultCfgFile = 'config-default.js';
const homeDirectory = homedir();

// If the user defines XDG_CONFIG_HOME they definitely want their config there,
// otherwise use the home directory in linux/mac and userdata in windows
const applicationDirectory =
  process.env.XDG_CONFIG_HOME !== undefined
    ? join(process.env.XDG_CONFIG_HOME, 'hyper')
    : process.platform == 'win32'
    ? app.getPath('userData')
    : homedir();

let cfgDir = applicationDirectory;
let cfgPath = join(applicationDirectory, cfgFile);
const legacyCfgPath = join(homeDirectory, cfgFile); // Hyper 2 config location

const devDir = resolve(__dirname, '../..');
const devCfg = join(devDir, cfgFile);
const defaultCfg = resolve(__dirname, defaultCfgFile);

if (isDev) {
  // if a local config file exists, use it
  try {
    statSync(devCfg);
    cfgPath = devCfg;
    cfgDir = devDir;
    //eslint-disable-next-line no-console
    console.log('using config file:', cfgPath);
  } catch (err) {
    // ignore
  }
}

const plugins = resolve(cfgDir, '.hyper_plugins');
const plugs = {
  legacyBase: resolve(homeDirectory, '.hyper_plugins'),
  legacyLocal: resolve(homeDirectory, '.hyper_plugins', 'local'),
  base: plugins,
  local: resolve(plugins, 'local'),
  cache: resolve(plugins, 'cache')
};
const yarn = resolve(__dirname, '../../bin/yarn-standalone.js');
const cliScriptPath = resolve(__dirname, '../../bin/hyper');
const cliLinkPath = '/usr/local/bin/hyper';

const icon = resolve(__dirname, '../static/icon96x96.png');

const keymapPath = resolve(__dirname, '../keymaps');
const darwinKeys = join(keymapPath, 'darwin.json');
const win32Keys = join(keymapPath, 'win32.json');
const linuxKeys = join(keymapPath, 'linux.json');

const defaultPlatformKeyPath = () => {
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

export {
  cfgDir,
  cfgPath,
  legacyCfgPath,
  cfgFile,
  defaultCfg,
  icon,
  defaultPlatformKeyPath,
  plugs,
  yarn,
  cliScriptPath,
  cliLinkPath,
  homeDirectory
};
