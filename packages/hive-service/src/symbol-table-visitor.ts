import { HplsqlVisitor } from '@lwz/hive-parser'
import { ScopedSymbol, SymbolTable, VariableSymbol } from 'antlr4-c3'
import { AbstractParseTreeVisitor, ParseTree } from 'antlr4ts/tree'
import { Create_table_stmtContext } from '@lwz/hive-parser/lib/antlr4/HplsqlParser'

export class SymbolTableVisitor extends AbstractParseTreeVisitor<SymbolTable> implements HplsqlVisitor<SymbolTable> {
  constructor(
    protected readonly symbolTable = new SymbolTable('', {}),
    protected scope = symbolTable.addNewSymbolOfType(ScopedSymbol, undefined)
  ) {
    super()
  }

  protected defaultResult(): SymbolTable {
    return this.symbolTable
  }

  visitCreate_table_stmt(ctx: Create_table_stmtContext) {
    // 将新建的表名，加到 symbolTable 中
    this.symbolTable.addNewSymbolOfType(VariableSymbol, null, ctx.table_name().text)
    return this.visitChildren(ctx)
  }

  protected withScope<T>(tree: ParseTree, type: new (...args: any[]) => ScopedSymbol, args: any[], action: () => T): T {
    const scope = this.symbolTable.addNewSymbolOfType(type, this.scope, ...args)
    scope.context = tree
    this.scope = scope
    try {
      return action()
    } finally {
      this.scope = scope.parent as ScopedSymbol
    }
  }
}
