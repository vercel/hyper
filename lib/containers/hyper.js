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
    const {moveTo, moveLeft, moveRight} = this.props;
    const term = this.terms.getActiveTerm();
    if (!term) {
      return;
    }
    const lastIndex = this.terms.getLastTermIndex();
    const document = term.getTermDocument();
    const keys = new Mousetrap(document);
    keys.bind('mod+1', moveTo.bind(this, 0));
    keys.bind('mod+2', moveTo.bind(this, 1));
    keys.bind('mod+3', moveTo.bind(this, 2));
    keys.bind('mod+4', moveTo.bind(this, 3));
    keys.bind('mod+5', moveTo.bind(this, 4));
    keys.bind('mod+6', moveTo.bind(this, 5));
    keys.bind('mod+7', moveTo.bind(this, 6));
    keys.bind('mod+8', moveTo.bind(this, 7));
    keys.bind('mod+9', moveTo.bind(this, lastIndex));

    keys.bind('mod+shift+left', moveLeft);
    keys.bind('mod+shift+right', moveRight);
    keys.bind('mod+shift+[', moveLeft);
    keys.bind('mod+shift+]', moveRight);
    keys.bind('mod+alt+left', moveLeft);
    keys.bind('mod+alt+right', moveRight);
    keys.bind('ctrl+shift+tab', moveLeft);
    keys.bind('ctrl+tab', moveRight);

    const bound = method => term[method].bind(term);
    keys.bind('alt+left', bound('moveWordLeft'));
    keys.bind('alt+right', bound('moveWordRight'));
    keys.bind('alt+backspace', bound('deleteWordLeft'));
    keys.bind('alt+del', bound('deleteWordRight'));
    keys.bind('mod+backspace', bound('deleteLine'));
    keys.bind('mod+left', bound('moveToStart'));
    keys.bind('mod+right', bound('moveToEnd'));
    keys.bind('mod+a', bound('selectAll'));
    this.keys = keys;
  }

  onTermsRef(terms) {
    this.terms = terms;
  }

  componentDidUpdate(prev) {
    if (prev.activeSession !== this.props.activeSession) {
      if (this.keys) {
        this.keys.reset();
      }
      this.handleFocusActive();
      this.attachKeyListeners();
    }
  }

  componentWillUnmount() {
    if (this.keys) {
      this.keys.reset();
    }
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
      },

      moveLeft: () => {
        dispatch(uiActions.moveLeft());
      },

      moveRight: () => {
        dispatch(uiActions.moveRight());
      }
    };
  },
  null,
  {withRef: true}
)(Hyper, 'Hyper');

export default HyperContainer;
