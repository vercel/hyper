import type {BrowserWindow} from 'electron';

import Config from 'electron-store';

export const defaults = {
  windowPosition: [50, 50] as [number, number],
  windowSize: [540, 380] as [number, number]
};

// local storage
const cfg = new Config({defaults});

export function get() {
  const position = cfg.get('windowPosition', defaults.windowPosition);
  const size = cfg.get('windowSize', defaults.windowSize);
  return {position, size};
}
export function recordState(win: BrowserWindow) {
  cfg.set('windowPosition', win.getPosition());
  cfg.set('windowSize', win.getSize());
}
