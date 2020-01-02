import rpc from '../rpc';
import {INIT} from '../constants';
import {HyperDispatch} from '../hyper';

export default function init() {
  return (dispatch: HyperDispatch) => {
    dispatch({
      type: INIT,
      effect: () => {
        rpc.emit('init', null);
      }
    });
  };
}
