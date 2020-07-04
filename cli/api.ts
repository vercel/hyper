import fs from 'fs';
import os from 'os';
import got from 'got';
import registryUrlModule from 'registry-url';
const registryUrl = registryUrlModule();
import pify from 'pify';
import * as recast from 'recast';
import path from 'path';

// If the user defines XDG_CONFIG_HOME they definitely want their config there,
// otherwise use the home directory in linux/mac and userdata in windows
const applicationDirectory =
  process.env.XDG_CONFIG_HOME !== undefined
    ? path.join(process.env.XDG_CONFIG_HOME, 'hyper')
    : process.platform == 'win32'
    ? path.join(process.env.APPDATA!, 'Hyper')
    : os.homedir();

const devConfigFileName = path.join(__dirname, `../.hyper.js`);

const fileName =
  process.env.NODE_ENV !== 'production' && fs.existsSync(devConfigFileName)
    ? devConfigFileName
    : path.join(applicationDirectory, '.hyper.js');

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
  try {
    return fs.readFileSync(fileName, 'utf8');
  } catch (err) {
    if (err.code !== 'ENOENT') {
      // ENOENT === !exists()
      throw err;
    }
  }
  return null;
});

const getParsedFile = memoize(() => recast.parse(getFileContents()!));

const getProperties = memoize(
  (): any[] =>
    ((getParsedFile()?.program?.body as any[]) || []).find(
      (bodyItem) =>
        bodyItem.type === 'ExpressionStatement' &&
        bodyItem.expression.type === 'AssignmentExpression' &&
        bodyItem.expression.left.object.name === 'module' &&
        bodyItem.expression.left.property.name === 'exports' &&
        bodyItem.expression.right.type === 'ObjectExpression'
    )?.expression?.right?.properties || []
);

const getPluginsByKey = (key: string): any[] =>
  getProperties().find((property) => property?.key?.name === key)?.value?.elements || [];

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
    return array.some((entry) => entry.value === plugin);
  }
  return false;
}

function save() {
  return pify(fs.writeFile)(fileName, recast.print(getParsedFile()).code, 'utf8');
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
    .get<any>(registryUrl + name.toLowerCase(), {timeout: 10000, responseType: 'json'})
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

      array.push(recast.types.builders.literal(plugin));
      return save();
    });
}

function uninstall(plugin: string) {
  if (!isInstalled(plugin)) {
    return Promise.reject(`${plugin} is not installed`);
  }

  const index = getPlugins().findIndex((entry) => entry.value === plugin);
  getPlugins().splice(index, 1);
  return save();
}

function list() {
  if (getPlugins().length > 0) {
    return getPlugins()
      .map((plugin) => plugin.value)
      .join('\n');
  }
  return false;
}

export const configPath = fileName;
export {exists, existsOnNpm, isInstalled, install, uninstall, list};
