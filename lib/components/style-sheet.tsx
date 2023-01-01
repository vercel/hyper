import React from 'react';
import {StyleSheetProps} from '../hyper';

export default class StyleSheet extends React.PureComponent<StyleSheetProps> {
  render() {
    const {borderColor} = this.props;

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
  }
}
