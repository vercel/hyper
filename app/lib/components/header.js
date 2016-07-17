import React, { Component, PropTypes } from 'react';
import Tabs_ from './tabs';
import { decorate, getTabsProps } from '../utils/plugins';
import { StyleSheet, View } from 'react-native';
import { shouldComponentUpdate } from 'react-addons-pure-render-mixin';

const Tabs = decorate(Tabs_, 'Tabs');

export default class Header extends Component {
  constructor () {
    super();
    this.onChangeIntent = this.onChangeIntent.bind(this);
    this.onHeaderMouseDown = this.onHeaderMouseDown.bind(this);
  }

  shouldComponentUpdate (...args) {
    return shouldComponentUpdate.apply(this, [args])
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
        window.rpc.emit('unmaximize');
      } else {
        window.rpc.emit('maximize');
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

  render () {
    const {
      backgroundColor,
      borderColor,
      customChildren,
      customChildrenBefore,
      isMac,
      onCloseTab,
      tabs
    } = this.props;

    const tabProps = getTabsProps(this.props, {
      borderColor,
      onChange: this.onChangeIntent,
      onClose: onCloseTab,
      tabs
    });

    return (
      <View
        accessibilityRole='header'
        onMouseDown={ this.onHeaderMouseDown }
        style={[
          { backgroundColor },
          styles.header,
          isMac && styles.headerRounded
        ]}>
          { customChildrenBefore }
          <Tabs {...tabProps} />
          { customChildren }
      </View>
    );
  }
}

Header.propTypes = {
  borderColor: PropTypes.string,
  customChildrenBefore: PropTypes.any,
  customChildren: PropTypes.any,
  isMac: PropTypes.bool,
  onChangeTab: PropTypes.func,
  onCloseTab: PropTypes.func,
  tabs: PropTypes.array
};

const styles = StyleSheet.create({
  header: {
    position: 'fixed',
    top: '1px',
    left: '1px',
    right: '1px',
    backgroundColor: '#000',
    zIndex: 100
  },
  headerRounded: {
    borderTopLeftRadius: '6px',
    borderTopRightRadius: '6px'
  }
});
