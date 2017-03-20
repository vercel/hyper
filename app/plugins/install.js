const {writeFileSync} = require('fs');
const {exec} = require('child_process');
const shellEnv = require('shell-env');
const {pluginsPath, pkgPath} = require('../config/paths');
const notify = require('../notify');

const _toDependencies = function (plugins) {
  const obj = {};
  plugins.plugins.forEach(plugin => {
    const regex = /.(@|#)/;
    const match = regex.exec(plugin);

    if (match) {
      const index = match.index + 1;
      const pieces = [];

      pieces[0] = plugin.substring(0, index);
      pieces[1] = plugin.substring(index + 1, plugin.length);
      obj[pieces[0]] = pieces[1];
    } else {
      obj[plugin] = 'latest';
    }
  });
  return obj;
};

const _pkgSync = function (plugins) {
  const dependencies = _toDependencies(plugins);
  try {
    writeFileSync(pkgPath, JSON.stringify({
      name: 'hyper-plugins',
      description: 'Auto-generated from `~/.hyper/config.js`!',
      private: true,
      version: '0.0.1',
      repository: 'zeit/hyper',
      license: 'MIT',
      homepage: 'https://hyper.is',
      dependencies
    }, null, 2));
  } catch (err) {
    notify(`An error occurred writing to ${pkgPath}`);
  }
};

const _exec = function (plugins, cfg, fn) {
  _pkgSync(plugins);
  const {shell: cfgShell, npmRegistry} = cfg;
  const shell = cfgShell && cfgShell !== '' ? cfgShell : undefined;

  shellEnv().then(env => {
    if (npmRegistry) {
      env.NPM_CONFIG_REGISTRY = npmRegistry;
    }
    /* eslint-disable camelcase  */
    env.npm_config_runtime = 'electron';
    env.npm_config_target = process.versions.electron;
    env.npm_config_disturl = 'https://atom.io/download/atom-shell';
    /* eslint-enable camelcase  */
    // Shell-specific installation commands
    const installCommands = {
      fish: 'npm prune; and npm install --production',
      posix: 'npm prune && npm install --production'
    };

    // determine the shell we're running in
    const whichShell = (typeof cfgShell === 'string' && cfgShell.match(/fish/)) ? 'fish' : 'posix';
    const execOptions = {
      cwd: pluginsPath,
      env
    };

    // https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback
    // node.js requires command line parsing should be compatible with cmd.exe on Windows, should able to accept `/d /s /c`
    // but most custom shell doesn't. Instead, falls back to default shell
    if (process.platform !== 'win32') {
      execOptions.shell = shell;
    }

    // Use the install command that is appropriate for our shell
    exec(installCommands[whichShell], execOptions, err => {
      if (err) {
        return fn(err);
      }
      fn(null);
    });
  }).catch(fn);
};

module.exports = {
  exec: _exec,
  toDependencies: _toDependencies
};
