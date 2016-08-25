const HtmlWebpackPlugin = require('html-webpack-plugin')

const context = __dirname + '/src',
      entry   = './app',
      path    = __dirname + '/dist',
      filename  = 'output.js'

const mapboxShadersDir = __dirname + '/node_modules/mapbox-gl-shaders',
      stylesDir = context + '/styles',
      vendorStylesDir = stylesDir + '/vendor',
      inDir = dir => file => file.startsWith(dir + '/'),
      not = f => function() { return !f(...arguments) },
      and = (f1, f2) => function() { 
        return f1(...arguments) && f2(...arguments)
      }

// useful for debugging loader config include field
const logArgs = (tag, f) => function() {
        const argStr = [...arguments].map(JSON.stringify).join(', ')
        console.log(`${tag}(${argStr})`)
        const ret = f(...arguments)
        console.log(`${tag} returned ${ret}`)
        return ret
      }

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
        include: inDir(context) },
      // I'll let you guess what this is for
      { test: /\.css$/,
        loader: 'style!css?modules',
        include: and(inDir(stylesDir), not(inDir(vendorStylesDir))) },
      // For geospatial data and mapbox-gl
      { test: /\.json$/,
        loader: 'json' },
      // for mapbox-gl's use of browserifyfs or whatever
      { test: /\.js$/,
        loader: 'transform/cacheable?brfs',
        include: mapboxShadersDir + '/index.js' },
      // don't need css modules for vendor styles (e.g. from mapbox)
      { test: /\.css$/,
        loader: 'style!css',
        include: inDir(vendorStylesDir) }
    ],
    postLoaders: [
      { include: inDir(mapboxShadersDir),
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
