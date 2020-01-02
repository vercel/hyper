import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import rootReducer from '../reducers/index';
import effects from '../utils/effects';
import * as plugins from '../utils/plugins';
import writeMiddleware from './write-middleware';
import {HyperState, HyperThunkDispatch} from '../hyper';

export default () =>
  createStore(
    rootReducer,
    applyMiddleware<HyperThunkDispatch, HyperState>(thunk, plugins.middleware, thunk, writeMiddleware, effects)
  );
