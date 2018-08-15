const {EventEmitter} = require('events');
const {StringDecoder} = require('string_decoder');

const defaultShell = require('default-shell');

const {getDecoratedEnv} = require('./plugins');
const {productName, version} = require('./package');
const config = require('./config');

const createNodePtyError = () =>
  new Error(
    '`node-pty` failed to load. Typically this means that it was built incorrectly. Please check the `readme.md` to more info.'
  );

let spawn;
try {
  spawn = require('node-pty').spawn;
} catch (err) {
  throw createNodePtyError();
}

const envFromConfig = config.getConfig().env || {};

module.exports = class Session extends EventEmitter {
  constructor({rows, cols: columns, cwd, shell, shellArgs}) {
    const osLocale = require('os-locale');
    super();
    const baseEnv = Object.assign(
      {},
      process.env,
      {
        LANG: osLocale.sync() + '.UTF-8',
        TERM: 'xterm-256color',
        COLORTERM: 'truecolor',
        TERM_PROGRAM: productName,
        TERM_PROGRAM_VERSION: version
      },
      envFromConfig
    );

    // Electron has a default value for process.env.GOOGLE_API_KEY
    // We don't want to leak this to the shell
    // See https://github.com/zeit/hyper/issues/696
    if (baseEnv.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY === baseEnv.GOOGLE_API_KEY) {
      delete baseEnv.GOOGLE_API_KEY;
    }

    const decoder = new StringDecoder('utf8');

    const defaultShellArgs = ['--login'];

    try {
      this.pty = spawn(shell || defaultShell, shellArgs || defaultShellArgs, {
        cols: columns,
        rows,
        cwd,
        env: getDecoratedEnv(baseEnv)
      });
    } catch (err) {
      if (/is not a function/.test(err.message)) {
        throw createNodePtyError();
      } else {
        throw err;
      }
    }

    this.pty.on('data', data => {
      if (this.ended) {
        return;
      }
      this.emit('data', decoder.write(data));
    });

    this.pty.on('exit', () => {
      if (!this.ended) {
        this.ended = true;
        this.emit('exit');
      }
    });

    this.shell = shell || defaultShell;
  }

  exit() {
    this.destroy();
  }

  write(data) {
    this.pty.write(data);
  }

  resize({cols, rows}) {
    try {
      this.pty.resize(cols, rows);
    } catch (err) {
      //eslint-disable-next-line no-console
      console.error(err.stack);
    }
  }

  destroy() {
    try {
      this.pty.kill();
    } catch (err) {
      //eslint-disable-next-line no-console
      console.error('exit error', err.stack);
    }
    this.emit('exit');
    this.ended = true;
  }
};
