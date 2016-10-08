const {exec} = require('child_process');
const initSession = require('../utils/init-session');

module.exports = class Split {
  constructor(id, {rows, cols, cwd, shell, shellArgs, splitDirection, activeUid, uid}, rpc, fn) {
    this.id = id;
    this.direction = splitDirection;
    this.rpc = rpc;
    initSession({rows, cols, cwd, shell, shellArgs, uid}, (uid, session) => {
      this.uid = uid;
      this.session = session;

      rpc.emit('session add', {
        rows,
        cols,
        uid,
        splitDirection,
        shell: session.shell,
        pid: session.pty.pid,
        activeUid
      });

      fn(uid, this);
    });

    this.splits = new Set([]);
  }

  onSplit(opts, win, recordedSplit) {
    if (recordedSplit) {
      opts.uid = recordedSplit.uid;
      opts.cwd = recordedSplit.cwd;
    }
    const size = this.splits.size;
    this.splits.add(new Split(size + 1, opts, this.rpc, (uid, split) => {
      win.sessions.set(uid, split);
      split.session.on('data', data => {
        this.rpc.emit('session data', {uid, data});
      });

      split.session.on('title', title => {
        win.setTitle(title);
        this.rpc.emit('session title', {uid, title});
      });

      split.session.on('exit', () => {
        this.splits.delete(split);
        win.sessions.delete(uid);
        let id = 0;
        this.splits.forEach(split => {
          split.id = ++id;
        });
        this.rpc.emit('session exit', {uid});
      });

      if (recordedSplit) {
        recordedSplit.splits.forEach(split => {
          this.rpc.emit('split restore', {uid: recordedSplit.uid, split});
        });
      }
    }));
  }

  record(fn) {
    const pid = this.session.pty.pid;
    exec(`lsof -p ${pid} | grep cwd | tr -s ' ' | cut -d ' ' -f9-`, (err, cwd) => {
      if (err) {
        console.error(err);
      } else {
        cwd = cwd.trim();
        this.cwd = cwd;
      }
    });
    const splitState = {id: this.id, uid: this.uid, cwd: this.cwd, type: 'SPLIT', direction: this.direction, splits: []};
    this.splits.forEach(split => {
      split.record(state => {
        splitState.splits.push(state);
      });
    });
    fn(splitState);
  }

};
