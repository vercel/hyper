import React from 'react';
import Component from '../component';
import Notification_ from './notification';
import { decorate } from '../utils/plugins';

const Notification = decorate(Notification_);

export default class Notifications extends Component {

  template (css) {
    return <div className={ css('view') }>
      { this.props.customChildrenBefore }
      {
        this.props.fontShowing &&
          <Notification
            key='font'
            backgroundColor='rgba(255, 255, 255, .2)'
            text={`${this.props.fontSize}px`}
            userDismissable={ false }
            onDismiss={ this.props.onDismissFont }
            dismissAfter={ 1000 } />
      }

      {
        this.props.resizeShowing &&
          <Notification
            key='resize'
            backgroundColor='rgba(255, 255, 255, .2)'
            text={`${this.props.cols}x${this.props.rows}`}
            userDismissable={ false }
            onDismiss={ this.props.onDismissResize }
            dismissAfter={ 1000 } />
      }

      {
        this.props.updateShowing &&
          <Notification
            key='update'
            backgroundColor='#7ED321'
            text={`Version ${this.props.updateVersion} available`}
            onDismiss={ this.props.onDismissUpdate }
            userDismissable={ true }>
            Version <b>{ this.props.updateVersion}</b> available.
            { this.props.updateNote && ` ${this.props.updateNote.trim().replace(/\.$/, '')}.` }
            { ' ' }
            <a style={{
              cursor: 'pointer',
              textDecoration: 'underline',
              fontWeight: 'bold' }}
              onClick={ this.props.onUpdateInstall }>
                Restart
              </a>
            { ' ' }
          </Notification>
      }
      { this.props.customChildren }
    </div>;
  }

  styles () {
    return {
      view: {
        position: 'fixed',
        bottom: '20px',
        right: '20px'
      }
    };
  }

}
