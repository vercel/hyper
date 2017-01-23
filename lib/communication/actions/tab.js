export function request(uid) {
  return (dispatch, getState) => {
    const {tabs} = getState();
    dispatch({
      type: 'TAB_CREATED',
      uid,
      effect() {
        rpc.emit('pane request', {tabId:uid, root:true});
      }
    });
  };
}

export function select(uid) {
  console.log(uid);
  return dispatch => {
    dispatch({
      type: 'TAB_SELECT',
      uid
    });
  };
}