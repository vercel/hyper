// A terminal-free reproduction for inspecting OS-drawn controls. Build first,
// then run: pnpm exec electron test/fixtures/native-controls.js --show [--light]
const path = require('path');
const {app, BrowserWindow} = require('electron');
// Resolve build output at runtime so composite TypeScript keeps it out of the source project.
const updateNativeTheme = require(path.join(__dirname, '../../target/utils/update-native-theme')).default;

app.whenReady().then(async () => {
  const backgroundColor = process.argv.includes('--light') ? '#ffffff' : '#000000';
  updateNativeTheme(backgroundColor);
  const window = new BrowserWindow({
    width: 540,
    height: 380,
    show: false,
    backgroundColor,
    titleBarStyle: 'hiddenInset',
    frame: true,
    transparent: true
  });
  await window.loadURL(`data:text/html,<body style="background:${encodeURIComponent(backgroundColor)}"></body>`);
  if (process.argv.includes('--show')) window.show();
});

app.on('window-all-closed', () => app.quit());
