#!/usr/bin/env bash
VERSION=`node -e 'process.stdout.write(require("./package").version)'`

rm -rf node_modules
rm -rf ./app/node_modules
rm -rf ./dist/HyperTerm-linux*
rm -rf ./dist/
rm -rf ./build/
mkdir build
./scripts/install.sh
npm run lint
cd app
npm install
npm run lint
npm run build
cd -
cp -r app/assets build/
cp app/index.html build/
cp -r app/dist build/
mkdir dist
electron-packager ./ --platform=linux --arch=all --out=dist --app-version="$VERSION" --icon=static/icon.png --prune --ignore=app/
electron-installer-debian --src ./dist/HyperTerm-linux-ia32/ --arch i386 --config ./scripts/config.json
electron-installer-debian --src ./dist/HyperTerm-linux-x64/ --arch amd64 --config ./scripts/config.json
rm -rf ./dist/HyperTerm-linux*
