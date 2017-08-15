const Session = require('../session');

const initSession = (opts, fn) => {
  fn(opts.uid, new Session(opts));
};

module.exports = class Pane {
  constructor(uid, opts, window) {
    this.uid = uid;
    this.direction = opts.splitDirection;
    this.window = window;
    initSession(Object.assign({uid}, opts), (uid, session) => {
      window.sessions.set(uid, session);
      window.rpc.emit('session add', {
        rows: opts.rows,
        cols: opts.cols,
        uid,
        splitDirection: opts.splitDirection,
        shell: session.shell,
        pid: session.pty.pid
      });

      session.on('data', data => {
        window.rpc.emit('session data', uid + data);
      });

      session.on('exit', () => {
        window.rpc.emit('session exit', {uid});
      });
    });
  }
};
