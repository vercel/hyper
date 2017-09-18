import test from 'ava';
import findCommandByKeys from '../../app/utils/keymaps-find-command-by-keys';

const expectedCommand = 'test-command';
const expectedLocalizedCommand = 'test-localized-command';

const commands = {
  'alt+p+shift': expectedCommand,
  'ç+cmd+ctrl': expectedLocalizedCommand
};

test(`returns a command`, t => {
  t.is(
    findCommandByKeys('alt+shift+p', commands),
    expectedCommand
  );

  t.is(
    findCommandByKeys('shift+p+alt', commands),
    expectedCommand
  );

  t.is(
    findCommandByKeys('p+alt+shift', commands),
    expectedCommand
  );

  t.is(
    findCommandByKeys('alt+shift+P', commands),
    expectedCommand
  );

  t.is(
    findCommandByKeys('Shift+P+Alt', commands),
    expectedCommand
  );
});

test(`returns a localized command`, t => {
  t.is(
    findCommandByKeys('cmd+ctrl+ç', commands),
    expectedLocalizedCommand
  );

  t.is(
    findCommandByKeys('ç+cmd+ctrl', commands),
    expectedLocalizedCommand
  );

  t.is(
    findCommandByKeys('ctrl+ç+cmd', commands),
    expectedLocalizedCommand
  );

  t.is(
    findCommandByKeys('ctrl+Ç+cmd', commands),
    expectedLocalizedCommand
  );

  t.is(
    findCommandByKeys('Cmd+Ctrl+Ç', commands),
    expectedLocalizedCommand
  );
});
