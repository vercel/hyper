import {create, select, arrow} from '../objects/tab';

const conditions = (state, action) => {
  switch (action.type) {
    case 'TAB_CREATED':
      return create(state, action);
    case 'TAB_SELECT':
      return select(state, action);
    case 'TAB_SWITCH':
      return arrow(state, action);
    default:
      return state;
  }
};

export default conditions;
