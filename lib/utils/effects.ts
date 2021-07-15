/**
 * Simple redux middleware that executes
 * the `effect` field if provided in an action
 * since this is preceded by the `plugins`
 * middleware. It allows authors to interrupt,
 * defer or add to existing side effects at will
 * as the result of an action being triggered.
 */
import {Middleware} from 'redux';
const effectsMiddleware: Middleware = () => (next) => (action) => {
  const ret = next(action);
  if (action.effect) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    action.effect();
    delete action.effect;
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return ret;
};
export default effectsMiddleware;
