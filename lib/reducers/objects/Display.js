import Immutable from 'seamless-immutable';
import uuid from 'uuid';

function Display(obj) {
  return Immutable({
    uid: uuid.v4(),
    ref: undefined,
    prec: undefined,
    split: null,
    panes: []
  }).merge(obj);
}

export function create(obj) {
  return Display(obj);
}

export function activeDisplay(state) {
  return state.displays[state.active.display];
}

export function splited(display, split) {
  return (display.split === split);
}

export function paneIndex(display, pane) {
  return display.panes.indexOf(pane);
}

export function setActive(state, pUid) {
  const {displays} = state;
  const disp = Object.keys(displays).map(uid => displays[uid])
  .find(display => Object.keys(display.panes).map(uid => display.panes[uid])
    .find(pane => {
      return pane === pUid;
    })
  )
  return state.set('active', state.active.merge({
    pane: pUid,
    display: disp.uid
  }));
}

export function left(state, display) {
  const pane = state.active.pane;
  const indexOf = display.panes.indexOf(pane);
  if (indexOf - 1 >= 0 ) {
    return setActive(state, display.panes[indexOf - 1] )
  }
  return up(state, display);
}

export function right(state, display) {
  const pane = state.active.pane;
  const indexOf = display.panes.indexOf(pane);
  if (indexOf + 1 <= display.panes.length - 1 ) {
    return setActive(state, display.panes[indexOf + 1] )
  }
  return down(state, display);
}

export function down(state, display) {
  const {displays} = state;
  const pane = state.active.pane;
  const nexts = Object.keys(displays).map(uid => displays[uid])
  .find(display => {
    return display.ref === pane;
  });
  if (nexts && nexts.panes) {
    return setActive(state, nexts.panes[0])
  }
}

export function up(state, display) {
  if (display.ref) {
    return setActive(state, display.ref)
  }
}

export function hasNexts(layout) {
  return layout.nexts.length >= 1;
}


