import Immutable from 'seamless-immutable';

const initialState = Immutable({
  tabs: {},
  activeTab: null
});

function Tab(obj) {
  return Immutable({
    uid: ''
  }).merge(obj);
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'NEW_TAB':
      return state
        .set('activeTab', action.uid)
        .setIn(['tabs', action.uid], Tab({
          uid: action.uid
        }));
    case 'TAB_CHANGE':
      return state.set('activeTab', action.uid);
    case 'CLOSE_TAB':
      return state.set('tabs', state.tabs.without(state.activeTab));
    default:
      return state;
  }
};

export default reducer;
