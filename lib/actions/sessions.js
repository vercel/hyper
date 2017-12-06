import rpc from '../rpc';
import isUrl from '../utils/url-command';
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
  SESSION_SET_XTERM_TITLE,
  SESSION_FONT_SIZE_RESET,
  SESSION_FONT_SIZE_SET,
  SESSION_FONT_SIZE_INCR,
  SESSION_FONT_SIZE_DECR
} from '../constants/sessions';

export function addSession({uid, shell, pid, cols, rows, splitDirection}) {
  return (dispatch, getState) => {
    const {sessions} = getState();
    const now = Date.now();
    dispatch({
      type: SESSION_ADD,
      uid,
      shell,
      pid,
      cols,
      rows,
      splitDirection,
      activeUid: sessions.activeUid,
      now
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
  return (dispatch, getState) => {
    dispatch({
      type: SESSION_ADD_DATA,
      data,
      effect() {
        const session = getState().sessions.sessions[uid];
        const now = Date.now();
        if (session) {
          const enterKey = data.indexOf('\n') > 0;
          const url = enterKey ? isUrl(session.shell, data) : null;
          if (url) {
            return dispatch({
              type: SESSION_URL_SET,
              uid,
              url
            });
          }
        }
        dispatch({
          type: SESSION_PTY_DATA,
          uid,
          data,
          now
        });
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
    const now = Date.now();
    dispatch({
      type: SESSION_RESIZE,
      uid,
      cols,
      rows,
      isStandaloneTerm,
      now,
      effect() {
        rpc.emit('resize', {uid, cols, rows});
      }
    });
  };
}

export function sendSessionData(uid, data, escaped) {
  return (dispatch, getState) => {
    dispatch({
      type: SESSION_USER_DATA,
      data,
      effect() {
        // If no uid is passed, data is sent to the active session.
        const targetUid = uid || getState().sessions.activeUid;

        rpc.emit('data', {uid: targetUid, data, escaped});
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

export function resetSessionFontSize() {
  return (dispatch, getState) => {
    dispatch({
      type: SESSION_FONT_SIZE_RESET,
      effect() {
        const {sessions} = getState();
        const uid = sessions.activeUid;
        const value = 0;
        dispatch({
          type: SESSION_FONT_SIZE_SET,
          uid,
          value
        });
      }
    });
  };
}

export function increaseSessionFontSize() {
  return (dispatch, getState) => {
    dispatch({
      type: SESSION_FONT_SIZE_INCR,
      effect() {
        const {sessions} = getState();
        const uid = sessions.activeUid;
        const old = sessions.sessions[uid].fontSizeOverride;
        const value = old + 1;
        dispatch({
          type: SESSION_FONT_SIZE_SET,
          uid,
          value
        });
      }
    });
  };
}

export function decreaseSessionFontSize() {
  return (dispatch, getState) => {
    dispatch({
      type: SESSION_FONT_SIZE_DECR,
      effect() {
        const {sessions} = getState();
        const uid = sessions.activeUid;
        const old = sessions.sessions[uid].fontSizeOverride;
        const value = old - 1;
        dispatch({
          type: SESSION_FONT_SIZE_SET,
          uid,
          value
        });
      }
    });
  };
}
