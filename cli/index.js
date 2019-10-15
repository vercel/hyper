// This is a CLI tool, using console is OK
/* eslint no-console: 0 */
const {spawn, exec} = require('child_process');
const {isAbsolute, resolve} = require('path');
const {existsSync} = require('fs');
const {version} = require('../app/package');
const pify = require('pify');
const args = require('args');
const chalk = require('chalk');
const open = require('open');
const columnify = require('columnify');
const got = require('got');
const ora = require('ora');
const api = require('./api');

const PLUGIN_PREFIX = 'hyper-';

let commandPromise;

const assertPluginName = pluginName => {
  if (!pluginName) {
    console.error(chalk.red('Plugin name is required'));
    process.exit(1);
  }
};

const checkConfig = () => {
  if (api.exists()) {
    return true;
  }
  let msg = chalk.red(`Error! Config file not found: ${api.configPath}\n`);
  msg += 'Please launch Hyper and retry.';
  console.error(msg);
  process.exit(1);
};

args.command(['i', 'install'], 'Install a plugin', (name, args_) => {
  checkConfig();
  const pluginName = args_[0];
  assertPluginName(pluginName);
  commandPromise = api
    .install(pluginName)
    .then(() => console.log(chalk.green(`${pluginName} installed successfully!`)))
    .catch(err => console.error(chalk.red(err)));
});

args.command(['u', 'uninstall', 'rm', 'remove'], 'Uninstall a plugin', (name, args_) => {
  checkConfig();
  const pluginName = args_[0];
  assertPluginName(pluginName);
  commandPromise = api
    .uninstall(pluginName)
    .then(() => console.log(chalk.green(`${pluginName} uninstalled successfully!`)))
    .catch(err => console.log(chalk.red(err)));
});

args.command(['ls', 'list'], 'List installed plugins', () => {
  checkConfig();
  let plugins = api.list();

  if (plugins) {
    console.log(plugins);
  } else {
    console.log(chalk.red(`No plugins installed yet.`));
  }
  process.exit(0);
});

const lsRemote = pattern => {
  // note that no errors are catched by this function
  const URL = `https://api.npms.io/v2/search?q=${(pattern && `${pattern}+`) || ''}keywords:hyper-plugin,hyper-theme`;
  return got(URL)
    .then(response => JSON.parse(response.body).results)
    .then(entries => entries.map(entry => entry.package))
    .then(entries => entries.filter(entry => entry.name.indexOf(PLUGIN_PREFIX) === 0))
    .then(entries =>
      entries.map(({name, description}) => {
        return {name, description};
      })
    )
    .then(entries =>
      entries.map(entry => {
        entry.name = chalk.green(entry.name);
        return entry;
      })
    );
};

args.command(['s', 'search'], 'Search for plugins on npm', (name, args_) => {
  const spinner = ora('Searching').start();
  const query = args_[0] ? args_[0].toLowerCase() : '';

  commandPromise = lsRemote(query)
    .then(entries => {
      if (entries.length === 0) {
        spinner.fail();
        console.error(chalk.red(`Your search '${query}' did not match any plugins`));
        console.error(`${chalk.red('Try')} ${chalk.green('hyper ls-remote')}`);
        process.exit(1);
      } else {
        let msg = columnify(entries);
        spinner.succeed();
        msg = msg.substring(msg.indexOf('\n') + 1); // remove header
        console.log(msg);
      }
    })
    .catch(err => {
      spinner.fail();
      console.error(chalk.red(err)); // TODO
    });
});

args.command(['lsr', 'list-remote', 'ls-remote'], 'List plugins available on npm', () => {
  const spinner = ora('Searching').start();

  commandPromise = lsRemote()
    .then(entries => {
      let msg = columnify(entries);

      spinner.succeed();
      msg = msg.substring(msg.indexOf('\n') + 1); // remove header
      console.log(msg);
    })
    .catch(err => {
      spinner.fail();
      console.error(chalk.red(err)); // TODO
    });
});

args.command(['d', 'docs', 'h', 'home'], 'Open the npm page of a plugin', (name, args_) => {
  const pluginName = args_[0];
  assertPluginName(pluginName);
  open(`http://ghub.io/${pluginName}`, {wait: false, url: true});
  process.exit(0);
});

args.command(['version'], 'Show the version of hyper', () => {
  console.log(version);
  process.exit(0);
});

args.command(['<default>'], 'Launch Hyper');

args.option(['v', 'verbose'], 'Verbose mode', false);

const main = argv => {
  const flags = args.parse(argv, {
    name: 'hyper',
    version: false,
    mri: {
      boolean: ['v', 'verbose']
    }
  });

  if (commandPromise) {
    return commandPromise;
  }

  const env = Object.assign({}, process.env, {
    // this will signal Hyper that it was spawned from this module
    HYPER_CLI: '1',
    ELECTRON_NO_ATTACH_CONSOLE: '1'
  });

  delete env['ELECTRON_RUN_AS_NODE'];

  if (flags.verbose) {
    env['ELECTRON_ENABLE_LOGGING'] = '1';
  }

  const options = {
    detached: true,
    env
  };

  const args_ = args.sub.map(arg => {
    const cwd = isAbsolute(arg) ? arg : resolve(process.cwd(), arg);
    if (!existsSync(cwd)) {
      console.error(chalk.red(`Error! Directory or file does not exist: ${cwd}`));
      process.exit(1);
    }
    return cwd;
  });

  if (!flags.verbose) {
    options['stdio'] = 'ignore';
    if (process.platform === 'darwin') {
      //Use `open` to prevent multiple Hyper process
      const cmd = `open -b co.zeit.hyper ${args_}`;
      const opts = {
        env
      };
      return pify(exec)(cmd, opts);
    }
  }

  const child = spawn(process.execPath, args_, options);

  if (flags.verbose) {
    child.stdout.on('data', data => console.log(data.toString('utf8')));
    child.stderr.on('data', data => console.error(data.toString('utf8')));
  }
  if (flags.verbose) {
    return new Promise(c => child.once('exit', () => c(null)));
  }
  child.unref();
  return Promise.resolve();
};

function eventuallyExit(code) {
  setTimeout(() => process.exit(code), 100);
}

main(process.argv)
  .then(() => eventuallyExit(0))
  .catch(err => {
    console.error(err.stack ? err.stack : err);
    eventuallyExit(1);
  });
