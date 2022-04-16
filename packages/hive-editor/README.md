# `@lwz/hive-editor`

> Apache Hive Editor

## 支持的语法提示

```sql
${azkaban.flow.1.month.ago}
${!DATABSE_NAME}
```

## 注意事项

- [HiveWorker](./src/HiveWorker.ts) 为 Worker 环境，不能访问 window 对象及其相关功能。也不能引用 `monaco-editor-core` 中的 `ENUM`。

## 用法

```bash
$ yarn add @lwz/hive-editor
```

### 使用 esm

```js
// webpack.config.js

module.exports = {
  entry: {
    'editor.worker': 'monaco-editor-core/esm/vs/editor/editor.worker.js',
    'hive.worker': '@lwz/hive-editor/lib/esm/hive.worker.js',
    index: './src/index.ts',
  },
  output: {
    globalObject: 'self',
    filename: (chunkData) => {
      switch (chunkData.chunk.name) {
        case 'editor.worker':
          // 文件名不能变
          return 'editor.worker.js'
        case 'hive.worker':
          // 文件名不能变
          return 'hive.worker.js'
        default:
          return 'index.js'
      }
    },
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.tsx?/,
        loader: 'ts-loader',
      },
      {
        test: /\.css/,
        // 生成环境可使用 mini-css-extract-plugin 替换 style-loader
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.ttf/,
        use: 'file-loader',
      },
    ],
  },
}
```

> 注意，两个 worker 文件 build 后的文件名不能改变，且如果是 webpack 环境下，默认加载的路径会拼上 `__webpack_public_path__`，也可以像下面一样显式地指定 publicPath 属性：

```js
// editor.js

import MonacoHiveEditor from '@lwz/hive-editor'

const container = document.getElementById('container')

new MonacoHiveEditor(container, {
  value: [
    'use mammut_idc;',
    '-- set hive.execution.engine=spark;',
    'select count(*) from (select * from src) A left join (select * from src) B on A.key = B.key;',
    'create table students(id int, age char(2));',
  ].join('\n'),
  publicPath: __webpack_public_path__
})
```

### 使用 umd

```js
// webpack.config.js

module.exports = {
  entry: {
    index: './src/index.ts', // 应用的入口
    // 由于 @lwz/hive-editor 包中存在多个文件，其他的文件是动态插入的，所以需要配置让
    'hive.worker': '@lwz/hive-editor/lib/umd/hive.worker.js',
    'editor.worker': '@lwz/hive-editor/lib/umd/editor.worker.js',
    'hive.3': '@lwz/hive-editor/lib/umd/3.js',
    'hive.4': '@lwz/hive-editor/lib/umd/4.js',
  },
  output: {
    globalObject: 'self',
    filename: (chunkData) => {
      switch (chunkData.chunk.name) {
        case 'editor.worker':
          return 'editor.worker.js'
        case 'hive.worker':
          return 'hive.worker.js'
        case 'hive.3':
          return '3.js'
        case 'hive.4':
          return '4.js'
        default:
          return 'index.js'
      }
    },
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.tsx?/,
        loader: 'ts-loader',
      },
      {
        test: /\.css/,
        // 生成环境可使用 mini-css-extract-plugin 替换 style-loader
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.ttf/,
        use: 'file-loader',
      },
    ],
  },
}
```

```js
// editor.js

const container = document.getElementById('container')

import('@lwz/hive-editor').then(({ default: MonacoHiveEditor }) => {
  new MonacoHiveEditor(container, {
    value: [
      'use mammut_idc;',
      '-- set hive.execution.engine=spark;',
      'select count(*) from (select * from src) A left join (select * from src) B on A.key = B.key;',
      'create table students(id int, age char(2));',
    ].join('\n'),
  })
})
```

## 封装的编辑器实例方法

> 具体可查看 [index.d.ts](./lib/esm/index.d.ts)

```js
// 封装的编辑器实例
const editorInstance = new MonacoHiveEditor(container)

// 设置提示相关参数
editorInstance.setCompletionsOptions({
  dataBases: ['testDb1', 'testDb2'],
  azkabanKeywords: [{ label: 'az.1.day.ago', detail: '一天前' }],
  noTestDataBase: true,
  tableReq: {
    url: 'http://127.0.0.1:3001/getDbTables',
    method: 'post',
    dbKey: 'dbName',
    data: {
      email: 'liu1114589929@gmail.com',
    },
  },
  columnReq: {
    url: 'http://127.0.0.1:3001/getColumns',
    method: 'post',
    dbKey: 'dbName',
    tableKey: 'tableName',
    data: {
      email: 'liu1114589929@gmail.com',
      dataSourceId: 'dataSource_id_1',
    },
  },
})

// 获取真正的编辑器实例
const editor = editorInstance.getEditor()
// 获取文档的值，可提交给服务端运行
const editorText = editor.getValue()
```

> 真正的编辑器实例类型为 `monaco.editor.IStandaloneCodeEditor`，具体 API 可参考 [官方文档](https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.istandalonecodeeditor.html)。

### setCompletionsOptions 参数说明

具体参数定义可见 [monaco.contribution.d.ts](./lib/esm/monaco.contribution.d.ts)。

_tableReq_ 和 _columnReq_ 参数定义分别是表、列 ajax 请求的参数，因为 worker 中不能接收 function 作为参数，故传入必要参数，由 worker 进行 ajax 请求获取必要的接口数据响应。

_tableReq_ 和 _columnReq_ 接口的响应定义分别见于 [hive-service 中的 interface](../hive-service/src/interface.ts) 中的 _TablesRes_ 和 _ColumnRes_。
