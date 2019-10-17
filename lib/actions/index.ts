import rpc from '../rpc';
import INIT from '../constants';
import {Dispatch} from 'redux';

export default function init() {
  return (dispatch: Dispatch<any>) => {
    dispatch({
      type: INIT,
      effect: () => {
        rpc.emit('init', null);
      }
    });
  };
}
