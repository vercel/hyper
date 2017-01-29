import {connect} from '../utils/plugins';
import Container from '../UI/main/container';
import {select} from '../communication/actions/pane';
import {sendData} from '../communication/actions/pty';

const ContainerConnector = connect(
  state => {
    const {layouts, active, panes, write} = state.base;
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
      onData(uid, data) {
        dispatch(sendData(uid, data));
      },
    };
  },
  null,
  {withRef: true}
)(Container, 'Container');

export default ContainerConnector;
