// Native
import path from 'path';

// Packages
import test from 'ava';
import {Application} from 'spectron';

let app;

test.before(async () => {
  app = new Application({
    path: path.join(__dirname, '../dist/mac/HyperTerm.app/Contents/MacOS/HyperTerm')
  });

  await app.start();
});

test.after(async () => {
  await app.stop();
});

test('see if dev tools are open', async t => {
  await app.client.waitUntilWindowLoaded();
  t.false(await app.browserWindow.isDevToolsOpened());
});
