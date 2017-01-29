import rpc from '../rpc';

const DIRECTION = {
  HORIZONTAL: 'HORIZONTAL',
  VERTICAL: 'VERTICAL'
};

export function request(uid) {
  return dispatch => {
    dispatch({
      type: 'PANE_REQUEST',
      uid,
      effect: () => {
        dispatch({type: 'PANE_CREATED'});
      }
    });
  };
}

export function splited(split, uid) {
  return dispatch => {
    dispatch({
      type: 'SPLITED',
      split,
      uid
    });
  };
}

export function spliting(split) {
  return () => dispatch => {
    dispatch({
      type: 'SPLITING',
      effect: () => {
        rpc.emit('split request', {split});
      }
    });
  };
}

export const verticalSplit = spliting(DIRECTION.VERTICAL);
export const horizontalSplit = spliting(DIRECTION.HORIZONTAL);

export function doClose() {
  return (dispatch, getState) => {
    const state = getState();
    const active = state.base.active;
    dispatch({
      type: 'PANE_CLOSE',
      active
    });
  };
}

export function select(uid) {
  return dispatch => {
    dispatch({
      type: 'PANE_SELECT',
      uid
    });
  };
}
