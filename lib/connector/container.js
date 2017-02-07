import {connect} from '../utils/plugins';
import Container from '../UI/main/container';
import {select, directionalSwitch} from '../communication/actions/pane';
// import {sendData, resize, init} from '../communication/actions/pty';
import {resize, init} from '../communication/actions/pty';

const ContainerConnector = connect(
  state => {
    const {active, panes, displays} = state.base;
    const {write} = state.ptys;
    return {
      active,
      panes,
      displays,
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
      onArrow(arrow) {
        dispatch(directionalSwitch(arrow));
      },
      // onData(uid, data) {
      //   dispatch(sendData(uid, data));
      // },
      onResize(uid, cols, rows) {
        dispatch(resize(uid, cols, rows));
      }
    };
  },
  null,
  {withRef: true}
)(Container, 'Container');

export default ContainerConnector;
