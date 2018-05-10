import Terms from '../components/terms';
import {connect} from '../utils/plugins';
import {
  resizeSession,
  sendSessionData,
  exitSessionBrowser,
  setSessionXtermTitle,
  setActiveSession
} from '../actions/sessions';
import {openContextMenu} from '../actions/ui';
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
      fontSize: state.ui.fontSizeOverride ? state.ui.fontSizeOverride : state.ui.fontSize,
      fontFamily: state.ui.fontFamily,
      fontWeight: state.ui.fontWeight,
      fontWeightBold: state.ui.fontWeightBold,
      lineHeight: state.ui.lineHeight,
      letterSpacing: state.ui.letterSpacing,
      uiFontFamily: state.ui.uiFontFamily,
      fontSmoothing: state.ui.fontSmoothingOverride,
      padding: state.ui.padding,
      cursorColor: state.ui.cursorColor,
      cursorAccentColor: state.ui.cursorAccentColor,
      cursorShape: state.ui.cursorShape,
      cursorBlink: state.ui.cursorBlink,
      borderColor: state.ui.borderColor,
      selectionColor: state.ui.selectionColor,
      colors: state.ui.colors,
      foregroundColor: state.ui.foregroundColor,
      backgroundColor: state.ui.backgroundColor,
      bell: state.ui.bell,
      bellSoundURL: state.ui.bellSoundURL,
      copyOnSelect: state.ui.copyOnSelect,
      modifierKeys: state.ui.modifierKeys,
      quickEdit: state.ui.quickEdit
    };
  },
  dispatch => {
    return {
      onData(uid, data) {
        dispatch(sendSessionData(uid, data));
      },

      onTitle(uid, title) {
        dispatch(setSessionXtermTitle(uid, title));
      },

      onResize(uid, cols, rows) {
        dispatch(resizeSession(uid, cols, rows));
      },

      onURLAbort(uid) {
        dispatch(exitSessionBrowser(uid));
      },

      onActive(uid) {
        dispatch(setActiveSession(uid));
      },

      onContextMenu(uid, selection) {
        dispatch(setActiveSession(uid));
        dispatch(openContextMenu(uid, selection));
      }
    };
  },
  null,
  {withRef: true}
)(Terms, 'Terms');

export default TermsContainer;
