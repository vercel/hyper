import Immutable from 'seamless-immutable';
import ptyConditions from './conditions/pty';

export const reducer = (state = Immutable({
  ptys: {},
  write: null
}), action) => {
  state = ptyConditions(state, action);
  return state;
};

export default reducer;
