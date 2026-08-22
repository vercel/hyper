import test from 'ava';

import {resolvePlatformConfig} from '../../app/utils/resolve-platform-config';

const baseConfig = () => ({
  shell: '/bin/sh',
  shellArgs: ['--login'],
  env: {BASE: '1'},
  updateChannel: 'stable' as const,
  autoUpdatePlugins: true,
  defaultSSHApp: true,
  disableAutoUpdates: false,
  useConpty: undefined,
  backgroundColor: '#000',
  bell: 'SOUND' as const,
  bellSound: null,
  bellSoundURL: null,
  borderColor: '#333',
  colors: {} as any,
  copyOnSelect: false,
  css: '',
  cursorAccentColor: '#000',
  cursorBlink: false,
  cursorColor: '#fff',
  cursorShape: 'BLOCK' as const,
  disableLigatures: true,
  fontFamily: 'monospace',
  fontSize: 12,
  fontWeight: 'normal' as const,
  fontWeightBold: 'bold' as const,
  foregroundColor: '#fff',
  imageSupport: false,
  letterSpacing: 0,
  lineHeight: 1,
  macOptionSelectionMode: 'vertical',
  padding: '12px',
  preserveCWD: true,
  quickEdit: false,
  screenReaderMode: false,
  scrollback: 1000,
  selectionColor: 'rgba(0,0,0,0.3)',
  showHamburgerMenu: '' as const,
  showWindowControls: '' as const,
  termCSS: '',
  webGLRenderer: false,
  webLinksActivationKey: '' as const,
  workingDirectory: '',
  defaultProfile: 'default',
  profiles: []
});

test('resolvePlatformConfig: linux uses shellLinux', (t) => {
  const cfg = {...baseConfig(), shellLinux: '/bin/bash'};
  const result = resolvePlatformConfig(cfg, 'linux');
  t.is(result.shell, '/bin/bash');
});

test('resolvePlatformConfig: darwin uses shellOsx', (t) => {
  const cfg = {...baseConfig(), shellOsx: '/bin/zsh'};
  const result = resolvePlatformConfig(cfg, 'darwin');
  t.is(result.shell, '/bin/zsh');
});

test('resolvePlatformConfig: win32 uses shellWindows', (t) => {
  const cfg = {...baseConfig(), shellWindows: 'C:\\Windows\\System32\\cmd.exe'};
  const result = resolvePlatformConfig(cfg, 'win32');
  t.is(result.shell, 'C:\\Windows\\System32\\cmd.exe');
});

test('resolvePlatformConfig: shellArgsLinux overrides shellArgs', (t) => {
  const cfg = {...baseConfig(), shellArgsLinux: ['-i']};
  const result = resolvePlatformConfig(cfg, 'linux');
  t.deepEqual(result.shellArgs, ['-i']);
});

test('resolvePlatformConfig: empty shellArgsWindows overrides shellArgs', (t) => {
  const cfg = {...baseConfig(), shellArgsWindows: []};
  const result = resolvePlatformConfig(cfg, 'win32');
  t.deepEqual(result.shellArgs, []);
});

test('resolvePlatformConfig: envLinux is merged with env', (t) => {
  const cfg = {...baseConfig(), env: {BASE: '1', SHARED: 'x'}, envLinux: {LINUX_ONLY: 'y', SHARED: 'z'}};
  const result = resolvePlatformConfig(cfg, 'linux');
  t.deepEqual(result.env, {BASE: '1', SHARED: 'z', LINUX_ONLY: 'y'});
});

test('resolvePlatformConfig: envOsx does not affect linux', (t) => {
  const cfg = {...baseConfig(), envOsx: {MAC_ONLY: '1'}};
  const result = resolvePlatformConfig(cfg, 'linux');
  t.is(result.env['MAC_ONLY'], undefined);
});

test('resolvePlatformConfig: no platform-specific keys leaves config unchanged', (t) => {
  const cfg = baseConfig();
  const result = resolvePlatformConfig(cfg, 'linux');
  t.is(result.shell, '/bin/sh');
  t.deepEqual(result.shellArgs, ['--login']);
  t.deepEqual(result.env, {BASE: '1'});
});

test('resolvePlatformConfig: unsupported platform returns config unchanged', (t) => {
  const cfg = {...baseConfig(), shellLinux: '/bin/bash'};
  const result = resolvePlatformConfig(cfg, 'freebsd' as NodeJS.Platform);
  t.is(result.shell, '/bin/sh');
});

test('resolvePlatformConfig: empty string shellWindows still overrides shell', (t) => {
  const cfg = {...baseConfig(), shellWindows: ''};
  const result = resolvePlatformConfig(cfg, 'win32');
  t.is(result.shell, '');
});
