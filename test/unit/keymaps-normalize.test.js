import test from 'ava';
import {returnCommand} from '../../lib/utils/keymaps-normalize';

const expectedCommand = 'test-command';
const expectedLocalizedCommand = 'test-localized-command';

const commands = {
  'alt+p+shift': expectedCommand,
  'ç+cmd+ctrl': expectedLocalizedCommand
};

test(`returns a command`, t => {
  t.is(
    returnCommand('alt+shift+p', commands),
    expectedCommand
  );

  t.is(
    returnCommand('shift+p+alt', commands),
    expectedCommand
  );

  t.is(
    returnCommand('p+alt+shift', commands),
    expectedCommand
  );
});

test(`returns a localized command`, t => {
  t.is(
    returnCommand('cmd+ctrl+ç', commands),
    expectedLocalizedCommand
  );

  t.is(
    returnCommand('ç+cmd+ctrl', commands),
    expectedLocalizedCommand
  );

  t.is(
    returnCommand('ctrl+ç+cmd', commands),
    expectedLocalizedCommand
  );
});
