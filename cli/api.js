const fs = require('fs');
const os = require('os');
const got = require('got');
const registryUrl = require('registry-url')();
const pify = require('pify');
const recast = require('recast');
const path = require('path');

// If the user defines XDG_CONFIG_HOME they definitely want their config there,
// otherwise use the home directory in linux/mac and userdata in windows
const applicationDirectory =
  process.env.XDG_CONFIG_HOME !== undefined
    ? path.join(process.env.XDG_CONFIG_HOME, 'hyper')
    : process.platform == 'win32'
    ? path.join(process.env.APPDATA, 'Hyper')
    : os.homedir();

const devConfigFileName = path.join(__dirname, `../.hyper.js`);

let fileName =
  process.env.NODE_ENV !== 'production' && fs.existsSync(devConfigFileName)
    ? devConfigFileName
    : path.join(applicationDirectory, '.hyper.js');

/**
 * We need to make sure the file reading and parsing is lazy so that failure to
 * statically analyze the hyper configuration isn't fatal for all kinds of
 * subcommands. We can use memoization to make reading and parsing lazy.
 */
function memoize(fn) {
  let hasResult = false;
  let result;
  return (...args) => {
    if (!hasResult) {
      result = fn(...args);
      hasResult = true;
    }
    return result;
  };
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

const getParsedFile = memoize(() => recast.parse(getFileContents()));

const getProperties = memoize(() => getParsedFile().program.body.map(obj => obj));

const getPlugins = memoize(() => {
  let plugins;
  getProperties().find(property => {
    return Object.values(property.expression.right.properties).filter(plugin =>
      plugin.key.name === 'plugins' ? (plugins = plugin.value.elements) : null
    );
  });
  return plugins;
});

const getLocalPlugins = memoize(() => {
  let localPlugins;
  getProperties().find(property => {
    return Object.values(property.expression.right.properties).filter(plugin =>
      plugin.key.name === 'localPlugins' ? (localPlugins = plugin.value.elements) : null
    );
  });
  return localPlugins;
});

function exists() {
  return getFileContents() !== undefined;
}

function isInstalled(plugin, locally) {
  const array = locally ? getLocalPlugins() : getPlugins();
  if (array && Array.isArray(array)) {
    return array.find(entry => entry.value === plugin) !== undefined;
  }
  return false;
}

function save() {
  return pify(fs.writeFile)(fileName, recast.print(getParsedFile()).code, 'utf8');
}

function existsOnNpm(plugin) {
  const name = getPackageName(plugin);
  return got.get(registryUrl + name.toLowerCase(), {timeout: 10000, json: true}).then(res => {
    if (!res.body.versions) {
      return Promise.reject(res);
    } else {
      return res;
    }
  });
}

function getPackageName(plugin) {
  const isScoped = plugin[0] === '@';
  const nameWithoutVersion = plugin.split('#')[0];

  if (isScoped) {
    return '@' + nameWithoutVersion.split('@')[1].replace('/', '%2f');
  }

  return nameWithoutVersion.split('@')[0];
}

function install(plugin, locally) {
  const array = locally ? getLocalPlugins() : getPlugins();
  return existsOnNpm(plugin)
    .catch(err => {
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

function uninstall(plugin) {
  if (!isInstalled(plugin)) {
    return Promise.reject(`${plugin} is not installed`);
  }

  const index = getPlugins().findIndex(entry => entry.value === plugin);
  getPlugins().splice(index, 1);
  return save();
}

function list() {
  if (Array.isArray(getPlugins())) {
    return getPlugins()
      .map(plugin => plugin.value)
      .join('\n');
  }
  return false;
}

module.exports.configPath = fileName;
module.exports.exists = exists;
module.exports.existsOnNpm = existsOnNpm;
module.exports.isInstalled = isInstalled;
module.exports.install = install;
module.exports.uninstall = uninstall;
module.exports.list = list;
