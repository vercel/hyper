import React, {forwardRef} from 'react';

import type {NotificationsProps} from '../../typings/hyper';
import {decorate} from '../utils/plugins';

import Notification_ from './notification';

const Notification = decorate(Notification_, 'Notification');

const Notifications = forwardRef<HTMLDivElement, NotificationsProps>((props, ref) => {
  return (
    <div className="notifications_view" ref={ref}>
      {props.customChildrenBefore}
      {props.fontShowing && (
        <Notification
          key="font"
          backgroundColor="rgba(255, 255, 255, .2)"
          text={`${props.fontSize}px`}
          userDismissable={false}
          onDismiss={props.onDismissFont}
          dismissAfter={1000}
        />
      )}

      {props.resizeShowing && (
        <Notification
          key="resize"
          backgroundColor="rgba(255, 255, 255, .2)"
          text={`${props.cols}x${props.rows}`}
          userDismissable={false}
          onDismiss={props.onDismissResize}
          dismissAfter={1000}
        />
      )}

      {props.messageShowing && (
        <Notification
          key="message"
          backgroundColor="#FE354E"
          color="#fff"
          text={props.messageText}
          onDismiss={props.onDismissMessage}
          userDismissable={props.messageDismissable}
        >
          {props.messageURL ? (
            <>
              {props.messageText} (
              <a
                style={{color: '#fff'}}
                onClick={(ev) => {
                  void window.require('electron').shell.openExternal(ev.currentTarget.href);
                  ev.preventDefault();
                }}
                href={props.messageURL}
              >
                more
              </a>
              )
            </>
          ) : null}
        </Notification>
      )}

      {props.updateShowing && (
        <Notification
          key="update"
          backgroundColor="#18E179"
          color="#000"
          text={`Version ${props.updateVersion} ready`}
          onDismiss={props.onDismissUpdate}
          userDismissable
        >
          Version <b>{props.updateVersion}</b> ready.
          {props.updateNote && ` ${props.updateNote.trim().replace(/\.$/, '')}`} (
          <a
            style={{color: '#000'}}
            onClick={(ev) => {
              void window.require('electron').shell.openExternal(ev.currentTarget.href);
              ev.preventDefault();
            }}
            href={`https://github.com/vercel/hyper/releases/tag/${props.updateVersion}`}
          >
            notes
          </a>
          ).{' '}
          {props.updateCanInstall ? (
            <a
              style={{
                cursor: 'pointer',
                textDecoration: 'underline',
                fontWeight: 'bold'
              }}
              onClick={props.onUpdateInstall}
            >
              Restart
            </a>
          ) : (
            <a
              style={{
                color: '#000',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontWeight: 'bold'
              }}
              onClick={(ev) => {
                void window.require('electron').shell.openExternal(ev.currentTarget.href);
                ev.preventDefault();
              }}
              href={props.updateReleaseUrl!}
            >
              Download
            </a>
          )}
          .{' '}
        </Notification>
      )}
      {props.customChildren}

      <style jsx>{`
        .notifications_view {
          position: fixed;
          bottom: 20px;
          right: 20px;
        }
      `}</style>
    </div>
  );
});

Notifications.displayName = 'Notifications';

export default Notifications;
