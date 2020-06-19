import {Immutable} from 'seamless-immutable';
import Client from './utils/rpc';

declare global {
  interface Window {
    __rpcId: string;
    rpc: Client;
    focusActiveTerm: (uid?: string) => void;
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
import {FontWeight, Terminal} from 'xterm';

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
  showHamburgerMenu: boolean | '';
  showWindowControls: string;
  termCSS: string;
  uiFontFamily: string;
  updateCanInstall: null | boolean;
  updateNotes: string | null;
  updateReleaseUrl: string | null;
  updateVersion: string | null;
  webGLRenderer: boolean;
  webLinksActivationKey: string;
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
  onRendererUnload: any;
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

import {ReactChild} from 'react';
type extensionProps = Partial<{
  customChildren: ReactChild | ReactChild[];
  customChildrenBefore: ReactChild | ReactChild[];
  customCSS: string;
  customInnerChildren: ReactChild | ReactChild[];
}>;

import {HeaderConnectedProps} from './containers/header';
export type HeaderProps = HeaderConnectedProps & extensionProps;

import {HyperConnectedProps} from './containers/hyper';
export type HyperProps = HyperConnectedProps & extensionProps;

import {NotificationsConnectedProps} from './containers/notifications';
export type NotificationsProps = NotificationsConnectedProps & extensionProps;

import Terms from './components/terms';
import {TermsConnectedProps} from './containers/terms';
export type TermsProps = TermsConnectedProps & extensionProps & {ref_: (terms: Terms | null) => void};

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
  onClick?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
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
  onChange: (uid: string) => void;
  onClose: (uid: string) => void;
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

import Term from './components/term';

export type TermGroupOwnProps = {
  cursorAccentColor?: string;
  fontSmoothing?: string;
  parentProps: TermsProps;
  ref_: (uid: string, term: Term | null) => void;
  termGroup: Immutable<ITermGroup>;
  terms: Record<string, Term | null>;
} & Pick<
  TermsProps,
  | 'activeSession'
  | 'backgroundColor'
  | 'bell'
  | 'bellSound'
  | 'bellSoundURL'
  | 'borderColor'
  | 'colors'
  | 'copyOnSelect'
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
  | 'onActive'
  | 'onContextMenu'
  | 'onData'
  | 'onResize'
  | 'onTitle'
  | 'padding'
  | 'quickEdit'
  | 'scrollback'
  | 'selectionColor'
  | 'sessions'
  | 'toggleSearch'
  | 'uiFontFamily'
  | 'webGLRenderer'
  | 'webLinksActivationKey'
>;

import {TermGroupConnectedProps} from './components/term-group';
export type TermGroupProps = TermGroupConnectedProps & TermGroupOwnProps;

export type SearchBoxProps = {
  search: (searchTerm: string) => void;
  next: (searchTerm: string) => void;
  prev: (searchTerm: string) => void;
  close: () => void;
};

import {FitAddon} from 'xterm-addon-fit';
import {SearchAddon} from 'xterm-addon-search';
export type TermProps = {
  backgroundColor: string;
  bell: string;
  bellSound: string | null;
  bellSoundURL: string | null;
  borderColor: string;
  cleared: boolean;
  colors: uiState['colors'];
  cols: number | null;
  copyOnSelect: boolean;
  cursorAccentColor?: string;
  cursorBlink: boolean;
  cursorColor: string;
  cursorShape: cursorShapes;
  disableLigatures: boolean;
  fitAddon: FitAddon | null;
  fontFamily: string;
  fontSize: number;
  fontSmoothing?: string;
  fontWeight: FontWeight;
  fontWeightBold: FontWeight;
  foregroundColor: string;
  isTermActive: boolean;
  letterSpacing: number;
  lineHeight: number;
  macOptionSelectionMode: string;
  modifierKeys: Immutable<{altIsMeta: boolean; cmdIsMeta: boolean}>;
  onActive: () => void;
  onContextMenu: (selection: any) => void;
  onCursorMove?: (cursorFrame: {x: number; y: number; width: number; height: number; col: number; row: number}) => void;
  onData: (data: string) => void;
  onResize: (cols: number, rows: number) => void;
  onTitle: (title: string) => void;
  padding: string;
  quickEdit: boolean;
  rows: number | null;
  scrollback: number;
  search: boolean;
  searchAddon: SearchAddon | null;
  selectionColor: string;
  term: Terminal | null;
  toggleSearch: () => void;
  uid: string;
  uiFontFamily: string;
  url: string | null;
  webGLRenderer: boolean;
  webLinksActivationKey: string;
  ref_: (uid: string, term: Term | null) => void;
} & extensionProps;

export type Assignable<T, U> = {[k in keyof U]: k extends keyof T ? T[k] : U[k]} & Partial<T>;
