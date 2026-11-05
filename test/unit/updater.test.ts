import test from 'ava';

import {shouldAutoInstallUpdate} from '../../app/utils/should-auto-install-update';

test('installs on darwin when an update is ready and no windows are open', (t) => {
  t.true(shouldAutoInstallUpdate(true, 0, 'darwin'));
});

test('does not install on win32 when an update is ready and no windows are open', (t) => {
  t.false(shouldAutoInstallUpdate(true, 0, 'win32'));
});

test('does not install on linux when an update is ready and no windows are open', (t) => {
  t.false(shouldAutoInstallUpdate(true, 0, 'linux'));
});

test('does not install while windows are still open', (t) => {
  t.false(shouldAutoInstallUpdate(true, 1, 'darwin'));
  t.false(shouldAutoInstallUpdate(true, 3, 'darwin'));
});

test('does not install when no update has been downloaded', (t) => {
  t.false(shouldAutoInstallUpdate(false, 0, 'darwin'));
});
