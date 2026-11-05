// Native
import os from 'os';
import path from 'path';

// Packages
import test from 'ava';
import fs from 'fs-extra';
import {_electron} from 'playwright';
import type {ElectronApplication} from 'playwright';

let app: ElectronApplication;
let configRoot: string;

test.before(async () => {
  let pathToBinary;

  switch (process.platform) {
    case 'linux':
      pathToBinary = path.join(__dirname, '../dist/linux-unpacked/hyper');
      break;

    case 'darwin':
      pathToBinary = path.join(
        __dirname,
        `../dist/${process.arch === 'arm64' ? 'mac-arm64' : 'mac'}/Hyper.app/Contents/MacOS/Hyper`
      );
      break;

    case 'win32':
      pathToBinary = path.join(__dirname, '../dist/win-unpacked/Hyper.exe');
      break;

    default:
      throw new Error('Path to the built binary needs to be defined for this platform in test/index.js');
  }

  configRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'hyper-e2e-'));
  const configDir = path.join(configRoot, 'Hyper');
  const pluginDir = path.join(configDir, 'plugins', 'local', 'hidden-verification');
  await fs.ensureDir(pluginDir);
  await fs.writeJson(path.join(pluginDir, 'package.json'), {
    name: 'hidden-verification',
    version: '1.0.0',
    main: 'index.js'
  });
  await fs.writeFile(
    path.join(pluginDir, 'index.js'),
    'exports.decorateBrowserOptions = options => ({...options, show: false});\n' +
      'exports.onWindowClass = win => { win.show = () => {}; };\n'
  );
  await fs.writeJson(path.join(configDir, 'hyper.json'), {
    config: {disableAutoUpdates: true, autoUpdatePlugins: false},
    plugins: [],
    localPlugins: ['hidden-verification'],
    keymaps: {}
  });
  app = await _electron.launch({
    executablePath: pathToBinary,
    args: [`--user-data-dir=${path.join(configRoot, 'user-data')}`],
    env: {...process.env, XDG_CONFIG_HOME: configRoot}
  });
  const page = await app.firstWindow();
  await page.waitForSelector('.xterm-screen', {state: 'attached'});
});

test.after.always(async () => {
  if (app) {
    try {
      const image = await app.evaluate(({BrowserWindow}) =>
        BrowserWindow.getAllWindows()[0]
          ?.capturePage()
          .then((img) => img.toPNG().toString('base64'))
      );
      await fs.outputFile(`dist/tmp/${process.platform}_test.png`, Buffer.from(image || '', 'base64'));
    } finally {
      await app.close();
    }
  }
  if (configRoot) await fs.remove(configRoot);
});

test('see if dev tools are open', async (t) => {
  t.false(await app.evaluate(({BrowserWindow}) => BrowserWindow.getAllWindows()[0].webContents.isDevToolsOpened()));
});

test('verification windows stay hidden', async (t) => {
  t.false(await app.evaluate(({BrowserWindow}) => BrowserWindow.getAllWindows()[0].isVisible()));
});

if (process.platform === 'darwin') {
  test.serial('native controls follow the terminal background in light and dark themes', async (t) => {
    const configPath = path.join(configRoot, 'Hyper', 'hyper.json');
    const config = await fs.readJson(configPath);

    const waitForAppearance = async (appearance: 'light' | 'dark') => {
      const deadline = Date.now() + 10000;
      while (Date.now() < deadline) {
        if ((await app.evaluate(({nativeTheme}) => nativeTheme.themeSource)) === appearance) return;
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      t.fail(`Native appearance did not change to ${appearance}`);
    };

    t.is(await app.evaluate(({nativeTheme}) => nativeTheme.themeSource), 'dark');
    try {
      await fs.writeJson(configPath, {...config, config: {...config.config, backgroundColor: '#ffffff'}});
      await waitForAppearance('light');
      t.is(await app.evaluate(({nativeTheme}) => nativeTheme.themeSource), 'light');
    } finally {
      await fs.writeJson(configPath, config);
      await waitForAppearance('dark');
    }
    t.is(await app.evaluate(({nativeTheme}) => nativeTheme.themeSource), 'dark');
  });
}
