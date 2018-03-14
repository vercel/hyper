import React from 'react';

const decorateBaseComponent = Component => {
  return class BaseComponent extends Component {
    render() {
      // convert static objects from `babel-plugin-transform-jsx`
      // to `React.Element`.
      if (!this.template) {
        throw new TypeError("Component doesn't define `template`");
      }

      // invoke the template creator passing our css helper
      return this.template(this.cssHelper);
    }
  };
};

export const PureComponent = decorateBaseComponent(React.PureComponent);
export const Component = decorateBaseComponent(React.Component);
