/* eslint-disable no-case-declarations */
import { HplsqlLexer, HplsqlParser, ProgramContext } from '@lwz/hive-parser'
import { CharStreams, CommonTokenStream, Token, TokenStream } from 'antlr4ts'
import { CodeCompletionCore, SymbolTable } from 'antlr4-c3'
import { ParseTree, TerminalNode } from 'antlr4ts/tree'
import { SymbolTableVisitor } from './symbol-table-visitor'
import fuzzysort from 'fuzzysort'
import { computeTokenPosition } from './compute-token-position'
import { SymbolKind } from './language-support'
import { getCurrentSqlInfo } from './util'
import { isEqual } from 'lodash-es'
import completionSupport from './completion-support'
import { ColumnsRes, DatabasesRes, TablesRes } from './interface'
import { CompletionType, getCompletions } from './completions'

export interface CaretPosition {
  /**
   * vscode 提供的行，从 1 开始
   */
  line: number
  /**
   * vscode 提供的列，从 1 开始
   */
  column: number
}
export type TokenPosition = { index: number; context: ParseTree; text: string }
export type ComputeTokenPositionFunction = (
  parseTree: ParseTree,
  tokens: TokenStream,
  caretPosition: CaretPosition
) => TokenPosition

export interface CompletionItem {
  label: string
  kind: SymbolKind
  insertText: string
  detail?: string
  documentation?: string
  sortText?: string
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
  [prevTokens, postTokens, tokens]: [Token[], Token[], Token[]],
  symbolTableFn: () => SymbolTable,
  currentSymbolTableFn: () => SymbolTable,
  position: TokenPosition,
  extraOption: ExtraOption
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
    HplsqlParser.RULE_useSuggest,
    HplsqlParser.RULE_table_name,
    HplsqlParser.RULE_ifNotExistsSuggest,
    HplsqlParser.RULE_ifExistsSuggest,
    HplsqlParser.RULE_select_list,
  ])
  const candidates = core.collectCandidates(position.index)

  const completions: CompletionItem[] = []

  // 是否忽略其他的提示侯选者
  const ignoreOtherCandidates = false

  const symbolTable = symbolTableFn()

  if (candidates.rules.has(HplsqlParser.RULE_useSuggest)) {
    return getCompletions(CompletionType.USE, symbolTable, [prevTokens, postTokens, tokens], extraOption)
  }

  if (candidates.rules.has(HplsqlParser.RULE_table_name)) {
    const rules = candidates.rules.get(HplsqlParser.RULE_table_name)
    if (
      isEqual(rules.ruleList, [
        HplsqlParser.RULE_program,
        HplsqlParser.RULE_block,
        HplsqlParser.RULE_stmt,
        HplsqlParser.RULE_create_table_stmt,
      ])
    ) {
      // 建表语句的 表名 不需要提示
      return Promise.resolve(completions)
    }
    return getCompletions(CompletionType.TABLE_NAME, symbolTable, [prevTokens, postTokens, tokens], extraOption)
  }

  if (candidates.rules.has(HplsqlParser.RULE_select_list)) {
    return getCompletions(CompletionType.SELECT_LIST, symbolTable, [prevTokens, postTokens, tokens], extraOption)
  }

  if (candidates.rules.has(HplsqlParser.RULE_ifNotExistsSuggest)) {
    return Promise.resolve([
      {
        label: 'IF NOT EXISTS',
        insertText: 'IF NOT EXISTS',
        kind: SymbolKind.StringLiteral,
        detail: 'Literal - Keywords',
        sortText: 'a',
      },
    ] as CompletionItem[])
  }

  if (candidates.rules.has(HplsqlParser.RULE_ifExistsSuggest)) {
    return Promise.resolve([
      {
        label: 'IF EXISTS',
        insertText: 'IF EXISTS',
        kind: SymbolKind.StringLiteral,
        detail: 'Literal - Keywords',
        sortText: 'a',
      },
    ] as CompletionItem[])
  }

  if (!ignoreOtherCandidates) {
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

    completions.push(...completionSupport.commonFunctions)

    completions.push(...completionSupport.commonSuggestions)
  }

  const isIgnoredToken = position.context instanceof TerminalNode && ignored.indexOf(position.context.symbol.type) >= 0
  const textToMatch = isIgnoredToken ? '' : position.text

  return Promise.resolve(filterTokens(textToMatch, completions))
}

export interface ExtraOption {
  dbReqCb: () => Promise<DatabasesRes>
  tableReqCb: (dbSchema: string) => Promise<TablesRes>
  columnReqCb: (dbSchema: string, table: string) => Promise<ColumnsRes>
}

/**
 * 根据输入的文本，获得解析所需的基础数据： tokenStream, parser, parseTree
 * @param code
 * @returns
 */
function getParseFootstone(code: string): [CommonTokenStream, HplsqlParser, ProgramContext] {
  const input = CharStreams.fromString(code)
  const lexer = new HplsqlLexer(input)
  const tokenStream = new CommonTokenStream(lexer)
  const parser = new HplsqlParser(tokenStream)
  parser.removeErrorListeners()

  const parseTree = parser.program()
  return [tokenStream, parser, parseTree]
}

export function getSuggestions(code: string, caretPosition: CaretPosition, extraOption: ExtraOption) {
  const [tokenStream, parser, parseTree] = getParseFootstone(code)

  const { code: currentSql, prevTokens, postTokens } = getCurrentSqlInfo(tokenStream, caretPosition)
  const [_, currentSqlParser, currentSqlParseTree] = getParseFootstone(currentSql)

  const position = computeTokenPosition(parseTree, tokenStream, caretPosition)
  if (!position) {
    return Promise.resolve([])
  }
  return getSuggestionsForParseTree(
    parser,
    parseTree,
    [prevTokens, postTokens, tokenStream.getTokens()],
    () => new SymbolTableVisitor(parser).visit(parseTree),
    () => new SymbolTableVisitor(currentSqlParser).visit(currentSqlParseTree),
    position,
    extraOption
  )
}
