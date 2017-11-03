// This is a CLI tool, using console is OK
/* eslint no-console: 0 */
const {spawn, exec} = require('child_process');
const {isAbsolute, resolve} = require('path');
const pify = require('pify');
const args = require('args');
const chalk = require('chalk');
//const columnify = require('columnify');
//const got = require('got');
const opn = require('opn');
//const ora = require('ora');
const api = require('./api');

let commandUsed = false;

if (!api.exists()) {
  let msg = chalk.red(`Error! Config file not found: ${api.configPath}\n`);
  msg += 'Please launch Hyper and retry.';
  console.error(msg);
  process.exit(1);
}

args.command(['i', 'install'], 'Install a plugin', (name, args_) => {
  commandUsed = true;
  const plugin = args_[0];
  return api
    .install(plugin)
    .then(() => console.log(chalk.green(`${plugin} installed successfully!`)))
    .catch(err => console.error(chalk.red(err)));
});

args.command(['u', 'uninstall', 'rm', 'remove'], 'Uninstall a plugin', (name, args_) => {
  commandUsed = true;
  const plugin = args_[0];
  return api
    .uninstall(plugin)
    .then(() => console.log(chalk.green(`${plugin} uninstalled successfully!`)))
    .catch(err => console.log(chalk.red(err)));
});

args.command(['ls', 'list'], 'List installed plugins', () => {
  commandUsed = true;
  let plugins = api.list();

  if (plugins) {
    console.log(plugins);
  } else {
    console.log(chalk.red(`No plugins installed yet.`));
  }
  process.exit(1);
});
/*
const lsRemote = () => {
  // note that no errors are catched by this function
  const URL =
    'http://registry.npmjs.org/-/_view/byKeyword?startkey=[%22hyperterm%22,%22hyper%22]&endkey=[%22hyperterm%22,{}]&group_level=4';
  return got(URL)
    .then(response => JSON.parse(response.body).rows)
    .then(entries => entries.map(entry => entry.key))
    .then(entries =>
      entries.map(entry => {
        return {name: entry[1], description: entry[2]};
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
  commandUsed = true;
  const spinner = ora('Searching').start();
  const query = args_[0] ? args_[0].toLowerCase() : '';

  return lsRemote()
    .then(entries => {
      return entries.filter(entry => {
        return entry.name.indexOf(query) !== -1 || entry.description.toLowerCase().indexOf(query) !== -1;
      });
    })
    .then(entries => {
      if (entries.length === 0) {
        spinner.fail();
        console.error(chalk.red(`Your search '${query}' did not match any plugins`));
        console.error(`${chalk.red('Try')} ${chalk.green('hpm ls-remote')}`);
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
  commandUsed = true;
  const spinner = ora('Searching').start();

  return lsRemote()
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
});*/

args.command(['d', 'docs', 'h', 'home'], 'Open the npm page of a plugin', (name, args_) => {
  commandUsed = true;
  return opn(`http://ghub.io/${args_[0]}`, {wait: false});
});

args.command(['<default>'], 'Launch Hyper');

args.option(['v', 'verbose'], 'Verbose mode', false);

const main = argv => {
  const flags = args.parse(argv, {
    name: 'hyper',
    version: false
  });

  if (commandUsed) {
    return Promise.resolve();
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
    return isAbsolute(arg) ? arg : resolve(process.cwd(), arg);
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
