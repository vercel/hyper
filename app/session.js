const {EventEmitter} = require('events');
const {StringDecoder} = require('string_decoder');

const {app} = require('electron');
const defaultShell = require('default-shell');

const {getDecoratedEnv} = require('./plugins');
const {productName, version} = require('./package');
const config = require('./config');

let spawn;
try {
  spawn = require('child_pty').spawn;
} catch (err) {
  console.error(
    'A native module failed to load. Typically this means ' +
    'you installed the modules incorrectly.\n Use `scripts/install.sh` ' +
    'to trigger the installation.\n ' +
    'More information: https://github.com/zeit/hyper/issues/72'
  );
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

    this.pty = spawn(shell || defaultShell, shellArgs || defaultShellArgs, {
      columns,
      rows,
      cwd,
      env: getDecoratedEnv(baseEnv)
    });

    this.pty.stdout.on('data', data => {
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
    this.pty.stdin.write(data);
  }

  resize({cols: columns, rows}) {
    try {
      this.pty.stdout.resize({columns, rows});
    } catch (err) {
      console.error(err.stack);
    }
  }

  destroy() {
    try {
      this.pty.kill('SIGHUP');
    } catch (err) {
      console.error('exit error', err.stack);
    }
    this.emit('exit');
    this.ended = true;
  }

};
