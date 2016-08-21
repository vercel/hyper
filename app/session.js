const { app } = require('electron');
const { EventEmitter } = require('events');
const { exec } = require('child_process');
const defaultShell = require('default-shell');
const { getDecoratedEnv } = require('./plugins');
const { productName, version } = require('./package');
const config = require('./config');

let spawn;
try {
  spawn = require('child_pty').spawn;
} catch (err) {
  console.error(
    'A native module failed to load. Typically this means ' +
    'you installed the modules incorrectly.\n Use `scripts/install.sh` ' +
    'to trigger the installation.\n ' +
    'More information: https://github.com/zeit/hyperterm/issues/72'
  );
}

const TITLE_POLL_INTERVAL = 500;

const envFromConfig = config.getConfig().env || {};

module.exports = class Session extends EventEmitter {

  constructor ({ rows, cols: columns, cwd, shell, shellArgs }) {
    super();
    const baseEnv = Object.assign({}, process.env, {
      LANG: app.getLocale().replace('-', '_') + '.UTF-8',
      TERM: 'xterm-256color',
      TERM_PROGRAM: productName,
      TERM_PROGRAM_VERSION: version
    }, envFromConfig);

    const defaultShellArgs = ['--login'];

    this.pty = spawn(shell || defaultShell, shellArgs || defaultShellArgs, {
      columns,
      rows,
      cwd,
      env: getDecoratedEnv(baseEnv)
    });

    this.pty.stdout.on('data', (data) => {
      if (this.ended) {
        return;
      }
      this.emit('data', data.toString('utf8'));
    });

    this.pty.on('exit', () => {
      if (!this.ended) {
        this.ended = true;
        this.emit('exit');
      }
    });

    this.shell = shell || defaultShell;
    this.getTitle();
  }

  focus () {
    this.subscribed = true;
    this.getTitle();
  }

  blur () {
    this.subscribed = false;
    clearTimeout(this.titlePoll);
  }

  getTitle () {
    if ('win32' === process.platform) return;
    if (this.fetching) return;
    this.fetching = true;

    let tty = this.pty.stdout.ttyname;
    tty = tty.replace(/^\/dev\/tty/, '');

    // try to exclude grep from the results
    // by grepping for `[s]001` instead of `s001`
    tty = `[${tty[0]}]${tty.substr(1)}`;

    // TODO: limit the concurrency of how many processes we run?
    // TODO: only tested on mac
    exec(`ps uxac | grep ${tty} | head -n 1`, (err, out) => {
      this.fetching = false;
      if (this.ended) return;
      if (err) return;
      let title = out.split(' ').pop();
      if (title) {
        title = title.replace(/^\(/, '');
        title = title.replace(/\)?\n$/, '');
        if (title !== this.lastTitle) {
          this.emit('title', title);
          this.lastTitle = title;
        }
      }

      if (this.subscribed) {
        this.titlePoll = setTimeout(() => this.getTitle(), TITLE_POLL_INTERVAL);
      }
    });
  }

  exit () {
    this.destroy();
  }

  write (data) {
    this.pty.stdin.write(data);
  }

  resize ({ cols: columns, rows }) {
    try {
      this.pty.stdout.resize({ columns, rows });
    } catch (err) {
      console.error(err.stack);
    }
  }

  destroy () {
    try {
      this.pty.kill('SIGHUP');
    } catch (err) {
      console.error('exit error', err.stack);
    }
    this.emit('exit');
    this.ended = true;
    this.blur();
  }

};
