import Immutable from 'seamless-immutable';
import {decorateSessionsReducer} from '../utils/plugins';
import {
  SESSION_ADD,
  SESSION_PTY_EXIT,
  SESSION_USER_EXIT,
  SESSION_PTY_DATA,
  SESSION_SET_ACTIVE,
  SESSION_CLEAR_ACTIVE,
  SESSION_RESIZE,
  SESSION_SET_XTERM_TITLE,
  SESSION_SET_CWD,
  SESSION_SEARCH
} from '../constants/sessions';
import {sessionState, session, Mutable, ISessionReducer} from '../hyper';

const initialState: sessionState = Immutable<Mutable<sessionState>>({
  sessions: {},
  activeUid: null
});

function Session(obj: Immutable.DeepPartial<session>) {
  const x: session = {
    uid: '',
    title: '',
    cols: null,
    rows: null,
    url: null,
    cleared: false,
    search: false,
    shell: '',
    pid: null
  };
  return Immutable(x).merge(obj);
}

function deleteSession(state: sessionState, uid: string) {
  return state.updateIn(['sessions'], (sessions: (typeof state)['sessions']) => {
    const sessions_ = sessions.asMutable();
    delete sessions_[uid];
    return sessions_;
  });
}

const reducer: ISessionReducer = (state = initialState, action) => {
  switch (action.type) {
    case SESSION_ADD:
      return state.set('activeUid', action.uid).setIn(
        ['sessions', action.uid],
        Session({
          cols: action.cols,
          rows: action.rows,
          uid: action.uid,
          shell: action.shell ? action.shell.split('/').pop() : null,
          pid: action.pid
        })
      );

    case SESSION_SET_ACTIVE:
      return state.set('activeUid', action.uid);

    case SESSION_SEARCH:
      return state.setIn(['sessions', action.uid, 'search'], action.value);

    case SESSION_CLEAR_ACTIVE:
      return state.merge(
        {
          sessions: {
            [state.activeUid!]: {
              cleared: true
            }
          }
        },
        {deep: true}
      );

    case SESSION_PTY_DATA:
      // we avoid a direct merge for perf reasons
      // as this is the most common action
      if (state.sessions[action.uid]?.cleared) {
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
