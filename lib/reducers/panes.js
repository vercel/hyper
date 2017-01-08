import Immutable from 'seamless-immutable';
// import {decoratePanesReducer} from '../utils/plugins';

import {request, split, addChild} from './objects/pane';
// import * as Pane from './objects/pane';

const initialState = Immutable({
  panes: {},
  active: null
});

// const initialState = {
//   panes: {},
//   active: null,
// };

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'PANE_REQUEST':
        // return request(state, action)

    case 'SPLIT':
      // return split(state, action);

    default: 
      return state;
  }
};

// export default decoratePanesReducer(reducer);
export default reducer;
