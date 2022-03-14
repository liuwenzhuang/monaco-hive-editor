import { HplsqlVisitor } from '@lwz/hive-parser'
import { Symbol as CSymbol, SymbolTable, VariableSymbol } from 'antlr4-c3'
import { AbstractParseTreeVisitor, ParseTree } from 'antlr4ts/tree'
import { Table_nameContext, Use_stmtContext } from '@lwz/hive-parser/lib/antlr4/HplsqlParser'
import { UseSymbol } from './symbols/TopSymols'

export class SymbolTableVisitor extends AbstractParseTreeVisitor<SymbolTable> implements HplsqlVisitor<SymbolTable> {
  constructor(private symbolTable: SymbolTable = new SymbolTable('Hplsql', {})) {
    super()
  }

  protected defaultResult(): SymbolTable {
    return this.symbolTable
  }

  visitTable_name(ctx: Table_nameContext) {
    let table: string
    if (ctx.qident !== null) {
      const idents = ctx.qident().ident()
      const len = idents.length
      if (len === 1) {
        table = idents[0].text
      }
      if (len === 2) {
        // db.tbl or tbl.col
        table = idents[1].text
      }
      if (len === 3) {
        // db.tbl.col
        table = idents[1].text
      }
      if (!this.symbolTable.resolve(table)) {
        // 未被添加过
        this.addNewSymbol(ctx, VariableSymbol, table)
      }
    }
    return null
  }

  visitUse_stmt(ctx: Use_stmtContext) {
    const dbOrSchema = ctx.expr()
    if (dbOrSchema) {
      this.addNewSymbol(ctx, UseSymbol, dbOrSchema.text)
    }
    return null
  }

  /**
   * Adds a new symbol to the current symbol TOS.
   *
   * @param context The symbol's parse tree, to allow locating it.
   * @param type The type of the symbol to add.
   * @param args The actual arguments for the new symbol.
   *
   * @returns The new symbol.
   */
  private addNewSymbol<T extends CSymbol>(context: ParseTree, type: new (...args: any[]) => T, ...args: any[]): T {
    const symbol = this.symbolTable.addNewSymbolOfType(type, null, ...args)
    symbol.context = context
    return symbol
  }
}
