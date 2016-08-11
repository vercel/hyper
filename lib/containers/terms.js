import Terms from '../components/terms';
import { values } from '../utils/object';
import { connect } from '../utils/plugins';
import {
  resizeSession,
  sendSessionData,
  exitSessionBrowser,
  setSessionXtermTitle,
  setActiveSession
} from '../actions/sessions';

const TermsContainer = connect(
  (state) => {
    const sessions = state.sessions.sessions;
    return {
      cols: state.ui.cols,
      rows: state.ui.rows,
      sessions: values(sessions),
      activeSession: state.sessions.activeUid,
      customCSS: state.ui.termCSS,
      write: state.sessions.write,
      fontSize: state.ui.fontSizeOverride
        ? state.ui.fontSizeOverride
        : state.ui.fontSize,
      fontFamily: state.ui.fontFamily,
      fontSmoothing: state.ui.fontSmoothingOverride,
      padding: state.ui.padding,
      cursorColor: state.ui.cursorColor,
      cursorShape: state.ui.cursorShape,
      borderColor: state.ui.borderColor,
      colors: state.ui.colors,
      foregroundColor: state.ui.foregroundColor,
      backgroundColor: state.ui.backgroundColor,
      bell: state.ui.bell,
      bellSoundURL: state.ui.bellSoundURL,
      copyOnSelect: state.ui.copyOnSelect
    };
  },
  (dispatch) => {
    return {
      onData (uid, data) {
        dispatch(sendSessionData(uid, data));
      },

      onTitle (uid, title) {
        dispatch(setSessionXtermTitle(uid, title));
      },

      onResize (uid, cols, rows) {
        dispatch(resizeSession(uid, cols, rows));
      },

      onURLAbort (uid) {
        dispatch(exitSessionBrowser(uid));
      },

      onActive (uid) {
        dispatch(setActiveSession(uid));
      }
    };
  },
  null,
  { withRef: true }
)(Terms, 'Terms');

export default TermsContainer;
