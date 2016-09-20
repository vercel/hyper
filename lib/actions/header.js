import {CLOSE_TAB, CHANGE_TAB} from '../constants/tabs';
import {UI_WINDOW_MAXIMIZE, UI_WINDOW_UNMAXIMIZE} from '../constants/ui';
import rpc from '../rpc';

import {userExitSession, setActiveSession} from './sessions';

export function closeTab(uid) {
  return dispatch => {
    dispatch({
      type: CLOSE_TAB,
      uid,
      effect() {
        dispatch(userExitSession(uid));
      }
    });
  };
}

export function changeTab(uid) {
  return dispatch => {
    dispatch({
      type: CHANGE_TAB,
      uid,
      effect() {
        dispatch(setActiveSession(uid));
      }
    });
  };
}

export function maximize() {
  return dispatch => {
    dispatch({
      type: UI_WINDOW_MAXIMIZE,
      effect() {
        rpc.emit('maximize');
      }
    });
  };
}

export function unmaximize() {
  return dispatch => {
    dispatch({
      type: UI_WINDOW_UNMAXIMIZE,
      effect() {
        rpc.emit('unmaximize');
      }
    });
  };
}
