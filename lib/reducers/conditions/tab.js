import {create, select} from '../objects/tab';

const conditions = (state, action) => {
  switch (action.type) {
    case 'TAB_CREATED':
      return create(state, action);
    case 'TAB_SELECT':
      return select(state, action);
    case 'PTY_PAYLOAD':
      return state.set('write', {uid: action.uid, data: action.data});
    default:
      return state;
  }
};

export default conditions;
