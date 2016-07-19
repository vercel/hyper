import Immutable from 'seamless-immutable';
import { decorateUIReducer } from '../utils/plugins';
import { CONFIG_LOAD, CONFIG_RELOAD } from '../constants/config';
import { UI_FONT_SIZE_SET, UI_FONT_SIZE_RESET } from '../constants/ui';
import { NOTIFICATION_DISMISS } from '../constants/notifications';
import {
  SESSION_ADD,
  SESSION_RESIZE,
  SESSION_PTY_DATA,
  SESSION_PTY_EXIT,
  SESSION_SET_ACTIVE,
  SESSION_SET_CWD
} from '../constants/sessions';
import { UPDATE_AVAILABLE } from '../constants/updater';

// TODO: populate `config-default.js` from this :)
const initial = Immutable({
  cols: null,
  rows: null,
  activeUid: null,
  cursorColor: '#F81CE5',
  borderColor: '#333',
  fontSize: 12,
  padding: '12px 14px',
  fontFamily: 'Menlo, "DejaVu Sans Mono", "Lucida Console", monospace',
  fontSizeOverride: null,
  css: '',
  termCSS: '',
  openAt: {},
  resizeAt: 0,
  colors: [
    '#000000',
    '#ff0000',
    '#33ff00',
    '#ffff00',
    '#0066ff',
    '#cc00ff',
    '#00ffff',
    '#d0d0d0',
    '#808080',
    '#ff0000',
    '#33ff00',
    '#ffff00',
    '#0066ff',
    '#cc00ff',
    '#00ffff',
    '#ffffff'
  ],
  activityMarkers: {},
  notifications: {
    font: false,
    resize: false,
    updates: false
  },
  foregroundColor: '#fff',
  backgroundColor: '#000',
  updateVersion: null,
  updateNotes: null
});

const reducer = (state = initial, action) => {
  let state_ = state;

  switch (action.type) {
    case CONFIG_LOAD:
    case CONFIG_RELOAD:
      const { config } = action;
      state_ = state
      // we unset the user font size override if the
      // font size changed from the config
      .merge((() => {
        const ret = {};

        if (state.fontSizeOverride && config.fontSize !== state.fontSize) {
          ret.fontSizeOverride = null;
        }

        if (null != config.fontSize) {
          ret.fontSize = config.fontSize;
        }

        if (null != config.fontFamily) {
          ret.fontFamily = config.fontFamily;
        }

        if (null != config.cursorColor) {
          ret.cursorColor = config.cursorColor;
        }

        if (null != config.borderColor) {
          ret.borderColor = config.borderColor;
        }

        if (null != config.padding) {
          ret.padding = config.padding;
        }

        if (null != config.foregroundColor) {
          ret.foregroundColor = config.foregroundColor;
        }

        if (null != config.backgroundColor) {
          ret.backgroundColor = config.backgroundColor;
        }

        if (null != config.css) {
          ret.css = config.css;
        }

        if (null != config.termCSS) {
          ret.termCSS = config.termCSS;
        }

        if (null != config.colors) {
          if (state.colors.toString() !== config.colors.toString()) {
            ret.colors = config.colors;
          }
        }

        return ret;
      })());
      break;

    case SESSION_ADD:
      state_ = state.merge({
        openAt: {
          [action.uid]: Date.now()
        }
      }, { deep: true });
      break;

    case SESSION_RESIZE:
      state_ = state.merge({
        rows: action.rows,
        cols: action.cols,
        resizeAt: Date.now()
      });
      break;

    case SESSION_PTY_EXIT:
      state_ = state
      .updateIn(['openAt'], (times) => {
        const times_ = times.asMutable();
        delete times_[action.uid];
        return times_;
      })
      .updateIn(['activityMarkers'], (markers) => {
        const markers_ = markers.asMutable();
        delete markers_[action.uid];
        return markers_;
      });
      break;

    case SESSION_SET_ACTIVE:
      state_ = state.merge({
        activeUid: action.uid,
        activityMarkers: {
          [action.uid]: false
        }
      }, { deep: true });
      break;

    case SESSION_PTY_DATA:
      // ignore activity markers for current tab
      if (action.uid === state.activeUid) break;

      // current time for comparisons
      let now = Date.now();

      // if first data events after open, ignore
      if (now - state.openAt[action.uid] < 1000) break;

      // we ignore activity markers that are within
      // proximity of a resize event, since we
      // expect to get data packets from the resize
      // of the ptys as a result
      if (!state.resizeAt || now - state.resizeAt > 1000) {
        state_ = state.merge({
          activityMarkers: {
            [action.uid]: true
          }
        }, { deep: true });
      }
      break;

    case SESSION_SET_CWD:
      state_ = state.set('cwd', action.cwd);
      break;

    case UI_FONT_SIZE_SET:
      state_ = state.set('fontSizeOverride', action.value);
      break;

    case UI_FONT_SIZE_RESET:
      state_ = state.set('fontSizeOverride', null);
      break;

    case NOTIFICATION_DISMISS:
      state_ = state.merge({
        notifications: {
          [action.id]: false
        }
      }, { deep: true });
      break;

    case UPDATE_AVAILABLE:
      state_ = state.merge({
        updateVersion: action.version,
        updateNotes: action.notes || ''
      });
      break;
  }

  // we check that if any of the font size values changed
  // we show a notification
  if (CONFIG_LOAD !== action.type) {
    if (state_.fontSize !== state.fontSize ||
        state_.fontSizeOverride !== state.fontSizeOverride) {
      state_ = state_.merge({ notifications: { font: true } }, { deep: true });
    }
  }

  if (null != state.cols && null != state.rows &&
     (state.rows !== state_.rows ||
      state.cols !== state_.cols)) {
    state_ = state_.merge({ notifications: { resize: true } }, { deep: true });
  }

  if (state.updateVersion !== state_.updateVersion) {
    state_ = state_.merge({ notifications: { updates: true } }, { deep: true });
  }

  return state_;
};

export default decorateUIReducer(reducer);
