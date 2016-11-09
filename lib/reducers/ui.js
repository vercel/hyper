import Immutable from 'seamless-immutable';
import {decorateUIReducer} from '../utils/plugins';
import {CONFIG_LOAD, CONFIG_RELOAD} from '../constants/config';
import {
  UI_FONT_SIZE_SET,
  UI_FONT_SIZE_RESET,
  UI_FONT_SMOOTHING_SET,
  UI_WINDOW_MAXIMIZE,
  UI_WINDOW_UNMAXIMIZE
} from '../constants/ui';
import {NOTIFICATION_MESSAGE, NOTIFICATION_DISMISS} from '../constants/notifications';
import {
  SESSION_ADD,
  SESSION_RESIZE,
  SESSION_PTY_DATA,
  SESSION_PTY_EXIT,
  SESSION_SET_ACTIVE,
  SESSION_SET_CWD
} from '../constants/sessions';
import {UPDATE_AVAILABLE} from '../constants/updater';
import {values} from '../utils/object';

const allowedCursorShapes = new Set(['BEAM', 'BLOCK', 'UNDERLINE']);
const allowedBells = new Set(['SOUND', false]);
const allowedHamburgerMenuValues = new Set([true, false]);
const allowedWindowControlsValues = new Set([true, false, 'left']);

// Populate `config-default.js` from this :)
const initial = Immutable({
  cols: null,
  rows: null,
  activeUid: null,
  cursorColor: '#F81CE5',
  cursorShape: 'BLOCK',
  borderColor: '#333',
  fontSize: 12,
  padding: '12px 14px',
  fontFamily: 'Menlo, "DejaVu Sans Mono", "Lucida Console", monospace',
  fontSizeOverride: null,
  fontSmoothingOverride: 'antialiased',
  css: '',
  termCSS: '',
  openAt: {},
  resizeAt: 0,
  colors: {
    black: '#000000',
    red: '#ff0000',
    green: '#33ff00',
    yellow: '#ffff00',
    blue: '#0066ff',
    magenta: '#cc00ff',
    cyan: '#00ffff',
    white: '#d0d0d0',
    lightBlack: '#808080',
    lightRed: '#ff0000',
    lightGreen: '#33ff00',
    lightYellow: '#ffff00',
    lightBlue: '#0066ff',
    lightMagenta: '#cc00ff',
    lightCyan: '#00ffff',
    lightWhite: '#ffffff'
  },
  activityMarkers: {},
  notifications: {
    font: false,
    resize: false,
    updates: false,
    message: false
  },
  foregroundColor: '#fff',
  backgroundColor: '#000',
  maximized: false,
  updateVersion: null,
  updateNotes: null,
  messageText: null,
  messageURL: null,
  messageDismissable: null,
  bell: 'SOUND',
  bellSoundURL: 'lib-resource:hterm/audio/bell',
  copyOnSelect: false,
  modifierKeys: {
    altIsMeta: false,
    cmdIsMeta: false
  },
  showHamburgerMenu: '',
  showWindowControls: ''
});

const reducer = (state = initial, action) => {
  let state_ = state;

  switch (action.type) { // eslint-disable-line default-case
    case CONFIG_LOAD:
    case CONFIG_RELOAD: // eslint-disable-line no-case-declarations
      const {config} = action;
      state_ = state
        // unset the user font size override if the
        // font size changed from the config
        .merge((() => {
          const ret = {};

          if (state.fontSizeOverride && config.fontSize !== state.fontSize) {
            ret.fontSizeOverride = null;
          }

          if (config.fontSize) {
            ret.fontSize = config.fontSize;
          }

          if (config.fontFamily) {
            ret.fontFamily = config.fontFamily;
          }

          if (config.cursorColor) {
            ret.cursorColor = config.cursorColor;
          }

          if (allowedCursorShapes.has(config.cursorShape)) {
            ret.cursorShape = config.cursorShape;
          }

          if (config.borderColor) {
            ret.borderColor = config.borderColor;
          }

          if (typeof (config.padding) !== 'undefined' &&
            config.padding !== null) {
            ret.padding = config.padding;
          }

          if (config.foregroundColor) {
            ret.foregroundColor = config.foregroundColor;
          }

          if (config.backgroundColor) {
            ret.backgroundColor = config.backgroundColor;
          }

          if (config.css) {
            ret.css = config.css;
          }

          if (config.termCSS) {
            ret.termCSS = config.termCSS;
          }

          if (allowedBells.has(config.bell)) {
            ret.bell = config.bell;
          }

          if (config.bellSoundURL) {
            ret.bellSoundURL = config.bellSoundURL || initial.bellSoundURL;
          }

          if (typeof (config.copyOnSelect) !== 'undefined' &&
            config.copyOnSelect !== null) {
            ret.copyOnSelect = config.copyOnSelect;
          }

          if (config.colors) {
            if (Array.isArray(config.colors)) {
              const stateColors = Array.isArray(state.colors) ?
                state.colors :
                values(state.colors);

              if (stateColors.toString() !== config.colors.toString()) {
                ret.colors = config.colors;
              }
            } else if (JSON.stringify(state.colors) !== JSON.stringify(config.colors)) {
              ret.colors = config.colors;
            }
          }

          if (config.modifierKeys) {
            ret.modifierKeys = config.modifierKeys;
          }

          if (allowedHamburgerMenuValues.has(config.showHamburgerMenu)) {
            ret.showHamburgerMenu = config.showHamburgerMenu;
          }

          if (allowedWindowControlsValues.has(config.showWindowControls)) {
            ret.showWindowControls = config.showWindowControls;
          }

          return ret;
        })());
      break;

    case SESSION_ADD:
      state_ = state.merge({
        activeUid: action.uid,
        openAt: {
          [action.uid]: Date.now()
        }
      }, {deep: true});
      break;

    case SESSION_RESIZE:
      // only care about the sizes
      // of standalone terms (i.e. not splits):
      if (!action.isStandaloneTerm) {
        break;
      }

      state_ = state.merge({
        rows: action.rows,
        cols: action.cols,
        resizeAt: Date.now()
      });
      break;

    case SESSION_PTY_EXIT:
      state_ = state
        .updateIn(['openAt'], times => {
          const times_ = times.asMutable();
          delete times_[action.uid];
          return times_;
        })
        .updateIn(['activityMarkers'], markers => {
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
      }, {deep: true});
      break;

    case SESSION_PTY_DATA: // eslint-disable-line no-case-declarations
      // ignore activity markers for current tab
      if (action.uid === state.activeUid) {
        break;
      }

      // current time for comparisons
      const now = Date.now();

      // if first data events after open, ignore
      if (now - state.openAt[action.uid] < 1000) {
        break;
      }

      // ignore activity markers that are within
      // proximity of a resize event, since we
      // expect to get data packets from the resize
      // of the ptys as a result
      if (!state.resizeAt || now - state.resizeAt > 1000) {
        state_ = state.merge({
          activityMarkers: {
            [action.uid]: true
          }
        }, {deep: true});
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

    case UI_FONT_SMOOTHING_SET:
      state_ = state.set('fontSmoothingOverride', action.fontSmoothing);
      break;

    case UI_WINDOW_MAXIMIZE:
      state_ = state.set('maximized', true);
      break;

    case UI_WINDOW_UNMAXIMIZE:
      state_ = state.set('maximized', false);
      break;

    case NOTIFICATION_DISMISS:
      state_ = state.merge({
        notifications: {
          [action.id]: false
        }
      }, {deep: true});
      break;

    case NOTIFICATION_MESSAGE:
      state_ = state.merge({
        messageText: action.text,
        messageURL: action.url,
        messageDismissable: action.dismissable === true
      });
      break;

    case UPDATE_AVAILABLE:
      state_ = state.merge({
        updateVersion: action.version,
        updateNotes: action.notes || ''
      });
      break;
  }

  // Show a notification if any of the font size values have changed
  if (CONFIG_LOAD !== action.type) {
    if (state_.fontSize !== state.fontSize ||
        state_.fontSizeOverride !== state.fontSizeOverride) {
      state_ = state_.merge({notifications: {font: true}}, {deep: true});
    }
  }

  if ((typeof (state.cols) !== 'undefined' && state.cols !== null) &&
    (typeof (state.rows) !== 'undefined' && state.rows !== null) &&
    (state.rows !== state_.rows || state.cols !== state_.cols)) {
    state_ = state_.merge({notifications: {resize: true}}, {deep: true});
  }

  if (state.messageText !== state_.messageText || state.messageURL !== state_.messageURL) {
    state_ = state_.merge({notifications: {message: true}}, {deep: true});
  }

  if (state.updateVersion !== state_.updateVersion) {
    state_ = state_.merge({notifications: {updates: true}}, {deep: true});
  }

  return state_;
};

export default decorateUIReducer(reducer);
