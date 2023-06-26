import type {HyperActions, HyperState} from '../hyper';
import terms from '../terms';
import type {Dispatch, Middleware} from 'redux';

// the only side effect we perform from middleware
// is to write to the react term instance directly
// to avoid a performance hit
const writeMiddleware: Middleware<{}, HyperState, Dispatch<HyperActions>> = () => (next) => (action: HyperActions) => {
  if (action.type === 'SESSION_PTY_DATA') {
    const term = terms[action.uid];
    if (term) {
      term.term.write(action.data);
    }
  }
  next(action);
};

export default writeMiddleware;
