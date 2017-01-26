import {request, split, select, close} from '../objects/pane';

const conditions = (state, action) => {
  switch (action.type) {
    case 'PANE_REQUEST':
      return request(state, action);
    case 'SPLITED':
      return split(state, action);
    case 'PANE_SELECT':
      return select(state, action);
    case 'PANE_CLOSE':
      return close(state, action);
    case 'PANE_CREATED':
      return state;
    default:
      return state;
  }
};

export default conditions;
