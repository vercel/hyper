import {connect} from '../utils/plugins';
import Hyper from '../UI/hyper';
import {tabChange} from '../communication/actions/tab';

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
      tabChange(num) {
        dispatch(tabChange(num));
      }
    };
  },
  null,
  {withRef: true}
)(Hyper, 'Hyper');

export default HyperConnector;
