// plugins/hyper-ccd-orchestrator/windowControls.js

/**
 * Window control actions for split and rename functionality
 */

const RENAME_TERMINAL = 'CCD_ORCH/RENAME_TERMINAL';
const SPLIT_VERTICAL = 'CCD_ORCH/SPLIT_VERTICAL';
const SPLIT_HORIZONTAL = 'CCD_ORCH/SPLIT_HORIZONTAL';

/**
 * Action to rename a terminal session
 */
function renameTerminal(uid, title) {
  return (dispatch) => {
    dispatch({
      type: 'SESSION_SET_XTERM_TITLE',
      uid,
      title
    });
    dispatch({
      type: RENAME_TERMINAL,
      uid,
      title
    });
  };
}

/**
 * Action to split terminal vertically
 */
function splitVertical(activeUid, profile) {
  return (dispatch, getState) => {
    const state = getState();
    const cwd = state.ui && state.ui.cwd ? state.ui.cwd : undefined;

    if (typeof window !== 'undefined' && window.rpc) {
      window.rpc.emit('new', {
        splitDirection: 'VERTICAL',
        cwd,
        activeUid,
        profile
      });
    }

    dispatch({
      type: SPLIT_VERTICAL,
      activeUid
    });
  };
}

/**
 * Action to split terminal horizontally
 */
function splitHorizontal(activeUid, profile) {
  return (dispatch, getState) => {
    const state = getState();
    const cwd = state.ui && state.ui.cwd ? state.ui.cwd : undefined;

    if (typeof window !== 'undefined' && window.rpc) {
      window.rpc.emit('new', {
        splitDirection: 'HORIZONTAL',
        cwd,
        activeUid,
        profile
      });
    }

    dispatch({
      type: SPLIT_HORIZONTAL,
      activeUid
    });
  };
}

module.exports = {
  RENAME_TERMINAL,
  SPLIT_VERTICAL,
  SPLIT_HORIZONTAL,
  renameTerminal,
  splitVertical,
  splitHorizontal
};
