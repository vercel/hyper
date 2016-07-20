import React, { Component, PropTypes } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { shouldComponentUpdate } from 'react-addons-pure-render-mixin';

export default class Tab extends Component {
  constructor (props) {
    super(props);
    this.hover = this.hover.bind(this);
    this.blur = this.blur.bind(this);
    this.state = {
      hovered: false
    };
  }

  shouldComponentUpdate (...args) {
    return shouldComponentUpdate.apply(this, [args])
  }

  hover () {
    this.setState({ hovered: true });
  }

  blur () {
    this.setState({ hovered: false });
  }

  render () {
    const { isActive, isFirst, isLast, borderColor, hasActivity } = this.props;
    const { hovered } = this.state;

    return <View
      accessibilityRole='button'
      onMouseEnter={ this.hover }
      onMouseLeave={ this.blur }
      onClick={ this.props.onClick }
      style={[
        { borderColor },
        styles.tab,
        isFirst && styles.first,
        hasActivity && styles.hasActivity
      ]}>
        {isActive ? <View style={styles.tabBorder} /> : null}
        { this.props.customChildrenBefore }
        <View
          style={[
            styles.textBox,
            isLast && styles.textBoxLast,
            (isActive || hovered) && styles.textBoxActive
          ]}
          onClick={ isActive ? null : this.props.onSelect }>
          <Text style={[
            styles.text,
            isActive && styles.textActive,
          ]}>
            { this.props.text }
          </Text>
        </View>
        <View
          pointerEvents={ hovered ? 'auto' : 'none' }
          style={[
            styles.icon,
            hovered && styles.iconHovered
          ]}
          onClick={ this.props.onClose }>
          <svg style={svgStyles}>
            <use xlinkHref='assets/icons.svg#close'></use>
          </svg>
        </View>
        { this.props.customChildren }
    </View>;
  }
}

const svgStyles = {
  position: 'absolute',
  left: '4px',
  top: '4px',
  width: '6px',
  height: '6px',
  textAlignVertical: 'center',
  fill: 'currentColor'
}

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    outline: 'none'
  },
  first: {
    marginLeft: '76px'
  },
  tabBorder: {
    position: 'absolute',
    height: 1,
    backgroundColor: '#000',
    left: '0px',
    right: '0px',
    bottom: '-1px'
  },
  hasActivity: {
    color: '#50E3C2',
  },
  textBox: {
    transition: 'color .2s ease',
    height: '34px',
    width: '100%',
    borderRightWidth: 1,
    borderLeftWidth: 1,
    borderStyle: 'solid',
    borderColor: 'transparent',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  textBoxLast: {
    borderRightWidth: 0
  },
  textBoxActive: {
    borderColor: 'inherit'
  },
  text: {
    fontSize: '12px',
    fontFamily: `-apple-system, BlinkMacSystemFont,
    "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans",
    "Droid Sans", "Helvetica Neue", sans-serif`,
    color: '#ccc',
    textAlign: 'center'
  },
  textActive: {
    color: '#fff'
  },
  icon: {
    transition: `opacity .2s ease, color .2s ease,
      transform .25s ease, background-color .1s ease`,
    position: 'absolute',
    right: '7px',
    top: '10px',
    display: 'inline-block',
    width: '14px',
    height: '14px',
    borderRadius: '100%',
    color: '#e9e9e9',
    opacity: 0,
    transform: [ { scale: 0.95 } ],
  },
  iconHovered: {
    opacity: 1,
    transform: []
  }
})
