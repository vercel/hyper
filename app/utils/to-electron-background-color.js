const Color = require('color');

// returns a background color that's in hex
// format including the alpha channel (e.g.: `#00000050`)
// input can be any css value (rgb, hsl, string…)
module.exports = function toElectronBackgroundColor (bgColor) {
  const color = Color(bgColor);
  if (1 !== color.alpha()) {
    // (╯°□°）╯︵ ┻━┻
    return '#' + Math.floor(color.alpha() * 100) + color.hexString().substr(1);
  } else {
    return color.hexString();
  }
};
