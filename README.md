<img width="100" src="https://cdn.rawgit.com/zeit/hyperterm-art/master/branding/Hyperterm-Mark.svg" alt="HyperTerm">

# HyperTerm

[![Slack Channel](https://zeit-slackin.now.sh/badge.svg)](https://zeit.chat/)
[![Build Status](https://travis-ci.org/zeit/hyperterm.svg?branch=master)](https://travis-ci.org/zeit/hyperterm)

![](https://cldup.com/tD67NzPryA.gif)

For downloads, documentation and the developer API head to: https://hyperterm.org

(NOTE: only on macOS) With [Homebrew](http://brew.sh/) and [Homebrew Cask](https://caskroom.github.io/) installed, you can run this command:

```bash
brew cask update
brew cask install hyperterm
```

### Repositories

- Art: https://github.com/zeit/hyperterm-art
- Website: https://github.com/zeit/hyperterm-website
- Example extension: https://github.com/zeit/hyperpower

## Contribute

To test a certain git tree, clone and then run:

```bash
npm install
npm run pack
```

then open the `./dist` folder to find the built binaries!

If you want to develop, run the above, and then you want to
run webpack in `watch` mode:

```
npm run dev
```

and to load the application simply run:

```
npm start
```
