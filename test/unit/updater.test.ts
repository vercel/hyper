import test from 'ava';

import {shouldAutoInstallUpdate} from '../../app/utils/should-auto-install-update';

test('installs when an update is ready and no windows are open', (t) => {
  t.true(shouldAutoInstallUpdate(true, 0, true));
});

test('does not install while windows are still open', (t) => {
  t.false(shouldAutoInstallUpdate(true, 1, true));
  t.false(shouldAutoInstallUpdate(true, 3, true));
});

test('does not install when no update has been downloaded', (t) => {
  t.false(shouldAutoInstallUpdate(false, 0, true));
});

test('does not install when the platform cannot apply updates', (t) => {
  t.false(shouldAutoInstallUpdate(true, 0, false));
});
