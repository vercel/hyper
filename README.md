![hyper-logo](https://assets.vercel.com/image/upload/v1549723846/repositories/hyper/hyper-3-repo-banner.png)

###### 🇯🇵 [日本語](./README.JP.md) | 🇺🇸 English

# Hyper Webview Fork

A personal fork based on [vercel/hyper](https://github.com/vercel/hyper) (`canary` branch).
The goal is to restore the webview preview feature that was removed from upstream for security reasons, and to set up a terminal environment suited for daily use.

## Relationship to upstream

-   Forked from: [vercel/hyper](https://github.com/vercel/hyper) (`canary` branch)
-   The webview implementation logic is based on the `built-in-webview` branch of [craftzdog/hyper](https://github.com/craftzdog/hyper).
    -   Reference article: [Getting side-by-side preview in a terminal app Hyper](https://dev.to/craftzdog/getting-side-by-side-preview-in-a-terminal-app-hyper-20ii)

## Features

### Webview preview

Split a pane (`Ctrl + Shift + D`), then click a URL printed in the terminal to display it in a webview in the adjacent pane.

> ⚠️ Security note: The webview preview feature renders web pages using the Chromium engine bundled with Electron 44.2.0 (Chromium 152). This is reasonably current, but as with any embedded browser, only open links you trust.

### Custom settings via `hyper.json`

Supports the config file format used by the upstream `canary` generation (distinct from the legacy `.hyper.js` format).

### Custom SKK input engine

A custom SKK (Simple Kana to Kanji conversion) engine, implemented from scratch without going through the system IME (fcitx5, etc.).
Supports kana input, kanji conversion (dictionary lookup and candidate selection), katakana conversion, okurigana, and candidate history (the last-confirmed candidate for a given key is shown first next time, matching upstream SKK's own behavior).

### Background image

Set a background image for the terminal via `hyper.json`. Unlike most other config options, `backgroundImage` and `backgroundImageSize` are extensions specific to this fork and are not present in upstream Hyper.

```json
"backgroundColor": "rgba(0,0,0,0.8)",
"backgroundImage": "/absolute/path/to/image.png",
"backgroundImageSize": "cover"
```

-   `backgroundImage`: absolute path to a local image file. Leave empty (default) to disable.
-   `backgroundImageSize`: CSS `background-size` keyword. One of `cover` / `contain` / `auto`.
-   The alpha value of `backgroundColor` (e.g. `0.8`) controls how much black is layered over the image; closer to `1` is darker, closer to `0` shows the image more brightly. A value of exactly `1` disables the image display entirely (fully opaque terminal).

> 🔵 Note\
> Plugins that override `backgroundColor` via `decorateConfig` (e.g. `hyper-iceberg`) are not compatible with this feature, since they overwrite the alpha value needed to show the image.

## Tested environments

-   Verified on Arch Linux (Hyprland / Wayland)
-   Also verified on WSL (Ubuntu)
-   Also verified natively on Windows 11 (without WSL), for both development builds and generating a distributable installer (NSIS).

## Setup

```bash
pnpm install
```

### Development

```bash
# Terminal 1
pnpm run dev

# Terminal 2
pnpm run app
```

### Build

```bash
pnpm run build
```

> Runs a production build (includes a full type check via `tsc -b`).

### Producing a built app

```bash
npx electron-builder --linux dir
```

This generates a standalone binary at `dist/linux-unpacked/hyper`, directly under the project directory.

> 🔵 Note\
> Formal packaging (pacman, AppImage, etc.) is currently in progress.

#### Linux: registering to the app launcher

To launch the app like any other installed application, without running `pnpm run dev` / `pnpm run app` every time:

```bash
./build/linux/install-desktop-entry.sh
```

This generates `~/.local/share/applications/hyper-webview.desktop`, allowing you to launch it as "Hyper-webview" from launchers such as rofi or wofi.
The script auto-detects the actual repository path, so no manual path editing is needed regardless of where the repository is cloned.

> 🔵 Note\
> Run this after `npx electron-builder --linux dir` has produced `dist/linux-unpacked/hyper`. After making source changes, re-run `pnpm run build` and `npx electron-builder --linux dir` to update the binary; step 4 above only needs to be run once.

## Updating

To pull in the latest commits on `main`:

```bash
git checkout main
git pull
pnpm install
```

Then, depending on how you normally run the app:

-   **Development mode** (`pnpm run dev` + `pnpm run app`): the steps above are enough; just restart `pnpm run dev`.
-   **Linux, registered to the app launcher**:
    ```bash
    pnpm run build
    npx electron-builder --linux dir
    ```
-   **Windows, installed via the `.exe`**:
    ```bash
    pnpm run dist
    ```
    Then run the newly generated `.exe` under `dist\` again (it overwrites the existing install).

## Usage

-   Split a pane (`Ctrl + Shift + D`), then click a URL printed in the terminal to display it in a webview in the adjacent pane.
-   To zoom the displayed web page in or out, **click on the web page first**, then use `Ctrl + +` / `Ctrl + -`.

## Configuration file

Placed at `~/.config/Hyper/hyper.json`. If the file doesn't exist yet, it's created automatically on first launch (migrated from `~/.hyper.js` if present, otherwise generated from the defaults).

A `schema.json` for editor autocompletion is also placed in the same directory automatically on every launch.

Simply adding a plugin to the `plugins` array does not install it automatically.
Run `Tools` → `Update plugins` (`Ctrl + Shift + U`) from the menu.

For details on each configuration option, refer to upstream's type definitions ([`typings/config.d.ts`](https://github.com/vercel/hyper/blob/canary/typings/config.d.ts)).

> 🔵 Note\
> `backgroundImage` and `backgroundImageSize` are extensions added by this fork and are not part of upstream's type definitions linked above. See [Background image](#background-image) for details.

## Known limitations & roadmap

-   Tab rename feature is planned but not yet implemented.

## License

[MIT](./LICENSE) (inherited from the upstream vercel/hyper license)
