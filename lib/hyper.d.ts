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
  direction: 'HORIZONTAL' | 'VERTICAL' | null;
  sizes: number[] | null;
  children: string[];
};

export type ITermGroups = Record<string, ITermGroup>;

export type ITermState = {
  termGroups: ITermGroups;
  activeSessions: Record<string, string>;
  activeRootGroup: string | null;
};

export type cursorShapes = 'BEAM' | 'UNDERLINE' | 'BLOCK';
import {FontWeight} from 'xterm';

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
  cursorShape: cursorShapes;
  cwd?: string;
  disableLigatures: boolean;
  fontFamily: string;
  fontSize: number;
  fontSizeOverride: null | number;
  fontSmoothingOverride: string;
  fontWeight: FontWeight;
  fontWeightBold: FontWeight;
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
  splitDirection?: 'HORIZONTAL' | 'VERTICAL';
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

import {Middleware} from 'redux';
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
  middleware: Middleware;
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

type extensionProps = Partial<{
  customChildren: any;
  customChildrenBefore: any;
  customCSS: string;
  customInnerChildren: any;
}>;

import {HeaderConnectedProps} from './containers/header';
export type HeaderProps = HeaderConnectedProps & extensionProps;

import {HyperConnectedProps} from './containers/hyper';
export type HyperProps = HyperConnectedProps & extensionProps;

import {NotificationsConnectedProps} from './containers/notifications';
export type NotificationsProps = NotificationsConnectedProps & extensionProps;

import {TermsConnectedProps} from './containers/terms';
export type TermsProps = TermsConnectedProps & extensionProps & {ref_: any};

export type StyleSheetProps = {
  backgroundColor: string;
  borderColor: string;
  fontFamily: string;
  foregroundColor: string;
} & extensionProps;

export type TabProps = {
  borderColor: string;
  hasActivity: boolean;
  isActive: boolean;
  isFirst: boolean;
  isLast: boolean;
  onClick: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  onClose: () => void;
  onSelect: () => void;
  text: string;
} & extensionProps;

export type ITab = {
  uid: string;
  title: string;
  isActive: boolean;
  hasActivity: boolean;
};

export type TabsProps = {
  tabs: ITab[];
  borderColor: string;
  onChange: () => void;
  onClose: () => void;
  fullScreen: boolean;
} & extensionProps;

export type NotificationProps = {
  backgroundColor: string;
  color?: string;
  dismissAfter?: number;
  onDismiss: Function;
  text?: string | null;
  userDismissable?: boolean | null;
  userDismissColor?: string;
} & extensionProps;

export type NotificationState = {
  dismissing: boolean;
};

export type SplitPaneProps = {
  borderColor: string;
  direction: 'horizontal' | 'vertical';
  onResize: Function;
  sizes?: Immutable<number[]> | null;
};
