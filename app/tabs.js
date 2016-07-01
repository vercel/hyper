import React from 'react';
import classes from 'classnames';

export default function ({ data = [], active, activeMarkers = {}, onChange }) {
  return <nav style={{ WebkitAppRegion: 'drag' }}>{
    data.length
      ? 1 === data.length
        ? <div className='single'>{ data[0] }</div>
        : <ul className='tabs'>
            {
              data.map((tab, i) => {
                const isActive = i === active;
                const hasActivity = ~activeMarkers.indexOf(i);
                return <li
                  key={`tab-${i}`}
                  className={classes({ is_active: isActive, has_activity: hasActivity })}
                  onClick={ onChange ? onClick.bind(null, i, onChange, active) : null }>
                    <span>{ tab }</span>
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
