import {connect} from '../utils/plugins';
import Tabs from '../UI/head/tabs';

const TabsConnector = connect(
  state => {
    const tabs = Object.keys(state.base.tabs).map(uid => state.base.tabs[uid]);
    return {
      tabs : tabs
    };
  },
  dispatch => {
    return {
    };
  },
  null,
  {withRef: true}
)(Tabs, 'Tabs');

export default TabsConnector;
