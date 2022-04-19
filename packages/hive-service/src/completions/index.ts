import { HplsqlParser } from '@lwz/hive-parser/lib'
import { SymbolTable } from 'antlr4-c3'
import { Token } from 'antlr4ts'
import { CompletionItem, ExtraOption } from '../completion'
import { CompletionBase } from './base'
import completionUse from './use'
import completionTableName from './table-name'
import completionSelectList from './select-list'

export enum CompletionType {
  USE = HplsqlParser.RULE_useSuggest,
  TABLE_NAME = HplsqlParser.RULE_table_name,
  SELECT_LIST = HplsqlParser.RULE_select_list,
}

export function getCompletions(
  type: CompletionType,
  symbolTable: SymbolTable,
  [prevTokens, postTokens, tokens]: [Token[], Token[], Token[]],
  extraOption: ExtraOption
) {
  let completionEntity: CompletionBase
  switch (type) {
    case CompletionType.USE:
      completionEntity = completionUse
      break
    case CompletionType.TABLE_NAME:
      completionEntity = completionTableName
      break
    case CompletionType.SELECT_LIST:
      completionEntity = completionSelectList
      break
    default:
      break
  }
  if (!completionEntity) {
    return Promise.resolve([] as CompletionItem[])
  }
  return completionEntity.getCompletions(symbolTable, [prevTokens, postTokens, tokens], extraOption)
}
