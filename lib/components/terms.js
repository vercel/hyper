import React from 'react';
import Component from '../component';
import {decorate, getTermGroupProps} from '../utils/plugins';
import TermGroup_ from './term-group';

const TermGroup = decorate(TermGroup_, 'TermGroup');
const isMac = /Mac/.test(navigator.userAgent);

export default class Terms extends Component {

  constructor(props, context) {
    super(props, context);
    this.terms = {};
    this.bound = new WeakMap();
    this.onRef = this.onRef.bind(this);
    props.ref_(this);
  }

  componentWillReceiveProps(next) {
    const {write} = next;
    if (write && this.props.write !== write) {
      this.getTermByUid(write.uid).write(write.data);
    }
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

  componentWillUnmount() {
    this.props.ref_(null);
  }

  template(css) {
    const shift = !isMac && this.props.termGroups.length > 1;
    return (<div
      className={css('terms', shift && 'termsShifted')}
      >
      { this.props.customChildrenBefore }
      {
        this.props.termGroups.map(termGroup => {
          const {uid} = termGroup;
          const isActive = uid === this.props.activeRootGroup;
          const props = getTermGroupProps(uid, this.props, {
            termGroup,
            terms: this.terms,
            activeSession: this.props.activeSession,
            sessions: this.props.sessions,
            customCSS: this.props.customCSS,
            fontSize: this.props.fontSize,
            borderColor: this.props.borderColor,
            cursorColor: this.props.cursorColor,
            cursorShape: this.props.cursorShape,
            fontFamily: this.props.fontFamily,
            fontSmoothing: this.props.fontSmoothing,
            foregroundColor: this.props.foregroundColor,
            backgroundColor: this.props.backgroundColor,
            padding: this.props.padding,
            colors: this.props.colors,
            bell: this.props.bell,
            bellSoundURL: this.props.bellSoundURL,
            copyOnSelect: this.props.copyOnSelect,
            modifierKeys: this.props.modifierKeys,
            onActive: this.props.onActive,
            onResize: this.props.onResize,
            onTitle: this.props.onTitle,
            onData: this.props.onData,
            onURLAbort: this.props.onURLAbort
          });

          return (
            <div
              key={`d${uid}`}
              className={css('termGroup', isActive && 'termGroupActive')}
              >
              <TermGroup
                key={uid}
                ref_={this.onRef}
                {...props}
                />
            </div>
          );
        })
      }
      { this.props.customChildren }
    </div>);
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
