import Immutable from 'seamless-immutable';
// import {create, hasNexts} from './layout';
import {create, activeDisplay, splited, paneIndex, setActive, left, right, down, up} from './display';

function Pane(obj) {
  return Immutable({
    uid: null,
    num: null,
  }).merge(obj);
}

export function request(state, action) {
  const pane = Pane({
    uid: action.uid
  });
  const disp = activeDisplay(state);
  state = state
          .set('active', state.active.merge({
            pane: pane.uid,
            display: disp.uid
          }))
          .setIn(['panes', pane.uid], pane)
          .setIn(['displays', disp.uid], disp.merge({
            panes: disp.panes.concat(pane.uid)
          }))
  return state;
}

const renum = function(state, next, num) {
  console.log(next);
  const layout = state.layouts[next];
  console.log(layout);
  const {nexts} = layout;
  const pane = state.panes[layout.pane];
  console.log(pane);
  if (pane) {
    state = state
            .setIn(['panes', pane.uid], pane.merge({
              num: num++
            }));
    console.log(pane.uid, num);
    if(hasNexts(layout)) {
      for(const next in  nexts) {
        renum(state, nexts[next], num);
      }
    }
  }
}

const reNumber = function(state, action) {
  renum(state, state.active.tab, 0);
}

export function split(state, action) {
  const disp = activeDisplay(state);
  const split = action.split.toLowerCase();
  const pane = Pane({
    uid: action.uid
  });

  if (disp.split) {
    let dispPane = state.active.pane;
    let panes = Object.keys(disp.panes).map(uid => disp.panes[uid]);
    if (splited(disp, split)) {
      const indexOf = paneIndex(disp, dispPane);
      panes.splice(indexOf + 1, 0, pane.uid);
      state = state
             .setIn(['displays', disp.uid], disp.merge({
               panes
             }))
             .setIn(['panes', pane.uid], pane)
             .set('active', state.active.merge({
               pane: pane.uid
             }));
      return state;
    }
    const nDisp = new create({prec:disp.uid,ref:dispPane,split, panes:[pane.uid]});
    state = state
           .setIn(['panes', pane.uid], pane)
           .setIn(['displays', nDisp.uid], nDisp)
           .set('active', state.active.merge({
             display: nDisp.uid,
             pane: pane.uid
           }));
    return state;
  }

  state = state
         .setIn(['displays', disp.uid], disp.merge({
           split,
           panes: disp.panes.concat(pane.uid)
         }))
         .setIn(['panes', pane.uid], pane)
         .set('active', state.active.merge({
           pane: pane.uid
         }));
return state;
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
  let panes = Object.keys(display.panes).map(uid => display.panes[uid]);
  const indexOf = panes.indexOf(pane.uid);
  
  if (display.ref) {
    const prec = state.displays[display.prec];
    console.log('display', display);
    console.log('prec', prec);
      const nexts = Object.keys(state.displays).map(uid => state.displays[uid])
      .find(display => {
        return display.ref === panes[indexOf];
      });
      console.log('nexts',nexts);
      
      if(nexts && nexts.panes.length >= 1) {
        panes.splice(indexOf,1);
        let next = Object.keys(nexts.panes).map(uid => nexts.panes[uid]);
        for(const nx in next) {
          panes.push(next[nx]);
        }
        next.splice(0,1);
        state = state.setIn(['displays', display.uid], display.merge({
                panes
              }))
              .setIn(['displays', nexts.uid], nexts.merge({
                panes:next
              }));
        return setActive(state, nexts.panes[0]);
      }
      panes.splice(indexOf,1);
      state = state.setIn(['displays', display.uid], display.merge({
              panes
            }))
     return setActive(state, display.ref);
  }
  panes.splice(indexOf,1);
  const next = panes.length-1>=indexOf ? indexOf : (indexOf-1 >=0 ? indexOf-1 : 0);
  return state = state.setIn(['displays', display.uid], display.merge({
          panes
        }))
        .set('panes', state.panes.without(pane.uid))
        .set('active', state.active.merge({
          pane: (panes[next] ? panes[next] : null),
          display: display.uid
        }));
  return state;
}

export function arrow(state, action) {
  const {panes, displays} = state;
  const {arrow} = action;
  const pane = state.active.pane;
  const display = state.displays[state.active.display];
  const indexOf = display.panes.indexOf(pane);
  switch (action.arrow) {
    case 'left':
      if(indexOf-1 >= 0 ) {
        return setActive(state, display.panes[indexOf-1] )
      }
      return state;
    case 'right':
    console.log(indexOf+1);
      if(indexOf+1 <= display.panes.length-1 ) {
        return setActive(state, display.panes[indexOf+1] )
      }
      return state;
    case 'up':
    if (display.ref) {
      return setActive(state, display.ref )
    }
    return state;
    case 'down':
    const nexts = Object.keys(displays).map(uid => displays[uid])
    .find(display => {
      return display.ref === pane;
    });
    if (nexts && nexts.panes) {
      return setActive(state, nexts.panes[0])
    }
    return state;
    default:
      return state;
  }
}