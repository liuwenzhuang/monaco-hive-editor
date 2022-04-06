/**
 * @fileoverview
 * 顶层的 symbol，如 `use db;` 等不会有嵌套关系的
 */

import { ScopedSymbol, Symbol as CSymbol } from 'antlr4-c3'

/**
 * use db; 顶层
 */
export class UseSymbol extends ScopedSymbol {}

/**
 * 表
 */
export class TableSymbol extends CSymbol {
  constructor(name: string, public db?: string, public aliasName?: string) {
    super(name)
  }
}
