import {remote} from 'electron';
import {connect as reduxConnect} from 'react-redux';
import {basename} from 'path';

// patching Module._load
// so plugins can `require` them without needing their own version
// https://github.com/zeit/hyper/issues/619
import React, {PureComponent} from 'react';
import ReactDOM from 'react-dom';
import Notification from '../components/notification';
import notify from './notify';

//eslint-disable-next-line import/newline-after-import
const Module = require('module');
const originalLoad = Module._load;
Module._load = function _load(path) {
  switch (path) {
    case 'react':
      return React;
    case 'react-dom':
      return ReactDOM;
    case 'hyper/component':
      return PureComponent;
    case 'hyper/notify':
      return notify;
    case 'hyper/Notification':
      return Notification;
    case 'hyper/decorate':
      return decorate;
    default:
      return originalLoad.apply(this, arguments);
  }
};

// remote interface to `../plugins`
const plugins = remote.require('./plugins');

// `require`d modules
let modules;

// cache of decorated components
let decorated = {};

// various caches extracted of the plugin methods
let connectors;
let middlewares;
let uiReducers;
let sessionsReducers;
let termGroupsReducers;
let tabPropsDecorators;
let tabsPropsDecorators;
let termPropsDecorators;
let termGroupPropsDecorators;
let propsDecorators;
let reducersDecorators;

const clearModulesCache = () => {
  // the fs locations where user plugins are stored
  const {path, localPath} = plugins.getBasePaths();

  // trigger unload hooks
  modules.forEach(mod => {
    if (mod.onRendererUnload) {
      mod.onRendererUnload(window);
    }
  });

  // clear require cache
  for (const entry in window.require.cache) {
    if (entry.indexOf(path) === 0 || entry.indexOf(localPath) === 0) {
      // `require` is webpacks', `window.require` is electron's
      delete window.require.cache[entry];
    }
  }
};

const pathModule = window.require('path');

const getPluginName = path => pathModule.basename(path);

const getPluginVersion = path => {
  let version = null;
  try {
    version = window.require(pathModule.resolve(path, 'package.json')).version;
  } catch (err) {
    //eslint-disable-next-line no-console
    console.warn(`No package.json found in ${path}`);
  }
  return version;
};

const loadModules = () => {
  //eslint-disable-next-line no-console
  console.log('(re)loading renderer plugins');
  const paths = plugins.getPaths();

  // initialize cache that we populate with extension methods
  connectors = {
    Terms: {state: [], dispatch: []},
    Header: {state: [], dispatch: []},
    Hyper: {state: [], dispatch: []},
    Notifications: {state: [], dispatch: []}
  };
  uiReducers = [];
  middlewares = [];
  sessionsReducers = [];
  termGroupsReducers = [];
  tabPropsDecorators = [];
  tabsPropsDecorators = [];
  termPropsDecorators = [];
  termGroupPropsDecorators = [];

  propsDecorators = {
    getTermProps: termPropsDecorators,
    getTabProps: tabPropsDecorators,
    getTabsProps: tabsPropsDecorators,
    getTermGroupProps: termGroupPropsDecorators
  };

  reducersDecorators = {
    reduceUI: uiReducers,
    reduceSessions: sessionsReducers,
    reduceTermGroups: termGroupsReducers
  };

  const loadedPlugins = plugins.getLoadedPluginVersions().map(plugin => plugin.name);
  modules = paths.plugins
    .concat(paths.localPlugins)
    .filter(plugin => loadedPlugins.indexOf(basename(plugin)) !== -1)
    .map(path => {
      let mod;
      const pluginName = getPluginName(path);
      const pluginVersion = getPluginVersion(path);

      // window.require allows us to ensure this doesn't get
      // in the way of our build
      try {
        mod = window.require(path);
      } catch (err) {
        notify(
          'Plugin load error',
          `"${pluginName}" failed to load in the renderer process. Check Developer Tools for details.`,
          {error: err}
        );
        return undefined;
      }

      for (const i in mod) {
        if ({}.hasOwnProperty.call(mod, i)) {
          mod[i]._pluginName = pluginName;
          mod[i]._pluginVersion = pluginVersion;
        }
      }

      // mapHyperTermState mapping for backwards compatibility with hyperterm
      if (mod.mapHyperTermState) {
        mod.mapHyperState = mod.mapHyperTermState;
        //eslint-disable-next-line no-console
        console.error('mapHyperTermState is deprecated. Use mapHyperState instead.');
      }

      // mapHyperTermDispatch mapping for backwards compatibility with hyperterm
      if (mod.mapHyperTermDispatch) {
        mod.mapHyperDispatch = mod.mapHyperTermDispatch;
        //eslint-disable-next-line no-console
        console.error('mapHyperTermDispatch is deprecated. Use mapHyperDispatch instead.');
      }

      if (mod.middleware) {
        middlewares.push(mod.middleware);
      }

      if (mod.reduceUI) {
        uiReducers.push(mod.reduceUI);
      }

      if (mod.reduceSessions) {
        sessionsReducers.push(mod.reduceSessions);
      }

      if (mod.reduceTermGroups) {
        termGroupsReducers.push(mod.reduceTermGroups);
      }

      if (mod.mapTermsState) {
        connectors.Terms.state.push(mod.mapTermsState);
      }

      if (mod.mapTermsDispatch) {
        connectors.Terms.dispatch.push(mod.mapTermsDispatch);
      }

      if (mod.mapHeaderState) {
        connectors.Header.state.push(mod.mapHeaderState);
      }

      if (mod.mapHeaderDispatch) {
        connectors.Header.dispatch.push(mod.mapHeaderDispatch);
      }

      if (mod.mapHyperState) {
        connectors.Hyper.state.push(mod.mapHyperState);
      }

      if (mod.mapHyperDispatch) {
        connectors.Hyper.dispatch.push(mod.mapHyperDispatch);
      }

      if (mod.mapNotificationsState) {
        connectors.Notifications.state.push(mod.mapNotificationsState);
      }

      if (mod.mapNotificationsDispatch) {
        connectors.Notifications.dispatch.push(mod.mapNotificationsDispatch);
      }

      if (mod.getTermGroupProps) {
        termGroupPropsDecorators.push(mod.getTermGroupProps);
      }

      if (mod.getTermProps) {
        termPropsDecorators.push(mod.getTermProps);
      }

      if (mod.getTabProps) {
        tabPropsDecorators.push(mod.getTabProps);
      }

      if (mod.getTabsProps) {
        tabsPropsDecorators.push(mod.getTabsProps);
      }

      if (mod.onRendererWindow) {
        mod.onRendererWindow(window);
      }
      //eslint-disable-next-line no-console
      console.log(`Plugin ${pluginName} (${pluginVersion}) loaded.`);

      return mod;
    })
    .filter(mod => Boolean(mod));

  const deprecatedPlugins = plugins.getDeprecatedConfig();
  Object.keys(deprecatedPlugins).forEach(name => {
    const {css} = deprecatedPlugins[name];
    if (css) {
      //eslint-disable-next-line no-console
      console.warn(`Warning: "${name}" plugin uses some deprecated CSS classes (${css.join(', ')}).`);
    }
  });
};

// load modules for initial decoration
loadModules();

export function reload() {
  clearModulesCache();
  loadModules();
  // trigger re-decoration when components
  // get re-rendered
  decorated = {};
}

function getProps(name, props, ...fnArgs) {
  const decorators = propsDecorators[name];
  let props_;

  decorators.forEach(fn => {
    let ret_;

    if (!props_) {
      props_ = Object.assign({}, props);
    }

    try {
      ret_ = fn(...fnArgs, props_);
    } catch (err) {
      notify('Plugin error', `${fn._pluginName}: Error occurred in \`${name}\`. Check Developer Tools for details.`, {
        error: err
      });
      return;
    }

    if (!ret_ || typeof ret_ !== 'object') {
      notify('Plugin error', `${fn._pluginName}: Invalid return value of \`${name}\` (object expected).`);
      return;
    }

    props_ = ret_;
  });

  return props_ || props;
}

export function getTermGroupProps(uid, parentProps, props) {
  return getProps('getTermGroupProps', props, uid, parentProps);
}

export function getTermProps(uid, parentProps, props) {
  return getProps('getTermProps', props, uid, parentProps);
}

export function getTabsProps(parentProps, props) {
  return getProps('getTabsProps', props, parentProps);
}

export function getTabProps(tab, parentProps, props) {
  return getProps('getTabProps', props, tab, parentProps);
}

// connects + decorates a class
// plugins can override mapToState, dispatchToProps
// and the class gets decorated (proxied)
export function connect(stateFn, dispatchFn, c, d = {}) {
  return (Class, name) => {
    return reduxConnect(
      state => {
        let ret = stateFn(state);
        connectors[name].state.forEach(fn => {
          let ret_;

          try {
            ret_ = fn(state, ret);
          } catch (err) {
            notify(
              'Plugin error',
              `${fn._pluginName}: Error occurred in \`map${name}State\`. Check Developer Tools for details.`,
              {error: err}
            );
            return;
          }

          if (!ret_ || typeof ret_ !== 'object') {
            notify('Plugin error', `${fn._pluginName}: Invalid return value of \`map${name}State\` (object expected).`);
            return;
          }

          ret = ret_;
        });
        return ret;
      },
      dispatch => {
        let ret = dispatchFn(dispatch);
        connectors[name].dispatch.forEach(fn => {
          let ret_;

          try {
            ret_ = fn(dispatch, ret);
          } catch (err) {
            notify(
              'Plugin error',
              `${fn._pluginName}: Error occurred in \`map${name}Dispatch\`. Check Developer Tools for details.`,
              {error: err}
            );
            return;
          }

          if (!ret_ || typeof ret_ !== 'object') {
            notify(
              'Plugin error',
              `${fn._pluginName}: Invalid return value of \`map${name}Dispatch\` (object expected).`
            );
            return;
          }

          ret = ret_;
        });
        return ret;
      },
      c,
      d
    )(decorate(Class, name));
  };
}

function decorateReducer(name, fn) {
  const reducers = reducersDecorators[name];
  return (state, action) => {
    let state_ = fn(state, action);

    reducers.forEach(pluginReducer => {
      let state__;

      try {
        state__ = pluginReducer(state_, action);
      } catch (err) {
        notify('Plugin error', `${fn._pluginName}: Error occurred in \`${name}\`. Check Developer Tools for details.`, {
          error: err
        });
        return;
      }

      if (!state__ || typeof state__ !== 'object') {
        notify('Plugin error', `${fn._pluginName}: Invalid return value of \`${name}\`.`);
        return;
      }

      state_ = state__;
    });

    return state_;
  };
}

export function decorateTermGroupsReducer(fn) {
  return decorateReducer('reduceTermGroups', fn);
}

export function decorateUIReducer(fn) {
  return decorateReducer('reduceUI', fn);
}

export function decorateSessionsReducer(fn) {
  return decorateReducer('reduceSessions', fn);
}

// redux middleware generator
export const middleware = store => next => action => {
  const nextMiddleware = remaining => action_ =>
    remaining.length ? remaining[0](store)(nextMiddleware(remaining.slice(1)))(action_) : next(action_);
  nextMiddleware(middlewares)(action);
};

// expose decorated component instance to the higher-order components
function exposeDecorated(Component_) {
  return class DecoratedComponent extends React.Component {
    constructor(props, context) {
      super(props, context);
      this.onRef = this.onRef.bind(this);
    }
    onRef(decorated_) {
      if (this.props.onDecorated) {
        try {
          this.props.onDecorated(decorated_);
        } catch (e) {
          notify('Plugin error', `Error occurred. Check Developer Tools for details`, {error: e});
        }
      }
    }
    render() {
      return React.createElement(Component_, Object.assign({}, this.props, {ref: this.onRef}));
    }
  };
}

function getDecorated(parent, name) {
  if (!decorated[name]) {
    let class_ = exposeDecorated(parent);
    class_.displayName = `_exposeDecorated(${name})`;

    modules.forEach(mod => {
      const method = 'decorate' + name;
      const fn = mod[method];

      if (fn) {
        let class__;

        try {
          class__ = fn(class_, {React, PureComponent, Notification, notify});
          class__.displayName = `${fn._pluginName}(${name})`;
        } catch (err) {
          notify(
            'Plugin error',
            `${fn._pluginName}: Error occurred in \`${method}\`. Check Developer Tools for details`,
            {error: err}
          );
          return;
        }

        if (!class__ || typeof class__.prototype.render !== 'function') {
          notify(
            'Plugin error',
            `${
              fn._pluginName
            }: Invalid return value of \`${method}\`. No \`render\` method found. Please return a \`React.Component\`.`
          );
          return;
        }

        class_ = class__;
      }
    });

    decorated[name] = class_;
  }

  return decorated[name];
}

// for each component, we return a higher-order component
// that wraps with the higher-order components
// exposed by plugins
export function decorate(Component_, name) {
  return class DecoratedComponent extends React.Component {
    constructor(props) {
      super(props);
      this.state = {hasError: false};
    }
    componentDidCatch() {
      this.setState({hasError: true});
      // No need to detail this error because React print those informations.
      notify(
        'Plugin error',
        `Plugins decorating ${name} has been disabled because of a plugin crash. Check Developer Tools for details.`
      );
    }
    render() {
      const Sub = this.state.hasError ? Component_ : getDecorated(Component_, name);
      return React.createElement(Sub, this.props);
    }
  };
}
