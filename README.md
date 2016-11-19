![](https://github.com/zeit/art/blob/525bd1bb39d97dd3b91c976106a6d5cc5766b678/hyper/repo-banner.png)

[![Build Status](https://travis-ci.org/zeit/hyper.svg?branch=master)](https://travis-ci.org/zeit/hyper)
[![Slack Channel](https://zeit-slackin.now.sh/badge.svg)](https://zeit.chat/)
[![Changelog #213](https://img.shields.io/badge/changelog-%23213-lightgrey.svg)](https://changelog.com/213)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

For more details, head to: https://hyper.is

## Usage

You can download the latest release [here](https://hyper.is/#installation).

If you're on macOS, you can also use [Homebrew Cask](https://caskroom.github.io/) to download the app by running these commands:

```bash
$ brew update
$ brew cask install hyper
```

## Contribute

1. Install the dependencies
  * If you are running Linux, install `icnsutils`, `graphicsmagick`, `xz-utils` and `rpm`
  * If you are running Windows, install [VC++ Build Tools Technical Preview](http://go.microsoft.com/fwlink/?LinkId=691126) using the **Default Install option**; Install Python 2.7 and add it to your `%PATH%`; Run `npm config set msvs_version 2015 --global`
2. [Fork](https://help.github.com/articles/fork-a-repo/) this repository to your own GitHub account and then [clone](https://help.github.com/articles/cloning-a-repository/) it to your local device
3. Install the dependencies: `npm install`
4. Build the code, watch for changes and run the app: `npm start`

To make sure that your code works in the finished application, you can generate the binaries like this:

```bash
$ npm run pack
```

After that, you'll see the binary in the `./dist` folder!

## Related Repositories

- [Art](https://github.com/zeit/art/tree/master/hyper)
- [Website](https://github.com/zeit/hyper-website)
- [Sample Extension](https://github.com/zeit/hyperpower)
- [Sample Theme](https://github.com/zeit/hyperyellow)
