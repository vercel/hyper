import React from 'react';
import {Component} from '../base-components';

export default class Tab extends Component {
  constructor() {
    super();

    this.handleHover = this.handleHover.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.onTransitionEnd = this.onTransitionEnd.bind(this);

    this.state = {
      hovered: false,
      flashing: false
    };
  }

  shouldComponentUpdate() {
    return true;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.lastActivity !== nextProps.lastActivty && !this.state.flashing) {
      this.setState({flashing: true});
    }
  }

  onTransitionEnd() {
    this.setState({flashing: false});
  }

  handleHover() {
    this.setState({
      hovered: true
    });
  }

  handleBlur() {
    this.setState({
      hovered: false
    });
  }

  handleClick(event) {
    const isLeftClick = event.nativeEvent.which === 1;
    const isMiddleClick = event.nativeEvent.which === 2;

    if (isLeftClick && !this.props.isActive) {
      this.props.onSelect();
    } else if (isMiddleClick) {
      this.props.onClose();
    }
  }

  template(css) {
    const {isActive, isFirst, isLast, borderColor, lastActivity} = this.props;
    const {hovered, flashing} = this.state;

    return (
      <li
        onMouseEnter={this.handleHover}
        onMouseLeave={this.handleBlur}
        onClick={this.props.onClick}
        onTransitionEnd={this.onTransitionEnd}
        style={{borderColor}}
        className={css(
          'tab',
          isFirst && 'first',
          isActive && 'active',
          isFirst && isActive && 'firstActive',
          lastActivity && 'hasActivity',
          flashing && 'flashing'
        )}
      >
        {this.props.customChildrenBefore}
        <span className={css('text', isLast && 'textLast', isActive && 'textActive')} onClick={this.handleClick}>
          <span title={this.props.text} className={css('textInner')}>
            {this.props.text}
          </span>
        </span>
        <i className={css('icon', hovered && 'iconHovered')} onClick={this.props.onClose}>
          <svg className={css('shape')}>
            <use xlinkHref="./renderer/assets/icons.svg#close-tab" />
          </svg>
        </i>
        {this.props.customChildren}
      </li>
    );
  }

  styles() {
    return {
      tab: {
        color: '#ccc',
        borderColor: '#ccc',
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        borderLeftWidth: 1,
        borderLeftStyle: 'solid',
        listStyleType: 'none',
        flexGrow: 1,
        position: 'relative',
        ':hover': {
          color: '#ccc'
        }
      },

      first: {
        borderLeftWidth: 0,
        paddingLeft: 1
      },

      firstActive: {
        borderLeftWidth: 1,
        paddingLeft: 0
      },

      active: {
        color: '#fff',
        borderBottomWidth: 0,
        ':hover': {
          color: '#fff'
        }
      },

      hasActivity: {
        color: '#50E3C2',
        ':hover': {
          color: '#50E3C2'
        }
      },

      flashing: {
        textShadow: '0 0 2.5em #50E3C2, 0 0 2.5em #50E3C2, 0 0 2.5em #50E3C2'
      },

      text: {
        transition: 'text-shadow 0.3s ease-in-out',
        height: '34px',
        display: 'block',
        width: '100%',
        position: 'relative',
        overflow: 'hidden'
      },

      textInner: {
        position: 'absolute',
        left: '24px',
        right: '24px',
        top: 0,
        bottom: 0,
        textAlign: 'center',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden'
      },

      icon: {
        transition: `opacity .2s ease, color .2s ease,
          transform .25s ease, background-color .1s ease`,
        pointerEvents: 'none',
        position: 'absolute',
        right: '7px',
        top: '10px',
        display: 'inline-block',
        width: '14px',
        height: '14px',
        borderRadius: '100%',
        color: '#e9e9e9',
        opacity: 0,
        transform: 'scale(.95)',

        ':hover': {
          backgroundColor: 'rgba(255,255,255, .13)',
          color: '#fff'
        },

        ':active': {
          backgroundColor: 'rgba(255,255,255, .1)',
          color: '#909090'
        }
      },

      iconHovered: {
        opacity: 1,
        transform: 'none',
        pointerEvents: 'all'
      },

      shape: {
        position: 'absolute',
        left: '4px',
        top: '4px',
        width: '6px',
        height: '6px',
        verticalAlign: 'middle',
        fill: 'currentColor',
        shapeRendering: 'crispEdges'
      }
    };
  }
}
