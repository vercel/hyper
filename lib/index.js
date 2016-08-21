import rpc from './rpc';
import React from 'react';
import { render } from 'react-dom';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { init } from './actions/index';
import effects from './utils/effects';
import * as config from './utils/config';
import rootReducer from './reducers/index';
import * as plugins from './utils/plugins';
import * as uiActions from './actions/ui';
import forceUpdate from 'react-deep-force-update';
import * as updaterActions from './actions/updater';
import * as sessionActions from './actions/sessions';
import { createStore, applyMiddleware } from 'redux';
import HyperTermContainer from './containers/hyperterm';
import { loadConfig, reloadConfig } from './actions/config';
import { webFrame } from 'electron';

// Disable pinch zoom
webFrame.setZoomLevelLimits(1, 1);

const store_ = createStore(
  rootReducer,
  applyMiddleware(
    thunk,
    plugins.middleware,
    thunk,
    effects
  )
);

window.__defineGetter__('store', () => store_);
window.__defineGetter__('rpc', () => rpc);
window.__defineGetter__('config', () => config);
window.__defineGetter__('plugins', () => plugins);

// initialize config
store_.dispatch(loadConfig(config.getConfig()));
config.subscribe(() => {
  store_.dispatch(reloadConfig(config.getConfig()));
});

// initialize communication with main electron process
// and subscribe to all user intents for example from menus
rpc.on('ready', () => {
  store_.dispatch(init());
  store_.dispatch(uiActions.setFontSmoothing());
});

rpc.on('session add', ({ uid, shell, pid }) => {
  store_.dispatch(sessionActions.addSession(uid, shell, pid));
});

rpc.on('session data', ({ uid, data }) => {
  store_.dispatch(sessionActions.addSessionData(uid, data));
});

rpc.on('session data send', ({ uid, data }) => {
  store_.dispatch(sessionActions.sendSessionData(uid, data));
});

rpc.on('session title', ({ uid, title }) => {
  store_.dispatch(sessionActions.setSessionProcessTitle(uid, title));
});

rpc.on('session exit', ({ uid }) => {
  store_.dispatch(sessionActions.sessionExit(uid));
});

rpc.on('session add req', () => {
  store_.dispatch(sessionActions.requestSession());
});

rpc.on('session close req', () => {
  store_.dispatch(sessionActions.userExitActiveSession());
});

rpc.on('session clear req', () => {
  store_.dispatch(sessionActions.clearActiveSession());
});

rpc.on('reset fontSize req', () => {
  store_.dispatch(uiActions.resetFontSize());
});

rpc.on('increase fontSize req', () => {
  store_.dispatch(uiActions.increaseFontSize());
});

rpc.on('decrease fontSize req', () => {
  store_.dispatch(uiActions.decreaseFontSize());
});

rpc.on('move left req', () => {
  store_.dispatch(uiActions.moveLeft());
});

rpc.on('move right req', () => {
  store_.dispatch(uiActions.moveRight());
});

rpc.on('preferences', () => {
  store_.dispatch(uiActions.showPreferences());
});

rpc.on('open file', ({ path }) => {
  store_.dispatch(uiActions.openFile(path));
});

rpc.on('update available', ({ releaseName, releaseNotes }) => {
  store_.dispatch(updaterActions.updateAvailable(releaseName, releaseNotes));
});

rpc.on('move', () => {
  store_.dispatch(uiActions.windowMove());
});

const app = render(
  <Provider store={ store_ }>
    <HyperTermContainer />
  </Provider>,
  document.getElementById('mount')
);

rpc.on('reload', () => {
  plugins.reload();
  forceUpdate(app);
});
