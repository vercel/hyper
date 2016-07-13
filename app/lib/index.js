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

import createLogger from 'redux-logger';
const logger = createLogger({ collapsed: true });

const store = createStore(
  rootReducer,
  applyMiddleware(
    thunk,
    logger,
    plugins.middleware,
    thunk,
    effects
  )
);

window.__defineGetter__('state', () => store.getState());

// initialize config
store.dispatch(loadConfig(config.getConfig()));
config.subscribe(() => {
  store.dispatch(reloadConfig(config.getConfig()));
});

// initialize communication with main electron process
// and subscribe to all user intents for example from menues
rpc.on('ready', () => {
  store.dispatch(init());
});

rpc.on('session add', ({ uid }) => {
  store.dispatch(sessionActions.addSession(uid));
});

rpc.on('session data', ({ uid, data }) => {
  store.dispatch(sessionActions.addSessionData(uid, data));
});

rpc.on('session title', ({ uid, title }) => {
  store.dispatch(sessionActions.setSessionProcessTitle(uid, title));
});

rpc.on('session exit', ({ uid }) => {
  store.dispatch(sessionActions.sessionExit(uid));
});

rpc.on('session add req', () => {
  store.dispatch(sessionActions.requestSession());
});

rpc.on('session close req', () => {
  store.dispatch(sessionActions.userExitActiveSession());
});

rpc.on('session clear req', () => {
  store.dispatch(sessionActions.clearActiveSession());
});

rpc.on('reset fontSize req', () => {
  store.dispatch(uiActions.resetFontSize());
});

rpc.on('increase fontSize req', () => {
  store.dispatch(uiActions.increaseFontSize());
});

rpc.on('decrease fontSize req', () => {
  store.dispatch(uiActions.resetFontSize());
});

rpc.on('move left req', () => {
  store.dispatch(uiActions.moveLeft());
});

rpc.on('move right req', () => {
  store.dispatch(uiActions.moveRight());
});

rpc.on('preferences', () => {
  store.dispatch(uiActions.showPreferences());
});

rpc.on('update available', ({ releaseName, releaseNotes }) => {
  store.dispatch(updaterActions.updateAvailable(releaseName, releaseNotes));
});

const app = render(
  <Provider store={ store }>
    <HyperTermContainer />
  </Provider>,
  document.getElementById('mount')
);

rpc.on('reload', () => {
  plugins.reload();
  forceUpdate(app);
});
