import { HplsqlLexer } from '@lwz/hive-parser'
import { CharStreams, CommonTokenStream, TokenStream } from 'antlr4ts'
import { CodeCompletionCore, ScopedSymbol, SymbolTable, VariableSymbol } from 'antlr4-c3'
import { ParseTree, TerminalNode } from 'antlr4ts/tree'
import { SymbolTableVisitor } from './symbol-table-visitor'
import { Symbol as ISymbol } from 'antlr4-c3/out/src/SymbolTable'
import fuzzysort from 'fuzzysort'
import { computeTokenPosition } from './compute-token-position'
import { HplsqlParser, Table_nameContext } from '@lwz/hive-parser/lib/antlr4/HplsqlParser'

export type CaretPosition = { line: number; column: number }
export type TokenPosition = { index: number; context: ParseTree; text: string }
export type ComputeTokenPositionFunction = (
  parseTree: ParseTree,
  tokens: TokenStream,
  caretPosition: CaretPosition
) => TokenPosition

export function getScope(context: ParseTree, symbolTable: SymbolTable) {
  if (!context) {
    return undefined
  }
  const scope = symbolTable.symbolWithContext(context)
  if (scope) {
    return scope
  } else {
    return getScope(context.parent, symbolTable)
  }
}

export function getAllSymbolsOfType<T extends ISymbol>(scope: ScopedSymbol, type: new (...args: any[]) => T): T[] {
  const symbols = scope.getSymbolsOfType(type)
  let parent = scope.parent
  while (parent && !(parent instanceof ScopedSymbol)) {
    parent = parent.parent
  }
  if (parent) {
    symbols.push(...getAllSymbolsOfType(parent as ScopedSymbol, type))
  }
  return symbols
}

function suggestVariables(symbolTable: SymbolTable, position: TokenPosition) {
  const context = position.context
  const scope = getScope(context, symbolTable)
  let symbols: ISymbol[]
  if (scope instanceof ScopedSymbol) {
    //Local scope
    symbols = getAllSymbolsOfType(scope, VariableSymbol)
  } else {
    //Global scope
    symbols = symbolTable.getSymbolsOfType(VariableSymbol)
  }
  let variable = position.context
  while (!(variable instanceof Table_nameContext) && variable.parent) {
    variable = variable.parent
  }
  return filterTokens(
    variable ? position.text : '',
    symbols.map((s) => s.name)
  )
}

export function filterTokens_startsWith(text: string, candidates: string[]) {
  if (text.trim().length == 0) {
    return candidates
  } else {
    return candidates.filter((c) => c.toLowerCase().startsWith(text.toLowerCase()))
  }
}

export function filterTokens_fuzzySearch(text: string, candidates: string[]): string[] {
  if (text.trim().length == 0) {
    return candidates
  } else {
    return fuzzysort.go(text, candidates).map((r) => r.target)
  }
}

export let filterTokens = filterTokens_startsWith
export function setTokenMatcher(fn: (text: string, candidates: string[]) => string[]) {
  filterTokens = fn
}

export function getSuggestionsForParseTree(
  parser: HplsqlParser,
  parseTree: ParseTree,
  symbolTableFn: () => SymbolTable,
  position: TokenPosition
) {
  const core = new CodeCompletionCore(parser as any)
  core.showResult = true

  const ignored = []
  ignored.push(HplsqlParser.L_M_COMMENT, HplsqlParser.L_S_COMMENT)
  core.ignoredTokens = new Set(ignored)
  core.preferredRules = new Set([HplsqlParser.RULE_table_name])
  const candidates = core.collectCandidates(position.index)

  const completions: string[] = []
  if (candidates.rules.has(HplsqlParser.RULE_table_name)) {
    completions.push(...suggestVariables(symbolTableFn(), position))
  }
  const tokens = []
  candidates.tokens.forEach((_, k) => {
    const symbolicName = parser.vocabulary.getSymbolicName(k)
    if (symbolicName) {
      tokens.push(symbolicName.toLowerCase().slice(2))
    }
  })
  const isIgnoredToken = position.context instanceof TerminalNode && ignored.indexOf(position.context.symbol.type) >= 0
  const textToMatch = isIgnoredToken ? '' : position.text
  completions.push(...filterTokens(textToMatch, tokens))
  return completions.map((label) => ({
    insertText: label,
    label,
  }))
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
