import {SESSION_REQUEST} from '../../typings/constants/sessions';
import {
  DIRECTION,
  TERM_GROUP_RESIZE,
  TERM_GROUP_REQUEST,
  TERM_GROUP_EXIT,
  TERM_GROUP_EXIT_ACTIVE
} from '../../typings/constants/term-groups';
import type {ITermState, ITermGroup, HyperState, HyperDispatch, HyperActions} from '../../typings/hyper';
import rpc from '../rpc';
import {getRootGroups} from '../selectors';
import findBySession from '../utils/term-groups';

import {setActiveSession, ptyExitSession, userExitSession} from './sessions';

function requestSplit(direction: 'VERTICAL' | 'HORIZONTAL') {
  return (_activeUid: string | undefined, _profile: string | undefined) =>
    (dispatch: HyperDispatch, getState: () => HyperState): void => {
      dispatch({
        type: SESSION_REQUEST,
        effect: () => {
          const {ui, sessions} = getState();
          const activeUid = _activeUid ? _activeUid : sessions.activeUid;
          const profile = _profile ? _profile : activeUid ? sessions.sessions[activeUid].profile : window.profileName;
          rpc.emit('new', {
            splitDirection: direction,
            cwd: ui.cwd,
            activeUid,
            profile
          });
        }
      });
    };
}

export const requestVerticalSplit = requestSplit(DIRECTION.VERTICAL);
export const requestHorizontalSplit = requestSplit(DIRECTION.HORIZONTAL);

export function resizeTermGroup(uid: string, sizes: number[]): HyperActions {
  return {
    uid,
    type: TERM_GROUP_RESIZE,
    sizes
  };
}

export function requestTermGroup(_activeUid: string | undefined, _profile: string | undefined) {
  return (dispatch: HyperDispatch, getState: () => HyperState) => {
    dispatch({
      type: TERM_GROUP_REQUEST,
      effect: () => {
        const {ui, sessions} = getState();
        const {cwd} = ui;
        const activeUid = _activeUid ? _activeUid : sessions.activeUid;
        const profile = _profile ? _profile : activeUid ? sessions.sessions[activeUid].profile : window.profileName;
        rpc.emit('new', {
          isNewGroup: true,
          cwd,
          activeUid,
          profile
        });
      }
    });
  };
}

export function setActiveGroup(uid: string) {
  return (dispatch: HyperDispatch, getState: () => HyperState) => {
    const {termGroups} = getState();
    dispatch(setActiveSession(termGroups.activeSessions[uid]));
  };
}

// When we've found the next group which we want to
// set as active (after closing something), we also need
// to find the first child group which has a sessionUid.
const findFirstSession = (state: ITermState, group: ITermGroup): string | undefined => {
  if (group.sessionUid) {
    return group.sessionUid;
  }

  for (const childUid of group.children.asMutable()) {
    const child = state.termGroups[childUid];
    // We want to find the *leftmost* session,
    // even if it's nested deep down:
    const sessionUid = findFirstSession(state, child);
    if (sessionUid) {
      return sessionUid;
    }
  }
};

const findPrevious = <T>(list: T[], old: T) => {
  const index = list.indexOf(old);
  // If `old` was the first item in the list,
  // choose the other item available:
  return index ? list[index - 1] : list[1];
};

const findNextSessionUid = (state: ITermState, group: ITermGroup) => {
  // If we're closing a root group (i.e. a whole tab),
  // the next group needs to be a root group as well:
  if (state.activeRootGroup === group.uid) {
    const rootGroups = getRootGroups({termGroups: state});
    const nextGroup = findPrevious(rootGroups, group);
    return findFirstSession(state, nextGroup);
  }

  const {children} = state.termGroups[group.parentUid!];
  const nextUid = findPrevious(children.asMutable(), group.uid);
  return findFirstSession(state, state.termGroups[nextUid]);
};

export function ptyExitTermGroup(sessionUid: string) {
  return (dispatch: HyperDispatch, getState: () => HyperState) => {
    const {termGroups} = getState();
    const group = findBySession(termGroups, sessionUid);
    // This might have already been closed:
    if (!group) {
      return dispatch(ptyExitSession(sessionUid));
    }

    dispatch({
      type: TERM_GROUP_EXIT,
      uid: group.uid,
      effect: () => {
        const activeSessionUid = termGroups.activeSessions[termGroups.activeRootGroup!];
        if (Object.keys(termGroups.termGroups).length > 1 && activeSessionUid === sessionUid) {
          const nextSessionUid = findNextSessionUid(termGroups, group);
          dispatch(setActiveSession(nextSessionUid!));
        }

        dispatch(ptyExitSession(sessionUid));
      }
    });
  };
}

export function userExitTermGroup(uid: string) {
  return (dispatch: HyperDispatch, getState: () => HyperState) => {
    const {termGroups} = getState();
    dispatch({
      type: TERM_GROUP_EXIT,
      uid,
      effect: () => {
        const group = termGroups.termGroups[uid];
        if (Object.keys(termGroups.termGroups).length <= 1) {
          // No need to attempt finding a new active session
          // if this is the last one we've got:
          return dispatch(userExitSession(group.sessionUid!));
        }

        const activeSessionUid = termGroups.activeSessions[termGroups.activeRootGroup!];
        if (termGroups.activeRootGroup === uid || activeSessionUid === group.sessionUid) {
          const nextSessionUid = findNextSessionUid(termGroups, group);
          dispatch(setActiveSession(nextSessionUid!));
        }

        if (group.sessionUid) {
          dispatch(userExitSession(group.sessionUid));
        } else {
          group.children.forEach((childUid) => {
            dispatch(userExitTermGroup(childUid));
          });
        }
      }
    });
  };
}

export function exitActiveTermGroup() {
  return (dispatch: HyperDispatch, getState: () => HyperState) => {
    dispatch({
      type: TERM_GROUP_EXIT_ACTIVE,
      effect() {
        const {sessions, termGroups} = getState();
        const {uid} = findBySession(termGroups, sessions.activeUid!)!;
        dispatch(userExitTermGroup(uid));
      }
    });
  };
}
