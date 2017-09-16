/* eslint-disable react/no-danger */

import React from 'react';

import {PureComponent} from '../base-components';
import {connect} from '../utils/plugins';
import * as uiActions from '../actions/ui';

import HeaderContainer from './header';
import TermsContainer from './terms';
import NotificationsContainer from './notifications';

const isMac = /Mac/.test(navigator.userAgent);

class Hyper extends PureComponent {
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
    // eslint-disable-next-line no-console
    console.error('removed key listeners');
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
    const {isMac: isMac_, customCSS, uiFontFamily, borderColor, maximized} = this.props;
    const borderWidth = isMac_ ? '' : `${maximized ? '0' : '1'}px`;

    return (
      <div>
        <div
          style={{fontFamily: uiFontFamily, borderColor, borderWidth}}
          className={css('main', isMac_ && 'mainRounded')}
        >
          <HeaderContainer />
          <TermsContainer ref_={this.onTermsRef} />
          {this.props.customInnerChildren}
        </div>

        <NotificationsContainer />
        <style dangerouslySetInnerHTML={{__html: customCSS}} />
        {this.props.customChildren}
      </div>
    );
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
      uiFontFamily: state.ui.uiFontFamily,
      borderColor: state.ui.borderColor,
      activeSession: state.sessions.activeUid,
      backgroundColor: state.ui.backgroundColor,
      maximized: state.ui.maximized
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
