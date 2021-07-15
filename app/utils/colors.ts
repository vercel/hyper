const colorList = [
  'black',
  'red',
  'green',
  'yellow',
  'blue',
  'magenta',
  'cyan',
  'white',
  'lightBlack',
  'lightRed',
  'lightGreen',
  'lightYellow',
  'lightBlue',
  'lightMagenta',
  'lightCyan',
  'lightWhite',
  'colorCubes',
  'grayscale'
];

export const getColorMap: {
  <T>(colors: T): T extends (infer U)[] ? {[k: string]: U} : T;
} = (colors) => {
  if (!Array.isArray(colors)) {
    return colors;
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return colors.reduce((result, color, index) => {
    if (index < colorList.length) {
      result[colorList[index]] = color;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result;
  }, {});
};
