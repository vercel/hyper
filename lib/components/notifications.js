import React from 'react';

import {PureComponent} from '../base-components';
import {decorate} from '../utils/plugins';

import Notification_ from './notification';

const Notification = decorate(Notification_, 'Notification');

export default class Notifications extends PureComponent {
  template(css) {
    return (
      <div className={css('view')}>
        {this.props.customChildrenBefore}
        {this.props.fontShowing && (
          <Notification
            key="font"
            backgroundColor="rgba(255, 255, 255, .2)"
            text={`${this.props.fontSize}px`}
            userDismissable={false}
            onDismiss={this.props.onDismissFont}
            dismissAfter={1000}
          />
        )}

        {this.props.resizeShowing && (
          <Notification
            key="resize"
            backgroundColor="rgba(255, 255, 255, .2)"
            text={`${this.props.cols}x${this.props.rows}`}
            userDismissable={false}
            onDismiss={this.props.onDismissResize}
            dismissAfter={1000}
          />
        )}

        {this.props.messageShowing && (
          <Notification
            key="message"
            backgroundColor="#FE354E"
            text={this.props.messageText}
            onDismiss={this.props.onDismissMessage}
            userDismissable={this.props.messageDismissable}
            userDismissColor="#AA2D3C"
          >
            {this.props.messageURL
              ? [
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
                  >
                    more
                  </a>,
                  ')'
                ]
              : null}
          </Notification>
        )}

        {this.props.updateShowing && (
          <Notification
            key="update"
            backgroundColor="#7ED321"
            text={`Version ${this.props.updateVersion} ready`}
            onDismiss={this.props.onDismissUpdate}
            userDismissable
          >
            Version <b>{this.props.updateVersion}</b> ready.
            {this.props.updateNote && ` ${this.props.updateNote.trim().replace(/\.$/, '')}`} (<a
              style={{color: '#fff'}}
              onClick={ev => {
                window.require('electron').shell.openExternal(ev.target.href);
                ev.preventDefault();
              }}
              href={this.props.updateReleaseUrl}
            >
              notes
            </a>).{' '}
            {this.props.updateCanInstall ? (
              <a
                style={{
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontWeight: 'bold'
                }}
                onClick={this.props.onUpdateInstall}
              >
                Restart
              </a>
            ) : (
              <a
                style={{
                  color: '#fff',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontWeight: 'bold'
                }}
                onClick={ev => {
                  window.require('electron').shell.openExternal(ev.target.href);
                  ev.preventDefault();
                }}
                href={this.props.updateReleaseUrl}
              >
                Download
              </a>
            )}.{' '}
          </Notification>
        )}
        {this.props.customChildren}
      </div>
    );
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
