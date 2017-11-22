import Searchbox from '../components/searchbox';
import {connect} from '../utils/plugins';
import * as uiActions from '../actions/ui';

const SearchboxContainer = connect(
  state => ({
    showSearch: state.ui.showSearch,
    uiFontFamily: state.ui.uiFontFamily
  }),
  dispatch => ({
    toggleSearch: () => dispatch(uiActions.toggleSearch())
  })
)(Searchbox, 'Searchbox');

export default SearchboxContainer;
