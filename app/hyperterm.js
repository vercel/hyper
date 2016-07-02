import Tabs from './tabs';
import Term from './term';
import RPC from './rpc';
import Mousetrap from 'mousetrap';
import classes from 'classnames';
import getTextMetrics from './text-metrics';
import shallowCompare from 'react-addons-shallow-compare';
import React, { Component } from 'react';
import UpdateChecker from './update-checker';

export default class HyperTerm extends Component {
  constructor () {
    super();
    this.state = {
      hpadding: 10,
      vpadding: 5,
      sessions: [],
      titles: {},
      urls: {},
      active: null,
      activeMarkers: [],
      mac: /Mac/.test(navigator.userAgent),
      resizeIndicatorShowing: false,
      updateVersion: null
    };

    // we set this to true when the first tab
    // has been initialized and ack'd by the
    // node server for the *first time*
    this.init = false;

    // we keep track of activity in tabs to avoid
    // placing an activity marker right after
    // opening
    this.tabWasActive = {};

    this.onResize = this.onResize.bind(this);
    this.onChange = this.onChange.bind(this);
    this.openExternal = this.openExternal.bind(this);
    this.focusActive = this.focusActive.bind(this);
    this.onHeaderMouseDown = this.onHeaderMouseDown.bind(this);

    this.moveLeft = this.moveLeft.bind(this);
    this.moveRight = this.moveRight.bind(this);
    this.fullscreen = this.fullscreen.bind(this);
  }

  render () {
    return <div onClick={ this.focusActive }>
      <div className={ classes('main', { mac: this.state.mac }) }>
        <header onMouseDown={this.onHeaderMouseDown}>
          <Tabs
            active={this.state.active}
            activeMarkers={this.state.activeMarkers}
            data={this.state.sessions.map((uid) => {
              const title = this.state.titles[uid];
              return null != title ? title : 'Shell';
            })}
            onChange={this.onChange}
          />
        </header>

        <div
          className='terms'
          style={{ padding: `${this.state.vpadding}px ${this.state.hpadding}px` }}
          ref='termWrapper'>{
            this.state.sessions.map((uid, i) => {
              const active = i === this.state.active;
              return <div key={`d${uid}`} className={classes('term', { active })} ref='term'>
                <Term
                  key={uid}
                  ref={`term-${uid}`}
                  url={this.state.urls[uid]}
                  cols={this.state.cols}
                  rows={this.state.rows}
                  onTitle={this.setTitle.bind(this, uid)}
                  onData={this.write.bind(this, uid)}
                  onURL={this.onURL.bind(this, uid)}
                  />
              </div>;
            })
        }</div>
      </div>
      <div className={classes('resize-indicator', { showing: this.state.resizeIndicatorShowing })}>
        { this.state.cols }x{ this.state.rows }
      </div>
      <div className={classes('update-indicator', { showing: null !== this.state.updateVersion })}>
        Update available (<b>{ this.state.updateVersion }</b>).
        {' '}
        <a href='https://hyperterm.now.sh' onClick={this.openExternal} target='_blank'>Download</a>
      </div>
    </div>;
  }

  openExternal (ev) {
    ev.preventDefault();
    this.rpc.emit('open external', { url: ev.target.href });
  }

  requestTab () {
    this.rpc.emit('new', this.getDimensions());
  }

  closeTab () {
    if (this.state.sessions.length) {
      const uid = this.state.sessions[this.state.active];
      this.rpc.emit('exit', { uid });
    }
  }

  closeBrowser () {
    const uid = this.state.sessions[this.state.active];
    if (this.state.urls[uid]) {
      const urls = Object.assign({}, this.state.urls);
      delete urls[uid];
      this.setState({ urls });
    }
  }

  write (uid, data) {
    this.rpc.emit('data', { uid, data });
  }

  onURL (uid, url) {
    const urls = Object.assign({}, this.state.urls, { [uid]: url });
    this.setState({ urls });
  }

  onRemoteTitle ({ uid, title }) {
    this.setTitle(uid, title);
  }

  setTitle (uid, title) {
    const { titles: _titles } = this.state;
    const titles = Object.assign({}, _titles, { [uid]: title });
    this.setState({ titles });
  }

  onActive (uid) {
    const i = this.state.sessions.indexOf(uid);

    // we ignore activity markers all the way
    // up to the tab's been active
    const wasActive = this.tabWasActive[uid];
    if (!wasActive) {
      console.log('ignoring active, tab has not been focused', uid);
      this.tabWasActive[uid] = true;
      return;
    }

    if (this.state.active !== i && !~this.state.activeMarkers.indexOf(i)) {
      const activeMarkers = this.state.activeMarkers.slice();
      activeMarkers.push(i);
      this.setState({ activeMarkers });
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (this.state.active !== nextState.active) {
      const curUid = this.state.sessions[this.state.active];
      if (curUid) {
        this.rpc.emit('blur', { uid: curUid });
      }
      const nextUid = nextState.sessions[nextState.active];
      this.rpc.emit('focus', { uid: nextUid });
    }

    return shallowCompare(this, nextProps, nextState);
  }

  componentDidMount () {
    this.rpc = new RPC();
    this.updateChecker = new UpdateChecker(this.onUpdateAvailable.bind(this));
    this.setState(this.getDimensions());

    // open a new tab upon mounting
    this.rpc.once('ready', () => this.requestTab());

    this.rpc.on('new session', ({ uid }) => {
      const { sessions: _sessions } = this.state;
      const sessions = _sessions.concat(uid);
      const state = { sessions };
      state.active = sessions.length - 1;
      this.setState(state, () => {
        if (this.state.sessions.length && !this.init) {
          this.rpc.emit('init');
          this.init = true;
        }
      });
    });

    this.rpc.on('exit', this.onSessionExit.bind(this));

    this.rpc.on('data', ({ uid, data }) => {
      if (this.ignoreActivity) {
        // we ignore activity for up to 300ms after triggering
        // a resize to avoid setting up markers incorrectly
        if (Date.now() - this.ignoreActivity < 300) {
          console.log('ignore activity after resizing');
        } else {
          this.ignoreActivity = null;
          this.onActive(uid);
        }
      } else {
        this.onActive(uid);
      }
      this.refs[`term-${uid}`].write(data);
    });

    this.rpc.on('new tab', this.requestTab.bind(this));
    this.rpc.on('close tab', this.closeTab.bind(this));
    this.rpc.on('title', this.onRemoteTitle.bind(this));

    window.addEventListener('resize', this.onResize);

    this.rpc.on('move left', this.moveLeft);
    this.rpc.on('move right', this.moveRight);
    this.rpc.on('fullscreen', this.fullscreen);

    Mousetrap.bind('command+1', this.moveTo.bind(this, 0));
    Mousetrap.bind('command+2', this.moveTo.bind(this, 1));
    Mousetrap.bind('command+3', this.moveTo.bind(this, 2));
    Mousetrap.bind('command+4', this.moveTo.bind(this, 3));
    Mousetrap.bind('command+5', this.moveTo.bind(this, 4));
    Mousetrap.bind('command+6', this.moveTo.bind(this, 5));
    Mousetrap.bind('command+7', this.moveTo.bind(this, 6));
    Mousetrap.bind('command+8', this.moveTo.bind(this, 7));
    Mousetrap.bind('command+9', this.moveTo.bind(this, 8));

    Mousetrap.bind('ctrl+c', this.closeBrowser.bind(this));

    Mousetrap.bind('command+shift+left', this.moveLeft);
    Mousetrap.bind('command+shift+right', this.moveRight);

    Mousetrap.bind('command+shift+[', this.moveLeft);
    Mousetrap.bind('command+shift+]', this.moveRight);

    Mousetrap.bind('command+alt+left', this.moveLeft);
    Mousetrap.bind('command+alt+right', this.moveRight);

    Mousetrap.bind('command+ctrl+f', this.fullscreen);
  }

  fullscreen() {
    this.rpc.emit('fullscreen');
  }

  onUpdateAvailable (updateVersion) {
    this.setState({ updateVersion });
  }

  moveTo (n) {
    if (this.state.sessions[n]) {
      this.setActive(n);
    }
  }

  moveLeft () {
    const next = this.state.active - 1;
    if (this.state.sessions[next]) {
      this.setActive(next);
    }
  }

  moveRight () {
    const next = this.state.active + 1;
    if (this.state.sessions[next]) {
      this.setActive(next);
    }
  }

  onSessionExit ({ uid }) {
    const {
      sessions: _sessions,
      titles: _titles,
      active: _active,
      activeMarkers
    } = this.state;

    const titles = Object.assign({}, _titles);
    delete titles[uid];

    delete this.tabWasActive[uid];

    const i = _sessions.indexOf(uid);
    const sessions = _sessions.slice();
    sessions.splice(i, 1);

    if (!sessions.length) {
      return window.close();
    }

    const ai = activeMarkers.indexOf(i);
    if (~ai) {
      activeMarkers.splice(ai, 1);
    }

    let active;
    if (i === _active) {
      if (sessions.length) {
        active = sessions[i - 1] ? i - 1 : i;
      } else {
        active = null;
      }
    } else if (i < _active) {
      active = _active - 1;
    }

    if (~activeMarkers.indexOf(active)) {
      activeMarkers.splice(active, 1);
    }

    this.setState({
      sessions,
      titles,
      active,
      activeMarkers
    });
  }

  componentDidUpdate () {
    this.focusActive();
  }

  focusActive () {
    // get active uid and term
    const uid = this.state.sessions[this.state.active];
    const term = this.refs[`term-${uid}`];
    if (term) {
      term.focus();
    }
  }

  onResize () {
    const dim = this.getDimensions();
    if (dim.rows !== this.state.rows || dim.cols !== this.state.cols) {
      this.ignoreActivity = Date.now();

      this.rpc.emit('resize', dim);
      const state = Object.assign({}, dim, { resizeIndicatorShowing: true });
      this.setState(state);
      clearTimeout(this.resizeIndicatorTimeout);
      this.resizeIndicatorTimeout = setTimeout(() => {
        this.setState({ resizeIndicatorShowing: false });
      }, 1500);
    }
  }

  onChange (active) {
    // we ignore clicks if they're a byproduct of a drag
    // motion to move the window
    if (window.screenX !== this.headerMouseDownWindowX ||
        window.screenY !== this.headerMouseDownWindowY) {
      return;
    }

    this.setActive(active);
  }

  setActive (active) {
    if (~this.state.activeMarkers.indexOf(active)) {
      const { activeMarkers } = this.state;
      activeMarkers.splice(activeMarkers.indexOf(active), 1);
      this.setState({ active, activeMarkers });
    } else {
      this.setState({ active });
    }
  }

  onHeaderMouseDown () {
    this.headerMouseDownWindowX = window.screenX;
    this.headerMouseDownWindowY = window.screenY;
  }

  getDimensions () {
    const tm = getTextMetrics('Menlo', '11px', '15px');
    const hp = this.state.hpadding;
    const vp = this.state.vpadding;
    const el = this.refs.termWrapper;
    const { width, height } = el.getBoundingClientRect();
    const dim = {
      cols: Math.floor((width - hp * 2) / tm.width),
      rows: Math.floor((height - vp * 2) / tm.height)
    };
    return dim;
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.onResize);
    this.rpc.destroy();
    clearTimeout(this.resizeIndicatorTimeout);
    Mousetrap.reset();
    this.updateChecker.destroy();
  }
}
