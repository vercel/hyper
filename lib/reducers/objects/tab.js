import Immutable from 'seamless-immutable';
import * as Display from './display';

function Tab(obj) {
  return Immutable({
    uid: null,
    title: ''
  }).merge(obj);
}

export function create(state, action) {
  const display = new Display.create({uid: action.uid});
  const tab = Tab({
    uid: action.uid
  });
  return state
        .set('active', state.active.merge({
          tab: tab.uid,
          display: display.uid
        }))
        .setIn(['displays', display.uid], display)
        .setIn(['tabs', tab.uid], tab);
}

export function select(state, action) {
  return state
        .set('active', state.active.merge({
          tab: action.uid
        }));
}
