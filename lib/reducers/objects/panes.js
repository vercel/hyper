import Immutable from 'seamless-immutable';

function Panes(obj) {
  return Immutable({
    direction: '',
    child:[]
  }).merge(obj);
}

export function byTab(state) {
  const tab = state.active;
  const {panes} = state;
  let list =  Object.keys(panes).map(uid => panes[uid]);
  return list.filter(function(pane) {
    return pane.tab === tab;
  });
}
