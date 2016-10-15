const Color = require('color');

// returns a background color that's in hex
// format including the alpha channel (e.g.: `#00000050`)
// input can be any css value (rgb, hsl, string…)
module.exports = bgColor => {
  const color = Color(bgColor);
  if (color.alpha() === 1) {
    return color.hexString();
  }
  // (╯°□°）╯︵ ┻━┻
  return '#' + Math.floor(color.alpha() * 100) + color.hexString().substr(1);
};
