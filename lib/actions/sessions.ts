import rpc from '../rpc';
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
  SESSION_SET_XTERM_TITLE,
  SESSION_SEARCH,
  SESSION_SEARCH_CLOSE
} from '../constants/sessions';
import {HyperState, session} from '../hyper';
import {Dispatch} from 'redux';

export function addSession({uid, shell, pid, cols, rows, splitDirection, activeUid}: session) {
  return (dispatch: Dispatch<any>, getState: () => HyperState) => {
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
      activeUid: activeUid ? activeUid : sessions.activeUid,
      now
    });
  };
}

export function requestSession() {
  return (dispatch: Dispatch<any>, getState: () => HyperState) => {
    dispatch({
      type: SESSION_REQUEST,
      effect: () => {
        const {ui} = getState();
        // the cols and rows from preview session maybe not accurate. so remove.
        const {/*cols, rows,*/ cwd} = ui;
        rpc.emit('new', {cwd});
      }
    });
  };
}

export function addSessionData(uid: string, data: any) {
  return (dispatch: Dispatch<any>) => {
    dispatch({
      type: SESSION_ADD_DATA,
      data,
      effect() {
        const now = Date.now();
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

function createExitAction(type: string) {
  return (uid: string) => (dispatch: Dispatch<any>, getState: () => HyperState) => {
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

export function setActiveSession(uid: string) {
  return (dispatch: Dispatch<any>) => {
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

export function setSessionXtermTitle(uid: string, title: string) {
  return {
    type: SESSION_SET_XTERM_TITLE,
    uid,
    title
  };
}

export function resizeSession(uid: string, cols: number, rows: number) {
  return (dispatch: Dispatch<any>, getState: () => HyperState) => {
    const {termGroups} = getState();
    const group = findBySession(termGroups, uid)!;
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

export function onSearch(uid?: string) {
  return (dispatch: Dispatch<any>, getState: () => HyperState) => {
    const targetUid = uid || getState().sessions.activeUid;
    dispatch({
      type: SESSION_SEARCH,
      uid: targetUid
    });
  };
}

export function closeSearch(uid?: string) {
  return (dispatch: Dispatch<any>, getState: () => HyperState) => {
    const targetUid = uid || getState().sessions.activeUid;
    dispatch({
      type: SESSION_SEARCH_CLOSE,
      uid: targetUid
    });
  };
}

export function sendSessionData(uid: string | null, data: any, escaped?: any) {
  return (dispatch: Dispatch<any>, getState: () => HyperState) => {
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
