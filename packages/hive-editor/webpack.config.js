/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')

module.exports = {
  mode: 'production',
  entry: {
    index: './src/index.ts',
    'editor.worker': 'monaco-editor-core/esm/vs/editor/editor.worker.js',
    'hive.worker': './src/hive.worker.ts',
  },
  output: {
    globalObject: 'self',
    publicPath: './',
    filename: (chunkData) => {
      switch (chunkData.chunk.name) {
        case 'editor.worker':
          return 'editor.worker.js'
        case 'hive.worker':
          return 'hive.worker.js'
        default:
          return 'index.js'
      }
    },
    path: path.resolve(__dirname, 'lib/umd'),
    library: 'MonacoHiveEditor',
    libraryTarget: 'umd',
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
}
