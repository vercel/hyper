const {isAbsolute} = require('path');
const uuid = require('uuid');
const {cfgDir} = require('../../config/paths');
const Session = require('../../session');

module.exports = (win, options, cfg) => {
  const opts = Object.assign({
    rows: 40,
    cols: 100,
    cwd: process.argv[1] && isAbsolute(process.argv[1]) ? process.argv[1] : cfgDir,
    splitDirection: undefined,
    shell: cfg.shell,
    shellArgs: cfg.shellArgs && Array.from(cfg.shellArgs)
  }, options);

  const initSession = (opts, fn) => {
    fn(uuid.v4(), new Session(opts));
  };

  initSession(opts, (uid, session) => {
    win.sessions.set(uid, session);
    win.rpc.emit('session add', {
      rows: opts.rows,
      cols: opts.cols,
      uid,
      splitDirection: opts.splitDirection,
      shell: session.shell,
      pid: session.pty.pid
    });

    session.on('data', data => {
      win.rpc.emit('session data', uid + data);
    });

    session.on('exit', () => {
      win.rpc.emit('session exit', {uid});
    });
  });
};
