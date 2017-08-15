const {isAbsolute} = require('path');
const uuid = require('uuid');
const {cfgDir} = require('../config/paths');
const Pane = require('./pane');

module.exports = class Tab {
  constructor(uid, window) {
    this.uid = uid;
    this.head = undefined;
    this.panes = new Map();
    this.activePane = undefined;
    this.window = window;
  }

  main(options, cfg) {
    const opts = Object.assign({
      rows: 40,
      cols: 100,
      cwd: process.argv[1] && isAbsolute(process.argv[1]) ? process.argv[1] : cfgDir,
      splitDirection: undefined,
      shell: cfg.shell,
      shellArgs: cfg.shellArgs && Array.from(cfg.shellArgs)
    }, options);
    const pane = new Pane(uuid.v4(), opts, this.window);
    this.head = pane;
    this.activePane = pane;
    this.panes.set(pane.uid, pane);
  }

  removePane(uid) {
    this.panes.delete(uid);
  }

  split(options, cfg) {
    const opts = Object.assign({
      rows: 40,
      cols: 100,
      cwd: process.argv[1] && isAbsolute(process.argv[1]) ? process.argv[1] : cfgDir,
      splitDirection: undefined,
      shell: cfg.shell,
      shellArgs: cfg.shellArgs && Array.from(cfg.shellArgs)
    }, options);
    const pane = new Pane(uuid.v4(), opts, this.window);
    this.activePane = pane;
    this.panes.set(pane.uid, pane);
  }

  close() {
    this.panes.forEach((pane, key) => {
      const session = this.window.sessions.get(key);
      if (session) {
        console.log('kill pane', key);
        session.removeAllListeners();
        session.destroy();
        this.window.sessions.delete(key);
      } else {
        console.log('session not found by', key);
      }
    });
  }
};
