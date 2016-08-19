import Tab_ from './tab';
import React from 'react';
import Component from '../component';
import { decorate, getTabProps } from '../utils/plugins';

const Tab = decorate(Tab_, 'Tab');

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
            : <ul
                style={{ borderColor }}
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
              </ul>
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
        WebkitUserSelect: 'none',
        WebkitAppRegion: 'drag'
      },

      title: {
        textAlign: 'center',
        color: '#fff'
      },

      list: {
        borderBottom: '1px solid #333',
        maxHeight: '34px',
        display: 'flex',
        flexFlow: 'row'
      }
    };
  }

}
