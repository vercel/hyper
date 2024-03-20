// Native
import path from 'path';

// Packages
import test from 'ava';
import fs from 'fs-extra';
import {_electron} from 'playwright';
import type {ElectronApplication} from 'playwright';

let app: ElectronApplication;

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

  app = await _electron.launch({
    executablePath: pathToBinary
  });
  await app.firstWindow();
  await new Promise((resolve) => setTimeout(resolve, 5000));
});

test.after(async () => {
  await app
    .evaluate(({BrowserWindow}) =>
      BrowserWindow.getFocusedWindow()
        ?.capturePage()
        .then((img) => img.toPNG().toString('base64'))
    )
    .then((img) => Buffer.from(img || '', 'base64'))
    .then(async (imageBuffer) => {
      await fs.writeFile(`dist/tmp/${process.platform}_test.png`, imageBuffer);
    });
  await app.close();
});

test('see if dev tools are open', async (t) => {
  t.false(await app.evaluate(({webContents}) => !!webContents.getFocusedWebContents()?.isDevToolsOpened()));
});
