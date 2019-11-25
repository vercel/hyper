import React from 'react';

export default class Notification extends React.PureComponent {
  constructor() {
    super();
    this.state = {
      dismissing: false
    };
  }

  componentDidMount() {
    if (this.props.dismissAfter) {
      this.setDismissTimer();
    }
  }
  //TODO: Remove usage of legacy and soon deprecated lifecycle methods
  UNSAFE_componentWillReceiveProps(next) {
    // if we have a timer going and the notification text
    // changed we reset the timer
    if (next.text !== this.props.text) {
      if (this.props.dismissAfter) {
        this.resetDismissTimer();
      }
      if (this.state.dismissing) {
        this.setState({dismissing: false});
      }
    }
  }

  handleDismiss = () => {
    this.setState({dismissing: true});
  };

  onElement = el => {
    if (el) {
      el.addEventListener('webkitTransitionEnd', () => {
        if (this.state.dismissing) {
          this.props.onDismiss();
        }
      });
      const {backgroundColor} = this.props;
      if (backgroundColor) {
        el.style.setProperty('background-color', backgroundColor, 'important');
      }
    }
  };

  setDismissTimer() {
    this.dismissTimer = setTimeout(() => {
      this.handleDismiss();
    }, this.props.dismissAfter);
  }

  resetDismissTimer() {
    clearTimeout(this.dismissTimer);
    this.setDismissTimer();
  }

  componentWillUnmount() {
    clearTimeout(this.dismissTimer);
  }

  render() {
    const {backgroundColor, color} = this.props;
    const opacity = this.state.dismissing ? 0 : 1;
    return (
      <div ref={this.onElement} style={{opacity, backgroundColor, color}} className="notification_indicator">
        {this.props.customChildrenBefore}
        {this.props.children || this.props.text}
        {this.props.userDismissable ? (
          <a
            className="notification_dismissLink"
            onClick={this.handleDismiss}
            style={{color: this.props.userDismissColor}}
          >
            [x]
          </a>
        ) : null}
        {this.props.customChildren}

        <style jsx>{`
          .notification_indicator {
            display: inline-block;
            cursor: default;
            -webkit-user-select: none;
            background: rgba(255, 255, 255, 0.2);
            padding: 8px 14px 9px;
            margin-left: 10px;
            transition: 150ms opacity ease;
            color: #fff;
            font-size: 12px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell',
              'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
          }

          .notification_dismissLink {
            position: relative;
            left: 4px;
            cursor: pointer;
            opacity: 0.5;
            color: currentColor;
            transition: opacity 0.1s ease-in-out;
          }

          .notification_dismissLink:hover,
          .notification_dismissLink:focus {
            opacity: 1;
          }
        `}</style>
      </div>
    );
  }
}
