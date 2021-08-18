import * as monaco from 'monaco-editor-core'

import Uri = monaco.Uri
import { HiveWorker } from './HiveWorker'
import { languageID } from './config'

export class WorkerManager {
  private worker: monaco.editor.MonacoWebWorker<HiveWorker> | null = null
  private workerClientProxy: Promise<HiveWorker> | null = null

  constructor() {
    this.worker = null
  }

  private getClientproxy(): Promise<HiveWorker> {
    if (!this.workerClientProxy) {
      this.worker = monaco.editor.createWebWorker<HiveWorker>({
        // module that exports the create() method and returns a `JSONWorker` instance
        moduleId: 'HiveWorkerTest',
        label: languageID,
        // passed in to the create() method
        createData: {
          languageId: languageID,
          azkabanKeywords: [
            { label: '${azkaban.flow.1.days.ago}', detail: '一天前' },
            { label: '${azkaban.flow.2.days.ago}' },
            { label: 'azkaban.flow.7.days.ago' },
          ],
          dataBases: [{ label: 'test1DB', detail: '测试数据库1' }, { label: 'testDB2' }],
        },
      })

      this.workerClientProxy = <Promise<HiveWorker>>(<any>this.worker.getProxy())
    }

    return this.workerClientProxy
  }

  async getLanguageServiceWorker(...resources: Uri[]): Promise<HiveWorker> {
    const _client: HiveWorker = await this.getClientproxy()
    await this.worker!.withSyncedResources(resources)
    return _client
  }
}
