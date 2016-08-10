import React from 'react';
import Term_ from './term';
import Component from '../component';
import { decorate, getTermProps } from '../utils/plugins';
import { connect } from 'react-redux';
import SplitPane from 'react-split-pane';

const Term = decorate(Term_, 'Term');

class TermGroup_ extends Component {

  constructor (props, context) {
    super(props, context);
    this.bound = new WeakMap();
  }

  bind (fn, thisObj, uid) {
    if (!this.bound.has(fn)) {
      this.bound.set(fn, {});
    }
    const map = this.bound.get(fn);
    if (!map[uid]) {
      map[uid] = fn.bind(thisObj, uid);
    }
    return map[uid];
  }

  /**
   * Since react-split-pane doesn't support more than
   * two child panes, we generate a tree of SplitPanes
   * that each have two children.
   *
   * TODO: Should probably change to something else
   * than react-split-pane or roll our own.
   */
  renderSplit (groups) {
    const [first, ...rest] = groups;
    if (!rest.length) return first;
    const percentage = Math.round(100 / groups.length);
    const direction = this.props.termGroup.direction.toLowerCase();
    return <SplitPane
      split={direction}
      defaultSize={`${percentage}%`}>
      {first}
      {this.renderSplit(rest)}
    </SplitPane>;
  }

  renderTerm (uid) {
    const session = this.props.sessions[uid];
    const props = getTermProps(uid, this.props, {
      customCSS: this.props.customCSS,
      fontSize: this.props.fontSize,
      cursorColor: this.props.cursorColor,
      cursorShape: this.props.cursorShape,
      fontFamily: this.props.fontFamily,
      fontSmoothing: this.props.fontSmoothing,
      foregroundColor: this.props.foregroundColor,
      backgroundColor: this.props.backgroundColor,
      padding: this.props.padding,
      colors: this.props.colors,
      url: session.url,
      cleared: session.cleared,
      cols: session.cols,
      rows: session.rows,
      onActive: this.bind(this.props.onActive, null, uid),
      onResize: this.bind(this.props.onResize, null, uid),
      onTitle: this.bind(this.props.onTitle, null, uid),
      onData: this.bind(this.props.onData, null, uid),
      onURLAbort: this.bind(this.props.onURLAbort, null, uid)
    });

    // TODO: This will create a new ref_ function for every render,
    // which is inefficient. Should maybe do something similar
    // to this.bind.
    return <Term
      ref_={ term => this.props.ref_(uid, term) }
      key={ uid }
      {...props} />;
  }

  template () {
    const { childGroups, termGroup } = this.props;
    if (termGroup.sessionUid) {
      return this.renderTerm(termGroup.sessionUid);
    }

    const groups = childGroups.map(child => {
      const props = Object.assign({}, this.props, {
        termGroup: child
      });

      return <TermGroup
        key={ child.uid }
        { ...props }
      />;
    });

    return this.renderSplit(groups);
  }
}

const mapStateToProps = (state, ownProps) => ({
  childGroups: ownProps.termGroup.children.map(uid =>
    state.termGroups.termGroups[uid]
  )
});

const TermGroup = connect(mapStateToProps)(TermGroup_);

export default TermGroup;
