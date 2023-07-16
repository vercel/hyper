import React from 'react';
import type {StyleSheetProps} from '../hyper';

const StyleSheet: React.FC<StyleSheetProps> = (props) => {
  const {borderColor} = props;

  return (
    <style jsx global>{`
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
};

export default StyleSheet;
