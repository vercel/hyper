import rpc from '../rpc';

import {
  INIT
} from '../constants/index';

export function init() {
  return dispatch => {
    dispatch({
      type: INIT,
      effect() {
        rpc.emit('init');
      }
    });
  };
}
