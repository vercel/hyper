export const UI_FONT_SIZE_SET = 'UI_FONT_SIZE_SET';
export const UI_FONT_SIZE_INCR = 'UI_FONT_SIZE_INCR';
export const UI_FONT_SIZE_DECR = 'UI_FONT_SIZE_DECR';
export const UI_FONT_SIZE_RESET = 'UI_FONT_SIZE_RESET';
export const UI_FONT_SMOOTHING_SET = 'UI_FONT_SMOOTHING_SET';
export const UI_MOVE_LEFT = 'UI_MOVE_LEFT';
export const UI_MOVE_RIGHT = 'UI_MOVE_RIGHT';
export const UI_MOVE_TO = 'UI_MOVE_TO';
export const UI_MOVE_NEXT_PANE = 'UI_MOVE_NEXT_PANE';
export const UI_MOVE_PREV_PANE = 'UI_MOVE_PREV_PANE';
export const UI_SHOW_PREFERENCES = 'UI_SHOW_PREFERENCES';
export const UI_WINDOW_MOVE = 'UI_WINDOW_MOVE';
export const UI_WINDOW_MAXIMIZE = 'UI_WINDOW_MAXIMIZE';
export const UI_WINDOW_UNMAXIMIZE = 'UI_WINDOW_UNMAXIMIZE';
export const UI_WINDOW_GEOMETRY_CHANGED = 'UI_WINDOW_GEOMETRY_CHANGED';
export const UI_OPEN_FILE = 'UI_OPEN_FILE';
export const UI_OPEN_SSH_URL = 'UI_OPEN_SSH_URL';
export const UI_OPEN_HAMBURGER_MENU = 'UI_OPEN_HAMBURGER_MENU';
export const UI_WINDOW_MINIMIZE = 'UI_WINDOW_MINIMIZE';
export const UI_WINDOW_CLOSE = 'UI_WINDOW_CLOSE';
export const UI_ENTER_FULLSCREEN = 'UI_ENTER_FULLSCREEN';
export const UI_LEAVE_FULLSCREEN = 'UI_LEAVE_FULLSCREEN';
export const UI_CONTEXTMENU_OPEN = 'UI_CONTEXTMENU_OPEN';
export const UI_COMMAND_EXEC = 'UI_COMMAND_EXEC';

export interface UIFontSizeSetAction {
  type: typeof UI_FONT_SIZE_SET;
  value: number;
}
export interface UIFontSizeIncrAction {
  type: typeof UI_FONT_SIZE_INCR;
}
export interface UIFontSizeDecrAction {
  type: typeof UI_FONT_SIZE_DECR;
}
export interface UIFontSizeResetAction {
  type: typeof UI_FONT_SIZE_RESET;
}
export interface UIFontSmoothingSetAction {
  type: typeof UI_FONT_SMOOTHING_SET;
  fontSmoothing: string;
}
export interface UIMoveLeftAction {
  type: typeof UI_MOVE_LEFT;
}
export interface UIMoveRightAction {
  type: typeof UI_MOVE_RIGHT;
}
export interface UIMoveToAction {
  type: typeof UI_MOVE_TO;
}
export interface UIMoveNextPaneAction {
  type: typeof UI_MOVE_NEXT_PANE;
}
export interface UIMovePrevPaneAction {
  type: typeof UI_MOVE_PREV_PANE;
}
export interface UIShowPreferencesAction {
  type: typeof UI_SHOW_PREFERENCES;
}
export interface UIWindowMoveAction {
  type: typeof UI_WINDOW_MOVE;
}
export interface UIWindowMaximizeAction {
  type: typeof UI_WINDOW_MAXIMIZE;
}
export interface UIWindowUnmaximizeAction {
  type: typeof UI_WINDOW_UNMAXIMIZE;
}
export interface UIWindowGeometryChangedAction {
  type: typeof UI_WINDOW_GEOMETRY_CHANGED;
  isMaximized: boolean;
}
export interface UIOpenFileAction {
  type: typeof UI_OPEN_FILE;
}
export interface UIOpenSshUrlAction {
  type: typeof UI_OPEN_SSH_URL;
}
export interface UIOpenHamburgerMenuAction {
  type: typeof UI_OPEN_HAMBURGER_MENU;
}
export interface UIWindowMinimizeAction {
  type: typeof UI_WINDOW_MINIMIZE;
}
export interface UIWindowCloseAction {
  type: typeof UI_WINDOW_CLOSE;
}
export interface UIEnterFullscreenAction {
  type: typeof UI_ENTER_FULLSCREEN;
}
export interface UILeaveFullscreenAction {
  type: typeof UI_LEAVE_FULLSCREEN;
}
export interface UIContextmenuOpenAction {
  type: typeof UI_CONTEXTMENU_OPEN;
}
export interface UICommandExecAction {
  type: typeof UI_COMMAND_EXEC;
  command: string;
}

export type UIActions =
  | UIFontSizeSetAction
  | UIFontSizeIncrAction
  | UIFontSizeDecrAction
  | UIFontSizeResetAction
  | UIFontSmoothingSetAction
  | UIMoveLeftAction
  | UIMoveRightAction
  | UIMoveToAction
  | UIMoveNextPaneAction
  | UIMovePrevPaneAction
  | UIShowPreferencesAction
  | UIWindowMoveAction
  | UIWindowMaximizeAction
  | UIWindowUnmaximizeAction
  | UIWindowGeometryChangedAction
  | UIOpenFileAction
  | UIOpenSshUrlAction
  | UIOpenHamburgerMenuAction
  | UIWindowMinimizeAction
  | UIWindowCloseAction
  | UIEnterFullscreenAction
  | UILeaveFullscreenAction
  | UIContextmenuOpenAction
  | UICommandExecAction;
