import { HplsqlParser, ProgramContext } from './antlr4/HplsqlParser'
import { HplsqlLexer } from './antlr4/HplsqlLexer'
import { CharStreams, CommonTokenStream } from 'antlr4ts'
import ErrorListener, { LangError } from './error-listener'

export default class Parser {
  parse(code: string): { ast: ProgramContext; errors: LangError[] } {
    const inputStream = CharStreams.fromString(code)
    const lexer = new HplsqlLexer(inputStream)
    lexer.removeErrorListeners()
    const langErrorListener = new ErrorListener()
    lexer.addErrorListener(langErrorListener)
    const tokenStream = new CommonTokenStream(lexer)
    const parser = new HplsqlParser(tokenStream)
    parser.removeErrorListeners()
    parser.addErrorListener(langErrorListener)
    const ast = parser.program()
    const errors: LangError[] = langErrorListener.getErrors()
    return { ast, errors }
  }

  parseAndGetASTRoot(code: string): ProgramContext {
    const { ast } = this.parse(code)
    return ast
  }

  parseAndGetSyntaxErrors(code: string): LangError[] {
    const { errors } = this.parse(code)
    return errors
  }
}
