export const CLOSE_TAB = 'CLOSE_TAB';
export const CHANGE_TAB = 'CHANGE_TAB';

export interface CloseTabAction {
  type: typeof CLOSE_TAB;
}
export interface ChangeTabAction {
  type: typeof CHANGE_TAB;
}

export type TabActions = CloseTabAction | ChangeTabAction;
