import React from 'react';

import {decorate, getTabsProps} from '../utils/plugins';

import Tabs_ from './tabs';

const Tabs = decorate(Tabs_, 'Tabs');

export default class Header extends React.PureComponent {
  constructor() {
    super();
    this.onChangeIntent = this.onChangeIntent.bind(this);
    this.handleHeaderMouseDown = this.handleHeaderMouseDown.bind(this);
    this.handleHamburgerMenuClick = this.handleHamburgerMenuClick.bind(this);
    this.handleMaximizeClick = this.handleMaximizeClick.bind(this);
    this.handleMinimizeClick = this.handleMinimizeClick.bind(this);
    this.handleCloseClick = this.handleCloseClick.bind(this);
  }

  onChangeIntent(active) {
    // we ignore clicks if they're a byproduct of a drag
    // motion to move the window
    if (window.screenX !== this.headerMouseDownWindowX || window.screenY !== this.headerMouseDownWindowY) {
      return;
    }

    this.props.onChangeTab(active);
  }

  handleHeaderMouseDown(ev) {
    // the hack of all hacks, this prevents the term
    // iframe from losing focus, for example, when
    // the user drags the nav around
    ev.preventDefault();

    // persist start positions of a potential drag motion
    // to differentiate dragging from clicking
    this.headerMouseDownWindowX = window.screenX;
    this.headerMouseDownWindowY = window.screenY;
  }

  handleHamburgerMenuClick(event) {
    let {right: x, bottom: y} = event.currentTarget.getBoundingClientRect();
    x -= 15; // to compensate padding
    y -= 12; // ^ same
    this.props.openHamburgerMenu({x, y});
  }

  handleMaximizeClick() {
    if (this.props.maximized) {
      this.props.unmaximize();
    } else {
      this.props.maximize();
    }
  }

  handleMinimizeClick() {
    this.props.minimize();
  }

  handleCloseClick() {
    this.props.close();
  }

  componentWillUnmount() {
    delete this.clicks;
    clearTimeout(this.clickTimer);
  }

  getWindowHeaderConfig() {
    const {showHamburgerMenu, showWindowControls} = this.props;

    const defaults = {
      hambMenu: !this.props.isMac, // show by default on windows and linux
      winCtrls: !this.props.isMac // show by default on Windows and Linux
    };

    // don't allow the user to change defaults on macOS
    if (this.props.isMac) {
      return defaults;
    }

    return {
      hambMenu: showHamburgerMenu === '' ? defaults.hambMenu : showHamburgerMenu,
      winCtrls: showWindowControls === '' ? defaults.winCtrls : showWindowControls
    };
  }

  render() {
    const {isMac} = this.props;
    const props = getTabsProps(this.props, {
      tabs: this.props.tabs,
      borderColor: this.props.borderColor,
      onClose: this.props.onCloseTab,
      onChange: this.onChangeIntent
    });
    const {borderColor} = props;
    let title = 'Hyper';
    if (props.tabs.length === 1 && props.tabs[0].title) {
      // if there's only one tab we use its title as the window title
      title = props.tabs[0].title;
    }
    const {hambMenu, winCtrls} = this.getWindowHeaderConfig();
    const left = winCtrls === 'left';
    const maxButtonHref = this.props.maximized
      ? './renderer/assets/icons.svg#restore-window'
      : './renderer/assets/icons.svg#maximize-window';

    return (
      <header
        className={`header_header ${isMac && 'header_headerRounded'}`}
        onMouseDown={this.handleHeaderMouseDown}
        onDoubleClick={this.handleMaximizeClick}
      >
        {!isMac && (
          <div
            className={`header_windowHeader ${props.tabs.length > 1 ? 'header_windowHeaderWithBorder' : ''}`}
            style={{borderColor}}
          >
            {hambMenu && (
              <svg
                className={`header_shape ${left ? 'header_hamburgerMenuRight' : 'header_hamburgerMenuLeft'}`}
                onClick={this.handleHamburgerMenuClick}
              >
                <use xlinkHref="./renderer/assets/icons.svg#hamburger-menu" />
              </svg>
            )}
            <span className="header_appTitle">{title}</span>
            {winCtrls && (
              <div className={`header_windowControls ${left ? 'header_windowControlsLeft' : ''}`}>
                <svg
                  className={`header_shape ${left ? 'header_minimizeWindowLeft' : ''}`}
                  onClick={this.handleMinimizeClick}
                >
                  <use xlinkHref="./renderer/assets/icons.svg#minimize-window" />
                </svg>
                <svg
                  className={`header_shape ${left ? 'header_maximizeWindowLeft' : ''}`}
                  onClick={this.handleMaximizeClick}
                >
                  <use xlinkHref={maxButtonHref} />
                </svg>
                <svg
                  className={`header_shape header_closeWindow ${left ? 'header_closeWindowLeft' : ''}`}
                  onClick={this.handleCloseClick}
                >
                  <use xlinkHref="./renderer/assets/icons.svg#close-window" />
                </svg>
              </div>
            )}
          </div>
        )}
        {this.props.customChildrenBefore}
        <Tabs {...props} />
        {this.props.customChildren}

        <style jsx>{`
          .header_header {
            position: fixed;
            top: 1px;
            left: 1px;
            right: 1px;
            z-index: 100;
          }

          .header_headerRounded {
            border-top-left-radius: 4px;
            border-top-right-radius: 4px;
          }

          .header_windowHeader {
            height: 34px;
            width: 100%;
            position: fixed;
            top: 1px;
            left: 1px;
            right: 1px;
            -webkit-app-region: drag;
            -webkit-user-select: none;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .header_windowHeaderWithBorder {
            border-color: #ccc;
            border-bottom-style: solid;
            border-bottom-width: 1px;
          }

          .header_appTitle {
            font-size: 12px;
          }

          .header_shape {
            width: 40px;
            height: 34px;
            padding: 12px 15px 12px 15px;
            -webkit-app-region: no-drag;
            color: #fff;
            opacity: 0.5;
            shape-rendering: crispEdges;
          }

          .header_shape:hover {
            opacity: 1;
          }

          .header_shape:active {
            opacity: 0.3;
          }

          .header_hamburgerMenuLeft {
            position: fixed;
            top: 0;
            left: 0;
          }

          .header_hamburgerMenuRight {
            position: fixed;
            top: 0;
            right: 0;
          }

          .header_windowControls {
            display: flex;
            width: 120px;
            height: 34px;
            justify-content: space-between;
            position: fixed;
            right: 0;
          }

          .header_windowControlsLeft {
            left: 0px;
          }

          .header_closeWindowLeft {
            order: 1;
          }

          .header_minimizeWindowLeft {
            order: 2;
          }

          .header_maximizeWindowLeft {
            order: 3;
          }

          .header_closeWindow:hover {
            color: #fe354e;
          }

          .header_closeWindow:active {
            color: #fe354e;
          }
        `}</style>
      </header>
    );
  }
}
