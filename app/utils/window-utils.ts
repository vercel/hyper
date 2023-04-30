import electron from 'electron';

/**
 * Check if target position falls within workArea of each filtered display
 */
export function positionIsValid(position: [number, number]) {
  const displays = electron.screen.getAllDisplays();
  const [x, y] = position;

  return displays.some(({workArea}) => {
    return x >= workArea.x && x <= workArea.x + workArea.width && y >= workArea.y && y <= workArea.y + workArea.height;
  });
}
