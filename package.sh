#!/usr/bin/env bash
VERSION=`node -e 'process.stdout.write(require("./package").version)'`
rm -rf node_modules
rm -rf ./app/node_modules
rm -rf ./dist/HyperTerm-darwin-x64
rm -rf ./dist/
rm -rf ./build/
mkdir dist
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

# electron-packager ./ --platform=darwin --out=dist --arch=x64 --app-bundle-id="co.zeit.hyperterm" --app-version="$VERSION" --osx-sign --icon=static/icon.icns --prune --ignore=app
# without --osx-sign:
electron-packager ./ --platform=darwin --out=dist --arch=x64 --app-bundle-id="co.zeit.hyperterm" --app-version="$VERSION" --icon=static/icon.icns --prune --ignore=app
electron-osx-sign dist/HyperTerm-darwin-x64/HyperTerm.app --identity=88R8DU787Z

rm -rf ./build/
npm install bestzip@1.1.2
cd dist/HyperTerm-darwin-x64/
# avoid weird paths inside the zip
../../node_modules/.bin/bestzip ../hyperterm-macos-x64-$VERSION.zip .
cd -
