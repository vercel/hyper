import Notifications from '../components/notifications';
import {installUpdate} from '../actions/updater';
import {connect} from '../utils/plugins';
import {dismissNotification} from '../actions/notifications';

const NotificationsContainer = connect(
  state => {
    const {ui} = state;
    const {notifications} = ui;
    const state_ = {};

    if (notifications.font) {
      const fontSize = ui.fontSizeOverride || ui.fontSize;

      Object.assign(state_, {
        fontShowing: true,
        fontSize,
        fontText: `${fontSize}px`
      });
    }

    if (notifications.resize) {
      const cols = ui.cols;
      const rows = ui.rows;

      Object.assign(state_, {
        resizeShowing: true,
        cols,
        rows
      });
    }

    if (notifications.updates) {
      Object.assign(state_, {
        updateShowing: true,
        updateVersion: ui.updateVersion,
        updateNote: ui.updateNotes.split('\n')[0],
        updateReleaseUrl: ui.updateReleaseUrl,
        updateCanInstall: ui.updateCanInstall
      });
    } else if (notifications.message) {
      Object.assign(state_, {
        messageShowing: true,
        messageText: ui.messageText,
        messageURL: ui.messageURL,
        messageDismissable: ui.messageDismissable
      });
    }

    return state_;
  },
  dispatch => {
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
  }
)(Notifications, 'Notifications');

export default NotificationsContainer;
