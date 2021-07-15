import React from 'react';

import {decorate, getTabProps} from '../utils/plugins';

import Tab_ from './tab';
import {TabsProps} from '../hyper';

const Tab = decorate(Tab_, 'Tab');
const isMac = /Mac/.test(navigator.userAgent);

export default class Tabs extends React.PureComponent<TabsProps> {
  render() {
    const {tabs = [], borderColor, onChange, onClose, fullScreen} = this.props;

    const hide = !isMac && tabs.length === 1;

    return (
      <nav className={`tabs_nav ${hide ? 'tabs_hiddenNav' : ''}`}>
        {this.props.customChildrenBefore}
        {tabs.length === 1 && isMac ? <div className="tabs_title">{tabs[0].title}</div> : null}
        {tabs.length > 1
          ? [
              <ul key="list" className={`tabs_list ${fullScreen && isMac ? 'tabs_fullScreen' : ''}`}>
                {tabs.map((tab, i) => {
                  const {uid, title, isActive, hasActivity} = tab;
                  const props = getTabProps(tab, this.props, {
                    text: title === '' ? 'Shell' : title,
                    isFirst: i === 0,
                    isLast: tabs.length - 1 === i,
                    borderColor,
                    isActive,
                    hasActivity,
                    onSelect: onChange.bind(null, uid),
                    onClose: onClose.bind(null, uid)
                  });
                  return <Tab key={`tab-${uid}`} {...props} />;
                })}
              </ul>,
              isMac && (
                <div
                  key="shim"
                  style={{borderColor}}
                  className={`tabs_borderShim ${fullScreen ? 'tabs_borderShimUndo' : ''}`}
                />
              )
            ]
          : null}
        {this.props.customChildren}

        <style jsx>{`
          .tabs_nav {
            font-size: 12px;
            height: 34px;
            line-height: 34px;
            vertical-align: middle;
            color: #9b9b9b;
            cursor: default;
            position: relative;
            -webkit-user-select: none;
            -webkit-app-region: ${isMac ? 'drag' : ''};
            top: ${isMac ? '0px' : '34px'};
          }

          .tabs_hiddenNav {
            display: none;
          }

          .tabs_title {
            text-align: center;
            color: #fff;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            padding-left: 76px;
            padding-right: 76px;
          }

          .tabs_list {
            max-height: 34px;
            display: flex;
            flex-flow: row;
            margin-left: ${isMac ? '76px' : '0'};
          }

          .tabs_fullScreen {
            margin-left: -1px;
          }

          .tabs_borderShim {
            position: absolute;
            width: 76px;
            bottom: 0;
            border-color: #ccc;
            border-bottom-style: solid;
            border-bottom-width: 1px;
          }

          .tabs_borderShimUndo {
            border-bottom-width: 0px;
          }
        `}</style>
      </nav>
    );
  }
}
