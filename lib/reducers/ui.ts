import {release} from 'os';

import Immutable from 'seamless-immutable';
import type {Immutable as ImmutableType} from 'seamless-immutable';

import {CONFIG_LOAD, CONFIG_RELOAD} from '../../typings/constants/config';
import {NOTIFICATION_MESSAGE, NOTIFICATION_DISMISS} from '../../typings/constants/notifications';
import {
  SESSION_ADD,
  SESSION_RESIZE,
  SESSION_PTY_DATA,
  SESSION_PTY_EXIT,
  SESSION_SET_ACTIVE,
  SESSION_SET_CWD
} from '../../typings/constants/sessions';
import {
  UI_FONT_SIZE_SET,
  UI_FONT_SIZE_RESET,
  UI_FONT_SMOOTHING_SET,
  UI_WINDOW_MAXIMIZE,
  UI_WINDOW_UNMAXIMIZE,
  UI_WINDOW_GEOMETRY_CHANGED,
  UI_ENTER_FULLSCREEN,
  UI_LEAVE_FULLSCREEN
} from '../../typings/constants/ui';
import {UPDATE_AVAILABLE} from '../../typings/constants/updater';
import type {uiState, Mutable, IUiReducer} from '../../typings/hyper';
import {decorateUIReducer} from '../utils/plugins';

const isWindows = ['Windows', 'Win16', 'Win32', 'WinCE'].includes(navigator.platform) || process.platform === 'win32';

const allowedCursorShapes = new Set(['BEAM', 'BLOCK', 'UNDERLINE']);
const allowedCursorBlinkValues = new Set([true, false]);
const allowedBells = new Set(['SOUND', 'false', false]);
const allowedHamburgerMenuValues = new Set([true, false, ''] as const);
const allowedWindowControlsValues = new Set([true, false, 'left']);

// Populate `config-default.js` from this :)
const initial: uiState = Immutable<Mutable<uiState>>({
  cols: null,
  rows: null,
  scrollback: 1000,
  activeUid: null,
  cursorColor: '#F81CE5',
  cursorAccentColor: '#000',
  cursorShape: 'BLOCK',
  cursorBlink: false,
  borderColor: '#333',
  selectionColor: 'rgba(248,28,229,0.3)',
  fontSize: 12,
  padding: '12px 14px',
  fontFamily: 'Menlo, "DejaVu Sans Mono", "Lucida Console", monospace',
  uiFontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  fontSizeOverride: null,
  fontSmoothingOverride: 'antialiased',
  fontWeight: 'normal',
  fontWeightBold: 'bold',
  imageSupport: true,
  lineHeight: 1,
  letterSpacing: 0,
  css: '',
  termCSS: '',
  openAt: {},
  resizeAt: 0,
  colors: {
    black: '#000000',
    red: '#C51E14',
    green: '#1DC121',
    yellow: '#C7C329',
    blue: '#0A2FC4',
    magenta: '#C839C5',
    cyan: '#20C5C6',
    white: '#C7C7C7',
    lightBlack: '#686868',
    lightRed: '#FD6F6B',
    lightGreen: '#67F86F',
    lightYellow: '#FFFA72',
    lightBlue: '#6A76FB',
    lightMagenta: '#FD7CFC',
    lightCyan: '#68FDFE',
    lightWhite: '#FFFFFF'
  },
  activityMarkers: {},
  notifications: {
    font: false,
    resize: false,
    updates: false,
    message: false
  },
  fullScreen: false,
  foregroundColor: '#fff',
  backgroundColor: '#000',
  maximized: false,
  updateVersion: null,
  updateNotes: null,
  updateReleaseUrl: null,
  updateCanInstall: null,
  _lastUpdate: null,
  messageText: null,
  messageURL: null,
  messageDismissable: null,
  bell: 'SOUND',
  bellSoundURL: null, // directly relates to the value in the configuration file
  bellSound: null, // A base64 encoded binary string representation of the audio data from the bellSoundURL
  copyOnSelect: false,
  modifierKeys: {
    altIsMeta: false,
    cmdIsMeta: false
  },
  showHamburgerMenu: '',
  showWindowControls: '',
  quickEdit: false,
  webGLRenderer: true,
  webLinksActivationKey: '',
  macOptionSelectionMode: 'vertical',
  disableLigatures: true,
  screenReaderMode: false,
  defaultProfile: '',
  profiles: []
});

const reducer: IUiReducer = (state = initial, action) => {
  let state_ = state;
  let isMax;
  switch (action.type) {
    case CONFIG_LOAD:
    case CONFIG_RELOAD: {
      const {config, now} = action;
      state_ = state
        // unset the user font size override if the
        // font size changed from the config
        .merge(
          (() => {
            const ret: Immutable.DeepPartial<Mutable<uiState>> = {};

            if (config.scrollback) {
              ret.scrollback = config.scrollback;
            }

            if (state.fontSizeOverride && config.fontSize !== state.fontSize) {
              ret.fontSizeOverride = null;
            }

            if (config.fontSize) {
              ret.fontSize = config.fontSize;
            }

            if (config.fontFamily) {
              ret.fontFamily = config.fontFamily;
            }

            if (config.uiFontFamily) {
              ret.uiFontFamily = config.uiFontFamily;
            }

            if (config.fontWeight) {
              ret.fontWeight = config.fontWeight;
            }

            if (config.fontWeightBold) {
              ret.fontWeightBold = config.fontWeightBold;
            }

            if (Number.isFinite(config.lineHeight)) {
              ret.lineHeight = config.lineHeight;
            }

            if (Number.isFinite(config.letterSpacing)) {
              ret.letterSpacing = config.letterSpacing;
            }

            if (config.uiFontFamily) {
              ret.uiFontFamily = config.uiFontFamily;
            }

            if (config.cursorColor) {
              ret.cursorColor = config.cursorColor;
            }

            if (config.cursorAccentColor) {
              ret.cursorAccentColor = config.cursorAccentColor;
            }

            if (allowedCursorShapes.has(config.cursorShape)) {
              ret.cursorShape = config.cursorShape;
            }

            if (allowedCursorBlinkValues.has(config.cursorBlink)) {
              ret.cursorBlink = config.cursorBlink;
            }

            if (config.borderColor) {
              ret.borderColor = config.borderColor;
            }

            if (config.selectionColor) {
              ret.selectionColor = config.selectionColor;
            }

            if (typeof config.padding !== 'undefined' && config.padding !== null) {
              ret.padding = config.padding;
            }

            if (config.foregroundColor) {
              ret.foregroundColor = config.foregroundColor;
            }

            if (config.backgroundColor) {
              ret.backgroundColor = config.backgroundColor;
            }

            if (config.css || config.css === '') {
              ret.css = config.css;
            }

            if (config.termCSS) {
              ret.termCSS = config.termCSS;
            }

            if (allowedBells.has(config.bell)) {
              ret.bell = (config.bell as any) === 'false' ? false : config.bell;
            }

            if (config.bellSoundURL !== state.bellSoundURL) {
              ret.bellSoundURL = config.bellSoundURL || initial.bellSoundURL;
            }

            if (config.bellSound !== state.bellSound) {
              ret.bellSound = config.bellSound || initial.bellSound;
            }

            if (typeof config.copyOnSelect !== 'undefined' && config.copyOnSelect !== null) {
              ret.copyOnSelect = config.copyOnSelect;
            }

            if (config.colors) {
              if (JSON.stringify(state.colors) !== JSON.stringify(config.colors)) {
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

            if (process.platform === 'win32' && (config.quickEdit === undefined || config.quickEdit === null)) {
              ret.quickEdit = true;
            } else if (typeof config.quickEdit !== 'undefined' && config.quickEdit !== null) {
              ret.quickEdit = config.quickEdit;
            }

            if (config.webGLRenderer !== undefined) {
              ret.webGLRenderer = config.webGLRenderer;
            }

            if (config.webLinksActivationKey !== undefined) {
              ret.webLinksActivationKey = config.webLinksActivationKey;
            }

            if (config.macOptionSelectionMode) {
              ret.macOptionSelectionMode = config.macOptionSelectionMode;
            }

            if (config.disableLigatures !== undefined) {
              ret.disableLigatures = config.disableLigatures;
            }

            if (config.screenReaderMode !== undefined) {
              ret.screenReaderMode = config.screenReaderMode;
            }

            const buildNumber = parseInt(release().split('.').at(-1) || '0', 10);
            if (isWindows && !Number.isNaN(buildNumber) && buildNumber > 0) {
              const useConpty = typeof config.useConpty === 'boolean' ? config.useConpty : buildNumber >= 18309;
              ret.windowsPty = {
                backend: useConpty ? 'conpty' : 'winpty',
                buildNumber
              };
            }

            if (config.imageSupport !== undefined) {
              ret.imageSupport = config.imageSupport;
            }

            if (config.defaultProfile !== undefined) {
              ret.defaultProfile = config.defaultProfile;
            }

            if (config.profiles !== undefined) {
              ret.profiles = config.profiles;
            }

            ret._lastUpdate = now;

            return ret;
          })()
        );
      break;
    }
    case SESSION_ADD:
      state_ = state.merge(
        {
          activeUid: action.uid,
          openAt: {
            [action.uid]: action.now
          }
        },
        {deep: true}
      );
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
        resizeAt: action.now
      });
      break;

    case SESSION_PTY_EXIT:
      state_ = state
        .updateIn(['openAt'], (times: ImmutableType<Record<string, number>>) => {
          const times_ = times.asMutable();
          delete times_[action.uid];
          return times_;
        })
        .updateIn(['activityMarkers'], (markers: ImmutableType<Record<string, boolean>>) => {
          const markers_ = markers.asMutable();
          delete markers_[action.uid];
          return markers_;
        });
      break;

    case SESSION_SET_ACTIVE:
      state_ = state.merge(
        {
          activeUid: action.uid,
          activityMarkers: {
            [action.uid]: false
          }
        },
        {deep: true}
      );
      break;

    case SESSION_PTY_DATA:
      // ignore activity markers for current tab
      if (action.uid === state.activeUid) {
        break;
      }

      // if first data events after open, ignore
      if (action.now - state.openAt[action.uid] < 1000) {
        break;
      }

      // ignore activity markers that are within
      // proximity of a resize event, since we
      // expect to get data packets from the resize
      // of the ptys as a result
      if (!state.resizeAt || action.now - state.resizeAt > 1000) {
        state_ = state.merge(
          {
            activityMarkers: {
              [action.uid]: true
            }
          },
          {deep: true}
        );
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

    case UI_WINDOW_GEOMETRY_CHANGED:
      isMax = action.isMaximized;
      if (state.maximized !== isMax) {
        state_ = state.set('maximized', isMax);
      }

      break;

    case NOTIFICATION_DISMISS:
      state_ = state.merge(
        {
          notifications: {
            [action.id]: false
          }
        },
        {deep: true}
      );
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
        updateNotes: action.notes || '',
        updateReleaseUrl: action.releaseUrl,
        updateCanInstall: !!action.canInstall
      });
      break;

    case UI_ENTER_FULLSCREEN:
      state_ = state.set('fullScreen', true);
      break;

    case UI_LEAVE_FULLSCREEN:
      state_ = state.set('fullScreen', false);
      break;
  }

  // Show a notification if any of the font size values have changed
  if (CONFIG_LOAD !== action.type) {
    if (state_.fontSize !== state.fontSize || state_.fontSizeOverride !== state.fontSizeOverride) {
      state_ = state_.merge({notifications: {font: true}}, {deep: true});
    }
  }

  if (state.cols !== null && state.rows !== null && (state.rows !== state_.rows || state.cols !== state_.cols)) {
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
