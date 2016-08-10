import rpc from '../rpc';
import {
  DIRECTION,
  TERM_GROUP_REQUEST,
  TERM_GROUP_SPLIT
} from '../constants/term-groups';
import { SESSION_REQUEST } from '../constants/sessions';
import { setActiveSession } from './sessions';

function requestSplit (direction) {
  return (dispatch, getState) => {
    const { ui } = getState();
    dispatch({
      type: SESSION_REQUEST,
      effect: () => {
        rpc.emit('new', {
          splitDirection: direction,
          cwd: ui.cwd
        });
      }
    });
  };
}

export const requestVerticalSplit = () => requestSplit(DIRECTION.VERTICAL);
export const requestHorizontalSplit = () => requestSplit(DIRECTION.HORIZONTAL);

export function createSplit (uid, direction) {
  return (dispatch, getState) => {
    const { sessions } = getState();
    dispatch({
      type: TERM_GROUP_SPLIT,
      activeUid: sessions.activeUid,
      direction,
      uid
    });
  };
}

export function requestTermGroup () {
  return (dispatch, getState) => {
    const { ui } = getState();
    const { cols, rows, cwd } = ui;
    dispatch({
      type: TERM_GROUP_REQUEST,
      effect: () => {
        rpc.emit('new', {
          isNewGroup: true,
          cols,
          rows,
          cwd
        });
      }
    });
  };
}

export function setActiveGroup (uid) {
  return (dispatch, getState) => {
    const { termGroups } = getState();
    const group = termGroups.termGroups[uid];
    dispatch(setActiveSession(group.activeSessionUid));
  };
}
