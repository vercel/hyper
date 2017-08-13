const path = require('path');

const webpack = require('webpack');
const Copy = require('copy-webpack-plugin');

const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';

module.exports = {
  resolve: {
    extensions: ['.js', '.jsx']
  },
  devtool: isProd ? 'hidden-source-map' : 'cheap-module-source-map',
  entry: './lib/index.js',
  output: {
    path: path.join(__dirname, 'app', 'renderer'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.json/,
        loader: 'json-loader'
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': { // eslint-disable-line quote-props
        NODE_ENV: JSON.stringify(nodeEnv)
      }
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new Copy([
      {
        from: './assets',
        to: './assets'
      }
    ])
  ],
  target: 'electron'
};
