import React from 'react';
import Component from '../component';

class Tab extends Component {
  constructor() {
    super();
    this.handleHover = this.handleHover.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    // this.handleClick = this.handleClick.bind(this);

    this.state = {
      hovered: false
    };
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

  // handleClick(ev) {
    // const isLeftClick = ev.nativeEvent.which === 1;
    // const isMiddleClick = ev.nativeEvent.which === 2;

    // if (isLeftClick && !this.props.isActive) {
    //   this.props.onSelect();
    // } else if (isMiddleClick) {
    //   this.props.onClose();
    // }
  // }

  template(css) {
    const {borderColor, isFirst, isLast, title, isActive, onSelect} = this.props;
    return (
      <li
        className={css('tab',
        isFirst && 'first',
        isActive && 'active',
        isFirst && isActive && 'firstActive')}
        onMouseEnter={this.handleHover}
        onMouseLeave={this.handleBlur}
        onClick={onSelect}
        style={{borderColor}}
        >
        { this.props.customChildrenBefore }
        <span
          className={css('text', isLast && 'textLast', isActive && 'textActive')}
          onClick={this.handleClick}
          >
          <span className={css('textInner')}>
            {title}
          </span>
        </span>
        { this.props.customChildren }
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

      text: {
        transition: 'color .2s ease',
        height: '34px',
        display: 'block',
        width: '100%',
        position: 'relative',
        overflow: 'hidden'
      },

      textInner: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        textAlign: 'center'
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
      }
    };
  }

}

export default Tab;
