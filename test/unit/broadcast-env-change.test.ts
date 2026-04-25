import test from 'ava';

import {
  BROADCAST_PS_SCRIPT,
  encodePowerShellCommand,
  POWERSHELL_BROADCAST_ARGS
} from '../../app/utils/broadcast-env-change';

test('BROADCAST_PS_SCRIPT calls user32!SendMessageTimeout with WM_SETTINGCHANGE for "Environment"', (t) => {
  // Sanity-check the literal payload we ship to PowerShell. If any of these
  // markers go missing, we are no longer broadcasting an environment-change
  // event to the rest of the system, and Windows users will be back to
  // needing a reboot for `hyper` to land on PATH.
  t.true(BROADCAST_PS_SCRIPT.includes('user32.dll'));
  t.true(BROADCAST_PS_SCRIPT.includes('SendMessageTimeout'));
  // 0xFFFF == HWND_BROADCAST
  t.true(BROADCAST_PS_SCRIPT.includes('0xFFFF'));
  // 0x1A == WM_SETTINGCHANGE
  t.true(BROADCAST_PS_SCRIPT.includes('0x1A'));
  // The lParam value must literally be the string "Environment" so that
  // listeners know which environment block to refresh.
  t.true(BROADCAST_PS_SCRIPT.includes('"Environment"'));
});

test('encodePowerShellCommand produces UTF-16LE base64 (round-trip)', (t) => {
  const encoded = encodePowerShellCommand(BROADCAST_PS_SCRIPT);
  // base64 alphabet only
  t.regex(encoded, /^[A-Za-z0-9+/=]+$/);
  // Round-trip back to the original script via UTF-16LE decoding, which is
  // exactly what `powershell.exe -EncodedCommand` does internally.
  const decoded = Buffer.from(encoded, 'base64').toString('utf16le');
  t.is(decoded, BROADCAST_PS_SCRIPT);
});

test('POWERSHELL_BROADCAST_ARGS ends with -EncodedCommand and disables profile/interactivity', (t) => {
  t.is(POWERSHELL_BROADCAST_ARGS[POWERSHELL_BROADCAST_ARGS.length - 1], '-EncodedCommand');
  t.true(POWERSHELL_BROADCAST_ARGS.includes('-NoProfile'));
  t.true(POWERSHELL_BROADCAST_ARGS.includes('-NonInteractive'));
});
