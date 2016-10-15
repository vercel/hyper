/* eslint-disable quote-props */
import React from 'react';
import Component from '../component';

export default class SplitPane extends Component {

  constructor(props) {
    super(props);
    this.handleDragStart = this.handleDragStart.bind(this);
    this.onDrag = this.onDrag.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.state = {dragging: false};
  }

  componentDidUpdate(prevProps) {
    if (this.state.dragging && prevProps.sizes !== this.props.sizes) {
      // recompute positions for ongoing dragging
      this.dragPanePosition = this.dragTarget.getBoundingClientRect()[this.d2];
    }
  }

  handleDragStart(ev) {
    ev.preventDefault();
    this.setState({dragging: true});
    window.addEventListener('mousemove', this.onDrag);
    window.addEventListener('mouseup', this.onDragEnd);

    // dimensions to consider
    if (this.props.direction === 'horizontal') {
      this.d1 = 'height';
      this.d2 = 'top';
      this.d3 = 'clientY';
    } else {
      this.d1 = 'width';
      this.d2 = 'left';
      this.d3 = 'clientX';
    }

    this.dragTarget = ev.target;
    this.dragPanePosition = this.dragTarget.getBoundingClientRect()[this.d2];
    this.panes = Array.from(ev.target.parentNode.childNodes);
    this.panesSize = ev.target.parentNode.getBoundingClientRect()[this.d1];
    this.paneIndex = this.panes.indexOf(ev.target);
    this.paneIndex -= Math.ceil(this.paneIndex / 2);
  }

  onDrag(ev) {
    let {sizes} = this.props;
    let sizes_;
    if (sizes) {
      sizes_ = [].concat(sizes);
    } else {
      const total = this.props.children.length;
      sizes = sizes_ = new Array(total).fill(1 / total);
    }
    const i = this.paneIndex;
    const pos = ev[this.d3];
    const d = Math.abs(this.dragPanePosition - pos) / this.panesSize;
    if (pos > this.dragPanePosition) {
      sizes_[i] += d;
      sizes_[i + 1] -= d;
    } else {
      sizes_[i] -= d;
      sizes_[i + 1] += d;
    }
    this.props.onResize(sizes_);
  }

  onDragEnd() {
    if (this.state.dragging) {
      window.removeEventListener('mousemove', this.onDrag);
      window.removeEventListener('mouseup', this.onDragEnd);
      this.setState({dragging: false});
    }
  }

  template(css) {
    const children = this.props.children;
    const {direction, borderColor} = this.props;
    let {sizes} = this.props;
    if (!sizes) {
      // workaround for the fact that if we don't specify
      // sizes, sometimes flex fails to calculate the
      // right height for the horizontal panes
      sizes = new Array(children.length).fill(1 / children.length);
    }
    return (<div className={css('panes', `panes_${direction}`)}>
      {
        React.Children.map(children, (child, i) => {
          const style = {
            flexBasis: (sizes[i] * 100) + '%',
            flexGrow: 0
          };
          return [
            <div
              key="pane"
              className={css('pane')}
              style={style}
              >
              { child }
            </div>,
            i < children.length - 1 ?
              <div
                key="divider"
                onMouseDown={this.handleDragStart}
                style={{backgroundColor: borderColor}}
                className={css('divider', `divider_${direction}`)}
                /> :
              null
          ];
        })
      }
      <div
        style={{display: this.state.dragging ? 'block' : 'none'}}
        className={css('shim')}
        />
    </div>);
  }

  styles() {
    return {
      panes: {
        display: 'flex',
        flex: 1,
        outline: 'none',
        position: 'relative',
        width: '100%',
        height: '100%'
      },

      'panes_vertical': {
        flexDirection: 'row'
      },

      'panes_horizontal': {
        flexDirection: 'column'
      },

      pane: {
        flex: 1,
        outline: 'none',
        position: 'relative'
      },

      divider: {
        boxSizing: 'border-box',
        zIndex: '1',
        backgroundClip: 'padding-box',
        flexShrink: 0
      },

      'divider_vertical': {
        borderLeft: '5px solid rgba(255, 255, 255, 0)',
        borderRight: '5px solid rgba(255, 255, 255, 0)',
        width: '11px',
        margin: '0 -5px',
        cursor: 'col-resize'
      },

      'divider_horizontal': {
        height: '11px',
        margin: '-5px 0',
        borderTop: '5px solid rgba(255, 255, 255, 0)',
        borderBottom: '5px solid rgba(255, 255, 255, 0)',
        cursor: 'row-resize',
        width: '100%'
      },

      // this shim is used to make sure mousemove events
      // trigger in all the draggable area of the screen
      //
      // this is not the case due to hterm's <iframe>
      shim: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'transparent'
      }
    };
  }

  componentWillUnmount() {
    // ensure drag end
    if (this.dragging) {
      this.onDragEnd();
    }
  }

}
