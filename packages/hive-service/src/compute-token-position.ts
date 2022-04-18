import { ParseTree, TerminalNode } from 'antlr4ts/tree'
import { ParserRuleContext, Token, TokenStream } from 'antlr4ts'
import { TokenPosition, CaretPosition } from './completion'
import { Symbol as CSymbol } from 'antlr4-c3'

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

export function getSpecifiedPostionSymbol<T extends CSymbol>(
  symbols: T[],
  tokenMap: {
    startToken: Token
    endToken?: Token
  },
  position: InsertPosition
) {
  return symbols.filter((symbol) => {
    let symbolStopTokenIndex: number = null
    try {
      symbolStopTokenIndex = (symbol.context as any).stop.tokenIndex
    } catch (_err) {
      return false
    }

    const startToken = tokenMap.startToken
    let endToken = tokenMap.endToken
    if (!endToken) {
      endToken = startToken
    }

    if (position === 'beforebegin') {
      return symbolStopTokenIndex < startToken.tokenIndex
    }
    if (position === 'afterbegin' || position === 'beforeend') {
      return symbolStopTokenIndex > startToken.tokenIndex && symbolStopTokenIndex < endToken.tokenIndex
    }
    if (position === 'afterend') {
      return symbolStopTokenIndex > endToken.tokenIndex
    }
  })
}
