import rpc from '../rpc';
import getURL from '../utils/url-command';
import {keys} from '../utils/object';
import findBySession from '../utils/term-groups';
import {
  SESSION_ADD,
  SESSION_RESIZE,
  SESSION_REQUEST,
  SESSION_ADD_DATA,
  SESSION_PTY_DATA,
  SESSION_PTY_EXIT,
  SESSION_USER_EXIT,
  SESSION_SET_ACTIVE,
  SESSION_CLEAR_ACTIVE,
  SESSION_USER_DATA,
  SESSION_URL_SET,
  SESSION_URL_UNSET,
  SESSION_SET_XTERM_TITLE
} from '../constants/sessions';

export function addSession({uid, shell, pid, cols, rows, splitDirection}) {
  return (dispatch, getState) => {
    const {sessions} = getState();
    dispatch({
      type: SESSION_ADD,
      uid,
      shell,
      pid,
      cols,
      rows,
      splitDirection,
      activeUid: sessions.activeUid
    });
  };
}

export function requestSession() {
  return (dispatch, getState) => {
    const {ui} = getState();
    const {cols, rows, cwd} = ui;
    dispatch({
      type: SESSION_REQUEST,
      effect: () => {
        rpc.emit('new', {cols, rows, cwd});
      }
    });
  };
}

export function addSessionData(uid, data) {
  return function (dispatch, getState) {
    dispatch({
      type: SESSION_ADD_DATA,
      data,
      effect() {
        const {shell} = getState().sessions.sessions[uid];

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

function createExitAction(type) {
  return uid => (dispatch, getState) => {
    return dispatch({
      type,
      uid,
      effect() {
        if (type === SESSION_USER_EXIT) {
          rpc.emit('exit', {uid});
        }

        const sessions = keys(getState().sessions.sessions);
        if (sessions.length === 0) {
          window.close();
        }
      }
    });
  };
}

// we want to distinguish an exit
// that's UI initiated vs pty initiated
export const userExitSession = createExitAction(SESSION_USER_EXIT);
export const ptyExitSession = createExitAction(SESSION_PTY_EXIT);

export function setActiveSession(uid) {
  return dispatch => {
    dispatch({
      type: SESSION_SET_ACTIVE,
      uid
    });
  };
}

export function clearActiveSession() {
  return {
    type: SESSION_CLEAR_ACTIVE
  };
}

export function setSessionXtermTitle(uid, title) {
  return {
    type: SESSION_SET_XTERM_TITLE,
    uid,
    title
  };
}

export function resizeSession(uid, cols, rows) {
  return (dispatch, getState) => {
    const {termGroups} = getState();
    const group = findBySession(termGroups, uid);
    const isStandaloneTerm = !group.parentUid && !group.children.length;
    dispatch({
      type: SESSION_RESIZE,
      uid,
      cols,
      rows,
      isStandaloneTerm,
      effect() {
        rpc.emit('resize', {uid, cols, rows});
      }
    });
  };
}

export function sendSessionData(uid, data) {
  return function (dispatch, getState) {
    dispatch({
      type: SESSION_USER_DATA,
      data,
      effect() {
        // If no uid is passed, data is sent to the active session.
        const targetUid = uid || getState().sessions.activeUid;
        rpc.emit('data', {uid: targetUid, data});
      }
    });
  };
}

export function exitSessionBrowser(uid) {
  return {
    type: SESSION_URL_UNSET,
    uid
  };
}
