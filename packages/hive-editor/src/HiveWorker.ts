import * as monaco from 'monaco-editor-core'

import IWorkerContext = monaco.worker.IWorkerContext
import Languages = monaco.languages
import HiveLanguageService from './language-service'
import { LangError } from '@lwz/hive-parser/lib/error-listener'
import { UDCompletionItem } from './CompletionItemAdapter'
import { CompletionsOptions, HiveWorker as IHiveWorker } from './monaco.contribution'

interface EnhanceCompletionItem extends UDCompletionItem {
  insertText: Languages.CompletionItem['insertText']
}

export interface HiveCreateData extends CompletionsOptions {
  languageId: string
  customWorkerPath?: string
}

export class HiveWorker implements IHiveWorker {
  private languageService: HiveLanguageService
  azkabanKeywords: UDCompletionItem[]
  dataBases: UDCompletionItem[]

  constructor(private ctx: IWorkerContext, private createData: HiveCreateData) {
    this.languageService = new HiveLanguageService()
    this.azkabanKeywords = this.createData.azkabanKeywords
    this.dataBases = this.createData.dataBases
  }

  getValidation(fileName: string): Promise<LangError[]> {
    const code = this.getTextDocument(fileName)
    return Promise.resolve(this.languageService.validate(code))
  }

  getCompletionsAtPosition(fileName: string, offset: number): Promise<EnhanceCompletionItem[]> {
    const code = this.getTextDocument(fileName)
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
    if (charAtOffset === '.') {
      const word = this.languageService.getWordBefore(code, offset - 1)
      if (this.dataBases.some((database) => database.label === word)) {
        const tableReqUrl = this.createData.tableReqUrl
        if (tableReqUrl) {
          return this.languageService
            .getTableByDb(tableReqUrl, word)
            .then((list) => {
              return list.map((item) => ({
                ...item,
                insertText: item.label,
              }))
            })
            .catch(() => {
              // ignore err
              return []
            })
        }
      }
    }
  }

  /**
   * 根据 fileName 获取当前文档的内容
   * 如果不提供 fileName，表示获取第一个文档的内容
   * 这里 fileName 使用 string，而不是 monaco.Uri 类型的原因是：
   * 主线程和 worker 交流会序列化数据，原型链会丢失
   * @param fileName
   * @returns
   */
  private getTextDocument(fileName?: string): string {
    const models = this.ctx.getMirrorModels()
    if (!models || !models.length) {
      return ''
    }
    const currentModel = fileName ? models.find((item) => item.uri.toString() === fileName) : models[0]
    if (!currentModel) {
      return ''
    }
    return currentModel.getValue()
  }
}

/** The shape of the factory */
export interface CustomTSWebWorkerFactory {
  (HiveWorkerClass: typeof HiveWorker): typeof HiveWorker
}

declare global {
  // eslint-disable-next-line no-var
  var importScripts: (path: string) => void | undefined
  // eslint-disable-next-line no-var
  var customTSWorkerFactory: CustomTSWebWorkerFactory | undefined
}

export function create(ctx: IWorkerContext, createData: HiveCreateData): HiveWorker {
  let HiveWorkerClass = HiveWorker
  if (createData.customWorkerPath) {
    if (typeof importScripts === 'undefined') {
      console.warn(
        'Monaco is not using webworkers for background tasks, and that is needed to support the customWorkerPath flag'
      )
    } else {
      importScripts(createData.customWorkerPath)

      const workerFactoryFunc: CustomTSWebWorkerFactory | undefined = self.customTSWorkerFactory
      if (!workerFactoryFunc) {
        throw new Error(`The script at ${createData.customWorkerPath} does not add customTSWorkerFactory to self`)
      }

      HiveWorkerClass = workerFactoryFunc(HiveWorker)
    }
  }

  return new HiveWorkerClass(ctx, createData)
}
