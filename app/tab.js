const uuid = require('uuid');
const Session = require('./session');
const Split = require('./split');

function initSession(opts, fn) {
  fn(uuid.v4(), new Session(opts));
}

module.exports = class Tab {
  constructor(id, {rows, cols, cwd, shell, shellArgs}, rpc, fn) {
    this.id = id;
    this.rpc = rpc;
    
    initSession({rows, cols, cwd, shell, shellArgs}, (uid, session) => {
      this.uid = uid;
      this.session =  session;
      
      rpc.emit('session add', {
        rows,
        cols,
        uid,
        shell: session.shell,
        pid: session.pty.pid
      });
      
      fn(uid, this);
    }); 
    
    this.splits = new Set([]);
  }

  split(opts, win) {
    const size = this.splits.size;
    const id = size + 1;
    this.splits.add(new Split(size + 1, opts, this.rpc, (uid, split) => {
      win.set(uid, split);
      split.session.on('data', data => {
        this.rpc.emit('session data', {uid, data});
      });
      
      split.session.on('title', title => {
        win.setTitle(title);
        this.rpc.emit('session title', {uid, title});
      });
      
      split.session.on('exit', () => {
        this.splits.delete(split.id);
        win.remove(uid);
        this.rpc.emit('session exit', {uid});
      });
    }));
  }

};
