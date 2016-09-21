import {combineReducers} from 'redux';
import ui from './ui';
import sessions from './sessions';

export default combineReducers({
  ui,
  sessions
});
