// This is a CLI tool, using console is OK
//
/* eslint no-console: 0 */
const args = require('args');
const chalk = require('chalk');
const opn = require('opn');
const columnify = require('columnify');
const got = require('got');
const ora = require('ora');
const api = require('./api');
const isDev = require('electron-is-dev');
const promiseFinally = require('promise.prototype.finally');
promiseFinally.shim();
const PLUGIN_PREFIX = 'hyper-';

const configLocation = process.platform === 'win32' ? process.env.userprofile + '\\.hyper.js' : '~/.hyper.js';
//eslint-disable-next-line no-console
console.log(`Hyper configuration file located at: ${configLocation}`);
let commandInvoked = false;
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
  commandInvoked = true;
  checkConfig();
  const pluginName = args_[0];
  assertPluginName(pluginName);
  api
    .install(pluginName)
    .then(() => console.log(chalk.green(`${pluginName} installed successfully!`)))
    .catch(err => console.error(chalk.red(err)))
    .finally(() => process.exit(0));
});

args.command(['u', 'uninstall', 'rm', 'remove'], 'Uninstall a plugin', (name, args_) => {
  commandInvoked = true;
  checkConfig();
  const pluginName = args_[0];
  assertPluginName(pluginName);
  api
    .uninstall(pluginName)
    .then(() => console.log(chalk.green(`${pluginName} uninstalled successfully!`)))
    .catch(err => console.log(chalk.red(err)))
    .finally(() => process.exit(0));
});

args.command(['ls', 'list'], 'List installed plugins', () => {
  commandInvoked = true;
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
    )
    .finally(() => process.exit(0));
};

args.command(['s', 'search'], 'Search for plugins on npm', (name, args_) => {
  commandInvoked = true;
  const spinner = ora('Searching').start();
  const query = args_[0] ? args_[0].toLowerCase() : '';
  console.log(1);
  lsRemote(query)
    .then(entries => {
      console.log(2);
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
    })
    .finally(() => process.exit(0));
});

args.command(['lsr', 'list-remote', 'ls-remote'], 'List plugins available on npm', () => {
  commandInvoked = true;
  const spinner = ora('Searching').start();

  lsRemote()
    .then(entries => {
      let msg = columnify(entries);

      spinner.succeed();
      msg = msg.substring(msg.indexOf('\n') + 1); // remove header
      console.log(msg);
    })
    .catch(err => {
      spinner.fail();
      console.error(chalk.red(err)); // TODO
    })
    .finally(() => process.exit(0));
});

args.command(['d', 'docs', 'h', 'home'], 'Open the npm page of a plugin', (name, args_) => {
  commandInvoked = true;
  const pluginName = args_[0];
  assertPluginName(pluginName);
  opn(`http://ghub.io/${pluginName}`, {wait: false});
  process.exit(0);
});

args.command(['<default>'], 'Launch Hyper');

args.option(['v', 'verbose'], 'Verbose mode', false);

module.exports = () => {
  //Need ancillary variable because parse slices first 2 arguments, issue with
  //electron packed apps https://github.com/electron/electron/issues/4690
  const argv = isDev ? process.argv : ['dummy', ...process.argv];
  //Fallthrough to hyper exececution without commandline arguments
  if (argv.length === 2) {
    return true;
  }
  args.parse(argv, {
    name: 'hyper',
    version: false,
    mri: {
      boolean: ['v', 'verbose']
    }
  });

  //Shows usage and terminates node process
  if (!commandInvoked) {
    args.showHelp();
  }
  return false;
};
