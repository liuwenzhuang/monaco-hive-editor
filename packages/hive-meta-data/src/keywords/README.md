# Hive Language DDL

从 https://cwiki.apache.org/confluence/display/Hive/LanguageManual+DDL 解析而来

## Identifier in Hive

Hive 中的标识符可以是：

- tableName
- columnName
- select expr alias
- lateral view aliases
- database name
- view name
- subquery alias
- function name
- ptf argument identifier
- index name
- property name for: db,tbl,partition…
- fileFormat
- role name
- privilege name
- principal name
- macro name
- hint name
- window name

## Keywords

关键字是语法的一部分，在语言中有特殊的含义。

## Non-reserved Keywords - 非保留关健字

在特定上下文下有特殊含义的关键字，在其他情况下是能够用作标识符的。

## Reserved Keywords - 保留关键字

实际上，大多数关键字都是保留字，反之亦然。
