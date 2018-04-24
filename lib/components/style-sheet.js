import React from 'react';

export default class StyleSheet extends React.PureComponent {
  render() {
    const {backgroundColor, fontFamily, foregroundColor, borderColor} = this.props;

    return (
      <style jsx global>{`
        .xterm {
          font-family: ${fontFamily};
          font-feature-settings: 'liga' 0;
          position: relative;
          user-select: none;
          -ms-user-select: none;
          -webkit-user-select: none;
        }

        .xterm.focus,
        .xterm:focus {
          outline: none;
        }

        .xterm .xterm-helpers {
          position: absolute;
          top: 0;
          /**
          * The z-index of the helpers must be higher than the canvases in order for
          * IMEs to appear on top.
          */
          z-index: 10;
        }

        .xterm .xterm-helper-textarea {
          /*
          * HACK: to fix IE's blinking cursor
          * Move textarea out of the screen to the far left, so that the cursor is not visible.
          */
          position: absolute;
          opacity: 0;
          left: -9999em;
          top: 0;
          width: 0;
          height: 0;
          z-index: -10;
          /** Prevent wrapping so the IME appears against the textarea at the correct position */
          white-space: nowrap;
          overflow: hidden;
          resize: none;
        }

        .xterm .composition-view {
          /* TODO: Composition position got messed up somewhere */
          background: ${backgroundColor};
          color: ${foregroundColor};
          display: none;
          position: absolute;
          white-space: nowrap;
          z-index: 1;
        }

        .xterm .composition-view.active {
          display: block;
        }

        .xterm .xterm-viewport {
          /* On OS X this is required in order for the scroll bar to appear fully opaque */
          background-color: ${backgroundColor};
          overflow-y: scroll;
          cursor: default;
          position: absolute;
          right: 0;
          left: 0;
          top: 0;
          bottom: 0;
        }

        .xterm .xterm-screen {
          position: relative;
        }

        .xterm canvas {
          position: absolute;
          left: 0;
          top: 0;
        }

        .xterm .xterm-scroll-area {
          visibility: hidden;
        }

        .xterm .xterm-char-measure-element {
          display: inline-block;
          visibility: hidden;
          position: absolute;
          left: -9999em;
        }

        .xterm.enable-mouse-events {
          /* When mouse events are enabled (eg. tmux), revert to the standard pointer cursor */
          cursor: default;
        }

        .xterm:not(.enable-mouse-events) {
          cursor: text;
        }

        .xterm .xterm-accessibility,
        .xterm .xterm-message {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          right: 0;
          z-index: 100;
          color: transparent;
        }

        .xterm .xterm-accessibility-tree:focus [id^='xterm-active-item-'] {
          outline: 1px solid #f80;
        }

        .xterm .live-region {
          position: absolute;
          left: -9999px;
          width: 1px;
          height: 1px;
          overflow: hidden;
        }

        ::-webkit-scrollbar {
          width: 5px;
        }
        ::-webkit-scrollbar-thumb {
          -webkit-border-radius: 10px;
          border-radius: 10px;
          background: ${borderColor};
        }
        ::-webkit-scrollbar-thumb:window-inactive {
          background: ${borderColor};
        }
      `}</style>
    );
  }
}
