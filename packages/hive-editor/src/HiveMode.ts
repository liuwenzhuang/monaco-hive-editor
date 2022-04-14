import { WorkerManager } from './WorkerManager'
import type { HiveWorker } from './HiveWorker'
import { LanguageServiceDefaults } from './monaco.contribution'
import { languages, Uri } from './filters/monaco-editor-core'
import { monarchLanguage, richLanguageConfiguration } from './HiveLang'
import CompletionItemAdapter from './CompletionItemAdapter'
import DiagnosticsAdapter from './DiagnosticsAdapter'
import { languageID } from './config'

let hiveWorker: (...uris: Uri[]) => Promise<HiveWorker>

export function setupHive(defaults: LanguageServiceDefaults): void {
  hiveWorker = setupMode(defaults, languageID)
}

export function getHiveWorker(): Promise<(...uris: Uri[]) => Promise<HiveWorker>> {
  return new Promise((resolve, reject) => {
    if (!hiveWorker) {
      return reject('Hive not registered!')
    }

    resolve(hiveWorker)
  })
}

function setupMode(defaults: LanguageServiceDefaults, modeId: string): (...uris: Uri[]) => Promise<HiveWorker> {
  const client = new WorkerManager(modeId, defaults)
  const worker = (...uris: Uri[]): Promise<HiveWorker> => {
    return client.getLanguageServiceWorker(...uris)
  }

  languages.setMonarchTokensProvider(modeId, monarchLanguage)
  languages.setLanguageConfiguration(modeId, richLanguageConfiguration)

  languages.registerCompletionItemProvider(modeId, new CompletionItemAdapter(worker))

  new DiagnosticsAdapter(modeId, worker)

  return worker
}
