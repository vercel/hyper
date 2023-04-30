import electron from 'electron';

/**
 * Check if target position falls within workArea of each filtered display
 */
export function positionIsValid(position: [number, number]) {
  const displays = electron.screen.getAllDisplays();
  const [x, y] = position;

  // Filter displays based on intersection with target position
  const filteredDisplays = displays.filter(({bounds}) => {
    return x >= bounds.x && x <= bounds.x + bounds.width && y >= bounds.y && y <= bounds.y + bounds.height;
  });

  // Run the check
  return filteredDisplays.some(({workArea}) => {
    return x >= workArea.x && x <= workArea.x + workArea.width && y >= workArea.y && y <= workArea.y + workArea.height;
  });
}
