// eslint-disable-next-line @typescript-eslint/no-var-requires
const Copy = require('copy-webpack-plugin');
import path from 'path';
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
      extensions: ['.js', '.jsx', '.ts', '.tsx']
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
