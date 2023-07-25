import {INIT} from '../../typings/constants';
import type {HyperDispatch} from '../../typings/hyper';
import rpc from '../rpc';

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
