import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import rootReducer from '../reducers/index';
import effects from '../utils/effects';
import * as plugins from '../utils/plugins';

export default () =>
  createStore(
    rootReducer,
    applyMiddleware(
      thunk,
      plugins.middleware,
      thunk,
      effects
    )
  );
