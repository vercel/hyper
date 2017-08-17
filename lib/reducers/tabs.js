import Immutable from 'seamless-immutable';

const initialState = Immutable({
  tabs: {},
  active: null
});

function Tab(obj) {
  return Immutable({
    uid: '',
    position: null
  }).merge(obj);
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'NEW_TAB':
      return state
        .set('active', action.uid)
        .setIn(['tabs', action.uid], Tab({
          uid: action.uid,
          position: action.position
        }));
    case 'TAB_CHANGE':
      return state.set('active', action.uid);
    case 'TAB_POSITION':
      return state.setIn(['tabs', action.uid, 'position'], action.position);
    case 'CLOSE_TAB':
      return state.set('tabs', state.tabs.without(state.active));
    default:
      return state;
  }
};

export default reducer;
