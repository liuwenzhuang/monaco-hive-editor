import { LangError } from '@lwz/hive-parser/lib/error-listener'
import { HiveParser, HplsqlParserNs } from '@lwz/hive-parser'

export default class HiveLanguageService {
  validate(code: string): LangError[] {
    const parser = new HiveParser()
    const syntaxErrors: LangError[] = parser.parseAndGetSyntaxErrors(code)
    const ast: HplsqlParserNs.ProgramContext = parser.parseAndGetASTRoot(code)
    return syntaxErrors
  }
}
