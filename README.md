# hyperterm

![](https://zeit-slackin.now.sh/badge.svg)

![](https://cldup.com/tD67NzPryA.gif)

For downloads, documentation and the developer API head to: https://hyperterm.org

(NOTE: only on macOS) With [Homebrew](http://brew.sh/) and [Homebrew Cask](https://caskroom.github.io/) installed, you can run this command:

```bash
$ brew cask install hyperterm
```

### Repositories

- Art: https://github.com/zeit/hyperterm-art
- Website: https://github.com/zeit/hyperterm-website
- Example extension: https://github.com/zeit/hyperpower

## Contribute

To install `package.json` dependencies in a way where the native
modules are built with `electron`, run:

```bash
$ ./scripts/install.sh
```

Then, you want to make sure `app/dist` is populated. I recommend
running `webpack` with `--watch` so that any changes you make
to the app are detected.

```bash
$ cd app/
$ npm install
$ npm run dev
```

Then you can run in the main directory:

```bash
$ npm start
```

...to launch the app!
