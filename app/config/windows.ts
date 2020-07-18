import Config from 'electron-store';
import {BrowserWindow} from 'electron';

const defaults = {
  windowPosition: [50, 50],
  windowSize: [540, 380]
};

// local storage
const cfg = new Config({defaults});

export default {
  defaults,
  get() {
    const position = cfg.get('windowPosition', defaults.windowPosition);
    const size = cfg.get('windowSize', defaults.windowSize);
    return {position, size};
  },
  recordState(win: BrowserWindow) {
    cfg.set('windowPosition', win.getPosition());
    cfg.set('windowSize', win.getSize());
  }
};
