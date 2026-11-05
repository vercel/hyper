import test from 'ava';

import {decodeOsc52Clipboard, handleOsc52Clipboard} from '../../lib/utils/osc52';

test('decodes OSC 52 system clipboard writes', (t) => {
  const encoded = Buffer.from('Olá, Hyper!').toString('base64');

  t.is(decodeOsc52Clipboard(`c;${encoded}`), 'Olá, Hyper!');
});

test('ignores OSC 52 clipboard reads', (t) => {
  t.is(decodeOsc52Clipboard('c;?'), undefined);
});

test('ignores non-system clipboard selections', (t) => {
  const encoded = Buffer.from('primary').toString('base64');

  t.is(decodeOsc52Clipboard(`p;${encoded}`), undefined);
});

test('rejects malformed OSC 52 payloads', (t) => {
  t.is(decodeOsc52Clipboard('c;not-base64'), undefined);
  t.is(decodeOsc52Clipboard('c;'), '');
});

test('writes decoded OSC 52 data through the host clipboard', (t) => {
  let copied = '';
  const encoded = Buffer.from('from a pane').toString('base64');

  t.true(
    handleOsc52Clipboard(`c;${encoded}`, (text) => {
      copied = text;
    })
  );
  t.is(copied, 'from a pane');
});
