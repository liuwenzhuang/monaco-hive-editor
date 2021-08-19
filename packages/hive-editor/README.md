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

使用 webpack 的配置：

```js
// webpack.config.js

module.exports = {
  entry: {
    app: './src/index.ts', // 应用的入口
    // 由于 @lwz/hive-editor 包中存在多个文件，其他的文件是动态插入的，所以需要配置让
    'hive.worker': '@lwz/hive-editor/lib/hive.worker.js',
    'editor.worker': '@lwz/hive-editor/lib/editor.worker.js',
    'hive.3': '@lwz/hive-editor/lib/3.js',
    'hive.4': '@lwz/hive-editor/lib/4.js',
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
          return 'app.js'
      }
    },
    path: path.resolve(__dirname, 'dist'),
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
