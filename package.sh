#!/usr/bin/env bash
VERSION=`node -e 'process.stdout.write(require("./package").version)'`
rm -rf node_modules
rm -rf ./app/node_modules
rm -rf ./dist/HyperTerm-darwin-x64
rm -rf ./dist/
rm -rf ./build/
mkdir build
./install.sh
npm run lint
cd app
npm install
npm run lint
npm run build
cd -
cp app/index.html build/
cp -r app/dist build/
mkdir dist
electron-packager ./ --platform=darwin --out=dist --arch=x64 --app-bundle-id="co.zeit.hyperterm" --app-version="$VERSION" --osx-sign --icon=static/icon.icns --prune --ignore=app/
rm -rf ./build/
cd dist/HyperTerm-darwin-x64/
zip -r -y ../hyperterm-macos-x64-$VERSION.zip .
cd -
