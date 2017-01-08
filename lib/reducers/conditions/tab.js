import {create} from '../objects/tab';

const conditions = (state, action) => {
  switch (action.type) {
    case 'TAB_CREATED':
      const uid = action.uid;
      return create(state,action);
    default:
      return state;
  }
}

export default conditions;