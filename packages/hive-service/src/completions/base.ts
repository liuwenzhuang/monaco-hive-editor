import { SymbolTable } from 'antlr4-c3'
import { Token } from 'antlr4ts'
import { CompletionItem, ExtraOption } from '../completion'

export abstract class CompletionBase {
  abstract getCompletions(
    symbolTable: SymbolTable,
    [prevTokens, postTokens, _tokens]: [Token[], Token[], Token[]],
    extraOption: ExtraOption
  ): Promise<CompletionItem[]>
}
