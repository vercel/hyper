import Terms from '../components/terms';
import {connect} from '../utils/plugins';
import {
  resizeSession,
  sendSessionData,
  exitSessionBrowser,
  setSessionXtermTitle,
  setActiveSession
} from '../actions/sessions';
import getRootGroups from '../selectors';

const TermsContainer = connect(
  state => {
    const {sessions} = state.sessions;
    return {
      sessions,
      cols: state.ui.cols,
      rows: state.ui.rows,
      termGroups: getRootGroups(state),
      activeRootGroup: state.termGroups.activeRootGroup,
      activeSession: state.sessions.activeUid,
      customCSS: state.ui.termCSS,
      write: state.sessions.write,
      fontSize: state.ui.fontSizeOverride ?
        state.ui.fontSizeOverride :
        state.ui.fontSize,
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
      copyOnSelect: state.ui.copyOnSelect,
      modifierKeys: state.ui.modifierKeys
    };
  },
  dispatch => {
    return {
      onData(uid, data) {
        dispatch(sendSessionData(uid, data));
      },

      onTitle(uid, title) {
        // we need to trim the title because `cmd.exe` likes to report ' ' as the title
        dispatch(setSessionXtermTitle(uid, title.trim()));
      },

      onResize(uid, cols, rows) {
        dispatch(resizeSession(uid, cols, rows));
      },

      onURLAbort(uid) {
        dispatch(exitSessionBrowser(uid));
      },

      onActive(uid) {
        dispatch(setActiveSession(uid));
      }
    };
  },
  null,
  {withRef: true}
)(Terms, 'Terms');

export default TermsContainer;
