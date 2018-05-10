import React from 'react';
import {decorate, getTermGroupProps} from '../utils/plugins';
import {registerCommandHandlers} from '../command-registry';
import TermGroup_ from './term-group';
import StyleSheet_ from './style-sheet';

const TermGroup = decorate(TermGroup_, 'TermGroup');
const StyleSheet = decorate(StyleSheet_, 'StyleSheet');

const isMac = /Mac/.test(navigator.userAgent);

export default class Terms extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.terms = {};
    this.bound = new WeakMap();
    this.onRef = this.onRef.bind(this);
    this.registerCommands = registerCommandHandlers;
    props.ref_(this);
  }

  shouldComponentUpdate(nextProps) {
    for (const i in nextProps) {
      if (i === 'write') {
        continue;
      }
      if (this.props[i] !== nextProps[i]) {
        return true;
      }
    }
    for (const i in this.props) {
      if (i === 'write') {
        continue;
      }
      if (this.props[i] !== nextProps[i]) {
        return true;
      }
    }
    return false;
  }

  onRef(uid, term) {
    if (term) {
      this.terms[uid] = term;
    } else if (!this.props.sessions[uid]) {
      delete this.terms[uid];
    }
  }

  getTermByUid(uid) {
    return this.terms[uid];
  }

  getActiveTerm() {
    return this.getTermByUid(this.props.activeSession);
  }

  getLastTermIndex() {
    return this.props.sessions.length - 1;
  }

  onTerminal(uid, term) {
    this.terms[uid] = term;
  }

  componentDidMount() {
    window.addEventListener('contextmenu', () => {
      const selection = window.getSelection().toString();
      const {props: {uid}} = this.getActiveTerm();
      this.props.onContextMenu(uid, selection);
    });
  }

  componentWillUnmount() {
    this.props.ref_(null);
  }

  render() {
    const shift = !isMac && this.props.termGroups.length > 1;
    return (
      <div className={`terms_terms ${shift ? 'terms_termsShifted' : ''}`}>
        {this.props.customChildrenBefore}
        {this.props.termGroups.map(termGroup => {
          const {uid} = termGroup;
          const isActive = uid === this.props.activeRootGroup;
          const props = getTermGroupProps(uid, this.props, {
            termGroup,
            terms: this.terms,
            activeSession: this.props.activeSession,
            sessions: this.props.sessions,
            backgroundColor: this.props.backgroundColor,
            foregroundColor: this.props.foregroundColor,
            borderColor: this.props.borderColor,
            selectionColor: this.props.selectionColor,
            colors: this.props.colors,
            cursorShape: this.props.cursorShape,
            cursorBlink: this.props.cursorBlink,
            cursorColor: this.props.cursorColor,
            fontSize: this.props.fontSize,
            fontFamily: this.props.fontFamily,
            uiFontFamily: this.props.uiFontFamily,
            fontWeight: this.props.fontWeight,
            fontWeightBold: this.props.fontWeightBold,
            lineHeight: this.props.lineHeight,
            letterSpacing: this.props.letterSpacing,
            padding: this.props.padding,
            bell: this.props.bell,
            bellSoundURL: this.props.bellSoundURL,
            copyOnSelect: this.props.copyOnSelect,
            modifierKeys: this.props.modifierKeys,
            onActive: this.props.onActive,
            onResize: this.props.onResize,
            onTitle: this.props.onTitle,
            onData: this.props.onData,
            onURLAbort: this.props.onURLAbort,
            onContextMenu: this.props.onContextMenu,
            quickEdit: this.props.quickEdit,
            parentProps: this.props
          });

          return (
            <div key={`d${uid}`} className={`terms_termGroup ${isActive ? 'terms_termGroupActive' : ''}`}>
              <TermGroup key={uid} ref_={this.onRef} {...props} />
            </div>
          );
        })}
        {this.props.customChildren}
        <StyleSheet
          backgroundColor={this.props.backgroundColor}
          customCSS={this.props.customCSS}
          fontFamily={this.props.fontFamily}
          foregroundColor={this.props.foregroundColor}
          borderColor={this.props.borderColor}
        />

        <style jsx>{`
          .terms_terms {
            position: absolute;
            margin-top: 34px;
            top: 0;
            right: 0;
            left: 0;
            bottom: 0;
            color: #fff;
            transition: ${isMac ? 'none' : 'margin-top 0.3s ease'};
          }

          .terms_termsShifted {
            margin-top: 68px;
          }

          .terms_termGroup {
            display: block;
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: -9999em; /* Offscreen to pause xterm rendering, thanks to IntersectionObserver */
          }

          .terms_termGroupActive {
            left: 0;
          }
        `}</style>
      </div>
    );
  }
}
