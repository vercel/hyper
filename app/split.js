const uuid = require('uuid');
const Session = require('./session');

function initSession(opts, fn) {
  if (opts.uid) {
    fn(opts.uid, new Session(opts));
  } else {
    fn(uuid.v4(), new Session(opts));
  }
}

module.exports = class Split {
  constructor(id, {rows, cols, cwd, shell, shellArgs, splitDirection, activeUid, uid}, rpc, fn) {
    this.id = id;
    this.direction = splitDirection;
    this.rpc = rpc;
    initSession({rows, cols, cwd, shell, shellArgs, uid}, (uid, session) => {
      this.uid = uid;
      this.session =  session;
      
      rpc.emit('session add', {
        rows,
        cols,
        uid,
        splitDirection,
        shell: session.shell,
        pid: session.pty.pid,
        activeUid: activeUid
      });
      
      fn(uid, this);
    }); 
    
    this.splits = new Set([]);
  }
  
  split(opts, win, recordedSplit) {
    if (recordedSplit) {
      opts.uid = recordedSplit.uid;
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
        this.rpc.emit('session exit', {uid});
      });
      
      if (recordedSplit) {
        recordedSplit.splits.forEach(split => {
          this.rpc.emit('split load', {uid: recordedSplit.uid, split: split});
        });
      }
    }));
  }
  
  record(fn) {
    const splitState = {id: this.id, uid: this.uid, type: 'SPLIT', direction: this.direction, splits: []};
    this.splits.forEach((split) => {
      split.record(state => {
        splitState.splits.push(state);
      });
    });
    fn(splitState);
  }
  
};
