import { setActiveSession } from './sessions';
import { keys } from '../utils/object';
import { last } from '../utils/array';
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
  UI_WINDOW_MOVE
} from '../constants/ui';

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
  const devicePixelRatio = window.devicePixelRatio;
  const fontSmoothing = devicePixelRatio < 2
    ? 'subpixel-antialiased'
    : 'antialiased';

  return {
    type: UI_FONT_SMOOTHING_SET,
    fontSmoothing
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
              ['echo Attempting to open ~/.hyperterm.js with your \$EDITOR',
               'echo If it fails, open it manually with your favorite editor!',
               'exec env $EDITOR ~/.hyperterm.js',
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
