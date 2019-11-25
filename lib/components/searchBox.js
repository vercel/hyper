import React from 'react';

const searchBoxStyling = {
  float: 'right',
  height: '28px',
  backgroundColor: 'white',
  position: 'absolute',
  right: '10px',
  top: '25px',
  width: '224px',
  zIndex: '9999'
};

const enterKey = 13;

export default class SearchBox extends React.PureComponent {
  constructor(props) {
    super(props);
    this.searchTerm = '';
  }

  handleChange = event => {
    this.searchTerm = event.target.value;
    if (event.keyCode === enterKey) {
      this.props.search(event.target.value);
    }
  };

  render() {
    return (
      <div style={searchBoxStyling}>
        <input type="text" className="search-box" onKeyUp={this.handleChange} ref={input => input && input.focus()} />
        <span className="search-button" onClick={() => this.props.prev(this.searchTerm)}>
          {' '}
          &#x2190;{' '}
        </span>
        <span className="search-button" onClick={() => this.props.next(this.searchTerm)}>
          {' '}
          &#x2192;{' '}
        </span>
        <span className="search-button" onClick={() => this.props.close()}>
          {' '}
          x{' '}
        </span>
        <style jsx>
          {`
            .search-box {
              font-size: 18px;
              padding: 6px;
              width: 145px;
              border: none;
            }

            .search-box:focus {
              outline: none;
            }

            .search-button {
              background-color: #ffffff;
              color: black;
              padding: 7px;
              text-align: center;
              text-decoration: none;
              display: inline-block;
              font-size: 16px;
              transition-duration: 0.4s;
              cursor: pointer;
            }
            .search-button:hover {
              background-color: #e7e7e7;
            }
          `}
        </style>
      </div>
    );
  }
}
