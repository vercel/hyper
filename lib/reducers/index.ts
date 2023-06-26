import type {Reducer} from 'redux';
import {combineReducers} from 'redux';
import ui from './ui';
import sessions from './sessions';
import termGroups from './term-groups';
import type {HyperActions, HyperState} from '../hyper';

export default combineReducers({
  ui,
  sessions,
  termGroups
}) as Reducer<HyperState, HyperActions>;
