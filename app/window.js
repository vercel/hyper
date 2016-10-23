const {BrowserWindow} = require('electron');
const Tab = require('./tab');

// const elements = new Map();

module.exports = class Window extends BrowserWindow {
  constructor(ops) {
    super(ops);
    this.tabs = new Set([]);
    
  }
  
  setRpc(rpc) {
    this.rpc = rpc;
  }
  
  createTab(opts) {
    const size = this.tabs.size;
    this.tabs.add(new Tab(size + 1, opts, this.rpc, (uid, tab) => {
      this.sessions.set(uid, tab);
      tab.session.on('data', data => {
        this.rpc.emit('session data', {uid, data});
      });
      
      tab.session.on('title', title => {
        this.setTitle(title);
        this.rpc.emit('session title', {uid, title});
      });
      
      tab.session.on('exit', () => {
        this.tabs.delete(tab);
        this.sessions.delete(uid);
        this.rpc.emit('session exit', {uid});
      });
    }));
  }
  
  deleteSessions() {
    this.sessions.forEach((element, key) => {
        element.session.removeAllListeners();
        element.session.destroy();
        this.sessions.delete(key);
    });
  }
  
  record(fn) {
    const win = { ID: this.id, size: this.getSize(), position: this.getPosition(), tabs:[]};
    this.tabs.forEach((tab) => {
      tab.record(state => {
        win.tabs.push(state);
      });
    });
    fn(win);
  }

};
