/* eslint-disable react/no-danger */

import Mousetrap from 'mousetrap';
import React from 'react';

import Component from '../component';
import {connect} from '../utils/plugins';
import * as uiActions from '../actions/ui';

import HeaderContainer from './header';
import TermsContainer from './terms';
import NotificationsContainer from './notifications';

const isMac = /Mac/.test(navigator.userAgent);

class Hyper extends Component {
  constructor(props) {
    super(props);
    /**
     * attachKeyListeners and resetKeyListeners
     * should be removed after being implemented in rpc
     * see app/menu.js
     */
    this.attachKeyListeners = this.attachKeyListeners.bind(this);
    this.resetKeyListeners = this.resetKeyListeners.bind(this);

    this.handleFocusActive = this.handleFocusActive.bind(this);
    this.onTermsRef = this.onTermsRef.bind(this);
  }

  componentWillReceiveProps(next) {
    if (this.props.backgroundColor !== next.backgroundColor) {
      // this can be removed when `setBackgroundColor` in electron
      // starts working again
      document.body.style.backgroundColor = next.backgroundColor;
    }
  }

  handleFocusActive() {
    const term = this.terms.getActiveTerm();
    if (term) {
      term.focus();
    }
  }

  attachKeyListeners() {
    const {moveTo} = this.props;
    const term = this.terms.getActiveTerm();
    if (!term) {
      return;
    }
    const lastIndex = this.terms.getLastTermIndex();
    const document = term.getTermDocument();
    const keys = new Mousetrap(document);

    keys.bind('command+1', moveTo.bind(this, 0));
    keys.bind('command+2', moveTo.bind(this, 1));
    keys.bind('command+3', moveTo.bind(this, 2));
    keys.bind('command+4', moveTo.bind(this, 3));
    keys.bind('command+5', moveTo.bind(this, 4));
    keys.bind('command+6', moveTo.bind(this, 5));
    keys.bind('command+7', moveTo.bind(this, 6));
    keys.bind('command+8', moveTo.bind(this, 7));
    keys.bind('command+9', moveTo.bind(this, lastIndex));

    const bound = method => term[method].bind(term);
    keys.bind('alt+left', bound('moveWordLeft'));
    keys.bind('alt+right', bound('moveWordRight'));
    keys.bind('alt+backspace', bound('deleteWordLeft'));
    keys.bind('alt+del', bound('deleteWordRight'));
    keys.bind('command+backspace', bound('deleteLine'));
    keys.bind('command+left', bound('moveToStart'));
    keys.bind('command+right', bound('moveToEnd'));
    keys.bind('command+a', bound('selectAll'));
    this.keys = keys;
  }

  resetKeyListeners() {
    if (this.keys) {
      this.keys.reset();
    }
  }

  onTermsRef(terms) {
    this.terms = terms;
  }

  componentDidUpdate(prev) {
    if (prev.activeSession !== this.props.activeSession) {
      this.resetKeyListeners();
      this.handleFocusActive();
      this.attachKeyListeners();
    }
  }

  componentWillUnmount() {
    this.resetKeyListeners();
    document.body.style.backgroundColor = 'inherit';
  }

  template(css) {
    const {isMac, customCSS, borderColor} = this.props;
    return (<div>
      <div
        style={{borderColor}}
        className={css('main', isMac && 'mainRounded')}
        >
        <HeaderContainer/>
        <TermsContainer ref_={this.onTermsRef}/>
      </div>

      <NotificationsContainer/>
      <style dangerouslySetInnerHTML={{__html: customCSS}}/>
      { this.props.customChildren }
    </div>);
  }

  styles() {
    return {
      main: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        // can be overridden by inline style above
        border: '1px solid #333'
      },

      mainRounded: {
        borderRadius: '5px'
      }
    };
  }
}

const HyperContainer = connect(
  state => {
    return {
      isMac,
      customCSS: state.ui.css,
      borderColor: state.ui.borderColor,
      activeSession: state.sessions.activeUid,
      backgroundColor: state.ui.backgroundColor
    };
  },
  dispatch => {
    return {
      moveTo: i => {
        dispatch(uiActions.moveTo(i));
      }
    };
  },
  null,
  {withRef: true}
)(Hyper, 'Hyper');

export default HyperContainer;
