const path = require('path');

const webpack = require('webpack');
const Copy = require('copy-webpack-plugin');

const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';

module.exports = {
  devtool: isProd ? 'hidden-source-map' : 'cheap-eval-source-map',
  entry: './lib/interface.js',
  output: {
    path: path.join(__dirname, 'app', 'dist'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.json/,
        loader: 'json-loader'
      },
      { test: /\.css$/, loader: "style-loader!css-loader" }
    ]
  },
  // resolve: {
  //   alias: {
  //     'h-xterm': path.resolve(__dirname, 'src')
  //   },
  //   extensions: ['', '.js']
  // },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': { // eslint-disable-line quote-props
        NODE_ENV: JSON.stringify(nodeEnv)
      }
    }),
    new Copy([
      {
        from: './assets',
        to: './assets'
      }
    ])
  ],
  target: 'electron'
};
