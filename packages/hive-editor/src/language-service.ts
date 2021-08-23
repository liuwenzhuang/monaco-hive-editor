import { LangError } from '@lwz/hive-parser/lib/error-listener'
import { HiveParser, HplsqlParserNs } from '@lwz/hive-parser'
import { UDCompletionItem } from './CompletionItemAdapter'

export default class HiveLanguageService {
  private parser: HiveParser
  constructor() {
    this.parser = new HiveParser()
  }

  parse(code: string) {
    const ast: HplsqlParserNs.ProgramContext = this.parser.parseAndGetASTRoot(code)
    return ast
  }

  validate(code: string): LangError[] {
    const syntaxErrors: LangError[] = this.parser.parseAndGetSyntaxErrors(code)
    return syntaxErrors
  }

  getWordBefore(code: string, position: number) {
    let result = ''
    while (position > 0) {
      const char = code.charAt(--position)
      if (/[ \t\n.]/.test(char)) {
        break
      }
      result = `${char}${result}`
    }
    return result
  }

  getTableByDb(url: string, db: string): Promise<UDCompletionItem[]> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          try {
            if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
              // 请求正常
              const res = JSON.parse(xhr.responseText)
              resolve(res?.data)
            } else {
              // 请求异常
              reject(xhr)
            }
          } catch (e) {
            reject(xhr)
          }
        }
      }

      xhr.open('GET', `${url}?db=${db}`, true)
      xhr.send(null)
    })
  }
}
