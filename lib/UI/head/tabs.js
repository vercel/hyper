import React from 'react';
import Component from '../component';
import {getTabProps} from '../../utils/plugins';
import Tab from './tab';

const isMac = /Mac/.test(navigator.userAgent);

class Tabs extends Component {
  template(css) {
    const {tabs, active} = this.props;
    const setLeft = (window.innerHeight !== screen.height) && isMac;
    return (
      <nav
        className={css('nav')}
        >
        <ul
          key="list"
          className={css('list', setLeft && 'setLeft')}
          >
          {
            tabs.map((tab, i) => {
              const {uid, title} = tab;
              const props = getTabProps(tab, this.props, {
                isFirst: i === 0,
                isLast: tabs.length - 1 === i,
                title,
                isActive: active === uid,
                onSelect: this.props.onSelect.bind(null, uid)
              });
              return <Tab key={`tab-${uid}`} {...props}/>;
            })
          }
        </ul>
      </nav>
    );
  }

  styles() {
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
        WebkitAppRegion: 'drag',
        width: '100%'
      },

      list: {
        maxHeight: '34px',
        display: 'flex',
        flexFlow: 'row',
        marginLeft: 0
      },

      setLeft: {
        marginLeft: 76
      },

      title: {
        textAlign: 'center',
        color: '#fff'
      }
    };
  }

}

export default Tabs;
