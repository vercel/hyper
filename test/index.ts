/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/await-thenable */
// Native
import path from 'path';
import fs from 'fs-extra';

// Packages
import test from 'ava';
import {Application} from 'spectron';

let app: Application;

test.before(async () => {
  let pathToBinary;

  switch (process.platform) {
    case 'linux':
      pathToBinary = path.join(__dirname, '../dist/linux-unpacked/hyper');
      break;

    case 'darwin':
      pathToBinary = path.join(__dirname, '../dist/mac/Hyper.app/Contents/MacOS/Hyper');
      break;

    case 'win32':
      pathToBinary = path.join(__dirname, '../dist/win-unpacked/Hyper.exe');
      break;

    default:
      throw new Error('Path to the built binary needs to be defined for this platform in test/index.js');
  }

  app = new Application({
    path: pathToBinary
  });

  await app.start();
});

test.after(async () => {
  await new Promise((resolve) => setTimeout(resolve, 5000));
  await app.browserWindow.capturePage().then(async (imageBuffer) => {
    await fs.writeFile(`dist/tmp/${process.platform}_test.png`, imageBuffer);
  });
  await app.stop();
});

test('see if dev tools are open', async (t) => {
  await app.client.waitUntilWindowLoaded();
  t.false(await app.webContents.isDevToolsOpened());
});
