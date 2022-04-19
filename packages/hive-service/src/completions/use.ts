import { SymbolTable } from 'antlr4-c3'
import { Token } from 'antlr4ts'
import { ExtraOption, CompletionItem } from '../completion'
import completionSupport from '../completion-support'
import { CompletionBase } from './base'

export class CompletionUse extends CompletionBase {
  getCompletions(
    _symbolTable: SymbolTable,
    [_prevTokens, _postTokens, _tokens]: [Token[], Token[], Token[]],
    extraOption: ExtraOption
  ): Promise<CompletionItem[]> {
    return extraOption?.dbReqCb?.().then(completionSupport.databaseSuggestionsMapper)
  }
}

export default new CompletionUse()
