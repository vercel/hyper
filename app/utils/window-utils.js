const electron = require('electron');

function positionIsValid(position) {
  const displays = electron.screen.getAllDisplays();
  const [x, y] = position;

  return displays.some(({workArea}) => {
    return x >= workArea.x && x <= workArea.x + workArea.width && y >= workArea.y && y <= workArea.y + workArea.height;
  });
}

module.exports = {
  positionIsValid
};
