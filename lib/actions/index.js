import {INIT} from '../constants/index';
import rpc from '../rpc';

export function init() {
  rpc.emit('init');
  return {
    type: INIT
  }
}
