import Header from '../components/header';
import { closeTab, changeTab, maximize, unmaximize } from '../actions/header';
import { values } from '../utils/object';
import { createSelector } from 'reselect';
import { connect } from '../utils/plugins';

const isMac = /Mac/.test(navigator.userAgent);

const getSessions = (sessions) => sessions.sessions;
const getActiveUid = (sessions) => sessions.activeUid;
const getActivityMarkers = (sessions, ui) => ui.activityMarkers;
const getTabs = createSelector(
  [getSessions, getActiveUid, getActivityMarkers],
  (sessions, activeUid, activityMarkers) => values(sessions).map((s) => {
    return {
      uid: s.uid,
      title: s.title,
      isActive: s.uid === activeUid,
      hasActivity: activityMarkers[s.uid]
    };
  })
);

const HeaderContainer = connect(
  (state) => {
    return {
      // active is an index
      isMac,
      tabs: getTabs(state.sessions, state.ui),
      activeMarkers: state.ui.activityMarkers,
      borderColor: state.ui.borderColor,
      backgroundColor: state.ui.backgroundColor,
      maximized: state.ui.maximized
    };
  },
  (dispatch) => {
    return {
      onCloseTab: (i) => {
        dispatch(closeTab(i));
      },

      onChangeTab: (i) => {
        dispatch(changeTab(i));
      },

      maximize: () => {
        dispatch(maximize());
      },

      unmaximize: () => {
        dispatch(unmaximize());
      }
    };
  }
)(Header, 'Header');

export default HeaderContainer;
