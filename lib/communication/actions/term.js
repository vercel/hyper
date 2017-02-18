import rpc from '../rpc';

const TERM_REQUEST = 'TERM_REQUEST';

export default function request() {
  return (dispatch, getState) => {
    const {ui} = getState();
    const {cols, rows, cwd} = ui;
    dispatch({
      type: TERM_REQUEST,
      effect: () => {
        rpc.emit('new', {
          isNewGroup: true,
          cols,
          rows,
          cwd
        });
      }
    });
  };
}
