export function init(uid, cols, rows) {
  return dispatch => {
    dispatch({
      type: 'PTY_INIT',
      uid,
      cols,
      rows,
      effect() {
        rpc.emit('pty request', {uid, cols, rows});        
      }
    });
  };
}

export function onData(uid, data) {
  return dispatch => {
    dispatch({
      type: 'PTY_PAYLOAD',
      uid,
      data
    });
  };
}

export function sendData(uid, data) {
  return dispatch => {
    dispatch({
      type: 'SEND_PAYLOAD',
      uid,
      data,
      effect() {
        rpc.emit('data', {uid, data});        
      }
    });
  };
}

export function resize(uid, cols, rows) {
  return dispatch => {
    dispatch({
      type: 'PTY_RESIZE',
      uid,
      cols,
      rows,
      effect() {
        rpc.emit('resize', {uid, cols, rows});        
      }
    });
  };
}
