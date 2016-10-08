const initSession = require('../utils/init-session');
const uuid = require('uuid');
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

  onSplit(opts, win, recordedSplit) {
    // if (recordedSplit) {
    //   opts.uid = recordedSplit.uid;
    //   opts.cwd = recordedSplit.cwd;
    // }
    // const size = this.childs.size;
    new Pane(opts, this.rpc, pane => {
      this.childs.add(pane);
        win.sessions.set(pane.uid, pane);
        pane.session.on('data', data => {
          this.rpc.emit('session data', {uid: pane.uid, data});
        });
        pane.session.on('exit', () => {
          if (pane.childs.size >= 1) {
            if (!pane.root) {
              pane.parent.childs.delete(pane);
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
    });

    // this.childs.add(new Split(size + 1, opts, this.rpc, (uid, split) => {
    //   // if(size === 1) {
    //   //   this.firstSplit = uid;
    //   // }
    //   win.sessions.set(uid, split);
    //   split.session.on('data', data => {
    //     this.rpc.emit('session data', {uid, data});
    //   });
    // 
    //   split.session.on('title', title => {
    //     win.setTitle(title);
    //     this.rpc.emit('session title', {uid, title});
    //   });
      // 
      // split.session.on('exit', () => {
      //   this.splits.delete(split);
      //   win.sessions.delete(uid);
      //   let id = 0;
      //   this.splits.forEach(split => {
      //     split.id = ++id;
      //   });
      //   this.rpc.emit('session exit', {uid});
      // });
      // 
      // if (recordedSplit) {
      //   recordedSplit.splits.forEach(split => {
      //     this.rpc.emit('split load', {uid: recordedSplit.uid, split});
      //   });
      // }
    // }));
  }

  firstChild() {
    let cpt = 0;
    let first = undefined;
    this.childs.forEach(child => {
      cpt++;
      if (cpt === 1) {
        first = child;
      }
    });
    return first;      
  }

};
