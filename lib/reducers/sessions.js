import Immutable from 'seamless-immutable';
import {decorateSessionsReducer} from '../utils/plugins';
import {
  SESSION_ADD,
  SESSION_PTY_EXIT,
  SESSION_USER_EXIT,
  SESSION_PTY_DATA,
  SESSION_SET_ACTIVE,
  SESSION_CLEAR_ACTIVE,
  SESSION_URL_SET,
  SESSION_URL_UNSET,
  SESSION_RESIZE,
  SESSION_SET_XTERM_TITLE
} from '../constants/sessions';

const initialState = Immutable({
  sessions: {},
  write: null,
  activeUid: null
});

function Session(obj) {
  return Immutable({
    uid: '',
    title: '',
    cols: null,
    rows: null,
    write: null,
    url: null,
    cleared: false,
    shell: '',
    pid: null
  }).merge(obj);
}

function Write(obj) {
  return Immutable({
    uid: '',
    data: ''
  }).merge(obj);
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SESSION_ADD:
      return state
        .set('activeUid', action.uid)
        .setIn(['sessions', action.uid], Session({
          cols: action.cols,
          rows: action.rows,
          uid: action.uid,
          shell: action.shell.split('/').pop(),
          pid: action.pid
        }));

    case SESSION_URL_SET:
      return state.setIn(['sessions', action.uid, 'url'], action.url);

    case SESSION_URL_UNSET:
      return state.setIn(['sessions', action.uid, 'url'], null);

    case SESSION_SET_ACTIVE:
      return state.set('activeUid', action.uid);

    case SESSION_CLEAR_ACTIVE:
      return state.merge({
        sessions: {
          [state.activeUid]: {
            cleared: true
          }
        }
      }, {deep: true});

    case SESSION_PTY_DATA:
      return state
        .set('write', Write(action))
        .merge({
          sessions: {
            [action.uid]: {
              cleared: false
            }
          }
        }, {deep: true});

    case SESSION_PTY_EXIT:
      if (state.sessions[action.uid]) {
        return deleteSession(state, action.uid);
      }
      console.log('ignore pty exit: session removed by user');
      return state;

    case SESSION_USER_EXIT:
      return deleteSession(state, action.uid);

    case SESSION_SET_XTERM_TITLE:
      return state.setIn(['sessions', action.uid, 'title'], action.title);

    case SESSION_RESIZE:
      return state.setIn(['sessions', action.uid], state.sessions[action.uid].merge({
        rows: action.rows,
        cols: action.cols,
        resizeAt: Date.now()
      }));

    default:
      return state;
  }
};

export default decorateSessionsReducer(reducer);

function deleteSession(state, uid) {
  return state.updateIn(['sessions'], sessions => {
    const sessions_ = sessions.asMutable();
    delete sessions_[uid];
    return sessions_;
  });
}
