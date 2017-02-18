import {connect} from '../utils/plugins';
import Hyper from '../UI/hyper';

const isMac = /Mac/.test(navigator.userAgent);

const HyperConnector = connect(
  state => {
    return {
      isMac,
      customCSS: state.ui.css,
      borderColor: state.ui.borderColor,
      activeSession: state.sessions.activeUid,
      backgroundColor: state.ui.backgroundColor
    };
  },
  dispatch => {
    return {
    };
  },
  null,
  {withRef: true}
)(Hyper, 'Hyper');

export default HyperConnector;
