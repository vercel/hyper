# Plugin development

## Workflow

### Run Hyper on dev mode
On dev mode (built and launched from source after cloning repository), you'll get more ouput and React/Redux dev-tools in Electron.
Prerequisites and steps are discribed in [Contributing section of our README](https://github.com/zeit/hyper#contribute).
Be sure to use canary branch.

### Create a dev config file
Copy your config file `.hyper.js` in your cloned repository. Hyper in dev mode will use this one. That means that you can continue to use installed Hyper with your day-to-day config.
After a first run, Hyper on dev mode will have created a new `.hyper_plugins` directory in your repository directory.

### Setup your plugin
Go to your recently created `<repository_root>/.hyper_plugins/local` directory and create/clone your plugin repo or better on macOS/Linux: add a symlink to your plugin directory.

Edit your dev config file, and add your plugin name (directory name in your `local` directory) in `localPlugins` array.
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
To be loaded, your plugin should expose at least one API method. All possible methods are listed [here]( https://github.com/zeit/hyper/blob/canary/app/plugins/extensions.js).

After launching Hyper on dev mode `yarn run app`, it will be logged that your plugin has been correcty loaded: `Plugin hyper-awesome-plugin (0.1.0) loaded.`. Name and version printed are the ones in your plugin `package.json` file.

When you put a `console.log()` in your plugin code, it will be displayed in Electron dev-tools only if it is located in a renderer method, like component decorators. If it is located in Electron main process method, like `onApp` handler, it will be displayed in your terminal where you made your `yarn run app` or in your VSCode console.

## Recipes
(Almost) all available API methods can be found on https://www.hyper.is.

### Components
You can decorate with a High Order Component (HOC) almost all Hyper components. To understand their architecture, the easiest way is to use React dev-tools to dig in their hierachy.

Multiple plugins can decorate same Hyper component. Thus, `Component` passed as first argument to your decorator function could not be real Hyper component but HOC of previous plugin. If you need to retrieve a reference to real Hyper component, you can pass down a `onDecorated` handler.
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
:warning: Note that you have to execute `this.props.onDecorated` to not break handler chain. Without this, you could break other plugins that decorate same component.

### Keymaps
If you want to add some keymaps, you need to achieve 2 steps.

#### Declaring your key bindings
Use `decorateKeymaps` API handler to modify existing keymaps and add your `command: hotkeys`:
```js
exports.decorateKeymaps = keymaps => {
  const newKeymaps = {
    'pane:maximize': 'ctrl+shift+m',
    'pane:invert': 'ctrl+shift+i'
  }
  return Object.assign({}, keymaps, newKeymaps);
}
```
Command name can be whatever you want, but this is better to respect this naming convention: `<context>:<action>`.
Hotkeys are composed by (Mousetrap supported keys)[https://craig.is/killing/mice#keys].

Special feature: if your command ends with `:prefix`, it would mean that you want to use this command with an additional digit and Hyper will create all commands under the hood. For example, a keymap `'pane:hide:prefix': 'ctrl+shift'` will automatically generate these :
```
{
  'pane:hide:1': 'ctrl+shift+1',
  'pane:hide:2': 'ctrl+shift+2',
  ...
  'pane:hide:8': 'ctrl+shift+8',
  'pane:hide:last': 'ctrl+shift+9'
}
```
Notice that `9` has been replaced by `last` because most of time, this is handy if you have more than 9 items. 


#### Register handler for your commands
##### Renderer/Window
Most of time, you'll want to execute some handler in context of renderer like dispatching a Redux action.
To trigger these handler, you'll have to register them with `registerCommands` Terms method.
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
If there is no handler in renderer for an existing command, a `rpc` message is emitted.
If you want to execute handler in main process you have to subscribe to this message:
```js
rpc.on('command pane:snapshot', () => {
  /* Awesome snapshot feature */
});
```

### Menu
Your plugin can expose a `decorateMenu` function to add/modify Hyper menu template.
Check (Electron documentation)[https://electronjs.org/docs/api/menu-item] for more details about different menu item types/options available.

Be careful, click handler will be executed on main process. If you need to trigger a handler in render process you need to use `rpc` message like this :
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
If your plugin needs to know cursor position/size, it can decorate Term component and pass handler. It will be called at each cursor move with all cursors informations.
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

## Hyper v2 breaking changes
Hyper v2 uses `xterm.js` instead of `hterm`. It means that PTY ouput renders now in a canvas not with a hackable DOM structure.
For example, plugins can't use TermCSS anymore in order to modify text or links style. It is now required to use only available configuration params that will be passed down to `xterm.js`.

If your plugin was deeply linked with `hterm` API (even public methods), it certainly doesn't work anymore.

If your plugin needs some unavailable API to tweak `xterm.js`, please open an issue. We'll be happy to expose some existing `xterm.js` API or implementing new ones.