import { HplsqlLexer, HplsqlParser } from '@lwz/hive-parser'
import { CharStreams, CommonTokenStream, TokenStream } from 'antlr4ts'
import { CodeCompletionCore, SymbolTable, VariableSymbol } from 'antlr4-c3'
import { ParseTree, TerminalNode } from 'antlr4ts/tree'
import { SymbolTableVisitor } from './symbol-table-visitor'
import fuzzysort from 'fuzzysort'
import { computeTokenPosition } from './compute-token-position'
import { SymbolKind } from './language-support'
import { FunctionKeywords } from '@lwz/hive-meta-data'

export type CaretPosition = { line: number; column: number }
export type TokenPosition = { index: number; context: ParseTree; text: string }
export type ComputeTokenPositionFunction = (
  parseTree: ParseTree,
  tokens: TokenStream,
  caretPosition: CaretPosition
) => TokenPosition

interface CompletionItem {
  label: string
  kind: SymbolKind
  insertText: string
  detail?: string
  documentation?: string
}

export function filterTokens_startsWith(text: string, candidates: CompletionItem[]) {
  if (text.trim().length == 0) {
    return candidates
  } else {
    return candidates.filter((c) => c.label.toLowerCase().startsWith(text.toLowerCase()))
  }
}

export function filterTokens_fuzzySearch(text: string, candidates: CompletionItem[]): CompletionItem[] {
  if (text.trim().length == 0) {
    return candidates
  } else {
    return fuzzysort.go<CompletionItem>(text, candidates, {
      key: 'label',
    }) as unknown as CompletionItem[]
  }
}

export let filterTokens = filterTokens_startsWith
export function setTokenMatcher(fn: (text: string, candidates: CompletionItem[]) => CompletionItem[]) {
  filterTokens = fn
}

export function getSuggestionsForParseTree(
  parser: HplsqlParser,
  parseTree: ParseTree,
  symbolTableFn: () => SymbolTable,
  position: TokenPosition
) {
  const core = new CodeCompletionCore(parser)
  // core.showResult = true

  const ignored = [
    HplsqlLexer.EOF,
    HplsqlLexer.T_PLUS,
    HplsqlLexer.T_COLON,
    HplsqlLexer.T_COMMA,
    HplsqlLexer.T_PIPE,
    HplsqlLexer.T_DIV,
    HplsqlLexer.T_DOT,
    HplsqlLexer.T_DOT2,
    HplsqlLexer.T_EQUAL,
    HplsqlLexer.T_EQUAL2,
    HplsqlLexer.T_NOTEQUAL,
    HplsqlLexer.T_NOTEQUAL2,
    HplsqlLexer.T_GREATER,
    HplsqlLexer.T_GREATEREQUAL,
    HplsqlLexer.T_LESS,
    HplsqlLexer.T_LESSEQUAL,
    HplsqlLexer.T_MUL,
    HplsqlLexer.T_OPEN_B,
    HplsqlLexer.T_OPEN_P,
    HplsqlLexer.T_OPEN_SB,
    HplsqlLexer.T_CLOSE_B,
    HplsqlLexer.T_CLOSE_P,
    HplsqlLexer.T_CLOSE_SB,
    HplsqlLexer.T_SEMICOLON,
    HplsqlLexer.T_SUB,
    HplsqlParser.T_MOD,
    HplsqlParser.L_M_COMMENT,
    HplsqlParser.L_S_COMMENT,
    HplsqlParser.L_S_STRING,
    HplsqlParser.L_D_STRING,
    HplsqlParser.L_INT,
    HplsqlParser.L_DEC,
    HplsqlParser.L_WS,
    HplsqlParser.L_ID,
    HplsqlParser.L_LABEL,
    HplsqlParser.T_EXCLAMATION,
    HplsqlParser.T_ADDRESS,
    HplsqlParser.T_POUND,
  ]
  core.ignoredTokens = new Set(ignored)
  core.preferredRules = new Set([
    // HplsqlParser.RULE_select_stmt,
    HplsqlParser.RULE_table_name,
    // HplsqlParser.RULE_create_table_stmt,
    // HplsqlParser.RULE_use_stmt,
  ])
  const candidates = core.collectCandidates(position.index)

  const completions: CompletionItem[] = []

  const symbolTable = symbolTableFn()
  candidates.rules.forEach((_callStack, key) => {
    switch (key) {
      case HplsqlParser.RULE_table_name:
        symbolTable.getAllSymbols(VariableSymbol).forEach((symbol) => {
          completions.push({
            label: symbol.name,
            insertText: symbol.name,
            kind: SymbolKind.Variable,
            detail: 'Variable - Table Name',
          })
        })
        break
      default:
        break
    }
  })

  candidates.tokens.forEach((_, k) => {
    let value = parser.vocabulary.getDisplayName(k)
    if (value) {
      if (value.startsWith('T_')) {
        value = value.slice(2)
      }
      // keywords
      completions.push({
        label: value,
        kind: SymbolKind.Keyword,
        insertText: value,
        detail: 'Keywords',
      })
    }
  })

  // functions
  const functions = FunctionKeywords.map<CompletionItem>((item) => {
    const label = item.name.toUpperCase()
    return {
      label,
      kind: SymbolKind.Function,
      insertText: `${label}()`,
      detail: item.synax,
      documentation: item.desc,
    }
  })

  completions.push(...functions)

  const isIgnoredToken = position.context instanceof TerminalNode && ignored.indexOf(position.context.symbol.type) >= 0
  const textToMatch = isIgnoredToken ? '' : position.text

  return filterTokens(textToMatch, completions)
}

export function getSuggestions(code: string, caretPosition: CaretPosition) {
  const input = CharStreams.fromString(code)
  const lexer = new HplsqlLexer(input)
  const tokenStream = new CommonTokenStream(lexer)
  const parser = new HplsqlParser(tokenStream)

  const parseTree = parser.program()

  const position = computeTokenPosition(parseTree, tokenStream, caretPosition)
  if (!position) {
    return []
  }
  return getSuggestionsForParseTree(parser, parseTree, () => new SymbolTableVisitor().visit(parseTree), position)
}
