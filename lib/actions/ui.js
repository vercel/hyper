import * as shellEscape from 'php-escape-shell';
import last from '../utils/array';
import isExecutable from '../utils/file';
import getRootGroups from '../selectors';
import findBySession from '../utils/term-groups';
import notify from '../utils/notify';
import rpc from '../rpc';
import {
  requestSession,
  sendSessionData,
  setActiveSession
} from '../actions/sessions';
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
  UI_SHOW_PREFERENCES,
  UI_WINDOW_MOVE,
  UI_OPEN_FILE
} from '../constants/ui';

import {setActiveGroup} from './term-groups';

const {stat} = window.require('fs');

export function increaseFontSize() {
  return (dispatch, getState) => {
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
  return (dispatch, getState) => {
    dispatch({
      type: UI_FONT_SIZE_DECR,
      effect() {
        const state = getState();
        const old = state.ui.fontSizeOverride || state.ui.fontSize;
        const value = old - 1;
        dispatch({
          type: UI_FONT_SIZE_SET,
          value
        });
      }
    });
  };
}

export function resetFontSize() {
  return {
    type: UI_FONT_SIZE_RESET
  };
}

export function setFontSmoothing() {
  return dispatch => {
    setTimeout(() => {
      const devicePixelRatio = window.devicePixelRatio;
      const fontSmoothing = devicePixelRatio < 2 ?
        'subpixel-antialiased' :
        'antialiased';

      dispatch({
        type: UI_FONT_SMOOTHING_SET,
        fontSmoothing
      });
    }, 100);
  };
}

// Find all sessions that are below the given
// termGroup uid in the hierarchy:
const findChildSessions = (termGroups, uid) => {
  const group = termGroups[uid];
  if (group.sessionUid) {
    return [uid];
  }

  return group
    .children
    .reduce((total, childUid) => total.concat(
      findChildSessions(termGroups, childUid)
    ), []);
};

// Get the index of the next or previous group,
// depending on the movement direction:
const getNeighborIndex = (groups, uid, type) => {
  if (type === UI_MOVE_NEXT_PANE) {
    return (groups.indexOf(uid) + 1) % groups.length;
  }

  return (groups.indexOf(uid) + groups.length - 1) % groups.length;
};

function moveToNeighborPane(type) {
  return () => (dispatch, getState) => {
    dispatch({
      type,
      effect() {
        const {sessions, termGroups} = getState();
        const {uid} = findBySession(termGroups, sessions.activeUid);
        const childGroups = findChildSessions(termGroups.termGroups, termGroups.activeRootGroup);
        if (childGroups.length === 1) {
          console.log('ignoring move for single group');
        } else {
          const index = getNeighborIndex(childGroups, uid, type);
          const {sessionUid} = termGroups.termGroups[childGroups[index]];
          dispatch(setActiveSession(sessionUid));
        }
      }
    });
  };
}

export const moveToNextPane = moveToNeighborPane(UI_MOVE_NEXT_PANE);
export const moveToPreviousPane = moveToNeighborPane(UI_MOVE_PREV_PANE);

const getGroupUids = state => {
  const rootGroups = getRootGroups(state);
  return rootGroups.map(({uid}) => uid);
};

export function moveLeft() {
  return (dispatch, getState) => {
    dispatch({
      type: UI_MOVE_LEFT,
      effect() {
        const state = getState();
        const uid = state.termGroups.activeRootGroup;
        const groupUids = getGroupUids(state);
        const index = groupUids.indexOf(uid);
        const next = groupUids[index - 1] || last(groupUids);
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
  return (dispatch, getState) => {
    dispatch({
      type: UI_MOVE_RIGHT,
      effect() {
        const state = getState();
        const groupUids = getGroupUids(state);
        const uid = state.termGroups.activeRootGroup;
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

export function moveTo(i) {
  return (dispatch, getState) => {
    dispatch({
      type: UI_MOVE_TO,
      index: i,
      effect() {
        const state = getState();
        const groupUids = getGroupUids(state);
        const uid = state.termGroups.activeRootGroup;
        if (uid === groupUids[i]) {
          console.log('ignoring same uid');
        } else if (groupUids[i]) {
          dispatch(setActiveGroup(groupUids[i]));
        } else {
          console.log('ignoring inexistent index', i);
        }
      }
    });
  };
}

export function showPreferences() {
  // eslint-disable-next-line no-template-curly-in-string
  const command = process.platform === 'win32' ? ' start notepad "%userprofile%\\.hyper.js"' : ' bash -c \'exec env ${EDITOR:=nano} ~/.hyper.js\'';
  const message = process.platform === 'win32' ?
    ' echo Attempting to open ^%userprofile^%\\.hyper.js with notepad' :
    ' echo Attempting to open ~/.hyper.js with your \\$EDITOR';

  return dispatch => {
    dispatch({
      type: UI_SHOW_PREFERENCES,
      effect() {
        dispatch(requestSession());
        // Replace this hack with an async action
        rpc.once('session add', ({uid}) => {
          rpc.once('session data', () => {
            dispatch(sendSessionData(
              uid,
              [ // Leading space prevents command to be stored in shell history
                ' echo Attempting to open ~/.hyper.js with your \$EDITOR', // eslint-disable-line no-useless-escape
                message,
                command,
                ''
              ].join('\n\r')
            ));
          });
        });
      }
    });
  };
}

export function windowMove() {
  return dispatch => {
    dispatch({
      type: UI_WINDOW_MOVE,
      effect() {
        dispatch(setFontSmoothing());
      }
    });
  };
}

export function openFile(path) {
  return dispatch => {
    dispatch({
      type: UI_OPEN_FILE,
      effect() {
        stat(path, (err, stats) => {
          if (err) {
            console.error(err.stack);
            notify('Unable to open path', `"${path}" doesn't exist.`);
          } else {
            // We need to use 'php-escape-shell' property this way
            // until this eslint issue will be fixed:
            // https://github.com/eslint/eslint/issues/6755
            let command = shellEscape.php_escapeshellcmd(path).replace(/ /g, '\\ ');
            if (stats.isDirectory()) {
              command = `cd ${command}\n`;
            } else if (stats.isFile() && isExecutable(stats)) {
              command += '\n';
            }
            rpc.once('session add', ({uid}) => {
              rpc.once('session data', () => {
                dispatch(sendSessionData(uid, command));
              });
            });
          }
          dispatch(requestSession());
        });
      }
    });
  };
}
