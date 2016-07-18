#!/usr/bin/env bash
VERSION=`node -e 'process.stdout.write(require("./package").version)'`

if [ -z "$HYPERTERM_OSX_SIGNING_IDENTITY" ]; then
    echo "ENV var HYPERTERM_OSX_SIGNING_IDENTITY missing. Set it to the Common Name of the downloaded certificate from Apple."
    exit 1
fi

rm -rf node_modules
rm -rf ./app/node_modules
rm -rf ./dist/HyperTerm-darwin-x64
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
electron-packager ./ --platform=darwin --out=dist --arch=x64 --app-bundle-id="co.zeit.hyperterm" --app-version="$VERSION" --osx-sign.identity="$HYPERTERM_OSX_SIGNING_IDENTITY" --icon=static/icon.icns --prune --ignore=app/
cd dist/HyperTerm-darwin-x64/
zip -r -q -y ../hyperterm-macos-x64-$VERSION.zip .
cd -
