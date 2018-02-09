const electron = require('electron');
const {defaults} = require('../config/windows');

function validateAndFixWindowPosition(position) {
  const displays = electron.screen.getAllDisplays();
  const [x, y] = position;
  const positionIsValid = displays.some(({workArea}) => {
    return x >= workArea.x && x <= workArea.x + workArea.width && y >= workArea.y && y <= workArea.y + workArea.height;
  });

  if (!positionIsValid) {
    position = defaults.windowPosition;
  }

  return position;
}

module.exports = {
  validateAndFixWindowPosition
};
