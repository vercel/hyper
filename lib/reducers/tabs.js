import Immutable from 'seamless-immutable';
import {decorateTabsReducer} from '../utils/plugins'
import tabConditions from './conditions/tab';
import paneConditions from './conditions/pane';

export const reducer = (state = Immutable({
  tabs: {},
  layouts: {},
  panes: {},
  active: {
    tab: null,
    pane: null,
    layout: null
  }
}), action) => {
  state = tabConditions(state, action);
  state = paneConditions(state, action);
  return state;
};

export default decorateTabsReducer(reducer);
