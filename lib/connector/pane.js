import {connect} from '../utils/plugins';
import Tabs from '../UI/head/tabs';

const PaneConnector = connect(
  state => {
    return {
    };
  },
  dispatch => {
    return {
      onSelect: () => {
        console.log('id');
        // dispatch(maximize());
      },
    };
  },
  null,
  {withRef: true}
)(Tabs, 'Tabs');

export default TabsConnector;
