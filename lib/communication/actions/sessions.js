// const SESSION_ADD = 'SESSION_ADD';
const SESSION_ADD_DATA = 'SESSION_ADD_DATA';
const SESSION_PTY_DATA = 'SESSION_PTY_DATA';
const SESSION_USER_DATA = 'SESSION_USER_DATA';

export function addData(uid, data) {
  return function (dispatch) {
    dispatch({
      type: SESSION_ADD_DATA,
      data,
      effect() {
        dispatch({
          type: SESSION_PTY_DATA,
          uid,
          data
        });
      }
    });
  };
}

export function sendData(uid, data) {
  return function (dispatch) {
    dispatch({
      type: SESSION_USER_DATA,
      data,
      effect() {
        // If no uid is passed, data is sent to the active session.
        // const targetUid = uid || getState().sessions.activeUid;
        // rpc.emit('data', {uid: targetUid, data});
      }
    });
  };
}
