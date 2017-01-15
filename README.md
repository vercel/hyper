![](https://github.com/zeit/art/blob/525bd1bb39d97dd3b91c976106a6d5cc5766b678/hyper/repo-banner.png)

[![Build Status](https://travis-ci.org/zeit/hyper.svg?branch=master)](https://travis-ci.org/zeit/hyper)
[![Build status](https://ci.appveyor.com/api/projects/status/txg5qb0x35h0h65p?svg=true)](https://ci.appveyor.com/project/appveyor-zeit/hyper)
[![Slack Channel](https://zeit-slackin.now.sh/badge.svg)](https://zeit.chat/)
[![Changelog #213](https://img.shields.io/badge/changelog-%23213-lightgrey.svg)](https://changelog.com/213)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

For more details, head to: https://hyper.is

## Usage

[Download the latest release!](https://hyper.is/#installation)

If you're on macOS, you can also use [Homebrew Cask](https://caskroom.github.io/) to download the app by running these commands:

```bash
brew update
brew cask install hyper
```

If you're on windows, you can use [chocolatey](https://chocolatey.org/) to install the app by running the following command (package information can be found [here](https://chocolatey.org/packages/hyper/)):
```bash
choco install hyper
```

## Contribute

1. Install the dependencies
  * If you are running Linux, install `icnsutils`, `graphicsmagick`, `xz-utils` and `rpm`
  * If you are running Windows, install [VC++ Build Tools Technical Preview](http://go.microsoft.com/fwlink/?LinkId=691126) using the **Default Install option**; Install Python 2.7 and add it to your `%PATH%`; Run `npm config set msvs_version 2015 --global`
2. [Fork](https://help.github.com/articles/fork-a-repo/) this repository to your own GitHub account and then [clone](https://help.github.com/articles/cloning-a-repository/) it to your local device
3. Install the dependencies: `npm install`
4. Build the code and watch for changes: `npm run dev`
5. In another terminal tab/window/pane, run the app: `npm run app`

To make sure that your code works in the finished application, you can generate the binaries like this:

```bash
npm run dist
```

After that, you'll see the binary in the `./dist` folder!

### node-pty issues

If after building during development you get an alert dialog related to `node-pty` issues,
make sure its build process is working correctly by running `npm rebuild` manually inside
the `app` directory.

If you're on macOS, this typically is related to Xcode issues (like not having agreed
to the Terms of Service by running `sudo xcodebuild` after a fresh Xcode installation).

## Related Repositories

- [Art](https://github.com/zeit/art/tree/master/hyper)
- [Website](https://github.com/zeit/hyper-website)
- [Sample Extension](https://github.com/zeit/hyperpower)
- [Sample Theme](https://github.com/zeit/hyperyellow)
