import { remote } from 'electron';
import { connect as reduxConnect } from 'react-redux';

// we expose these two deps to component decorators
import React from 'react';
import Notification from '../components/notification';
import notify from './notify';

var Module = require('module');
var originalLoad = Module._load;
Module._load = function (path) {
  if (path === 'react') {
    return React;
  }
  return originalLoad.apply(this, arguments);
};

// remote interface to `../plugins`
let plugins = remote.require('./plugins');

// `require`d modules
let modules;

// cache of decorated components
let decorated = {};

// various caches extracted of the plugin methods
let connectors;
let middlewares;
let uiReducers;
let sessionsReducers;
let tabPropsDecorators;
let tabsPropsDecorators;
let termPropsDecorators;

// the fs locations where usr plugins are stored
const { path, localPath } = plugins.getBasePaths();

const clearModulesCache = () => {
  // trigger unload hooks
  modules.forEach((mod) => {
    if (mod.onRendererUnload) mod.onRendererUnload(window);
  });

  // clear require cache
  for (const entry in window.require.cache) {
    if (entry.indexOf(path) === 0 || entry.indexOf(localPath) === 0) {
      // `require` is webpacks', `window.require`, electron's
      delete window.require.cache[entry];
    }
  }
};

const getPluginName = (path) => window.require('path').basename(path);

const loadModules = () => {
  console.log('(re)loading renderer plugins');
  const paths = plugins.getPaths();

  // initialize cache that we populate with extension methods
  connectors = {
    Terms: { state: [], dispatch: [] },
    Header: { state: [], dispatch: [] },
    HyperTerm: { state: [], dispatch: [] },
    Notifications: { state: [], dispatch: [] }
  };
  uiReducers = [];
  middlewares = [];
  sessionsReducers = [];
  tabPropsDecorators = [];
  tabsPropsDecorators = [];
  termPropsDecorators = [];

  modules = paths.plugins.concat(paths.localPlugins)
    .map((path) => {
      let mod;
      const pluginName = getPluginName(path);

      // window.require allows us to ensure this doesn't get
      // in the way of our build
      try {
        mod = window.require(path);
      } catch (err) {
        console.error(err.stack);
        notify('Plugin load error', `"${pluginName}" failed to load in the renderer process. Check Developer Tools for details.`);
        return;
      }

      for (const i in mod) {
        mod[i]._pluginName = pluginName;
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

      if (mod.mapHyperTermState) {
        connectors.HyperTerm.state.push(mod.mapHyperTermState);
      }

      if (mod.mapHyperTermDispatch) {
        connectors.HyperTerm.dispatch.push(mod.mapHyperTermDispatch);
      }

      if (mod.mapNotificationsState) {
        connectors.Notifications.state.push(mod.mapNotificationsState);
      }

      if (mod.mapNotificationsDispatch) {
        connectors.Notifications.dispatch.push(mod.mapNotificationsDispatch);
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

      return mod;
    })
    .filter((mod) => !!mod);
};

// load modules for initial decoration
loadModules();

export function reload () {
  clearModulesCache();
  loadModules();
  // trigger re-decoration when components
  // get re-rendered
  decorated = {};
}

export function getTermProps (uid, parentProps, props) {
  let props_;

  termPropsDecorators.forEach((fn) => {
    let ret_;

    if (!props_) props_ = Object.assign({}, props);

    try {
      ret_ = fn(uid, parentProps, props_);
    } catch (err) {
      console.error(err.stack);
      notify('Plugin error', `${fn._pluginName}: Error occurred in \`getTermProps\`. Check Developer Tools for details.`);
      return;
    }

    if (!ret_ || 'object' !== typeof ret_) {
      notify('Plugin error', `${fn._pluginName}: Invalid return value of \`getTermProps\` (object expected).`);
      return;
    }

    props = ret_;
  });

  return props_ || props;
}

export function getTabsProps (parentProps, props) {
  let props_;

  tabsPropsDecorators.forEach((fn) => {
    let ret_;

    if (!props_) props_ = Object.assign({}, props);

    try {
      ret_ = fn(parentProps, props_);
    } catch (err) {
      console.error(err.stack);
      notify('Plugin error', `${fn._pluginName}: Error occurred in \`getTabsProps\`. Check Developer Tools for details.`);
      return;
    }

    if (!ret_ || 'object' !== typeof ret_) {
      notify('Plugin error', `${fn._pluginName}: Invalid return value of \`getTabsProps\` (object expected).`);
      return;
    }

    props_ = ret_;
  });

  return props_ || props;
}

export function getTabProps (tab, parentProps, props) {
  let props_;

  tabPropsDecorators.forEach((fn) => {
    let ret_;

    if (!props_) props_ = Object.assign({}, props);

    try {
      ret_ = fn(tab, parentProps, props_);
    } catch (err) {
      console.error(err.stack);
      notify('Plugin error', `${fn._pluginName}: Error occurred in \`getTabProps\`. Check Developer Tools for details.`);
      return;
    }

    if (!ret_ || 'object' !== typeof ret_) {
      notify('Plugin error', `${fn._pluginName}: Invalid return value of \`getTabProps\` (object expected).`);
      return;
    }

    props_ = ret_;
  });

  return props_ || props;
}

// connects + decorates a class
// plugins can override mapToState, dispatchToProps
// and the class gets decorated (proxied)
export function connect (stateFn, dispatchFn, c, d = {}) {
  return function (Class, name) {
    return reduxConnect(
      function (state) {
        let ret = stateFn(state);
        connectors[name].state.forEach((fn) => {
          let ret_;

          try {
            ret_ = fn(state, ret);
          } catch (err) {
            console.error(err.stack);
            notify('Plugin error', `${fn._pluginName}: Error occurred in \`map${name}State\`. Check Developer Tools for details.`);
            return;
          }

          if (!ret_ || 'object' !== typeof ret_) {
            notify('Plugin error', `${fn._pluginName}: Invalid return value of \`map${name}State\` (object expected).`);
            return;
          }

          ret = ret_;
        });
        return ret;
      },
      function (dispatch) {
        let ret = dispatchFn(dispatch);
        connectors[name].dispatch.forEach((fn) => {
          let ret_;

          try {
            ret_ = fn(dispatch, ret);
          } catch (err) {
            console.error(err.stack);
            notify('Plugin error', `${fn._pluginName}: Error occurred in \`map${name}Dispatch\`. Check Developer Tools for details.`);
            return;
          }

          if (!ret_ || 'object' !== typeof ret_) {
            notify('Plugin error', `${fn._pluginName}: Invalid return value of \`map${name}Dispatch\` (object expected).`);
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

export function decorateUIReducer (fn) {
  return (state, action) => {
    let state_ = fn(state, action);

    uiReducers.forEach((pluginReducer) => {
      let state__;

      try {
        state__ = pluginReducer(state_, action);
      } catch (err) {
        console.error(err.stack);
        notify('Plugin error', `${fn._pluginName}: Error occurred in \`reduceUI\`. Check Developer Tools for details.`);
        return;
      }

      if (!state__ || 'object' !== typeof state__) {
        notify('Plugin error', `${fn._pluginName}: Invalid return value of \`reduceUI\`.`);
        return;
      }

      state_ = state__;
    });

    return state_;
  };
}

export function decorateSessionsReducer (fn) {
  return (state, action) => {
    let state_ = fn(state, action);

    sessionsReducers.forEach((pluginReducer) => {
      let state__;

      try {
        state__ = pluginReducer(state_, action);
      } catch (err) {
        console.error(err.stack);
        notify('Plugin error', `${fn._pluginName}: Error occurred in \`reduceSessions\`. Check Developer Tools for details.`);
        return;
      }

      if (!state__ || 'object' !== typeof state__) {
        notify('Plugin error', `${fn._pluginName}: Invalid return value of \`reduceSessions\`.`);
        return;
      }

      state_ = state__;
    });

    return state_;
  };
}

// redux middleware generator
export const middleware = (store) => (next) => (action) => {
  const nextMiddleware = remaining => action => remaining.length
    ? remaining[0](store)(nextMiddleware(remaining.slice(1)))(action)
    : next(action);
  nextMiddleware(middlewares)(action);
};

function getDecorated (parent, name) {
  if (!decorated[name]) {
    let class_ = parent;

    modules.forEach((mod) => {
      const method = 'decorate' + name;
      const fn = mod[method];

      if (fn) {
        let class__;

        try {
          class__ = fn(class_, { React, Notification, notify });
        } catch (err) {
          console.error(err.stack);
          notify('Plugin error', `${fn._pluginName}: Error occurred in \`${method}\`. Check Developer Tools for details`);
          return;
        }

        if (!class__ || 'function' !== typeof class__.prototype.render) {
          notify('Plugin error', `${fn._pluginName}: Invalid return value of \`${method}\`. No \`render\` method found. Please return a \`React.Component\`.`);
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
export function decorate (Component, name) {
  return class extends React.Component {
    render () {
      const Sub = getDecorated(Component, name);
      return <Sub {...this.props} />;
    }
  };
}
