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

const prevNext = function (arrow, tabs, index) {
  const size = tabs.length - 1;

  switch (arrow) {
    case 'Left': {
      if (index === 0) {
        index = size;
      } else {
        index--;
      }
      const prev = tabs[index];
      return prev.uid;
    }
    case 'Right': {
      if (index === size) {
        index = 0;
      } else {
        index++;
      }
      const next = tabs[index];
      return next.uid;
    }
    default:
      return index;
  }
};

const number = function (tabs, index, num) {
  const ref = num - 1;
  if (num <= tabs.length && ref !== index) {
    if (num === 9) {
      return tabs[tabs.length - 1].uid;
    }
    return tabs[ref].uid;
  }
  return undefined;
};

export function swith(state, action) {
  const {arrow, num} = action;
  const tabs = map(state);
  const index = state.tabs[state.active.tab].num;

  if (arrow) {
    const uid = prevNext(arrow, tabs, index);
    return state.set('active', state.active.merge({
      tab: uid
    }));
  }
  if (num) {
    const uid = number(tabs, index, num);
    if (uid) {
      return state.set('active', state.active.merge({
        tab: uid
      }));
    }
    return state;
  }
  return state;
}
