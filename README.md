![](https://github.com/zeit/hyperterm-art/blob/master/branding/HyperTerm-banner.png)

[![Build Status](https://travis-ci.org/zeit/hyperterm.svg?branch=master)](https://travis-ci.org/zeit/hyperterm)
[![Slack Channel](https://zeit-slackin.now.sh/badge.svg)](https://zeit.chat/)
[![Changelog #213](https://img.shields.io/badge/changelog-%23213-lightgrey.svg)](https://changelog.com/213)

For more details, head to: https://hyperterm.org

## Usage

You can download the latest release [here](https://hyperterm.org/#installation).

If you're on macOS, you can also use [Homebrew Cask](https://caskroom.github.io/) to download the app by running these commands:

```bash
$ brew cask update
$ brew cask install hyperterm
```

## Contribute

1. Install platform specific build dependencies [as detailed below](#required-build-dependencies)
2. [Fork](https://help.github.com/articles/fork-a-repo/) this repository to your own GitHub account and then [clone](https://help.github.com/articles/cloning-a-repository/) it to your local device
3. Install the dependencies: `npm install`
4. Build the code and watch for changes: `npm run dev`
5. In a new tab, start the application: `npm start`

If you want to build the binaries for all specified platforms, run the command:

```bash
$ npm run pack
```

After that, you'll see the binaries in the `./dist` folder!

### Required Build Dependencies

#### To Build on OSX:

For Linux:
```bash
$ brew install gnu-tar libicns graphicsmagick xz
```

For Windows:
```bash
$ brew install wine --without-x11
$ brew install mono
```

#### To Build on Linux:

For Linux:
```bash
$ sudo apt-get install --no-install-recommends -y icnsutils graphicsmagick xz-utils
```

For Windows:

* Install Wine (1.8+ is required):
```bash
$ sudo add-apt-repository ppa:ubuntu-wine/ppa -y
$ sudo apt-get update
$ sudo apt-get install --no-install-recommends -y wine1.8
```
* Install [Mono](http://www.mono-project.com/docs/getting-started/install/linux/#usage) (4.2+ is required):
```bash
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 3FA7E0328081BFF6A14DA29AA6A19B38D3D831EF
echo "deb http://download.mono-project.com/repo/debian wheezy main" | sudo tee /etc/apt/sources.list.d/mono-xamarin.list
sudo apt-get update
sudo apt-get install --no-install-recommends -y mono-devel ca-certificates-mono
```

## Related Repositories

- [Art](https://github.com/zeit/hyperterm-art)
- [Website](https://github.com/zeit/hyperterm-website)
- [Sample Extension](https://github.com/zeit/hyperpower)
- [Sample Theme](https://github.com/zeit/hyperyellow)
