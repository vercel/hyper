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
