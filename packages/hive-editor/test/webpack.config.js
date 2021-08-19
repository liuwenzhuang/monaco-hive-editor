/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  devtool: 'cheap-module-eval-source-map',
  entry: {
    app: './index.ts',
    'editor.worker': 'monaco-editor-core/esm/vs/editor/editor.worker.js',
    'hive.worker': '../src/hive.worker.ts',
  },
  output: {
    globalObject: 'self',
    filename: (chunkData) => {
      switch (chunkData.chunk.name) {
        case 'editor.worker':
          return 'editor.worker.js'
        case 'hive.worker':
          return 'hive.worker.js'
        default:
          return 'app.js'
      }
    },
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.css'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?/,
        loader: 'ts-loader',
      },
      {
        test: /\.css/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.ttf/,
        use: 'file-loader',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
  ],
}
