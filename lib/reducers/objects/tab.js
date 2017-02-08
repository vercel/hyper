import Immutable from 'seamless-immutable';
import * as Display from './display';

function Tab(obj) {
  return Immutable({
    uid: null,
    num: null,
    title: ''
  }).merge(obj);
}

const map = function (state) {
  return Object.keys(state.tabs).map(uid => state.tabs[uid]);
};

export function create(state, action) {
  const display = new Display.create({uid: action.uid});
  const tab = Tab({
    uid: action.uid,
    num: map(state).length
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

export function arrow(state, action) {
  const tabs = map(state);
  const tab = state.tabs[state.active.tab];
  let index = tab.num;
  const size = tabs.length - 1;

  switch (action.arrow) {
    case 'Left': {
      if (index === 0) {
        index = size;
      } else {
        index--;
      }
      const prev = tabs[index];
      return state
      .set('active', state.active.merge({
        tab: prev.uid
      }));
    }
    case 'Right': {
      if (index === size) {
        index = 0;
      } else {
        index++;
      }
      const next = tabs[index];
      return state
      .set('active', state.active.merge({
        tab: next.uid
      }));
    }
    default:
      return state;
  }
}

