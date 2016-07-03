const { EventEmitter } = require('events');
const { spawn } = require('child_pty');
const { exec } = require('child_process');
const defaultShell = require('default-shell');

const TITLE_POLL_INTERVAL = 1000;

module.exports = class Session extends EventEmitter {

  constructor ({ rows, cols: columns }) {
    super();
    this.pty = spawn(defaultShell, ['--login'], {
      columns,
      rows,
      cwd: process.env.HOME,
      env: Object.assign({}, process.env, {
        TERM: 'xterm-256color'
      })
    });

    this.pty.stdout.on('data', (data) => {
      this.emit('data', data.toString('utf8'));
    });

    this.pty.on('exit', () => {
      if (!this.ended) {
        this.ended = true;
        this.emit('exit');
      }
    });

    this.getTitle();
  }

  focus () {
    this.getTitle(true);
  }

  blur () {
    clearTimeout(this.titlePoll);
  }

  getTitle (subscribe = false) {
    if ('win32' === process.platform) return;

    let tty = this.pty.stdout.ttyname;
    tty = tty.replace(/^\/dev\/tty/, '');

    // try to exclude grep from the results
    // by grepping for `[s]001` instead of `s001`
    tty = `[${tty[0]}]${tty.substr(1)}`;

    // TODO: limit the concurrency of how many processes we run?
    // TODO: only tested on mac
    exec(`ps ac | grep ${tty} | tail -n 1`, (err, out) => {
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

      if (subscribe) {
        this.titlePoll = setTimeout(() => this.getTitle(true), TITLE_POLL_INTERVAL);
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
    clearTimeout(this.titlePoll);
  }

};
