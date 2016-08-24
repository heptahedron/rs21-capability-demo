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
        include: p => { console.log(`path is ${p}`); return false } }
    ]
  }
}
