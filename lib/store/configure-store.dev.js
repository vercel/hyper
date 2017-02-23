import {createStore, applyMiddleware, compose} from 'redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import rootReducer from '../reducers/index';
import effects from '../utils/effects';
import * as plugins from '../utils/plugins';
import writeMiddleware from './write-middleware';

export default () => {
  const logger = createLogger({
    level: 'info',
    collapsed: true
  });

  const enhancer = compose(
    applyMiddleware(
      thunk,
      plugins.middleware,
      thunk,
      effects,
      writeMiddleware,
      logger
    ),
    window.devToolsExtension()
  );

  return createStore(
    rootReducer,
    enhancer
  );
};
