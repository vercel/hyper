import React from 'react';

const searchBoxStyling = {
  float: 'right',
  height: '30px',
  padding: 5,
  position: 'absolute',
  right: '10px',
  top: '25px',
  width: '225px',
  zIndex: '9999'
};
let self = null;

export default class SearchBox extends React.PureComponent {
  constructor(props) {
    super(props);
    self = this;
    this.searchTerm = '';
  }

  handleChange(event) {
    self.searchTerm = event.target.value;
    if (event.keyCode === 13) {
      // on enter key
      self.props.search(event.target.value);
    }
  }

  render() {
    return (
      <div style={searchBoxStyling}>
        <div style={{backgroundColor: 'white'}}>
          <input type="text" onKeyUp={this.handleChange} style={{padding: 5}} />
          <span className="myButton" onClick={() => this.props.prev(self.searchTerm)}>
            {' '}
            &#x2190;{' '}
          </span>
          <span className="myButton" onClick={() => this.props.next(self.searchTerm)}>
            {' '}
            &#x2192;{' '}
          </span>
          <span className="myButton" onClick = {() => this.props.close()}> x </span>
        </div>
        <style jsx>
          {`
            .myButton {
              background: linear-gradient(to bottom, #637aad 5%, #5972a7 100%);
              filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#637aad', endColorstr='#5972a7',GradientType=0);
              background-color: #ffffff;
              border: 1px solid #314179;
              display: inline-block;
              cursor: pointer;
              color: black;
              font-family: Arial;
              font-size: 13px;
              font-weight: bold;
              padding: 6px;
              text-decoration: none;
            }
            .myButton:hover {
              background: linear-gradient(to bottom, #5972a7 5%, #637aad 100%);
              filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#5972a7', endColorstr='#637aad',GradientType=0);
              background-color: #5972a7;
            }
          `}
        </style>
      </div>
    );
  }
}
