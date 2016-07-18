import { describe } from 'ava-spec';
import {
  reducer,
  initialState,
  Session,
  Write
} from '../../lib/reducers/sessions';
import {
  SESSION_ADD,
  SESSION_PTY_EXIT,
  SESSION_USER_EXIT,
  SESSION_PTY_DATA,
  SESSION_SET_ACTIVE,
  SESSION_CLEAR_ACTIVE,
  SESSION_URL_SET,
  SESSION_URL_UNSET,
  SESSION_SET_XTERM_TITLE,
  SESSION_SET_PROCESS_TITLE
} from '../../lib/constants/sessions';

describe('Sessions reducer', () => {
  describe('on @@redux/INIT', it => {
    const state = undefined;
    const action = { type: '@@redux/INIT' };

    it('should return initial state', t => {
      t.deepEqual(reducer(state, action), initialState);
    });
  });

  describe('on SESSION_ADD', it => {
    const state = initialState;
    const action = { type: SESSION_ADD, uid: 'mysession', pid: 1, shell: '/my/shell' };

    it('should add a session to the state based on its uid', t => {
      const result = reducer(state, action);

      t.deepEqual(result.sessions, {
        mysession: {
          uid: 'mysession', title: '', write: null, url: null, cleared: false, shell: 'shell', pid: 1 
        }
      });
    });
  });

  describe('on SESSION_URL_SET', it => {
    const uid = 'mysession';
    const url = '/my/url';
    const state = initialState.setIn(['sessions', uid], Session({ uid }));
    const action = { type: SESSION_URL_SET, uid, url };

    it('should set the url on the action uid\'s session', t => {
      const result = reducer(state, action);
      
      t.is(result.sessions.mysession.url, url);
    });
  });

  describe('on SESSION_URL_UNSET', it => {
    const uid = 'mysession';
    const url = '/my/url';
    const state = initialState.setIn(['sessions', uid], Session({ uid, url }));
    const action = { type: SESSION_URL_UNSET, uid };

    it('should assign url as null on the action uid\'s session', t => {
      const result = reducer(state, action);
      
      t.is(result.sessions.mysession.url, null);
    });
  });

  describe('on SESSION_SET_ACTIVE', it => {
    const uid = 'mysession';
    const state = initialState.setIn(['sessions', uid], Session({ uid }));
    const action = { type: SESSION_SET_ACTIVE, uid };

    it('should set activeUid on session based on action uid', t => {
      const result = reducer(state, action);

      t.is(result.activeUid, uid);
    });
  });

  describe('on SESSION_CLEAR_ACTIVE', it => {
    const uid = 'mysession';
    const state = initialState
      .setIn(['sessions', uid], Session({ uid }))
      .setIn(['activeUid'], uid);
    const action = { type: SESSION_CLEAR_ACTIVE };

    it('should set "cleared: true" on state\'s active session', t => {
      const result = reducer(state, action);

      t.true(result.sessions.mysession.cleared);
    });
  });

  describe('on SESSION_PTY_DATA', it => {
    const uid = 'mysession';
    const data = { a: 'b' };
    const state = initialState.setIn(['sessions', uid], Session({ uid }));
    const action = { type: SESSION_PTY_DATA, uid, data };

    it('should set write on state based on action data', t => {
      const result = reducer(state, action);

      t.deepEqual(result.write, Write(action));
      t.false(result.sessions.mysession.cleared);
    });
  });

  describe('on SESSION_PTY_EXIT', () => {
    describe('when session is on state', it => {
      const uid = 'mysession';
      const state = initialState.setIn(['sessions', uid], Session({ uid }));
      const action = { type: SESSION_PTY_EXIT, uid };

      it('should remove session from state', t => {
        const result = reducer(state, action);

        t.is(result.sessions.mysession, undefined);
      });
    });

    describe('when session is not on state', it => {
      const uid = 'mysession';
      const state = initialState.setIn(['sessions', uid], Session({ uid }));
      const action = { type: SESSION_PTY_EXIT, uid: 'anotherUid' };

      it('should return current state', t => {
        t.deepEqual(reducer(state, action), state);
      });
    });
  });

  describe('on SESSION_USER_EXIT', it => {
    const uid = 'mysession';
    const state = initialState.setIn(['sessions', uid], Session({ uid }));
    const action = { type: SESSION_USER_EXIT, uid };

    it('should remove session from state', t => {
      const result = reducer(state, action);

      t.is(result.sessions.mysession, undefined);
    });
  });

  describe('on SESSION_SET_XTERM_TITLE', it => {
    const uid = 'mysession';
    const title = 'mytitle';
    const state = initialState.setIn(['sessions', uid], Session({ uid }));
    const action = { type: SESSION_SET_XTERM_TITLE, uid, title };

    it('should set title on session based on action uid', t => {
      const result = reducer(state, action);
      t.is(result.sessions.mysession.title, title);
    });
  });

  describe('on SESSION_SET_PROCESS_TITLE', it => {
    const uid = 'mysession';
    const title = 'mytitle';
    const state = initialState.setIn(['sessions', uid], Session({ uid }));
    const action = { type: SESSION_SET_PROCESS_TITLE, uid, title };

    it('should set title on session based on action uid', t => {
      const result = reducer(state, action);
      t.is(result.sessions.mysession.title, title);
    });
  });
});
