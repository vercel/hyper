import fs from 'fs';
import os from 'os';
import path from 'path';
import got from 'got';
import registryUrlModule from 'registry-url';

const registryUrl = registryUrlModule();

const applicationDirectory = process.env.XDG_CONFIG_HOME
  ? path.join(process.env.XDG_CONFIG_HOME, 'Hyper')
  : process.platform === 'win32'
  ? path.join(process.env.APPDATA!, 'Hyper')
  : path.join(os.homedir(), '.config', 'Hyper');

const devConfigFileName = path.join(__dirname, '../hyper.json');
const fileName =
  process.env.NODE_ENV !== 'production' && fs.existsSync(devConfigFileName)
    ? devConfigFileName
    : path.join(applicationDirectory, 'hyper.json');

function memoize<T extends (...args: any[]) => any>(fn: T): T {
  let hasResult = false;
  let result: any;
  return ((...args: Parameters<T>) => {
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

const getPlugins = memoize(() => getPluginsByKey('plugins'));
const getLocalPlugins = memoize(() => getPluginsByKey('localPlugins'));

function exists(): boolean {
  return getFileContents() !== undefined;
}

function isInstalled(plugin: string, locally?: boolean): boolean {
  const array = locally ? getLocalPlugins() : getPlugins();
  return Array.isArray(array) ? array.includes(plugin) : false;
}

function save(config: any): void {
  fs.writeFileSync(fileName, JSON.stringify(config, null, 2), 'utf8');
}

function getPackageName(plugin: string): string {
  const isScoped = plugin[0] === '@';
  const nameWithoutVersion = plugin.split('#')[0];

  if (isScoped) {
    return `@${nameWithoutVersion.split('@')[1].replace('/', '%2f')}`;
  }

  return nameWithoutVersion.split('@')[0];
}

function existsOnNpm(plugin: string): Promise<got.Response<any>> {
  const name = getPackageName(plugin);
  return got.get<any>(registryUrl + name.toLowerCase(), { timeout: { request: 10000 }, responseType: 'json' });
}

function install(plugin: string, locally?: boolean): Promise<void> {
  const array = locally ? getLocalPlugins() : getPlugins();
  return existsOnNpm(plugin)
    .then(() => {
      if (isInstalled(plugin, locally)) {
        return Promise.reject(`${plugin} is already installed`);
      }

      const config = getParsedFile();
      config[locally ? 'localPlugins' : 'plugins'] = [...array, plugin];
      save(config);
    })
    .catch((err: any) => {
      const { statusCode } = err;
      if (statusCode && (statusCode === 404 || statusCode === 200)) {
        return Promise.reject(`${plugin} not found on npm`);
      }
      return Promise.reject(`${err.message}\nPlugin check failed. Check your internet connection or retry later.`);
    });
}

async function uninstall(plugin: string): Promise<void> {
  if (!isInstalled(plugin)) {
    return Promise.reject(`${plugin} is not installed`);
  }

  const config = getParsedFile();
  config.plugins = getPlugins().filter((p) => p !== plugin);
  save(config);
}

function list(): string | false {
  const plugins = getPlugins();
  return plugins.length > 0 ? plugins.join('\n') : false;
}

export const configPath = fileName;
export { exists, existsOnNpm, isInstalled, install, uninstall, list };
