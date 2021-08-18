import * as monaco from 'monaco-editor-core'
import { languageExtensionPoint, languageID } from './config'
import { richLanguageConfiguration, monarchLanguage } from './HiveLang'
import { HiveWorker } from './HiveWorker'
import { WorkerManager } from './WorkerManager'
import DiagnosticsAdapter from './DiagnosticsAdapter'
import CompletionItemAdapter from './CompletionItemAdapter'

export function setupLanguage() {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  self.MonacoEnvironment = {
    getWorkerUrl: function (moduleId, label) {
      if (label === languageID) return './hive.worker.js'
      return './editor.worker.js'
    },
  }
  monaco.languages.register(languageExtensionPoint)
  monaco.languages.onLanguage(languageID, () => {
    monaco.languages.setMonarchTokensProvider(languageID, monarchLanguage)
    monaco.languages.setLanguageConfiguration(languageID, richLanguageConfiguration)

    const client = new WorkerManager()

    const worker: WorkerAccessor = (...uris: monaco.Uri[]): Promise<HiveWorker> => {
      return client.getLanguageServiceWorker(...uris)
    }
    monaco.languages.registerCompletionItemProvider(languageID, new CompletionItemAdapter(worker))

    //Call the errors provider
    new DiagnosticsAdapter(worker)
  })
}

export type WorkerAccessor = (...uris: monaco.Uri[]) => Promise<HiveWorker>
