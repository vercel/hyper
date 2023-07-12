// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-unsafe-call */
import test from 'ava';
import sessionHasRunningChildren from '../../app/utils/session-has-children';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const proxyquire = require('proxyquire').noCallThru();

test('positionIsValid() returns true when window is on only screen', (t) => {
  const position = [50, 50];
  const windowUtils = proxyquire('../../app/utils/window-utils', {
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

  const result = windowUtils.positionIsValid(position);

  t.true(result);
});

test('positionIsValid() returns true when window is on second screen', (t) => {
  const position = [750, 50];
  const windowUtils = proxyquire('../../app/utils/window-utils', {
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

  const result = windowUtils.positionIsValid(position);

  t.true(result);
});

test('positionIsValid() returns false when position isnt valid', (t) => {
  const primaryDisplay = {
    workArea: {
      x: 0,
      y: 0,
      width: 500,
      height: 500
    }
  };
  const position = [600, 50];
  const windowUtils = proxyquire('../../app/utils/window-utils', {
    electron: {
      screen: {
        getAllDisplays: () => {
          return [primaryDisplay];
        },
        getPrimaryDisplay: () => primaryDisplay
      }
    }
  });

  const result = windowUtils.positionIsValid(position);

  t.false(result);
});

test('Closing the terminal should show dialog', (t) => {
  const shouldClose = sessionHasRunningChildren({pty: {pid: 1}});
  t.true(shouldClose);
});

test('Has a invalid pid', (t) => {
  t.false(sessionHasRunningChildren({pty: {pid: -99999}}));
});

test('Should not show dialog', (t) => {
  const shouldClose = sessionHasRunningChildren({pty: null});
  t.false(shouldClose);
});
