/**
 * @fileoverview
 * 顶层的 symbol，如 `use db;` 等不会有嵌套关系的
 */

import { ScopedSymbol } from 'antlr4-c3'

export class UseSymbol extends ScopedSymbol {}
