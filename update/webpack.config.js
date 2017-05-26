
const HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');

module.exports ={
  entry: "./src/app.js",
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: "app.bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    compress: true,
    port: 9000,
    stats: 'errors-only',
    open: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Immutablity Helpers',
      minify: {
        collapseWhitespace: true
      },
      hash: true,
      template: './src/index.html'
    })
]
}