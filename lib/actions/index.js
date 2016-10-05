import rpc from '../rpc';
import {INIT} from '../constants';

export function init() {
  return dispatch => {
    dispatch({
      type: INIT,
      effect: () => {
        rpc.emit('init');
      }
    });
  };
}
