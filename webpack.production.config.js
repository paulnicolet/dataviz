var webpack = require('webpack');
var path = require('path');
var uglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  devtool: 'cheap-source-map',
  entry: [
    path.resolve(__dirname, 'app/main.js'),
  ],
  output: {
    path: __dirname + '/docs',
    publicPath: '/',
    filename: './bundle.js'
  },
  module: {
    loaders:[
      { test: /\.jsx?$/,
        include: path.resolve(__dirname, 'app'),
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'stage-0', 'react']
        }
      },
      { test: /\.css$/, include: path.resolve(__dirname, 'app'), loader: 'style-loader!css-loader' },
      { test: /\.scss$/, loader: ExtractTextPlugin.extract({fallback: 'style-loader', use: 'css-loader?sourceMap!sass-loader?sourceMap'})},
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        exclude: /node_modules/,
        loader: 'file-loader'
      },
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    new uglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new ExtractTextPlugin('main.css'),
    new CopyWebpackPlugin([
      { from: './app/index.html', to: 'index.html' },
      { from: './app/main.scss', to: 'main.css' },
      { from: './app/data', to: 'data' },
      { from: './app/css', to: 'css' }
    ]),
    new webpack.LoaderOptionsPlugin({
      options: {
        sassLoader: {
          includePaths: [ 'app/style' ]
        },
        context: path.join(__dirname, 'src'),
        output: {
          path: path.join(__dirname, 'www')
    }
      }
    })
  ]
};
