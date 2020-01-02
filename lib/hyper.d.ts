import {Immutable} from 'seamless-immutable';

declare global {
  interface Window {
    __rpcId: string;
    rpc: any;
    focusActiveTerm: any;
  }
}

export type ITermGroup = {
  uid: string;
  sessionUid: string | null;
  parentUid: string | null;
  direction: string | null;
  sizes: number[] | null;
  children: string[];
};

export type ITermGroups = Record<string, ITermGroup>;

export type ITermState = {
  termGroups: ITermGroups;
  activeSessions: Record<string, string>;
  activeRootGroup: string | null;
};

export type uiState = {
  _lastUpdate: number | null;
  activeUid: string | null;
  activityMarkers: Record<string, boolean>;
  backgroundColor: string;
  bell: string;
  bellSoundURL: string | null;
  bellSound: string | null;
  borderColor: string;
  colors: {
    black: string;
    blue: string;
    cyan: string;
    green: string;
    lightBlack: string;
    lightBlue: string;
    lightCyan: string;
    lightGreen: string;
    lightMagenta: string;
    lightRed: string;
    lightWhite: string;
    lightYellow: string;
    magenta: string;
    red: string;
    white: string;
    yellow: string;
  };
  cols: number | null;
  copyOnSelect: boolean;
  css: string;
  cursorAccentColor: string;
  cursorBlink: boolean;
  cursorColor: string;
  cursorShape: string;
  cwd?: string;
  disableLigatures: boolean;
  fontFamily: string;
  fontSize: number;
  fontSizeOverride: null | number;
  fontSmoothingOverride: string;
  fontWeight: string;
  fontWeightBold: string;
  foregroundColor: string;
  fullScreen: boolean;
  letterSpacing: number;
  lineHeight: number;
  macOptionSelectionMode: string;
  maximized: boolean;
  messageDismissable: null | boolean;
  messageText: string | null;
  messageURL: string | null;
  modifierKeys: {
    altIsMeta: boolean;
    cmdIsMeta: boolean;
  };
  notifications: {
    font: boolean;
    message: boolean;
    resize: boolean;
    updates: boolean;
  };
  openAt: Record<string, number>;
  padding: string;
  quickEdit: boolean;
  resizeAt: number;
  rows: number | null;
  scrollback: number;
  selectionColor: string;
  showHamburgerMenu: string;
  showWindowControls: string;
  termCSS: string;
  uiFontFamily: string;
  updateCanInstall: null | boolean;
  updateNotes: string | null;
  updateReleaseUrl: string | null;
  updateVersion: string | null;
  webGLRenderer: boolean;
};

export type session = {
  cleared: boolean;
  cols: number | null;
  pid: number | null;
  resizeAt?: number;
  rows: number | null;
  search: boolean;
  shell: string | null;
  title: string;
  uid: string;
  url: string | null;
  splitDirection?: string;
  activeUid?: string;
};
export type sessionState = {
  sessions: Record<string, session>;
  activeUid: string | null;
  write?: any;
};

export {ITermGroupReducer} from './reducers/term-groups';
import {ITermGroupReducer} from './reducers/term-groups';

export {IUiReducer} from './reducers/ui';
import {IUiReducer} from './reducers/ui';

export {ISessionReducer} from './reducers/sessions';
import {ISessionReducer} from './reducers/sessions';

export type hyperPlugin = {
  getTabProps: any;
  getTabsProps: any;
  getTermGroupProps: any;
  getTermProps: any;
  mapHeaderDispatch: any;
  mapHyperDispatch: any;
  mapHyperTermDispatch: any;
  mapNotificationsDispatch: any;
  mapTermsDispatch: any;
  mapHeaderState: any;
  mapHyperState: any;
  mapHyperTermState: any;
  mapNotificationsState: any;
  mapTermsState: any;
  middleware: any;
  onRendererWindow: any;
  reduceSessions: ISessionReducer;
  reduceTermGroups: ITermGroupReducer;
  reduceUI: IUiReducer;
};

import rootReducer from './reducers/index';
export type HyperState = ReturnType<typeof rootReducer>;

import {UIActions} from './constants/ui';
import {ConfigActions} from './constants/config';
import {SessionActions} from './constants/sessions';
import {NotificationActions} from './constants/notifications';
import {UpdateActions} from './constants/updater';
import {TermGroupActions} from './constants/term-groups';
import {InitActions} from './constants';
import {TabActions} from './constants/tabs';

export type HyperActions = (
  | UIActions
  | ConfigActions
  | SessionActions
  | NotificationActions
  | UpdateActions
  | TermGroupActions
  | InitActions
  | TabActions
) & {effect?: () => void};

type immutableRecord<T> = {[k in keyof T]: Immutable<T[k]>};

import {ThunkDispatch} from 'redux-thunk';
import configureStore from './store/configure-store';
export type HyperThunkDispatch = ThunkDispatch<HyperState, undefined, HyperActions>;
export type HyperDispatch = ReturnType<typeof configureStore>['dispatch'];

export type TermsProps = {
  activeRootGroup: string | null;
  activeSession: string | null;
  customCSS: string;
  fontSmoothing: string;
  termGroups: Immutable<ITermGroup>[];
} & immutableRecord<
  Pick<
    uiState,
    | 'backgroundColor'
    | 'bell'
    | 'bellSound'
    | 'bellSoundURL'
    | 'borderColor'
    | 'colors'
    | 'cols'
    | 'copyOnSelect'
    | 'cursorAccentColor'
    | 'cursorBlink'
    | 'cursorColor'
    | 'cursorShape'
    | 'disableLigatures'
    | 'fontFamily'
    | 'fontSize'
    | 'fontWeight'
    | 'fontWeightBold'
    | 'foregroundColor'
    | 'letterSpacing'
    | 'lineHeight'
    | 'macOptionSelectionMode'
    | 'modifierKeys'
    | 'padding'
    | 'quickEdit'
    | 'rows'
    | 'scrollback'
    | 'selectionColor'
    | 'uiFontFamily'
    | 'webGLRenderer'
  >
> &
  immutableRecord<Pick<sessionState, 'sessions' | 'write'>>;
