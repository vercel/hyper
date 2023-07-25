import type {HyperState, HyperDispatch} from '../../typings/hyper';
import {
  resizeSession,
  sendSessionData,
  setSessionXtermTitle,
  setActiveSession,
  openSearch,
  closeSearch
} from '../actions/sessions';
import {openContextMenu} from '../actions/ui';
import Terms from '../components/terms';
import {getRootGroups} from '../selectors';
import {connect} from '../utils/plugins';

const mapStateToProps = (state: HyperState) => {
  const {sessions} = state.sessions;
  return {
    sessions,
    cols: state.ui.cols,
    rows: state.ui.rows,
    scrollback: state.ui.scrollback,
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
    bellSound: state.ui.bellSound,
    copyOnSelect: state.ui.copyOnSelect,
    modifierKeys: state.ui.modifierKeys,
    quickEdit: state.ui.quickEdit,
    webGLRenderer: state.ui.webGLRenderer,
    webLinksActivationKey: state.ui.webLinksActivationKey,
    macOptionSelectionMode: state.ui.macOptionSelectionMode,
    disableLigatures: state.ui.disableLigatures,
    screenReaderMode: state.ui.screenReaderMode,
    windowsPty: state.ui.windowsPty,
    imageSupport: state.ui.imageSupport
  };
};

const mapDispatchToProps = (dispatch: HyperDispatch) => {
  return {
    onData(uid: string, data: string) {
      dispatch(sendSessionData(uid, data));
    },

    onTitle(uid: string, title: string) {
      dispatch(setSessionXtermTitle(uid, title));
    },

    onResize(uid: string, cols: number, rows: number) {
      dispatch(resizeSession(uid, cols, rows));
    },

    onActive(uid: string) {
      dispatch(setActiveSession(uid));
    },

    onOpenSearch(uid: string) {
      dispatch(openSearch(uid));
    },

    onCloseSearch(uid: string) {
      dispatch(closeSearch(uid));
    },

    onContextMenu(uid: string, selection: string) {
      dispatch(setActiveSession(uid));
      dispatch(openContextMenu(uid, selection));
    }
  };
};

const TermsContainer = connect(mapStateToProps, mapDispatchToProps, null, {forwardRef: true})(Terms, 'Terms');

export default TermsContainer;

export type TermsConnectedProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;
