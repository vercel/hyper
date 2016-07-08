import React from 'react';
import classes from 'classnames';

export default function ({ data = [], borderColor, active, activeMarkers = [], onChange, onClose }) {
  return <nav style={{ WebkitAppRegion: 'drag' }}>{
    data.length
      ? 1 === data.length
        ? <div className='single'>{ data[0] }</div>
        : <ul style={{ borderColor }} className='tabs'>
            {
              data.map((tab, i) => {
                const isActive = i === active;
                const hasActivity = ~activeMarkers.indexOf(i);
                return <li
                  key={`tab-${i}`}
                  className={classes({ is_active: isActive, has_activity: hasActivity })}>
                    <span
                      style={{ borderColor: isActive ? borderColor : null }}
                      onClick={ onChange ? onClick.bind(null, i, onChange, active) : null }>
                      { tab }
                    </span>
                    <i onClick={ onClose ? onClose.bind(null, i) : null }>
                      <svg className='icon'>
                        <use xlinkHref='assets/icons.svg#close'></use>
                      </svg>
                    </i>
                </li>;
              })
            }
          </ul>
      : null
  }</nav>;
}

function onClick (i, onChange, active) {
  if (i !== active) {
    onChange(i);
  }
}
