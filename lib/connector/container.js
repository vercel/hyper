import {connect} from '../utils/plugins';
import Container from '../UI/main/container';
import {select} from '../communication/actions/pane';
import {sendData, resize, init} from '../communication/actions/pty';

const ContainerConnector = connect(
  state => {
    const {layouts, active, panes} = state.base;
    const {write} = state.ptys;
    return {
      active,
      layouts,
      panes,
      write
    };
  },
  dispatch => {
    return {
      onSelect: uid => {
        dispatch(select(uid));
      },
      onInit(uid, cols, rows) {
        dispatch(init(uid, cols, rows));
      },
      onData(uid, data) {
        dispatch(sendData(uid, data));
      },
      onResize(uid, cols, rows) {
        dispatch(resize(uid, cols, rows));
      },
    };
  },
  null,
  {withRef: true}
)(Container, 'Container');

export default ContainerConnector;
