import React from 'react';
import {connect} from 'react-redux';
import {decorate, getTermProps, getTermGroupProps} from '../utils/plugins';
import {resizeTermGroup} from '../actions/term-groups';
import Term_ from './term';
import SplitPane_ from './split-pane';

const Term = decorate(Term_, 'Term');
const SplitPane = decorate(SplitPane_, 'SplitPane');

class TermGroup_ extends React.PureComponent {
  constructor(props, context) {
    super(props, context);
    this.bound = new WeakMap();
    this.termRefs = {};
    this.sizeChanged = false;
    this.onTermRef = this.onTermRef.bind(this);
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
    return (
      <SplitPane
        direction={direction}
        sizes={this.props.termGroup.sizes}
        onResize={this.props.onTermGroupResize}
        borderColor={this.props.borderColor}
      >
        {groups}
      </SplitPane>
    );
  }

  onTermRef(uid, term) {
    this.term = term;
    this.props.ref_(uid, term);
  }

  renderTerm(uid) {
    const session = this.props.sessions[uid];
    const termRef = this.props.terms[uid];
    const props = getTermProps(uid, this.props, {
      isTermActive: uid === this.props.activeSession,
      term: termRef ? termRef.term : null,
      backgroundColor: this.props.backgroundColor,
      foregroundColor: this.props.foregroundColor,
      colors: this.props.colors,
      cursorBlink: this.props.cursorBlink,
      cursorShape: this.props.cursorShape,
      cursorColor: this.props.cursorColor,
      cursorAccentColor: this.props.cursorAccentColor,
      fontSize: this.props.fontSize,
      fontFamily: this.props.fontFamily,
      uiFontFamily: this.props.uiFontFamily,
      fontSmoothing: this.props.fontSmoothing,
      fontWeight: this.props.fontWeight,
      fontWeightBold: this.props.fontWeightBold,
      lineHeight: this.props.lineHeight,
      letterSpacing: this.props.letterSpacing,
      modifierKeys: this.props.modifierKeys,
      padding: this.props.padding,
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
      onContextMenu: this.bind(this.props.onContextMenu, null, uid),
      borderColor: this.props.borderColor,
      selectionColor: this.props.selectionColor,
      quickEdit: this.props.quickEdit,
      uid
    });

    // This will create a new ref_ function for every render,
    // which is inefficient. Should maybe do something similar
    // to this.bind.
    return <Term ref_={this.onTermRef} key={uid} {...props} />;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.termGroup.sizes != nextProps.termGroup.sizes || nextProps.sizeChanged) {
      this.term && this.term.fitResize();
      // Indicate to children that their size has changed even if their ratio hasn't
      this.sizeChanged = true;
    } else {
      this.sizeChanged = false;
    }
  }

  render() {
    const {childGroups, termGroup} = this.props;
    if (termGroup.sessionUid) {
      return this.renderTerm(termGroup.sessionUid);
    }

    const groups = childGroups.map(child => {
      const props = getTermGroupProps(
        child.uid,
        this.props.parentProps,
        Object.assign({}, this.props, {
          termGroup: child,
          sizeChanged: this.sizeChanged
        })
      );

      return <DecoratedTermGroup key={child.uid} {...props} />;
    });

    return this.renderSplit(groups);
  }
}

const TermGroup = connect(
  (state, ownProps) => ({
    childGroups: ownProps.termGroup.children.map(uid => state.termGroups.termGroups[uid])
  }),
  (dispatch, ownProps) => ({
    onTermGroupResize(splitSizes) {
      dispatch(resizeTermGroup(ownProps.termGroup.uid, splitSizes));
    }
  })
)(TermGroup_);

const DecoratedTermGroup = decorate(TermGroup, 'TermGroup');

export default TermGroup;
