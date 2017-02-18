import React from 'react';
import ContainerConnector from '../connector/container';
import Component from './component';
import Header from './head/header';

class Hyper extends Component {
  constructor(props) {
    super(props);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.tabChange = props.tabChange;
  }

  handleKeyDown(ev) {
    const num = parseInt(ev.key, 10);
    if (ev.metaKey && Number.isInteger(num)) {
      if (num > 0) {
        this.tabChange(num);
      }
    }
  }

  componentWillMount() {
    window.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillReceiveProps(next) {
    if (this.props.backgroundColor !== next.backgroundColor) {
      // this can be removed when `setBackgroundColor` in electron
      // starts working again
      document.body.style.backgroundColor = next.backgroundColor;
    }
  }

  componentWillUnmount() {
    document.body.style.backgroundColor = 'inherit';
  }

  template(css) {
    // const {isMac, customCSS, borderColor} = this.props;
    const {isMac, borderColor} = this.props;
    return (
      <div
        style={{borderColor}}
        className={css('main', isMac && 'mainRounded')}
        >
        <Header/>
        <ContainerConnector/>
        { this.props.customChildren }
      </div>);
      // <style dangerouslySetInnerHTML={{__html: customCSS}}/>
  }

  styles() {
    return {
      main: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        // can be overridden by inline style above
        border: '1px solid #333'
      },

      mainRounded: {
        borderRadius: '5px'
      }
    };
  }

}

export default Hyper;
