![](https://github.com/zeit/hyperterm-art/blob/master/branding/HyperTerm-banner.png)

[![Build Status](https://travis-ci.org/zeit/hyperterm.svg?branch=master)](https://travis-ci.org/zeit/hyperterm)
[![Slack Channel](https://zeit-slackin.now.sh/badge.svg)](https://zeit.chat/)
[![Changelog #213](https://img.shields.io/badge/changelog-%23213-lightgrey.svg)](https://changelog.com/213)

For more details, head to: https://hyperterm.org

## Usage

You can manually download the latest release [here](https://hyperterm.org/#installation).

If you're on macOS, you can also use [Homebrew Cask](https://caskroom.github.io/) to download the app by running these commands:

```bash
$ brew cask update
$ brew cask install hyperterm
```

## Contribute

1. [Fork](https://help.github.com/articles/fork-a-repo/) this repository to your own GitHub account and then [clone](https://help.github.com/articles/cloning-a-repository/) it to your local device
2. Install the dependencies: `npm install`
3. Build the code and watch for changes: `npm run dev`
4. In a new tab, start the application: `npm start`

If you want to build the binaries for all specified platforms, run the command:

```bash
$ npm run pack
```

After that, you'll see the binaries in the `./dist` folder!

## Related Repositories

- [Art](https://github.com/zeit/hyperterm-art)
- [Website](https://github.com/zeit/hyperterm-website)
- [Sample Extension](https://github.com/zeit/hyperpower)
- [Sample Theme]( https://github.com/zeit/hyperyellow)
