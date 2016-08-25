const HtmlWebpackPlugin = require('html-webpack-plugin')

const context = __dirname + '/src',
      entry   = './app',
      path    = __dirname + '/dist',
      filename  = 'output.js'

const mapboxShadersDir = __dirname + '/node_modules/mapbox-gl-shaders'

// https://github.com/mapbox/mapbox-gl-js/blob/master/webpack.config.example.js

module.exports = {
  context,
  entry,
  output: {
    path,
    filename
  },
  resolve: {
    alias: {
      // for mapbox-gl
      'webworkify': 'webworkify-webpack'
    }
  },
  module: {
    loaders: [
      // ES6 transpilation
      { test: /\.js$/,
        loader: 'babel',
        include: p => p.startsWith(context) },
      // I'll let you guess what this is for
      { test: /\.css$/,
        loader: 'style!css?modules' },
      // For geospatial data and mapbox-gl
      { test: /\.json$/,
        loader: 'json' },
      // for mapbox-gl's use of browserifyfs or whatever
      { test: /\.js$/,
        include: mapboxShadersDir + '/index.js',
        loader: 'transform/cacheable?brfs' }
    ],
    postLoaders: [
      { include: p => p.startsWith(mapboxShadersDir + '/'),
        loader: 'transform', 
        query: 'brfs' }
    ]
  },
  plugins: [new HtmlWebpackPlugin({
    title: 'Albuquerque Geographical Data'
  })],
  // apparently can't use eval or eval-source-map, though I don't particularly
  // want to
  devtool: 'cheap-source-map'
}
