import { HplsqlParser } from '@lwz/hive-parser/lib'
import { SymbolTable } from 'antlr4-c3'
import { Token } from 'antlr4ts'
import { ExtraOption, CompletionItem } from '../completion'
import completionSupport from '../completion-support'
import { getSpecifiedPostionSymbol } from '../compute-token-position'
import { CompletionBase } from './base'
import { SymbolKind } from '../language-support'
import { TableSymbol } from '../symbols/TopSymbols'

class CompletionSelectList extends CompletionBase {
  getCompletions(
    symbolTable: SymbolTable,
    [prevTokens, postTokens, _tokens]: [Token[], Token[], Token[]],
    extraOption: ExtraOption
  ): Promise<CompletionItem[]> {
    const tableList = symbolTable.getSymbolsOfType(TableSymbol) ?? []

    const startToken = postTokens[0]
    const endToken = postTokens[postTokens.length - 1]
    const filteredTableList = getSpecifiedPostionSymbol(tableList, { startToken, endToken }, 'afterbegin')
    const len = filteredTableList.length

    const curToken = prevTokens[prevTokens.length - 1]
    if (curToken?.type === HplsqlParser.T_DOT) {
      const tableToken = prevTokens[prevTokens.length - 2]
      if (tableToken) {
        const table = filteredTableList.find(
          (table) => table.name === tableToken.text || table.aliasName === tableToken.text
        )
        if (table) {
          // 表名.列名
          return extraOption?.columnReqCb?.(table.db, table.name).then(completionSupport.columnSuggestionsMapper)
        }
      }
    }

    if (len > 1) {
      // 多个表，需要先提示表
      const completions = filteredTableList.map<CompletionItem>((table) => {
        const tableName = table.aliasName ?? table.name
        const dbPrefix = table.db ? `${table.db}.` : ''
        return {
          label: tableName,
          insertText: tableName,
          kind: SymbolKind.TableLiteral,
          detail: `${dbPrefix}${tableName}`,
        }
      })
      return Promise.resolve(completions)
    }

    if (len === 1) {
      // 只有一张表，直接请求表下字段
      const firstTable = filteredTableList[0]
      return extraOption?.columnReqCb?.(firstTable.db, firstTable.name).then(completionSupport.columnSuggestionsMapper)
    }
  }
}

export default new CompletionSelectList()
