import React from 'react';

import {PureComponent} from '../base-components';
import {decorate, getTabProps} from '../utils/plugins';

import Tab_ from './tab';

const Tab = decorate(Tab_, 'Tab');
const isMac = /Mac/.test(navigator.userAgent);

export default class Tabs extends PureComponent {
  template(css) {
    const {tabs = [], borderColor, onChange, onClose} = this.props;

    const hide = !isMac && tabs.length === 1;

    return (
      <nav className={css('nav', hide && 'hiddenNav')}>
        {this.props.customChildrenBefore}
        {tabs.length === 1 && isMac ? <div className={css('title')}>{tabs[0].title}</div> : null}
        {tabs.length > 1
          ? [
              <ul key="list" className={css('list')}>
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
              isMac && <div key="shim" style={{borderColor}} className={css('borderShim')} />
            ]
          : null}
        {this.props.customChildren}
      </nav>
    );
  }

  styles() {
    return {
      nav: {
        fontSize: '12px',
        height: '34px',
        lineHeight: '34px',
        verticalAlign: 'middle',
        color: '#9B9B9B',
        cursor: 'default',
        position: 'relative',
        WebkitUserSelect: 'none',
        WebkitAppRegion: isMac ? 'drag' : '',
        top: isMac ? '0px' : '34px'
      },

      hiddenNav: {
        display: 'none'
      },

      title: {
        textAlign: 'center',
        color: '#fff',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        paddingLeft: 76,
        paddingRight: 76
      },

      list: {
        maxHeight: '34px',
        display: 'flex',
        flexFlow: 'row',
        marginLeft: isMac ? 76 : 0
      },

      borderShim: {
        position: 'absolute',
        width: '76px',
        bottom: 0,
        borderColor: '#ccc',
        borderBottomStyle: 'solid',
        borderBottomWidth: '1px'
      }
    };
  }
}
