import React from 'react';
import Tabs_ from './tabs';
import overrideStyles from '../utils/override-style';
import Component from '../component';
import { decorate, getTabsProps } from '../utils/plugins';

const Tabs = decorate(Tabs_, 'Tabs');

export default class Header extends Component {

  constructor () {
    super();
    this.onChangeIntent = this.onChangeIntent.bind(this);
    this.onHeaderMouseDown = this.onHeaderMouseDown.bind(this);
  }

  onChangeIntent (active) {
    // we ignore clicks if they're a byproduct of a drag
    // motion to move the window
    if (window.screenX !== this.headerMouseDownWindowX ||
        window.screenY !== this.headerMouseDownWindowY) {
      return;
    }

    this.props.onChangeTab(active);
  }

  onHeaderMouseDown () {
    this.headerMouseDownWindowX = window.screenX;
    this.headerMouseDownWindowY = window.screenY;

    this.clicks = this.clicks || 1;

    if (this.clicks++ >= 2) {
      if (this.maximized) {
        this.rpc.emit('unmaximize');
      } else {
        this.rpc.emit('maximize');
      }
      this.clicks = 0;
      this.maximized = !this.maximized;
    } else {
      // http://www.quirksmode.org/dom/events/click.html
      // https://en.wikipedia.org/wiki/Double-click
      this.clickTimer = setTimeout(() => {
        this.clicks = 0;
      }, 500);
    }
  }

  componentWillUnmount () {
    delete this.clicks;
    clearTimeout(this.clickTimer);
  }

  template (css) {
    const { isMac, backgroundColor } = this.props;
    const props = getTabsProps(this.props, {
      tabs: this.props.tabs,
      borderColor: this.props.borderColor,
      onClose: this.props.onCloseTab,
      onChange: this.onChangeIntent
    });
    return <header
      ref={ overrideStyles({ backgroundColor }) }
      className={ css('header', isMac && 'headerRounded') }
      onMouseDown={ this.onHeaderMouseDown }>
        { this.props.customChildrenBefore }
        <Tabs {...props} />
        { this.props.customChildren }
    </header>;
  }

  styles () {
    return {
      header: {
        position: 'fixed',
        top: '1px',
        left: '1px',
        right: '1px',
        background: '#000',
        zIndex: '100'
      },

      headerRounded: {
        borderTopLeftRadius: '6px',
        borderTopRightRadius: '6px'
      }
    };
  }

}
