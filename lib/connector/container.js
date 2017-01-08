import {connect} from '../utils/plugins';
import Container from '../UI/main/container';
import {select} from '../communication/actions/pane';
import {createSelector} from 'reselect';

const ContainerConnector = connect(
  state => {
    const {layouts, active, panes} = state.base;
    return {
      active:active,
      layouts:layouts,
      panes:panes
    };
  },
  dispatch => {
    return {
      onSelect: (uid) => {
        dispatch(select(uid));
      },
    };
  },
  null,
  {withRef: true}
)(Container, 'Container');

export default ContainerConnector;
