import {combineReducers} from 'redux';
import ui from './ui';
import sessions from './sessions';
import termGroups from './term-groups';

export default combineReducers({
  ui,
  sessions,
  termGroups
});
