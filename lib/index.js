import {webFrame} from 'electron';
import forceUpdate from 'react-deep-force-update';
import {Provider} from 'react-redux';
import React from 'react';
import {render} from 'react-dom';

import rpc from './rpc';
import init from './actions/index';
import * as config from './utils/config';
import * as plugins from './utils/plugins';
import * as uiActions from './actions/ui';
import * as updaterActions from './actions/updater';
import * as sessionActions from './actions/sessions';
import * as termGroupActions from './actions/term-groups';
import {addNotificationMessage} from './actions/notifications';
import {loadConfig, reloadConfig} from './actions/config';
import HyperContainer from './containers/hyper';
import configureStore from './store/configure-store';

// Disable pinch zoom
webFrame.setVisualZoomLevelLimits(1, 1);

const store_ = configureStore();

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

rpc.on('session add', data => {
  store_.dispatch(sessionActions.addSession(data));
});

rpc.on('session data', d => {
  // the uid is a uuid v4 so it's 36 chars long
  const uid = d.slice(0, 36);
  const data = d.slice(36);
  store_.dispatch(sessionActions.addSessionData(uid, data));
});

rpc.on('session data send', ({uid, data, escaped}) => {
  store_.dispatch(sessionActions.sendSessionData(uid, data, escaped));
});

rpc.on('session exit', ({uid}) => {
  store_.dispatch(termGroupActions.ptyExitTermGroup(uid));
});

rpc.on('termgroup close req', () => {
  store_.dispatch(termGroupActions.exitActiveTermGroup());
});

rpc.on('session clear req', () => {
  store_.dispatch(sessionActions.clearActiveSession());
});

rpc.on('session move word left req', () => {
  store_.dispatch(sessionActions.sendSessionData(null, '\x1bb'));
});

rpc.on('session move word right req', () => {
  store_.dispatch(sessionActions.sendSessionData(null, '\x1bf'));
});

rpc.on('session move line beginning req', () => {
  store_.dispatch(sessionActions.sendSessionData(null, '\x1bOH'));
});

rpc.on('session move line end req', () => {
  store_.dispatch(sessionActions.sendSessionData(null, '\x1bOF'));
});

rpc.on('session del word left req', () => {
  store_.dispatch(sessionActions.sendSessionData(null, '\x1b\x7f'));
});

rpc.on('session del word right req', () => {
  store_.dispatch(sessionActions.sendSessionData(null, '\x1bd'));
});

rpc.on('session del line beginning req', () => {
  store_.dispatch(sessionActions.sendSessionData(null, '\x1bw'));
});

rpc.on('session del line end req', () => {
  store_.dispatch(sessionActions.sendSessionData(null, '\x10B'));
});

rpc.on('session break req', () => {
  store_.dispatch(sessionActions.sendSessionData(null, '\x03'));
});

rpc.on('termgroup add req', () => {
  store_.dispatch(termGroupActions.requestTermGroup());
});

rpc.on('split request horizontal', () => {
  store_.dispatch(termGroupActions.requestHorizontalSplit());
});

rpc.on('split request vertical', () => {
  store_.dispatch(termGroupActions.requestVerticalSplit());
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

rpc.on('move jump req', index => {
  store_.dispatch(uiActions.moveTo(index));
});

rpc.on('next pane req', () => {
  store_.dispatch(uiActions.moveToNextPane());
});

rpc.on('prev pane req', () => {
  store_.dispatch(uiActions.moveToPreviousPane());
});

rpc.on('open file', ({path}) => {
  store_.dispatch(uiActions.openFile(path));
});

rpc.on('open ssh', url => {
  store_.dispatch(uiActions.openSSH(url));
});

rpc.on('update available', ({releaseName, releaseNotes, releaseUrl, canInstall}) => {
  store_.dispatch(updaterActions.updateAvailable(releaseName, releaseNotes, releaseUrl, canInstall));
});

rpc.on('move', () => {
  store_.dispatch(uiActions.windowMove());
});

rpc.on('windowGeometry change', () => {
  store_.dispatch(uiActions.windowGeometryUpdated());
});

rpc.on('add notification', ({text, url, dismissable}) => {
  store_.dispatch(addNotificationMessage(text, url, dismissable));
});

const app = render(
  <Provider store={store_}>
    <HyperContainer />
  </Provider>,
  document.getElementById('mount')
);

rpc.on('reload', () => {
  plugins.reload();
  forceUpdate(app);
});
