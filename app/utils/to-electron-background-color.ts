// Packages
import Color from 'color';

const colorCache: Record<string, Color> = {};

// returns a background color that's in hex
// format including the alpha channel (e.g.: `#00000050`)
// input can be any css value (rgb, hsl, string…)
export default (bgColor: string) => {
  let color = colorCache[bgColor];
  if (!color) {
    color = Color(bgColor);
    colorCache[bgColor] = color;
  }

  const alpha = color.alpha();
  if (alpha === 1) {
    return color.hex();
  }

  // http://stackoverflow.com/a/11019879/1202488
  const alphaHex = Math.round(color.alpha() * 255).toString(16);
  return `#${alphaHex}${color.hex().toString().slice(1)}`;
};
