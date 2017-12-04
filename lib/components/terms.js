import React from 'react';
import {Component} from '../base-components';
import {decorate, getTermGroupProps} from '../utils/plugins';
import {registerCommandHandlers} from '../command-registry';
import TermGroup_ from './term-group';
import StyleSheet_ from './style-sheet';

const TermGroup = decorate(TermGroup_, 'TermGroup');
const StyleSheet = decorate(StyleSheet_, 'StyleSheet');

const isMac = /Mac/.test(navigator.userAgent);

export default class Terms extends Component {
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

  template(css) {
    const shift = !isMac && this.props.termGroups.length > 1;
    return (
      <div className={css('terms', shift && 'termsShifted')}>
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
            borderColor: this.props.borderColor,
            cursorShape: this.props.cursorShape,
            cursorBlink: this.props.cursorBlink,
            fontSize: this.props.fontSize,
            fontFamily: this.props.fontFamily,
            uiFontFamily: this.props.uiFontFamily,
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
            <div key={`d${uid}`} className={css('termGroup', isActive && 'termGroupActive')}>
              <TermGroup key={uid} ref_={this.onRef} {...props} />
            </div>
          );
        })}
        {this.props.customChildren}
        <StyleSheet
          colors={this.props.colors}
          backgroundColor={this.props.backgroundColor}
          customCSS={this.props.customCSS}
          cursorColor={this.props.cursorColor}
          fontSize={this.props.fontSize}
          fontFamily={this.props.fontFamily}
          fontSmoothing={this.props.fontSmoothing}
          foregroundColor={this.props.foregroundColor}
          borderColor={this.props.borderColor}
        />
      </div>
    );
  }

  styles() {
    return {
      terms: {
        position: 'absolute',
        marginTop: '34px',
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
        color: '#fff',
        transition: isMac ? '' : 'margin-top 0.3s ease'
      },

      termsShifted: {
        marginTop: '68px'
      },

      termGroup: {
        display: 'none',
        width: '100%',
        height: '100%'
      },

      termGroupActive: {
        display: 'block'
      }
    };
  }
}
