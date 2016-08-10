import Header from '../components/header';
import { closeTab, changeTab, maximize, unmaximize } from '../actions/header';
import { createSelector } from 'reselect';
import { connect } from '../utils/plugins';
import { getRootGroups } from '../selectors';

const isMac = /Mac/.test(navigator.userAgent);

const getSessions = ({ sessions }) => sessions.sessions;
const getActiveRootGroup = ({ termGroups }) => termGroups.activeRootGroup;
const getActivityMarkers = ({ ui }) => ui.activityMarkers;
const getTabs = createSelector(
  [getSessions, getRootGroups, getActiveRootGroup, getActivityMarkers],
  (sessions, rootGroups, activeRootGroup, activityMarkers) => rootGroups.map((t) => {
    const session = sessions[t.activeSessionUid];
    return {
      uid: t.uid,
      title: session.title,
      isActive: t.uid === activeRootGroup,
      hasActivity: activityMarkers[session.uid]
    };
  })
);

const HeaderContainer = connect(
  (state) => {
    return {
      // active is an index
      isMac,
      tabs: getTabs(state),
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
