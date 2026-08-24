// Helpers for telling the rest of Windows that the user's PATH changed.
//
// The Win32 environment block of an already-running process is a snapshot
// taken at process creation. Even if you write a new value to
// `HKCU\Environment\PATH`, processes like the existing Explorer / cmd / WSL /
// VSCode terminals will not see it until they exit, get a WM_SETTINGCHANGE
// broadcast, or the user logs out/reboots.
//
// `setx` and the .NET `[Environment]::SetEnvironmentVariable(...)` API both
// do this broadcast for you; `native-reg` does not. We write via `native-reg`
// (because it preserves REG_EXPAND_SZ correctly), so we have to fire the
// broadcast ourselves.
//
// SendMessageTimeoutW(HWND_BROADCAST, WM_SETTINGCHANGE, 0, "Environment", ...)
// is the documented contract:
// https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-sendmessagetimeoutw

// PowerShell snippet that P/Invokes user32!SendMessageTimeoutW. Multi-line
// here-string is fine because we ship this through `-EncodedCommand` (UTF-16
// base64), which is quoting-safe.
//
// Constants used below:
//   HWND_BROADCAST   = 0xFFFF
//   WM_SETTINGCHANGE = 0x001A
//   SMTO_ABORTIFHUNG = 0x0002
//   timeout          = 5000ms
export const BROADCAST_PS_SCRIPT = [
  'Add-Type -Namespace Win32Funcs -Name NativeMethods -MemberDefinition @"',
  '[System.Runtime.InteropServices.DllImport("user32.dll", SetLastError=true, CharSet=System.Runtime.InteropServices.CharSet.Auto)]',
  'public static extern System.IntPtr SendMessageTimeout(System.IntPtr hWnd, uint Msg, System.UIntPtr wParam, string lParam, uint fuFlags, uint uTimeout, out System.IntPtr lpdwResult);',
  '"@;',
  '$out = [System.IntPtr]::Zero;',
  '[void][Win32Funcs.NativeMethods]::SendMessageTimeout([System.IntPtr]0xFFFF, 0x1A, [System.UIntPtr]::Zero, "Environment", 0x0002, 5000, [ref]$out);'
].join('\n');

// Standard hardening flags for an unattended PowerShell child process.
// `-EncodedCommand` itself goes after these.
export const POWERSHELL_BROADCAST_ARGS = [
  '-NoProfile',
  '-NonInteractive',
  '-ExecutionPolicy',
  'Bypass',
  '-EncodedCommand'
] as const;

// PowerShell expects `-EncodedCommand` as a UTF-16LE base64 string. Doing
// this ourselves is more robust than trying to escape the script through a
// shell; it also keeps the ChildProcess args pristine (no quoting needed).
export const encodePowerShellCommand = (script: string): string => Buffer.from(script, 'utf16le').toString('base64');
