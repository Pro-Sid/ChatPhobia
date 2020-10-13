const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './client/index.js',
  mode: 'development',
  output: {
    path: '/',
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        use: 'babel-loader',
        test: /\.js$/,
        exclude: /node_modules/
      },
      {
        use: ['style-loader', 'css-loader', 'sass-loader'],
        test: /\.css$/
      },
      {
        test: /\.(jpg|jpeg|png)$/,
        use: {
          loader: 'url-loader'
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'client/index.html'
    })
  ]
};
