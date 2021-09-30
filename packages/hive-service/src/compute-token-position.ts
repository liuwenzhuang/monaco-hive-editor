import { ParseTree, TerminalNode } from 'antlr4ts/tree'
import { CommonTokenStream, ParserRuleContext, Token, TokenStream } from 'antlr4ts'
import { TokenPosition, CaretPosition } from './completion'
import { HplsqlLexer, HplsqlParser } from '@lwz/hive-parser/lib'

export function computeTokenPosition(
  parseTree: ParseTree,
  tokens: TokenStream,
  caretPosition: CaretPosition
): TokenPosition {
  if (parseTree instanceof TerminalNode) {
    return computeTokenPositionOfTerminal(parseTree, tokens, caretPosition)
  } else {
    return computeTokenPositionOfChildNode(parseTree as ParserRuleContext, tokens, caretPosition)
  }
}

function positionOfToken(token: Token, text: string, caretPosition: CaretPosition, parseTree: ParseTree) {
  const start = token.charPositionInLine
  const stop = token.charPositionInLine + text.length + 1
  if (token.line == caretPosition.line && start <= caretPosition.column && stop >= caretPosition.column) {
    return {
      index: token.tokenIndex,
      context: parseTree,
      text: text.substring(0, caretPosition.column - start),
    }
  }
}

function computeTokenPositionOfTerminal(parseTree: TerminalNode, tokens: TokenStream, caretPosition: CaretPosition) {
  const token = parseTree.symbol
  const text = parseTree.text
  return positionOfToken(token, text, caretPosition, parseTree)
}

function computeTokenPositionOfChildNode(
  parseTree: ParserRuleContext,
  tokens: TokenStream,
  caretPosition: CaretPosition
) {
  if (
    (parseTree.start && parseTree.start.line > caretPosition.line) ||
    (parseTree.stop && parseTree.stop.line < caretPosition.line)
  ) {
    return
  }
  for (let i = 0; i < parseTree.childCount; i++) {
    const position = computeTokenPosition(parseTree.getChild(i), tokens, caretPosition)
    if (position) {
      return position
    }
  }
  if (parseTree.start && parseTree.stop) {
    for (let i = parseTree.start.tokenIndex; i <= parseTree.stop.tokenIndex; i++) {
      const pos = positionOfToken(tokens.get(i), tokens.get(i).text, caretPosition, parseTree)
      if (pos) {
        return pos
      }
    }
  }
}

/**
 * 获取当前位置上一个分号 -> 当前位置 之间的 token 列表
 *
 * @param tokenStream
 * @param caretPosition
 * @returns
 */
export function getTokensBeforePosition(tokenStream: CommonTokenStream, caretPosition: CaretPosition): Token[] {
  const tokenList = tokenStream.getTokens()
  let lastSemiTokenIndex = -1

  const currentCursorTokenIndex = tokenList.findIndex((token) => {
    const text = token.text
    const startIndex = token.charPositionInLine
    const endIndex = startIndex + text.length + 1
    return token.line === caretPosition.line && startIndex <= caretPosition.column && endIndex >= caretPosition.column
  })
  if (currentCursorTokenIndex === -1) {
    return []
  }

  for (let i = currentCursorTokenIndex - 1; i >= 0; i--) {
    const token = tokenList[i]
    if (token.type === HplsqlParser.T_SEMICOLON) {
      lastSemiTokenIndex = i
      break
    }
  }
  return tokenList
    .slice(lastSemiTokenIndex !== -1 ? lastSemiTokenIndex + 1 : 0, currentCursorTokenIndex + 1)
    .filter((token) => token.channel === HplsqlLexer.DEFAULT_TOKEN_CHANNEL)
}
