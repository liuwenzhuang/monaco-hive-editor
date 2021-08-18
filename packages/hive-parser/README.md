# `@lwz/hive-parser`

> Hive Parser from `antlr4ts Hplsql.g4`

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
