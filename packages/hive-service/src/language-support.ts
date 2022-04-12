export enum SymbolKind {
  /**
   * 关键词
   */
  Keyword,
  /**
   * 变量
   */
  Variable,
  /**
   * 函数
   */
  Function,
  /**
   * 字符串字面量
   */
  StringLiteral,
  /**
   * 数据库名字面量
   */
  DatabaseLiteral,
  /**
   * 表名字面量
   */
  TableLiteral,
  /**
   * 列名字面量
   */
  ColumnLiteral = 6,
  /**
   * 预置的一些代码片段
   */
  LanguageSnippet,
}
