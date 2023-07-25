import rpc from '../rpc';
import {INIT} from '../constants';
import type {HyperDispatch} from '../../typings/hyper';

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
