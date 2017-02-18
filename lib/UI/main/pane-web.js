import React from 'react';
// import ReactDOM from 'react-dom';

class PaneWeb extends Component {
  didNavigate() {
    // const webv = this;
    // console.log(webv.getTitle());
  }

  // componentDidMount() {
    //  const wbw = ReactDOM.findDOMNode(this.refs.webv);
    //  wbw.addEventListener("did-navigate-in-page", this.didNavigate.bind(wbw));
  // }

  template(css) {
    return (
      <webview
        // ref="webv"
        src="http://0.0.0.0:3000"
        className={css('view')}
        />
    );
  }

  styles() {
    return {
      view: {
        position: 'absolute',
        top: 0,
        left: 0,
        display: 'inline-flex',
        width: '100%',
        height: '100%'
      }
    };
  }
}

export default PaneWeb;
