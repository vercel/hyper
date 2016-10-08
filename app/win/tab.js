const {exec} = require('child_process');
const initSession = require('../utils/init-session');
const Split = require('./split');
const Pane = require('./pane');

module.exports = class Tab {
  constructor(id, window, fn) {
    this.id = id;
    this.window = window;
    fn(this);
  }
  
  onRoot({rows, cols, cwd, shell, shellArgs, uid}) {
    this.root = new Pane({rows, cols, cwd, shell, shellArgs, uid}, this.window.rpc, pane => {
      pane.root = true;
      this.window.sessions.set(pane.uid, pane);
      
      pane.session.on('data', data => {
        this.window.rpc.emit('session data', {uid:pane.uid, data});
      });
      
      pane.session.on('exit', () => {
        if (pane.root && pane.childs.size >= 1) {
          this.onRootUpdate(pane.firstChild());
        }
        this.window.sessions.delete(pane.uid);
        this.window.rpc.emit('session exit', {uid: pane.uid});
      });
    });
  }
  
  onRootUpdate(pane) {
    pane.toRoot();
    pane.session.on('exit', () => {
      if (pane.root && pane.childs.size >= 1) {
        this.onRootUpdate(pane.firstChild());
      }
      this.window.sessions.delete(pane.uid);
      this.window.rpc.emit('session exit', {uid: pane.uid});
    });
    this.root = pane;
  }

  // onSplit(opts, win, recordedSplit) {
  //   if (recordedSplit) {
  //     opts.uid = recordedSplit.uid;
  //     opts.cwd = recordedSplit.cwd;
  //   }
  //   const size = this.splits.size;
  //   this.splits.add(new Split(size + 1, opts, this.rpc, (uid, split) => {
  //     // if(size === 1) {
  //     //   this.firstSplit = uid;
  //     // }
  //     win.sessions.set(uid, split);
  //     split.session.on('data', data => {
  //       this.rpc.emit('session data', {uid, data});
  //     });
  // 
  //     split.session.on('title', title => {
  //       win.setTitle(title);
  //       this.rpc.emit('session title', {uid, title});
  //     });
  // 
  //     split.session.on('exit', () => {
  //       this.splits.delete(split);
  //       win.sessions.delete(uid);
  //       let id = 0;
  //       this.splits.forEach(split => {
  //         split.id = ++id;
  //       });
  //       this.rpc.emit('session exit', {uid});
  //     });
  // 
  //     if (recordedSplit) {
  //       recordedSplit.splits.forEach(split => {
  //         this.rpc.emit('split load', {uid: recordedSplit.uid, split});
  //       });
  //     }
  //   }));
  // }

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
    const tab = {id: this.id, uid: this.uid, cwd: this.cwd, type: 'TAB', splits: []};
    this.splits.forEach(split => {
      split.record(state => {
        tab.splits.push(state);
      });
    });
    fn(tab);
  }

};
