const {exec} = require('child_process');
const initSession = require('../utils/init-session');

module.exports = class Pane {
  constructor({rows, cols, cwd, shell, shellArgs, splitDirection, activeUid, uid, parent}, rpc, fn) {
    this.rpc = rpc;
    this.parent = parent;
    this.childs = new Set([]);

    initSession({rows, cols, cwd, shell, shellArgs, uid}, (uid, session) => {
      this.uid = uid;
      this.session = session;

      if (splitDirection) {
        this.direction = splitDirection;
        rpc.emit('session add', {
          rows,
          cols,
          uid,
          splitDirection,
          shell: session.shell,
          pid: session.pty.pid,
          activeUid
        });
      } else {
        rpc.emit('session add', {
          rows,
          cols,
          uid,
          shell: session.shell,
          pid: session.pty.pid
        });
      }
      fn(this);
    });
  }

  toRoot() {
    this.direction = undefined;
    this.parent = undefined;
    this.root = true;
  }

  onSplit(opts, win, recorded) {
    if (recorded) {
      opts.uid = recorded.uid;
      opts.cwd = recorded.cwd;
    }
    this.childs.add(new Pane(opts, this.rpc, pane => {
      win.sessions.set(pane.uid, pane);
      pane.session.on('data', data => {
        this.rpc.emit('session data', {uid: pane.uid, data});
      });

      pane.session.on('exit', () => {
        if (!pane.root) {
          pane.parent.childs.delete(pane);
          if (pane.childs.size >= 1) {
            pane.childs.forEach(child => {
              child.parent = pane.parent;
              pane.parent.childs.add(child);
            });
          }
        }
      });
      if (recorded) {
        recorded.childs.forEach(pane => {
          this.rpc.emit('pane restore', {uid: recorded.uid, pane});
        });
      }
    }));
  }

  lastChild() {
    let cpt = 0;
    let last;
    this.childs.forEach(child => {
      cpt++;
      if (cpt === this.childs.size) {
        last = child;
      }
    });
    return last;
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

    const pane = {uid: this.uid, cwd: this.cwd, type: 'PANE', root: this.root, direction: this.direction, childs: []};
    this.childs.forEach(child => {
      child.record(state => {
        pane.childs.push(state);
      });
    });
    fn(pane);
  }

};
