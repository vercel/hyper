# Electron 45 native macOS controls

Verified on macOS 27.0.1 (26A434), Apple Silicon, with Node 24.14.1 and pnpm 10.33.0. The packaged app reports Electron 45.0.0 and its embedded Node 24.22.0.

Hyper retains `hiddenInset`, the transparent macOS window, plugin-decorated BrowserWindow options, and the existing header layout. The remaining appearance mismatch after updating Electron was the native light appearance on a dark terminal. Native appearance now follows the focused window's terminal background and updates after configuration changes. The user reviewed the packaged app in native dark appearance and confirmed that its controls looked correct.

## Native-control captures

Before, from Hyper at upstream `30ec0a2a`, Electron 22.3.25:

![Hyper before the upgrade](before-electron-22-controls.png)

After, from the terminal-free Electron 45 reproduction using the production `update-native-theme` helper:

![Electron 45 native dark controls reproduction](after-electron-45-controls-reproduction.png)

These are unscaled 2x desktop crops of OS-drawn controls. The after image is explicitly a reproduction, not a packaged Hyper window capture: desktop automation refuses access to `co.zeit.hyper`. Actual packaged-window appearance was confirmed by the user. Renderer screenshots alone do not capture native controls.

To reproduce the after capture after building:

```sh
pnpm exec electron test/fixtures/native-controls.js --show
```

Add `--light` to inspect native light appearance. This fixture opens no terminal. It stays hidden unless `--show` is supplied.

## Local verification

- A frozen installation succeeded with fresh generated `target` and `app/node_modules` directories, including exact-version V8 snapshots and native-module rebuilds.
- `pnpm run verify` passed: formatting through ESLint/Prettier, lint, 12 unit tests, production Webpack/Babel output, and TypeScript compilation.
- `pnpm run test:e2e` passed all three tests against the packaged Apple Silicon app. Windows stay hidden, DevTools stay closed, and changing the configured background to white and back switches native appearance from dark to light and back without a test override.
- The installed Husky pre-commit hook rejected a deliberate parse error with exit code 1 and left HEAD unchanged. The fixture was removed; no hook was bypassed. The existing pre-push test hook is preserved.
- An unsigned local Apple Silicon DMG was built with `electron-builder --mac dmg --arm64 --publish never`. Its minimum macOS version is 13.0.0. This is a development verification package, not a notarized release.
- Packaged terminal input, resize (72x22 to 109x31), text paste, copy-on-select through the main-process bridge, native file-path paste containing a space, multiple tabs, and shell termination after tab/window close passed.
- Packaged BrowserWindow API checks for minimize, restore, enter/leave fullscreen, and close passed. These exercise native window transitions; they do not establish native-button pointer/hover behavior.

The header keeps its 76-point control reservation. The 2x native capture places the right edge of the controls at approximately 72 points. Single- and multiple-tab renderer layouts were inspected separately; no spacing change was required.

### Qualification gaps and existing issue

Native hover and pointer-driven close/minimize/fullscreen checks on the packaged Hyper window could not be completed because desktop automation blocks the app. Windows, Linux and Intel macOS builds require the upstream CI matrix; local macOS verification does not establish their status.

Closing a tab can expose the existing xterm 5.3.0 / canvas-addon 0.5.0 disposal exception, `Cannot read properties of undefined (reading 'onRequestRedraw')`. A minimal canvas-terminal disposal reproduced the same exception on Electron 22.3.25 and 45.0.0. Shell termination succeeded. The unrelated canvas disposal implementation is unchanged, and the manual functional run is not claimed to be free of renderer exceptions.

The original baseline's custom snapshot generator requires an Intel runtime that is unavailable on this macOS 27 machine. The before appearance capture used Electron 22's stock snapshot and resolved renderer dependencies; the old installation/build is not reported as passing the new verification gate.

## Platform and plugin migration

Electron and its snapshot tools are pinned to 45.0.0. Electron 45 requires explicit binary installation. macOS snapshot tools run natively, so CI builds Intel and Apple Silicon Mac packages on separate runners. Native rebuild tooling and the schema generator support Node 24. The `node-pty` 1.0.0 patch is removed because 1.1.0 already avoids the patched pipe-handle cleanup in `PtyKill`.

Use macOS 13+ or Windows 10+ on x64/ARM64, or a supported 64-bit Linux system. Windows ia32 and Linux armv7l targets are removed. Developers need Node 24 and pnpm 10.33.0. Rebuild native plugins for Electron 45; renderer plugins must migrate clipboard access to a main-process bridge or `navigator.clipboard`. Main-process clipboard methods are asynchronous, and native file references use `text/uri-list`. Existing Hyper configuration needs no migration.
