import React from 'react';
import {connect} from 'react-redux';
import Component from '../component';
import {decorate, getTermProps} from '../utils/plugins';
import {resizeTermGroup} from '../actions/term-groups';
import Term_ from './term';
import SplitPane_ from './split-pane';

const Term = decorate(Term_, 'Term');
const SplitPane = decorate(SplitPane_, 'SplitPane');

class TermGroup_ extends Component {

  constructor(props, context) {
    super(props, context);
    this.bound = new WeakMap();
  }

  bind(fn, thisObj, uid) {
    if (!this.bound.has(fn)) {
      this.bound.set(fn, {});
    }
    const map = this.bound.get(fn);
    if (!map[uid]) {
      map[uid] = fn.bind(thisObj, uid);
    }
    return map[uid];
  }

  renderSplit(groups) {
    const [first, ...rest] = groups;
    if (rest.length === 0) {
      return first;
    }

    const direction = this.props.termGroup.direction.toLowerCase();
    return (<SplitPane
      direction={direction}
      sizes={this.props.termGroup.sizes}
      onResize={this.props.onTermGroupResize}
      borderColor={this.props.borderColor}
      >
      { groups }
    </SplitPane>);
  }

  renderTerm(uid) {
    const session = this.props.sessions[uid];
    const termRef = this.props.terms[uid];
    const props = getTermProps(uid, this.props, {
      isTermActive: uid === this.props.activeSession,
      term: termRef ? termRef.term : null,
      customCSS: this.props.customCSS,
      fontSize: this.props.fontSize,
      cursorColor: this.props.cursorColor,
      cursorShape: this.props.cursorShape,
      fontFamily: this.props.fontFamily,
      fontSmoothing: this.props.fontSmoothing,
      foregroundColor: this.props.foregroundColor,
      backgroundColor: this.props.backgroundColor,
      modifierKeys: this.props.modifierKeys,
      padding: this.props.padding,
      colors: this.props.colors,
      url: session.url,
      cleared: session.cleared,
      cols: session.cols,
      rows: session.rows,
      copyOnSelect: this.props.copyOnSelect,
      bell: this.props.bell,
      bellSoundURL: this.props.bellSoundURL,
      onActive: this.bind(this.props.onActive, null, uid),
      onResize: this.bind(this.props.onResize, null, uid),
      onTitle: this.bind(this.props.onTitle, null, uid),
      onData: this.bind(this.props.onData, null, uid),
      onURLAbort: this.bind(this.props.onURLAbort, null, uid),
      borderColor: this.props.borderColor
    });

    // This will create a new ref_ function for every render,
    // which is inefficient. Should maybe do something similar
    // to this.bind.
    return (<Term
      ref_={term => this.props.ref_(uid, term)}
      key={uid}
      {...props}
      />);
  }

  template() {
    const {childGroups, termGroup} = this.props;
    if (termGroup.sessionUid) {
      return this.renderTerm(termGroup.sessionUid);
    }

    const groups = childGroups.map(child => {
      const props = Object.assign({}, this.props, {
        termGroup: child
      });

      return (<TermGroup
        key={child.uid}
        {...props}
        />);
    });

    return this.renderSplit(groups);
  }
}

const TermGroup = connect(
  (state, ownProps) => ({
    childGroups: ownProps.termGroup.children.map(uid =>
      state.termGroups.termGroups[uid]
    )
  }),
  (dispatch, ownProps) => ({
    onTermGroupResize(splitSizes) {
      dispatch(resizeTermGroup(ownProps.termGroup.uid, splitSizes));
    }
  })
)(TermGroup_);

export default TermGroup;
