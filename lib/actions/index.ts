import rpc from '../rpc';
import INIT from '../constants';

export default function init() {
  return dispatch => {
    dispatch({
      type: INIT,
      effect: () => {
        rpc.emit('init');
      }
    });
  };
}
