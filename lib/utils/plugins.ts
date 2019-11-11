import {remote} from 'electron';
// TODO: Should be updates to new async API https://medium.com/@nornagon/electrons-remote-module-considered-harmful-70d69500f31

import {connect as reduxConnect, Options} from 'react-redux';
import {basename} from 'path';

// patching Module._load
// so plugins can `require` them without needing their own version
// https://github.com/zeit/hyper/issues/619
import React, {PureComponent} from 'react';
import ReactDOM from 'react-dom';
import Notification from '../components/notification';
import notify from './notify';
import {hyperPlugin, IUiReducer, ISessionReducer, ITermGroupReducer, HyperState} from '../hyper';
import {Dispatch} from 'redux';

// remote interface to `../plugins`
const plugins = remote.require('./plugins') as typeof import('../../app/plugins');

// `require`d modules
let modules: any;

// cache of decorated components
let decorated: Record<string, any> = {};

// various caches extracted of the plugin methods
let connectors: {
  Terms: {state: any[]; dispatch: any[]};
  Header: {state: any[]; dispatch: any[]};
  Hyper: {state: any[]; dispatch: any[]};
  Notifications: {state: any[]; dispatch: any[]};
};
let middlewares: any[];
let uiReducers: IUiReducer[];
let sessionsReducers: ISessionReducer[];
let termGroupsReducers: ITermGroupReducer[];
let tabPropsDecorators: any[];
let tabsPropsDecorators: any[];
let termPropsDecorators: any[];
let termGroupPropsDecorators: any[];
let propsDecorators: {
  getTermProps: any[];
  getTabProps: any[];
  getTabsProps: any[];
  getTermGroupProps: any[];
};
let reducersDecorators: {
  reduceUI: IUiReducer[];
  reduceSessions: ISessionReducer[];
  reduceTermGroups: ITermGroupReducer[];
};

// expose decorated component instance to the higher-order components
function exposeDecorated(Component_: any) {
  return class DecoratedComponent extends React.Component<any, any> {
    constructor(props: any, context: any) {
      super(props, context);
      this.onRef = this.onRef.bind(this);
    }
    onRef(decorated_: any) {
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

function getDecorated(parent: any, name: string) {
  if (!decorated[name]) {
    let class_ = exposeDecorated(parent);
    (class_ as any).displayName = `_exposeDecorated(${name})`;

    modules.forEach((mod: any) => {
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
            `${fn._pluginName}: Invalid return value of \`${method}\`. No \`render\` method found. Please return a \`React.Component\`.`
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
export function decorate(Component_: any, name: string) {
  return class DecoratedComponent extends React.Component<any, {hasError: boolean}> {
    constructor(props: any) {
      super(props);
      this.state = {hasError: false};
    }
    componentDidCatch() {
      this.setState({hasError: true});
      // No need to detail this error because React print these information.
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

const Module = require('module') as typeof import('module') & {_load: Function};
const originalLoad = Module._load;
Module._load = function _load(path: string) {
  // PLEASE NOTE: Code changes here, also need to be changed in
  // app/plugins.js
  switch (path) {
    case 'react':
      //eslint-disable-next-line no-console
      console.warn('DEPRECATED: If your plugin requires `react`, it must bundle it as a dependency');
      return React;
    case 'react-dom':
      //eslint-disable-next-line no-console
      console.warn('DEPRECATED: If your plugin requires `react-dom`, it must bundle it as a dependency');
      return ReactDOM;
    case 'hyper/component':
      //eslint-disable-next-line no-console
      console.warn(
        'DEPRECATED: If your plugin requires `hyper/component`, it must requires `react.PureComponent` instead and bundle `react` as a dependency'
      );
      return PureComponent;
    case 'hyper/notify':
      return notify;
    case 'hyper/Notification':
      return Notification;
    case 'hyper/decorate':
      return decorate;
    default:
      // eslint-disable-next-line prefer-rest-params
      return originalLoad.apply(this, arguments);
  }
};

const clearModulesCache = () => {
  // the fs locations where user plugins are stored
  const {path, localPath} = plugins.getBasePaths();

  // trigger unload hooks
  modules.forEach((mod: any) => {
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

const pathModule = window.require('path') as typeof import('path');

const getPluginName = (path: string) => pathModule.basename(path);

const getPluginVersion = (path: string): string | null => {
  let version = null;
  try {
    version = (window.require(pathModule.resolve(path, 'package.json')) as any).version as string;
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

  const loadedPlugins = plugins.getLoadedPluginVersions().map((plugin: any) => plugin.name);
  modules = paths.plugins
    .concat(paths.localPlugins)
    .filter((plugin: any) => loadedPlugins.indexOf(basename(plugin)) !== -1)
    .map((path: any) => {
      let mod: hyperPlugin;
      const pluginName = getPluginName(path);
      const pluginVersion = getPluginVersion(path);

      // window.require allows us to ensure this doesn't get
      // in the way of our build
      try {
        mod = window.require(path) as any;
      } catch (err) {
        notify(
          'Plugin load error',
          `"${pluginName}" failed to load in the renderer process. Check Developer Tools for details.`,
          {error: err}
        );
        return undefined;
      }

      (Object.keys(mod) as (keyof typeof mod)[]).forEach(i => {
        if (Object.hasOwnProperty.call(mod, i)) {
          mod[i]._pluginName = pluginName;
          mod[i]._pluginVersion = pluginVersion;
        }
      });

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
    .filter((mod: any) => Boolean(mod));

  const deprecatedPlugins: Record<string, any> = plugins.getDeprecatedConfig();
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

function getProps(name: keyof typeof propsDecorators, props: any, ...fnArgs: any[]) {
  const decorators = propsDecorators[name];
  let props_: typeof props;

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

export function getTermGroupProps(uid: string, parentProps: any, props: any) {
  return getProps('getTermGroupProps', props, uid, parentProps);
}

export function getTermProps(uid: string, parentProps: any, props: any) {
  return getProps('getTermProps', props, uid, parentProps);
}

export function getTabsProps(parentProps: any, props: any) {
  return getProps('getTabsProps', props, parentProps);
}

export function getTabProps(tab: any, parentProps: any, props: any) {
  return getProps('getTabProps', props, tab, parentProps);
}

// connects + decorates a class
// plugins can override mapToState, dispatchToProps
// and the class gets decorated (proxied)
export function connect<stateProps, dispatchProps>(
  stateFn: (state: HyperState) => stateProps,
  dispatchFn: (dispatch: Dispatch<any>) => dispatchProps,
  c: any,
  d: Options = {}
) {
  return (Class: any, name: keyof typeof connectors) => {
    return reduxConnect<stateProps, dispatchProps, any, HyperState>(
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

const decorateReducer: {
  (name: 'reduceUI', fn: IUiReducer): IUiReducer;
  (name: 'reduceSessions', fn: ISessionReducer): ISessionReducer;
  (name: 'reduceTermGroups', fn: ITermGroupReducer): ITermGroupReducer;
} = <T extends keyof typeof reducersDecorators>(name: T, fn: any) => {
  const reducers = reducersDecorators[name];
  return (state: any, action: any) => {
    let state_ = fn(state, action);

    reducers.forEach((pluginReducer: any) => {
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
};

export function decorateTermGroupsReducer(fn: ITermGroupReducer) {
  return decorateReducer('reduceTermGroups', fn);
}

export function decorateUIReducer(fn: IUiReducer) {
  return decorateReducer('reduceUI', fn);
}

export function decorateSessionsReducer(fn: ISessionReducer) {
  return decorateReducer('reduceSessions', fn);
}

// redux middleware generator
export const middleware = (store: any) => (next: any) => (action: any) => {
  const nextMiddleware = (remaining: any[]) => (action_: any) =>
    remaining.length ? remaining[0](store)(nextMiddleware(remaining.slice(1)))(action_) : next(action_);
  nextMiddleware(middlewares)(action);
};
