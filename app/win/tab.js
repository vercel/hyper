const uuid = require('uuid');
const Pane = require('./pane');
const record = require('./record');

module.exports = class Tab {
  constructor(id, window, fn) {
    this.id = id;
    if (!id) {
      this.id = uuid.v4();
    }
    this.window = window;
    fn(this);
  }

  onRoot({rows, cols, cwd, shell, shellArgs, uid}, recorded) {
    if (recorded && recorded.root) {
      uid = recorded.root.uid;
      cwd = recorded.root.cwd;
    }

    this.root = new Pane({rows, cols, cwd, shell, shellArgs, uid}, this.window.rpc, pane => {
      pane.root = true;
      this.window.sessions.set(pane.uid, pane);
      pane.session.on('data', data => {
        this.window.rpc.emit('session data', {uid: pane.uid, data});
      });

      pane.session.on('exit', () => {
        if (pane.root && pane.childs.size >= 1) {
          this.onRootUpdate(pane.lastChild());
          this.store(pane);
        } else {
          this.store();
          this.window.onDeleteTab(this);
        }
        this.window.sessions.delete(pane.uid);
        this.window.rpc.emit('session exit', {uid: pane.uid});
      });

      if (recorded && recorded.root) {
        recorded.root.childs.forEach(pane => {
          this.window.rpc.emit('pane restore', {uid: recorded.root.uid, pane});
        });
      }
    });
  }

  onRootUpdate(pane) {
    this.root.childs.delete(pane);
    pane.toRoot();
    const rootChilds = new Set([]);
    this.root.childs.forEach(child => {
      child.parent = pane;
      rootChilds.add(child);
    });

    pane.childs.forEach(child => {
      rootChilds.add(child);
    });

    pane.childs = rootChilds;
    this.root = pane;

    pane.session.on('exit', () => {
      if (pane.root && pane.childs.size >= 1) {
        this.onRootUpdate(pane.lastChild());
        this.store(pane);
      } else {
        this.store();
        this.window.onDeleteTab(this);
      }
      this.window.sessions.delete(pane.uid);
      this.window.rpc.emit('session exit', {uid: pane.uid});
    });
  }

  to() {
    return {id: this.id, type: 'TAB', root: undefined};
  }

  store(pane) {
    if (pane) {
      const rec = pane.to();
      rec.root = false;
      rec.direction = 'VERTICAL';
      rec.parent = {uid: this.root.uid};
      record.store(rec);
    } else {
      const tab = this.to();
      this.root.store(state => {
        tab.root = state;
      });
      record.store(tab);
    }
  }

  record(fn) {
    const tab = this.to();
    this.root.record(state => {
      tab.root = state;
    });
    fn(tab);
  }

};
