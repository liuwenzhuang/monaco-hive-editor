import { HiveWorker } from './HiveWorker'
import { languageID } from './config'
import { LanguageServiceDefaults } from './monaco.contribution'
import { editor, Uri, IDisposable } from './fillers/monaco-editor-core'

export class WorkerManager {
  private configChangeListener: IDisposable
  private worker: editor.MonacoWebWorker<HiveWorker>
  private workerClientProxy: Promise<HiveWorker>

  constructor(private modeId: string, private defaults: LanguageServiceDefaults) {
    this.worker = null
    this.workerClientProxy = null
    this.configChangeListener = this.defaults.onDidChange(() => this.stopWorker())
  }

  private stopWorker(): void {
    if (this.worker) {
      this.worker.dispose()
      this.worker = null
    }
    this.workerClientProxy = null
  }

  dispose(): void {
    this.configChangeListener.dispose()
    this.stopWorker()
  }

  private getClientproxy(): Promise<HiveWorker> {
    if (!this.workerClientProxy) {
      const completionsOptions = this.defaults.getCompletionsOptions()
      this.worker = editor.createWebWorker<HiveWorker>({
        // module that exports the create() method and returns a `JSONWorker` instance
        moduleId: 'vs/language/typescript/hiveWorker',
        label: this.modeId,
        // passed in to the create() method
        createData: {
          languageId: languageID,
          ...completionsOptions,
          customWorkerPath: this.defaults.workerOptions.customWorkerPath,
        },
      })

      let p = <Promise<HiveWorker>>this.worker.getProxy()
      if (this.defaults.getEagerModelSync()) {
        p = p.then((worker) => {
          if (this.worker) {
            return this.worker.withSyncedResources(
              editor
                .getModels()
                .filter((model) => model.getModeId() === this.modeId)
                .map((model) => model.uri)
            )
          }
          return worker
        })
      }

      this.workerClientProxy = p
    }

    return this.workerClientProxy
  }

  getLanguageServiceWorker(...resources: Uri[]): Promise<HiveWorker> {
    let clientWorker: HiveWorker
    return this.getClientproxy()
      .then((client) => {
        clientWorker = client
      })
      .then(() => {
        if (this.worker) {
          return this.worker.withSyncedResources(resources)
        }
      })
      .then(() => clientWorker)
  }
}
