import Tab_ from './tab';
import React, { Component, PropTypes } from 'react';
import { decorate, getTabProps } from '../utils/plugins';
import { StyleSheet, View, Text } from 'react-native';
import { shouldComponentUpdate } from 'react-addons-pure-render-mixin';

const Tab = decorate(Tab_, 'Tab');

export default class Tabs extends Component {
  shouldComponentUpdate (...args) {
    return shouldComponentUpdate.apply(this, [args])
  }

  render () {
    const {
      tabs = [],
      borderColor,
      onChange,
      onClose
    } = this.props;

    return <View accessibilityRole='nav' style={styles.nav}>
      {
        tabs.length
          ? 1 === tabs.length
            ? <Text style={styles.title}>{ tabs[0].title }</Text>
            : <View style={[ styles.list, { borderColor }]}>
                {
                  tabs.map((tab, i) => {
                    const { uid, title, isActive, hasActivity } = tab;
                    const tabProps = getTabProps(tab, this.props, {
                      text: '' === title ? 'Shell' : title,
                      isFirst: 0 === i,
                      isLast: tabs.length - 1 === i,
                      borderColor: borderColor,
                      isActive,
                      hasActivity,
                      onSelect: onChange.bind(null, uid),
                      onClose: onClose.bind(null, uid)
                    });
                    return <Tab key={`tab-${uid}`} {...tabProps} />;
                  })
                }
              </View>
          : null
      }
      { this.props.customChildren }
    </View>;
  }
}

Tabs.propTypes = {
  borderColor: PropTypes.string,
  onChange: PropTypes.func,
  onClose: PropTypes.func,
  tabs: PropTypes.array,
};

const styles = StyleSheet.create({
  nav: {
    height: '34px',
    justifyContent: 'center',
    cursor: 'default',
    userSelect: 'none',
    WebkitAppRegion: 'drag'
  },

  title: {
    fontSize: '12px',
    fontFamily: `-apple-system, BlinkMacSystemFont,
      "Segoe UI", "Roboto", "Oxygen",
      "Ubuntu", "Cantarell", "Fira Sans",
      "Droid Sans", "Helvetica Neue", sans-serif`,
    textAlign: 'center',
    color: '#fff'
  },

  list: {
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: '#333',
    maxHeight: '34px',
    flexDirection: 'row',
    flexWrap: 'nowrap'
  }
});
