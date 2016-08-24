const HtmlWebpackPlugin = require('html-webpack-plugin')

const context = __dirname + '/src',
      entry   = './app',
      path    = __dirname + '/dist',
      filename  = 'output.js'

module.exports = {
  context,
  entry,
  output: {
    path,
    filename
  },
  module: {
    loaders: [
      { test: /\.js$/,
        loader: 'babel',
        include: p => p.startsWith(context) }
    ]
  },
  plugins: [new HtmlWebpackPlugin({
    title: 'Albuquerque Geographical Data'
  })]
}
