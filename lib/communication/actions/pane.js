const DIRECTION = {
  HORIZONTAL: 'HORIZONTAL',
  VERTICAL: 'VERTICAL'
};


export function request(tabId, uid, root) {
  return (dispatch, getState) => {
    dispatch({
      type: 'PANE_REQUEST',
      tabId,
      uid,
      root
    });
  };
}

export function splited(split,uid) {
  return (dispatch, getState) => {
    const state = getState();
    dispatch({
      type: 'SPLITED',
      split,
      uid
    });
  };
}

export function spliting(split) {
  return () => (dispatch, getState) => {
    dispatch({
      type: 'SPLITING',
      effect: () => {
        rpc.emit('split request', {split});
      }
    });
  };
}

// export function split(split) {
//   return () => (dispatch, getState) => {
//     const state = getState();
//     const tab = state.base.active.tab;
//     const pane = state.base.active.pane;
//     dispatch({
//       type: 'SPLIT',
//       tab: tab,
//       pane: pane,
//       split: split,
//       effect: () => {
//         rpc.emit('pane request', {tabId:tab});
//       }
//     });
//   };
// }


export const verticalSplit = spliting(DIRECTION.VERTICAL);
export const horizontalSplit = spliting(DIRECTION.HORIZONTAL);

export function doClose() {
  return (dispatch, getState) => {
    const state = getState();
    const active = state.base.active;    
    dispatch({
      type: 'PANE_CLOSE',
      active: active
    });
  };
}

export function select(uid) {
  return dispatch => {
    dispatch({
      type: 'PANE_SELECT',
      uid
    });
  };
}
