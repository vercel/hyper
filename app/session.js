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

// Max duration to batch session data before sending it to the renderer process.
const BATCH_DURATION_MS = 16;

// Max size of a session data batch. Note that this value can be exceeded by ~4k
// (chunk sizes seem to be 4k at the most)
const BATCH_MAX_SIZE = 200 * 1024;

// Data coming from the pty is sent to the renderer process for further
// vt parsing and rendering. This class batches data to minimize the number of
// IPC calls. It also reduces GC pressure and CPU cost: each chunk is prefixed
// with the window ID which is then stripped on the renderer process and this
// overhead is reduced with batching.
class DataBatcher extends EventEmitter {
  constructor(uid) {
    super();
    this.uid = uid;
    this.decoder = new StringDecoder('utf8');

    this.reset();
  }

  reset() {
    this.data = this.uid;
    this.timeout = null;
  }

  write(chunk) {
    if (this.data.length + chunk.length >= BATCH_MAX_SIZE) {
      // We've reached the max batch size. Flush it and start another one
      if (this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = null;
      }
      this.flush();
    }

    this.data += this.decoder.write(chunk);

    if (!this.timeout) {
      this.timeout = setTimeout(() => this.flush(), BATCH_DURATION_MS);
    }
  }

  flush() {
    // Reset before emitting to allow for potential reentrancy
    const data = this.data;
    this.reset();

    this.emit('flush', data);
  }
}

module.exports = class Session extends EventEmitter {
  constructor(options) {
    super();
    this.pty = null;
    this.batcher = null;
    this.shell = null;
    this.ended = false;
    this.init(options);
  }

  init({uid, rows, cols: columns, cwd, shell, shellArgs}) {
    const osLocale = require('os-locale');
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

    this.batcher = new DataBatcher(uid);
    this.pty.on('data', chunk => {
      if (this.ended) {
        return;
      }
      this.batcher.write(chunk);
    });

    this.batcher.on('flush', data => {
      this.emit('data', data);
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
    if (this.pty) {
      this.pty.write(data);
    } else {
      //eslint-disable-next-line no-console
      console.warn('Warning: Attempted to write to a session with no pty');
    }
  }

  resize({cols, rows}) {
    if (this.pty) {
      try {
        this.pty.resize(cols, rows);
      } catch (err) {
        //eslint-disable-next-line no-console
        console.error(err.stack);
      }
    } else {
      //eslint-disable-next-line no-console
      console.warn('Warning: Attempted to resize a session with no pty');
    }
  }

  destroy() {
    if (this.pty) {
      try {
        this.pty.kill();
      } catch (err) {
        //eslint-disable-next-line no-console
        console.error('exit error', err.stack);
      }
    } else {
      //eslint-disable-next-line no-console
      console.warn('Warning: Attempted to destroy a session with no pty');
    }
    this.emit('exit');
    this.ended = true;
  }
};
