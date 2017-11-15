import test from 'ava';
const proxyquire = require('proxyquire').noCallThru();

test("get() doesn't change window position when valid", t => {
  const position = [50, 50];
  const size = [100, 100];
  const windowConfig = proxyquire('../../app/config/windows', {
    'electron-config': function ctor() {
      this.get = key => {
        switch (key) {
          case 'windowPosition':
            return position;
          case 'windowSize':
            return size;
        }
      };
    },
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

  const result = windowConfig.get();

  t.is(result.position, position);
  t.is(result.size, size);
});

test("get() doesn't change window position when on second screen", t => {
  const position = [750, 50];
  const size = [100, 100];
  const windowConfig = proxyquire('../../app/config/windows', {
    'electron-config': function ctor() {
      this.get = key => {
        switch (key) {
          case 'windowPosition':
            return position;
          case 'windowSize':
            return size;
        }
      };
    },
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

  const result = windowConfig.get();

  t.is(result.position, position);
  t.is(result.size, size);
});

test('validateAndFixWindowPosition() centers on primary display when position isnt valid', t => {
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
  const windowConfig = proxyquire('../../app/config/windows', {
    'electron-config': function ctor() {
      this.get = key => {
        switch (key) {
          case 'windowPosition':
            return position;
          case 'windowSize':
            return size;
        }
      };
      this.set = () => {};
    },
    electron: {
      screen: {
        getAllDisplays: () => {
          return [primaryDisplay];
        },
        getPrimaryDisplay: () => primaryDisplay
      }
    }
  });

  const result = windowConfig.get();

  t.deepEqual(result.position, [200, 200]);
  t.is(result.size, size);
});
