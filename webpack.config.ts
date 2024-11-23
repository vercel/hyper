import path from 'path';

import Copy from 'copy-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import webpack from 'webpack';

const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';

const config: webpack.Configuration[] = [
  {
    mode: 'none',
    name: 'hyper-app',
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
    },
    entry: './app/index.ts',
    output: {
      path: path.join(__dirname, 'target'),
      filename: 'ignore_this.js'
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          loader: 'null-loader'
        }
      ]
    },
    plugins: [
      new Copy({
        patterns: [
          {
            from: './app/*.html',
            globOptions: {ignore: ['**/node_modules/**']},
            to: '[name][ext]'
          },
          {
            from: './app/*.json',
            globOptions: {ignore: ['**/node_modules/**']},
            to: '[name][ext]'
          },
          {
            from: './app/config/*.json',
            globOptions: {ignore: ['**/node_modules/**']},
            to: './config/[name][ext]'
          },
          {
            from: './app/yarn.lock',
            to: 'yarn.lock'
          },
          {
            from: './app/keymaps/*.json',
            globOptions: {ignore: ['**/node_modules/**']},
            to: './keymaps/[name][ext]'
          },
          {
            from: './app/static',
            to: './static'
          }
        ]
      })
    ],
    target: 'electron-main'
  },

  {
    mode: 'none',
    name: 'hyper',
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.d.ts']
    },
    devtool: isProd ? 'hidden-source-map' : 'cheap-module-source-map',
    entry: './lib/index.tsx',
    output: {
      path: path.join(__dirname, 'target', 'renderer'),
      filename: 'bundle.js'
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          loader: 'babel-loader'
        },
        {
          test: /\.json/,
          loader: 'json-loader'
        },
        // for xterm.js
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ]
    },
    externals: {
      'color-convert': 'require("./node_modules/color-convert/index.js")',
      'color-string': 'require("./node_modules/color-string/index.js")',
      columnify: 'require("./node_modules/columnify/columnify.js")',
      lodash: 'require("./node_modules/lodash/lodash.js")',
      ms: 'require("./node_modules/ms/index.js")',
      'normalize-url': 'require("./node_modules/normalize-url/index.js")',
      'parse-url': 'require("./node_modules/parse-url/dist/index.js")',
      'php-escape-shell': 'require("./node_modules/php-escape-shell/php-escape-shell.js")',
      plist: 'require("./node_modules/plist/index.js")',
      'react-dom': 'require("./node_modules/react-dom/index.js")',
      'react-redux': 'require("./node_modules/react-redux/lib/index.js")',
      react: 'require("./node_modules/react/index.js")',
      'redux-thunk': 'require("./node_modules/redux-thunk/lib/index.js")',
      redux: 'require("./node_modules/redux/lib/redux.js")',
      reselect: 'require("./node_modules/reselect/lib/index.js")',
      'seamless-immutable': 'require("./node_modules/seamless-immutable/src/seamless-immutable.js")',
      stylis: 'require("./node_modules/stylis/stylis.js")',
      'xterm-addon-unicode11': 'require("./node_modules/xterm-addon-unicode11/lib/xterm-addon-unicode11.js")',
      args: 'require("./node_modules/args/lib/index.js")',
      mousetrap: 'require("./node_modules/mousetrap/mousetrap.js")',
      open: 'require("./node_modules/open/index.js")',
      'xterm-addon-fit': 'require("./node_modules/xterm-addon-fit/lib/xterm-addon-fit.js")',
      'xterm-addon-image': 'require("./node_modules/xterm-addon-image/lib/xterm-addon-image.js")',
      'xterm-addon-search': 'require("./node_modules/xterm-addon-search/lib/xterm-addon-search.js")',
      'xterm-addon-web-links': 'require("./node_modules/xterm-addon-web-links/lib/xterm-addon-web-links.js")',
      'xterm-addon-webgl': 'require("./node_modules/xterm-addon-webgl/lib/xterm-addon-webgl.js")',
      'xterm-addon-canvas': 'require("./node_modules/xterm-addon-canvas/lib/xterm-addon-canvas.js")',
      xterm: 'require("./node_modules/xterm/lib/xterm.js")'
    },
    plugins: [
      new webpack.IgnorePlugin({resourceRegExp: /.*\.js.map$/i}),

      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify(nodeEnv)
        }
      }),
      new Copy({
        patterns: [
          {
            from: './assets',
            to: './assets'
          }
        ]
      })
    ],
    optimization: {
      minimize: isProd ? true : false,
      minimizer: [new TerserPlugin()]
    },
    target: 'electron-renderer'
  },
  {
    mode: 'none',
    name: 'hyper-cli',
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
    },
    devtool: isProd ? false : 'cheap-module-source-map',
    entry: './cli/index.ts',
    output: {
      path: path.join(__dirname, 'bin'),
      filename: 'cli.js'
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          loader: 'babel-loader'
        },
        {
          test: /index.js/,
          loader: 'shebang-loader',
          include: [/node_modules\/rc/]
        }
      ]
    },
    plugins: [
      // spawn-sync is required by execa if node <= 0.10
      new webpack.IgnorePlugin({resourceRegExp: /(.*\.js.map|spawn-sync)$/i}),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(nodeEnv)
      })
    ],
    optimization: {
      minimize: isProd ? true : false,
      minimizer: [new TerserPlugin()]
    },
    target: 'node'
  }
];

export default config;
