import { ipcRenderer, remote } from 'electron';
import notify from './notify';
import { createProxy } from 'react-proxy';

// remote interface to `../plugins`
let plugins = remote.require('./plugins');

// `require`d modules
let modules;

// the fs locations where usr plugins are stored
const { path, localPath } = plugins.getBasePaths();

// where we store the decorated components
let proxies = {};

const clearCache = () => {
  // clear require cache
  for (const entry in window.require.cache) {
    if (entry.indexOf(path) === 0 || entry.indexOf(localPath) === 0) {
      // `require` is webpacks', `window.require`, electron's
      delete window.require.cache[entry];
    }
  }
};

const loadModules = () => {
  console.log('(re)loading renderer plugins');
  const paths = plugins.getPaths();
  modules = paths.plugins.concat(paths.localPlugins).map((path) => {
    // window.require allows us to ensure this doens't get
    // in the way of our build
    try {
      return window.require(path);
    } catch (err) {
      const name = remote.require('path').basename(path);
      console.error(err.stack);
      notify('Plugin load error', `"${name}" failed to load in the renderer process. Check Developer Tools for details.`);
    }
  });
};

const updateProxy = (name) => {
  const [Component, proxy] = proxies[name];
  let decorated = Component;
  modules.forEach((mod) => {
    const decorator = mod[`decorate${name}`];
    if (decorator) {
      decorated = decorator(Component);
    }
  });
  if (decorated !== Component) {
    proxy.update(decorated);
  }
};

const updateProxies = () => {
  for (const name in proxies) {
    updateProxy(name);
  }
};

// load modules for initial decoration
loadModules();

// we want to refresh our modules cache every time
// plugins reload.
// the re-painting happens by the top-level `Config` component
// that reacts to configuration changes and plugin changes
ipcRenderer.on('plugins change', () => {
  clearCache();
  loadModules();
  updateProxies();
});

// for each component, we return the `react-proxy`d component
export default function decorate (Component, props = null) {
  const name = Component.name;

  if (!proxies[name]) {
    const proxy = createProxy(Component);
    proxies[name] = [Component, proxy];
    updateProxy(name);
  }

  const [, proxy] = proxies[name];
  return proxy.get();
}
