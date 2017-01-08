import Immutable from 'seamless-immutable';
// import {decorateTabsReducer} from '../utils/plugins'

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
  },
}), action) => {
  state = tabConditions(state,action);
  state = paneConditions(state,action);
  return state;
};

export default reducer;

// import * as Tab from './objects/tab';
// import * as Pane from './objects/pane';
// import * as Panes  from './objects/panes';

// const initialState = Immutable({
//   tabs: {},
//   panes: {},
//   active: null,
//   pane: null
// });
// 
// function close(state, action) {
//   const tab =  state.tabs[state.active];
//   const pane = state.panes[action.pane];
//   state = state
//         .setIn(['panes', action.pane], pane.merge({
//           display: action.split
//         }))
//   return state.setIn(['tabs', tab.uid], tab.merge({
//           struct: Panes.byTab(state)
//         }));
// }


// const reducer = (state = initialState, action) => {
//   switch (action.type) {
//     case 'TAB_CREATED':
//       return state
//         .set('active', action.uid)
//         .setIn(['tabs', action.uid], Tab.create(action.uid));
//     case 'PANE_REQUEST':
//       return state;
//       // return Pane.request(state,action);
//     case 'SPLIT':
//       return state;
//       // return Pane.split(state,action);
//     case 'PANE_SELECT':
//       return state;
//       // return state.set('pane', action.uid);
//     case 'PANE_CLOSE':
//     // console.log(state.set('panes', state.panes.without(action.pane)))
//       return state;
//       
//     default:
//       return state;
//   }
// };

// export default decorateTabsReducer(reducer);
