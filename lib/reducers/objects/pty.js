import Immutable from 'seamless-immutable';

function Pty(obj) {
  return Immutable({
    uid: null,
    cols: null,
    rows: null
  }).merge(obj);
}

export function create(state, action) {
  const pty = Pty({
    uid: action.uid,
    cols: action.cols,
    rows: action.rows
  });
  return state
        .setIn(['ptys', pty.uid], pty);
}

export function resize(state, action) {
  console.log(action);
  const pty = state.ptys[action.uid];
  return state
        .setIn(['ptys', pty.uid], pty.merge({
          cols: action.cols,
          rows: action.rows
        }));
}