const electron = require('electron');
const Config = require('electron-config');

// local storage
const cfg = new Config({
  defaults: {
    windowPosition: [50, 50],
    windowSize: [540, 380]
  }
});

function validateAndFixWindowPosition(position, size) {
  const displays = electron.screen.getAllDisplays();
  const [x, y] = position;
  const positionIsValid = displays.some(({workArea}) => {
    return x >= workArea.x && x <= workArea.x + workArea.width && y >= workArea.y && y <= workArea.y + workArea.height;
  });

  if (!positionIsValid) {
    const {workArea} = electron.screen.getPrimaryDisplay();
    position[0] = workArea.x + (workArea.width - size[0]) / 2;
    position[1] = workArea.y + (workArea.height - size[1]) / 2;
    cfg.set('windowPosition', position);
  }

  return {position, size};
}

module.exports = {
  get() {
    const position = cfg.get('windowPosition');
    const size = cfg.get('windowSize');
    return validateAndFixWindowPosition(position, size);
  },
  recordState(win) {
    cfg.set('windowPosition', win.getPosition());
    cfg.set('windowSize', win.getSize());
  },
  validateAndFixWindowPosition
};
