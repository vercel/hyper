import {webFrame} from 'electron';
import forceUpdate from 'react-deep-force-update';
import {Provider} from 'react-redux';
import React from 'react';
import {render} from 'react-dom';

import rpc from './rpc';
import init from './actions/index';
import * as config from './utils/config';
import * as plugins from './utils/plugins';
import {getBase64FileData} from './utils/file';
import * as uiActions from './actions/ui';
import * as updaterActions from './actions/updater';
import * as sessionActions from './actions/sessions';
import * as termGroupActions from './actions/term-groups';
import {addNotificationMessage} from './actions/notifications';
import {loadConfig, reloadConfig} from './actions/config';
import HyperContainer from './containers/hyper';
import configureStore from './store/configure-store';
import {configOptions} from './config';

// On Linux, the default zoom was somehow changed with Electron 3 (or maybe 2).
// Setting zoom factor to 1.2 brings back the normal default size
if (process.platform === 'linux') {
  webFrame.setZoomFactor(1.2);
}

const store_ = configureStore();

Object.defineProperty(window, 'store', {get: () => store_});
Object.defineProperty(window, 'rpc', {get: () => rpc});
Object.defineProperty(window, 'config', {get: () => config});
Object.defineProperty(window, 'plugins', {get: () => plugins});

const fetchFileData = (configData: configOptions) => {
  const configInfo: configOptions = {...configData, bellSound: null};
  if (!configInfo.bell || configInfo.bell.toUpperCase() !== 'SOUND' || !configInfo.bellSoundURL) {
    store_.dispatch(reloadConfig(configInfo));
    return;
  }

  getBase64FileData(configInfo.bellSoundURL).then((base64FileData) => {
    // prepend "base64," to the result of this method in order for this to work properly within xterm.js
    const bellSound = !base64FileData ? null : 'base64,' + base64FileData;
    configInfo.bellSound = bellSound;
    store_.dispatch(reloadConfig(configInfo));
  });
};

// initialize config
store_.dispatch(loadConfig(config.getConfig()));
fetchFileData(config.getConfig());

config.subscribe(() => {
  const configInfo = config.getConfig();
  configInfo.bellSound = store_.getState().ui.bellSound;
  // The only async part of the config is the bellSound so we will check if the bellSoundURL
  // has changed to determine if we should re-read this file and dispatch an update to the config
  if (store_.getState().ui.bellSoundURL !== config.getConfig().bellSoundURL) {
    fetchFileData(configInfo);
  } else {
    // No change in the bellSoundURL so continue with a normal reloadConfig, reusing the value
    // we already have for `bellSound`
    store_.dispatch(reloadConfig(configInfo));
  }
});

// initialize communication with main electron process
// and subscribe to all user intents for example from menus
rpc.on('ready', () => {
  store_.dispatch(init());
  store_.dispatch(uiActions.setFontSmoothing());
});

rpc.on('session add', (data) => {
  store_.dispatch(sessionActions.addSession(data));
});

rpc.on('session data', (d: string) => {
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

rpc.on('session search', () => {
  store_.dispatch(sessionActions.onSearch());
});

rpc.on('session search close', () => {
  store_.dispatch(sessionActions.closeSearch());
});

rpc.on('termgroup add req', ({activeUid}) => {
  store_.dispatch(termGroupActions.requestTermGroup(activeUid));
});

rpc.on('split request horizontal', ({activeUid}) => {
  store_.dispatch(termGroupActions.requestHorizontalSplit(activeUid));
});

rpc.on('split request vertical', ({activeUid}) => {
  store_.dispatch(termGroupActions.requestVerticalSplit(activeUid));
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

rpc.on('move jump req', (index) => {
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

rpc.on('open ssh', (url) => {
  store_.dispatch(uiActions.openSSH(url));
});

rpc.on('update available', ({releaseName, releaseNotes, releaseUrl, canInstall}) => {
  store_.dispatch(updaterActions.updateAvailable(releaseName, releaseNotes, releaseUrl, canInstall));
});

rpc.on('move', (window) => {
  store_.dispatch(uiActions.windowMove(window));
});

rpc.on('windowGeometry change', () => {
  store_.dispatch(uiActions.windowGeometryUpdated());
});

rpc.on('add notification', ({text, url, dismissable}) => {
  store_.dispatch(addNotificationMessage(text, url, dismissable));
});

rpc.on('enter full screen', () => {
  store_.dispatch(uiActions.enterFullScreen());
});

rpc.on('leave full screen', () => {
  store_.dispatch(uiActions.leaveFullScreen());
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
