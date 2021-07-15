import {combineReducers, Reducer} from 'redux';
import ui from './ui';
import sessions from './sessions';
import termGroups from './term-groups';
import {HyperActions, HyperState} from '../hyper';

export default combineReducers({
  ui,
  sessions,
  termGroups
}) as Reducer<HyperState, HyperActions>;
