#!/usr/bin/env bash
VERSION=`cat package.json | jq '.version' -r`
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
cp app/dist/* dist/
electron-packager ./ --platform=darwin --out=dist --arch=x64 --app-bundle-id="co.zeit.hyperterm" --app-version="0.1.0" --osx-sign --icon=icon.icns --ignore=app
