const Config = require('electron-config');

// local storage
const cfg = new Config({
  defaults: {
    windowPosition: [50, 50],
    windowSize: [540, 380]
  }
});

module.exports = {
  get() {
    const position = cfg.get('windowPosition');
    const size = cfg.get('windowSize');
    return {position, size};
  },
  recordState(win) {
    cfg.set('windowPosition', win.getPosition());
    cfg.set('windowSize', win.getSize());
  }
};
