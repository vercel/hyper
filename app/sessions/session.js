const {EventEmitter} = require('events');
const {StringDecoder} = require('string_decoder');

const {app} = require('electron');
const defaultShell = require('default-shell');

const {getDecoratedEnv} = require('./plugins');
const {productName, version} = require('./package');
const config = require('./config');

const createNodePtyError = () => new Error('`node-pty` failed to load. Typically this means that it was built incorrectly. Please check the `README.me` to more info.');

let spawn;
try {
  spawn = require('node-pty').spawn;
} catch (err) {
  throw createNodePtyError();
}

const envFromConfig = config.getConfig().env || {};

module.exports = class Session extends EventEmitter {

  constructor({rows, cols: columns, cwd, shell, shellArgs}) {
    super();
    const baseEnv = Object.assign({}, process.env, {
      LANG: app.getLocale().replace('-', '_') + '.UTF-8',
      TERM: 'xterm-256color',
      TERM_PROGRAM: productName,
      TERM_PROGRAM_VERSION: version
    }, envFromConfig);

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
      console.error(err.stack);
    }
  }

  destroy() {
    try {
      this.pty.kill();
    } catch (err) {
      console.error('exit error', err.stack);
    }
    this.emit('exit');
    this.ended = true;
  }

};
