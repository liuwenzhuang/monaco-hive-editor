import { HplsqlLexer, HplsqlParser } from '@lwz/hive-parser/lib'
import { CommonTokenStream } from 'antlr4ts'
import { CaretPosition } from './completion'

export function getCurrentSqlInfo(tokenStream: CommonTokenStream, caretPosition: CaretPosition) {
  const tokenList = tokenStream.getTokens()
  let prevSemiTokenIndex = -1
  let postSemiTokenIndex = -1

  const currentCursorTokenIndex = tokenList.findIndex((token) => {
    const text = token.text
    const startIndex = token.charPositionInLine
    const endIndex = startIndex + text.length + 1
    return token.line === caretPosition.line && startIndex <= caretPosition.column && endIndex >= caretPosition.column
  })

  for (let i = currentCursorTokenIndex - 1; i >= 0; i--) {
    const token = tokenList[i]
    if (token.type === HplsqlParser.T_SEMICOLON) {
      prevSemiTokenIndex = i
      break
    }
  }
  for (let i = currentCursorTokenIndex + 1; i <= tokenList.length; i++) {
    const token = tokenList[i]
    if (token.type === HplsqlParser.T_SEMICOLON) {
      postSemiTokenIndex = i
      break
    }
  }
  prevSemiTokenIndex = prevSemiTokenIndex === -1 ? 0 : prevSemiTokenIndex + 1
  postSemiTokenIndex = postSemiTokenIndex === -1 ? tokenList.length : postSemiTokenIndex
  const tokens = tokenList.slice(prevSemiTokenIndex, postSemiTokenIndex)
  return {
    tokens,
    code: tokens.map((token) => token.text).join(''),
    prevTokens: tokenList
      .slice(prevSemiTokenIndex, currentCursorTokenIndex + 1)
      .filter((token) => token.channel === HplsqlLexer.DEFAULT_TOKEN_CHANNEL),
    postTokens: tokenList
      .slice(currentCursorTokenIndex + 1, postSemiTokenIndex + 1)
      .filter((token) => token.channel === HplsqlLexer.DEFAULT_TOKEN_CHANNEL),
  }
}
