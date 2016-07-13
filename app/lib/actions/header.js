import { CLOSE_TAB, CHANGE_TAB } from '../constants/tabs';
import { userExitSession, setActiveSession } from './sessions';

export function closeTab (uid) {
  return (dispatch, getState) => {
    dispatch({
      type: CLOSE_TAB,
      uid,
      effect () {
        dispatch(userExitSession(uid));
      }
    });
  };
}

export function changeTab (uid) {
  return (dispatch, getState) => {
    dispatch({
      type: CHANGE_TAB,
      uid,
      effect () {
        dispatch(setActiveSession(uid));
      }
    });
  };
}
