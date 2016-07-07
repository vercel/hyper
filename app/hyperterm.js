import Tabs from './tabs';
import Term from './term';
import RPC from './rpc';
import Mousetrap from 'mousetrap';
import classes from 'classnames';
import shallowCompare from 'react-addons-shallow-compare';
import React, { Component } from 'react';

export default class HyperTerm extends Component {
  constructor () {
    super();
    this.state = {
      cols: null,
      rows: null,
      hpadding: 10,
      vpadding: 5,
      sessions: [],
      titles: {},
      urls: {},
      active: null,
      activeMarkers: [],
      mac: /Mac/.test(navigator.userAgent),
      resizeIndicatorShowing: false,
      fontSizeIndicatorShowing: false,
      dismissedUpdate: false,
      updateVersion: null,
      fontSize: 12
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
    this.quitAndInstall = this.quitAndInstall.bind(this);
    this.focusActive = this.focusActive.bind(this);
    this.closeBrowser = this.closeBrowser.bind(this);
    this.onHeaderMouseDown = this.onHeaderMouseDown.bind(this);
    this.closeTab = this.closeTab.bind(this);

    this.moveLeft = this.moveLeft.bind(this);
    this.moveRight = this.moveRight.bind(this);
    this.resetFontSize = this.resetFontSize.bind(this);
    this.increaseFontSize = this.increaseFontSize.bind(this);
    this.decreaseFontSize = this.decreaseFontSize.bind(this);

    this.dismissUpdate = this.dismissUpdate.bind(this);
    this.onUpdateAvailable = this.onUpdateAvailable.bind(this)
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
            onClose={this.closeTab}
          />
        </header>

        <div
          className='terms'
          style={{ padding: `${this.state.vpadding}px ${this.state.hpadding}px` }}
          ref='termWrapper'>{
            this.state.sessions.map((uid, i) => {
              const active = i === this.state.active;
              return <div key={`d${uid}`} className={classes('term', { active })} style={{ width: '100%', height: '100%' }} ref='term'>
                <Term
                  key={uid}
                  ref={`term-${uid}`}
                  cols={this.state.cols}
                  rows={this.state.rows}
                  fontSize={this.state.fontSize}
                  url={this.state.urls[uid]}
                  onResize={this.onResize}
                  onTitle={this.setTitle.bind(this, uid)}
                  onData={this.write.bind(this, uid)}
                  onURL={this.onURL.bind(this, uid)}
                  onURLAbort={this.closeBrowser}
                  />
              </div>;
            })
        }</div>
      </div>
      <div className={classes('resize-indicator', { showing: this.state.resizeIndicatorShowing })}>
        {this.state.fontSizeIndicatorShowing && <div>{ this.state.fontSize }px</div>}
        <div>{ this.state.cols }x{ this.state.rows }</div>
      </div>
      <div className={classes('update-indicator', { showing: null !== this.state.updateVersion && !this.state.dismissedUpdate })}>
        Version <b>{ this.state.updateVersion }</b> ready.
        {this.state.updateNote ? ` ${this.state.updateNote}. ` : ' '}
        <a href='' onClick={this.quitAndInstall}>Restart</a>
        to apply <span className='close' onClick={this.dismissUpdate}>[x]</span>
      </div>
    </div>;
  }

  dismissUpdate () {
    this.setState({ dismissedUpdate: true });
  }

  quitAndInstall (ev) {
    ev.preventDefault();
    this.rpc.emit('quit-and-install');
  }

  closeUpdateIndicator () {
    // @TODO
  }

  openExternal (ev) {
    ev.preventDefault();
    this.rpc.emit('open external', { url: ev.target.href });
  }

  requestTab () {
    // we send the hterm default size
    this.rpc.emit('new', { cols: this.state.cols, rows: this.state.rows });
  }

  closeActiveTab () {
    this.closeTab(this.state.active);
  }

  closeTab (id) {
    if (this.state.sessions.length) {
      const uid = this.state.sessions[id];
      this.rpc.emit('exit', { uid });
      this.onSessionExit({ uid });
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
      // make sure that the blurred uid has not been
      // optimistically removed
      if (curUid && ~nextState.sessions.indexOf(curUid)) {
        this.rpc.emit('blur', { uid: curUid });
      }
      const nextUid = nextState.sessions[nextState.active];
      this.rpc.emit('focus', { uid: nextUid });
      this.shouldInitKeys = true;
    } else {
      this.shouldInitKeys = false;
    }

    return shallowCompare(this, nextProps, nextState);
  }

  componentDidMount () {
    this.rpc = new RPC();

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

    this.rpc.on('clear', this.clearCurrentTerm.bind(this));
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
    this.rpc.on('close tab', this.closeActiveTab.bind(this));
    this.rpc.on('title', this.onRemoteTitle.bind(this));

    this.rpc.on('move left', this.moveLeft);
    this.rpc.on('move right', this.moveRight);
    this.rpc.on('increase font size', this.increaseFontSize);
    this.rpc.on('decrease font size', this.decreaseFontSize);
    this.rpc.on('reset font size', this.resetFontSize);

    this.rpc.on('update available', this.onUpdateAvailable);
  }

  clearCurrentTerm () {
    const uid = this.state.sessions[this.state.active];
    const term = this.refs[`term-${uid}`];
    term.clear();
  }

  onUpdateAvailable ({ releaseName, releaseNotes = '' }) {
    this.setState({
      updateVersion: releaseName,
      updateNote: releaseNotes.split(/\n/)[0].trim()
    });
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
    } else if (this.state.sessions.length > 1) {
      // go to the end
      this.setActive(this.state.sessions.length - 1);
    }
  }

  moveRight () {
    const next = this.state.active + 1;
    if (this.state.sessions[next]) {
      this.setActive(next);
    } else if (this.state.sessions.length > 1) {
      // go to the beginning
      this.setActive(0);
    }
  }

  changeFontSize (value, { relative = false } = {}) {
    this.setState({
      fontSize: relative ? this.state.fontSize + value : value,
      fontSizeIndicatorShowing: true
    });

    clearTimeout(this.fontSizeIndicatorTimeout);
    this.fontSizeIndicatorTimeout = setTimeout(() => {
      this.setState({ fontSizeIndicatorShowing: false });
    }, 1500);
  }

  resetFontSize () {
    this.changeFontSize(12);
  }

  increaseFontSize () {
    this.changeFontSize(1, { relative: true });
  }

  decreaseFontSize () {
    this.changeFontSize(-1, { relative: true });
  }

  onSessionExit ({ uid }) {
    if (!~this.state.sessions.indexOf(uid)) {
      console.log('ignore exit of', uid);
      return;
    }

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
    if (this.shouldInitKeys) {
      if (this.keys) {
        this.keys.reset();
      }

      const uid = this.state.sessions[this.state.active];
      const term = this.refs[`term-${uid}`];
      const keys = new Mousetrap(term.getTermDocument());
      keys.bind('command+1', this.moveTo.bind(this, 0));
      keys.bind('command+2', this.moveTo.bind(this, 1));
      keys.bind('command+3', this.moveTo.bind(this, 2));
      keys.bind('command+4', this.moveTo.bind(this, 3));
      keys.bind('command+5', this.moveTo.bind(this, 4));
      keys.bind('command+6', this.moveTo.bind(this, 5));
      keys.bind('command+7', this.moveTo.bind(this, 6));
      keys.bind('command+8', this.moveTo.bind(this, 7));
      keys.bind('command+9', this.moveTo.bind(this, 8));
      keys.bind('command+shift+left', this.moveLeft);
      keys.bind('command+shift+right', this.moveRight);
      keys.bind('command+shift+[', this.moveLeft);
      keys.bind('command+shift+]', this.moveRight);
      keys.bind('command+alt+left', this.moveLeft);
      keys.bind('command+alt+right', this.moveRight);

      this.keys = keys;
    }

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

  onResize (dim) {
    if (dim.rows !== this.state.rows || dim.cols !== this.state.cols) {
      this.ignoreActivity = Date.now();
      this.rpc.emit('resize', dim);
      const state = Object.assign({}, dim,
        // if it's the first time we hear about the resize we
        // don't show the indicator
        null === this.state.rows ? {} : { resizeIndicatorShowing: true }
      );
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

    this.clicks = this.clicks || 1;

    if (this.clicks++ >= 2) {
      if (this.maximized) {
        this.rpc.emit('unmaximize');
      } else {
        this.rpc.emit('maximize');
      }
      this.clicks = 0;
      this.maximized = !this.maximized;
    } else {
      // http://www.quirksmode.org/dom/events/click.html
      // https://en.wikipedia.org/wiki/Double-click
      this.clickTimer = setTimeout(() => {
        this.clicks = 0;
      }, 500);
    }
  }

  componentWillUnmount () {
    this.rpc.destroy();
    clearTimeout(this.resizeIndicatorTimeout);
    clearTimeout(this.fontSizeIndicatorTimeout);
    if (this.keys) this.keys.reset();
    delete this.clicks;
    clearTimeout(this.clickTimer);
    this.updateChecker.destroy();
  }
}
