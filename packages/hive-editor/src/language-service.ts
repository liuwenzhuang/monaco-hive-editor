import { LangError } from '@lwz/hive-parser/lib/error-listener'
import { HiveParser, ProgramContext } from '@lwz/hive-parser'
import { UDCompletionItem } from './CompletionItemAdapter'
import { CompletionsOptions } from './monaco.contribution'

interface ReqOption<T = any> {
  url: string
  method?: 'get' | 'post'
  data: T
}

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

  object2Query(obj: Record<string, any>, connector = '&') {
    let query = ''
    Object.keys(obj).forEach((key) => {
      const encodedKey = encodeURIComponent(key)
      const value = obj[key]
      const encodedValue =
        value !== undefined && value !== null && !Number.isNaN(value) ? encodeURIComponent(value.toString()) : ''
      query = `${query ? `${query}${connector}` : ''}${encodedKey}=${encodedValue}`
    })
    return query
  }

  request<Res, Req = any>(option: ReqOption<Req>): Promise<Res> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          try {
            if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
              // 请求正常
              const res = JSON.parse(xhr.responseText)
              const data: Res = res?.data ?? []
              resolve(data)
            } else {
              // 请求异常
              reject(xhr)
            }
          } catch (e) {
            reject(xhr)
          }
        }
      }
      const { method = 'get', data, url } = option
      if (method === 'get') {
        xhr.open('get', `${url}?${this.object2Query(data)}`, true)
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.send(null)
      }

      if (method === 'post') {
        xhr.open('post', url, true)
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.send(JSON.stringify(data))
      }
    })
  }

  getTableByDb = (baseReqData: CompletionsOptions['tableReq'], db: string) => {
    return this.request<UDCompletionItem[]>({
      method: baseReqData.method,
      url: baseReqData.url,
      data: { ...baseReqData.data, [baseReqData.dbKey]: db },
    }).catch((_err) => {
      //ignore
    })
  }

  getColumnByDbTable = (baseReqData: CompletionsOptions['columnReq'], db: string, table: string) => {
    return this.request<UDCompletionItem[]>({
      method: baseReqData.method,
      url: baseReqData.url,
      data: {
        ...baseReqData.data,
        [baseReqData.dbKey]: db,
        [baseReqData.tableKey]: table,
      },
    }).catch((_err) => {
      // ignore
    })
  }
}
