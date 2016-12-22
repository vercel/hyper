const Color = require('color');

// returns a background color that's in hex
// format including the alpha channel (e.g.: `#00000050`)
// input can be any css value (rgb, hsl, string…)
module.exports = bgColor => {
  const color = Color(bgColor);
  if (color.alpha() === 1) {
    return color.hexString();
  }

  // http://stackoverflow.com/a/11019879/1202488
  const alphaHex = Math.round(color.alpha() * 255).toString(16);
  return '#' + alphaHex + color.hexString().substr(1);
};
