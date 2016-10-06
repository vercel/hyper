import React from 'react';

import Component from '../component';
import {decorate} from '../utils/plugins';

import Notification_ from './notification';

const Notification = decorate(Notification_);

export default class Notifications extends Component {

  template(css) {
    return (<div className={css('view')}>
      { this.props.customChildrenBefore }
      {
        this.props.fontShowing &&
          <Notification
            key="font"
            backgroundColor="rgba(255, 255, 255, .2)"
            text={`${this.props.fontSize}px`}
            userDismissable={false}
            onDismiss={this.props.onDismissFont}
            dismissAfter={1000}
            />
      }

      {
        this.props.resizeShowing &&
          <Notification
            key="resize"
            backgroundColor="rgba(255, 255, 255, .2)"
            text={`${this.props.cols}x${this.props.rows}`}
            userDismissable={false}
            onDismiss={this.props.onDismissResize}
            dismissAfter={1000}
            />
      }

      {
        this.props.messageShowing &&
          <Notification
            key="message"
            backgroundColor="#FE354E"
            text={this.props.messageText}
            onDismiss={this.props.onDismissMessage}
            userDismissable={this.props.messageDismissable}
            userDismissColor="#AA2D3C"
            >{
              this.props.messageURL ? [
                this.props.messageText,
                ' (',
                <a
                  key="link"
                  style={{color: '#fff'}}
                  onClick={ev => {
                    window.require('electron').shell.openExternal(ev.target.href);
                    ev.preventDefault();
                  }}
                  href={this.props.messageURL}
                  >more</a>,
                ')'
              ] : null
            }
          </Notification>
      }

      {
        this.props.updateShowing &&
          <Notification
            key="update"
            backgroundColor="#7ED321"
            text={`Version ${this.props.updateVersion} ready`}
            onDismiss={this.props.onDismissUpdate}
            userDismissable
            >
            Version <b>{this.props.updateVersion}</b> ready.
            {this.props.updateNote && ` ${this.props.updateNote.trim().replace(/\.$/, '')}`}
            {' '}
            (<a
              style={{color: '#fff'}}
              onClick={ev => {
                window.require('electron').shell.openExternal(ev.target.href);
                ev.preventDefault();
              }}
              href={`https://github.com/zeit/hyper/releases/tag/${this.props.updateVersion}`}
              >notes</a>).
            {' '}
            <a
              style={{
                cursor: 'pointer',
                textDecoration: 'underline',
                fontWeight: 'bold'
              }}
              onClick={this.props.onUpdateInstall}
              >
                Restart
            </a>.
            { ' ' }
          </Notification>
      }
      { this.props.customChildren }
    </div>);
  }

  styles() {
    return {
      view: {
        position: 'fixed',
        bottom: '20px',
        right: '20px'
      }
    };
  }

}
