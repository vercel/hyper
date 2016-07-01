# Electron's version.
export npm_config_target=1.2.3
# The architecture of Electron, can be ia32 or x64.
export npm_config_arch=x64
# Download headers for Electron.
export npm_config_disturl=https://atom.io/download/atom-shell
# Tell node-pre-gyp that we are building for Electron.
export npm_config_runtime=electron
# Tell node-pre-gyp to build module from source code.
export npm_config_build_from_source=true
# Install all dependencies, and store cache to ~/.electron-gyp.
HOME=~/.electron-gyp npm install
