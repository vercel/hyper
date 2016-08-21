import rpc from '../rpc';

export function init () {
  rpc.emit('init');
}
