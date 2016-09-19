import React from 'react';
import Term_ from './term';
import Component from '../component';
import { last } from '../utils/array';
import { decorate, getTermProps } from '../utils/plugins';

const Term = decorate(Term_, 'Term');

export default class Terms extends Component {

  constructor (props, context) {
    super(props, context);
    this.terms = {};
    this.bound = new WeakMap();
    this.onRef = this.onRef.bind(this);
    props.ref_(this);
  }

  componentWillReceiveProps (next) {
    const { write } = next;
    if (write && this.props.write !== write) {
      this.getTermByUid(write.uid).write(write.data);
    }

    // if we just rendered, we consider the first tab active
    // why is this decided here? because what session becomes
    // active is a *view* and *layout* concern. for example,
    // if a split is closed (and we had split), the next active
    // session after the close would be the one next to it
    // *in the view*, not necessarily the model datastructure
    if (next.sessions && next.sessions.length) {
      if (!this.props.activeSession && next.sessions.length) {
        this.props.onActive(next.sessions[0].uid);
      } else if (this.props.sessions.length !== next.sessions.length) {
        if (next.sessions.length > this.props.sessions.length) {
          // if we are adding, we focused on the new one
          this.props.onActive(last(next.sessions).uid);
          return;
        }

        const newUids = uids(next.sessions);
        const curActive = this.props.activeSession;

        // if we closed an item that wasn't focused, nothing changes
        if (~newUids.indexOf(curActive)) {
          return;
        }

        const oldIndex = uids(this.props.sessions).indexOf(curActive);
        if (newUids[oldIndex]) {
          this.props.onActive(newUids[oldIndex]);
        } else {
          this.props.onActive(last(next.sessions).uid);
        }
      }
    } else {
      this.props.onActive(null);
    }
  }

  shouldComponentUpdate (nextProps) {
    for (const i in nextProps) {
      if ('write' === i) continue;
      if (this.props[i] !== nextProps[i]) {
        return true;
      }
    }
    for (const i in this.props) {
      if ('write' === i) continue;
      if (this.props[i] !== nextProps[i]) {
        return true;
      }
    }
    return false;
  }

  onRef (uid, term) {
    if (term) {
      this.terms[uid] = term;
    } else {
      delete this.terms[uid];
    }
  }

  getTermByUid (uid) {
    return this.terms[uid];
  }

  getActiveTerm () {
    return this.getTermByUid(this.props.activeSession);
  }

  getLastTermIndex () {
    return this.props.sessions.length - 1;
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

  getTermProps (uid) {
    return getTermProps(uid, this.props);
  }

  onTerminal (uid, term) {
    this.terms[uid] = term;
  }

  componentWillUnmount () {
    this.props.ref_(null);
  }

  template (css) {
    return <div
      style={{ padding: this.props.padding }}
      className={ css('terms') }>
      { this.props.customChildrenBefore }
      {
        this.props.sessions.map((session) => {
          const uid = session.uid;
          const isActive = uid === this.props.activeSession;
          const props = getTermProps(uid, this.props, {
            cols: this.props.cols,
            rows: this.props.rows,
            customCSS: this.props.customCSS,
            fontSize: this.props.fontSize,
            cursorColor: this.props.cursorColor,
            cursorShape: this.props.cursorShape,
            fontFamily: this.props.fontFamily,
            fontSmoothing: this.props.fontSmoothing,
            foregroundColor: this.props.foregroundColor,
            colors: this.props.colors,
            url: session.url,
            cleared: session.cleared,
            onResize: this.bind(this.props.onResize, null, uid),
            onTitle: this.bind(this.props.onTitle, null, uid),
            onData: this.bind(this.props.onData, null, uid),
            onURLAbort: this.bind(this.props.onURLAbort, null, uid),
            bell: this.props.bell,
            bellSoundURL: this.props.bellSoundURL,
            copyOnSelect: this.props.copyOnSelect
          });
          return <div
            key={`d${uid}`}
            className={css('term', isActive && 'termActive')}>
              <Term
                key={uid}
                ref_={this.bind(this.onRef, this, uid)}
                {...props} />
            </div>;
        })
      }
      { this.props.customChildren }
    </div>;
  }

  styles () {
    return {
      terms: {
        position: 'absolute',
        marginTop: '34px',
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
        color: '#fff'
      },

      term: {
        display: 'none',
        width: '100%',
        height: '100%'
      },

      termActive: {
        display: 'block'
      }
    };
  }

}

// little memoized helper to compute a map of uids
function uids (sessions) {
  if (!sessions._uids) {
    sessions._uids = sessions.map((s) => s.uid);
  }
  return sessions._uids;
}
