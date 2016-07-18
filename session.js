const { homedir } = require('os');
const { EventEmitter } = require('events');
const { exec } = require('child_process');
const defaultShell = require('default-shell');

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

const { getConfig } = require('./config');
const TITLE_POLL_INTERVAL = 500;

module.exports = class Session extends EventEmitter {

  constructor ({ rows, cols: columns, cwd, shell }) {
    super();
    this.pty = spawn(shell || defaultShell, ['--login'], {
      columns,
      rows,
      cwd,
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

    this.shell = defaultShell;
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

  getCurrentWorkingDirectory (pid) {
    return new Promise((resolve, reject) => {
      // TODO: only tested on mac
      exec(`lsof -p ${pid} | grep cwd`, (err, out) => {
        if (this.ended || err) {
          reject();
          return;
        }

        // TODO: can homedir() be ran just once?
        const homeDirectory = homedir();
        let cwd = out.split(' ').pop();

        if (cwd.substr(0, homeDirectory.length) === homeDirectory) {
          cwd = cwd.replace(homeDirectory, '~');
        }

        resolve(cwd);
      });
    });
  }

  getCurrentProcess (tty) {
    return new Promise((resolve, reject) => {
      // TODO: limit the concurrency of how many processes we run?
      // TODO: only tested on mac

      // try to exclude grep from the results
      // by grepping for `[s]001` instead of `s001`
      const grep = `[${tty[0]}]${tty.substr(1)}`;

      exec(`ps uxac | grep ${grep} | head -n 1`, (err, out) => {
        if (this.ended || err) {
          reject();
          return;
        }

        const [user, pid, ...fragments] = out.trim().split(/\s+/);
        let title = fragments.pop();

        if (title) {
          title = title.replace(/^\(/, '');
          title = title.replace(/\)?\n$/, '');
        }

        resolve({user, pid, title});
      });
    });
  }

  getTitle () {
    if ('win32' === process.platform) return;
    if (this.fetching) return;

    let tty = this.pty.stdout.ttyname.replace(/^\/dev\/tty/, '');
    this.fetching = true;

    this.getCurrentProcess(tty).then(({ user, pid, title }) => {
      if (pid && getConfig().displayTitleCwd) {
        return this.getCurrentWorkingDirectory(pid).then((cwd) => {
          return `${cwd} – ${title}`;
        });
      }

      return title;
    }).then((title) => {
      if (title !== this.lastTitle) {
        this.emit('title', title);
        this.lastTitle = title;
      }
    }).catch(() => {
      // do nothing
    })

    // always restart the loop, even on error, to avoid stalls
    .then(() => {
      this.fetching = false;

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
