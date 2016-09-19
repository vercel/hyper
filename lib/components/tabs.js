import Tab_ from './tab';
import React from 'react';
import Component from '../component';
import { decorate, getTabProps } from '../utils/plugins';

const Tab = decorate(Tab_, 'Tab');
const isMac = /Mac/.test(navigator.userAgent);

export default class Tabs extends Component {

  template (css) {
    const {
      tabs = [],
      borderColor,
      onChange,
      onClose
    } = this.props;

    return <nav className={ css('nav') }>
      { this.props.customChildrenBefore }
      {
        tabs.length
          ? 1 === tabs.length
            ? <div className={ css('title') }>{ tabs[0].title }</div>
            : [
              <ul
                className={ css('list') }>
                {
                  tabs.map((tab, i) => {
                    const { uid, title, isActive, hasActivity } = tab;
                    const props = getTabProps(tab, this.props, {
                      text: '' === title ? 'Shell' : title,
                      isFirst: 0 === i,
                      isLast: tabs.length - 1 === i,
                      borderColor: borderColor,
                      isActive,
                      hasActivity,
                      onSelect: onChange.bind(null, uid),
                      onClose: onClose.bind(null, uid)
                    });
                    return <Tab key={`tab-${uid}`} {...props} />;
                  })
                }
              </ul>,
              isMac && <div
                style={{ borderColor }}
                className={ css('borderShim') }></div>
            ]
          : null
      }
      { this.props.customChildren }
    </nav>;
  }

  styles () {
    return {
      nav: {
        fontSize: '12px',
        fontFamily: `-apple-system, BlinkMacSystemFont,
        "Segoe UI", "Roboto", "Oxygen",
        "Ubuntu", "Cantarell", "Fira Sans",
        "Droid Sans", "Helvetica Neue", sans-serif`,
        height: '34px',
        lineHeight: '34px',
        verticalAlign: 'middle',
        color: '#9B9B9B',
        cursor: 'default',
        position: 'relative',
        WebkitUserSelect: 'none',
        WebkitAppRegion: 'drag'
      },

      title: {
        textAlign: 'center',
        color: '#fff'
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
