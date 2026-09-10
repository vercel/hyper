![hyper-logo](https://assets.vercel.com/image/upload/v1549723846/repositories/hyper/hyper-3-repo-banner.png)

###### 🇯🇵 日本語 | 🇺🇸 [English](./README.md)

# Hyper Webview Fork

[vercel/hyper](https://github.com/vercel/hyper) (canaryブランチ) をベースにした個人用フォークです。
セキュリティ上の理由で本家から削除されたwebviewプレビュー機能の復元と、日常使いに適したターミナル環境の整備を目的としています。

## upstreamとの関係

-   フォーク元: [vercel/hyper](https://github.com/vercel/hyper) (canaryブランチ)
-   webview機能の実装ロジックは[craftzdog/hyper](https://github.com/craftzdog/hyper)のbuilt-in-webviewブランチを参考にしています。
    -   参考記事: [Getting side-by-side preview in a terminal app Hyper](https://dev.to/craftzdog/getting-side-by-side-preview-in-a-terminal-app-hyper-20ii)

## 主な機能

### webviewプレビュー

ペインを分割し (`Ctrl + Shift + D`) 、ターミナルに出力されたurlをクリックすると、隣のペインにwebviewで表示

> ⚠️ セキュリティに関する注記: webviewプレビュー機能は、Electron 44.2.0(Chromium 152)に同梱されたChromiumエンジンでWebページを描画します。比較的新しいバージョンですが、組み込みブラウザである以上、信頼できるリンクのみを開いてください。

### `hyper.json` によるカスタム設定

本家canary世代の設定ファイル形式に対応 (旧世代の`.hyper.js`とは別物)

### 独自SKK入力エンジン

システムのIME(fcitx5等)を一切介さず、ゼロから実装した独自のSKK(Simple Kana to Kanji conversion)エンジン。
かな入力、漢字変換(辞書引き・候補選択)、カタカナ変換、送り仮名、候補の履歴(そのキーで最後に確定した候補を次回優先表示する、本家SKKの仕様通りの挙動)に対応。

### 背景画像

`hyper.json` からターミナルの背景に画像を指定できます。他の設定項目とは異なり、`backgroundImage` / `backgroundImageSize` は本家Hyperには存在しない、このフォーク独自の拡張項目です。

```json
"backgroundColor": "rgba(0,0,0,0.8)",
"backgroundImage": "/絶対パス/画像.png",
"backgroundImageSize": "cover"
```

-   `backgroundImage`: ローカル画像ファイルの絶対パス。空文字(デフォルト)の場合は無効
-   `backgroundImageSize`: CSSの`background-size`に相当するキーワード。`cover` / `contain` / `auto`のいずれか
-   `backgroundColor`のアルファ値(例: `0.8`)が、画像にどれだけ黒を重ねるかを決めます。`1`に近いほど暗く、`0`に近いほど画像がそのまま明るく表示されます。ちょうど`1`にすると画像は表示されなくなります(完全不透明のターミナルに戻る)

> 🔵 Note\
> `decorateConfig`で`backgroundColor`を上書きするタイプのプラグイン(`hyper-iceberg`等)とは併用できません。画像表示に必要なアルファ値が上書きされてしまうためです。

## 動作環境

-   Arch Linux (hyprland / wayland) で動作確認済み
-   WSL (Ubuntu) でも動作確認
-   Windows 11 ネイティブ (WSLを介さない) でも動作確認済み。開発ビルド・配布用インストーラー(NSIS)の生成ともに対応

## セットアップ

```bash
pnpm install
```

### 開発時

```bash
# ターミナル1
pnpm run dev

# ターミナル2
pnpm run app
```

### ビルド

```bash
pnpm run build
```

> 本番ビルド (`tsc -b` によるフル型チェックを含む) を実行します。

### ビルド済みアプリの生成

```bash
npx electron-builder --linux dir
```

プロジェクトディレクトリ直下 `dist/linux-unpacked/hyper` に単体で起動可能なバイナリが生成されます。

> 🔵 Note\
> pacman・appimage等の正式なパッケージ化は現在準備中です。

#### Linux: アプリランチャーへの登録

`pnpm run dev` / `pnpm run app` を毎回実行しなくても、通常のアプリと同じようにランチャーから起動できるようにする手順です。

```bash
./build/linux/install-desktop-entry.sh
```

`~/.local/share/applications/hyper-webview.desktop` が生成され、rofi/wofi等のランチャーから「Hyper-webview」として起動できるようになります。
リポジトリをどこにクローンしても、スクリプトが実際のパスを自動検出して登録するため、パスの手動書き換えは不要です。

> 🔵 Note\
> `npx electron-builder --linux dir` で `dist/linux-unpacked/hyper` が生成された後に実行してください。ソースコードに変更を加えた場合は `pnpm run build` と `npx electron-builder --linux dir` を再実行すればバイナリに反映されます(上記の登録手順自体は初回のみで問題ありません)。

## アップデート方法

`main`ブランチの最新コミットを取り込むには、以下を実行してください。

```bash
git checkout main
git pull
pnpm install
```

そのあと、普段の起動方法にあわせて以下を実行してください。

-   **開発モード**(`pnpm run dev` + `pnpm run app`)で使っている場合: 上記だけで反映されます。`pnpm run dev`を再起動してください。
-   **Linuxランチャー登録済み**の場合:
    ```bash
    pnpm run build
    npx electron-builder --linux dir
    ```
-   **Windowsのインストーラー(`.exe`)で使っている場合**:
    ```bash
    pnpm run dist
    ```
    生成された`dist\`配下の新しい`.exe`を再度インストールしてください(既存のインストール先に上書きされます)。

## 使い方

-   ペインを分割し (`Ctrl + Shift + D`) 、ターミナルに出力されたurlをクリックすると、隣のペインにwebviewで表示されます。
-   表示されたWebページを拡大・縮小するには、**Webページをクリックしてから** `Ctrl + +` / `Ctrl + -` で行ってください。

## 設定ファイル

`~/.config/Hyper/hyper.json` に配置されます。ファイルが存在しない場合、初回起動時に自動生成されます(`~/.hyper.js` があれば内容を引き継ぎ、無ければデフォルト設定から生成)。

エディタ補完用の `schema.json` も、起動のたびに同ディレクトリへ自動配置されます。

プラグインを `plugins` に追記しただけでは自動インストールされません。
メニューの `Tools`→`Update plugins` (`Ctrl + Shift + U`) を実行してください。

各設定項目の詳細は、フォーク元の型定義([`typings/config.d.ts`](https://github.com/vercel/hyper/blob/canary/typings/config.d.ts))を参照してください。

> 🔵 Note\
> `backgroundImage` / `backgroundImageSize` はこのフォーク独自の拡張項目で、上記の本家型定義には含まれていません。詳細は[背景画像](#背景画像)を参照してください。

## 既知の制限・今後の予定

-   タブリネーム機能は対応予定 (現時点では未実装)

## ライセンス

[MIT](./LICENSE) (本家 vercel/hyper のライセンスを継承)
