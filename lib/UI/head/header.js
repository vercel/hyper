import React from 'react';
import Component from '../component';
import TabsConnector from '../../connector/tabs';

class Header extends Component {
  constructor() {
    super();
    // this.onChangeIntent = this.onChangeIntent.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  // onChangeIntent(active) {
  //   // we ignore clicks if they're a byproduct of a drag
  //   // motion to move the window
  //   if (window.screenX !== this.headerMouseDownWindowX ||
  //       window.screenY !== this.headerMouseDownWindowY) {
  //     return;
  //   }

  //   // this.props.onChangeTab(active);
  // }

  handleMouseDown(ev) {
    // the hack of all hacks, this prevents the term
    // iframe from losing focus, for example, when
    // the user drags the nav around
    ev.preventDefault();

    // persist start positions of a potential drag motion
    // to differentiate dragging from clicking
    this.headerMouseDownWindowX = window.screenX;
    this.headerMouseDownWindowY = window.screenY;
  }

  handleClick(ev) {
    this.clicks = this.clicks || 0;

    // Reset clicks if mouse moved between clicks
    if (this.headerClickPointerX !== ev.clientX ||
        this.headerClickPointerY !== ev.clientY) {
      this.clicks = 0;
      clearTimeout(this.clickTimer);

      this.headerClickPointerX = ev.clientX;
      this.headerClickPointerY = ev.clientY;
    }

    if (++this.clicks === 2) {
      if (this.props.maximized) {
        this.props.unmaximize();
      } else {
        this.props.maximize();
      }
      this.clicks = 0;
      clearTimeout(this.clickTimer);
    } else {
      // http://www.quirksmode.org/dom/events/click.html
      // https://en.wikipedia.org/wiki/Double-click
      this.clickTimer = setTimeout(() => {
        this.clicks = 0;
      }, 500);
    }
  }

  template(css) {
    const {isMac} = this.props;
    return (
      <header
        className={css('header', isMac && 'headerRounded')}
        onClick={this.handleClick}
        onMouseDown={this.handleMouseDown}
        >
        <TabsConnector/>
      </header>
    );
  }

  styles() {
    return {
      header: {
        position: 'fixed',
        top: '0px',
        left: '0px',
        right: '0px',
        width: '100%',
        height: '30px',
        zIndex: '100'
      },

      headerRounded: {
        borderTopLeftRadius: '4px',
        borderTopRightRadius: '4px'
      }
    };
  }

}

export default Header;
