// Test for xterm addons support from plugins
import test from 'ava';
import {getXtermAddons} from '../../lib/utils/plugins';

test('getXtermAddons returns empty array initially', (t) => {
  const addons = getXtermAddons();
  t.deepEqual(addons, []);
});