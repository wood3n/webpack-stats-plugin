const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractCSSPlugin = require('mini-css-extract-plugin');
const StatsPlugin = require('./plugin/StatsPlugin.js');

const config = {
  entry: path.resolve(process.cwd(), './src/index.js'),
  resolve: {
    extensions: ['.js', '.json', '.jsx', '...'],
  },
  mode: 'production',
  output: {
    clean: true,
    path: path.resolve(process.cwd(), 'dist'),
    filename: 'js/[name].[contenthash:8].js',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/i,
        loader: 'esbuild-loader',
        options: {
          loader: 'jsx',
          target: 'es2015',
        },
      },
      {
        test: /\.css$/i,
        use: [
          {
            loader: ExtractCSSPlugin.loader,
          },
          {
            loader: 'css-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new ExtractCSSPlugin({
      filename: 'css/[name].[contenthash:8].css',
    }),
    new StatsPlugin(),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: 4,
      }),
    ],
  },
  devtool: 'source-map',
  stats: 'errors-only',
};

const compiler = webpack(config);

compiler.run();
