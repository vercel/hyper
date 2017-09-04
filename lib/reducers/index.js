import {combineReducers} from 'redux';
import ui from './ui';
import tabs from './tabs';
import sessions from './sessions';
import termGroups from './term-groups';

export default combineReducers({
  ui,
  tabs,
  sessions,
  termGroups
});
