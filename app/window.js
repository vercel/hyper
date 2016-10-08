const {BrowserWindow} = require('electron');
const Tab = require('./tab');

const elements = new Map();

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
      elements.set(uid, tab);
      tab.session.on('data', data => {
        this.rpc.emit('session data', {uid, data});
      });
      
      tab.session.on('title', title => {
        this.setTitle(title);
        this.rpc.emit('session title', {uid, title});
      });
      
      tab.session.on('exit', () => {
        this.tabs.delete(tab.id);
        elements.delete(uid);
        this.rpc.emit('session exit', {uid});
      });
    }));
  }
  
  get(uid) {
    return elements.get(uid);
  }
  
  set(uid, element) {
    elements.set(uid, element);
  }
  
  remove(uid) {
    elements.delete(uid);
  }
  
  removeElements() {
    elements.forEach((element, key) => {
      if (element.rpc.win.id === this.id) {
        element.session.removeAllListeners();
        element.session.destroy();
        elements.delete(key);
      }
    });
  }
  
  record() {
    const state = {size: this.getSize(), position: this.getPosition()};
    return state;
  }

};
