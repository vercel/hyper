import Immutable from 'seamless-immutable';
import * as Layout from './layout';

function Tab(obj) {
  return Immutable({
    uid: null,
    title: ''
  }).merge(obj);
}

export function create(state, action) {
  const layout = Layout.create({uid: action.uid});
  const tab = Tab({
    uid: action.uid
  });
  return state
        .set('active', state.active.merge({
          tab: tab.uid,
          layout: layout.uid
        }))
        .setIn(['layouts', layout.uid], layout)
        .setIn(['tabs', tab.uid], tab);
}

export function select(state, action) {
  return state
        .set('active', state.active.merge({
          tab: action.uid
        }));
}
