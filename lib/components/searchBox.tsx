import React from 'react';
import {SearchBoxProps} from '../hyper';

const searchBoxStyling: React.CSSProperties = {
  float: 'right',
  height: '28px',
  backgroundColor: 'white',
  position: 'absolute',
  right: '10px',
  top: '0px',
  width: '224px',
  zIndex: 9999
};

const enterKey = 13;

export default class SearchBox extends React.PureComponent<SearchBoxProps> {
  searchTerm: string;
  constructor(props: SearchBoxProps) {
    super(props);
    this.searchTerm = '';
  }

  handleChange = (event: React.KeyboardEvent<HTMLInputElement>) => {
    this.searchTerm = event.currentTarget.value;
    if (event.keyCode === enterKey) {
      this.props.search(event.currentTarget.value);
    }
  };

  render() {
    return (
      <div style={searchBoxStyling}>
        <input type="text" className="search-box" onKeyUp={this.handleChange} ref={(input) => input?.focus()} />
        <span className="search-button" onClick={() => this.props.prev(this.searchTerm)}>
          {'←'}
        </span>
        <span className="search-button" onClick={() => this.props.next(this.searchTerm)}>
          {'→'}
        </span>
        <span className="search-button" onClick={() => this.props.close()}>
          {'✕'}
        </span>
        <style jsx>
          {`
            .search-box {
              font-size: 18px;
              padding: 3px 6px;
              width: 152px;
              border: none;
            }

            .search-box:focus {
              outline: none;
            }

            .search-button {
              background-color: #ffffff;
              color: black;
              padding: 3px;
              text-align: center;
              text-decoration: none;
              display: inline-block;
              font-size: 16px;
              transition-duration: 0.4s;
              cursor: pointer;
              height: 27px;
              width: 24px;
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
