import Immutable from 'seamless-immutable';
import uuid from 'uuid';

function Layout(obj) {
  return Immutable({
    uid: uuid.v4(),
    parent: undefined,
    pane: null,
    display: null,
    nexts: []
  }).merge(obj);
}

export function create(obj) {
  return Layout(obj);
}

export function hasNexts(layout) {
  return layout.nexts.length >= 1;
}

// export function nexts(layout, next) {
  // let nexts = Immutable(layout.nexts).concat([next]);
  // console.log(nexts);
  // .create({display: action.split})
  // const index = layout.next.length + 1;
  // const nexts = [...parent.childs.slice(0, index), pane.uid, ...parent.childs.slice(index)];
  // return layout;
  // return Layout(obj);
// }
