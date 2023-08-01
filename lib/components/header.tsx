import React, {forwardRef, useState} from 'react';

import type {HeaderProps} from '../../typings/hyper';
import {decorate, getTabsProps} from '../utils/plugins';

import Tabs_ from './tabs';

const Tabs = decorate(Tabs_, 'Tabs');

const Header = forwardRef<HTMLElement, HeaderProps>((props, ref) => {
  const [headerMouseDownWindowX, setHeaderMouseDownWindowX] = useState<number>(0);
  const [headerMouseDownWindowY, setHeaderMouseDownWindowY] = useState<number>(0);

  const onChangeIntent = (active: string) => {
    // we ignore clicks if they're a byproduct of a drag
    // motion to move the window
    if (window.screenX !== headerMouseDownWindowX || window.screenY !== headerMouseDownWindowY) {
      return;
    }

    props.onChangeTab(active);
  };

  const handleHeaderMouseDown = () => {
    // the hack of all hacks, this prevents the term
    // iframe from losing focus, for example, when
    // the user drags the nav around
    // Fixed by calling window.focusActiveTerm(), thus we can support drag tab
    // ev.preventDefault();

    // persist start positions of a potential drag motion
    // to differentiate dragging from clicking
    setHeaderMouseDownWindowX(window.screenX);
    setHeaderMouseDownWindowY(window.screenY);
  };

  const handleHamburgerMenuClick = (event: React.MouseEvent) => {
    let {right: x, bottom: y} = event.currentTarget.getBoundingClientRect();
    x -= 15; // to compensate padding
    y -= 12; // ^ same
    props.openHamburgerMenu({x, y});
  };

  const handleMaximizeClick = () => {
    if (props.maximized) {
      props.unmaximize();
    } else {
      props.maximize();
    }
  };

  const handleMinimizeClick = () => {
    props.minimize();
  };

  const handleCloseClick = () => {
    props.close();
  };

  const getWindowHeaderConfig = () => {
    const {showHamburgerMenu, showWindowControls} = props;

    const defaults = {
      hambMenu: !props.isMac, // show by default on windows and linux
      winCtrls: !props.isMac // show by default on Windows and Linux
    };

    // don't allow the user to change defaults on macOS
    if (props.isMac) {
      return defaults;
    }

    return {
      hambMenu: showHamburgerMenu === '' ? defaults.hambMenu : showHamburgerMenu,
      winCtrls: showWindowControls === '' ? defaults.winCtrls : showWindowControls
    };
  };

  const {isMac} = props;
  const {borderColor} = props;
  let title = 'Hyper';
  if (props.tabs.length === 1 && props.tabs[0].title) {
    // if there's only one tab we use its title as the window title
    title = props.tabs[0].title;
  }
  const {hambMenu, winCtrls} = getWindowHeaderConfig();
  const left = winCtrls === 'left';
  const maxButtonHref = props.maximized
    ? './renderer/assets/icons.svg#restore-window'
    : './renderer/assets/icons.svg#maximize-window';

  return (
    <header
      className={`header_header ${isMac && 'header_headerRounded'}`}
      onMouseDown={handleHeaderMouseDown}
      onMouseUp={() => window.focusActiveTerm()}
      onDoubleClick={handleMaximizeClick}
      ref={ref}
    >
      {!isMac && (
        <div
          className={`header_windowHeader ${props.tabs.length > 1 ? 'header_windowHeaderWithBorder' : ''}`}
          style={{borderColor}}
        >
          {hambMenu && (
            <svg
              className={`header_shape ${left ? 'header_hamburgerMenuRight' : 'header_hamburgerMenuLeft'}`}
              onClick={handleHamburgerMenuClick}
            >
              <use xlinkHref="./renderer/assets/icons.svg#hamburger-menu" />
            </svg>
          )}
          <span className="header_appTitle">{title}</span>
          {winCtrls && (
            <div className={`header_windowControls ${left ? 'header_windowControlsLeft' : ''}`}>
              <div className={`${left ? 'header_minimizeWindowLeft' : ''}`} onClick={handleMinimizeClick}>
                <svg className="header_shape">
                  <use xlinkHref="./renderer/assets/icons.svg#minimize-window" />
                </svg>
              </div>
              <div className={`${left ? 'header_maximizeWindowLeft' : ''}`} onClick={handleMaximizeClick}>
                <svg className="header_shape">
                  <use xlinkHref={maxButtonHref} />
                </svg>
              </div>
              <div className={`header_closeWindow ${left ? 'header_closeWindowLeft' : ''}`} onClick={handleCloseClick}>
                <svg className="header_shape">
                  <use xlinkHref="./renderer/assets/icons.svg#close-window" />
                </svg>
              </div>
            </div>
          )}
        </div>
      )}
      {props.customChildrenBefore}
      <Tabs
        {...getTabsProps(props, {
          tabs: props.tabs,
          borderColor: props.borderColor,
          backgroundColor: props.backgroundColor,
          onClose: props.onCloseTab,
          onChange: onChangeIntent,
          fullScreen: props.fullScreen,
          defaultProfile: props.defaultProfile,
          profiles: props.profiles.asMutable({deep: true}),
          openNewTab: props.openNewTab
        })}
      />
      {props.customChildren}

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

        .header_shape,
        .header_shape > svg {
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
          top: 0;
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
});

Header.displayName = 'Header';

export default Header;
