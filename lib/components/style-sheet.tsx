import React, {forwardRef} from 'react';

import type {StyleSheetProps} from '../../typings/hyper';

const StyleSheet = forwardRef<HTMLStyleElement, StyleSheetProps>((props, ref) => {
  const {borderColor} = props;

  return (
    <style jsx global ref={ref}>{`
      ::-webkit-scrollbar {
        width: 5px;
      }
      ::-webkit-scrollbar-thumb {
        -webkit-border-radius: 10px;
        border-radius: 10px;
        background: ${borderColor};
      }
      ::-webkit-scrollbar-thumb:window-inactive {
        background: ${borderColor};
      }
    `}</style>
  );
});

StyleSheet.displayName = 'StyleSheet';

export default StyleSheet;
