#!/usr/bin/env bash
VERSION=`node -e 'process.stdout.write(require("./package").version)'`
rm -rf node_modules
rm -rf ./app/node_modules
rm -rf dist
mkdir dist
./install.sh
cd app
npm install
npm run build
cd -
cp app/index.html dist/
cp -r app/dist dist/
electron-packager ./ --platform=darwin --out=dist --arch=x64 --app-bundle-id="co.zeit.hyperterm" --app-version="$VERSION" --osx-sign --icon=icon.icns --ignore=app
