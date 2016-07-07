# hyperterm

## Contribute

To install `package.json` dependencies in a way where the native
modules are built with `electron`, run:

```bash
$ ./install.sh
```

Then, you want to make sure `app/dist` is populated. I recommend
running `webpack` with `--watch` so that any changes you make
to the app are detected.

```bash
$ cd app/
$ npm install
$ webpack --watch
```

Then you can run in the main directory:

```bash
$ npm start
```

...to launch the app!

## Common Errors

### `Error: Module version mismatch. Expected 48, got 47`

If you get this error after `npm start`, simply remove the `node_modules` folder and try to install again using following command:

```
sudo ./install.sh
```

More details: https://github.com/zeit/hyperterm/issues/72
