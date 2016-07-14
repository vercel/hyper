import rpc from '../rpc';
import getURL from '../utils/url-command';
import { keys } from '../utils/object';
import {
  SESSION_ADD,
  SESSION_RESIZE,
  SESSION_REQUEST,
  SESSION_ADD_DATA,
  SESSION_PTY_DATA,
  SESSION_PTY_EXIT,
  SESSION_USER_EXIT,
  SESSION_USER_EXIT_ACTIVE,
  SESSION_SET_ACTIVE,
  SESSION_CLEAR_ACTIVE,
  SESSION_USER_DATA,
  SESSION_URL_SET,
  SESSION_URL_UNSET,
  SESSION_SET_XTERM_TITLE,
  SESSION_SET_PROCESS_TITLE
} from '../constants/sessions';

export function addSession (uid) {
  return (dispatch, getState) => {
    const { sessions } = getState();

    // normally this would be encoded as an effect
    // but the `SESSION_ADD` action is pretty expensive
    // and we want to get this out as soon as possible
    const initial = null == sessions.activeUid;
    if (initial) rpc.emit('init');

    dispatch({
      type: SESSION_ADD,
      uid
    });
  };
}

export function requestSession (uid) {
  return (dispatch, getState) => {
    const { ui } = getState();
    const cols = ui.cols;
    const rows = ui.rows;
    dispatch({
      type: SESSION_REQUEST,
      effect: () => {
        rpc.emit('new', { cols, rows });
      }
    });
  };
}

export function addSessionData (uid, data) {
  return (dispatch, getState) => {
    dispatch({
      type: SESSION_ADD_DATA,
      data,
      effect () {
        const url = getURL(data);
        if (null != url) {
          dispatch({
            type: SESSION_URL_SET,
            uid,
            url
          });
        } else {
          dispatch({
            type: SESSION_PTY_DATA,
            uid,
            data
          });
        }
      }
    });
  };
}

export function sessionExit (uid) {
  return (dispatch, getState) => {
    return dispatch({
      type: SESSION_PTY_EXIT,
      uid,
      effect () {
        // we reiterate the same logic as below
        // for SESSION_USER_EXIT since the exit
        // could happen pty side or optimistic
        const sessions = keys(getState().sessions.sessions);
        if (!sessions.length) {
          window.close();
        }
      }
    });
  };
}

// we want to distinguish an exit
// that's UI initiated vs pty initiated
export function userExitSession (uid) {
  return (dispatch, getState) => {
    return dispatch({
      type: SESSION_USER_EXIT,
      uid,
      effect () {
        rpc.emit('exit', { uid });
        const sessions = keys(getState().sessions.sessions);
        if (!sessions.length) {
          window.close();
        }
      }
    });
  };
}

export function userExitActiveSession () {
  return (dispatch, getState) => {
    dispatch({
      type: SESSION_USER_EXIT_ACTIVE,
      effect () {
        const uid = getState().sessions.activeUid;
        dispatch(userExitSession(uid));
      }
    });
  };
}

export function setActiveSession (uid) {
  return (dispatch, getState) => {
    const state = getState();
    const prevUid = state.sessions.activeUid;
    dispatch({
      type: SESSION_SET_ACTIVE,
      uid,
      effect () {
        // TODO: this goes away when we are able to poll
        // for the title ourseleves, instead of relying
        // on Session and focus/blur to subscribe
        if (prevUid) rpc.emit('blur', { uid: prevUid });
        rpc.emit('focus', { uid });
      }
    });
  };
}

export function clearActiveSession () {
  return {
    type: SESSION_CLEAR_ACTIVE
  };
}

export function setSessionProcessTitle (uid, title) {
  return {
    type: SESSION_SET_PROCESS_TITLE,
    uid,
    title
  };
}

export function setSessionXtermTitle (uid, title) {
  return {
    type: SESSION_SET_XTERM_TITLE,
    uid,
    title
  };
}

export function resizeSession (uid, cols, rows) {
  return {
    type: SESSION_RESIZE,
    cols,
    rows,
    effect () {
      rpc.emit('resize', { cols, rows });
    }
  };
}

export function sendSessionData (uid, data) {
  return {
    type: SESSION_USER_DATA,
    data,
    effect () {
      rpc.emit('data', { uid, data });
    }
  };
}

export function exitSessionBrowser (uid) {
  return {
    type: SESSION_URL_UNSET,
    uid
  };
}
