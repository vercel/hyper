import rpc from '../rpc';

export function request(uid) {
  return dispatch => {
    dispatch({
      type: 'TAB_CREATED',
      uid,
      effect() {
        rpc.emit('pane request');
      }
    });
  };
}

export function select(uid) {
  return dispatch => {
    dispatch({
      type: 'TAB_SELECT',
      uid
    });
  };
}
