import * as monaco from 'monaco-editor-core'

import IWorkerContext = monaco.worker.IWorkerContext
import Languages = monaco.languages
import HiveLanguageService from './language-service'
import { LangError } from '@lwz/hive-parser/lib/error-listener'
import { UDCompletionItem } from './CompletionItemAdapter'

interface EnhanceCompletionItem extends UDCompletionItem {
  insertText: Languages.CompletionItem['insertText']
}

export interface HiveCreateData {
  languageId: string
  azkabanKeywords: UDCompletionItem[]
  dataBases: UDCompletionItem[]
}

export class HiveWorker {
  private languageService: HiveLanguageService
  azkabanKeywords: UDCompletionItem[]
  dataBases: UDCompletionItem[]

  constructor(private ctx: IWorkerContext, createData: HiveCreateData) {
    this.languageService = new HiveLanguageService()
    this.azkabanKeywords = createData.azkabanKeywords
    this.dataBases = createData.dataBases
  }

  doValidation(uri: string): Promise<LangError[]> {
    const code = this.getTextDocument(uri)
    return Promise.resolve(this.languageService.validate(code))
  }

  getCompletionAtPosition(uri: string, position: monaco.Position, offset: number): Promise<EnhanceCompletionItem[]> {
    const code = this.getTextDocument(uri)
    const charAtOffset = code.charAt(offset - 1)
    if (charAtOffset === '$' && this.azkabanKeywords && this.azkabanKeywords.length > 0) {
      // 触发 azkaban
      const suggestions: EnhanceCompletionItem[] = this.azkabanKeywords.map((item) => ({
        ...item,
        // 用户提供的是 ${azkaban.xxx} 的格式，插入 $ 后面的内容，否则拼接上 {}
        insertText: /^\${[^}]+}$/.test(item.label) ? item.label.slice(1) : `{${item.label}}`,
      }))
      return Promise.resolve(suggestions)
    }
    if (code.substring(offset - 3, offset) === '${!' && this.dataBases && this.dataBases.length) {
      const suffixChar = code.charAt(offset)
      const suggestions: EnhanceCompletionItem[] = this.dataBases.map((item) => ({
        ...item,
        // 插入 ${!db}，判断后面是否已经有了 “}”
        insertText: `${item.label}${suffixChar === '}' ? '' : '}'}`,
      }))
      return Promise.resolve(suggestions)
    }
  }

  /**
   * 根据 uri 获取当前文档的内容
   * 如果不提供 uri，表示获取第一个文档的内容
   * 这里 uri 使用 string，而不是 monaco.Uri 类型的原因是：
   * 主线程和 worker 交流会序列化数据，原型链会丢失
   * @param uri
   * @returns
   */
  private getTextDocument(uri?: string): string {
    const models = this.ctx.getMirrorModels()
    if (!models || !models.length) {
      return ''
    }
    const currentModel = uri ? models.find((item) => item.uri.toString() === uri) : models[0]
    if (!currentModel) {
      return ''
    }
    return currentModel.getValue()
  }
}
