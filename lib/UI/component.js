import React from 'react';
import {StyleSheet, css} from 'aphrodite-simple';
import {shouldComponentUpdate} from 'react-addons-pure-render-mixin';

export default class Component extends React.Component {

  constructor() {
    super();
    this.styles_ = this.createStyleSheet();
    this.cssHelper = this.cssHelper.bind(this);
    if (!this.shouldComponentUpdate) {
      this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
    }
  }

  createStyleSheet() {
    if (!this.styles) {
      return {};
    }

    const styles = this.styles();

    if (typeof styles !== 'object') {
      throw new TypeError('Component `styles` returns a non-object');
    }

    return StyleSheet.create(this.styles());
  }

  // wrap aphrodite's css helper for two reasons:
  // - we can give the element an unaltered global classname
  //   that can be used to introduce global css side effects
  //   for example, through the configuration, web inspector
  //   or user agent extensions
  // - the user doesn't need to keep track of both `css`
  //    and `style`, and we make that whole ordeal easier
  cssHelper(...args) {
    const classes = args
      .map(c => {
        if (c) {
          // we compute the global name from the given
          // css class and we prepend the component name
          //
          // it's important classes never get mangled by
          // uglifiers so that we can avoid collisions
          const component = this.constructor.name
            .toString()
            .toLowerCase();
          const globalName = `${component}_${c}`;
          return [globalName, css(this.styles_[c])];
        }
        return null;
      })
      // skip nulls
      .filter(v => Boolean(v))
      // flatten
      .reduce((a, b) => a.concat(b));
    return classes.length ? classes.join(' ') : null;
  }

  render() {
    // convert static objects from `babel-plugin-transform-jsx`
    // to `React.Element`.
    if (!this.template) {
      throw new TypeError('Component doesn\'t define `template`');
    }

    // invoke the template creator passing our css helper
    return this.template(this.cssHelper);
  }

}
