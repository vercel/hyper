// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-unsafe-return */
import fs from 'fs';
import os from 'os';
import got from 'got';
import registryUrlModule from 'registry-url';
const registryUrl = registryUrlModule();
import path from 'path';

// If the user defines XDG_CONFIG_HOME they definitely want their config there,
// otherwise use the home directory in linux/mac and userdata in windows
const applicationDirectory = process.env.XDG_CONFIG_HOME
  ? path.join(process.env.XDG_CONFIG_HOME, 'Hyper')
  : process.platform === 'win32'
  ? path.join(process.env.APPDATA!, 'Hyper')
  : path.join(os.homedir(), '.config', 'Hyper');

const devConfigFileName = path.join(__dirname, `../hyper.json`);

const fileName =
  process.env.NODE_ENV !== 'production' && fs.existsSync(devConfigFileName)
    ? devConfigFileName
    : path.join(applicationDirectory, 'hyper.json');

/**
 * We need to make sure the file reading and parsing is lazy so that failure to
 * statically analyze the hyper configuration isn't fatal for all kinds of
 * subcommands. We can use memoization to make reading and parsing lazy.
 */
function memoize<T extends (...args: any[]) => any>(fn: T): T {
  let hasResult = false;
  let result: any;
  return ((...args: any[]) => {
    if (!hasResult) {
      result = fn(...args);
      hasResult = true;
    }
    return result;
  }) as T;
}

const getFileContents = memoize(() => {
  return fs.readFileSync(fileName, 'utf8');
});

const getParsedFile = memoize(() => JSON.parse(getFileContents()));

const getPluginsByKey = (key: string): any[] => getParsedFile()[key] || [];

const getPlugins = memoize(() => {
  return getPluginsByKey('plugins');
});

const getLocalPlugins = memoize(() => {
  return getPluginsByKey('localPlugins');
});

function exists() {
  return getFileContents() !== undefined;
}

function isInstalled(plugin: string, locally?: boolean) {
  const array = locally ? getLocalPlugins() : getPlugins();
  if (array && Array.isArray(array)) {
    return array.includes(plugin);
  }
  return false;
}

function save(config: any) {
  return fs.writeFileSync(fileName, JSON.stringify(config, null, 2), 'utf8');
}

function getPackageName(plugin: string) {
  const isScoped = plugin[0] === '@';
  const nameWithoutVersion = plugin.split('#')[0];

  if (isScoped) {
    return `@${nameWithoutVersion.split('@')[1].replace('/', '%2f')}`;
  }

  return nameWithoutVersion.split('@')[0];
}

function existsOnNpm(plugin: string) {
  const name = getPackageName(plugin);
  return got
    .get<any>(registryUrl + name.toLowerCase(), {timeout: {request: 10000}, responseType: 'json'})
    .then((res) => {
      if (!res.body.versions) {
        return Promise.reject(res);
      } else {
        return res;
      }
    });
}

function install(plugin: string, locally?: boolean) {
  const array = locally ? getLocalPlugins() : getPlugins();
  return existsOnNpm(plugin)
    .catch((err: any) => {
      const {statusCode} = err;
      if (statusCode && (statusCode === 404 || statusCode === 200)) {
        return Promise.reject(`${plugin} not found on npm`);
      }
      return Promise.reject(`${err.message}\nPlugin check failed. Check your internet connection or retry later.`);
    })
    .then(() => {
      if (isInstalled(plugin, locally)) {
        return Promise.reject(`${plugin} is already installed`);
      }

      const config = getParsedFile();
      config[locally ? 'localPlugins' : 'plugins'] = [...array, plugin];
      save(config);
    });
}

async function uninstall(plugin: string) {
  if (!isInstalled(plugin)) {
    return Promise.reject(`${plugin} is not installed`);
  }

  const config = getParsedFile();
  config.plugins = getPlugins().filter((p) => p !== plugin);
  save(config);
}

function list() {
  if (getPlugins().length > 0) {
    return getPlugins().join('\n');
  }
  return false;
}

export const configPath = fileName;
export {exists, existsOnNpm, isInstalled, install, uninstall, list};
