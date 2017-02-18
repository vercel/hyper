import {create, resize} from '../objects/pty';

const conditions = (state, action) => {
  switch (action.type) {
    case 'PTY_INIT':
      return create(state, action);
    case 'PTY_RESIZE':
      return resize(state, action);      
    case 'PTY_PAYLOAD':
      return state.set('write', {uid: action.uid, data: action.data});
    default:
      return state;
  }
};

export default conditions;
