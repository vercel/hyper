import {combineReducers} from 'redux';
import ui from './ui';
import sessions from './sessions';
import base from './tabs';
import ptys from './ptys';

// import termGroups from './term-groups';

export default combineReducers({
  ui,
  sessions,
  base,
  ptys
  // termGroups
});
