import {request, split, select, arrow, close} from '../objects/pane';

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
    case 'PANE_SWITCH':
      return arrow(state, action);
    default:
      return state;
  }
};

export default conditions;
