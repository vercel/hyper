import test from 'ava';
import normalize from '../../app/utils/keymaps/normalize';

test(`is normalizing keymaps correctly`, t => {
  const notNormalized = 'cmd+alt+o';
  const normalized = 'alt+cmd+o';

  t.is(normalize(notNormalized), normalized);
});

test(`is normalizing localized keymaps correctly`, t => {
  const notNormalized = 'cmd+alt+ç';
  const normalized = 'alt+ç+cmd';

  t.is(normalize(notNormalized), normalized);
});
