const path = require('path');
const exec = require('child_process').exec;

const webpack = require('webpack');
const Copy = require('copy-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';

module.exports = [
  {
    mode: 'none',
    name: 'hyper-app',
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
    },
    entry: './app/index.js',
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
      new Copy([
        {
          from: './app/*.html',
          exclude: /node_modules/,
          to: '.',
          flatten: true
        },
        {
          from: './app/*.json',
          exclude: /node_modules/,
          to: '.',
          flatten: true
        },
        {
          from: './app/keymaps/*.json',
          exclude: /node_modules/,
          to: './keymaps',
          flatten: true
        }
        // {
        //   from: './app/node_modules',     // gives really long output in webpack, used cp instead
        //   to: './node_modules'
        // }
      ]),

      {
        apply: compiler => {
          compiler.hooks.afterEmit.tap('AfterEmitPlugin', () => {
            exec('cp -r ./app/node_modules ./target && tsc', (err, stdout, stderr) => {
              if (stdout) process.stdout.write(stdout);
              if (stderr) process.stderr.write(stderr);
              process.stdout.write('\nCompiled\n\n');
            });
          });
        }
      },
      new ForkTsCheckerWebpackPlugin()
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
    entry: './lib/index.js',
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
          loader: 'style-loader!css-loader'
        }
      ]
    },
    plugins: [
      new webpack.IgnorePlugin(/.*\.js.map$/i),

      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify(nodeEnv)
        }
      }),
      new Copy([
        {
          from: './assets',
          to: './assets'
        }
      ]),
      new ForkTsCheckerWebpackPlugin({
        tsconfig: './lib/tsconfig.json'
      })
    ],
    target: 'electron-renderer'
  },
  {
    mode: 'none',
    name: 'hyper-cli',
    resolve: {
      extensions: ['.js', '.jsx', '.json']
    },
    devtool: isProd ? 'none' : 'cheap-module-source-map',
    entry: './cli/index.js',
    output: {
      path: path.join(__dirname, 'bin'),
      filename: 'cli.js'
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
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
      new webpack.IgnorePlugin(/(.*\.js.map|spawn-sync)$/i),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(nodeEnv)
      })
    ],
    target: 'node'
  }
];
