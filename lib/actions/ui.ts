import {php_escapeshellcmd as escapeShellCmd} from 'php-escape-shell';
import {isExecutable} from '../utils/file';
import {getRootGroups} from '../selectors';
import findBySession from '../utils/term-groups';
import notify from '../utils/notify';
import rpc from '../rpc';
import {requestSession, sendSessionData, setActiveSession} from './sessions';
import {
  UI_FONT_SIZE_SET,
  UI_FONT_SIZE_INCR,
  UI_FONT_SIZE_DECR,
  UI_FONT_SIZE_RESET,
  UI_FONT_SMOOTHING_SET,
  UI_MOVE_LEFT,
  UI_MOVE_RIGHT,
  UI_MOVE_TO,
  UI_MOVE_NEXT_PANE,
  UI_MOVE_PREV_PANE,
  UI_WINDOW_GEOMETRY_CHANGED,
  UI_WINDOW_MOVE,
  UI_OPEN_FILE,
  UI_ENTER_FULLSCREEN,
  UI_LEAVE_FULLSCREEN,
  UI_OPEN_SSH_URL,
  UI_CONTEXTMENU_OPEN,
  UI_COMMAND_EXEC
} from '../constants/ui';

import {setActiveGroup} from './term-groups';
import parseUrl from 'parse-url';
import {HyperState, HyperDispatch, HyperActions} from '../hyper';
import {Stats} from 'fs';

const {stat} = window.require('fs');

export function openContextMenu(uid: string, selection: any) {
  return (dispatch: HyperDispatch, getState: () => HyperState) => {
    dispatch({
      type: UI_CONTEXTMENU_OPEN,
      uid,
      effect() {
        const state = getState();
        const show = !state.ui.quickEdit;
        if (show) {
          rpc.emit('open context menu', selection);
        }
      }
    });
  };
}

export function increaseFontSize() {
  return (dispatch: HyperDispatch, getState: () => HyperState) => {
    dispatch({
      type: UI_FONT_SIZE_INCR,
      effect() {
        const state = getState();
        const old = state.ui.fontSizeOverride || state.ui.fontSize;
        const value = old + 1;
        dispatch({
          type: UI_FONT_SIZE_SET,
          value
        });
      }
    });
  };
}

export function decreaseFontSize() {
  return (dispatch: HyperDispatch, getState: () => HyperState) => {
    dispatch({
      type: UI_FONT_SIZE_DECR,
      effect() {
        const state = getState();
        const old = state.ui.fontSizeOverride || state.ui.fontSize;
        // when the font-size is really small, below 5px, xterm starts showing up issues.
        const value = old > 5 ? old - 1 : old;
        dispatch({
          type: UI_FONT_SIZE_SET,
          value
        });
      }
    });
  };
}

export function resetFontSize(): HyperActions {
  return {
    type: UI_FONT_SIZE_RESET
  };
}

export function setFontSmoothing() {
  return (dispatch: HyperDispatch) => {
    setTimeout(() => {
      const devicePixelRatio = window.devicePixelRatio;
      const fontSmoothing = devicePixelRatio < 2 ? 'subpixel-antialiased' : 'antialiased';

      dispatch({
        type: UI_FONT_SMOOTHING_SET,
        fontSmoothing
      });
    }, 100);
  };
}

export function windowGeometryUpdated(): HyperActions {
  return {
    type: UI_WINDOW_GEOMETRY_CHANGED
  };
}

// Find all sessions that are below the given
// termGroup uid in the hierarchy:
const findChildSessions = (termGroups: HyperState['termGroups']['termGroups'], uid: string): string[] => {
  const group = termGroups[uid];
  if (group.sessionUid) {
    return [uid];
  }

  return group.children
    .asMutable()
    .reduce((total: string[], childUid: string) => total.concat(findChildSessions(termGroups, childUid)), []);
};

// Get the index of the next or previous group,
// depending on the movement direction:
const getNeighborIndex = (groups: string[], uid: string, type: string) => {
  if (type === UI_MOVE_NEXT_PANE) {
    return (groups.indexOf(uid) + 1) % groups.length;
  }

  return (groups.indexOf(uid) + groups.length - 1) % groups.length;
};

function moveToNeighborPane(type: typeof UI_MOVE_NEXT_PANE | typeof UI_MOVE_PREV_PANE) {
  return () => (dispatch: HyperDispatch, getState: () => HyperState) => {
    dispatch({
      type,
      effect() {
        const {sessions, termGroups} = getState();
        const {uid} = findBySession(termGroups, sessions.activeUid!)!;
        const childGroups = findChildSessions(termGroups.termGroups, termGroups.activeRootGroup!);
        if (childGroups.length === 1) {
          console.log('ignoring move for single group');
        } else {
          const index = getNeighborIndex(childGroups, uid!, type);
          const {sessionUid} = termGroups.termGroups[childGroups[index]];
          dispatch(setActiveSession(sessionUid!));
        }
      }
    } as HyperActions);
  };
}

export const moveToNextPane = moveToNeighborPane(UI_MOVE_NEXT_PANE);
export const moveToPreviousPane = moveToNeighborPane(UI_MOVE_PREV_PANE);

const getGroupUids = (state: HyperState) => {
  const rootGroups = getRootGroups(state);
  return rootGroups.map(({uid}) => uid);
};

export function moveLeft() {
  return (dispatch: HyperDispatch, getState: () => HyperState) => {
    dispatch({
      type: UI_MOVE_LEFT,
      effect() {
        const state = getState();
        const uid = state.termGroups.activeRootGroup!;
        const groupUids = getGroupUids(state);
        const index = groupUids.indexOf(uid);
        const next = groupUids[index - 1] || groupUids[groupUids.length - 1];
        if (!next || uid === next) {
          console.log('ignoring left move action');
        } else {
          dispatch(setActiveGroup(next));
        }
      }
    });
  };
}

export function moveRight() {
  return (dispatch: HyperDispatch, getState: () => HyperState) => {
    dispatch({
      type: UI_MOVE_RIGHT,
      effect() {
        const state = getState();
        const groupUids = getGroupUids(state);
        const uid = state.termGroups.activeRootGroup!;
        const index = groupUids.indexOf(uid);
        const next = groupUids[index + 1] || groupUids[0];
        if (!next || uid === next) {
          console.log('ignoring right move action');
        } else {
          dispatch(setActiveGroup(next));
        }
      }
    });
  };
}

export function moveTo(i: number | 'last') {
  return (dispatch: HyperDispatch, getState: () => HyperState) => {
    if (i === 'last') {
      // Finding last tab index
      const {termGroups} = getState().termGroups;
      i =
        Object.keys(termGroups)
          .map((uid) => termGroups[uid])
          .filter(({parentUid}) => !parentUid).length - 1;
    }
    dispatch({
      type: UI_MOVE_TO,
      index: i,
      effect() {
        const state = getState();
        const groupUids = getGroupUids(state);
        const uid = state.termGroups.activeRootGroup;
        if (uid === groupUids[i as number]) {
          console.log('ignoring same uid');
        } else if (groupUids[i as number]) {
          dispatch(setActiveGroup(groupUids[i as number]));
        } else {
          console.log('ignoring inexistent index', i);
        }
      }
    });
  };
}

export function windowMove(window: any) {
  return (dispatch: HyperDispatch) => {
    dispatch({
      type: UI_WINDOW_MOVE,
      window,
      effect() {
        dispatch(setFontSmoothing());
      }
    });
  };
}

export function windowGeometryChange() {
  return (dispatch: HyperDispatch) => {
    dispatch({
      type: UI_WINDOW_MOVE,
      effect() {
        dispatch(setFontSmoothing());
      }
    });
  };
}

export function openFile(path: string) {
  return (dispatch: HyperDispatch) => {
    dispatch({
      type: UI_OPEN_FILE,
      effect() {
        stat(path, (err: any, stats: Stats) => {
          if (err) {
            notify('Unable to open path', `"${path}" doesn't exist.`, {error: err});
          } else {
            let command = escapeShellCmd(path).replace(/ /g, '\\ ');
            if (stats.isDirectory()) {
              command = `cd ${command}\n`;
            } else if (stats.isFile() && isExecutable(stats)) {
              command += '\n';
            }
            rpc.once('session add', ({uid}) => {
              rpc.once('session data', () => {
                dispatch(sendSessionData(uid, command, null));
              });
            });
          }
          dispatch(requestSession());
        });
      }
    });
  };
}

export function enterFullScreen(): HyperActions {
  return {
    type: UI_ENTER_FULLSCREEN
  };
}

export function leaveFullScreen(): HyperActions {
  return {
    type: UI_LEAVE_FULLSCREEN
  };
}

export function openSSH(url: string) {
  return (dispatch: HyperDispatch) => {
    dispatch({
      type: UI_OPEN_SSH_URL,
      effect() {
        const parsedUrl = parseUrl(url, true);
        let command = parsedUrl.protocol + ' ' + (parsedUrl.user ? `${parsedUrl.user}@` : '') + parsedUrl.resource;

        if (parsedUrl.port) command += ' -p ' + parsedUrl.port;

        command += '\n';

        rpc.once('session add', ({uid}) => {
          rpc.once('session data', () => {
            dispatch(sendSessionData(uid, command, null));
          });
        });

        dispatch(requestSession());
      }
    });
  };
}

export function execCommand(command: string, fn: (e: any, dispatch: HyperDispatch) => void, e: any) {
  return (dispatch: HyperDispatch) =>
    dispatch({
      type: UI_COMMAND_EXEC,
      command,
      effect() {
        if (fn) {
          fn(e, dispatch);
        } else {
          rpc.emit('command', command);
        }
      }
    });
}
