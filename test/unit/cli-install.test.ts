import test from 'ava';

import {refreshPathValueForHyperCLI} from '../../app/utils/windows-path';

test('refreshPathValueForHyperCLI adds the current Hyper bin path', (t) => {
  const refreshedPath = refreshPathValueForHyperCLI(
    'C:\\Windows\\System32;C:\\Users\\alice\\bin',
    'C:\\Users\\alice\\AppData\\Local\\Programs\\Hyper\\resources\\bin',
    'C:\\Users\\alice\\AppData\\Local\\hyper'
  );

  t.is(
    refreshedPath,
    'C:\\Windows\\System32;C:\\Users\\alice\\bin;C:\\Users\\alice\\AppData\\Local\\Programs\\Hyper\\resources\\bin'
  );
});

test('refreshPathValueForHyperCLI removes stale Hyper paths before adding the current one', (t) => {
  const refreshedPath = refreshPathValueForHyperCLI(
    'C:\\Windows\\System32;C:\\Users\\alice\\AppData\\Local\\hyper\\app-4.0.0;C:\\Users\\alice\\bin',
    'C:\\Users\\alice\\AppData\\Local\\Programs\\Hyper\\resources\\bin',
    'C:\\Users\\alice\\AppData\\Local\\hyper'
  );

  t.is(
    refreshedPath,
    'C:\\Windows\\System32;C:\\Users\\alice\\bin;C:\\Users\\alice\\AppData\\Local\\Programs\\Hyper\\resources\\bin'
  );
});

test('refreshPathValueForHyperCLI does not duplicate the current Hyper bin path', (t) => {
  const refreshedPath = refreshPathValueForHyperCLI(
    'C:\\Windows\\System32;C:\\Users\\alice\\AppData\\Local\\Programs\\Hyper\\resources\\bin',
    'C:\\Users\\alice\\AppData\\Local\\Programs\\Hyper\\resources\\bin',
    'C:\\Users\\alice\\AppData\\Local\\hyper'
  );

  t.is(refreshedPath, 'C:\\Windows\\System32;C:\\Users\\alice\\AppData\\Local\\Programs\\Hyper\\resources\\bin');
});
