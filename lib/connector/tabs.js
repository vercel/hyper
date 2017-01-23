import {connect} from '../utils/plugins';
import Tabs from '../UI/head/tabs';
import {select} from '../communication/actions/tab';


const TabsConnector = connect(
  state => {
    const tabs = Object.keys(state.base.tabs).map(uid => state.base.tabs[uid]);
    return {
      tabs : tabs,
      active: state.base.active.tab
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
)(Tabs, 'Tabs');

export default TabsConnector;
