![](https://github.com/zeit/hyperterm-art/blob/master/branding/HyperTerm-banner.png)

[![Slack Channel](https://zeit-slackin.now.sh/badge.svg)](https://zeit.chat/)
[![Build Status](https://travis-ci.org/zeit/hyperterm.svg?branch=master)](https://travis-ci.org/zeit/hyperterm)

For more details, head to: https://hyperterm.org

## Usage

If you're on macOS and have [Homebrew](http://brew.sh/) + [Homebrew Cask](https://caskroom.github.io/) installed, you can download the app by running the following commands:

```bash
brew cask update
brew cask install hyperterm
```

## Contribute

1. [Fork](https://help.github.com/articles/fork-a-repo/) this repository to your own GitHub account and then [clone](https://help.github.com/articles/cloning-a-repository/) it to your local device
2. Install the dependencies: `npm install`
3. Build the code and watch for changes: `npm run dev`
4. In a new tab, start the application: `npm start`

If you want to build the binaries for all specified platforms, run the command:

```bash
npm run pack
```

After that, you'll see the binaries in the `./dist` folder!

## Repositories

- Art: https://github.com/zeit/hyperterm-art
- Website: https://github.com/zeit/hyperterm-website
- Sample extension: https://github.com/zeit/hyperpower
- Sample theme: https://github.com/zeit/hyperyellow
