import Immutable from 'seamless-immutable';
// import {create, hasNexts} from './layout';
import {create, activeDisplay, splited, paneIndex, setActive, left, right, down, up} from './display';

function Pane(obj) {
  return Immutable({
    uid: null,
    num: null
  }).merge(obj);
}

export function request(state, action) {
  const pane = Pane({
    uid: action.uid,
    num: 1
  });
  const disp = activeDisplay(state);
  return state
          .set('active', state.active.merge({
            pane: pane.uid,
            display: disp.uid
          }))
          .setIn(['panes', pane.uid], pane)
          .setIn(['displays', disp.uid], disp.merge({
            panes: disp.panes.concat(pane.uid)
          }));
}

const numing = function (state, display, index, num) {
  const {panes, displays} = state;
  const uid = display.panes[index];
  const pane = panes[uid];
  if (pane) {
    state = state
            .setIn(['panes', pane.uid], pane.merge({
              num: num++
            }));
    const nexts = Object.keys(displays).map(uid => displays[uid])
    .find(disp => {
      return disp.ref === pane.uid;
    });
    if (nexts) {
      return numing(state, nexts, 0, num, state => {
        return state;
      });
    }
    index++;
    return numing(state, display, index, num, state => {
      return state;
    });
  }
  if (display.prec) {
    const prec = displays[display.prec];
    index = prec.panes.indexOf(display.ref);
    index++;
    return numing(state, prec, index, num, state => {
      return state;
    });
  }
  return state;
};

export function renum(state) {
  const {tab} = state.active;
  const {displays} = state;
  const display = displays[tab];
  return numing(state, display, 0, 1, state => {
    return state;
  });
}

export function split(state, action) {
  const disp = activeDisplay(state);
  const split = action.split.toLowerCase();
  const pane = Pane({
    uid: action.uid
  });

  state = state.setIn(['panes', pane.uid], pane);

  if (disp.split) {
    const dispPane = state.active.pane;
    const panes = Object.keys(disp.panes).map(uid => disp.panes[uid]);
    if (splited(disp, split)) {
      const indexOf = paneIndex(disp, dispPane);
      panes.splice(indexOf + 1, 0, pane.uid);
      state = state
      .setIn(['displays', disp.uid], disp.merge({
        panes
      }))
      .set('active', state.active.merge({
        pane: pane.uid
      }));
      return state;
    }
    const nDisp = new create({prec: disp.uid, ref: dispPane, split, panes: [pane.uid]});
    return state
    .setIn(['displays', nDisp.uid], nDisp)
    .set('active', state.active.merge({
      display: nDisp.uid,
      pane: pane.uid
    }));
  }

  return state
  .setIn(['displays', disp.uid], disp.merge({
    split,
    panes: disp.panes.concat(pane.uid)
  }))
  .set('active', state.active.merge({
    pane: pane.uid
  }));
}

export function select(state, action) {
  const tab = state.tabs[state.active.tab];
  state = state.setIn(['tabs', tab.uid], tab.merge({
    title: action.uid
  }));
  return setActive(state, action.uid);
}

export function close(state, action) {
  const {active} = action;
  const pane = state.panes[active.pane];
  const display = state.displays[active.display];
  const panes = Object.keys(display.panes).map(uid => display.panes[uid]);
  const indexOf = panes.indexOf(pane.uid);

  if (display.ref) {
    const prec = state.displays[display.prec];
    console.log('display', display);
    console.log('prec', prec);
    const nexts = Object.keys(state.displays).map(uid => state.displays[uid])
    .find(display => {
      return display.ref === panes[indexOf];
    });
    console.log('nexts', nexts);

    if (nexts && nexts.panes.length >= 1) {
      panes.splice(indexOf, 1);
      const next = Object.keys(nexts.panes).map(uid => nexts.panes[uid]);
      for (const nx in next) {
        if (next[nx]) {
          panes.push(next[nx]);
        }
      }
      next.splice(0, 1);
      state = state.setIn(['displays', display.uid], display.merge({
        panes
      }))
      .setIn(['displays', nexts.uid], nexts.merge({
        panes: next
      }));
      return setActive(state, nexts.panes[0]);
    }
    panes.splice(indexOf, 1);
    state = state.setIn(['displays', display.uid], display.merge({
      panes
    }));
    return setActive(state, display.ref);
  }
  panes.splice(indexOf, 1);
  const next = panes.length - 1 >= indexOf ? indexOf : (indexOf - 1 >= 0 ? indexOf - 1 : 0);
  return state.setIn(['displays', display.uid], display.merge({
    panes
  }))
  .set('panes', state.panes.without(pane.uid))
  .set('active', state.active.merge({
    pane: (panes[next] ? panes[next] : null),
    display: display.uid
  }));
}

export function arrow(state, action) {
  const display = state.displays[state.active.display];
  switch (action.arrow) {
    case 'left':
      return left(state, display);
    case 'right':
      return right(state, display);
    case 'up':
      return up(state, display);
    case 'down':
      return down(state, display);
    default:
      return state;
  }
}
