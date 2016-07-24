import { requestSession } from './sessions';

export function init () {
  return (dispatch) => {
    dispatch(requestSession());
  };
}
