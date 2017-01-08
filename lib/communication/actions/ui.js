const UI_FONT_SMOOTHING_SET = 'UI_FONT_SMOOTHING_SET';
const UI_FONT_SIZE_RESET = 'UI_FONT_SIZE_RESET';
const UI_FONT_SIZE_INCR = 'UI_FONT_SIZE_INCR';
const UI_FONT_SIZE_SET = 'UI_FONT_SIZE_SET';
const UI_FONT_SIZE_DECR = 'UI_FONT_SIZE_DECR';
const UI_WINDOW_MOVE = 'UI_WINDOW_MOVE';

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

export function resetFontSize() {
  return {
    type: UI_FONT_SIZE_RESET
  };
}

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
