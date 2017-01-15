import test from 'ava';
import toElectronBackgroundColor from '../../app/utils/to-electron-background-color';

function isHexColor(color) {
  return /(^#[0-9A-F]{6,8}$)|(^#[0-9A-F]{3}$)/i.test(color); //https://regex101.com/
}

test('toElectronBackgroundColor', t => {
  t.false(false);
});

test(`returns a color that's in hex`, t => {
  const hexColor = '#BADA55';
  const rgbColor = 'rgb(0,0,0)';
  const rgbaColor = 'rgb(0,0,0, 55)';
  const hslColor = 'hsl(15, 100%, 50%)'
  const hslaColor = 'hsl(15, 100%, 50%, 1)'
  const colorKeyword = 'pink';

  t.true(
    isHexColor(
      toElectronBackgroundColor(hexColor)
    )
  );

  t.true(
    isHexColor(
      toElectronBackgroundColor(rgbColor)
    )
  );

  t.true(
    isHexColor(
      toElectronBackgroundColor(rgbaColor)
    )
  );

  t.true(
    isHexColor(
      toElectronBackgroundColor(hslColor)
    )
  );

  t.true(
    isHexColor(
      toElectronBackgroundColor(hslaColor)
    )
  );

  t.true(
    isHexColor(
      toElectronBackgroundColor(colorKeyword)
    )
  );
});
