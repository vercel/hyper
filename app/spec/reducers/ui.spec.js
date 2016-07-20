import { describe } from 'ava-spec';
import { reducer, initialState } from '../../lib/reducers/ui';
import { CONFIG_LOAD, CONFIG_RELOAD } from '../../lib/constants/config';
import { UI_FONT_SIZE_SET, UI_FONT_SIZE_RESET } from '../../lib/constants/ui';
import { NOTIFICATION_DISMISS } from '../../lib/constants/notifications';
import {
  SESSION_ADD,
  SESSION_RESIZE,
  SESSION_PTY_DATA,
  SESSION_PTY_EXIT,
  SESSION_SET_ACTIVE
} from '../../lib/constants/sessions';
import { UPDATE_AVAILABLE } from '../../lib/constants/updater';

describe('UI reducer', () => {
  describe('on @@redux/INIT', it => {
    const state = undefined;
    const action = { type: '@@redux/INIT' };

    it('should return initial state', t => {
      t.deepEqual(reducer(state, action), initialState);
    });
  });

  describe('on CONFIG_LOAD', it => {
    const config = { cursorColor: '#f2f2f2' };
    const state = initialState;
    const action = { type: CONFIG_LOAD, config };

    it('should return the state with updated properties', t => {
      t.deepEqual(reducer(state, action), state.merge(config));
    });
  });

  describe('on CONFIG_RELOAD', it => {
    const config = { cursorColor: '#f2f2f2' };
    const state = initialState;
    const action = { type: CONFIG_RELOAD, config };

    it('should return the state with updated properties', t => {
      t.deepEqual(reducer(state, action), state.merge(config));
    });
  });

  describe('on SESSION_ADD', it => {
    const uid = 'mysession';
    const state = initialState;
    const action = { type: SESSION_ADD, uid };

    it('should update timestamp on openAt based on action uid', t => {
      const result = reducer(state, action);
      t.truthy(result.openAt.mysession);
    });
  });

  describe('on SESSION_RESIZE', it => {
    const size = 10;
    const state = initialState;
    const action = { type: SESSION_RESIZE, rows: size, cols: size };

    it('should update rows', t => {
      const result = reducer(state, action);
      t.is(result.rows, size);
    });

    it('should update cols', t => {
      const result = reducer(state, action);
      t.is(result.cols, size);
    });
    
    it('should update resizeAt', t => {
      const result = reducer(state, action);
      t.truthy(result.resizeAt);
    });
  });

  describe('on SESSION_PTY_EXIT', it => {
    const uid = 'mysession';
    const state = initialState
      .setIn(['openAt', uid], Date.now())
      .setIn(['activityMarkers', uid], false);
    const action = { type: SESSION_PTY_EXIT, uid };

    it('should remove openAt key corresponding to action uid', t => {
      const result = reducer(state, action);
      t.is(result.openAt.mysession, undefined);
    });

    it('should remove activityMarkers key corresponding to action uid', t => {
      const result = reducer(state, action);
      t.is(result.activityMarkers.mysession, undefined);
    });
  });

  describe('on SESSION_SET_ACTIVE', it => {
    const uid = 'mysession';
    const state = initialState
      .setIn(['activityMarkers', uid], true);
    const action = { type: SESSION_SET_ACTIVE, uid };

    it('should set activeUid based on action uid', t => {
      const result = reducer(state, action);
      t.is(result.activeUid, uid);
    });

    it('should set action uid key to false on activityMarkers', t => {
      const result = reducer(state, action);
      t.false(result.activityMarkers.mysession);
    });
  });

  describe('on SESSION_PTY_DATA', () => {
    describe('when action uid is equal to activeUid', it => {
      const uid = 'mysession';
      const state = initialState.set('activeUid', uid);
      const action = { type: SESSION_PTY_DATA, uid };

      it('should not update state', t => {
        t.deepEqual(reducer(state, action), state);
      });
    });

    describe('when action time is at least 1000ms after session open', it => {
      const uid = 'mysession';
      const state = initialState.setIn(['openAt', uid], Date.now());
      const action = { type: SESSION_PTY_DATA, uid };

      it('should not update state', t => {
        t.deepEqual(reducer(state, action), state);
      });
    });

    describe('when action time is at least 1000ms after a resize event', it => {
      const uid = 'mysession';
      const state = initialState.set('resizeAt', Date.now());
      const action = { type: SESSION_PTY_DATA, uid };

      it('should not update state', t => {
        t.deepEqual(reducer(state, action), state);
      });
    });

    describe('when action time is not too close to a resize event', it => {
      const uid = 'mysession';
      const state = initialState;
      const action = { type: SESSION_PTY_DATA, uid };

      it('should set action uid key to true on activityMarkers', t => {
        const result = reducer(state, action);
        t.true(result.activityMarkers.mysession);
      });
    });
  });

  describe('on UI_FONT_SIZE_SET', it => {
    const value = 14;
    const state = initialState;
    const action = { type: UI_FONT_SIZE_SET, value };

    it('should assign action.value to fontSizeOverride', t => {
      const result = reducer(state, action);
      t.is(result.fontSizeOverride, value);
    });
  });

  describe('on UI_FONT_SIZE_RESET', it => {
    const state = initialState;
    const action = { type: UI_FONT_SIZE_RESET };

    it('should assign null to fontSizeOverride', t => {
      const result = reducer(state, action);
      t.is(result.fontSizeOverride, null);
    });
  });

  describe('on NOTIFICATION_DISMISS', it => {
    const id = 'mynotification';
    const state = initialState.setIn(['notifications', id], true);
    const action = { type: NOTIFICATION_DISMISS, id };

    it('should set action uid key to false on notifications', t => {
      const result = reducer(state, action);
      t.false(result.notifications.mynotification);
    });
  });

  describe('on UPDATE_AVAILABLE', it => {
    const version = '1.0.0';
    const notes = 'awesome note';
    const state = initialState;
    const action = { type: UPDATE_AVAILABLE, version, notes };

    it('should assign action.version to updateVersion', t => {
      const result = reducer(state, action);
      t.is(result.updateVersion, version);
    });

    it('should assign action.notes to updateNotes', t => {
      const result = reducer(state, action);
      t.is(result.updateNotes, notes);
    });
  });

  describe('on any action type', () => {
    describe('when rows or cols have been changed', it => {
      const size = 10;
      const state = initialState.set('rows', 1).set('cols', 1);
      const action = { type: SESSION_RESIZE, rows: size, cols: size };

      it('should set resize key to true on notifications', t => {
        const result = reducer(state, action);
        t.true(result.notifications.resize);
      });
    });

    describe('when updateVersion have been changed', it => {
      const version = '1.0.0';
      const state = initialState;
      const action = { type: UPDATE_AVAILABLE, version };

      it('should set updates key to true on notifications', t => {
        const result = reducer(state, action);
        t.true(result.notifications.updates);
      });
    });

    describe('when any of the font size values change and action type is not CONFIG_LOAD', it => {
      const config = { fontSize: 14 };
      const state = initialState;
      const action = { type: CONFIG_RELOAD, config };

      it('should set font key to true on notifications', t => {
        const result = reducer(state, action);
        t.true(result.notifications.font);
      });
    });
  });
});
