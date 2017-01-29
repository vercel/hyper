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
