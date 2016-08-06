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

export function addSession (uid, shell, pid) {
  return (dispatch, getState) => {
    dispatch({
      type: SESSION_ADD,
      uid,
      shell,
      pid
    });
  };
}

export function requestSession (uid) {
  return (dispatch, getState) => {
    const { ui } = getState();
    const { cols, rows, cwd } = ui;
    dispatch({
      type: SESSION_REQUEST,
      effect: () => {
        rpc.emit('new', { cols, rows, cwd });
      }
    });
  };
}

export function addSessionData (uid, data) {
  return function (dispatch, getState) {
    dispatch({
      type: SESSION_ADD_DATA,
      data,
      effect () {
        const { shell } = getState().sessions.sessions[uid];

        const enterKey = Boolean(data.match(/\n/));
        const url = enterKey ? getURL(shell, data) : null;

        if (url) {
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
  return function (dispatch, getState) {
    dispatch({
      type: SESSION_USER_DATA,
      data,
      effect () {
        // If no uid is passed, data is sended to the active session.
        const targetUid = uid || getState().sessions.activeUid;
        rpc.emit('data', { uid: targetUid, data });
      }
    });
  };
}

export function exitSessionBrowser (uid) {
  return {
    type: SESSION_URL_UNSET,
    uid
  };
}
