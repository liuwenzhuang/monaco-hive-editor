import { HplsqlVisitor } from '@lwz/hive-parser'
import { Symbol as CSymbol, SymbolTable } from 'antlr4-c3'
import { AbstractParseTreeVisitor, ParseTree } from 'antlr4ts/tree'
import {
  HplsqlParser,
  Table_nameContext,
  Use_stmtContext,
  Select_list_itemContext,
  QidentContext,
} from '@lwz/hive-parser/lib/antlr4/HplsqlParser'
import { TableSymbol, UseSymbol } from './symbols/TopSymbols'

export class SymbolTableVisitor extends AbstractParseTreeVisitor<SymbolTable> implements HplsqlVisitor<SymbolTable> {
  constructor(private parser: HplsqlParser, private symbolTable: SymbolTable = new SymbolTable('Hplsql', {})) {
    super()
  }

  protected defaultResult(): SymbolTable {
    return this.symbolTable
  }

  private handleQident(ctx: QidentContext) {
    if (!ctx) {
      return
    }
    const idents = ctx.ident()
    const len = idents.length
    if (len === 1) {
      // 只有表
      const useSymbols = this.symbolTable.getSymbolsOfType(UseSymbol)
      let cloestSymbol: UseSymbol = null
      const curToken = this.parser.currentToken
      // 找到前面最近的 use db; 语句
      for (let i = useSymbols.length - 1; i >= 0; i--) {
        const curSymbol = useSymbols[i]
        if ((curSymbol.context as Use_stmtContext).stop.tokenIndex < curToken.tokenIndex) {
          cloestSymbol = curSymbol
          break
        }
      }

      const table = idents[0].text
      this.addNewSymbol(ctx, TableSymbol, table, cloestSymbol?.name)
    }

    if (len === 2) {
      // db.tbl
      const db = idents[0].text
      const table = idents[1].text
      this.addNewSymbol(ctx, TableSymbol, table, db)
    }
  }

  visitSelect_list_item(ctx: Select_list_itemContext) {
    const expr = ctx.expr()
    const selectListAlias = ctx.select_list_alias()
    if (expr?.text?.toUpperCase() === 'FROM' && selectListAlias?.qident()) {
      this.handleQident(selectListAlias.qident())
    }
    return null
  }

  visitTable_name(ctx: Table_nameContext) {
    this.handleQident(ctx.qident())
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
    try {
      const symbol = this.symbolTable.addNewSymbolOfType(type, null, ...args)
      symbol.context = context
      return symbol
    } catch (_error) {
      return null
    }
  }
}
