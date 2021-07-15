# Plugin development

## Workflow

### Run Hyper in dev mode
Hyper can be run in dev mode by cloning this repository and following the ["Contributing" section of our README](https://github.com/vercel/hyper#contribute).

In dev mode you'll get more ouput and access to React/Redux dev-tools in Electron.

Prerequisites and steps are described in the ["Contributing" section of our README](https://github.com/vercel/hyper#contribute).
Be sure to use the `canary` branch.

### Create a dev config file
Copy your config file `.hyper.js` to the root of your cloned repository. Hyper, in dev mode, will use this copied config file. That means that you can continue to use your main installation of Hyper with your day-to-day configuration.
After the first run, Hyper, in dev mode, will have created a new `.hyper_plugins` directory in your repository directory.

### Setup your plugin
Go to your recently created `<repository_root>/.hyper_plugins/local` directory and create/clone your plugin repo. An even better method on macOS/Linux is to add a symlink to your plugin directory.

Edit your dev config file, and add your plugin name (directory name in your `local` directory) in the `localPlugins` array.
```js
module.exports = {
  config: {
    ...
  },
  plugins: [],
  localPlugins: ['hyper-awesome-plugin'],
  ...
}
```

### Running your plugin
To load, your plugin should expose at least one API method. All possible methods are listed [here](https://github.com/vercel/hyper/blob/canary/app/plugins/extensions.ts).

After launching Hyper in dev mode, run `yarn run app`, it should log that your plugin has been correcty loaded: `Plugin hyper-awesome-plugin (0.1.0) loaded.`. Name and version printed are the ones in your plugins `package.json` file.

When you put a `console.log()` in your plugin code, it will be displayed in the Electron dev-tools, but only if it is located in a renderer method, like component decorators. If it is located in the Electron main process method, like the `onApp` handler, it will be displayed in your terminal where you ran `yarn run app` or in your VSCode console.

## Recipes
Almost all available API methods can be found on https://hyper.is.
If there's any missing, let us know or submit a PR to document it!

### Components
You can decorate almost all Hyper components with a Higher-Order Component (HOC). To understand their architecture, the easiest way is to use React dev-tools to dig in to their hierarchy.

Multiple plugins can decorate the same Hyper component. Thus, `Component` passed as first argument to your decorator function could possibly not be an original Hyper component but a HOC of a previous plugin. If you need to retrieve a reference to a real Hyper component, you can pass down a `onDecorated` handler.
```js
exports.decorateTerms = (Terms, {React}) => {
  return class extends React.Component {
    constructor(props, context) {
      super(props, context);
      this.terms = null;
      this.onDecorated = this.onDecorated.bind(this);
    }

    onDecorated(terms) {
      this.terms = terms;
      // Don't forget to propagate it to HOC chain
      if (this.props.onDecorated) this.props.onDecorated(terms);
    }

    render() {
      return React.createElement(
        Terms,
        Object.assign({}, this.props, {
          onDecorated: this.onDecorated
        })
      );
      // Or if you use JSX:
      // <Terms onDecorated={this.onDecorated} />
    }
  }
```
:warning: Note that you have to execute `this.props.onDecorated` to not break the handler chain. Without this, you could break other plugins that decorate the same component.

### Keymaps
If you want to add some keymaps, you need to do 2 things:

#### Declare your key bindings
Use the `decorateKeymaps` API handler to modify existing keymaps and add yours with the following format `command: hotkeys`.
```js
// Adding Keymaps
exports.decorateKeymaps = keymaps => {
  const newKeymaps = {
    'pane:maximize': 'ctrl+shift+m',
    'pane:invert': 'ctrl+shift+i'
  }
  return Object.assign({}, keymaps, newKeymaps);
}
```
The command name can be whatever you want, but the following is better to respect the default naming convention: `<context>:<action>`.
Hotkeys are composed by [Mousetrap supported keys](https://craig.is/killing/mice#keys).

**Bonus feature**: if your command ends with `:prefix`, it would mean that you want to use this command with an additional digit to the command. Then Hyper will create all your commands under the hood. For example, this keymap `'pane:hide:prefix': 'ctrl+shift'` will automatically generate the following:
```
{
  'pane:hide:1': 'ctrl+shift+1',
  'pane:hide:2': 'ctrl+shift+2',
  ...
  'pane:hide:8': 'ctrl+shift+8',
  'pane:hide:last': 'ctrl+shift+9'
}
```
Notice that `9` has been replaced by `last` because most of the time this is handy if you have more than 9 items.


#### Register a handler for your commands
##### Renderer/Window
Most of time, you'll want to execute some sort of handler in context of the renderer, like dispatching a Redux action.
To trigger these handlers, you'll have to register them with the `registerCommands` Terms method.
```js
this.terms.registerCommands({
  'pane:maximize': e => {
    this.props.onMaximizePane();
    // e parameter is React key event
    e.preventDefault();
  }
})
```

##### Main process
If there is no handler in the renderer for an existing command, an `rpc` message is emitted.
If you want to execute a handler in main process you have to subscribe to a message, for example:
```js
rpc.on('command pane:snapshot', () => {
  /* Awesome snapshot feature */
});
```

### Menu
Your plugin can expose a `decorateMenu` function to modify the Hyper menu template.
Check the [Electron documentation](https://electronjs.org/docs/api/menu-item) for more details about the different menu item types/options available.

Be careful, a click handler will be executed on the main process. If you need to trigger a handler in the render process you need to use an `rpc` message like this:
```js
exports.decorateMenu = (menu) => {
  debug('decorateMenu');
  const isMac = process.platform === 'darwin';
  // menu label is different on mac
  const menuLabel = isMac ? 'Shell' : 'File';

  return menu.map(menuCategory => {
    if (menuCategory.label !== menuLabel) {
      return menuItem;
    }
    return [
      ...menuCategory,
      {
        type: 'separator'
      },
      {
        label: 'Clear all panes in all tabs',
        accelerator: 'ctrl+shift+y',
        click(item, focusedWindow) {
          // on macOS, menu item can clicked without or minized window
          if (focusedWindow) {
            focusedWindow.rpc.emit('clear allPanes');
          }
        }
      }
    ]
  });
}
/* Plugin needs to register a rpc handler on renderer side for example in a Terms HOC*/
exports.decorateTerms = (Terms, { React }) => {
  return class extends React.Component {
    componentDidMount() {
      window.rpc.on('clear allPanes',() => {
        /* Awesome plugin feature */
      })
    }
  }
}
```

### Cursor
If your plugin needs to know cursor position/size, it can decorate the Term component and pass a handler. This handler will be called with each cursor move while passing back all information about the cursor.
```js
exports.decorateTerm = (Term, { React, notify }) => {
  // Define and return our higher order component.
  return class extends React.Component {
    onCursorMove (cursorFrame) {
      // Don't forget to propagate it to HOC chain
      if (this.props.onCursorMove) this.props.onCursorMove(cursorFrame);

      const { x, y, width, height, col, row } = cursorFrame;
      /* Awesome cursor feature */
    }
  }
}
```

### Require Electron
Hyper doesn't provide a reference to electron. However plugins can directly require electron.

```js
const electron = require('electron')
// or
const { dialog, Menu } = require('electron')
```

This is needed in order to allow show/hide to have proper return of focus.

## Hyper v2 breaking changes
Hyper v2 uses `xterm.js` instead of `hterm`. It means that PTY output renders now in a canvas element, not with a hackable DOM structure.
For example, plugins can't use TermCSS in order to modify text or link styles anymore. It is now required to use available configuration params that are passed down to `xterm.js`.

If your plugin was deeply linked with the `hterm` API (even public methods), it certainly doesn't work anymore.

If your plugin needs some unavailable API to tweak `xterm.js`, please open an issue. We'll be happy to expose some existing `xterm.js` API or implement new ones.
