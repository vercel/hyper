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
