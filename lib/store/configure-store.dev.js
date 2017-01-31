import {createStore, applyMiddleware, compose} from 'redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import rootReducer from '../reducers/index';
import effects from '../utils/effects';
import * as plugins from '../utils/plugins';

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
      logger
    ),
    window.devToolsExtension()
  );

  return createStore(
    rootReducer,
    enhancer
  );
};
