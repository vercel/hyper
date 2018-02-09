import test from 'ava';
const proxyquire = require('proxyquire').noCallThru();

test("get() doesn't change window position when valid", t => {
  const position = [50, 50];
  const size = [100, 100];
  const windowUtils = proxyquire('../../app/utils/window-utils', {
    '../config/windows': {},
    electron: {
      screen: {
        getAllDisplays: () => {
          return [
            {
              workArea: {
                x: 0,
                y: 0,
                width: 500,
                height: 500
              }
            }
          ];
        }
      }
    }
  });

  const result = windowUtils.validateAndFixWindowPosition(position, size);

  t.is(result, position);
});

test("get() doesn't change window position when on second screen", t => {
  const position = [750, 50];
  const size = [100, 100];
  const windowUtils = proxyquire('../../app/utils/window-utils', {
    '../config/windows': {},
    electron: {
      screen: {
        getAllDisplays: () => {
          return [
            {
              workArea: {
                x: 0,
                y: 0,
                width: 500,
                height: 500
              }
            },
            {
              workArea: {
                x: 500,
                y: 0,
                width: 500,
                height: 500
              }
            }
          ];
        }
      }
    }
  });

  const result = windowUtils.validateAndFixWindowPosition(position, size);

  t.is(result, position);
});

test('validateAndFixWindowPosition() uses default position when position isnt valid', t => {
  const primaryDisplay = {
    workArea: {
      x: 0,
      y: 0,
      width: 500,
      height: 500
    }
  };
  const position = [600, 50];
  const size = [100, 100];
  const mockConfig = {
    'electron-config': function ctor() {},
    electron: {
      screen: {
        getAllDisplays: () => {
          return [primaryDisplay];
        },
        getPrimaryDisplay: () => primaryDisplay
      }
    }
  };
  const {defaults} = proxyquire('../../app/config/windows', mockConfig);
  const windowUtils = proxyquire('../../app/utils/window-utils', mockConfig);

  const result = windowUtils.validateAndFixWindowPosition(position, size);

  t.deepEqual(result, defaults.windowPosition);
});
