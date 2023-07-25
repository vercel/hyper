import {createStore, applyMiddleware} from 'redux';
import type {ThunkMiddleware} from 'redux-thunk';
import _thunk from 'redux-thunk';
import rootReducer from '../reducers/index';
import effects from '../utils/effects';
import * as plugins from '../utils/plugins';
import writeMiddleware from './write-middleware';
import type {HyperState, HyperActions} from '../../typings/hyper';
const thunk: ThunkMiddleware<HyperState, HyperActions> = _thunk;

const configureStoreForProd = () =>
  createStore(rootReducer, applyMiddleware(thunk, plugins.middleware, thunk, writeMiddleware, effects));

export default configureStoreForProd;
