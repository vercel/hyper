/* eslint-disable react/no-danger */

import React from 'react';
import Mousetrap from 'mousetrap';

import {connect} from '../utils/plugins';
import * as uiActions from '../actions/ui';
import {getRegisteredKeys, getCommandHandler, shouldPreventDefault} from '../command-registry';
import stylis from 'stylis';

import {HeaderContainer} from './header';
import TermsContainer from './terms';
import NotificationsContainer from './notifications';
import {HyperState} from '../hyper';
import {Dispatch} from 'redux';

const isMac = /Mac/.test(navigator.userAgent);

class Hyper extends React.PureComponent<any, any> {
  mousetrap!: MousetrapInstance;
  terms: any;
  constructor(props: any) {
    super(props);
    this.state = {
      lastConfigUpdate: 0
    };
  }
  //TODO: Remove usage of legacy and soon deprecated lifecycle methods
  UNSAFE_componentWillReceiveProps(next: any) {
    if (this.props.backgroundColor !== next.backgroundColor) {
      // this can be removed when `setBackgroundColor` in electron
      // starts working again
      document.body.style.backgroundColor = next.backgroundColor;
    }
    const {lastConfigUpdate} = next;
    if (lastConfigUpdate && lastConfigUpdate !== this.state.lastConfigUpdate) {
      this.setState({lastConfigUpdate});
      this.attachKeyListeners();
    }
  }

  handleFocusActive = (uid: string) => {
    const term = this.terms.getTermByUid(uid);
    if (term) {
      term.focus();
    }
  };

  handleSelectAll = () => {
    const term = this.terms.getActiveTerm();
    if (term) {
      term.selectAll();
    }
  };

  attachKeyListeners() {
    if (!this.mousetrap) {
      this.mousetrap = new Mousetrap();
      this.mousetrap.stopCallback = () => {
        // All events should be intercepted even if focus is in an input/textarea
        return false;
      };
    } else {
      this.mousetrap.reset();
    }

    const keys: Record<string, any> = getRegisteredKeys();
    Object.keys(keys).forEach(commandKeys => {
      this.mousetrap.bind(
        commandKeys,
        (e: any) => {
          const command = keys[commandKeys];
          // We should tell to xterm that it should ignore this event.
          e.catched = true;
          this.props.execCommand(command, getCommandHandler(command), e);
          shouldPreventDefault(command) && e.preventDefault();
        },
        'keydown'
      );
    });
  }

  componentDidMount() {
    this.attachKeyListeners();
    window.rpc.on('term selectAll', this.handleSelectAll);
  }

  onTermsRef = (terms: any) => {
    this.terms = terms;
    window.focusActiveTerm = this.handleFocusActive;
  };

  componentDidUpdate(prev: any) {
    if (prev.activeSession !== this.props.activeSession) {
      this.handleFocusActive(this.props.activeSession);
    }
  }

  componentWillUnmount() {
    document.body.style.backgroundColor = 'inherit';
    this.mousetrap && this.mousetrap.reset();
  }

  render() {
    const {isMac: isMac_, customCSS, uiFontFamily, borderColor, maximized, fullScreen} = this.props;
    const borderWidth = isMac_ ? '' : `${maximized ? '0' : '1'}px`;
    stylis.set({prefix: false});
    return (
      <div id="hyper">
        <div
          style={{fontFamily: uiFontFamily, borderColor, borderWidth}}
          className={`hyper_main ${isMac_ && 'hyper_mainRounded'} ${fullScreen ? 'fullScreen' : ''}`}
        >
          <HeaderContainer />
          <TermsContainer ref_={this.onTermsRef} />
          {this.props.customInnerChildren}
        </div>

        <NotificationsContainer />

        {this.props.customChildren}

        <style jsx>
          {`
            .hyper_main {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              border: 1px solid #333;
            }

            .hyper_mainRounded {
              border-radius: 5px;
            }
          `}
        </style>

        {/*
          Add custom CSS to Hyper.
          We add a scope to the customCSS so that it can get around the weighting applied by styled-jsx
        */}
        <style dangerouslySetInnerHTML={{__html: stylis('#hyper', customCSS)}} />
      </div>
    );
  }
}

const HyperContainer = connect(
  (state: HyperState) => {
    return {
      isMac,
      customCSS: state.ui.css,
      uiFontFamily: state.ui.uiFontFamily,
      borderColor: state.ui.borderColor,
      activeSession: state.sessions.activeUid,
      backgroundColor: state.ui.backgroundColor,
      maximized: state.ui.maximized,
      fullScreen: state.ui.fullScreen,
      lastConfigUpdate: state.ui._lastUpdate
    };
  },
  (dispatch: Dispatch<any>) => {
    return {
      execCommand: (command: any, fn: any, e: any) => {
        dispatch(uiActions.execCommand(command, fn, e));
      }
    };
  },
  null,
  {forwardRef: true}
)(Hyper, 'Hyper');

export default HyperContainer;
