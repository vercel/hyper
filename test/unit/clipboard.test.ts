// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {fileURLToPath} from 'url';

import test from 'ava';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const proxyquire = require('proxyquire').noCallThru();

function loadClipboard(uris?: string) {
  let reads = 0;
  const {readClipboardFilePaths} = proxyquire('../../app/utils/clipboard', {
    electron: {
      clipboard: {
        read: () => {
          reads++;
          return Promise.resolve(
            uris === undefined ? [] : [{types: ['text/uri-list'], getType: () => Promise.resolve(new Blob([uris]))}]
          );
        }
      }
    },
    url: {fileURLToPath}
  }) as typeof import('../../app/utils/clipboard');
  return {readClipboardFilePaths, reads: () => reads};
}

test('paste macOS files with spaces and apostrophes as shell arguments', async (t) => {
  const {readClipboardFilePaths} = loadClipboard(
    '# copied files\r\nfile:///tmp/a%20file.txt\r\nfile:///tmp/it%27s.txt\r\n'
  );
  t.is(await readClipboardFilePaths('darwin'), "'/tmp/a file.txt' '/tmp/it'\\''s.txt'");
});

test('paste Windows file references without URI escaping', async (t) => {
  const {readClipboardFilePaths} = loadClipboard('file:///C:/a%20file.txt');
  t.is(await readClipboardFilePaths('win32'), 'C:\\a file.txt');
});

test('leave ordinary text paste to the renderer', async (t) => {
  t.is(await loadClipboard().readClipboardFilePaths('darwin'), null);
  t.is(await loadClipboard('# empty\r\n').readClipboardFilePaths('darwin'), null);
});

test('Linux retains its native text path paste', async (t) => {
  const clipboard = loadClipboard('file:///tmp/test');
  t.is(await clipboard.readClipboardFilePaths('linux'), null);
  t.is(clipboard.reads(), 0);
});

test('reject invalid file references so the renderer can fall back to text', async (t) => {
  await t.throwsAsync(loadClipboard('https://example.com/test').readClipboardFilePaths('darwin'));
});
