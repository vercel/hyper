/* eslint-disable quote-props */
import React from 'react';
import _ from 'lodash';

export default class SplitPane extends React.PureComponent {
  constructor(props) {
    super(props);
    this.handleDragStart = this.handleDragStart.bind(this);
    this.handleAutoResize = this.handleAutoResize.bind(this);
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

  setupPanes(ev) {
    this.panes = Array.from(ev.target.parentNode.childNodes);
    this.paneIndex = this.panes.indexOf(ev.target);
    this.paneIndex -= Math.ceil(this.paneIndex / 2);
  }

  handleAutoResize(ev) {
    ev.preventDefault();

    this.setupPanes(ev);

    const sizes_ = this.getSizes();
    sizes_[this.paneIndex] = 0;
    sizes_[this.paneIndex + 1] = 0;

    const availableWidth = 1 - _.sum(sizes_);
    sizes_[this.paneIndex] = availableWidth / 2;
    sizes_[this.paneIndex + 1] = availableWidth / 2;

    this.props.onResize(sizes_);
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
    this.panesSize = ev.target.parentNode.getBoundingClientRect()[this.d1];
    this.setupPanes(ev);
  }

  getSizes() {
    const {sizes} = this.props;
    let sizes_;

    if (sizes) {
      sizes_ = [].concat(sizes);
    } else {
      const total = this.props.children.length;
      const count = new Array(total).fill(1 / total);

      sizes_ = count;
    }
    return sizes_;
  }

  onDrag(ev) {
    const sizes_ = this.getSizes();

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

  render() {
    const children = this.props.children;
    const {direction, borderColor} = this.props;
    const sizeProperty = direction === 'horizontal' ? 'height' : 'width';
    let {sizes} = this.props;
    if (!sizes) {
      // workaround for the fact that if we don't specify
      // sizes, sometimes flex fails to calculate the
      // right height for the horizontal panes
      sizes = new Array(children.length).fill(1 / children.length);
    }
    return (
      <div className={`splitpane_panes splitpane_panes_${direction}`}>
        {React.Children.map(children, (child, i) => {
          const style = {
            // flexBasis doesn't work for the first horizontal pane, height need to be specified
            [sizeProperty]: sizes[i] * 100 + '%',
            flexBasis: sizes[i] * 100 + '%',
            flexGrow: 0
          };
          return [
            <div key="pane" className="splitpane_pane" style={style}>
              {child}
            </div>,
            i < children.length - 1 ? (
              <div
                key="divider"
                onMouseDown={this.handleDragStart}
                onDoubleClick={this.handleAutoResize}
                style={{backgroundColor: borderColor}}
                className={`splitpane_divider splitpane_divider_${direction}`}
              />
            ) : null
          ];
        })}
        <div style={{display: this.state.dragging ? 'block' : 'none'}} className="splitpane_shim" />

        <style jsx>{`
          .splitpane_panes {
            display: flex;
            flex: 1;
            outline: none;
            position: relative;
            width: 100%;
            height: 100%;
          }

          .splitpane_panes_vertical {
            flex-direction: row;
          }

          .splitpane_panes_horizontal {
            flex-direction: column;
          }

          .splitpane_pane {
            flex: 1;
            outline: none;
            position: relative;
          }

          .splitpane_divider {
            box-sizing: border-box;
            z-index: 1;
            background-clip: padding-box;
            flex-shrink: 0;
          }

          .splitpane_divider_vertical {
            border-left: 5px solid rgba(255, 255, 255, 0);
            border-right: 5px solid rgba(255, 255, 255, 0);
            width: 11px;
            margin: 0 -5px;
            cursor: col-resize;
          }

          .splitpane_divider_horizontal {
            height: 11px;
            margin: -5px 0;
            border-top: 5px solid rgba(255, 255, 255, 0);
            border-bottom: 5px solid rgba(255, 255, 255, 0);
            cursor: row-resize;
            width: 100%;
          }

          /*
            this shim is used to make sure mousemove events
            trigger in all the draggable area of the screen
            this is not the case due to hterm's <iframe>
          */
          .splitpane_shim {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: transparent;
          }
        `}</style>
      </div>
    );
  }

  componentWillUnmount() {
    // ensure drag end
    if (this.dragging) {
      this.onDragEnd();
    }
  }
}
