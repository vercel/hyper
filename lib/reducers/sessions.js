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
  SESSION_SET_XTERM_TITLE,
  SESSION_SET_CWD
} from '../constants/sessions';

const initialState = Immutable({
  sessions: {},
  activeUid: null
});

function Session(obj) {
  return Immutable({
    uid: '',
    title: '',
    cols: null,
    rows: null,
    url: null,
    cleared: false,
    shell: '',
    pid: null
  }).merge(obj);
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SESSION_ADD:
      return state.set('activeUid', action.uid).setIn(
        ['sessions', action.uid],
        Session({
          cols: action.cols,
          rows: action.rows,
          uid: action.uid,
          shell: action.shell.split('/').pop(),
          pid: action.pid
        })
      );

    case SESSION_URL_SET:
      return state.setIn(['sessions', action.uid, 'url'], action.url);

    case SESSION_URL_UNSET:
      return state.setIn(['sessions', action.uid, 'url'], null);

    case SESSION_SET_ACTIVE:
      return state.set('activeUid', action.uid);

    case SESSION_CLEAR_ACTIVE:
      return state.merge(
        {
          sessions: {
            [state.activeUid]: {
              cleared: true
            }
          }
        },
        {deep: true}
      );

    case SESSION_PTY_DATA:
      // we avoid a direct merge for perf reasons
      // as this is the most common action
      if (state.sessions[action.uid] && state.sessions[action.uid].cleared) {
        return state.merge(
          {
            sessions: {
              [action.uid]: {
                cleared: false
              }
            }
          },
          {deep: true}
        );
      }
      return state;

    case SESSION_PTY_EXIT:
      if (state.sessions[action.uid]) {
        return deleteSession(state, action.uid);
      }
      // eslint-disable-next-line no-console
      console.log('ignore pty exit: session removed by user');
      return state;

    case SESSION_USER_EXIT:
      return deleteSession(state, action.uid);

    case SESSION_SET_XTERM_TITLE:
      return state.setIn(
        ['sessions', action.uid, 'title'],
        // we need to trim the title because `cmd.exe`
        // likes to report ' ' as the title
        action.title.trim()
      );

    case SESSION_RESIZE:
      return state.setIn(
        ['sessions', action.uid],
        state.sessions[action.uid].merge({
          rows: action.rows,
          cols: action.cols,
          resizeAt: action.now
        })
      );

    case SESSION_SET_CWD:
      if (state.activeUid) {
        return state.setIn(['sessions', state.activeUid, 'cwd'], action.cwd);
      }
      return state;

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
