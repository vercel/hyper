import * as shellEscape from 'php-escape-shell';
import { setActiveSession } from './sessions';
import { keys } from '../utils/object';
import { last } from '../utils/array';
import { isExecutable } from '../utils/file';
import notify from '../utils/notify';
import rpc from '../rpc';
import {
  requestSession,
  sendSessionData
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
  UI_SHOW_PREFERENCES,
  UI_WINDOW_MOVE,
  UI_OPEN_FILE
} from '../constants/ui';

const { stat } = window.require('fs');

export function increaseFontSize () {
  return (dispatch, getState) => {
    dispatch({
      type: UI_FONT_SIZE_INCR,
      effect () {
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

export function decreaseFontSize () {
  return (dispatch, getState) => {
    dispatch({
      type: UI_FONT_SIZE_DECR,
      effect () {
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

export function resetFontSize () {
  return {
    type: UI_FONT_SIZE_RESET
  };
}

export function setFontSmoothing () {
  return (dispatch) => {
    setTimeout(() => {
      const devicePixelRatio = window.devicePixelRatio;
      const fontSmoothing = devicePixelRatio < 2
        ? 'subpixel-antialiased'
        : 'antialiased';

      dispatch({
        type: UI_FONT_SMOOTHING_SET,
        fontSmoothing
      });
    }, 100);
  };
}

export function moveLeft () {
  return (dispatch, getState) => {
    dispatch({
      type: UI_MOVE_LEFT,
      effect () {
        const { sessions } = getState();
        const uid = sessions.activeUid;
        const sessionUids = keys(sessions.sessions);
        const index = sessionUids.indexOf(uid);
        const next = sessionUids[index - 1] || last(sessionUids);
        if (!next || uid === next) {
          console.log('ignoring left move action');
        } else {
          dispatch(setActiveSession(next));
        }
      }
    });
  };
}

export function moveRight () {
  return (dispatch, getState) => {
    dispatch({
      type: UI_MOVE_RIGHT,
      effect () {
        const { sessions } = getState();
        const uid = sessions.activeUid;
        const sessionUids = keys(sessions.sessions);
        const index = sessionUids.indexOf(uid);
        const next = sessionUids[index + 1] || sessionUids[0];
        if (!next || uid === next) {
          console.log('ignoring right move action');
        } else {
          dispatch(setActiveSession(next));
        }
      }
    });
  };
}

export function moveTo (i) {
  return (dispatch, getState) => {
    dispatch({
      type: UI_MOVE_TO,
      index: i,
      effect () {
        const { sessions } = getState();
        const uid = sessions.activeUid;
        const sessionUids = keys(sessions.sessions);
        if (uid === sessionUids[i]) {
          console.log('ignoring same uid');
        } else if (null != sessionUids[i]) {
          dispatch(setActiveSession(sessionUids[i]));
        } else {
          console.log('ignoring inexistent index', i);
        }
      }
    });
  };
}

export function showPreferences () {
  const editorFallback = process.platform === 'win32' ? 'notepad' : 'nano';
  return (dispatch, getState) => {
    dispatch({
      type: UI_SHOW_PREFERENCES,
      effect () {
        dispatch(requestSession());
        // TODO: replace this hack with an async action
        rpc.once('session add', ({ uid }) => {
          rpc.once('session data', () => {
            dispatch(sendSessionData(
              uid,
              // Leading space prevents command to be store in shell history
              [' echo Attempting to open ~/.hyperterm.js with your \$EDITOR', // eslint-disable-line no-useless-escape
               ' echo If it fails, open it manually with your favorite editor!',
               ' bash -c \'exec env ${EDITOR:=' + editorFallback + '} ~/.hyperterm.js\'',
               ''
              ].join('\n')
            ));
          });
        });
      }
    });
  };
}

export function windowMove () {
  return (dispatch) => {
    dispatch({
      type: UI_WINDOW_MOVE,
      effect () {
        dispatch(setFontSmoothing());
      }
    });
  };
}

export function openFile (path) {
  return (dispatch, getState) => {
    dispatch({
      type: UI_OPEN_FILE,
      effect () {
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
            rpc.once('session add', ({ uid }) => {
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
