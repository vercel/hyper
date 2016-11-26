const initSession = require('../utils/init-session');
const {exec} = require('child_process');
const Session = require('../session');


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
      console.log('uid: ', this.uid, 'childs:', this.childs.size);
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
    new Pane(opts, this.rpc, pane => {
      this.childs.add(pane);
        win.sessions.set(pane.uid, pane);
        pane.session.on('data', data => {
          this.rpc.emit('session data', {uid: pane.uid, data});
        });

        pane.session.on('exit', () => {
          if (!pane.root) {
            pane.parent.childs.delete(pane);
            if (pane.childs.size >= 1) {
              console.log('curentPaneUid: ', pane.uid);
              pane.childs.forEach(child => {
                child.parent = pane.parent;
                pane.parent.childs.add(child);
              });
              console.log('parentUid: ', pane.parent.uid);
              console.log('uid: ', pane.parent.uid, 'childs:', pane.parent.childs.size);
            }
          }
        });
        if (recorded) {
          recorded.childs.forEach(pane => {
            this.rpc.emit('pane restore', {uid: recorded.uid, pane});
          });
        }
    });
  }

  lastChild() {
    let cpt = 0;
    let last = undefined;
    this.childs.forEach(child => {
      cpt++;
      console.log('childUID: ',child.uid);
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
    
    let pane = {};
    if(this.root === true) {
      pane = {uid: this.uid, cwd: this.cwd, type: 'PANE', root: this.root, childs: []};
    } else {
      pane = {uid: this.uid, cwd: this.cwd, type: 'PANE', root: this.root, direction: this.direction, childs: []};
    }
    // if(!this.root) {
    // pane = {uid: this.uid, cwd: this.cwd, type: 'PANE', root: this.root, direction: this.direction, childs: []};
    // }
    // const pane = {uid: this.uid, cwd: this.cwd, type: 'PANE', root: this.root, direction: this.direction, childs: []};
    this.childs.forEach(child => {
      child.record(state => {
        pane.childs.push(state);
      });
    });
    fn(pane);
  }

};
