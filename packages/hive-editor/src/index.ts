import { editor, languages, Uri } from './filters/monaco-editor-core'
import { languageExtensionPoint, languageID } from './config'
import { HiveWorker } from './HiveWorker'
import { CompletionsOptions, LanguageServiceDefaults } from './monaco.contribution'
import './monaco.contribution'

export type WorkerAccessor = (...uris: Uri[]) => Promise<HiveWorker>

export default class MonacoHiveEditor {
  private editor: editor.IStandaloneCodeEditor
  private completionOption: CompletionsOptions = null
  private hiveDefaults: LanguageServiceDefaults = null

  constructor(
    domElem: HTMLElement,
    options?: Omit<editor.IStandaloneEditorConstructionOptions, 'language'> & {
      /**
       * webpack 等环境下的 publicPath，用于加载 worker.js
       */
      publicPath?: string
    }
  ) {
    ;(self as any).MonacoEnvironment = {
      getWorkerUrl: function (_moduleId: number, label: string) {
        const webpackPublicPath = options.publicPath ?? __webpack_public_path__
        let publicPath = typeof webpackPublicPath === 'string' ? webpackPublicPath : './'
        if (!publicPath.endsWith('/')) {
          publicPath += '/'
        }
        if (label === languageID) return `${publicPath}hive.worker.js`
        return `${publicPath}editor.worker.js`
      },
    }

    this.hiveDefaults = languages[languageID].hiveDefaults

    languages.register(languageExtensionPoint)

    this.editor = editor.create(domElem, {
      language: languageID,
      ...options,
    })
  }

  getEditor() {
    return this.editor
  }

  get model() {
    return this.editor.getModel()
  }

  setEditorOptions(options: Omit<editor.IEditorOptions & editor.IGlobalEditorOptions, 'language'>) {
    this.model?.updateOptions(options)
  }

  /**
   * 设置补全功能的配置项
   * @param options
   */
  setCompletionsOptions(options: CompletionsOptions): void {
    // 保留上一次的配置，后续改变即覆盖
    this.completionOption = Object.assign(this.completionOption ?? {}, options)
    this.hiveDefaults.setCompletionsOptions(this.completionOption)
  }

  /**
   * get primary selection
   * @returns
   */
  getSelectedValue(): string {
    const range = this.editor.getSelection()
    return this.model?.getValueInRange(range)
  }

  /**
   * get all the selections
   * @returns
   */
  getAllSelectedValue(): string[] {
    const ranges = this.editor.getSelections()
    return ranges.map((range) => this.model?.getValueInRange(range))
  }
}
