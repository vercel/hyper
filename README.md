![](https://github.com/zeit/art/blob/525bd1bb39d97dd3b91c976106a6d5cc5766b678/hyper/repo-banner.png)

[![macOS CI Status](https://circleci.com/gh/zeit/hyper.svg?style=shield)](https://circleci.com/gh/zeit/hyper)
[![Windows CI status](https://ci.appveyor.com/api/projects/status/kqvb4oa772an58sc?svg=true)](https://ci.appveyor.com/project/zeit/hyper)
[![Linux CI status](https://travis-ci.org/zeit/hyper.svg?branch=master)](https://travis-ci.org/zeit/hyper)
[![Changelog #213](https://img.shields.io/badge/changelog-%23213-lightgrey.svg)](https://changelog.com/213)
[![Join the community on Spectrum](https://withspectrum.github.io/badge/badge.svg)](https://spectrum.chat/hyper)

For more details, head to: https://hyper.is

## Usage

[Download the latest release!](https://hyper.is/#installation)

### Linux
#### Arch and derivatives
Hyper is available in the [AUR](https://aur.archlinux.org/packages/hyper/). Use an AUR package manager like [aurman](https://github.com/polygamma/aurman)

```sh
aurman -S hyper
```

### macOS

Use [Homebrew Cask](https://caskroom.github.io/) to download the app by running these commands:

```bash
brew update
brew cask install hyper
```

### Windows

Use [chocolatey](https://chocolatey.org/) to install the app by running the following command (package information can be found [here](https://chocolatey.org/packages/hyper/)):

```bash
choco install hyper
```

**Note:** The version available on [Homebrew Cask](https://caskroom.github.io/), [Chocolatey](https://chocolatey.org) or the [AUR](https://aur.archlinux.org) may not be the latest. Please consider downloading it from [here](https://hyper.is/#installation) if that's the case.

## Contribute

Regardless of the platform you are working on, you will need to have Yarn installed. If you have never installed Yarn before, you can find out how at: https://yarnpkg.com/en/docs/install.

1. Install necessary packages:
  * Windows
    - Be sure to run  `yarn global add windows-build-tools` to install `windows-build-tools`.
  * macOS
    - Once you have installed Yarn, you can skip this section!
  * Linux(You can see [here](https://en.wikipedia.org/wiki/List_of_Linux_distributions) what your Linux is based on.)
    - RPM-based
        + `GraphicsMagick`
        + `libicns-utils`
        + `xz` (Installed by default on some distributions.)
    - Debian-based
        + `graphicsmagick`
        + `icnsutils`
        + `xz-utils`
2. [Fork](https://help.github.com/articles/fork-a-repo/) this repository to your own GitHub account and then [clone](https://help.github.com/articles/cloning-a-repository/) it to your local device
3. Install the dependencies: `yarn`
4. Build the code and watch for changes: `yarn run dev`
5. To run `hyper`
  * `yarn run app` from another terminal tab/window/pane
  * If you are using **Visual Studio Code**, select `Launch Hyper` in debugger configuration to launch a new Hyper instance with debugger attached.
  * If you interrupt `yarn run dev`, you'll need to relaunch it each time you want to test something. Webpack will watch changes and will rebuild renderer code when needed (and only what have changed). You'll just have to relaunch electron by using yarn run app or VSCode launch task.

To make sure that your code works in the finished application, you can generate the binaries like this:

```bash
yarn run dist
```

After that, you will see the binary in the `./dist` folder!

#### Known issues that can happen during development

##### Error building `node-pty`

If after building during development you get an alert dialog related to `node-pty` issues,
make sure its build process is working correctly by running `yarn run rebuild-node-pty`.

If you are on macOS, this typically is related to Xcode issues (like not having agreed
to the Terms of Service by running `sudo xcodebuild` after a fresh Xcode installation).

##### Error with `codesign` on macOS when running `yarn run dist`

If you have issues in the `codesign` step when running `yarn run dist` on macOS, you can temporarily disable code signing locally by setting
`export CSC_IDENTITY_AUTO_DISCOVERY=false` for the current terminal session.

## Related Repositories

- [Art](https://github.com/zeit/art/tree/master/hyper)
- [Website](https://github.com/zeit/hyper-site)
- [Sample Extension](https://github.com/zeit/hyperpower)
- [Sample Theme](https://github.com/zeit/hyperyellow)
- [Awesome Hyper](https://github.com/bnb/awesome-hyper)
