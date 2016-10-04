import {INIT} from '../constants';
import rpc from '../rpc';

export function init() {
  rpc.emit('init');
  return {
    type: INIT
  };
}
