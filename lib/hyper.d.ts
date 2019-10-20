import {Reducer} from 'redux';
import {Immutable} from 'seamless-immutable';

declare global {
  interface Window {
    __rpcId: string;
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

export type ITermGroupReducer = Reducer<Immutable<ITermState>, any>;

export type uiState = {
  _lastUpdate: null;
  activeUid: string | null;
  activityMarkers: {};
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
  messageText: null;
  messageURL: null;
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
  updateNotes: null;
  updateReleaseUrl: null;
  updateVersion: null;
  webGLRenderer: boolean;
};

export type IUiReducer = Reducer<Immutable<uiState>>;
export type session = {
  cleared: boolean;
  cols: number | null;
  pid: number | null;
  resizeAt?: number;
  rows: number | null;
  search: boolean;
  shell: string;
  title: string;
  uid: string;
  url: string | null;
  splitDirection?: string;
  activeUid?: string;
};
export type sessionState = {
  sessions: Record<string, session>;
  activeUid: string | null;
};

export type ISessionReducer = Reducer<Immutable<sessionState>>;

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
