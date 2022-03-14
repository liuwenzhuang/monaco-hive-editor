import { LangError } from '@lwz/hive-parser/lib/error-listener'
import { HiveParser, ProgramContext } from '@lwz/hive-parser'
import { UDCompletionItem } from './CompletionItemAdapter'
import { EnhanceCompletionItem } from './HiveWorker'

export default class HiveLanguageService {
  private parser: HiveParser
  constructor() {
    this.parser = new HiveParser()
  }

  parse(code: string) {
    const ast: ProgramContext = this.parser.parseAndGetASTRoot(code)
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

  getTableByDb(url: string, db: string): Promise<EnhanceCompletionItem[]> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          try {
            if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
              // 请求正常
              const res = JSON.parse(xhr.responseText)
              const data: UDCompletionItem[] = res?.data ?? []
              resolve(
                data.map<EnhanceCompletionItem>((item) => ({
                  ...item,
                  insertText: item.label,
                }))
              )
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
