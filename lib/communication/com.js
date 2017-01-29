import forceUpdate from 'react-deep-force-update';
import * as config from '../utils/config';
import * as plugins from '../utils/plugins';
import configureStore from '../store/configure-store';

import * as event from './event';
import init from './actions/init';
import {load, reload} from './actions/config';
import * as ui from './actions/ui';
import * as sessions from './actions/sessions';
import term from './actions/term';
import * as tab from './actions/tab';
import * as pane from './actions/pane';
import * as pty from './actions/pty';

import rpc from './rpc';

const store_ = configureStore();

window.store = store_;
window.rpc = rpc;
window.config = config;
window.plugins = plugins;

class Com {
  constructor() {
    // initialize config
    store_.dispatch(load(config.getConfig()));
    config.subscribe(() => {
      store_.dispatch(reload(config.getConfig()));
    });

    // initialize communication with main electron process
    // and subscribe to all user intents for example from menus
    rpc.on(event.READY, () => {
      store_.dispatch(init());
      store_.dispatch(ui.setFontSmoothing());
    });

    rpc.on('created', ({uid}) => {
      store_.dispatch(tab.request(uid));
    });

    rpc.on('pane splited', ({split, uid}) => {
      store_.dispatch(pane.splited(split, uid));
    });

    rpc.on('pane created', ({uid}) => {
      store_.dispatch(pane.request(uid));
    });
    
    rpc.on('pty data', ({uid, data}) => {
      store_.dispatch(pty.onData(uid, data));
    });

    rpc.on(event.SESSION.ADD, data => {
      console.log(data);
      // store_.dispatch(sessions.create(data));
    });

    rpc.on('session data', ({uid, data}) => {
      store_.dispatch(sessions.addData(uid, data));
    });

    rpc.on('session data send', ({uid, data}) => {
      store_.dispatch(sessions.sendData(uid, data));
    });

    rpc.on('session exit', ({uid}) => {
      console.log('session exit', uid);
    });

    rpc.on('termgroup close req', () => {
      store_.dispatch(pane.doClose());
    });

    rpc.on('session clear req', () => {
      console.log('session clear req');
    });

    rpc.on('termgroup add req', () => {
      console.log('termgroup add req');
      store_.dispatch(term());
    });

    rpc.on('split request horizontal', () => {
      store_.dispatch(pane.horizontalSplit());
    });

    rpc.on('split request vertical', () => {
      store_.dispatch(pane.verticalSplit());
    });

    rpc.on('reset fontSize req', () => {
      store_.dispatch(ui.resetFontSize());
    });

    rpc.on('increase fontSize req', () => {
      store_.dispatch(ui.increaseFontSize());
    });

    rpc.on('decrease fontSize req', () => {
      store_.dispatch(ui.decreaseFontSize());
    });

    rpc.on('move left req', () => {
    });

    rpc.on('move right req', () => {
    });

    rpc.on('next pane req', () => {
    });

    rpc.on('prev pane req', () => {
    });

    rpc.on('preferences', () => {
    });

    rpc.on('open file', ({path}) => {
      console.log(path);
    });

    rpc.on('update available', ({releaseName, releaseNotes}) => {
      console.log(releaseName, releaseNotes);
    });

    rpc.on('move', () => {
      store_.dispatch(ui.windowMove());
    });

    rpc.on('add notification', ({text, url, dismissable}) => {
      console.log(text, url, dismissable);
    });

    this.store = store_;
  }

  reload(app) {
    rpc.on('reload', () => {
      plugins.reload();
      forceUpdate(app);
    });
  }
}

export default Com;
