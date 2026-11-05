import {nativeTheme} from 'electron';

import Color from 'color';

export default function updateNativeTheme(backgroundColor: string) {
  if (process.platform === 'darwin') {
    // Native controls need the terminal's appearance, even when macOS uses the
    // opposite appearance behind Hyper's transparent titlebar.
    nativeTheme.themeSource = Color(backgroundColor).isDark() ? 'dark' : 'light';
  }
}
