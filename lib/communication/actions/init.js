import rpc from '../rpc';

const INIT = 'INIT';

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
