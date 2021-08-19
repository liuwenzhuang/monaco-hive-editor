import { editor, languages, Uri } from './fillers/monaco-editor-core'
import { languageExtensionPoint, languageID } from './config'
import { HiveWorker } from './HiveWorker'
import { CompletionsOptions, LanguageServiceDefaults } from './monaco.contribution'
import './monaco.contribution'

export type WorkerAccessor = (...uris: Uri[]) => Promise<HiveWorker>

export default class MonacoHiveEditor {
  private editor: editor.IStandaloneCodeEditor

  constructor(domElem: HTMLElement, options?: Omit<editor.IStandaloneEditorConstructionOptions, 'language'>) {
    ;(self as any).MonacoEnvironment = {
      getWorkerUrl: function (moduleId, label) {
        if (label === languageID) return './hive.worker.js'
        return './editor.worker.js'
      },
    }

    languages.register(languageExtensionPoint)

    this.editor = editor.create(domElem, {
      language: languageID,
      ...options,
    })
  }

  getEditor() {
    return this.editor
  }

  setCompletionsOptions(options: CompletionsOptions): void {
    const hiveDefaults: LanguageServiceDefaults = languages[languageID].hiveDefaults
    hiveDefaults.setCompletionsOptions(options)
  }

  /**
   * get primary selection
   * @returns
   */
  getSelectedValue(): string {
    const range = this.editor.getSelection()
    return this.editor.getModel().getValueInRange(range)
  }

  /**
   * get all the selections
   * @returns
   */
  getAllSelectedValue(): string[] {
    const ranges = this.editor.getSelections()
    const model = this.editor.getModel()
    return ranges.map((range) => model.getValueInRange(range))
  }
}
