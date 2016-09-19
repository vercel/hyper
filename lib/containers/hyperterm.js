import React from 'react';
import HeaderContainer from './header';
import TermsContainer from './terms';
import NotificationsContainer from './notifications';
import Component from '../component';
import Mousetrap from 'mousetrap';
import * as uiActions from '../actions/ui';
import { connect } from '../utils/plugins';

const isMac = /Mac/.test(navigator.userAgent);

class HyperTerm extends Component {
  constructor (props) {
    super(props);
    this.focusActive = this.focusActive.bind(this);
    this.onTermsRef = this.onTermsRef.bind(this);
  }

  componentWillReceiveProps (next) {
    if (this.props.backgroundColor !== next.backgroundColor) {
      // this can be removed when `setBackgroundColor` in electron
      // starts working again
      document.body.style.backgroundColor = next.backgroundColor;
    }
  }

  focusActive () {
    const term = this.terms.getActiveTerm();
    if (term) term.focus();
  }

  attachKeyListeners () {
    const { moveTo, moveLeft, moveRight } = this.props;
    const term = this.terms.getActiveTerm();
    if (!term) return;
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

    keys.bind('command+shift+left', moveLeft);
    keys.bind('command+shift+right', moveRight);
    keys.bind('command+shift+[', moveLeft);
    keys.bind('command+shift+]', moveRight);
    keys.bind('command+alt+left', moveLeft);
    keys.bind('command+alt+right', moveRight);
    keys.bind('ctrl+shift+tab', moveLeft);
    keys.bind('ctrl+tab', moveRight);

    const bound = method => { return term[method].bind(term); };
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

  onTermsRef (terms) {
    this.terms = terms;
  }

  componentDidUpdate (prev) {
    if (prev.activeSession !== this.props.activeSession) {
      if (this.keys) this.keys.reset();
      this.focusActive();
      this.attachKeyListeners();
    }
  }

  componentWillUnmount () {
    if (this.keys) this.keys.reset();
    document.body.style.backgroundColor = 'inherit';
  }

  template (css) {
    const { isMac, customCSS, borderColor } = this.props;
    return <div onClick={ this.focusActive }>
      <div
        style={{ borderColor }}
        className={ css('main', isMac && 'mainRounded') }>
        <HeaderContainer />
        <TermsContainer ref_={this.onTermsRef} />
      </div>

      <NotificationsContainer />
      <style dangerouslySetInnerHTML={{ __html: customCSS }} />
      { this.props.customChildren }
    </div>;
  }

  styles () {
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

const HyperTermContainer = connect(
  (state) => {
    return {
      isMac,
      customCSS: state.ui.css,
      borderColor: state.ui.borderColor,
      activeSession: state.sessions.activeUid,
      backgroundColor: state.ui.backgroundColor
    };
  },
  (dispatch) => {
    return {
      moveTo: (i) => {
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
  { withRef: true }
)(HyperTerm, 'HyperTerm');

export default HyperTermContainer;
