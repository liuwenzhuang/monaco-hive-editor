# `@lwz/hive-parser`

> Hive Parser from `antlr4ts Hplsql.g4`

## 环境安装

如果对 _Hplsql.g4_ 文件有改动，需要配置 jdk 和 antlr4 环境，具体配置可参考 [antlr4 官方文档](https://github.com/antlr/antlr4/blob/master/doc/getting-started.md#installation)。然后执行：

```bash
yarn parser build:grammar
```

## 注意

- 对下载的[语法源文件](https://raw.githubusercontent.com/apache/hive/master/hplsql/src/main/antlr4/org/apache/hive/hplsql/Hplsql.g4)，需要做一些处理：

  ```g4
  !_input.LT(1).getText().equalsIgnoreCase("GO")
  ```

  类似上面的语句要改为：

  ```g4
  this._input.LT(1).text.toUpperCase() !== "GO"
  ```

- typescript 版本

  目前需要使用 3.x 版本，具体原因可查看 [issue](https://github.com/tunnelvisionlabs/antlr4ts/issues/485)
