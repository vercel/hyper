import Notifications from '../components/notifications';
import { installUpdate } from '../actions/updater';
import { connect } from '../utils/plugins';
import { dismissNotification } from '../actions/notifications';

const NotificationsContainer = connect(
  (state) => {
    const { ui } = state;
    const { notifications } = ui;
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
        updateNote: ui.updateNotes.split('\n')[0]
      });
    }

    return state_;
  },
  (dispatch) => {
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
      onUpdateInstall: () => {
        dispatch(installUpdate());
      }
    };
  }
)(Notifications, 'Notifications');

export default NotificationsContainer;
