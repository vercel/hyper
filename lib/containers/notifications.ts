import type {HyperState, HyperDispatch} from '../../typings/hyper';
import {dismissNotification} from '../actions/notifications';
import {installUpdate} from '../actions/updater';
import Notifications from '../components/notifications';
import {connect} from '../utils/plugins';

const mapStateToProps = (state: HyperState) => {
  const {ui} = state;
  const {notifications} = ui;
  let state_: Partial<{
    fontShowing: boolean;
    fontSize: number;
    fontText: string;
    resizeShowing: boolean;
    cols: number | null;
    rows: number | null;
    updateShowing: boolean;
    updateVersion: string | null;
    updateNote: string | null;
    updateReleaseUrl: string | null;
    updateCanInstall: boolean | null;
    messageShowing: boolean;
    messageText: string | null;
    messageURL: string | null;
    messageDismissable: boolean | null;
  }> = {};

  if (notifications.font) {
    const fontSize = ui.fontSizeOverride || ui.fontSize;

    state_ = {
      ...state_,
      fontShowing: true,
      fontSize,
      fontText: `${fontSize}px`
    };
  }

  if (notifications.resize) {
    const cols = ui.cols;
    const rows = ui.rows;

    state_ = {
      ...state_,
      resizeShowing: true,
      cols,
      rows
    };
  }

  if (notifications.updates) {
    state_ = {
      ...state_,
      updateShowing: true,
      updateVersion: ui.updateVersion,
      updateNote: ui.updateNotes!.split('\n')[0],
      updateReleaseUrl: ui.updateReleaseUrl,
      updateCanInstall: ui.updateCanInstall
    };
  } else if (notifications.message) {
    state_ = {
      ...state_,
      messageShowing: true,
      messageText: ui.messageText,
      messageURL: ui.messageURL,
      messageDismissable: ui.messageDismissable
    };
  }

  return state_;
};

const mapDispatchToProps = (dispatch: HyperDispatch) => {
  return {
    onDismissFont: () => {
      dispatch(dismissNotification('font'));
    },
    onDismissResize: () => {
      dispatch(dismissNotification('resize'));
    },
    onDismissUpdate: () => {
      dispatch(dismissNotification('updates'));
    },
    onDismissMessage: () => {
      dispatch(dismissNotification('message'));
    },
    onUpdateInstall: () => {
      dispatch(installUpdate());
    }
  };
};

const NotificationsContainer = connect(mapStateToProps, mapDispatchToProps, null)(Notifications, 'Notifications');

export default NotificationsContainer;

export type NotificationsConnectedProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;
