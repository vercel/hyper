// Packages
import Color from 'color';

// returns a background color that's in hex
// format including the alpha channel (e.g.: `#00000050`)
// input can be any css value (rgb, hsl, string…)
const toElectronBackgroundColor = (bgColor: string) => {
  const color = Color(bgColor);

  if (color.alpha() === 1) {
    return color.hex().toString();
  }

  // http://stackoverflow.com/a/11019879/1202488
  const alphaHex = Math.round(color.alpha() * 255).toString(16);
  return `#${alphaHex}${color.hex().toString().slice(1)}`;
};

export default toElectronBackgroundColor;
