import { CLOSE_TAB, CHANGE_TAB } from '../constants/tabs';
import { UI_TOGGLE_MAXIMIZE } from '../constants/ui';
import { userExitSession, setActiveSession } from './sessions';
import rpc from '../rpc';

export function closeTab (uid) {
  return (dispatch, getState) => {
    dispatch({
      type: CLOSE_TAB,
      uid,
      effect () {
        dispatch(userExitSession(uid));
      }
    });
  };
}

export function changeTab (uid) {
  return (dispatch, getState) => {
    dispatch({
      type: CHANGE_TAB,
      uid,
      effect () {
        dispatch(setActiveSession(uid));
      }
    });
  };
}

export function toggleMaximize () {
  return (dispatch, getState) => {
    dispatch({
      type: UI_TOGGLE_MAXIMIZE,
      effect () {
        rpc.emit('toggle-maximize');
      }
    });
  };
}
