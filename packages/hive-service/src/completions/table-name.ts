import { HplsqlParser } from '@lwz/hive-parser/lib'
import { SymbolTable } from 'antlr4-c3'
import { Token } from 'antlr4ts'
import { ExtraOption, CompletionItem } from '../completion'
import completionSupport from '../completion-support'
import { getSpecifiedPostionSymbol } from '../compute-token-position'
import { UseSymbol } from '../symbols/TopSymbols'
import { CompletionBase } from './base'
import { isEmpty, last } from 'lodash-es'

class CompletionTableName extends CompletionBase {
  getCompletions(
    symbolTable: SymbolTable,
    [prevTokens, _postTokens, _tokens]: [Token[], Token[], Token[]],
    extraOption: ExtraOption
  ): Promise<CompletionItem[]> {
    const dbSchemaList = symbolTable.getSymbolsOfType(UseSymbol)
    const curToken = prevTokens[prevTokens.length - 1]
    const prevDbSchemas = getSpecifiedPostionSymbol(dbSchemaList, { startToken: curToken }, 'beforebegin')
    if (curToken?.type === HplsqlParser.T_DOT) {
      // 处理 "db." 的情况
      const prevToken = prevTokens[prevTokens.length - 2]
      if (prevToken) {
        return extraOption?.tableReqCb?.(prevToken.text).then(completionSupport.tableSuggestionsMapper)
      }
    }
    if (isEmpty(prevDbSchemas)) {
      // 提示库
      return extraOption?.dbReqCb?.().then(completionSupport.databaseSuggestionsMapper)
    } else {
      // 提示 库下表
      return extraOption?.tableReqCb?.(last(prevDbSchemas).name).then(completionSupport.tableSuggestionsMapper)
    }
  }
}

export default new CompletionTableName()
