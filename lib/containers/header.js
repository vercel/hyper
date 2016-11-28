/* eslint-disable max-params */
import {createSelector} from 'reselect';

import Header from '../components/header';
import {closeTab, changeTab, maximize, openHamburgerMenu, unmaximize, minimize, close} from '../actions/header';
import {connect} from '../utils/plugins';
import getRootGroups from '../selectors';

const isMac = /Mac/.test(navigator.userAgent);

const getSessions = ({sessions}) => sessions.sessions;
const getActiveRootGroup = ({termGroups}) => termGroups.activeRootGroup;
const getActiveSessions = ({termGroups}) => termGroups.activeSessions;
const getActivityMarkers = ({ui}) => ui.activityMarkers;
const getTabs = createSelector(
  [getSessions, getRootGroups, getActiveSessions, getActiveRootGroup, getActivityMarkers],
  (sessions, rootGroups, activeSessions, activeRootGroup, activityMarkers) => rootGroups.map(t => {
    const activeSessionUid = activeSessions[t.uid];
    const session = sessions[activeSessionUid];
    return {
      uid: t.uid,
      title: session.title,
      isActive: t.uid === activeRootGroup,
      hasActivity: activityMarkers[session.uid]
    };
  })
);

const HeaderContainer = connect(
  state => {
    return {
      // active is an index
      isMac,
      tabs: getTabs(state),
      activeMarkers: state.ui.activityMarkers,
      borderColor: state.ui.borderColor,
      backgroundColor: state.ui.backgroundColor,
      maximized: state.ui.maximized,
      showHamburgerMenu: state.ui.showHamburgerMenu,
      showWindowControls: state.ui.showWindowControls
    };
  },
  dispatch => {
    return {
      onCloseTab: i => {
        dispatch(closeTab(i));
      },

      onChangeTab: i => {
        dispatch(changeTab(i));
      },

      maximize: () => {
        dispatch(maximize());
      },

      unmaximize: () => {
        dispatch(unmaximize());
      },

      openHamburgerMenu: coordinates => {
        dispatch(openHamburgerMenu(coordinates));
      },

      minimize: () => {
        dispatch(minimize());
      },

      close: () => {
        dispatch(close());
      }
    };
  }
)(Header, 'Header');

export default HeaderContainer;
