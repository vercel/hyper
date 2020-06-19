// This is a CLI tool, using console is OK
/* eslint no-console: 0 */
import {spawn, exec, SpawnOptions} from 'child_process';
import {isAbsolute, resolve} from 'path';
import {existsSync} from 'fs';
import {version} from '../app/package.json';
import pify from 'pify';
import args from 'args';
import chalk from 'chalk';
import open from 'open';
import columnify from 'columnify';
import got from 'got';
import ora from 'ora';
import * as api from './api';

let commandPromise: Promise<void>;

const assertPluginName = (pluginName: string) => {
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

args.command(
  'install',
  'Install a plugin',
  (name, args_) => {
    checkConfig();
    const pluginName = args_[0];
    assertPluginName(pluginName);
    commandPromise = api
      .install(pluginName)
      .then(() => console.log(chalk.green(`${pluginName} installed successfully!`)))
      .catch((err) => console.error(chalk.red(err)));
  },
  ['i']
);

args.command(
  'uninstall',
  'Uninstall a plugin',
  (name, args_) => {
    checkConfig();
    const pluginName = args_[0];
    assertPluginName(pluginName);
    commandPromise = api
      .uninstall(pluginName)
      .then(() => console.log(chalk.green(`${pluginName} uninstalled successfully!`)))
      .catch((err) => console.log(chalk.red(err)));
  },
  ['u', 'rm', 'remove']
);

args.command(
  'list',
  'List installed plugins',
  () => {
    checkConfig();
    const plugins = api.list();

    if (plugins) {
      console.log(plugins);
    } else {
      console.log(chalk.red(`No plugins installed yet.`));
    }
    process.exit(0);
  },
  ['ls']
);

const lsRemote = (pattern?: string) => {
  // note that no errors are catched by this function
  const URL = `https://api.npms.io/v2/search?q=${
    (pattern && `${pattern}+`) || ''
  }keywords:hyper-plugin,hyper-theme&size=250`;
  return got(URL)
    .then((response) => JSON.parse(response.body).results as any[])
    .then((entries) => entries.map((entry) => entry.package))
    .then((entries) =>
      entries.map(({name, description}) => {
        return {name, description};
      })
    )
    .then((entries) =>
      entries.map((entry) => {
        entry.name = chalk.green(entry.name);
        return entry;
      })
    );
};

args.command(
  'search',
  'Search for plugins on npm',
  (name, args_) => {
    const spinner = ora('Searching').start();
    const query = args_[0] ? args_[0].toLowerCase() : '';

    commandPromise = lsRemote(query)
      .then((entries) => {
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
      .catch((err) => {
        spinner.fail();
        console.error(chalk.red(err)); // TODO
      });
  },
  ['s']
);

args.command(
  'list-remote',
  'List plugins available on npm',
  () => {
    const spinner = ora('Searching').start();

    commandPromise = lsRemote()
      .then((entries) => {
        let msg = columnify(entries);

        spinner.succeed();
        msg = msg.substring(msg.indexOf('\n') + 1); // remove header
        console.log(msg);
      })
      .catch((err) => {
        spinner.fail();
        console.error(chalk.red(err)); // TODO
      });
  },
  ['lsr', 'ls-remote']
);

args.command(
  'docs',
  'Open the npm page of a plugin',
  (name, args_) => {
    const pluginName = args_[0];
    assertPluginName(pluginName);
    open(`http://ghub.io/${pluginName}`, {wait: false, url: true});
    process.exit(0);
  },
  ['d', 'h', 'home']
);

args.command(
  'version',
  'Show the version of hyper',
  () => {
    console.log(version);
    process.exit(0);
  },
  []
);

args.command('<default>', 'Launch Hyper');

args.option(['v', 'verbose'], 'Verbose mode', false);

const main = (argv: string[]) => {
  const flags = args.parse(argv, {
    name: 'hyper',
    version: false,
    mri: {
      boolean: ['v', 'verbose']
    }
  } as any);

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

  const options: SpawnOptions = {
    detached: true,
    env
  };

  const args_ = args.sub.map((arg) => {
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
    child.stdout?.on('data', (data) => console.log(data.toString('utf8')));
    child.stderr?.on('data', (data) => console.error(data.toString('utf8')));
  }
  if (flags.verbose) {
    return new Promise((c) => child.once('exit', () => c(null)));
  }
  child.unref();
  return Promise.resolve();
};

function eventuallyExit(code: number) {
  setTimeout(() => process.exit(code), 100);
}

main(process.argv)
  .then(() => eventuallyExit(0))
  .catch((err) => {
    console.error(err.stack ? err.stack : err);
    eventuallyExit(1);
  });
