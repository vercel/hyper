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

exports.getColorMap = colors => {
  if (!Array.isArray(colors)) {
    return colors;
  }
  return colors.reduce((result, color, index) => {
    if (index < colorList.length) {
      result[colorList[index]] = color;
    }
    return result;
  }, {});
};
