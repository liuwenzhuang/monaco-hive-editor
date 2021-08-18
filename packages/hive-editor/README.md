# `@lwz/hive-editor`

> Apache Hive Editor

## 支持的语法提示

```sql
${azkaban.flow.1.month.ago}
${!DATABSE_NAME}
```

## 注意事项

- [HiveWorker](./src/HiveWorker.ts) 为 Worker 环境，不能访问 window 对象及其相关功能。也不能引用 `monaco-editor-core` 中的 `ENUM`。
