/* eslint-disable */
const path = require('path');
const webpack = require('webpack');
const merger = require('webpack-merge');
const base = require('./webpack.config');
/* eslint-enable */

module.exports = merger.merge(base, {
  output: {
    path: path.resolve(__dirname, '../examples/dist'),
    publicPath: './examples',
    globalObject: 'globalThis',
  },
  mode: 'development',
  devtool: 'inline-cheap-module-source-map',
  plugins: [new webpack.HotModuleReplacementPlugin()],
});
