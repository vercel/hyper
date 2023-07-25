import {CLOSE_TAB, CHANGE_TAB} from '../../typings/constants/tabs';
import {
  UI_WINDOW_MAXIMIZE,
  UI_WINDOW_UNMAXIMIZE,
  UI_OPEN_HAMBURGER_MENU,
  UI_WINDOW_MINIMIZE,
  UI_WINDOW_CLOSE
} from '../../typings/constants/ui';
import type {HyperDispatch} from '../../typings/hyper';
import rpc from '../rpc';

import {userExitTermGroup, setActiveGroup} from './term-groups';

export function closeTab(uid: string) {
  return (dispatch: HyperDispatch) => {
    dispatch({
      type: CLOSE_TAB,
      uid,
      effect() {
        dispatch(userExitTermGroup(uid));
      }
    });
  };
}

export function changeTab(uid: string) {
  return (dispatch: HyperDispatch) => {
    dispatch({
      type: CHANGE_TAB,
      uid,
      effect() {
        dispatch(setActiveGroup(uid));
      }
    });
  };
}

export function maximize() {
  return (dispatch: HyperDispatch) => {
    dispatch({
      type: UI_WINDOW_MAXIMIZE,
      effect() {
        rpc.emit('maximize');
      }
    });
  };
}

export function unmaximize() {
  return (dispatch: HyperDispatch) => {
    dispatch({
      type: UI_WINDOW_UNMAXIMIZE,
      effect() {
        rpc.emit('unmaximize');
      }
    });
  };
}

export function openHamburgerMenu(coordinates: {x: number; y: number}) {
  return (dispatch: HyperDispatch) => {
    dispatch({
      type: UI_OPEN_HAMBURGER_MENU,
      effect() {
        rpc.emit('open hamburger menu', coordinates);
      }
    });
  };
}

export function minimize() {
  return (dispatch: HyperDispatch) => {
    dispatch({
      type: UI_WINDOW_MINIMIZE,
      effect() {
        rpc.emit('minimize');
      }
    });
  };
}

export function close() {
  return (dispatch: HyperDispatch) => {
    dispatch({
      type: UI_WINDOW_CLOSE,
      effect() {
        rpc.emit('close');
      }
    });
  };
}
