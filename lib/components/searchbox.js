import React from 'react';
import Mousetrap from 'mousetrap';

import Component from '../component';

class Searchform extends Component {

  constructor(props) {
    super(props);

    this.state = {
      searchTerm: '',
      searchError: false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSearchTermChange = this.handleSearchTermChange.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();

    // If a submit button was selected, return focus back to the input box
    this.searchBox.focus();

    const term = this.props.terms && this.props.terms.getActiveTerm();
    if (term) {
      const searchTerm = this.state.searchTerm;
      const options = {
        direction: this.state.direction
      };
      const searchResult = term.find(searchTerm, options);
      if (searchResult) {
        const selection = {
          row: searchResult.row,
          startIndex: searchResult.index,
          endIndex: searchResult.index + searchTerm.length
        };
        const options = {
          scroll: true
        };
        term.selectRow(selection, options);
      }
      this.setState({searchError: !searchResult});
    } else {
      console.error('No active terminal found to search in!');
    }
  }

  handleSearchTermChange(e) {
    this.setState({
      searchTerm: e.target.value || '',
      searchError: false
    });
  }

  componentDidMount() {
    this.keys = new Mousetrap(this.form);

    // Search upwards while the shift key is down
    this.keys.bind('shift', () => this.setState({direction: -1}));
    this.keys.bind('shift', () => this.setState({direction: 1}), 'keyup');

    // Close the searchbox
    this.keys.bind('esc', this.props.toggleSearch);
    this.keys.bind('mod+f', this.props.toggleSearch);
  }

  componentWillUnmount() {
    this.keys.unbind('shift');
    this.keys.unbind('esc');
    this.keys.unbind('mod+f');

    const term = this.props.terms && this.props.terms.getActiveTerm();
    if (term) {
      term.focus();
    }
  }

  template(css) {
    return (<form
      ref={form => {
        this.form = form;
      }}
      className={css('searchForm', this.state.searchError && 'noResults')}
      onSubmit={this.handleSubmit}
      >
      { this.props.customChildrenBefore }

      <input
        ref={input => {
          if (input) {
            this.searchBox = input;
            this.searchBox.focus();
          }
        }}
        type="text"
        role="search"
        placeholder="Search..."
        className={css('searchInput')}
        style={{fontFamily: this.props.uiFontFamily}}
        value={this.state.searchTerm}
        onChange={this.handleSearchTermChange}
        />
      { this.state.searchError ?
        <div
          className={css('noResultsText')}
          style={{fontFamily: this.props.uiFontFamily}}
          >
          (no results)
        </div> :
        <input
          type="submit"
          value="Find"
          className={css('searchButton')}
          style={{fontFamily: this.props.uiFontFamily}}
          />
      }

      { this.props.customChildren }
    </form>);
  }

  styles() {
    return {
      searchForm: {
        position: 'absolute',
        top: '3.5em',
        right: '1.5em',
        width: '20.0em',
        zIndex: '200',
        display: 'flex',
        alignItems: 'center',
        background: '#fff',
        boxShadow: '0px 0 10px 1px rgba(0, 0, 0, 0.5)',
        border: '2px solid transparent',
        borderRadius: '5px',
        overflow: 'hidden'
      },

      noResults: {
        background: '#ffe5e5',
        borderColor: '#f55'
      },

      noResultsText: {
        color: '#000',
        fontSize: '80%',
        width: '7.5em',
        marginBottom: '0.1em'
      },

      searchInput: {
        fontSize: '0.8em',
        padding: '0.5em',
        border: '0',
        width: '100%',
        outline: 'none',
        background: 'transparent'
      },

      searchButton: {
        display: 'block',
        lineHeight: '100%',
        margin: '0.5em 0',
        padding: '0 0.75em',
        background: 'transparent',
        color: '#555',
        fontSize: '0.8em',
        border: '0',
        borderLeft: '1px solid #ccc'
      }
    };
  }

}

export default class Searchbox extends Component {

  template(css) {
    const {showSearch} = this.props;

    return (<div className={css('searchContainer')}>
      { showSearch && <Searchform {...this.props}/> }
    </div>);
  }

  styles() {
    return {
      searchContainer: {
        opacity: '0',
        transition: '0.2s opacity',

        ':not(:empty)': {
          opacity: '1'
        }
      }
    };
  }

}
